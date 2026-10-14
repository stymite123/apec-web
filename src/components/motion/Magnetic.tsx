"use client";

import { useRef, type ReactNode } from "react";

import { gsap, MOTION_OK, useGSAP } from "@/lib/gsap";

/** Pulls its child toward the pointer when it is near (desktop, fine pointer only). */
export function Magnetic({
  children,
  strength = 0.35,
}: {
  children: ReactNode;
  strength?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(`${MOTION_OK} and (hover: hover) and (pointer: fine)`, () => {
        const toX = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" });
        const toY = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" });
        const move = (event: PointerEvent) => {
          const box = el.getBoundingClientRect();
          toX((event.clientX - (box.left + box.width / 2)) * strength);
          toY((event.clientY - (box.top + box.height / 2)) * strength);
        };
        const leave = () => {
          gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.4)", overwrite: true });
        };
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", leave);
        return () => {
          el.removeEventListener("pointermove", move);
          el.removeEventListener("pointerleave", leave);
        };
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <span ref={ref} className="-m-3 inline-block p-3">
      {children}
    </span>
  );
}
