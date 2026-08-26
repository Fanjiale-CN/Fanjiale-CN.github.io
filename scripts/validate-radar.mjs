import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const data = JSON.parse(readFileSync(join(root, "radar/signals.json"), "utf8"));
const html = readFileSync(join(root, "radar/index.html"), "utf8");
const css = readFileSync(join(root, "radar/radar.css"), "utf8");
const js = readFileSync(join(root, "radar/radar.js"), "utf8");
const worker = readFileSync(join(root, "workers/radar/src/index.js"), "utf8");
const workerConfig = readFileSync(join(root, "workers/radar/wrangler.jsonc"), "utf8");
const deployWorkflow = readFileSync(join(root, ".github/workflows/deploy-radar-worker.yml"), "utf8");
const errors = [];
const states = ["Signal", "Brief", "Lead", "Archive"];

if (data.version !== "1.0") errors.push("schema version must be 1.0");
if (!Date.parse(data.generatedAt)) errors.push("generatedAt must be a valid date");
if (new Date(data.generatedAt).getTime() > Date.now() + 60_000) errors.push("generatedAt cannot be in the future");
if (!Array.isArray(data.signals) || data.signals.length < 4) errors.push("at least four signals required");

const ids = new Set();
for (const item of data.signals ?? []) {
  if (ids.has(item.id)) errors.push(`duplicate id ${item.id}`);
  ids.add(item.id);
  if (!states.includes(item.state)) errors.push(`${item.id}: invalid state`);
  for (const field of ["headline", "summary", "context", "topic", "geography"]) {
    if (!item[field]) errors.push(`${item.id}: missing ${field}`);
  }
  if (!Date.parse(item.publishedAt) || !Date.parse(item.updatedAt)) errors.push(`${item.id}: invalid date`);
  if (!Array.isArray(item.coverage) || !item.coverage.length) errors.push(`${item.id}: evidence missing`);

  for (const source of item.coverage ?? []) {
    if (!source.outlet || !source.title) errors.push(`${item.id}: incomplete evidence label`);
    if (/\bcoverage$/i.test(source.title)) errors.push(`${item.id}: evidence title must name a specific report`);
    try {
      const url = new URL(source.url);
      if (!["http:", "https:"].includes(url.protocol)) throw new Error();
      const pathDepth = url.pathname.split("/").filter(Boolean).length;
      if (url.hostname !== "www.galok.me" && pathDepth < 2) {
        errors.push(`${item.id}: evidence URL must link to a specific report`);
      }
    } catch {
      errors.push(`${item.id}: invalid source URL`);
    }
  }
}

for (const state of states) {
  if (!data.signals.some((item) => item.state === state)) errors.push(`state missing: ${state}`);
}

for (const marker of ["data-radar-stream", "data-radar-filter", "data-radar-dialog", "CollectionPage", "/assets/galok-symbol.svg", "verified snapshot", "live candidates"]) {
  if (!html.includes(marker)) errors.push(`page marker missing: ${marker}`);
}
for (const marker of ["history.replaceState", "showModal()", "IntersectionObserver", "prefers-reduced-motion", "data-provenance", "radar-row__provenance"]) {
  if (!`${js}\n${css}`.includes(marker)) errors.push(`interaction marker missing: ${marker}`);
}
for (const marker of ["/radar/signals.json", "/api/signals/", "AbortController", "Live candidate", "provenance === \"live\""]) {
  if (!js.includes(marker)) errors.push(`live/fallback marker missing: ${marker}`);
}
for (const marker of ["Promise.allSettled", "stableId", "cache=stale", "86400", "AbortController", "x-radar-cache"]) {
  if (!worker.includes(marker)) errors.push(`worker resilience marker missing: ${marker}`);
}
if (!workerConfig.includes('"pattern":"www.galok.me/api/signals/*"')) errors.push("Radar Worker route is not pinned to /api/signals/*");
for (const marker of ["workers/radar/**", "workflow_dispatch", "CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID", "wrangler deploy", "credentials.outputs.ready"]) {
  if (!deployWorkflow.includes(marker)) errors.push(`worker deploy workflow marker missing: ${marker}`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Radar validation passed: ${data.signals.length} editorial signals, dual-source client, resilient edge cache and guarded Worker deployment.`);
