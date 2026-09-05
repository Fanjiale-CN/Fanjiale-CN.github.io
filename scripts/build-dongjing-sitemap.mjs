import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const sourcePath = join(root, "sitemap.xml");
const outputPath = join(root, "sitemap-dongjing.xml");
const prefix = "https://www.galok.me/reading/dongjing-meng-hua-lu/";

const source = readFileSync(sourcePath, "utf8");
const blocks = [...source.matchAll(/<url>[\s\S]*?<loc>([^<]+)<\/loc>[\s\S]*?<\/url>/g)]
  .filter((match) => match[1].startsWith(prefix))
  .map((match) => match[0]);

if (!blocks.length) throw new Error("Dongjing sitemap build found no public URLs. Run the indexing sync before discovery generation.");
if (!blocks.some((block) => block.includes(`<loc>${prefix}</loc>`))) throw new Error("Dongjing sitemap is missing the dossier hub.");

const entryCount = blocks.filter((block) => /<loc>https:\/\/www\.galok\.me\/reading\/dongjing-meng-hua-lu\/\d{2}\/<\/loc>/.test(block)).length;
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${blocks.map((block) => `  ${block.replace(/\n/g, "\n  ")}`).join("\n")}\n</urlset>\n`;
writeFileSync(outputPath, xml);
console.log(`Dongjing sitemap ready: ${blocks.length} URLs (${entryCount} entries + dossier routes).`);
