import Image from "next/image";
import Link from "next/link";

import { Copy } from "@/components/dev/Todo";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { packages, services } from "@/content/services";
import { site } from "@/content/site";
import { getMember } from "@/content/team";
import { pad } from "@/lib/accent";
import { shouldRender } from "@/lib/todo";

/** Services (brief §8.1 #6): one discipline per member, plus combined packages. */
export function Services() {
  const copy = site.sections.services;

  return (
    <section
      id={copy.id}
      aria-labelledby={`${copy.id}-title`}
      className="border-t border-steel-800 bg-ink"
    >
      <div className="container-site py-28">
        <SectionHeader id={copy.id} eyebrow={copy.eyebrow} title={copy.title} intro={copy.intro} />

        <ol className="mt-14 border-t border-steel-800">
          {services.map((service, index) => {
            const lead = getMember(service.lead);
            return (
              <li
                key={service.slug}
                className="grid gap-4 border-b border-steel-800 py-8 md:grid-cols-12 md:items-center"
              >
                <span className="label-mono text-steel-400 md:col-span-1">{pad(index + 1)}</span>
                <h3 className="font-display text-h3 font-semibold text-silver-100 md:col-span-5">
                  {service.title}
                </h3>
                <p className="text-steel-300 md:col-span-4">
                  {shouldRender(service.summary) && <Copy value={service.summary} />}
                </p>
                {lead && (
                  <Link
                    href={`/team/${lead.slug}`}
                    className="flex items-center gap-3 text-sm text-steel-300 transition-colors hover:text-silver-100 md:col-span-2 md:justify-end"
                  >
                    {lead.portrait && (
                      <Image
                        src={lead.portrait.src}
                        alt=""
                        width={36}
                        height={36}
                        className="size-9 rounded-full object-cover object-top"
                      />
                    )}
                    <span>
                      <span className="sr-only">{copy.ledBy} </span>
                      {lead.name}
                    </span>
                  </Link>
                )}
              </li>
            );
          })}
        </ol>

        <h3 className="mt-20 label-mono text-steel-400">{copy.packagesTitle}</h3>
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {packages.map((pkg) => (
            <li key={pkg.slug} className="rounded-card border border-steel-800 bg-navy-900 p-8">
              <p className="font-display text-h3 font-semibold text-silver-100">{pkg.title}</p>
              {shouldRender(pkg.summary) && (
                <p className="mt-3 text-steel-300">
                  <Copy value={pkg.summary} />
                </p>
              )}
              <ul className="mt-6 flex flex-wrap gap-2">
                {pkg.includes.map((slug) => (
                  <li
                    key={slug}
                    className="rounded-full border border-steel-800 px-3 py-1 text-sm text-steel-300"
                  >
                    {services.find((service) => service.slug === slug)?.title}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
