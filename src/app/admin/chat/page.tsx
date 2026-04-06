"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface ChatMessage {
  id: string;
  from: "user" | "admin";
  text: string;
  timestamp: number;
}

interface ChatRoom {
  id: string;
  userName: string;
  lastMessage: string;
  lastTime: number;
  unread: number;
}

const ADMIN_PASSWORD = "myseoulface2026";

export default function AdminChatPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 알림 소리
  useEffect(() => {
    audioRef.current = new Audio("data:audio/wav;base64,UklGRl4AAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YToAAAA/P0BAP0BAQD8/Pz5APz8+Pj4+PT09PDw8Ozs7Ojo6OTk5ODg4Nzc3NjY2NTU1NDQ0MzMzMjIy");
  }, []);

  // Heartbeat — 관리자 온라인 표시
  useEffect(() => {
    if (!authed) return;
    const heartbeat = () => {
      fetch("/api/chat/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "heartbeat" }),
      }).catch(() => {});
    };
    heartbeat();
    const interval = setInterval(heartbeat, 15000);

    // 페이지 닫힐 때 오프라인
    const handleClose = () => {
      navigator.sendBeacon("/api/chat/status", JSON.stringify({ action: "offline" }));
    };
    window.addEventListener("beforeunload", handleClose);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleClose);
      fetch("/api/chat/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "offline" }),
      }).catch(() => {});
    };
  }, [authed]);

  // 채팅방 목록 폴링
  const pollRooms = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/messages");
      const data = await res.json();
      const oldTotal = rooms.reduce((s, r) => s + r.unread, 0);
      setRooms(data.rooms || []);
      const newTotal = (data.rooms || []).reduce((s: number, r: ChatRoom) => s + r.unread, 0);
      if (newTotal > oldTotal && audioRef.current) {
        audioRef.current.play().catch(() => {});
        if (Notification.permission === "granted") {
          new Notification("MySeoulFace — New message!", { body: "A customer is waiting" });
        }
      }
    } catch { /* ignore */ }
  }, [rooms]);

  useEffect(() => {
    if (!authed) return;
    const interval = setInterval(pollRooms, 2000);
    pollRooms();
    // 알림 권한 요청
    if (Notification.permission === "default") Notification.requestPermission();
    return () => clearInterval(interval);
  }, [authed, pollRooms]);

  // 선택된 방의 메시지 폴링
  useEffect(() => {
    if (!authed || !selectedRoom) return;
    const poll = async () => {
      try {
        const res = await fetch(`/api/chat/messages?roomId=${selectedRoom}`);
        const data = await res.json();
        if (data.room) setMessages(data.room.messages);
      } catch { /* ignore */ }
    };
    poll();
    const interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, [authed, selectedRoom]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const sendReply = async () => {
    if (!input.trim() || !selectedRoom) return;
    const text = input.trim();
    setInput("");

    await fetch("/api/chat/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId: selectedRoom, message: text }),
    });
  };

  // 로그인 화면
  if (!authed) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#FAFAF8]">
        <div className="glass p-8 w-full max-w-xs text-center">
          <h1 className="text-xl font-bold text-fg mb-1">MySeoulFace Admin</h1>
          <p className="text-xs text-muted mb-6">Chat Management</p>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && password === ADMIN_PASSWORD && setAuthed(true)}
            className="w-full px-4 py-3 rounded-xl border border-card-border text-sm text-fg focus:border-pink focus:outline-none mb-3"
          />
          <button
            onClick={() => password === ADMIN_PASSWORD && setAuthed(true)}
            className="btn-primary w-full"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  const totalUnread = rooms.reduce((s, r) => s + r.unread, 0);

  return (
    <div className="h-dvh flex bg-[#FAFAF8]">
      {/* Sidebar — 채팅방 목록 */}
      <div className="w-[300px] border-r border-card-border flex flex-col bg-white">
        <div className="px-5 py-4 border-b border-card-border">
          <h1 className="font-bold text-fg">Chat Dashboard</h1>
          <p className="text-xs text-muted flex items-center gap-1 mt-1">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
            Online
            {totalUnread > 0 && <span className="ml-2 px-2 py-0.5 rounded-full bg-coral text-white text-[10px] font-bold">{totalUnread} new</span>}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {rooms.length === 0 && (
            <div className="text-center py-12 text-muted text-sm">
              No chats yet.<br />Waiting for customers...
            </div>
          )}
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => setSelectedRoom(room.id)}
              className={`w-full text-left px-5 py-3 border-b border-card-border hover:bg-pink-lt/10 transition-colors ${
                selectedRoom === room.id ? "bg-pink-lt/20" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-fg">{room.userName}</span>
                {room.unread > 0 && (
                  <span className="w-5 h-5 rounded-full bg-coral text-white text-[10px] flex items-center justify-center font-bold">
                    {room.unread}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted truncate mt-0.5">{room.lastMessage}</p>
              <p className="text-[10px] text-muted mt-0.5">
                {new Date(room.lastTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main — 대화창 */}
      <div className="flex-1 flex flex-col">
        {!selectedRoom ? (
          <div className="flex-1 flex items-center justify-center text-muted text-sm">
            Select a chat to start responding
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="px-5 py-3 border-b border-card-border bg-white flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-pink-lt/30 flex items-center justify-center text-sm">👤</div>
              <div>
                <p className="font-semibold text-fg text-sm">
                  {rooms.find((r) => r.id === selectedRoom)?.userName || "Guest"}
                </p>
                <p className="text-[10px] text-muted">Room: {selectedRoom}</p>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-3">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.from === "admin" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    m.from === "admin"
                      ? "bg-gradient-to-r from-pink to-coral text-white rounded-br-sm"
                      : "bg-white border border-card-border text-fg rounded-bl-sm shadow-sm"
                  }`}>
                    {m.text}
                    <p className={`text-[9px] mt-1 ${m.from === "admin" ? "text-white/50" : "text-muted"}`}>
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply input */}
            <div className="flex gap-2 p-4 border-t border-card-border bg-white">
              <input
                type="text"
                placeholder="Type your reply..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendReply()}
                className="flex-1 px-4 py-3 rounded-full border border-card-border text-sm text-fg bg-[#FAFAF8] focus:border-pink focus:outline-none"
                autoFocus
              />
              <button
                onClick={sendReply}
                disabled={!input.trim()}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-pink to-coral text-white text-sm font-medium disabled:opacity-30"
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
