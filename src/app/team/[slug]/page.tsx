import { existsSync } from "node:fs";
import { join } from "node:path";

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  FileTextIcon,
  MailIcon,
  MessageCircleIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { Copy, Todo } from "@/components/dev/Todo";
import { FrameScrub } from "@/components/portfolio/FrameScrub";
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

/** Frames written by `pnpm frames` (scripts/portfolio-frames.mjs), if that member has them. */
const FRAME_COUNT = 48;
const hasFrames = (slug: string) =>
  existsSync(join(process.cwd(), "public", "portfolio", slug, "f-00.webp"));

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
  const frames = hasFrames(member.slug);

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
      {member.cv && (
        <ShapeLink href={member.cv} variant="outline" fill="var(--color-grey-300)" external>
          <FileTextIcon aria-hidden className="size-4.5" />
          {copy.cvLabel}
        </ShapeLink>
      )}
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

      {/* Cinematic opening: the portrait turns as you scroll (frames), name and actions
          over it. Members without a frame strip keep the still portrait. */}
      <header className="relative -mx-(--page-gutter) overflow-hidden">
        <div className="relative aspect-[4/5] w-full sm:aspect-[16/10] lg:aspect-[21/9]">
          {frames ? (
            <FrameScrub
              slug={member.slug}
              count={FRAME_COUNT}
              alt={member.portrait?.alt ?? member.name}
              className="absolute inset-0"
            />
          ) : member.portrait ? (
            <Image
              src={member.portrait.src}
              alt={member.portrait.alt}
              fill
              priority
              sizes="100vw"
              className="object-cover object-top"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-studio-900 type-display text-mega text-white/30">
              {member.name.slice(0, 1)}
            </div>
          )}
          {/* Keeps the name readable over any frame. */}
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(to_top,var(--color-studio-950)_4%,rgb(10_11_13/0.75)_26%,transparent_62%)]"
          />
          <div className="absolute inset-x-0 bottom-0 px-(--page-gutter) pb-8 md:pb-12">
            <p className="type-ui text-[15px] text-grey-300">{member.role}</p>
            <h1 className="mt-2 type-serif text-[clamp(2.75rem,7vw,6.5rem)] leading-[0.95] text-star">
              {member.name}
            </h1>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-6 pt-8 pb-14 md:pt-10 md:pb-20">
        {shouldRender(member.headline) && (
          <p className="max-w-2xl text-lead text-grey-400">
            <Copy value={member.headline} />
          </p>
        )}
        {showCurrently && member.currently && (
          <p className="text-star">
            <span className="mr-3 type-ui text-[14px] text-action-300">{copy.currently}</span>
            {member.currently.title}, {member.currently.org}
          </p>
        )}
        {contactButtons}
      </div>

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
          <ul className="grid gap-5 sm:grid-cols-2">
            {member.projects.map((project) => {
              const card = (
                <>
                  {project.cover && (
                    <span className="relative block aspect-[16/10] overflow-hidden bg-studio-900">
                      <Image
                        src={project.cover}
                        alt=""
                        fill
                        sizes="(min-width: 640px) 44vw, 90vw"
                        className="object-cover object-top transition-transform duration-500 ease-out-expo group-hover:scale-[1.03]"
                      />
                    </span>
                  )}
                  <span className="block p-6">
                    <span className="flex items-baseline gap-2">
                      <span className="text-xl font-semibold text-star">{project.title}</span>
                      {project.link && (
                        <ArrowUpRightIcon
                          aria-hidden
                          className="size-4 text-action-300 transition-transform duration-300 group-hover:rotate-45"
                        />
                      )}
                    </span>
                    {shouldRender(project.summary) && (
                      <span className="mt-2 block text-grey-400">
                        <Copy value={project.summary} />
                      </span>
                    )}
                    {project.stack.length > 0 && (
                      <span className="mt-4 block type-ui text-[13px] text-grey-500">
                        {project.stack.join(" · ")}
                      </span>
                    )}
                  </span>
                </>
              );
              return (
                <li key={project.slug} className="group overflow-hidden rounded-[10px] bg-grey-800">
                  {project.link ? (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block h-full"
                    >
                      {card}
                    </a>
                  ) : (
                    card
                  )}
                </li>
              );
            })}
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
