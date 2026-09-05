#!/usr/bin/env node
"use strict";
/**
 * Reproducibility check for generated Reading entries 45-51.
 *
 * Correct logic:
 * 1. Snapshot all 7 committed HTML files into memory.
 * 2. Run gen-v6.cjs exactly once.
 * 3. Re-read all 7 files and compare with the snapshots.
 * 4. Report any entry whose content changed.
 *
 * Usage: node scripts/check-generated-consistency.cjs
 */
const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const genScript = path.join(root, "reading", "gen-v6.cjs");
const entries = [45, 46, 47, 48, 49, 50, 51];
const entryPaths = entries.map((n) =>
  path.join(root, "reading", "dongjing-meng-hua-lu", String(n), "index.html")
);

// 1. Snapshot committed HTML into memory
const before = entryPaths.map((p) => fs.readFileSync(p, "utf8"));

// 2. Run generator exactly once
try {
  execSync(`node "${genScript}"`, { cwd: root, stdio: "pipe" });
} catch (e) {
  console.error("FAIL: generator exited with error");
  console.error(e.stderr?.toString() || e.message);
  process.exit(1);
}

// 3. Re-read and compare
let failed = false;
entries.forEach((n, i) => {
  const after = fs.readFileSync(entryPaths[i], "utf8");
  if (before[i] !== after) {
    console.error(`FAIL E${n}: regenerated HTML differs from committed HTML`);
    failed = true;
  } else {
    console.log(`PASS E${n}: output matches committed HTML`);
  }
});

if (failed) {
  console.error("\nReproducibility check FAILED: run `node reading/gen-v6.cjs` and commit the updated files.");
  process.exit(1);
}
console.log("\nPASS: all 7 generated entries are reproducible.");
