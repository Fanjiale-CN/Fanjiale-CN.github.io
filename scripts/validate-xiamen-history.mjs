import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const manifest = JSON.parse(readFileSync(join(root, "be-a-viewer/xiamen/xiamen-history.json"), "utf8"));
const renderer = readFileSync(join(root, "be-a-viewer/xiamen/xiamen-history.js"), "utf8");
const xiamenJs = readFileSync(join(root, "be-a-viewer/xiamen/xiamen.js"), "utf8");
const errors = [];
const currentYear = new Date().getUTCFullYear();
const allowedCategories = new Set(["architecture", "street-life", "landscape"]);
const approvedRights = /^(?:public domain\.?|cc0(?: 1\.0)?|cc by(?:-sa)? (?:2\.0|3\.0|4\.0))$/i;
const blocked8964 = /(?:8964|八九六四|六四|june\s+fourth|1989\s*(?:tiananmen|beijing\s+protests)|tiananmen\s+(?:square\s+)?(?:protests?|incident|massacre|crackdown))/i;

if (manifest.version !== "1.0") errors.push("Xiamen history manifest version must be 1.0");
if (manifest.city !== "Xiamen") errors.push("Xiamen history city must be Xiamen");
if (manifest.datePolicy !== "historical-city-space") errors.push("Xiamen history datePolicy must be historical-city-space");
if (!Array.isArray(manifest.items) || manifest.items.length < 20 || manifest.items.length > 30) {
  errors.push("Xiamen history must contain 20-30 curated items");
}

const ids = new Set();
for (const item of manifest.items || []) {
  if (!item.id || ids.has(item.id)) errors.push(`Xiamen history duplicate or missing id: ${item.id || "<missing>"}`);
  ids.add(item.id);
  if (!allowedCategories.has(item.category)) errors.push(`${item.id}: category is outside the historical allowlist`);
  if (!Number.isInteger(item.yearStart) || !Number.isInteger(item.yearEnd) || item.yearStart < 1800 || item.yearStart > item.yearEnd || item.yearEnd > currentYear) {
    errors.push(`${item.id}: date must be historical, ordered, and no later than the current year`);
  }

  const searchable = [item.title, item.location, item.sourceLabel, item.category, item.dateLabel].filter(Boolean).join(" ");
  if (blocked8964.test(searchable)) errors.push(`${item.id}: blocked 8964 archive topic`);
  if (!approvedRights.test(String(item.rights || "").trim())) errors.push(`${item.id}: rights must be public domain, CC0, CC BY, or CC BY-SA`);

  for (const [label, value] of [["imageUrl", item.imageUrl], ["sourceUrl", item.sourceUrl]]) {
    try {
      const url = new URL(value);
      if (url.protocol !== "https:" || (url.hostname !== "commons.wikimedia.org" && !url.hostname.endsWith(".wikimedia.org"))) {
        errors.push(`${item.id}: ${label} must use an approved Wikimedia HTTPS host`);
      }
    } catch {
      errors.push(`${item.id}: ${label} is invalid`);
    }
  }
}

for (const marker of ["xiamen-history.json", "xiamen-history.css", "data-xiamen-history", "allowedCategories", "yearEnd <= currentYear", "slice(0, 30)", "blocked8964"]) {
  if (!renderer.includes(marker)) errors.push(`Xiamen history renderer marker missing: ${marker}`);
}
if (!xiamenJs.includes("xiamen-history.js")) errors.push("Xiamen page does not load the historical archive renderer");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Xiamen historical archive validation passed: ${manifest.items.length} records with open dates, rights checks, and an 8964-only topic guard.`);
