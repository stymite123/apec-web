# Decisions

Format: date · decision · why · alternatives rejected

## 2026-10-08 · Preview feedback round 2 (Mustafa)
- **Gradients, not flat colours:** display text uses a top-to-bottom gradient (`text-grad`, colours via `--g-from`/`--g-to`): hero lines light to deep blue with *Creatives* pink to deep rose; names white to rose; titles, phrases and the tagline band white to grey; buttons, nav CTA, pill dots and scribbles in pinkish-red gradients. Vertical on purpose: letters split for animation each paint their own box, and a vertical ramp stays continuous along a line.
- **Two rendering fixes that came with it:** gradient boxes are padded (equal negative margin, no layout change) so ascenders, descenders and italics are not clipped ("Mustafa" had read "Mustata"); once text is split into gradient letters/lines the parent stops painting (`text-grad-split`), otherwise a ghost copy showed behind the animated letters.
- **Scroll cost:** gradient text repaints while it moves. The hero title, phrase and name letters and the tagline rows get `will-change: transform`; measured A/B on the same build, slowest 5% of desktop frames 25 ms → 11–14 ms.
- **Mian Faizyab** sits 9% lower on his card (his photo frames him higher than the others).

## 2026-10-08 · Preview feedback round 1 (Mustafa)
- **Headline:** "Five specialists. One apex." removed; the hero now reads **"Agency for Professionals, Experienced & Creatives"** (also used as `site.expansion`, footer and share image). *Creatives* in pinkish-red italic.
- **Name:** the agency is **APEC**, never "apex", in all visible copy (contact title now "Bring your next build to APEC.").
- **Intro statement** rewritten (docs/COPY_REVIEW.md).
- **Team cards** show full names (Mian Faizyab kept with the flyer's spelling; Mustafa typed "Fiazyab", to confirm).
- **No repeated photos:** the phrase stage floats the five disciplines as text tags; the services index is text only.
- **What we do** rebuilt as a numbered index: serif titles rise out of a mask, hairlines draw, details fade (once); hover fills the row blackish red; each row links to its lead.
- **"Combined" packages removed** (content and schema); replaced by a tagline band, "Innovate ✦ Grow ✦ Succeed", two scroll-scrubbed rows on blackish red.
- **Palette:** pinkish red (rose-300/400/600), blackish red (oxblood-950…700) and neutral grey (grey-300…900) added across the site; the blue-grey "steel" text and navy panels became grey; buttons (primary) and the nav CTA are pinkish red. Blue stays for the logo, aura and hero headline. Section titles use the display serif.

## 2026-10-08 · Animated preview: GSAP Field rhythm on the lag-fixed hero (Mustafa)
- **Request:** restore the lag-fixed hero (pre-rendered mark + blue aura), keep the blackish theme, and follow The GSAP Field's actual layout rhythm, typography and animation sequences for hero → team. Branch `preview/field-hero`; the rest of the site is unchanged until approved.
- **Reference used for observation only** (screens captured in a browser). No Webflow plan, no source, photos or assets taken. Scribble paths, layout code and copy are our own.
- **Typography:** reference serif LT Superior Serif is commercial, so we use **Newsreader** (Google Fonts, OFL) at its display optical size. Mono = Geist Mono (already loaded).
- **Sequence:** boxed equal-width mono nav with per-section scroll fill → hero title lights up per character, then the mark + aura rise in, nav boxes drop in, captions last (all CSS, runs before hydration, so no load freeze) → a dark rounded panel slides over the sticky hero (intro words light up, arrow draws) → sticky phrase stage (manifesto lines swap by character, scribbles draw, portraits float past) → fade to void → five stacked sticky cards (caption, giant serif call name, person in front, pill + mono line).
- **Replaced on home:** the marquee and manifesto blocks (their lines now play in the phrase stage) and the sideways team track (TeamShowcase is kept in the repo, unused).
- **Exception to transform/opacity:** the scribbles draw with `stroke-dashoffset` on four small SVG paths. Everything else is transform/opacity; sticky positioning is native.
- **Portrait cut-outs** (person in front of their name) are made at build time by `scripts/cutout-portraits.py` (rembg, MIT; isnet model, Apache-2.0), then `pnpm dither` also makes cut-out dither levels and blurred card backdrops. Without cut-outs the cards fall back to the photo.
- **Logo:** `Untitled design.svg` (2026-10-08) is a Canva export wrapping the same raster as `references/brand/apec-logo-source.jpeg`. It is not a vector, so the trace and the render stay TEMPORARY until a real vector arrives.
- **Moving aura (Mustafa: "aura on the logo should move"):** the hero is now two pre-rendered layers from the same 3D scene (`pnpm render:layers`, replaces `render:mark`): the mark as a transparent PNG (black/white difference matting) over an 8 s seamless video loop of the morphing aura (webm 233 KB / mp4 282 KB, cross-faded seam). The video is GPU-decoded and plays after hydration; reduced motion shows its still poster. Still no WebGL for visitors. Rendering exposed a NaN in the aura shader (`pow` of a slightly negative base) that bloom spread over whole frames; fixed with a clamp.
- **Burgundy accent (Mustafa: "a little burgundy premium touch"):** wine-300 `#C45A72` (large/decorative) and wine-200 `#D97A8E` (small text, 6.9:1 on void), used sparingly: italic *One*, a faint low-left hero glow, the panel's leading hairline, phrase and card counters, the card pill dot and a corner glow on the cards. Blue stays the primary accent.
- **Load cost:** below-the-fold scroll animations (intro, phrases, cards, nav fill) are set up in idle-time tasks (`lib/idle.ts`), not during hydration. Profile (`docs/perf/profile-2026-10-08-fieldpreview.json`, 6 runs, medians): desktop blocking 9 ms (lag-fix 33), longest task 58 ms; mobile approx. blocking 323 ms (lag-fix 423, budget 400), longest task 176 ms (budget 250). One of six mobile runs spiked to 788 ms; the C: drive was nearly full during measuring, so re-check on a clean machine and real phones.

## 2026-10-08 · Reduced motion = less movement, not no animation (Mustafa)
- **Why:** Mustafa's Windows has "Show animations" off (common, often for speed), so Chrome reports `prefers-reduced-motion: reduce` and the site showed no animation at all.
- **Rule:** with reduced motion, remove movement (float, tilt, scroll drift, pinned sideways track, marquee, sheet slide) but keep gentle opacity effects: the hero artwork fades in, and portraits dissolve from dither to photo once when in view (time-based, not scroll-scrubbed). The team stacks vertically on every width.
- **Bug fixed alongside:** the 5-screen-wide team track made the desktop page 5,760 px wider than the screen (sideways scrolling). The team section now clips horizontal overflow, and a smoke test fails if the page is ever wider than the viewport.

## 2026-10-08 · Lag fix on the current version (Mustafa)
- **Kept by request:** the APEC mark look (now as pre-rendered artwork) and the dither-to-photo portraits (now pre-generated, improved). Pinned team scroll and editorial layout left as-is until Codex's design replaces them.
- **Live 3D → pre-rendered artwork** (`pnpm render:mark`; WebGL only in the offline `?render-mark` mode). `ENABLE_3D = false`. The artwork is TEMPORARY: rendered from the logo trace.
- **Lenis removed** → native scrolling.
- **`sharp` added as a dev dependency** for build-time dithering (`pnpm dither`); the browser does no image processing.
- Result: desktop first-load blocking 1,237 → 33 ms; mobile approximation 2,618 → 423 ms (target 400 ms). See `docs/PERFORMANCE_REVIEW.md`.

## 2026-10-08 · Redesign constraints after the rejected reel-01 attempt (Mustafa / Codex)
- **Design ownership:** Codex delivers a **static desktop + mobile design**; Mustafa approves it **before** Claude Code implements any visuals. No more coded experiments before the direction is approved.
- **Identity comes from typography, portrait composition and layout**, not glows, giant background words or expensive effects.
- **Native scrolling**, no smooth-scroll easing (Lenis to be removed or disabled in the next build).
- **No live 3D on initial load.** Any metallic artwork is rendered in advance (image or video).
- **Photos prepared beforehand** (build time or by the designer). No image processing in the browser.
- **Motion limited to purposeful transitions**, using transform and opacity only.
- **Performance checked on first visits** with `scripts/profile/profile-home.mjs` budgets (`docs/PERFORMANCE_REVIEW.md`), plus **real phones before launch**.
- **Budget clarification:** initial JS < 250 KB gzipped *excludes* a lazy-loaded 3D chunk, which has its own 400 KB limit (brief §11). The rejected attempt's 287 KB 3D chunk met that limit; the measured first-load freeze is why it was rejected.
- Rejected attempt preserved as tag `design-attempt-reel01`.

## 2026-10-07 · Repo lives in `apec-web/` inside the "website for apec" folder
- **Why:** the brief names the repo `apec-web`; the parent folder name has spaces, which is not a valid npm package name.
- **Rejected:** using the parent folder as the repo root.

## 2026-10-07 · Next.js app scaffolded during Phase 0 (boilerplate only, no hand-written app code)
- **Why:** brief §2.6 says to add project MCP servers after scaffolding (§3.1), but the §2.7 gate expects them before app code. Scaffolding first gives `.mcp.json` a home. Nothing beyond `create-next-app` output exists yet; `shadcn init` and the §3.1 dependencies wait for the Phase 3 plan.
- **Rejected:** creating an empty repo first (create-next-app refuses non-empty folders containing AGENTS.md / CLAUDE.md / .mcp.json).

## 2026-10-07 · Claude Code does coding only
- **Why:** Mustafa's instruction. Design is owned by the design side (Codex / Claude Design); Codex reviews (`/codex:review`) and logins are run by the humans. Claude Code still installs and verifies tooling (Phase 0).
- **Effect:** Claude Code installed the Codex CLI on PATH, the Codex plugin and the Codex MCP servers, and verified them. Codex itself was already installed and logged in via the ChatGPT VS Code extension.

## 2026-10-07 · pnpm installed with `npm i -g pnpm` instead of corepack
- **Why:** Node lives in `C:\Program Files\nodejs`; `corepack enable` writes shims there and needs admin. npm's global prefix is in the user profile.

## 2026-10-07 · Skills installed at project level, copied (not symlinked)
- **Why:** keeps skills versioned with the repo for both agents (`.claude/skills/`, `.agents/skills/`, `skills-lock.json`); symlinks need admin/Developer Mode on Windows.
- **Scope:** all 8 GSAP skills; Vercel `vercel-react-best-practices`, `web-design-guidelines`, `vercel-composition-patterns`, `vercel-react-view-transitions`, `deploy-to-vercel`; Anthropic `frontend-design` (as a skill instead of the `/plugin` — same guidance, no interactive plugin install needed).
- **Rejected:** Vercel `react-native`, `cli-with-tokens`, `optimize`, `writing-guidelines` (out of scope).

## 2026-10-07 · `.mcp.json` uses `cmd /c npx` and includes context7
- **Why:** on native Windows, stdio MCP servers launched via `npx` need the `cmd /c` wrapper. Context7 is used without an API key, so the brief's reason for user scope (keeping a key out of the repo) doesn't apply.
- **Trade-off:** a teammate on macOS/Linux must replace `"command": "cmd", "args": ["/c", "npx", ...]` with `"command": "npx", "args": [...]` (or use a personal `.mcp.json` override).

## 2026-10-07 · Codex MCP servers also use `cmd /c npx`
- **Why:** same Windows reason as `.mcp.json`; added with `codex mcp add <name> -- cmd /c npx -y <pkg>` (global `~/.codex/config.toml`).

## 2026-10-07 · Next.js docs bundled in `node_modules/next/dist/docs/` are the primary API reference
- **Why:** create-next-app 16.3.8 ships version-matched docs and its AGENTS.md block requires reading them; they can't be stale relative to the installed version.

## 2026-10-07 · ffmpeg from a GitHub-hosted build
- **Why:** Gyan full and essentials downloads (gyan.dev) both stalled; switched to `BtbN.FFmpeg.GPL.9.0` (GitHub releases). Frame extraction (§5.2) needs any recent build.

## 2026-10-07 · Phase 3 split: technical foundations now, signature visuals after design approval
- **Why:** brief §14 orders design approval (Phase 2) before Phase 3; design work hasn't finished. Design side's recommendation: Claude Code owns app code, the design side owns design and visual review. Phase 3 is limited to tokens, fonts, content schemas, providers, accessibility and a placeholder home page. Preloader, custom cursor, animated footer wordmark, final nav styling, grain/backdrop and the 404 animation wait for the approved design. Details: `docs/PHASE3_PLAN.md`.
- **Rejected:** building all foundations from the brief alone (risk of rework and of design decisions being made in code).

## 2026-10-07 · Answers to open questions 4, 7, 9, 10 (Mustafa)
- **Atlus Bank is named publicly** on Mustafa's page (`currently.public: true`), so no "US bank" fallback field is added to the data model.
- **Location line:** "Pakistan · Remote · Worldwide".
- **English only for v1:** no `/[locale]` routing; `lang="en"`. Urdu would need a route migration later.
- **Logo:** no designer SVG yet → temporary trace (see next entry).

## 2026-10-07 · Headline, sound, domain (Mustafa)
- **Hero headline:** "Five specialists. *One* apex." ("One" in Instrument Serif italic). Chosen ahead of Phase 2; the design side still owns how it's set.
- **Sound:** none in v1; `ENABLE_SOUND` stays `false` and no toggle is built.
- **Domain:** undecided; `metadataBase` reads `NEXT_PUBLIC_SITE_URL` with a localhost fallback.

## 2026-10-08 · Team, brand name and titles (Mustafa)
- **The website shows five people**, the ones with photos, in brief role order: 01 `muhammad-huzaifa` Muhammad Huzaifa · 02 `mustafa-ishaq` Mustafa Ishaq · 03 `hamad-alam` Hamad Alam · 04 `mian-faizyab` Mian Faizyab · 05 `abdur-rahman` Abdur Rahman. Accents follow brief §6.2 by position (silver, brand, ice, cobalt, wine). Headline and 01/05 numbering unchanged.
- **Not on the website:** Kiran Ijaz (Digital Marketer) and Zohra Parwez (Content Writer), who appear on the agency flyer.
- **Brand name: "APEC Digital"** (matches the flyer and email) in titles, metadata and footer. Page title pattern becomes `{Name} — {Role} | APEC Digital`. Logo mark unchanged.
- **Job titles from the flyer:** SEO & ML Engineer · AI Agent Engineer · Web Developer · App Developer · Graphic Designer. These replace the brief §9.2 role names; member 01 is no longer "Content Writer".
- **Spelling:** "Abdur Rahman".
- **Concept:** The Ascent, provisional (design side; final after the reels).

## 2026-10-08 · Contact, APEC expansion, mobile apps, photos (Mustafa + design side)
- **Contact:** contact.apecdigital@gmail.com; phone + WhatsApp +923265698123.
- **APEC** = "Agency for Professionalism, Experience and Creativity".
- **Member 04 (Mian Faizyab) builds mobile apps**, not web apps. Brief copy that says "web apps" (§1 sub-headline draft, §8.1 services/packages such as "Automate: AI + web app") must be revised before Phase 4 service copy is finalised.
- **Photos:** the received copies are used for initial layouts; sharpness is checked at display size before asking for replacements.

## 2026-10-08 · Fast path to a v1 launch (Mustafa)
- **Build visuals now from the brief** (The Ascent, §6 tokens/type/motion); the design side reviews the live preview afterwards instead of approving mockups first. Supersedes the "defer signature visuals" part of the Phase 3 split.
- **Claude drafts missing copy** (sub-headline, meta description, manifesto, services, process, member headlines) from known facts only — no invented clients, results or experience. Every draft is listed in `docs/COPY_REVIEW.md` for approval.
- **Contact in v1 = email + WhatsApp buttons.** The Resend form (brief §13) moves to after launch.
- **Deferred past v1:** 3D hero (static mark instead), preloader, custom cursor, case studies, contact form.
- **Skills:** the "known skills" from brief §9.2 / the flyer are treated as confirmed facts and shown without a level until members confirm levels; candidate skills stay hidden.

## 2026-10-08 · Clash Display is committed to the repo
- **Why:** the ITF Free Font License allows commercial use and self-hosting on our own site, and internal sharing within the organisation. It forbids modifying the file (incl. subsetting/format conversion) and redistributing it. The variable WOFF2 is used unmodified, with the licence file beside it.
- **Condition:** the repo must stay private. If it ever becomes public, remove the font from git history and fetch it at build time instead.

## 2026-10-08 · Lenis `anchors` off; own reduced-motion hook
- Lenis' `anchors` option intercepts in-page links, which stopped the skip link from moving focus to `#content`; anchors now jump natively.
- `usePrefersReducedMotion` (matchMedia + `useSyncExternalStore`) instead of Motion's hook, so Motion loads only where it's used.

## 2026-10-07 · Temporary logo is labelled as temporary everywhere
- **Why:** only a raster logo exists (`references/brand/apec-logo-source.jpeg`). A rough SVG trace is needed for development, but it must not become the brand asset by accident. It lives in `TemporaryApexMark.tsx`, carries `data-temporary-logo`, is listed by the build's TODO report, and is not used for the favicon, OG image or any exported asset.
