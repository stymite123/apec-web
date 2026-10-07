"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { gsap, MOTION_OK, useGSAP } from "@/lib/gsap";
import { scrub } from "@/lib/motion";

/** Offline 3D renderer â€” only loaded with `?render-mark` (pnpm render:mark). */
const HeroScene = dynamic(() => import("@/components/three/HeroScene"), { ssr: false });

/** Pre-rendered from the 3D scene by `pnpm render:mark`. TEMPORARY: based on the logo trace. */
const ARTWORK = "/brand/apex-mark-render.png";

/**
 * Client half of the hero. Visitors get pre-rendered artwork (no WebGL on load,
 * DECISIONS 2026-10-08); motion is transform/opacity only: entrance + float (CSS),
 * pointer tilt (desktop) and scroll drift (GSAP, native scrolling).
 */
export function HeroStage() {
  const root = useRef<HTMLDivElement>(null);
  const art = useRef<HTMLDivElement>(null);
  const [renderMode, setRenderMode] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("render-mark")) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-off tooling switch
      setRenderMode(true);
    }
  }, []);

  useGSAP(
    () => {
      const hero = root.current?.closest<HTMLElement>("[data-hero]");
      const target = art.current;
      if (!hero || !target) return;
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        gsap
          .timeline({
            scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub },
          })
          .to(target, { yPercent: -16, scale: 0.9, opacity: 0.25, ease: "none" }, 0)
          .to(
            hero.querySelector("[data-hero-wordmark]"),
            { yPercent: -18, opacity: 0.15, ease: "none" },
            0,
          )
          .to(hero.querySelectorAll("[data-hero-fade]"), { y: -60, opacity: 0, ease: "none" }, 0);
      });

      // Pointer tilt: desktop with a fine pointer only.
      mm.add(`${MOTION_OK} and (hover: hover) and (pointer: fine)`, () => {
        const tilt = target.querySelector<HTMLElement>("[data-art-tilt]");
        if (!tilt) return;
        const toX = gsap.quickTo(tilt, "x", { duration: 0.9, ease: "power3.out" });
        const toY = gsap.quickTo(tilt, "y", { duration: 0.9, ease: "power3.out" });
        const toR = gsap.quickTo(tilt, "rotation", { duration: 0.9, ease: "power3.out" });
        const onMove = (event: PointerEvent) => {
          const nx = (event.clientX / window.innerWidth) * 2 - 1;
          const ny = (event.clientY / window.innerHeight) * 2 - 1;
          toX(nx * 14);
          toY(ny * 10);
          toR(nx * 1.5);
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        return () => window.removeEventListener("pointermove", onMove);
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  if (renderMode) {
    return (
      <div aria-hidden className="absolute inset-0" data-render-mark>
        <HeroScene onReady={() => performance.mark("render-mark:ready")} />
      </div>
    );
  }

  return (
    <div ref={root} aria-hidden className="pointer-events-none absolute inset-0">
      {/* Blend on the outermost wrapper: inner transform layers are isolated, so a blend
          set there couldn't reach the wordmark behind. `lighten` lets the artwork's dark
          backdrop disappear over the page. */}
      <div className="absolute top-[calc(var(--nav-height)+0.5rem)] left-1/2 w-[min(108vw,520px)] -translate-x-1/2 mix-blend-lighten md:top-1/2 md:right-[-3%] md:left-auto md:w-[min(56vw,860px)] md:translate-x-0 md:-translate-y-1/2">
        <div ref={art} className="will-change-transform">
          <div data-art-tilt>
            <div className="animate-mark-in">
              <div className="animate-float">
                <Image
                  src={ARTWORK}
                  alt=""
                  width={1600}
                  height={1600}
                  sizes="(min-width: 768px) 56vw, 108vw"
                  className="h-auto w-full [mask-image:radial-gradient(closest-side,black_64%,transparent)]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
