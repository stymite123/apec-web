"use client";

import { useRef, type ReactNode } from "react";

import { gsap, MOTION_OK, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/**
 * Perspective stage for the CSS-3D device models. The rig rests at `rest` (degrees)
 * and leans toward the pointer (desktop, fine pointer). `data-play` is set while the
 * stage is on screen, so looping CSS animations inside (`.loop`) only run when seen.
 */
export function Stage3D({
  children,
  className,
  rest,
  range = 9,
}: {
  children: ReactNode;
  className?: string;
  rest: { x: number; y: number };
  range?: number;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      const rig = el?.querySelector<HTMLElement>("[data-rig]");
      if (!el || !rig) return;
      const observer = new IntersectionObserver(
        ([entry]) => el.toggleAttribute("data-play", Boolean(entry?.isIntersecting)),
        { rootMargin: "80px" },
      );
      observer.observe(el);

      const mm = gsap.matchMedia();
      mm.add(`${MOTION_OK} and (hover: hover) and (pointer: fine)`, () => {
        gsap.set(rig, { rotationX: rest.x, rotationY: rest.y });
        const toX = gsap.quickTo(rig, "rotationX", { duration: 1, ease: "power3.out" });
        const toY = gsap.quickTo(rig, "rotationY", { duration: 1, ease: "power3.out" });
        const move = (event: PointerEvent) => {
          const box = el.getBoundingClientRect();
          const nx = ((event.clientX - box.left) / box.width) * 2 - 1;
          const ny = ((event.clientY - box.top) / box.height) * 2 - 1;
          toX(rest.x - ny * range * 0.6);
          toY(rest.y + nx * range);
        };
        const leave = () => {
          toX(rest.x);
          toY(rest.y);
        };
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", leave);
        return () => {
          el.removeEventListener("pointermove", move);
          el.removeEventListener("pointerleave", leave);
        };
      });
      return () => {
        observer.disconnect();
        mm.revert();
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} className={cn("showcase relative [perspective:1800px]", className)}>
      <div
        data-rig
        className="relative size-full will-change-transform [transform-style:preserve-3d]"
        style={{ transform: `rotateX(${rest.x}deg) rotateY(${rest.y}deg)` }}
      >
        {children}
      </div>
    </div>
  );
}
