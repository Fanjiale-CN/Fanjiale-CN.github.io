import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync, rmSync, statSync, utimesSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { tmpdir } from "node:os";

const root = process.cwd();
const origin = "https://www.galok.me";
const pagefindSource = join(tmpdir(), "galok-pagefind-source");
const excludedDirectories = new Set([".git", "node_modules", "pagefind", "_research-source", "archive", "qa", "video", "artifacts"]);

function escapeXml(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&apos;");
}

function decodeHtml(value = "") {
  return value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, "\"").replace(/&#39;/g, "'").replace(/\s+/g, " ").trim();
}

function metaContent(html, name) {
  const expression = new RegExp(`<meta[^>]+(?:name|property)=["']${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]+content=["']([^"']*)["'][^>]*>`, "i");
  return html.match(expression)?.[1] || "";
}

function routeFor(relativePath) {
  if (relativePath === "index.html") return "/";
  return `/${relativePath.replace(/\\/g, "/").replace(/index\.html$/, "")}`;
}

function typeFor(relativePath) {
  if (relativePath.startsWith("be-a-viewer/") || relativePath.startsWith("cities/")) return "city";
  if (relativePath.startsWith("essays/")) return "essay";
  if (relativePath.startsWith("radar/")) return "radar";
  if (relativePath.startsWith("research/")) return "research";
  if (relativePath.startsWith("data/")) return "data";
  if (relativePath.startsWith("visual-notes/")) return "visual";
  if (relativePath.startsWith("work/") || relativePath.startsWith("design/") || relativePath.startsWith("postcards/")) return "project";
  return "site";
}

function typeLabel(type) {
  return ({ city: "Cities", essay: "Essays", radar: "Radar", research: "Research", data: "Data", project: "Projects", visual: "Visual Notes", site: "Galok" })[type];
}

function walk(directory, result = []) {
  for (const entry of readdirSync(directory)) {
    if (excludedDirectories.has(entry)) continue;
    const path = join(directory, entry);
    const stats = statSync(path);
    if (stats.isDirectory()) walk(path, result);
    else if (entry.endsWith(".html")) result.push(path);
  }
  return result;
}

function lastModified(relativePath) {
  try {
    const date = execFileSync("git", ["log", "-1", "--format=%cs", "--", relativePath], { cwd: root, encoding: "utf8" }).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  } catch {}
  return statSync(join(root, relativePath)).mtime.toISOString().slice(0, 10);
}

function readJsonLd(html) {
  const blocks = [...html.matchAll(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const block of blocks) {
    try {
      const value = JSON.parse(block[1]);
      const values = Array.isArray(value) ? value : value["@graph"] || [value];
      const article = values.find((item) => ["Article", "ScholarlyArticle"].includes(item?.["@type"]));
      if (article) return article;
    } catch {}
  }
  return null;
}

function rssDate(value, fallback) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return new Date(`${value}T12:00:00Z`);
  return new Date(`${fallback}T12:00:00Z`);
}

function priorityFor(route) {
  if (route === "/") return ["1.0", "weekly"];
  if (["/cities/", "/essays/", "/radar/", "/research/", "/data/", "/index/"].includes(route)) return ["0.9", "weekly"];
  if (route.startsWith("/essays/") || route.startsWith("/research/")) return ["0.9", "monthly"];
  return ["0.7", "monthly"];
}

function publicPages() {
  const seenCanonicals = new Map();
  const pages = [];
  for (const path of walk(root).sort()) {
    const relativePath = relative(root, path).split(sep).join("/");
    if (relativePath === "404.html" || relativePath.includes("_archive")) continue;
    const html = readFileSync(path, "utf8");
    if (/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html)) continue;
    const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1];
    if (!canonical || !canonical.startsWith(`${origin}/`)) continue;
    if (seenCanonicals.has(canonical)) continue;
    seenCanonicals.set(canonical, relativePath);
    const title = decodeHtml(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "Galok").replace(/\s+[—|]\s+GALOK$/i, "");
    const description = decodeHtml(metaContent(html, "description"));
    const route = new URL(canonical).pathname;
    pages.push({
      relativePath,
      route,
      canonical,
      html,
      title,
      description,
      type: typeFor(relativePath),
      lastmod: lastModified(relativePath)
    });
  }
  return pages.sort((a, b) => a.route.localeCompare(b.route));
}

function buildSitemap(pages) {
  const rows = pages.map((page) => {
    const [priority, changefreq] = priorityFor(page.route);
    return `  <url>\n    <loc>${escapeXml(page.canonical)}</loc>\n    <lastmod>${page.lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
  });
  writeFileSync(join(root, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows.join("\n")}\n</urlset>\n`);
}

function buildFeed(pages) {
  const entries = pages
    .filter((page) => (page.type === "essay" || page.type === "research") && !["/essays/", "/research/"].includes(page.route))
    .map((page) => {
      const schema = readJsonLd(page.html) || {};
      const published = rssDate(schema.datePublished, page.lastmod);
      return { ...page, title: schema.headline || page.title, description: schema.description || page.description, published };
    })
    .sort((a, b) => b.published - a.published);
  const items = entries.map((entry) => `  <item>\n    <title>${escapeXml(entry.title)}</title>\n    <link>${escapeXml(entry.canonical)}</link>\n    <guid isPermaLink="true">${escapeXml(entry.canonical)}</guid>\n    <pubDate>${entry.published.toUTCString()}</pubDate>\n    <description>${escapeXml(entry.description)}</description>\n    <author>editor@galok.me (Galok)</author>\n  </item>`);
  const latest = entries[0]?.published || new Date();
  writeFileSync(join(root, "feed.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n<channel>\n  <title>Galok — Essays and Research</title>\n  <link>${origin}/</link>\n  <description>Economic observation, city memory and independent empirical research from Galok.</description>\n  <language>en</language>\n  <managingEditor>editor@galok.me (Galok)</managingEditor>\n  <lastBuildDate>${latest.toUTCString()}</lastBuildDate>\n${items.join("\n")}\n</channel>\n</rss>\n`);
}

function buildSearchSources(pages) {
  rmSync(pagefindSource, { recursive: true, force: true });
  rmSync(join(root, "pagefind"), { recursive: true, force: true });
  mkdirSync(pagefindSource, { recursive: true });
  mkdirSync(join(root, "pagefind"), { recursive: true });
  const catalog = [];
  const searchablePages = pages.filter((page) => page.route !== "/index/");
  for (const page of searchablePages) {
    const destination = join(pagefindSource, page.relativePath);
    mkdirSync(join(destination, ".."), { recursive: true });
    const filter = `<span data-pagefind-filter="type">${typeLabel(page.type)}</span>`;
    const searchable = page.html
      .replace(/<main\b([^>]*)>/i, `<main$1 data-pagefind-body>`)
      .replace(/<\/main>/i, `${filter}</main>`)
      // Pagefind is built with the English index for English stemming. Splitting
      // Han characters in the private build copy makes Chinese queries searchable
      // as individual indexed terms without altering public page markup.
      .replace(/[\u3400-\u9fff]/g, (character) => `${character} `);
    writeFileSync(destination, searchable);
    const stableTimestamp = new Date(`${page.lastmod}T00:00:00Z`);
    utimesSync(destination, stableTimestamp, stableTimestamp);
    catalog.push({ type: page.type, label: typeLabel(page.type), title: page.title, excerpt: page.description, url: page.route });
  }
  writeFileSync(join(root, "index", "search-catalog.json"), `${JSON.stringify(catalog, null, 2)}\n`);
  const sourceHash = createHash("sha256")
    .update(searchablePages.map((page) => `${page.relativePath}\u0000${page.html}`).join("\u0000"))
    .digest("hex");
  writeFileSync(join(root, "pagefind", "build.json"), `${JSON.stringify({ sourceHash, pageCount: searchablePages.length }, null, 2)}\n`);
}

const pages = publicPages();
if (!pages.length) throw new Error("Discovery build found no public canonical pages.");
buildSitemap(pages);
buildFeed(pages);
buildSearchSources(pages);
console.log(`Discovery sources ready: ${pages.length} canonical URLs, ${pages.filter((page) => page.route !== "/index/").length} searchable documents.`);
