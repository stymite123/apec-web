"use client";

import Image from "next/image";
import { useRef } from "react";

import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { scrub } from "@/lib/motion";

/**
 * The logo comes apart as you leave the hero (Mustafa's idea, DECISIONS 2026-10-29).
 * The four pieces are pre-rendered on one shared frame (`pnpm render:parts`), so at rest
 * they stack back into the whole mark:
 *   white stroke  rises and lands in the nav, leading the others
 *   swoosh        sweeps out across the screen, drawn like a blade
 *   blue stroke   shrinks to a star that drops into the next section
 *   bars          fade out under the swoosh
 * Transform and opacity only; the whole thing is tied to scroll position, so dragging
 * the scrollbar backwards puts the mark back together. Reduced motion keeps it whole.
 */
const PARTS = ["swoosh", "bars", "blue", "white"] as const;

export function MarkSplit() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const hero = el.closest<HTMLElement>("[data-hero]");
      const cover = hero?.parentElement?.querySelector<HTMLElement>("[data-cover]");
      if (!hero || !cover) return;
      const q = gsap.utils.selector(el);
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        const trigger = { trigger: cover, start: "top bottom", end: "top top", scrub };
        const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: trigger });

        // Three destinations (Mustafa 2026-10-29), each piece turning as it travels:
        //   white  → up through the middle and into the header
        //   swoosh → out until it covers the screen
        //   blue   → down to a point: the star that carries on into the next section
        tl.to(
          q("[data-part='white']"),
          {
            xPercent: -40,
            yPercent: -76,
            scale: 0.26,
            rotateX: 26,
            rotateZ: -12,
            duration: 1,
          },
          0,
        )
          .to(q("[data-part='white']"), { opacity: 0, duration: 0.14 }, 0.9)
          .to(
            q("[data-part='swoosh']"),
            {
              xPercent: -28,
              yPercent: 16,
              scale: 2.6,
              rotateY: -18,
              rotateZ: 6,
              opacity: 0,
              duration: 1,
            },
            0.16,
          )
          .to(
            q("[data-part='bars']"),
            { yPercent: 22, scale: 0.7, rotateY: 30, opacity: 0, duration: 0.6 },
            0.1,
          )
          .to(
            q("[data-part='blue']"),
            {
              xPercent: 10,
              yPercent: 24,
              scale: 0.1,
              rotateX: -30,
              opacity: 0,
              duration: 0.9,
            },
            0.22,
          );

        // The nav turns silver while the white piece arrives in it.
        const silver = ScrollTrigger.create({
          trigger: cover,
          start: "top 72%",
          onToggle: ({ isActive }) => document.body.toggleAttribute("data-mark-landed", isActive),
        });
        return () => {
          silver.kill();
          document.body.removeAttribute("data-mark-landed");
        };
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} aria-hidden className="absolute inset-0 [perspective:1400px]">
      {PARTS.map((part) => (
        <div
          key={part}
          data-part={part}
          className="absolute inset-0 will-change-transform [transform-style:preserve-3d]"
        >
          <Image
            src={`/brand/part-${part}.png`}
            alt=""
            fill
            priority
            sizes="(min-width: 768px) 44vw, 340px"
            className="object-contain"
          />
        </div>
      ))}
    </div>
  );
}
