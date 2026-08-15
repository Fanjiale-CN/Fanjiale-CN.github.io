(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initCityAtlas() {
    const atlas = document.querySelector("[data-city-atlas]");
    if (!atlas) return;
    const buttons = [...atlas.querySelectorAll("[data-city-filter]")];
    const cards = [...atlas.querySelectorAll("[data-city-atlas-card]")];
    const status = atlas.querySelector("[data-city-filter-status]");

    function applyFilter(filter) {
      let visible = 0;
      let open = 0;
      cards.forEach((card) => {
        const themes = (card.dataset.themes || "").split(" ");
        const match = filter === "all" || themes.includes(filter);
        card.classList.toggle("is-filtered", !match);
        card.setAttribute("aria-hidden", String(!match));
        if (match) {
          visible += 1;
          if (card.matches("a")) open += 1;
        }
      });
      buttons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.cityFilter === filter)));
      if (status) status.textContent = `${visible} ${visible === 1 ? "city" : "cities"} / ${open} open now`;
    }

    buttons.forEach((button) => button.addEventListener("click", () => applyFilter(button.dataset.cityFilter)));
  }

  function initWorksReel() {
    const reel = document.querySelector("[data-works-reel]");
    if (!reel) return;
    const scenes = [...reel.querySelectorAll("[data-reel-scene]")];
    const controls = [...reel.querySelectorAll("[data-reel-control]")];
    let active = 0;

    function show(index) {
      active = (index + scenes.length) % scenes.length;
      scenes.forEach((scene, sceneIndex) => {
        const selected = sceneIndex === active;
        scene.classList.toggle("is-active", selected);
        scene.setAttribute("aria-hidden", String(!selected));
        const video = scene.querySelector("video");
        if (video) {
          if (selected && !reduceMotion) video.play().catch(() => {});
          else video.pause();
        }
      });
      controls.forEach((control, controlIndex) => control.setAttribute("aria-current", String(controlIndex === active)));
    }

    controls.forEach((control, index) => control.addEventListener("click", () => show(index)));
    reel.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      show(active + (event.key === "ArrowRight" ? 1 : -1));
      controls[active]?.focus();
    });
    document.addEventListener("visibilitychange", () => {
      const video = scenes[active]?.querySelector("video");
      if (!video) return;
      if (document.hidden || reduceMotion) video.pause();
      else video.play().catch(() => {});
    });
    show(0);
  }

  function initNotesStream() {
    const mount = document.querySelector("[data-notes-stream]");
    if (!mount) return;
    const essays = window.GALOK_CONTENT?.essays || [];
    const series = window.GALOK_CONTENT?.series || {};
    mount.innerHTML = essays.map((essay, index) => {
      const s = series[essay.series] || {};
      const lens = s.en || "Note";
      const cover = essay.cover || {};
      const issue = essay.issue ? `ISSUE ${essay.issue} · ` : "";
      const maturity = essay.maturity ? `<em class="notes-row-maturity" data-maturity="${essay.maturity}">${essay.maturity}</em>` : "";
      const seal = s.glyph ? `<span class="notes-row-seal glyph-draw" aria-hidden="true" data-glyph="${s.glyph}" data-pinyin="${s.pinyin}">${s.glyph}</span>` : "";
      const coverMarkup = cover.src
        ? `<span class="notes-row-cover" aria-hidden="true"><img src="${cover.src}" alt="" loading="lazy" decoding="async"></span>`
        : "";
      return `
        <a class="notes-row" href="${essay.url}" style="--accent:${s.color || "var(--archive-ink)"}" data-series="${essay.series}">
          ${coverMarkup}
          <span>${String(index + 1).padStart(2, "0")}</span>
          <small>${issue}${lens} / ${essay.readingTime}${maturity}</small>
          <h3>${seal}${essay.title}</h3>
          ${essay.deck ? `<p class="notes-row-deck">${essay.deck}</p>` : ""}
          <p>${essay.excerpt}</p>
        </a>
      `;
    }).join("");
  }

  function initArchiveSearch() {
    const mount = document.querySelector("[data-archive-results]");
    const input = document.querySelector("[data-archive-search]");
    if (!mount || !input) return;
    const essayItems = (window.GALOK_CONTENT?.essays || []).map((essay) => {
      const maturity = essay.maturity ? ` maturity:${essay.maturity}` : "";
      return {
        type: "Essay",
      title: essay.title,
      description: essay.excerpt,
      href: essay.url,
      tags: `essay notes ${essay.series}${maturity}`
    }});
    const fixedItems = [
      { type: "City", title: "Beijing", description: "Central axis, public ceremony, side streets and contemporary form.", href: "/be-a-viewer/beijing/", tags: "city north old-city night photography video" },
      { type: "City", title: "Shanghai", description: "River, vertical skyline, remembered streets and the city after dark.", href: "/be-a-viewer/shanghai/", tags: "city coast night photography video" },
      { type: "City", title: "Xi’an", description: "Empire, the Terracotta Army, the city wall and the modern city beyond.", href: "/be-a-viewer/xian/", tags: "city north old-city night photography video" },
      { type: "City", title: "Xiamen", description: "Sea light, Minnan rooflines, island streets and the movement of the tide.", href: "/be-a-viewer/xiamen/", tags: "city coast old-city photography video" },
      { type: "City", title: "Hangzhou", description: "West Lake, green hills and a city held behind the waterline.", href: "/be-a-viewer/hangzhou/", tags: "city east old-city lake water video field-note" },
      { type: "Project", title: "Galok editorial website", description: "A modular field notebook joining essays, city stories and visual archives.", href: "/works/#galok-system", tags: "project works web design" },
      { type: "Project", title: "Be a Viewer", description: "Five city stories built from moving image, photography and close observation.", href: "/works/#be-a-viewer-work", tags: "project works city video" },
      { type: "Project", title: "City Postcards", description: "Editorial editions that turn the city archive into a personal object.", href: "/postcards/", tags: "project works postcards photography" },
      { type: "Research", title: "China in more than one number", description: "A data-led reading of growth, households, employment, property and fiscal pressure.", href: "/data/", tags: "research essay data china economy households employment property fiscal" },
      { type: "Visual note", title: "Xiamen field evidence", description: "Ferry light, campus walls, old alleys, gardens and island views.", href: "/visual-notes/xiamen/", tags: "visual note photography city coast" }
    ];
    const items = [...fixedItems, ...essayItems];
    const buttons = [...document.querySelectorAll("[data-archive-filter]")];
    let filter = "all";
    const indexSection = document.querySelector("[data-archive-index]");
    const countNode = document.querySelector("[data-archive-count]");
    if (countNode) countNode.textContent = `${items.length} entries`;

    function setIndexVisible(visible) {
      if (!indexSection) return;
      if (visible) {
        indexSection.hidden = false;
        requestAnimationFrame(() => indexSection.classList.add("is-visible"));
      } else {
        indexSection.classList.remove("is-visible");
        window.setTimeout(() => { indexSection.hidden = true; }, 160);
      }
    }

    function render() {
      const query = input.value.trim().toLowerCase();
      const isSearching = query.length > 0 || filter !== "all";
      setIndexVisible(!isSearching);
      const results = items.filter((item) => {
        const matchesFilter = filter === "all" || item.type.toLowerCase() === filter;
        const haystack = `${item.type} ${item.title} ${item.description} ${item.tags}`.toLowerCase();
        return matchesFilter && (!query || haystack.includes(query));
      });
      mount.innerHTML = results.length ? results.map((item, order) => `
        <a class="archive-result is-entering" style="--result-order: ${order}" href="${item.href}">
          <span>${item.type}</span>
          <h2>${item.title}</h2>
          <p>${item.description}</p>
        </a>
      `).join("") : '<p class="archive-empty is-entering">No matching entries. Try a city, subject or wider term.</p>';
      requestAnimationFrame(() => {
        mount.querySelectorAll(".is-entering").forEach((node) => node.classList.remove("is-entering"));
      });
      const count = document.querySelector("[data-archive-count]");
      if (count) count.textContent = `${results.length} ${results.length === 1 ? "result" : "results"}`;
    }

    input.addEventListener("input", render);
    buttons.forEach((button) => button.addEventListener("click", () => {
      filter = button.dataset.archiveFilter;
      buttons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
      render();
    }));
    render();
  }

  initCityAtlas();
  initWorksReel();
  initNotesStream();
  initArchiveSearch();
})();
