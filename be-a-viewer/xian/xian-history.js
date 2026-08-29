(() => {
  const target = document.querySelector(".xian-wall");
  if (!target || document.querySelector("[data-xian-history]")) return;
  const VERSION = "20260829-history-cache-fix";
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = `/be-a-viewer/xian/xian-history.css?v=${VERSION}`;
  document.head.append(stylesheet);
  const layoutStyle = document.createElement("style");
  layoutStyle.textContent = `
    .xian-history__grid .xian-history-card:nth-child(6n+1){grid-column:1/8;margin-top:0}
    .xian-history__grid .xian-history-card:nth-child(6n+2){grid-column:8/13;margin-top:clamp(86px,9vw,142px)}
    .xian-history__grid .xian-history-card:nth-child(6n+3){grid-column:2/7;margin-top:clamp(22px,3vw,48px)}
    .xian-history__grid .xian-history-card:nth-child(6n+4){grid-column:7/13;margin-top:clamp(76px,8vw,126px)}
    .xian-history__grid .xian-history-card:nth-child(6n+5){grid-column:1/6;margin-top:clamp(20px,3vw,52px)}
    .xian-history__grid .xian-history-card:nth-child(6n+6){grid-column:6/13;margin-top:clamp(70px,8vw,120px)}
    .xian-history__grid .xian-history-card:nth-child(6n+1) .xian-history-card__media,
    .xian-history__grid .xian-history-card:nth-child(6n+4) .xian-history-card__media,
    .xian-history__grid .xian-history-card:nth-child(6n+6) .xian-history-card__media{aspect-ratio:16/10}
    @media(max-width:820px){.xian-history__grid .xian-history-card:nth-child(n){grid-column:1;margin-top:0}.xian-history__grid .xian-history-card+.xian-history-card{margin-top:34px}.xian-history__grid .xian-history-card:nth-child(n) .xian-history-card__media{aspect-ratio:4/3}}
  `;
  document.head.append(layoutStyle);
  const allowedCategories = new Set(["architecture", "street-life", "landscape"]);
  const blocked8964 = /(?:8964|89\s*64|八九六四|六四(?:事件)?|june\s+fourth|tiananmen.{0,32}1989|1989.{0,32}tiananmen)/i;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const currentYear = new Date().getFullYear();
  const text = (value = "") => String(value).trim();
  const escapeHtml = (value = "") => text(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  function safeCommonsUrl(value) {
    try { const url = new URL(value); return url.protocol === "https:" && (url.hostname === "commons.wikimedia.org" || url.hostname.endsWith(".wikimedia.org")); }
    catch { return false; }
  }
  function validItem(item) {
    const searchable = [item?.title, item?.location, item?.sourceLabel, item?.category, item?.dateLabel].filter(Boolean).join(" ");
    return item && allowedCategories.has(item.category) && Number.isInteger(item.yearStart) && Number.isInteger(item.yearEnd) && item.yearStart >= 1800 && item.yearStart <= item.yearEnd && item.yearEnd <= currentYear && safeCommonsUrl(item.imageUrl) && safeCommonsUrl(item.sourceUrl) && text(item.rights).length > 0 && !blocked8964.test(searchable);
  }
  function card(item, index) {
    return `<article class="xian-history-card" data-history-id="${escapeHtml(item.id)}"><a class="xian-history-card__media" href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Open source record for ${escapeHtml(item.title)}"><span class="xian-history-card__index">${String(index + 1).padStart(2, "0")}</span><img src="${escapeHtml(item.imageUrl)}" alt="Historical Xi'an view: ${escapeHtml(item.title)}" loading="lazy" decoding="async"></a><div class="xian-history-card__copy"><div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.location)}<br>${escapeHtml(item.sourceLabel)}<br>${escapeHtml(item.rights)}</p></div><span>${escapeHtml(item.dateLabel)}</span></div></article>`;
  }
  async function mount() {
    try {
      const response = await fetch(`/be-a-viewer/xian/xian-history.json?v=${VERSION}`, { cache: "force-cache" });
      if (!response.ok) return;
      const data = await response.json();
      const items = Array.isArray(data.items) ? data.items.filter(validItem).slice(0, 30) : [];
      if (items.length < 4) return;
      const firstYear = Math.min(...items.map((item) => item.yearStart));
      const lastYear = Math.max(...items.map((item) => item.yearEnd));
      const section = document.createElement("section");
      section.className = "xian-history"; section.id = "xian-history"; section.dataset.xianHistory = ""; section.setAttribute("aria-labelledby", "xian-history-title");
      section.innerHTML = `<header class="xian-history__head"><div><p class="xian-history__kicker">CITY MEMORY / ${firstYear} → ${lastYear}</p><h2 id="xian-history-title">CHANG’AN<br>BEFORE NOW.</h2></div><p class="xian-history__intro">${items.length} city records across a changing century: gates, wall, streets, public life and ordinary urban space.</p></header><div class="xian-history__grid">${items.map(card).join("")}</div><footer class="xian-history__foot"><span>Curated city records · source and date checks retained</span><a href="https://commons.wikimedia.org/wiki/Category:Historical_photographs_of_Xi%27an" target="_blank" rel="noopener noreferrer">Wikimedia Commons archive ↗</a></footer>`;
      target.insertAdjacentElement("afterend", section);
      if (!reducedMotion && "IntersectionObserver" in window) {
        section.dataset.historyMotion = "ready";
        const observer = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) return; section.classList.add("is-visible"); observer.disconnect(); }, { rootMargin: "0px 0px -8% 0px", threshold: .08 });
        observer.observe(section);
      } else section.classList.add("is-visible");
    } catch {}
  }
  mount();
})();
