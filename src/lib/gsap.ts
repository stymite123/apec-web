import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { ease, gsapEase } from "@/lib/motion";

/**
 * Single place where GSAP plugins are registered (brief §11).
 * Only plugins in use are registered, to keep the initial bundle small;
 * add SplitText / Flip / ScrambleText here when a component first needs them.
 */
gsap.registerPlugin(useGSAP, ScrollTrigger, CustomEase);

const toCurve = (points: readonly number[]) => points.join(",");
CustomEase.create(gsapEase.outExpo, toCurve(ease.outExpo));
CustomEase.create(gsapEase.inOutQuart, toCurve(ease.inOutQuart));
CustomEase.create(gsapEase.outBack, toCurve(ease.outBack));

export { gsap, useGSAP, ScrollTrigger, CustomEase };
