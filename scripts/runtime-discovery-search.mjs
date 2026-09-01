import puppeteer from "puppeteer-core";

const baseUrl = process.env.BASE_URL || "http://127.0.0.1:4173";
const chromePath = process.env.CHROME_PATH || "/usr/bin/google-chrome";
const tests = [
  ["gatekeeping", "/essays/the-curators-curse/", "essay"],
  ["franchisor", "/research/fast-metabolism-economy/", "research"],
  ["monopsony", "/research/who-captures-growth/", "research"],
  ["Galaxy SOHO", "/be-a-viewer/beijing/", "city"],
  ["鼓浪屿", "/be-a-viewer/xiamen/", "city"],
  ["source-visible ledger", "/radar/", "radar"],
  ["youth unemployment", "/data/", "data"],
  ["Ghost Market", "/reading/dongjing-meng-hua-lu/12/", "reading"],
  ["zhengdian", "/reading/dongjing-meng-hua-lu/13/", "reading"],
  ["劄客", "/reading/dongjing-meng-hua-lu/14/", "reading"]
];

const browser = await puppeteer.launch({ executablePath: chromePath, headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage();
try {
  await page.goto(`${baseUrl}/index/`, { waitUntil: "networkidle0" });
  await page.waitForFunction(() => document.documentElement.dataset.discoveryReady === "true", { timeout: 30000 });
  for (const [query, expectedUrl, type] of tests) {
    await page.locator("[data-archive-search]").fill(query);
    await page.waitForFunction((expected) => [...document.querySelectorAll("[data-archive-results] a")].some((link) => link.getAttribute("href") === expected), {}, expectedUrl);
    const matched = await page.$$eval("[data-archive-results] a", (links, expected) => links.some((link) => link.getAttribute("href") === expected), expectedUrl);
    if (!matched) throw new Error(`Search for ${query} did not return ${expectedUrl}`);
    if (query === "gatekeeping") {
      await page.locator('[data-archive-filter="essay"]').click();
      await page.waitForFunction(() => [...document.querySelectorAll("[data-archive-results] a")].every((link) => link.dataset.archiveResultType === "essay"));
      await page.locator('[data-archive-filter="all"]').click();
    }
    console.log(`Search check passed: ${type} / ${query}`);
  }
} finally {
  await browser.close();
}
