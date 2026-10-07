/**
 * Motion tokens (brief §6.5), shared by GSAP and Motion.
 * CSS equivalents live in globals.css (`--ease-*`).
 */

/** Cubic-bezier control points, for Motion's `ease` option. */
export const ease = {
  outExpo: [0.16, 1, 0.3, 1],
  inOutQuart: [0.76, 0, 0.24, 1],
  outBack: [0.34, 1.56, 0.64, 1],
} as const;

/** GSAP CustomEase names registered in lib/gsap.ts. */
export const gsapEase = {
  outExpo: "apex.outExpo",
  inOutQuart: "apex.inOutQuart",
  outBack: "apex.outBack",
} as const;

/** Seconds. */
export const duration = {
  micro: 0.2,
  ui: 0.4,
  reveal: 0.9,
  heroIntroMax: 2.2,
} as const;

export const stagger = 0.06;

/** ScrollTrigger `scrub` smoothing. */
export const scrub = 0.8;
