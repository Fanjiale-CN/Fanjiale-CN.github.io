import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const origin = "https://www.galok.me";
const mediaOrigin = "https://media.galok.me";
const errors = [];

function isAbsolutePublicImage(value) {
  return value.startsWith(`${origin}/`) || value.startsWith(`${mediaOrigin}/`);
}

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if ([".git", "node_modules"].includes(entry.name)) return [];
    const full = join(dir, entry.name);
    if (entry.isDirectory() && full.replaceAll("\\", "/").endsWith("/research/love-by-the-hour/content")) return [];
    return entry.isDirectory() ? walk(full) : entry.name.endsWith(".html") ? [full] : [];
  });
}

function pathOf(file) {
  return relative(root, file).replaceAll("\\", "/");
}

function value(tag, attribute) {
  return tag.match(new RegExp(`\\b${attribute}="([^"]*)"`, "i"))?.[1]
    ?? tag.match(new RegExp(`\\b${attribute}='([^']*)'`, "i"))?.[1]
    ?? "";
}

function meta(html, key, attribute = "name") {
  const tag = (html.match(new RegExp(`<meta\\b[^>]*\\b${attribute}=["']${key}["'][^>]*>`, "gi")) ?? [])[0];
  return tag ? value(tag, "content") : "";
}

function countMeta(html, key, attribute = "name") {
  return (html.match(new RegExp(`<meta\\b[^>]*\\b${attribute}=["']${key}["'][^>]*>`, "gi")) ?? []).length;
}

function canonical(html) {
  const tags = html.match(/<link\b[^>]*\brel=["']canonical["'][^>]*>/gi) ?? [];
  return { count: tags.length, href: tags[0] ? value(tags[0], "href") : "" };
}

function schemas(html, source) {
  const tags = html.match(/<script\b[^>]*\btype=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi) ?? [];
  return tags.map((tag) => {
    const json = tag.replace(/^.*?>/, "").replace(/<\/script>$/i, "").trim();
    try { return JSON.parse(json); }
    catch { errors.push(`${source}: invalid JSON-LD`); return null; }
  }).filter(Boolean);
}

function hasNoindex(html) {
  return /<meta\b[^>]*\bname=["']robots["'][^>]*\bcontent=["'][^"']*\bnoindex\b/i.test(html);
}

function expectedNav(path) {
  if (path === "cities/index.html" || path.startsWith("be-a-viewer/")) return "Cities";
  if (path.startsWith("essays/")) return "Essays";
  if (path.startsWith("radar/")) return "Radar";
  if (path.startsWith("research/")) return "Research";
  if (path === "data/index.html") return "Data";
  if (path === "work/index.html") return "Work";
  if (path === "index/index.html") return "Index";
  if (path === "about/index.html") return "About";
  return null;
}

const all = walk(root);
const publicPages = all.filter((file) => !hasNoindex(readFileSync(file, "utf8")));
const essays = new Set(publicPages.map(pathOf).filter((path) => path.startsWith("essays/") && path !== "essays/index.html"));

for (const file of publicPages) {
  const source = pathOf(file);
  const html = readFileSync(file, "utf8");
  const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1].trim();
  const description = meta(html, "description");
  const canon = canonical(html);
  if (!title) errors.push(`${source}: missing title`);
  if (!description) errors.push(`${source}: missing meta description`);
  if (canon.count !== 1 || !canon.href.startsWith(`${origin}/`)) errors.push(`${source}: needs one absolute canonical`);
  if (/<meta\b[^>]*\bname=["']keywords["'][^>]*>/i.test(html)) errors.push(`${source}: public page still has keywords metadata`);

  for (const field of ["og:title", "og:description", "og:type", "og:url", "og:image"]) {
    if (countMeta(html, field, "property") !== 1) errors.push(`${source}: needs one ${field}`);
  }
  if (meta(html, "og:url", "property") !== canon.href) errors.push(`${source}: og:url must equal canonical`);
  if (!isAbsolutePublicImage(meta(html, "og:image", "property"))) errors.push(`${source}: og:image must be an absolute public URL`);
  for (const field of ["twitter:card", "twitter:title", "twitter:description", "twitter:image"]) {
    if (countMeta(html, field) !== 1) errors.push(`${source}: needs one ${field}`);
  }
  if (!isAbsolutePublicImage(meta(html, "twitter:image"))) errors.push(`${source}: twitter:image must be an absolute public URL`);
  const expectedType = essays.has(source) || source.startsWith("research/") && source !== "research/index.html" ? "article" : "website";
  if (meta(html, "og:type", "property") !== expectedType) errors.push(`${source}: og:type must be ${expectedType}`);

  const skip = html.match(/<a\b[^>]*\bclass=["'][^"']*\bskip-link\b[^"']*["'][^>]*\bhref=["']#([^"']+)["'][^>]*>/i)?.[1];
  if (!skip || !new RegExp(`\\bid=["']${skip}["']`, "i").test(html)) errors.push(`${source}: skip link target is missing`);
  if (!/<main\b[^>]*\btabindex=["']-1["'][^>]*>/i.test(html)) errors.push(`${source}: main needs tabindex=-1 for skip navigation`);
  if (/aria-current=["']location["']/i.test(html)) errors.push(`${source}: static aria-current=location is misleading`);
  if (/aria-current=["']false["']/i.test(html)) errors.push(`${source}: inactive controls must omit aria-current`);

  const nav = html.match(/<div\b[^>]*\bclass=["'][^"']*\bnav-links\b[^"']*["'][^>]*>[\s\S]*?<\/div>/i)?.[0] ?? "";
  const current = [...nav.matchAll(/<a\b[^>]*\baria-current=["']page["'][^>]*>([^<]+)/gi)].map((match) => match[1].trim());
  const expected = expectedNav(source);
  if (expected && (current.length !== 1 || current[0] !== expected)) errors.push(`${source}: nav aria-current should be ${expected}`);
  if (!expected && current.length) errors.push(`${source}: nav should not mark a primary item current`);

  for (const image of html.match(/<img\b[^>]*>/gi) ?? []) {
    if (!/\balt=["']/i.test(image)) errors.push(`${source}: image missing alt`);
  }
  if (/CNNIC figures cited in the Medium draft/i.test(html)) errors.push(`${source}: production draft trace remains`);
}

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

const citiesHtml = read("cities/index.html");
for (const scene of [...citiesHtml.matchAll(/<article\b[^>]*\bdata-archive-reel-scene\b[^>]*>/gi)].slice(1)) {
  if (!/\binert(?:\s|>)/i.test(scene[0])) errors.push("cities/index.html: hidden archive reel scenes must be inert");
}
if (!/scene\.toggleAttribute\(["']inert["'],\s*!isActive\)/.test(read("be-a-viewer/city-archive.js"))) {
  errors.push("city archive: inactive scenes must toggle inert");
}
if (!/else control\.removeAttribute\(["']aria-current["']\)/.test(read("be-a-viewer/city-archive.js"))) {
  errors.push("city archive: inactive controls must omit aria-current");
}
if (!/<button\b(?=[^>]*data-role=["']muted["'])(?=[^>]*data-hex=["']#68645d["'])[^>]*>/i.test(read("design/index.html"))) {
  errors.push("design/index.html: muted swatch must match the contrast-safe token");
}

for (const essay of essays) {
  const html = readFileSync(join(root, essay), "utf8");
  const structured = schemas(html, essay);
  const article = structured.filter((item) => item["@type"] === "Article");
  if (article.length !== 1) { errors.push(`${essay}: needs exactly one Article JSON-LD`); continue; }
  for (const field of ["headline", "description", "image", "datePublished", "inLanguage", "author", "publisher", "mainEntityOfPage"]) {
    if (!article[0][field]) errors.push(`${essay}: Article JSON-LD missing ${field}`);
  }
  if (article[0].description !== meta(html, "description")) errors.push(`${essay}: Article JSON-LD description must match the page description`);
}

for (const path of ["research/who-captures-growth/index.html", "research/fast-metabolism-economy/index.html"]) {
  const structured = schemas(readFileSync(join(root, path), "utf8"), path);
  if (structured.length !== 1 || structured[0]["@type"] !== "ScholarlyArticle") errors.push(`${path}: must retain exactly one ScholarlyArticle schema`);
}

const dataSchemas = schemas(readFileSync(join(root, "data/index.html"), "utf8"), "data/index.html");
if (dataSchemas.length !== 1 || dataSchemas[0]["@type"] !== "WebPage") errors.push("data/index.html: should expose one WebPage schema");

const postcards = readFileSync(join(root, "postcards/index.html"), "utf8");
if (/role=["']tablist["']/i.test(postcards) || /role=["']tab["']/i.test(postcards)) errors.push("postcards/index.html: filter buttons must not use incomplete tab semantics");
if (!/data-postcard-flip[^>]*aria-pressed=["']false["']/i.test(postcards)) errors.push("postcards/index.html: flip control needs state");
if (!/postcard-face-back[^>]*aria-hidden=["']true["'][^>]*\binert\b/i.test(postcards)) errors.push("postcards/index.html: hidden postcard back must begin inert");
for (const input of ["postcard-message", "postcard-sender", "postcard-recipient"]) {
  if (!new RegExp(`<label[^>]*\\bfor=["']${input}["']`, "i").test(postcards)) errors.push(`postcards/index.html: ${input} needs a label`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`SEO and accessibility validation passed: ${publicPages.length} public pages, ${essays.size} Article schemas.`);
