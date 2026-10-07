import { ArrowLeftIcon, ArrowRightIcon, MailIcon, MessageCircleIcon } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { Copy, Todo } from "@/components/dev/Todo";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { buttonVariants } from "@/components/ui/button";
import { site } from "@/content/site";
import { callName, getMember, team, visibleSkills } from "@/content/team";
import { accentStyles, pad } from "@/lib/accent";
import { whatsappHref } from "@/lib/contact";
import { isTodo, shouldRender } from "@/lib/todo";
import { cn } from "@/lib/utils";

export const dynamicParams = false;

export function generateStaticParams() {
  return team.map((member) => ({ slug: member.slug }));
}

export async function generateMetadata({ params }: PageProps<"/team/[slug]">): Promise<Metadata> {
  const member = getMember((await params).slug);
  if (!member) return {};
  const title = `${member.name} — ${member.role}`;
  const description = isTodo(member.headline) ? undefined : member.headline;
  return {
    title,
    description,
    alternates: { canonical: `/team/${member.slug}` },
    openGraph: { type: "profile", title, description, url: `/team/${member.slug}` },
  };
}

const fill = (template: string, name: string) => template.replaceAll("{name}", name);

function Block({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section
      aria-labelledby={id}
      className="grid gap-6 border-t border-steel-800 py-14 md:grid-cols-12"
    >
      <SplitReveal
        as="h2"
        id={id}
        className="font-display text-h3 font-semibold text-silver-100 md:col-span-4"
      >
        {title}
      </SplitReveal>
      <div className="md:col-span-8">{children}</div>
    </section>
  );
}

/** Member CV page (brief §8.2). Only real content renders in production. */
export default async function MemberPage({ params }: PageProps<"/team/[slug]">) {
  const member = getMember((await params).slug);
  if (!member) notFound();

  const copy = site.member;
  const name = callName(member);
  const index = team.findIndex((m) => m.slug === member.slug);
  const previous = team[(index - 1 + team.length) % team.length];
  const next = team[(index + 1) % team.length];
  const skills = visibleSkills(member);
  const accent = accentStyles[member.accent];
  const showCurrently = member.currently?.public;
  const pageUrl = `${site.url}/team/${member.slug}`;

  const contactButtons = (
    <div className="flex flex-wrap gap-3">
      <a
        href={whatsappHref(fill(copy.whatsappMessage, name))}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(buttonVariants({ size: "lg" }), "h-12 rounded-full px-6 text-base")}
      >
        <MessageCircleIcon aria-hidden />
        {fill(copy.workWith, name)}
      </a>
      <a
        href={`mailto:${site.contact.email}?subject=${encodeURIComponent(fill(copy.emailSubject, name))}`}
        className={cn(
          buttonVariants({ variant: "outline", size: "lg" }),
          "h-12 rounded-full px-6 text-base",
        )}
      >
        <MailIcon aria-hidden />
        {copy.emailLabel}
      </a>
    </div>
  );

  return (
    <article className="container-site">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: member.name,
          jobTitle: member.role,
          url: pageUrl,
          ...(member.portrait && { image: `${site.url}${member.portrait.src}` }),
          ...(skills.some((s) => s.confirmed) && {
            knowsAbout: skills.filter((s) => s.confirmed).map((s) => s.name),
          }),
          memberOf: { "@type": "Organization", name: site.name, url: site.url },
          ...(showCurrently &&
            member.currently && {
              worksFor: { "@type": "Organization", name: member.currently.org },
            }),
          sameAs: member.socials.map((s) => s.url),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: site.name, item: site.url },
            {
              "@type": "ListItem",
              position: 2,
              name: copy.breadcrumbTeam,
              item: `${site.url}/#team`,
            },
            { "@type": "ListItem", position: 3, name: member.name, item: pageUrl },
          ],
        }}
      />

      <header className="grid gap-10 py-12 md:grid-cols-12 md:items-end md:py-20">
        <div className="relative overflow-hidden rounded-card border border-steel-800 bg-navy-800 md:col-span-5">
          <div aria-hidden className={cn("absolute inset-x-0 top-0 z-10 h-0.5", accent.line)} />
          {member.portrait ? (
            <Image
              src={member.portrait.src}
              alt={member.portrait.alt}
              width={1200}
              height={1500}
              priority
              sizes="(min-width: 768px) 40vw, 100vw"
              className="aspect-[4/5] h-auto w-full object-cover object-top"
            />
          ) : (
            <div className="flex aspect-[4/5] items-center justify-center font-display text-hero text-steel-600">
              {member.name.slice(0, 1)}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6 md:col-span-7">
          <p className="label-mono text-steel-400">
            {pad(member.order)} / {pad(team.length)} — {member.role}
          </p>
          <h1 className="font-display text-[clamp(3rem,7vw,7rem)] leading-[0.92] font-semibold tracking-[-0.03em] text-silver-100">
            {member.name}
          </h1>
          {shouldRender(member.headline) && (
            <p className="max-w-xl text-lg text-steel-300">
              <Copy value={member.headline} />
            </p>
          )}
          {showCurrently && member.currently && (
            <p className="text-steel-300">
              <span className="mr-3 label-mono text-steel-400">{copy.currently}</span>
              {member.currently.title} · {member.currently.org}
            </p>
          )}
          {contactButtons}
        </div>
      </header>

      {shouldRender(member.bio) && (
        <Block id="about" title={copy.about}>
          <p className="max-w-2xl text-lg text-steel-300">
            <Copy value={member.bio} />
          </p>
        </Block>
      )}

      {skills.length > 0 && (
        <Block id="skills" title={copy.skills}>
          <ul className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <li
                key={skill.name}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-4 py-2 text-steel-300",
                  skill.confirmed ? "border-steel-800" : "border-dashed border-wine-400",
                )}
              >
                {skill.name}
                {!isTodo(skill.level) && (
                  <span className="label-mono text-steel-400">{skill.level}</span>
                )}
              </li>
            ))}
          </ul>
        </Block>
      )}

      {member.tools.length > 0 && (
        <Block id="tools" title={copy.tools}>
          <ul className="flex flex-wrap gap-2">
            {member.tools.map((tool) => (
              <li
                key={tool}
                className="rounded-full border border-steel-800 px-4 py-2 text-steel-300"
              >
                {tool}
              </li>
            ))}
          </ul>
        </Block>
      )}

      {member.experience.length > 0 && (
        <Block id="experience" title={copy.experience}>
          <ol className="space-y-8 border-l border-steel-800 pl-6">
            {member.experience.map((role) => (
              <li key={`${role.title}-${role.org}`} className="relative">
                <span
                  aria-hidden
                  className={cn("absolute top-2 -left-[29px] size-2 rounded-full", accent.line)}
                />
                <p className="font-display text-xl font-semibold text-silver-100">
                  {role.title} · {role.org}
                </p>
                {shouldRender(role.start) && (
                  <p className="mt-1 label-mono text-steel-400">
                    <Copy value={role.start} /> — {role.end ?? copy.present}
                  </p>
                )}
                {shouldRender(role.summary) && (
                  <p className="mt-2 text-steel-300">
                    <Copy value={role.summary} />
                  </p>
                )}
              </li>
            ))}
          </ol>
        </Block>
      )}

      <Block id="projects" title={copy.projects}>
        {member.projects.length > 0 && (
          <ul className="grid gap-4 sm:grid-cols-2">
            {member.projects.map((project) => (
              <li
                key={project.slug}
                className="rounded-card border border-steel-800 bg-navy-900 p-6"
              >
                <p className="font-display text-xl font-semibold text-silver-100">
                  {project.title}
                </p>
                {shouldRender(project.summary) && (
                  <p className="mt-2 text-steel-300">
                    <Copy value={project.summary} />
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
        {member.projects.length < 3 && <p className="mt-4 text-steel-400">{copy.projectsComing}</p>}
        {member.projects.length === 0 && (
          <Todo className="mt-4">TODO: 2–4 projects (title, problem, what you did, result)</Todo>
        )}
      </Block>

      <section className="my-14 rounded-card border border-steel-800 bg-navy-900 p-8 md:p-12">
        <h2 className="font-display text-h3 font-semibold text-silver-100">
          {fill(copy.ctaTitle, name)}
        </h2>
        <div className="mt-6">{contactButtons}</div>
      </section>

      <nav
        aria-label={copy.allMembers}
        className="grid grid-cols-2 gap-4 border-t border-steel-800 py-10 text-steel-300"
      >
        {previous && (
          <Link
            href={`/team/${previous.slug}`}
            className="group flex flex-col gap-1 hover:text-silver-100"
          >
            <span className="flex items-center gap-2 label-mono text-steel-400">
              <ArrowLeftIcon aria-hidden className="size-3.5" /> {copy.previous}
            </span>
            <span className="font-display text-lg font-semibold">{previous.name}</span>
          </Link>
        )}
        {next && (
          <Link
            href={`/team/${next.slug}`}
            className="group flex flex-col items-end gap-1 text-right hover:text-silver-100"
          >
            <span className="flex items-center gap-2 label-mono text-steel-400">
              {copy.next} <ArrowRightIcon aria-hidden className="size-3.5" />
            </span>
            <span className="font-display text-lg font-semibold">{next.name}</span>
          </Link>
        )}
      </nav>
    </article>
  );
}
