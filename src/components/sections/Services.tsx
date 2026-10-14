import Image from "next/image";
import type { ComponentType } from "react";

import { FlowCanvas } from "@/components/showcase/FlowCanvas";
import { Gallery } from "@/components/showcase/Gallery";
import { Laptop } from "@/components/showcase/Laptop";
import { Phones } from "@/components/showcase/Phones";
import { SearchStack } from "@/components/showcase/SearchStack";
import { services } from "@/content/services";
import { site } from "@/content/site";
import { getMember } from "@/content/team";
import { isTodo } from "@/lib/todo";
import { cn } from "@/lib/utils";

/** One device scene per discipline (CSS 3D, components/showcase). */
const VISUALS: Record<string, ComponentType> = {
  seo: SearchStack,
  "ai-agents": FlowCanvas,
  web: Laptop,
  "mobile-apps": Phones,
  "brand-design": Gallery,
};

/**
 * Daylight: "What we do" as a studio. Each discipline gets a lit stage with a working
 * model of what we make — search results on Google, Bing and AI answers; a live
 * automation; a crypto exchange on a laptop; phone apps; an identity on show — and
 * the person who leads it. Scenes are 760×500 and scale per breakpoint (--z).
 */
export function Services() {
  const copy = site.sections.services;

  return (
    <section
      id={copy.id}
      data-theme="paper"
      aria-labelledby={`${copy.id}-title`}
      className="relative bg-paper text-ink"
    >
      <div className="container-site pt-[calc(var(--nav-height)+4rem)] pb-24 md:pb-32">
        <h2 id={`${copy.id}-title`} className="type-display text-display leading-[0.84]">
          {copy.title}
        </h2>

        <ol className="mt-12 flex flex-col gap-20 md:mt-16 md:gap-28">
          {services.map((service, i) => {
            const Visual = VISUALS[service.slug];
            const lead = getMember(service.lead);
            return (
              <li key={service.slug} className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
                <div
                  aria-hidden
                  className={cn(
                    "relative flex h-[calc(500px*var(--z)+56px)] items-center justify-center overflow-hidden rounded-[28px] bg-[radial-gradient(130%_100%_at_50%_0%,#ffffff_0%,#e6e9ee_62%,#d9dde4_100%)] shadow-[inset_0_0_0_1px_rgb(14_18_32/0.05)] lg:col-span-7",
                    "[--z:0.44] min-[440px]:[--z:0.5] sm:[--z:0.74] md:[--z:0.9] lg:[--z:0.68] xl:[--z:0.94] 2xl:[--z:1]",
                    i % 2 === 1 && "lg:order-2",
                  )}
                >
                  <div className="[zoom:var(--z)]">{Visual && <Visual />}</div>
                </div>

                <div className="lg:col-span-5">
                  <h3 className="text-[clamp(2rem,3.3vw,3.3rem)] leading-[1] font-bold tracking-[-0.035em]">
                    {service.title}
                  </h3>
                  {!isTodo(service.summary) && (
                    <p className="mt-5 max-w-[42ch] text-lead text-ink-600">{service.summary}</p>
                  )}
                  {lead && (
                    <p className="mt-8 inline-flex items-center gap-3 rounded-full border border-ink/12 bg-white py-1.5 pr-5 pl-1.5 text-[14px] text-ink-600">
                      {lead.portrait && (
                        <span className="relative size-9 overflow-hidden rounded-full bg-paper">
                          <Image
                            src={lead.portrait.src}
                            alt=""
                            fill
                            sizes="36px"
                            className="object-cover object-top grayscale"
                          />
                        </span>
                      )}
                      <span>
                        {copy.ledBy} <span className="font-semibold text-ink">{lead.name}</span>
                      </span>
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
