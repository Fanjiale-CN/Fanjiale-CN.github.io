import puppeteer from "puppeteer-core";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:4173";
const chrome = process.env.CHROME_PATH;
if (!chrome) throw new Error("Chrome executable not found. Set CHROME_PATH.");

const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"]
});

const failures = [];

async function inspect(route, selectors) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  const response = await page.goto(new URL(route, baseUrl).href, { waitUntil: "networkidle2", timeout: 60_000 });
  if (!response?.ok()) failures.push(`${route}: HTTP ${response?.status()}`);
  await page.evaluate(() => document.fonts.ready);
  const result = await page.evaluate((selectorMap) => {
    const output = {
      stylesheets: [...document.styleSheets].map((sheet) => sheet.href).filter(Boolean),
      bagnardReady: document.fonts.check('16px "Galok Bagnard"', "PREVIOUS FOOD SOUP STEAMED BUNS"),
      qijicReady: document.fonts.check('16px "Galok QIJIC Reading"', "大內前州橋東街巷 相國寺內萬姓交易 鹽鐵論"),
      nodes: {}
    };
    for (const [name, selector] of Object.entries(selectorMap)) {
      const element = document.querySelector(selector);
      if (!element) {
        output.nodes[name] = null;
        continue;
      }
      const style = getComputedStyle(element);
      output.nodes[name] = {
        text: element.textContent.trim(),
        fontFamily: style.fontFamily,
        fontWeight: style.fontWeight,
        fontSize: style.fontSize
      };
    }
    return output;
  }, selectors);
  await page.close();
  return result;
}

try {
  const dongjing = await inspect("/reading/dongjing-meng-hua-lu/17/", {
    category: ".dj17-landing article small",
    value: ".dj17-landing article b",
    previous: ".dj-v3-entry-nav small",
    chinese: ".dj17-landing article span[lang='zh-Hant']"
  });

  if (!dongjing.stylesheets.some((href) => href.includes("reading-display-20260902.css"))) {
    failures.push("Dongjing 17: cache-busted Reading display stylesheet is not loaded");
  }
  if (!dongjing.bagnardReady) failures.push("Dongjing 17: Galok Bagnard is not available after document.fonts.ready");
  if (!dongjing.qijicReady) failures.push("Dongjing 17: supplied Galok QIJIC Reading subset is not available after document.fonts.ready");
  for (const key of ["category", "value", "previous"]) {
    const node = dongjing.nodes[key];
    if (!node) failures.push(`Dongjing 17: missing ${key} probe`);
    else if (!node.fontFamily.startsWith('"Galok Bagnard"') && !node.fontFamily.startsWith("Galok Bagnard")) {
      failures.push(`Dongjing 17 ${key}: expected Galok Bagnard first, got ${node.fontFamily}`);
    }
  }
  if (!dongjing.nodes.chinese?.fontFamily.includes("Galok QIJIC Reading")) {
    failures.push(`Dongjing 17 Chinese annotation: expected supplied QIJIC display stack, got ${dongjing.nodes.chinese?.fontFamily ?? "missing"}`);
  }

  const yantie = await inspect("/reading/salt-and-iron/01/", {
    previous: ".reading-note-nav small",
    navTitle: ".reading-note-nav strong",
    chineseTitle: ".reading-note-zh"
  });
  if (!yantie.bagnardReady) failures.push("Yantie 01: Galok Bagnard is not available after document.fonts.ready");
  if (!yantie.qijicReady) failures.push("Yantie 01: supplied Galok QIJIC Reading subset is not available after document.fonts.ready");
  for (const key of ["previous", "navTitle"]) {
    const node = yantie.nodes[key];
    if (!node) failures.push(`Yantie 01: missing ${key} probe`);
    else if (!node.fontFamily.startsWith('"Galok Bagnard"') && !node.fontFamily.startsWith("Galok Bagnard")) {
      failures.push(`Yantie 01 ${key}: expected Galok Bagnard first, got ${node.fontFamily}`);
    }
  }
  if (!yantie.nodes.chineseTitle?.fontFamily.includes("Galok QIJIC Reading")) {
    failures.push(`Yantie 01 Chinese title: expected supplied QIJIC display stack, got ${yantie.nodes.chineseTitle?.fontFamily ?? "missing"}`);
  }

  if (failures.length) {
    console.error("Reading display font regression detected:\n" + failures.map((item) => `- ${item}`).join("\n"));
    process.exitCode = 1;
  } else {
    console.log("PASS: Reading display fonts resolve to Bagnard for Latin UI and supplied QIJIC for CJK display text.");
    console.log(JSON.stringify({ dongjing, yantie }, null, 2));
  }
} finally {
  await browser.close();
}
