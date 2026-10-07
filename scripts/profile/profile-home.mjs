// Profiles the home page (hero + team) with effects switched off one at a time.
// Usage: pnpm build && pnpm exec next start -p 3000, then
//   node scripts/profile/profile-home.mjs [runs] > results.json
// Each run uses a fresh headed Chrome (cold shader/HTTP cache = a real first visit).
// Headed on purpose: headless Chrome reads every frame back from the GPU, which
// distorts results for animated WebGL.
import { chromium } from "@playwright/test";

const BASE = process.env.BASE ?? "http://localhost:3000/";
const RUNS = Number(process.argv[2] ?? 2);

// [label, value for ?perf-off=]. The per-effect switches only exist on branch
// perf/profile-reel01 (see docs/PERFORMANCE_REVIEW.md); by default the current build is measured.
const VARIANTS = process.env.PERF_VARIANTS
  ? process.env.PERF_VARIANTS.split(";").map((v) => v.split(":"))
  : [["current", ""]];

const PROFILES = {
  desktop: { context: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }, cpu: 1 },
  mobile: {
    context: {
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
    },
    cpu: 4,
  },
};

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted.length ? sorted[Math.floor((sorted.length - 1) / 2)] : null;
};

async function runOnce(profileName, off) {
  const profile = PROFILES[profileName];
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext(profile.context);
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: profile.cpu });

  await page.addInitScript(() => {
    window.__long = [];
    window.__frames = [];
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) window.__long.push([e.startTime, e.duration]);
    }).observe({ type: "longtask", buffered: true });
    const tick = (t) => {
      window.__frames.push(t);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  const url = `${BASE}?force-3d${off ? `&perf-off=${off}` : ""}`;
  await page.goto(url, { waitUntil: "load" });
  await page.waitForTimeout(6000);
  const scrollStart = await page.evaluate(() => performance.now());

  await page.mouse.move(profile.context.viewport.width / 2, profile.context.viewport.height / 2);
  for (let i = 0; i < 70; i++) {
    await page.mouse.wheel(0, 110);
    await page.waitForTimeout(40);
  }
  await page.waitForTimeout(1500);

  const data = await page.evaluate((start) => {
    const nav = performance.getEntriesByType("navigation")[0];
    const fcp = performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? 0;
    const scripts = performance
      .getEntriesByType("resource")
      .filter((r) => r.initiatorType === "script")
      .reduce((sum, r) => sum + r.transferSize, 0);
    const mark = (name) => performance.getEntriesByName(name)[0]?.startTime ?? null;
    const dither = performance
      .getEntriesByType("measure")
      .filter((m) => m.name.startsWith("dither:"))
      .reduce((sum, m) => sum + m.duration, 0);
    const loadTasks = window.__long.filter(([t]) => t < start);
    const scrollTasks = window.__long.filter(([t]) => t >= start);
    const frames = window.__frames.filter((t) => t >= start);
    const deltas = frames.slice(1).map((t, i) => t - frames[i]);
    return {
      domContentLoaded: nav?.domContentLoadedEventEnd ?? null,
      fcp,
      scriptKB: scripts / 1024,
      hero3dStart: mark("hero3d:start"),
      hero3dCompiled: mark("hero3d:compiled"),
      ditherMs: dither,
      load: {
        tasks: loadTasks.length,
        total: loadTasks.reduce((s, [, d]) => s + d, 0),
        max: Math.max(0, ...loadTasks.map(([, d]) => d)),
        blocking: loadTasks.reduce((s, [, d]) => s + Math.max(0, d - 50), 0),
      },
      scroll: {
        tasks: scrollTasks.length,
        total: scrollTasks.reduce((s, [, d]) => s + d, 0),
        max: Math.max(0, ...scrollTasks.map(([, d]) => d)),
        frames: deltas.length,
        p95: deltas.length
          ? [...deltas].sort((a, b) => a - b)[Math.floor(deltas.length * 0.95)]
          : null,
        maxFrame: Math.max(0, ...deltas),
        jankPct: deltas.length ? (deltas.filter((d) => d > 34).length / deltas.length) * 100 : null,
      },
    };
  }, scrollStart);

  await browser.close();
  return data;
}

const results = {};
for (const profileName of Object.keys(PROFILES)) {
  for (const [label, off] of VARIANTS) {
    const runs = [];
    for (let r = 0; r < RUNS; r++) runs.push(await runOnce(profileName, off));
    const pick = (fn) => median(runs.map(fn));
    const summary = {
      runs: runs.length,
      scriptKB: Math.round(pick((r) => r.scriptKB)),
      hero3dReadyMs:
        pick((r) => (r.hero3dCompiled && r.hero3dStart ? r.hero3dCompiled - r.hero3dStart : 0)) ||
        null,
      ditherMs: Math.round(pick((r) => r.ditherMs)),
      loadLongTasks: pick((r) => r.load.tasks),
      loadLongTotalMs: Math.round(pick((r) => r.load.total)),
      loadMaxTaskMs: Math.round(pick((r) => r.load.max)),
      loadBlockingMs: Math.round(pick((r) => r.load.blocking)),
      scrollLongTotalMs: Math.round(pick((r) => r.scroll.total)),
      scrollMaxTaskMs: Math.round(pick((r) => r.scroll.max)),
      scrollP95FrameMs: Math.round(pick((r) => r.scroll.p95 ?? 0)),
      scrollMaxFrameMs: Math.round(pick((r) => r.scroll.maxFrame)),
      scrollJankPct: Math.round(pick((r) => r.scroll.jankPct ?? 0)),
    };
    results[`${profileName}/${label}`] = { summary, raw: runs };
    console.error(profileName, label, JSON.stringify(summary));
  }
}
console.log(JSON.stringify(results, null, 2));
