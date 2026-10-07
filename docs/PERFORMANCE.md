# Performance

Budgets (brief §11, mobile Lighthouse): Performance ≥ 90 · Accessibility ≥ 95 · Best Practices ≥ 95 · SEO = 100 · LCP < 2.5 s · CLS < 0.1 · INP < 200 ms · initial JS < 250 KB gzip.

## Phase 3 baseline — 2026-10-08

Placeholder home page, production build (`next start`), `lhci autorun` (mobile, simulated throttling), 3 runs on this Windows laptop.

| Run | Perf | A11y | BP | SEO | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|
| 1 | 0.78 | 1.00 | 1.00 | 0.90 | 2.6 s | 770 ms | 0 |
| 2 | 0.90 | 1.00 | 1.00 | 0.90 | 3.3 s | 110 ms | 0 |
| 3 | 0.65 | 1.00 | 1.00 | 0.90 | 3.1 s | 2,040 ms | 0 |

- **Median performance 0.78** (below 90). Variance is high: one style/layout task ranged 154 ms → 2,080 ms between identical runs. A Chrome trace with real 4× CPU throttling (Playwright) showed no task over ~240 ms (framework script evaluation ≈ 200–240 ms, first layout of 165 elements ≈ 120–140 ms), so the spikes are machine contention under simulated throttling. Re-measure on Vercel previews / PageSpeed Insights before tuning.
- **SEO 0.90:** no meta description yet (draft added in v1 build).
- **Initial JS ≈ 212 KB gzip** (modern browsers; the 38.5 KB `noModule` polyfill chunk is excluded): React DOM ≈ 70 KB, Next runtime ≈ 44 KB, GSAP + ScrollTrigger + CustomEase + Lenis + Radix + icons ≈ 78 KB.
- **LCP element:** the hero `<h1>` (text, as intended).
- Lighthouse can't audit the 404 page (it refuses non-200 documents).

### Levers if performance stays under 90
1. Lazy-load the mobile menu's Radix Sheet on first open (≈ 15–20 KB off the shared chunk).
2. Load GSAP/ScrollTrigger only in components that animate, not in the root provider.
3. Check `render-blocking-resources` (one CSS file, ~200 ms) — inline critical CSS via `experimental.inlineCss` if it stays.
