import { readFileSync, readdirSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const canonicalOrigin = "https://www.galok.me";
const errors = [];

function walk(dir, predicate) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if ([".git", "node_modules", "pagefind"].includes(entry.name)) continue;
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(fullPath, predicate));
    else if (predicate(fullPath)) files.push(fullPath);
  }
  return files;
}

function publicPath(file) {
  return relative(root, file).replaceAll("\\", "/");
}

const aliases = new Map([
  ["about.html", "/about/"],
  ["archive/index.html", "/index/"],
  ["be-a-viewer/index.html", "/cities/"],
  ["notes/index.html", "/essays/"],
  ["series/frame/index.html", "/essays/"],
  ["series/macro/index.html", "/essays/"],
  ["series/scene/index.html", "/essays/"],
  ["views/index.html", "/essays/"],
  ["works/index.html", "/work/"],
]);

function expectedCanonical(file) {
  if (aliases.has(file)) return `${canonicalOrigin}${aliases.get(file)}`;
  if (file === "index.html") return `${canonicalOrigin}/`;
  if (file === "404.html") return `${canonicalOrigin}/404.html`;
  if (file.endsWith("/index.html")) return `${canonicalOrigin}/${file.slice(0, -"index.html".length)}`;
  return `${canonicalOrigin}/${file}`;
}

function checkInternalUrl(raw, source) {
  if (/^(?:mailto:|tel:|javascript:|#)/i.test(raw)) return;
  let url;
  try {
    url = new URL(raw, canonicalOrigin);
  } catch {
    errors.push(`${source}: invalid URL ${raw}`);
    return;
  }
  if (!/(^|\.)galok\.me$/i.test(url.hostname)) return;
  if (/^https?:/i.test(raw) && url.origin !== canonicalOrigin) {
    errors.push(`${source}: non-canonical site origin ${raw}`);
  }
  const pathname = url.pathname;
  if (pathname.includes("/index.html")) errors.push(`${source}: index.html link ${raw}`);
  if (pathname.endsWith(".html")) errors.push(`${source}: .html link ${raw}`);
  if (pathname !== "/" && !pathname.endsWith("/") && !extname(pathname)) {
    errors.push(`${source}: directory link without trailing slash ${raw}`);
  }
}

const htmlFiles = walk(root, (file) => file.endsWith(".html"));
const indexableCanonicals = new Set();

for (const file of htmlFiles) {
  const name = publicPath(file);
  const html = readFileSync(file, "utf8");
  const canonicalTags = html.match(/<link\b[^>]*\brel=["']canonical["'][^>]*>/gi) ?? [];
  if (canonicalTags.length !== 1) {
    errors.push(`${name}: expected one canonical tag, found ${canonicalTags.length}`);
  } else {
    const href = canonicalTags[0].match(/\bhref=["']([^"']+)["']/i)?.[1];
    const expected = expectedCanonical(name);
    if (href !== expected) errors.push(`${name}: canonical ${href ?? "missing"}; expected ${expected}`);
    if (!/<meta\b[^>]*\bname=["']robots["'][^>]*\bcontent=["'][^"']*noindex/i.test(html)) {
      indexableCanonicals.add(href);
    }
  }

  for (const match of html.matchAll(/<(?:a|form)\b[^>]*\b(?:href|action)=["']([^"']+)["'][^>]*>/gi)) {
    checkInternalUrl(match[1], name);
  }
}

for (const file of walk(root, (candidate) => candidate.endsWith(".js"))) {
  const name = publicPath(file);
  const script = readFileSync(file, "utf8");
  for (const match of script.matchAll(/["'](\/[^"'\s]*)["']/g)) checkInternalUrl(match[1], name);
}

const sitemap = readFileSync(join(root, "sitemap.xml"), "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const sitemapSet = new Set(sitemapUrls);
if (sitemapSet.size !== sitemapUrls.length) errors.push("sitemap.xml: duplicate URLs");

for (const url of sitemapUrls) {
  if (!url.startsWith(`${canonicalOrigin}/`)) errors.push(`sitemap.xml: non-canonical origin ${url}`);
  const pathname = new URL(url).pathname;
  if (pathname.includes("index.html") || pathname.endsWith(".html")) errors.push(`sitemap.xml: HTML filename ${url}`);
  if (pathname !== "/" && !pathname.endsWith("/")) errors.push(`sitemap.xml: missing trailing slash ${url}`);
}

for (const canonical of indexableCanonicals) {
  if (!sitemapSet.has(canonical)) errors.push(`sitemap.xml: missing indexable canonical ${canonical}`);
}
for (const url of sitemapSet) {
  if (!indexableCanonicals.has(url)) errors.push(`sitemap.xml: URL is not an indexable canonical ${url}`);
}

const cname = readFileSync(join(root, "CNAME"), "utf8").trim();
if (cname !== "www.galok.me") errors.push(`CNAME: expected www.galok.me, found ${cname}`);

const robots = readFileSync(join(root, "robots.txt"), "utf8");
if (!robots.includes(`Sitemap: ${canonicalOrigin}/sitemap.xml`)) {
  errors.push("robots.txt: canonical sitemap URL missing");
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`SEO validation passed: ${htmlFiles.length} HTML files, ${sitemapUrls.length} sitemap URLs.`);
