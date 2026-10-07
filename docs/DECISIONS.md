# Decisions

Format: date · decision · why · alternatives rejected

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

## 2026-10-07 · Temporary logo is labelled as temporary everywhere
- **Why:** only a raster logo exists (`references/brand/apec-logo-source.jpeg`). A rough SVG trace is needed for development, but it must not become the brand asset by accident. It lives in `TemporaryApexMark.tsx`, carries `data-temporary-logo`, is listed by the build's TODO report, and is not used for the favicon, OG image or any exported asset.
