"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { gsap, MOTION_OK, useGSAP } from "@/lib/gsap";
import { scrub } from "@/lib/motion";

import type { RenderLayer } from "@/components/three/HeroScene";

/** Offline 3D renderer: only loaded with `?render-mark` (pnpm render:layers). */
const HeroScene = dynamic(() => import("@/components/three/HeroScene"), { ssr: false });

/**
 * Pre-rendered from the 3D scene by `pnpm render:layers` (TEMPORARY: based on the logo trace):
 * the mark as a transparent image, and its morphing aura as a seamless video loop.
 */
const MARK = "/brand/apex-mark-layer.png";
const AURA = {
  webm: "/brand/apex-aura.webm",
  mp4: "/brand/apex-aura.mp4",
  poster: "/brand/apex-aura-poster.jpg",
};

/**
 * Client half of the hero. Visitors get pre-rendered artwork (no WebGL on load,
 * DECISIONS 2026-10-08): a transparent mark over a looping aura video. Motion is the
 * video plus transform/opacity: entrance + float (CSS), pointer tilt with aura parallax
 * (desktop) and recede-on-cover (GSAP scrub, native scrolling).
 */
export function HeroStage() {
  const root = useRef<HTMLDivElement>(null);
  const art = useRef<HTMLDivElement>(null);
  const aura = useRef<HTMLVideoElement>(null);
  const [renderMode, setRenderMode] = useState<RenderLayer | null>(null);

  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("render-mark");
    if (param !== null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-off tooling switch
      setRenderMode(param === "mark" || param === "aura" ? param : "all");
    }
  }, []);

  useGSAP(
    () => {
      const hero = root.current?.closest<HTMLElement>("[data-hero]");
      const target = art.current;
      if (!hero || !target) return;
      const mm = gsap.matchMedia();

      // As the next panel slides over the (sticky) hero, the hero recedes.
      const cover = hero.parentElement?.querySelector<HTMLElement>("[data-cover]");
      mm.add(MOTION_OK, () => {
        if (!cover) return;
        gsap
          .timeline({
            scrollTrigger: { trigger: cover, start: "top bottom", end: "top top", scrub },
          })
          .to(target, { yPercent: -12, scale: 0.88, opacity: 0.3, ease: "none" }, 0)
          .to(
            hero.querySelector("[data-hero-title]"),
            { yPercent: -14, opacity: 0.25, ease: "none" },
            0,
          )
          .to(hero.querySelectorAll("[data-hero-fade]"), { y: -40, opacity: 0, ease: "none" }, 0);
      });

      // The aura loop plays unless the visitor prefers reduced motion (then: still poster).
      mm.add(MOTION_OK, () => {
        const video = aura.current;
        if (!video) return;
        video.play().catch(() => {});
        return () => video.pause();
      });

      // Pointer tilt: desktop with a fine pointer only.
      mm.add(`${MOTION_OK} and (hover: hover) and (pointer: fine)`, () => {
        const tilt = target.querySelector<HTMLElement>("[data-art-tilt]");
        if (!tilt) return;
        const toX = gsap.quickTo(tilt, "x", { duration: 0.9, ease: "power3.out" });
        const toY = gsap.quickTo(tilt, "y", { duration: 0.9, ease: "power3.out" });
        const toR = gsap.quickTo(tilt, "rotation", { duration: 0.9, ease: "power3.out" });
        const shift = target.querySelector<HTMLElement>("[data-aura-shift]");
        const auraX = shift && gsap.quickTo(shift, "x", { duration: 1.4, ease: "power3.out" });
        const auraY = shift && gsap.quickTo(shift, "y", { duration: 1.4, ease: "power3.out" });
        const onMove = (event: PointerEvent) => {
          const nx = (event.clientX / window.innerWidth) * 2 - 1;
          const ny = (event.clientY / window.innerHeight) * 2 - 1;
          toX(nx * 14);
          toY(ny * 10);
          toR(nx * 1.5);
          auraX?.(nx * 18);
          auraY?.(ny * 14);
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
        <HeroScene layer={renderMode} onReady={() => performance.mark("render-mark:ready")} />
      </div>
    );
  }

  return (
    <div ref={root} aria-hidden className="pointer-events-none absolute inset-0">
      {/* Blend on the outermost wrapper: inner transform layers are isolated, so a blend
          set there couldn't reach the wordmark behind. `lighten` lets the artwork's dark
          backdrop disappear over the page. */}
      <div className="absolute top-[50%] left-1/2 w-[min(108vw,560px)] -translate-x-1/2 -translate-y-1/2 mix-blend-lighten md:top-[52%] md:right-[-2%] md:left-auto md:w-[min(58vw,900px)] md:translate-x-0">
        <div ref={art} className="will-change-transform">
          <div data-art-tilt>
            <div className="animate-mark-in [animation-delay:0.85s] [animation-duration:1.8s]">
              <div className="relative animate-float [mask-image:radial-gradient(closest-side,black_64%,transparent)]">
                {/* The aura moves on its own (video, GPU-decoded) and a little more than
                    the mark under the pointer, for depth. */}
                <div data-aura-shift className="absolute inset-0">
                  <video
                    ref={aura}
                    muted
                    loop
                    playsInline
                    preload="auto"
                    poster={AURA.poster}
                    className="size-full"
                  >
                    <source src={AURA.webm} type="video/webm" />
                    <source src={AURA.mp4} type="video/mp4" />
                  </video>
                </div>
                <Image
                  src={MARK}
                  alt=""
                  width={1600}
                  height={1600}
                  priority
                  sizes="(min-width: 768px) 58vw, 108vw"
                  className="relative h-auto w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
