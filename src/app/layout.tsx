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
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
              (function(){
                var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
                s1.async=true;
                s1.src='https://embed.tawk.to/1jlgq4s2g/default';
                s1.charset='UTF-8';
                s1.setAttribute('crossorigin','*');
                s0.parentNode.insertBefore(s1,s0);
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
