# Performance review: rejected hero + team design

**Date:** 2026-10-08
**Build:** tag `design-attempt-reel01` (commit `488babb`), profiled on branch `perf/profile-reel01`
**Question:** what causes the first-load hitch and the lag in the hero + team design? Measured, not assumed.

## Summary

1. **The first-load freeze comes from the 3D hero, and mostly from one part of it: the metallic, environment-lit APEC mark.** On desktop, turning the 3D off cuts main-thread blocking from **1,237 ms to 59 ms**. Turning off only the mark, or only its reflection lighting, cuts it to about **320–370 ms**.
2. **The 3D code adds 287 KB gzipped (1,063 KB raw) of JavaScript.** That alone exceeds the brief's 250 KB budget for initial JS.
3. **Generating the photo dither in the browser costs 0.15–0.2 s on desktop and about 0.6 s on a throttled phone CPU.** It's the largest cost left once the 3D is gone.
4. **Bloom costs about 0.3 s and the liquid gradient about 0.2 s** of desktop blocking.
5. **The pinned horizontal team scroll had no measurable cost**, either at load or while scrolling.
6. **Scrolling measured smooth** in every variant: no long tasks and no frames over 34 ms during the scroll test. The lag people feel is most likely:
   - the main-thread freeze 1–2 s after load, when the 3D starts
   - the 3D popping in late (it's ready 1.4–2.1 s after the page goes idle)
   - Lenis smooth-scroll easing, which deliberately delays scroll response. That's a "feel" issue this test can't capture.

## Method

- Production build (`next build` + `next start`), home page.
- **A fresh, visible (headed) Chrome for every run**, so every run is a true first visit with cold caches and no compiled shaders. Headless Chrome was ruled out: it reads every frame back from the GPU, which inflated long tasks to about 8 s and doesn't reflect real browsers.
- **Desktop:** 1440×900, DPR 1, this laptop's NVIDIA GPU, no throttling.
- **Mobile (approximation):** 390×844, DPR 3, 4× CPU throttling. The GPU is still the laptop's, so phone GPU limits aren't captured.
- Each variant switches off **one** effect with the temporary `?perf-off=` switch (`src/lib/perf-switches.ts`); `full` has everything on.
- **Load window:** first 6 s after `load`. "Blocking" = the sum of (long task − 50 ms), the same idea as Lighthouse's Total Blocking Time.
- **Scroll window:** 70 wheel steps × 110 px (through the hero and the whole pinned team track), then 1.5 s settle. Every frame's duration is recorded.
- **3 runs per variant; medians shown.** Raw data: `docs/perf/profile-2026-10-08.json`. Script: `scripts/profile/profile-home.mjs`.

## Results: first load

### Desktop (median of 3 runs)

| Variant | Blocking | Longest task | Long tasks | 3D ready after idle | JS transferred |
|---|---|---|---|---|---|
| **full** | **1,237 ms** | **935 ms** | 7 | 1,430 ms | 525 KB |
| no 3D (static mark) | 59 ms | 87 ms | 2 | — | 238 KB |
| no mark (3D on, mark hidden) | 319 ms | 176 ms | 5 | 584 ms | 525 KB |
| no reflections (env lighting off) | 369 ms | 227 ms | 5 | 594 ms | 525 KB |
| no bloom | 937 ms | 898 ms | 3 | 1,395 ms | 525 KB |
| no liquid blob | 1,012 ms | 827 ms | 6 | 1,321 ms | 525 KB |
| no dither | 1,173 ms | 892 ms | 4 | 1,387 ms | 525 KB |
| no pin | 1,202 ms | 908 ms | 4 | 1,402 ms | 525 KB |

Run-to-run spread on desktop was small (e.g. full: 1,180–1,283 ms; no 3D: 46–80 ms).

### Mobile approximation (4× CPU, median of 3 runs)

| Variant | Blocking | Longest task | Dither time |
|---|---|---|---|
| **full** | **2,618 ms** | **1,382 ms** | 587 ms |
| no 3D | 776 ms | 209 ms | 565 ms |
| no mark | 1,930 ms | 551 ms | 581 ms |
| no reflections | 1,995 ms | 503 ms | 576 ms |
| no blob | 2,520 ms | 1,152 ms | 586 ms |
| no bloom | 2,642 ms | 1,399 ms | 557 ms |
| no dither | 2,549 ms | 1,404 ms | 0 ms |
| no pin | 3,003 ms | 1,399 ms | 554 ms |

Mobile runs were noisier (e.g. no pin: 2,879–3,413 ms). Differences under about 300 ms aren't meaningful.

### First contentful paint

FCP was about 0.4–0.6 s (desktop) and 0.5–0.8 s (mobile) in every variant. The 3D is lazy-loaded after the text paints, so the freeze comes *after* the page appears. That's exactly when a visitor starts scrolling, which is why it reads as lag.

## Results: scrolling

| Profile | Long tasks while scrolling | 95th-percentile frame | Worst frame | Frames over 34 ms |
|---|---|---|---|---|
| Desktop, all variants | 0 | 4 ms | 36–39 ms | 0 % |
| Mobile approx., all variants | 0 | 11 ms | 43–47 ms | 0 % |

Once loaded, scrolling (including the pinned horizontal track and the dither resolve) didn't drop frames in this test. A 4 ms 95th-percentile frame means the display refreshes faster than 60 Hz; that's normal here.

## What causes the freeze

- **The mark's metal materials with environment reflections** are the main cost. Removing either the mark or the reflection lighting removes about 0.9 s on desktop (0.6–0.7 s on mobile).
- **Likely mechanism, not proven:** `compileAsync` compiles the materials before the reflection map exists. When the map arrives, the materials recompile synchronously on the first frame. That fits two observations: blocking stays high even with async compilation, and the 3D only becomes ready about 1.4 s after it starts loading.
- **The 287 KB gzipped 3D bundle** is parse and execute work on every first visit. It explains part of the remaining 3D cost (≈ 260–320 ms desktop with the mark or reflections off), together with the bloom and blob passes.
- **Runtime dither:** 15 canvases (3 detail levels × 5 photos) generated with `getImageData` on the main thread while images load.
- **Baseline without 3D:** 59 ms desktop (fine). On mobile it's 776 ms: hydration, GSAP + Lenis setup, and about 0.57 s of dither.

## Proposed fixes for the next design

These are rules for whatever design is approved next; nothing has been changed in the site.

1. **No real-time WebGL as a first-load hero by default.** If 3D is part of the approved design, use one of these:
   - a **pre-rendered loop** (short WebM/AV1 or an AVIF/WebP image sequence of the mark), which costs almost no main thread
   - a **cheap material**: matcap textures instead of reflection lighting. The measured version of this (reflections off) cut blocking by about 70 %. Load it only when the hero is visible on a capable device, and never on phones.
2. **If live 3D is kept:** make sure the reflection map exists *before* compiling the shaders, and keep the 3D bundle out of the first load (download it on idle, or after the first interaction).
3. **Drop bloom and full-screen glow passes.** If a glow is part of the design, fake it with a blurred image or a CSS radial gradient (bloom costs ≈ 0.3 s desktop).
4. **Don't do image processing in the browser.** If dithered or duotone portraits are approved, generate them at build time as small PNG/AVIF files (a `sharp` script). That removes about 0.6 s of main-thread work on phones.
5. **The pinned horizontal scroll is affordable** if the design wants it. Keep the keyboard fix (focusing a slide scrolls to it) and the vertical fallback on phones and with reduced motion.
6. **Decide deliberately on Lenis smooth scrolling.** Its easing adds intentional scroll latency that some people feel as lag. Options: turn it off, shorten the easing, or keep it only where a section really needs scrubbed motion.
7. **Budgets the next build has to meet**, measured with this script (first visit, headed Chrome):
   - **Desktop:** under 200 ms blocking, no task over 150 ms.
   - **Mobile approximation:** under 400 ms blocking, no task over 250 ms.
   - **Initial JS:** under 250 KB gzipped, as the brief requires.

## Not covered

- **Real phones** (GPU, thermals and touch scrolling) and Safari/Firefox. Test on at least one mid-range Android and one iPhone before launch.
- **Input latency and the "feel" of smooth scrolling.**
- **Lighthouse scores** for this design. The earlier placeholder baseline is in `docs/PERFORMANCE.md`.

## Re-running

```bash
pnpm build && pnpm exec next start -p 3000
node scripts/profile/profile-home.mjs 3 > docs/perf/<date>.json
```
The `?perf-off=` switches exist only on branch `perf/profile-reel01`.
