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
        <p className="label-mono text-steel-400">{eyebrow}</p>
        <SplitReveal
          id={`${id}-title`}
          className="mt-4 font-display text-h2 font-semibold text-silver-100"
        >
          {title}
        </SplitReveal>
      </div>
      {intro && shouldRender(intro) && (
        <p className="max-w-md text-steel-300 md:col-span-4">
          <Copy value={intro} />
        </p>
      )}
    </div>
  );
}
