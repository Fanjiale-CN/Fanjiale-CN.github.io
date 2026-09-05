#!/usr/bin/env node
"use strict";
/**
 * Reproducibility check for generated Reading entries.
 * Runs the generator and verifies the output matches the committed HTML.
 * Usage: node scripts/check-generated-consistency.cjs
 */
const { execSync } = require("node:child_process");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const genScript = path.join(root, "reading", "gen-v6.cjs");
const entries = [45, 46, 47, 48, 49, 50, 51];

let failed = false;
for (const n of entries) {
  const file = path.join(root, "reading", "dongjing-meng-hua-lu", String(n), "index.html");
  const before = require("node:fs").readFileSync(file).toString();
  try {
    execSync(`node "${genScript}"`, { cwd: root, stdio: "pipe" });
  } catch (e) {
    console.error(`FAIL E${n}: generator exited with error`);
    failed = true;
    continue;
  }
  const after = require("node:fs").readFileSync(file).toString();
  if (before !== after) {
    console.error(`FAIL E${n}: regenerated HTML differs from committed HTML`);
    failed = true;
  } else {
    console.log(`PASS E${n}: output matches committed HTML`);
  }
}
if (failed) process.exit(1);
console.log("PASS: all generated entries are reproducible.");
