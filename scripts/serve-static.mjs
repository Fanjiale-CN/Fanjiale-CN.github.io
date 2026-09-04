import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../", import.meta.url)));
const host = process.env.HOST ?? "127.0.0.1";
const port = Number(process.env.PORT ?? 4173);
const types = {
  ".css": "text/css; charset=utf-8", ".csv": "text/csv; charset=utf-8", ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon", ".jpeg": "image/jpeg", ".jpg": "image/jpeg", ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".mp3": "audio/mpeg", ".mp4": "video/mp4", ".png": "image/png",
  ".svg": "image/svg+xml", ".wav": "audio/wav", ".webm": "video/webm", ".webp": "image/webp", ".xml": "application/xml; charset=utf-8", ".zip": "application/zip"
};

function resolveFile(pathname) {
  const decoded = decodeURIComponent(pathname);
  const relative = decoded.replace(/^\/+/, "");
  const candidate = resolve(root, relative || "index.html");
  if (candidate !== root && !candidate.startsWith(root + sep)) return null;
  if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  if (!extname(relative || "index.html")) {
    const index = join(candidate, "index.html");
    if (existsSync(index) && statSync(index).isFile()) return index;
  }
  return null;
}

createServer((request, response) => {
  if (!request.url || !["GET", "HEAD"].includes(request.method ?? "")) {
    response.writeHead(405); response.end(); return;
  }
  let pathname;
  try { pathname = new URL(request.url, `http://${host}:${port}`).pathname; }
  catch { response.writeHead(400); response.end(); return; }
  const file = resolveFile(pathname);
  if (!file) { response.writeHead(404); response.end("Not found"); return; }
  response.writeHead(200, { "content-type": types[extname(file).toLowerCase()] ?? "application/octet-stream", "cache-control": "no-store" });
  if (request.method === "HEAD") { response.end(); return; }
  createReadStream(file).pipe(response);
}).listen(port, host, () => console.log(`Galok static server listening on http://${host}:${port}`));
