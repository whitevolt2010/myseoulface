import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "MySeoulFace — AI K-Beauty Skin Analysis",
  description: "Get your free AI skin analysis and personalized Korean skincare routine. Discover K-Beauty products perfect for your skin type.",
  keywords: ["k-beauty", "korean skincare", "skin analysis", "AI skin", "skincare routine", "myseoulface"],
  openGraph: {
    title: "MySeoulFace — AI K-Beauty Skin Analysis",
    description: "Free AI skin analysis + personalized K-Beauty routine",
    siteName: "MySeoulFace",
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
      <body className="min-h-dvh flex flex-col">
        {children}
        <Script
          id="tawk-to"
          strategy="afterInteractive"
          src="https://embed.tawk.to/69d35cc8b137951c367ff6be/1jlgq4s2g"
        />
      </body>
    </html>
  );
}
