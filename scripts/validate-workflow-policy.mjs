import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const workflowDir = join(root, ".github", "workflows");

const approved = new Set([
  "deploy-radar-worker.yml",
  "migrate-galok-media.yml",
  "notify-indexnow.yml",
  "publish-media-health.yml",
  "refresh-radar-live.yml",
  "validate-site.yml"
]);

const repoWriteApproved = new Set(["migrate-galok-media.yml"]);
const gitPushApproved = new Set(["migrate-galok-media.yml"]);
const files = readdirSync(workflowDir).filter((name) => /\.ya?ml$/i.test(name)).sort();
const errors = [];

for (const name of files) {
  if (!approved.has(name)) {
    errors.push(`${name}: workflow is not in the stable allowlist. Normal feature work must use scripts + feature branch + PR.`);
  }
  if (/(?:^|[-_.])(tmp|once|preflight|retry|finalize|installer?)(?:[-_.]|$)/i.test(name)) {
    errors.push(`${name}: task-specific/temporary workflow filename is forbidden.`);
  }

  const text = readFileSync(join(workflowDir, name), "utf8");
  if (/(?:base64\s+(?:-d|--decode)|gzip\s+-d|zlib|BEGIN_[A-Z0-9_]*PAYLOAD)/i.test(text)) {
    errors.push(`${name}: encoded/compressed payload logic is forbidden in workflow YAML; move it to scripts/ or a normal repository asset.`);
  }
  if (/^\s*contents:\s*write\s*$/mi.test(text) && !repoWriteApproved.has(name)) {
    errors.push(`${name}: contents: write is not approved for this validation/operational workflow.`);
  }
  if (/\bgit\s+push\b/i.test(text) && !gitPushApproved.has(name)) {
    errors.push(`${name}: direct git push from Actions is forbidden. Repository mutations must use an isolated branch + PR.`);
  }
  if (text.split(/\r?\n/).some((line) => line.length > 1200)) {
    errors.push(`${name}: contains an extremely long YAML line; large inline payloads/scripts are forbidden.`);
  }
}

for (const name of approved) {
  if (!files.includes(name)) errors.push(`${name}: approved stable workflow is missing; update workflow policy intentionally if it was retired.`);
}

if (errors.length) {
  console.error("WORKFLOW POLICY FAILED");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Workflow policy passed: ${files.length} stable workflows, no temporary workflow/payload/direct-push violations.`);
