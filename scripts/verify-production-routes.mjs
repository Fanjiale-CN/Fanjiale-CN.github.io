import { execFileSync } from "node:child_process";

const baseUrl = (process.env.BASE_URL || "https://www.galok.me").replace(/\/+$/, "");
const releaseSha = process.env.RELEASE_SHA || process.env.GITHUB_SHA || "unknown";
const maxAttempts = Number(process.env.MAX_ATTEMPTS || 20);
const retryDelayMs = Number(process.env.RETRY_DELAY_MS || 15000);

function changedPaths() {
  try {
    const parents = execFileSync("git", ["rev-list", "--parents", "-n", "1", releaseSha], { encoding: "utf8" })
      .trim()
      .split(/\s+/)
      .slice(1);
    if (parents.length) {
      return execFileSync("git", ["diff", "--name-only", parents[0], releaseSha], { encoding: "utf8" })
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
    }
    return execFileSync("git", ["diff-tree", "--root", "--no-commit-id", "--name-only", "-r", releaseSha], { encoding: "utf8" })
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  } catch (error) {
    console.warn("[production] Could not determine changed paths:", error.message);
    return [];
  }
}

function routeForPath(path) {
  if (path === "index.html") return "/";
  if (path.endsWith("/index.html")) return "/" + path.slice(0, -"index.html".length);
  if (path === "sitemap.xml") return "/sitemap.xml";
  if (path === "feed.xml") return "/feed.xml";
  if (path === "index/search-catalog.json") return "/index/search-catalog.json";
  return null;
}

const routes = new Set(["/"]);
for (const path of changedPaths()) {
  const route = routeForPath(path);
  if (route) routes.add(route);
}

async function checkRoute(route) {
  const separator = route.includes("?") ? "&" : "?";
  const url = baseUrl + route + separator + "galok_release=" + encodeURIComponent(releaseSha.slice(0, 12));
  try {
    const response = await fetch(url, {
      redirect: "follow",
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
        "User-Agent": "galok-production-verifier"
      },
      signal: AbortSignal.timeout(15000)
    });
    if (response.body && response.body.cancel) response.body.cancel();
    return { route, status: response.status, ok: response.status >= 200 && response.status < 400 };
  } catch (error) {
    return { route, status: 0, ok: false, error: error.message };
  }
}

for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
  const results = await Promise.all(Array.from(routes, checkRoute));
  console.log("[production] attempt " + attempt + "/" + maxAttempts + ": " +
    results.map((item) => item.route + "=" + (item.status || item.error || "error")).join(", "));
  if (results.every((item) => item.ok)) {
    console.log("[production] All changed production routes are reachable.");
    process.exit(0);
  }
  if (attempt < maxAttempts) await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
}

console.error("[production] Deployment verification failed for one or more routes.");
process.exit(1);
