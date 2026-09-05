import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const path = join(root, "feed.xml");
const before = readFileSync(path, "utf8");
let removed = 0;

let after = before.replace(/\s*<item>[\s\S]*?<link>https:\/\/www\.galok\.me\/reading\/dongjing-meng-hua-lu\/\d{2}\/<\/link>[\s\S]*?<\/item>/g, (block) => {
  removed += 1;
  return "";
});

const firstRemainingDate = after.match(/<item>[\s\S]*?<pubDate>([^<]+)<\/pubDate>/)?.[1];
if (firstRemainingDate) {
  after = after.replace(/<lastBuildDate>[^<]+<\/lastBuildDate>/, `<lastBuildDate>${firstRemainingDate}</lastBuildDate>`);
}

writeFileSync(path, after);
console.log(`Dongjing feed pruning complete: removed ${removed} numbered chapter items.`);
