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
    mount.innerHTML = essays.map((essay, index) => {
      const lens = window.GALOK_CONTENT?.series?.[essay.series]?.en || "Note";
      return `
        <a class="notes-row" href="${essay.url}">
          <span>${String(index + 1).padStart(2, "0")}</span>
          <small>${lens} / ${essay.readingTime}</small>
          <h3>${essay.title}</h3>
          <p>${essay.excerpt}</p>
        </a>
      `;
    }).join("");
  }

  function initArchiveSearch() {
    const mount = document.querySelector("[data-archive-results]");
    const input = document.querySelector("[data-archive-search]");
    if (!mount || !input) return;
    const essayItems = (window.GALOK_CONTENT?.essays || []).map((essay) => ({
      type: "Essay",
      title: essay.title,
      description: essay.excerpt,
      href: essay.url,
      tags: `essay notes ${essay.series}`
    }));
    const fixedItems = [
      { type: "City", title: "Beijing", description: "Central axis, public ceremony, side streets and contemporary form.", href: "/be-a-viewer/beijing/", tags: "city north old-city night photography video" },
      { type: "City", title: "Shanghai", description: "River, vertical skyline, remembered streets and the city after dark.", href: "/be-a-viewer/shanghai/", tags: "city coast night photography video" },
      { type: "City", title: "Xi’an", description: "Empire, the Terracotta Army, the city wall and the modern city beyond.", href: "/be-a-viewer/xian/", tags: "city north old-city night photography video" },
      { type: "City", title: "Xiamen", description: "Sea light, Minnan rooflines, island streets and the movement of the tide.", href: "/be-a-viewer/xiamen/", tags: "city coast old-city photography video" },
      { type: "City", title: "Hangzhou", description: "West Lake, green hills and a city held behind the waterline.", href: "/be-a-viewer/hangzhou/", tags: "city east old-city lake water video field-note" },
      { type: "Project", title: "Galok editorial website", description: "A modular field notebook joining essays, city stories and visual archives.", href: "/works/#galok-system", tags: "project works web design" },
      { type: "Project", title: "Be a Viewer", description: "Four city stories built from moving image, photography and close observation.", href: "/works/#be-a-viewer-work", tags: "project works city video" },
      { type: "Project", title: "City Postcards", description: "Editorial editions that turn the city archive into a personal object.", href: "/postcards/", tags: "project works postcards photography" },
      { type: "Visual note", title: "Xiamen field evidence", description: "Ferry light, campus walls, old alleys, gardens and island views.", href: "/visual-notes/xiamen/", tags: "visual note photography city coast" }
    ];
    const items = [...fixedItems, ...essayItems];
    const buttons = [...document.querySelectorAll("[data-archive-filter]")];
    let filter = "all";

    function render() {
      const query = input.value.trim().toLowerCase();
      const results = items.filter((item) => {
        const matchesFilter = filter === "all" || item.type.toLowerCase() === filter;
        const haystack = `${item.type} ${item.title} ${item.description} ${item.tags}`.toLowerCase();
        return matchesFilter && (!query || haystack.includes(query));
      });
      mount.innerHTML = results.length ? results.map((item) => `
        <a class="archive-result" href="${item.href}">
          <span>${item.type}</span>
          <h2>${item.title}</h2>
          <p>${item.description}</p>
        </a>
      `).join("") : '<p class="archive-empty">No matching field notes. Try a city, format or wider term.</p>';
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
