// Renders the hero artwork from the 3D scene into public/brand/apex-mark-render.png.
// Usage: pnpm build && pnpm exec next start -p 3000, then `pnpm render:mark`.
// Headed Chrome on purpose (real GPU, no headless frame read-back).
// Captures several frames to references/renders/ and copies the most detailed one;
// a different pose can be picked by hand from that folder.
import { copyFile, mkdir, stat } from "node:fs/promises";

import { chromium } from "@playwright/test";

const BASE = process.env.BASE ?? "http://localhost:3000/";
const SIZE = 800; // CSS px; captured at DPR 2 → 1600 px
const FRAMES = 4;

await mkdir("references/renders", { recursive: true });
await mkdir("public/brand", { recursive: true });

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({
  viewport: { width: SIZE, height: SIZE },
  deviceScaleFactor: 2,
});
await page.goto(`${BASE}?render-mark`, { waitUntil: "load" });

// Show only the canvas on the page background colour.
await page.addStyleTag({
  content: `
    header, footer, #site-header, [data-hero-wordmark], [data-hero-fade], .grain,
    main > :not([data-hero]), [data-hero] > :not([data-render-mark]) { display: none !important; }
    html, body, [data-hero] { background: #05060A !important; }
    [data-hero] { position: fixed !important; inset: 0 !important; height: 100vh !important; margin: 0 !important; }
  `,
});
await page.waitForFunction(
  () => performance.getEntriesByName("render-mark:ready").length > 0,
  null,
  {
    timeout: 30_000,
  },
);
await page.waitForTimeout(4000);

// Some captures land between post-processing passes and come out as dark silhouettes;
// the fully composited frame has by far the most detail, so keep the largest file.
const frames = [];
for (let i = 0; i < FRAMES; i++) {
  const path = `references/renders/apex-mark-${i}.png`;
  await page.screenshot({ path });
  frames.push({ path, size: (await stat(path)).size });
  await page.waitForTimeout(1200);
}
await browser.close();

const best = frames.reduce((a, b) => (b.size > a.size ? b : a));
await copyFile(best.path, "public/brand/apex-mark-render.png");
console.log(frames.map((f) => `${f.path} ${(f.size / 1024).toFixed(0)} KB`).join("\n"));
console.log(`→ public/brand/apex-mark-render.png from ${best.path}`);
