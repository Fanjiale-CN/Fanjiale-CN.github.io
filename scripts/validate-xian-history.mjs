import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
const manifest = JSON.parse(readFileSync(join(root, "be-a-viewer/xian/xian-history.json"), "utf8"));
const renderer = readFileSync(join(root, "be-a-viewer/xian/xian-history.js"), "utf8");
const xianJs = readFileSync(join(root, "be-a-viewer/xian/xian.js"), "utf8");
const timeJs = readFileSync(join(root, "be-a-viewer/xian/xian-time.js"), "utf8");
const timeCss = readFileSync(join(root, "be-a-viewer/xian/xian-time.css"), "utf8");
const errors = [];
const currentYear = new Date().getUTCFullYear();
const allowedCategories = new Set(["architecture", "street-life", "landscape"]);
const blocked8964 = /(?:8964|89\s*64|八九六四|六四(?:事件)?|june\s+fourth|tiananmen.{0,32}1989|1989.{0,32}tiananmen)/i;
function safeCommonsUrl(value) { try { const url = new URL(value); return url.protocol === "https:" && (url.hostname === "commons.wikimedia.org" || url.hostname.endsWith(".wikimedia.org")); } catch { return false; } }
if (manifest.version !== "1.1") errors.push("Xi'an history manifest version must be 1.1");
if (manifest.city !== "Xi'an") errors.push("Xi'an history city must be Xi'an");
if (manifest.datePolicy !== "historical-city-space") errors.push("Xi'an history datePolicy must be historical-city-space");
if (!Array.isArray(manifest.items) || manifest.items.length < 20 || manifest.items.length > 30) errors.push("Xi'an history must contain 20-30 curated items");
const ids = new Set();
for (const item of manifest.items || []) {
  if (!item.id || ids.has(item.id)) errors.push(`Xi'an history duplicate or missing id: ${item.id || "<missing>"}`);
  ids.add(item.id);
  if (!allowedCategories.has(item.category)) errors.push(`${item.id}: category is outside the historical allowlist`);
  if (!Number.isInteger(item.yearStart) || !Number.isInteger(item.yearEnd) || item.yearStart < 1800 || item.yearStart > item.yearEnd || item.yearEnd > currentYear) errors.push(`${item.id}: date must be historical, ordered, and no later than the current year`);
  const searchable = [item.title, item.location, item.sourceLabel, item.category, item.dateLabel].filter(Boolean).join(" ");
  if (blocked8964.test(searchable)) errors.push(`${item.id}: blocked 8964 archive topic`);
  if (!String(item.rights || "").trim()) errors.push(`${item.id}: rights/source advisory must be present`);
  if (!safeCommonsUrl(item.imageUrl)) errors.push(`${item.id}: imageUrl must use an approved Wikimedia HTTPS host`);
  if (!safeCommonsUrl(item.sourceUrl)) errors.push(`${item.id}: sourceUrl must use an approved Wikimedia HTTPS host`);
}
for (const marker of ["xian-history.json", "xian-history.css", "data-xian-history", "allowedCategories", "blocked8964", "slice(0, 30)"]) if (!renderer.includes(marker)) errors.push(`Xi'an history renderer marker missing: ${marker}`);
if (!xianJs.includes("xian-history.js")) errors.push("Xi'an page does not load the historical archive renderer");
if (!renderer.includes("xian-time.js?v=20260829-strata2")) errors.push("Xi'an historical renderer must load the time-strata module");
for (const marker of ["data-xian-time-root", "PEEL<br>XI’AN BACK", "IntersectionObserver", "requestAnimationFrame", "data-xian-time-frame-a", "data-xian-time-frame-b", "Ancient%20and%20Modern%20%28VI%29", "Ancient%20and%20Modern%20%28IV%29", "Ancient%20and%20Modern%20%28III%29", "Ancient%20and%20Modern%20%28V%29", "PUBLIC DOMAIN"]) {
  if (!timeJs.includes(marker)) errors.push(`Xi'an time-strata marker missing: ${marker}`);
}
for (const marker of [".xian-time-stage", "position: sticky", ".xian-time-frame.is-visible", "@media (max-width: 820px)", "prefers-reduced-motion"]) {
  if (!timeCss.includes(marker)) errors.push(`Xi'an time-strata CSS marker missing: ${marker}`);
}
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log(`Xi'an historical archive validation passed: ${manifest.items.length} records plus the six-step scroll-through-time reader.`);
