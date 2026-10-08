// Renders the hero as two layers from the 3D scene (offline; visitors never run WebGL):
//   public/brand/apex-mark-layer.png      the mark alone, with real transparency
//   public/brand/apex-aura.{webm,mp4}     the morphing aura as a seamless video loop
//   public/brand/apex-aura-poster.jpg     its first frame (poster, reduced motion)
// Usage: pnpm build && pnpm exec next start -p 3000, then `pnpm render:layers`.
// Needs ffmpeg on PATH. Headed Chrome on purpose (real GPU, no headless read-back).
// FRAMES_DIR (default: system temp) holds ~70 MB of intermediate frames.
import { execFileSync } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { chromium } from "@playwright/test";
import sharp from "sharp";

const BASE = process.env.BASE ?? "http://localhost:3000/";
const FRAMES = process.env.FRAMES_DIR ?? join(tmpdir(), "apec-aura-frames");
const SIZE = 800; // CSS px
const FPS = 24;
const LOOP_S = 8; // loop length
const BLEND_S = 1.5; // cross-fade that hides the seam

const HIDE_ALL_BUT_CANVAS = (bg) => `
  #site-header, .grain, [data-hero] > :not([data-render-mark]) { display: none !important; }
  html, body, [data-hero] { background: ${bg} !important; }
  html { scrollbar-width: none !important; overflow: hidden !important; }
  [data-hero] {
    position: fixed !important; inset: 0 !important; z-index: 9999 !important;
    height: 100vh !important; min-height: 0 !important; margin: 0 !important;
  }
`;

async function openLayer(browser, layer, dpr) {
  const page = await browser.newPage({
    viewport: { width: SIZE, height: SIZE },
    deviceScaleFactor: dpr,
  });
  await page.goto(`${BASE}?render-mark=${layer}`, { waitUntil: "load" });
  const style = await page.addStyleTag({ content: HIDE_ALL_BUT_CANVAS("#000") });
  await page.waitForFunction(() => typeof window.__renderMarkAt === "function", null, {
    timeout: 30_000,
  });
  await page.waitForTimeout(2500); // environment map + shaders
  return { page, style };
}

const raw = (buffer) => sharp(buffer).removeAlpha().raw().toBuffer({ resolveWithObject: true });

await mkdir("public/brand", { recursive: true });
await rm(FRAMES, { recursive: true, force: true });
await mkdir(FRAMES, { recursive: true });
const browser = await chromium.launch({ headless: false });

// 1. Mark: difference matting. On black we get colour × alpha; on white we also get
//    (1 − alpha) × white, so alpha = 1 − (white − black).
{
  const { page } = await openLayer(browser, "mark", 2);
  await page.evaluate(() => window.__renderMarkAt(0));
  const onBlack = await raw(await page.screenshot());
  await page.addStyleTag({ content: HIDE_ALL_BUT_CANVAS("#fff") });
  await page.evaluate(() => window.__renderMarkAt(0));
  const onWhite = await raw(await page.screenshot());
  const { width, height } = onBlack.info;
  const rgba = Buffer.alloc(width * height * 4);
  let opaque = 0;
  for (let p = 0; p < width * height; p++) {
    const b = [0, 1, 2].map((c) => onBlack.data[p * 3 + c]);
    const w = [0, 1, 2].map((c) => onWhite.data[p * 3 + c]);
    const diff = (w[0] - b[0] + (w[1] - b[1]) + (w[2] - b[2])) / 3;
    const alpha = Math.min(1, Math.max(0, 1 - diff / 255));
    if (alpha > 0.99) opaque++;
    for (let c = 0; c < 3; c++) {
      rgba[p * 4 + c] = alpha > 0.004 ? Math.min(255, Math.round(b[c] / alpha)) : 0;
    }
    rgba[p * 4 + 3] = Math.round(alpha * 255);
  }
  if (opaque / (width * height) > 0.95) {
    throw new Error("Canvas came out opaque: the renderer did not keep transparency.");
  }
  await sharp(rgba, { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile("public/brand/apex-mark-layer.png");
  console.log(
    `mark layer ${width}×${height}, ${((opaque / (width * height)) * 100).toFixed(1)}% opaque`,
  );
  await page.close();
}

// 2. Aura: evenly spaced frames, then a cross-fade so the end flows into the start.
{
  const { page } = await openLayer(browser, "aura", 1);
  await page.addStyleTag({ content: HIDE_ALL_BUT_CANVAS("#05060A") });
  const total = Math.round((LOOP_S + BLEND_S) * FPS);
  for (let i = 0; i < total; i++) {
    await page.evaluate((t) => window.__renderMarkAt(t), i / FPS);
    await page.screenshot({ path: join(FRAMES, `raw-${String(i).padStart(4, "0")}.png`) });
    if (i % 48 === 0) console.log(`aura frame ${i}/${total}`);
  }
  await page.close();
}
await browser.close();

const loop = LOOP_S * FPS;
const blend = BLEND_S * FPS;
const frame = (i) => raw(join(FRAMES, `raw-${String(i).padStart(4, "0")}.png`));
for (let i = 0; i < loop; i++) {
  const out = join(FRAMES, `loop-${String(i).padStart(4, "0")}.png`);
  const a = await frame(i);
  if (i >= blend) {
    await sharp(a.data, { raw: a.info }).png().toFile(out);
    continue;
  }
  // Early frames fade in from the frames that follow the loop's end.
  const b = await frame(i + loop);
  const w = i / blend;
  const mixed = Buffer.alloc(a.data.length);
  for (let k = 0; k < mixed.length; k++) mixed[k] = Math.round(a.data[k] * w + b.data[k] * (1 - w));
  await sharp(mixed, { raw: a.info }).png().toFile(out);
}

const input = [
  "-y",
  "-loglevel",
  "error",
  "-framerate",
  String(FPS),
  "-i",
  join(FRAMES, "loop-%04d.png"),
];
execFileSync("ffmpeg", [
  ...input,
  ...["-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "38", "-pix_fmt", "yuv420p", "-row-mt", "1"],
  ...["-an", "public/brand/apex-aura.webm"],
]);
execFileSync("ffmpeg", [
  ...input,
  ...["-c:v", "libx264", "-crf", "26", "-preset", "slow", "-pix_fmt", "yuv420p"],
  ...["-movflags", "+faststart", "-an", "public/brand/apex-aura.mp4"],
]);
await sharp(join(FRAMES, "loop-0000.png"))
  .jpeg({ quality: 80 })
  .toFile("public/brand/apex-aura-poster.jpg");
await rm(FRAMES, { recursive: true, force: true });
console.log(
  "→ public/brand/apex-mark-layer.png, apex-aura.webm, apex-aura.mp4, apex-aura-poster.jpg",
);
