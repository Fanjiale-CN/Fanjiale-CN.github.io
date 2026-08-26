import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const stylesheetPath = join(root, "styles.css");
const bytes = readFileSync(stylesheetPath);
const errors = [];

let css = "";
try {
  css = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
} catch {
  errors.push("styles.css is not valid UTF-8 text");
}

const disallowedControl = [...bytes].find((byte) => byte < 0x20 && ![0x09, 0x0a, 0x0d].includes(byte));
if (disallowedControl !== undefined) errors.push(`styles.css contains binary control byte 0x${disallowedControl.toString(16).padStart(2, "0")}`);
if (bytes.length < 100_000) errors.push(`styles.css is unexpectedly small (${bytes.length} bytes)`);
if (css && !css.trimStart().startsWith(":root")) errors.push("styles.css no longer starts with the global :root token block");

for (const selector of [".site-nav", ".brand-mark", ".nav-links", ".field-hero", ".footer"]) {
  if (css && !css.includes(selector)) errors.push(`styles.css is missing required selector ${selector}`);
}

if (errors.length) {
  console.error(`Stylesheet validation failed:\n${errors.map((error) => `- ${error}`).join("\n")}`);
  process.exit(1);
}

console.log(`Stylesheet validation passed: styles.css is ${bytes.length} bytes of valid UTF-8 CSS with required shell selectors.`);
