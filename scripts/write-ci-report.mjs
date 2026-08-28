import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = join(root, "artifacts", "ci");
const readJson = (file, fallback) => existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : fallback;
const links = readJson(join(output, "link-report.json"), { scannedPages: 0, checkedMediaUrls: 0, errors: ["link report was not generated"], warnings: [] });
const budget = readJson(join(output, "resource-budget.json"), { assetsChecked: 0, bytesChecked: 0, errors: ["resource report was not generated"], warnings: [], largestAssets: [] });
const runtime = readJson(join(output, "runtime-accessibility.json"), { routes: [], errors: ["runtime accessibility report was not generated"], warnings: [] });
const observability = readJson(join(output, "runtime-observability.json"), { requests: [], events: [], errors: ["observability runtime report was not generated"] });

const require = createRequire(import.meta.url);
const lighthouseConfig = require(join(root, "lighthouserc.cjs"));
const expectedLighthouseReports = lighthouseConfig?.ci?.collect?.url?.length || 0;
const lighthouseDir = join(output, "lighthouse");
const manifest = readJson(join(lighthouseDir, "manifest.json"), []);
const auditValue = (audit) => audit?.numericValue ?? audit?.details?.items?.[0]?.responseTime ?? null;
const lighthouse = manifest.map((run) => {
  const reportPath = run.jsonPath ? (isAbsolute(run.jsonPath) ? run.jsonPath : join(root, run.jsonPath)) : null;
  const report = reportPath ? readJson(reportPath, null) : null;
  const categories = report?.categories ?? {};
  const audits = report?.audits ?? {};
  return {
    url: run.url,
    scores: Object.fromEntries(["performance", "accessibility", "best-practices", "seo"].map((key) => [key, Math.round((run.summary?.[key] ?? categories[key]?.score ?? 0) * 100)])),
    metrics: {
      lcp: auditValue(audits["largest-contentful-paint"]),
      responsiveness: auditValue(audits["interaction-to-next-paint"]) ?? auditValue(audits["total-blocking-time"]),
      cls: auditValue(audits["cumulative-layout-shift"]),
      ttfb: auditValue(audits["server-response-time"]),
      bytes: auditValue(audits["total-byte-weight"]),
      requests: audits["network-requests"]?.details?.items?.length ?? null
    }
  };
});

const gates = [
  ["Repository validators", process.env.GALOK_GATE_NATIVE],
  ["Experience platform", process.env.GALOK_GATE_EXPERIENCE],
  ["HTML / links / R2", process.env.GALOK_GATE_LINKS],
  ["Resource budget", process.env.GALOK_GATE_BUDGET],
  ["Discovery regeneration", process.env.GALOK_GATE_DISCOVERY],
  ["Runtime accessibility", process.env.GALOK_GATE_A11Y],
  ["Archive search", process.env.GALOK_GATE_SEARCH],
  ["Runtime observability", process.env.GALOK_GATE_OBSERVABILITY],
  ["Radar runtime", process.env.GALOK_GATE_RADAR],
  ["Visual acceptance", process.env.GALOK_GATE_VISUAL],
  ["Lighthouse", process.env.GALOK_GATE_LIGHTHOUSE]
];
const reportedGates = gates.filter(([, status]) => status);
const failedGates = reportedGates.filter(([, status]) => status !== "success");
const lighthouseComplete = expectedLighthouseReports > 0 && lighthouse.length === expectedLighthouseReports;
const lighthouseStatus = process.env.GALOK_GATE_LIGHTHOUSE && process.env.GALOK_GATE_LIGHTHOUSE !== "success"
  ? "FAIL"
  : lighthouseComplete ? "PASS" : "INCOMPLETE";
const reportFailures = [
  ...links.errors,
  ...budget.errors,
  ...runtime.errors,
  ...observability.errors,
  ...(!lighthouseComplete ? [`Lighthouse produced ${lighthouse.length}/${expectedLighthouseReports || "?"} expected reports`] : [])
];
const allPassed = reportedGates.length === gates.length && failedGates.length === 0 && reportFailures.length === 0;

const score = (value) => value === undefined ? "—" : `${value}`;
const milliseconds = (value) => Number.isFinite(value) ? `${Math.round(value)} ms` : "—";
const bytes = (value) => Number.isFinite(value) ? `${(value / 1024 / 1024).toFixed(2)} MiB` : "—";
const decimal = (value) => Number.isFinite(value) ? value.toFixed(3) : "—";
const gateLabel = (status) => status === "success" ? "PASS" : status ? "FAIL" : "NOT RUN";

const summary = [
  "# Galok CI report",
  "",
  "| Check | Result | Detail |",
  "| --- | --- | --- |",
  `| HTML / links | ${links.errors.length ? "FAIL" : "PASS"} | ${links.scannedPages} pages · ${links.checkedMediaUrls} R2 URLs · ${links.errors.length} errors |`,
  `| Resource budget | ${budget.errors.length ? "FAIL" : "PASS"} | ${budget.assetsChecked} assets · ${(budget.bytesChecked / 1024 / 1024).toFixed(1)} MiB · ${budget.warnings.length} documented exceptions |`,
  `| Runtime accessibility | ${runtime.errors.length ? "FAIL" : "PASS"} | ${runtime.routes.length} representative pages · ${runtime.errors.length} errors |`,
  `| Runtime observability | ${observability.errors.length ? "FAIL" : "PASS"} | ${observability.requests.length} tracker requests · ${new Set(observability.events).size} named events |`,
  `| Lighthouse | ${lighthouseStatus} | ${lighthouse.length}/${expectedLighthouseReports || "?"} reports |`,
  "",
  "## Release gates",
  "",
  "| Gate | Result |",
  "| --- | --- |",
  ...gates.map(([label, status]) => `| ${label} | ${gateLabel(status)} |`),
  "",
  "## Lighthouse baseline",
  "",
  "| Page | Performance | Accessibility | Best Practices | SEO |",
  "| --- | ---: | ---: | ---: | ---: |",
  ...lighthouse.map((item) => `| ${item.url.replace("http://127.0.0.1:4173", "") || "/"} | ${score(item.scores.performance)} | ${score(item.scores.accessibility)} | ${score(item.scores["best-practices"])} | ${score(item.scores.seo)} |`),
  "",
  "## Performance details",
  "",
  "| Page | LCP | INP / TBT | CLS | TTFB | Transfer | Requests |",
  "| --- | ---: | ---: | ---: | ---: | ---: | ---: |",
  ...lighthouse.map((item) => `| ${item.url.replace("http://127.0.0.1:4173", "") || "/"} | ${milliseconds(item.metrics.lcp)} | ${milliseconds(item.metrics.responsiveness)} | ${decimal(item.metrics.cls)} | ${milliseconds(item.metrics.ttfb)} | ${bytes(item.metrics.bytes)} | ${item.metrics.requests ?? "—"} |`),
  "",
  "## Largest referenced resources",
  "",
  "| Resource | Size |",
  "| --- | ---: |",
  ...budget.largestAssets.slice(0, 8).map((asset) => `| ${asset.key} | ${(asset.bytes / 1024 / 1024).toFixed(2)} MiB |`),
  "",
  "## Result",
  "",
  allPassed ? "All automated release gates passed." : "One or more automated release gates failed or did not report a complete result.",
  ...failedGates.map(([label, status]) => `- ${label}: ${status}`),
  ...reportFailures.map((error) => `- ${error}`),
  ""
].join("\n");

mkdirSync(output, { recursive: true });
writeFileSync(join(output, "summary.md"), summary);
if (process.env.GITHUB_STEP_SUMMARY) writeFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
console.log("CI report written to artifacts/ci/summary.md");
