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
      sourceHanReady: document.fonts.check('16px "Galok Source Han Serif TC"', "相國寺內萬姓交易 大內前州橋東街巷 本議 力耕 東京 釋名 卷三"),
      qijicBookTitleReady: document.fonts.check('16px "Galok QIJIC Book Title"', "東京夢華錄 鹽鐵論 管子"),
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

function expectFamily(result, route, key, expected) {
  const node = result.nodes[key];
  if (!node) failures.push(`${route}: missing ${key} probe`);
  else if (!node.fontFamily.includes(expected)) failures.push(`${route} ${key}: expected ${expected}, got ${node.fontFamily}`);
}

try {
  const entry18 = await inspect("/reading/dongjing-meng-hua-lu/18/", {
    entryTitle: ".dj-entry-title .dj-title-zh",
    primaryText: ".dj-v3-text-unit blockquote",
    thresholdChinese: ".dj18-threshold em[lang='zh-Hant']",
    previous: ".dj-v3-entry-nav small",
    mixedEntryKicker: ".dj-entry-title p",
    witnessCaption: ".dj-entry-source figcaption"
  });
  if (!entry18.stylesheets.some((href) => href.includes("reading-type-system.css"))) {
    failures.push("Dongjing 18: canonical reading-type-system.css is not loaded");
  }
  if (!entry18.sourceHanReady) failures.push("Dongjing 18: Galok Source Han Serif TC is not available after document.fonts.ready");
  if (!entry18.bagnardReady) failures.push("Dongjing 18: Galok Bagnard is not available after document.fonts.ready");
  for (const key of ["entryTitle", "primaryText", "thresholdChinese", "mixedEntryKicker", "witnessCaption"]) expectFamily(entry18, "Dongjing 18", key, "Galok Source Han Serif TC");
  expectFamily(entry18, "Dongjing 18", "previous", "Galok Bagnard");

  const dongjingRoom = await inspect("/reading/dongjing-meng-hua-lu/", {
    bookTitle: ".reading-book-title-zh",
    drawerChinese: ".dj-drawer-entry-title small[lang='zh-Hant']",
    termLabel: ".dj-term-note > small",
    termBody: ".dj-term-note p",
    coverCaption: ".dj-room-art figcaption"
  });
  if (!dongjingRoom.qijicBookTitleReady) failures.push("Dongjing room: Galok QIJIC Book Title is not available after document.fonts.ready");
  expectFamily(dongjingRoom, "Dongjing room", "bookTitle", "Galok QIJIC Book Title");
  for (const key of ["drawerChinese", "termLabel", "termBody", "coverCaption"]) expectFamily(dongjingRoom, "Dongjing room", key, "Galok Source Han Serif TC");

  const yantieRoom = await inspect("/reading/salt-and-iron/", {
    bookTitle: ".reading-book-title-zh",
    chapterTitle: ".reading-drawer-entry-zh"
  });
  if (!yantieRoom.qijicBookTitleReady) failures.push("Yantie room: Galok QIJIC Book Title is not available after document.fonts.ready");
  expectFamily(yantieRoom, "Yantie room", "bookTitle", "Galok QIJIC Book Title");
  expectFamily(yantieRoom, "Yantie room", "chapterTitle", "Galok Source Han Serif TC");

  const yantieChapter = await inspect("/reading/salt-and-iron/01/", {
    chapterChineseTitle: ".reading-note-zh",
    primaryText: "blockquote[lang='zh-Hant']",
    navTitle: ".reading-note-nav strong"
  });
  for (const key of ["chapterChineseTitle", "primaryText"]) expectFamily(yantieChapter, "Yantie 01", key, "Galok Source Han Serif TC");
  expectFamily(yantieChapter, "Yantie 01", "navTitle", "Galok Bagnard");

  if (failures.length) {
    console.error("Reading typography regression detected:\n" + failures.map((item) => `- ${item}`).join("\n"));
    process.exitCode = 1;
  } else {
    console.log("PASS: Source Han Serif TC resolves ordinary and mixed-label Chinese; QIJIC is limited to explicit book titles; Latin display families remain intact.");
    console.log(JSON.stringify({ entry18, dongjingRoom, yantieRoom, yantieChapter }, null, 2));
  }
} finally {
  await browser.close();
}
