import { existsSync } from "node:fs";
import { join } from "node:path";

import { TeamCards, type CardMember } from "@/components/sections/TeamCards";
import { site } from "@/content/site";
import { callName, team } from "@/content/team";

/** Build-time portrait assets (scripts/cutout-portraits.py, scripts/dither-portraits.mjs). */
const hasPublicFile = (src: string) => existsSync(join(process.cwd(), "public", src));

export function cardAssets(slug: string, photo: string) {
  const cutoutSrc = `/team/cutout/${slug}.png`;
  const cutout = hasPublicFile(cutoutSrc);
  const ditherBase = cutout ? `/team/dither/${slug}-cut` : `/team/dither/${slug}`;
  return {
    figure: cutout ? cutoutSrc : photo,
    cutout,
    dither: [0, 1, 2].map((level) => `${ditherBase}-${level}.png`) as CardMember["dither"],
    backdrop: `/team/backdrop/${slug}.jpg`,
  };
}

/** Server wrapper: passes plain props so zod/content stay out of the client bundle. */
export function TeamSection() {
  const copy = site.sections.team;
  const members: CardMember[] = team.flatMap((member) =>
    member.portrait
      ? [
          {
            slug: member.slug,
            name: member.name,
            callName: callName(member),
            role: member.role,
            ...cardAssets(member.slug, member.portrait.src),
          },
        ]
      : [],
  );

  return (
    <TeamCards
      members={members}
      title={copy.title}
      caption={copy.cardCaption}
      viewProfile={copy.viewProfile}
    />
  );
}
