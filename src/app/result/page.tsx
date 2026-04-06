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
  concerns: Array<{ name: string; severity: string; zone?: string; description: string }>;
  analysis: Record<string, number>;
  routine: Array<{
    step: string;
    productName: string;
    brand: string;
    reason: string;
    priceRange: string;
    keyIngredient: string;
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
        <Link href="/" className="text-xl font-bold text-pink-dk">Seoul<span className="text-coral">Face</span></Link>
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

        {/* Concerns */}
        {result.concerns.length > 0 && (
          <div className="mb-6 fade-up fade-up-2">
            <h3 className="font-bold text-fg mb-3">Skin Concerns</h3>
            <div className="flex flex-wrap gap-2">
              {result.concerns.map((c, i) => (
                <div key={i} className={`concern-tag ${severityColor[c.severity] || ""}`}>
                  {c.name}
                  {c.zone && <span className="text-[10px] opacity-50 ml-1">({c.zone})</span>}
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

        {/* K-Beauty Routine — 핵심 (제휴 링크) */}
        <div className="mb-6 fade-up fade-up-3">
          <h3 className="font-bold text-fg text-lg mb-1">Your K-Beauty Routine</h3>
          <p className="text-muted text-xs mb-4">Personalized products for your skin</p>

          <div className="space-y-3">
            {result.routine.map((item, i) => (
              <a
                key={i}
                href={getAffiliateLink(item.brand, item.productName)}
                target="_blank"
                rel="noopener noreferrer"
                className="product-card block"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{stepEmoji[item.step] || "🧴"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-medium text-pink-dk uppercase tracking-wider">{item.step}</span>
                      <span className="text-[10px] text-muted">{item.priceRange}</span>
                    </div>
                    <p className="font-semibold text-fg text-sm truncate">{item.brand} — {item.productName}</p>
                    <p className="text-xs text-muted mt-1">{item.reason}</p>
                    <span className="inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-full bg-mint/10 text-mint font-medium">
                      {item.keyIngredient}
                    </span>
                  </div>
                  <span className="text-muted text-sm mt-1">→</span>
                </div>
              </a>
            ))}
          </div>
        </div>

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

        {/* Share + CTA */}
        <div className="text-center fade-up fade-up-4">
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: "My SeoulFace Skin Analysis",
                  text: `My skin score is ${result.overallScore}/100! Get your free K-Beauty skin analysis:`,
                  url: window.location.origin,
                });
              } else {
                navigator.clipboard.writeText(
                  `My skin score is ${result.overallScore}/100! Get your free K-Beauty skin analysis: ${window.location.origin}`
                );
                alert("Link copied!");
              }
            }}
            className="btn-secondary mb-3"
          >
            Share My Results
          </button>
          <p className="text-[10px] text-muted">
            Share with friends and discover K-Beauty together
          </p>
        </div>
      </main>

      <footer className="text-center py-4 text-xs text-muted">
        SeoulFace &copy; {new Date().getFullYear()} &middot; Product links may contain affiliate references
      </footer>
    </div>
  );
}
