import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const articleRoot = join(root, "research", "fast-metabolism-economy");
const sourcePath = join(root, "_research-source", "fast-metabolism-economy.md");
const pagePath = join(articleRoot, "index.html");
const coverPath = join(root, "assets", "research", "research-002-cover.jpg");
const replicationPath = join(articleRoot, "downloads", "GALOK_RESEARCH_002_REPLICATION_PACKAGE_v1_0.zip");
const dataRoot = join(root, "data", "research-002");
const errors = [];

function hash(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function fail(condition, message) {
  if (condition) errors.push(message);
}

const source = readFileSync(sourcePath, "utf8");
const page = readFileSync(pagePath, "utf8");
const chartsJs = readFileSync(join(articleRoot, "charts.js"), "utf8");
const chartsCss = readFileSync(join(articleRoot, "charts.css"), "utf8");
const headline = JSON.parse(readFileSync(join(dataRoot, "headline.json"), "utf8"));
const quadrants = JSON.parse(readFileSync(join(dataRoot, "quadrants.json"), "utf8"));
const lifecycle = JSON.parse(readFileSync(join(dataRoot, "brand-lifecycle.json"), "utf8"));
const franchise = JSON.parse(readFileSync(join(dataRoot, "franchise-association.json"), "utf8"));

fail(hash(sourcePath) !== "efd3a8971bbaaf2a8261d27353aff5f9413a4ada35423db7d1c8d3682a4ba346", "Frozen Research 002 manuscript hash changed");
fail(hash(coverPath) !== "6dc193a5fa21e6a8c0a73802fde560327cbd75187176fcce89d6e96b2fbe8541", "Official Research 002 cover hash changed");
fail(hash(replicationPath) !== "cf953de19862bd23c55cda117391a5d1a58a58f9e5cd92f61c9be5191db496a4", "Replication package hash changed");

fail(!page.includes('<link rel="canonical" href="https://www.galok.me/research/fast-metabolism-economy/">'), "Research 002 canonical is missing or incorrect");
fail(!page.includes('"@type":"ScholarlyArticle"'), "Research 002 ScholarlyArticle metadata missing");
fail(!page.includes("GALOK RESEARCH 002"), "Research 002 series identity missing");
fail(!page.includes("Final v1.0"), "Research 002 final status missing");
fail(!page.includes("research-002-cover.jpg"), "Official cover is not integrated");
fail(!page.includes("GALOK_RESEARCH_002_REPLICATION_PACKAGE_v1_0.zip"), "Replication download is not linked");
fail(!page.includes('class="r002-quadrant-key"'), "Figure 3 responsive quadrant key is missing");
fail(!page.includes("charts.css?v=20260822c") || !page.includes("charts.js?v=20260822c"), "Research 002 chart assets are not cache-busted");
fail(!chartsJs.includes("window.setTimeout(hideTip,2200)"), "Touch tooltips must auto-dismiss on Research 002");
fail(!chartsJs.includes('document.addEventListener("scroll",hideTip,true)'), "Research 002 tooltips must dismiss on scroll");
fail(!chartsCss.includes("@container (max-width: 900px)"), "Figure 6 tablet card reflow is missing");

let previousFigure = -1;
for (let number = 1; number <= 7; number += 1) {
  const id = `id="figure-${number}"`;
  const position = page.indexOf(id);
  fail(position < 0, `Missing Figure ${number}`);
  fail(position <= previousFigure, `Figure ${number} is out of publication order`);
  fail((page.match(new RegExp(id, "g")) || []).length !== 1, `Figure ${number} must appear exactly once`);
  previousFigure = position;
}

fail(/<pre><code>[\s\S]*?r002-/.test(page), "Research 002 figure markup is escaped inside a code block");
fail(/&lt;(?:div|span|section) class=&quot;r002-/.test(page), "Research 002 contains escaped figure HTML");
fail(/<h2 id="[^"]+">\s*<ol/.test(page), "Research 002 numbered section heading was parsed as a list");
fail(!page.includes('class="math display"'), "Research 002 display equations were not rendered as math");

for (const id of [
  "hero-net", "hero-mmr", "hero-dots", "g-begin", "g-open", "g-close", "g-end",
  "quadrant-chart", "life-groups", "franchise-chart", "brand-cards", "taxonomy", "tax-question",
]) fail(!page.includes(`id="${id}"`), `Missing live chart mount #${id}`);

for (const id of [
  "introduction", "literature-conceptual-framework", "data-and-measurement", "empirical-results",
  "administrative-evidence", "discussion", "conclusion", "data-and-code-availability", "references", "appendix-a",
]) fail(!page.includes(`id="${id}"`), `Missing section anchor #${id}`);

fail(headline.conservative_core.mmr_pct !== 25.2, "Conservative MMR must be 25.2%");
fail(headline.conservative_core.net_growth_pct !== 17.3, "Conservative net growth must be 17.3%");
fail(headline.expanded_final_issuer.mmr_pct !== 34.5, "Expanded MMR must be 34.5%");
fail(headline.expanded_final_issuer.net_growth_pct !== 25.5, "Expanded net growth must be 25.5%");
fail(quadrants.n !== 20 || quadrants.observations.length !== 20, "Figure 3 must contain N=20 real observations");
fail(Number(quadrants.median_mmr_pct.toFixed(1)) !== 29.1, "Figure 3 median MMR must display as 29.1%");
fail(lifecycle.canonical_brands !== 186 || lifecycle.brands.length !== 186, "Figure 4 must contain the 186-brand matrix");
fail(lifecycle.brand_year_presences !== 400, "Figure 4 must contain 400 brand-year presences");
fail(franchise.n !== 22 || franchise.rows.length !== 22, "Figure 5 must contain N=22 matched observations");
fail(franchise.partial_r_controlling_log_initial_size !== -0.058, "Figure 5 partial correlation must be −0.058");

for (const retired of ["32.5%", "N=18", "26.8%", "24 complete gross-flow observations"]) {
  fail(page.includes(retired), `Retired result is visible in the paper: ${retired}`);
}

for (const raw of [...page.matchAll(/\b(?:src|href)="(\/[^\"]+)"/g)].map((match) => match[1])) {
  const pathOnly = raw.split(/[?#]/)[0];
  if (pathOnly === "/") continue;
  const local = resolve(root, `.${pathOnly}`);
  const candidates = [local, join(local, "index.html")];
  fail(!candidates.some((candidate) => existsSync(candidate) && statSync(candidate).isFile()), `Missing local resource: ${pathOnly}`);
}

for (const href of [...page.matchAll(/\bhref="(#[^"]+)"/g)].map((match) => match[1])) {
  fail(!page.includes(`id="${href.slice(1)}"`), `Broken paper anchor: ${href}`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("Research 002 validation passed: frozen manuscript, official cover, 7 ordered figures, final data, metadata, links and replication package.");
