# APEC — Team Portfolio Website · Master Build Brief

> **Version:** 1.0 · **Date:** 7 Oct 2026 · **Owner:** Mustafa Ishaq (APEC)
> **Builders:** Claude Code (implementation) · Codex (design logic, critique, refinement) · Claude Design (visual exploration + handoff)
> **Put this file at:** `docs/APEC_BUILD_BRIEF.md` in the repo. `AGENTS.md` and `CLAUDE.md` point here.

---

## 0. READ THIS FIRST (rules for every agent)

1. **Read this entire file before doing anything.**
2. **Phase 0 (Section 2) is a hard gate.** Install and verify every tool, plugin, skill and MCP server listed. Paste the verification output into `docs/SETUP_LOG.md`. **Do not write a single line of app code until the gate passes.**
3. **Never invent content.** No fake names, fake clients, fake testimonials, fake stats ("200+ projects"), fake logos, fake job titles. Anything unknown is a `TODO:` placeholder (visible in dev, hidden in production builds — see §11).
4. **Use plan mode** (Claude Code) / a written plan (Codex) at the start of every phase. The human approves the plan, then you build.
5. **One writer at a time.** Claude Code and Codex never edit the same branch at the same time (see §4).
6. **Log every non-trivial decision** in `docs/DECISIONS.md` (date · decision · why · alternatives rejected).
7. **Look up docs before coding** with Context7 / Next DevTools MCP. Your training data may be stale; this stack moves fast.
8. **If something in this brief conflicts with official docs, the docs win** — note it in `DECISIONS.md` and tell the human.

---

## 1. Project snapshot

| | |
|---|---|
| **What** | A premium portfolio website for **APEC**, a 5-person IT agency. Showcases each member's CV, skills and work, and sells the agency's combined services. |
| **Inspiration** | Mustafa's brother's portfolio **stymite.me** (single-person, card-deck concept) — but for **five people**, plus the 6 Instagram reels in §5.2. |
| **Audience** | (1) Clients hiring an agency (founders, SMBs, US/UK/Gulf clients). (2) People hiring individual members (recruiters, Fiverr/Upwork clients). |
| **Primary goal** | Visitor understands "five senior specialists, AI-accelerated" in 5 seconds → explores a member → contacts APEC. |
| **Positioning** | We use AI heavily, but we are experts in our fields. AI = speed. Humans = judgement and quality. |
| **v1 scope** | Home page + 5 member CV pages + contact + 404. Work/case studies are added later (data model ready now). |
| **Feel** | Premium, dark, cinematic, confident. Bluish black, navy, greyish blue, silver. Burgundy as a rare accent. "Award-site" motion, but fast. |

**Headline candidates (pick in Phase 2):**
- "Five specialists. *One* apex."
- "Human expertise. AI velocity."
- "We build what's next — at the speed of AI."

**Sub-headline draft:** "APEC is a five-person IT studio — SEO & content, AI engineering, web, web apps and brand design — using AI to ship senior-level work at startup speed."

---

## 2. PHASE 0 — Install everything first (HARD GATE)

> Claude Code: run these for the human where you can. Logins (Claude, ChatGPT/OpenAI, GitHub, Vercel) must be done by the human — stop and ask.

### 2.1 Machine prerequisites

| Tool | Version | Why | Windows (PowerShell) | macOS |
|---|---|---|---|---|
| Node.js | **22 LTS or 24 LTS** (Next.js 16 needs ≥ 20) | Runtime | `winget install OpenJS.NodeJS.LTS` | `brew install node` |
| pnpm | latest | Package manager (fast, strict) | `corepack enable` then `corepack prepare pnpm@latest --activate` | same |
| Git | latest | Version control (+ Git Bash for Claude Code on Windows) | `winget install Git.Git` | `brew install git` |
| GitHub CLI | latest | Repo + PRs from terminal | `winget install GitHub.cli` → `gh auth login` | `brew install gh` |
| ffmpeg | latest | Extract frames from the reference reels (§5.2) | `winget install Gyan.FFmpeg` | `brew install ffmpeg` |
| Vercel CLI | latest | Deploy + env vars | `npm i -g vercel` → `vercel login` | same |
| VS Code / Cursor | any | Editor (optional) | — | — |

Verify:
```bash
node -v && pnpm -v && git --version && gh --version && ffmpeg -version && vercel --version
```

### 2.2 Claude Code (the builder)

Requires a Claude **Pro, Max, Team, Enterprise or Console** account (free plan doesn't include Claude Code).

```bash
# macOS / Linux / WSL
curl -fsSL https://claude.ai/install.sh | bash
# Windows PowerShell
irm https://claude.ai/install.ps1 | iex

claude --version     # prints a version number
claude doctor        # install + settings diagnostics
claude               # first run → log in via browser
```

### 2.3 Codex CLI (the design-logic reviewer / refiner)

Works with a ChatGPT plan or an OpenAI API key.

```bash
npm i -g @openai/codex
codex                # first run → sign in with ChatGPT
```

### 2.4 Claude Code plugins (run inside a `claude` session)

```text
# 1) Anthropic's official frontend design plugin — stops generic "AI-looking" UI
/plugin install frontend-design@claude-plugins-official

# 2) OpenAI's official Codex plugin — lets Claude Code call Codex for reviews / hand-offs
/plugin marketplace add openai/codex-plugin-cc
/plugin install codex@openai-codex
/codex:setup         # checks Node + Codex are installed and logged in

# 3) Official GSAP skills (correct GSAP/ScrollTrigger/React usage)
/plugin marketplace add greensock/gsap-skills
/plugin              # open the menu → install the GSAP skills from that marketplace
```
> If you install GSAP skills here for Claude Code, then in §2.5 select **only Codex** for the GSAP skills so Claude Code doesn't get duplicates.

Codex plugin commands you'll use: `/codex:review` (read-only review of uncommitted changes or `--base <branch>`), `/codex:rescue` (hand a stuck task to Codex), `/codex:status`, `/codex:result`, `/codex:cancel`. Run `/help` to see the adversarial-review command too.

### 2.5 Shared agent skills (for BOTH Claude Code and Codex)

The `skills` CLI installs skills into the right folder for each agent. When it asks which agents, **select Claude Code and Codex**.

```bash
# Official GSAP skills: gsap-core, gsap-timeline, gsap-scrolltrigger, gsap-plugins,
# gsap-utils, gsap-react, gsap-performance, gsap-frameworks
npx skills add https://github.com/greensock/gsap-skills

# Vercel's official skills: react/next best practices, web-design-guidelines (UI/a11y audit),
# composition patterns, react-view-transitions, deploy-to-vercel, etc.
npx skills add vercel-labs/agent-skills

# Optional for Codex: Anthropic's frontend-design skill (Claude Code already has it via plugin)
npx skills add anthropics/skills --skill frontend-design
```

> If `npx skills` can't find a skill, clone the repo and copy the `skills/` folders manually: Claude Code → `~/.claude/skills/`, Codex → `~/.codex/skills/` (or `.agents/skills/` in the repo).

### 2.6 MCP servers

**Claude Code** — run in the project folder **after** the Next.js app is scaffolded (§3.1). `--scope project` writes `.mcp.json` so every teammate gets the same servers.

```bash
# Browser automation: open sites, screenshot, click — used to study stymite.me and to QA our own site
claude mcp add --scope project playwright -- npx -y @playwright/mcp@latest

# Live Next.js 16 dev-server errors, routes, logs + Next.js docs knowledge base
claude mcp add --scope project next-devtools -- npx -y next-devtools-mcp@latest

# shadcn/ui registry: browse/search/install components
pnpm dlx shadcn@latest mcp init --client claude

# Up-to-date library docs (user scope, because an API key must NOT go in .mcp.json)
claude mcp add --scope user --transport http context7 https://mcp.context7.com/mcp
#   (optional, higher limits) add: --header "CONTEXT7_API_KEY: <your key>"
```

**Codex** (writes to `~/.codex/config.toml`):

```bash
codex mcp add context7 -- npx -y @upstash/context7-mcp
codex mcp add playwright -- npx -y @playwright/mcp@latest
codex mcp add next-devtools -- npx -y next-devtools-mcp@latest
codex mcp add shadcn -- npx -y shadcn@latest mcp
```

### 2.7 Verification gate (paste outputs into `docs/SETUP_LOG.md`)

```bash
claude --version
claude mcp list            # expect: playwright, next-devtools, shadcn, context7
codex --version
codex mcp list             # expect: context7, playwright, next-devtools, shadcn
```
Inside Claude Code: `/plugin` shows **frontend-design**, **codex**, **gsap skills** installed; `/mcp` shows all servers connected; `/codex:setup` passes.

**Smoke tests (must all pass):**
- [ ] Claude Code: "Use playwright mcp to open https://stymite.me and take a screenshot." → screenshot returned.
- [ ] Claude Code: "Use context7 to fetch the current GSAP ScrollTrigger docs." → docs returned.
- [ ] Codex: "List the skills you have available." → GSAP + Vercel skills listed.
- [ ] Claude Code: `/codex:review` on a trivial change → Codex review comes back.

✅ Gate passed → commit `chore: phase 0 tooling verified` and move on.

### 2.8 Do NOT install (keep the bundle lean, avoid conflicts)

- ❌ Bootstrap, jQuery, Material UI, Chakra, Ant Design, any full UI kit that fights a custom look
- ❌ `framer-motion` (old package name — use `motion`), `@studio-freight/lenis` (deprecated — use `lenis`), `locomotive-scroll`
- ❌ `tailwindcss-animate` (Tailwind v3 era — shadcn now uses `tw-animate-css`)
- ❌ styled-components / Emotion (Tailwind only)
- ❌ A second smooth-scroll or a third animation library
- ❌ Any paid template/theme code copied into the repo

---

## 3. Tech stack (locked for v1)

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 16.x** (App Router, TypeScript, Turbopack) + React 19 | SSR/SSG for SEO, image optimisation, built-in MCP endpoint for agents |
| Styling | **Tailwind CSS v4** (CSS-first `@theme`, no `tailwind.config.js`) | Tokens live in `globals.css` |
| UI primitives | **shadcn/ui** — only for Dialog, Sheet, Tooltip, Form, Sonner toasts | Accessible primitives; we restyle everything |
| Scroll & timelines | **GSAP** + `@gsap/react` (`useGSAP`) — ScrollTrigger, SplitText, Flip, ScrambleText, CustomEase | Now 100% free incl. all former Club plugins |
| Smooth scroll | **Lenis** (`lenis/react`, `<ReactLenis root>`) synced to GSAP ticker | Industry standard on award sites |
| Micro-interactions | **Motion** (`motion/react`) — hover, presence, layout | Small component-level animations only |
| Page transitions | React `<ViewTransition>` / View Transitions API (card → member page) | Native shared-element feel |
| 3D | **three** + `@react-three/fiber` + `@react-three/drei` + `@react-three/postprocessing` | Hero logo scene, lazy-loaded |
| Icons | `lucide-react` (UI) + `simple-icons` (monochrome tool/tech logos) | |
| Forms | `react-hook-form` + `zod` + `@hookform/resolvers` + Server Action + **Resend** | Contact form |
| Content | Typed TS data files + zod validation (`src/content/`) → MDX for case studies later | Add projects later without touching components |
| Analytics | `@vercel/analytics` + `@vercel/speed-insights` | |
| Quality | ESLint, Prettier + `prettier-plugin-tailwindcss`, `@playwright/test`, `@lhci/cli` | |
| Hosting | **Vercel** | Preview deploy per branch |

### 3.1 Scaffold commands (Phase 3)

```bash
pnpm create next-app@latest apec-web
#  answers: TypeScript ✔ · ESLint ✔ · Tailwind ✔ · src/ dir ✔ · App Router ✔ · Turbopack ✔ · alias @/* ✔
#  NOTE: create-next-app now generates an AGENTS.md — merge it into ours (Appendix A), don't delete it.
cd apec-web

pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add dialog sheet tooltip form input textarea select button sonner

pnpm add gsap @gsap/react lenis motion
pnpm add three @react-three/fiber @react-three/drei @react-three/postprocessing
pnpm add react-hook-form zod @hookform/resolvers resend
pnpm add simple-icons @vercel/analytics @vercel/speed-insights
pnpm add -D @types/three prettier prettier-plugin-tailwindcss @playwright/test @lhci/cli

# then run the MCP commands in §2.6
```

Do not pin versions by hand; let `@latest` resolve, then commit the lockfile. **No major-version bumps later without asking the human.**

---

## 4. Who does what

| Actor | Role | Does | Doesn't |
|---|---|---|---|
| **Humans (APEC team)** | Owners | Provide content (§9.3), photos, reel references, approve plans & designs, logins | — |
| **Claude Design** (claude.ai/design) | Visual exploration | Design system board, hero/team/member-page mockups (desktop + mobile), variations. Exports a **handoff bundle to Claude Code**. After Phase 3, import our GitHub repo as the design system so new mockups match the code. | Production code |
| **Claude Code** | Builder | Scaffolding, components, animations, 3D, data, SEO, deploy. Writes code on `feat/*` branches. Calls Codex via `/codex:review` before every merge. | Design decisions without a plan; merging without review |
| **Codex** | Design logic + critic + refiner | Reviews hierarchy, flow, conversion logic, motion timing, accessibility, performance, code quality. Writes `docs/reviews/<phase>-codex.md`. Does refinement passes on `refine/*` branches **after** Claude Code finishes a phase. | Editing a branch Claude Code is working on |

### 4.1 Collaboration protocol
1. Phase starts → Claude Code writes a plan → human approves.
2. Claude Code builds on `feat/<phase>-<thing>`; small conventional commits (`feat:`, `fix:`, `style:`, `chore:`).
3. Claude Code runs `/codex:review --base main` → fixes **must-fix** items.
4. Optional: Codex does a polish pass on `refine/<thing>` branched from the finished feature branch → PR → Claude Code reviews it back.
5. Human checks the Vercel preview → merge to `main`.
6. Decisions → `docs/DECISIONS.md`. Open questions → `docs/QUESTIONS.md`.

---

## 5. References & inspiration

### 5.1 stymite.me (brother's site) — what we know
- Concept: a **deck of cards** — projects are "dealt one at a time"; a preloader reads **"Shuffling the deck 0%"** with a percentage counter.
- A character ("Wildcard", white & gold) in the share banner; an **ambient soundtrack** file is loaded.
- Theme colour **`#0d0c0a`** (warm near-black). Strong OG/Twitter share metadata.
- It renders client-side, so plain fetchers only see the shell.

**Task for Claude Code (Phase 1):** use **Playwright MCP** to open stymite.me, scroll through it, take screenshots at 1440px and 390px, and write `docs/REFERENCES.md → stymite.me` covering: section order, loader, transitions, cursor, typography, how projects are revealed, what feels premium.
**Rules:** inspired by, never copied. No code, assets, music, character or copy taken from it. We borrow the *idea* of "a narrative device + one-at-a-time reveal + a memorable preloader" — for APEC it's **five people**.

### 5.2 Instagram reels (the template/theme reference)

> ⚠️ **Agents can't open Instagram** (it blocks automated access and needs login). A human must get these into the repo first.

**Procedure (human, Phase 1):**
1. Save each reel as video (screen-record if needed) → `references/reels/reel-01.mp4` … `reel-06.mp4`.
2. Claude Code extracts frames:
   ```bash
   mkdir -p references/frames
   for f in references/reels/*.mp4; do n=$(basename "$f" .mp4); ffmpeg -i "$f" -vf fps=2 "references/frames/${n}_%03d.png"; done
   ```
3. Claude Code + Codex each look at the frames and fill the table below, then agree on a **steal list** in `docs/REFERENCES.md`.

| # | Link | What we like (human fills: hero? scroll effect? cards? cursor? type?) | Steal list (agents fill) |
|---|---|---|---|
| 01 | https://www.instagram.com/reel/DdZO49mI8s2/ | TODO | TODO |
| 02 | https://www.instagram.com/reel/DeHUvApTdxT/ | TODO | TODO |
| 03 | https://www.instagram.com/reel/DdmzJkXz_4M/ | TODO | TODO |
| 04 | https://www.instagram.com/reel/DdsrRJpywBe/ | TODO | TODO |
| 05 | https://www.instagram.com/reel/Dd7Et9Aoz8b/ | TODO | TODO |
| 06 | https://www.instagram.com/reel/Dd7JS5cikRR/ | TODO | TODO |

If a reel names a template/library (e.g. a Framer/Webflow template or a specific effect), note it — we **recreate the effect ourselves** in our stack; we don't buy/import the template.

### 5.3 Priority when references conflict
1. **Brand & palette (§6)** — fixed. 2. **Reels steal list** — decides layout & motion. 3. **Concept (§7)** — default if reels don't specify. 4. stymite.me — narrative/loader inspiration only.

---

## 6. Brand & visual system

### 6.1 Logo (provided)
A stylised **"A" / peak triangle**: left stroke **brushed silver/white**, right stroke **electric blue → deep cobalt gradient**, three **rising bar-chart bars** inside, and a **blue orbit swoosh** sweeping under it. On pure black.

Meaning we exploit in design: **apex/peak** (top), **growth** (bars), **momentum/orbit** (swoosh).

**Needed from the graphic designer (Phase 1):**
- [ ] Vector **SVG** of the mark (transparent bg), separate layers: left stroke, right stroke, 3 bars, swoosh — the 3D scene and the preloader animate each part.
- [ ] Wordmark "APEC" (lockups: horizontal, stacked, mark-only); light-on-dark + mono versions.
- [ ] Favicon set: `favicon.ico`, `icon.svg`, `apple-icon.png` (180), `icon-192.png`, `icon-512.png`, maskable icon.
- [ ] OG image template 1200×630.

Until the SVG exists, Claude Code may trace a **temporary** SVG for dev only; mark it `TODO: replace with designer SVG`.

### 6.2 Colour tokens

| Token | Hex | Use |
|---|---|---|
| `void` | `#05060A` | Page background (premium black, slight blue) |
| `ink` | `#0A0E15` | Raised surfaces, nav background |
| `navy-900` | `#0B1424` | Section bands |
| `navy-800` | `#0E1A2E` | Cards, panels |
| `navy-700` | `#13233D` | Hover surfaces, inputs |
| `steel-300` | `#AFBACB` | Secondary text (light) |
| `steel-400` | `#8A9BB4` | **Greyish blue** — secondary text, labels (7:1 on void ✔) |
| `steel-600` | `#4E5F78` | Borders, decorative text, **large text only** (3:1) |
| `steel-800` | `#2A3646` | Hairlines, dividers |
| `silver-100` | `#EEF1F5` | Primary text |
| `silver-300` | `#C5CCD6` | Metallic gradient end |
| `brand-300` | `#5CC2FF` | Ice/electric highlight (logo top) |
| `brand-500` | `#1F7BFF` | **Primary brand blue** — links, CTAs, focus ring (5:1 on void ✔) |
| `brand-700` | `#0B3FA8` | Deep cobalt — gradients, glows (not for text) |
| `wine-400` | `#A33A50` | Burgundy hover/glow |
| `wine-600` | `#7A1F33` | **Burgundy accent** — rare fills (never text on dark) |
| `wine-800` | `#4A1220` | Burgundy deep glow |
| `signal` | `#3DDC97` | "Available" status dot only |

**Gradients:**
- `--grad-brand`: `linear-gradient(160deg, #5CC2FF 0%, #1F7BFF 45%, #0B3FA8 100%)` (matches the logo's right stroke)
- `--grad-silver`: `linear-gradient(160deg, #FFFFFF 0%, #C5CCD6 55%, #8A9BB4 100%)` (left stroke, metallic headline sheen)
- `--glow-navy`: radial `#13233D` → transparent (section backdrops)
- `--glow-wine`: radial `#4A1220` at 40% → transparent (one or two dramatic moments only)

**Ratio rule:** ~70% blacks/navies · ~20% steel/silver · ~8% blue · **≤ 2% burgundy**.
**Burgundy is allowed for:** text-selection highlight, the contact section glow, the graphic designer's accent, one hover state on the main CTA. Nowhere else.

**Per-member accents** (hairline, index number, card glow — not body text):
01 SEO & Content → `silver` (silver-100) · 02 AI Engineer → `brand` (brand-500) · 03 Web Dev → `ice` (brand-300) · 04 Web App Dev → `cobalt` (brand-700 glow, steel-300 line) · 05 Graphic Designer → `wine` (wine-600)

### 6.3 Typography

| Role | Font | Source | Notes |
|---|---|---|---|
| Display | **Clash Display** (600/700) | Fontshare (free for commercial use — confirm licence on download), self-host via `next/font/local` | Huge headlines, tight tracking `-0.03em`, line-height 0.9–1.0 |
| Body | **Geist Sans** (400/500) | `next/font/google` | 16–18px, line-height 1.6 |
| Mono | **Geist Mono** | `next/font/google` | Labels, indices "01 / 05", tags, counters |
| Accent | **Instrument Serif** *italic* | `next/font/google` | One word per headline max, e.g. "Five specialists. *One* apex." |

Fallback if Clash Display is rejected: **Unbounded** or **Syne** (Google Fonts).
Fluid scale with `clamp()`: hero `clamp(3.5rem, 11vw, 11rem)` · h2 `clamp(2.25rem, 6vw, 5.5rem)` · h3 `clamp(1.5rem, 3vw, 2.5rem)` · body `clamp(1rem, 1.1vw, 1.125rem)` · mono label `0.75rem` uppercase `+0.12em`.

### 6.4 Layout, surfaces, texture
- 12-column grid, max width 1440px, gutters `clamp(1rem, 4vw, 3rem)`. Big negative space.
- Radii: cards `1.25rem`, buttons full pill, inputs `0.75rem`.
- Borders: 1px `steel-800` hairlines; on hover a **gradient border** (brand → transparent).
- **Film grain** overlay (SVG `feTurbulence` or a tiny PNG) at 3–4% opacity, fixed, `pointer-events:none`.
- Background: faint **triangle/isometric grid** at ~4% opacity + slow-drifting navy radial glows.
- Glass only where it earns it (nav bar, menu): `backdrop-blur` + `ink` at 70%. No glassmorphism everywhere.

### 6.5 Motion language

| Token | Value |
|---|---|
| `--ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` — default for reveals |
| `--ease-in-out-quart` | `cubic-bezier(0.76, 0, 0.24, 1)` — curtains, page transitions |
| `--ease-out-back` | `cubic-bezier(0.34, 1.56, 0.64, 1)` — tiny playful pops only |
| Hover / micro | 150–250ms |
| UI (menus, dialogs) | 300–450ms |
| Reveals | 700–1100ms, stagger 40–80ms |
| Hero intro total | ≤ 2.2s after preloader |
| Scroll scrub smoothing | `scrub: 0.6–1` |

**Rules:** animate `transform`/`opacity` only · every ScrollTrigger is created inside `useGSAP` with a scope and is cleaned up · `ScrollTrigger.refresh()` after fonts/images load · **`prefers-reduced-motion`** → Lenis off, no scrub/pin, SplitText becomes a simple fade, 3D becomes a static poster (use `gsap.matchMedia()`).

### 6.6 Signature moves (the "cool" factor)
1. **Logo assembly preloader** — strokes draw in, bars rise to 100%, swoosh orbits, curtain wipes up.
2. **3D hero mark** — metallic left stroke, glossy blue right stroke, emissive bars, glowing swoosh with bloom; reacts to cursor; on scroll the mark **splits into 5 shards that become the 5 team cards**.
3. **SplitText headline reveals** (lines masked, rising).
4. **Spotlight cursor** — a soft navy light follows the cursor on cards; custom dot+ring cursor that grows into "VIEW" on cards (desktop only).
5. **Magnetic buttons** on primary CTAs.
6. **Pinned horizontal team scroll** (desktop) with 01→05 counter.
7. **Shared-element transition** from a team card into that member's page.
8. **Footer wordmark** — giant outlined "APEC" that fills with the brand gradient as you reach the bottom.
9. Optional (nod to stymite.me): **ambient sound toggle**, **off by default**.

### 6.7 Don'ts
No purple/pink "AI gradient" look · no emoji in UI · no stock 3D blobs · no skill-percentage bars ("Python 87%") · no Lorem ipsum in production · no auto-playing sound · no scroll-jacking that breaks native scrolling on mobile · no text over busy imagery without a scrim.

### 6.8 Tailwind v4 tokens (`src/app/globals.css`)

```css
@import "tailwindcss";
@import "tw-animate-css";

@theme {
  --color-void: #05060A;
  --color-ink: #0A0E15;
  --color-navy-900: #0B1424;
  --color-navy-800: #0E1A2E;
  --color-navy-700: #13233D;
  --color-steel-300: #AFBACB;
  --color-steel-400: #8A9BB4;
  --color-steel-600: #4E5F78;
  --color-steel-800: #2A3646;
  --color-silver-100: #EEF1F5;
  --color-silver-300: #C5CCD6;
  --color-brand-300: #5CC2FF;
  --color-brand-500: #1F7BFF;
  --color-brand-700: #0B3FA8;
  --color-wine-400: #A33A50;
  --color-wine-600: #7A1F33;
  --color-wine-800: #4A1220;
  --color-signal: #3DDC97;

  --font-display: var(--font-clash), var(--font-geist-sans), system-ui, sans-serif;
  --font-sans: var(--font-geist-sans), system-ui, sans-serif;
  --font-mono: var(--font-geist-mono), ui-monospace, monospace;
  --font-serif: var(--font-instrument-serif), Georgia, serif;

  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out-quart: cubic-bezier(0.76, 0, 0.24, 1);
  --ease-out-back: cubic-bezier(0.34, 1.56, 0.64, 1);

  --radius-card: 1.25rem;
}

/* Dark-only site: put class="dark" on <html>, color-scheme: dark.
   Map shadcn's semantic variables (--background, --foreground, --primary, --ring, --border…)
   in :root/.dark to the tokens above so shadcn components inherit the brand. */
::selection { background: var(--color-wine-600); color: var(--color-silver-100); }
```

---

## 7. Creative concept

**Default concept — "The Ascent."** The site is a climb to the apex. The hero is the summit (the 3D mark). Scrolling down is the journey: the mark breaks into **five shards → five people**, then the services they combine, the process (drawn as a line climbing the triangle's edge), and finally the contact section "at the top". Indices everywhere: **01 / 05**.

**Alternative — "The Five-Card Hand"** (a deliberate nod to the brother's deck site): the team is a five-card hand dealt one at a time; each member is a premium black-and-silver card with their accent; the preloader reads **"Assembling the team 0%"**.

The reels steal list (§5.2) can override layout and motion; the palette and brand stay. The human picks the concept in Phase 2.

---

## 8. Information architecture & page specs

```
/                     Home (all sections below)
/team/[slug]          5 member CV pages (statically generated)
/work                 (v2, hidden behind SHOW_WORK flag)
/work/[slug]          (v2 case studies, MDX)
/privacy              Minimal privacy note (contact form data)
/not-found            Custom 404
/api/...              none — use Server Actions
```

### 8.1 Home — section by section

| # | Section | Content | Interaction / motion | Mobile |
|---|---|---|---|---|
| 0 | **Preloader** | Logo assembly + mono counter `000→100` + line "Assembling the team" | Max 2.5s; skipped on repeat visits in the same session; never blocks LCP text longer than needed | Same, shorter |
| 1 | **Nav** | Mark + "APEC", links: Team · Services · Process · Contact, CTA "Start a project" | Hides on scroll down, shows on scroll up; magnetic CTA; full-screen menu with staggered links | Hamburger → full-screen sheet |
| 2 | **Hero** | Headline (§1), sub-headline, 2 CTAs ("Meet the five" / "Start a project"), small mono line "Pakistan · Remote · Worldwide" (confirm) | SplitText reveal; 3D mark (lazy) with cursor parallax; scroll → mark splits into 5 shards | Poster image or light 3D at DPR 1; no shard effect |
| 3 | **Marquee** | Services + tools ticker: "SEO · Content · AI Agents · Automation · Web · Web Apps · Brand · Design…" | Infinite, direction flips with scroll velocity | Same |
| 4 | **Manifesto** | 2–3 short lines: AI speed + human expertise | Words light up from `steel-600` to `silver-100` as you scroll (scrubbed) | Simple fade |
| 5 | **The Five** (team) | 5 cards: portrait (consistent duotone grade), name, role, 3 top skills, accent, `0X / 05`, availability dot | **Pinned horizontal scroll** on desktop; hover tilt + spotlight + portrait colour reveal; click → shared-element transition to `/team/[slug]` | Vertical stack or snap carousel; tap → page |
| 6 | **Services** | 5 disciplines (one per member) + 2–3 combined packages (e.g. "Launch": web + brand + SEO; "Automate": AI + web app) | Accordion/hover-expand rows with the responsible member's avatar | Accordion |
| 7 | **Process** | Discover → Design → Build (AI-accelerated) → Launch & Grow | Pinned; a line draws up the triangle edge, steps reveal at each node | Vertical timeline |
| 8 | **Selected Work** | Hidden until real projects exist (`SHOW_WORK=false`) | Filter by member/discipline; hover video previews | Grid |
| 9 | **Toolbelt** | Monochrome logos of tools the team actually uses (from §9 data only) | Slow marquee; logo turns brand-blue on hover | Same |
| 10 | **Testimonials** | Hidden until real ones exist | — | — |
| 11 | **Contact** | Headline "Let's build something at the apex.", form, email, WhatsApp click-to-chat, response-time note | Burgundy + navy glow backdrop; swoosh line animates; success state with mark animation | Full-width form |
| 12 | **Footer** | Giant "APEC" wordmark (fills on scroll), socials, links, © year | Wordmark fill scrubbed | Smaller wordmark |

### 8.2 Member page `/team/[slug]` (the CV)

1. **Hero** — big portrait, name (SplitText), role, one-line headline, availability badge, location/timezone, socials, buttons: **"Work with {first name}"** (opens contact pre-filled) + **"Download CV (PDF)"**.
2. **Quick facts** — years of experience, focus areas, languages, "Currently" (only if `public: true`).
3. **About** — 60–120 words.
4. **Skills** — grouped (e.g. "AI & Automation", "Languages", "Tools"); each skill shows a level label **Expert / Advanced / Proficient** — no percentages.
5. **Toolbelt** — icons + names.
6. **Experience** — vertical timeline.
7. **Projects** — cards (title, role, stack, outcome, link). "More case studies coming" if fewer than 3.
8. **Certifications / Education** (if provided).
9. **CTA band** — contact this member.
10. **Prev / Next member** — cycles 01→05 like dealing the next card.

Metadata per page: title `"{Name} — {Role} | APEC"`, description from headline, OG image generated with `next/og` (portrait + name + accent), JSON-LD `Person`.

### 8.3 404
The mark's bars fall down; headline "This peak doesn't exist."; button back home.

---

## 9. Team content

### 9.1 Data model (`src/content/team.ts`, validated by zod in `src/content/schema.ts` — build fails on invalid data)

```ts
export type SkillLevel = "expert" | "advanced" | "proficient";
export type Accent = "silver" | "brand" | "ice" | "cobalt" | "wine";

export interface TeamMember {
  slug: string;                 // url: /team/{slug}
  order: 1 | 2 | 3 | 4 | 5;
  name: string;                 // "TODO:" until provided
  role: string;
  headline: string;             // ≤ 90 chars
  bio: string;                  // 60–120 words
  accent: Accent;
  portrait?: { src: string; alt: string };   // if missing → monogram card (never AI-generated faces)
  location?: string;
  timezone?: string;
  availability: "available" | "limited" | "booked";
  currently?: { title: string; org: string; public: boolean };  // public:false → not rendered
  yearsExperience?: number;
  languages?: string[];
  skills: { name: string; level: SkillLevel; group: string; confirmed: boolean }[]; // only confirmed render in prod
  tools: string[];
  services: string[];           // which agency services they lead
  experience: { title: string; org: string; start: string; end?: string; summary: string; highlights?: string[] }[];
  projects: { slug: string; title: string; summary: string; role: string; stack: string[];
              outcome?: string; link?: string; cover?: string; featured?: boolean }[];
  certifications?: { name: string; issuer: string; year?: number; url?: string }[];
  education?: { degree: string; school: string; year?: number }[];
  socials: { platform: "linkedin" | "github" | "behance" | "dribbble" | "x" | "fiverr" | "upwork" | "website" | "email"; url: string }[];
  cvPdf?: string;               // /cv/{slug}.pdf
  seo?: { title?: string; description?: string };
}
```

### 9.2 The five (what we know today)

| # | Slug (placeholder) | Name | Role | Known skills | Candidate skills (**confirm before showing**) | Accent |
|---|---|---|---|---|---|---|
| 01 | `seo-content` | TODO | SEO Specialist & Content Writer | SEO, content writing | Technical SEO, keyword research, on-page, content strategy, copywriting, Google Search Console, GA4, Ahrefs/Semrush | silver |
| 02 | `mustafa-ishaq` | **Mustafa Ishaq** | AI Engineer | **Python 3, Claude Code, OpenClaw** (+ many more to add) | LLM agents, workflow automation, CRM & email automation, API integrations, prompt engineering | brand |
| 03 | `web-dev` | TODO | Web Developer | Web development | HTML/CSS/JS, React, Next.js, WordPress/Shopify, performance | ice |
| 04 | `web-app-dev` | TODO | Web App Developer | Web app development | Full-stack TypeScript, Node.js, databases, auth, APIs | cobalt |
| 05 | `graphic-design` | TODO | Graphic Designer | Graphic design | Brand identity, Figma, Adobe CC, social creatives, AI image tools | wine |

**Mustafa — "Currently":** AI Engineer at **Atlus Bank (USA)**. ⚠️ Set `public: false` until Mustafa confirms his contract allows naming the bank publicly; when false, render "AI Engineer for a US bank" instead.

Agents: render **only** `confirmed: true` skills in production. Candidates are suggestions for the humans to approve.

### 9.3 Content checklist — each member sends (to `content-intake/{slug}/`)
- [ ] Full name, role title, one-line headline
- [ ] Bio (60–120 words), years of experience, languages, city/timezone
- [ ] Portrait: real photo, ≥ 1600px tall, plain dark background, shoulders-up, same framing as the others (designer grades all 5 to one navy duotone look)
- [ ] Skills with level (expert/advanced/proficient) and tools list
- [ ] 2–4 projects: title, problem, what you did, result (real numbers only), link, 2–3 images
- [ ] Experience entries (title, org, dates, 1–2 lines)
- [ ] Certifications/education (optional)
- [ ] Social links (LinkedIn, GitHub, Behance, Fiverr…), public email
- [ ] CV as PDF
- [ ] OK to show availability? OK to name current employer/clients?

---

## 10. Project structure

```
apec-web/
├─ AGENTS.md                      # shared rules (Appendix A) — keep < 32 KiB (Codex limit)
├─ CLAUDE.md                      # "@AGENTS.md" + Claude-specific notes (Appendix B)
├─ .mcp.json                      # Claude Code project MCP servers (Appendix C)
├─ docs/
│  ├─ APEC_BUILD_BRIEF.md         # this file
│  ├─ SETUP_LOG.md  DECISIONS.md  QUESTIONS.md  REFERENCES.md
│  └─ reviews/                    # Codex review notes per phase
├─ references/ (reels/, frames/, stymite/)   # gitignore the .mp4 files if large
├─ content-intake/                # raw material from members (gitignored if private)
├─ public/
│  ├─ cv/{slug}.pdf
│  ├─ team/{slug}.avif
│  ├─ brand/ (logo svgs, og template)
│  └─ fonts/ (if not using src/assets)
└─ src/
   ├─ app/
   │  ├─ layout.tsx  page.tsx  globals.css  not-found.tsx
   │  ├─ team/[slug]/page.tsx   team/[slug]/opengraph-image.tsx
   │  ├─ privacy/page.tsx
   │  ├─ sitemap.ts  robots.ts  manifest.ts  opengraph-image.tsx
   │  └─ actions/contact.ts                     # Server Action
   ├─ components/
   │  ├─ ui/                                    # shadcn (restyled)
   │  ├─ layout/ (Nav, MobileMenu, Footer, Cursor, Grain, Preloader)
   │  ├─ sections/ (Hero, Marquee, Manifesto, TeamScroll, Services, Process, Toolbelt, Contact)
   │  ├─ team/ (MemberCard, MemberHero, SkillGroups, Timeline, ProjectCard, MemberNav)
   │  ├─ three/ (HeroScene, ApexMark, Shards, Effects) # dynamic import, ssr:false
   │  └─ motion/ (SplitReveal, Magnetic, Spotlight, ScrubText)
   ├─ providers/ (SmoothScroll.tsx — ReactLenis + GSAP ticker sync, GsapRegister.tsx)
   ├─ content/ (team.ts, services.ts, process.ts, site.ts, schema.ts)
   ├─ lib/ (utils.ts, seo.ts, jsonld.ts, flags.ts, motion.ts)
   └─ assets/fonts/ (ClashDisplay-*.woff2)
```

---

## 11. Engineering rules

**Code**
- TypeScript strict. Server Components by default; `"use client"` only for interactive/animated leaves.
- All site copy lives in `src/content/` — components never hard-code copy.
- `TODO:` content: in dev render a dashed `wine-400` outline + the TODO text; in production builds `TODO:` items are **not rendered** and the build logs a warning listing them.
- Feature flags in `src/lib/flags.ts`: `SHOW_WORK`, `SHOW_TESTIMONIALS`, `ENABLE_SOUND`, `ENABLE_3D`.

**Animation**
- Register GSAP plugins once (`GsapRegister`). Lenis via `<ReactLenis root options={{ autoRaf: false }}>`, driven from `gsap.ticker` (`lenis.raf(time * 1000)`), `lenis.on('scroll', ScrollTrigger.update)`, `gsap.ticker.lagSmoothing(0)`.
- Every scroll animation inside `useGSAP(() => {...}, { scope })`. No global selectors.
- `gsap.matchMedia()` branches: desktop / mobile / reduced-motion.

**3D**
- `HeroScene` is `next/dynamic` with `ssr: false`, loaded **after** the hero text paints (hero headline is the LCP element, not the canvas).
- Cap DPR at 1.5 desktop / 1 mobile; pause rendering when off-screen (`frameloop="demand"` or IntersectionObserver).
- Fallback poster (AVIF) when `ENABLE_3D` is off, on reduced motion, or no WebGL.

**Performance budgets (mobile, Lighthouse)**
- Performance ≥ 90 · Accessibility ≥ 95 · Best Practices ≥ 95 · **SEO = 100**
- LCP < 2.5s · CLS < 0.1 · INP < 200ms
- Initial JS (excluding the lazy 3D chunk) < 250 KB gzipped; 3D chunk < 400 KB gzipped
- Images via `next/image`, AVIF/WebP, explicit sizes; fonts `display: swap` + preload display font

**Accessibility**
- Semantic landmarks, one `h1` per page, logical heading order.
- Full keyboard navigation; visible `brand-500` focus ring; skip-to-content link.
- Custom cursor never hides the real cursor for keyboard/touch users; disabled on touch devices.
- Colour contrast per §6.2; `steel-600` and burgundy never used for body text.
- Pinned/horizontal sections must remain reachable by keyboard and screen reader (content exists in DOM order).

---

## 12. SEO spec (we have an SEO expert — the site must prove it)

- Next.js Metadata API: unique `title` + `description` per page, `metadataBase`, canonical URLs, `openGraph` + `twitter` (`summary_large_image`).
- Dynamic OG images with `next/og` for home and each member.
- `app/sitemap.ts`, `app/robots.ts`, `app/manifest.ts`.
- JSON-LD: `Organization` (name APEC, logo, url, sameAs, `member` → 5 `Person`) on home; `Person` (name, jobTitle, knowsAbout = confirmed skills, `memberOf` APEC, sameAs socials) on each member page; `BreadcrumbList` on member pages.
- All images have meaningful `alt`. Headline text is real text (not canvas/SVG-only).
- Keywords/meta copy: **owned by member 01** — placeholders `TODO: SEO copy` until provided.
- Google Search Console + Bing Webmaster verification tags via env vars.

---

## 13. Contact & integrations

- Form fields: name*, email*, company, services (multi-select from `services.ts`), budget range, timeline, message*, hidden honeypot. Pre-fill "member" when opened from a member page.
- Server Action → zod validate → **Resend** sends to the APEC inbox + auto-reply to the sender. Basic rate limit (per IP, in-memory or Vercel KV/Upstash later).
- WhatsApp click-to-chat link: `https://wa.me/<number>` (number TODO).
- Env vars (`.env.local`, never committed; add to Vercel):
  ```
  RESEND_API_KEY=
  CONTACT_TO_EMAIL=
  CONTACT_FROM_EMAIL=
  NEXT_PUBLIC_SITE_URL=
  NEXT_PUBLIC_WHATSAPP_NUMBER=
  GOOGLE_SITE_VERIFICATION=
  ```

---

## 14. Build phases & acceptance criteria

| Phase | Who | Deliverable | Done when |
|---|---|---|---|
| **0 · Tooling** | Claude Code + human | §2 installed | Gate §2.7 passes, `SETUP_LOG.md` committed |
| **1 · Reference intake** | Human → Claude Code → Codex | Reels in `references/`, frames extracted, stymite.me studied via Playwright, logo SVG requested | `docs/REFERENCES.md` has a steal list both agents agree on |
| **2 · Design direction** | Claude Design → Codex critique → human | Design-system board (§6), hero, team section, member page, contact — desktop 1440 + mobile 390. Concept chosen (§7). Headline chosen. | Human approves; Codex critique in `docs/reviews/phase2-codex.md`; handoff bundle sent to Claude Code |
| **3 · Foundations** | Claude Code | Scaffold (§3.1), tokens, fonts, layout, SmoothScroll + GSAP providers, Nav, Footer, Grain, Cursor, Preloader, 404, flags, content schema | `pnpm build` passes; Lighthouse baseline recorded; `/codex:review` clean |
| **4 · Home sections** | Claude Code → Codex refine | Sections 2–12 of §8.1 (3D hero as poster for now) | Matches approved design at 1440/1024/768/390; reduced-motion works; Codex review clean |
| **5 · Member pages** | Claude Code | `/team/[slug]` ×5 from data, shared-element transition, CV PDFs, OG images | All 5 pages render from `team.ts`; invalid data fails the build |
| **6 · 3D hero** | Claude Code → Codex perf review | R3F ApexMark scene + shard split into team section, fallback poster | Budgets in §11 still met; 60fps on a mid-range laptop; mobile uses fallback/light mode |
| **7 · Contact, SEO, analytics** | Claude Code | §12 + §13 | Real test email delivered; Rich Results Test passes; SEO = 100 |
| **8 · QA & launch** | Codex adversarial review → Claude Code fixes → human | §15 checklist, domain, production deploy | All checklist items ticked; human signs off |

---

## 15. QA checklist (before launch)

- [ ] Chrome, Safari, Firefox, Edge (latest) · iOS Safari · Android Chrome
- [ ] Widths: 390, 768, 1024, 1440, 1920
- [ ] Keyboard-only walkthrough; screen reader spot check (VoiceOver/NVDA)
- [ ] `prefers-reduced-motion` on → everything usable, nothing pinned/scrubbed
- [ ] No WebGL → poster fallback
- [ ] Slow 4G throttle → preloader doesn't stall; LCP < 2.5s
- [ ] Lighthouse CI meets §11 budgets on home + one member page
- [ ] No `TODO:` rendered in production; no console errors; no 404s in network tab
- [ ] Contact form: success, validation errors, spam honeypot, email received
- [ ] OG previews look right (WhatsApp, LinkedIn, X)
- [ ] `vercel-labs` **web-design-guidelines** skill audit run, findings fixed
- [ ] Playwright e2e: home loads, nav works, each member page loads, contact submits (mocked)

---

## 16. Deployment

- GitHub repo `apec-web` (private) → import into Vercel → every branch gets a preview URL.
- Production = `main`. Domain: **TODO** (e.g. apec.studio / apec.agency — check availability). Set `NEXT_PUBLIC_SITE_URL` accordingly.
- Add env vars in Vercel for Preview + Production.
- Enable Vercel Analytics + Speed Insights.

---

## 17. Copy-paste starter prompts

### 17.1 Claude Code — session 1
```
Read docs/APEC_BUILD_BRIEF.md completely. You are the builder for this project.
Execute PHASE 0 ONLY (Section 2): install and verify every tool, plugin, skill and MCP server.
Stop and ask me whenever a login is needed. Write all verification output to docs/SETUP_LOG.md.
Do not scaffold the app or write app code until I confirm the gate passed.
Then propose (plan mode) how you'll run Phase 1.
```

### 17.2 Claude Code — study the brother's site (Phase 1)
```
Use playwright mcp to open https://stymite.me. Wait for the loader, scroll the whole page slowly,
take screenshots at 1440px and 390px wide at each distinct section/state, and save them to
references/stymite/. Then write docs/REFERENCES.md → "stymite.me" per Section 5.1.
Describe; do not copy code, assets, music or copy.
```

### 17.3 Codex — design-logic reviewer
```
Read AGENTS.md and docs/APEC_BUILD_BRIEF.md. Your role on this project: design logic, critique and refinement.
Look at the frames in references/frames/ and the screenshots in references/stymite/.
1) Fill the "Steal list" column of Section 5.2 in docs/REFERENCES.md (layout, motion, type, transitions — be specific).
2) Argue which concept from Section 7 fits APEC better and why, considering conversion (visitor → contact).
3) List risks (performance, accessibility, mobile) for each stolen effect and how to mitigate them in our stack.
Write to docs/reviews/phase1-codex.md. Don't edit app code.
```

### 17.4 Claude Design — first board
```
Create a design system and key screens for "APEC", a 5-person IT agency portfolio site.
Brand: dark premium. Background #05060A, navy surfaces #0E1A2E/#13233D, greyish-blue text #8A9BB4,
primary text #EEF1F5, brand blue gradient #5CC2FF→#1F7BFF→#0B3FA8, silver gradient for metallic headlines,
burgundy #7A1F33 as a rare accent (≤2%). Fonts: Clash Display (display), Geist (body), Geist Mono (labels),
Instrument Serif italic for one accent word. Logo: silver + blue "A" peak with three rising bars and an orbit swoosh.
Screens (desktop 1440 + mobile 390): preloader, hero, "The Five" team section (5 cards, 01/05 indices),
member CV page, contact section. Concept: [The Ascent | Five-Card Hand]. Show 2 variations of the hero.
```
Then: Export → **Handoff to Claude Code**.

### 17.5 Every merge
```
/codex:review --base main
```

---

## 18. Open questions (humans answer in `docs/QUESTIONS.md`)

1. What does APEC stand for (if anything)? Final tagline?
2. Domain name?
3. Names, photos and content for members 01, 03, 04, 05 (§9.3).
4. Can Mustafa name **Atlus Bank** publicly? (Default: no → "a US bank".)
5. Concept: The Ascent or Five-Card Hand — decide after the reels steal list.
6. Contact email + WhatsApp number.
7. Location line: show the city, just "Pakistan", or only "Remote · Worldwide"?
8. Sound toggle: yes/no?
9. English only for v1? (Urdu later?)
10. Does the designer already have the logo as SVG?

---

## Appendix A — `AGENTS.md` (repo root; read by Codex and, via import, Claude Code)

```md
# AGENTS.md — APEC website

Source of truth: docs/APEC_BUILD_BRIEF.md (read it fully before any task).

## Non-negotiables
- Phase 0 tooling must be verified (docs/SETUP_LOG.md) before app code.
- Never invent content (names, clients, stats, testimonials). Use `TODO:`.
- Stack is locked (brief §3). No new dependencies or major bumps without asking.
- Banned: framer-motion pkg name, @studio-freight/lenis, locomotive-scroll, tailwindcss-animate, UI kits, CSS-in-JS.
- Look up current docs (Context7 / next-devtools MCP) before using an API.
- One writer per branch. Claude Code → feat/*. Codex → refine/* or review notes only.
- Log decisions in docs/DECISIONS.md.

## Commands
- dev: `pnpm dev` · build: `pnpm build` · lint: `pnpm lint` · e2e: `pnpm exec playwright test` · lighthouse: `pnpm exec lhci autorun`

## Conventions
- Server Components by default; "use client" only for interactive leaves.
- Copy lives in src/content/*. Data validated by zod (src/content/schema.ts).
- Tailwind v4 tokens in src/app/globals.css (@theme). Use tokens, never raw hex in components.
- GSAP only inside useGSAP with scope; Lenis synced to gsap.ticker; gsap.matchMedia for reduced motion.
- 3D is dynamically imported (ssr:false) and has a poster fallback.
- Budgets: mobile Lighthouse Perf ≥90, A11y ≥95, SEO 100; LCP <2.5s; CLS <0.1.
- Conventional commits. Small PRs.
```

## Appendix B — `CLAUDE.md`

```md
@AGENTS.md

## Claude Code specifics
- Use plan mode at the start of each phase; wait for approval.
- Use the frontend-design plugin's guidance for all UI work.
- Before merging: run `/codex:review --base main` and fix must-fix items.
- Use playwright mcp to screenshot your work at 1440 and 390 and compare with the approved design.
- Use next-devtools mcp to check for build/runtime errors after each change.
```

## Appendix C — `.mcp.json` (Claude Code, project scope)

```json
{
  "mcpServers": {
    "playwright":    { "command": "npx", "args": ["-y", "@playwright/mcp@latest"] },
    "next-devtools": { "command": "npx", "args": ["-y", "next-devtools-mcp@latest"] },
    "shadcn":        { "command": "npx", "args": ["shadcn@latest", "mcp"] }
  }
}
```

## Appendix D — Codex `~/.codex/config.toml` (what `codex mcp add` produces)

```toml
[mcp_servers.context7]
command = "npx"
args = ["-y", "@upstash/context7-mcp"]

[mcp_servers.playwright]
command = "npx"
args = ["-y", "@playwright/mcp@latest"]

[mcp_servers.next-devtools]
command = "npx"
args = ["-y", "next-devtools-mcp@latest"]

[mcp_servers.shadcn]
command = "npx"
args = ["-y", "shadcn@latest", "mcp"]
```

## Appendix E — Official links (agents: check these if a command fails)

- Claude Code setup: https://code.claude.com/docs/en/setup
- Codex CLI docs: https://developers.openai.com/codex
- Codex plugin for Claude Code: https://github.com/openai/codex-plugin-cc
- GSAP AI skills: https://github.com/greensock/gsap-skills
- Vercel agent skills: https://github.com/vercel-labs/agent-skills
- Playwright MCP: https://playwright.dev/docs/getting-started-mcp
- shadcn MCP: https://ui.shadcn.com/docs/mcp
- Next.js DevTools MCP: https://github.com/vercel/next-devtools-mcp
- Context7 (all clients): https://context7.com/docs/resources/all-clients
- Lenis: https://github.com/darkroomengineering/lenis
- Claude Design: https://claude.ai/design
