import { useId } from "react";

import { cn } from "@/lib/utils";

/*
 * TEMPORARY — replace with designer SVG (brief §6.1).
 *
 * Rough hand trace of references/brand/apec-logo-source.jpeg for development only.
 * Do not use for the favicon, OG images or any exported asset (DECISIONS 2026-10-07).
 * Parts are addressable via data-part for later animation work:
 * left-stroke, right-stroke, bar-1, bar-2, bar-3, swoosh.
 */

type TemporaryApexMarkProps = {
  className?: string;
  /** Accessible name. Omit when the mark sits next to visible brand text. */
  title?: string;
};

export function TemporaryApexMark({ className, title }: TemporaryApexMarkProps) {
  const id = useId();
  const silver = `${id}-silver`;
  const brand = `${id}-brand`;

  return (
    <svg
      viewBox="120 150 1000 860"
      className={cn("h-auto w-10", className)}
      data-temporary-logo="true"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <defs>
        <linearGradient id={silver} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" style={{ stopColor: "white" }} />
          <stop offset="55%" style={{ stopColor: "var(--color-silver-300)" }} />
          <stop offset="100%" style={{ stopColor: "var(--color-steel-400)" }} />
        </linearGradient>
        <linearGradient id={brand} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" style={{ stopColor: "var(--color-brand-300)" }} />
          <stop offset="45%" style={{ stopColor: "var(--color-brand-500)" }} />
          <stop offset="100%" style={{ stopColor: "var(--color-brand-700)" }} />
        </linearGradient>
      </defs>

      <polygon
        data-part="left-stroke"
        points="640,172 712,293 330,955 200,955"
        fill={`url(#${silver})`}
      />
      <polygon
        data-part="right-stroke"
        points="720,318 1080,945 940,945 652,435"
        fill={`url(#${brand})`}
      />
      <polygon data-part="bar-1" points="480,800 535,778 535,895 480,915" fill={`url(#${brand})`} />
      <polygon data-part="bar-2" points="562,722 618,700 618,872 562,890" fill={`url(#${brand})`} />
      <polygon data-part="bar-3" points="645,640 705,615 705,850 645,865" fill={`url(#${brand})`} />
      <path
        data-part="swoosh"
        d="M140,985 C450,990 800,880 1040,720 C1090,680 1060,630 960,610 C1040,650 1050,690 1000,725 C780,870 450,960 140,985 Z"
        fill={`url(#${brand})`}
      />
    </svg>
  );
}
