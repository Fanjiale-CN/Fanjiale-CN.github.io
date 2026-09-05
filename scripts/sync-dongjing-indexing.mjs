import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const checkOnly = process.argv.includes("--check");
const dossierRoot = join(root, "reading", "dongjing-meng-hua-lu");
const targetEntries = Array.from({ length: 51 }, (_, index) => String(index + 1).padStart(2, "0"));
const targetFiles = [join(dossierRoot, "index.html"), ...targetEntries.map((entry) => join(dossierRoot, entry, "index.html"))];
const generatorFiles = [join(root, "reading", "gen-v6.cjs"), join(root, "reading", "dongjing-45-51-gen.cjs")];
const canonicalPrefix = "https://www.galok.me/reading/dongjing-meng-hua-lu/";

function fail(message) {
  console.error(`DONGJING INDEXING: ${message}`);
  process.exitCode = 1;
}

function writeIfChanged(path, before, after) {
  if (before === after) return false;
  if (checkOnly) {
    fail(`${path.slice(root.length + 1)} is not synchronized`);
    return false;
  }
  writeFileSync(path, after);
  return true;
}

function indexHtml(path, expectedCanonical) {
  if (!existsSync(path)) {
    fail(`missing ${path.slice(root.length + 1)}`);
    return false;
  }
  const before = readFileSync(path, "utf8");
  let after = before.replace(/<meta\s+name=["']robots["']\s+content=["']noindex\s*,\s*follow["']\s*\/?>/i, '<meta name="robots" content="index,follow">');
  if (/name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(after)) {
    fail(`${path.slice(root.length + 1)} still contains noindex`);
  }
  if (!new RegExp(`<link[^>]+rel=["']canonical["'][^>]+href=["']${expectedCanonical.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`, "i").test(after)) {
    fail(`${path.slice(root.length + 1)} canonical does not match ${expectedCanonical}`);
  }
  if (!/name=["']robots["'][^>]+content=["']index\s*,\s*follow["']/i.test(after)) {
    fail(`${path.slice(root.length + 1)} is missing explicit index,follow`);
  }
  return writeIfChanged(path, before, after);
}

let changed = 0;
changed += Number(indexHtml(targetFiles[0], canonicalPrefix));
for (const entry of targetEntries) {
  changed += Number(indexHtml(join(dossierRoot, entry, "index.html"), `${canonicalPrefix}${entry}/`));
}

const hubPath = targetFiles[0];
if (existsSync(hubPath)) {
  const before = readFileSync(hubPath, "utf8");
  let after = before.replace(/Ten volumes\. Thirty-four entries live\./g, "Ten volumes. Fifty-one entries live.");
  after = after.replace(
    /Volumes I–II establish the city frame and street economy\. Volume III is complete: specialists, institutions, sacred-commercial space, retail, freight, money, labor, fire safety, dawn supply and household-scale service\. Volume IV has moved from court movement into the rental city: the uniformed services, two weddings, the empress's palanquin, funeral tariffs, the morning hiring pool and the banquet bureaus\./g,
    "Volumes I–VI now reconstruct the city from walls and waterways through streets, markets, food, labor, court ritual, social life and the New Year-to-Lantern festival calendar. Volume VII is queued for Qingming, gardens and imperial spectacle."
  );
  if (!after.includes("Ten volumes. Fifty-one entries live.")) fail("Reading Room live-entry count is stale");
  changed += Number(writeIfChanged(hubPath, before, after));
}

for (const path of generatorFiles) {
  if (!existsSync(path)) {
    fail(`missing generator ${path.slice(root.length + 1)}`);
    continue;
  }
  const before = readFileSync(path, "utf8");
  const after = before.replace(/content=["']noindex\s*,\s*follow["']/g, 'content="index,follow"');
  if (/content=["']noindex\s*,\s*follow["']/.test(after)) fail(`${path.slice(root.length + 1)} can regenerate noindex pages`);
  changed += Number(writeIfChanged(path, before, after));
}

if (!process.exitCode) {
  console.log(checkOnly
    ? `Dongjing indexing verified: hub + ${targetEntries.length} entries are public and generators preserve indexability.`
    : `Dongjing indexing synchronized: ${changed} files changed across hub, ${targetEntries.length} entries and generators.`);
}
