import Link from "next/link";

import { TemporaryApexMark } from "@/components/brand/TemporaryApexMark";
import { Copy } from "@/components/dev/Todo";
import { buttonVariants } from "@/components/ui/button";
import { site } from "@/content/site";
import { shouldRender } from "@/lib/todo";
import { cn } from "@/lib/utils";

/**
 * Hero (brief §8.1 #2). The h1 is the LCP element, so it paints immediately;
 * only the supporting elements rise in (CSS, no JS). 3D mark arrives post-v1.
 */
export function Hero() {
  const { lead, accent, tail } = site.headline;
  const [primary, secondary] = site.heroCtas;

  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-1/4 right-[-20%] -z-10 aspect-square w-[80vw] max-w-[1100px] rounded-full bg-(image:--glow-navy) opacity-80 blur-2xl"
      />
      <div className="container-site grid min-h-[calc(100svh-var(--nav-height))] items-center gap-12 py-16 lg:grid-cols-12">
        <div className="flex flex-col gap-8 lg:col-span-8">
          {shouldRender(site.location) && (
            <p className="animate-rise label-mono text-steel-400">
              <Copy value={site.location} />
            </p>
          )}
          <h1
            id="hero-title"
            className="max-w-[12ch] font-display text-hero font-semibold text-silver-100"
          >
            {lead} <span className="text-grad-brand font-serif font-normal italic">{accent}</span>{" "}
            {tail}
          </h1>
          {shouldRender(site.subheadline) && (
            <p
              className="max-w-2xl animate-rise text-lg text-steel-300"
              style={{ animationDelay: "120ms" }}
            >
              <Copy value={site.subheadline} />
            </p>
          )}
          <div className="flex animate-rise flex-wrap gap-3" style={{ animationDelay: "220ms" }}>
            {primary && (
              <Link
                href={primary.href}
                className={cn(buttonVariants({ size: "lg" }), "h-12 rounded-full px-6 text-base")}
              >
                {primary.label}
              </Link>
            )}
            {secondary && (
              <Link
                href={secondary.href}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-12 rounded-full px-6 text-base",
                )}
              >
                {secondary.label}
              </Link>
            )}
          </div>
        </div>
        <div
          className="hidden animate-rise lg:col-span-4 lg:block"
          style={{ animationDelay: "320ms" }}
        >
          <TemporaryApexMark className="w-full drop-shadow-[0_0_60px_rgb(31_123_255/0.35)]" />
        </div>
      </div>
    </section>
  );
}
