import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { AxePuppeteer } from "@axe-core/puppeteer";
import puppeteer from "puppeteer-core";

const root = fileURLToPath(new URL("../", import.meta.url));
const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:4173";
const routes = ["/", "/cities/", "/essays/", "/radar/", "/research/", "/research/fast-metabolism-economy/", "/data/", "/index/"];
const accessibilityBaseline = JSON.parse(readFileSync(join(root, "config", "runtime-a11y-baseline.json"), "utf8"));
const chrome = process.env.CHROME_PATH ?? ["/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium", "/usr/bin/chromium-browser"].find(existsSync);
const errors = [];
const warnings = [];
const reports = [];

if (!chrome) throw new Error("Chrome executable not found. Set CHROME_PATH for the runtime audit.");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function analyzeWithRetry(page, route) {
  const attempts = 3;
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await page.waitForFunction(() => document.readyState === "complete", { timeout: 10_000 });
      await sleep(attempt === 1 ? 150 : 500 * attempt);
      return await new AxePuppeteer(page).analyze();
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      const transientFrameError = message.includes("Page/Frame is not ready") || message.includes("detached Frame");
      if (!transientFrameError || attempt === attempts || page.isClosed()) throw error;
      console.warn(`[a11y] ${route}: transient frame race on attempt ${attempt}/${attempts}; retrying.`);
    }
  }

  throw lastError;
}

const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
try {
  for (const route of routes) {
    const page = await browser.newPage();
    try {
      await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
      const response = await page.goto(new URL(route, baseUrl).href, { waitUntil: "networkidle2", timeout: 60_000 });
      const result = { route, status: response?.status() ?? null, errors: [], warnings: [], axe: { serious: 0, critical: 0, moderate: 0 } };
      if (!response?.ok()) result.errors.push(`page returned ${response?.status() ?? "no response"}`);
      const structure = await page.evaluate(() => {
        const ids = [...document.querySelectorAll("[id]")].map((element) => element.id);
        const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
        const headings = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((heading) => Number(heading.tagName.slice(1)));
        const headingSkips = headings.filter((level, index) => index > 0 && level - headings[index - 1] > 1);
        const skip = document.querySelector("a.skip-link[href^='#']");
        const skipTarget = skip ? document.querySelector(skip.getAttribute("href")) : null;
        const unlabeled = [...document.querySelectorAll("input, select, textarea")].filter((control) => {
          if (["hidden", "submit", "button", "reset"].includes(control.type)) return false;
          if (control.labels?.length || control.getAttribute("aria-label") || control.getAttribute("aria-labelledby")) return false;
          return true;
        }).map((control) => control.outerHTML.slice(0, 160));
        const focusableInInert = [...document.querySelectorAll("[inert] a, [inert] button, [inert] input, [inert] select, [inert] textarea, [inert] [tabindex]")]
          .filter((element) => element.getAttribute("tabindex") !== "-1").length;
        const activeAnimationCount = [...document.getAnimations()].filter((animation) => animation.playState === "running").length;
        return { duplicateIds: [...new Set(duplicateIds)], headingSkips, hasSkipTarget: Boolean(skip && skipTarget), unlabeled, focusableInInert, activeAnimationCount };
      });
      if (structure.duplicateIds.length) result.errors.push(`duplicate IDs: ${structure.duplicateIds.join(", ")}`);
      if (!structure.hasSkipTarget) result.errors.push("skip link or target missing at runtime");
      if (structure.unlabeled.length) result.errors.push(`unlabeled form controls: ${structure.unlabeled.length}`);
      if (structure.focusableInInert) result.errors.push(`${structure.focusableInInert} focusable controls remain inside inert content`);
      if (structure.headingSkips.length) result.warnings.push(`heading level jumps: ${structure.headingSkips.join(", ")}`);
      if (structure.activeAnimationCount) result.warnings.push(`${structure.activeAnimationCount} animations still run with reduced motion`);

      const axe = await analyzeWithRetry(page, route);
      for (const violation of axe.violations) {
        result.axe[violation.impact] = (result.axe[violation.impact] ?? 0) + violation.nodes.length;
        const summary = `${violation.id}: ${violation.help} (${violation.nodes.length} nodes)`;
        const allowedNodes = accessibilityBaseline[route]?.[violation.id] ?? 0;
        if (violation.impact === "critical" || (violation.impact === "serious" && violation.nodes.length > allowedNodes)) {
          result.errors.push(summary);
        } else if (violation.impact === "serious") {
          result.warnings.push(`${summary}; approved baseline maximum ${allowedNodes}`);
        } else result.warnings.push(summary);
      }
      errors.push(...result.errors.map((message) => `${route} ${message}`));
      warnings.push(...result.warnings.map((message) => `${route} ${message}`));
      reports.push(result);
    } finally {
      if (!page.isClosed()) await page.close();
    }
  }
} finally {
  await browser.close();
}

const result = { baseUrl, routes: reports, errors, warnings };
mkdirSync(join(root, "artifacts", "ci"), { recursive: true });
writeFileSync(join(root, "artifacts", "ci", "runtime-accessibility.json"), `${JSON.stringify(result, null, 2)}\n`);
if (warnings.length) console.warn(warnings.join("\n"));
if (errors.length) { console.error(`Runtime accessibility failed (${errors.length})\n${errors.join("\n")}`); process.exit(1); }
console.log(`Runtime accessibility passed: ${reports.length} representative pages, no critical issues or baseline regressions.`);
