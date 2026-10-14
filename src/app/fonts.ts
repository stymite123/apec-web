import { Archivo, JetBrains_Mono } from "next/font/google";

/**
 * One variable family carries the whole site (DECISIONS 2026-10-14, day redesign):
 * Archivo's width axis does the work — extra-condensed black for title cards,
 * normal width for reading, semi-expanded for small UI labels.
 */
export const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  style: ["normal", "italic"],
  display: "swap",
});

/** Only for content that is code-like (the automation tile in "What we do"). */
export const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});
