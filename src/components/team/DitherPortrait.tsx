import Image from "next/image";

/** Dither levels generated at build time by `pnpm dither` (scripts/dither-portraits.mjs). */
const LEVELS = [0, 1, 2] as const;

const ditherSrc = (photo: string, level: number) =>
  photo.replace("/team/", "/team/dither/").replace(/\.jpg$/, `-${level}.png`);

/**
 * Portrait that resolves from coarse dither → fine dither → photo as the CSS
 * variable `--resolve` goes 0 → 1 (set by the parent's ScrollTrigger).
 * Default `--resolve: 1` shows the photo (no JS, reduced motion).
 * The dither images are pre-rendered (no browser-side image processing) and
 * layer opacities are pure CSS math on one variable — opacity only.
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
      {LEVELS.map((level) => (
        <Image
          key={level}
          src={ditherSrc(src, level)}
          alt=""
          aria-hidden
          fill
          unoptimized
          data-level={level}
          className="dither-layer"
        />
      ))}
    </div>
  );
}
