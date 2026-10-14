import Image from "next/image";
import type { ReactNode } from "react";

import { TemporaryApexMark } from "@/components/brand/TemporaryApexMark";
import { Stage3D } from "@/components/showcase/Stage3D";
import { showcase } from "@/content/showcase";
import { site } from "@/content/site";

const b = showcase.brand;

/** A piece hung in depth; on hover the pieces move further apart (--spread). */
function Piece({
  x,
  y,
  z,
  tilt,
  children,
}: {
  x: number;
  y: number;
  z: number;
  tilt: number;
  children: ReactNode;
}) {
  return (
    <div
      className="absolute transition-transform duration-700 ease-out-expo"
      style={{
        left: x,
        top: y,
        transform: `translateZ(calc(${z}px * var(--spread, 1))) rotateZ(${tilt}deg)`,
      }}
    >
      {children}
    </div>
  );
}

/** SVG art is served as is; photos and renders go through the image optimizer. */
function Art({ src, className }: { src: string; className?: string }) {
  return (
    <Image
      src={src}
      alt=""
      fill
      sizes="260px"
      unoptimized={src.endsWith(".svg")}
      className={className ?? "object-cover"}
    />
  );
}

/**
 * Brand and graphic design as a small exhibition: an anime-style poster (the site's
 * own dusk artwork), a realistic 3D render of the mark, the logo system and business
 * cards — all APEC's own identity, no client work implied.
 */
export function Gallery() {
  return (
    <Stage3D
      rest={{ x: 6, y: 15 }}
      className="h-[500px] w-[760px] [--spread:1] hover:[--spread:1.7]"
    >
      {/* Anime poster */}
      <Piece x={40} y={34} z={-10} tilt={-2.5}>
        <div className="w-[250px] bg-white p-[12px] shadow-[0_30px_50px_-20px_rgb(14_18_32/0.5)]">
          <div className="relative h-[316px] overflow-hidden bg-[linear-gradient(180deg,#22163a_0%,#6e3560_44%,#e08a66_78%,#f3c58e_100%)]">
            <Art src="/art/dusk-sky.webp" className="object-cover object-[30%_50%]" />
            <Art src="/art/dusk-far.webp" className="object-cover object-bottom" />
            <Art src="/art/dusk-mountain.webp" className="object-cover object-[64%_100%]" />
            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-[#1b1230]/80 to-transparent px-4 pt-12 pb-4">
              <p className="type-display text-[46px] leading-[0.85] text-[#f6cda3]">{b.poster}</p>
              <p className="mt-1 text-[9px] tracking-[0.02em] text-[#f6cda3]/80">{site.name}</p>
            </div>
          </div>
        </div>
      </Piece>

      {/* Realistic 3D render */}
      <Piece x={292} y={16} z={-110} tilt={2}>
        <div className="w-[230px] bg-[#111] p-[6px] shadow-[0_30px_50px_-20px_rgb(14_18_32/0.55)]">
          <div className="relative h-[300px] overflow-hidden bg-[#05060a]">
            <Art src="/brand/apex-aura-poster.jpg" className="object-cover" />
            <div className="absolute inset-[8%] mix-blend-lighten">
              <Art src="/brand/apex-mark-layer.png" className="object-contain" />
            </div>
            <p className="absolute bottom-3 left-3 rounded-full bg-black/50 px-2 py-0.5 text-[9px] text-white/80">
              {b.render}
            </p>
          </div>
        </div>
      </Piece>

      {/* Logo system */}
      <Piece x={500} y={92} z={40} tilt={3}>
        <div className="w-[230px] rounded-[14px] bg-white p-3 shadow-[0_34px_60px_-22px_rgb(14_18_32/0.55)]">
          <p className="px-1 pb-2 text-[10px] font-semibold text-ink">{b.logo}</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex aspect-square items-center justify-center rounded-[8px] bg-[#05060a]">
              <TemporaryApexMark className="w-[62%]" />
            </div>
            <div className="flex aspect-square items-center justify-center rounded-[8px] border border-black/10 bg-white">
              <TemporaryApexMark className="w-[62%]" color="#0e1220" />
            </div>
            <div className="flex aspect-square items-center justify-center rounded-[8px] bg-apricot">
              <TemporaryApexMark className="w-[62%]" color="#0b1233" />
            </div>
            <div className="flex aspect-square items-center justify-center rounded-[8px] bg-night-900">
              <span className="type-display text-[34px] text-star">{site.shortName}</span>
            </div>
          </div>
        </div>
      </Piece>

      {/* Business cards */}
      <Piece x={214} y={318} z={90} tilt={4}>
        <div className="h-[118px] w-[206px] rounded-[8px] bg-[#f4f4f2] p-4 shadow-[0_24px_40px_-16px_rgb(14_18_32/0.5)]">
          <p className="text-[12px] font-bold text-ink">{site.name}</p>
          <p className="mt-1 text-[9px] text-ink-600">{site.contact.email}</p>
          <p className="text-[9px] text-ink-600">{site.contact.phone}</p>
        </div>
      </Piece>
      <Piece x={252} y={352} z={150} tilt={-7}>
        <div className="flex h-[118px] w-[206px] items-center gap-3 rounded-[8px] bg-[#0b0c10] p-4 shadow-[0_30px_46px_-16px_rgb(14_18_32/0.6)]">
          <TemporaryApexMark className="w-12" />
          <div>
            <p className="type-display text-[26px] leading-none text-white">{site.shortName}</p>
            <p className="mt-1 text-[8.5px] text-white/60">{site.tagline}</p>
          </div>
        </div>
      </Piece>
    </Stage3D>
  );
}
