import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, normalize, relative } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = fileURLToPath(new URL("../", import.meta.url));
const origin = "https://www.galok.me";
const errors = [];
const warnings = [];

function walk(dir, predicate) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if ([".git", "node_modules"].includes(entry.name)) return [];
    const full = join(dir, entry.name);
    return entry.isDirectory() ? walk(full, predicate) : predicate(full) ? [full] : [];
  });
}

function name(file) {
  return relative(root, file).replaceAll("\\", "/");
}

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function attr(tag, attribute) {
  return tag.match(new RegExp(`\\b${attribute}=["']([^"']*)["']`, "i"))?.[1] ?? "";
}

function isNoindex(html) {
  return /<meta\b[^>]*\bname=["']robots["'][^>]*\bcontent=["'][^"']*\bnoindex\b/i.test(html);
}

function canonical(html) {
  const tags = html.match(/<link\b[^>]*\brel=["']canonical["'][^>]*>/gi) ?? [];
  return tags.length === 1 ? attr(tags[0], "href") : "";
}

function localTarget(raw) {
  if (!raw || /^(?:#|mailto:|tel:|javascript:|data:)/i.test(raw)) return null;
  let url;
  try { url = new URL(raw, origin); }
  catch { return { invalid: true }; }
  if (url.origin !== origin) return null;
  const pathname = decodeURIComponent(url.pathname);
  if (pathname.includes("..")) return { invalid: true };
  const relativePath = pathname.replace(/^\/+/, "");
  if (!relativePath) return join(root, "index.html");
  if (extname(relativePath)) return join(root, relativePath);
  return join(root, relativePath, "index.html");
}

function textOnly(markup) {
  return markup.replace(/<[^>]+>/g, " ").replace(/&(?:nbsp|amp|quot|#39);/g, " ").replace(/\s+/g, " ").trim();
}

const htmlFiles = walk(root, (file) => file.endsWith(".html"));
const indexed = [];
const inbound = new Map();
const canonicals = new Map();
let localReferences = 0;

for (const file of htmlFiles) {
  const source = name(file);
  const html = readFileSync(file, "utf8");
  const noindex = isNoindex(html);
  if (!noindex) indexed.push({ file, source, html });

  const pageCanonical = canonical(html);
  if (!pageCanonical) errors.push(`${source}: missing or duplicate canonical`);
  else if (!noindex) {
    const prior = canonicals.get(pageCanonical);
    if (prior) errors.push(`${source}: duplicate indexable canonical also used by ${prior}`);
    canonicals.set(pageCanonical, source);
  }

  for (const match of html.matchAll(/<(?:a|link|script|img|source|video|audio|form)\b[^>]*\b(?:href|src|poster|action)=["']([^"']+)["'][^>]*>/gi)) {
    const raw = match[1];
    const target = localTarget(raw);
    if (!target) continue;
    localReferences += 1;
    if (target.invalid || !existsSync(target)) {
      errors.push(`${source}: missing local target ${raw}`);
      continue;
    }
    if (/^\//.test(raw)) {
      const route = new URL(raw, origin).pathname;
      inbound.set(route, (inbound.get(route) || 0) + 1);
    }
  }

  for (const image of html.match(/<img\b[^>]*>/gi) ?? []) {
    if (!/\balt=["']/i.test(image)) errors.push(`${source}: image without alt`);
  }
  for (const button of html.match(/<button\b[^>]*>[\s\S]*?<\/button>/gi) ?? []) {
    const opening = button.match(/^<button\b[^>]*>/i)?.[0] ?? "";
    const labelled = /\baria-label(?:ledby)?=["'][^"']+/.test(opening) || /\btitle=["'][^"']+/.test(opening) || textOnly(button.replace(opening, "")).length > 0 || /<img\b[^>]*\balt=["'][^"']+/.test(button);
    if (!labelled) errors.push(`${source}: button without accessible name`);
  }
  if (/aria-current=["']false["']/i.test(html)) errors.push(`${source}: inactive control retains aria-current`);
  if (/\b(?:TODO|FIXME)\b/i.test(html)) warnings.push(`${source}: production markup contains TODO/FIXME`);
  if (/\b(?:lorem ipsum|internal draft)\b/i.test(html)) warnings.push(`${source}: production markup contains placeholder or draft wording`);

  for (const preload of html.match(/<link\b[^>]*\brel=["']preload["'][^>]*>/gi) ?? []) {
    if (attr(preload, "as") !== "image") continue;
    const href = attr(preload, "href");
    const image = (html.match(new RegExp(`<img\\b[^>]*\\bsrc=["']${href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]*>`, "i")) ?? [])[0];
    if (image && (!/\bwidth=["']\d+/.test(image) || !/\bheight=["']\d+/.test(image))) warnings.push(`${source}: preloaded hero image lacks dimensions`);
  }
}

const aliases = [
  ["archive/index.html", "/index/"],
  ["be-a-viewer/index.html", "/cities/"],
  ["notes/index.html", "/essays/"],
  ["views/index.html", "/essays/"],
  ["works/index.html", "/work/"],
  ["series/macro/index.html", "/essays/"],
  ["series/scene/index.html", "/essays/"],
  ["series/frame/index.html", "/essays/"]
];
for (const [path, target] of aliases) {
  const html = read(path);
  if (!isNoindex(html)) errors.push(`${path}: redirect alias must be noindex`);
  if (canonical(html) !== `${origin}${target}`) errors.push(`${path}: canonical must resolve to ${target}`);
}

const sandbox = { window: {} };
vm.runInNewContext(read("content.js"), sandbox);
const content = sandbox.window.GALOK_CONTENT;
if (!content?.site?.primaryNav || !Array.isArray(content.essays) || !Array.isArray(content.research) || !Array.isArray(content.cities)) {
  errors.push("content.js: site, essays, research and cities are required canonical collections");
}

function unique(items, key, label) {
  const seen = new Set();
  for (const item of items) {
    const value = item[key];
    if (!value) errors.push(`content.js: ${label} is missing ${key}`);
    else if (seen.has(value)) errors.push(`content.js: duplicate ${label} ${key} ${value}`);
    else seen.add(value);
  }
}

unique(content.essays, "issue", "essay issue");
unique(content.essays, "title", "essay title");
unique(content.essays, "url", "essay URL");
unique(content.research, "issue", "research issue");
unique(content.research, "title", "research title");
unique(content.research, "url", "research URL");
unique(content.cities, "slug", "city slug");

const primaryHrefs = content.site.primaryNav.map((link) => link.href);
for (const { source, html } of indexed) {
  if (!/<nav\b[^>]*\bclass=["'][^"']*\bsite-nav\b/i.test(html)) continue;
  const nav = html.match(/<div\b[^>]*\bclass=["'][^"']*\bnav-links\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)?.[1] ?? "";
  const hrefs = [...nav.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/gi)].map((match) => match[1]);
  if (JSON.stringify(hrefs) !== JSON.stringify(primaryHrefs)) errors.push(`${source}: primary nav diverges from content.js`);
}
const footerHrefs = content.site.footer.menu.map((link) => link.href);
for (const file of htmlFiles) {
  const source = name(file);
  const html = readFileSync(file, "utf8");
  if (!/\bfield-footer\b/.test(html)) continue;
  const menu = html.match(/<span>Menu<\/span>([\s\S]*?)<\/div>/i)?.[1] ?? "";
  const hrefs = [...menu.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/gi)].map((match) => match[1]);
  if (JSON.stringify(hrefs) !== JSON.stringify(footerHrefs)) errors.push(`${source}: field footer diverges from content.js`);
}

for (const essay of content.essays) {
  for (const field of ["title", "date", "readingTime", "series", "issue", "url", "cover"]) if (!essay[field]) errors.push(`content.js: essay ${essay.title || "(untitled)"} is missing ${field}`);
  const target = localTarget(essay.url);
  if (!target || !existsSync(target)) errors.push(`content.js: essay route missing ${essay.url}`);
  if (essay.cover?.src && !existsSync(localTarget(essay.cover.src))) errors.push(`content.js: essay cover missing ${essay.cover.src}`);
}
for (const paper of content.research) {
  for (const field of ["code", "title", "date", "classification", "method", "field", "url", "cover"]) if (!paper[field]) errors.push(`content.js: research ${paper.title || "(untitled)"} is missing ${field}`);
  if (!existsSync(localTarget(paper.url))) errors.push(`content.js: research route missing ${paper.url}`);
  if (paper.cover?.src && !existsSync(localTarget(paper.cover.src))) errors.push(`content.js: research cover missing ${paper.cover.src}`);
}
for (const city of content.cities.filter((item) => item.href)) {
  if (!existsSync(localTarget(city.href))) errors.push(`content.js: city route missing ${city.href}`);
}

const essayPages = indexed.filter(({ source }) => source.startsWith("essays/") && source !== "essays/index.html");
if (essayPages.length !== content.essays.length) errors.push(`content.js: ${content.essays.length} essays, but ${essayPages.length} indexable essay pages`);
const researchPages = indexed.filter(({ source }) => source.startsWith("research/") && source !== "research/index.html");
if (researchPages.length !== content.research.length) errors.push(`content.js: ${content.research.length} research papers, but ${researchPages.length} indexable research pages`);
const openCityCount = content.cities.filter((city) => city.href).length;
const cityPages = indexed.filter(({ source }) => /^be-a-viewer\/[^/]+\/index\.html$/.test(source));
if (cityPages.length !== openCityCount) errors.push(`content.js: ${openCityCount} open cities, but ${cityPages.length} indexable city pages`);

const researchIndex = read("research/index.html");
const normalizedResearchIndex = textOnly(researchIndex).toLowerCase();
for (const paper of content.research) {
  for (const value of [paper.url, paper.code, paper.title, paper.subtitle, paper.field]) {
    const haystack = value.startsWith("/") ? researchIndex.toLowerCase() : normalizedResearchIndex;
    const needle = value.startsWith("/") ? value.toLowerCase() : textOnly(value).toLowerCase();
    if (!haystack.includes(needle)) errors.push(`research/index.html: ${paper.code} has drifted from content.js (${value})`);
  }
}

for (const route of ["/research/", "/data/", "/design/", "/themes/", "/postcards/", "/visual-notes/"]) {
  if (!inbound.get(route)) errors.push(`${route}: core page has no internal entry`);
}

const cssFiles = walk(root, (file) => file.endsWith(".css"));
for (const file of cssFiles) {
  const source = name(file);
  const css = readFileSync(file, "utf8");
  for (const match of css.matchAll(/url\(([^)]+)\)/g)) {
    const raw = match[1].trim().replace(/^['"]|['"]$/g, "");
    const target = localTarget(raw);
    if (target && !target.invalid && !existsSync(target)) errors.push(`${source}: missing CSS asset ${raw}`);
  }
}

if (errors.length) console.error(errors.map((item) => `ERROR ${item}`).join("\n"));
if (warnings.length) console.warn(warnings.map((item) => `WARNING ${item}`).join("\n"));
if (errors.length) process.exit(1);

console.log(`Publishing validation passed: ${indexed.length} indexable pages, ${content.essays.length} essays, ${content.research.length} research papers, ${openCityCount} open cities, ${localReferences} local references.`);
