import Link from "next/link";

import { Copy } from "@/components/dev/Todo";
import { HeroStage } from "@/components/sections/HeroStage";
import { site } from "@/content/site";
import { shouldRender } from "@/lib/todo";

/**
 * Hero (brief §8.1 #2) in the reel-01 "meshwork × shader gradient" direction:
 * giant APEC wordmark, 3D mark + liquid glow in front, editorial corner text.
 * All text is server-rendered and visible at first paint (LCP); motion is layered on top.
 */
export function Hero() {
  const { lead, accent, tail } = site.headline;
  const [primary, secondary] = site.heroCtas;

  return (
    <section
      data-hero
      aria-labelledby="hero-title"
      className="relative isolate -mt-(--nav-height) h-svh min-h-[640px] overflow-hidden bg-void"
    >
      {/* Giant wordmark behind the 3D mark (meshwork "VANTA" move). */}
      <div aria-hidden className="absolute inset-0 grid place-items-center">
        <span
          data-hero-wordmark
          className="block font-display text-[31vw] leading-none font-bold tracking-[-0.045em] text-navy-800 select-none"
        >
          {site.shortName}
        </span>
      </div>

      <HeroStage />

      {/* Scrims keep the copy readable over the glow (brief §6.7). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-linear-to-t from-void via-void/75 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 hidden w-3/5 bg-linear-to-r from-void/85 via-void/40 to-transparent md:block"
      />

      {/* Top corners */}
      <div
        data-hero-fade
        className="absolute inset-x-0 top-(--nav-height) container-site flex items-start justify-between gap-6 pt-6 label-mono text-steel-400"
      >
        {shouldRender(site.expansion) && (
          <p className="max-w-[26ch]">
            <Copy value={site.expansion} />
          </p>
        )}
        {shouldRender(site.tagline) && (
          <p className="hidden text-right sm:block">
            <Copy value={site.tagline} />
          </p>
        )}
      </div>

      {/* Bottom: headline + CTAs left, meta right */}
      <div
        data-hero-fade
        className="absolute inset-x-0 bottom-0 container-site grid gap-8 pb-10 md:grid-cols-12 md:items-end md:pb-14"
      >
        <div className="md:col-span-7">
          <h1
            id="hero-title"
            className="font-display text-[clamp(2.6rem,5.4vw,5.5rem)] leading-[0.95] font-medium tracking-[-0.02em] text-silver-100"
          >
            {lead} <span className="font-serif font-normal text-brand-300 italic">{accent}</span>{" "}
            {tail}
          </h1>
          {shouldRender(site.subheadline) && (
            <p className="mt-5 max-w-xl text-steel-300">
              <Copy value={site.subheadline} />
            </p>
          )}
          <div className="mt-7 flex flex-wrap gap-3">
            {primary && (
              <Link
                href={primary.href}
                className="inline-flex h-12 items-center rounded-full bg-silver-100 px-6 text-sm font-medium text-void transition-colors hover:bg-white"
              >
                {primary.label}
              </Link>
            )}
            {secondary && (
              <Link
                href={secondary.href}
                className="inline-flex h-12 items-center rounded-full border border-steel-600 px-6 text-sm font-medium text-silver-100 transition-colors hover:border-silver-100"
              >
                {secondary.label}
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-end justify-between gap-4 label-mono text-steel-400 md:col-span-5 md:flex-col md:items-end">
          {shouldRender(site.location) && (
            <p>
              <Copy value={site.location} />
            </p>
          )}
          <p className="flex items-center gap-2">
            <span aria-hidden className="inline-block h-px w-10 bg-steel-600" />
            {site.labels.scrollCue}
          </p>
        </div>
      </div>
    </section>
  );
}
