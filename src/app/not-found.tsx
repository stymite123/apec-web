import type { Metadata } from "next";
import Image from "next/image";

import { ShapeLink } from "@/components/ui/shape-link";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: site.notFound.pageTitle,
};

/** 404 (brief §8.3): an empty night sky — no summit here. */
export default function NotFound() {
  const copy = site.notFound;

  return (
    <section className="relative isolate -mt-(--nav-height) flex min-h-svh items-center overflow-hidden bg-night-900">
      <div aria-hidden className="absolute inset-0 -z-10">
        <Image src="/art/night-sky.webp" alt="" fill className="object-cover" />
      </div>
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-[34svh] min-h-[200px]">
        <Image
          src="/art/night-ridge-near.webp"
          alt=""
          fill
          className="object-cover object-bottom"
        />
      </div>
      <div className="container-site flex flex-col items-start gap-8 py-24">
        <p className="type-display text-[clamp(6rem,22vw,16rem)] leading-[0.8] text-night-700">
          {copy.eyebrow}
        </p>
        <h1 className="type-display text-display leading-[0.86] text-star">{copy.title}</h1>
        <ShapeLink href={copy.cta.href}>{copy.cta.label}</ShapeLink>
      </div>
    </section>
  );
}
