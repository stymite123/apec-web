import { existsSync } from "node:fs";
import { join } from "node:path";

import Image from "next/image";
import type { CSSProperties } from "react";

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
 * The five, in black and white: five equal portrait cards, heads aligned, name and
 * role beneath. When the row comes into view each portrait resolves from its dither
 * to the photo in one quick crossfade (opacity only). No links: the team is shown,
 * not navigated. Phones: a swipe row.
 */
export function TeamSection() {
  const copy = site.sections.team;

  return (
    <section
      id={copy.id}
      data-theme="mono"
      aria-labelledby="team-title"
      className="relative z-20 bg-black pt-[calc(var(--nav-height)+1rem)] pb-20 text-white md:pb-28"
    >
      <div className="container-site">
        <h2 id="team-title" className="type-display text-[clamp(3rem,6.4vw,6.5rem)] leading-[0.84]">
          {copy.title}
        </h2>
      </div>

      <TeamReveal className="team-row mt-10 md:mt-12">
        {team.map((member, i) => {
          if (!member.portrait) return null;
          const cutout = `/team/cutout/${member.slug}.png`;
          const hasCutout = hasPublicFile(cutout);
          const style = hasCutout ? placement(member.slug) : undefined;
          return (
            <li key={member.slug} className="team-card" style={{ "--i": i } as CSSProperties}>
              <div className="team-frame [container-type:size] relative aspect-[3/4] overflow-hidden rounded-[6px] bg-[#0f0f10]">
                <div className={style ? "absolute" : "absolute inset-0"} style={style}>
                  <Image
                    src={hasCutout ? cutout : member.portrait.src}
                    alt={member.portrait.alt}
                    fill
                    quality={85}
                    loading="eager"
                    sizes="(min-width: 1024px) 28vw, (min-width: 768px) 40vw, 80vw"
                    className="team-photo object-cover object-top contrast-[1.06] grayscale"
                  />
                  {hasCutout &&
                    [1, 2].map((level) => (
                      <Image
                        key={level}
                        src={`/team/dither/${member.slug}-cut-${level}.png`}
                        alt=""
                        aria-hidden
                        fill
                        unoptimized
                        data-level={level}
                        className="team-dither object-cover object-top"
                      />
                    ))}
                </div>
                {/* Fades every crop edge into the card (some photos end above its foot). */}
                <div
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-[42%] bg-linear-to-t from-[#0f0f10] from-[22%] to-transparent"
                />
              </div>
              <p className="mt-4 text-[17px] font-semibold tracking-[-0.01em]">{member.name}</p>
              <p className="mt-0.5 text-[14px] text-white/55">{member.role}</p>
            </li>
          );
        })}
      </TeamReveal>
    </section>
  );
}
