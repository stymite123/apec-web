"use client";

import { useEffect, useRef } from "react";

const format = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * A demo price that drifts while its stage is on screen (`[data-play]` on the
 * nearest `.showcase`). Text-only updates; still under reduced motion.
 */
export function LivePrice({ base, className }: { base: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const stage = el.closest(".showcase");
    let value = base;
    const id = window.setInterval(() => {
      if (!stage?.hasAttribute("data-play")) return;
      const step = (Math.random() - 0.47) * base * 0.0009;
      value = Math.max(base * 0.97, Math.min(base * 1.03, value + step));
      el.textContent = format(value);
      el.dataset.dir = step >= 0 ? "up" : "down";
    }, 1100);
    return () => window.clearInterval(id);
  }, [base]);

  return (
    <span ref={ref} className={className}>
      {format(base)}
    </span>
  );
}
