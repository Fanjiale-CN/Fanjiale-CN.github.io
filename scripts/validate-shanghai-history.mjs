import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const manifest = JSON.parse(readFileSync(join(root, "be-a-viewer/shanghai/shanghai-history.json"), "utf8"));
const renderer = readFileSync(join(root, "be-a-viewer/shanghai/shanghai-history.js"), "utf8");
const shanghaiJs = readFileSync(join(root, "be-a-viewer/shanghai/shanghai.js"), "utf8");
const mapline = readFileSync(join(root, "be-a-viewer/city-mapline.js"), "utf8");
const errors = [];
const currentYear = new Date().getUTCFullYear();
const allowedCategories = new Set(["architecture", "street-life", "landscape"]);
const approvedRights = /^(?:public domain\.?|cc0(?: 1\.0)?|cc by(?:-sa)? (?:2\.0|3\.0|4\.0))$/i;
const prohibited = /(?:1989|8964|june\s+fourth|tiananmen|protest|demonstration|military|army|soldier|troop|artillery|police|riot|rebellion|battle|war|political|communist|mao|cultural\s+revolution|great\s+leap|red\s+guard|massacre|crackdown|tank|may\s+thirtieth|nanking\s+road\s+incident|january\s+28|august\s+13|battle\s+of\s+shanghai|communist\s+party|party\s+congress)/i;

if (manifest.version !== "1.0") errors.push("Shanghai history manifest version must be 1.0");
if (manifest.city !== "Shanghai") errors.push("Shanghai history city must be Shanghai");
if (manifest.datePolicy !== "historical-city-space") errors.push("Shanghai history datePolicy must be historical-city-space");
if (!Array.isArray(manifest.periods) || manifest.periods.length !== 4) errors.push("Shanghai history must define exactly four archive periods");
if (!Array.isArray(manifest.items) || manifest.items.length !== 20) errors.push("Shanghai history must contain exactly 20 curated items");

const periodIds = new Set((manifest.periods || []).map((period) => period.id));
if (periodIds.size !== 4) errors.push("Shanghai history period ids must be unique");

const ids = new Set();
for (const item of manifest.items || []) {
  if (!item.id || ids.has(item.id)) errors.push(`Shanghai history duplicate or missing id: ${item.id || "<missing>"}`);
  ids.add(item.id);
  if (!periodIds.has(item.period)) errors.push(`${item.id}: period is missing from the archive period list`);
  if (!allowedCategories.has(item.category)) errors.push(`${item.id}: category is outside the historical allowlist`);
  if (!Number.isInteger(item.yearStart) || !Number.isInteger(item.yearEnd) || item.yearStart < 1800 || item.yearStart > item.yearEnd || item.yearEnd > currentYear) {
    errors.push(`${item.id}: date must be historical, ordered, and no later than the current year`);
  }
  const searchable = [item.title, item.location, item.sourceLabel, item.category, item.period].filter(Boolean).join(" ");
  if (prohibited.test(searchable)) errors.push(`${item.id}: blocked historical archive topic`);
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

for (const marker of ["shanghai-history.json", "shanghai-history.css", "data-shanghai-history", "allowedCategories", "blockedTopics", "slice(0, 20)", "items.length !== 20"]) {
  if (!renderer.includes(marker)) errors.push(`Shanghai history renderer marker missing: ${marker}`);
}
if (!shanghaiJs.includes("shanghai-history.js")) errors.push("Shanghai page script does not load the historical archive renderer");
if (mapline.includes("shanghai-history.js")) errors.push("Shared city mapline must not own Shanghai-specific history loading");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Shanghai historical archive validation passed: ${manifest.items.length} curated city-space records across ${manifest.periods.length} periods with rights, sensitive-topic guards, and a Shanghai-local loader.`);
