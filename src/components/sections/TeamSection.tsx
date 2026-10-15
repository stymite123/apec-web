import { existsSync } from "node:fs";
import { join } from "node:path";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { OrbitArc } from "@/components/motion/OrbitArc";
import { TeamReveal } from "@/components/sections/TeamReveal";
import { portraitFraming } from "@/content/framing";
import { site } from "@/content/site";
import { team } from "@/content/team";

/** Head width as a share of the card's width, and where the top of the head sits. */
const HEAD_WIDTH = 40;
const HEAD_TOP = 13;
/** Hand corrections where hair volume skews the measured head width. */
const TUNE: Record<string, { scale?: number; y?: number }> = {
  "mustafa-ishaq": { scale: 1.22 },
};

const hasPublicFile = (src: string) => existsSync(join(process.cwd(), "public", src));

/**
 * Places a cut-out so every head lands at the same height and size: sizes are in
 * container units of the card (cqw/cqh), from the measured head (pnpm framing).
 */
function placement(slug: string): CSSProperties | undefined {
  const f = portraitFraming[slug];
  if (!f) return undefined;
  const scale = (HEAD_WIDTH / f.headWidth) * (TUNE[slug]?.scale ?? 1);
  return {
    width: `${f.width * scale}cqw`,
    aspectRatio: `${f.width} / ${f.height}`,
    left: `${50 - f.headCenter * scale}cqw`,
    top: `calc(${HEAD_TOP + (TUNE[slug]?.y ?? 0)}cqh - ${f.headTop * scale}cqw)`,
  };
}

/**
 * The five (Climb composition, Field character): all five together in colour, heads
 * aligned, Newsreader names. Each portrait starts as colour pixels and resolves into
 * the original photo once the row is in view (Mustafa 2026-10-15). Formation entrance centre-out,
 * hover/focus brings one portrait forward with a slim blue edge. Each portrait and
 * name is one link to the member page (no extra buttons). Phones: a swipe row with
 * previous/next and a position indicator. The dark studio slides over the dawn sky
 * with a slanted edge.
 */
export function TeamSection() {
  const copy = site.sections.team;
  const members = team.filter((member) => member.portrait);

  return (
    <section
      id={copy.id}
      data-theme="mono"
      aria-labelledby="team-title"
      className="relative z-20 bg-studio-950 pt-[calc(var(--nav-height)+1.5rem)] pb-20 text-white md:pb-28"
    >
      {/* Slanted edge over the dawn sky (mirrors the dawn panel's edge). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-[6vw] h-[calc(6vw+1px)] bg-studio-950 [clip-path:polygon(0_0,100%_100%,0_100%)]"
      />

      <TeamReveal
        count={members.length}
        labels={{ previous: "Previous member", next: "Next member" }}
        heading={
          <div className="team-head container-site">
            <h2
              id="team-title"
              className="text-grad type-serif text-[clamp(2.75rem,5.6vw,5.75rem)] leading-[1] [--g-from:#ffffff] [--g-to:#b9c0cc]"
            >
              {copy.title}
            </h2>
            {/* Signature A, part 3: the orbit settles into the line that introduces the five. */}
            <OrbitArc variant="line" className="mt-3 h-[22px] w-[min(70vw,420px)]" />
          </div>
        }
      >
        {members.map((member, i) => {
          const portrait = member.portrait!;
          const cutout = `/team/cutout/${member.slug}.png`;
          const hasCutout = hasPublicFile(cutout);
          const style = hasCutout ? placement(member.slug) : undefined;
          // Centre first, then the inner pair, then the outer pair.
          const order = Math.abs(i - Math.floor(members.length / 2));
          return (
            <li
              key={member.slug}
              className="team-card"
              style={{ "--order": order } as CSSProperties}
            >
              <Link href={`/team/${member.slug}`} className="team-link group block rounded-[8px]">
                <div className="team-lift relative">
                  <div className="team-frame [container-type:size] relative aspect-[3/4] overflow-hidden rounded-[8px] bg-studio-900">
                    <div className={style ? "absolute" : "absolute inset-0"} style={style}>
                      <Image
                        src={hasCutout ? cutout : portrait.src}
                        alt={portrait.alt}
                        fill
                        quality={85}
                        loading="eager"
                        sizes="(min-width: 1024px) 20vw, (min-width: 768px) 24vw, 72vw"
                        className="team-photo object-cover object-top"
                      />
                      {hasCutout &&
                        [0, 1].map((level) => (
                          <Image
                            key={level}
                            src={`/team/pixel/${member.slug}-${level}.png`}
                            alt=""
                            aria-hidden
                            fill
                            unoptimized
                            data-level={level}
                            className="team-pixel object-cover object-top"
                          />
                        ))}
                    </div>
                    {/* Fades every crop edge into the card (some photos end above its foot). */}
                    <div
                      aria-hidden
                      className="absolute inset-x-0 bottom-0 h-[38%] bg-linear-to-t from-studio-900 from-[18%] to-transparent"
                    />
                    <span aria-hidden className="team-edge absolute inset-0 rounded-[8px]" />
                  </div>
                </div>
                <div className="team-caption mt-4">
                  <p className="team-name type-serif text-[clamp(1.4rem,1.75vw,1.8rem)] leading-[1.1] text-balance text-silver-100 transition-colors duration-200">
                    {member.name}
                  </p>
                  <span
                    aria-hidden
                    className="team-name-line mt-1.5 block h-[1.5px] w-12 bg-action-300"
                  />
                  <p className="mt-2 text-[15px] text-grey-400">{member.role}</p>
                </div>
              </Link>
            </li>
          );
        })}
      </TeamReveal>
    </section>
  );
}
