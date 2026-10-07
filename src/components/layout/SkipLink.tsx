export function SkipLink({ label }: { label: string }) {
  return (
    <a
      href="#content"
      className="sr-only rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-60"
    >
      {label}
    </a>
  );
}
