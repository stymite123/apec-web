import Image from "next/image";
import Link from "next/link";

import type { TeamMember } from "@/content/schema";
import { visibleSkills } from "@/content/team";
import { accentStyles, pad } from "@/lib/accent";
import { cn } from "@/lib/utils";

/**
 * Team card (brief §8.1 #5): navy-graded portrait that reveals colour on hover,
 * accent hairline, 0X / 05 index. Hover/focus effects use opacity/transform only.
 */
export function MemberCard({ member, total }: { member: TeamMember; total: number }) {
  const accent = accentStyles[member.accent];
  const skills = visibleSkills(member).slice(0, 3);

  return (
    <Link
      href={`/team/${member.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-card border border-steel-800 bg-navy-900 transition-colors hover:border-steel-600"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-navy-800">
        {member.portrait && (
          <Image
            src={member.portrait.src}
            alt=""
            fill
            sizes="(min-width: 1024px) 20vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover object-top transition-transform duration-700 ease-out-expo group-hover:scale-[1.04] group-focus-visible:scale-[1.04]"
          />
        )}
        {/* Navy duotone grade; fades out on hover to reveal colour. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-navy-700 mix-blend-color transition-opacity duration-500 group-hover:opacity-0 group-focus-visible:opacity-0"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-navy-900 to-transparent"
        />
        <div aria-hidden className={cn("absolute inset-x-0 top-0 h-0.5", accent.line)} />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="label-mono text-steel-400">
          {pad(member.order)} / {pad(total)}
        </p>
        <h3 className="font-display text-xl font-semibold text-silver-100">{member.name}</h3>
        <p className="text-sm text-steel-400">{member.role}</p>
        {skills.length > 0 && (
          <ul className="mt-auto flex flex-wrap gap-1.5 pt-2">
            {skills.map((skill) => (
              <li
                key={skill.name}
                className="rounded-full border border-steel-800 px-2.5 py-1 text-xs text-steel-300"
              >
                {skill.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Link>
  );
}
