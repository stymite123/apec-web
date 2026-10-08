"use client";

import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { whenIdle } from "@/lib/idle";

/**
 * Fills each nav box with the reader's progress through its section (GSAP Field nav).
 * Transform only: the fill slides in from the left while its dark label slides the
 * other way, so the text stays put and swaps colour exactly at the fill's edge.
 * Pages without the sections (member pages, 404) simply show empty boxes.
 */
export function NavProgress() {
  useGSAP(() => {
    const mm = gsap.matchMedia();
    // Below the fold: set up in its own idle-time task, not during hydration.
    const cancel = whenIdle(() => {
      mm.add(MOTION_OK, () => {
        for (const box of document.querySelectorAll<HTMLElement>("[data-nav-box]")) {
          const section = document.getElementById(box.dataset.navBox ?? "");
          const fill = box.querySelector<HTMLElement>("[data-nav-fill]");
          const label = box.querySelector<HTMLElement>("[data-nav-fill-label]");
          if (!section || !fill || !label) continue;
          ScrollTrigger.create({
            trigger: section,
            start: "top 60%",
            end: "bottom 60%",
            onUpdate: ({ progress }) => {
              gsap.set(fill, { xPercent: (progress - 1) * 100 });
              gsap.set(label, { xPercent: (1 - progress) * 100 });
            },
          });
        }
      });
    });
    return () => {
      cancel();
      mm.revert();
    };
  });

  return null;
}
