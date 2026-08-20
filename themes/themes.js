// Galok / Themes — three-lens theme clusters.
// Renders one card per series with its definition, maturity distribution,
// the essays growing under it (with maturity marks) and a deep link into /essays/.
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function glyphNode(char, pinyin) {
    const span = document.createElement("span");
    span.className = "glyph-draw";
    span.setAttribute("aria-hidden", "true");
    span.dataset.glyph = char;
    span.dataset.pinyin = pinyin;
    span.textContent = char;
    return span;
  }

  function maturityMark(maturity) {
    const em = document.createElement("em");
    em.className = "notes-row-maturity";
    em.dataset.maturity = maturity;
    em.textContent = maturity;
    return em;
  }

  function distributionBadge(key, count) {
    const span = document.createElement("span");
    span.className = "themes-dist-item";
    span.dataset.maturity = key;
    const label = document.createElement("em");
    label.textContent = key;
    const num = document.createElement("b");
    num.textContent = String(count);
    span.appendChild(label);
    span.appendChild(num);
    return span;
  }

  function initThemesGrid() {
    const mount = document.querySelector("[data-themes-grid]");
    const content = window.GALOK_CONTENT || { essays: [], series: {} };
    const series = content.series || {};
    if (!mount || !Object.keys(series).length) return;

    const grid = document.createElement("div");
    grid.className = "themes-grid";

    Object.keys(series).forEach((key, index) => {
      const s = series[key];
      const essays = content.essays.filter((essay) => essay.series === key);
      const distribution = { planted: 0, growing: 0, evergreen: 0 };
      essays.forEach((essay) => {
        const m = essay.maturity || "planted";
        distribution[m] = (distribution[m] || 0) + 1;
      });

      const card = document.createElement("article");
      card.className = "themes-card";
      card.style.setProperty("--accent", s.color || "var(--archive-ink)");
      if (!reduceMotion) card.dataset.reveal = "";
      card.style.transitionDelay = `${index * 60}ms`;

      const header = document.createElement("div");
      header.className = "themes-card-head";
      const meta = document.createElement("p");
      meta.className = "archive-card-meta";
      meta.textContent = `THEME 0${index + 1} / ${s.en.toUpperCase()}`;
      const title = document.createElement("h3");
      title.appendChild(glyphNode(s.glyph, s.pinyin));
      title.appendChild(document.createTextNode(s.en));
      const definition = document.createElement("p");
      definition.className = "themes-definition";
      definition.textContent = s.definition;
      header.appendChild(meta);
      header.appendChild(title);
      header.appendChild(definition);

      const dist = document.createElement("div");
      dist.className = "themes-dist";
      dist.setAttribute("aria-label", `Maturity distribution: ${distribution.planted} planted, ${distribution.growing} growing, ${distribution.evergreen} evergreen`);
      ["planted", "growing", "evergreen"].forEach((key) => {
        if (distribution[key] > 0) dist.appendChild(distributionBadge(key, distribution[key]));
      });

      const list = document.createElement("ul");
      list.className = "themes-list";
      essays.forEach((essay, i) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = essay.url;
        const num = document.createElement("span");
        num.className = "themes-list-index";
        num.textContent = String(i + 1).padStart(2, "0");
        const name = document.createElement("span");
        name.className = "themes-list-name";
        name.textContent = essay.title;
        const issue = document.createElement("span");
        issue.className = "themes-list-issue";
        issue.textContent = essay.issue ? `ISSUE ${essay.issue}` : "";
        a.appendChild(num);
        a.appendChild(name);
        if (essay.issue) a.appendChild(issue);
        a.appendChild(maturityMark(essay.maturity || "planted"));
        li.appendChild(a);
        list.appendChild(li);
      });

      const nav = document.createElement("div");
      nav.className = "themes-card-nav";
      const link = document.createElement("a");
      link.href = `/essays/?series=${encodeURIComponent(key)}`;
      link.dataset.series = key;
      link.innerHTML = `Open the ${s.en} archive &rarr;`;
      nav.appendChild(link);

      card.appendChild(header);
      card.appendChild(dist);
      card.appendChild(list);
      card.appendChild(nav);
      grid.appendChild(card);
    });

    mount.replaceWith(grid);

    if (!reduceMotion) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-revealed");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      );
      grid.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));
    } else {
      grid.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-revealed"));
    }
  }

  // Deep link support: /themes/?lens=macro jumps into the matching card anchor.
  function applyDeepLink() {
    const lens = new URLSearchParams(window.location.search).get("lens") || "";
    if (!lens) return;
    const target = document.querySelector(`.themes-card[style*="${(window.GALOK_CONTENT?.series || {})[lens]?.color || ""}"]`);
    if (target) {
      target.scrollIntoView({ behavior: "auto", block: "start" });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initThemesGrid();
      applyDeepLink();
    });
  } else {
    initThemesGrid();
    applyDeepLink();
  }
})();
