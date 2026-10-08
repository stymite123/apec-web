import Link from "next/link";

import { CharLight } from "@/components/motion/CharLight";
import { HeroStage } from "@/components/sections/HeroStage";
import { site } from "@/content/site";

/**
 * Hero in the GSAP Field rhythm (Mustafa's chosen reference, DECISIONS 2026-10-08):
 * stacked display serif top-left, mono captions along the bottom edge, the
 * pre-rendered APEC mark with its blue aura as the "media". It stays put
 * (sticky) while the next panel slides over it.
 * Load sequence (CSS only, no JS wait): characters light up → mark + aura rise in →
 * nav boxes drop in → captions.
 */
export function Hero() {
  const { lines, accent } = site.headline;
  // The accent word (in the last line) is set in pinkish-red italic.
  const runs = lines.map((line, index) => {
    const at = index === lines.length - 1 ? line.indexOf(accent) : -1;
    if (at < 0) return [{ text: line }];
    return [
      { text: line.slice(0, at) },
      { text: accent, em: true, className: "[--g-from:#f8b4c4] [--g-to:#c8325a]" },
      { text: line.slice(at + accent.length) },
    ].filter((run) => run.text);
  });
  const [primary, secondary] = site.heroCtas;

  return (
    <section
      data-hero
      aria-labelledby="hero-title"
      className="sticky top-0 isolate -mt-(--nav-height) h-svh min-h-[600px] overflow-hidden bg-void"
    >
      {/* Blackish-red counterweight to the blue aura, low and to the left. Static. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-1/4 -left-1/4 size-[80vmax] bg-[radial-gradient(closest-side,rgb(150_32_62/0.38),transparent)] md:-left-[12%] md:size-[60vmax]"
      />

      <HeroStage />

      {/* Keeps the title and captions readable where they cross the aura. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-void via-void/70 to-transparent"
      />

      <h1
        id="hero-title"
        data-hero-title
        className="absolute top-[calc(var(--nav-height)+1.25rem)] left-4 font-field text-[clamp(2.9rem,7.6vw,8rem)] leading-[0.86] font-normal tracking-[-0.035em] text-brand-300 [font-variation-settings:'opsz'_72] md:left-6"
      >
        <CharLight
          label={lines.join(" ")}
          lines={runs}
          charClassName="text-grad"
          lineClassNames={[
            "[--g-from:#c9ecff] [--g-to:#7fd0ff]",
            "[--g-from:#7fd0ff] [--g-to:#4aaeff]",
            "[--g-from:#4aaeff] [--g-to:#2a86ff]",
            "[--g-from:#2a86ff] [--g-to:#1a64e0]",
          ]}
        />
      </h1>

      {/* Bottom edge: CTAs (left), disciplines + location (centre), tagline (right). */}
      <div
        data-hero-fade
        className="absolute inset-x-0 bottom-0 grid gap-5 px-4 pb-4 md:grid-cols-[1fr_auto_1fr] md:items-end md:px-6 md:pb-6"
      >
        <div className="field-rise flex w-fit items-center gap-1.5 rounded-md border border-grey-800 bg-grey-900/90 p-1.5 [--d:1.5s]">
          {primary && (
            <Link
              href={primary.href}
              className="inline-flex h-9 items-center rounded-[5px] bg-linear-to-b from-white to-grey-300 px-4 text-sm font-medium text-void transition-[filter] hover:brightness-110"
            >
              {primary.label}
            </Link>
          )}
          {secondary && (
            <Link
              href={secondary.href}
              className="inline-flex h-9 items-center rounded-[5px] px-4 text-sm font-medium text-silver-100 transition-colors hover:bg-grey-800"
            >
              {secondary.label}
            </Link>
          )}
        </div>
        <p className="field-rise label-mono text-[11px] text-grey-300 [--d:1.6s] md:text-center md:whitespace-nowrap">
          {site.heroCaption}
          <br />
          {site.location}.
        </p>
        <p className="field-rise hidden items-center justify-end gap-2 label-mono text-[11px] text-rose-300 [--d:1.7s] md:flex">
          {site.tagline}
          <span
            aria-hidden
            className="inline-block size-2 rotate-45 bg-linear-to-br from-rose-300 to-rose-600"
          />
        </p>
      </div>
    </section>
  );
}
