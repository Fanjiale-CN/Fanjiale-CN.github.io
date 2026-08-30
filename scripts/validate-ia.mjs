import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = fileURLToPath(new URL("../", import.meta.url));
const errors = [];
const expectedNav = ["/cities/", "/essays/", "/radar/", "/research/", "/data/", "/reading/", "/work/", "/index/", "/about/"];

function walk(dir, predicate) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if ([".git", "node_modules"].includes(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full, predicate));
    else if (predicate(full)) files.push(full);
  }
  return files;
}

function name(file) {
  return relative(root, file).replaceAll("\\", "/");
}

const htmlFiles = walk(root, (file) => file.endsWith(".html"));
let navPages = 0;
for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  if (!/<nav\b[^>]*\bclass=["'][^"']*site-nav/.test(html)) continue;
  navPages += 1;
  const block = html.match(/<div class=["']nav-links["']>([\s\S]*?)<\/div>/)?.[1] ?? "";
  const hrefs = [...block.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/g)].map((match) => match[1]);
  if (JSON.stringify(hrefs) !== JSON.stringify(expectedNav)) {
    errors.push(`${name(file)}: primary navigation is ${hrefs.join(" | ")}`);
  }
  if (name(file).startsWith("research/") && !/<a href=["']\/research\/["'] aria-current=["']page["']>Research<\/a>/.test(block)) {
    errors.push(`${name(file)}: Research is not marked as the current primary section`);
  }
  if (name(file).startsWith("radar/") && !/<a href=["']\/radar\/["'] aria-current=["']page["']>Radar<\/a>/.test(block)) {
    errors.push(`${name(file)}: Radar is not marked as the current primary section`);
  }
}

const script = readFileSync(join(root, "script.js"), "utf8");
const primaryBlock = script.match(/const primaryLinks = \[([\s\S]*?)\n    \];/)?.[1] ?? "";
const runtimeHrefs = [...primaryBlock.matchAll(/href: ["']([^"']+)["']/g)].map((match) => match[1]);
if (JSON.stringify(runtimeHrefs) !== JSON.stringify(expectedNav)) {
  errors.push(`script.js: runtime navigation is ${runtimeHrefs.join(" | ")}`);
}
if (!script.includes('match: "/research/"')) errors.push("script.js: Research route matching is missing");
if (!script.includes('match: "/radar/"')) errors.push("script.js: Radar route matching is missing");

const sandbox = { window: {} };
vm.runInNewContext(readFileSync(join(root, "content.js"), "utf8"), sandbox);
const content = sandbox.window.GALOK_CONTENT;
if (content.essays.length < 1) errors.push("content.js: essay catalogue must not be empty");
const issueSequence = content.essays.map((essay) => essay.issue).sort((a, b) => a - b);
const expectedIssues = Array.from({ length: content.essays.length }, (_, index) => index + 1);
if (JSON.stringify(issueSequence) !== JSON.stringify(expectedIssues)) {
  errors.push(`content.js: essay issues must be a unique 1–${content.essays.length} sequence, found ${issueSequence.join(", ")}`);
}
const curator = content.essays.find((essay) => essay.url === "/essays/the-curators-curse/");
if (curator?.issue !== 1) errors.push(`content.js: The Curator's Curse must remain chronological issue 1`);
const curatorPage = readFileSync(join(root, "essays/the-curators-curse/index.html"), "utf8");
if (!curatorPage.includes("ISSUE 01 / 2026")) errors.push("The Curator's Curse page: issue label must match chronological issue 1");
if (!curatorPage.includes('"datePublished":"2026-05-28"')) errors.push("The Curator's Curse page: publication date must match issue 1 chronology");
const expectedSeries = {
  macro: { en: "View", glyph: "視" },
  frame: { en: "Frame", glyph: "框" },
  scene: { en: "Observe", glyph: "察" },
};
for (const [key, expected] of Object.entries(expectedSeries)) {
  const actual = content.series[key];
  if (actual?.en !== expected.en || actual?.glyph !== expected.glyph) {
    errors.push(`content.js: ${key} must map only to ${expected.en} / ${expected.glyph}`);
  }
}
for (const essay of content.essays) {
  if (essay.anchor !== expectedSeries[essay.series]?.glyph) {
    errors.push(`content.js: ${essay.title} has a non-canonical anchor ${essay.anchor}`);
  }
}

const researchIndex = readFileSync(join(root, "research/index.html"), "utf8");
const researchCards = [...researchIndex.matchAll(/class=["'][^"']*research-index-card\b/g)].length;
if (researchCards !== content.research.length) errors.push(`research/index.html: expected ${content.research.length} research works, found ${researchCards}`);

const archiveScript = readFileSync(join(root, "archive-system.js"), "utf8");
if (/type: ["']Research["'][^\n]+href: ["']\/data\//.test(archiveScript)) {
  errors.push("archive-system.js: Data is still classified as Research");
}

const publicFiles = htmlFiles.filter((file) => !name(file).startsWith("research/")).map((file) => [name(file), readFileSync(file, "utf8")]);
const bannedPhrases = [
  "CURRENT " + "RESEARCH",
  "THE RESEARCH " + "DESK",
  "research " + "issue",
  "eleven " + "essays",
  "势" + "·框·察",
  "Macro / Frame / " + "Scene",
];
for (const [file, html] of publicFiles) {
  for (const phrase of bannedPhrases) if (html.includes(phrase)) errors.push(`${file}: legacy public phrase ${phrase}`);
  if (/data-glyph=["'][势视]["']/.test(html)) errors.push(`${file}: non-canonical View glyph`);
}

const views = readFileSync(join(root, "views/index.html"), "utf8");
if (!views.includes('content="noindex, follow"')) errors.push("views/index.html: noindex, follow is missing");
if (!views.includes('href="https://www.galok.me/essays/"')) errors.push("views/index.html: Essays canonical is missing");
if (!views.includes("window.location.search + window.location.hash")) errors.push("views/index.html: query/hash preservation is missing");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`IA validation passed: ${navPages} primary-nav pages, ${content.essays.length} essays, ${content.research.length} research works, canonical View/Frame/Observe taxonomy.`);
