import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const timeJs = readFileSync(join(root, "be-a-viewer/beijing/beijing-time.js"), "utf8");
const timeCss = readFileSync(join(root, "be-a-viewer/beijing/beijing-time.css"), "utf8");
const loaderJs = readFileSync(join(root, "be-a-viewer/beijing/beijing-archive.js"), "utf8");
const beijingJs = readFileSync(join(root, "be-a-viewer/beijing/beijing.js"), "utf8");
const errors = [];
const version = "20260830-beijing-cinema1";

function requireMarker(text, marker, label) {
  if (!text.includes(marker)) errors.push(`${label} marker missing: ${marker}`);
}

for (const marker of [
  `const VERSION = "${version}"`,
  "data-beijing-time-root",
  "GALOK CINEMATIC ARCHIVE / BEIJING",
  "SCROLL<br>THROUGH<br>BEIJING.",
  "IntersectionObserver",
  "requestAnimationFrame",
  "data-beijing-time-frame-a",
  "data-beijing-time-frame-b",
  "data-beijing-time-archive",
  "oldMap?.remove()",
  "ENTER THE ARCHIVE",
  "Beijing Subway in Construction - satellite image (1967-09-20).jpg",
  "1919 crowds on street in Beijing.jpg",
  "Liulihe bronze ding 3.jpg",
  "Tianning Temple Pagoda.jpg",
  "Miaoying Temple 1.jpg",
  "开国大典喇叭.jpg",
  "Beijing Qianmen 2008.jpg"
]) requireMarker(timeJs, marker, "Beijing cinematic archive");

const visualCuts = (timeJs.match(/\bchapter:\s*"/g) || []).length;
if (visualCuts < 18) errors.push(`Beijing cinematic archive needs at least 18 visual cuts; found ${visualCuts}`);

const blockedTopic = /(?:8964|89\s*64|june\s+fourth|tiananmen.{0,32}1989|1989.{0,32}tiananmen)/i;
if (blockedTopic.test(timeJs)) errors.push("Beijing cinematic archive contains a blocked 1989 timeline topic");

const visibleField = /\b(?:chapter|year|era|mark|title|copy|source|rights):\s*"([^"]*)"/g;
const cjk = /[\u3400-\u9fff\uf900-\ufaff]/;
for (const match of timeJs.matchAll(visibleField)) {
  if (cjk.test(match[1])) errors.push(`Visible Beijing cinematic copy must be English-only: ${match[1]}`);
}

for (const visibleStatic of [
  "GALOK CINEMATIC ARCHIVE / BEIJING",
  "VISUAL CUTS",
  "SCROLL DOWN · THE PHOTOGRAPH IS THE TIMELINE",
  "ARCHIVE +",
  "VIEW SOURCE ↗",
  "THE CITY MOVED. THE WALLS MOVED. THE CENTER REMAINED.",
  "BEIJING IS STILL BEING REBUILT.",
  "CONTINUE TO BEIJING ↓",
  "SECOND LAYER / SOURCES",
  "CLOSE ×"
]) {
  if (cjk.test(visibleStatic)) errors.push(`Static Beijing cinematic UI must be English-only: ${visibleStatic}`);
}

if (/\bnew\s+Audio\b|<audio\b|\.playSound\b|AudioContext\b/.test(timeJs)) {
  errors.push("Beijing cinematic archive must not include audio or synthetic sound");
}

for (const marker of [
  ".beijing-time-stage",
  "position:sticky",
  ".beijing-time-archive",
  "@media(max-width:820px)",
  "@media(prefers-reduced-motion:reduce)",
  "data-tone=\"satellite\""
]) requireMarker(timeCss, marker, "Beijing cinematic CSS");

requireMarker(loaderJs, version, "Beijing archive loader");
requireMarker(loaderJs, "beijing-time.js", "Beijing archive loader");
requireMarker(beijingJs, `beijing-archive.js?v=${version}`, "Beijing page loader");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Beijing cinematic archive validation passed: ${visualCuts} visual cuts, English-only visible copy, no audio, 1989 omitted, archive layer and responsive reduced-motion support present.`);
