import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const measurementId = "G-2Y8N04VXYG";
const clarityId = "y7uoedckle";
const marker = "<!-- GALOK_OBSERVABILITY_START -->";
const endMarker = "<!-- GALOK_OBSERVABILITY_END -->";
const checkOnly = process.argv.includes("--check");

const block = `${marker}
  <script async src="https://www.googletagmanager.com/gtag/js?id=${measurementId}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag("js", new Date());
    gtag("config", "${measurementId}");
  </script>
  <script type="text/javascript">
    (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "${clarityId}");
  </script>
  <script defer src="/assets/observability.js?v=20260825"></script>
  ${endMarker}`;

function walk(directory, files = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if ([".git", "node_modules", "pagefind", "video", "artifacts"].includes(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) walk(path, files);
    else if (entry.isFile() && entry.name.endsWith(".html")) files.push(path);
  }
  return files;
}

function publicFiles() {
  const sitemap = readFileSync(join(root, "sitemap.xml"), "utf8");
  const urls = [...sitemap.matchAll(/<loc>https:\/\/www\.galok\.me(.*?)<\/loc>/g)].map((match) => match[1]);
  const files = new Set();
  for (const url of urls) {
    const pathname = url === "/" ? "index.html" : `${url.replace(/^\//, "")}index.html`;
    const file = join(root, pathname);
    if (!existsSync(file)) throw new Error(`Sitemap route has no HTML file: ${url}`);
    files.add(file);
  }
  return files;
}

function removeAnalytics(html) {
  let next = html;
  const start = next.indexOf(marker);
  const end = next.indexOf(endMarker);
  if (start !== -1 && end !== -1 && end > start) {
    const blockStart = start > 0 && next[start - 1] === "\n" ? start - 1 : start;
    let blockEnd = end + endMarker.length;
    if (next[blockEnd] === "\n") blockEnd += 1;
    next = `${next.slice(0, blockStart)}${next.slice(blockEnd)}`;
  }
  next = next.replace(/<script\b[^>]*\bsrc=["']https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-2Y8N04VXYG["'][^>]*>\s*<\/script>\s*/gi, "");
  next = next.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (script) => script.includes("G-2Y8N04VXYG") && /gtag\s*\(\s*["']config["']/i.test(script) ? "" : script);
  return next.replace(/^[\t ]+$/gm, "");
}

const publicPages = publicFiles();
const changed = [];
const invalid = [];
for (const file of walk(root)) {
  const before = readFileSync(file, "utf8");
  const clean = removeAnalytics(before);
  const next = publicPages.has(file) ? clean.replace(/<\/head>/i, `${block}\n</head>`) : clean;
  const path = relative(root, file);
  if (publicPages.has(file)) {
    const gtagSources = (next.match(/googletagmanager\.com\/gtag\/js\?id=G-2Y8N04VXYG/g) || []).length;
    const configs = (next.match(/gtag\("config", "G-2Y8N04VXYG"\)/g) || []).length;
    const clarity = (next.match(/"y7uoedckle"/g) || []).length;
    if (gtagSources !== 1 || configs !== 1 || clarity !== 1 || !next.includes('/assets/observability.js?v=20260825')) invalid.push(path);
  } else if (/G-2Y8N04VXYG|y7uoedckle|GALOK_OBSERVABILITY_START/.test(next)) invalid.push(path);
  if (next !== before) {
    changed.push(path);
    if (!checkOnly) writeFileSync(file, next);
  }
}

if (invalid.length) throw new Error(`Observability markup invalid: ${invalid.join(", ")}`);
if (checkOnly && changed.length) throw new Error(`Observability markup is out of sync: ${changed.join(", ")}`);
console.log(`${checkOnly ? "Observability markup verified" : "Observability markup synchronized"}: ${publicPages.size} public pages.`);
