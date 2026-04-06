"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  id: string;
  text: string;
  from: "user" | "admin";
  time: string;
  timestamp?: number;
}

interface UserInfo {
  email?: string;
  skinType?: string;
  skinScore?: number;
  skinAge?: number;
}

function getUserInfo(): UserInfo {
  if (typeof window === "undefined") return {};
  try {
    const result = sessionStorage.getItem("seoulface-result");
    if (!result) return {};
    const data = JSON.parse(result);
    return {
      email: data.email || undefined,
      skinType: data.skinType || undefined,
      skinScore: data.overallScore || undefined,
      skinAge: data.skinAge || undefined,
    };
  } catch {
    return {};
  }
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [adminOnline, setAdminOnline] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roomId] = useState(() => {
    if (typeof window !== "undefined") {
      // localStorage로 변경 — 탭 닫아도 같은 방 유지
      let id = localStorage.getItem("seoulface-chat-id");
      if (!id) {
        id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        localStorage.setItem("seoulface-chat-id", id);
      }
      return id;
    }
    return "temp";
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastTimestamp = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    audioRef.current = new Audio("data:audio/wav;base64,UklGRl4AAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YToAAAA/P0BAP0BAQD8/Pz5APz8+Pj4+PT09PDw8Ozs7Ojo6OTk5ODg4Nzc3NjY2NTU1NDQ0MzMzMjIy");
  }, []);

  const pollMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/chat?roomId=${roomId}&after=${lastTimestamp.current}`);
      if (!res.ok) return;
      const data = await res.json();
      setAdminOnline(data.adminOnline);

      if (data.messages && data.messages.length > 0) {
        const newMsgs: Message[] = data.messages.map((m: { id: string; from: "user" | "admin"; text: string; timestamp: number }) => ({
          id: m.id,
          text: m.text,
          from: m.from,
          time: new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          timestamp: m.timestamp,
        }));

        setMessages((prev) => {
          const ids = new Set(prev.map((m) => m.id));
          const unique = newMsgs.filter((m) => !ids.has(m.id));
          if (unique.some((m) => m.from === "admin") && audioRef.current) {
            audioRef.current.play().catch(() => {});
          }
          return [...prev, ...unique];
        });

        const maxTs = Math.max(...data.messages.map((m: { timestamp: number }) => m.timestamp));
        if (maxTs > lastTimestamp.current) lastTimestamp.current = maxTs;
      }
    } catch {
      // network error — silent
    }
  }, [roomId]);

  useEffect(() => {
    const interval = setInterval(pollMessages, 3000);
    pollMessages();
    return () => clearInterval(interval);
  }, [pollMessages]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput("");
    setError(null);
    setSending(true);

    const tempMsg: Message = {
      id: "temp-" + Date.now(),
      text,
      from: "user",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const userInfo = getUserInfo();
      const userName = userInfo.email || "Guest";
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, message: text, userName, userInfo }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAdminOnline(data.adminOnline);
      if (data.message) lastTimestamp.current = data.message.timestamp;
    } catch {
      setError("Failed to send. Please try again.");
    } finally {
      setSending(false);
    }
  };

  // Quick action buttons for first-time users
  const quickActions = [
    "I need help choosing products",
    "Question about my skin analysis",
    "Shipping & delivery info",
  ];

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-pink to-coral text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <span className="text-lg">💬</span>
          <span className="font-semibold text-sm">Chat with K-Beauty Advisor</span>
          {adminOnline ? (
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-white"></span>
          ) : (
            <span className="w-2.5 h-2.5 rounded-full bg-gray-400 border-2 border-white"></span>
          )}
        </button>
      )}

      {open && (
        <div className="fixed bottom-3 right-3 left-3 sm:left-auto sm:right-5 sm:w-[400px] z-50 h-[75vh] max-h-[700px] rounded-2xl overflow-hidden shadow-2xl border border-card-border flex flex-col bg-white">
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-pink to-coral text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg">🧴</div>
            <div className="flex-1">
              <p className="font-bold">MySeoulFace</p>
              <p className="text-xs opacity-90 flex items-center gap-1.5">
                {adminOnline ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-green-300 inline-block"></span>
                    Online — We reply instantly
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-gray-300 inline-block"></span>
                    Offline — We&apos;ll reply soon
                  </>
                )}
              </p>
            </div>
            <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm hover:bg-white/30">
              ✕
            </button>
          </div>

          {!adminOnline && (
            <div className="px-4 py-3 bg-amber-50 border-b border-amber-100 text-center">
              <p className="text-sm font-medium text-amber-800">We&apos;re currently away</p>
              <p className="text-xs text-amber-600 mt-0.5">Leave a message — we&apos;ll get back to you!</p>
            </div>
          )}

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAFAF8]">
            {messages.length === 0 && (
              <div className="text-center py-6">
                <span className="text-4xl block mb-3">👋</span>
                <p className="font-semibold text-fg text-sm">Welcome to MySeoulFace!</p>
                <p className="text-xs text-muted mt-1 mb-4">Ask us anything about K-Beauty skincare</p>
                <div className="space-y-2">
                  {quickActions.map((text) => (
                    <button
                      key={text}
                      onClick={() => {
                        setInput(text);
                      }}
                      className="block w-full text-left px-4 py-2.5 rounded-xl border border-card-border bg-white text-sm text-fg hover:border-pink transition-colors"
                    >
                      {text}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                {m.from === "admin" && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-r from-pink to-coral flex items-center justify-center text-[10px] text-white mr-2 mt-1 flex-shrink-0">
                    🧴
                  </div>
                )}
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  m.from === "user"
                    ? "bg-gradient-to-r from-pink to-coral text-white rounded-br-sm"
                    : "bg-white border border-card-border text-fg rounded-bl-sm shadow-sm"
                }`}>
                  {m.text}
                  <p className={`text-[9px] mt-1.5 ${m.from === "user" ? "text-white/50" : "text-muted"}`}>{m.time}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="px-4 py-2 bg-red-50 border-t border-red-100">
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2 p-4 border-t border-card-border bg-white">
            <input
              type="text"
              placeholder={adminOnline ? "Type a message..." : "Leave a message..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 px-4 py-3 rounded-full border border-card-border text-sm text-fg bg-[#FAFAF8] focus:border-pink focus:outline-none"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              className="w-11 h-11 rounded-full bg-gradient-to-r from-pink to-coral text-white text-base flex items-center justify-center disabled:opacity-30"
            >
              {sending ? "..." : "→"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
