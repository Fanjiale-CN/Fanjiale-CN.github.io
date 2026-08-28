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
  ["ipad-css-landscape", 1024, 768],
  ["laptop", 1280, 720],
  ["desktop", 1440, 900],
  ["source-desktop", 1348, 926],
  ["ipad-landscape", 2048, 1536]
];
const routes = ["/", "/cities/", "/essays/", "/radar/", "/research/", "/data/", "/index/", "/about/", "/be-a-viewer/shanghai/", "/be-a-viewer/hangzhou/"];
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

const isLocalCloudflareRumCorsNoise = (message) => {
  if (!/^http:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?/.test(baseUrl)) return false;
  return message.includes("cloudflareinsights.com/cdn-cgi/rum")
    && message.includes("blocked by CORS policy")
    && message.includes("127.0.0.1");
};

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
        const shanghaiHistory = document.querySelector(".shanghai-history");
        const shanghaiHistoryBox = shanghaiHistory?.getBoundingClientRect();
        const shanghaiHistoryCard15 = document.querySelector('[data-shanghai-history-id="nanjing-road-1952"]');
        const shanghaiHistoryCard15Box = shanghaiHistoryCard15?.getBoundingClientRect();
        const shanghaiHistoryCard15GridBox = shanghaiHistoryCard15?.parentElement?.getBoundingClientRect();

        const hzNight = document.querySelector(".hz-night-triptych");
        const hzNightFigure = hzNight?.querySelector("figure");
        const hzNightImage = hzNightFigure?.querySelector("img");
        const hzNightImages = [...(hzNight?.querySelectorAll("img") ?? [])];
        const hzPosterImage = document.querySelector(".hz-poster img");
        const hzCityGrid = document.querySelector(".hz-city-grid");
        const hzCityPortrait = document.querySelector(".hz-city-portrait");
        const contentWidth = (element) => {
          if (!element) return null;
          const box = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return box.width - (parseFloat(style.paddingLeft) || 0) - (parseFloat(style.paddingRight) || 0);
        };
        const hangzhouMobile = hzNight ? {
          stylesheet: [...document.styleSheets].some((sheet) => sheet.href?.includes("hangzhou-mobile.css")),
          coreScript: [...document.scripts].some((script) => script.src?.includes("hangzhou-core.js")),
          nightFigureWidth: hzNightFigure?.getBoundingClientRect().width ?? null,
          nightContentWidth: contentWidth(hzNight),
          nightObjectFit: hzNightImage ? getComputedStyle(hzNightImage).objectFit : null,
          nightAspectRatio: hzNightImage ? getComputedStyle(hzNightImage).aspectRatio : null,
          posterHeight: hzPosterImage?.getBoundingClientRect().height ?? null,
          cityPortraitWidth: hzCityPortrait?.getBoundingClientRect().width ?? null,
          cityContentWidth: contentWidth(hzCityGrid)
        } : null;
        const hangzhouTablet = hzNight ? {
          stylesheet: [...document.styleSheets].some((sheet) => sheet.href?.includes("hangzhou-tablet.css")),
          nightObjectFits: hzNightImages.map((image) => getComputedStyle(image).objectFit),
          nightAspectRatios: hzNightImages.map((image) => getComputedStyle(image).aspectRatio),
          posterHeight: hzPosterImage?.getBoundingClientRect().height ?? null
        } : null;

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
          shanghaiHistory: shanghaiHistoryBox ? {
            width: shanghaiHistoryBox.width,
            parent: shanghaiHistory.parentElement?.className ?? "",
            previous: shanghaiHistory.previousElementSibling?.className ?? "",
            cards: shanghaiHistory.querySelectorAll(".shanghai-history-card").length
          } : null,
          shanghaiHistoryCard15: shanghaiHistoryCard15Box && shanghaiHistoryCard15GridBox ? {
            width: shanghaiHistoryCard15Box.width,
            gridWidth: shanghaiHistoryCard15GridBox.width
          } : null,
          hangzhouMobile,
          hangzhouTablet,
          unreadyMedia,
          video: video ? { paused: video.paused, muted: video.muted, playsInline: video.playsInline, readyState: video.readyState, display: getComputedStyle(video).display } : null
        };
      });
      const actionableConsoleErrors = consoleErrors.filter((message) => {
        if (isLocalCloudflareRumCorsNoise(message)) return false;
        return message.includes(baseUrl) || /(?:Uncaught|TypeError|ReferenceError|SyntaxError)/.test(message);
      });
      const item = { name, width, height, route, status: response?.status() ?? null, ...metrics, failedRequests, consoleErrors, pageErrors };

      if (!response?.ok()) errors.push(`${name} ${route}: HTTP ${item.status}`);
      if (item.globalRules < 100) errors.push(`${name} ${route}: global stylesheet parsed ${item.globalRules} rules`);
      if (item.scrollWidth > item.clientWidth + 1) errors.push(`${name} ${route}: horizontal overflow ${item.scrollWidth}/${item.clientWidth}`);
      if (item.logo && (item.logo.width > 220 || item.logo.height > 220)) errors.push(`${name} ${route}: oversized logo ${item.logo.width}x${item.logo.height}`);
      if (!item.navVisible || !item.mainVisible) errors.push(`${name} ${route}: nav/main not visible`);
      if (failedRequests.length) errors.push(`${name} ${route}: failed local requests ${JSON.stringify(failedRequests)}`);
      if (pageErrors.length) errors.push(`${name} ${route}: page errors ${pageErrors.join(" | ")}`);
      if (actionableConsoleErrors.length) errors.push(`${name} ${route}: actionable console errors ${actionableConsoleErrors.join(" | ")}`);
      if (route === "/be-a-viewer/shanghai/") {
        if (!item.shanghaiHistory) errors.push(`${name} ${route}: Shanghai history archive missing`);
        else {
          if (item.shanghaiHistory.width < item.clientWidth - 1) errors.push(`${name} ${route}: Shanghai history archive is not full width ${item.shanghaiHistory.width}/${item.clientWidth}`);
          if (!item.shanghaiHistory.parent.includes("shanghai-page-main")) errors.push(`${name} ${route}: Shanghai history archive is nested under ${item.shanghaiHistory.parent}`);
          if (!item.shanghaiHistory.previous.includes("shanghai-memory")) errors.push(`${name} ${route}: Shanghai history archive is not placed after the memory section`);
          if (item.shanghaiHistory.cards !== 19) errors.push(`${name} ${route}: expected 19 Shanghai history cards, found ${item.shanghaiHistory.cards}`);
          if (!item.shanghaiHistoryCard15) errors.push(`${name} ${route}: Shanghai history card 15 missing`);
          else if (item.shanghaiHistoryCard15.width < item.shanghaiHistoryCard15.gridWidth * .5) errors.push(`${name} ${route}: Shanghai history card 15 is too narrow ${item.shanghaiHistoryCard15.width}/${item.shanghaiHistoryCard15.gridWidth}`);
        }
      }
      if (route === "/be-a-viewer/hangzhou/" && name === "mobile") {
        if (!item.hangzhouMobile) errors.push(`${name} ${route}: Hangzhou mobile layout metrics missing`);
        else {
          if (!item.hangzhouMobile.stylesheet) errors.push(`${name} ${route}: Hangzhou mobile repair stylesheet not loaded`);
          if (!item.hangzhouMobile.coreScript) errors.push(`${name} ${route}: Hangzhou core interaction script not loaded`);
          if (item.hangzhouMobile.nightFigureWidth !== null && item.hangzhouMobile.nightContentWidth !== null && item.hangzhouMobile.nightFigureWidth < item.hangzhouMobile.nightContentWidth - 2) {
            errors.push(`${name} ${route}: night figure remains too narrow ${item.hangzhouMobile.nightFigureWidth}/${item.hangzhouMobile.nightContentWidth}`);
          }
          if (item.hangzhouMobile.nightObjectFit !== "contain") errors.push(`${name} ${route}: night image object-fit is ${item.hangzhouMobile.nightObjectFit}`);
          if (item.hangzhouMobile.posterHeight !== null && item.hangzhouMobile.posterHeight > height * .71) errors.push(`${name} ${route}: poster exceeds mobile viewport budget ${item.hangzhouMobile.posterHeight}/${height}`);
          if (item.hangzhouMobile.cityPortraitWidth !== null && item.hangzhouMobile.cityContentWidth !== null && item.hangzhouMobile.cityPortraitWidth < item.hangzhouMobile.cityContentWidth - 2) {
            errors.push(`${name} ${route}: city portrait remains too narrow ${item.hangzhouMobile.cityPortraitWidth}/${item.hangzhouMobile.cityContentWidth}`);
          }
        }
      }
      if (route === "/be-a-viewer/hangzhou/" && name === "ipad-css-landscape") {
        if (!item.hangzhouTablet) errors.push(`${name} ${route}: Hangzhou iPad layout metrics missing`);
        else {
          if (!item.hangzhouTablet.stylesheet) errors.push(`${name} ${route}: Hangzhou iPad repair stylesheet not loaded`);
          if (item.hangzhouTablet.nightObjectFits.length !== 3 || item.hangzhouTablet.nightObjectFits.some((value) => value !== "contain")) {
            errors.push(`${name} ${route}: night images are still cropped ${item.hangzhouTablet.nightObjectFits.join(",")}`);
          }
          if (item.hangzhouTablet.nightAspectRatios.length !== 3 || item.hangzhouTablet.nightAspectRatios.some((value) => value !== "auto")) {
            errors.push(`${name} ${route}: night images still have forced aspect ratios ${item.hangzhouTablet.nightAspectRatios.join(",")}`);
          }
          if (item.hangzhouTablet.posterHeight !== null && item.hangzhouTablet.posterHeight > height * .75) {
            errors.push(`${name} ${route}: poster exceeds iPad viewport budget ${item.hangzhouTablet.posterHeight}/${height}`);
          }
        }
      }
      results.push(item);

      if (route === "/" || (name === "desktop" && ["/radar/", "/cities/", "/essays/", "/research/", "/data/", "/index/"].includes(route)) || (route === "/be-a-viewer/hangzhou/" && ["mobile", "ipad-css-landscape"].includes(name))) {
        const label = route === "/" ? "home" : route.replaceAll("/", "") || "home";
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
