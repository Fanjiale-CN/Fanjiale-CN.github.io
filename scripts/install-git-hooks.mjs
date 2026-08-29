import { existsSync, writeFileSync, chmodSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const gitDirResult = spawnSync("git", ["rev-parse", "--git-dir"], {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "ignore"]
});

if (gitDirResult.status !== 0) {
  console.log("[hooks] No Git repository detected; skipping hook installation.");
  process.exit(0);
}

const gitDir = gitDirResult.stdout.trim();
const hooksDir = join(gitDir, "hooks");

if (!existsSync(hooksDir)) {
  console.log("[hooks] Git hooks directory is unavailable; skipping hook installation.");
  process.exit(0);
}

const hookPath = join(hooksDir, "pre-push");
const hook = `#!/bin/sh\nset -eu\n\necho "[galok] Running release gate before push..."\nnpm run release\n`;

writeFileSync(hookPath, hook, "utf8");
chmodSync(hookPath, 0o755);
console.log("[hooks] Installed pre-push release gate.");
