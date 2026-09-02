import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const readingRoot = join(root, "reading");
const touched = [];

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return walk(path);
    return entry.name.endsWith(".html") ? [path] : [];
  });
}

try {
  for (const path of walk(readingRoot)) {
    const html = readFileSync(path, "utf8");
    const review = /<span[^>]*>\s*REVIEW\s*<\/span>/i.test(html);
    const explicitSearch = /<meta[^>]+name=["']galok:search["'][^>]+content=["']include["'][^>]*>/i.test(html);
    const noindex = /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html);
    if (!review || !explicitSearch || !noindex) continue;
    const filtered = html.replace(/<meta[^>]+name=["']galok:search["'][^>]+content=["']include["'][^>]*>\s*/i, "");
    touched.push([path, html]);
    writeFileSync(path, filtered);
    console.log(`Discovery: REVIEW page excluded from internal search: ${path.slice(root.length + 1)}`);
  }

  const result = spawnSync(process.execPath, [join(root, "scripts", "build-discovery.mjs")], { cwd: root, stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exitCode = result.status ?? 1;
} finally {
  for (const [path, html] of touched) writeFileSync(path, html);
}
