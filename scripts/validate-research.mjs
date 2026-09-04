import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const sourcePath = join(root, "_research-source", "who-captures-growth-full-paper.md");
const pagePath = join(root, "research", "who-captures-growth", "index.html");
const expectedHash = "74f0cc21e815a5c2baaa1315d3f22c56a9a3ac41db1617200c318ee916e8fc42";
const errors = [];

function fail(condition, message) {
  if (condition) errors.push(message);
}

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === ".git") return [];
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

const source = readFileSync(sourcePath, "utf8");
const page = readFileSync(pagePath, "utf8");
const hash = createHash("sha256").update(source.replace(/\r\n/g, "\n")).digest("hex");

fail(hash !== expectedHash, `Canonical paper hash changed: ${hash}`);
fail((source.match(/^\\\[$/gm) || []).length !== 67, "Canonical paper must contain 67 display-math openings");
fail((source.match(/^\\\]$/gm) || []).length !== 67, "Canonical paper must contain 67 display-math closings");
fail((page.match(/class="math display"/g) || []).length !== 67, "Rendered paper must contain 67 display equations");

for (let number = 1; number <= 7; number += 1) {
  fail(!page.includes(`id="figure-${number}"`), `Missing Figure ${number}`);
  fail(!source.includes(`codex:chart id="fig-${number}"`), `Canonical source missing Figure ${number} marker`);
}
for (let number = 1; number <= 6; number += 1) {
  fail(!page.includes(`Table ${number}.`), `Missing Table ${number}`);
}

const requiredIds = ["introduction", "stylized-facts", "literature-review", "conceptual-framework", "data-and-measurement", "empirical-strategy", "labor-institutions", "original-results", "robustness", "mechanisms", "policy-interpretation", "conclusion", "data-and-reproducibility", "references"];
for (const id of requiredIds) fail(!page.includes(`id="${id}"`), `Missing section anchor #${id}`);

const canonical = page.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
fail(canonical !== "https://www.galok.me/research/who-captures-growth/", `Unexpected canonical: ${canonical}`);
for (const field of ["og:title", "og:description", "og:image", "twitter:card"]) {
  fail(!page.includes(`content=`) || !page.includes(field), `Missing metadata ${field}`);
}
fail(!page.includes('"@type":"ScholarlyArticle"'), "Missing ScholarlyArticle structured data");
fail(!page.includes("Final v1.0"), "Final v1.0 status missing");
fail(!page.includes("GALOK RESEARCH 001"), "Series label missing");
fail(!page.includes('<html lang="en" class="research-paper-root">'), "Research 001 root overflow containment is missing");
fail(!page.includes("research.css?v=20260822f"), "Research 001 paper styles are not cache-busted");
fail(!page.includes("galok-wave.css?v=20260822-research-ipad") || !page.includes("galok-wave.js?v=20260822-research-ipad"), "Research 001 tablet wave assets are missing");
fail(!page.includes('class="research-wave-toc gwn gwn--research gwn--tablet"'), "Research 001 tablet wave contents are missing");

const articleDirectory = join(root, "research", "who-captures-growth");
const allowedData = new Set([
  "figure-1-growth.json", "figure-2-finance.json", "figure-3-robots.json",
  "figure_4_employment_specifications.json", "figure_5_household_composition.json",
  "figure_6_job_security_worker_fe.json", "figure_7_instrument_balance.json",
]);
for (const file of readdirSync(join(articleDirectory, "data"))) {
  fail(!allowedData.has(file), `Unapproved public data file: ${file}`);
  const payload = JSON.parse(readFileSync(join(articleDirectory, "data", file), "utf8"));
  const keys = JSON.stringify(payload).toLowerCase();
  for (const forbidden of ["\"pid\"", "\"fid\"", "countyid", "citycode", "prefecture_code", "person_id", "household_id"]) {
    fail(keys.includes(forbidden), `${file} contains restricted identifier key ${forbidden}`);
  }
}

const forbiddenExtensions = new Set([".dta", ".sav", ".pkl", ".parquet"]);
for (const file of walk(root)) fail(forbiddenExtensions.has(extname(file).toLowerCase()), `Forbidden microdata file: ${file}`);

const ids = new Set([...page.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
for (const href of [...page.matchAll(/\bhref="([^"]+)"/g)].map((match) => match[1])) {
  if (href.startsWith("#")) fail(!ids.has(href.slice(1)), `Broken article anchor: ${href}`);
  if (/^https?:/i.test(href)) {
    try { new URL(href); } catch { errors.push(`Invalid external URL: ${href}`); }
  }
}

for (const src of [...page.matchAll(/\b(?:src|href)="(\/[^"]+)"/g)].map((match) => match[1])) {
  const pathOnly = src.split(/[?#]/)[0];
  if (pathOnly === "/") continue;
  const local = resolve(root, `.${pathOnly}`);
  const candidates = [local, join(local, "index.html")];
  fail(!candidates.some((candidate) => existsSync(candidate) && statSync(candidate).isFile()), `Missing local resource: ${pathOnly}`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("Research validation passed: canonical source, 7 figures, 6 tables, 67 display equations, metadata, links and CFPS boundary.");
