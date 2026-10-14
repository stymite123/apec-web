"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { scrub } from "@/lib/motion";

import type { RenderLayer } from "@/components/three/HeroScene";

/** Offline 3D renderer: only loaded with `?render-mark` (pnpm render:layers). */
const HeroScene = dynamic(() => import("@/components/three/HeroScene"), { ssr: false });

/**
 * Pre-rendered from the 3D scene by `pnpm render:layers` (TEMPORARY: based on the logo trace):
 * the mark as a transparent image over a still of its aura. The aura used to be a video
 * loop; decoding it under the blend layer cost frames on every scroll (DECISIONS
 * 2026-10-15), so it is a still that drifts with a composited transform instead.
 */
const MARK = "/brand/apex-mark-layer.png";
const AURA = "/brand/apex-aura.webp";

/**
 * Client half of the hero. Visitors get pre-rendered artwork (no WebGL on load,
 * DECISIONS 2026-10-08). Motion is transform/opacity only: entrance + float + aura drift
 * (CSS), pointer tilt with aura parallax (desktop) and recede-on-cover (GSAP scrub).
 */
export function HeroStage() {
  const root = useRef<HTMLDivElement>(null);
  const art = useRef<HTMLDivElement>(null);
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
          .to(target, { yPercent: 14, scale: 0.9, ease: "none" }, 0)
          .to(
            hero.querySelector("[data-hero-title]"),
            { yPercent: -14, opacity: 0.25, ease: "none" },
            0,
          )
          .to(hero.querySelectorAll("[data-hero-fade]"), { y: -40, opacity: 0, ease: "none" }, 0);
        // The mark sinks behind the ridges as dawn arrives.
        hero.querySelectorAll<HTMLElement>("[data-depth]").forEach((layer) => {
          const depth = Number(layer.dataset.depth);
          gsap.to(layer, {
            yPercent: depth * 10,
            ease: "none",
            scrollTrigger: { trigger: cover, start: "top bottom", end: "top top", scrub },
          });
        });
      });

      // Once the dawn panel covers the hero completely, stop drawing it until you
      // scroll back (the page behind then costs nothing).
      let covered = false;
      const setCovered = (value: boolean) => {
        covered = value;
        hero.style.visibility = value ? "hidden" : "";
      };
      const coverTrigger = cover
        ? ScrollTrigger.create({
            trigger: cover,
            start: "top top",
            onEnter: () => setCovered(true),
            onLeaveBack: () => setCovered(false),
          })
        : null;

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
        // Scenery parallax: nearer layers move more (data-depth 0–1).
        const layers = [...hero.querySelectorAll<HTMLElement>("[data-depth]")].map((layer) => ({
          depth: Number(layer.dataset.depth),
          x: gsap.quickTo(layer, "x", { duration: 1.2, ease: "power3.out" }),
        }));
        const onMove = (event: PointerEvent) => {
          if (covered) return;
          const nx = (event.clientX / window.innerWidth) * 2 - 1;
          const ny = (event.clientY / window.innerHeight) * 2 - 1;
          toX(nx * 14);
          toY(ny * 10);
          toR(nx * 1.5);
          auraX?.(nx * 18);
          auraY?.(ny * 14);
          layers.forEach((layer) => layer.x(nx * -36 * layer.depth));
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        return () => window.removeEventListener("pointermove", onMove);
      });

      return () => {
        coverTrigger?.kill();
        mm.revert();
      };
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
      <div className="absolute top-[78%] left-1/2 w-[min(62vw,380px)] -translate-x-1/2 -translate-y-1/2 md:top-[50%] md:right-[1%] md:left-auto md:w-[min(52vw,820px)] md:translate-x-0">
        <div ref={art} className="will-change-transform">
          <div data-art-tilt>
            <div className="animate-mark-in [animation-delay:0.85s] [animation-duration:1.8s]">
              <div className="relative animate-float [mask-image:radial-gradient(closest-side,black_64%,transparent)]">
                {/* The aura drifts on its own and a little more than the mark under the
                    pointer, for depth. */}
                <div data-aura-shift className="absolute inset-0">
                  <Image
                    src={AURA}
                    alt=""
                    fill
                    priority
                    sizes="(min-width: 768px) 52vw, 62vw"
                    className="animate-aura object-cover"
                  />
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
