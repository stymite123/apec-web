<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

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
