"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  text: string;
  from: "user" | "bot";
  time: string;
}

const AUTO_REPLIES: Record<string, string> = {
  hello: "Hi there! 👋 Welcome to MySeoulFace. How can I help you with your skincare?",
  hi: "Hi there! 👋 Welcome to MySeoulFace. How can I help you with your skincare?",
  hey: "Hey! 👋 Welcome to MySeoulFace. How can I help you?",
  help: "I can help you with:\n• Skin analysis questions\n• Product recommendations\n• K-Beauty routine advice\n\nJust type your question!",
  product: "You can get personalized product recommendations by taking our free skin analysis! Tap 'Analyze My Skin' on the homepage.",
  routine: "A basic K-Beauty routine:\n1. Oil Cleanser\n2. Water Cleanser\n3. Toner\n4. Serum\n5. Moisturizer\n6. Sunscreen\n\nWant personalized recommendations? Try our free analysis!",
  price: "Our skin analysis is 100% free! Product recommendations include links where you can purchase them.",
  acne: "For acne concerns, we recommend ingredients like Salicylic Acid, Tea Tree, and Centella Asiatica. Try our skin analysis for personalized product recommendations!",
  dry: "For dry skin, look for Hyaluronic Acid, Ceramides, and Squalane. Our AI analysis can recommend the perfect products for your skin!",
  oily: "For oily skin, Niacinamide, BHA, and Green Tea work great. Take our free skin analysis for personalized recommendations!",
};

function getAutoReply(text: string): string | null {
  const lower = text.toLowerCase();
  for (const [key, reply] of Object.entries(AUTO_REPLIES)) {
    if (lower.includes(key)) return reply;
  }
  return null;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Hi! 👋 Welcome to MySeoulFace.\nHow can I help you with your skincare today?",
      from: "bot",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [email, setEmail] = useState("");
  const [emailSaved, setEmailSaved] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: Message = { id: Date.now().toString(), text: input.trim(), from: "user", time: now };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Auto reply
    const autoReply = getAutoReply(input);
    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: autoReply || "Thanks for your message! Our team will get back to you soon. In the meantime, try our free skin analysis! 🔬",
        from: "bot",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 800);

    // Save message to server
    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input.trim(), email: email || undefined }),
    }).catch(() => {});
  };

  const saveEmail = () => {
    if (!email.includes("@")) return;
    setEmailSaved(true);
    const botMsg: Message = {
      id: Date.now().toString(),
      text: `Great! We'll reach you at ${email}. How can I help you today?`,
      from: "bot",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, botMsg]);
  };

  return (
    <>
      {/* Chat bubble */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-pink to-coral text-white text-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105"
        style={{ fontFamily: "system-ui" }}
      >
        {open ? "✕" : "💬"}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-20 right-5 z-50 w-[340px] max-h-[480px] rounded-2xl overflow-hidden shadow-2xl border border-card-border flex flex-col bg-white"
          style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-pink to-coral text-white">
            <p className="font-bold text-sm">MySeoulFace</p>
            <p className="text-[10px] opacity-80">K-Beauty Skin Advisor • Online</p>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[280px] bg-[#FAFAF8]">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                  m.from === "user"
                    ? "bg-gradient-to-r from-pink to-coral text-white rounded-br-sm"
                    : "bg-white border border-card-border text-fg rounded-bl-sm"
                }`}>
                  {m.text}
                  <p className={`text-[9px] mt-1 ${m.from === "user" ? "text-white/60" : "text-muted"}`}>{m.time}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Email prompt (one-time) */}
          {!emailSaved && (
            <div className="px-3 py-2 bg-pink-lt/20 border-t border-card-border">
              <p className="text-[10px] text-fg mb-1.5 font-medium">Get notified when we reply:</p>
              <div className="flex gap-1.5">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveEmail()}
                  className="flex-1 px-2.5 py-1.5 rounded-lg border border-card-border text-xs text-fg bg-white focus:border-pink focus:outline-none"
                />
                <button onClick={saveEmail} className="px-3 py-1.5 rounded-lg bg-pink text-white text-xs font-medium">
                  Save
                </button>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2 p-3 border-t border-card-border bg-white">
            <input
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 px-3 py-2 rounded-full border border-card-border text-sm text-fg bg-[#FAFAF8] focus:border-pink focus:outline-none"
            />
            <button
              onClick={sendMessage}
              className="w-9 h-9 rounded-full bg-gradient-to-r from-pink to-coral text-white text-sm flex items-center justify-center"
            >
              →
            </button>
          </div>
        </div>
      )}
    </>
  );
}
