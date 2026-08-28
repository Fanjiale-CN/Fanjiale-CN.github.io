import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const root = process.cwd();
const strictFiles = ["feed.xml", "index/search-catalog.json", "pagefind/build.json"];

function fail(message) {
  console.error(`DISCOVERY REPRODUCIBILITY: ${message}`);
  process.exitCode = 1;
}

function normalizeSitemap(value) {
  return value.replace(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g, "<lastmod>DATE</lastmod>");
}

try {
  execFileSync("git", ["diff", "--exit-code", "--", ...strictFiles], {
    cwd: root,
    stdio: "inherit"
  });
} catch {
  fail(`generated discovery files changed: ${strictFiles.join(", ")}`);
}

try {
  const committed = execFileSync("git", ["show", "HEAD:sitemap.xml"], {
    cwd: root,
    encoding: "utf8"
  });
  const generated = readFileSync("sitemap.xml", "utf8");
  if (normalizeSitemap(committed) !== normalizeSitemap(generated)) {
    fail("sitemap structure or canonical URL set changed after regeneration");
  }
} catch (error) {
  if (!process.exitCode) fail(`could not compare sitemap.xml: ${error.message}`);
}

if (!process.exitCode) {
  console.log("Discovery regeneration is reproducible; sitemap lastmod-only drift is tolerated.");
}
