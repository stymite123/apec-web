"use client";

import { ReactLenis, useLenis, type LenisRef } from "lenis/react";
import { useEffect, useMemo, useRef, type ReactNode } from "react";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/** Keeps ScrollTrigger in step with Lenis' scroll position. */
function ScrollTriggerSync() {
  useLenis(ScrollTrigger.update);
  return null;
}

/**
 * Lenis smooth scroll driven by the GSAP ticker (brief §11).
 * With prefers-reduced-motion, smoothing is switched off; the tree stays the
 * same so children never remount.
 * `anchors` stays off: Lenis would intercept in-page links and the skip link
 * would no longer move keyboard focus to #content.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);
  const reduceMotion = usePrefersReducedMotion();

  const options = useMemo(
    () => ({
      autoRaf: false,
      smoothWheel: !reduceMotion,
      anchors: false,
    }),
    [reduceMotion],
  );

  useEffect(() => {
    const update = (time: number) => lenisRef.current?.lenis?.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    return () => gsap.ticker.remove(update);
  }, []);

  return (
    <ReactLenis root options={options} ref={lenisRef}>
      <ScrollTriggerSync />
      {children}
    </ReactLenis>
  );
}
