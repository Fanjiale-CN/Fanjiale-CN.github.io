(() => {
  const manifestUrl = "/be-a-viewer/hangzhou/hangzhou-history.json?v=20260828-hz36";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const blocked8964 = /\b(?:8964|1989[\s./-]*0?6[\s./-]*0?4|0?6[\s./-]*0?4[\s./-]*1989|june\s+fourth|tiananmen.{0,24}1989|1989.{0,24}tiananmen)\b/i;
  const allowedRights = new Set(["Public domain", "CC0 1.0", "CC BY 4.0", "CC BY-SA 4.0"]);
  const eras = [
    { id: "before-camera", number: "01", label: "BEFORE THE CAMERA", start: 1300, end: 1899, note: "Maps and images hold the city before photography became its routine witness." },
    { id: "city-remade", number: "02", label: "CITY REMADE", start: 1900, end: 1928, note: "Rail, roads, canals and public buildings register a city being physically rewritten." },
    { id: "lake-display", number: "03", label: "LAKE ON DISPLAY", start: 1929, end: 1949, note: "The lake becomes exposition ground, photographic subject and modern public image." },
    { id: "color-returns", number: "04", label: "COLOR RETURNS", start: 1950, end: 1989, note: "Color records return to water, workshops, parks and streets before the next urban turn." }
  ];

  const encodeFile = (file) => encodeURIComponent(file);
  const imageUrl = (file) => `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeFile(file)}`;

  function validItem(item, index, previousYear) {
    if (!item || typeof item !== "object") return false;
    if (!item.id || !item.file || !item.title || !item.dateLabel || !item.credit || !item.rights || !item.category) return false;
    if (!Number.isInteger(item.year) || item.year < 1300 || item.year > new Date().getFullYear()) return false;
    if (index > 0 && item.year < previousYear) return false;
    if (!allowedRights.has(item.rights)) return false;
    if (!/^https:\/\/commons\.wikimedia\.org\//.test(item.sourceUrl || "")) return false;
    if (blocked8964.test(JSON.stringify(item))) return false;
    return true;
  }

  function cardFor(item, index) {
    const figure = document.createElement("figure");
    figure.className = `hangzhou-history-card hz-history-span-${(index % 6) + 1}`;
    figure.dataset.hangzhouHistoryId = item.id;

    const link = document.createElement("a");
    link.className = "hangzhou-history-media";
    link.href = item.sourceUrl;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.setAttribute("aria-label", `${item.title}, ${item.dateLabel} — open source`);

    const image = document.createElement("img");
    image.src = imageUrl(item.file);
    image.alt = `${item.title}, ${item.dateLabel}`;
    image.loading = "lazy";
    image.decoding = "async";
    image.addEventListener("error", () => figure.classList.add("is-media-missing"), { once: true });
    link.append(image);

    const caption = document.createElement("figcaption");
    caption.innerHTML = `
      <div class="hangzhou-history-card-top">
        <span>${String(index + 1).padStart(2, "0")} / ${item.dateLabel}</span>
        <span>${item.category.toUpperCase()}</span>
      </div>
      <h4>${item.title}</h4>
      <p>${item.credit}</p>
      <div class="hangzhou-history-card-rights"><span>${item.rights}</span><span>COMMONS ↗</span></div>
    `;

    figure.append(link, caption);
    return figure;
  }

  function eraFor(era, items, offset) {
    const block = document.createElement("div");
    block.className = "hangzhou-history-era";
    block.dataset.hangzhouHistoryEra = era.id;

    const aside = document.createElement("aside");
    aside.className = "hangzhou-history-era-label";
    aside.innerHTML = `
      <span>${era.number}</span>
      <h3>${era.label}</h3>
      <p>${era.note}</p>
    `;

    const grid = document.createElement("div");
    grid.className = "hangzhou-history-grid";
    items.forEach((item, localIndex) => grid.append(cardFor(item, offset + localIndex)));

    block.append(aside, grid);
    return block;
  }

  function mount(items) {
    if (document.querySelector(".hangzhou-history")) return;
    const ledger = document.querySelector(".hz-ledger");
    if (!ledger) return;

    const section = document.createElement("section");
    section.className = "hangzhou-history";
    section.id = "hangzhou-history";
    section.setAttribute("aria-labelledby", "hangzhou-history-title");

    section.innerHTML = `
      <header class="hangzhou-history-head">
        <p class="hangzhou-history-kicker">HANGZHOU / HISTORICAL ARCHIVE</p>
        <div class="hangzhou-history-heading">
          <h2 id="hangzhou-history-title">HANGZHOU /<br>BEFORE NOW.</h2>
          <p>Maps, railways, canals, streets and the lake itself. Thirty-six records track the same city across five and a half centuries.</p>
        </div>
        <div class="hangzhou-history-range" aria-label="Archive range">
          <b>36</b>
          <span>RECORDS</span>
          <b>1412—1984</b>
          <span>TIME RANGE</span>
        </div>
      </header>
      <div class="hangzhou-history-waterline" aria-hidden="true"><i></i></div>
    `;

    let offset = 0;
    for (const era of eras) {
      const eraItems = items.filter((item) => item.year >= era.start && item.year <= era.end);
      if (!eraItems.length) continue;
      section.append(eraFor(era, eraItems, offset));
      offset += eraItems.length;
    }

    const footer = document.createElement("footer");
    footer.className = "hangzhou-history-foot";
    footer.innerHTML = `
      <span>ARCHIVE SOURCES / WIKIMEDIA COMMONS</span>
      <a href="https://commons.wikimedia.org/wiki/Category:Historical_images_of_Hangzhou" target="_blank" rel="noreferrer">OPEN HANGZHOU ARCHIVE ↗</a>
    `;
    section.append(footer);
    ledger.insertAdjacentElement("afterend", section);

    const revealTargets = [...section.querySelectorAll(".hangzhou-history-card, .hangzhou-history-era-label")];
    if (reducedMotion || !("IntersectionObserver" in window)) {
      revealTargets.forEach((node) => node.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries, io) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    }, { rootMargin: "0px 0px -7%", threshold: 0.05 });
    revealTargets.forEach((node) => observer.observe(node));
  }

  fetch(manifestUrl, { credentials: "same-origin" })
    .then((response) => {
      if (!response.ok) throw new Error(`Hangzhou history manifest ${response.status}`);
      return response.json();
    })
    .then((manifest) => {
      if (manifest?.version !== "1.0" || manifest?.city !== "Hangzhou" || !Array.isArray(manifest.items)) return;
      const sourceItems = manifest.items.slice(0, 40);
      const valid = [];
      let previousYear = 1300;
      sourceItems.forEach((item, index) => {
        if (!validItem(item, index, previousYear)) return;
        valid.push(item);
        previousYear = item.year;
      });
      if (valid.length < 30) return;
      mount(valid);
    })
    .catch(() => {});
})();