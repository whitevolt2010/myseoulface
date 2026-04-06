"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface UserInfo {
  email?: string;
  skinType?: string;
  skinScore?: number;
  skinAge?: number;
  country?: string;
}

interface ChatMessage {
  id: string;
  from: "user" | "admin";
  text: string;
  timestamp: number;
}

interface ChatRoom {
  id: string;
  userName: string;
  userInfo: UserInfo;
  lastMessage: string;
  lastTime: number;
  unread: number;
  archived: boolean;
  createdAt: number;
  messages?: ChatMessage[];
}

const ADMIN_PASSWORD = "2026";

const QUICK_REPLIES = [
  { label: "Welcome", text: "Hi there! 👋 Thanks for reaching out to MySeoulFace. How can I help you with your K-Beauty journey today?" },
  { label: "Product Help", text: "I'd be happy to help you find the perfect products! Could you tell me more about your main skin concerns?" },
  { label: "Analysis", text: "For the most accurate analysis, please use natural lighting and remove any makeup. Take a front-facing photo with your full face visible." },
  { label: "Shipping", text: "All recommended products can be purchased through Amazon with Prime shipping. Most items arrive within 2-3 business days!" },
  { label: "Thank you", text: "You're welcome! Feel free to reach out anytime. Enjoy your K-Beauty routine! ✨" },
  { label: "Follow up", text: "How has your skin been doing with the recommended routine? I'd love to hear about your progress!" },
];

export default function AdminChatPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "archived">("all");
  const [showUserInfo, setShowUserInfo] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevUnreadRef = useRef(0);

  // Notification sound
  useEffect(() => {
    audioRef.current = new Audio("data:audio/wav;base64,UklGRl4AAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YToAAAA/P0BAP0BAQD8/Pz5APz8+Pj4+PT09PDw8Ozs7Ojo6OTk5ODg4Nzc3NjY2NTU1NDQ0MzMzMjIy");
  }, []);

  // Admin heartbeat
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

  // Poll rooms
  const pollRooms = useCallback(async () => {
    try {
      const archived = filter === "archived" ? "true" : "false";
      const res = await fetch(`/api/chat/messages?archived=${archived}`);
      if (!res.ok) return;
      const data = await res.json();
      setRooms(data.rooms || []);

      const newTotal = (data.rooms || []).reduce((s: number, r: ChatRoom) => s + r.unread, 0);
      if (newTotal > prevUnreadRef.current && audioRef.current) {
        audioRef.current.play().catch(() => {});
        if (Notification.permission === "granted") {
          new Notification("MySeoulFace — New message!", { body: "A customer is waiting" });
        }
      }
      prevUnreadRef.current = newTotal;
    } catch { /* network error */ }
  }, [filter]);

  useEffect(() => {
    if (!authed) return;
    const interval = setInterval(pollRooms, 2000);
    pollRooms();
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission();
    }
    return () => clearInterval(interval);
  }, [authed, pollRooms]);

  // Poll selected room messages
  useEffect(() => {
    if (!authed || !selectedRoom) return;
    const poll = async () => {
      try {
        const res = await fetch(`/api/chat/messages?roomId=${selectedRoom}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.room) setMessages(data.room.messages || []);
      } catch { /* network error */ }
    };
    poll();
    const interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, [authed, selectedRoom]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const sendReply = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || !selectedRoom) return;
    setInput("");

    await fetch("/api/chat/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId: selectedRoom, message: msg }),
    });
  };

  const handleArchive = async (roomId: string) => {
    await fetch("/api/chat/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "archive", roomId }),
    });
    if (selectedRoom === roomId) {
      setSelectedRoom(null);
      setMessages([]);
    }
    pollRooms();
  };

  // Filter and search rooms
  const filteredRooms = rooms.filter((r) => {
    if (filter === "unread" && r.unread === 0) return false;
    if (filter === "archived" && !r.archived) return false;
    if (filter === "all" && r.archived) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.userName.toLowerCase().includes(q) ||
        r.lastMessage.toLowerCase().includes(q) ||
        r.userInfo?.email?.toLowerCase().includes(q) ||
        r.userInfo?.skinType?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const selectedRoomData = rooms.find((r) => r.id === selectedRoom);
  const totalUnread = rooms.filter((r) => !r.archived).reduce((s, r) => s + r.unread, 0);

  // Login screen
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

  return (
    <div className="h-dvh flex bg-[#FAFAF8]">
      {/* Sidebar */}
      <div className="w-[320px] border-r border-card-border flex flex-col bg-white">
        {/* Header */}
        <div className="px-5 py-4 border-b border-card-border">
          <div className="flex items-center justify-between mb-3">
            <h1 className="font-bold text-fg">Chat Dashboard</h1>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
              <span className="text-xs text-muted">Online</span>
              {totalUnread > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-coral text-white text-[10px] font-bold">
                  {totalUnread}
                </span>
              )}
            </div>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search by name, email, skin type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-card-border text-xs text-fg bg-[#FAFAF8] focus:border-pink focus:outline-none mb-2"
          />

          {/* Filter tabs */}
          <div className="flex gap-1">
            {(["all", "unread", "archived"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 text-[10px] py-1.5 rounded-lg font-medium transition-colors ${
                  filter === f
                    ? "bg-pink text-white"
                    : "bg-[#FAFAF8] text-muted hover:text-fg"
                }`}
              >
                {f === "all" ? "All" : f === "unread" ? `Unread${totalUnread > 0 ? ` (${totalUnread})` : ""}` : "Archived"}
              </button>
            ))}
          </div>
        </div>

        {/* Room list */}
        <div className="flex-1 overflow-y-auto">
          {filteredRooms.length === 0 && (
            <div className="text-center py-12 text-muted text-sm">
              {search ? "No matching chats" : filter === "unread" ? "No unread messages" : "No chats yet"}
            </div>
          )}
          {filteredRooms.map((room) => (
            <button
              key={room.id}
              onClick={() => setSelectedRoom(room.id)}
              className={`w-full text-left px-4 py-3 border-b border-card-border hover:bg-pink-lt/10 transition-colors ${
                selectedRoom === room.id ? "bg-pink-lt/20" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                {/* Avatar with skin score */}
                <div className="relative flex-shrink-0">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-lt to-pink flex items-center justify-center text-xs font-bold text-white">
                    {room.userInfo?.skinScore || "?"}
                  </div>
                  {room.unread > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-coral text-white text-[8px] flex items-center justify-center font-bold">
                      {room.unread}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`font-semibold text-sm ${room.unread > 0 ? "text-fg" : "text-fg/70"}`}>
                      {room.userName}
                    </span>
                    {room.userInfo?.skinType && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-pink-lt/30 text-pink-dk capitalize">
                        {room.userInfo.skinType}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs truncate mt-0.5 ${room.unread > 0 ? "text-fg font-medium" : "text-muted"}`}>
                    {room.lastMessage}
                  </p>
                </div>
                <span className="text-[10px] text-muted flex-shrink-0">
                  {formatTime(room.lastTime)}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="px-5 py-3 border-t border-card-border text-[10px] text-muted">
          {rooms.filter((r) => !r.archived).length} active chats
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {!selectedRoom ? (
          <div className="flex-1 flex items-center justify-center text-muted text-sm">
            <div className="text-center">
              <span className="text-4xl block mb-3">💬</span>
              <p>Select a chat to start responding</p>
              {totalUnread > 0 && (
                <p className="text-coral mt-1 font-medium">{totalUnread} unread message{totalUnread > 1 ? "s" : ""}</p>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="px-5 py-3 border-b border-card-border bg-white flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-pink-lt/30 flex items-center justify-center text-sm">👤</div>
              <div className="flex-1">
                <p className="font-semibold text-fg text-sm">
                  {selectedRoomData?.userName || "Guest"}
                </p>
                <p className="text-[10px] text-muted">
                  Started {selectedRoomData ? formatDate(selectedRoomData.createdAt) : ""}
                </p>
              </div>
              <button
                onClick={() => selectedRoom && handleArchive(selectedRoom)}
                className="text-xs text-muted hover:text-coral transition-colors px-3 py-1.5 rounded-lg hover:bg-coral/5"
                title="Archive this chat"
              >
                Archive
              </button>
            </div>

            <div className="flex-1 flex">
              {/* Messages */}
              <div className="flex-1 flex flex-col">
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

                {/* Quick replies */}
                <div className="px-4 py-2 border-t border-card-border bg-[#FAFAF8] flex gap-1.5 overflow-x-auto">
                  {QUICK_REPLIES.map((qr) => (
                    <button
                      key={qr.label}
                      onClick={() => sendReply(qr.text)}
                      className="flex-shrink-0 text-[10px] px-3 py-1.5 rounded-full border border-card-border bg-white text-muted hover:text-pink-dk hover:border-pink transition-colors"
                    >
                      {qr.label}
                    </button>
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
                    onClick={() => sendReply()}
                    disabled={!input.trim()}
                    className="px-6 py-3 rounded-full bg-gradient-to-r from-pink to-coral text-white text-sm font-medium disabled:opacity-30"
                  >
                    Send
                  </button>
                </div>
              </div>

              {/* User info panel */}
              {showUserInfo && selectedRoomData && (
                <div className="w-[240px] border-l border-card-border bg-white p-4 overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-fg text-xs">Customer Info</h3>
                    <button
                      onClick={() => setShowUserInfo(false)}
                      className="text-muted hover:text-fg text-xs"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-3">
                    {/* Skin Score */}
                    {selectedRoomData.userInfo?.skinScore && (
                      <div className="text-center p-3 rounded-xl bg-pink-lt/10">
                        <div className="text-2xl font-bold text-pink-dk">{selectedRoomData.userInfo.skinScore}</div>
                        <p className="text-[10px] text-muted">Skin Score</p>
                      </div>
                    )}

                    {/* Details */}
                    <div className="space-y-2">
                      <InfoRow label="Name" value={selectedRoomData.userName} />
                      <InfoRow label="Email" value={selectedRoomData.userInfo?.email} />
                      <InfoRow label="Skin Type" value={selectedRoomData.userInfo?.skinType} />
                      <InfoRow label="Skin Age" value={selectedRoomData.userInfo?.skinAge?.toString()} />
                      <InfoRow label="Room ID" value={selectedRoomData.id} />
                      <InfoRow label="Messages" value={messages.length.toString()} />
                      <InfoRow label="Created" value={formatDate(selectedRoomData.createdAt)} />
                    </div>

                    {/* Email action */}
                    {selectedRoomData.userInfo?.email && (
                      <a
                        href={`mailto:${selectedRoomData.userInfo.email}`}
                        className="block text-center text-xs text-pink-dk hover:text-coral transition-colors py-2 rounded-lg border border-card-border"
                      >
                        Send Email
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Toggle user info if hidden */}
            {!showUserInfo && (
              <button
                onClick={() => setShowUserInfo(true)}
                className="absolute top-16 right-2 text-[10px] text-muted hover:text-fg bg-white border border-card-border px-2 py-1 rounded"
              >
                ℹ️ Info
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[10px] text-muted">{label}</p>
      <p className="text-xs text-fg font-medium truncate capitalize">{value}</p>
    </div>
  );
}

function formatTime(ts: number): string {
  const now = Date.now();
  const diff = now - ts;
  if (diff < 60000) return "now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
  return `${Math.floor(diff / 86400000)}d`;
}

function formatDate(ts: number): string {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
