# APEC Digital website

Portfolio site for **APEC Digital** — Agency for Professionals, Experienced & Creatives.
Next.js 16 (App Router) · Tailwind CSS 4 · GSAP · TypeScript.

All fonts are free (Google Fonts, OFL): Newsreader, Unbounded, Geist, Geist Mono and
Instrument Serif. Team photos and the APEC logo belong to APEC Digital.

## Run it locally

Needs [Node.js](https://nodejs.org) 24+ and pnpm (`corepack enable` sets pnpm up).

```bash
pnpm install
pnpm dev            # http://localhost:3000
```

Production build: `pnpm build && pnpm start`.

Optional settings go in `.env.local` (see `.env.example`); the site runs without them.

## Where things are

| Path | What |
|---|---|
| `src/content/` | All copy: `site.ts` (headline, sections, contact), `team.ts` (the five), `services.ts` |
| `src/app/` | Pages: home (`page.tsx`), member pages (`team/[slug]`), 404, SEO files |
| `src/components/sections/` | Home sections: Hero, FieldIntro (intro + phrases), TeamCards, Services, TaglineBand, Process, Contact |
| `src/app/globals.css` | Colours, fonts, gradients, animations |
| `public/brand/` | Logo layer + aura video for the hero |
| `public/team/` | Team photos, cut-outs, dither layers, card backdrops |
| `references/originals/` | The original files we were given (photos, flyer, logo) |
| `docs/` | Brief, decisions log, copy for review, performance notes |

## Changing photos or the logo render

- **Team photo:** replace `public/team/<slug>.jpg`, then run
  `python scripts/cutout-portraits.py` (needs `pip install "rembg[cpu]"`) and `pnpm dither`.
- **Hero logo + aura:** rendered offline from the 3D scene: `pnpm build && pnpm start`,
  then `pnpm render:layers` (needs ffmpeg). Visitors never load 3D.

## Checks

```bash
pnpm lint && pnpm typecheck
pnpm exec playwright install chromium   # first time only
pnpm e2e                                # smoke tests
```

## Branches

- `main` — the current site.
- `preview/field-hero` — the animated GSAP-Field-style preview (same as `main` now).
- Tag `design-attempt-reel01` — an earlier, rejected design, kept for reference.
