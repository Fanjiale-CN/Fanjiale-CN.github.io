import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const cssPath = join(root, "be-a-viewer/hangzhou/hangzhou-mobile.css");
const loaderPath = join(root, "be-a-viewer/hangzhou/hangzhou.js");
const corePath = join(root, "be-a-viewer/hangzhou/hangzhou-core.js");

const css = readFileSync(cssPath, "utf8");
const loader = readFileSync(loaderPath, "utf8");
const core = readFileSync(corePath, "utf8");

const requiredCss = [
  "@media (max-width: 760px)",
  ".hz-night-triptych figure:nth-child(1) img",
  "aspect-ratio: auto !important",
  ".hz-poster img",
  "max-height: 68svh",
  ".hz-city-portrait",
  ".hz-shot--portrait",
  ".hz-old-rail",
  "overflow-x: hidden"
];

for (const marker of requiredCss) {
  if (!css.includes(marker)) throw new Error(`Hangzhou mobile repair missing CSS marker: ${marker}`);
}

if (!loader.includes("hangzhou-mobile.css?v=20260828-mobile-repair")) {
  throw new Error("Hangzhou loader does not attach the mobile repair stylesheet.");
}
if (!loader.includes("hangzhou-core.js?v=20260828-mobile-repair")) {
  throw new Error("Hangzhou loader does not preserve the original core interaction script.");
}
if (!core.includes("data-hz-hero") || !core.includes("data-hz-rail")) {
  throw new Error("Hangzhou core interaction script is incomplete.");
}
if (/\.hz-night-triptych[^}]*width:\s*(?:68|78|88)%/s.test(css)) {
  throw new Error("Hangzhou mobile night sequence reintroduced narrow percentage cards.");
}

console.log("Hangzhou mobile layout validation passed: full-width narrative media, uncropped night frames, bounded poster and preserved core interactions.");
