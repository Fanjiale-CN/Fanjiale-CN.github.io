import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const manifest = JSON.parse(readFileSync(join(root, "be-a-viewer/beijing/beijing-archive.json"), "utf8"));
const archiveJs = readFileSync(join(root, "be-a-viewer/beijing/beijing-archive.js"), "utf8");
const beijingJs = readFileSync(join(root, "be-a-viewer/beijing/beijing.js"), "utf8");
const errors = [];
const currentYear = new Date().getUTCFullYear();
const allowedCategories = new Set(["architecture", "street-life", "landscape"]);
const prohibited = /(?:1989|8964|june\s+fourth|tiananmen|protest|demonstration|military|army|soldier|troop|artillery|police|riot|rebellion|battle|war|political|communist|mao|cultural\s+revolution|great\s+leap|red\s+guard|massacre|crackdown|tank)/i;

if (manifest.version !== "1.0") errors.push("Beijing archive manifest version must be 1.0");
if (manifest.city !== "Beijing") errors.push("Beijing archive city must be Beijing");
if (manifest.source !== "Library of Congress") errors.push("Beijing archive source must be Library of Congress");
if (manifest.datePolicy !== "historical-city-space") errors.push("Beijing archive datePolicy must be historical-city-space");
if (!Array.isArray(manifest.items) || manifest.items.length < 2 || manifest.items.length > 12) errors.push("Beijing archive must contain 2-12 curated items");

const ids = new Set();
for (const item of manifest.items || []) {
  if (!item.id || ids.has(item.id)) errors.push(`Beijing archive duplicate or missing id: ${item.id || "<missing>"}`);
  ids.add(item.id);
  if (!allowedCategories.has(item.category)) errors.push(`${item.id}: category is outside the historical archive allowlist`);
  if (!Number.isInteger(item.yearStart) || !Number.isInteger(item.yearEnd) || item.yearStart < 1800 || item.yearStart > item.yearEnd || item.yearEnd > currentYear) {
    errors.push(`${item.id}: date must be historical, ordered, and no later than the current year`);
  }
  const searchable = [item.title, item.location, item.sourceLabel, item.category].filter(Boolean).join(" ");
  if (prohibited.test(searchable)) errors.push(`${item.id}: blocked historical archive topic`);
  if (!/no known restrictions on publication/i.test(item.rights || "")) errors.push(`${item.id}: rights advisory is not approved`);

  for (const [label, value] of [["imageUrl", item.imageUrl], ["sourceUrl", item.sourceUrl]]) {
    try {
      const url = new URL(value);
      if (url.protocol !== "https:" || (url.hostname !== "loc.gov" && !url.hostname.endsWith(".loc.gov"))) {
        errors.push(`${item.id}: ${label} must use an HTTPS Library of Congress host`);
      }
    } catch {
      errors.push(`${item.id}: ${label} is invalid`);
    }
  }
}

for (const marker of ["beijing-archive.json", "beijing-archive.css", "data-beijing-archive", "allowedCategories", "yearEnd <= currentYear", "slice(0, 12)"]) {
  if (!archiveJs.includes(marker)) errors.push(`Beijing archive renderer marker missing: ${marker}`);
}
if (!beijingJs.includes("beijing-archive.js")) errors.push("Beijing page does not load the historical archive renderer");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Beijing historical archive validation passed: ${manifest.items.length} curated city-space records with open dates and sensitive-topic guards.`);
