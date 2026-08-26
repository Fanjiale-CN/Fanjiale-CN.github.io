import puppeteer from "puppeteer-core";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:4173";
const chrome = process.env.CHROME_PATH;
const viewports = [
  ["mobile", 390, 844],
  ["tablet", 768, 1024],
  ["laptop", 1280, 720],
  ["desktop", 1440, 900],
  ["source-desktop", 1348, 926],
  ["ipad-landscape", 2048, 1536]
];
const routes = ["/", "/cities/", "/essays/", "/radar/", "/research/", "/data/", "/index/", "/about/"];
const errors = [];
const results = [];
const evidenceDirectory = process.env.VISUAL_EVIDENCE_DIR
  ? join(root, process.env.VISUAL_EVIDENCE_DIR)
  : join(root, "artifacts", "qa");

if (!chrome) throw new Error("Chrome executable not found. Set CHROME_PATH for visual acceptance.");
mkdirSync(evidenceDirectory, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--autoplay-policy=no-user-gesture-required"]
});

try {
  for (const [name, width, height] of viewports) {
    for (const route of routes) {
      const page = await browser.newPage();
      await page.setViewport({ width, height, deviceScaleFactor: 1 });
      const failedRequests = [];
      const consoleErrors = [];
      const pageErrors = [];
      page.on("console", (message) => {
        if (message.type() === "error") consoleErrors.push(message.text());
      });
      page.on("pageerror", (error) => pageErrors.push(error.message));
      page.on("requestfailed", (request) => {
        if (request.url().startsWith(baseUrl)) failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? "failed" });
      });

      const response = await page.goto(new URL(route, baseUrl).href, { waitUntil: "networkidle2", timeout: 60_000 });
      const metrics = await page.evaluate(() => {
        const globalStyle = [...document.styleSheets].find((sheet) => sheet.href?.includes("/styles.css"));
        let globalRules = -1;
        try { globalRules = globalStyle?.cssRules.length ?? -1; } catch {}
        const logoBox = document.querySelector(".brand-mark")?.getBoundingClientRect();
        const nav = document.querySelector(".site-nav");
        const main = document.querySelector("main");
        const video = document.querySelector(".field-hero video, video");
        const unreadyMedia = [...document.querySelectorAll("img,video")]
          .filter((element) => element.tagName === "IMG" ? !element.complete || element.naturalWidth === 0 : element.readyState === 0)
          .map((element) => element.currentSrc || element.src)
          .filter(Boolean);
        return {
          title: document.title,
          globalRules,
          bodyFont: getComputedStyle(document.body).fontFamily,
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          logo: logoBox ? { width: logoBox.width, height: logoBox.height } : null,
          navVisible: Boolean(nav && nav.getBoundingClientRect().height > 0),
          mainVisible: Boolean(main && main.getBoundingClientRect().height > 0),
          unreadyMedia,
          video: video ? { paused: video.paused, muted: video.muted, playsInline: video.playsInline, readyState: video.readyState, display: getComputedStyle(video).display } : null
        };
      });
      const actionableConsoleErrors = consoleErrors.filter((message) => message.includes(baseUrl) || /(?:Uncaught|TypeError|ReferenceError|SyntaxError)/.test(message));
      const item = { name, width, height, route, status: response?.status() ?? null, ...metrics, failedRequests, consoleErrors, pageErrors };

      if (!response?.ok()) errors.push(`${name} ${route}: HTTP ${item.status}`);
      if (item.globalRules < 100) errors.push(`${name} ${route}: global stylesheet parsed ${item.globalRules} rules`);
      if (item.scrollWidth > item.clientWidth + 1) errors.push(`${name} ${route}: horizontal overflow ${item.scrollWidth}/${item.clientWidth}`);
      if (item.logo && (item.logo.width > 220 || item.logo.height > 220)) errors.push(`${name} ${route}: oversized logo ${item.logo.width}x${item.logo.height}`);
      if (!item.navVisible || !item.mainVisible) errors.push(`${name} ${route}: nav/main not visible`);
      if (failedRequests.length) errors.push(`${name} ${route}: failed local requests ${JSON.stringify(failedRequests)}`);
      if (pageErrors.length) errors.push(`${name} ${route}: page errors ${pageErrors.join(" | ")}`);
      if (actionableConsoleErrors.length) errors.push(`${name} ${route}: actionable console errors ${actionableConsoleErrors.join(" | ")}`);
      results.push(item);

      if (route === "/" || (name === "desktop" && ["/radar/", "/cities/", "/essays/", "/research/", "/data/", "/index/"].includes(route))) {
        const label = route === "/" ? "home" : route.replaceAll("/", "");
        await page.screenshot({ path: join(evidenceDirectory, `fix-${label}-${name}.png`), fullPage: false });
      }
      await page.close();
    }
  }
} finally {
  await browser.close();
}

writeFileSync(join(evidenceDirectory, "site-fix-visual-acceptance.json"), `${JSON.stringify({ baseUrl, viewports, routes, errors, results }, null, 2)}\n`);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Visual acceptance passed: ${results.length} route/viewport combinations, parsed global CSS, no overflow, no oversized logos, no failed local assets.`);
