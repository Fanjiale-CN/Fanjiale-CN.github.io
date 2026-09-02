import { spawnSync } from "node:child_process";

const isCI = process.env.CI === "true" || process.env.GITHUB_ACTIONS === "true";

function run(label, command, args) {
  console.log(`\n[preflight] ${label}`);
  const result = spawnSync(command, args, { stdio: "inherit", encoding: "utf8" });
  if (result.status !== 0) {
    console.error(`\nGALOK PREFLIGHT FAILED: ${label}`);
    process.exit(result.status || 1);
  }
}

function probe(command, args) {
  return spawnSync(command, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}

if (!isCI) {
  const branchResult = probe("git", ["branch", "--show-current"]);
  const branch = branchResult.status === 0 ? branchResult.stdout.trim() : "";
  if (!branch) {
    console.error("GALOK PREFLIGHT FAILED: could not determine the current Git branch.");
    process.exit(1);
  }
  if (branch === "main" || branch === "master") {
    console.error("GALOK PREFLIGHT BLOCKED: direct development/push from main is forbidden. Use a feature/fix/chore branch and a PR.");
    process.exit(1);
  }
  console.log(`[preflight] Branch: ${branch}`);
}

run("Package/lock contract", process.execPath, ["scripts/check-package-contract.mjs"]);
run("GitHub workflow policy", process.execPath, ["scripts/validate-workflow-policy.mjs"]);
run("Deterministic discovery + lightweight release gates", "npm", ["run", "release"]);
run("Experience platform validator", "npm", ["run", "ci:experience"]);
run("Resource budget", process.execPath, ["scripts/check-resource-budgets.mjs"]);
run("Observability markup check", process.execPath, ["scripts/sync-observability.mjs", "--check"]);

const pythonCandidates = process.platform === "win32"
  ? [["py", ["-3"]], ["python", []], ["python3", []]]
  : [["python3", []], ["python", []]];
let python = null;
for (const [command, prefix] of pythonCandidates) {
  const result = probe(command, [...prefix, "-c", "import fontTools"]);
  if (result.status === 0) {
    python = [command, prefix];
    break;
  }
}
if (!python) {
  console.error("\nGALOK PREFLIGHT FAILED: Python fontTools is required for deterministic Reading font coverage.");
  console.error("Install it with: python -m pip install \"fonttools[woff]\" brotli");
  process.exit(1);
}
run("Reading canonical font-stack coverage", python[0], [...python[1], "scripts/check-reading-font-coverage.py"]);

console.log("\n✅ GALOK PREFLIGHT PASSED — READY TO PUSH");
