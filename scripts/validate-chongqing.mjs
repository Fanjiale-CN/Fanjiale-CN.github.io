import { readFileSync, existsSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (path) => readFileSync(join(root, path), "utf8");
const html = read("be-a-viewer/chongqing/index.html");
const css = read("be-a-viewer/chongqing/chongqing.css");
const loader = read("be-a-viewer/chongqing/chongqing.js");
const core = read("be-a-viewer/chongqing/chongqing-core.js");
const viewer = read("be-a-viewer/viewer.js");
const design = read("be-a-viewer/chongqing/DESIGN.md");
const mediaManifest = JSON.parse(read("be-a-viewer/chongqing/media-manifest.json"));
const errors = [];
const requireText = (source, pattern, label) => { if (!pattern.test(source)) errors.push(label); };

requireText(html, /<title>Chongqing — Ground Level Undefined \| GALOK<\/title>/, "missing Chongqing title");
for (const id of ["terrain","levels","stairs","transit","bridges","old-chongqing","river","night"]) requireText(html, new RegExp(`id="${id}"`), `missing ${id} chapter`);
requireText(html, /Li Ziba station sits on floors 6–7/, "missing verified Li Ziba fact");
requireText(html, /24 October 1987/, "missing verified cableway date");
requireText(html, /Category:Historical_photographs_of_Chongqing/, "missing historical archive source");
requireText(html, /Contemporary photography \/ Pexels contributors/, "missing contemporary photography credit");
requireText(html, /chongqing\.js\?v=20260828-cq09/, "page must bust the repaired Chongqing loader cache");

if (/src="https:\/\/(?:images|videos)\.pexels\.com/i.test(html)) errors.push("contemporary Chongqing media must be self-hosted");
if (/data:image\/gif|cq-local-slice|\.webp\.b64/i.test(html)) errors.push("page must not use low-resolution atlas placeholders");
if (/chongqing-enhance/.test(loader)) errors.push("loader must not inject the retired low-resolution enhancement layer");

const videoPaths = [
  "assets/video/chongqing/rail.mp4",
  "assets/video/chongqing/train-red-bridge.mp4",
  "assets/video/chongqing/bridge-skyline.mp4"
];
const imagePaths = [
  "urban-canyon.webp", "mist-height.webp", "river-tower.webp", "monorail-buildings.webp",
  "stairs.webp", "yangtze-cityscape.webp", "red-bridge.webp", "bridge-skyline.webp",
  "bridge-structure.webp", "bridge-network.webp", "night-grid.webp", "monorail-city.webp",
  "street-food.webp", "old-roofs.webp", "river-dusk.webp", "hongyadong-night.webp"
].map((name) => `assets/be-a-viewer/chongqing/${name}`);
for (const path of [...videoPaths, ...imagePaths]) {
  const absolute = join(root, path);
  if (!existsSync(absolute)) errors.push(`missing repaired Chongqing asset: ${path}`);
}
for (const path of videoPaths) {
  const absolute = join(root, path);
  if (existsSync(absolute) && statSync(absolute).size < 500_000) errors.push(`Chongqing video is truncated or undersized: ${path}`);
}
for (const path of imagePaths) {
  const absolute = join(root, path);
  if (existsSync(absolute) && statSync(absolute).size < 60_000) errors.push(`Chongqing image is undersized: ${path}`);
}
for (const asset of mediaManifest.assets) {
  const absolute = join(root, asset.path);
  if (!existsSync(absolute)) continue;
  const digest = createHash("sha256").update(readFileSync(absolute)).digest("hex");
  if (digest !== asset.sha256) errors.push(`Chongqing asset differs from supplied-pack derivative: ${asset.path}`);
}
if (mediaManifest.assets.length !== 19) errors.push("Chongqing media manifest must cover all 16 images and 3 videos");
requireText(JSON.stringify(mediaManifest), /pexels-liuuu-_61-2383408-37968488\.jpg/, "Yangtze cityscape must map to the supplied replacement photograph");
if (/cableway\.webp/.test(html) || existsSync(join(root, "assets/be-a-viewer/chongqing/cableway.webp"))) errors.push("retired cableway image must be removed");
requireText(JSON.stringify(mediaManifest), /16544239_1920_1080_60fps\.mp4/, "hero rail video must map to supplied moving footage");

requireText(html, /\/assets\/video\/chongqing\/rail\.mp4/, "hero must use local rail video");
requireText(html, /\/assets\/video\/chongqing\/train-red-bridge\.mp4/, "transit must use local bridge train video");
requireText(html, /poster="\/assets\/be-a-viewer\/chongqing\/monorail-buildings\.webp"/, "hero must expose a sharp poster fallback");
requireText(html, /poster="\/assets\/be-a-viewer\/chongqing\/monorail-city\.webp"/, "transit must expose a sharp poster fallback");
requireText(css, /@media \(max-width:1180px\)/, "missing tablet breakpoint");
requireText(css, /@media \(max-width:760px\)/, "missing mobile breakpoint");
requireText(css, /@media \(prefers-reduced-motion:reduce\)/, "missing reduced-motion treatment");
requireText(css, /min-width:761px[^}]*max-width:1180px[\s\S]*?\.cq-bridges\{height:auto\}/, "tablet bridge chapter must use the stable grid layout");
requireText(loader, /chongqing-core\.js\?v=20260828-cq-v9/, "loader must bust Chongqing core cache");
requireText(core, /IntersectionObserver/, "missing IntersectionObserver lifecycle");
requireText(core, /translate3d/, "missing horizontal bridge scrollytelling");
requireText(viewer, /CHONGQING/, "Cities viewer must know Chongqing");
requireText(viewer, /\/be-a-viewer\/chongqing\//, "Cities index must link to Chongqing");
requireText(design, /No generic neon\/cyberpunk Chongqing treatment\./, "DESIGN.md must reject generic cyberpunk treatment");

if (errors.length) {
  console.error(errors.map((item) => `ERROR ${item}`).join("\n"));
  process.exit(1);
}
console.log("Chongqing city validation passed: sharp self-hosted photography, decodable local motion, Commons history and stable responsive layouts.");
