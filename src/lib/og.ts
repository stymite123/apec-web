import type { Accent } from "@/content/schema";

/**
 * Share-image constants. next/og (Satori) can't read CSS variables, so the
 * brand tokens (globals.css) are repeated here as hex values.
 */
export const ogSize = { width: 1200, height: 630 };

export const ogColors = {
  void: "#05060A",
  navy800: "#0E1A2E",
  steel400: "#8A9BB4",
  steel800: "#2A3646",
  silver100: "#EEF1F5",
  brand300: "#5CC2FF",
  rose400: "#E5577A",
  brand500: "#1F7BFF",
};

export const ogAccent: Record<Accent, string> = {
  silver: "#EEF1F5",
  brand: "#1F7BFF",
  ice: "#5CC2FF",
  cobalt: "#0B3FA8",
  wine: "#7A1F33",
};
