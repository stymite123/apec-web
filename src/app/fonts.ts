import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import localFont from "next/font/local";

/**
 * Clash Display (Fontshare, ITF Free Font License — src/assets/fonts/ClashDisplay-LICENSE-FFL.txt).
 * The licence forbids modifying the file (incl. subsetting/format conversion):
 * it is served exactly as downloaded. Keep the repo private (DECISIONS 2026-10-08).
 */
export const clashDisplay = localFont({
  src: "../assets/fonts/ClashDisplay-Variable.woff2",
  variable: "--font-clash",
  weight: "200 700",
  display: "swap",
  preload: true,
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
