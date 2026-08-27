import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const manifest = JSON.parse(readFileSync(join(root, "be-a-viewer/xian/xian-history.json"), "utf8"));
const renderer = readFileSync(join(root, "be-a-viewer/xian/xian-history.js"), "utf8");
const xianJs = readFileSync(join(root, "be-a-viewer/xian/xian.js"), "utf8");
const errors = [];
const currentYear = new Date().getUTCFullYear();
const allowedCategories = new Set(["architecture", "street-life", "landscape"]);
const prohibited = /(?:1989|8964|june\s+fourth|tiananmen|protest|demonstration|military|army|soldier|troop|artillery|police|riot|rebellion|battle|war|political|communist|mao|cultural\s+revolution|great\s+leap|red\s+guard|massacre|crackdown|tank|xi.?an\s+incident|sian\s+incident)/i;
const approvedRights = /^(?:public domain\.?|cc0(?: 1\.0)?|cc by(?:-sa)? (?:2\.0|3\.0|4\.0))$/i;

if (manifest.version !== "1.0") errors.push("Xi'an history manifest version must be 1.0");
if (manifest.city !== "Xi'an") errors.push("Xi'an history city must be Xi'an");
if (manifest.datePolicy !== "historical-city-space") errors.push("Xi'an history datePolicy must be historical-city-space");
if (!Array.isArray(manifest.items) || manifest.items.length < 4 || manifest.items.length > 10) errors.push("Xi'an history must contain 4-10 curated items");

const ids = new Set();
for (const item of manifest.items || []) {
  if (!item.id || ids.has(item.id)) errors.push(`Xi'an history duplicate or missing id: ${item.id || "<missing>"}`);
  ids.add(item.id);
  if (!allowedCategories.has(item.category)) errors.push(`${item.id}: category is outside the historical allowlist`);
  if (!Number.isInteger(item.yearStart) || !Number.isInteger(item.yearEnd) || item.yearStart < 1800 || item.yearStart > item.yearEnd || item.yearEnd > currentYear) {
    errors.push(`${item.id}: date must be historical, ordered, and no later than the current year`);
  }
  const searchable = [item.title, item.location, item.sourceLabel, item.category].filter(Boolean).join(" ");
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

for (const marker of ["xian-history.json", "xian-history.css", "data-xian-history", "allowedCategories", "yearEnd <= currentYear", "approvedRights", "slice(0, 10)"]) {
  if (!renderer.includes(marker)) errors.push(`Xi'an history renderer marker missing: ${marker}`);
}
if (!xianJs.includes("xian-history.js")) errors.push("Xi'an page does not load the historical archive renderer");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Xi'an historical archive validation passed: ${manifest.items.length} curated city-space records with open dates, rights checks, and sensitive-topic guards.`);
