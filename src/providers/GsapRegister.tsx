"use client";

import { useEffect } from "react";

import { ScrollTrigger } from "@/lib/gsap";

/**
 * Registers GSAP plugins (via the lib/gsap import) and recalculates
 * ScrollTrigger positions once fonts and images have loaded (brief §6.5).
 */
export function GsapRegister() {
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();

    document.fonts?.ready.then(refresh);
    if (document.readyState === "complete") {
      refresh();
      return;
    }
    window.addEventListener("load", refresh, { once: true });
    return () => window.removeEventListener("load", refresh);
  }, []);

  return null;
}
