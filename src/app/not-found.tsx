import type { Metadata } from "next";
import Link from "next/link";

import { TemporaryApexMark } from "@/components/brand/TemporaryApexMark";
import { buttonVariants } from "@/components/ui/button";
import { site } from "@/content/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: site.notFound.pageTitle,
};

/** Static 404 (brief §8.3). The falling-bars animation waits for the approved design. */
export default function NotFound() {
  const copy = site.notFound;

  return (
    <section className="container-site flex min-h-[calc(100svh-var(--nav-height))] flex-col items-start justify-center gap-8 py-24">
      <TemporaryApexMark className="w-24" />
      <p className="label-mono text-grey-400">{copy.eyebrow}</p>
      <h1 className="font-display text-h2 font-semibold text-silver-100">{copy.title}</h1>
      <Link
        href={copy.cta.href}
        className={cn(buttonVariants({ size: "lg" }), "h-12 rounded-full px-6 text-base")}
      >
        {copy.cta.label}
      </Link>
    </section>
  );
}
