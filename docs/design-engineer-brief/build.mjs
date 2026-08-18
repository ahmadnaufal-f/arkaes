// Renders document.html into a four-page A4 PDF with Chromium.
//
// The document is a portfolio artifact, not part of any site build — it lives
// here rather than in apps/ because nothing deploys it. It does reuse the real
// design system though: the token values in document.html are the ones from
// packages/tokens/tokens/*.json, and three of its four diagrams are the SVGs
// the about page already ships.
//
// Three phases, each skipped when its output is already present:
//   1. fonts   Google Fonts woff2 files, inlined as base64 (needs network once)
//   2. assets  derived images — the screenshot crop, the grain tile, the QR codes
//   3. render  substitute everything into document.html, print to PDF
//
// Run:  node docs/design-engineer-brief/build.mjs [--proof] [--force]
//   --proof  also writes out/proof-{1..4}.png for reviewing layout
//   --force  redo every phase instead of reusing cached output
//
// Outputs (git-ignored except the PDF — see .gitignore):
//   ahmad-naufal-design-engineer.pdf  the deliverable, committed
//   fonts/, assets/*.png, assets/qr-*.svg, out/  regenerated on demand
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { Buffer } from "node:buffer";
import console from "node:console";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import QRCode from "qrcode";
import sharp from "sharp";

// Reached through globalThis so the repo's ESLint config, which declares no
// environment globals, does not read these as undefined.
const { fetch } = globalThis;

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "../..");
const at = (...parts) => path.join(HERE, ...parts);

const FORCE = process.argv.includes("--force");
const PROOF = process.argv.includes("--proof");

const stale = (file) => FORCE || !existsSync(file);

for (const dir of ["fonts", "assets", "out"]) {
  mkdirSync(at(dir), { recursive: true });
}

// ── 1 · Fonts ─────────────────────────────────────────────────────────────
// Inlined rather than linked so the PDF renders identically anywhere and the
// build stays offline after the first run. Weights mirror what the document
// uses: Fraunces 300 (roman + italic), Plus Jakarta Sans 300-600, DM Mono 300/400.
const FONT_CSS = at("fonts", "fonts.inline.css");
const GOOGLE_FONTS_URL = "https://fonts.googleapis.com/css2"
  + "?family=Fraunces:ital,opsz,wght@0,9..144,300;1,9..144,300"
  + "&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400"
  + "&family=DM+Mono:wght@300;400&display=swap";

if (stale(FONT_CSS)) {
  // Google Fonts serves woff2 only to browser user agents; anything else gets
  // the much larger ttf stylesheet.
  const chromeUa = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    + "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
  const res = await fetch(GOOGLE_FONTS_URL, { headers: { "User-Agent": chromeUa } });
  if (!res.ok) throw new Error(`google fonts: ${res.status}`);
  const css = await res.text();

  const urls = [...new Set(
    [...css.matchAll(/url\((https:\/\/[^)]+\.woff2)\)/g)].map((match) => match[1]),
  )];
  const files = new Map();
  await Promise.all(urls.map(async (url) => {
    const font = await fetch(url);
    if (!font.ok) throw new Error(`${font.status} ${url}`);
    const buf = Buffer.from(await font.arrayBuffer());
    files.set(url, `data:font/woff2;base64,${buf.toString("base64")}`);
  }));

  writeFileSync(
    FONT_CSS,
    css.replace(/url\((https:\/\/[^)]+\.woff2)\)/g, (_, url) => `url(${files.get(url)})`),
  );
  console.log(`fonts: inlined ${urls.length} woff2 files`);
}

// ── 2 · Derived assets ────────────────────────────────────────────────────
// Everything here is regenerated from repo sources, so none of it is committed.
const MILK = at("assets", "milk-thumb-zone.png");
if (stale(MILK)) {
  // A 1080x2204 phone screenshot. Keeping the bottom third is the whole point
  // of the story it illustrates: an empty upper screen, and the floating start
  // and stop control sitting where the thumb already rests.
  await sharp(path.join(REPO, "apps/portfolio/public/case-studies/milk-tracker/pumping-session.png"))
    .extract({ left: 0, top: 1500, width: 1080, height: 704 })
    .resize({ width: 540 })
    .png({ compressionLevel: 9 })
    .toFile(MILK);
}

const GRAIN = at("assets", "grain.png");
if (stale(GRAIN)) {
  // The sites draw the brand grain with an SVG fractal-noise filter. Chromium
  // rasterizes that filter at full page resolution when printing, which on its
  // own pushed the PDF past 15 MB. A tiled PNG is indistinguishable at 3%
  // opacity and embeds once. The LCG is seeded so rebuilds are byte-identical.
  const size = 128;
  const pixels = Buffer.alloc(size * size);
  let seed = 20260803;
  for (let i = 0; i < pixels.length; i += 1) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    pixels[i] = seed % 256;
  }
  await sharp(pixels, { raw: { width: size, height: size, channels: 1 } })
    .png({ compressionLevel: 9 })
    .toFile(GRAIN);
}

// Page 4's QR panel. The printed address under each code must match what the
// code encodes — keep these in sync with the .qr-url spans in document.html.
const QR_TARGETS = {
  portfolio: "https://arkaes.dev",
  storybook: "https://ds.arkaes.dev",
  github: "https://github.com/ahmadnaufal-f/arkaes",
  blog: "https://arkaes.dev/blog",
};

for (const [name, url] of Object.entries(QR_TARGETS)) {
  const file = at("assets", `qr-${name}.svg`);
  if (!stale(file)) continue;
  // Transparent light modules so the panel's own warm-white plate shows
  // through; margin 0 because the plate supplies the quiet zone.
  writeFileSync(file, await QRCode.toString(url, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 0,
    color: { dark: "#17130f", light: "#0000" },
  }));
}

// ── 3 · Render ────────────────────────────────────────────────────────────
const dataUri = (buf, mime) => `data:${mime};base64,${buf.toString("base64")}`;

// The portrait is downscaled: 1122px wide is far more than the ~210px it
// occupies at print size, and it doubled the file for nothing.
const portrait = await sharp(path.join(REPO, "apps/portfolio/src/assets/about-me.png"))
  .resize({ width: 720 })
  .png({ compressionLevel: 9 })
  .toBuffer();

const substitutions = {
  "{{FONTS}}": readFileSync(FONT_CSS, "utf8"),
  "{{PORTRAIT}}": dataUri(portrait, "image/png"),
  "{{MILK}}": dataUri(readFileSync(MILK), "image/png"),
  "{{GRAIN}}": dataUri(readFileSync(GRAIN), "image/png"),
  // Diagrams are inlined as markup rather than <img>, so the document's loaded
  // fonts apply inside them — the same reason about.astro inlines these SVGs.
  "{{SVG_HOW_I_WORK}}": readFileSync(path.join(REPO, "apps/portfolio/public/about/how-i-work.svg"), "utf8"),
  "{{SVG_LEARNING_LOOP}}": readFileSync(path.join(REPO, "apps/portfolio/public/about/learning-loop.svg"), "utf8"),
  "{{SVG_ARCHITECTURE}}": readFileSync(at("assets", "system-architecture.svg"), "utf8"),
  "{{QR_PORTFOLIO}}": readFileSync(at("assets", "qr-portfolio.svg"), "utf8"),
  "{{QR_STORYBOOK}}": readFileSync(at("assets", "qr-storybook.svg"), "utf8"),
  "{{QR_GITHUB}}": readFileSync(at("assets", "qr-github.svg"), "utf8"),
  "{{QR_BLOG}}": readFileSync(at("assets", "qr-blog.svg"), "utf8"),
};

let html = readFileSync(at("document.html"), "utf8");
for (const [placeholder, value] of Object.entries(substitutions)) {
  if (!html.includes(placeholder)) throw new Error(`document.html is missing ${placeholder}`);
  html = html.replaceAll(placeholder, value);
}
writeFileSync(at("out", "document.built.html"), html);

// CHROMIUM_PATH covers environments whose installed browser build does not
// match the one this playwright version expects.
const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
);
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "load" });
await page.evaluate(() => globalThis.document.fonts.ready);

const pdf = at("ahmad-naufal-design-engineer.pdf");
await page.pdf({
  path: pdf,
  format: "A4",
  printBackground: true,
  margin: { top: "0", right: "0", bottom: "0", left: "0" },
  preferCSSPageSize: true,
});

if (PROOF) {
  await page.setViewportSize({ width: 794, height: 1123 });
  for (let i = 1; i <= 4; i += 1) {
    await page.locator(`.page:nth-of-type(${i})`).screenshot({ path: at("out", `proof-${i}.png`) });
  }
}

await browser.close();
console.log(`pdf: ${path.relative(REPO, pdf)}`);
