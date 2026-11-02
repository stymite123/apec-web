/**
 * Turns the single-file build Codex produces (APEC-Preview/index.html) into the page
 * we actually serve (public/home.html + public/a/*).
 *
 * The source file is one 18.5 MB document: fonts, portraits, portrait videos and CV
 * PDFs are base64 data: URIs inside it and the JavaScript is unminified and inline.
 * Nothing in it can be cached, the whole thing is re-sent on every visit, and the
 * browser has to read all of it off the document before the page can do anything.
 * Measured on a Pixel 7 at 4x CPU: 12.5 MB transferred, first contentful paint at
 * 4.7 s, interactive at 27.5 s.
 *
 * This script, in order:
 *   1. writes every data: URI out to public/a/<hash>.<ext> and rewrites the reference
 *   2. re-encodes the PNGs as WebP (they are photographs with alpha, not line art)
 *   3. applies the source fixes listed under PATCHES below
 *   4. minifies the two scripts out to public/a/s<n>-<hash>.js, loaded with defer
 *
 * Result: a 46 KB document, interactive in well under a second, with every asset
 * content-addressed and served immutable (see the headers() block in next.config.ts).
 *
 * Usage: pnpm optimize:home [path/to/index.html]
 *
 * Every patch asserts its anchor appears exactly the expected number of times, so if
 * a later Codex build moves the code this fails loudly instead of silently shipping
 * an unpatched page.
 */
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const sharp = require("sharp");
const { minify } = require("next/dist/compiled/terser");

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(process.argv[2] ?? join(root, "..", "APEC-Preview", "index.html"));
const target = join(root, "public", "home.html");
const assetDir = join(root, "public", "a");

/** latin1 in and out, so the UTF-8 bytes round-trip untouched (base64 is ASCII). */
let html = readFileSync(source, "latin1");
const startedAt = html.length;
console.log(`source: ${source}\n  ${(startedAt / 1048576).toFixed(2)} MB\n`);

/* ------------------------------------------------------------------ 1. assets */

const EXT = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "video/mp4": "mp4",
  "application/pdf": "pdf",
  "font/woff2": "woff2",
};

rmSync(assetDir, { recursive: true, force: true });
mkdirSync(assetDir, { recursive: true });

const written = new Set();
let inlineBytes = 0;
html = html.replace(/data:([a-z0-9/+.-]+);base64,([A-Za-z0-9+/=]{200,})/g, (whole, mime, b64) => {
  const ext = EXT[mime];
  if (!ext) {
    console.warn(`  ! left inline, unknown type: ${mime}`);
    return whole;
  }
  const bytes = Buffer.from(b64, "base64");
  const name = `${createHash("sha1").update(bytes).digest("hex").slice(0, 10)}.${ext}`;
  if (!written.has(name)) {
    writeFileSync(join(assetDir, name), bytes);
    written.add(name);
    inlineBytes += bytes.length;
  }
  return `/a/${name}`;
});
console.log(`1. extracted ${written.size} assets, ${(inlineBytes / 1048576).toFixed(2)} MB`);

/* -------------------------------------------------------------------- 2. webp */

let pngSaved = 0;
for (const file of readdirSync(assetDir).filter((f) => f.endsWith(".png"))) {
  const input = readFileSync(join(assetDir, file));
  const out = await sharp(input).webp({ quality: 82, alphaQuality: 90, effort: 6 }).toBuffer();
  if (out.length >= input.length) continue;
  const name = `${createHash("sha1").update(out).digest("hex").slice(0, 10)}.webp`;
  writeFileSync(join(assetDir, name), out);
  html = html.split(`/a/${file}`).join(`/a/${name}`);
  unlinkSync(join(assetDir, file));
  pngSaved += input.length - out.length;
}
console.log(`2. png -> webp, saved ${(pngSaved / 1048576).toFixed(2)} MB`);

/* ----------------------------------------------------------------- 3. patches */

const applied = [];
function sub(label, find, replace, expected = 1) {
  const parts = html.split(find);
  if (parts.length - 1 !== expected)
    throw new Error(`patch "${label}": expected ${expected} match(es), found ${parts.length - 1}`);
  html = parts.join(replace);
  applied.push(label);
}

const logo = html.match(/"logo":"([^"]+)"/)[1];
const MDASH = "â\u0080\u0094"; // an em dash, as its UTF-8 bytes read through latin1

// The document described itself to nobody: no description, canonical, share image
// or icon. The logo is needed for the first frame but is only discoverable after
// the bundle has run, so it is preloaded.
sub(
  "head: description, canonical, share image, icon, logo preload",
  `</title>`,
  `</title>` +
    `<meta name="description" content="APEC Digital is a five-person studio: search, AI agents, websites, mobile apps and brand design, each led by the person who actually does the work.">` +
    `<link rel="canonical" href="https://apecdigital.tech/">` +
    `<link rel="icon" href="${logo}" type="image/webp">` +
    `<link rel="apple-touch-icon" href="${logo}">` +
    `<meta property="og:type" content="website">` +
    `<meta property="og:url" content="https://apecdigital.tech/">` +
    `<meta property="og:site_name" content="APEC Digital">` +
    `<meta property="og:title" content="APEC Digital ${MDASH} Innovate | Grow | Succeed">` +
    `<meta property="og:description" content="Five specialists, one standard. Search, AI agents, websites, mobile apps and brand design.">` +
    `<meta property="og:image" content="https://apecdigital.tech${logo}">` +
    `<meta name="twitter:card" content="summary_large_image">` +
    `<link rel="preload" as="image" href="${logo}" fetchpriority="high">`,
);

// Every heading and paragraph was built by script, so until the bundle had run the
// page showed empty boxes, and a crawler saw nothing at all. populatePage() replaces
// both of these with identical markup, so this only changes what the first frame and
// a non-JS reader get.
sub(
  "hero: headline in the markup",
  `<h1 id="hero-title"></h1>`,
  `<h1 id="hero-title"><span>Agency for</span><span>Professionals,</span><span>Experienced</span><span>&amp; <em>Creatives</em></span></h1>`,
);
sub(
  "hero: description in the markup",
  `<p class="hero-description"></p>`,
  `<p class="hero-description">Five specialists, one standard. Search, AI agents, websites, mobile apps and brand design, each led by the person who actually does the work.</p>`,
);

// decoding="sync" holds the main thread for each portrait decode, and the team sits
// far below the fold, so neither the decode nor the fetch belongs on the first screen.
sub("portraits: decode off the main thread", `decoding="sync"`, `decoding="async"`);
sub("portraits: fetch when approached", `loading="eager"`, `loading="lazy"`);

// Without intrinsic dimensions the logo reflows the masthead once it arrives.
sub("logo: intrinsic size", `<img data-logo alt="">`, `<img data-logo alt="" width="1600" height="1600">`);
sub(
  "poster: intrinsic size",
  `<img data-logo alt="APEC logo">`,
  `<img data-logo alt="APEC logo" width="1600" height="1600">`,
);

// A second tap, which a touch screen produces easily, rebuilt the whole profile and
// restarted its video underneath the one already open.
sub(
  "portfolio: ignore a repeat tap while open",
  `const m=members[index];if(!m)return;`,
  `const m=members[index];if(!m)return;if(dialog.open&&!switching)return;`,
);

// Pausing the portrait video lasted until the dialog closed: every reopen, and every
// later visit, started it again.
// The stored choice wins where there is one; reduced motion is only the default. The
// two must not be OR-ed together: that way a reduced-motion visitor who presses "play
// portrait motion" is put back to paused every time the dialog reopens, which is the
// preference-wiping this was meant to fix.
sub(
  "portfolio: remember the motion choice",
  `function setHash(hash){`,
  `const MOTION_KEY='apec:portrait-motion';\n` +
    `const motionChoice=()=>{try{const v=localStorage.getItem(MOTION_KEY);return v===null?null:v==='paused';}catch{return null;}};\n` +
    `const saveMotion=v=>{try{localStorage.setItem(MOTION_KEY,v?'paused':'playing');}catch{}};\n` +
    `function setHash(hash){`,
);
sub("portfolio: apply it on open", `releaseMedia();paused=reduced;`, `releaseMedia();paused=motionChoice()??reduced;`);
sub(
  "portfolio: label it correctly",
  `id="motion-toggle">\${reduced?'Play portrait motion':'Pause portrait motion'}`,
  `id="motion-toggle">\${paused?'Play portrait motion':'Pause portrait motion'}`,
);
sub(
  "portfolio: store it on toggle",
  `$('#motion-toggle').addEventListener('click',()=>{paused=!paused;`,
  `$('#motion-toggle').addEventListener('click',()=>{paused=!paused;saveMotion(paused);`,
);
// `paused` already carries the reduced-motion default, so this is the single question
// of whether the visitor wants the portrait to move — including a reduced-motion
// visitor who has asked for it, whose video would otherwise never load.
sub(
  "portfolio: do not autoplay against it",
  `if(!reduced){videoURL=blobURL(assets.motion[m.slug]);`,
  `if(!paused){videoURL=blobURL(assets.motion[m.slug]);`,
);

// Building the logo scene compiles its shaders, which blocks the main thread for
// about 2.4 s on a throttled phone. Everything downstream already copes with a null
// scene (the star falls back to a fixed origin, resize and update are optional
// calls), so it is built after the first painted frame instead of before it: the
// page is readable and scrollable while the GPU works.
sub(
  "logo: build the scene after the first frame",
  `try{logoScene=createLogoScene($('#scene'));}catch(error){webgl=false;$('.poster').style.display='block';console.warn('WebGL unavailable; using supplied logo poster.',error);}`,
  `function startLogoScene(){\n` +
    ` try{logoScene=createLogoScene($('#scene'));logoScene.resize(W,H);}\n` +
    ` catch(error){webgl=false;$('.poster').style.display='block';console.warn('WebGL unavailable; using supplied logo poster.',error);}\n` +
    ` lastPaint=-1;wake();\n` +
    `}\n` +
    `requestAnimationFrame(()=>requestAnimationFrame(startLogoScene));`,
);

// Reduced motion is left exactly as the build has it, on purpose. It pins the
// journey's progress at 0 and the stylesheet collapses `.journey` to one viewport and
// hides the nav island, so the page becomes a static hero followed by the ordinary
// sections. Driving progress from the scroll position instead was tried and is worse:
// with the journey collapsed, `range` is 1, so progress flips from 0 to 1 on the first
// pixel of scroll and the hero disappears at once. The cost of the current behaviour is
// that these visitors get no nav links; every section is still reachable by scrolling
// and the skip link goes straight to the team, so that is a design call, not a bug.

sub(
  "styles: legibility, tap targets, touch feedback",
  `</style>`,
  `</style><style>
/* ==========================================================================
   Appended after the build's own sheet, so equal-specificity rules win.
   ======================================================================== */

/* Controls measured 24-41 px tall. 44 px is the floor at which a thumb lands
   reliably; where the box cannot grow without moving the design (the wordmark,
   the underlined "led by" links) the hit area is extended behind it instead. */
.service-lead{margin-top:4px;padding-top:16px;min-height:44px;box-sizing:border-box}
#replay{min-height:44px;padding:0 16px}
.play{min-height:44px}
.discipline-chip{padding:15px 18px}
.wordmark,.portfolio-bar>button{position:relative}
.wordmark::after,.portfolio-bar>button::after{
 content:"";position:absolute;left:0;right:0;top:50%;translate:0 -50%;height:44px;min-height:100%}

/* No 300 ms tap delay, no grey flash, no double-tap zoom on a control. */
a,button,[role=button]{touch-action:manipulation;-webkit-tap-highlight-color:transparent}

/* The lit/tilt treatment is (hover:hover) and (pointer:fine) only, so until now a
   tap on a touch screen produced no feedback at all. */
@media(hover:none){
 .member:active .portrait{transform:scale(.975);border-color:var(--member-accent)}
 .button:active,.discipline-chip:active,.service-lead:active,
 .work-card:active,#replay:active,.contact-ticket>a:active{transform:scale(.975)}
}
@media(prefers-reduced-motion:reduce){
 .member:active .portrait,.button:active,.discipline-chip:active,
 .service-lead:active,.work-card:active,#replay:active{transform:none}
}

/* Type floors. Tracked uppercase labels stop being readable under about 11 px and
   body copy under about 15 px on a phone; the display sizes are left alone. */
.eyebrow{font-size:11px}
.location,.hero-location{font-size:12px}
.scroll-cue,.manifesto-caption,.portrait-number{font-size:11px}
.process-step small,.contact-ticket small,.fact small{font-size:12px}
.work-card small{font-size:11px}

@media(max-width:760px){
 .intro .eyebrow,.eyebrow{font-size:11px}
 .hero-description{font-size:15px;max-width:34ch}
 .hero-location{font-size:12px}
 .hero-actions .button,.button{font-size:14px}
 .hero-actions .button{padding:15px 20px}
 .scroll-cue,.manifesto-caption{font-size:11px}
 .play{font-size:12px}
 .nav,.nav span{font-size:13px}
 .discipline-chip{font-size:12px;padding:14px 17px}
 .member p,.service-description,.process-step p,.contact-ticket>a{font-size:15px}
 .portfolio-invitation,.team-end>p:last-child,.service-lead{font-size:14px}
 .service-index,.portrait-number{font-size:11px}
 footer,.portfolio-bar>button,.profile-switch{font-size:12px}
 .cv-card p,.profile-copy .profile-intro{font-size:15px}
 small,.process-step small,.contact-ticket small,.fact small,.work-card small{font-size:12px}
}
</style>`,
);

console.log(`3. applied ${applied.length} patches`);
for (const label of applied) console.log(`     ${label}`);

/* ------------------------------------------------------------------ 4. scripts */

const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
if (scripts.length !== 2) throw new Error(`expected 2 inline scripts, found ${scripts.length}`);

const tags = [];
let jsBefore = 0;
let jsAfter = 0;
for (const [i, s] of scripts.entries()) {
  jsBefore += s[2].length;
  const { code } = await minify(s[2], {
    ecma: 2020,
    compress: { passes: 2 },
    mangle: true,
    format: { comments: /@license|MIT License|Copyright/ },
  });
  jsAfter += code.length;
  const name = `s${i}-${createHash("sha1").update(code).digest("hex").slice(0, 10)}.js`;
  writeFileSync(join(assetDir, name), code, "latin1");
  tags.push(`<script src="/a/${name}" defer></script>`);
}
let replaced = 0;
html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, () => tags[replaced++]);
if (replaced !== 2) throw new Error(`replaced ${replaced} script tags, expected 2`);
console.log(
  `4. js ${(jsBefore / 1048576).toFixed(2)} MB -> ${(jsAfter / 1048576).toFixed(2)} MB, deferred and hashed`,
);

writeFileSync(target, html, "latin1");
console.log(
  `\ndocument ${(startedAt / 1048576).toFixed(2)} MB -> ${(html.length / 1024).toFixed(0)} KB` +
    `  (${target})`,
);
