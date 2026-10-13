import { Geist, Geist_Mono, Instrument_Serif, Newsreader, Unbounded } from "next/font/google";

/**
 * Display sans (footer wordmark, member pages, menus): Unbounded (Google Fonts, OFL),
 * the brief's free fallback. Replaced Clash Display, whose licence forbids publishing
 * the font file in a public repository (DECISIONS 2026-10-14).
 */
export const displaySans = Unbounded({
  variable: "--font-display-sans",
  subsets: ["latin"],
  display: "swap",
});

export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

/** Accent: one italic word per headline (brief §6.3). */
export const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: "italic",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Display serif for the GSAP Field direction (free, OFL). The reference uses LT Superior
 * Serif (commercial); Newsreader's display optical size is the closest free match.
 */
export const newsreader = Newsreader({
  variable: "--font-newsreader",
  style: ["normal", "italic"],
  axes: ["opsz"],
  subsets: ["latin"],
  display: "swap",
});
