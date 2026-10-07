"use client";

import { useRef, type ReactNode } from "react";

import { gsap, MOTION_OK, SplitText, useGSAP } from "@/lib/gsap";
import { duration, gsapEase, stagger } from "@/lib/motion";

type SplitRevealProps = {
  as?: "h2" | "h3" | "p";
  id?: string;
  className?: string;
  children: ReactNode;
};

/**
 * Masked line reveal on scroll (brief §6.6 #3). Text is server-rendered and
 * fully visible without JS or with reduced motion. Not for the hero h1 (LCP).
 */
export function SplitReveal({ as: Tag = "h2", id, className, children }: SplitRevealProps) {
  const ref = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const split = SplitText.create(el, {
          type: "lines",
          mask: "lines",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 110,
              duration: duration.reveal,
              ease: gsapEase.outExpo,
              stagger,
              scrollTrigger: { trigger: el, start: "top 88%", once: true },
            }),
        });
        return () => split.revert();
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} id={id} className={className}>
      {children}
    </Tag>
  );
}
