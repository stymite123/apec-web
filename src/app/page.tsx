import Link from "next/link";

import { Copy, Todo } from "@/components/dev/Todo";
import { buttonVariants } from "@/components/ui/button";
import { site } from "@/content/site";
import { team } from "@/content/team";
import { shouldRender } from "@/lib/todo";
import { cn } from "@/lib/utils";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Placeholder home page (Phase 3). Real sections arrive in Phase 4,
 * styled from the approved design.
 */
export default function Home() {
  const { lead, accent, tail } = site.headline;
  const [primaryCta, secondaryCta] = site.heroCtas;

  return (
    <>
      <section
        aria-labelledby="hero-title"
        className="container-site flex min-h-[calc(100svh-var(--nav-height))] flex-col justify-center gap-8 py-16"
      >
        {shouldRender(site.location) && (
          <p className="label-mono text-steel-400">
            <Copy value={site.location} />
          </p>
        )}
        <h1
          id="hero-title"
          className="max-w-[12ch] font-display text-hero font-semibold text-silver-100"
        >
          {lead} <span className="font-serif font-normal italic">{accent}</span> {tail}
        </h1>
        {shouldRender(site.subheadline) && (
          <p className="max-w-2xl text-steel-300">
            <Copy value={site.subheadline} />
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          {primaryCta && (
            <Link
              href={primaryCta.href}
              className={cn(buttonVariants({ size: "lg" }), "h-12 rounded-full px-6 text-base")}
            >
              {primaryCta.label}
            </Link>
          )}
          {secondaryCta && (
            <Link
              href={secondaryCta.href}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-12 rounded-full px-6 text-base",
              )}
            >
              {secondaryCta.label}
            </Link>
          )}
        </div>
      </section>

      {site.homeSections.map((section) => (
        <section
          key={section.id}
          id={section.id}
          aria-labelledby={`${section.id}-title`}
          className="container-site border-t border-steel-800 py-24"
        >
          <h2 id={`${section.id}-title`} className="font-display text-h2 font-semibold">
            {section.title}
          </h2>

          {section.id === "team" ? (
            <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {team.map((member) => (
                <li
                  key={member.slug}
                  className="rounded-card border border-steel-800 bg-navy-900 p-6"
                >
                  <p className="label-mono text-steel-400">
                    {pad(member.order)} / {pad(team.length)}
                  </p>
                  <p className="mt-8 font-display text-xl font-semibold text-silver-100">
                    {member.name}
                  </p>
                  <p className="mt-1 text-steel-400">{member.role}</p>
                </li>
              ))}
            </ol>
          ) : (
            <div className="mt-8">
              <Todo>TODO: {section.title} section (Phase 4, from the approved design)</Todo>
            </div>
          )}
        </section>
      ))}
    </>
  );
}
