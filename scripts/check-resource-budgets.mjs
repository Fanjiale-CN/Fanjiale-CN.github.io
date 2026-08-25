import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../", import.meta.url)));
const config = JSON.parse(readFileSync(join(root, "config", "resource-budget.json"), "utf8"));
const inventory = JSON.parse(readFileSync(join(root, "reports", "media-edge-inventory.json"), "utf8"));
const byR2Key = new Map(inventory.assets.map((asset) => [asset.r2_key, asset]));
const siteOrigin = "https://www.galok.me";
const mediaOrigin = "https://media.galok.me";
const errors = [];
const warnings = [];
const assets = new Map();

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if ([".git", "node_modules", "artifacts"].includes(entry.name)) return [];
    const file = join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : /\.(?:html|css|js)$/i.test(entry.name) ? [file] : [];
  });
}

function add(url, source, home) {
  if (/^(?:data:|mailto:|tel:|javascript:|#)/i.test(url)) return;
  let parsed;
  try { parsed = new URL(url, siteOrigin); } catch { return; }
  const extension = extname(parsed.pathname).toLowerCase();
  if (!extension) return;
  if (parsed.origin === mediaOrigin) {
    const key = decodeURIComponent(parsed.pathname.slice(1));
    const item = byR2Key.get(key);
    if (!item) { errors.push(`${source}: R2 asset missing from migration inventory: ${url}`); return; }
    const record = assets.get(url) ?? { key, bytes: item.size_bytes, extension, sources: new Set(), home: false, remote: true };
    record.sources.add(source); record.home ||= home; assets.set(url, record); return;
  }
  if (parsed.origin !== siteOrigin) return;
  const path = resolve(root, decodeURIComponent(parsed.pathname.slice(1)) || "index.html");
  try {
    const bytes = statSync(path).size;
    const record = assets.get(path) ?? { key: relative(root, path).replaceAll("\\", "/"), bytes, extension, sources: new Set(), home: false, remote: false };
    record.sources.add(source); record.home ||= home; assets.set(path, record);
  } catch { /* Link validation reports missing local files. */ }
}

for (const file of walk(root)) {
  const source = relative(root, file).replaceAll("\\", "/");
  const home = source === "index.html";
  const text = readFileSync(file, "utf8");
  for (const match of text.matchAll(/(?:\b(?:href|src|poster)=|url\()['\"]?([^'\"\s)]+)/gi)) add(match[1], source, home);
}

const isImage = (extension) => [".avif", ".gif", ".jpeg", ".jpg", ".png", ".webp"].includes(extension);
const isVideo = (extension) => [".m4v", ".mp4", ".webm"].includes(extension);
for (const asset of assets.values()) {
  const sourceLabel = [...asset.sources].join(", ");
  if (isImage(asset.extension) && asset.bytes > config.limits.imageBytes) {
    if (config.allowOversizeImages.some((prefix) => asset.key.startsWith(prefix))) warnings.push(`allowed high-resolution image: ${asset.key} (${asset.bytes} B; ${sourceLabel})`);
    else errors.push(`image exceeds ${config.limits.imageBytes} B: ${asset.key} (${asset.bytes} B; ${sourceLabel})`);
  }
  if (isVideo(asset.extension) && asset.bytes > config.limits.videoBytes) {
    if (config.allowOversizeVideos.includes(asset.key)) warnings.push(`allowed cinematic video: ${asset.key} (${asset.bytes} B; ${sourceLabel})`);
    else errors.push(`video exceeds ${config.limits.videoBytes} B: ${asset.key} (${asset.bytes} B; ${sourceLabel})`);
  }
  if (asset.extension === ".js" && asset.bytes > config.limits.scriptWarnBytes) warnings.push(`large JavaScript: ${asset.key} (${asset.bytes} B)`);
  if (asset.extension === ".css" && asset.bytes > config.limits.styleWarnBytes) warnings.push(`large stylesheet: ${asset.key} (${asset.bytes} B)`);
  if (asset.home && asset.bytes > config.limits.homeCriticalBytes) errors.push(`home critical resource exceeds ${config.limits.homeCriticalBytes} B: ${asset.key} (${asset.bytes} B)`);
}

const allAssets = [...assets.values()];
const result = {
  limits: config.limits,
  assetsChecked: allAssets.length,
  bytesChecked: allAssets.reduce((total, asset) => total + asset.bytes, 0),
  errors,
  warnings,
  largestAssets: allAssets.sort((a, b) => b.bytes - a.bytes).slice(0, 12).map((asset) => ({ ...asset, sources: [...asset.sources] }))
};
mkdirSync(join(root, "artifacts", "ci"), { recursive: true });
writeFileSync(join(root, "artifacts", "ci", "resource-budget.json"), `${JSON.stringify(result, null, 2)}\n`);
if (warnings.length) console.warn(warnings.join("\n"));
if (errors.length) { console.error(`Resource budget failed (${errors.length})\n${errors.join("\n")}`); process.exit(1); }
console.log(`Resource budget passed: ${result.assetsChecked} referenced assets, ${(result.bytesChecked / 1024 / 1024).toFixed(1)} MiB scanned, ${warnings.length} documented exceptions/warnings.`);
