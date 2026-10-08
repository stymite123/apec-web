import { SplitReveal } from "@/components/motion/SplitReveal";
import { ServiceRows, type ServiceRow } from "@/components/sections/ServiceRows";
import { services } from "@/content/services";
import { site } from "@/content/site";
import { getMember } from "@/content/team";
import { pad } from "@/lib/accent";
import { isTodo, shouldRender } from "@/lib/todo";

/**
 * Services (brief §8.1 #6): one discipline per specialist, as a numbered index.
 * Each row links to the specialist who leads it. Text only (no repeated photos).
 */
export function Services() {
  const copy = site.sections.services;
  const rows: ServiceRow[] = services.map((service, index) => {
    const lead = getMember(service.lead);
    return {
      slug: service.slug,
      number: pad(index + 1),
      title: service.title,
      summary: isTodo(service.summary) ? undefined : service.summary,
      lead: lead ? { name: lead.name, href: `/team/${lead.slug}` } : undefined,
    };
  });

  return (
    <section
      id={copy.id}
      aria-labelledby={`${copy.id}-title`}
      className="relative border-t border-grey-800 bg-grey-900"
    >
      <div className="container-site py-28 md:py-36">
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="label-mono text-rose-400">{copy.eyebrow}</p>
            <SplitReveal
              id={`${copy.id}-title`}
              className="text-grad mt-5 font-field text-[clamp(3rem,7vw,7rem)] leading-[0.9] tracking-[-0.035em] [--g-from:#ffffff] [--g-to:#a9abb2] [font-variation-settings:'opsz'_72]"
            >
              {copy.title}
            </SplitReveal>
          </div>
          {copy.intro && shouldRender(copy.intro) && (
            <p className="max-w-sm text-grey-400 md:col-span-4 md:col-start-9 md:justify-self-end">
              {copy.intro}
            </p>
          )}
        </div>

        <ServiceRows rows={rows} ledBy={copy.ledBy} />
      </div>
    </section>
  );
}
