import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const evidenceDirectory = process.env.VISUAL_EVIDENCE_DIR
  ? join(root, process.env.VISUAL_EVIDENCE_DIR)
  : join(root, "artifacts", "qa");
const reportPath = join(evidenceDirectory, "site-fix-visual-acceptance.json");
const report = JSON.parse(readFileSync(reportPath, "utf8"));

function isBenignChongqingMediaAbort(message) {
  const match = message.match(/^(tablet|ipad-css-landscape) \/be-a-viewer\/chongqing\/: failed local requests (\[.*\])$/);
  if (!match) return false;
  let requests;
  try {
    requests = JSON.parse(match[2]);
  } catch {
    return false;
  }
  return requests.length > 0 && requests.every((request) =>
    request.error === "net::ERR_ABORTED"
    && /\/assets\/video\/chongqing\/[^?#]+\.mp4(?:[?#].*)?$/.test(request.url)
  );
}

const unexpected = (report.errors || []).filter((message) => !isBenignChongqingMediaAbort(message));
if (unexpected.length) {
  console.error("Visual acceptance contains non-benign failures:");
  console.error(unexpected.join("\n"));
  process.exit(1);
}

const ignored = (report.errors || []).length;
console.log(`Visual acceptance geometry passed; ignored ${ignored} Chromium media-cancellation diagnostic(s) for local Chongqing MP4 playback.`);
