import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const pagePath = join(root, "be-a-viewer/chongqing/index.html");
const cssPath = join(root, "be-a-viewer/chongqing/chongqing.css");
const loaderPath = join(root, "be-a-viewer/chongqing/chongqing.js");
const corePath = join(root, "be-a-viewer/chongqing/chongqing-core.js");
const enhancePath = join(root, "be-a-viewer/chongqing/chongqing-enhance.js");
const enhanceCssPath = join(root, "be-a-viewer/chongqing/chongqing-enhance.css");
const viewerPath = join(root, "be-a-viewer/viewer.js");
const designPath = join(root, "be-a-viewer/chongqing/DESIGN.md");

const html = readFileSync(pagePath, "utf8");
const css = readFileSync(cssPath, "utf8");
const loader = readFileSync(loaderPath, "utf8");
const core = readFileSync(corePath, "utf8");
const enhance = readFileSync(enhancePath, "utf8");
const enhanceCss = readFileSync(enhanceCssPath, "utf8");
const viewer = readFileSync(viewerPath, "utf8");
const design = readFileSync(designPath, "utf8");

const errors = [];
const requireText = (source, pattern, label) => { if (!pattern.test(source)) errors.push(label); };

requireText(html, /<title>Chongqing — Ground Level Undefined \| GALOK<\/title>/, "missing Chongqing title");
requireText(html, /data-cq-altimeter/, "missing persistent altimeter");
requireText(html, /id="terrain"/, "missing terrain chapter");
requireText(html, /id="levels"/, "missing street-level chapter");
requireText(html, /id="stairs"/, "missing stairs chapter");
requireText(html, /id="transit"/, "missing transit chapter");
requireText(html, /id="bridges"/, "missing bridge chapter");
requireText(html, /id="old-chongqing"/, "missing historical chapter");
requireText(html, /id="river"/, "missing river descent chapter");
requireText(html, /id="night"/, "missing after-dark chapter");
requireText(html, /Li Ziba station sits on floors 6–7/, "missing verified Li Ziba fact");
requireText(html, /24 October 1987/, "missing verified cableway date");
requireText(html, /Category:Historical_photographs_of_Chongqing/, "missing historical source link");
requireText(html, /WIKIMEDIA COMMONS/, "missing archive attribution");
requireText(html, /PEXELS/, "missing contemporary attribution");

const externalImages = [...html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)].map((match) => match[1]);
if (externalImages.length < 15) errors.push(`expected at least 15 documentary images, found ${externalImages.length}`);
if (externalImages.some((url) => !/^https:\/\/(?:images\.pexels\.com|commons\.wikimedia\.org)\//.test(url))) errors.push("unexpected documentary image host");

requireText(css, /@media \(max-width:1180px\)/, "missing tablet breakpoint");
requireText(css, /@media \(max-width:760px\)/, "missing mobile breakpoint");
requireText(css, /@media \(prefers-reduced-motion:reduce\)/, "missing reduced-motion treatment");
requireText(css, /\.cq-history-rail img\{[^}]*object-fit:contain/s, "historical images must preserve composition");
requireText(css, /\.cq-bridge-track img\{[^}]*object-fit:cover/s, "desktop bridge visual rule missing");
requireText(css, /max-width:760px[\s\S]*\.cq-bridge-track img\{[^}]*object-fit:contain/s, "mobile bridge images must avoid forced crop");

requireText(loader, /chongqing-enhance\.js\?v=20260828-cq-v3/, "loader must bust Chongqing media cache");
requireText(loader, /chongqing-core\.js\?v=20260828-cq-v3/, "loader must preserve Chongqing core interactions");
requireText(core, /IntersectionObserver/, "missing IntersectionObserver lifecycle");
requireText(core, /prefers-reduced-motion: reduce/, "missing reduced-motion JS guard");
requireText(core, /translate3d/, "missing horizontal bridge scrollytelling");
requireText(core, /Math\.round\(315 - 141 \* dp\)/, "missing narrative altitude descent");
requireText(core, /Chongqing%20Changjiang%20Cableway\.jpg/, "cableway runtime source must resolve to the real Chongqing cableway image");

requireText(enhance, /\.controls = controls/, "enhanced videos must expose native controls");
requireText(enhance, /\.playsInline = true/, "enhanced videos must support inline Safari playback");
requireText(enhance, /\.preload = "metadata"/, "enhanced videos must avoid fragile preload-none playback");
requireText(enhance, /cq-motion-lab/, "missing expanded motion-study section");
requireText(enhance, /cq-expanded/, "missing expanded Chongqing field material");
const verifiedDownloads = [...enhance.matchAll(/pexels\.com\/download\/video\//g)].length;
if (verifiedDownloads < 6) errors.push(`expected at least 6 verified Pexels download routes, found ${verifiedDownloads}`);
const expandedPhotos = [...enhance.matchAll(/images\.pexels\.com\/photos\//g)].length;
if (expandedPhotos < 12) errors.push(`expected at least 12 enhanced photo/poster references, found ${expandedPhotos}`);
requireText(enhanceCss, /\.skip-link:focus-visible/, "Safari skip link must use focus-visible");
requireText(enhanceCss, /\.skip-link:focus:not\(:focus-visible\)/, "touch focus must keep skip link hidden");
requireText(enhanceCss, /max-width:760px[\s\S]*cq-motion-card/s, "enhanced media requires a mobile layout");

requireText(viewer, /data\.city = "CHONGQING"/, "Cities viewer must mount a Chongqing hero slide");
requireText(viewer, /data\.cityChoice = "chongqing"/, "Cities index must mount a Chongqing selector entry");
requireText(viewer, /\/be-a-viewer\/chongqing\//, "Cities index must link to Chongqing story");
requireText(viewer, /data\.cityVisual = "chongqing"/, "Cities index must mount Chongqing preview art");

requireText(design, /No generic neon\/cyberpunk Chongqing treatment\./, "DESIGN.md must reject generic cyberpunk treatment");
requireText(design, /Desktop keeps the fixed altimeter/, "DESIGN.md missing responsive altimeter rule");

if (errors.length) {
  console.error(errors.map((item) => `ERROR ${item}`).join("\n"));
  process.exit(1);
}
console.log(`Chongqing city validation passed: ${externalImages.length} static documentary images plus verified motion media, Cities entry, Safari controls, responsive layouts and reduced-motion rules.`);
