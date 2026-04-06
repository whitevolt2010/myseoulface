"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    Tawk_API?: Record<string, unknown>;
    Tawk_LoadStart?: Date;
  }
}

export default function TawkTo() {
  useEffect(() => {
    if (window.Tawk_API && Object.keys(window.Tawk_API).length > 0) return;

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    const s1 = document.createElement("script");
    s1.async = true;
    s1.src = "https://embed.tawk.to/69d35cc8b137951c367ff6be/1jlgq4s2g";
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");
    document.head.appendChild(s1);
  }, []);

  return null;
}
