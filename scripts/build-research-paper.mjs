import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const sourcePath = join(root, "_research-source", "who-captures-growth-full-paper.md");
const outputPath = join(root, "research", "who-captures-growth", "index.html");
const workPath = join("/tmp", "galok-who-captures-growth.md");

const figures = {
  1: {
    title: "Selected January–July 2026 growth rates",
    type: "diverging-bar",
    data: "figure-1-growth.json",
    label: "DESCRIPTIVE / NBS",
  },
  2: {
    title: "Selected January–July 2026 financing and balance-sheet changes",
    type: "diverging-bar",
    data: "figure-2-finance.json",
    label: "DESCRIPTIVE / PBC",
  },
  3: {
    title: "Published labor-market effects of robot exposure in China",
    type: "diverging-bar",
    data: "figure-3-robots.json",
    label: "REPRODUCED BENCHMARK",
  },
  4: {
    title: "Automation exposure and employment across core specifications",
    type: "coefficient-plot",
    data: "figure_4_employment_specifications.json",
    label: "QUALIFIED",
    image: "figure_4_employment_specification_curve.svg",
  },
  5: {
    title: "Household expenditure-composition and mortgage responses",
    type: "diverging-bar",
    data: "figure_5_household_composition.json",
    label: "QUALIFIED / MORTGAGE FRAGILE",
    image: "figure_5_household_composition.svg",
  },
  6: {
    title: "Within-person job-security associations, 2016–2020",
    type: "static-coefficient",
    data: "figure_6_job_security_worker_fe.json",
    label: "QUALIFIED ASSOCIATION",
    image: "figure_6_job_security_worker_fe.svg",
  },
  7: {
    title: "Baseline balance of the main external shifter",
    type: "dot-plot",
    data: "figure_7_instrument_balance.json",
    label: "IDENTIFICATION DIAGNOSTIC",
    image: "figure_7_instrument_baseline_balance.svg",
  },
};

function figureMarkup(number, figure) {
  const image = figure.image
    ? `<img class="research-figure-fallback" src="/research/who-captures-growth/figures/${figure.image}" alt="${figure.title}" loading="lazy" decoding="async">`
    : "";
  return `<figure class="research-figure" id="figure-${number}" data-research-figure="${number}">
<figcaption><span>FIGURE ${number}</span><h4>${figure.title}</h4><small>${figure.label}</small></figcaption>
<div class="research-chart" data-research-chart="${number}" data-chart-type="${figure.type}" data-chart-src="/research/who-captures-growth/data/${figure.data}" aria-label="Interactive chart: ${figure.title}">${image}</div>
<p class="research-chart-status" data-chart-status aria-live="polite">Static figure and accessible values follow.</p>
</figure>`;
}

let markdown = readFileSync(sourcePath, "utf8");
markdown = markdown.replace(/^---\n[\s\S]*?\n---\n/, "");
markdown = markdown.trimStart().replace(/^# Who Captures Growth\?\n## [^\n]+\n\n\*\*GALOK RESEARCH 001[^\n]*\*\*\n/, "");

for (const [number, figure] of Object.entries(figures)) {
  const marker = new RegExp(`<!-- codex:chart id="fig-${number}"[^>]*-->\\n\\n### Figure ${number}\\. [^\\n]+\\n`, "m");
  markdown = markdown.replace(marker, `${figureMarkup(number, figure)}\n\n`);
  if (figure.image) {
    const imageLine = new RegExp(`!\\[[^\\]]*\\]\\(\\./figures/${figure.image.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\)\\n`, "m");
    markdown = markdown.replace(imageLine, "");
  }
}

// GFM handles dollar-delimited math; the canonical source remains unchanged.
markdown = markdown
  .replace(/^\\\[$/gm, () => "$$")
  .replace(/^\\\]$/gm, () => "$$")
  .replace(/\\\((.+?)\\\)/g, "$$$1$");

const headingIds = new Map([
  ["1. Introduction", "introduction"],
  ["2. Stylized Facts: Four Layers of the K", "stylized-facts"],
  ["3. Literature Review", "literature-review"],
  ["4. Conceptual Framework and Hypotheses", "conceptual-framework"],
  ["5. Data and Measurement", "data-and-measurement"],
  ["6. Empirical Strategy", "empirical-strategy"],
  ["7. Labor Institutions and Testable Extensions", "labor-institutions"],
  ["8. Original Empirical Results", "original-results"],
  ["9. Robustness, Falsification, and Interpretation Boundaries", "robustness"],
  ["10. Mechanisms: Job Quality, Household Smoothing, and the Limits of the Current Data", "mechanisms"],
  ["11. Policy Interpretation", "policy-interpretation"],
  ["12. Conclusion", "conclusion"],
  ["Data and Reproducibility Note", "data-and-reproducibility"],
  ["References", "references"],
  ["Direct Source Links", "direct-source-links"],
]);

markdown = markdown.replace(/^(#{1,3}) (.+)$/gm, (_match, hashes, title) => {
  const level = "#".repeat(Math.min(4, hashes.length + 1));
  const id = headingIds.get(title);
  const safeTitle = title.replace(/^(\d+)\./, "$1&#46;");
  return id ? `<h2 id="${id}">${safeTitle}</h2>` : `${level} ${title}`;
});

writeFileSync(workPath, markdown);
const article = execFileSync("pandoc", [
  workPath,
  "--from=markdown-yaml_metadata_block-multiline_tables-grid_tables-simple_tables-table_captions+pipe_tables+tex_math_dollars+raw_html+autolink_bare_uris",
  "--to=html5",
  "--mathjax",
  "--wrap=none",
], { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });

const articleWithSections = article
  .replace('<h4 id="abstract">Abstract</h4>', '<section class="research-abstract" aria-label="Abstract and scope">\n<h2 id="abstract">Abstract</h2>')
  .replace('<h2 id="introduction">', '</section>\n<h2 id="introduction">')
  .replace('<h2 id="data-and-reproducibility">', `<h2 id="data-and-reproducibility">`)
  .replace('</h2>\n<p>The empirical build uses public CFPS waves', `</h2>\n<aside class="research-repro-note"><b>DATA ACCESS / CFPS</b><p>China Family Panel Studies (CFPS) · Institute of Social Science Survey, Peking University. <a href="https://www.isss.pku.edu.cn/cfps/en/data/DataUserAgreement/index.htm">Official data access and user agreement ↗</a>. Microdata are not redistributed by Galok.</p></aside>\n<p>The empirical build uses public CFPS waves`)
  .replace('<h2 id="references">', `<aside class="research-statistical-audit" aria-label="Statistical audit summary"><p>STATISTICAL AUDIT</p><dl><div><dt>Automation → employment</dt><dd>QUALIFIED</dd></div><div><dt>Total consumption decline</dt><dd>UNSUPPORTED / UNSTABLE NULL</dd></div><div><dt>Food &amp; housing shares</dt><dd>QUALIFIED</dd></div><div><dt>Mortgage holding</dt><dd>FRAGILE</dd></div><div><dt>Job security mechanism</dt><dd>QUALIFIED ASSOCIATION</dd></div></dl></aside>\n<section class="research-references">\n<p class="research-section-kicker">SOURCES &amp; DATA</p>\n<h2 id="references">`)
  .replace('<h2 id="direct-source-links">', '</section>\n<section class="research-direct-sources">\n<h2 id="direct-source-links">')
  .concat("\n</section>");

const toc = [
  ["introduction", "1 Introduction"],
  ["stylized-facts", "2 Stylized Facts"],
  ["literature-review", "3 Literature / Evidence"],
  ["conceptual-framework", "4 Conceptual Framework"],
  ["data-and-measurement", "5 Data"],
  ["empirical-strategy", "6 Empirical Strategy"],
  ["labor-institutions", "7 Institutions"],
  ["original-results", "8 Original Results"],
  ["robustness", "9 Robustness"],
  ["mechanisms", "10 Mechanisms"],
  ["policy-interpretation", "11 Policy"],
  ["conclusion", "12 Conclusion"],
  ["data-and-reproducibility", "Data & Reproducibility"],
  ["references", "References"],
].map(([id, label]) => `<a href="#${id}" data-toc-link="${id}">${label}</a>`).join("");

const page = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#f2efe5">
  <meta name="description" content="A full-length independent research paper on how China's technology- and capital-intensive growth passes through into employment, labor income, job security and household demand.">
  <meta name="author" content="Galok">
  <meta name="keywords" content="China economy, industrial automation, labor markets, household consumption, precautionary saving, industrial policy, labor institutions">
  <meta property="og:type" content="article">
  <meta property="og:title" content="Who Captures Growth? — GALOK RESEARCH 001">
  <meta property="og:description" content="Capital Allocation, Labor-Market Power, and Household Demand in China's K-Shaped Economy.">
  <meta property="og:url" content="https://www.galok.me/research/who-captures-growth/">
  <meta property="og:image" content="https://www.galok.me/assets/be-a-viewer/xian/night-market.jpeg">
  <meta property="article:published_time" content="2026-08-19">
  <meta property="article:modified_time" content="2026-08-19">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Who Captures Growth? — GALOK RESEARCH 001">
  <meta name="twitter:description" content="Independent empirical research on capital allocation, labor-market power and household demand in China.">
  <meta name="twitter:image" content="https://www.galok.me/assets/be-a-viewer/xian/night-market.jpeg">
  <link rel="canonical" href="https://www.galok.me/research/who-captures-growth/">
  <title>Who Captures Growth? — GALOK RESEARCH 001</title>
  <link rel="icon" type="image/svg+xml" href="/assets/galok-symbol.svg">
  <link rel="stylesheet" href="/styles.css?v=ia-20260819-menu">
  <link rel="stylesheet" href="/research/research.css?v=20260820">
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"ScholarlyArticle","headline":"Who Captures Growth?","alternativeHeadline":"Capital Allocation, Labor-Market Power, and Household Demand in China's K-Shaped Economy","description":"A full-length independent research paper on how China's technology- and capital-intensive growth passes through into employment, labor income, job security and household demand.","image":"https://www.galok.me/assets/be-a-viewer/xian/night-market.jpeg","datePublished":"2026-08-19","dateModified":"2026-08-19","inLanguage":"en","articleSection":"Independent Research","author":{"@type":"Organization","name":"Galok"},"publisher":{"@type":"Organization","name":"Galok","url":"https://www.galok.me/"},"mainEntityOfPage":"https://www.galok.me/research/who-captures-growth/","keywords":["China economy","industrial automation","labor markets","household consumption","industrial policy"]}</script>
  <script>window.MathJax={tex:{inlineMath:[["$","$"],["\\\\(","\\\\)"]],displayMath:[["$$","$$"],["\\\\[","\\\\]"]]},options:{skipHtmlTags:["script","noscript","style","textarea","pre","code"]}};</script>
  <script defer src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
</head>
<body class="research-paper-page">
  <div class="research-progress" aria-hidden="true"><i data-research-progress></i></div>
  <nav class="site-nav" aria-label="Primary navigation">
    <div class="nav-inner">
      <a class="brand" href="/"><img class="brand-mark" src="/assets/galok-symbol.svg" alt="" aria-hidden="true"><span class="brand-lockup"><b>GALOK</b><small>Field notes</small></span></a>
      <div class="nav-links"><a href="/be-a-viewer/">Cities</a><a href="/notes/">Essays</a><a href="/data/">Data</a><a href="/works/">Work</a><a href="/archive/">Index</a><a href="/about/">About</a></div>
    </div>
  </nav>

  <main>
    <header class="research-paper-hero">
      <div class="research-paper-identity">
        <p>GALOK RESEARCH 001</p>
        <h1>WHO CAPTURES<br>GROWTH?</h1>
        <p class="research-paper-subtitle">Capital Allocation, Labor-Market Power,<br>and Household Demand in China's K-Shaped Economy</p>
        <dl><div><dt>Author</dt><dd>Galok</dd></div><div><dt>Type</dt><dd>Independent Research</dd></div><div><dt>Status</dt><dd>Final v1.0</dd></div><div><dt>Published</dt><dd>19 August 2026</dd></div></dl>
      </div>
      <figure class="research-paper-hero-image">
        <img src="/assets/be-a-viewer/xian/night-market.jpeg" width="1536" height="1024" alt="A night market crowd moving beneath illuminated signs in Xi'an" fetchpriority="high">
        <figcaption>Xi'an after dark. Editorial photograph from the Galok city archive.</figcaption>
      </figure>
    </header>

    <details class="research-mobile-toc"><summary>Contents <span>14 sections</span></summary><nav aria-label="Paper contents">${toc}</nav></details>
    <div class="research-paper-layout">
      <aside class="research-paper-toc"><p>CONTENTS</p><nav aria-label="Paper contents">${toc}</nav><a class="research-audit-link" href="#data-and-reproducibility">Statistical audit reflected in evidence labels ↓</a></aside>
      <article class="research-manuscript" data-research-manuscript>
${articleWithSections}
      </article>
    </div>
  </main>
  <footer class="footer"><div class="footer-inner"><span>Galok / Research 001</span><a href="/research/">All research</a><a href="/">Home</a></div></footer>
  <script src="/script.js?v=ia-20260819"></script>
  <script src="/research/research.js?v=20260820"></script>
</body>
</html>
`;

writeFileSync(outputPath, page);
console.log(`Built ${outputPath}`);
