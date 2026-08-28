import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const scriptsDirectory = dirname(fileURLToPath(import.meta.url));
const root = dirname(scriptsDirectory);
const read = (path) => readFileSync(join(root, path), "utf8");
const css = read("be-a-viewer/hangzhou/hangzhou-tablet.css");
const loader = read("be-a-viewer/hangzhou/hangzhou.js");

const failures = [];
const requireText = (haystack, needle, label) => {
  if (!haystack.includes(needle)) failures.push(label);
};

requireText(loader, "hangzhou-tablet.css?v=20260828-ipad-repair", "Hangzhou loader does not attach the iPad repair stylesheet");
requireText(loader, "max-width: 1180px", "Hangzhou loader is missing the standard tablet landscape breakpoint");
requireText(loader, "max-width: 1366px", "Hangzhou loader is missing the large iPad touch breakpoint");
requireText(css, ".hz-night-triptych", "iPad stylesheet is missing the night layout repair");
requireText(css, "aspect-ratio: auto !important", "iPad night images are still vulnerable to forced crop ratios");
requireText(css, "object-fit: contain !important", "iPad night images are not protected from cover cropping");
requireText(css, ".hz-poster img", "iPad stylesheet is missing the printed-note image repair");
requireText(css, "max-height: 72svh", "iPad poster is missing a viewport-height cap");
requireText(css, "grid-column: 2", "iPad night composition is missing the portrait anchor column");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Hangzhou iPad layout validation passed: poster height is bounded and night photographs preserve their source framing.");
