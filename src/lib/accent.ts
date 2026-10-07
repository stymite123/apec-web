import type { Accent } from "@/content/schema";

/**
 * Per-member accents (brief §6.2): hairlines and glows only — never body text,
 * so small text keeps AA contrast.
 */
export const accentStyles: Record<Accent, { line: string; glow: string }> = {
  silver: { line: "bg-silver-100", glow: "from-silver-100/15" },
  brand: { line: "bg-brand-500", glow: "from-brand-500/25" },
  ice: { line: "bg-brand-300", glow: "from-brand-300/20" },
  cobalt: { line: "bg-steel-300", glow: "from-brand-700/40" },
  wine: { line: "bg-wine-600", glow: "from-wine-600/30" },
};

export const pad = (n: number) => String(n).padStart(2, "0");
