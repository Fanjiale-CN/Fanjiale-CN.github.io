import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (path) => readFileSync(join(root, path), "utf8");
const html = read("be-a-viewer/chongqing/index.html");
const css = read("be-a-viewer/chongqing/chongqing.css");
const loader = read("be-a-viewer/chongqing/chongqing.js");
const core = read("be-a-viewer/chongqing/chongqing-core.js");
const enhance = read("be-a-viewer/chongqing/chongqing-enhance.js");
const localCss = read("be-a-viewer/chongqing/chongqing-local.css");
const viewer = read("be-a-viewer/viewer.js");
const design = read("be-a-viewer/chongqing/DESIGN.md");
const errors = [];
const requireText = (source, pattern, label) => { if (!pattern.test(source)) errors.push(label); };

requireText(html, /<title>Chongqing — Ground Level Undefined \| GALOK<\/title>/, "missing Chongqing title");
for (const id of ["terrain","levels","stairs","transit","bridges","old-chongqing","river","night"]) requireText(html, new RegExp(`id="${id}"`), `missing ${id} chapter`);
requireText(html, /Li Ziba station sits on floors 6–7/, "missing verified Li Ziba fact");
requireText(html, /24 October 1987/, "missing verified cableway date");
requireText(html, /Category:Historical_photographs_of_Chongqing/, "missing historical archive source");
requireText(html, /user-supplied Chongqing archive/i, "missing supplied-archive credit");

const runtime = `${html}\n${core}\n${enhance}`;
if (/pexels\.com|videos\.pexels|images\.pexels/i.test(runtime)) errors.push("Chongqing runtime must not depend on Pexels");
if (/Chongqing%20Changjiang%20Cableway\.jpg/.test(core)) errors.push("core must not override the cableway image");

for (const path of [
  "assets/video/chongqing/rail.mp4",
  "assets/video/chongqing/train-red-bridge.mp4",
  "assets/video/chongqing/bridge-skyline.mp4",
  "assets/be-a-viewer/chongqing/field-atlas-v2.webp.b64",
  "assets/be-a-viewer/chongqing/cable-car-v2.webp.b64",
  "be-a-viewer/chongqing/chongqing-local.css"
]) if (!existsSync(join(root, path))) errors.push(`missing supplied Chongqing asset: ${path}`);

requireText(html, /\/assets\/video\/chongqing\/rail\.mp4/, "hero must use local rail video");
requireText(html, /\/assets\/video\/chongqing\/train-red-bridge\.mp4/, "transit must use local bridge train video");
requireText(html, /\/assets\/video\/chongqing\/bridge-skyline\.mp4/, "bridge chapter must use local skyline video");
requireText(enhance, /field-atlas-v2\.webp\.b64/, "enhancement must load supplied photo atlas");
requireText(enhance, /cable-car-v2\.webp\.b64/, "enhancement must load supplied cableway photo");
requireText(enhance, /Sixteen more frames/, "expanded supplied archive must expose 16 frames");
requireText(enhance, /cq-motion-lab/, "missing motion studies");
requireText(enhance, /cq-expanded/, "missing expanded archive");
requireText(enhance, /transit\.controls = true/, "transit video must expose Safari controls");
requireText(localCss, /\.cq-atlas-grid/, "missing supplied archive grid layout");
requireText(localCss, /max-width:760px/, "missing mobile local-media layout");
requireText(css, /@media \(max-width:1180px\)/, "missing tablet breakpoint");
requireText(css, /@media \(max-width:760px\)/, "missing mobile breakpoint");
requireText(css, /@media \(prefers-reduced-motion:reduce\)/, "missing reduced-motion treatment");
requireText(loader, /chongqing-enhance\.js\?v=20260828-cq-v5/, "loader must bust Chongqing enhancement cache");
requireText(loader, /chongqing-core\.js\?v=20260828-cq-v5/, "loader must bust Chongqing core cache");
requireText(core, /IntersectionObserver/, "missing IntersectionObserver lifecycle");
requireText(core, /translate3d/, "missing horizontal bridge scrollytelling");
requireText(viewer, /CHONGQING/, "Cities viewer must know Chongqing");
requireText(viewer, /\/be-a-viewer\/chongqing\//, "Cities index must link to Chongqing");
requireText(design, /No generic neon\/cyberpunk Chongqing treatment\./, "DESIGN.md must reject generic cyberpunk treatment");

if (errors.length) {
  console.error(errors.map((item) => `ERROR ${item}`).join("\n"));
  process.exit(1);
}
console.log("Chongqing city validation passed: supplied contemporary archive, local Safari-compatible motion, Commons history, responsive layouts and no Pexels runtime dependency.");
