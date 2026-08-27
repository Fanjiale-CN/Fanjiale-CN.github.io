(() => {
  const target = document.querySelector("[data-axis-explorer]");
  if (!target || document.querySelector("[data-beijing-archive]")) return;

  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = "/be-a-viewer/beijing/beijing-archive.css?v=20260827-expand12";
  document.head.append(stylesheet);

  const allowedCategories = new Set(["architecture", "street-life", "landscape"]);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const currentYear = new Date().getFullYear();

  const text = (value = "") => String(value).trim();
  const escapeHtml = (value = "") => text(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

  function safeUrl(value, hostSuffix) {
    try {
      const url = new URL(value);
      return url.protocol === "https:" && (url.hostname === hostSuffix || url.hostname.endsWith(`.${hostSuffix}`));
    } catch {
      return false;
    }
  }

  function validItem(item) {
    return item
      && allowedCategories.has(item.category)
      && Number.isInteger(item.yearStart)
      && Number.isInteger(item.yearEnd)
      && item.yearStart >= 1800
      && item.yearStart <= item.yearEnd
      && item.yearEnd <= currentYear
      && safeUrl(item.imageUrl, "loc.gov")
      && safeUrl(item.sourceUrl, "loc.gov")
      && /no known restrictions on publication/i.test(item.rights || "");
  }

  function card(item, index) {
    return `
      <article class="beijing-archive-card" data-archive-id="${escapeHtml(item.id)}">
        <a class="beijing-archive-card__media" href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Open Library of Congress source record for ${escapeHtml(item.title)}">
          <span class="beijing-archive-card__index">${String(index + 1).padStart(2, "0")}</span>
          <img src="${escapeHtml(item.imageUrl)}" alt="Historical view: ${escapeHtml(item.title)}" loading="lazy" decoding="async">
        </a>
        <div class="beijing-archive-card__copy">
          <div>
            <h3>${escapeHtml(item.title)}</h3>
            <p class="beijing-archive-card__meta">${escapeHtml(item.location)}<br>${escapeHtml(item.sourceLabel)}</p>
          </div>
          <span class="beijing-archive-card__year">${escapeHtml(item.dateLabel)}</span>
        </div>
      </article>`;
  }

  async function mount() {
    try {
      const response = await fetch("/be-a-viewer/beijing/beijing-archive.json?v=20260827-expand12", { cache: "force-cache" });
      if (!response.ok) return;
      const data = await response.json();
      const items = Array.isArray(data.items) ? data.items.filter(validItem).slice(0, 12) : [];
      if (items.length < 2) return;
      const firstYear = Math.min(...items.map((item) => item.yearStart));
      const lastYear = Math.max(...items.map((item) => item.yearEnd));

      const section = document.createElement("section");
      section.className = "beijing-archive";
      section.id = "beijing-archive";
      section.dataset.beijingArchive = "";
      section.setAttribute("aria-labelledby", "beijing-archive-title");
      section.innerHTML = `
        <header class="beijing-archive__head">
          <div class="beijing-archive__title">
            <p class="beijing-archive__kicker">CITY MEMORY / ${firstYear} → ${lastYear}</p>
            <h2 id="beijing-archive-title">BEIJING<br>BEFORE NOW.</h2>
          </div>
          <p class="beijing-archive__intro">A curated archival window into the physical city: walls, roofs, streets, gardens and the geometry that survived into the present.</p>
        </header>
        <div class="beijing-archive__grid">
          ${items.map(card).join("")}
        </div>
        <footer class="beijing-archive__foot">
          <span>Curated historical city-space material · rights and topic checked before publication</span>
          <a href="https://www.loc.gov/pictures/" target="_blank" rel="noopener noreferrer">Library of Congress source archive ↗</a>
        </footer>`;

      target.insertAdjacentElement("afterend", section);

      if (!reducedMotion && "IntersectionObserver" in window) {
        section.dataset.archiveMotion = "ready";
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
