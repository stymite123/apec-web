import { TeamShowcase, type ShowcaseMember } from "@/components/sections/TeamShowcase";
import { site } from "@/content/site";
import { callName, team, visibleSkills } from "@/content/team";
import { isTodo } from "@/lib/todo";

/** Server wrapper: passes plain props so zod/content stay out of the client bundle. */
export function TeamSection() {
  const copy = site.sections.team;
  const members: ShowcaseMember[] = team.map((member) => ({
    slug: member.slug,
    order: member.order,
    name: member.name,
    callName: callName(member),
    role: member.role,
    accent: member.accent,
    portrait: member.portrait?.src,
    skills: visibleSkills(member).map((skill) => skill.name),
  }));

  return (
    <TeamShowcase
      members={members}
      eyebrow={copy.eyebrow}
      title={copy.title}
      intro={copy.intro && !isTodo(copy.intro) ? copy.intro : undefined}
      viewProfile={copy.viewProfile}
    />
  );
}
