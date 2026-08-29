import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const css = readFileSync(join(root, "assets/ui-fixes-20260830.css"), "utf8");
const observability = readFileSync(join(root, "assets/observability.js"), "utf8");
const errors = [];

for (const marker of [
  ".beijing-page-body .beijing-site-nav",
  "linear-gradient(",
  "body.article-body .article-aside",
  "top: 178px",
  ".glyph-draw[data-glyph=\"視\"]",
  "content: \"视\""
]) {
  if (!css.includes(marker)) errors.push(`UI repair marker missing: ${marker}`);
}

if (!observability.includes("/assets/ui-fixes-20260830.css?v=1")) {
  errors.push("UI repair stylesheet is not loaded by the shared runtime host");
}
if (!observability.includes('route.startsWith("/essays/")')) {
  errors.push("Essay routes are not covered by the UI repair loader");
}
if (!observability.includes('route === "/be-a-viewer/beijing/"')) {
  errors.push("Beijing route is not covered by the UI repair loader");
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("Screenshot UI repair validation passed.");
