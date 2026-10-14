"use client";

import { useRef } from "react";

import { gsap, MOTION_OK, useGSAP } from "@/lib/gsap";
import { scrub } from "@/lib/motion";

/**
 * Giant dim wordmark that fills star-white (with an apricot foot) as you reach the
 * bottom (brief §6.6 #8). The fill is revealed with two opposing translateY
 * transforms (no clip-path); fully filled with reduced motion or without JS.
 */
export function FooterWordmark({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: ref.current,
              start: "top bottom",
              end: "bottom bottom",
              scrub,
            },
          })
          .fromTo("[data-fill-mask]", { yPercent: 100 }, { yPercent: 0, ease: "none" }, 0)
          .fromTo("[data-fill-text]", { yPercent: -100 }, { yPercent: 0, ease: "none" }, 0);
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  const word = "type-display block text-center text-[clamp(7rem,44vw,44rem)] leading-[0.78]";

  return (
    <div ref={ref} aria-hidden className="overflow-hidden pt-16 select-none">
      <div className="relative">
        {/* Dim fill, not a stroke: the variable font's overlapping contours show through text-stroke. */}
        <span className={`${word} text-night-800`}>{text}</span>
        <div data-fill-mask className="absolute inset-0 overflow-hidden">
          <span
            data-fill-text
            className={`${word} bg-[linear-gradient(180deg,var(--color-star)_0%,var(--color-night-300)_62%,var(--color-apricot)_100%)] bg-clip-text text-transparent`}
          >
            {text}
          </span>
        </div>
      </div>
    </div>
  );
}
