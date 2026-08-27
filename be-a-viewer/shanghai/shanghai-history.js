(() => {
  const allowedCategories = new Set(["architecture", "street-life", "landscape"]);
  const allowedRights = /^(?:public domain\.?|cc0(?: 1\.0)?|cc by(?:-sa)? (?:2\.0|3\.0|4\.0))$/i;
  const blockedTopics = /(?:1989|8964|june\s+fourth|tiananmen|protest|demonstration|military|army|soldier|troop|artillery|police|riot|rebellion|battle|war|political|communist|mao|cultural\s+revolution|great\s+leap|red\s+guard|massacre|crackdown|tank|may\s+thirtieth|nanking\s+road\s+incident|january\s+28|august\s+13|battle\s+of\s+shanghai|communist\s+party|party\s+congress)/i;
  const currentYear = new Date().getFullYear();
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const text = (value = "") => String(value).trim();
  const escapeHtml = (value = "") => text(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

  function safeCommonsUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === "https:" && (url.hostname === "commons.wikimedia.org" || url.hostname.endsWith(".wikimedia.org"));
    } catch {
      return false;
    }
  }

  function validItem(item, periodIds) {
    const searchable = [item?.title, item?.location, item?.sourceLabel, item?.category, item?.period].filter(Boolean).join(" ");
    return item
      && periodIds.has(item.period)
      && allowedCategories.has(item.category)
      && Number.isInteger(item.yearStart)
      && Number.isInteger(item.yearEnd)
      && item.yearStart >= 1800
      && item.yearStart <= item.yearEnd
      && item.yearEnd <= currentYear
      && safeCommonsUrl(item.imageUrl)
      && safeCommonsUrl(item.sourceUrl)
      && allowedRights.test(text(item.rights))
      && !blockedTopics.test(searchable);
  }

  function card(item, index) {
    return `
      <article class="shanghai-history-card" data-shanghai-history-id="${escapeHtml(item.id)}">
        <a class="shanghai-history-card__media" href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Open source record for ${escapeHtml(item.title)}">
          <span class="shanghai-history-card__number">${String(index + 1).padStart(2, "0")}</span>
          <img src="${escapeHtml(item.imageUrl)}" alt="Historical Shanghai view: ${escapeHtml(item.title)}" loading="lazy" decoding="async">
        </a>
        <div class="shanghai-history-card__copy">
          <div>
            <h4>${escapeHtml(item.title)}</h4>
            <p>${escapeHtml(item.location)}<br>${escapeHtml(item.sourceLabel)} · ${escapeHtml(item.rights)}</p>
          </div>
          <time>${escapeHtml(item.dateLabel)}</time>
        </div>
      </article>`;
  }

  function findTarget() {
    const qipao = document.querySelector(".shanghai-qipao-story");
    return qipao?.closest("section")
      || document.querySelector("[data-shanghai-temple]")
      || document.querySelector(".shanghai-section");
  }

  async function mount() {
    const target = findTarget();
    if (!target || document.querySelector("[data-shanghai-history]")) return;

    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = "/be-a-viewer/shanghai/shanghai-history.css?v=20260827-sh20-fix2";
    document.head.append(stylesheet);

    try {
      const response = await fetch("/be-a-viewer/shanghai/shanghai-history.json?v=20260827-sh20-fix2", { cache: "force-cache" });
      if (!response.ok) return;
      const data = await response.json();
      const periods = Array.isArray(data.periods) ? data.periods : [];
      const periodIds = new Set(periods.map((period) => period.id));
      const items = Array.isArray(data.items) ? data.items.filter((item) => validItem(item, periodIds)).slice(0, 20) : [];
      if (!items.length || !periods.length) return;

      const firstYear = Math.min(...items.map((item) => item.yearStart));
      const lastYear = Math.max(...items.map((item) => item.yearEnd));
      let runningIndex = 0;
      const periodMarkup = periods.map((period) => {
        const periodItems = items.filter((item) => item.period === period.id);
        if (!periodItems.length) return "";
        const cards = periodItems.map((item) => card(item, runningIndex++)).join("");
        return `
          <section class="shanghai-history-period" aria-labelledby="shanghai-history-${escapeHtml(period.id)}">
            <header class="shanghai-history-period__head">
              <h3 id="shanghai-history-${escapeHtml(period.id)}">${escapeHtml(period.label)}</h3>
              <span>${escapeHtml(period.range)}</span>
            </header>
            <div class="shanghai-history-period__grid">${cards}</div>
          </section>`;
      }).join("");

      const section = document.createElement("section");
      section.className = "shanghai-history";
      section.id = "shanghai-history";
      section.dataset.shanghaiHistory = "";
      section.setAttribute("aria-labelledby", "shanghai-history-title");
      section.innerHTML = `
        <header class="shanghai-history__masthead">
          <p class="shanghai-history__kicker">CITY MEMORY / ${firstYear} → ${lastYear}</p>
          <div class="shanghai-history__title-row">
            <h2 id="shanghai-history-title">SHANGHAI<br>BEFORE THE SKYLINE.</h2>
            <p>Twenty records of the physical city across a century and a half: hotels, stations, parks, commercial streets, old-city gates, riverfront stone and the ordinary fabric that kept changing around them.</p>
          </div>
          <div class="shanghai-history__counter"><b>${String(items.length).padStart(2, "0")}</b><span>ARCHIVE<br>FRAMES</span></div>
        </header>
        <div class="shanghai-history__periods">${periodMarkup}</div>
        <footer class="shanghai-history__foot">
          <span>Curated city-space records · open-license and sensitive-topic checks required before publication</span>
          <a href="https://commons.wikimedia.org/wiki/Category:Historical_images_of_Shanghai" target="_blank" rel="noopener noreferrer">Wikimedia Commons archive ↗</a>
        </footer>`;

      target.insertAdjacentElement("afterend", section);

      if (!reducedMotion && "IntersectionObserver" in window) {
        section.dataset.historyMotion = "ready";
        const observer = new IntersectionObserver((entries, currentObserver) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            currentObserver.unobserve(entry.target);
          });
        }, { rootMargin: "0px 0px -8% 0px", threshold: .06 });
        section.querySelectorAll(".shanghai-history__masthead, .shanghai-history-period, .shanghai-history__foot").forEach((node) => observer.observe(node));
      }
    } catch {}
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  } else {
    mount();
  }
})();
