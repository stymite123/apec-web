import { SectionHeader } from "@/components/sections/SectionHeader";
import { MemberCard } from "@/components/team/MemberCard";
import { site } from "@/content/site";
import { team } from "@/content/team";

/**
 * The Five (brief §8.1 #5). Phones: swipeable snap carousel; tablet/desktop: grid.
 * The pinned horizontal scroll comes after v1.
 */
export function TeamSection() {
  const copy = site.sections.team;

  return (
    <section id={copy.id} aria-labelledby={`${copy.id}-title`} className="container-site py-28">
      <SectionHeader id={copy.id} eyebrow={copy.eyebrow} title={copy.title} intro={copy.intro} />
      <ol className="-mx-[clamp(1rem,4vw,3rem)] mt-14 no-scrollbar flex snap-x snap-mandatory scroll-px-[clamp(1rem,4vw,3rem)] gap-4 overflow-x-auto px-[clamp(1rem,4vw,3rem)] pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-5">
        {team.map((member) => (
          <li key={member.slug} className="w-[72vw] shrink-0 snap-start sm:w-auto">
            <MemberCard member={member} total={team.length} />
          </li>
        ))}
      </ol>
    </section>
  );
}
