"use client";

import { useId } from "react";

/**
 * Signature A: the blue orbit of the APEC mark, continued as separate prepared arcs that
 * read as one movement down the page (DECISIONS 2026-10-15):
 *   edge  — crosses the hero → dawn boundary as the dawn panel rises
 *   under — underlines "You get both."
 *   line  — settles into the straight line that introduces the five
 * Each is one small SVG stroke drawn with stroke-dashoffset (a measured, recorded
 * exception to transform/opacity). Resting state = fully drawn, so without JS or with
 * reduced motion the arcs simply show.
 */
const ARCS = {
  edge: {
    viewBox: "0 0 1000 300",
    d: "M990 18C935 120 790 214 600 246C420 276 210 258 12 196",
    width: 3,
  },
  under: {
    viewBox: "0 0 600 64",
    d: "M8 20C150 54 420 60 592 14",
    width: 3.5,
  },
  line: {
    viewBox: "0 0 600 40",
    d: "M2 36C60 36 92 5 176 4H598",
    width: 2.5,
  },
} as const;

export function OrbitArc({
  variant,
  className,
}: {
  variant: keyof typeof ARCS;
  className?: string;
}) {
  const { viewBox, d, width } = ARCS[variant];
  const id = `orbit-${useId().replace(/:/g, "")}`;
  const [, , w] = viewBox.split(" ").map(Number);
  return (
    <svg
      aria-hidden
      data-arc={variant}
      viewBox={viewBox}
      fill="none"
      className={className}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={w} y1="0" x2="0" y2="0">
          <stop offset="0%" stopColor="#7fe3ff" />
          <stop offset="55%" stopColor="#4a9bff" />
          <stop offset="100%" stopColor="#2a6ef0" />
        </linearGradient>
      </defs>
      <path
        d={d}
        pathLength={1}
        stroke={`url(#${id})`}
        strokeWidth={width}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        className="orbit-path"
      />
    </svg>
  );
}
