import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const readingDir = join(root, "reading", "dongjing-meng-hua-lu");
const errors = [];

function scan(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "research") continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) { scan(full); continue; }
    if (!entry.name.endsWith(".html")) continue;
    const html = readFileSync(full, "utf8");
    // Strip script/style tags so we only check user-visible text
    const visible = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "");
    const rel = full.slice(root.length + 1).replaceAll("\\", "/");
    for (const word of ["undefined", "null", "NaN"]) {
      const re = new RegExp(`>(?:[^<]*)?\\b${word}\\b`, "gi");
      const match = visible.match(re);
      if (match) errors.push(`${rel}: user-visible "${word}" found (${match.length} occurrence${match.length > 1 ? "s" : ""})`);
    }
  }
}

scan(readingDir);

if (errors.length) {
  console.error("Visible text scan FAILED:");
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`Visible text scan PASS: no undefined/null/NaN in user-visible Reading HTML.`);
