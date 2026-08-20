import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

// Vertical 9:16 capture for the Galok brand film vertical edition.
const base = process.env.GALOK_CAPTURE_URL || 'http://127.0.0.1:4173';
const output = path.resolve('public/captures');
// name, route, width, height — 1080x1920 full page evidence + 607x1080 panels
const pages = [
  ['home-v916', '/', 1080, 1920],
  ['viewer-v916', '/cities/', 1080, 1920],
  ['works-v916', '/work/', 1080, 1920],
  ['notes-v916', '/essays/', 1080, 1920],
  ['data-v916', '/data/', 1080, 1920],
  ['archive-v916', '/index/', 1080, 1920],
  ['themes-v916', '/themes/', 1080, 1920],
  ['works-panel-v916', '/work/', 607, 1080],
  ['notes-panel-v916', '/essays/', 607, 1080],
  ['themes-panel-v916', '/themes/', 607, 1080],
];

await fs.mkdir(output, { recursive: true });
const browser = await puppeteer.launch({
  args: chromium.args,
  defaultViewport: null,
  executablePath: await chromium.executablePath(),
  headless: true,
});
try {
  for (const [name, route, width, height] of pages) {
    const page = await browser.newPage();
    await page.setViewport({ width, height, deviceScaleFactor: 2 });
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const url = new URL(request.url());
      const local = url.origin === new URL(base).origin;
      if (!local || request.resourceType() === 'media') request.abort();
      else request.continue();
    });
    await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.evaluate(async () => {
      await document.fonts.ready;
      document.querySelectorAll('video').forEach((video) => video.pause());
      window.scrollTo(0, 0);
    });
    await new Promise((resolve) => setTimeout(resolve, 700));
    await page.screenshot({ path: path.join(output, `${name}.png`), type: 'png' });
    console.log(`captured ${name}`);
    await page.close();
  }
} finally {
  await browser.close();
}
