import type { Accent } from "@/content/schema";

/**
 * Share-image constants. next/og (Satori) can't read CSS variables, so the
 * brand tokens (globals.css) are repeated here as hex values.
 */
export const ogSize = { width: 1200, height: 630 };

export const ogColors = {
  night950: "#060A20",
  night700: "#1E2B6E",
  night300: "#9AA6D4",
  night800: "#131B4E",
  star: "#EEF1F8",
  brand300: "#5CC2FF",
  apricot: "#F3A86B",
  brand500: "#1F7BFF",
};

export const ogAccent: Record<Accent, string> = {
  silver: "#EEF1F5",
  brand: "#1F7BFF",
  ice: "#5CC2FF",
  cobalt: "#0B3FA8",
  wine: "#7A1F33",
};
