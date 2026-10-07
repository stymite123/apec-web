"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import { perfOff } from "@/lib/perf-switches";

/** 4×4 Bayer matrix for ordered dithering. */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
/** Cell sizes (source px per dot), coarse → fine. */
const LEVELS = [14, 7, 3.5] as const;
/** Dot colour = silver-300 (canvas can't read CSS variables). */
const DOT: [number, number, number] = [197, 204, 214];

function dither(image: HTMLImageElement, cell: number) {
  const width = Math.max(1, Math.round(image.naturalWidth / cell));
  const height = Math.max(1, Math.round(image.naturalHeight / cell));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return canvas;
  ctx.drawImage(image, 0, 0, width, height);
  const data = ctx.getImageData(0, 0, width, height);
  const px = data.data;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const lum = (0.2126 * px[i]! + 0.7152 * px[i + 1]! + 0.0722 * px[i + 2]!) / 255;
      // Vignette centred on the face (upper middle) so busy, bright backgrounds fall away.
      const dx = (x / width - 0.5) * 1.7;
      const dy = (y / height - 0.4) * 1.25;
      const vignette = Math.max(0, 1 - (dx * dx + dy * dy));
      const contrasted = ((lum - 0.5) * 1.55 + 0.46) * (0.3 + 0.7 * vignette);
      const threshold = (BAYER[(y % 4) * 4 + (x % 4)]! + 0.5) / 16;
      const on = contrasted > threshold;
      px[i] = DOT[0];
      px[i + 1] = DOT[1];
      px[i + 2] = DOT[2];
      px[i + 3] = on ? 255 : 0;
    }
  }
  ctx.putImageData(data, 0, 0);
  return canvas;
}

/**
 * Portrait that resolves from coarse dither → fine dither → photo as the CSS
 * variable `--resolve` goes 0 → 1 (set by the parent's ScrollTrigger).
 * Default `--resolve: 1` shows the photo (no JS, reduced motion).
 * Layer opacities are pure CSS math on that one variable — opacity only.
 */
export function DitherPortrait({
  src,
  sizes,
  priority,
}: {
  src: string;
  sizes: string;
  priority?: boolean;
}) {
  const holder = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = holder.current;
    if (!el || perfOff("dither")) return;
    let cancelled = false;
    const image = new window.Image();
    image.decoding = "async";
    image.src = src;
    image.onload = () => {
      if (cancelled) return;
      const start = performance.now();
      el.replaceChildren(
        ...LEVELS.map((cell, index) => {
          const canvas = dither(image, cell);
          canvas.dataset.level = String(index);
          canvas.className = "dither-layer";
          return canvas;
        }),
      );
      performance.measure(`dither:${src}`, { start, end: performance.now() });
    };
    return () => {
      cancelled = true;
    };
  }, [src]);

  return (
    <div className="dither-portrait relative aspect-[4/5] overflow-hidden bg-void">
      <Image
        src={src}
        alt=""
        fill
        sizes={sizes}
        priority={priority}
        className="dither-photo object-cover object-top"
      />
      <div ref={holder} aria-hidden className="absolute inset-0" />
    </div>
  );
}
