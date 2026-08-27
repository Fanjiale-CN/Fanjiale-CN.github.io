import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const directory = dirname(fileURLToPath(import.meta.url));
const checks = [
  ["Global styles", "validate-stylesheets.mjs", []],
  ["Site shell", "sync-site-shell.mjs", ["--check"]],
  ["Publishing structure", "validate-publishing.mjs", []],
  ["Discovery assets", "validate-discovery.mjs", []],
  ["Radar pipeline", "validate-radar.mjs", []],
  ["Beijing historical archive", "validate-beijing-archive.mjs", []],
  ["Xi'an historical archive", "validate-xian-history.mjs", []],
  ["Shanghai historical archive", "validate-shanghai-history.mjs", []]
];

for (const [label, script, args] of checks) {
  process.stdout.write(`\n[release] ${label}\n`);
  const result = spawnSync(process.execPath, [join(directory, script), ...args], {
    encoding: "utf8",
    stdio: "inherit"
  });

  if (result.status !== 0) {
    console.error(`\nRelease preflight failed at: ${label}`);
    process.exit(result.status || 1);
  }
}

console.log(`\nRelease preflight passed: ${checks.length} lightweight checks. Full browser, visual and Lighthouse gates run in GitHub Actions after push.`);
