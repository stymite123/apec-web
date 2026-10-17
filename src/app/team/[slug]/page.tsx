import { ArrowLeftIcon, ArrowRightIcon, MailIcon, MessageCircleIcon } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { Copy, Todo } from "@/components/dev/Todo";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { ShapeLink } from "@/components/ui/shape-link";
import { site } from "@/content/site";
import { callName, getMember, team, visibleSkills } from "@/content/team";
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
      className="grid gap-6 border-t border-grey-800 py-14 md:grid-cols-12"
    >
      <SplitReveal as="h2" id={id} className="type-display text-title text-star md:col-span-4">
        {title}
      </SplitReveal>
      <div className="md:col-span-8">{children}</div>
    </section>
  );
}

/** Slanted tag (skills, tools). */
function Tag({ children, dashed }: { children: ReactNode; dashed?: boolean }) {
  return (
    <li className="relative px-4 py-2 text-star">
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 -skew-x-12 rounded-[3px] border-2",
          dashed ? "border-dashed border-wine-400" : "border-grey-700 bg-grey-800",
        )}
      />
      <span className="relative flex items-center gap-2">{children}</span>
    </li>
  );
}

/** Member CV page (brief §8.2): the character card, then the record. Only real content renders in production. */
export default async function MemberPage({ params }: PageProps<"/team/[slug]">) {
  const member = getMember((await params).slug);
  if (!member) notFound();

  const copy = site.member;
  const name = callName(member);
  const index = team.findIndex((m) => m.slug === member.slug);
  const previous = team[(index - 1 + team.length) % team.length];
  const next = team[(index + 1) % team.length];
  const skills = visibleSkills(member);
  const showCurrently = member.currently?.public;
  const pageUrl = `${site.url}/team/${member.slug}`;

  const contactButtons = (
    <div className="flex flex-wrap gap-4">
      <ShapeLink href={whatsappHref(fill(copy.whatsappMessage, name))} external>
        <MessageCircleIcon aria-hidden className="size-4.5" />
        {fill(copy.workWith, name)}
      </ShapeLink>
      <ShapeLink
        href={`mailto:${site.contact.email}?subject=${encodeURIComponent(fill(copy.emailSubject, name))}`}
        variant="outline"
        fill="var(--color-star)"
      >
        <MailIcon aria-hidden className="size-4.5" />
        {copy.emailLabel}
      </ShapeLink>
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

      <header className="grid gap-10 pt-10 pb-14 md:grid-cols-12 md:items-end md:pt-16 md:pb-20">
        {/* Portrait in colour, as on the home page (Mustafa 2026-10-17). */}
        <div className="relative overflow-hidden rounded-[6px] bg-[#0e0e0e] md:col-span-5">
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
            <div className="flex aspect-[4/5] items-center justify-center type-display text-mega text-white/40">
              {member.name.slice(0, 1)}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6 md:col-span-7">
          <p className="type-ui text-[15px] text-grey-400">{member.role}</p>
          <h1 className="type-display text-[clamp(3.25rem,8vw,8rem)] leading-[0.84] text-star">
            {member.name}
          </h1>
          {shouldRender(member.headline) && (
            <p className="max-w-xl text-lead text-grey-400">
              <Copy value={member.headline} />
            </p>
          )}
          {showCurrently && member.currently && (
            <p className="text-star">
              <span className="mr-3 type-ui text-[14px] text-apricot">{copy.currently}</span>
              {member.currently.title}, {member.currently.org}
            </p>
          )}
          {contactButtons}
        </div>
      </header>

      {shouldRender(member.bio) && (
        <Block id="about" title={copy.about}>
          <p className="max-w-2xl text-lead text-grey-400">
            <Copy value={member.bio} />
          </p>
        </Block>
      )}

      {skills.length > 0 && (
        <Block id="skills" title={copy.skills}>
          <ul className="flex flex-wrap gap-3">
            {skills.map((skill) => (
              <Tag key={skill.name} dashed={!skill.confirmed}>
                {skill.name}
                {!isTodo(skill.level) && (
                  <span className="type-ui text-[12px] text-grey-400">{skill.level}</span>
                )}
              </Tag>
            ))}
          </ul>
        </Block>
      )}

      {member.tools.length > 0 && (
        <Block id="tools" title={copy.tools}>
          <ul className="flex flex-wrap gap-3">
            {member.tools.map((tool) => (
              <Tag key={tool}>{tool}</Tag>
            ))}
          </ul>
        </Block>
      )}

      {member.experience.length > 0 && (
        <Block id="experience" title={copy.experience}>
          <ol className="space-y-8 border-l-2 border-dashed border-grey-700 pl-8">
            {member.experience.map((role) => (
              <li key={`${role.title}-${role.org}`} className="relative">
                <span
                  aria-hidden
                  className="absolute top-0.5 -left-[45px] size-6 bg-apricot clip-hex"
                />
                <p className="text-xl font-semibold text-star">
                  {role.title}, {role.org}
                </p>
                {shouldRender(role.start) && (
                  <p className="mt-1 type-ui text-[14px] text-grey-400">
                    <Copy value={role.start} /> to {role.end ?? copy.present}
                  </p>
                )}
                {shouldRender(role.summary) && (
                  <p className="mt-2 text-grey-400">
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
              <li key={project.slug} className="bg-grey-800 p-6 [--cut:16px] clip-chamfer">
                <p className="text-xl font-semibold text-star">{project.title}</p>
                {shouldRender(project.summary) && (
                  <p className="mt-2 text-grey-400">
                    <Copy value={project.summary} />
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
        {member.projects.length < 3 && <p className="mt-4 text-grey-400">{copy.projectsComing}</p>}
        {member.projects.length === 0 && (
          <Todo className="mt-4">TODO: 2–4 projects (title, problem, what you did, result)</Todo>
        )}
      </Block>

      <section className="relative my-14 overflow-hidden rounded-[6px] border border-white/15 bg-black p-8 md:p-12">
        <h2 className="relative type-display text-title text-white">{fill(copy.ctaTitle, name)}</h2>
        <div className="relative mt-8">{contactButtons}</div>
      </section>

      <nav
        aria-label={copy.allMembers}
        className="grid grid-cols-2 gap-4 border-t border-grey-800 py-10 text-grey-400"
      >
        {previous && (
          <Link
            href={`/team/${previous.slug}`}
            className="group flex flex-col gap-1 hover:text-star"
          >
            <span className="flex items-center gap-2 type-ui text-[14px]">
              <ArrowLeftIcon aria-hidden className="size-3.5" /> {copy.previous}
            </span>
            <span className="type-display text-[clamp(1.75rem,3vw,2.75rem)] leading-none text-star transition-colors group-hover:text-apricot">
              {previous.name}
            </span>
          </Link>
        )}
        {next && (
          <Link
            href={`/team/${next.slug}`}
            className="group flex flex-col items-end gap-1 text-right hover:text-star"
          >
            <span className="flex items-center gap-2 type-ui text-[14px]">
              {copy.next} <ArrowRightIcon aria-hidden className="size-3.5" />
            </span>
            <span className="type-display text-[clamp(1.75rem,3vw,2.75rem)] leading-none text-star transition-colors group-hover:text-apricot">
              {next.name}
            </span>
          </Link>
        )}
      </nav>
    </article>
  );
}
