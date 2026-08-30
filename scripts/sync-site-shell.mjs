import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = fileURLToPath(new URL("../", import.meta.url));
const checkOnly = process.argv.includes("--check");
const sandbox = { window: {} };
vm.runInNewContext(readFileSync(join(root, "content.js"), "utf8"), sandbox);
const links = sandbox.window.GALOK_CONTENT?.site?.primaryNav;
const footerLinks = sandbox.window.GALOK_CONTENT?.site?.footer?.menu;

if (!Array.isArray(links) || !links.length || !Array.isArray(footerLinks) || !footerLinks.length) throw new Error("content.js must expose site navigation and footer links.");

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if ([".git", "node_modules"].includes(entry.name)) return [];
    const full = join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : entry.name.endsWith(".html") ? [full] : [];
  });
}

function currentHref(file) {
  const path = relative(root, file).replaceAll("\\", "/");
  if (path === "cities/index.html" || path.startsWith("be-a-viewer/")) return "/cities/";
  if (path.startsWith("essays/")) return "/essays/";
  if (path.startsWith("radar/")) return "/radar/";
  if (path.startsWith("research/")) return "/research/";
  if (path === "data/index.html") return "/data/";
  if (path.startsWith("reading/")) return "/reading/";
  if (path === "work/index.html") return "/work/";
  if (path === "index/index.html") return "/index/";
  if (path === "about/index.html") return "/about/";
  return null;
}

function navMarkup(current) {
  return links.map((link) => `<a href="${link.href}"${link.href === current ? ' aria-current="page"' : ""}>${link.label}</a>`).join("");
}

function footerMarkup() {
  return footerLinks.map((link) => `<a href="${link.href}">${link.label}</a>`).join("");
}

const changed = [];
for (const file of walk(root)) {
  const html = readFileSync(file, "utf8");
  if (!/<nav\b[^>]*\bclass=["'][^"']*\bsite-nav\b/i.test(html)) continue;
  let next = html.replace(/(<div\b[^>]*\bclass=["'][^"']*\bnav-links\b[^"']*["'][^>]*>)[\s\S]*?(<\/div>)/i, `$1${navMarkup(currentHref(file))}$2`);
  next = next.replace(/(<footer\b[^>]*\bclass=["'][^"']*\bfield-footer\b[^"']*["'][\s\S]*?<div><span>Menu<\/span>)[\s\S]*?(<\/div>)/i, `$1${footerMarkup()}$2`);
  if (next === html) continue;
  changed.push(relative(root, file));
  if (!checkOnly) writeFileSync(file, next);
}

if (checkOnly && changed.length) {
  console.error(`Site shell is out of sync:\n${changed.join("\n")}`);
  process.exit(1);
}

console.log(`${checkOnly ? "Site shell is synchronized" : "Synchronized site navigation"}: ${changed.length} file${changed.length === 1 ? "" : "s"}.`);
