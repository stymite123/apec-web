// Renders the logo's four pieces as separate transparent PNGs, for the scroll sequence
// that splits the mark (DECISIONS 2026-10-29).
// Usage: pnpm build && pnpm exec next start -p 3000, then `pnpm render:parts`.
// Output: public/brand/part-{white,blue,bars,swoosh}.png
// Headed Chrome on purpose (real GPU). Transparency comes from difference matting:
// the same frame on black and on white gives colour × alpha and (1 − alpha) × white.
import { mkdir } from "node:fs/promises";

import { chromium } from "@playwright/test";
import sharp from "sharp";

const BASE = process.env.BASE ?? "http://localhost:3000/";
const PARTS = ["white", "blue", "bars", "swoosh"];
const SIZE = 800; // CSS px, captured at DPR 2

const hide = (bg) => `
  html { scrollbar-width: none !important; overflow: hidden !important; }
  html, body { background: ${bg} !important; }
  #site-header, footer, .grain { display: none !important; }
  /* Lift the render container over the page instead of hiding its ancestors: a
     zero-sized canvas never starts, so the capture hook would never appear. */
  [data-render-mark] {
    position: fixed !important; inset: 0 !important; z-index: 99999 !important;
    background: ${bg} !important;
  }
`;

const raw = (buffer) => sharp(buffer).removeAlpha().raw().toBuffer({ resolveWithObject: true });

await mkdir("public/brand", { recursive: true });
const browser = await chromium.launch({ headless: false });

for (const part of PARTS) {
  const page = await browser.newPage({
    viewport: { width: SIZE, height: SIZE },
    deviceScaleFactor: 2,
  });
  await page.goto(`${BASE}?render-mark=${part}`, { waitUntil: "load" });
  await page.addStyleTag({ content: hide("#000") });
  // Poll rather than waitForFunction: the hook is set after hydration, and polling
  // from here is immune to how the page's world is evaluated.
  for (let i = 0; i < 60; i++) {
    if (await page.evaluate(() => typeof window.__renderMarkAt === "function")) break;
    await page.waitForTimeout(500);
  }
  await page.waitForTimeout(2500); // environment map and shaders
  await page.evaluate(() => window.__renderMarkAt(0));
  const onBlack = await raw(await page.screenshot());
  await page.addStyleTag({ content: hide("#fff") });
  await page.evaluate(() => window.__renderMarkAt(0));
  const onWhite = await raw(await page.screenshot());
  await page.close();

  const { width, height } = onBlack.info;
  const rgba = Buffer.alloc(width * height * 4);
  let covered = 0;
  for (let p = 0; p < width * height; p++) {
    const b = [0, 1, 2].map((c) => onBlack.data[p * 3 + c]);
    const w = [0, 1, 2].map((c) => onWhite.data[p * 3 + c]);
    const diff = (w[0] - b[0] + (w[1] - b[1]) + (w[2] - b[2])) / 3;
    const alpha = Math.min(1, Math.max(0, 1 - diff / 255));
    if (alpha > 0.02) covered++;
    for (let c = 0; c < 3; c++) {
      rgba[p * 4 + c] = alpha > 0.004 ? Math.min(255, Math.round(b[c] / alpha)) : 0;
    }
    rgba[p * 4 + 3] = Math.round(alpha * 255);
  }
  if (!covered) throw new Error(`${part}: nothing was drawn.`);

  // Kept at the full frame (no trim) so the four pieces stack back into the whole logo.
  const result = await sharp(rgba, { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(`public/brand/part-${part}.png`);
  console.log(`part-${part}.png ${result.width}×${result.height}, ${(result.size / 1024).toFixed(0)} KB`);
}

await browser.close();
