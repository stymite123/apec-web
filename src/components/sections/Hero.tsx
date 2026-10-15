import Image from "next/image";
import type { CSSProperties } from "react";

import { HeroStage } from "@/components/sections/HeroStage";
import { ShapeLink } from "@/components/ui/shape-link";
import { site } from "@/content/site";

/**
 * Night horizon (Climb artwork), kept low and quiet: scaled by width, bottom-anchored,
 * pushed down so only the peaks show and the mark stays clear of it.
 */
function Ridge({
  src,
  className,
  depth,
  height,
}: {
  src: string;
  className: string;
  depth: number;
  height: number;
}) {
  return (
    <div aria-hidden data-depth={depth} className={`absolute -inset-x-[3%] ${className}`}>
      <Image
        src={src}
        alt=""
        width={2400}
        height={height}
        priority
        sizes="106vw"
        className="h-auto min-h-[150px] w-full object-cover object-bottom"
      />
    </div>
  );
}

/** One headline line; the accent word (approved: "Creatives") is set in rose italic. */
function Line({ text, accent, index }: { text: string; accent: string; index: number }) {
  const at = text.indexOf(accent);
  const style = { "--i": index } as CSSProperties;
  return (
    <span className="hero-line">
      <span style={style} className="text-grad [--g-from:#ffffff] [--g-to:#c3cad6]">
        {at < 0 ? (
          text
        ) : (
          <>
            {text.slice(0, at)}
            <em className="text-grad pr-[0.04em] italic [--g-from:#f6c3cf] [--g-to:#e0718b]">
              {accent}
            </em>
            {text.slice(at + accent.length)}
          </>
        )}
      </span>
    </span>
  );
}

/**
 * Night: the opening (Field composition on Climb's sky). Newsreader headline on the
 * left, lines revealed in sequence; the pre-rendered APEC mark with its blue aura on
 * the right; a restrained night horizon along the bottom. Phones: headline, copy and
 * actions first, the mark directly beneath. The hero stays put (sticky) while the
 * dawn panel slides over it. Opening sequence is CSS only (globals.css).
 */
export function Hero() {
  const { lines, accent } = site.headline;
  const [meet, start] = site.heroCtas;

  return (
    <section
      data-hero
      aria-labelledby="hero-title"
      className="sticky top-0 isolate -mt-(--nav-height) h-svh min-h-[560px] overflow-hidden bg-night-950"
    >
      {/* Night sky and stars: one opaque bitmap. */}
      <div aria-hidden className="absolute inset-0">
        <Image src="/art/night-sky.webp" alt="" fill priority className="object-cover" />
      </div>

      {/* Horizon: lowered so it frames the page without reaching the mark or the copy. */}
      <Ridge
        src="/art/night-ridge-far.webp"
        depth={0.4}
        height={640}
        className="-bottom-[6%] opacity-80 md:-bottom-[9%]"
      />
      <Ridge
        src="/art/night-ridge-near.webp"
        depth={0.75}
        height={420}
        className="-bottom-[10%] md:-bottom-[12%]"
      />

      <div className="relative z-10 mx-auto flex h-full max-w-[1440px] flex-col px-5 pt-[calc(var(--nav-height)+1.5rem)] md:block md:px-12 md:pt-[calc(var(--nav-height)+min(3.5rem,7svh))]">
        <div data-hero-copy className="md:max-w-[min(56%,780px)]">
          <h1
            id="hero-title"
            data-hero-title
            className="type-serif text-[clamp(2.6rem,min(6.4vw,10svh),7rem)] leading-[0.98]"
          >
            <span className="sr-only">{lines.join(" ")}</span>
            <span aria-hidden className="block">
              {lines.map((line, i) => (
                <Line key={line} text={line} accent={accent} index={i} />
              ))}
            </span>
          </h1>

          <div data-hero-fade className="mt-4 md:mt-[min(2.25rem,4svh)]">
            <p className="field-rise max-w-[44ch] text-[16px] leading-[1.55] text-star/75 [--d:0.5s] md:text-[clamp(1.0625rem,1.2vw,1.25rem)] md:leading-relaxed">
              {site.subheadline}
            </p>
            <div className="field-rise mt-5 flex flex-wrap items-center gap-2.5 [--d:0.6s] md:mt-6 md:gap-3">
              {start && (
                <ShapeLink href={start.href} className="max-md:px-5">
                  {start.label}
                </ShapeLink>
              )}
              {meet && (
                <ShapeLink href={meet.href} variant="outline" className="max-md:px-5">
                  {meet.label}
                </ShapeLink>
              )}
            </div>
            <p className="field-rise mt-4 type-ui text-[14px] text-night-300 [--d:0.7s] md:mt-5">
              {site.location}
            </p>
          </div>
        </div>

        {/* Phones: the mark takes the space left under the copy (md:contents keeps the
            desktop layout, where the stage positions itself against this container). */}
        <div className="relative flex min-h-0 flex-1 items-end justify-center pb-3 md:contents">
          <HeroStage />
        </div>

        {/* The tagline, quietly, above the horizon (desktop). */}
        <p className="field-rise absolute right-12 bottom-7 hidden type-ui text-[13px] tracking-[0.04em] text-star/55 [--d:0.8s] md:block">
          {site.tagline}
        </p>
      </div>
    </section>
  );
}
