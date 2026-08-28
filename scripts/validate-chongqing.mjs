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
for (const id of ["terrain","levels","stairs","transit","bridges","food","field-atlas","old-chongqing","river","night"]) {
  requireText(html, new RegExp(`id="${id}"`), `missing ${id} chapter`);
}
requireText(html, /Li Ziba station sits on floors 6–7/, "missing verified Li Ziba fact");
requireText(html, /24 October 1987/, "missing verified cableway date");
requireText(html, /<em>maodu<\/em> hotpot/, "missing Chongqing maodu hotpot explanation");
requireText(html, /in 1926 it moved from portable stalls into restaurant dining/, "missing verified 1926 hotpot restaurant milestone");
requireText(html, /Chongqing hotpot and Chongqing xiaomian techniques appear on the municipal intangible-cultural-heritage list/, "missing xiaomian and hotpot heritage note");
requireText(html, /dfz\.cq\.gov\.cn\/zqlswh\/rwby_417819\/202412\/t20241219_13907530\.html/, "missing Chongqing local-chronicles hotpot source");
requireText(html, /t20190628_8614214\.html/, "missing Chongqing intangible-heritage source");
requireText(html, /t20221013_11182901\.html/, "missing Chongqing xiaomian source");
requireText(html, /Category:Historical_photographs_of_Chongqing/, "missing historical archive source");
requireText(html, /Contemporary photography \/ Pexels contributors/, "missing contemporary photography credit");
requireText(html, /chongqing\.css\?v=20260828-cq10/, "page must bust the expanded Chongqing stylesheet cache");
requireText(html, /chongqing\.js\?v=20260828-cq09/, "page must keep the repaired Chongqing loader cache key");

requireText(html, /16544239-hd_1920_1080_60fps\.mp4/, "hero must use the supplied full-HD landscape source");
requireText(html, /<source src="\/assets\/video\/chongqing\/rail\.mp4" type="video\/mp4">/, "hero must retain a local fallback video");
requireText(html, /src="\/assets\/video\/chongqing\/train-red-bridge\.mp4"/, "transit must use local bridge-train video");
requireText(html, /src="\/assets\/video\/chongqing\/bridge-skyline\.mp4"/, "bridge motion must use local skyline video");
requireText(html, /poster="\/assets\/be-a-viewer\/chongqing\/monorail-buildings\.webp"/, "hero must expose a sharp local poster fallback");
requireText(html, /poster="\/assets\/be-a-viewer\/chongqing\/monorail-city\.webp"/, "transit must expose a sharp local poster fallback");

for (const foodUrl of [
  "Special:Redirect/file/%E4%B9%9D%E5%AE%AB%E6%A0%BC%E7%81%AB%E9%94%85.jpg",
  "Special:Redirect/file/Red_House_hot_pot_Chongqing.jpg",
  "Special:Redirect/file/Chongqing_Xiaomian_with_fried_eggs.jpg"
]) requireText(html, new RegExp(foodUrl), `missing food image in narrative: ${foodUrl}`);

if (/data:image\/gif|cq-local-slice|\.webp\.b64/i.test(html)) errors.push("page must not use low-resolution atlas placeholders");
if (/chongqing-enhance/.test(loader)) errors.push("loader must not inject the retired low-resolution enhancement layer");
if (/pexels-mg-shawn-659091984-28452850\.jpg|CHENGDUDONG/i.test(JSON.stringify(mediaManifest) + html)) errors.push("Chengdu East Station image must not appear on the Chongqing page");
if (/jiang-yuan-ze-ze-ze-cable-car-5457383_1920\.jpg|cableway\.webp/.test(JSON.stringify(mediaManifest) + html)) errors.push("rejected cableway portrait must stay removed");

if (mediaManifest.packFileCount !== 46) errors.push("Chongqing source-pack inventory must record 46 real media files");
if (mediaManifest.packAssetsUsed < 37) errors.push("Chongqing page must use at least 37 of the 46 supplied media files");
if (mediaManifest.packUtilization < 0.80) errors.push("Chongqing source-pack utilization must remain above 80%");
if (mediaManifest.assets.length !== 41) errors.push("Chongqing media manifest must cover 41 used assets including the user replacement");

const localAssets = mediaManifest.assets.filter((asset) => !asset.remote);
const remoteAssets = mediaManifest.assets.filter((asset) => asset.remote);
for (const asset of localAssets) {
  const absolute = join(root, asset.path);
  if (!existsSync(absolute)) { errors.push(`missing Chongqing local asset: ${asset.path}`); continue; }
  if (/\.(?:webp|jpe?g|png)$/i.test(asset.path) && statSync(absolute).size < 60_000) errors.push(`Chongqing image is undersized: ${asset.path}`);
  if (/\.mp4$/i.test(asset.path) && statSync(absolute).size < 500_000) errors.push(`Chongqing fallback video is truncated or undersized: ${asset.path}`);
  const digest = createHash("sha256").update(readFileSync(absolute)).digest("hex");
  if (digest !== asset.sha256) errors.push(`Chongqing local asset differs from manifest: ${asset.path}`);
  if (!html.includes(`/${asset.path}`)) errors.push(`manifested Chongqing local asset is unused in page: ${asset.path}`);
}
for (const asset of remoteAssets) {
  if (!/^https:\/\/(?:images|videos)\.pexels\.com\//.test(asset.url || "") && !/^https:\/\/commons\.wikimedia\.org\/wiki\/Special:Redirect\/file\//.test(asset.url || "")) errors.push(`unsupported remote Chongqing asset URL: ${asset.source}`);
  if (!html.includes(asset.url)) errors.push(`manifested supplied-pack remote asset is unused in page: ${asset.source}`);
}

for (const source of [
  "14537301_1920_1080_60fps 2.mp4",
  "14537318_1920_1080_60fps.mp4"
]) requireText(JSON.stringify(mediaManifest), new RegExp(source.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `missing source-pack mapping: ${source}`);

requireText(html, /14537301-hd_1920_1080_60fps\.mp4/, "missing supplied red-truss bridge motion");
requireText(html, /14537318-hd_1920_1080_60fps\.mp4/, "missing supplied bridge skyline motion");
requireText(css, /@media \(max-width:1180px\)/, "missing tablet breakpoint");
requireText(css, /@media \(max-width:760px\)/, "missing mobile breakpoint");
requireText(css, /@media \(prefers-reduced-motion:reduce\)/, "missing reduced-motion treatment");
requireText(css, /min-width:761px[^}]*max-width:1180px[\s\S]*?\.cq-bridges\{height:auto\}/, "tablet bridge chapter must use the stable grid layout");
requireText(loader, /chongqing-core\.js\?v=20260828-cq-v9/, "loader must keep the repaired Chongqing core cache key");
requireText(core, /IntersectionObserver/, "missing IntersectionObserver lifecycle");
requireText(core, /translate3d/, "missing horizontal bridge scrollytelling");
requireText(viewer, /CHONGQING/, "Cities viewer must know Chongqing");
requireText(viewer, /\/be-a-viewer\/chongqing\//, "Cities index must link to Chongqing");
requireText(design, /No generic neon\/cyberpunk Chongqing treatment\./, "DESIGN.md must reject generic cyberpunk treatment");

if (errors.length) {
  console.error(errors.map((item) => `ERROR ${item}`).join("\n"));
  process.exit(1);
}
console.log(`Chongqing city validation passed: ${mediaManifest.packAssetsUsed}/${mediaManifest.packFileCount} supplied media used, HD hero sources, food culture, history and stable responsive layouts.`);
