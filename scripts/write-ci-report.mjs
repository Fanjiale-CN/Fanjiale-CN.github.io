import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = join(root, "artifacts", "ci");
const readJson = (file, fallback) => existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : fallback;
const links = readJson(join(output, "link-report.json"), { scannedPages: 0, checkedMediaUrls: 0, errors: ["link report was not generated"], warnings: [] });
const budget = readJson(join(output, "resource-budget.json"), { assetsChecked: 0, bytesChecked: 0, errors: ["resource report was not generated"], warnings: [], largestAssets: [] });
const runtime = readJson(join(output, "runtime-accessibility.json"), { routes: [], errors: ["runtime accessibility report was not generated"], warnings: [] });

const lighthouseDir = join(output, "lighthouse");
const manifest = readJson(join(lighthouseDir, "manifest.json"), []);
const lighthouse = manifest.map((run) => {
  const report = run.jsonPath ? readJson(join(root, run.jsonPath), null) : null;
  const categories = report?.categories ?? {};
  return { url: run.url, scores: Object.fromEntries(["performance", "accessibility", "best-practices", "seo"].map((key) => [key, Math.round((run.summary?.[key] ?? categories[key]?.score ?? 0) * 100)])) };
});
const score = (value) => value === undefined ? "—" : `${value}`;
const summary = [
  "# Galok CI report",
  "",
  "| Check | Result | Detail |",
  "| --- | --- | --- |",
  `| HTML / links | ${links.errors.length ? "FAIL" : "PASS"} | ${links.scannedPages} pages · ${links.checkedMediaUrls} R2 URLs · ${links.errors.length} errors |`,
  `| Resource budget | ${budget.errors.length ? "FAIL" : "PASS"} | ${budget.assetsChecked} assets · ${(budget.bytesChecked / 1024 / 1024).toFixed(1)} MiB · ${budget.warnings.length} documented exceptions |`,
  `| Runtime accessibility | ${runtime.errors.length ? "FAIL" : "PASS"} | ${runtime.routes.length} representative pages · ${runtime.errors.length} errors |`,
  `| Lighthouse | ${lighthouse.length === 7 ? "PASS" : "INCOMPLETE"} | ${lighthouse.length}/7 reports |`,
  "",
  "## Lighthouse baseline",
  "",
  "| Page | Performance | Accessibility | Best Practices | SEO |",
  "| --- | ---: | ---: | ---: | ---: |",
  ...lighthouse.map((item) => `| ${item.url.replace("http://127.0.0.1:4173", "") || "/"} | ${score(item.scores.performance)} | ${score(item.scores.accessibility)} | ${score(item.scores["best-practices"])} | ${score(item.scores.seo)} |`),
  "",
  "## Largest referenced resources",
  "",
  "| Resource | Size |",
  "| --- | ---: |",
  ...budget.largestAssets.slice(0, 8).map((asset) => `| ${asset.key} | ${(asset.bytes / 1024 / 1024).toFixed(2)} MiB |`),
  "",
  ...[...links.errors, ...budget.errors, ...runtime.errors].length ? ["## Failures", "", ...[...links.errors, ...budget.errors, ...runtime.errors].map((error) => `- ${error}`)] : ["## Result", "", "All automated release gates passed."],
  ""
].join("\n");

mkdirSync(output, { recursive: true });
writeFileSync(join(output, "summary.md"), summary);
if (process.env.GITHUB_STEP_SUMMARY) writeFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
console.log("CI report written to artifacts/ci/summary.md");
