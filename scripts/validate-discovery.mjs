import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), "utf8");
const fail = (message) => { console.error(`DISCOVERY: ${message}`); process.exitCode = 1; };

const sitemap = read("sitemap.xml");
const urls = [...sitemap.matchAll(/<loc>(https:\/\/www\.galok\.me\/[^<]*)<\/loc>/g)].map((match) => match[1]);
if (!urls.length) fail("sitemap has no URLs");
if (new Set(urls).size !== urls.length) fail("sitemap contains duplicate canonical URLs");
if (urls.some((url) => /\/(?:archive|views|_research-source|qa)\//.test(url))) fail("sitemap contains an excluded route");
if (!/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/.test(sitemap)) fail("sitemap has no machine-generated lastmod values");
for (const route of ["/reading/dongjing-meng-hua-lu/12/", "/reading/dongjing-meng-hua-lu/13/", "/reading/dongjing-meng-hua-lu/14/"]) {
  if (urls.some((url) => new URL(url).pathname === route)) fail(`${route} is noindex and must not appear in sitemap`);
}

const robots = read("robots.txt");
if (!robots.includes("Sitemap: https://www.galok.me/sitemap.xml")) fail("robots.txt does not advertise the canonical sitemap");
const feed = read("feed.xml");
if (!feed.includes('<rss version="2.0">')) fail("feed.xml is not RSS 2.0");
if (![...feed.matchAll(/<item>/g)].length) fail("feed.xml has no entries");
if (!feed.includes("<pubDate>") || !feed.includes("<author>")) fail("feed.xml is missing publication or author metadata");

const catalog = JSON.parse(read("index/search-catalog.json"));
if (!Array.isArray(catalog) || !catalog.length) fail("search catalog is empty");
if (catalog.some((entry) => /\/(?:archive|views|_research-source|qa)\//.test(entry.url))) fail("search catalog contains an excluded route");
for (const type of ["city", "essay", "radar", "research", "data", "project", "visual", "reading"]) {
  if (!catalog.some((entry) => entry.type === type)) fail(`search catalog has no ${type} entries`);
}
for (const route of ["/reading/dongjing-meng-hua-lu/12/", "/reading/dongjing-meng-hua-lu/13/", "/reading/dongjing-meng-hua-lu/14/"]) {
  if (!catalog.some((entry) => entry.url === route && entry.type === "reading")) fail(`search catalog is missing ${route}`);
}
for (let entry = 20; entry <= 27; entry += 1) {
  const route = `/reading/dongjing-meng-hua-lu/${entry}/`;
  if (!catalog.some((item) => item.url === route && item.type === "reading")) fail(`search catalog is missing ${route}`);
}
if (!existsSync(join(root, "pagefind", "pagefind.js"))) fail("Pagefind client bundle is missing");
if (!existsSync(join(root, "pagefind", "pagefind-entry.json")) && !existsSync(join(root, "pagefind", "entry.json"))) fail("Pagefind search index is missing");
const pagefindBuild = JSON.parse(read("pagefind/build.json"));
if (!/^[a-f0-9]{64}$/.test(pagefindBuild.sourceHash || "") || pagefindBuild.pageCount !== catalog.length) fail("Pagefind build marker is invalid");
const keyFile = read("indexnow-key.txt").trim();
if (!/^[a-z0-9]{24,}$/i.test(keyFile)) fail("IndexNow key verification file is invalid");
if (!existsSync(join(root, "scripts", "notify-indexnow.mjs"))) fail("IndexNow notification script is missing");
if (!process.exitCode) console.log(`Discovery validation passed: ${urls.length} sitemap URLs, ${catalog.length} searchable documents.`);
