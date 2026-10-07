"use client";

import { useRef } from "react";

import { gsap, MOTION_OK, SplitText, useGSAP } from "@/lib/gsap";
import { scrub } from "@/lib/motion";

/**
 * Manifesto words light up as you scroll (brief §8.1 #4). Opacity only;
 * fully lit with reduced motion or without JS.
 */
export function ScrubWords({ lines, className }: { lines: string[]; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const split = SplitText.create(el, { type: "words" });
        gsap.fromTo(
          split.words,
          { opacity: 0.18 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.1,
            scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub },
          },
        );
        return () => split.revert();
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <p ref={ref} className={className}>
      {lines.map((line, index) => (
        <span key={line} className="block">
          {line}
          {index < lines.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}
