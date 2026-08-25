import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const root = fileURLToPath(new URL("../", import.meta.url));
const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:4173";
const chrome = process.env.CHROME_PATH ?? ["/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium", "/usr/bin/chromium-browser"].find(existsSync);
if (!chrome) throw new Error("Chrome executable not found. Set CHROME_PATH for the observability audit.");

const expected = new Set(["https://www.googletagmanager.com/gtag/js?id=G-2Y8N04VXYG", "https://www.clarity.ms/tag/y7uoedckle"]);
const report = { baseUrl, requests: [], events: [], errors: [] };
const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
try {
  const visit = async (route) => {
    const page = await browser.newPage();
    page.on("request", (request) => {
      const url = request.url();
      if ([...expected].some((item) => url.startsWith(item))) report.requests.push({ route, url });
    });
    await page.goto(new URL(route, baseUrl).href, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await page.waitForFunction(() => typeof window.galokTrack === "function", { timeout: 10_000 });
    return page;
  };

  const home = await visit("/");
  await home.close();
  const essays = await visit("/essays/");
  await essays.close();
  const research = await visit("/research/fast-metabolism-economy/");
  await research.evaluate(() => {
    const link = [...document.querySelectorAll("[data-toc-link]")].find((node) => {
      const rect = node.getBoundingClientRect();
      const style = window.getComputedStyle(node);
      return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
    });
    if (!(link instanceof HTMLElement)) throw new Error("Visible research table-of-contents link missing");
    link.click();
  });
  report.events.push(...await research.evaluate(() => window.dataLayer.filter((item) => item[0] === "event").map((item) => item[1])));
  await research.close();
  const city = await visit("/be-a-viewer/hangzhou/");
  await city.evaluate(() => document.querySelector("video")?.dispatchEvent(new Event("play")));
  report.events.push(...await city.evaluate(() => window.dataLayer.filter((item) => item[0] === "event").map((item) => item[1])));
  await city.close();
  const index = await visit("/index/");
  await index.type("[data-archive-search]", "gatekeeping");
  await index.waitForSelector("[data-archive-results] a.archive-result", { timeout: 30_000 });
  await index.evaluate(() => {
    const link = document.querySelector("[data-archive-results] a.archive-result");
    link?.addEventListener("click", (event) => event.preventDefault(), { once: true });
    link?.click();
  });
  report.events.push(...await index.evaluate(() => window.dataLayer.filter((item) => item[0] === "event").map((item) => item[1])));
  await index.close();
} finally {
  await browser.close();
}

for (const origin of expected) if (!report.requests.some((entry) => entry.url.startsWith(origin))) report.errors.push(`Missing browser request: ${origin}`);
for (const name of ["research_toc_use", "city_video_play", "archive_search", "archive_result_open"]) if (!report.events.includes(name)) report.errors.push(`Missing runtime event: ${name}`);
mkdirSync(join(root, "artifacts", "ci"), { recursive: true });
writeFileSync(join(root, "artifacts", "ci", "runtime-observability.json"), `${JSON.stringify(report, null, 2)}\n`);
if (report.errors.length) throw new Error(`Observability runtime audit failed:\n${report.errors.join("\n")}`);
console.log(`Observability runtime audit passed: ${report.requests.length} tracker requests, ${new Set(report.events).size} events.`);
