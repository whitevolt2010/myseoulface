"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  text: string;
  from: "user" | "bot";
  time: string;
}

const AUTO_REPLIES: Array<{ keywords: string[]; reply: string }> = [
  {
    keywords: ["hello", "hi", "hey", "안녕"],
    reply: "Hi there! 👋 Welcome to MySeoulFace!\nHow can I help you with your skincare today?",
  },
  {
    keywords: ["help", "what", "how"],
    reply: "I can help with:\n• Skin analysis questions\n• K-Beauty product advice\n• Skincare routine tips\n• Beauty device recommendations\n\nJust ask me anything! 😊",
  },
  {
    keywords: ["product", "recommend", "suggestion"],
    reply: "For personalized product recommendations, try our free AI skin analysis! 🔬\n\nJust tap 'Analyze My Skin' on the homepage — it takes 10 seconds and recommends K-Beauty products perfect for YOUR skin.",
  },
  {
    keywords: ["routine", "step", "order"],
    reply: "Korean 10-Step Routine:\n\n1. 🧴 Oil Cleanser\n2. 🫧 Water Cleanser\n3. ✨ Exfoliant (2-3x/week)\n4. 💧 Toner\n5. 🌸 Essence\n6. ⚡ Serum/Ampoule\n7. 👁️ Eye Cream\n8. 🧊 Moisturizer\n9. 😴 Sleeping Mask (night)\n10. ☀️ Sunscreen (morning)\n\nWant to know which products? Try our free analysis!",
  },
  {
    keywords: ["acne", "pimple", "breakout"],
    reply: "For acne, these K-Beauty ingredients work great:\n\n• Salicylic Acid (BHA) — unclogs pores\n• Tea Tree — antibacterial\n• Centella Asiatica — calms inflammation\n• Niacinamide — controls sebum\n\nTop picks: COSRX BHA Power Liquid, Some By Mi AHA/BHA/PHA Toner\n\nTry our skin analysis for personalized recommendations! 🔬",
  },
  {
    keywords: ["dry", "flaky", "tight", "dehydrat"],
    reply: "For dry/dehydrated skin:\n\n• Hyaluronic Acid — deep hydration\n• Ceramides — repairs skin barrier\n• Squalane — locks in moisture\n\nTop picks: Laneige Water Bank, Torriden DIVE-IN Serum, Illiyoon Ceramide Cream\n\nGet your personalized routine with our free analysis! 💧",
  },
  {
    keywords: ["oily", "shine", "greasy", "sebum"],
    reply: "For oily skin:\n\n• Niacinamide — controls oil production\n• BHA — clears pores\n• Green Tea — reduces sebum\n\nTop picks: Innisfree Green Tea Seed Serum, COSRX Oil-Free Moisturizer\n\nTry our analysis for your complete routine! ✨",
  },
  {
    keywords: ["wrinkle", "aging", "anti-age", "fine line"],
    reply: "Anti-aging K-Beauty essentials:\n\n• Retinol — cell turnover\n• Peptides — collagen boost\n• Adenosine — wrinkle improvement\n• Vitamin C — brightening + firming\n\nTop picks: Beauty of Joseon Revive Serum, Sulwhasoo Concentrated Ginseng Cream\n\nGet your personalized anti-aging routine! 🔬",
  },
  {
    keywords: ["dark circle", "eye", "puffy"],
    reply: "For dark circles & puffy eyes:\n\n• Caffeine — reduces puffiness\n• Vitamin K — improves circulation\n• Peptides — firms under-eye area\n• Retinol — thickens thin skin\n\nTop pick: Innisfree Jeju Orchid Eye Cream\nDevice: Ice roller or LED eye mask\n\nTry our analysis for full recommendations! 👁️",
  },
  {
    keywords: ["device", "led", "mask", "tool"],
    reply: "Top K-Beauty devices:\n\n💡 LED Mask — Cellreturn, CurrentBody\n⚡ Microcurrent — NuFACE, ZIIP\n🔥 RF — Medicube AGE-R, TriPollar\n🧊 Ice Roller — for puffiness\n♨️ Steamer — opens pores\n\nOur AI analysis recommends devices based on YOUR skin concerns!",
  },
  {
    keywords: ["food", "diet", "eat", "supplement"],
    reply: "Best foods for skin health:\n\n🐟 Salmon/Omega-3 — reduces inflammation\n🫐 Berries — antioxidants\n🥑 Avocado — healthy fats\n🍵 Green Tea — anti-aging\n🦴 Bone Broth/Collagen — elasticity\n🥕 Sweet Potato — vitamin A\n\nOur analysis includes personalized food recommendations!",
  },
  {
    keywords: ["price", "cost", "free", "pay"],
    reply: "Our skin analysis is 100% FREE! 🎉\n\nNo sign-up, no payment, no catch.\nJust take a selfie and get your results instantly.\n\nProduct links go to Amazon where you can purchase at regular retail prices.",
  },
  {
    keywords: ["sensitive", "redness", "irritat", "rosacea"],
    reply: "For sensitive/irritated skin:\n\n• Centella Asiatica — calms redness\n• Madecassoside — repairs barrier\n• Aloe Vera — soothes\n• Panthenol — heals\n\nTop picks: SKIN1004 Centella Ampoule, Dr.G Red Blemish Cream\n\nAvoid: fragrance, alcohol, strong acids\n\nTry our analysis for your safe routine! 🌿",
  },
];

function getAutoReply(text: string): string {
  const lower = text.toLowerCase();
  for (const rule of AUTO_REPLIES) {
    if (rule.keywords.some((k) => lower.includes(k))) {
      return rule.reply;
    }
  }
  return "Thanks for your question! 😊\n\nFor the most accurate skincare advice, I recommend trying our free AI skin analysis — it examines your skin and recommends products specifically for you.\n\nTap 'Analyze My Skin' on the homepage to get started!";
}

export default function ChatWidget() {
  const [open, setOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Hi! 👋 Welcome to MySeoulFace!\n\nI'm your K-Beauty advisor. Ask me about:\n• Skincare routines\n• Product recommendations\n• Skin concerns (acne, dry, aging...)\n• Beauty devices & skin foods",
      from: "bot",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const quickSend = (text: string) => {
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: Message = { id: Date.now().toString(), text, from: "user", time: now };
    setMessages((prev) => [...prev, userMsg]);
    setTimeout(() => {
      const reply = getAutoReply(text);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: reply,
        from: "bot",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 600);
    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    }).catch(() => {});
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const userMsg: Message = { id: Date.now().toString(), text: input.trim(), from: "user", time: now };
    setMessages((prev) => [...prev, userMsg]);

    const userInput = input.trim();
    setInput("");

    // Auto reply with typing delay
    setTimeout(() => {
      const reply = getAutoReply(userInput);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: reply,
        from: "bot",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 600);

    // Save to server
    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userInput }),
    }).catch(() => {});
  };

  return (
    <>
      {/* Minimize button (when open) */}
      {open && (
        <button
          onClick={() => setOpen(false)}
          className="fixed bottom-5 right-5 z-50 w-10 h-10 rounded-full bg-fg/10 text-fg text-sm flex items-center justify-center hover:bg-fg/20 transition-all"
        >
          ▾
        </button>
      )}

      {/* Expand button (when closed) */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-pink to-coral text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <span className="text-lg">💬</span>
          <span className="font-semibold text-sm">Chat with K-Beauty Advisor</span>
          <span className="w-5 h-5 rounded-full bg-white/30 text-[10px] flex items-center justify-center font-bold">1</span>
        </button>
      )}

      {/* Chat window — LARGE */}
      {open && (
        <div className="fixed bottom-16 right-3 left-3 sm:left-auto sm:right-5 sm:w-[420px] z-50 h-[70vh] max-h-[680px] rounded-2xl overflow-hidden shadow-2xl border border-card-border flex flex-col bg-white">
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-pink to-coral text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg">🧴</div>
            <div className="flex-1">
              <p className="font-bold">MySeoulFace</p>
              <p className="text-xs opacity-80 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-300 inline-block"></span>
                K-Beauty Skin Advisor • Online
              </p>
            </div>
            <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm hover:bg-white/30">
              ✕
            </button>
          </div>

          {/* Quick actions */}
          <div className="px-4 py-2 bg-pink-lt/10 border-b border-card-border flex gap-2 overflow-x-auto">
            {["Routine", "Acne", "Dry skin", "Devices", "Foods"].map((q) => (
              <button
                key={q}
                onClick={() => quickSend(q)}
                className="whitespace-nowrap px-3 py-1 rounded-full bg-white border border-card-border text-xs text-fg hover:border-pink transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAFAF8]">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                {m.from === "bot" && (
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

          {/* Input */}
          <div className="flex gap-2 p-4 border-t border-card-border bg-white">
            <input
              type="text"
              placeholder="Ask about skincare, products, routines..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 px-4 py-3 rounded-full border border-card-border text-sm text-fg bg-[#FAFAF8] focus:border-pink focus:outline-none"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="w-11 h-11 rounded-full bg-gradient-to-r from-pink to-coral text-white text-base flex items-center justify-center disabled:opacity-30"
            >
              →
            </button>
          </div>
        </div>
      )}
    </>
  );
}
