import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SeoulFace — AI K-Beauty Skin Analysis",
  description: "Get your free AI skin analysis and personalized Korean skincare routine. Discover K-Beauty products perfect for your skin type.",
  keywords: ["k-beauty", "korean skincare", "skin analysis", "AI skin", "skincare routine", "seoulface"],
  openGraph: {
    title: "SeoulFace — AI K-Beauty Skin Analysis",
    description: "Free AI skin analysis + personalized K-Beauty routine",
    siteName: "SeoulFace",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FFF5F8",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh flex flex-col">{children}</body>
    </html>
  );
}
