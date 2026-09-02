import { spawnSync } from "node:child_process";

const result = spawnSync("git", ["ls-files", "-z"], {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"],
});

if (result.status !== 0) {
  process.stderr.write(result.stderr || "Unable to list tracked files.\n");
  process.exit(result.status || 1);
}

const tracked = result.stdout.split("\0").filter(Boolean);

const forbiddenBasenames = new Set([".DS_Store", "Thumbs.db", "design-qa.md"]);
const forbiddenDirectories = new Set([
  "node_modules",
  "dist",
  "qa",
  "artifacts/ci",
  ".lighthouseci",
  ".cache",
  "coverage",
  "playwright-report",
  "test-results",
]);
const forbiddenSuffixes = [".tmp", ".bak", ".orig", ".rej", ".swp", ".swo"];

function isForbidden(path) {
  const normalized = path.replaceAll("\\", "/");
  const segments = normalized.split("/");
  const basename = segments.at(-1) || "";

  if (forbiddenBasenames.has(basename)) return true;
  if (basename.endsWith("~")) return true;
  if (forbiddenSuffixes.some((suffix) => basename.toLowerCase().endsWith(suffix))) return true;

  return [...forbiddenDirectories].some(
    (directory) => normalized === directory || normalized.startsWith(`${directory}/`),
  );
}

const offenders = tracked.filter(isForbidden).sort();

if (offenders.length > 0) {
  console.error("REPOSITORY HYGIENE FAILED: transient/local junk is tracked by Git:");
  for (const path of offenders) console.error(`  - ${path}`);
  console.error("Remove the tracked junk before pushing. Production assets such as runtime .b64 files and migration audit reports are intentionally not covered by this gate.");
  process.exit(1);
}

console.log(`REPOSITORY HYGIENE PASS: ${tracked.length} tracked paths checked; no transient/local junk is tracked.`);
