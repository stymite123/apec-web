"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Holds the portraits in their dither state until the row scrolls into view, then
 * flips once to `revealed` (globals.css `.team-row`: opacity crossfades only).
 * Without JS nothing is held back, so the photos simply show.
 */
export function TeamReveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.dataset.reveal = "pending";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        el.dataset.reveal = "done";
      },
      { rootMargin: "0px 0px -20% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <ol ref={ref} className={className}>
      {children}
    </ol>
  );
}
