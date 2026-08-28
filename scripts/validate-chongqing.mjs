import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const pagePath = join(root, "be-a-viewer/chongqing/index.html");
const cssPath = join(root, "be-a-viewer/chongqing/chongqing.css");
const jsPath = join(root, "be-a-viewer/chongqing/chongqing.js");
const designPath = join(root, "be-a-viewer/chongqing/DESIGN.md");

const html = readFileSync(pagePath, "utf8");
const css = readFileSync(cssPath, "utf8");
const js = readFileSync(jsPath, "utf8");
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

requireText(js, /IntersectionObserver/, "missing IntersectionObserver lifecycle");
requireText(js, /prefers-reduced-motion: reduce/, "missing reduced-motion JS guard");
requireText(js, /translate3d/, "missing horizontal bridge scrollytelling");
requireText(js, /Math\.round\(315 - 141 \* dp\)/, "missing narrative altitude descent");

requireText(design, /No generic neon\/cyberpunk Chongqing treatment\./, "DESIGN.md must reject generic cyberpunk treatment");
requireText(design, /Desktop keeps the fixed altimeter/, "DESIGN.md missing responsive altimeter rule");

if (errors.length) {
  console.error(errors.map((item) => `ERROR ${item}`).join("\n"));
  process.exit(1);
}
console.log(`Chongqing city validation passed: ${externalImages.length} documentary images, vertical narrative, responsive layouts and reduced-motion rules.`);
