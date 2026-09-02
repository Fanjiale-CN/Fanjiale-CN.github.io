import puppeteer from "puppeteer-core";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:4173";
const chrome = process.env.CHROME_PATH;
const evidenceDirectory = process.env.VISUAL_EVIDENCE_DIR
  ? join(root, process.env.VISUAL_EVIDENCE_DIR)
  : join(root, "artifacts", "qa", "reading");

if (!chrome) throw new Error("Chrome executable not found. Set CHROME_PATH for Reading visual acceptance.");
mkdirSync(evidenceDirectory, { recursive: true });

const dongjingRoot = join(root, "reading", "dongjing-meng-hua-lu");
const numericEntries = readdirSync(dongjingRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && /^\d+$/.test(entry.name) && existsSync(join(dongjingRoot, entry.name, "index.html")))
  .map((entry) => Number(entry.name))
  .sort((a, b) => a - b);

const latestEntries = numericEntries.slice(-2).map((entry) => `/reading/dongjing-meng-hua-lu/${String(entry).padStart(2, "0")}/`);
const routes = ["/reading/dongjing-meng-hua-lu/", ...latestEntries];
const viewports = [
  ["mobile", 390, 844],
  ["tablet", 768, 1024],
  ["desktop", 1440, 900]
];

const failures = [];
const results = [];

const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"]
});

const isLocalRequest = (url) => url.startsWith(baseUrl);
const routeLabel = (route) => route === "/reading/dongjing-meng-hua-lu/"
  ? "dongjing-room"
  : `dongjing-${route.split("/").filter(Boolean).at(-1)}`;

try {
  for (const [viewportName, width, height] of viewports) {
    for (const route of routes) {
      const page = await browser.newPage();
      await page.setViewport({ width, height, deviceScaleFactor: 1 });

      const failedRequests = [];
      const pageErrors = [];
      const consoleErrors = [];
      page.on("requestfailed", (request) => {
        if (isLocalRequest(request.url())) failedRequests.push(`${request.url()} :: ${request.failure()?.errorText ?? "failed"}`);
      });
      page.on("pageerror", (error) => pageErrors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error" && /(?:Uncaught|TypeError|ReferenceError|SyntaxError)/.test(message.text())) consoleErrors.push(message.text());
      });

      const response = await page.goto(new URL(route, baseUrl).href, { waitUntil: "networkidle2", timeout: 60_000 });
      await page.evaluate(() => document.fonts.ready);

      const metrics = await page.evaluate(() => {
        const main = document.querySelector("main");
        const zhTitle = document.querySelector(".dj-entry-title .dj-title-zh, .dj-room-title .dj-title-zh");
        const latinTitle = document.querySelector(".dj-entry-title h2, .dj-room-title h2");
        const tablist = document.querySelector('[role="tablist"]');
        const tabs = [...document.querySelectorAll('[role="tab"]')];
        const panels = [...document.querySelectorAll('[role="tabpanel"]')];
        const selected = tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true");
        return {
          title: document.title,
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          mainHeight: main?.getBoundingClientRect().height ?? 0,
          zhFont: zhTitle ? getComputedStyle(zhTitle).fontFamily : null,
          latinFont: latinTitle ? getComputedStyle(latinTitle).fontFamily : null,
          tablist: Boolean(tablist),
          tabs: tabs.length,
          panels: panels.length,
          selected
        };
      });

      const label = routeLabel(route);
      await page.screenshot({ path: join(evidenceDirectory, `reading-${label}-${viewportName}-top.png`), fullPage: false });

      let interaction = null;
      if (metrics.tablist && metrics.tabs > 1) {
        const firstTab = await page.$('[role="tab"]');
        await firstTab?.focus();
        await page.keyboard.press("ArrowRight");
        interaction = await page.evaluate(() => {
          const tabs = [...document.querySelectorAll('[role="tab"]')];
          const panels = [...document.querySelectorAll('[role="tabpanel"]')];
          const selected = tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true");
          return {
            selected,
            visiblePanels: panels.filter((panel) => !panel.hidden).length
          };
        });
        const feature = await page.$("#thresholds");
        if (feature) {
          await feature.evaluate((element) => element.scrollIntoView({ block: "start" }));
          await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
          await page.screenshot({ path: join(evidenceDirectory, `reading-${label}-${viewportName}-feature.png`), fullPage: false });
        }

        await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
        const reducedMotion = await page.evaluate(() => {
          const panel = document.querySelector('[role="tabpanel"]:not([hidden])');
          const tab = document.querySelector('[role="tab"]');
          return {
            panelTransition: panel ? getComputedStyle(panel).transitionDuration : null,
            tabTransition: tab ? getComputedStyle(tab).transitionDuration : null
          };
        });
        interaction.reducedMotion = reducedMotion;
      }

      const result = { route, viewportName, width, height, status: response?.status() ?? null, metrics, interaction, failedRequests, pageErrors, consoleErrors };
      results.push(result);

      if (!response?.ok()) failures.push(`${viewportName} ${route}: HTTP ${result.status}`);
      if (metrics.mainHeight <= 0) failures.push(`${viewportName} ${route}: main content is not visible`);
      if (metrics.scrollWidth > metrics.clientWidth + 1) failures.push(`${viewportName} ${route}: horizontal overflow ${metrics.scrollWidth}/${metrics.clientWidth}`);
      if (!metrics.zhFont?.includes("Galok QIJIC Reading")) failures.push(`${viewportName} ${route}: Chinese display did not resolve to QIJIC (${metrics.zhFont ?? "missing"})`);
      if (!metrics.latinFont?.includes("Galok Bagnard")) failures.push(`${viewportName} ${route}: Latin display did not resolve to Bagnard (${metrics.latinFont ?? "missing"})`);
      if (failedRequests.length) failures.push(`${viewportName} ${route}: failed local requests ${failedRequests.join(" | ")}`);
      if (pageErrors.length) failures.push(`${viewportName} ${route}: page errors ${pageErrors.join(" | ")}`);
      if (consoleErrors.length) failures.push(`${viewportName} ${route}: console errors ${consoleErrors.join(" | ")}`);

      if (metrics.tablist) {
        if (metrics.tabs !== metrics.panels || metrics.tabs < 2) failures.push(`${viewportName} ${route}: invalid tab/panel structure ${metrics.tabs}/${metrics.panels}`);
        if (interaction?.selected !== 1) failures.push(`${viewportName} ${route}: ArrowRight did not move selection to tab 2`);
        if (interaction?.visiblePanels !== 1) failures.push(`${viewportName} ${route}: expected one visible enhanced panel, found ${interaction?.visiblePanels}`);
        const durations = [interaction?.reducedMotion?.panelTransition, interaction?.reducedMotion?.tabTransition].filter(Boolean);
        if (durations.some((value) => value !== "0s")) failures.push(`${viewportName} ${route}: reduced-motion transitions remain active ${durations.join(", ")}`);
      }

      await page.close();
    }
  }
} finally {
  await browser.close();
}

const report = { routes, viewports: viewports.map(([name, width, height]) => ({ name, width, height })), results, failures };
writeFileSync(join(evidenceDirectory, "reading-visual-acceptance.json"), JSON.stringify(report, null, 2));

if (failures.length) {
  console.error("Reading visual acceptance failed:\n" + failures.map((failure) => `- ${failure}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log(`PASS: Reading visual acceptance covered ${routes.length} routes across ${viewports.length} viewports.`);
  console.log(`Evidence: ${evidenceDirectory}`);
}
