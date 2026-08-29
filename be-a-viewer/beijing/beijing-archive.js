(() => {
  const target = document.querySelector("[data-axis-explorer]");
  if (!target || document.querySelector("[data-beijing-archive]")) return;
  const VERSION = "20260829-history-cache-fix";
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = `/be-a-viewer/beijing/beijing-archive.css?v=${VERSION}`;
  document.head.append(stylesheet);
  const layoutStyle = document.createElement("style");
  layoutStyle.textContent = `
    .beijing-archive__grid .beijing-archive-card:nth-child(6n+1){grid-column:1/8;margin-top:0}
    .beijing-archive__grid .beijing-archive-card:nth-child(6n+2){grid-column:8/13;margin-top:clamp(82px,9vw,142px)}
    .beijing-archive__grid .beijing-archive-card:nth-child(6n+3){grid-column:2/7;margin-top:clamp(26px,4vw,60px)}
    .beijing-archive__grid .beijing-archive-card:nth-child(6n+4){grid-column:7/13;margin-top:clamp(70px,8vw,122px)}
    .beijing-archive__grid .beijing-archive-card:nth-child(6n+5){grid-column:1/6;margin-top:clamp(22px,3vw,56px)}
    .beijing-archive__grid .beijing-archive-card:nth-child(6n+6){grid-column:6/13;margin-top:clamp(72px,8vw,132px)}
    .beijing-archive__grid .beijing-archive-card:nth-child(6n+1) .beijing-archive-card__media,
    .beijing-archive__grid .beijing-archive-card:nth-child(6n+4) .beijing-archive-card__media,
    .beijing-archive__grid .beijing-archive-card:nth-child(6n+6) .beijing-archive-card__media{aspect-ratio:16/10}
    @media(max-width:820px){.beijing-archive__grid .beijing-archive-card:nth-child(n){grid-column:1;margin-top:0}.beijing-archive__grid .beijing-archive-card+.beijing-archive-card{margin-top:36px}.beijing-archive__grid .beijing-archive-card:nth-child(n) .beijing-archive-card__media{aspect-ratio:4/3}}
  `;
  document.head.append(layoutStyle);
  const allowedCategories = new Set(["architecture", "street-life", "landscape"]);
  const blocked8964 = /(?:8964|89\s*64|八九六四|六四(?:事件)?|june\s+fourth|tiananmen.{0,32}1989|1989.{0,32}tiananmen)/i;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const currentYear = new Date().getFullYear();
  const text = (value = "") => String(value).trim();
  const escapeHtml = (value = "") => text(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  function safeArchiveUrl(value) {
    try { const url = new URL(value); return url.protocol === "https:" && (url.hostname === "loc.gov" || url.hostname.endsWith(".loc.gov") || url.hostname === "commons.wikimedia.org" || url.hostname.endsWith(".wikimedia.org")); }
    catch { return false; }
  }
  function validItem(item) {
    const searchable = [item?.title, item?.location, item?.sourceLabel, item?.category, item?.dateLabel].filter(Boolean).join(" ");
    return item && allowedCategories.has(item.category) && Number.isInteger(item.yearStart) && Number.isInteger(item.yearEnd) && item.yearStart >= 1800 && item.yearStart <= item.yearEnd && item.yearEnd <= currentYear && safeArchiveUrl(item.imageUrl) && safeArchiveUrl(item.sourceUrl) && text(item.rights).length > 0 && !blocked8964.test(searchable);
  }
  function card(item, index) {
    return `<article class="beijing-archive-card" data-archive-id="${escapeHtml(item.id)}"><a class="beijing-archive-card__media" href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Open source record for ${escapeHtml(item.title)}"><span class="beijing-archive-card__index">${String(index + 1).padStart(2, "0")}</span><img src="${escapeHtml(item.imageUrl)}" alt="Historical Beijing view: ${escapeHtml(item.title)}" loading="lazy" decoding="async"></a><div class="beijing-archive-card__copy"><div><h3>${escapeHtml(item.title)}</h3><p class="beijing-archive-card__meta">${escapeHtml(item.location)}<br>${escapeHtml(item.sourceLabel)}<br>${escapeHtml(item.rights)}</p></div><span class="beijing-archive-card__year">${escapeHtml(item.dateLabel)}</span></div></article>`;
  }
  async function mount() {
    try {
      const response = await fetch(`/be-a-viewer/beijing/beijing-archive.json?v=${VERSION}`, { cache: "force-cache" });
      if (!response.ok) return;
      const data = await response.json();
      const items = Array.isArray(data.items) ? data.items.filter(validItem).slice(0, 30) : [];
      if (items.length < 2) return;
      const firstYear = Math.min(...items.map((item) => item.yearStart));
      const lastYear = Math.max(...items.map((item) => item.yearEnd));
      const section = document.createElement("section");
      section.className = "beijing-archive"; section.id = "beijing-archive"; section.dataset.beijingArchive = ""; section.setAttribute("aria-labelledby", "beijing-archive-title");
      section.innerHTML = `<header class="beijing-archive__head"><div class="beijing-archive__title"><p class="beijing-archive__kicker">CITY MEMORY / ${firstYear} → ${lastYear}</p><h2 id="beijing-archive-title">BEIJING<br>BEFORE NOW.</h2></div><p class="beijing-archive__intro">${items.length} archival views of the city across changing decades: walls, streets, public spaces, housing and the urban fabric that kept moving around them.</p></header><div class="beijing-archive__grid">${items.map(card).join("")}</div><footer class="beijing-archive__foot"><span>Curated historical city records · source and date checks retained</span><span><a href="https://www.loc.gov/pictures/" target="_blank" rel="noopener noreferrer">Library of Congress ↗</a> · <a href="https://commons.wikimedia.org/wiki/Category:Historical_images_of_Beijing" target="_blank" rel="noopener noreferrer">Wikimedia Commons ↗</a></span></footer>`;
      target.insertAdjacentElement("afterend", section);
      if (!reducedMotion && "IntersectionObserver" in window) {
        section.dataset.archiveMotion = "ready";
        const observer = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) return; section.classList.add("is-visible"); observer.disconnect(); }, { rootMargin: "0px 0px -8% 0px", threshold: .08 });
        observer.observe(section);
      } else section.classList.add("is-visible");
    } catch {}
  }
  mount();
})();
