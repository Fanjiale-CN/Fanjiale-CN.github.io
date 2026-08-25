import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const scripts = [
  "sync-site-shell.mjs --check",
  "sync-content-facts.mjs --check",
  "validate-seo.mjs",
  "validate-ia.mjs",
  "validate-seo-accessibility.mjs",
  "validate-cities-performance.mjs",
  "validate-research.mjs",
  "validate-research-002.mjs",
  "validate-publishing.mjs",
  "validate-discovery.mjs",
  "validate-observability.mjs"
];
const directory = dirname(fileURLToPath(import.meta.url));
let failed = false;

for (const command of scripts) {
  const [script, ...args] = command.split(" ");
  const result = spawnSync(process.execPath, [join(directory, script), ...args], { encoding: "utf8" });
  process.stdout.write(result.stdout);
  process.stderr.write(result.stderr);
  if (result.status !== 0) failed = true;
}

if (failed) process.exit(1);
console.log(`Site validation passed: ${scripts.length} checks.`);
