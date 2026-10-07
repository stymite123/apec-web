"use client";

import { useRef } from "react";

import { gsap, MOTION_OK, useGSAP } from "@/lib/gsap";
import { scrub } from "@/lib/motion";

/**
 * Giant dim wordmark that fills with the brand gradient as you reach the
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

  const word =
    "block font-display text-[clamp(5rem,27vw,26rem)] leading-[0.8] font-bold tracking-[-0.04em]";

  return (
    <div ref={ref} aria-hidden className="container-site overflow-hidden pt-10 select-none">
      <div className="relative">
        {/* Dim fill, not a stroke: the variable font's overlapping contours show through text-stroke. */}
        <span className={`${word} text-navy-800`}>{text}</span>
        <div data-fill-mask className="absolute inset-0 overflow-hidden">
          <span data-fill-text className={`${word} text-grad-brand`}>
            {text}
          </span>
        </div>
      </div>
    </div>
  );
}
