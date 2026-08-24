import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = fileURLToPath(new URL("../", import.meta.url));
const checkOnly = process.argv.includes("--check");
const sandbox = { window: {} };
vm.runInNewContext(readFileSync(join(root, "content.js"), "utf8"), sandbox);
const content = sandbox.window.GALOK_CONTENT;
const openCities = content.cities.filter((city) => city.href).length;
const facts = {
  essays: String(content.essays.length),
  "essay-entries": `${content.essays.length} entries`,
  "open-cities": `${openCities} open cities`,
  "research-papers": `${content.research.length} papers + data desk`
};
const pages = ["essays/index.html", "index/index.html"];
const drift = [];

for (const page of pages) {
  const path = join(root, page);
  const html = readFileSync(path, "utf8");
  const next = html.replace(/(<(?:b|p)\b[^>]*\bdata-content-count=["']([^"']+)["'][^>]*>)[^<]*(<\/(?:b|p)>)/gi, (match, start, key, end) => {
    if (!(key in facts)) throw new Error(`${page}: unknown content fact ${key}`);
    return `${start}${facts[key]}${end}`;
  });
  if (next === html) continue;
  drift.push(page);
  if (!checkOnly) writeFileSync(path, next);
}

if (checkOnly && drift.length) {
  console.error(`Content facts are out of sync:\n${drift.join("\n")}`);
  process.exit(1);
}
console.log(`${checkOnly ? "Content facts are synchronized" : "Synchronized content facts"}: ${drift.length} file${drift.length === 1 ? "" : "s"}.`);
