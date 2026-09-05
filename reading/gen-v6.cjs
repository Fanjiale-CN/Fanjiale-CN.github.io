const fs = require('fs');
const BASE = 'D:/GitHub/Fanjiale-CN.github.io/reading/dongjing-meng-hua-lu/';
const nav = '<nav class="site-nav" aria-label="Primary navigation"><div class="nav-inner"><a class="brand" href="/"><img class="brand-mark" src="/assets/galok-symbol.svg" alt="" aria-hidden="true"><span class="brand-lockup"><b>GALOK</b><small>Field notes</small></span></a><div class="nav-links"><a href="/cities/">Cities</a><a href="/essays/">Essays</a><a href="/radar/">Radar</a><a href="/research/">Research</a><a href="/data/">Data</a><a href="/reading/" aria-current="page">Reading</a><a href="/work/">Work</a><a href="/index/">Index</a><a href="/about/">About</a></div></div></nav>';
const HEAD = `  <link rel="stylesheet" href="/styles.css?v=20260902-qijic-system">
  <link rel="stylesheet" href="/reading/dongjing.css?v=20260901v1">
  <link rel="stylesheet" href="/reading/dongjing-15-17.css?v=20260902-typography">
  <link rel="stylesheet" href="/reading/dongjing-22-25.css?v=20260904-depth1">
  <link rel="stylesheet" href="/reading/dongjing-45-51.css?v=20260906-v8x1">
  <link rel="stylesheet" href="/reading/reading-type-system.css?v=20260903-entry25-fonts1">`;
const FOOT = `<script src="/reading/reading.js?v=20260901v3"></script>
<script src="/reading/dongjing-45-51.js?v=20260906-v8x1"></script>`;
const D = '2026-09-06';

function page(n, cfg) {
  const units = cfg.units.map((u, i) => `      <h2>${i + 1}. ${u.h2}</h2>
      <div class="dj${n}-text-unit" data-djx-reveal>
        <header><span>PRIMARY TEXT</span><span>${cfg.code}${String.fromCharCode(65 + i)} / ${u.label}</span></header>
        <blockquote lang="zh-Hant">${u.text}</blockquote>
        <div class="dj-translation"><small>WORKING TRANSLATION</small><p>${u.trans}</p></div>
        <div class="dj-analysis"><small>GALOK READING</small><p>${u.analysis}</p></div>
      </div>`).join('\n\n');
  const colls = cfg.coll.map(c => `          <article><b lang="zh-Hant">${c.t}</b><span>${c.l}</span><p>${c.p}</p></article>`).join('\n');
  const gloss = cfg.glos.map(g => `        <article><b lang="zh-Hant">${g.z}</b><small>${g.e}</small><p>${g.p}</p></article>`).join('\n');
  const prevN = cfg.prev ? `<a href="/reading/dongjing-meng-hua-lu/${cfg.prev[0]}/"><small>PREVIOUS</small><strong>${cfg.prev[0]} / <span lang="zh-Hant">${cfg.prev[1]}</span></strong></a>` : `<span><small>PREVIOUS / QUEUED</small><strong>${cfg.prevL || ''}</strong></span>`;
  const nextN = cfg.next ? `<a href="/reading/dongjing-meng-hua-lu/${cfg.next[0]}/"><small>NEXT</small><strong>${cfg.next[0]} / <span lang="zh-Hant">${cfg.next[1]}</span></strong></a>` : `<span><small>NEXT / QUEUED</small><strong>${cfg.nextL || ''}</strong></span>`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="${cfg.theme}"><meta name="robots" content="noindex,follow"><meta name="galok:search" content="include">
  <meta name="description" content="${cfg.desc}">
  <link rel="canonical" href="https://www.galok.me/reading/dongjing-meng-hua-lu/${n}/">
  <title>${cfg.h1en} — Dongjing Meng Hua Lu — Galok</title>
  <link rel="icon" type="image/svg+xml" href="/assets/galok-symbol.svg">
${HEAD}
  <meta property="og:title" content="${cfg.h1en} — Galok Reading"><meta property="og:description" content="${cfg.desc}">
  <meta property="og:type" content="article"><meta property="og:url" content="https://www.galok.me/reading/dongjing-meng-hua-lu/${n}/">
  <meta property="og:image" content="https://www.galok.me/assets/reading/dongjing-meng-hua-lu-cover-v2.webp">
  <meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="https://www.galok.me/assets/reading/dongjing-meng-hua-lu-cover-v2.webp">
  <script>document.documentElement.classList.add('djx-js')</script>
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"Article","headline":"${cfg.h1en}","description":"${cfg.desc}","datePublished":"${D}","dateModified":"${D}","author":{"@type":"Organization","name":"Galok","url":"https://www.galok.me/"},"publisher":{"@type":"Organization","name":"Galok","url":"https://www.galok.me/"},"mainEntityOfPage":{"@type":"WebPage","@id":"https://www.galok.me/reading/dongjing-meng-hua-lu/${n}/"},"inLanguage":"en"}</script>
</head>
<body class="dongjing-page djx-page dj${n}-page">
<a class="skip-link" href="#main">Skip to main content</a>
${nav}
<main id="main" class="dj-shell" tabindex="-1">
  <header class="dj-entry-hero djx-hero dj${n}-hero" data-djx-reveal>
    <div class="dj-entry-copy">
      <div class="dj-entry-meta dj-meta"><span>READING / 003 / ENTRY ${n}</span><span>VOLUME VI / ${n - 43} OF 8</span><span>${cfg.tags}</span></div>
      <div class="dj-entry-title"><p>DONGJING MENG HUA LU / <span lang="zh-Hant">卷六</span></p><h1 class="dj-title-zh" lang="zh-Hant">${cfg.zh}</h1><h2>${cfg.deck}</h2></div>
      <div class="dj-entry-deck"><p>${cfg.deckLong}</p><a href="#${cfg.anchor}">${cfg.cta} ↓</a></div>
    </div>
    <figure class="dj-entry-source djx-source dj${n}-source">
${cfg.device}
      <figcaption><span><b>${cfg.devLabel}</b> / GALOK READING</span><span>${cfg.devCap}</span></figcaption>
    </figure>
  </header>
${cfg.preSections || ''}
  <section class="dj-entry-body">
    <aside class="dj-entry-side"><p>${n} / <span lang="zh-Hant">${cfg.zh}</span></p><span>${cfg.sideSum}</span><a href="#${cfg.anchor}">↗ ${cfg.sideLink}</a><a href="#collation">↗ TEXT DETECTIVE</a></aside>
    <article class="dj-prose">
${units}
      <section class="dj${n}-collation" id="collation" aria-labelledby="collation-title" data-djx-reveal>
        <small class="dj${n}-kicker">0${cfg.units.length + 1} / TEXT DETECTIVE</small><h3 id="collation-title">${cfg.collH3}</h3>
        <div class="dj${n}-collation-grid">
${colls}
        </div>
      </section>
      <section class="dj${n}-glossary" aria-label="Key terms" data-djx-reveal>
${gloss}
      </section>
    </article>
  </section>
  <section class="dj${n}-exit"><small class="dj${n}-kicker">${cfg.exitK}</small><strong>${cfg.exitS}</strong><p>${cfg.exitP}</p><q lang="zh-Hant">${cfg.exitQ}</q></section>
  <section class="djx-sources" aria-labelledby="sources-title">
    <header class="dj-v3-section-head"><div><small>0${cfg.units.length + 2} / SOURCE TRAIL</small><h2 id="sources-title">${cfg.srcH2}</h2></div><p>${cfg.srcP}</p></header>
  </section>
  <nav class="dj-v3-entry-nav" aria-label="Entry navigation">${prevN}${nextN}</nav>
  <footer class="dj-footer"><span>READING / 003 / ${n} OF 86</span><a href="/reading/dongjing-meng-hua-lu/">READING ROOM</a></footer>
</main>
${FOOT}
</body>
</html>`;
}

// ---- Entry configs ----
const configs = require('./dongjing-45-51-data.cjs');
for (const [n, cfg] of Object.entries(configs)) {
  fs.writeFileSync(BASE + n + '/index.html', page(+n, cfg));
  console.log(`E${n}: ${(fs.statSync(BASE + n + '/index.html').size / 1024).toFixed(1)} KB`);
}
console.log('All pages generated.');
