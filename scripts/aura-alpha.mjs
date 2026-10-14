// Turns the pre-rendered aura still (light on black) into a transparent image, so the
// hero can composite it normally instead of with mix-blend-mode (which made every frame
// re-blend the hero). Alpha = brightest channel; colour is un-premultiplied by it.
// Usage: node scripts/aura-alpha.mjs  (re-run after pnpm render:layers)
import sharp from "sharp";

const SRC = "public/brand/apex-aura-poster.jpg";
const OUT = "public/brand/apex-aura.webp";

const { data, info } = await sharp(SRC).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const out = Buffer.alloc(info.width * info.height * 4);
for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  const a = Math.max(r, g, b);
  const k = a ? 255 / a : 0;
  out[j] = Math.min(255, Math.round(r * k));
  out[j + 1] = Math.min(255, Math.round(g * k));
  out[j + 2] = Math.min(255, Math.round(b * k));
  out[j + 3] = a;
}
await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
  .webp({ quality: 88, alphaQuality: 92 })
  .toFile(OUT);
console.log("wrote", OUT);
