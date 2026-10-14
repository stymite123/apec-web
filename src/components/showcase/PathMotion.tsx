"use client";

import { useEffect, useRef } from "react";

/**
 * Moves its dot along an SVG path with a transform animation (Web Animations API),
 * which the compositor runs without the main thread — unlike `offset-distance` or SMIL.
 * Paused while off screen; under reduced motion it rests part-way along the path.
 * Coordinates are the containing block's pixels; centre the dot with negative margins.
 */
export function PathMotion({
  d,
  duration,
  delay = 0,
  rotate = false,
  className,
}: {
  d: string;
  /** Seconds per run. */
  duration: number;
  delay?: number;
  /** Turn to face the direction of travel (for an arrow pointing up). */
  rotate?: boolean;
  className?: string;
}) {
  const dot = useRef<HTMLSpanElement>(null);
  const path = useRef<SVGPathElement>(null);

  useEffect(() => {
    const el = dot.current;
    const line = path.current;
    if (!el || !line) return;
    const total = line.getTotalLength();
    const steps = 32;
    const frames = Array.from({ length: steps + 1 }, (_, i) => {
      const at = (total * i) / steps;
      const p = line.getPointAtLength(at);
      const q = line.getPointAtLength(Math.min(total, at + 1));
      const angle = (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI + 90;
      return { transform: `translate(${p.x}px, ${p.y}px)${rotate ? ` rotate(${angle}deg)` : ""}` };
    });
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.transform = frames[Math.round(steps * 0.45)]!.transform;
      return;
    }
    const animation = el.animate(frames, {
      duration: duration * 1000,
      delay: delay * 1000,
      iterations: Infinity,
      easing: "linear",
    });
    animation.pause();
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) animation.play();
      else animation.pause();
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      animation.cancel();
    };
  }, [d, duration, delay, rotate]);

  return (
    <>
      <svg aria-hidden className="pointer-events-none absolute size-0 overflow-hidden">
        <path ref={path} d={d} />
      </svg>
      <span ref={dot} aria-hidden className={className} />
    </>
  );
}
