import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
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
const refreshWorkflow = readFileSync(join(root, ".github/workflows/refresh-radar-live.yml"), "utf8");
const buildFeed = readFileSync(join(root, "scripts/build-radar-live-feed.mjs"), "utf8");
const mergeArchivePath = join(root, "scripts/merge-radar-daily-archive.mjs");
const mergeArchive = readFileSync(mergeArchivePath, "utf8");
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

for (const marker of ["RADAR_BUCKET", "radar/live-signals.json", "staleMaxAgeMs", "24 * 60 * 60 * 1000", "x-radar-cache", "cloudflare-r2"]) {
  if (!worker.includes(marker)) errors.push(`worker R2 resilience marker missing: ${marker}`);
}
if (!/"pattern"\s*:\s*"www\.galok\.me\/api\/signals\/\*"/.test(workerConfig)) errors.push("Radar Worker route is not pinned to /api/signals/*");
if (!/"binding"\s*:\s*"RADAR_BUCKET"/.test(workerConfig) || !/"bucket_name"\s*:\s*"galok-media"/.test(workerConfig)) {
  errors.push("Radar Worker must bind RADAR_BUCKET to galok-media");
}

for (const marker of ["workers/radar/**", "workflow_dispatch", "CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID", "wrangler deploy", "credentials.outputs.ready"]) {
  if (!deployWorkflow.includes(marker)) errors.push(`worker deploy workflow marker missing: ${marker}`);
}
for (const marker of [
  "schedule:",
  "workflow_dispatch",
  "build-radar-live-feed.mjs",
  "merge-radar-daily-archive.mjs",
  "galok-media/radar/live-signals.json",
  "radar/archive/",
  "snapshot_key",
  "daily_key",
  "max-age=31536000, immutable",
  "cancel-in-progress: false",
  "Verify history archive",
  "Verify production Radar API",
]) {
  if (!refreshWorkflow.includes(marker)) errors.push(`Radar refresh workflow marker missing: ${marker}`);
}
for (const marker of ["Google News RSS", "GDELT", "Promise.allSettled", "Signal", "24"]) {
  if (!buildFeed.includes(marker)) errors.push(`Radar scheduled feed marker missing: ${marker}`);
}
for (const marker of ["radar-daily-archive", "archiveKey", "firstSeenAt", "lastSeenAt", "seenCount", "snapshotCount", "latestSnapshot", "snapshots"]) {
  if (!mergeArchive.includes(marker)) errors.push(`Radar history archive marker missing: ${marker}`);
}

const temp = mkdtempSync(join(tmpdir(), "galok-radar-archive-"));
try {
  const currentOnePath = join(temp, "current-one.json");
  const currentTwoPath = join(temp, "current-two.json");
  const archiveOnePath = join(temp, "archive-one.json");
  const archiveTwoPath = join(temp, "archive-two.json");
  const fixtureSignal = {
    id: "fixture-1",
    state: "Signal",
    topic: "Economy",
    headline: "Fixture signal",
    summary: "Fixture summary",
    context: "Fixture context",
    publishedAt: "2026-08-27T01:00:00.000Z",
    updatedAt: "2026-08-27T01:00:00.000Z",
    geography: "China / Global",
    coverage: [{ outlet: "Fixture", title: "Fixture signal", url: "https://example.com/news/fixture?utm_source=test", publishedAt: "2026-08-27T01:00:00.000Z" }],
  };
  const currentOne = { version: "1.0", generatedAt: "2026-08-27T01:00:00.000Z", provider: "fixture", signals: [fixtureSignal] };
  const currentTwo = {
    version: "1.0",
    generatedAt: "2026-08-27T01:15:00.000Z",
    provider: "fixture",
    signals: [
      { ...fixtureSignal, id: "fixture-reordered", updatedAt: "2026-08-27T01:15:00.000Z" },
      {
        ...fixtureSignal,
        id: "fixture-2",
        headline: "Second fixture signal",
        coverage: [{ outlet: "Fixture", title: "Second fixture signal", url: "https://example.com/news/second", publishedAt: "2026-08-27T01:10:00.000Z" }],
      },
    ],
  };
  writeFileSync(currentOnePath, JSON.stringify(currentOne));
  writeFileSync(currentTwoPath, JSON.stringify(currentTwo));

  const first = spawnSync(process.execPath, [mergeArchivePath, "--current", currentOnePath, "--output", archiveOnePath, "--snapshot-key", "radar/archive/2026/08/27/01-00-00-1-1.json"], { encoding: "utf8" });
  if (first.status !== 0) errors.push(`Radar history smoke test first merge failed: ${first.stderr || first.stdout}`);

  const second = spawnSync(process.execPath, [mergeArchivePath, "--current", currentTwoPath, "--existing", archiveOnePath, "--output", archiveTwoPath, "--snapshot-key", "radar/archive/2026/08/27/01-15-00-2-1.json"], { encoding: "utf8" });
  if (second.status !== 0) {
    errors.push(`Radar history smoke test second merge failed: ${second.stderr || second.stdout}`);
  } else {
    const archive = JSON.parse(readFileSync(archiveTwoPath, "utf8"));
    const repeated = archive.signals.find((item) => item.headline === "Fixture signal");
    if (archive.signalCount !== 2 || archive.snapshotCount !== 2) errors.push("Radar history smoke test counts are incorrect");
    if (!repeated || repeated.seenCount !== 2 || repeated.firstSeenAt !== currentOne.generatedAt || repeated.lastSeenAt !== currentTwo.generatedAt) {
      errors.push("Radar history smoke test deduplication fields are incorrect");
    }
  }
} finally {
  rmSync(temp, { recursive: true, force: true });
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Radar validation passed: ${data.signals.length} editorial signals, scheduled discovery ingestion, immutable refresh history, daily deduplicated archives, direct R2 delivery, 24-hour stale tolerance and guarded Worker deployment.`);
