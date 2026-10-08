import { Copy } from "@/components/dev/Todo";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { shouldRender } from "@/lib/todo";

type SectionHeaderProps = {
  id: string;
  eyebrow: string;
  title: string;
  intro?: string;
};

export function SectionHeader({ id, eyebrow, title, intro }: SectionHeaderProps) {
  return (
    <div className="grid gap-6 md:grid-cols-12 md:items-end">
      <div className="md:col-span-8">
        <p className="label-mono text-rose-400">{eyebrow}</p>
        <SplitReveal
          id={`${id}-title`}
          className="text-grad mt-5 font-field text-[clamp(3rem,7vw,7rem)] leading-[0.9] tracking-[-0.035em] [--g-from:#ffffff] [--g-to:#a9abb2] [font-variation-settings:'opsz'_72]"
        >
          {title}
        </SplitReveal>
      </div>
      {intro && shouldRender(intro) && (
        <p className="max-w-md text-grey-400 md:col-span-4">
          <Copy value={intro} />
        </p>
      )}
    </div>
  );
}
