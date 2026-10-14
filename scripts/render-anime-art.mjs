/**
 * Draws the site's 2D anime-style scenery (pnpm art). Flat cel shading only: 2–4 tones
 * per form, no blur, no glow. Seeded, so the output is stable between runs.
 * Drawn as SVG, then rasterised to WebP in public/art/: big vector layers full of clip
 * paths are slow for the browser to re-rasterise while they move; bitmaps are not.
 */
import { mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import sharp from "sharp";

const OUT = join(process.cwd(), "public", "art");
mkdirSync(OUT, { recursive: true });

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (n) => Math.round(n * 10) / 10;
let uid = 0;
const nextId = (p) => `${p}${uid++}`;

const svg = (w, h, body, extra = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" ${extra}>${body}</svg>`;

/* ----------------------------------------------------------------------------
   Cumulus cloud: puffs along a flat base. Tones: deep underside, shade, light,
   highlight rim — each the same puffs shifted toward the light, clipped to the cloud.
   ---------------------------------------------------------------------------- */
function cumulus({ cx, base, width, height, seed, pal, towers = 0.5 }) {
  const rnd = mulberry32(seed);
  const puffs = [];
  const n = Math.max(4, Math.round(width / (height * 0.5)));
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const bell = Math.sin(Math.PI * (0.08 + 0.84 * t));
    const r = height * (0.2 + 0.36 * bell) * (0.82 + rnd() * 0.36);
    const x = cx - width / 2 + t * width + (rnd() - 0.5) * width * 0.05;
    const y = base - r * 0.5 - bell * height * 0.18 * rnd();
    puffs.push({ x, y, r });
  }
  const tower = Math.round(n * towers);
  for (let k = 0; k < tower; k++) {
    const p = puffs[1 + Math.floor(rnd() * (n - 2))];
    const r = p.r * (0.55 + rnd() * 0.25);
    puffs.push({ x: p.x + (rnd() - 0.5) * p.r * 0.8, y: p.y - p.r * (0.55 + rnd() * 0.35), r });
  }
  // Cauliflower edge: small lumps around the upper rim of every puff.
  const main = puffs.slice();
  for (const p of main) {
    const lumps = 2 + Math.floor(rnd() * 3);
    for (let k = 0; k < lumps; k++) {
      const a = -Math.PI * (0.12 + rnd() * 0.76);
      const r = p.r * (0.26 + rnd() * 0.2);
      const d = p.r - r * 0.55;
      puffs.push({ x: p.x + Math.cos(a) * d, y: p.y + Math.sin(a) * d, r });
    }
  }
  const top = Math.min(...puffs.map((p) => p.y - p.r));
  const clip = nextId("u");
  const cut = nextId("b");
  const circles = (dx, dy, k = 1) =>
    puffs
      .map((p) => `<circle cx="${f(p.x + dx * p.r)}" cy="${f(p.y + dy * p.r)}" r="${f(p.r * k)}"/>`)
      .join("");
  const left = cx - width / 2 - height;
  const span = width + height * 2;
  // Underside: one band with a gently waving top edge.
  const x0 = cx - width / 2 - height * 0.6;
  const x1 = cx + width / 2 + height * 0.6;
  const steps = 48;
  const phase = rnd() * 6;
  let under = `M${f(x0)} ${f(base + 4)}`;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = x0 + (x1 - x0) * t;
    const y =
      base -
      height * (0.1 + 0.035 * Math.sin(phase + t * 7) + 0.015 * Math.sin(phase * 2 + t * 17));
    under += `L${f(x)} ${f(y)}`;
  }
  under += `L${f(x1)} ${f(base + 4)}Z`;
  return `<g>
<clipPath id="${clip}">${circles(0, 0)}</clipPath>
<clipPath id="${cut}"><rect x="${f(left)}" y="${f(top - 10)}" width="${f(span)}" height="${f(base - top + 10)}"/></clipPath>
<g clip-path="url(#${cut})">
<g fill="${pal.shade}">${circles(0, 0)}</g>
<g clip-path="url(#${clip})">
<g fill="${pal.light}">${circles(-0.2, -0.3, 0.94)}</g>
<g fill="${pal.high}">${circles(-0.36, -0.5, 0.8)}</g>
<path d="${under}" fill="${pal.deep}"/>
</g></g></g>`;
}

/* Long, thin stratus streak (dusk): tapered lens, lit top, shaded belly. */
function stratus({ x, y, w, h, seed, pal }) {
  const rnd = mulberry32(seed);
  const clip = nextId("s");
  const n = 14;
  const top = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const env = Math.pow(Math.sin(Math.PI * t), 0.7);
    top.push({ x: x + t * w, y: y - h * env * (0.7 + rnd() * 0.6) });
  }
  const belly = [];
  for (let i = n; i >= 0; i--) {
    const t = i / n;
    const env = Math.pow(Math.sin(Math.PI * t), 1.2);
    belly.push({ x: x + t * w + 12, y: y + h * 0.45 * env });
  }
  const shape = polyPath([...top, ...belly]);
  const cutY = (t) => y - h * 0.15 + Math.sin(t * 9 + seed) * h * 0.12;
  const lit = polyPath([
    ...top.map((p) => ({ x: p.x - 4, y: p.y - 2 })),
    ...top
      .slice()
      .reverse()
      .map((p) => ({ x: p.x, y: cutY((p.x - x) / w) })),
  ]);
  return `<g><clipPath id="${clip}"><path d="${shape}"/></clipPath><path d="${shape}" fill="${pal.shade}"/><path d="${lit}" fill="${pal.light}" clip-path="url(#${clip})"/></g>`;
}

/* ----------------------------------------------------------------------------
   Ridges: midpoint displacement, then cel facets — each peak's sun-facing slope is
   lit down to a jagged crease running from the peak to the bottom.
   ---------------------------------------------------------------------------- */
function displace(points, depth, rough, rnd) {
  let pts = points;
  let amp = rough;
  for (let d = 0; d < depth; d++) {
    const next = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      next.push(a, { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 + (rnd() - 0.5) * amp });
    }
    next.push(pts[pts.length - 1]);
    pts = next;
    amp *= 0.52;
  }
  return pts;
}

/** Jagged line running down the mountain from `start`; `lean` = sideways drift per px down. */
function spur(start, bottom, lean, rnd, jitter = 10) {
  const out = [{ ...start }];
  let x = start.x;
  for (let y = start.y; y < bottom;) {
    const step = 14 + rnd() * 30;
    y = Math.min(bottom, y + step);
    x += lean * step + (rnd() - 0.5) * jitter;
    out.push({ x, y });
  }
  return out;
}

const peaksOf = (pts, minProm) => {
  const peaks = [];
  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i];
    if (!(p.y < pts[i - 1].y && p.y <= pts[i + 1].y)) continue;
    let l = i;
    while (l > 0 && pts[l - 1].y >= pts[l].y) l--;
    let r = i;
    while (r < pts.length - 1 && pts[r + 1].y >= pts[r].y) r++;
    if (Math.max(pts[l].y, pts[r].y) - p.y < minProm) continue;
    peaks.push({ i, l, r });
  }
  return peaks;
};

/**
 * Cel planes for light from the left: each peak's left slope is lit, bounded by a
 * valley line on the left and a diagonal crease from the summit on the right.
 * Gullies (shadow wedges) break up lit planes; rim strips catch light on dark planes.
 */
function facets(pts, bottom, rnd, { lean = 0.42, minProm = 12, gullies = 0.5 } = {}) {
  const lit = [];
  const cuts = [];
  const rims = [];
  for (const { i, l } of peaksOf(pts, minProm)) {
    const p = pts[i];
    const crease = spur(p, bottom, lean * (0.7 + rnd() * 0.6), rnd);
    const valley = spur(pts[l], bottom, -lean * (0.35 + rnd() * 0.3), rnd, 6);
    lit.push([...valley.slice().reverse(), ...pts.slice(l + 1, i + 1), ...crease.slice(1)]);
    // Gullies: thin shadow wedges falling from the lit slope.
    for (let k = l + 1; k < i; k++) {
      if (rnd() > gullies * 0.25) continue;
      const s = pts[k];
      const len = 40 + rnd() * (bottom - s.y) * 0.5;
      const line = spur(
        { x: s.x + 2, y: s.y + 4 },
        Math.min(bottom, s.y + len),
        lean * 0.9,
        rnd,
        5,
      );
      const wdt = 2 + rnd() * 5;
      cuts.push([
        ...line,
        ...line
          .slice()
          .reverse()
          .map((q, idx, arr) => ({ x: q.x + wdt * (1 - idx / arr.length), y: q.y })),
      ]);
    }
    // Rim light hugging the ridge just past the summit, on the dark side.
    const rimPts = [];
    for (let k = i; k < Math.min(pts.length, i + 12); k++) rimPts.push(pts[k]);
    if (rimPts.length > 2) {
      const thick = 3 + rnd() * 4;
      rims.push([
        ...rimPts,
        ...rimPts
          .slice()
          .reverse()
          .map((q, idx, arr) => ({ x: q.x - 1, y: q.y + thick * (idx / arr.length) })),
      ]);
    }
  }
  return { lit, cuts, rims };
}

const polyPath = (pts) => "M" + pts.map((p) => `${f(p.x)} ${f(p.y)}`).join("L") + "Z";
const paths = (polys) => polys.map((poly) => `<path d="${polyPath(poly)}"/>`).join("");

function ridge({
  w,
  bottom,
  keys,
  depth = 6,
  rough,
  seed,
  fill,
  lit,
  cut,
  rim,
  lean,
  minProm,
  gullies,
}) {
  const rnd = mulberry32(seed);
  const pts = displace(keys, depth, rough, rnd);
  const shape = polyPath([...pts, { x: w + 40, y: bottom }, { x: -40, y: bottom }]);
  const faces = facets(pts, bottom, rnd, { lean, minProm, gullies });
  const clip = nextId("r");
  return {
    pts,
    faces,
    markup: `<g><clipPath id="${clip}"><path d="${shape}"/></clipPath><path d="${shape}" fill="${fill}"/><g clip-path="url(#${clip})"><g fill="${lit}">${paths(faces.lit)}</g><g fill="${cut ?? fill}">${paths(faces.cuts)}</g><g fill="${rim ?? lit}">${paths(faces.rims)}</g></g></g>`,
  };
}

/** Snow cap: ridge points near the top, ragged lower edge with drips down the gullies. */
function snowCap(pts, depth, rnd, { left = 260, right = 330 } = {}) {
  const top = pts.reduce((a, b) => (b.y < a.y ? b : a));
  const cap = pts.filter((p) => p.y < top.y + depth && p.x > top.x - left && p.x < top.x + right);
  const a = cap[0];
  const b = cap[cap.length - 1];
  const ridgeAt = (x) => {
    for (let i = 0; i < cap.length - 1; i++) {
      if (x >= cap[i].x && x <= cap[i + 1].x) {
        const t = (x - cap[i].x) / (cap[i + 1].x - cap[i].x || 1);
        return cap[i].y + (cap[i + 1].y - cap[i].y) * t;
      }
    }
    return Math.max(a.y, b.y);
  };
  const edge = [];
  const n = 26;
  for (let k = 0; k <= n; k++) {
    const t = 1 - k / n;
    const x = a.x + (b.x - a.x) * t;
    const below = ridgeAt(x);
    let y = below + depth * (0.3 + rnd() * 0.35);
    if (rnd() < 0.25) y += depth * (0.15 + rnd() * 0.4);
    if (k === 0 || k === n) y = below;
    edge.push({ x, y });
  }
  return { top, poly: [...cap, ...edge] };
}

/* ---------------------------------------------------------------------------- */
const sparkle = (x, y, r) =>
  `<path d="M${f(x)} ${f(y - r)}Q${f(x)} ${f(y)} ${f(x + r)} ${f(y)}Q${f(x)} ${f(y)} ${f(x)} ${f(y + r)}Q${f(x)} ${f(y)} ${f(x - r)} ${f(y)}Q${f(x)} ${f(y)} ${f(x)} ${f(y - r)}Z"/>`;

function stars({ w, h, count, seed, color = "#EEF1F8", sparkles = 10 }) {
  const rnd = mulberry32(seed);
  let dots = "";
  for (let i = 0; i < count; i++) {
    const x = rnd() * w;
    const y = Math.pow(rnd(), 1.6) * h;
    const r = rnd() < 0.08 ? 1.6 + rnd() : 0.5 + rnd() * 0.9;
    const o = (0.35 + rnd() * 0.65).toFixed(2);
    dots += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill-opacity="${o}"/>`;
  }
  let glints = "";
  for (let i = 0; i < sparkles; i++) {
    glints += sparkle(rnd() * w, Math.pow(rnd(), 1.4) * h * 0.8, 4 + rnd() * 6);
  }
  return `<g fill="${color}">${dots}${glints}</g>`;
}

function birds({ x, y, n, seed, color }) {
  const rnd = mulberry32(seed);
  let out = "";
  for (let i = 0; i < n; i++) {
    const bx = x + rnd() * 160;
    const by = y + rnd() * 70;
    const s = 5 + rnd() * 5;
    out += `<path d="M${f(bx - s)} ${f(by - s * 0.3)}Q${f(bx - s * 0.4)} ${f(by - s * 0.55)} ${f(bx)} ${f(by + s * 0.15)}Q${f(bx + s * 0.4)} ${f(by - s * 0.55)} ${f(bx + s)} ${f(by - s * 0.3)}"/>`;
  }
  return `<g fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round">${out}</g>`;
}

/* Utility pole with cross-arms; wires sag off to the left edge. */
function pole({ x, top, bottom, color, wireTo }) {
  const arms = [top + 40, top + 92];
  let out = `<rect x="${x - 7}" y="${top}" width="14" height="${bottom - top}"/>`;
  out += `<rect x="${x - 70}" y="${arms[0]}" width="140" height="9"/>`;
  out += `<rect x="${x - 52}" y="${arms[1]}" width="104" height="8"/>`;
  out += `<path d="M${x - 70} ${arms[0] + 9}L${x - 30} ${arms[0] + 40}L${x - 24} ${arms[0] + 40}L${x - 60} ${arms[0] + 9}Z"/>`;
  out += `<path d="M${x + 70} ${arms[0] + 9}L${x + 30} ${arms[0] + 40}L${x + 24} ${arms[0] + 40}L${x + 60} ${arms[0] + 9}Z"/>`;
  const insulators = [x - 62, x - 26, x + 26, x + 62];
  for (const ix of insulators)
    out += `<rect x="${ix - 4}" y="${arms[0] - 16}" width="8" height="16" rx="2"/>`;
  out += `<rect x="${x - 40}" y="${arms[1] + 8}" width="34" height="22" rx="3"/>`;
  let wires = "";
  insulators.forEach((ix, i) => {
    const y0 = arms[0] - 14;
    const ty = wireTo.y + i * 26;
    wires += `<path d="M${ix} ${y0}Q${f((ix + wireTo.x) / 2)} ${f(Math.max(y0, ty) + 120 + i * 14)} ${wireTo.x} ${ty}"/>`;
  });
  [x - 46, x + 46].forEach((ix, i) => {
    const y0 = arms[1] + 2;
    const ty = wireTo.y + 120 + i * 30;
    wires += `<path d="M${ix} ${y0}Q${f((ix + wireTo.x) / 2)} ${f(Math.max(y0, ty) + 100)} ${wireTo.x} ${ty}"/>`;
  });
  return `<g fill="${color}">${out}</g><g fill="none" stroke="${color}" stroke-width="2.4">${wires}</g>`;
}

/* ============================================================================
   NIGHT (hero, contact)
   ============================================================================ */
{
  const W = 1600;
  const H = 1000;
  // Sky and stars in one opaque layer (one bitmap instead of a gradient + a transparent layer).
  writeFileSync(
    join(OUT, "night-sky.svg"),
    svg(
      W,
      H,
      `<defs><linearGradient id="night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#060A20"/><stop offset="0.52" stop-color="#0B1233"/><stop offset="1" stop-color="#1A2462"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#night)"/>` +
        stars({ w: W, h: H, count: 260, seed: 7, sparkles: 14 }),
    ),
  );

  // Ridges are 2400 wide (≈5.7:1) so, scaled to the screen width, they stay low on wide screens.
  const RW = 2400;
  const far = ridge({
    w: RW,
    bottom: 640,
    keys: [
      { x: -40, y: 250 },
      { x: 300, y: 150 },
      { x: 620, y: 230 },
      { x: 980, y: 120 },
      { x: 1300, y: 210 },
      { x: 1640, y: 160 },
      { x: 1980, y: 240 },
      { x: 2200, y: 150 },
      { x: 2440, y: 210 },
    ],
    rough: 90,
    seed: 11,
    fill: "#131B4E",
    lit: "#1F2C70",
    cut: "#18225C",
    rim: "#2B3A86",
  });
  writeFileSync(
    join(OUT, "night-ridge-far.svg"),
    svg(RW, 640, far.markup, 'preserveAspectRatio="xMidYMax slice"'),
  );

  const near = ridge({
    w: RW,
    bottom: 420,
    keys: [
      { x: -40, y: 210 },
      { x: 260, y: 290 },
      { x: 520, y: 200 },
      { x: 860, y: 300 },
      { x: 1180, y: 230 },
      { x: 1640, y: 320 },
      { x: 1960, y: 220 },
      { x: 2440, y: 300 },
    ],
    rough: 70,
    seed: 23,
    fill: "#090F36",
    lit: "#131D57",
    cut: "#0E1645",
    rim: "#1C2A6C",
  });
  writeFileSync(
    join(OUT, "night-ridge-near.svg"),
    svg(RW, 420, near.markup, 'preserveAspectRatio="xMidYMax slice"'),
  );

  // Contact: one summit rising from the lower right, flag on top.
  const summit = ridge({
    w: W,
    bottom: 1000,
    keys: [
      { x: 560, y: 1010 },
      { x: 880, y: 760 },
      { x: 1180, y: 380 },
      { x: 1340, y: 520 },
      { x: 1640, y: 640 },
    ],
    depth: 6,
    rough: 60,
    seed: 41,
    fill: "#0B1243",
    lit: "#1E2C7A",
    cut: "#132060",
    rim: "#3446A0",
    minProm: 30,
    gullies: 1.4,
  });
  const snow = snowCap(summit.pts, 150, mulberry32(43), { left: 240, right: 200 });
  const { top } = snow;
  const fx = top.x;
  const fy = top.y;
  const flag = `<g><rect x="${f(fx - 2)}" y="${f(fy - 120)}" width="5" height="122" fill="#C9D3F2"/>
<path d="M${f(fx + 3)} ${f(fy - 118)}L${f(fx + 96)} ${f(fy - 100)}L${f(fx + 70)} ${f(fy - 84)}L${f(fx + 98)} ${f(fy - 66)}L${f(fx + 3)} ${f(fy - 74)}Z" fill="#F3A86B"/>
<path d="M${f(fx + 3)} ${f(fy - 96)}L${f(fx + 84)} ${f(fy - 86)}L${f(fx + 70)} ${f(fy - 84)}L${f(fx + 98)} ${f(fy - 66)}L${f(fx + 3)} ${f(fy - 74)}Z" fill="#C9744A"/></g>`;
  const snowClip = nextId("sc");
  const snowMarkup = `<clipPath id="${snowClip}"><path d="${polyPath(snow.poly)}"/></clipPath><g clip-path="url(#${snowClip})"><path d="${polyPath(snow.poly)}" fill="#5B69AC"/><g fill="#C9D3F2">${paths(summit.faces.lit)}</g><g fill="#8C9AD2">${paths(summit.faces.cuts)}</g></g>`;
  writeFileSync(
    join(OUT, "night-summit.svg"),
    svg(W, 1000, summit.markup + snowMarkup + flag, 'preserveAspectRatio="xMaxYMax slice"'),
  );
}

/* ============================================================================
   DAWN (manifesto stage)
   ============================================================================ */
{
  const W = 1600;
  const H = 1000;
  const back = { high: "#F3EEF0", light: "#DCE2F2", shade: "#A9B6DA", deep: "#8E9DCC" };
  const mid = { high: "#FFFFFF", light: "#EDF1FA", shade: "#B9C6E6", deep: "#8798C8" };
  const front = { high: "#FFFFFF", light: "#F1F4FB", shade: "#B3C1E3", deep: "#7889BD" };

  const backClouds = [
    cumulus({ cx: 260, base: 560, width: 380, height: 120, seed: 3, pal: back }),
    cumulus({ cx: 900, base: 600, width: 520, height: 150, seed: 5, pal: back }),
    cumulus({ cx: 1430, base: 520, width: 340, height: 110, seed: 8, pal: back }),
  ].join("");
  writeFileSync(
    join(OUT, "dawn-clouds-mid.svg"),
    svg(
      W,
      H,
      [
        cumulus({ cx: 120, base: 760, width: 560, height: 230, seed: 12, pal: mid, towers: 0.7 }),
        cumulus({ cx: 1260, base: 720, width: 640, height: 260, seed: 15, pal: mid, towers: 0.8 }),
      ].join(""),
    ),
  );
  writeFileSync(
    join(OUT, "dawn-clouds-front.svg"),
    svg(
      W,
      H,
      [
        cumulus({
          cx: 260,
          base: 1050,
          width: 820,
          height: 250,
          seed: 21,
          pal: front,
          towers: 0.6,
        }),
        cumulus({
          cx: 1380,
          base: 1070,
          width: 760,
          height: 240,
          seed: 27,
          pal: front,
          towers: 0.6,
        }),
      ].join(""),
    ),
  );

  const hills = ridge({
    w: W,
    bottom: 300,
    keys: [
      { x: -40, y: 170 },
      { x: 420, y: 110 },
      { x: 760, y: 190 },
      { x: 1120, y: 90 },
      { x: 1640, y: 180 },
    ],
    rough: 50,
    seed: 31,
    fill: "#6A82BE",
    lit: "#8EA4D6",
    cut: "#7A91C8",
    rim: "#9DB1DE",
  });
  // Sky, far clouds and hills never move much: one opaque layer.
  const dawnStops = [
    [0, "#1E2F66"],
    [0.18, "#2C4A92"],
    [0.38, "#5679BF"],
    [0.58, "#8FB0DE"],
    [0.74, "#C9D6EA"],
    [0.88, "#EFD8C4"],
    [1, "#F6D9BC"],
  ]
    .map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`)
    .join("");
  writeFileSync(
    join(OUT, "dawn-sky.svg"),
    svg(
      W,
      H,
      `<defs><linearGradient id="dawn" x1="0" y1="0" x2="0" y2="1">${dawnStops}</linearGradient></defs><rect width="${W}" height="${H}" fill="url(#dawn)"/>` +
        backClouds +
        `<g transform="translate(0 ${H - 300})">${hills.markup}</g>`,
    ),
  );

  writeFileSync(
    join(OUT, "dawn-pole.svg"),
    svg(
      W,
      H,
      pole({ x: 1440, top: 120, bottom: 1000, color: "#17255A", wireTo: { x: -20, y: 250 } }) +
        birds({ x: 420, y: 190, n: 5, seed: 2, color: "#2A3B78" }),
      'preserveAspectRatio="xMaxYMid slice"',
    ),
  );
}

/* ============================================================================
   DUSK (the brand poster in "What we do")
   ============================================================================ */
{
  const W = 1600;
  const H = 1000;
  const sun = `<circle cx="430" cy="600" r="96" fill="#F7D2A2"/><circle cx="430" cy="600" r="74" fill="#FBE4C0"/>`;
  const streaks = [
    stratus({ x: 80, y: 250, w: 520, h: 16, seed: 2, pal: { light: "#F0A57E", shade: "#A44F66" } }),
    stratus({
      x: 760,
      y: 170,
      w: 640,
      h: 20,
      seed: 4,
      pal: { light: "#E8957A", shade: "#8C3F62" },
    }),
    stratus({
      x: 980,
      y: 420,
      w: 480,
      h: 14,
      seed: 6,
      pal: { light: "#F4B585", shade: "#B05A63" },
    }),
    stratus({
      x: 160,
      y: 470,
      w: 360,
      h: 11,
      seed: 9,
      pal: { light: "#F6BF8E", shade: "#B9636A" },
    }),
  ].join("");
  writeFileSync(
    join(OUT, "dusk-sky.svg"),
    svg(W, H, sun + streaks, 'preserveAspectRatio="xMidYMid slice"'),
  );

  const farA = ridge({
    w: W,
    bottom: H,
    keys: [
      { x: -40, y: 640 },
      { x: 260, y: 560 },
      { x: 560, y: 640 },
      { x: 820, y: 520 },
      { x: 1200, y: 600 },
      { x: 1640, y: 540 },
    ],
    rough: 60,
    seed: 51,
    fill: "#8A4467",
    lit: "#A9566D",
    cut: "#974B69",
    rim: "#B66470",
  });
  const farB = ridge({
    w: W,
    bottom: H,
    keys: [
      { x: -40, y: 720 },
      { x: 300, y: 660 },
      { x: 700, y: 740 },
      { x: 1000, y: 680 },
      { x: 1640, y: 720 },
    ],
    rough: 50,
    seed: 57,
    fill: "#5E2F5E",
    lit: "#7A3B66",
    cut: "#6A3562",
    rim: "#8A456A",
  });
  writeFileSync(
    join(OUT, "dusk-far.svg"),
    svg(W, H, farA.markup + farB.markup, 'preserveAspectRatio="xMidYMax slice"'),
  );

  // The climb: one big peak, lit from the setting sun on the left.
  const rnd = mulberry32(77);
  const keys = [
    { x: -40, y: 900 },
    { x: 240, y: 820 },
    { x: 520, y: 640 },
    { x: 800, y: 430 },
    { x: 1080, y: 210 },
    { x: 1220, y: 330 },
    { x: 1330, y: 290 },
    { x: 1480, y: 470 },
    { x: 1640, y: 560 },
  ];
  const pts = displace(keys, 6, 46, rnd);
  const shape = polyPath([...pts, { x: W + 40, y: H }, { x: -40, y: H }]);
  const faces = facets(pts, H, rnd, { lean: 0.36, minProm: 18, gullies: 1.1 });
  const clip = nextId("m");
  const cap = snowCap(pts, 150, mulberry32(79), { left: 320, right: 330 });
  const capPath = polyPath(cap.poly);
  const capClip = nextId("c");
  const mountain = `<clipPath id="${clip}"><path d="${shape}"/></clipPath>
<path d="${shape}" fill="#2C1C44"/>
<g clip-path="url(#${clip})"><g fill="#A04E61">${paths(faces.lit)}</g><g fill="#7A3A5A">${paths(faces.cuts)}</g><g fill="#5B3460">${paths(faces.rims)}</g>
<clipPath id="${capClip}"><path d="${capPath}"/></clipPath>
<g clip-path="url(#${capClip})"><path d="${capPath}" fill="#76578C"/><g fill="#F6CDA3">${paths(faces.lit)}</g><g fill="#D99A86">${paths(faces.cuts)}</g></g></g>`;
  writeFileSync(join(OUT, "dusk-mountain.svg"), svg(W, H, mountain));
}

/* ============================================================================
   Speed streaks (dawn stage, "fast")
   ============================================================================ */
{
  const W = 1600;
  const H = 1000;
  // Horizontal streaks (dawn stage, "fast").
  const rnd2 = mulberry32(5);
  let streaks = "";
  for (let i = 0; i < 46; i++) {
    const y = rnd2() * H;
    const len = 160 + rnd2() * 520;
    const x = rnd2() * (W - len);
    const t = 1 + rnd2() * 3;
    streaks += `<path d="M${f(x)} ${f(y)}L${f(x + len)} ${f(y - t / 2)}L${f(x + len)} ${f(y + t / 2)}Z"/>`;
  }
  writeFileSync(
    join(OUT, "streaks.svg"),
    svg(W, H, `<g fill="#FFFFFF">${streaks}</g>`, 'preserveAspectRatio="none"'),
  );
}

// Rasterise every layer (wide enough for 2x screens), keep only the WebP.
for (const file of readdirSync(OUT).filter((f) => f.endsWith(".svg"))) {
  const path = join(OUT, file);
  const text = readFileSync(path, "utf8");
  const viewWidth = Number(/viewBox="0 0 ([\d.]+)/.exec(text)?.[1] ?? 1600);
  const target = file.startsWith("night-ridge") ? 2880 : 2560;
  const image = sharp(Buffer.from(text), { density: (72 * target) / viewWidth });
  // Full-bleed skies are opaque: drop the alpha channel so browsers know it.
  if (file.endsWith("-sky.svg") && !file.startsWith("dusk")) image.removeAlpha();
  await image
    .webp({ quality: 84, alphaQuality: 90, effort: 5 })
    .toFile(path.replace(/\.svg$/, ".webp"));
  unlinkSync(path);
}

console.log("art written to public/art/ (WebP)");
