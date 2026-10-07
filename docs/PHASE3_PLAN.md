# Phase 3 — Technical foundations (plan)

**Status:** revised 2026-10-07 after design feedback · approved · **done 2026-10-08** (build, lint, typecheck, 14 smoke tests green; Lighthouse baseline in `docs/PERFORMANCE.md`). Superseded for later phases by the fast-path decision (DECISIONS 2026-10-08) · owner of app code: Claude Code · owner of design + visual review: Codex (design side)

## Context

Brief §14 puts Phase 1 (reference intake) and Phase 2 (design approval) before Phase 3. Neither is complete yet. By agreement, Phase 3 runs **in parallel with design work** and is limited to **neutral technical foundations**: tokens, fonts, content schemas, providers, accessibility, and a placeholder home page. Signature visuals wait for the approved design.

Phase 0 is **not fully closed** — outstanding checks are listed in `docs/SETUP_LOG.md` and stay open until a human ticks them.

Source of truth: `docs/APEC_BUILD_BRIEF.md`. API reference: `node_modules/next/dist/docs/` + project skills (`.claude/skills/`).

## Scope

### In Phase 3 (now)

**0. Git** — commit the Phase 0 state on `main`, then work on `feat/phase3-foundations` with small conventional commits (local only; approved).

**1. Dependencies (brief §3.1, no version pinning)**
- `shadcn init` (Tailwind v4, dark, CSS vars) + `dialog sheet tooltip form input textarea select button sonner` (check current component names in shadcn docs first).
- `gsap @gsap/react lenis motion three @react-three/fiber @react-three/drei @react-three/postprocessing react-hook-form zod @hookform/resolvers resend simple-icons @vercel/analytics @vercel/speed-insights`
- dev: `@types/three prettier prettier-plugin-tailwindcss @playwright/test @lhci/cli` + Playwright Chromium.
- Only allow pnpm build scripts that are actually required. Scripts: `format`, `typecheck`, `e2e`, `lhci`; `.prettierrc` with the Tailwind plugin.

**2. Tokens & global CSS** (`src/app/globals.css`)
- Brief §6.8 `@theme` (colours, fonts, eases, radius), fluid type tokens (§6.3 `clamp()`s), gradient tokens.
- shadcn semantic variables mapped to the tokens; dark-only (`class="dark"`, `color-scheme: dark`).
- Base layer: `::selection`, `brand-500` focus-visible ring, `prefers-reduced-motion` resets, container utility (max 1440, gutters `clamp(1rem,4vw,3rem)`).

**3. Fonts** (`src/app/fonts.ts`)
- Clash Display from Fontshare, self-hosted in `src/assets/fonts/` **with its licence file**; confirm commercial web use before committing (fallback: Unbounded / Syne).
- Geist, Geist Mono, Instrument Serif (italic) via `next/font/google`.

**4. Content model** (`src/content/`)
- `schema.ts`: zod schemas for `TeamMember` (exactly brief §9.1) and `Site`. `TODO:` strings bypass length/word-count rules.
- `team.ts`: the five — 01 Muhammad Huzaifa (SEO & ML Engineer), 02 Mustafa Ishaq (AI Agent Engineer), 03 Hamad Alam (Web Developer), 04 Mian Faizyab (App Developer), 05 Abdur Rahman (Graphic Designer); slugs = kebab-case names; bios, skills, projects etc. are `TODO:`; all skills `confirmed: false` until members confirm levels; Mustafa's `currently` = Atlus Bank (USA), `public: true` (Q4). No portraits wired yet (received photos are under the brief's resolution; grading is the design side's). Parsed at load → **invalid data fails the build**.
- `site.ts`: name "APEC Digital", tagline "Innovate | Grow | Succeed", nav links, CTA label, §1 sub-headline draft, location line "Pakistan · Remote · Worldwide" (Q7), email contact.apecdigital@gmail.com, phone + WhatsApp +923265698123 (Q6), APEC expansion "Agency for Professionalism, Experience and Creativity"; socials `TODO:`. The §1 sub-headline draft mentions "web apps" — use it only with a `TODO:` note until the copy is revised for mobile apps. English only, `lang="en"`, no locale routing (Q9).

**5. Lib** (`src/lib/`)
- `flags.ts`: `SHOW_WORK`, `SHOW_TESTIMONIALS`, `ENABLE_SOUND`, `ENABLE_3D` — all `false`.
- `todo.ts`: `isTodo()`, `collectTodos()`; `next build` logs a warning listing every TODO.
- `motion.ts`: §6.5 durations/eases as constants.
- `gsap.ts`: registers GSAP plugins once (`useGSAP`, ScrollTrigger, SplitText, Flip, ScrambleText, CustomEase).

**6. Providers** (`src/providers/`)
- `GsapRegister`: plugin registration + `ScrollTrigger.refresh()` after fonts/load.
- `SmoothScroll`: Lenis (`lenis/react`) driven by `gsap.ticker`, synced to ScrollTrigger; off under reduced motion.

**7. Neutral layout components**
- `SkipLink` → `#content`.
- `Nav` — **functional, neutral styling**: semantic `<nav>`, links (Team · Services · Process · Contact), CTA link, keyboard-accessible. `MobileMenu` — shadcn Sheet with Radix focus trap, Esc to close. No hide-on-scroll, magnetic CTA or menu choreography yet.
- `Footer` — **plain structure**: links, socials (TODO-gated), © year. No giant animated wordmark yet.
- `dev/Todo` — dev: dashed `wine-400` outline + TODO text; production: renders nothing.

**8. Temporary logo — clearly labelled**
- `src/components/brand/TemporaryApexMark.tsx`: rough inline-SVG trace of `references/brand/apec-logo-source.jpeg`, parts addressable (left stroke, right stroke, 3 bars, swoosh) for later animation work.
- Labelled everywhere: file name, `data-temporary-logo` attribute, header comment `TEMPORARY — replace with designer SVG (brief §6.1)`, a `TODO:` entry so `next build` lists it, and a DECISIONS entry.
- Not used for the favicon, OG image or any exported asset. Next's default favicon stays until the designer's favicon set arrives.

**9. Routes**
- `layout.tsx`: fonts, `class="dark"`, `metadataBase` from `NEXT_PUBLIC_SITE_URL`, title template `%s | APEC Digital`, description = `TODO: SEO copy` (member 01 owns it, brief §12; the §1 draft needs revising for mobile apps), `themeColor #05060A`; providers → SkipLink, Nav, `<main id="content">`, Footer.
- `page.tsx`: **placeholder only** — h1 "Five specialists. *One* apex." (chosen 2026-10-07; styling is the design side's), sub-headline draft, location line, empty anchored sections `#team #services #process #contact`.
- `not-found.tsx`: static, "This peak doesn't exist.", link home. (Falling-bars animation deferred.)
- `next.config.ts`: `images.formats: ['image/avif','image/webp']`.
- Remove create-next-app demo SVGs from `public/`.

**10. Docs** — `DECISIONS.md` (fonts + licence, TODO mechanism, temporary logo, Phase 3/design split); `PERFORMANCE.md` (Lighthouse baseline).

### Deferred until the approved design (Phase 2 → design side signs off)
- Preloader (logo assembly, counter, curtain) and the session-skip logic.
- Custom cursor (dot + ring, "VIEW" state) and spotlight.
- Footer giant wordmark fill animation.
- Final Nav styling: glass treatment, hide-on-scroll, magnetic CTA, full-screen menu choreography.
- Film grain and triangle-grid / glow backdrop.
- 404 falling-bars animation.
- Favicon set, OG images and anything else using the real logo.

## Verification
1. `pnpm lint` · `pnpm typecheck` · `pnpm build` green; build log lists the TODOs (including the temporary logo).
2. Break `team.ts` on purpose → build fails with a zod error → revert.
3. Playwright smoke (`e2e/smoke.spec.ts`, Chromium, 1440 + 390 + reduced motion): home loads with no console errors, nav anchors work, mobile menu opens/closes with Esc and traps focus, skip link reaches `#content`, unknown URL shows the 404, no `TODO:` text in a production build.
4. 1440 / 390 screenshots handed to the design side for visual review (not judged by Claude Code).
5. Lighthouse (mobile) on `/` and the 404 against `pnpm start` → `docs/PERFORMANCE.md`.
