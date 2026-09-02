import { spawnSync } from "node:child_process";

const isCI = process.env.CI === "true" || process.env.GITHUB_ACTIONS === "true";

function run(label, command, args) {
  console.log(`\n[prepare] ${label}`);
  const result = spawnSync(command, args, { stdio: "inherit", encoding: "utf8" });
  if (result.status !== 0) {
    console.error(`\nGALOK PREPARE FAILED: ${label}`);
    process.exit(result.status || 1);
  }
}

function output(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  return result.status === 0 ? result.stdout.trim() : "";
}

if (!isCI) {
  const branch = output("git", ["branch", "--show-current"]);
  if (!branch) {
    console.error("GALOK PREPARE FAILED: could not determine the current Git branch.");
    process.exit(1);
  }
  if (branch === "main" || branch === "master") {
    console.error("GALOK PREPARE BLOCKED: normal development must not run on main. Create a feature/fix/chore branch first.");
    process.exit(1);
  }
  console.log(`[prepare] Branch: ${branch}`);
}

run("Synchronize shared site shell", process.execPath, ["scripts/sync-site-shell.mjs"]);
run("Build discovery once so sitemap reflects the candidate routes", "npm", ["run", "build:discovery"]);
run("Synchronize observability markup against the candidate sitemap", process.execPath, ["scripts/sync-observability.mjs"]);
run("Rebuild discovery after deterministic HTML synchronization", "npm", ["run", "build:discovery"]);

console.log("\n[prepare] Candidate artifacts are prepared.");
const status = output("git", ["status", "--short"]);
if (status) {
  console.log("\nReview and commit these changes atomically:\n");
  console.log(status);
} else {
  console.log("No working-tree changes remain.");
}
console.log("\nNext: review the diff, commit the complete candidate, then run `npm run galok:preflight`.");
