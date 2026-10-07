/** Services ticker (brief §8.1 #3). CSS-only; static with reduced motion. */
export function Marquee({ items }: { items: string[] }) {
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-10 pr-10">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-10 whitespace-nowrap">
          <span>{item}</span>
          <span aria-hidden className="size-1.5 rounded-full bg-brand-500" />
        </li>
      ))}
    </ul>
  );

  return (
    <div className="overflow-hidden border-y border-steel-800 bg-ink py-6 font-display text-2xl font-medium text-steel-300 md:text-3xl">
      <div className="flex w-max animate-marquee motion-reduce:animate-none">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
