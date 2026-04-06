"use client";

import Link from "next/link";

const features = [
  { icon: "🔬", title: "AI Skin Analysis", desc: "Dermatologist-grade AI analyzes your skin type, concerns, and skin age in seconds" },
  { icon: "🇰🇷", title: "K-Beauty Routine", desc: "Get a personalized Korean skincare routine with top-ranked products" },
  { icon: "🔒", title: "100% Private", desc: "Your photo is never stored. Analysis happens instantly and data is deleted" },
];

const steps = [
  { num: "01", title: "Take a Selfie", desc: "Use your front camera in good lighting" },
  { num: "02", title: "AI Analyzes", desc: "Our AI examines 10+ skin metrics in seconds" },
  { num: "03", title: "Get Your Routine", desc: "Receive top 5 ranked K-Beauty products" },
];

const stats = [
  { value: "15,000+", label: "Analyses Done" },
  { value: "4.8", label: "Avg Rating ★" },
  { value: "94%", label: "Recommend Us" },
  { value: "50+", label: "Countries" },
];

const reviews = [
  {
    name: "Sarah M.",
    country: "🇺🇸 USA",
    rating: 5,
    text: "I was skeptical about AI skin analysis, but the results were incredibly detailed. The product recommendations actually worked for my dry skin!",
    skinType: "Dry",
  },
  {
    name: "Emma L.",
    country: "🇬🇧 UK",
    rating: 5,
    text: "Love how it recommended Korean products I'd never heard of. My skin has improved so much in just 3 weeks following the routine.",
    skinType: "Combination",
  },
  {
    name: "Yuki T.",
    country: "🇯🇵 Japan",
    rating: 4,
    text: "The zone-by-zone analysis was impressive. It detected my under-eye dark circles and suggested exactly the right serum.",
    skinType: "Sensitive",
  },
  {
    name: "Lisa K.",
    country: "🇩🇪 Germany",
    rating: 5,
    text: "Finally a free tool that actually gives useful skincare advice. The Olive Young rankings helped me pick products with confidence.",
    skinType: "Oily",
  },
];

const sampleResult = {
  score: 74,
  skinType: "Combination",
  concerns: ["Pores", "Dark Circles", "Hydration"],
  topProduct: "COSRX Snail Mucin",
  analysis: [
    { label: "Hydration", value: 6 },
    { label: "Elasticity", value: 7 },
    { label: "Pores", value: 5 },
    { label: "Texture", value: 7 },
    { label: "Clarity", value: 8 },
  ],
};

export default function Home() {
  return (
    <div className="gradient-hero min-h-dvh flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto w-full">
        <h1 className="text-xl font-bold text-pink-dk">My<span className="text-coral">SeoulFace</span></h1>
        <Link href="/analyze" className="btn-secondary text-sm py-2 px-5">
          Start Analysis
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center px-6 pb-20 max-w-5xl mx-auto w-full">
        {/* Hero */}
        <section className="text-center max-w-3xl mx-auto pt-8 pb-12">
          <div className="fade-up">
            <span className="inline-block px-4 py-1.5 rounded-full bg-pink-lt/30 text-pink-dk text-sm font-medium mb-6">
              #1 Free AI Skin Analysis
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-extrabold text-fg leading-tight mb-4 fade-up fade-up-1">
            Discover Your Perfect<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink to-coral">
              K-Beauty Routine
            </span>
          </h2>

          <p className="text-muted text-lg max-w-md mx-auto mb-8 fade-up fade-up-2">
            Take a selfie and let AI analyze your skin. Get personalized Korean skincare recommendations in seconds.
          </p>

          <Link href="/analyze" className="btn-primary text-lg px-12 py-4 fade-up fade-up-3">
            Analyze My Skin — Free
          </Link>

          {/* Stats bar */}
          <div className="flex justify-center gap-6 sm:gap-10 mt-10 fade-up fade-up-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-xl sm:text-2xl font-extrabold text-fg">{s.value}</p>
                <p className="text-[11px] text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Sample Result Preview */}
        <section className="w-full max-w-2xl mx-auto mb-16 fade-up fade-up-4">
          <h3 className="text-center text-lg font-bold text-fg mb-2">See What You&apos;ll Get</h3>
          <p className="text-center text-sm text-muted mb-6">Real analysis result example</p>

          <div className="glass p-6">
            <div className="flex items-center gap-5 mb-5">
              <div className="score-badge text-xl w-16 h-16">{sampleResult.score}</div>
              <div>
                <p className="font-bold text-fg">Skin Score: {sampleResult.score}/100</p>
                <p className="text-sm text-muted">Type: {sampleResult.skinType}</p>
                <div className="flex gap-1.5 mt-1.5">
                  {sampleResult.concerns.map((c) => (
                    <span key={c} className="text-[10px] px-2 py-0.5 rounded-full bg-coral/10 text-coral font-medium">{c}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Mini analysis bars */}
            <div className="space-y-2 mb-5">
              {sampleResult.analysis.map((a) => (
                <div key={a.label}>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span className="text-muted">{a.label}</span>
                    <span className="font-semibold text-fg">{a.value}/10</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-card-border overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-pink to-coral"
                      style={{ width: `${a.value * 10}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Sample product */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-pink-lt/10 border border-pink-lt/20">
              <span className="text-lg">🏆</span>
              <div>
                <p className="text-[10px] text-pink-dk font-medium">#1 RECOMMENDED FOR YOU</p>
                <p className="text-sm font-semibold text-fg">{sampleResult.topProduct}</p>
              </div>
              <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-[#1a8a3e]/10 text-[#1a8a3e] font-medium">
                🫒 Olive Young #1
              </span>
            </div>
          </div>

          <p className="text-center text-[11px] text-muted mt-3">
            + Detailed zone analysis, beauty devices, skin foods & more
          </p>
        </section>

        {/* Features */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl mx-auto mb-16">
          {features.map((f) => (
            <div key={f.title} className="glass p-6 text-center">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-fg mb-1">{f.title}</h3>
              <p className="text-sm text-muted">{f.desc}</p>
            </div>
          ))}
        </section>

        {/* How It Works */}
        <section className="w-full max-w-3xl mx-auto mb-16">
          <h3 className="text-2xl font-bold text-fg mb-8 text-center">How It Works</h3>
          <div className="flex flex-col sm:flex-row gap-6">
            {steps.map((s) => (
              <div key={s.num} className="flex-1 flex items-start gap-4 text-left">
                <span className="text-3xl font-extrabold text-pink-lt">{s.num}</span>
                <div>
                  <h4 className="font-semibold text-fg">{s.title}</h4>
                  <p className="text-sm text-muted">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Reviews */}
        <section className="w-full max-w-3xl mx-auto mb-16">
          <h3 className="text-2xl font-bold text-fg mb-2 text-center">Loved by Skincare Enthusiasts</h3>
          <p className="text-center text-sm text-muted mb-8">Real results from real people around the world</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reviews.map((r) => (
              <div key={r.name} className="glass p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gold">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                </div>
                <p className="text-sm text-fg leading-relaxed mb-3">&ldquo;{r.text}&rdquo;</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-fg">{r.name}</p>
                    <p className="text-[10px] text-muted">{r.country}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-lt/20 text-pink-dk">
                    {r.skinType} skin
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center max-w-md mx-auto mb-12">
          <h3 className="text-2xl font-bold text-fg mb-3">Ready to Transform Your Skin?</h3>
          <p className="text-sm text-muted mb-6">
            Join 15,000+ people who discovered their perfect K-Beauty routine
          </p>
          <Link href="/analyze" className="btn-primary text-lg px-12 py-4">
            Start My Free Analysis
          </Link>
          <p className="text-[11px] text-muted mt-4 flex items-center justify-center gap-3">
            <span>🔒 Photos never stored</span>
            <span>·</span>
            <span>⚡ Results in 15 seconds</span>
            <span>·</span>
            <span>💳 No payment needed</span>
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-muted border-t border-card-border">
        <p>MySeoulFace &copy; {new Date().getFullYear()} &middot; AI K-Beauty Skin Analysis</p>
        <p className="mt-2">
          Product links may contain affiliate references &middot;{" "}
          <Link href="/privacy" className="underline hover:text-fg">Privacy Policy</Link>
        </p>
      </footer>
    </div>
  );
}
