// Build-time frame strips for the portfolio heroes (the portrait turns as you scroll).
// Usage: FRAME_SRC=<folder> pnpm frames
//   <folder> holds one directory per member, named by slug, each full of JPEG frames.
// Sources (2026-10-29): github.com/HamadAlam311/Images (four members, ezgif-* folders)
// and github.com/HamadAlam311/HamadAlam-Portfolio (scroll/main → hamad-alam).
// Output: public/portfolio/<slug>/f-NN.webp — COUNT evenly spaced frames, WIDTH wide.
// Only the first frame loads with the page; the rest are fetched as the hero is read.
import { mkdir, readdir, rm } from "node:fs/promises";
import { join } from "node:path";

import sharp from "sharp";

const SRC = process.env.FRAME_SRC;
const OUT = "public/portfolio";
/** Frames kept per member, and their width. 48 is smooth at scroll speed; 720 is sharp
 *  on a 2× phone without making each file heavy. */
const COUNT = 48;
const WIDTH = 720;

if (!SRC) throw new Error("Set FRAME_SRC to the folder of per-slug frame directories.");

/** Picks `count` frames evenly across the sequence, always keeping the first and last. */
const evenly = (files, count) =>
  Array.from({ length: Math.min(count, files.length) }, (_, i) =>
    files[Math.round((i * (files.length - 1)) / (Math.min(count, files.length) - 1))],
  );

const slugs = await readdir(SRC, { withFileTypes: true });
for (const entry of slugs) {
  if (!entry.isDirectory()) continue;
  const slug = entry.name;
  const dir = join(SRC, slug);
  const files = (await readdir(dir)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort();
  if (!files.length) continue;

  const out = join(OUT, slug);
  await rm(out, { recursive: true, force: true });
  await mkdir(out, { recursive: true });

  let bytes = 0;
  for (const [i, file] of evenly(files, COUNT).entries()) {
    const result = await sharp(join(dir, file))
      .resize({ width: WIDTH })
      .webp({ quality: 72, effort: 5 })
      .toFile(join(out, `f-${String(i).padStart(2, "0")}.webp`));
    bytes += result.size;
  }
  console.log(`${slug}: ${files.length} → ${COUNT} frames, ${(bytes / 1024 / 1024).toFixed(1)} MB`);
}
