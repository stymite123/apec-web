"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The portrait turns as you scroll: a strip of pre-rendered frames
 * (`pnpm frames` → public/portfolio/<slug>/f-NN.webp) drawn to a canvas, one frame per
 * step of the hero's scroll. Frames are decoded once, in order, after the first paint;
 * until a frame has arrived the nearest decoded one is drawn, so it never flickers.
 * Without JS the first frame shows as a plain image, and reduced motion keeps it still.
 */
export function FrameScrub({
  slug,
  count,
  alt,
  className,
}: {
  slug: string;
  count: number;
  alt: string;
  className?: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = canvas.current;
    const box = wrap.current;
    if (!el || !box) return;
    const context = el.getContext("2d", { alpha: false });
    if (!context) return;

    const frames: (HTMLImageElement | undefined)[] = new Array(count);
    let current = -1;
    let raf = 0;
    let stopped = false;

    /** The decoded frame at or before `index`, so an undecoded frame never blanks the canvas. */
    const nearest = (index: number) => {
      for (let i = index; i >= 0; i--) if (frames[i]) return frames[i];
      return frames.find(Boolean);
    };

    const paint = (index: number) => {
      const image = nearest(index);
      if (!image) return;
      if (el.width !== image.naturalWidth) {
        el.width = image.naturalWidth;
        el.height = image.naturalHeight;
      }
      context.drawImage(image, 0, 0, el.width, el.height);
    };

    const update = () => {
      raf = 0;
      const rect = box.getBoundingClientRect();
      // 0 while the hero fills the screen, 1 once it has scrolled away.
      const travel = rect.height + window.innerHeight;
      const progress = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / travel));
      const index = Math.min(count - 1, Math.round(progress * (count - 1)));
      if (index !== current) {
        current = index;
        paint(index);
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    // Decode in order so the early frames (the ones seen first) are ready soonest.
    const load = async () => {
      for (let i = 0; i < count; i++) {
        if (stopped) return;
        const image = new Image();
        image.src = `/portfolio/${slug}/f-${String(i).padStart(2, "0")}.webp`;
        try {
          await image.decode();
        } catch {
          continue;
        }
        frames[i] = image;
        if (i === 0) {
          paint(0);
          setReady(true);
        }
        if (i === current) paint(i);
      }
    };
    void load();

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    schedule();
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [slug, count]);

  return (
    <div ref={wrap} className={className}>
      {/* The first frame also stands in before the canvas is ready and without JS. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- one fixed, already-sized frame */}
      <img
        src={`/portfolio/${slug}/f-00.webp`}
        alt={alt}
        width={720}
        height={405}
        className={`size-full object-cover transition-opacity duration-500 ${ready ? "opacity-0" : "opacity-100"}`}
      />
      <canvas
        ref={canvas}
        aria-hidden
        className={`absolute inset-0 size-full object-cover transition-opacity duration-500 ${ready ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}
