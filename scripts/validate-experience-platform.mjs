import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const read = (path) => readFileSync(resolve(root, path), "utf8");
const requireMatch = (source, expression, message) => {
  if (!expression.test(source)) throw new Error(message);
};

const atlas = JSON.parse(read("data/city-atlas.json"));
const expectedCities = ["beijing", "shanghai", "xian", "xiamen", "hangzhou", "shenzhen", "chongqing"];
if (!Array.isArray(atlas.cities) || atlas.cities.length !== expectedCities.length) {
  throw new Error(`City Atlas must have exactly ${expectedCities.length} published city records.`);
}
const atlasIds = atlas.cities.map((entry) => entry.id);
if (new Set(atlasIds).size !== atlasIds.length) {
  throw new Error("City Atlas city IDs must be unique.");
}
for (const id of expectedCities) {
  const city = atlas.cities.find((entry) => entry.id === id);
  if (!city || !Array.isArray(city.points) || city.points.length < 2 || !city.route.startsWith("/be-a-viewer/")) {
    throw new Error(`City Atlas record is incomplete: ${id}`);
  }
}

const experienceLoader = read("assets/observability.js");
requireMatch(experienceLoader, /data-city-atlas/, "The global experience loader must render the City Atlas region.");
requireMatch(experienceLoader, /city-atlas\.css/, "The global experience loader must include City Atlas styles.");
requireMatch(experienceLoader, /city-atlas\.js/, "The global experience loader must include the City Atlas loader.");
const atlasClient = read("be-a-viewer/city-atlas.js");
requireMatch(atlasClient, /IntersectionObserver/, "City Atlas must load lazily.");
requireMatch(atlasClient, /maplibre-gl@5/, "City Atlas must pin the MapLibre major version.");
requireMatch(atlasClient, /tiles\.openfreemap\.org/, "City Atlas must use the configured free map style.");

for (const route of ["/about/", "/data/", "/research/who-captures-growth/", "/research/fast-metabolism-economy/"]) {
  requireMatch(experienceLoader, new RegExp(route.replaceAll("/", "\\/")), `${route} must include the reader contact entry point.`);
}
requireMatch(experienceLoader, /reader-contact\.css/, "The global experience loader must include reader contact styles.");
requireMatch(experienceLoader, /reader-contact\.js/, "The global experience loader must include the reader contact client.");

for (const path of ["assets/reader-contact.css", "assets/reader-contact.js", "workers/reader-contact/src/index.js", "workers/reader-contact/wrangler.jsonc", "docs/reader-contact-worker.md"]) {
  if (!existsSync(resolve(root, path))) throw new Error(`Missing experience platform file: ${path}`);
}
const contactClient = read("assets/reader-contact.js");
requireMatch(contactClient, /const endpoint = "\/api\/contact\/"/, "Reader client must use the contact endpoint.");
requireMatch(contactClient, /\$\{endpoint\}config/, "Reader client must request public contact configuration.");
if (contactClient.includes("TURNSTILE_SECRET")) throw new Error("Turnstile secret must never be present in browser code.");
const worker = read("workers/reader-contact/src/index.js");
for (const [expression, message] of [
  [/turnstile\/v0\/siteverify/, "Worker must validate Turnstile server-side."],
  [/caches\.default/, "Worker must implement a basic rate limit."],
  [/env\.SUBMISSIONS\.put/, "Worker must persist submissions to private R2."],
  [/DELIVERY_WEBHOOK_URL/, "Worker must retain the vendor-neutral delivery adapter."],
  [/escapeHTML/, "Worker must escape submitted text before storage or delivery."]
]) requireMatch(worker, expression, message);

console.log("Experience platform validation passed: City Atlas, reader contact, Worker safeguards.");
