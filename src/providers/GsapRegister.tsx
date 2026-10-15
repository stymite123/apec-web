"use client";

import { useEffect } from "react";

import { ScrollTrigger } from "@/lib/gsap";

/**
 * Registers GSAP plugins (via the lib/gsap import) and recalculates ScrollTrigger
 * positions once fonts and images have loaded (brief §6.5), and whenever the page height
 * changes afterwards (deferred sections render at their real size when approached).
 */
export function GsapRegister() {
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();

    document.fonts?.ready.then(refresh);

    // Page height changes (a deferred section rendering) move every later trigger.
    let height = document.body.offsetHeight;
    let timer = 0;
    const resize = new ResizeObserver(() => {
      const next = document.body.offsetHeight;
      if (Math.abs(next - height) < 2) return;
      height = next;
      window.clearTimeout(timer);
      timer = window.setTimeout(refresh, 150);
    });
    resize.observe(document.body);
    const stop = () => {
      resize.disconnect();
      window.clearTimeout(timer);
    };
    if (document.readyState === "complete") {
      refresh();
      return stop;
    }
    window.addEventListener("load", refresh, { once: true });
    return () => {
      stop();
      window.removeEventListener("load", refresh);
    };
  }, []);

  return null;
}
