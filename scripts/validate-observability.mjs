import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = fileURLToPath(new URL("../", import.meta.url));
const run = spawnSync(process.execPath, [join(root, "scripts", "sync-observability.mjs"), "--check"], { encoding: "utf8" });
process.stdout.write(run.stdout);
process.stderr.write(run.stderr);
if (run.status !== 0) process.exit(run.status || 1);

const client = readFileSync(join(root, "assets", "observability.js"), "utf8");
for (const name of ["essay_open", "research_open", "city_open", "postcard_open", "archive_search", "archive_result_open", "research_toc_use", "city_video_play", "city_video_pause", "external_link_open"]) {
  if (!client.includes(`"${name}"`)) throw new Error(`Missing analytics event: ${name}`);
}
if (/archive_search[\s\S]{0,220}query\s*:/i.test(client)) throw new Error("Search analytics must not send raw query text.");
if (!existsSync(join(root, "docs", "observability.md"))) throw new Error("Missing observability operator guide.");
if (!existsSync(join(root, ".github", "workflows", "publish-media-health.yml"))) throw new Error("Missing media health publishing workflow.");
console.log("Observability validation passed: GA4, Clarity, event privacy and operator guide are present.");
