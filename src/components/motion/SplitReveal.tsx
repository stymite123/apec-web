"use client";

import { useRef, type ReactNode } from "react";

import { gsap, MOTION_OK, SplitText, useGSAP } from "@/lib/gsap";
import { whenIdle } from "@/lib/idle";
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
      // Section titles sit below the fold: split them when the main thread is idle.
      const cancel = whenIdle(() =>
        mm.add(MOTION_OK, () => {
          const split = SplitText.create(el, {
            type: "lines",
            mask: "lines",
            // Gradient titles: each line paints its own (vertical) gradient.
            linesClass: className?.includes("text-grad") ? "text-grad" : undefined,
            autoSplit: true,
            onSplit: (self) => {
              // The lines paint the gradient now; the title itself must not (ghost copy).
              if (self.lines[0]?.classList.contains("text-grad")) {
                el.classList.add("text-grad-split");
              }
              return gsap.from(self.lines, {
                yPercent: 110,
                duration: duration.reveal,
                ease: gsapEase.outExpo,
                stagger,
                scrollTrigger: { trigger: el, start: "top 88%", once: true },
              });
            },
          });
          return () => {
            split.revert();
            el.classList.remove("text-grad-split");
          };
        }),
      );
      return () => {
        cancel();
        mm.revert();
      };
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} id={id} className={className}>
      {children}
    </Tag>
  );
}
