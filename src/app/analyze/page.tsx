"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AnalyzePage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"camera" | "email" | "analyzing">("camera");
  const [error, setError] = useState("");

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream]);

  useEffect(() => {
    return () => { stream?.getTracks().forEach((t) => t.stop()); };
  }, [stream]);

  const startCamera = async () => {
    setCameraOn(true);
    setError("");
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 960 } },
      });
      setStream(s);
    } catch {
      setError("Camera access denied. Please allow camera permission and reload.");
      setCameraOn(false);
    }
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current;
    const c = canvasRef.current;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    const ctx = c.getContext("2d")!;
    ctx.translate(c.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(v, 0, 0);
    setPhoto(c.toDataURL("image/jpeg", 0.85));
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setCameraOn(false);
    setStep("email");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(reader.result as string);
      setCameraOn(false);
      setStep("email");
    };
    reader.readAsDataURL(file);
  };

  const retake = () => {
    setPhoto(null);
    setStep("camera");
    setEmail("");
    startCamera();
  };

  const startAnalysis = async () => {
    if (!photo) return;
    setStep("analyzing");
    setError("");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: photo, email: email || undefined }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      sessionStorage.setItem("seoulface-result", JSON.stringify({ ...data, photo }));
      router.push("/result");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed. Please try again.");
      setStep("email");
    }
  };

  return (
    <div className="gradient-hero min-h-dvh flex flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold text-pink-dk">My<span className="text-coral">SeoulFace</span></Link>
      </header>

      <main className="flex-1 flex flex-col items-center px-6 py-8">

        {/* ===== STEP 1: Camera ===== */}
        {step === "camera" && (
          <>
            <h2 className="text-2xl font-bold text-fg mb-2 fade-up">Skin Analysis</h2>
            <p className="text-muted text-sm mb-8 fade-up fade-up-1">Take a clear selfie with good lighting</p>

            <div className="camera-frame mb-6 fade-up fade-up-2">
              {cameraOn ? (
                <>
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ transform: "scaleX(-1)" }} />
                  <div className="camera-guide" />
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-pink-lt/20 to-lavender/20">
                  <span className="text-6xl mb-4">📸</span>
                  <p className="text-muted text-sm">Take a selfie or upload a photo</p>
                </div>
              )}
            </div>

            <canvas ref={canvasRef} className="hidden" />

            {error && <p className="text-coral text-sm mb-4 text-center max-w-xs">{error}</p>}

            <div className="flex flex-col items-center gap-3">
              {!cameraOn && (
                <>
                  <button onClick={startCamera} className="btn-primary">Open Camera</button>
                  <label className="btn-secondary cursor-pointer">
                    Upload Photo
                    <input type="file" accept="image/*" capture="user" className="hidden" onChange={handleFileUpload} />
                  </label>
                </>
              )}
              {cameraOn && stream && (
                <button onClick={takePhoto} className="btn-primary px-12">Take Photo</button>
              )}
            </div>

            <div className="mt-10 glass p-5 max-w-sm w-full fade-up fade-up-3">
              <h3 className="font-semibold text-fg text-sm mb-2">Tips for best results</h3>
              <ul className="text-xs text-muted space-y-1">
                <li>• Face the camera directly with a neutral expression</li>
                <li>• Use natural lighting (avoid harsh shadows)</li>
                <li>• Remove glasses and pull hair back</li>
                <li>• No filters or makeup for accurate analysis</li>
              </ul>
            </div>

            <p className="mt-4 text-[11px] text-muted text-center flex items-center gap-1.5">
              🔒 Your photo is analyzed in real-time and never stored on our servers
            </p>
          </>
        )}

        {/* ===== STEP 2: Email ===== */}
        {step === "email" && (
          <>
            <h2 className="text-2xl font-bold text-fg mb-2 fade-up">Almost There!</h2>
            <p className="text-muted text-sm mb-6 fade-up fade-up-1">Would you like to receive your results via email?</p>

            {/* Photo preview */}
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-pink-lt mb-8 fade-up fade-up-2">
              {photo && <img src={photo} alt="Your selfie" className="w-full h-full object-cover" />}
            </div>

            {error && <p className="text-coral text-sm mb-4 text-center max-w-xs">{error}</p>}

            <div className="w-full max-w-sm fade-up fade-up-3">
              <div className="glass p-6 mb-6">
                <div className="text-center mb-4">
                  <span className="text-4xl">📧</span>
                </div>
                <h3 className="font-bold text-fg text-center mb-1">Get Results via Email</h3>
                <p className="text-xs text-muted text-center mb-4">
                  We&apos;ll send your full skin analysis report with personalized K-Beauty recommendations
                </p>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && email.includes("@") && startAnalysis()}
                  className="w-full px-4 py-3 rounded-xl border border-card-border bg-white text-fg text-sm focus:border-pink focus:outline-none transition-colors mb-3"
                />
                <button
                  onClick={startAnalysis}
                  disabled={!email.includes("@")}
                  className="btn-primary w-full disabled:opacity-30"
                >
                  Send Results & Analyze
                </button>
              </div>

              <div className="flex gap-3 justify-center">
                <button onClick={retake} className="btn-secondary text-sm">
                  Retake Photo
                </button>
                <button onClick={startAnalysis} className="text-sm text-muted underline">
                  Skip — continue without email
                </button>
              </div>
            </div>
          </>
        )}

        {/* ===== STEP 3: Analyzing ===== */}
        {step === "analyzing" && (
          <div className="flex-1 flex flex-col items-center justify-center fade-up">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-pink-lt mb-6 animate-pulse">
              {photo && <img src={photo} alt="" className="w-full h-full object-cover" />}
            </div>
            <div className="btn-primary pointer-events-none opacity-80">
              <span className="inline-block animate-spin mr-2">⏳</span>
              Analyzing your skin...
            </div>
            <p className="text-muted text-xs mt-3">Our AI is examining your skin in detail</p>
            <p className="text-muted text-[10px] mt-1">This takes about 10-15 seconds</p>
          </div>
        )}

      </main>
    </div>
  );
}
