"use client";

import Link from "next/link";

const features = [
  { icon: "🔬", title: "AI Skin Analysis", desc: "Advanced AI analyzes your skin type, concerns, and skin age" },
  { icon: "🇰🇷", title: "K-Beauty Routine", desc: "Get a personalized Korean skincare routine just for you" },
  { icon: "✨", title: "100% Free", desc: "No sign-up, no payment. Just take a selfie and get results" },
];

const steps = [
  { num: "01", title: "Take a Selfie", desc: "Use your front camera in good lighting" },
  { num: "02", title: "AI Analyzes", desc: "Our AI examines your skin in seconds" },
  { num: "03", title: "Get Your Routine", desc: "Receive personalized K-Beauty products" },
];

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

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-20 max-w-3xl mx-auto text-center">
        <div className="fade-up">
          <span className="inline-block px-4 py-1.5 rounded-full bg-pink-lt/30 text-pink-dk text-sm font-medium mb-6">
            Free AI Skin Analysis
          </span>
        </div>

        <h2 className="text-4xl sm:text-5xl font-extrabold text-fg leading-tight mb-4 fade-up fade-up-1">
          Discover Your Perfect<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink to-coral">
            K-Beauty Routine
          </span>
        </h2>

        <p className="text-muted text-lg max-w-md mb-8 fade-up fade-up-2">
          Take a selfie and let AI analyze your skin. Get personalized Korean skincare recommendations in seconds.
        </p>

        <Link href="/analyze" className="btn-primary text-lg px-12 py-4 fade-up fade-up-3">
          Analyze My Skin — Free
        </Link>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 w-full fade-up fade-up-4">
          {features.map((f) => (
            <div key={f.title} className="glass p-6 text-center">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-fg mb-1">{f.title}</h3>
              <p className="text-sm text-muted">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Steps */}
        <div className="mt-16 w-full">
          <h3 className="text-2xl font-bold text-fg mb-8">How It Works</h3>
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
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-muted">
        MySeoulFace &copy; {new Date().getFullYear()} &middot; K-Beauty Skin Analysis
      </footer>
    </div>
  );
}
