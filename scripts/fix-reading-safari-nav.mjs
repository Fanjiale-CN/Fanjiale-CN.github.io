import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const write = (p, value) => fs.writeFileSync(path.join(root, p), value);

function replaceOrThrow(value, from, to, label) {
  if (!value.includes(from)) throw new Error(`Missing expected ${label}`);
  return value.replace(from, to);
}

// 1) Make the Reading library part of the static document so Safari/cache state
// cannot decide whether the primary Reading entrance exists.
{
  const file = 'reading/index.html';
  let html = read(file);

  if (!html.includes('/reading/reading-library.css')) {
    html = replaceOrThrow(
      html,
      '  <link rel="stylesheet" href="/reading/reading.css?v=20260830a">',
      '  <link rel="stylesheet" href="/reading/reading.css?v=20260830c">\n  <link rel="stylesheet" href="/reading/reading-library.css?v=20260830c">',
      'Reading stylesheet link'
    );
  } else {
    html = html.replace(/\/reading\/reading\.css\?v=[^"']+/g, '/reading/reading.css?v=20260830c');
    html = html.replace(/\/reading\/reading-library\.css\?v=[^"']+/g, '/reading/reading-library.css?v=20260830c');
  }

  html = html.replace(
    '<a href="#source-shelf">Follow the source trail <span aria-hidden="true">↓</span></a>',
    '<a href="#reading-library">Enter the library <span aria-hidden="true">↓</span></a>'
  );

  if (!html.includes('id="reading-library"')) {
    const marker = '    </header>\n\n    <section class="reading-time" aria-labelledby="reading-time-title">';
    const library = `    </header>\n\n    <section class="reading-library" id="reading-library" aria-labelledby="reading-library-title">\n      <header class="reading-library-head">\n        <p>01 / LIBRARY</p>\n        <div>\n          <h2 id="reading-library-title">Choose a text.</h2>\n          <span>Each text has its own reading room. Finished notes, open dossiers and future paths can grow there without crowding the main Reading page.</span>\n        </div>\n      </header>\n      <div class="reading-library-stage">\n        <div class="reading-library-shelf" aria-label="Reading library shelf">\n          <a class="reading-volume reading-volume--active" href="/reading/salt-and-iron/" aria-label="Open Yantie Lun reading room">\n            <span class="reading-volume-top"><span>READING / 001</span><span>81 BCE / CHANG'AN</span></span>\n            <span class="reading-volume-title"><strong>鹽鐵論</strong><b>YANTIE LUN</b><small>Salt, iron, fiscal pressure and the reach of the Western Han state.</small></span>\n            <span class="reading-volume-foot"><span>OPEN DOSSIER</span><strong>ENTER READING ROOM ↗</strong></span>\n          </a>\n          <article class="reading-volume reading-volume--guanzi reading-volume--queued" aria-label="Guanzi reading room in research queue">\n            <span class="reading-volume-top"><span>UP NEXT</span><span>TEXT LAYERS</span></span>\n            <span class="reading-volume-title"><strong>管子</strong><b>GUANZI</b><small>Prices, grain, hoarding and the Light &amp; Heavy chapters.</small></span>\n            <span class="reading-volume-foot"><span>RESEARCH QUEUE</span><strong>ROOM NOT OPEN</strong></span>\n          </article>\n          <article class="reading-volume reading-volume--dongjing reading-volume--queued" aria-label="Dongjing Meng Hua Lu reading room in research queue">\n            <span class="reading-volume-top"><span>UP NEXT</span><span>12TH C. / KAIFENG</span></span>\n            <span class="reading-volume-title"><strong>東京夢華錄</strong><b>DONGJING MENG HUA LU</b><small>Night markets, services and the commercial density of a remembered capital.</small></span>\n            <span class="reading-volume-foot"><span>RESEARCH QUEUE</span><strong>ROOM NOT OPEN</strong></span>\n          </article>\n        </div>\n      </div>\n      <div class="reading-library-note"><span>LIBRARY / TEXT FIRST</span><span>One shelf on the homepage. Each book gets its own room.</span></div>\n    </section>\n\n    <section class="reading-time" aria-labelledby="reading-time-title">`;
    html = replaceOrThrow(html, marker, library, 'Reading hero/library insertion point');
  }

  html = html.replace('<p>01 / IN TIME</p>', '<p>02 / IN TIME</p>');
  html = html.replace('<p>02 / READ BY QUESTION</p>', '<p>03 / READ BY QUESTION</p>');
  html = html.replace('<p>03 / READING INDEX</p>', '<p>04 / READING INDEX</p>');
  html = html.replace('<p>04 / SOURCE SHELF</p>', '<p>05 / SOURCE SHELF</p>');
  html = html.replace('<p>05 / HOW WE READ</p>', '<p>06 / HOW WE READ</p>');

  html = html.replace(
    '<button class="reading-index-row is-active" type="button" data-reading-preview="salt">\n            <span>001</span><span><b>YANTIELUN</b><small>鹽鐵論 / Salt &amp; Iron</small></span><span>81 BCE</span><span>State / Market</span><span>Source audit</span>\n          </button>',
    '<a class="reading-index-row is-active" href="/reading/salt-and-iron/" data-reading-preview="salt">\n            <span>001</span><span><b>YANTIELUN</b><small>鹽鐵論 / Salt &amp; Iron</small></span><span>81 BCE</span><span>State / Market</span><span>Open dossier ↗</span>\n          </a>'
  );

  write(file, html);
}

// 2) Harden global navigation: preserve complete static navigation instead of
// rewriting it on every load. This removes the stale-JS Safari failure mode.
{
  const file = 'script.js';
  let js = read(file);
  const oldBlock = `    const currentPath = window.location.pathname;\n    links.replaceChildren(...primaryLinks.map((item) => {\n      const link = document.createElement("a");\n      link.href = item.href;\n      link.textContent = item.label;\n      const matches = item.matches || [item.match];\n      if (matches.some((match) => currentPath.startsWith(match))) link.setAttribute("aria-current", "page");\n      return link;\n    }));\n    links.id = "primary-navigation-links";`;
  const newBlock = `    const currentPath = window.location.pathname;\n    const staticLinks = Array.from(links.querySelectorAll("a"));\n    const staticHrefs = new Set(staticLinks.map((link) => link.getAttribute("href")));\n    const staticNavComplete = primaryLinks.every((item) => staticHrefs.has(item.href));\n\n    if (!staticNavComplete) {\n      links.replaceChildren(...primaryLinks.map((item) => {\n        const link = document.createElement("a");\n        link.href = item.href;\n        link.textContent = item.label;\n        return link;\n      }));\n    }\n\n    links.querySelectorAll("a").forEach((link) => {\n      link.removeAttribute("aria-current");\n      const item = primaryLinks.find((candidate) => candidate.href === link.getAttribute("href"));\n      if (!item) return;\n      const matches = item.matches || [item.match];\n      if (matches.some((match) => currentPath.startsWith(match))) link.setAttribute("aria-current", "page");\n    });\n    links.id = "primary-navigation-links";`;
  js = replaceOrThrow(js, oldBlock, newBlock, 'global nav replacement block');
  write(file, js);
}

// 3) Bust the old shared JS cache key on every HTML route.
{
  const htmlFiles = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'pagefind') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.endsWith('.html')) htmlFiles.push(full);
    }
  }
  walk(root);
  let touched = 0;
  for (const full of htmlFiles) {
    let html = fs.readFileSync(full, 'utf8');
    const before = html;
    html = html.replace(/\/script\.js\?v=[^"']+/g, '/script.js?v=reading-nav-20260830c');
    html = html.replace(/\/reading\/reading\.js\?v=[^"']+/g, '/reading/reading.js?v=20260830c');
    if (html !== before) {
      fs.writeFileSync(full, html);
      touched += 1;
    }
  }
  console.log(`Cache-busted shared script references in ${touched} HTML files.`);
}

// 4) Sanity checks for the exact user-visible regressions.
{
  const reading = read('reading/index.html');
  const rootHtml = read('index.html');
  const radar = read('radar/index.html');
  const globalJs = read('script.js');
  const assertions = [
    [reading.includes('id="reading-library"'), 'Reading library is static HTML'],
    [reading.includes('href="/reading/salt-and-iron/"'), 'Reading 001 has a direct entrance'],
    [reading.includes('/reading/reading-library.css?v=20260830c'), 'Reading library CSS is statically linked'],
    [rootHtml.includes('<a href="/reading/">Reading</a>'), 'Home static nav includes Reading'],
    [radar.includes('<a href="/reading/">Reading</a>'), 'Radar static nav includes Reading'],
    [globalJs.includes('staticNavComplete'), 'Global nav preserves complete static navigation'],
    [!rootHtml.includes('batch4-engineering-20260824'), 'Home no longer references stale script cache key'],
    [!reading.includes('batch4-engineering-20260824'), 'Reading no longer references stale script cache key']
  ];
  const failed = assertions.filter(([ok]) => !ok).map(([, label]) => label);
  if (failed.length) throw new Error(`Repair assertions failed: ${failed.join('; ')}`);
  assertions.forEach(([, label]) => console.log(`PASS ${label}`));
}
