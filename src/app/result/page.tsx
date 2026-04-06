"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface SkinResult {
  photo: string;
  imageQuality?: string;
  skinType: string;
  skinTone: string;
  skinAge: number;
  overallScore: number;
  detailedAnalysis?: Record<string, string>;
  concerns: Array<{ name: string; severity: string; zone?: string; description: string }>;
  analysis: Record<string, number>;
  routine: Array<{
    rank: number;
    step: string;
    productName: string;
    brand: string;
    reason: string;
    priceRange: string;
    keyIngredient: string;
    oliveyoungRank?: string | null;
    globalRank?: string;
    rating?: number;
    reviewCount?: string;
  }>;
  devices?: Array<{
    name: string;
    brand: string;
    type: string;
    reason: string;
    priceRange: string;
    usage: string;
  }>;
  skinFoods?: Array<{
    name: string;
    benefit: string;
    howToConsume: string;
  }>;
  tips: string[];
  summary: string;
}

// 제휴 링크 생성 (YesStyle/Amazon 검색 링크)
// TODO: 실제 제휴 ID로 교체
function getAffiliateLink(brand: string, productName: string): string {
  const query = encodeURIComponent(`${brand} ${productName}`);
  // Amazon 제휴 링크 (tag= 부분을 실제 제휴 ID로 변경)
  return `https://www.amazon.com/s?k=${query}&tag=seoulface-20`;
}

const analysisLabels: Record<string, string> = {
  hydration: "Hydration",
  elasticity: "Elasticity",
  pores: "Pores",
  texture: "Texture",
  clarity: "Clarity",
  radiance: "Radiance",
  wrinkles: "Wrinkles",
  darkCircles: "Dark Circles",
  acne: "Acne",
  pigmentation: "Pigmentation",
};

const zoneLabels: Record<string, string> = {
  forehead: "Forehead",
  nose: "Nose",
  leftCheek: "Left Cheek",
  rightCheek: "Right Cheek",
  underEyes: "Under Eyes",
  jawlineChin: "Jawline & Chin",
  lips: "Lips",
  overallTone: "Overall Tone",
};

const deviceEmoji: Record<string, string> = {
  LED: "💡",
  microcurrent: "⚡",
  RF: "🔥",
  ultrasonic: "🔊",
  dermaplaning: "🪒",
  steamer: "♨️",
  "ice roller": "🧊",
};

const severityColor: Record<string, string> = {
  mild: "bg-mint/20 text-mint",
  moderate: "bg-gold/20 text-gold",
  severe: "bg-coral/20 text-coral",
};

const stepEmoji: Record<string, string> = {
  Cleanser: "🧴",
  Toner: "💧",
  Serum: "✨",
  Moisturizer: "🧊",
  Sunscreen: "☀️",
  "Eye Cream": "👁️",
};

export default function ResultPage() {
  const [result, setResult] = useState<SkinResult | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("seoulface-result");
    if (stored) setResult(JSON.parse(stored));
  }, []);

  if (!result) {
    return (
      <div className="gradient-hero min-h-dvh flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted mb-4">No analysis result found</p>
          <Link href="/analyze" className="btn-primary">Start Analysis</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="gradient-result min-h-dvh">
      <header className="flex items-center justify-between px-6 py-4 max-w-2xl mx-auto w-full">
        <Link href="/" className="text-xl font-bold text-pink-dk">My<span className="text-coral">SeoulFace</span></Link>
        <Link href="/analyze" className="btn-secondary text-xs py-2 px-4">New Analysis</Link>
      </header>

      <main className="max-w-2xl mx-auto px-6 pb-20">
        {/* Image quality warning */}
        {result.imageQuality === "poor" && (
          <div className="w-full mb-4 p-3 rounded-xl bg-coral/10 border border-coral/20 text-center fade-up">
            <p className="text-sm text-coral font-medium">Low image quality detected</p>
            <p className="text-xs text-muted mt-1">Retake with better lighting for more accurate results</p>
          </div>
        )}

        {/* Hero card */}
        <div className="glass p-6 mb-6 fade-up">
          <div className="flex items-center gap-5">
            <img
              src={result.photo}
              alt="Your photo"
              className="w-20 h-20 rounded-full object-cover border-3 border-pink-lt"
            />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <div className="score-badge text-xl w-14 h-14">{result.overallScore}</div>
                <div>
                  <p className="font-bold text-fg text-lg">Skin Score</p>
                  <p className="text-muted text-xs">out of 100</p>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-4 text-fg text-sm leading-relaxed">{result.summary}</p>
        </div>

        {/* Skin Info */}
        <div className="grid grid-cols-3 gap-3 mb-6 fade-up fade-up-1">
          <div className="glass p-4 text-center">
            <p className="text-xs text-muted mb-1">Type</p>
            <p className="font-bold text-fg capitalize">{result.skinType}</p>
          </div>
          <div className="glass p-4 text-center">
            <p className="text-xs text-muted mb-1">Tone</p>
            <p className="font-bold text-fg capitalize">{result.skinTone}</p>
          </div>
          <div className="glass p-4 text-center">
            <p className="text-xs text-muted mb-1">Skin Age</p>
            <p className="font-bold text-fg">{result.skinAge}</p>
          </div>
        </div>

        {/* Detailed Zone Analysis */}
        {result.detailedAnalysis && (
          <div className="glass p-5 mb-6 fade-up fade-up-2">
            <h3 className="font-bold text-fg mb-4">Detailed Face Analysis</h3>
            <div className="space-y-3">
              {Object.entries(result.detailedAnalysis).map(([zone, desc]) => (
                <div key={zone} className="flex items-start gap-3">
                  <span className="text-xs font-semibold text-pink-dk bg-pink-lt/20 px-2 py-1 rounded-lg whitespace-nowrap mt-0.5">
                    {zoneLabels[zone] || zone}
                  </span>
                  <p className="text-sm text-fg leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Concerns */}
        {result.concerns.length > 0 && (
          <div className="mb-6 fade-up fade-up-2">
            <h3 className="font-bold text-fg mb-3">Skin Concerns</h3>
            <div className="space-y-2">
              {result.concerns.map((c, i) => (
                <div key={i} className={`p-3 rounded-xl border ${
                  c.severity === "severe" ? "bg-coral/5 border-coral/20" :
                  c.severity === "moderate" ? "bg-gold/5 border-gold/20" :
                  "bg-mint/5 border-mint/20"
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-fg">{c.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${severityColor[c.severity] || ""}`}>{c.severity}</span>
                    {c.zone && <span className="text-[10px] text-muted">({c.zone})</span>}
                  </div>
                  <p className="text-xs text-muted">{c.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analysis bars */}
        <div className="glass p-5 mb-6 fade-up fade-up-2">
          <h3 className="font-bold text-fg mb-4">Detailed Analysis</h3>
          <div className="space-y-3">
            {Object.entries(result.analysis).map(([key, val]) => (
              <div key={key}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted">{analysisLabels[key] || key}</span>
                  <span className="font-semibold text-fg">{val}/10</span>
                </div>
                <div className="h-2 rounded-full bg-card-border overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-pink to-coral transition-all"
                    style={{ width: `${val * 10}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* K-Beauty Top 5 — 순위별 제품 추천 */}
        <div className="mb-6 fade-up fade-up-3">
          <h3 className="font-bold text-fg text-lg mb-1">Top 5 Products For You</h3>
          <p className="text-muted text-xs mb-4">Ranked by priority — #1 is your must-have</p>

          <div className="space-y-3">
            {[...result.routine]
              .sort((a, b) => (a.rank || 99) - (b.rank || 99))
              .slice(0, 5)
              .map((item) => {
                const rank = item.rank || 0;
                const isTop = rank === 1;
                return (
                  <a
                    key={rank}
                    href={getAffiliateLink(item.brand, item.productName)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`product-card block relative overflow-hidden ${isTop ? "ring-2 ring-coral/40" : ""}`}
                  >
                    {isTop && (
                      <div className="absolute top-0 right-0 bg-coral text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">
                        MUST HAVE
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      {/* 순위 뱃지 */}
                      <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                        rank === 1 ? "bg-coral text-white" :
                        rank === 2 ? "bg-pink-dk text-white" :
                        rank === 3 ? "bg-pink text-white" :
                        "bg-card-border text-muted"
                      }`}>
                        #{rank}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-medium text-pink-dk uppercase tracking-wider">{item.step}</span>
                          <span className="text-[10px] text-muted">{item.priceRange}</span>
                        </div>
                        <p className="font-semibold text-fg text-sm">{item.brand} — {item.productName}</p>

                        {/* 올리브영 + 글로벌 랭킹 + 별점 */}
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          {item.oliveyoungRank && (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[#1a8a3e]/10 text-[#1a8a3e] font-medium">
                              🫒 {item.oliveyoungRank}
                            </span>
                          )}
                          {item.globalRank && (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-gold/10 text-gold font-medium">
                              🌍 {item.globalRank}
                            </span>
                          )}
                          {item.rating && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-fg/60">
                              {"★".repeat(Math.floor(item.rating))}{"☆".repeat(5 - Math.floor(item.rating))}
                              {" "}{item.rating}
                              {item.reviewCount && <span className="text-muted ml-0.5">({item.reviewCount} reviews)</span>}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-fg/70 mt-1.5 leading-relaxed">{item.reason}</p>
                        <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full bg-mint/10 text-mint font-medium">
                          {item.keyIngredient}
                        </span>
                      </div>
                      <span className="text-muted text-sm mt-1">→</span>
                    </div>
                  </a>
                );
              })}
          </div>
        </div>

        {/* Beauty Devices */}
        {result.devices && result.devices.length > 0 && (
          <div className="mb-6 fade-up fade-up-4">
            <h3 className="font-bold text-fg text-lg mb-1">Recommended Beauty Devices</h3>
            <p className="text-muted text-xs mb-4">Home devices for your skin concerns</p>
            <div className="space-y-3">
              {result.devices.map((d, i) => (
                <a
                  key={i}
                  href={getAffiliateLink(d.brand, d.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="product-card block"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{deviceEmoji[d.type] || "🔧"}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-medium text-lavender uppercase tracking-wider">{d.type}</span>
                        <span className="text-[10px] text-muted">{d.priceRange}</span>
                      </div>
                      <p className="font-semibold text-fg text-sm">{d.brand} — {d.name}</p>
                      <p className="text-xs text-fg/70 mt-1 leading-relaxed">{d.reason}</p>
                      <p className="text-[10px] text-muted mt-1">Usage: {d.usage}</p>
                    </div>
                    <span className="text-muted text-sm mt-1">→</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Skin Health Foods */}
        {result.skinFoods && result.skinFoods.length > 0 && (
          <div className="glass p-5 mb-6 fade-up fade-up-4">
            <h3 className="font-bold text-fg mb-1">Skin Health Foods</h3>
            <p className="text-muted text-xs mb-4">Nourish your skin from the inside</p>
            <div className="space-y-3">
              {result.skinFoods.map((f, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-lg">🥗</span>
                  <div>
                    <p className="font-semibold text-fg text-sm">{f.name}</p>
                    <p className="text-xs text-fg/70 mt-0.5">{f.benefit}</p>
                    <p className="text-[10px] text-muted mt-1">{f.howToConsume}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="glass p-5 mb-6 fade-up fade-up-4">
          <h3 className="font-bold text-fg mb-3">Skincare Tips</h3>
          <ul className="space-y-2">
            {result.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-fg">
                <span className="text-pink">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Share Card + CTA */}
        <div className="text-center fade-up fade-up-4">
          <h3 className="font-bold text-fg mb-4">Share Your Results</h3>

          {/* Share card preview */}
          <div className="inline-block mb-4">
            <canvas id="share-card" className="hidden" />
            <div
              id="share-preview"
              className="w-[320px] mx-auto rounded-2xl overflow-hidden shadow-lg border border-card-border"
              style={{ background: "linear-gradient(135deg, #FFF5F8 0%, #FDF2F0 30%, #F5F0FF 70%, #F0F8F5 100%)" }}
            >
              <div className="p-6 text-center">
                <p className="text-xs text-pink-dk font-medium mb-1">MySeoulFace</p>
                <p className="text-xs text-muted mb-4">AI K-Beauty Skin Analysis</p>
                <div className="w-16 h-16 rounded-full mx-auto mb-3 overflow-hidden border-3 border-pink-lt">
                  <img src={result.photo} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="score-badge text-lg w-12 h-12 mx-auto mb-2">{result.overallScore}</div>
                <p className="text-xs text-muted mb-3">Skin Score</p>
                <div className="flex justify-center gap-4 mb-3">
                  <div className="text-center">
                    <p className="text-[10px] text-muted">Type</p>
                    <p className="text-xs font-bold text-fg capitalize">{result.skinType}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted">Skin Age</p>
                    <p className="text-xs font-bold text-fg">{result.skinAge}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-muted">Tone</p>
                    <p className="text-xs font-bold text-fg capitalize">{result.skinTone}</p>
                  </div>
                </div>
                <div className="flex flex-wrap justify-center gap-1 mb-3">
                  {result.concerns.slice(0, 3).map((c, i) => (
                    <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-coral/10 text-coral font-medium">
                      {c.name}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-pink-dk font-medium">Get your free analysis at seoulface.vercel.app</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => {
                // Generate share card image from the preview div
                const preview = document.getElementById("share-preview");
                if (!preview) return;

                import("html2canvas").then(({ default: html2canvas }) => {
                  html2canvas(preview, { scale: 2, backgroundColor: null }).then((canvas) => {
                    canvas.toBlob((blob) => {
                      if (!blob) return;
                      const file = new File([blob], "myseoulface-result.png", { type: "image/png" });

                      if (navigator.share && navigator.canShare?.({ files: [file] })) {
                        navigator.share({
                          title: "My SeoulFace Skin Analysis",
                          text: `My skin score is ${result.overallScore}/100! Get your free K-Beauty skin analysis:`,
                          files: [file],
                        });
                      } else {
                        // Fallback: download image
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = "myseoulface-result.png";
                        a.click();
                        URL.revokeObjectURL(url);
                      }
                    }, "image/png");
                  });
                }).catch(() => {
                  // Fallback if html2canvas fails
                  if (navigator.share) {
                    navigator.share({
                      title: "My SeoulFace Skin Analysis",
                      text: `My skin score is ${result.overallScore}/100! Get your free K-Beauty skin analysis:`,
                      url: window.location.origin,
                    });
                  }
                });
              }}
              className="btn-primary"
            >
              Share My Card
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  `My skin score is ${result.overallScore}/100! Get your free K-Beauty skin analysis: ${window.location.origin}`
                );
                const btn = document.activeElement as HTMLButtonElement;
                if (btn) { btn.textContent = "Copied!"; setTimeout(() => { btn.textContent = "Copy Link"; }, 2000); }
              }}
              className="btn-secondary text-sm"
            >
              Copy Link
            </button>
          </div>
          <p className="text-[10px] text-muted mt-3">
            Share with friends and discover K-Beauty together
          </p>
        </div>
      </main>

      <footer className="text-center py-4 text-xs text-muted">
        <p>MySeoulFace &copy; {new Date().getFullYear()} &middot; Product links may contain affiliate references</p>
        <p className="mt-1">
          <a href="/privacy" className="underline hover:text-fg">Privacy Policy</a>
        </p>
      </footer>
    </div>
  );
}
