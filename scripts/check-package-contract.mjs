import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const lock = JSON.parse(readFileSync(join(root, "package-lock.json"), "utf8"));
const lockedRoot = lock?.packages?.[""];

const errors = [];
if (!lockedRoot) errors.push("package-lock.json does not contain packages[''] root metadata.");
if (pkg.name !== lock.name) errors.push(`package name mismatch: package.json=${pkg.name} package-lock.json=${lock.name}`);

for (const section of ["dependencies", "devDependencies", "optionalDependencies", "peerDependencies"]) {
  const expected = pkg[section] || {};
  const actual = lockedRoot?.[section] || {};
  const expectedKeys = Object.keys(expected).sort();
  const actualKeys = Object.keys(actual).sort();
  if (expectedKeys.join("\n") !== actualKeys.join("\n")) {
    errors.push(`${section} keys differ between package.json and package-lock.json`);
    continue;
  }
  for (const name of expectedKeys) {
    if (expected[name] !== actual[name]) {
      errors.push(`${section}.${name} mismatch: package.json=${expected[name]} package-lock.json=${actual[name]}`);
    }
  }
}

if (errors.length) {
  console.error("PACKAGE CONTRACT FAILED");
  for (const error of errors) console.error(`- ${error}`);
  console.error("Run npm install to refresh package-lock.json, review the diff, and commit package.json + package-lock.json together.");
  process.exit(1);
}

console.log("Package contract passed: package.json and package-lock.json root dependency metadata are synchronized.");
