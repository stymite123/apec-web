@AGENTS.md

## Claude Code specifics
- Role: app code only. Codex (design side) owns design and visual review; Codex reviews and logins are run by the humans (decided 2026-10-07, see docs/DECISIONS.md).
- Use plan mode at the start of each phase; wait for approval.
- Use the frontend-design skill's guidance for all UI work; GSAP skills for any animation code.
- Before merging: the human runs `/codex:review --base main`; fix must-fix items from docs/reviews/.
- Use playwright mcp to screenshot your work at 1440 and 390 and compare with the approved design.
- Use next-devtools mcp to check for build/runtime errors after each change.
