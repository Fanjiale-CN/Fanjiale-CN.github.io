import { spawnSync } from "node:child_process";

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const clocks = ["1999-01-01", "2099-12-31"];

function run(label, command, args, env) {
  console.log(`\n[discovery-clock] ${label}`);
  // Windows cannot spawn npm.cmd directly without a shell (EINVAL).
  const result = spawnSync(command, args, { stdio: "inherit", env, encoding: "utf8", shell: process.platform === "win32" });
  if (result.status !== 0) {
    console.error(`\nDISCOVERY CLOCK INDEPENDENCE FAILED: ${label}`);
    process.exit(result.status || 1);
  }
}

for (const date of clocks) {
  const env = { ...process.env, GALOK_RELEASE_DATE: date };
  run(`rebuild at synthetic release date ${date}`, npm, ["run", "build:discovery"], env);
  run(`verify byte stability at ${date}`, process.execPath, ["scripts/verify-generated-discovery.mjs"], env);
}

console.log("\nPASS: committed discovery output is independent of wall-clock/release-date changes.");
