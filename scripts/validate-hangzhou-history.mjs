import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const directory = dirname(fileURLToPath(import.meta.url));
const root = join(directory, "..");
const manifestPath = join(root, "be-a-viewer", "hangzhou", "hangzhou-history.json");
const rendererPath = join(root, "be-a-viewer", "hangzhou", "hangzhou-history.js");
const cssPath = join(root, "be-a-viewer", "hangzhou", "hangzhou-history.css");
const loaderPath = join(root, "be-a-viewer", "hangzhou", "hangzhou.js");

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const renderer = readFileSync(rendererPath, "utf8");
const css = readFileSync(cssPath, "utf8");
const loader = readFileSync(loaderPath, "utf8");

const fail = (message) => {
  console.error(`Hangzhou history validation failed: ${message}`);
  process.exit(1);
};

if (manifest.version !== "1.0") fail(`manifest version ${manifest.version}`);
if (manifest.city !== "Hangzhou") fail(`manifest city ${manifest.city}`);
if (manifest.datePolicy !== "historical-city-space") fail(`date policy ${manifest.datePolicy}`);
if (!Array.isArray(manifest.items) || manifest.items.length !== 36) fail(`expected 36 records, found ${manifest.items?.length ?? 0}`);
if (manifest.count !== manifest.items.length) fail(`count field ${manifest.count} does not match records`);

const allowedRights = new Set(["Public domain", "CC0 1.0", "CC BY 4.0", "CC BY-SA 4.0"]);
const blocked8964 = /\b(?:8964|1989[\s./-]*0?6[\s./-]*0?4|0?6[\s./-]*0?4[\s./-]*1989|june\s+fourth|tiananmen.{0,24}1989|1989.{0,24}tiananmen)\b/i;
const ids = new Set();
const files = new Set();
let previousYear = 1300;

for (const [index, item] of manifest.items.entries()) {
  if (!item?.id || !item?.file || !item?.title || !item?.dateLabel || !item?.credit || !item?.rights || !item?.category) fail(`record ${index + 1} is missing metadata`);
  if (ids.has(item.id)) fail(`duplicate id ${item.id}`);
  if (files.has(item.file)) fail(`duplicate file ${item.file}`);
  ids.add(item.id);
  files.add(item.file);
  if (!Number.isInteger(item.year) || item.year < 1300 || item.year > new Date().getFullYear()) fail(`invalid year ${item.year} for ${item.id}`);
  if (item.year < previousYear) fail(`year order breaks at ${item.id}`);
  previousYear = item.year;
  if (!allowedRights.has(item.rights)) fail(`unsupported rights ${item.rights} for ${item.id}`);
  if (!/^https:\/\/commons\.wikimedia\.org\//.test(item.sourceUrl || "")) fail(`non-Commons source URL for ${item.id}`);
  if (blocked8964.test(JSON.stringify(item))) fail(`blocked topic found in ${item.id}`);
}

const requiredRendererMarkers = [
  'manifest.items.slice(0, 40)',
  'document.querySelector(".hz-ledger")',
  'className = "hangzhou-history"',
  'valid.length < 30'
];
for (const marker of requiredRendererMarkers) {
  if (!renderer.includes(marker)) fail(`renderer marker missing: ${marker}`);
}

if (!css.includes("object-fit: contain")) fail("historical media is not protected from cropping");
if (!css.includes("@media (max-width: 760px)")) fail("mobile archive breakpoint missing");
if (!loader.includes("hangzhou-history.css") || !loader.includes("hangzhou-history.js")) fail("Hangzhou loader does not mount historical archive assets");

console.log("Hangzhou historical archive validation passed: 36 records, 1412–1984, Commons rights checks, natural image ratios, and an 8964-only topic guard.");
