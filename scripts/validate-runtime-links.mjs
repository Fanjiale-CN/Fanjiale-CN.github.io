import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../", import.meta.url)));
const siteOrigin = "https://www.galok.me";
const mediaOrigin = "https://media.galok.me";
const errors = [];
const warnings = [];
const remoteMedia = new Set();

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if ([".git", "node_modules", "artifacts"].includes(entry.name)) return [];
    const file = join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : entry.name.endsWith(".html") ? [file] : [];
  });
}

function routeFor(file) {
  const name = relative(root, file).replaceAll("\\", "/");
  if (name === "index.html") return "/";
  return `/${name.replace(/index\.html$/, "")}`;
}

function localTarget(url) {
  const pathname = decodeURIComponent(url.pathname);
  if (pathname.includes("..")) return { invalid: true };
  const filename = pathname.replace(/^\/+/, "");
  if (!filename) return join(root, "index.html");
  const direct = resolve(root, filename);
  if (!direct.startsWith(`${root}/`)) return { invalid: true };
  if (extname(filename)) return direct;
  return join(direct, "index.html");
}

function attributeValues(tag) {
  return [...tag.matchAll(/\b(?:href|src|poster|action)=["']([^"']+)["']/gi)].map((match) => match[1]);
}

function collectIds(html, source) {
  const ids = [...html.matchAll(/(?:^|\s)id=["']([^"']+)["']/gi)].map((match) => match[1]);
  const seen = new Set();
  for (const id of ids) {
    if (seen.has(id)) errors.push(`${source}: duplicate id #${id}`);
    seen.add(id);
  }
  return seen;
}

const pages = new Map();
for (const file of walk(root)) {
  const html = readFileSync(file, "utf8");
  pages.set(routeFor(file), { file, html, noindex: /<meta\b[^>]*\bname=["']robots["'][^>]*\bcontent=["'][^"']*\bnoindex\b/i.test(html), ids: collectIds(html, relative(root, file).replaceAll("\\", "/")) });
}

for (const [route, page] of pages) {
  const source = relative(root, page.file).replaceAll("\\", "/");
  const html = page.html;
  const pageErrors = [];
  const fail = (message) => pageErrors.push(`${source}: ${message}`);
  if (!/^<!doctype html>/i.test(html.trimStart())) fail("missing HTML5 doctype");
  if (!/<html\b[^>]*\blang=["'][^"']+["']/i.test(html)) fail("missing document language");
  if ((html.match(/<head\b/gi) ?? []).length !== 1 || (html.match(/<body\b/gi) ?? []).length !== 1) fail("must have one head and one body");
  if (!page.noindex && (html.match(/<main\b/gi) ?? []).length !== 1) fail("must have one main landmark");
  if (!page.noindex && (html.match(/<h1\b/gi) ?? []).length !== 1) fail("must have one h1");
  const canonicalCount = (html.match(/<link\b[^>]*\brel=["']canonical["'][^>]*>/gi) ?? []).length;
  if (canonicalCount !== 1) fail(`expected one canonical, found ${canonicalCount}`);

  for (const tag of html.match(/<(?:a|link|script|img|source|video|audio|form)\b[^>]*>/gi) ?? []) {
    for (const raw of attributeValues(tag)) {
      if (/^(?:data:|mailto:|tel:|javascript:)/i.test(raw)) continue;
      let url;
      try { url = new URL(raw, `${siteOrigin}${route}`); }
      catch { fail(`invalid URL ${raw}`); continue; }
      if (url.origin === mediaOrigin) { remoteMedia.add(url.href); continue; }
      if (url.origin !== siteOrigin) continue;
      const target = localTarget(url);
      if (target.invalid || !statSyncSafe(target)) { fail(`missing local target ${raw}`); continue; }
      if (url.hash) {
        const targetRoute = extname(url.pathname) ? routeFor(target) : url.pathname || "/";
        const targetPage = pages.get(targetRoute);
        const targetIds = targetPage?.ids ?? new Set();
        if (!targetIds.has(decodeURIComponent(url.hash.slice(1)))) fail(`missing fragment ${raw}`);
      }
    }
  }
  errors.push(...pageErrors);
}

function statSyncSafe(path) {
  try { return statSync(path).isFile(); } catch { return false; }
}

async function checkRemoteMedia() {
  const urls = [...remoteMedia];
  const queue = [...urls];
  const workers = Array.from({ length: Math.min(8, urls.length) }, async () => {
    while (queue.length) {
      const url = queue.shift();
      const abort = new AbortController();
      const timeout = setTimeout(() => abort.abort(), 20_000);
      try {
        let response = await fetch(url, { method: "HEAD", signal: abort.signal, redirect: "follow" });
        if (response.status === 405) response = await fetch(url, { method: "GET", headers: { Range: "bytes=0-0" }, signal: abort.signal, redirect: "follow" });
        if (!response.ok) errors.push(`media URL failed (${response.status}): ${url}`);
      } catch (error) {
        errors.push(`media URL could not be checked: ${url} (${error.name})`);
      } finally { clearTimeout(timeout); }
    }
  });
  await Promise.all(workers);
}

if (process.env.CHECK_REMOTE_MEDIA !== "0") await checkRemoteMedia();
else warnings.push("Remote R2 media checks skipped by CHECK_REMOTE_MEDIA=0.");

const output = { scannedPages: pages.size, checkedMediaUrls: remoteMedia.size, errors, warnings };
mkdirSync(join(root, "artifacts", "ci"), { recursive: true });
writeFileSync(join(root, "artifacts", "ci", "link-report.json"), `${JSON.stringify(output, null, 2)}\n`);
if (warnings.length) console.warn(warnings.join("\n"));
if (errors.length) {
  console.error(`HTML and link validation failed (${errors.length})`);
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`HTML and link validation passed: ${pages.size} pages, ${remoteMedia.size} R2 media URLs.`);
