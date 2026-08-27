(() => {
  const target = document.querySelector(".xian-wall");
  if (!target || document.querySelector("[data-xian-history]")) return;

  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = "/be-a-viewer/xian/xian-history.css?v=20260827-xian1";
  document.head.append(stylesheet);

  const allowedCategories = new Set(["architecture", "street-life", "landscape"]);
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

  function validItem(item, maxYear) {
    return item
      && allowedCategories.has(item.category)
      && Number.isInteger(item.yearStart)
      && Number.isInteger(item.yearEnd)
      && item.yearStart <= item.yearEnd
      && item.yearEnd <= maxYear
      && safeCommonsUrl(item.imageUrl)
      && safeCommonsUrl(item.sourceUrl)
      && /^public domain\.?$/i.test(text(item.rights));
  }

  function card(item, index) {
    return `
      <article class="xian-history-card" data-history-id="${escapeHtml(item.id)}">
        <a class="xian-history-card__media" href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Open source record for ${escapeHtml(item.title)}">
          <span class="xian-history-card__index">${String(index + 1).padStart(2, "0")}</span>
          <img src="${escapeHtml(item.imageUrl)}" alt="Historical Xi'an view: ${escapeHtml(item.title)}" loading="lazy" decoding="async">
        </a>
        <div class="xian-history-card__copy">
          <div>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.location)}<br>${escapeHtml(item.sourceLabel)}</p>
          </div>
          <span>${escapeHtml(item.dateLabel)}</span>
        </div>
      </article>`;
  }

  async function mount() {
    try {
      const response = await fetch("/be-a-viewer/xian/xian-history.json?v=20260827-xian1", { cache: "force-cache" });
      if (!response.ok) return;
      const data = await response.json();
      const maxYear = Number.isInteger(data.maxYear) ? data.maxYear : 1949;
      const items = Array.isArray(data.items) ? data.items.filter((item) => validItem(item, maxYear)).slice(0, 8) : [];
      if (items.length < 4) return;
      const firstYear = Math.min(...items.map((item) => item.yearStart));
      const lastYear = Math.max(...items.map((item) => item.yearEnd));

      const section = document.createElement("section");
      section.className = "xian-history";
      section.id = "xian-history";
      section.dataset.xianHistory = "";
      section.setAttribute("aria-labelledby", "xian-history-title");
      section.innerHTML = `
        <header class="xian-history__head">
          <div>
            <p class="xian-history__kicker">CITY MEMORY / ${firstYear} → ${lastYear}</p>
            <h2 id="xian-history-title">CHANG’AN<br>BEFORE NOW.</h2>
          </div>
          <p class="xian-history__intro">Six surviving views of the physical city: gates, wall, pagoda and courtyard. The archive stays close to built space, leaving political and military imagery outside this collection.</p>
        </header>
        <div class="xian-history__grid">${items.map(card).join("")}</div>
        <footer class="xian-history__foot">
          <span>Curated pre-1950 city-space records · public-domain material only</span>
          <a href="https://commons.wikimedia.org/wiki/Category:Historical_photographs_of_Xi%27an" target="_blank" rel="noopener noreferrer">Wikimedia Commons archive ↗</a>
        </footer>`;

      target.insertAdjacentElement("afterend", section);

      if (!reducedMotion && "IntersectionObserver" in window) {
        section.dataset.historyMotion = "ready";
        const observer = new IntersectionObserver(([entry]) => {
          if (!entry.isIntersecting) return;
          section.classList.add("is-visible");
          observer.disconnect();
        }, { rootMargin: "0px 0px -8% 0px", threshold: .08 });
        observer.observe(section);
      } else {
        section.classList.add("is-visible");
      }
    } catch {}
  }

  mount();
})();
