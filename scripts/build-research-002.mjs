import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const sourcePath = join(root, "_research-source", "fast-metabolism-economy.md");
const outputPath = join(root, "research", "fast-metabolism-economy", "index.html");
const workPath = join("/tmp", "galok-fast-metabolism-economy.md");
const figureToken = (number) => `GALOKRESEARCH002FIGURE${number}`;

const figureMarkup = {
  1: `<section class="r002-figure" id="figure-1">
    <div class="r002-figure-number">Figure 01</div>
    <h2>A growing network can replace a large share of itself</h2>
    <p class="r002-deck">Net growth records where the network ended. MMR records gross physical openings and closures along the way.</p>
    <div class="r002-hero-layout">
      <div>
        <div class="r002-metric-grid">
          <div class="r002-metric"><div class="r002-metric-value r002-blue" id="hero-net">—</div><div class="r002-metric-label">Net network growth</div><div class="r002-metric-note">Conservative core</div></div>
          <div class="r002-metric"><div class="r002-metric-value r002-orange" id="hero-mmr">—</div><div class="r002-metric-label">Gross store metabolism</div><div class="r002-metric-note">Conservative core</div></div>
        </div>
        <div class="r002-inline-stats"><span class="r002-pill" id="hero-expanded"></span></div>
      </div>
      <div>
        <div class="r002-dotfield" id="hero-dots"></div>
        <div class="r002-illustrative">Illustrative network · dot field is explanatory, not a store-count sample.</div>
      </div>
    </div>
    <p class="r002-caption">Figure 1. Net network growth and gross store metabolism measure different margins of chain expansion. The conservative core contains five system-year observations from four systems. The expanded final-issuer pool contains 13 system-year observations from eight independent systems.</p>
  </section>`,
  2: `<section class="r002-figure" id="figure-2">
    <div class="r002-figure-number">Figure 02</div>
    <h2>What net growth leaves out</h2>
    <p class="r002-deck">Guming, 2025. A net addition of 3,640 stores coexisted with 4,944 gross openings and closures.</p>
    <div class="r002-flow">
      <div class="r002-flow-node"><span>Beginning</span><strong id="g-begin">—</strong></div><div class="r002-arrow">→</div>
      <div class="r002-flow-node open"><span>Opened</span><strong id="g-open">—</strong></div><div class="r002-arrow">→</div>
      <div class="r002-flow-node close"><span>Closed</span><strong id="g-close">—</strong></div><div class="r002-arrow">→</div>
      <div class="r002-flow-node"><span>Ending</span><strong id="g-end">—</strong></div>
    </div>
    <div class="r002-inline-stats"><span class="r002-pill"><b id="g-net">—</b> net growth</span><span class="r002-pill"><b id="g-mmr">—</b> MMR</span></div>
    <div class="r002-formula">MMR = (Openings + Closures) / Average(Beginning stock, Ending stock)</div>
    <p class="r002-caption">Figure 2. Guming expanded rapidly in 2025 while 4,944 gross store openings and closures passed through the network.</p>
  </section>`,
  3: `<section class="r002-figure" id="figure-3">
    <div class="r002-figure-number">Figure 03</div>
    <h2>Growth and metabolism are separate dimensions</h2>
    <p class="r002-deck">Every dot is a real full-year, no-acquisition observation. No decorative data points.</p>
    <div class="r002-inline-stats"><span class="r002-pill">N = <b id="quadrant-n">—</b></span><span class="r002-pill">Median MMR = <b id="quadrant-median">—</b></span><span class="r002-pill">30% threshold agreement = <b id="quadrant-agree">—</b></span></div>
    <div class="r002-quadrant-key" aria-label="Quadrant key"><span><b>High MMR</b>Contraction</span><span><b>High MMR</b>Expansion</span><span><b>Low MMR</b>Contraction</span><span><b>Low MMR</b>Expansion</span></div>
    <div class="r002-svg-wrap" id="quadrant-chart"></div>
    <p class="r002-caption">Figure 3. The horizontal reference is the sample median MMR; the vertical reference is zero net growth. Parent and child observations may appear as separate plotted states but are never pooled together in headline estimates.</p>
  </section>`,
  4: `<section class="r002-figure" id="figure-4">
    <div class="r002-figure-number">Figure 04</div>
    <h2>Roster persistence is not brand survival</h2>
    <p class="r002-deck">A 186-brand presence matrix preserves the actual 2022–2025 observation pattern. Ranking exit remains a visibility event.</p>
    <div class="r002-lifecycle-summary">
      <span class="r002-pill"><b id="life-brands">—</b> canonical brands</span>
      <span class="r002-pill"><b id="life-presences">—</b> brand-year presences</span>
      <span class="r002-pill"><b id="life-core">—</b> present in all four years</span>
    </div>
    <div class="r002-life-groups" id="life-groups"></div>
    <div class="r002-retention">Year-to-year retention: <span id="life-retention">—</span></div>
    <p class="r002-caption">Figure 4. Roster patterns are summarized first. Select a pattern to inspect named brands in touch-sized rows; filled cells indicate observed annual presence.</p>
  </section>`,
  5: `<section class="r002-figure" id="figure-5">
    <div class="r002-figure-number">Figure 05</div>
    <h2>Franchise intensity does not carry a stable independent growth signal</h2>
    <p class="r002-deck">The final plot uses the actual matched N=22 observations. The raw scatter and the size-adjusted statistic are kept conceptually separate.</p>
    <div class="r002-stat-strip">
      <div class="r002-stat-box"><b id="fr-p">—</b><span>Pearson r</span></div>
      <div class="r002-stat-box"><b id="fr-s">—</b><span>Spearman ρ</span></div>
      <div class="r002-stat-box"><b id="fr-part">—</b><span>Partial r · control: log initial size</span></div>
    </div>
    <div class="r002-svg-wrap" id="franchise-chart"></div>
    <p class="r002-caption">Figure 5. The matched sample is exploratory and heavily concentrated at high franchise shares. No causal interpretation is made.</p>
  </section>`,
  6: `<section class="r002-figure" id="figure-6">
    <div class="r002-figure-number">Figure 06</div>
    <h2>Different chains, different internal mechanics</h2>
    <p class="r002-deck">Aligned measures make comparable store-flow years directly readable; ChaPanda uses a different event unit.</p>
    <div class="r002-cards" id="brand-cards"></div>
    <p class="r002-caption">Figure 6. Similar year-end network outcomes can be produced by different combinations of openings, closures, and contractual turnover.</p>
  </section>`,
  7: `<section class="r002-figure" id="figure-7">
    <div class="r002-figure-number">Figure 07</div>
    <h2>What counts as a closure?</h2>
    <p class="r002-deck">Administrative, legal, contractual, spatial, and visibility signals are evidence about different units. Select any event to see what it establishes.</p>
    <div class="r002-taxonomy" id="taxonomy"></div>
    <div class="r002-tax-decision">
      <div class="question" id="tax-question"></div>
      <div class="r002-tax-result"><span class="r002-no">Most signals: NO</span><span class="r002-yes">Verified physical closure: YES</span></div>
    </div>
    <div class="r002-tax-detail" id="tax-detail"></div>
    <p class="r002-caption">Figure 7. Only a source that supports physical cessation at the location is treated as a verified physical closure in the paper’s store-flow numerator.</p>
  </section>`,
};

let markdown = readFileSync(sourcePath, "utf8");
markdown = markdown.slice(markdown.indexOf("# Abstract"));
markdown = markdown.replace(/^# Abstract$/m, '<section class="research-abstract" aria-label="Abstract and scope">\n<h2 id="abstract">Abstract</h2>');

const headingIds = new Map([
  ["1. Introduction", "introduction"],
  ["2. Literature and Conceptual Framework", "literature-conceptual-framework"],
  ["3. Data and Measurement", "data-and-measurement"],
  ["4. Empirical Results", "empirical-results"],
  ["5. Administrative Evidence: What Counts as a Closure?", "administrative-evidence"],
  ["6. Discussion", "discussion"],
  ["7. Conclusion", "conclusion"],
  ["8. Data and Code Availability", "data-and-code-availability"],
  ["References", "references"],
  ["Appendix A. Issuer-disclosure source registry", "appendix-a"],
  ["Appendix B. Administrative-data interpretation rules", "appendix-b"],
]);

markdown = markdown.replace(/^## (.+)$/gm, (match, title) => {
  const id = headingIds.get(title);
  if (!id) return match;
  const heading = `## ${title} {#${id}}`;
  return id === "introduction" ? `</section>\n\n${figureToken(1)}\n\n${heading}` : heading;
});

markdown = markdown
  .replace("<!-- FIGURE 1: A growing network can replace a large share of itself -->", "")
  .replace("<!-- FIGURE 2: What net growth leaves out — Guming 2025 -->", figureToken(2))
  .replace("<!-- FIGURE 6: Different chains, different internal mechanics -->", "")
  .replace("<!-- FIGURE 3: Growth and metabolism are separate dimensions -->", figureToken(3))
  .replace("<!-- FIGURE 4: Roster persistence is not brand survival -->", figureToken(4))
  .replace("<!-- FIGURE 5: Franchise intensity and subsequent growth -->", `${figureToken(5)}\n\n${figureToken(6)}`)
  .replace("<!-- FIGURE 7: What counts as a closure? -->", figureToken(7))
  .replace(/^\\\[$/gm, "$$$$")
  .replace(/^\\\]$/gm, "$$$$")
  .replace(/\\\((.+?)\\\)/g, "$$$1$");

writeFileSync(workPath, markdown);
let article = execFileSync("pandoc", [
  workPath,
  "--from=markdown-yaml_metadata_block-multiline_tables-grid_tables-simple_tables-table_captions+pipe_tables+tex_math_dollars+raw_html+autolink_bare_uris",
  "--to=html5",
  "--mathjax",
  "--wrap=none",
], { encoding: "utf8", maxBuffer: 12 * 1024 * 1024 });

for (let number = 1; number <= 7; number += 1) {
  article = article.replace(`<p>${figureToken(number)}</p>`, figureMarkup[number]);
}

if (/GALOKRESEARCH002FIGURE\d|<pre><code>[\s\S]*?r002-/.test(article)) {
  throw new Error("Research 002 figure placeholders were not converted into live HTML.");
}

const replication = `<aside class="research-replication" aria-label="Research 002 replication package">
  <p>DATA / METHOD / REPLICATION</p>
  <h3>Rebuild the published results.</h3>
  <span>Derived figure data, pooled-sample definitions, source registry and production audits are included. Raw administrative source downloads are not redistributed.</span>
  <a href="/research/fast-metabolism-economy/downloads/GALOK_RESEARCH_002_REPLICATION_PACKAGE_v1_0.zip" download>Download replication package <b>ZIP · v1.0</b></a>
</aside>`;

const articleWithSections = article
  .replace('<h2 id="references">', `${replication}\n<section class="research-references">\n<p class="research-section-kicker">SOURCES &amp; DATA</p>\n<h2 id="references">`)
  .replace('<h2 id="appendix-a">', '</section>\n<section class="research-appendix">\n<p class="research-section-kicker">APPENDICES</p>\n<h2 id="appendix-a">')
  .concat("\n</section>");

const toc = [
  ["introduction", "1 Introduction"],
  ["literature-conceptual-framework", "2 Literature / Framework"],
  ["data-and-measurement", "3 Data / Measurement"],
  ["empirical-results", "4 Results"],
  ["administrative-evidence", "5 Administrative Evidence"],
  ["discussion", "6 Discussion"],
  ["conclusion", "7 Conclusion"],
  ["data-and-code-availability", "Data & Code"],
  ["references", "References"],
  ["appendix-a", "Appendices"],
].map(([id, label]) => `<a href="#${id}" data-toc-link="${id}">${label}</a>`).join("");

const page = `<!DOCTYPE html>
<html lang="en" class="research-paper-root">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#f2efe5">
  <meta name="description" content="A full-length independent research paper on franchising, network expansion and gross store turnover in China's consumer economy.">
  <meta name="author" content="Galok">
  <meta name="keywords" content="China consumer economy, franchising, chain foodservice, store turnover, gross flows, retail restructuring">
  <meta property="og:type" content="article">
  <meta property="og:title" content="The Fast Metabolism Economy — GALOK RESEARCH 002">
  <meta property="og:description" content="Franchising, Network Expansion, and Store Turnover in China's Consumer Economy.">
  <meta property="og:url" content="https://www.galok.me/research/fast-metabolism-economy/">
  <meta property="og:image" content="https://www.galok.me/assets/research/research-002-cover.jpg">
  <meta property="article:published_time" content="2026-08-21">
  <meta property="article:modified_time" content="2026-08-21">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="The Fast Metabolism Economy — GALOK RESEARCH 002">
  <meta name="twitter:description" content="Independent empirical research on the gross store flows hidden beneath chain expansion.">
  <meta name="twitter:image" content="https://www.galok.me/assets/research/research-002-cover.jpg">
  <link rel="canonical" href="https://www.galok.me/research/fast-metabolism-economy/">
  <title>The Fast Metabolism Economy — GALOK RESEARCH 002</title>
  <link rel="icon" type="image/svg+xml" href="/assets/galok-symbol.svg">
  <link rel="stylesheet" href="/styles.css?v=ia-20260820-mobile">
  <link rel="stylesheet" href="/galok-wave.css?v=20260822-research-ipad">
  <link rel="stylesheet" href="/research/research.css?v=20260822f">
  <link rel="stylesheet" href="/research/fast-metabolism-economy/charts.css?v=20260822d">
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"ScholarlyArticle","headline":"The Fast Metabolism Economy","alternativeHeadline":"Franchising, Network Expansion, and Store Turnover in China's Consumer Economy","description":"Independent empirical research on the gross store flows hidden beneath chain expansion in China's consumer economy.","image":"https://www.galok.me/assets/research/research-002-cover.jpg","datePublished":"2026-08-21","dateModified":"2026-08-21","inLanguage":"en","articleSection":"Independent Research","author":{"@type":"Organization","name":"Galok"},"publisher":{"@type":"Organization","name":"Galok","url":"https://www.galok.me/"},"mainEntityOfPage":"https://www.galok.me/research/fast-metabolism-economy/","keywords":["China consumer economy","franchising","chain foodservice","store turnover","gross flows"]}</script>
  <script>window.MathJax={tex:{inlineMath:[["$","$"],["\\\\(","\\\\)"]],displayMath:[["$$","$$"],["\\\\[","\\\\]"]]},options:{skipHtmlTags:["script","noscript","style","textarea","pre","code"]}};</script>
  <script defer src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
</head>
<body class="research-paper-page research-002-page">
  <div class="research-progress" aria-hidden="true"><i data-research-progress></i></div>
  <div class="r002-tooltip" id="r002-tooltip" role="status" aria-live="polite"></div>
  <nav class="site-nav" aria-label="Primary navigation">
    <div class="nav-inner">
      <a class="brand" href="/"><img class="brand-mark" src="/assets/galok-symbol.svg" alt="" aria-hidden="true"><span class="brand-lockup"><b>GALOK</b><small>Field notes</small></span></a>
      <div class="nav-links"><a href="/cities/">Cities</a><a href="/essays/">Essays</a><a href="/research/" aria-current="page">Research</a><a href="/data/">Data</a><a href="/work/">Work</a><a href="/index/">Index</a><a href="/about/">About</a></div>
    </div>
  </nav>

  <main>
    <header class="research-paper-hero research-002-hero">
      <div class="research-paper-identity">
        <p>GALOK RESEARCH 002</p>
        <h1>THE FAST<br>METABOLISM<br>ECONOMY</h1>
        <p class="research-paper-subtitle">Franchising, Network Expansion, and Store Turnover in China's Consumer Economy</p>
        <dl><div><dt>Author</dt><dd>Galok</dd></div><div><dt>Type</dt><dd>Independent Research</dd></div><div><dt>Status</dt><dd>Final v1.0</dd></div><div><dt>Published</dt><dd>21 August 2026</dd></div></dl>
      </div>
      <figure class="research-paper-hero-image research-002-cover">
        <img src="/assets/research/research-002-cover.jpg" width="2048" height="1365" alt="A shopping-mall interior layered with glass reflections, pedestrians and large advertising portraits" fetchpriority="high">
        <figcaption>Consumer space, reflected and reorganized. GALOK RESEARCH 002 cover photograph.</figcaption>
      </figure>
    </header>

    <details class="research-mobile-toc"><summary>Contents <span>10 sections</span></summary><nav aria-label="Paper contents">${toc}</nav></details>
    <nav class="research-wave-toc gwn gwn--research gwn--tablet" data-gwn-start="#abstract" aria-label="Interactive paper contents"><a href="#abstract">00 Abstract</a>${toc}</nav>
    <div class="research-paper-layout research-002-layout">
      <aside class="research-paper-toc"><p>CONTENTS</p><nav aria-label="Paper contents">${toc}</nav><a class="research-audit-link" href="#data-and-code-availability">Data, method and replication ↓</a></aside>
      <article class="research-manuscript" data-research-manuscript>
${articleWithSections}
      </article>
    </div>
  </main>
  <footer class="footer"><div class="footer-inner"><span>Galok / Research 002</span><a href="/research/">All research</a><a href="/">Home</a></div></footer>
  <script src="/script.js?v=ia-20260820-mobile"></script>
  <script src="/data/research-002/research-002-data.js?v=20260821"></script>
  <script src="/research/fast-metabolism-economy/charts.js?v=20260822d"></script>
  <script src="/galok-wave.js?v=20260822-research-ipad"></script>
  <script src="/research/research.js?v=20260822e"></script>
</body>
</html>
`;

writeFileSync(outputPath, page);
console.log(`Built ${outputPath}`);
