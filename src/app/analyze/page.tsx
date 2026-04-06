"use client";

import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AnalyzePage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const startCamera = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 960 } },
      });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        videoRef.current.play();
      }
      setError("");
    } catch {
      setError("Camera access denied. Please allow camera permission.");
    }
  }, []);

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current;
    const c = canvasRef.current;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    const ctx = c.getContext("2d")!;
    ctx.drawImage(v, 0, 0);
    const dataUrl = c.toDataURL("image/jpeg", 0.85);
    setPhoto(dataUrl);
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
  };

  const retake = () => {
    setPhoto(null);
    startCamera();
  };

  const analyze = async () => {
    if (!photo) return;
    setAnalyzing(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: photo }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      sessionStorage.setItem("seoulface-result", JSON.stringify({ ...data, photo }));
      router.push("/result");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed. Please try again.");
      setAnalyzing(false);
    }
  };

  return (
    <div className="gradient-hero min-h-dvh flex flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold text-pink-dk">Seoul<span className="text-coral">Face</span></Link>
      </header>

      <main className="flex-1 flex flex-col items-center px-6 py-8">
        <h2 className="text-2xl font-bold text-fg mb-2 fade-up">Skin Analysis</h2>
        <p className="text-muted text-sm mb-8 fade-up fade-up-1">Take a clear selfie with good lighting</p>

        {/* Camera / Photo */}
        <div className="camera-frame mb-6 fade-up fade-up-2">
          {photo ? (
            <img src={photo} alt="Your selfie" className="w-full h-full object-cover" />
          ) : stream ? (
            <>
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ transform: "scaleX(-1)" }} />
              <div className="camera-guide" />
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-pink-lt/20 to-lavender/20">
              <span className="text-6xl mb-4">📸</span>
              <p className="text-muted text-sm">Tap below to start camera</p>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {error && (
          <p className="text-coral text-sm mb-4 text-center">{error}</p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {!stream && !photo && (
            <button onClick={startCamera} className="btn-primary">
              Open Camera
            </button>
          )}
          {stream && !photo && (
            <button onClick={takePhoto} className="btn-primary px-12">
              Take Photo
            </button>
          )}
          {photo && !analyzing && (
            <>
              <button onClick={retake} className="btn-secondary">
                Retake
              </button>
              <button onClick={analyze} className="btn-primary">
                Analyze My Skin
              </button>
            </>
          )}
          {analyzing && (
            <div className="text-center">
              <div className="btn-primary pointer-events-none opacity-80">
                <span className="inline-block animate-spin mr-2">⏳</span>
                Analyzing your skin...
              </div>
              <p className="text-muted text-xs mt-3">This takes about 10 seconds</p>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="mt-10 glass p-5 max-w-sm w-full fade-up fade-up-3">
          <h3 className="font-semibold text-fg text-sm mb-2">Tips for best results</h3>
          <ul className="text-xs text-muted space-y-1">
            <li>• Face the camera directly with a neutral expression</li>
            <li>• Use natural lighting (avoid harsh shadows)</li>
            <li>• Remove glasses and pull hair back</li>
            <li>• No filters or makeup for accurate analysis</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
