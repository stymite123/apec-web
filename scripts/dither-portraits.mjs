// Build-time dither for team portraits (replaces in-browser canvas processing).
// Usage: pnpm dither   (re-run whenever a photo in public/team/*.jpg changes)
// Output: public/team/dither/<slug>-<level>.png — tiny 2-colour PNGs, scaled up in CSS
// with `image-rendering: pixelated`, so the browser does no image processing.
// Team cards also get:
//   public/team/dither/<slug>-cut-<level>.png  dither of the cut-out (scripts/cutout-portraits.py)
//   public/team/backdrop/<slug>.jpg             tiny blurred, darkened, blue-tinted backdrop
import { existsSync } from "node:fs";
import { mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";

import sharp from "sharp";

const SRC = "public/team";
const OUT = "public/team/dither";
const CUTOUT = "public/team/cutout";
const BACKDROP = "public/team/backdrop";
/** Output widths per level, coarse → fine (the display is ~480 CSS px wide). */
const WIDTHS = [72, 150, 300];
/** Dot colour = silver-300. */
const DOT = [197, 204, 214];

// 8×8 Bayer matrix → 64 threshold steps (smoother tones than 4×4).
const BAYER8 = (() => {
  const m = [[0]];
  let size = 1;
  let matrix = m;
  while (size < 8) {
    const next = Array.from({ length: size * 2 }, () => Array(size * 2).fill(0));
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const v = matrix[y][x] * 4;
        next[y][x] = v;
        next[y][x + size] = v + 2;
        next[y + size][x] = v + 3;
        next[y + size][x + size] = v + 1;
      }
    }
    matrix = next;
    size *= 2;
  }
  return matrix;
})();

/** `cutout`: dither a transparent cut-out; dots only where the person is, no vignette. */
async function ditherOne(input, name, { cutout = false } = {}) {
  for (const [level, width] of WIDTHS.entries()) {
    const { data, info } = await sharp(input)
      .resize({ width })
      .greyscale()
      .normalise()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const alpha = cutout
      ? await sharp(input).resize({ width }).ensureAlpha().extractChannel(3).raw().toBuffer()
      : null;

    const { width: w, height: h } = info;
    const rgba = Buffer.alloc(w * h * 4);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const lum = data[y * w + x] / 255;
        // Vignette centred on the face (upper middle) so busy backgrounds fall away.
        const dx = (x / w - 0.5) * 1.7;
        const dy = (y / h - 0.4) * 1.25;
        const vignette = alpha ? alpha[y * w + x] / 255 : Math.max(0, 1 - (dx * dx + dy * dy));
        const tone = ((lum - 0.5) * 1.45 + 0.47) * (alpha ? vignette : 0.28 + 0.72 * vignette);
        const threshold = (BAYER8[y % 8][x % 8] + 0.5) / 64;
        const i = (y * w + x) * 4;
        rgba[i] = DOT[0];
        rgba[i + 1] = DOT[1];
        rgba[i + 2] = DOT[2];
        rgba[i + 3] = tone > threshold ? 255 : 0;
      }
    }

    const out = join(OUT, `${name}-${level}.png`);
    const result = await sharp(rgba, { raw: { width: w, height: h, channels: 4 } })
      .png({ palette: true, colours: 2, compressionLevel: 9 })
      .toFile(out);
    console.log(`${out}  ${w}×${h}  ${(result.size / 1024).toFixed(1)} KB`);
  }
}

async function backdropOne(file, slug) {
  const out = join(BACKDROP, `${slug}.jpg`);
  await sharp(join(SRC, file))
    .resize(192, 192, { fit: "cover", position: "top" })
    .blur(6)
    // Luminance mapped onto a blackish-red ramp (a dark duotone).
    .recomb([
      [0.129, 0.254, 0.047],
      [0.042, 0.083, 0.015],
      [0.06, 0.118, 0.022],
    ])
    .linear(1, 6)
    .jpeg({ quality: 72 })
    .toFile(out);
  console.log(out);
}

await mkdir(OUT, { recursive: true });
await mkdir(BACKDROP, { recursive: true });
const files = (await readdir(SRC)).filter((f) => f.endsWith(".jpg"));
for (const file of files) {
  const slug = file.replace(/\.jpg$/, "");
  await ditherOne(join(SRC, file), slug);
  await backdropOne(file, slug);
  const cut = join(CUTOUT, `${slug}.png`);
  if (existsSync(cut)) await ditherOne(cut, `${slug}-cut`, { cutout: true });
}
