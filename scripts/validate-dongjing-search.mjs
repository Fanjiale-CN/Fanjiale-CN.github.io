import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const dossierRoot = join(root, "reading", "dongjing-meng-hua-lu");
const prefix = "https://www.galok.me/reading/dongjing-meng-hua-lu/";
const requiredEntries = Array.from({ length: 51 }, (_, index) => String(index + 1).padStart(2, "0"));
const errors = [];

function htmlFor(relativePath) {
  const path = join(root, relativePath);
  if (!existsSync(path)) {
    errors.push(`missing ${relativePath}`);
    return "";
  }
  return readFileSync(path, "utf8");
}

function assertIndexable(relativePath, canonical) {
  const html = htmlFor(relativePath);
  if (!html) return;
  if (/name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html)) errors.push(`${relativePath}: still noindex`);
  if (!/name=["']robots["'][^>]+content=["']index\s*,\s*follow["']/i.test(html)) errors.push(`${relativePath}: missing index,follow`);
  if (!html.includes(`href="${canonical}"`) && !html.includes(`href='${canonical}'`)) errors.push(`${relativePath}: canonical mismatch`);
}

assertIndexable("reading/dongjing-meng-hua-lu/index.html", prefix);
for (const entry of requiredEntries) assertIndexable(`reading/dongjing-meng-hua-lu/${entry}/index.html`, `${prefix}${entry}/`);

const generatorPaths = ["reading/gen-v6.cjs", "reading/dongjing-45-51-gen.cjs"];
for (const relativePath of generatorPaths) {
  const text = htmlFor(relativePath);
  if (/noindex\s*,\s*follow/.test(text)) errors.push(`${relativePath}: can regenerate noindex pages`);
}

const indexableRoutes = [prefix];
for (const entry of readdirSync(dossierRoot, { withFileTypes: true })) {
  if (!entry.isDirectory() || !/^\d{2}$/.test(entry.name)) continue;
  const path = join(dossierRoot, entry.name, "index.html");
  if (!existsSync(path)) continue;
  const html = readFileSync(path, "utf8");
  if (/name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html)) continue;
  indexableRoutes.push(`${prefix}${entry.name}/`);
}
indexableRoutes.sort();

const focusedPath = join(root, "sitemap-dongjing.xml");
if (!existsSync(focusedPath)) {
  errors.push("missing sitemap-dongjing.xml");
} else {
  const focused = readFileSync(focusedPath, "utf8");
  const urls = [...focused.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]).sort();
  const expected = [...new Set(indexableRoutes)].sort();
  if (urls.length !== new Set(urls).size) errors.push("sitemap-dongjing.xml: duplicate URLs");
  if (JSON.stringify(urls) !== JSON.stringify(expected)) {
    errors.push(`sitemap-dongjing.xml: expected ${expected.length} exact Dongjing URLs, found ${urls.length}`);
  }
}

const feedPath = join(root, "feed.xml");
if (existsSync(feedPath)) {
  const feed = readFileSync(feedPath, "utf8");
  if (/https:\/\/www\.galok\.me\/reading\/dongjing-meng-hua-lu\/\d{2}\//.test(feed)) errors.push("feed.xml: numbered Dongjing chapters leaked into RSS");
}

const hub = htmlFor("reading/dongjing-meng-hua-lu/index.html");
if (hub && !hub.includes("Ten volumes. Fifty-one entries live.")) errors.push("Dongjing hub: live-entry count is stale");

if (errors.length) {
  console.error("Dongjing search validation failed:\n- " + errors.join("\n- "));
  process.exit(1);
}

console.log(`Dongjing search validation passed: ${indexableRoutes.length} focused sitemap URLs, ${requiredEntries.length} required public entries, RSS chapters excluded.`);
