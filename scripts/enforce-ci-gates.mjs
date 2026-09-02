import { appendFileSync } from "node:fs";

const gates = [
  ["GALOK_GATE_RUNTIME_FONT", "Reading runtime font", "Inspect computed font-family and canonical fallback resolution."],
  ["GALOK_GATE_A11Y", "Runtime accessibility", "Fix the new accessibility regression; do not raise the baseline to hide it."],
  ["GALOK_GATE_SEARCH", "Archive search", "Verify committed Pagefind/search assets and the failing query/route."],
  ["GALOK_GATE_OBSERVABILITY", "Runtime observability", "Verify tracker markup/runtime wiring; do not hand-edit dozens of pages."],
  ["GALOK_GATE_RADAR", "Radar runtime", "Fix the interaction/runtime regression in the Radar implementation."],
  ["GALOK_GATE_VISUAL", "Visual acceptance", "Inspect the failing viewport/route evidence and distinguish real geometry failure from approved media aborts."],
  ["GALOK_GATE_LIGHTHOUSE", "Lighthouse", "Inspect the failing metric and fix the regression; do not lower thresholds first."]
];

const failed = gates
  .map(([env, label, advice]) => ({ env, label, advice, status: process.env[env] || "not-run" }))
  .filter((gate) => gate.status !== "success");

if (!failed.length) {
  console.log("Runtime release gates passed.");
  process.exit(0);
}

const lines = [
  "## Runtime release gate failure",
  "",
  "The following real gates failed:",
  "",
  ...failed.map((gate) => `- **${gate.label}**: ${gate.status} — ${gate.advice}`),
  "",
  "Fix the first causal failure. Do not rerun a deterministic failure without a code/artifact change."
];

console.error("\nRUNTIME RELEASE GATES FAILED");
for (const gate of failed) {
  console.error(`- ${gate.label}: ${gate.status}`);
  console.error(`  ${gate.advice}`);
}

if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${lines.join("\n")}\n`);
}

process.exit(1);
