import { Archivo, JetBrains_Mono, Newsreader } from "next/font/google";

/**
 * Combined system (DECISIONS 2026-10-15, Field + Climb):
 * - Newsreader (Field) for expressive display moments: hero headline, section titles,
 *   manifesto lines, member names, the contact invitation. Optical size 72.
 * - Archivo (Climb) for everything read or operated: nav, buttons, body, captions.
 * - JetBrains Mono only inside demonstrations that show real code or logs.
 */
export const newsreader = Newsreader({
  variable: "--font-newsreader",
  style: ["normal", "italic"],
  axes: ["opsz"],
  subsets: ["latin"],
  display: "swap",
});

/**
 * One variable file (weights only): no width axis and no italic (none is used). Each
 * width/weight combination is an instance the browser builds on the first visit; Climb's
 * width axis cost ~200 ms of layout there. Four static weight files measured worse (they
 * arrive at different moments, each forcing another relayout). Measured 2026-10-15.
 */
export const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
});

/** Only for content that is code-like (the automation demo in "What we do"). */
export const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});
