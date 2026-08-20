import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

const base = process.env.GALOK_CAPTURE_URL || 'http://127.0.0.1:4173';
const output = path.resolve('public/captures');
const pages = [
  ['home', '/'],
  ['viewer', '/cities/'],
  ['works', '/work/'],
  ['notes', '/essays/'],
  ['data', '/data/'],
  ['archive', '/index/'],
  ['about', '/about/'],
  ['works-panel', '/work/', 900, 1080],
  ['notes-panel', '/essays/', 900, 1080],
];

await fs.mkdir(output, {recursive: true});

const browser = await puppeteer.launch({
  args: chromium.args,
  defaultViewport: null,
  executablePath: await chromium.executablePath(),
  headless: true,
});

try {
  for (const [name, route, width = 1920, height = 1080] of pages) {
    const page = await browser.newPage();
    await page.setViewport({width, height, deviceScaleFactor: 2});
    await page.emulateMediaFeatures([{name: 'prefers-reduced-motion', value: 'reduce'}]);
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const url = new URL(request.url());
      const local = url.origin === new URL(base).origin;
      if (!local || request.resourceType() === 'media') request.abort();
      else request.continue();
    });
    await page.goto(`${base}${route}`, {waitUntil: 'domcontentloaded', timeout: 30000});
    await page.evaluate(async () => {
      await document.fonts.ready;
      document.querySelectorAll('video').forEach((video) => video.pause());
      window.scrollTo(0, 0);
    });
    await new Promise((resolve) => setTimeout(resolve, 700));
    await page.screenshot({path: path.join(output, `${name}.png`), type: 'png'});
    const layout = await page.evaluate(() => {
      const selectors = ['nav', 'header', 'main', 'h1', 'video', 'section'];
      const blocks = [];
      selectors.forEach((selector) => {
        document.querySelectorAll(selector).forEach((element, index) => {
          if (index > 11) return;
          const rect = element.getBoundingClientRect();
          if (rect.width < 2 || rect.height < 2) return;
          blocks.push({
            selector,
            index,
            x: Math.round(rect.x),
            y: Math.round(rect.y + window.scrollY),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          });
        });
      });
      return {
        url: location.href,
        viewport: {width: innerWidth, height: innerHeight, dpr: devicePixelRatio},
        pageHeight: document.documentElement.scrollHeight,
        title: document.title,
        blocks,
      };
    });
    await fs.writeFile(path.join(output, `${name}.json`), `${JSON.stringify(layout, null, 2)}\n`);
    await page.close();
  }
} finally {
  await browser.close();
}
