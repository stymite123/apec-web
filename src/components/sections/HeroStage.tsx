"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import { TemporaryApexMark } from "@/components/brand/TemporaryApexMark";
import type { HeroInput } from "@/components/three/HeroScene";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { ENABLE_3D } from "@/lib/flags";
import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { scrub } from "@/lib/motion";
import { cn } from "@/lib/utils";

const HeroScene = dynamic(() => import("@/components/three/HeroScene"), { ssr: false });

/**
 * True only for hardware-accelerated WebGL. Software renderers (no GPU, blocklisted
 * drivers, headless browsers) report a "major performance caveat" and get the
 * static poster instead — the 3D scene would starve the main thread there.
 * `?force-3d` overrides this for screenshot checks.
 */
function hasFastWebGL() {
  if (new URLSearchParams(window.location.search).has("force-3d")) return true;
  // Automated browsers (Playwright) read every frame back from the GPU, which makes a
  // continuously animating scene stall them; they get the poster.
  if (navigator.webdriver) return false;
  try {
    const canvas = document.createElement("canvas");
    const options = { failIfMajorPerformanceCaveat: true };
    return Boolean(canvas.getContext("webgl2", options) ?? canvas.getContext("webgl", options));
  } catch {
    return false;
  }
}

/**
 * Client half of the hero: loads the 3D scene once the page is idle, feeds it
 * pointer + scroll input, and drives the wordmark/copy scroll motion.
 * Without WebGL (or with ENABLE_3D off) a static glowing SVG mark is shown.
 */
export function HeroStage() {
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HeroInput>({ pointerX: 0, pointerY: 0, scroll: 0 });
  const reduceMotion = usePrefersReducedMotion();
  const [mode, setMode] = useState<"pending" | "3d" | "poster">("pending");
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    // Decided after first paint so the hero text (LCP) never waits on WebGL.
    const load = () => {
      setMobile(window.matchMedia("(max-width: 767px)").matches);
      setMode(ENABLE_3D && hasFastWebGL() ? "3d" : "poster");
    };
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(load, { timeout: 1200 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(load, 300);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const hero = root.current?.closest("[data-hero]");
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry?.isIntersecting ?? true),
    );
    observer.observe(hero);
    const onPointer = (event: PointerEvent) => {
      input.current.pointerX = (event.clientX / window.innerWidth) * 2 - 1;
      input.current.pointerY = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  useGSAP(
    () => {
      const hero = root.current?.closest<HTMLElement>("[data-hero]");
      if (!hero) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        ScrollTrigger.create({
          trigger: hero,
          start: "top top",
          end: "bottom top",
          onUpdate: (self) => {
            input.current.scroll = self.progress;
          },
        });
        const tl = gsap.timeline({
          scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub },
        });
        tl.to(
          hero.querySelector("[data-hero-wordmark]"),
          { yPercent: -18, scale: 1.12, opacity: 0.15, ease: "none" },
          0,
        ).to(hero.querySelectorAll("[data-hero-fade]"), { y: -60, opacity: 0, ease: "none" }, 0);
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} aria-hidden className="pointer-events-none absolute inset-0">
      {mode === "3d" && (
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-[1600ms] ease-out-expo",
            ready ? "opacity-100" : "opacity-0",
          )}
        >
          <HeroScene
            input={input}
            active={visible}
            animate={!reduceMotion}
            mobile={mobile}
            onReady={() => setReady(true)}
          />
        </div>
      )}
      {mode === "poster" && (
        <div className="absolute inset-0 grid place-items-center">
          <TemporaryApexMark className="w-[min(46vw,520px)] drop-shadow-[0_0_80px_rgb(31_123_255/0.45)]" />
        </div>
      )}
    </div>
  );
}
