# Decisions

Format: date · decision · why · alternatives rejected



## 2026-10-15 · Preview 1 fixes (Mustafa)
- **Team portraits are colour again.** The cards start as colour pixels and resolve into the original photo: `pnpm dither` now also writes `public/team/pixel/<slug>-{0,1}.png` (26 px and 64 px colour versions of the cut-out, scaled up with `image-rendering: pixelated`). The grayscale filter and the silver dither layers are gone from the cards.
- **SEO & Machine Learning demo floats** like the Mondragon 4 reel Mustafa sent: the Bing, Google and AI-answer cards are three planes at different depths, each drifting and turning on its own (`plane-a/b/c` keyframes, transform only, paused off screen with `.loop`).
- **Phone hero.** The mark now fills the height left under the copy (square box, `h-full max-h-[min(40svh,320px)]`, `md:contents` wrapper keeps the desktop layout), so it is never cropped by the fold or pushed into the ridges. Hero minimum height 640 → 560 px, which is what overflowed on short screens (360×620).
- **"AI makes us fast." clipping** was checked at 320–820 px on the combined build: no overflow and no clipped glyphs. The clipped "t" is on the live site (apecdigital.tech still serves Climb, where the phrase is condensed caps that run past the right edge) — fixed by the combined build itself.

## 2026-10-15 · Field + Climb combined — Preview 1 (Mustafa, with Codex review)
- **Branch** `feat/combined` from Climb; sources tagged `source/field` (5d3b2c7) and `source/climb` (8c1551a). Codex's rejected study is stashed (`codex-study-rejected`), not deleted.
- **Type:** Newsreader (Field) for expressive display (hero, section titles, manifesto lines, member names); Archivo (Climb) for nav, buttons, body and captions; JetBrains Mono only inside demos.
- **Colour:** blue is the one interactive accent (`action-600`, white text 4.6:1); rose is secondary (the hero accent word, later contact/footer); peach only in scenery. Climb's apricot UI accents replaced.
- **Nav:** Climb's island with one stable pill shape (no reshaping or skew); only surface and text colours follow the section; blue Contact; indicator ≈250 ms; CSS entrance (0.4 s, ends ≈1.4 s) so links work at once. Section positions stay cached and are re-measured on resize, ScrollTrigger refresh and font load.
- **Hero:** Field composition (Newsreader headline on the left, lines revealed in sequence, rose italic *Creatives*) with Climb's lag-fixed mark and prepared aura still on the right. The aura fades in after the mark, then drifts, turns and breathes (CSS, composited). Lowered night horizon. Phones: copy first, the mark in the flow beneath. Decorative motion pauses once the dawn panel covers the hero.
- **Dawn manifesto:** Field's statements in Newsreader on Climb's sky with a pale wash; five labels in one chip family (SEO & ML, AI agents, Web development, Mobile apps, Graphic design). Desktop pin ≈2.2 viewport heights including the stage; phones and reduced motion unpinned (IntersectionObserver arrivals). No drag in this pass.
- **Signature A (orbit):** three prepared SVG arcs: across the hero/dawn edge (scroll-drawn), under "You get both.", and the line under "The Five". Measured stroke-dashoffset exception.
- **Team:** Climb's aligned black-and-white row; formation entrance centre-out (signature B); hover/focus lift, slim blue edge and name underline, the others stay clear; portrait and name are one link to the member page; phones: swipe row with previous/next and "1 / 5".
- **First-visit performance** (`docs/perf/profile-2026-10-15-*.json`). Climb baseline on this machine: desktop 454 ms blocking (longest task 468 ms), mobile 955 ms. Cause: one huge first layout, mostly text shaping and building variable-font instances (Climb's Archivo width axis, and the service mock-ups' ~210 text pieces in ~29 font/size combinations under CSS zoom). Fixes: Archivo weights only (no width axis, no italic; four static weight files measured worse); service scenes load as the section approaches (fixed-height stages, no shift); below-the-fold sections use `content-visibility: auto`, with ScrollTrigger re-measured when the page height changes. Preview 1: desktop 107 ms blocking (longest task 156 ms median), mobile 199 ms (longest 226 ms); initial JS 229 KB.
- **Next (Preview 2):** services index with demo stage, process rail/payoff/blueprint, contact and footer styling, member pages. From Mustafa's reel (2026-10-15): Mondragon's large service list with hover-revealed previews (→ the services index and stage) and Mondragon 4's layered floating planes (→ the Brand & Graphic Design demo).

## 2026-10-15 · Round 3: image quality, aligned team, no lag (same branch)
- **Feedback:** team photos had lost quality (the dither panels), heads sat at different heights, the pixel-to-photo change should be smooth and fast, no per-member link/profile buttons; "How we work" was cut off while animating; the hero copy looked big and unprofessional; no lag anywhere.
- **Team:** five equal black-and-white cards with crisp photos (next/image, quality 85). Heads are aligned: `pnpm framing` (scripts/portrait-framing.mjs) measures each cut-out's head from its alpha channel into `src/content/framing.ts`; cards place each photo in container units so every head has the same top and width (one hand tune for Mustafa's hair). The pixel → photo change runs once when the row enters view: coarse dither → fine dither → photo as an opacity crossfade, 90 ms apart (no stepping, no layout). No links or buttons on the cards; the services "Led by" chips are plain labels too. Member pages still exist (sitemap, direct links).
- **How we work:** sized from the viewport height as well as width (title, steps, hexagons, and the stage zoom via height ranges), so the whole scene stays visible while it animates, e.g. at 1517×704. Blocks drop from half the height.
- **Hero:** headline is now semibold sentence case on two lines (min(3.7vw, 6.4svh)), quieter sub-headline, smaller buttons.
- **Performance** (frame times while scrolling the production build, `p50 / p95`, ms): before — desktop hero ~49 / 67, dawn 33 / 51, frames up to 500; after — every section 16.7 median on desktop, p95 ≤ 33 in most; phones (4× CPU throttle) 16.7 median in every section except the hero's first frames. Changes:
  - Scenery is drawn to WebP at build time (`pnpm art`); the static parts are merged into opaque skies (night sky + stars; dawn sky + far clouds + hills).
  - The hero no longer uses `mix-blend-mode`: the aura still has real transparency (`pnpm aura`, scripts/aura-alpha.mjs). The aura video loop is replaced by that still with a slow composited drift (decoding the video under the blend cost frames); the video files stay in public/brand for now.
  - The hero stops rendering once the dawn panel covers it; the dawn panel's slanted edge is a small cap instead of a clip-path on the 4,000 px panel.
  - Images: WebP only (AVIF decodes too slowly for this many large images).
  - Nav: section positions measured once (and on resize), scroll frames only compare numbers; no backdrop blur. Film-grain overlay removed.
  - Showcase loops are composited only: typing and chart reveals are scaling covers, the map car and workflow packets move with Web Animations transforms (PathMotion) and pause off screen; fewer 3D layers.
  - Phones: the dawn lines move as whole lines (no per-letter tweens) and the streaks are off.

## 2026-10-14 · Redesign round 2: professional pass (same branch)
- **Feedback:** hero title too big (it ran into the sub-headline on wide screens); team should be a professional black-and-white section, not anime, without the separate roster "contacts"; "What we do" should show realistic 3D devices (crypto site, a cool app, Google/Bing/AI search, real automation, anime + realistic art and logos); "How we work" should drop the anime style; nav "Start a project" and "Contact" merged.
- **Hero:** title, line and actions are one stacked block; title size = min(5.8vw, 9.6svh), so it never reaches the scenery. Ridges now scale by width (2400-wide art) and are bottom-anchored, so peaks are never cropped flat.
- **Nav:** one "Contact" button replaces "Start a project" and the Contact link (it shows as current in the contact section). New themes: `mono` (team), `graphite` (process); `paper` is now a calm white pill (the neo-brutal box went with the old bento).
- **Team:** black and white. Desktop: an accordion of five portrait panels; the hovered or focused one opens, its silver dither resolving into the B&W photo (registered `@property --resolve`, pure CSS, no JS). Phones: a swipe row. The roster and per-member "Meet" buttons are gone; each panel links to the profile. Member pages use the same B&W portrait. Per-member stage colours removed. The dawn wipe now cuts to black.
- **What we do:** alternating rows: a studio stage with a CSS-3D scene (pointer tilt, loops run only on screen) beside title, summary and the lead. Scenes: Bing / Google / AI-answer cards in depth (your result climbs to #1, the answer cites you); an n8n-style workflow with real app icons (Gmail → AI agent with Claude, memory, Sheets → If → HubSpot / WhatsApp), packets on the wires and an execution log; a laptop (lid, keyboard, trackpad) running a crypto exchange with a live price tape, a drawing chart and drifting prices; two phones (music app whose cover is our anime art, live ride tracking); an exhibition of our own identity (anime poster, realistic 3D render of the mark, logo system, business cards). No WebGL: CSS 3D + `zoom` per breakpoint. Brand logos from `simple-icons` (Bing, OpenAI and Slack are not in it: Bing is a simplified drawn mark, ChatGPT is text). Mock-up words live in `src/content/showcase.ts`; "yourbrand.com" stands for a client, prices are demo values.
- **How we work:** an isometric build on a graphite drafting stage — survey (grid + scan), plan (dashed wire), blocks drop layer by layer, the apricot apex block and a flag. CSS 3D, only visible cube faces drawn; tilt and turn on separate elements (GSAP writes rotateZ before rotateX). Reduced motion: the finished structure, every step listed.
- **Removed:** TeamSelect, Ascent (and its generated trail), the speed-lines art, the bento tiles, `lib/accent.ts`, cobalt/dusk tokens and nav themes, screentone and flow-dash styles.
- **Checks:** lint, typecheck, e2e 20/20 (desktop, mobile, reduced motion), no horizontal overflow, no console errors. Perf profile still to run before merging.

## 2026-10-14 · "One day on the climb" redesign (branch `feat/anime-day-redesign`)
- **Request (repo owner, via Claude Code):** make the site more interactive and less "default": better type, shapes beyond rectangles (rounded, parallelogram, hexagon), a colour change at each major section with a different design language per section, a "What we do" built from suitable design styles, 2D anime-style artwork (not childish, not glowy), a nav that changes as you scroll, a new manifesto section with floating 2D cards, a new "How we work", no repeated copy.
- **Concept:** scrolling is one day on the climb to the apex (brief §7, The Ascent): night hero → dawn manifesto → team → daylight services → dusk process → night summit contact. Each major section has its own palette and language; the light tells you where you are.
- **Type:** one variable family, **Archivo** (Google, OFL): extra-condensed black uppercase for title cards, normal width for reading, semi-expanded for UI words. **JetBrains Mono** only for code-like content (automation tile), not preloaded. Newsreader, Geist, Geist Mono, Unbounded and Instrument Serif removed. No mono uppercase labels or eyebrows.
- **Artwork:** `scripts/render-anime-art.mjs` (`pnpm art`) draws the scenery as static SVGs in `public/art/` (cel-shaded cumulus, faceted ridges with gullies and rim light, snow caps, stars, a utility pole with wires, speed lines). Flat tones only, no blur or glow. Seeded, so output is stable. It also writes the trail geometry to `src/components/art/ascent.ts`. Hand-drawn/AI raster art can replace it later.
- **Sections:**
  - *Hero (night):* stars and two ridges with depth parallax; the 3D mark (pre-rendered, unchanged) rises behind them. The initials of the headline that spell APEC stay lit.
  - *Manifesto (dawn, replaces FieldIntro):* a slanted panel slides over the hero; pinned anime sky. "AI makes us fast" → wind + speed streaks; "Specialists make it right" → the five discipline cards (hexagon, parallelogram, ticket, squircle, diamond) snap into formation; "You get both" → both; a diagonal wipe in the first team colour hands over. Cards can be grabbed and thrown (mouse/pen; pointer events, no Draggable plugin).
  - *Team (replaces TeamCards):* a character-select screen. Pinned; scroll deals the next member, roster hover/focus previews, click opens the page. Each member has a stage colour (`accentStyles[].stage`), name on slanted plates, speed-line flash, dither → photo resolve. Inactive slides are `inert`.
  - *What we do (paper, replaces ServiceRows):* a bento where each discipline is drawn in its native design language: Swiss minimalism (SEO), node-graph canvas (automation), neo-brutalism (web), glassmorphism (apps), skeuomorphism (brand). All interaction is CSS (hover/focus-within).
  - *How we work (dusk, replaces ProcessSteps):* the climb. The trail draws up the mountain, a climber follows it, hexagon checkpoints light, trail signs appear. Phones: camera pans to the climber; the current step is the caption.
  - *Contact (night summit):* the flag on the peak, magnetic slanted CTAs, details on a ticket stub.
  - *Tagline band removed* (it repeated the tagline; the tagline stays in the footer).
- **Nav:** a floating "chameleon" island. It reads the `data-theme` of the section under it and swaps shape, colours and edge (glass pill / cloud pill / skewed parallelogram / hard-shadow box / plum). An indicator slides to the section being read; on phones the brand name gives way to the section name. Detection is a per-frame geometry read, not cached ScrollTrigger positions (those went stale after large jumps).
- **Copy:** "AI sets our pace; craft sets the bar." removed from the intro (the manifesto says it); services intro, team intro, hero caption, scroll label and card caption removed as repetitive. Section eyebrows removed. Short service labels added for the cards. See docs/COPY_REVIEW.md.
- **Motion rules kept:** transform/opacity (plus stroke-dashoffset on the trail and chart lines, and `left/top/width/height` on the tiny blocks in the web tile), native scroll with CSS sticky, below-the-fold setup at idle time, reduced motion = no pin/scrub (sections stack, the trail is drawn, cards rest in formation).
- **Removed files:** FieldIntro, TeamCards, TeamShowcase, ServiceRows, ProcessSteps, SectionHeader, TaglineBand, Manifesto, Marquee, ScrubWords, NavShell, NavProgress (all in git history).
- **Not done:** no new dependencies; no perf profile yet (run `pnpm profile` before merging); the HiggsField connector was not authorised, so no AI-generated raster art.

## 2026-10-14 · Design consistency + How we work (Mustafa)
- **Hero headline** white → silver; *Creatives* keeps a restrained rose. Blue stays only in the logo and its aura.
- **Footer "APEC"** fills silver with a faint rose foot (no multicolour gradient); dim base is grey.
- **How we work** rebuilt to match What we do: steps on one rail (horizontal on desktop, vertical on phones) that fills in rose as you scroll; each step lights up when the fill reaches its node. Transform/opacity only, set up at idle time, no continuous rendering. Reduced motion: everything shown, one-time fade via IntersectionObserver (a ScrollTrigger-based fade never fired under reduced motion, leaving the steps invisible).
- **Performance** (`docs/perf/profile-2026-10-14.json`): desktop blocking 52 ms, scroll p95 11 ms. Mobile (4x throttle) is inconsistent on this machine: traced runs 113–318 ms blocking, longest task ≤ 204 ms (within budget), but untraced profile runs 438–1179 ms with occasional single 550–880 ms tasks that did not reproduce under the tracer (low free RAM). Same pattern as before these changes; confirm on a real phone before launch.
- Projects and testimonials stay hidden until real material arrives. Not deployed.

## 2026-10-14 · Public GitHub repo (Mustafa)
- **Request:** push everything to a public GitHub repo so his brother can use it.
- **Clash Display removed** (its ITF licence forbids publishing the font file on public repositories/servers). Display sans is now **Unbounded** (Google Fonts, OFL), the brief's fallback. The font file is also stripped from the published git history.
- **Left out:** the Instagram reel video and frames extracted from it (third-party content), also stripped from history.
- **Added:** `references/originals/` (team photos, flyer, Canva logo export as received).

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
- **Condition:** the repo must stay private. *(Superseded 2026-10-14: font replaced, repo public.)*

## 2026-10-08 · Lenis `anchors` off; own reduced-motion hook
- Lenis' `anchors` option intercepts in-page links, which stopped the skip link from moving focus to `#content`; anchors now jump natively.
- `usePrefersReducedMotion` (matchMedia + `useSyncExternalStore`) instead of Motion's hook, so Motion loads only where it's used.

## 2026-10-07 · Temporary logo is labelled as temporary everywhere
- **Why:** only a raster logo exists (`references/brand/apec-logo-source.jpeg`). A rough SVG trace is needed for development, but it must not become the brand asset by accident. It lives in `TemporaryApexMark.tsx`, carries `data-temporary-logo`, is listed by the build's TODO report, and is not used for the favicon, OG image or any exported asset.
