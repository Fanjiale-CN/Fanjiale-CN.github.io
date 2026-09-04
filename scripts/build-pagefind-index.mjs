import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Builds the Pagefind index for the staged discovery sources produced by
// build-discovery.mjs. The source directory lives under the platform temp
// directory (os.tmpdir()); the pagefind CLI is invoked through its Node
// runner so the command works identically on Windows, macOS and Linux —
// no /tmp shell assumptions.

const root = process.cwd();
const pagefindSource = join(tmpdir(), "galok-pagefind-source");
const outputPath = join(root, "pagefind");
const runner = join(root, "node_modules", "pagefind", "lib", "runner", "bin.cjs");

if (!existsSync(runner)) {
  console.error(`pagefind runner not installed: ${runner}`);
  process.exit(1);
}

const result = spawnSync(process.execPath, [runner, "--site", pagefindSource, "--output-path", outputPath], {
  cwd: root,
  stdio: "inherit"
});

if (result.error) {
  console.error(`Pagefind build failed to start: ${result.error.message}`);
  process.exit(1);
}
if (result.status !== 0) process.exit(result.status ?? 1);
console.log(`Pagefind index built from ${pagefindSource} into pagefind/.`);
