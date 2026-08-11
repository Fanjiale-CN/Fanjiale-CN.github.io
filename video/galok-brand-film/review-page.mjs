import path from 'node:path';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

const base = process.env.GALOK_CAPTURE_URL || 'http://127.0.0.1:4173';
const browser = await puppeteer.launch({args: chromium.args, executablePath: await chromium.executablePath(), headless: true});

const prepare = async (page) => {
  await page.setRequestInterception(true);
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.origin !== new URL(base).origin || request.resourceType() === 'media') request.abort();
    else request.continue();
  });
  await page.emulateMediaFeatures([{name: 'prefers-reduced-motion', value: 'reduce'}]);
  await page.goto(`${base}/about/`, {waitUntil: 'domcontentloaded', timeout: 30000});
  await page.evaluate(() => document.fonts.ready);
  await new Promise((resolve) => setTimeout(resolve, 600));
};

try {
  const desktop = await browser.newPage();
  await desktop.setViewport({width: 1440, height: 900, deviceScaleFactor: 1});
  await prepare(desktop);
  await desktop.screenshot({path: path.resolve('review/about-desktop-full.png'), fullPage: true});
  await desktop.close();

  const mobile = await browser.newPage();
  await mobile.setViewport({width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true});
  await prepare(mobile);
  await mobile.screenshot({path: path.resolve('review/about-mobile-top.png')});
  await mobile.evaluate(() => document.querySelector('#field-film')?.scrollIntoView());
  await new Promise((resolve) => setTimeout(resolve, 200));
  await mobile.screenshot({path: path.resolve('review/about-mobile-film.png')});
  await mobile.evaluate(() => document.querySelector('.about-contact-section')?.scrollIntoView());
  await new Promise((resolve) => setTimeout(resolve, 200));
  await mobile.screenshot({path: path.resolve('review/about-mobile-contact.png')});
  await mobile.close();
} finally {
  await browser.close();
}
