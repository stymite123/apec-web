# Phase 0 — Setup log

**Date:** 2026-10-07 · **Machine:** Windows 10 Pro 10.0.19045 (non-admin user) · **Run by:** Claude Code (VS Code extension 2.1.292)

## Gate status: ❌ NOT PASSED

Everything Claude Code can install or check is done. The gate stays open until the MCP approval and smoke tests below are done — do not mark it passed before then. Once they pass, Phase 3 foundations start (`docs/PHASE3_PLAN.md`).

**Waiting on a human**
- [ ] **Approve the 4 project MCP servers.** Open `apec-web/` itself as the Claude Code workspace (VS Code: *File → Open Folder → apec-web*, or run `claude` inside `apec-web/`) and approve `playwright`, `next-devtools`, `shadcn`, `context7`. Today `claude mcp list` shows them as *Pending approval*.
- [ ] Smoke test: "Use playwright mcp to open https://stymite.me and take a screenshot." (needs the approval above)
- [ ] Smoke test: "Use context7 to fetch the current GSAP ScrollTrigger docs." (needs the approval above)
- [ ] Smoke test: `/codex:review` on a trivial change

**Deferred — not passed** (agreed 2026-10-07: not needed until remote repo work / deployment; not part of the §2.7 gate)
- [ ] `gh auth login` — before creating/pushing the GitHub repo
- [ ] `vercel login` — before the first Vercel deploy

**Done**
- [x] Machine prerequisites (§2.1)
- [x] Claude Code CLI available (§2.2)
- [x] Codex CLI installed and logged in (§2.3)
- [x] Codex plugin installed; `/codex:setup` check passes (§2.4)
- [x] Shared skills for Claude Code and Codex (§2.5)
- [x] MCP servers configured for Claude Code (project) and Codex (global) (§2.6)
- [x] Smoke test: Codex lists the GSAP + Vercel skills

## 2.1 Machine prerequisites

| Tool | Result | How |
|---|---|---|
| Node.js | `v24.19.0` ✅ | already installed |
| pnpm | `12.10.1` ✅ | `npm i -g pnpm` (corepack needs admin here) |
| Git | `git version 2.55.0.windows.3` ✅ | already installed; repo-local identity set |
| GitHub CLI | `gh version 2.102.0 (2026-09-30)` ✅ · **not logged in** | `winget install GitHub.cli` |
| ffmpeg | `ffmpeg version n9.0.1-11-ge47273f4d9-20260831` ✅ | `winget install BtbN.FFmpeg.GPL.9.0` (gyan.dev downloads stalled) |
| Vercel CLI | `62.7.0` ✅ · **not logged in** | `npm i -g vercel` |

## 2.2 Claude Code CLI

```
> claude --version
2.1.292 (Claude Code)
```
Bundled with the VS Code extension (`~\.vscode\extensions\anthropic.claude-code-2.1.292-win32-x64\resources\native-binary\claude.exe`); not on PATH. Run it by full path, or install the standalone CLI (`irm https://claude.ai/install.ps1 | iex`) if you want `claude` in a terminal.

## 2.3 Codex CLI

Already present via the ChatGPT VS Code extension (`codex-cli 0.162.0-alpha.2`, logged in with ChatGPT). `npm i -g @openai/codex` added it to PATH for the Claude Code plugin:
```
> codex --version
codex-cli 0.161.0
> codex login status
Logged in using ChatGPT
```

## 2.4 Claude Code plugins

```
> claude plugin marketplace add openai/codex-plugin-cc
√ Successfully added marketplace: openai-codex (declared in user settings)
> claude plugin install codex@openai-codex
√ Successfully installed plugin: codex@openai-codex (scope: user)
```
`/codex:setup` check (`codex-companion.mjs setup --json`): `"ready": true` — node v24.19.0, npm 11.17.0, codex-cli 0.161.0, ChatGPT login verified, review gate off.

`frontend-design` and the GSAP skills are installed as **project skills** (§2.5) instead of plugins, so Claude Code doesn't get duplicates (brief §2.4 note).

## 2.5 Shared skills

`npx skills add … -a claude-code -a codex --copy -y` → `.claude/skills/` (Claude Code) and `.agents/skills/` (Codex), locked in `skills-lock.json`:

```
deploy-to-vercel   gsap-core          gsap-react           vercel-composition-patterns
frontend-design    gsap-frameworks    gsap-scrolltrigger   vercel-react-best-practices
                   gsap-performance   gsap-timeline        vercel-react-view-transitions
                   gsap-plugins       gsap-utils           web-design-guidelines
```

Codex smoke test (`codex exec --sandbox read-only "List the names of the skills you have available in this project…"`) listed all 14, plus its built-in ones. ✅

## 2.6 MCP servers

**Claude Code (project, `.mcp.json`):**
```
> claude mcp list
playwright: cmd /c npx -y @playwright/mcp@latest - ⏸ Pending approval (run `claude` to approve)
next-devtools: cmd /c npx -y next-devtools-mcp@latest - ⏸ Pending approval (run `claude` to approve)
shadcn: cmd /c npx -y shadcn@latest mcp - ⏸ Pending approval (run `claude` to approve)
context7: https://mcp.context7.com/mcp (HTTP) - ⏸ Pending approval (run `claude` to approve)
```

**Codex (global, `~/.codex/config.toml`):**
```
> codex mcp list
context7       cmd  /c npx -y @upstash/context7-mcp     enabled
next-devtools  cmd  /c npx -y next-devtools-mcp@latest  enabled
playwright     cmd  /c npx -y @playwright/mcp@latest    enabled
shadcn         cmd  /c npx -y shadcn@latest mcp         enabled
```

## Scaffold check

`pnpm dlx create-next-app@latest apec-web --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --agents-md --yes`

- next `16.3.8` · react / react-dom `19.2.8` · tailwindcss `4.3.3` · typescript `5.9.3` · eslint `9.39.5`
- `pnpm build` ✅ (routes `/`, `/_not-found`, static) · `pnpm lint` ✅ (no findings)

## AGENTS.md

Brief Appendix A added below the Next.js-generated block (which is kept as-is).
