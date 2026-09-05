const fs = require('fs');
const path = require('node:path');
const BASE = path.join(__dirname, 'dongjing-meng-hua-lu') + path.sep;
const CSS_V = '?v=20260905-v8x1';
const JS_V = '?v=20260905-v8x1';
const DATE = '2026-09-06';

const nav = '<nav class="site-nav" aria-label="Primary navigation"><div class="nav-inner"><a class="brand" href="/"><img class="brand-mark" src="/assets/galok-symbol.svg" alt="" aria-hidden="true"><span class="brand-lockup"><b>GALOK</b><small>Field notes</small></span></a><div class="nav-links"><a href="/cities/">Cities</a><a href="/essays/">Essays</a><a href="/radar/">Radar</a><a href="/research/">Research</a><a href="/data/">Data</a><a href="/reading/" aria-current="page">Reading</a><a href="/work/">Work</a><a href="/index/">Index</a><a href="/about/">About</a></div></div></nav>';

const head = (n, en, theme, desc, zh, h1en) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="${theme}">
  <meta name="robots" content="index,follow">
  <meta name="galok:search" content="include">
  <meta name="description" content="${desc}">
  <link rel="canonical" href="https://www.galok.me/reading/dongjing-meng-hua-lu/${n}/">
  <title>${h1en} — Dongjing Meng Hua Lu — Galok</title>
  <link rel="icon" type="image/svg+xml" href="/assets/galok-symbol.svg">
  <link rel="stylesheet" href="/styles.css?v=20260902-qijic-system">
  <link rel="stylesheet" href="/reading/dongjing.css?v=20260901v1">
  <link rel="stylesheet" href="/reading/dongjing-15-17.css?v=20260902-typography">
  <link rel="stylesheet" href="/reading/dongjing-22-25.css?v=20260904-depth1">
  <link rel="stylesheet" href="/reading/dongjing-45-51.css${CSS_V}">
  <link rel="stylesheet" href="/reading/reading-type-system.css?v=20260903-entry25-fonts1">
  <meta property="og:title" content="${h1en} — Galok Reading">
  <meta property="og:description" content="${desc}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="https://www.galok.me/reading/dongjing-meng-hua-lu/${n}/">
  <meta property="og:image" content="https://www.galok.me/assets/reading/dongjing-meng-hua-lu-cover-v2.webp">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="https://www.galok.me/assets/reading/dongjing-meng-hua-lu-cover-v2.webp">
  <script>document.documentElement.classList.add('djx-js')<\/script>
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"Article","headline":"${h1en}","description":"${desc}","datePublished":"${DATE}","dateModified":"${DATE}","author":{"@type":"Organization","name":"Galok","url":"https://www.galok.me/"},"publisher":{"@type":"Organization","name":"Galok","url":"https://www.galok.me/"},"mainEntityOfPage":{"@type":"WebPage","@id":"https://www.galok.me/reading/dongjing-meng-hua-lu/${n}/"},"inLanguage":"en"}</script>
</head>`;

const buildPage = (n, cfg) => {
  const zh = cfg.zh;
  const h1en = cfg.h1en;
  const parts = [];
  parts.push(head(n, zh, cfg.theme, cfg.desc, zh, h1en));
  parts.push(`<body class="dongjing-page djx-page dj${n}-page">
<a class="skip-link" href="#main">Skip to main content</a>
${nav}
<main id="main" class="dj-shell" tabindex="-1">
  <header class="dj-entry-hero djx-hero dj${n}-hero" data-djx-reveal>
    <div class="dj-entry-copy">
      <div class="dj-entry-meta dj-meta"><span>READING / 003 / ENTRY ${n}</span><span>${cfg.volume}</span><span>${cfg.tags}</span></div>
      <div class="dj-entry-title"><p>DONGJING MENG HUA LU / <span lang="zh-Hant">${cfg.juan}</span></p><h1 class="dj-title-zh" lang="zh-Hant">${zh}</h1><h2>${cfg.deck}</h2></div>
      <div class="dj-entry-deck"><p>${cfg.deckLong}</p><a href="#${cfg.anchor}">${cfg.cta} ↓</a></div>
    </div>
    <figure class="dj-entry-source djx-source dj${n}-source">
${cfg.device}
      <figcaption><span><b>${cfg.deviceLabel}</b> / GALOK READING</span><span>${cfg.deviceCaption}</span></figcaption>
    </figure>
  </header>
`);
  // body sections from cfg.sections array
  for (const s of cfg.sections) parts.push(s);
  // prose
  parts.push(`  <section class="dj-entry-body">
    <aside class="dj-entry-side"><p>${n} / <span lang="zh-Hant">${zh}</span></p><span>${cfg.sideSummary}</span><a href="#${cfg.anchor}">↗ ${cfg.sideLink}</a><a href="#collation">↗ TEXT DETECTIVE</a></aside>
    <article class="dj-prose">`);
  let hn = 1;
  for (const u of cfg.units) {
    parts.push(`      <h2>${hn}. ${u.h2}</h2>
      <div class="dj${n}-text-unit" data-djx-reveal>
        <header><span>PRIMARY TEXT</span><span>${cfg.code}${String.fromCharCode(64 + hn)} / ${u.label}</span></header>
        <blockquote lang="zh-Hant">${u.text}</blockquote>
        <div class="dj-translation"><small>WORKING TRANSLATION</small><p>${u.trans}</p></div>
        <div class="dj-analysis"><small>GALOK READING</small><p>${u.analysis}</p></div>
      </div>`);
    hn++;
  }
  // collation
  parts.push(`      <section class="dj${n}-collation" id="collation" aria-labelledby="collation-title" data-djx-reveal>
        <small class="dj${n}-kicker">0${hn - 1} / TEXT DETECTIVE</small><h3 id="collation-title">${cfg.collTitle}</h3>
        <div class="dj${n}-collation-grid">`);
  for (const c of cfg.collations) {
    parts.push(`          <article><b lang="zh-Hant">${c.term}</b><span>${c.label}</span><p>${c.text}</p></article>`);
  }
  parts.push(`        </div>
      </section>`);
  // glossary
  parts.push(`      <section class="dj${n}-glossary" aria-label="Key terms" data-djx-reveal>`);
  for (const g of cfg.glossary) {
    parts.push(`        <article><b lang="zh-Hant">${g.zh}</b><small>${g.en}</small><p>${g.text}</p></article>`);
  }
  parts.push(`      </section>
    </article>
  </section>`);
  // exit
  parts.push(`  <section class="dj${n}-exit"><small class="dj${n}-kicker">${cfg.exitKicker}</small><strong>${cfg.exitStrong}</strong><p>${cfg.exitP}</p><q lang="zh-Hant">${cfg.exitQ}</q></section>`);
  // sources
  parts.push(`  <section class="djx-sources" aria-labelledby="sources-title">
    <header class="dj-v3-section-head"><div><small>0${hn} / SOURCE TRAIL</small><h2 id="sources-title">${cfg.sourcesH2}</h2></div><p>${cfg.sourcesP}</p></header>
  </section>`);
  // nav
  const prevNav = cfg.prev ? `<a href="/reading/dongjing-meng-hua-lu/${cfg.prev.n}/"><small>PREVIOUS</small><strong>${cfg.prev.n} / <span lang="zh-Hant">${cfg.prev.zh}</span></strong></a>` : `<span><small>PREVIOUS / QUEUED</small><strong>${cfg.prevLabel}</strong></span>`;
  const nextNav = cfg.next ? `<a href="/reading/dongjing-meng-hua-lu/${cfg.next.n}/"><small>NEXT</small><strong>${cfg.next.n} / <span lang="zh-Hant">${cfg.next.zh}</span></strong></a>` : `<span><small>NEXT / QUEUED</small><strong>${cfg.nextLabel}</strong></span>`;
  parts.push(`  <nav class="dj-v3-entry-nav" aria-label="Entry navigation">${prevNav}${nextNav}</nav>`);
  parts.push(`  <footer class="dj-footer"><span>READING / 003 / ${n} OF 86</span><a href="/reading/dongjing-meng-hua-lu/">READING ROOM</a></footer>
</main>
<script src="/reading/reading.js?v=20260901v3"></script>
<script src="/reading/dongjing-45-51.js${JS_V}"></script>
</body>
</html>`);
  return parts.join('\n');
};

// Entry configs would go here — each calling buildPage and writing to disk.
module.exports = { buildPage, head, nav, CSS_V, JS_V, DATE, BASE };
