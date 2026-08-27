(() => {
  const target = document.querySelector("[data-xm-city-water]");
  if (!target || document.querySelector("[data-xiamen-history]")) return;

  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = "/be-a-viewer/xiamen/xiamen-history.css?v=20260828-xm26";
  document.head.append(stylesheet);

  const allowedCategories = new Set(["architecture", "street-life", "landscape"]);
  const allowedRights = /^(?:public domain\.?|cc0(?: 1\.0)?|cc by(?:-sa)? (?:2\.0|3\.0|4\.0))$/i;
  const blocked8964 = /(?:8964|八九六四|六四|june\s+fourth|1989\s*(?:tiananmen|beijing\s+protests)|tiananmen\s+(?:square\s+)?(?:protests?|incident|massacre|crackdown))/i;
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
      return url.protocol === "https:"
        && (url.hostname === "commons.wikimedia.org" || url.hostname.endsWith(".wikimedia.org"));
    } catch {
      return false;
    }
  }

  function validItem(item) {
    const searchable = [item?.title, item?.location, item?.sourceLabel, item?.dateLabel].filter(Boolean).join(" ");
    return item
      && allowedCategories.has(item.category)
      && Number.isInteger(item.yearStart)
      && Number.isInteger(item.yearEnd)
      && item.yearStart >= 1800
      && item.yearStart <= item.yearEnd
      && item.yearEnd <= currentYear
      && safeCommonsUrl(item.imageUrl)
      && safeCommonsUrl(item.sourceUrl)
      && allowedRights.test(text(item.rights))
      && !blocked8964.test(searchable);
  }

  const eraFor = (item) => {
    if (item.yearStart < 1880) return "early-port";
    if (item.yearStart < 1900) return "turn-century";
    if (item.yearStart < 1920) return "amoy-archive";
    return "city-continues";
  };

  const eras = [
    { id: "early-port", label: "01 / EARLY PORT", range: "1840s–1870s" },
    { id: "turn-century", label: "02 / TURN OF CENTURY", range: "1890s" },
    { id: "amoy-archive", label: "03 / AMOY ARCHIVE", range: "1900–1919" },
    { id: "city-continues", label: "04 / CITY CONTINUES", range: "1930s–1950s" }
  ];

  function card(item, index) {
    return `
      <article class="xiamen-history-card" data-xiamen-history-id="${escapeHtml(item.id)}">
        <a class="xiamen-history-card__media" href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Open source record for ${escapeHtml(item.title)}">
          <span class="xiamen-history-card__number">${String(index + 1).padStart(2, "0")}</span>
          <img src="${escapeHtml(item.imageUrl)}" alt="Historical Xiamen view: ${escapeHtml(item.title)}" loading="lazy" decoding="async">
        </a>
        <div class="xiamen-history-card__copy">
          <div>
            <h4>${escapeHtml(item.title)}</h4>
            <p>${escapeHtml(item.location)}<br>${escapeHtml(item.sourceLabel)} · ${escapeHtml(item.rights)}</p>
          </div>
          <time>${escapeHtml(item.dateLabel)}</time>
        </div>
      </article>`;
  }

  async function mount() {
    try {
      const response = await fetch("/be-a-viewer/xiamen/xiamen-history.json?v=20260828-xm26", { cache: "force-cache" });
      if (!response.ok) return;
      const data = await response.json();
      const items = Array.isArray(data.items) ? data.items.filter(validItem).slice(0, 30) : [];
      if (items.length < 20) return;

      const firstYear = Math.min(...items.map((item) => item.yearStart));
      const lastYear = Math.max(...items.map((item) => item.yearEnd));
      let runningIndex = 0;
      const periodMarkup = eras.map((era) => {
        const periodItems = items.filter((item) => eraFor(item) === era.id);
        if (!periodItems.length) return "";
        const cards = periodItems.map((item) => card(item, runningIndex++)).join("");
        return `
          <section class="xiamen-history-period" aria-labelledby="xiamen-history-${era.id}">
            <header class="xiamen-history-period__head">
              <h3 id="xiamen-history-${era.id}">${era.label}</h3>
              <span>${era.range}</span>
            </header>
            <div class="xiamen-history-period__grid">${cards}</div>
          </section>`;
      }).join("");

      const section = document.createElement("section");
      section.className = "xiamen-history";
      section.id = "xiamen-history";
      section.dataset.xiamenHistory = "";
      section.setAttribute("aria-labelledby", "xiamen-history-title");
      section.innerHTML = `
        <header class="xiamen-history__masthead">
          <p class="xiamen-history__kicker">CITY MEMORY / ${firstYear} → ${lastYear}</p>
          <div class="xiamen-history__title-row">
            <h2 id="xiamen-history-title">AMOY<br>BEFORE NOW.</h2>
            <p>Port approaches, Gulangyu, schools, docks, hotels, commercial streets and the causeway that tied the island to the mainland — a city read through surviving frames rather than a single cutoff date.</p>
          </div>
          <div class="xiamen-history__counter"><b>${String(items.length).padStart(2, "0")}</b><span>ARCHIVE<br>FRAMES</span></div>
        </header>
        <div class="xiamen-history__periods">${periodMarkup}</div>
        <footer class="xiamen-history__foot">
          <span>Historical Xiamen / Amoy · open-license source records</span>
          <a href="https://commons.wikimedia.org/wiki/Category:Historical_images_of_Xiamen" target="_blank" rel="noopener noreferrer">Wikimedia Commons archive ↗</a>
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
        section.querySelectorAll(".xiamen-history__masthead, .xiamen-history-period, .xiamen-history__foot").forEach((node) => observer.observe(node));
      }
    } catch {}
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  } else {
    mount();
  }
})();
