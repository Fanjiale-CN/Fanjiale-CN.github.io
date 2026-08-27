import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const directory = dirname(fileURLToPath(import.meta.url));
const root = join(directory, "..");
const manifestPath = join(root, "be-a-viewer", "shenzhen", "shenzhen-history.json");
const modulePath = join(root, "be-a-viewer", "shenzhen", "shenzhen-time.js");
const loaderPath = join(root, "be-a-viewer", "shenzhen", "shenzhen.js");

const [rawManifest, moduleSource, loaderSource] = await Promise.all([
  readFile(manifestPath, "utf8"),
  readFile(modulePath, "utf8"),
  readFile(loaderPath, "utf8")
]);

const manifest = JSON.parse(rawManifest);
const items = Array.isArray(manifest?.items) ? manifest.items : [];
const fail = (message) => {
  console.error(`[shenzhen-history] ${message}`);
  process.exit(1);
};

if (manifest?.city !== "Shenzhen") fail("manifest city must be Shenzhen");
if (items.length < 20 || items.length > 40) fail(`expected 20–40 archive images, found ${items.length}`);

const blocked8964 = /(?:8964|八九六四|六四|june\s+fourth|1989\s*(?:tiananmen|beijing\s+protests)|tiananmen\s+(?:square\s+)?(?:protests?|incident|massacre|crackdown))/i;
const ids = new Set();
for (const [index, item] of items.entries()) {
  const label = `item ${index + 1}`;
  if (!item?.id || ids.has(item.id)) fail(`${label}: missing or duplicate id`);
  ids.add(item.id);
  if (!item.title || !item.dateLabel || !item.location) fail(`${label}: missing title/date/location`);
  if (!Number.isInteger(item.yearStart) || !Number.isInteger(item.yearEnd) || item.yearStart > item.yearEnd) fail(`${label}: invalid year range`);
  if (item.yearStart < 1800 || item.yearEnd > 2100) fail(`${label}: year range outside archive policy`);
  if (!/^https:\/\/commons\.wikimedia\.org\//.test(item.imageUrl || "")) fail(`${label}: image must use Wikimedia Commons`);
  if (!/^https:\/\/commons\.wikimedia\.org\//.test(item.sourceUrl || "")) fail(`${label}: source must use Wikimedia Commons`);
  if (!item.rights) fail(`${label}: missing rights/source-page note`);
  const searchable = [item.id, item.title, item.dateLabel, item.location, item.sourceLabel, item.rights, item.imageUrl, item.sourceUrl].join(" ");
  if (blocked8964.test(searchable)) fail(`${label}: blocked 8964 topic`);
}

for (const year of ["1973", "1979", "1980", "1982", "1990", "1997", "2001", "2010", "2015", "2020", "2024"]) {
  if (!moduleSource.includes(`year="${year}"`) && !moduleSource.includes(`"year":"${year}"`) && !moduleSource.includes(`"year": "${year}"`)) {
    fail(`growth module missing ${year} milestone`);
  }
}
if (!moduleSource.includes("svs.gsfc.nasa.gov/vis/a000000/a002700/a002763/widershenzhen.webmhd.webm")) {
  fail("growth module missing NASA Landsat source");
}
if (!moduleSource.includes("17.9895") || !moduleSource.includes("3.680187")) {
  fail("growth module missing checked 2024 population/GDP figures");
}
if (!loaderSource.includes("shenzhen-time.js")) fail("shenzhen.js does not load the time module");

console.log(`[shenzhen-history] passed: ${items.length} archive images + growth timeline checks`);
