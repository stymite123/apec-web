import Image from "next/image";

import { CharLight } from "@/components/motion/CharLight";
import { HeroStage } from "@/components/sections/HeroStage";
import { ShapeLink } from "@/components/ui/shape-link";
import { site } from "@/content/site";

/** The headline's four lines read as two on wider screens: "Agency for Professionals," / … */
function pairs(lines: string[]) {
  const half = Math.ceil(lines.length / 2);
  return [lines.slice(0, half).join(" "), lines.slice(half).join(" ")].filter(Boolean);
}

/**
 * Ridge artwork: scaled by width and anchored to the bottom, so peaks are never
 * cropped; on narrow screens a minimum height crops the sides instead.
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
        className="h-auto min-h-[180px] w-full object-cover object-bottom"
      />
    </div>
  );
}

/**
 * Night: the start of the climb. Stars, two cel-shaded ridges and the APEC mark
 * rising behind them. Copy sits in one column (title, line, actions), sized by the
 * smaller of width and height so it never runs into the scenery.
 * The hero stays put (sticky) while the dawn panel slides over.
 */
export function Hero() {
  const { lines } = site.headline;
  const [meet, start] = site.heroCtas;

  return (
    <section
      data-hero
      aria-labelledby="hero-title"
      className="sticky top-0 isolate -mt-(--nav-height) h-svh min-h-[620px] overflow-hidden bg-night-900"
    >
      {/* Night sky and stars: one opaque bitmap. */}
      <div aria-hidden className="absolute inset-0">
        <Image src="/art/night-sky.webp" alt="" fill priority className="object-cover" />
      </div>

      <HeroStage />

      {/* The far ridge art runs deep below its peaks, so lifting it never opens a gap. */}
      <Ridge
        src="/art/night-ridge-far.webp"
        depth={0.4}
        height={640}
        className="bottom-[min(0px,calc(9svh-9.7vw))]"
      />
      <Ridge src="/art/night-ridge-near.webp" depth={0.75} height={420} className="-bottom-[4%]" />

      <div
        data-hero-copy
        className="absolute inset-x-0 top-[calc(var(--nav-height)+2.5rem)] flex flex-col items-start gap-5 px-5 md:top-[calc(var(--nav-height)+min(4.5rem,9svh))] md:gap-7 md:px-12"
      >
        <h1
          id="hero-title"
          data-hero-title
          className="text-[clamp(2.25rem,min(4.8vw,8.4svh),5.25rem)] leading-[1.06] font-semibold tracking-[-0.03em] text-star [font-stretch:94%]"
        >
          <CharLight
            label={lines.join(" ")}
            lines={pairs(lines).map((text) => [{ text }])}
            lineClassNames={["max-md:whitespace-normal", "max-md:whitespace-normal"]}
          />
        </h1>
        <div data-hero-fade className="flex max-w-2xl flex-col items-start gap-6">
          <p className="field-rise max-w-[48ch] text-[clamp(1.0625rem,1.35vw,1.375rem)] leading-relaxed text-star/70 [--d:1.2s]">
            {site.subheadline}
          </p>
          <div className="field-rise flex flex-wrap items-center gap-3 [--d:1.35s]">
            {start && (
              <ShapeLink href={start.href} className="h-13 px-8 text-[16px]">
                {start.label}
              </ShapeLink>
            )}
            {meet && (
              <ShapeLink
                href={meet.href}
                variant="outline"
                fill="var(--color-star)"
                className="h-13 px-8 text-[16px]"
              >
                {meet.label}
              </ShapeLink>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
