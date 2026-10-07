import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

import { ease, gsapEase } from "@/lib/motion";

/**
 * Single place where GSAP plugins are registered (brief §11).
 * Only plugins in use are registered, to keep the shared bundle small.
 */
gsap.registerPlugin(useGSAP, ScrollTrigger, CustomEase, SplitText);

const toCurve = (points: readonly number[]) => points.join(",");
CustomEase.create(gsapEase.outExpo, toCurve(ease.outExpo));
CustomEase.create(gsapEase.inOutQuart, toCurve(ease.inOutQuart));
CustomEase.create(gsapEase.outBack, toCurve(ease.outBack));

/** gsap.matchMedia condition for "animate". Reduced motion gets the static layout. */
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";

export { gsap, useGSAP, ScrollTrigger, CustomEase, SplitText };
