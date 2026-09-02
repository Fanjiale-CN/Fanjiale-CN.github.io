import { execFileSync } from "node:child_process";

const root = process.cwd();
const strictFiles = ["sitemap.xml", "feed.xml", "index/search-catalog.json", "pagefind/build.json"];

function fail(message) {
  console.error(`DISCOVERY REPRODUCIBILITY: ${message}`);
  process.exitCode = 1;
}

let changed = [];
try {
  changed = execFileSync("git", ["diff", "--name-only", "--", ...strictFiles], {
    cwd: root,
    encoding: "utf8"
  }).trim().split(/\r?\n/).filter(Boolean);
} catch (error) {
  fail(`could not inspect generated discovery files: ${error.message}`);
}

if (changed.length) {
  try {
    execFileSync("git", ["diff", "--", ...changed], { cwd: root, stdio: "inherit" });
  } catch {}
  fail(`generated discovery files changed: ${changed.join(", ")}`);
}

if (!process.exitCode) {
  console.log("Discovery regeneration is byte-stable for sitemap, feed, search catalog and Pagefind manifest.");
}
