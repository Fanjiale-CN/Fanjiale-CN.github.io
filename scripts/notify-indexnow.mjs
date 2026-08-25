import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const host = "www.galok.me";
const key = readFileSync(join(root, "indexnow-key.txt"), "utf8").trim();
const sitemap = readFileSync(join(root, "sitemap.xml"), "utf8");
const urlList = [...sitemap.matchAll(/<loc>(https:\/\/www\.galok\.me\/[^<]*)<\/loc>/g)].map((match) => match[1]);
if (!urlList.length) throw new Error("IndexNow notification stopped: sitemap has no URLs.");

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host,
    key,
    keyLocation: `https://${host}/indexnow-key.txt`,
    urlList
  })
});

if (!response.ok) throw new Error(`IndexNow rejected the notification: ${response.status} ${await response.text()}`);
console.log(`IndexNow accepted ${urlList.length} canonical URLs.`);
