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
const blocked8964 = /(?:8964|89\s*64|八九六四|六四(?:事件)?|june\s+fourth|tiananmen.{0,32}1989|1989.{0,32}tiananmen)/i;
function approvedHost(value) { try { const url = new URL(value); return url.protocol === "https:" && (url.hostname === "loc.gov" || url.hostname.endsWith(".loc.gov") || url.hostname === "commons.wikimedia.org" || url.hostname.endsWith(".wikimedia.org")); } catch { return false; } }
if (manifest.version !== "1.1") errors.push("Beijing archive manifest version must be 1.1");
if (manifest.city !== "Beijing") errors.push("Beijing archive city must be Beijing");
if (manifest.datePolicy !== "historical-city-space") errors.push("Beijing archive datePolicy must be historical-city-space");
if (!Array.isArray(manifest.items) || manifest.items.length < 20 || manifest.items.length > 30) errors.push("Beijing archive must contain 20-30 curated items");
const ids = new Set();
for (const item of manifest.items || []) {
  if (!item.id || ids.has(item.id)) errors.push(`Beijing archive duplicate or missing id: ${item.id || "<missing>"}`);
  ids.add(item.id);
  if (!allowedCategories.has(item.category)) errors.push(`${item.id}: category is outside the historical archive allowlist`);
  if (!Number.isInteger(item.yearStart) || !Number.isInteger(item.yearEnd) || item.yearStart < 1800 || item.yearStart > item.yearEnd || item.yearEnd > currentYear) errors.push(`${item.id}: date must be historical, ordered, and no later than the current year`);
  const searchable = [item.title, item.location, item.sourceLabel, item.category, item.dateLabel].filter(Boolean).join(" ");
  if (blocked8964.test(searchable)) errors.push(`${item.id}: blocked 8964 archive topic`);
  if (!String(item.rights || "").trim()) errors.push(`${item.id}: rights/source advisory must be present`);
  if (!approvedHost(item.imageUrl)) errors.push(`${item.id}: imageUrl must use an approved LOC or Wikimedia HTTPS host`);
  if (!approvedHost(item.sourceUrl)) errors.push(`${item.id}: sourceUrl must use an approved LOC or Wikimedia HTTPS host`);
}
for (const marker of ["beijing-archive.json", "beijing-archive.css", "data-beijing-archive", "allowedCategories", "blocked8964", "slice(0, 30)"]) if (!archiveJs.includes(marker)) errors.push(`Beijing archive renderer marker missing: ${marker}`);
if (!beijingJs.includes("beijing-archive.js")) errors.push("Beijing page does not load the historical archive renderer");
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log(`Beijing historical archive validation passed: ${manifest.items.length} records, 20-30 range, relaxed historical-topic policy with 8964 guard.`);
