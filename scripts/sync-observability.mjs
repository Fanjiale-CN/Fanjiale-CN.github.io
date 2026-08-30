import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const measurementId = "G-2Y8N04VXYG";
const clarityId = "y7uoedckle";
const cloudflareWebAnalyticsToken = "661a632fda6543c7ba4c14b93e9a9452";
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
  <script type="module" src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"${cloudflareWebAnalyticsToken}"}'></script>
  <script defer src="/assets/observability.js?v=20260830-livefix"></script>
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
  next = next.replace(/<script\b[^>]*\bsrc=["']https:\/\/static\.cloudflareinsights\.com\/beacon\.min\.js["'][^>]*>\s*<\/script>\s*/gi, "");
  next = next.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (script) => script.includes("G-2Y8N04VXYG") && /gtag\s*\(\s*["']config["']/i.test(script) ? "" : script);
  return next.replace(/^[\t ]+$/gm, "");
}

function validPublicMarkup(html) {
  const starts = (html.match(/<!-- GALOK_OBSERVABILITY_START -->/g) || []).length;
  const ends = (html.match(/<!-- GALOK_OBSERVABILITY_END -->/g) || []).length;
  const gtagSources = (html.match(/googletagmanager\.com\/gtag\/js\?id=G-2Y8N04VXYG/g) || []).length;
  const configs = (html.match(/gtag\s*\(\s*["']config["']\s*,\s*["']G-2Y8N04VXYG["']\s*\)/g) || []).length;
  const clarity = (html.match(/["']y7uoedckle["']/g) || []).length;
  const cloudflare = (html.match(/static\.cloudflareinsights\.com\/beacon\.min\.js/g) || []).length;
  const tokens = (html.match(/661a632fda6543c7ba4c14b93e9a9452/g) || []).length;
  const clients = (html.match(/\/assets\/observability\.js\?v=20260830-livefix/g) || []).length;
  return starts === 1 && ends === 1 && gtagSources === 1 && configs === 1 && clarity === 1 && cloudflare === 1 && tokens === 1 && clients === 1;
}

function hasAnyObservability(html) {
  return /G-2Y8N04VXYG|y7uoedckle|cloudflareinsights\.com|GALOK_OBSERVABILITY_START|\/assets\/observability\.js\?v=20260830-livefix/.test(html);
}

const publicPages = publicFiles();
const changed = [];
const invalid = [];
for (const file of walk(root)) {
  const before = readFileSync(file, "utf8");
  const path = relative(root, file);

  if (checkOnly) {
    if (publicPages.has(file)) {
      if (!validPublicMarkup(before)) invalid.push(path);
    } else if (hasAnyObservability(before)) {
      invalid.push(path);
    }
    continue;
  }

  const clean = removeAnalytics(before);
  const next = publicPages.has(file) ? clean.replace(/<\/head>/i, `${block}\n</head>`) : clean;
  if (publicPages.has(file)) {
    if (!validPublicMarkup(next)) invalid.push(path);
  } else if (hasAnyObservability(next)) {
    invalid.push(path);
  }
  if (next !== before) {
    changed.push(path);
    writeFileSync(file, next);
  }
}

if (invalid.length) throw new Error(`Observability markup invalid: ${invalid.join(", ")}`);
console.log(`${checkOnly ? "Observability markup verified" : "Observability markup synchronized"}: ${publicPages.size} public pages${checkOnly ? "" : `; ${changed.length} files updated`}.`);
