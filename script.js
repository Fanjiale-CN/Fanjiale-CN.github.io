(function () {
  const content = window.GALOK_CONTENT || { essays: [], series: {} };
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const pinyinByGlyph = {
    "\u89c6": "shi",
    "\u8996": "shi",
    "\u52bf": "shi",
    "\u6846": "kuang",
    "\u5bdf": "cha"
  };
  const seriesAccent = {
    macro: "#9e2a2b",
    view: "#9e2a2b",
    frame: "#2f5d7c",
    observe: "#c9a227",
    scene: "#c9a227"
  };
  let activeVisualNote = null;

  document.documentElement.classList.toggle("motion-ready", !reduceMotion);

  function seriesFor(key) {
    return content.series[key] || {};
  }

  function pinyinFor(value) {
    return pinyinByGlyph[value] || "";
  }

  function articleCover(essay) {
    const cover = essay.cover || {};
    return {
      src: cover.src || essay.image || "/assets/visual-notes/city-road.webp",
      alt: cover.alt || essay.imageAlt || `Field image for ${essay.title}`
    };
  }

  function glyph(value, className = "", pinyin = pinyinFor(value)) {
    return `<span class="glyph-draw ${className}" data-glyph="${value}" data-pinyin="${pinyin}" aria-hidden="true">${value}</span>`;
  }

  function essayCard(essay) {
    const series = seriesFor(essay.series);
    const cover = articleCover(essay);
    return `
      <a class="essay-card" href="${essay.url}" style="--accent:${series.color}" data-series="${essay.series}" data-reveal>
        <span class="essay-card-media"><img src="${cover.src}" alt="${cover.alt}" loading="lazy" decoding="async"></span>
        <div class="essay-meta">
          <span>${glyph(series.glyph, "glyph-inline", series.pinyin)} ${series.en}</span>
          <span>${essay.date}</span>
          <span>${essay.readingTime}</span>
        </div>
        ${glyph(essay.anchor, "anchor")}
        <div class="deck">${essay.deck}</div>
        <h3>${essay.title}</h3>
        <p>${essay.excerpt}</p>
      </a>
    `;
  }

  document.querySelectorAll("[data-essay-list]").forEach((mount) => {
    const filter = mount.dataset.filter || "all";
    const limit = Number(mount.dataset.limit || 0);
    let essays = content.essays.filter((essay) => filter === "all" || essay.series === filter);
    if (limit > 0) {
      essays = essays.slice(0, limit);
    }
    mount.innerHTML = essays.map(essayCard).join("");
  });

  function renderCoffeeIcon() {
    return `
      <div class="visual-note-head">
        <span class="visual-note-logo" aria-hidden="true">G</span>
        <span class="visual-note-wordmark">Galok field note</span>
      </div>
      <svg class="visual-note-svg" viewBox="0 0 184 126" aria-hidden="true" focusable="false">
        <path class="visual-note-fill visual-note-fill-main" d="M45 59h66v25c0 16-13 28-29 28h-8c-16 0-29-12-29-28V59Z"></path>
        <path class="visual-note-fill visual-note-fill-soft" d="M32 108c24 9 82 9 106 0"></path>
        <path class="visual-note-line" style="--draw-delay:0ms" pathLength="1" d="M45 59h66v25c0 16-13 28-29 28h-8c-16 0-29-12-29-28V59Z"></path>
        <path class="visual-note-line" style="--draw-delay:90ms" pathLength="1" d="M111 66h12c12 0 20 8 20 18s-8 19-21 19h-11"></path>
        <path class="visual-note-line" style="--draw-delay:180ms" pathLength="1" d="M32 108c24 9 82 9 106 0"></path>
        <path class="visual-note-line" style="--draw-delay:270ms" pathLength="1" d="M66 43c-7-8 7-14 0-23"></path>
        <path class="visual-note-line" style="--draw-delay:360ms" pathLength="1" d="M84 43c-7-8 7-14 0-23"></path>
        <path class="visual-note-line visual-note-receipt" style="--draw-delay:450ms" pathLength="1" d="M135 24h30v49l-5-4-5 4-5-4-5 4-5-4-5 4V24Z"></path>
        <path class="visual-note-line visual-note-receipt" style="--draw-delay:540ms" pathLength="1" d="M142 36h16M142 48h12M142 60h16"></path>
        <circle class="visual-note-dot" cx="32" cy="32" r="3"></circle>
        <circle class="visual-note-dot" cx="42" cy="26" r="2.5"></circle>
      </svg>
      <div class="visual-note-label">coffee as price evidence</div>
    `;
  }

  const visualNoteIcons = {
    coffee: renderCoffeeIcon
  };

  function visualNoteShell(label, svg) {
    return `
      <div class="visual-note-head">
        <span class="visual-note-logo" aria-hidden="true">G</span>
        <span class="visual-note-wordmark">Galok field note</span>
      </div>
      ${svg}
      <div class="visual-note-label">${label}</div>
    `;
  }

  function renderWinterIcon() {
    return visualNoteShell("winter as proof spectacle", `
      <svg class="visual-note-svg visual-note-svg-winter" viewBox="0 0 184 126" aria-hidden="true" focusable="false">
        <path class="visual-note-fill visual-note-fill-main" d="M64 86h56l-12 18H76Z"></path>
        <path class="visual-note-line" style="--draw-delay:0ms" pathLength="1" d="M48 104h88"></path>
        <path class="visual-note-line" style="--draw-delay:90ms" pathLength="1" d="M64 86h56l-12 18H76Z"></path>
        <path class="visual-note-line" style="--draw-delay:180ms" pathLength="1" d="M76 86c-2-18 4-34 18-47 14 13 20 29 18 47"></path>
        <path class="visual-note-line" style="--draw-delay:270ms" pathLength="1" d="M70 64h48M77 50h34M86 38h16"></path>
        <path class="visual-note-line" style="--draw-delay:360ms" pathLength="1" d="M38 32l10 10m0-10L38 42M44 27v20M34 37h20"></path>
        <path class="visual-note-line" style="--draw-delay:450ms" pathLength="1" d="M136 43l8 8m0-8-8 8M140 38v18M131 47h18"></path>
        <circle class="visual-note-dot" cx="58" cy="33" r="2.6"></circle>
        <circle class="visual-note-dot" cx="126" cy="68" r="2.4"></circle>
      </svg>
    `);
  }

  function renderMalatangIcon() {
    return visualNoteShell("malatang as food-driven traffic", `
      <svg class="visual-note-svg visual-note-svg-malatang" viewBox="0 0 184 126" aria-hidden="true" focusable="false">
        <path class="visual-note-fill visual-note-fill-main" d="M44 66h96l-9 32c-3 10-14 17-29 17H82c-15 0-26-7-29-17Z"></path>
        <path class="visual-note-fill visual-note-fill-soft" d="M54 72c18 10 58 10 76 0"></path>
        <path class="visual-note-line" style="--draw-delay:0ms" pathLength="1" d="M44 66h96l-9 32c-3 10-14 17-29 17H82c-15 0-26-7-29-17Z"></path>
        <path class="visual-note-line" style="--draw-delay:80ms" pathLength="1" d="M54 72c18 10 58 10 76 0"></path>
        <path class="visual-note-line" style="--draw-delay:160ms" pathLength="1" d="M67 53c-8-10 8-15 0-26M91 53c-8-10 8-15 0-26M115 53c-8-10 8-15 0-26"></path>
        <path class="visual-note-line" style="--draw-delay:260ms" pathLength="1" d="M42 38l56 20M144 34 92 59"></path>
        <circle class="visual-note-dot broth-dot" cx="75" cy="84" r="4"></circle>
        <circle class="visual-note-dot broth-dot" cx="94" cy="88" r="3.4"></circle>
        <circle class="visual-note-dot broth-dot" cx="113" cy="82" r="3.7"></circle>
        <path class="visual-note-line" style="--draw-delay:520ms" pathLength="1" d="M62 105h60"></path>
      </svg>
    `);
  }

  function renderBarbecueIcon() {
    return visualNoteShell("barbecue as city trust test", `
      <svg class="visual-note-svg visual-note-svg-barbecue" viewBox="0 0 184 126" aria-hidden="true" focusable="false">
        <path class="visual-note-fill visual-note-fill-main" d="M54 78h78v22H54Z"></path>
        <path class="visual-note-line" style="--draw-delay:0ms" pathLength="1" d="M42 100h102M56 100l-8 15M130 100l8 15"></path>
        <path class="visual-note-line" style="--draw-delay:90ms" pathLength="1" d="M54 78h78v22H54Z"></path>
        <path class="visual-note-line" style="--draw-delay:170ms" pathLength="1" d="M61 86h64M61 94h64"></path>
        <path class="visual-note-line" style="--draw-delay:250ms" pathLength="1" d="M45 43l92 36M49 31l92 36M55 19l92 36"></path>
        <path class="visual-note-line visual-note-skewer" style="--draw-delay:340ms" pathLength="1" d="M72 49l12-5 9 9-12 5Z M96 58l12-5 9 9-12 5Z"></path>
        <path class="visual-note-line visual-note-skewer" style="--draw-delay:430ms" pathLength="1" d="M70 36l11-5 9 9-11 5Z M94 45l11-5 9 9-11 5Z"></path>
        <path class="visual-note-line visual-note-skewer" style="--draw-delay:520ms" pathLength="1" d="M76 25l10-5 8 8-10 5Z M100 34l10-5 8 8-10 5Z"></path>
        <path class="visual-note-line visual-note-flame" style="--draw-delay:610ms" pathLength="1" d="M76 78c-7-10 7-12 1-23M93 78c-6-9 8-13 2-24M111 78c-6-8 7-12 2-22"></path>
      </svg>
    `);
  }

  function renderGooseLegIcon() {
    return visualNoteShell("goose-leg as narrative evidence", `
      <svg class="visual-note-svg visual-note-svg-goose-leg" viewBox="0 0 184 126" aria-hidden="true" focusable="false">
        <path class="visual-note-fill visual-note-fill-main" d="M61 65c7-23 30-36 54-29 17 5 30 18 34 34 4 17-6 30-22 33-16 3-30-5-40-18l-16 16c-5 5-13 5-18 0s-5-13 0-18Z"></path>
        <path class="visual-note-line" style="--draw-delay:0ms" pathLength="1" d="M61 65c7-23 30-36 54-29 17 5 30 18 34 34 4 17-6 30-22 33-16 3-30-5-40-18"></path>
        <path class="visual-note-line" style="--draw-delay:100ms" pathLength="1" d="M88 84 72 100c-5 5-13 5-18 0s-5-13 0-18l17-17"></path>
        <path class="visual-note-line" style="--draw-delay:200ms" pathLength="1" d="M57 91c-7 0-12-5-12-11s5-11 12-11"></path>
        <path class="visual-note-line" style="--draw-delay:300ms" pathLength="1" d="M73 99c0 7-5 12-11 12s-11-5-11-12"></path>
        <path class="visual-note-line" style="--draw-delay:400ms" pathLength="1" d="M97 51c15-4 29 2 36 15M92 62c13-4 25 1 31 12M91 74c12-2 21 1 27 9"></path>
        <path class="visual-note-line visual-note-label-line" style="--draw-delay:520ms" pathLength="1" d="M33 35h46M33 45h34M113 20h30M113 29h24"></path>
        <circle class="visual-note-dot" cx="148" cy="71" r="3"></circle>
        <circle class="visual-note-dot" cx="37" cy="80" r="2.8"></circle>
      </svg>
    `);
  }

  function renderChinaZunIcon() {
    return visualNoteShell("China Zun as vertical evidence", `
      <svg class="visual-note-svg visual-note-svg-china-zun" viewBox="0 0 184 126" aria-hidden="true" focusable="false">
        <path class="visual-note-fill visual-note-fill-main" d="M74 112 84 20h18l10 92Z"></path>
        <path class="visual-note-line" style="--draw-delay:0ms" pathLength="1" d="M74 112 84 20h18l10 92Z"></path>
        <path class="visual-note-line" style="--draw-delay:90ms" pathLength="1" d="M86 20c5 8 14 8 20 0"></path>
        <path class="visual-note-line" style="--draw-delay:180ms" pathLength="1" d="M82 42h24M80 58h28M78 74h32M76 90h36"></path>
        <path class="visual-note-line" style="--draw-delay:300ms" pathLength="1" d="M92 23v88M100 23v88"></path>
        <path class="visual-note-line visual-note-zun-cordon" style="--draw-delay:430ms" pathLength="1" d="M38 100h108M46 100l-8 16M138 100l8 16M54 100l20 16M86 100l20 16M118 100l20 16"></path>
        <path class="visual-note-line visual-note-zun-signal" style="--draw-delay:560ms" pathLength="1" d="M124 34c10 6 16 14 18 24M132 25c16 10 26 24 30 42"></path>
        <circle class="visual-note-dot" cx="96" cy="19" r="2.8"></circle>
        <circle class="visual-note-dot" cx="144" cy="65" r="2.4"></circle>
      </svg>
    `);
  }

  Object.assign(visualNoteIcons, {
    winter: renderWinterIcon,
    malatang: renderMalatangIcon,
    barbecue: renderBarbecueIcon,
    "goose-leg": renderGooseLegIcon,
    "china-zun": renderChinaZunIcon
  });

  function resolveKeywordAccent(element) {
    if (element.dataset.accent) return element.dataset.accent;

    const explicitSeries = (element.dataset.series || "").toLowerCase();
    if (seriesAccent[explicitSeries]) return seriesAccent[explicitSeries];

    const seriesParent = element.closest("[data-series]");
    const parentSeries = (seriesParent?.dataset.series || "").toLowerCase();
    if (seriesAccent[parentSeries]) return seriesAccent[parentSeries];

    const computedAccent = getComputedStyle(element).getPropertyValue("--accent").trim();
    if (computedAccent) return computedAccent;

    return getComputedStyle(document.documentElement).getPropertyValue("--ink").trim() || "#171717";
  }

  function positionVisualNote(popover, anchor) {
    const anchorRect = anchor.getBoundingClientRect();
    const noteRect = popover.getBoundingClientRect();
    const noteWidth = popover.offsetWidth || noteRect.width || 196;
    const noteHeight = popover.offsetHeight || noteRect.height || 164;
    const margin = 16;
    const navBottom = document.querySelector(".site-nav")?.getBoundingClientRect().bottom || 0;
    const titleRect = anchor.closest(".article-title")?.getBoundingClientRect();
    const isDesktop = finePointer && window.innerWidth >= 760;

    function clampCandidate(candidate) {
      return {
        x: Math.max(margin, Math.min(candidate.x, window.innerWidth - noteWidth - margin)),
        y: Math.max(navBottom + 8, Math.min(candidate.y, window.innerHeight - noteHeight - margin))
      };
    }

    function overlapsTitle(candidate) {
      if (!titleRect) return false;
      const rect = {
        left: candidate.x,
        right: candidate.x + noteWidth,
        top: candidate.y,
        bottom: candidate.y + noteHeight
      };
      return rect.left < titleRect.right &&
        rect.right > titleRect.left &&
        rect.top < titleRect.bottom &&
        rect.bottom > titleRect.top;
    }

    const rightX = anchorRect.right + 14;
    const leftX = anchorRect.left - noteWidth - 14;
    const titleAbove = titleRect ? titleRect.top - noteHeight - 12 : anchorRect.top - noteHeight - 12;
    const titleBelow = titleRect ? titleRect.bottom + 12 : anchorRect.bottom + 12;
    const titleAvoidanceCandidates = titleRect ? [
      { x: rightX, y: titleAbove },
      { x: anchorRect.right - noteWidth * 0.18, y: titleAbove },
      { x: rightX, y: titleBelow },
      { x: anchorRect.right - noteWidth * 0.18, y: titleBelow }
    ] : [];
    const desktopCandidates = [
      { x: rightX, y: anchorRect.top - 18 },
      { x: rightX, y: anchorRect.top + anchorRect.height / 2 - noteHeight / 2 },
      { x: anchorRect.right - noteWidth * 0.18, y: titleAbove },
      { x: leftX, y: anchorRect.top - 18 }
    ];
    const mobileCandidates = [
      { x: anchorRect.left, y: anchorRect.bottom + 10 },
      { x: anchorRect.left, y: anchorRect.top - noteHeight - 10 },
      { x: anchorRect.left + anchorRect.width / 2 - noteWidth / 2, y: anchorRect.bottom + 10 }
    ];
    const candidates = [
      ...titleAvoidanceCandidates,
      ...(isDesktop ? desktopCandidates : mobileCandidates)
    ];

    const clampedCandidates = candidates.map(clampCandidate);
    const chosen = clampedCandidates.find((candidate) => !overlapsTitle(candidate)) || clampedCandidates[0];
    const { x, y } = chosen;

    popover.style.setProperty("--note-x", `${Math.round(x)}px`);
    popover.style.setProperty("--note-y", `${Math.round(y)}px`);
  }

  function hideVisualNote({ immediate = false } = {}) {
    if (!activeVisualNote) return;
    const { anchor, popover } = activeVisualNote;
    activeVisualNote = null;
    anchor.classList.remove("is-note-open");
    if (!popover.isConnected) return;
    if (immediate || reduceMotion) {
      popover.remove();
      return;
    }
    popover.classList.add("is-leaving");
    window.setTimeout(() => popover.remove(), 240);
  }

  function showVisualNote(element) {
    const visual = element.dataset.visual;
    const renderIcon = visualNoteIcons[visual];
    if (!renderIcon) return;

    hideVisualNote({ immediate: true });

    const accent = resolveKeywordAccent(element);
    const popover = document.createElement("div");
    popover.className = `visual-note-popover visual-note-popover-${visual}`;
    if (reduceMotion) popover.classList.add("is-static");
    popover.setAttribute("aria-hidden", "true");
    popover.style.setProperty("--note-accent", accent);
    popover.style.visibility = "hidden";
    popover.innerHTML = renderIcon();
    document.body.appendChild(popover);

    positionVisualNote(popover, element);
    popover.style.visibility = "visible";
    element.classList.add("is-note-open");
    activeVisualNote = { anchor: element, popover };
  }

  document.querySelectorAll(".keyword-note").forEach((note) => {
    note.style.setProperty("--keyword-note-accent", resolveKeywordAccent(note));
    let hoverTimer = 0;
    note.addEventListener("pointerenter", () => {
      if (!finePointer) return;
      window.clearTimeout(hoverTimer);
      hoverTimer = window.setTimeout(() => showVisualNote(note), 240);
    });
    note.addEventListener("pointerleave", () => {
      window.clearTimeout(hoverTimer);
      if (finePointer && activeVisualNote?.anchor === note) hideVisualNote();
    });
    note.addEventListener("mouseenter", () => {
      if (!finePointer) return;
      window.clearTimeout(hoverTimer);
      hoverTimer = window.setTimeout(() => showVisualNote(note), 240);
    });
    note.addEventListener("mouseleave", () => {
      window.clearTimeout(hoverTimer);
      if (finePointer && activeVisualNote?.anchor === note) hideVisualNote();
    });
    note.addEventListener("focus", () => showVisualNote(note));
    note.addEventListener("blur", () => hideVisualNote());
    note.addEventListener("click", (event) => {
      event.stopPropagation();
      window.clearTimeout(hoverTimer);
      showVisualNote(note);
    });
    note.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        window.clearTimeout(hoverTimer);
        showVisualNote(note);
      }
    });
  });

  document.addEventListener("pointerdown", (event) => {
    if (!activeVisualNote || !(event.target instanceof Element)) return;
    if (event.target.closest(".keyword-note")) return;
    hideVisualNote();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") hideVisualNote();
  });

  window.addEventListener("resize", () => hideVisualNote({ immediate: true }));
  window.addEventListener("scroll", () => hideVisualNote({ immediate: true }), { passive: true });

  const filterGroup = document.querySelector(".filters");
  const essayList = document.querySelector("[data-essay-list]");
  if (filterGroup && essayList) {
    const filterButtons = Array.from(filterGroup.querySelectorAll(".filter-button[data-filter]"));
    const essayCards = Array.from(essayList.querySelectorAll(".essay-card[data-series]"));
    const filterStatus = document.querySelector("[data-filter-status]");
    const requestedFilter = new URLSearchParams(window.location.search).get("view");
    let activeFilter = filterButtons.some((button) => button.dataset.filter === requestedFilter)
      ? requestedFilter
      : (essayList.dataset.filter || "all");
    let filterRun = 0;
    let commitTimer = 0;
    let cleanupTimer = 0;

    function clearFilterTimers() {
      window.clearTimeout(commitTimer);
      window.clearTimeout(cleanupTimer);
    }

    function finishFilterMotion(run) {
      if (run !== filterRun) return;
      essayCards.forEach((card) => {
        card.classList.remove("is-filter-entering", "is-filter-leaving");
        card.style.removeProperty("--filter-order");
      });
      essayList.removeAttribute("aria-busy");
    }

    function announceFilter(filter, count) {
      if (!filterStatus) return;
      const selected = filterButtons.find((item) => item.dataset.filter === filter);
      const label = selected ? selected.textContent.trim().replace(/^\S+\s+/, "") : "selected";
      filterStatus.textContent = filter === "all"
        ? `Showing all ${count} essays.`
        : `Showing ${count} ${label} ${count === 1 ? "essay" : "essays"}.`;
    }

    function showFilterResults(filter, run, animate) {
      if (run !== filterRun) return;
      const matchingCards = [];

      essayCards.forEach((card) => {
        const matches = filter === "all" || card.dataset.series === filter;
        card.classList.remove("is-filter-entering", "is-filter-leaving");
        card.hidden = !matches;
        if (matches) {
          card.removeAttribute("aria-hidden");
          card.classList.add("is-visible");
          matchingCards.push(card);
        } else {
          card.setAttribute("aria-hidden", "true");
        }
      });

      announceFilter(filter, matchingCards.length);

      if (!animate || reduceMotion) {
        finishFilterMotion(run);
        return;
      }

      matchingCards.forEach((card, index) => {
        card.style.setProperty("--filter-order", String(index));
      });
      void essayList.offsetWidth;
      matchingCards.forEach((card) => card.classList.add("is-filter-entering"));

      const stagger = Math.min(Math.max(0, matchingCards.length - 1), 5) * 55;
      cleanupTimer = window.setTimeout(() => finishFilterMotion(run), 520 + stagger);
    }

    function applyFilter(filter, { animate = true } = {}) {
      if (!filterButtons.some((item) => item.dataset.filter === filter)) return;
      if (filter === activeFilter && !essayList.hasAttribute("aria-busy")) return;

      activeFilter = filter;
      essayList.dataset.filter = filter;
      const run = ++filterRun;
      clearFilterTimers();
      essayCards.forEach((card) => card.classList.remove("is-filter-entering", "is-filter-leaving"));

      filterButtons.forEach((item) => {
        item.setAttribute("aria-pressed", String(item.dataset.filter === filter));
      });

      essayList.setAttribute("aria-busy", "true");
      const visibleCards = essayCards.filter((card) => !card.hidden);

      if (animate && !reduceMotion && visibleCards.length) {
        visibleCards.forEach((card) => card.classList.add("is-filter-leaving"));
        commitTimer = window.setTimeout(() => showFilterResults(filter, run, true), 150);
      } else {
        showFilterResults(filter, run, false);
      }
    }

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const filter = button.dataset.filter || "all";
        const url = new URL(window.location.href);
        if (filter === "all") url.searchParams.delete("view");
        else url.searchParams.set("view", filter);
        window.history.replaceState({}, "", url);
        applyFilter(filter);
      });
    });

    if (activeFilter !== "all") {
      const initialFilter = activeFilter;
      activeFilter = "all";
      essayList.dataset.filter = "all";
      applyFilter(initialFilter, { animate: false });
    } else {
      announceFilter("all", essayCards.length);
    }
  }

  function initInteractiveCharts() {
    document.querySelectorAll(".interactive-chart").forEach((chart) => {
      const detail = chart.querySelector(".chart-detail");
      const controls = chart.querySelectorAll("[data-detail]");

      function activate(control) {
        if (!control || !detail) return;
        const group = control.closest(".interactive-chart");
        group?.querySelectorAll("[data-detail]").forEach((item) => {
          item.classList.remove("is-active");
          if (item instanceof HTMLButtonElement) item.setAttribute("aria-pressed", "false");
        });
        control.classList.add("is-active");
        if (control instanceof HTMLButtonElement) control.setAttribute("aria-pressed", "true");
        detail.textContent = control.dataset.detail || "";
        const composition = group?.querySelector(".batch-composition");
        const compositionValue = Number(control.dataset.composition);
        if (composition && Number.isFinite(compositionValue)) {
          composition.style.setProperty("--batch-composition-primary", `${compositionValue}%`);
        }
      }

      controls.forEach((control) => {
        control.addEventListener("click", () => activate(control));
        control.addEventListener("focus", () => activate(control));
        control.addEventListener("pointerenter", () => {
          if (finePointer) activate(control);
        });
      });

      const loopCore = chart.querySelector(".loop-core");
      if (loopCore) {
        loopCore.addEventListener("click", () => {
          chart.classList.remove("is-expanded");
          chart.classList.add("is-collapsed");
          window.requestAnimationFrame(() => {
            void chart.offsetWidth;
            chart.classList.remove("is-collapsed");
            chart.classList.add("is-expanded");
            if (detail) detail.textContent = "The feed creates desire, then turns that desire into public evidence.";
          });
        });
        loopCore.addEventListener("focus", () => {
          if (detail) detail.textContent = "Public receipt: the platform makes the story around a product visible.";
        });
      }
    });
  }

  initInteractiveCharts();

  function initBatchChapterNavigation() {
    const desktop = document.querySelector(".batch-chapter-nav");
    const mobile = document.querySelector(".batch-chapter-menu");
    if (!desktop && !mobile) return;

    const links = Array.from(document.querySelectorAll(".batch-chapter-nav a[href^='#'], .batch-chapter-menu a[href^='#']"));
    const sections = Array.from(new Set(links
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter((section) => section instanceof HTMLElement)));
    const chapterLabel = mobile?.querySelector("[data-chapter-label]");
    const mobileSummary = mobile?.querySelector("summary");

    function setCurrent(section) {
      if (!section?.id) return;
      const currentHref = `#${section.id}`;
      links.forEach((link) => {
        if (link.getAttribute("href") === currentHref) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
      const currentLink = links.find((link) => link.getAttribute("href") === currentHref);
      if (chapterLabel && currentLink) chapterLabel.textContent = currentLink.textContent.trim().replace(/\s+/g, " ");
    }

    links.forEach((link) => link.addEventListener("click", () => {
      const section = document.querySelector(link.getAttribute("href"));
      if (section instanceof HTMLElement) setCurrent(section);
      if (mobile?.open) {
        mobile.open = false;
        window.requestAnimationFrame(() => mobileSummary?.focus({ preventScroll: true }));
      }
    }));

    if (!("IntersectionObserver" in window) || !sections.length) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target instanceof HTMLElement) setCurrent(visible.target);
    }, { rootMargin: "-28% 0px -58% 0px", threshold: [0, 0.05, 0.2] });
    sections.forEach((section) => observer.observe(section));
  }

  initBatchChapterNavigation();

  function initSpatialHero() {
    const hero = document.querySelector("[data-spatial-hero]");
    if (!hero) return;

    const depthLayers = Array.from(hero.querySelectorAll("[data-depth]"));
    const chapters = Array.from(hero.querySelectorAll("[data-spatial-chapter]"));
    const sceneRuler = hero.querySelector(".spatial-scene-ruler");
    const sceneLabel = hero.querySelector("[data-scene-label]");
    let frame = 0;
    let lastPointer = null;
    let leaveTimer = 0;

    function resetField() {
      window.clearTimeout(leaveTimer);
      hero.classList.remove("is-interacting");
      hero.style.setProperty("--tilt-x", "0deg");
      hero.style.setProperty("--tilt-y", "0deg");
      hero.style.setProperty("--backdrop-x", "0px");
      hero.style.setProperty("--backdrop-y", "0px");
      depthLayers.forEach((layer) => {
        layer.style.setProperty("--shift-x", "0px");
        layer.style.setProperty("--shift-y", "0px");
        layer.style.setProperty("--shift-z", "0px");
      });
    }

    function paintField() {
      frame = 0;
      if (!lastPointer) return;

      const rect = hero.getBoundingClientRect();
      const normalizedX = Math.max(-1, Math.min(1, ((lastPointer.clientX - rect.left) / rect.width - 0.5) * 2));
      const normalizedY = Math.max(-1, Math.min(1, ((lastPointer.clientY - rect.top) / rect.height - 0.5) * 2));

      hero.classList.add("is-interacting");
      hero.style.setProperty("--tilt-x", `${(-normalizedY * 0.72).toFixed(3)}deg`);
      hero.style.setProperty("--tilt-y", `${(normalizedX * 0.92).toFixed(3)}deg`);
      hero.style.setProperty("--backdrop-x", `${(-normalizedX * 3.4).toFixed(2)}px`);
      hero.style.setProperty("--backdrop-y", `${(-normalizedY * 2.6).toFixed(2)}px`);

      depthLayers.forEach((layer) => {
        const depth = Number(layer.dataset.depth || 1);
        layer.style.setProperty("--shift-x", `${(-normalizedX * depth * 7.5).toFixed(2)}px`);
        layer.style.setProperty("--shift-y", `${(-normalizedY * depth * 5.5).toFixed(2)}px`);
        layer.style.setProperty("--shift-z", `${(depth * 5).toFixed(2)}px`);
      });
    }

    if (!reduceMotion && finePointer) {
      hero.addEventListener("pointermove", (event) => {
        lastPointer = event;
        if (!frame) frame = window.requestAnimationFrame(paintField);
      });

      hero.addEventListener("pointerleave", () => {
        lastPointer = null;
        if (frame) window.cancelAnimationFrame(frame);
        frame = 0;
        leaveTimer = window.setTimeout(resetField, 40);
      });
    }

    function setChapter(chapter) {
      chapters.forEach((item) => item.classList.toggle("is-active", item === chapter));
      if (sceneLabel) sceneLabel.textContent = `Scene ${chapter?.dataset.spatialChapter || "00"} / 03`;
      sceneRuler?.classList.toggle("is-active", Boolean(chapter));
    }

    chapters.forEach((chapter) => {
      chapter.addEventListener("pointerenter", () => setChapter(chapter));
      chapter.addEventListener("pointerleave", () => setChapter(null));
      chapter.addEventListener("focus", () => setChapter(chapter));
      chapter.addEventListener("blur", () => setChapter(null));
    });

    if (!reduceMotion && window.gsap) {
      const motion = window.gsap.matchMedia();
      motion.add("(max-width: 900px)", () => {
        const timeline = window.gsap.timeline({
          defaults: { duration: 0.48, ease: "power2.out" }
        });

        timeline.from(hero.querySelector(".spatial-backdrop"), {
          autoAlpha: 0.28,
          scale: 1.018,
          duration: 0.92,
          ease: "power3.out",
          transformOrigin: "50% 50%"
        }, 0.12);

        timeline.from(".spatial-nav .nav-links a", {
          autoAlpha: 0,
          y: -10,
          duration: 0.42,
          stagger: 0.055,
          ease: "power2.out"
        }, 0.2);

        return () => timeline.kill();
      });
    }
  }

  initSpatialHero();

  function initHomepageActionFlow() {
    const seriesSection = document.querySelector("#series");
    const seriesCards = Array.from(document.querySelectorAll("[data-series-key]"));
    const seriesTriggers = Array.from(document.querySelectorAll("[data-series-jump]"));
    if (!seriesSection || seriesTriggers.length === 0) return;

    let clearTimer = 0;

    function clearSeriesGuide() {
      window.clearTimeout(clearTimer);
      seriesTriggers.forEach((trigger) => trigger.classList.remove("is-active"));
      seriesCards.forEach((card) => card.classList.remove("is-spotlit", "is-dimmed"));
      seriesSection.querySelector(".series-grid")?.classList.remove("is-guided");
    }

    function guideSeries(key, trigger) {
      clearSeriesGuide();
      seriesSection.querySelector(".series-grid")?.classList.add("is-guided");
      trigger?.classList.add("is-active");

      const showAll = key === "all";
      seriesCards.forEach((card) => {
        const match = showAll || card.dataset.seriesKey === key;
        card.classList.toggle("is-spotlit", match);
        card.classList.toggle("is-dimmed", !match);
      });

      clearTimer = window.setTimeout(clearSeriesGuide, showAll ? 2400 : 3200);
    }

    seriesTriggers.forEach((trigger) => {
      trigger.addEventListener("click", (event) => {
        const key = trigger.dataset.seriesJump || "all";
        const localTarget = trigger.getAttribute("href")?.startsWith("#");
        if (localTarget) {
          event.preventDefault();
          const top = window.scrollY + seriesSection.getBoundingClientRect().top;
          window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
          window.setTimeout(() => guideSeries(key, trigger), reduceMotion ? 0 : 360);
        } else {
          guideSeries(key, trigger);
        }
      });
    });
  }

  initHomepageActionFlow();

  document.querySelectorAll("[data-identity-toggle]").forEach((button) => {
    const film = button.closest("[data-logo-reel]");
    if (!film) return;

    button.addEventListener("click", () => {
      const paused = film.classList.toggle("is-paused");
      button.setAttribute("aria-pressed", paused ? "true" : "false");
      button.setAttribute("aria-label", paused ? "Play identity animation" : "Pause identity animation");
    });
  });

  if (!reduceMotion && finePointer) {
    const cursor = document.createElement("div");
    cursor.className = "glyph-cursor";
    cursor.setAttribute("aria-hidden", "true");
    document.body.appendChild(cursor);

    let activeGlyph = null;
    let typeTimer = 0;
    let finalTimer = 0;

    function moveCursor(event) {
      cursor.style.transform = `translate3d(${event.clientX + 16}px, ${event.clientY + 18}px, 0) scale(1)`;
    }

    function clearGlyphTimers() {
      window.clearInterval(typeTimer);
      window.clearTimeout(finalTimer);
    }

    function typeThenResolve(target) {
      clearGlyphTimers();
      const glyphValue = target.dataset.glyph || target.textContent.trim();
      const pinyin = target.dataset.pinyin || pinyinFor(glyphValue);
      cursor.classList.remove("is-final");
      cursor.textContent = "";
      let index = 0;
      typeTimer = window.setInterval(() => {
        index += 1;
        cursor.textContent = pinyin.slice(0, index);
        if (index >= pinyin.length) {
          window.clearInterval(typeTimer);
          finalTimer = window.setTimeout(() => {
            cursor.textContent = glyphValue;
            cursor.classList.add("is-final");
          }, 240);
        }
      }, 58);
    }

    function showGlyphCue(target, event) {
      if (!target || target === activeGlyph) {
        if (event) moveCursor(event);
        return;
      }
      if (activeGlyph) activeGlyph.classList.remove("is-glyph-hovered");
      activeGlyph = target;
      activeGlyph.classList.add("is-glyph-hovered");
      cursor.style.setProperty("--glyph-color", getComputedStyle(target).color);
      moveCursor(event);
      cursor.classList.add("is-visible");
      typeThenResolve(target);
    }

    function hideGlyphCue() {
      clearGlyphTimers();
      if (activeGlyph) activeGlyph.classList.remove("is-glyph-hovered");
      activeGlyph = null;
      cursor.classList.remove("is-visible", "is-final");
      cursor.textContent = "";
    }

    function glyphTargetFromEvent(event) {
      if (!(event.target instanceof Element)) return null;
      if (event.target.closest(".keyword-note")) return null;
      const direct = event.target.closest(".glyph-draw");
      if (direct) return direct;
      const scope = event.target.closest(".essay-card, .series-card, .filter-button, .article-hero, .page-kicker, .series-pill, .hero-system span");
      return scope ? scope.querySelector(".glyph-draw") : null;
    }

    document.addEventListener("pointerover", (event) => {
      const target = glyphTargetFromEvent(event);
      if (target) showGlyphCue(target, event);
    });

    document.addEventListener("mouseover", (event) => {
      const target = glyphTargetFromEvent(event);
      if (target) showGlyphCue(target, event);
    });

    document.addEventListener("pointermove", (event) => {
      if (activeGlyph) moveCursor(event);
    });

    document.addEventListener("mousemove", (event) => {
      if (activeGlyph) moveCursor(event);
    });

    document.addEventListener("pointerout", (event) => {
      if (!activeGlyph) return;
      const next = event.relatedTarget;
      if (next instanceof Element && activeGlyph.contains(next)) return;
      const current = glyphTargetFromEvent(event);
      const nextGlyph = next instanceof Element ? (next.closest(".glyph-draw") || next.closest(".essay-card, .series-card, .filter-button, .article-hero, .page-kicker, .series-pill, .hero-system span")?.querySelector(".glyph-draw")) : null;
      if (current === activeGlyph && nextGlyph !== activeGlyph) hideGlyphCue();
    });

    document.addEventListener("mouseout", (event) => {
      if (!activeGlyph) return;
      const next = event.relatedTarget;
      if (next instanceof Element && activeGlyph.contains(next)) return;
      const current = glyphTargetFromEvent(event);
      const nextGlyph = next instanceof Element ? (next.closest(".glyph-draw") || next.closest(".essay-card, .series-card, .filter-button, .article-hero, .page-kicker, .series-pill, .hero-system span")?.querySelector(".glyph-draw")) : null;
      if (current === activeGlyph && nextGlyph !== activeGlyph) hideGlyphCue();
    });
  }

  const revealItems = () => document.querySelectorAll("[data-reveal]");
  if (!reduceMotion) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      // Start the reveal before a section enters the viewport so fast scrolls
      // never expose a full-screen gap while content is still transparent.
      { threshold: 0.01, rootMargin: "0px 0px 18% 0px" }
    );
    revealItems().forEach((item) => observer.observe(item));
    setTimeout(() => revealItems().forEach((item) => observer.observe(item)), 50);
  } else {
    revealItems().forEach((item) => item.classList.add("is-visible"));
  }

  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });
})();

(function initFieldSystem() {
  const content = window.GALOK_CONTENT || { essays: [], series: {} };
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const body = document.body;
  const siteNav = document.querySelector(".site-nav");

  function enhanceAccessibilityShell() {
    const main = document.querySelector("main");
    if (!main) return;

    if (!main.id) main.id = "main-content";
    if (!document.querySelector(".skip-link")) {
      const skipLink = document.createElement("a");
      skipLink.className = "skip-link";
      skipLink.href = `#${main.id}`;
      skipLink.textContent = "Skip to content";
      body.prepend(skipLink);
    }
  }

  function enhanceNavigation() {
    if (!siteNav) return;

    const navInner = siteNav.querySelector(".nav-inner");
    const brand = siteNav.querySelector(".brand");
    const links = siteNav.querySelector(".nav-links");
    if (!navInner || !brand || !links) return;

    const primaryLinks = [
      { href: "/views/", label: "Views", matches: ["/views/", "/essays/"] },
      { href: "/visual-notes/", label: "Visual Notes", match: "/visual-notes/" },
      { href: "/be-a-viewer/", label: "Be a Viewer", match: "/be-a-viewer/" },
      { href: "/postcards/", label: "Postcards", match: "/postcards/" },
      { href: "/about/", label: "About", match: "/about/" }
    ];
    const currentPath = window.location.pathname;
    links.replaceChildren(...primaryLinks.map((item) => {
      const link = document.createElement("a");
      link.href = item.href;
      link.textContent = item.label;
      const matches = item.matches || [item.match];
      if (matches.some((match) => currentPath.startsWith(match))) link.setAttribute("aria-current", "page");
      return link;
    }));
    links.id = "primary-navigation-links";

    if (!brand.querySelector(".brand-lockup")) {
      brand.innerHTML = `
        <img class="brand-mark" src="/assets/galok-symbol.svg" alt="" aria-hidden="true">
        <span class="brand-lockup"><b>GALOK</b><small>Field notes</small></span>
      `;
    }

    let toggle = navInner.querySelector(".nav-menu-toggle");
    if (!toggle) {
      toggle = document.createElement("button");
      toggle.className = "nav-menu-toggle";
      toggle.type = "button";
      toggle.textContent = "Menu";
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open navigation");
      navInner.appendChild(toggle);
    }
    toggle.setAttribute("aria-controls", links.id);

    let menuReturnFocus = null;

    function setMenu(open, restoreFocus = true) {
      if (open === body.classList.contains("nav-open")) return;
      if (open) menuReturnFocus = document.activeElement;
      body.classList.toggle("nav-open", open);
      if (open) body.classList.remove("site-chrome-hidden");
      toggle.textContent = open ? "Close" : "Menu";
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
      if (open) {
        window.requestAnimationFrame(() => links.querySelector("a")?.focus({ preventScroll: true }));
      } else if (restoreFocus && menuReturnFocus instanceof HTMLElement) {
        menuReturnFocus.focus({ preventScroll: true });
      }
    }

    toggle.addEventListener("click", () => setMenu(!body.classList.contains("nav-open")));
    links.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false, false)));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && body.classList.contains("nav-open")) setMenu(false);
      if (event.key !== "Tab" || !body.classList.contains("nav-open")) return;

      const focusable = [brand, ...links.querySelectorAll("a"), toggle].filter((element) => !element.hidden);
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 760 && body.classList.contains("nav-open")) setMenu(false, false);
    }, { passive: true });

    const touchNavigation = navigator.maxTouchPoints > 0 ||
      window.matchMedia("(hover: none), (pointer: coarse)").matches;
    const xianMotionClock = body.classList.contains("xian-page-body");
    const stableArticleChrome = body.classList.contains("batch-article-body");
    const noiseFloor = touchNavigation ? 6 : 1.5;
    const hideDistance = touchNavigation ? 78 : 32;
    const showDistance = touchNavigation ? 46 : 22;
    const scrollRoot = document.scrollingElement || document.documentElement;
    let previousY = Math.max(0, Math.min(window.scrollY, scrollRoot.scrollHeight - window.innerHeight));
    let direction = 0;
    let directionDistance = 0;
    let navigationFrame = 0;

    function syncNavigation(position = null) {
      navigationFrame = 0;
      const maximum = Math.max(0, scrollRoot.scrollHeight - window.innerHeight);
      const nextY = Math.max(0, Math.min(position ?? window.scrollY, maximum));
      const delta = nextY - previousY;
      const nextDirection = Math.abs(delta) >= noiseFloor ? (delta > 0 ? 1 : -1) : 0;

      if (!xianMotionClock) siteNav.classList.toggle("is-scrolled", nextY > 24);

      if (stableArticleChrome) {
        body.classList.remove("site-chrome-hidden");
        previousY = nextY;
        directionDistance = 0;
        direction = 0;
        return;
      }

      if (nextY < 32 || body.classList.contains("nav-open")) {
        body.classList.remove("site-chrome-hidden");
        directionDistance = 0;
        direction = 0;
      } else if (nextDirection) {
        if (nextDirection !== direction) directionDistance = Math.abs(delta);
        else directionDistance += Math.abs(delta);
        const threshold = nextDirection > 0 ? hideDistance : showDistance;
        if (directionDistance >= threshold) {
          if (nextDirection > 0) body.classList.add("site-chrome-hidden");
          else body.classList.remove("site-chrome-hidden");
          directionDistance = 0;
        }
        direction = nextDirection;
      }

      previousY = nextY;
    }

    function requestNavigationSync() {
      if (!navigationFrame) navigationFrame = requestAnimationFrame(() => syncNavigation());
    }

    siteNav.addEventListener("focusin", () => body.classList.remove("site-chrome-hidden"));
    syncNavigation();
    if (stableArticleChrome) {
      window.addEventListener("resize", requestNavigationSync, { passive: true });
    } else if (xianMotionClock) {
      window.addEventListener("xian:motion-frame", (event) => syncNavigation(event.detail?.scrollY));
    } else {
      window.addEventListener("scroll", requestNavigationSync, { passive: true });
      window.addEventListener("resize", requestNavigationSync, { passive: true });
    }
  }

  function enhanceFooter() {
    const footer = document.querySelector("footer.footer:not(.field-footer)");
    if (!footer || footer.dataset.enhanced === "true") return;

    const pageLinks = Array.from(footer.querySelectorAll("a")).map((link) => ({
      href: link.getAttribute("href") || "/",
      label: link.textContent.trim()
    })).filter((link, index, list) => link.label &&
      list.findIndex((candidate) => candidate.href === link.href && candidate.label === link.label) === index);
    const pageLabel = document.title.replace(/\s*-\s*Galok$/i, "").replace(/\s*\|\s*Galok$/i, "") || "Field notes";
    const pageLinkMarkup = pageLinks.length
      ? pageLinks.map((link) => `<a href="${link.href}">${link.label}</a>`).join("")
      : '<a href="/">Home</a>';

    footer.dataset.enhanced = "true";
    footer.innerHTML = `
      <div class="footer-inner footer-directory">
        <a class="footer-brand" href="/" aria-label="Galok home">
          <img src="/assets/galok-symbol.svg" alt="" aria-hidden="true">
          <span><b>GALOK</b><small>Field notes</small></span>
        </a>
        <div class="footer-column">
          <span>Explore</span>
          <a href="/views/">Views</a>
          <a href="/visual-notes/">Visual Notes</a>
          <a href="/be-a-viewer/">Be a Viewer</a>
          <a href="/postcards/">Postcards</a>
          <a href="/about/">About</a>
        </div>
        <div class="footer-column">
          <span>${pageLabel}</span>
          ${pageLinkMarkup}
        </div>
        <div class="footer-column">
          <span>Follow</span>
          <a href="https://medium.com/@galokview" target="_blank" rel="noreferrer">Medium</a>
          <a href="https://x.com/galokview" target="_blank" rel="noreferrer">X</a>
          <a href="mailto:galokview@outlook.com">Email</a>
        </div>
        <p>© <span data-current-year>${new Date().getFullYear()}</span> Galok<br>Independent field notes.</p>
      </div>
    `;
  }

  function labelInteriorPage() {
    const hero = document.querySelector(".page-hero");
    if (!hero) return;
    const path = window.location.pathname;
    let index = "01";
    if (path.includes("/series/")) index = "01";
    if (path.includes("/visual-notes/")) index = "03";
    if (path.includes("/postcards/")) index = "04";
    if (path.includes("/about/")) index = "05";
    hero.dataset.sectionIndex = index;
  }

  function initArticleProgress() {
    const article = document.querySelector(".article-content");
    if (!article) return;

    const progress = document.createElement("div");
    progress.className = "article-read-progress";
    progress.setAttribute("aria-hidden", "true");
    progress.innerHTML = "<span></span>";
    body.appendChild(progress);
    const bar = progress.querySelector("span");

    function updateProgress() {
      const rect = article.getBoundingClientRect();
      const articleTop = window.scrollY + rect.top;
      const readable = Math.max(1, article.offsetHeight - window.innerHeight * 0.55);
      const read = Math.min(1, Math.max(0, (window.scrollY - articleTop + window.innerHeight * 0.28) / readable));
      bar.style.width = `${(read * 100).toFixed(2)}%`;
    }

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
  }

  function initGlobalContactModule() {
    document.querySelectorAll('a[href="https://x.com/galok"]').forEach((link) => {
      link.href = "https://x.com/galokview";
    });

    const footer = document.querySelector("footer.footer");
    if (!footer || document.querySelector(".site-contact")) return;

    const contact = document.createElement("section");
    contact.className = "site-contact";
    contact.setAttribute("aria-label", "Contact Galok");
    contact.innerHTML = `
      <div class="site-contact-inner">
        <p>CONTACT / GALOK</p>
        <h2>Write to Galok.</h2>
        <a href="mailto:galokview@outlook.com">galokview@outlook.com</a>
      </div>
    `;
    footer.before(contact);
  }

  function initFieldHeroCarousel() {
    const hero = document.querySelector("[data-field-hero]");
    if (!hero) return;

    const stage = hero.querySelector("[data-field-hero-stage]");
    const slides = Array.from(hero.querySelectorAll("[data-field-hero-slide]"));
    const videos = slides.map((slide) => slide.querySelector("[data-field-hero-video]"));
    const dots = Array.from(hero.querySelectorAll("[data-field-hero-dot]"));
    const progress = hero.querySelector("[data-field-hero-progress]");
    const toggle = hero.querySelector("[data-field-hero-toggle]");
    const fields = {
      note: hero.querySelector("[data-field-hero-note]"),
      place: hero.querySelector("[data-field-hero-place]"),
      coordinate: hero.querySelector("[data-field-hero-coordinate]"),
      kicker: hero.querySelector("[data-field-hero-kicker]"),
      titleOne: hero.querySelector("[data-field-hero-title-one]"),
      titleTwo: hero.querySelector("[data-field-hero-title-two]"),
      copy: hero.querySelector("[data-field-hero-copy]"),
      number: hero.querySelector("[data-field-hero-number]"),
      lens: hero.querySelector("[data-field-hero-lens]"),
      subject: hero.querySelector("[data-field-hero-subject]")
    };
    if (!stage || slides.length < 2 || videos.some((video) => !video) || Object.values(fields).some((field) => !field)) return;

    let activeIndex = 0;
    let copyTimer = 0;
    let fallbackTimer = 0;
    let swipeStartX = null;
    let userPaused = reduceMotion;
    let heroInView = true;

    function syncCopy(slide) {
      Object.entries(fields).forEach(([key, field]) => {
        field.textContent = slide.dataset[key] || "";
      });
    }

    function clearFallback() {
      window.clearTimeout(fallbackTimer);
      fallbackTimer = 0;
    }

    function updateToggle() {
      if (!toggle) return;
      const video = videos[activeIndex];
      const isPaused = userPaused || !video || video.paused;
      toggle.textContent = isPaused ? "Play" : "Pause";
      toggle.setAttribute("aria-label", isPaused ? "Play hero video" : "Pause hero video");
      toggle.setAttribute("aria-pressed", String(isPaused));
    }

    function resetProgress() {
      if (progress) progress.style.width = "0%";
    }

    function scheduleFallbackAdvance() {
      clearFallback();
      if (userPaused || document.hidden || !heroInView) return;
      fallbackTimer = window.setTimeout(() => showSlide(activeIndex + 1), 6200);
    }

    function playActive({ restart = false } = {}) {
      const activeVideo = videos[activeIndex];
      videos.forEach((video, index) => {
        if (index !== activeIndex) video.pause();
      });
      if (!activeVideo) return;

      clearFallback();
      activeVideo.muted = true;
      if (restart) {
        try {
          activeVideo.currentTime = 0;
        } catch (error) {
          // The poster remains visible until metadata is ready.
        }
      }

      if (userPaused || document.hidden || !heroInView) {
        activeVideo.pause();
        updateToggle();
        return;
      }

      const playPromise = activeVideo.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise.then(updateToggle).catch(() => {
          updateToggle();
          scheduleFallbackAdvance();
        });
      } else {
        updateToggle();
      }
    }

    function showSlide(nextIndex, instant = false) {
      const normalized = (nextIndex + slides.length) % slides.length;
      const nextSlide = slides[normalized];
      if (!nextSlide) return;

      activeIndex = normalized;
      const preloadIndex = (activeIndex + 1) % slides.length;
      hero.dataset.heroActive = String(activeIndex + 1);
      slides.forEach((slide, index) => {
        const active = index === activeIndex;
        slide.classList.toggle("is-active", active);
        videos[index].preload = active || index === preloadIndex ? "auto" : "metadata";
        if (!active) {
          videos[index].pause();
          try {
            videos[index].currentTime = 0;
          } catch (error) {
            // Metadata may not be available yet.
          }
        }
      });
      dots.forEach((dot, index) => {
        const active = index === activeIndex;
        dot.classList.toggle("is-active", active);
        dot.setAttribute("aria-pressed", String(active));
      });

      window.clearTimeout(copyTimer);
      if (reduceMotion || instant) {
        syncCopy(nextSlide);
        hero.classList.remove("is-copy-changing");
      } else {
        hero.classList.add("is-copy-changing");
        copyTimer = window.setTimeout(() => {
          syncCopy(nextSlide);
          hero.classList.remove("is-copy-changing");
        }, 260);
      }

      resetProgress();
      playActive({ restart: true });
    }

    dots.forEach((dot) => dot.addEventListener("click", () => showSlide(Number(dot.dataset.fieldHeroDot))));
    hero.querySelector("[data-field-hero-prev]")?.addEventListener("click", () => showSlide(activeIndex - 1));
    hero.querySelector("[data-field-hero-next]")?.addEventListener("click", () => showSlide(activeIndex + 1));
    toggle?.addEventListener("click", () => {
      const activeVideo = videos[activeIndex];
      if (!activeVideo) return;

      if (userPaused || activeVideo.paused) {
        userPaused = false;
        playActive();
      } else {
        userPaused = true;
        clearFallback();
        activeVideo.pause();
        updateToggle();
      }
    });

    videos.forEach((video, index) => {
      video.addEventListener("timeupdate", () => {
        if (index !== activeIndex || !progress || !Number.isFinite(video.duration) || video.duration <= 0) return;
        const completion = Math.min(100, Math.max(0, (video.currentTime / video.duration) * 100));
        progress.style.width = `${completion.toFixed(2)}%`;
      });
      video.addEventListener("play", updateToggle);
      video.addEventListener("pause", updateToggle);
      video.addEventListener("ended", () => {
        if (index === activeIndex && !userPaused) showSlide(activeIndex + 1);
      });
      video.addEventListener("error", () => {
        if (index === activeIndex) scheduleFallbackAdvance();
      });
    });

    stage.addEventListener("pointerdown", (event) => {
      swipeStartX = event.clientX;
    });
    stage.addEventListener("pointerup", (event) => {
      if (swipeStartX === null) return;
      const delta = event.clientX - swipeStartX;
      swipeStartX = null;
      if (Math.abs(delta) >= 48) showSlide(activeIndex + (delta < 0 ? 1 : -1));
    });
    stage.addEventListener("pointercancel", () => { swipeStartX = null; });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        clearFallback();
        videos[activeIndex]?.pause();
      } else {
        playActive();
      }
    });

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        heroInView = entries[0]?.isIntersecting ?? true;
        if (heroInView) {
          playActive();
        } else {
          clearFallback();
          videos[activeIndex]?.pause();
        }
      }, { threshold: 0.12 });
      observer.observe(hero);
    }

    showSlide(0, true);
  }

  function initViewerParallax() {
    const card = document.querySelector("[data-viewer-card]");
    if (!card || reduceMotion || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const copy = card.querySelector('[data-viewer-parallax="copy"]');
    const footer = card.querySelector('[data-viewer-parallax="footer"]');
    let frame = 0;
    let x = 0;
    let y = 0;

    function render() {
      frame = 0;
      card.style.setProperty("--viewer-pointer-x", `${x.toFixed(3)}px`);
      card.style.setProperty("--viewer-pointer-y", `${y.toFixed(3)}px`);
      copy?.style.setProperty("transform", `translate3d(${(x * 1.15).toFixed(2)}px, ${(y * 1.15).toFixed(2)}px, 0)`);
      footer?.style.setProperty("transform", `translate3d(${(x * -0.35).toFixed(2)}px, ${(y * -0.35).toFixed(2)}px, 0)`);
    }

    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      x = ((event.clientX - rect.left) / rect.width - 0.5) * 10;
      y = ((event.clientY - rect.top) / rect.height - 0.5) * 8;
      if (!frame) frame = requestAnimationFrame(render);
    });
    card.addEventListener("pointerleave", () => {
      x = 0;
      y = 0;
      if (!frame) frame = requestAnimationFrame(render);
    });
  }

  function initLegacyArticleShell() {
    const legacy = {
      "/essays/ai-goes-silent-censorship-infrastructure/": {
        lens: "View", kicker: "Silence / infrastructure", title: "When a system learns to disappear.",
        image: "/assets/views/articles/ai-goes-silent-china-zun.webp", alt: "A broken window in the glass facade of China Zun in Beijing", time: "8 min"
      },
      "/essays/latte-price-illusion/": {
        lens: "View", kicker: "Price / ritual", title: "The cost of an ordinary cup.",
        image: "/assets/hero/video/latte-ritual-poster.webp", alt: "Coffee ritual seen close up", time: "10 min"
      },
      "/essays/platforms-redesign-choice/": {
        lens: "Frame", kicker: "Platform / choice", title: "A feed is never only a feed.",
        image: "/assets/views/articles/platform-influencer-boom.webp", alt: "A creator filming beneath a monumental modern building", time: "8 min"
      },
      "/essays/goose-leg-official-narrative/": {
        lens: "Observe", kicker: "Street / proof", title: "One small order changes the story.",
        image: "/assets/views/articles/goose-leg.webp", alt: "Tsinghua University west gate seen from the street", time: "8 min"
      },
      "/essays/rmb-9-9-coffee/": {
        lens: "Observe", kicker: "Coffee / routine", title: "Cheap can still feel complete.",
        image: "/assets/hero/video/money-closeup-poster.webp", alt: "Close study of money", time: "7 min"
      },
      "/essays/cyber-audit-proof-economy/": {
        lens: "Observe", kicker: "Proof / platform", title: "A platform economy learns to be checked.",
        image: "/assets/views/articles/cyber-audit.webp", alt: "A narrow courtyard lane framed by concrete and yellow flowers", time: "9 min"
      }
    };
    const meta = legacy[window.location.pathname];
    const main = document.querySelector("main.site-shell");
    const hero = main?.querySelector(".article-hero");
    const article = main?.querySelector(".article-content");
    if (!meta || !main || !hero || !article || main.querySelector(".legacy-batch-cover")) return;

    body.classList.add("batch-article-body", "legacy-batch-article");
    const seriesClass = meta.lens === "View" ? "article-macro" : meta.lens === "Frame" ? "article-frame" : "article-scene";
    body.classList.add(seriesClass);

    const cover = document.createElement("section");
    cover.className = "batch-cover legacy-batch-cover";
    cover.setAttribute("aria-label", `${meta.lens} article opening card`);
    cover.innerHTML = `
      <div class="batch-cover-page legacy-cover-page">
        <img class="legacy-cover-image" src="${meta.image}" alt="${meta.alt}" loading="eager" decoding="async">
        <div class="legacy-cover-scrim" aria-hidden="true"></div>
        <div class="batch-cover-topline"><span>GALOK / VIEWS</span><span>${meta.lens.toUpperCase()}</span></div>
        <div class="batch-cover-copy"><p>${meta.kicker}</p><h1 class="batch-cover-question">${meta.title}</h1></div>
        <div class="water-cover-evidence"><div class="water-cover-scale"><span>READING TIME</span><div class="water-cover-track is-current"><b>${meta.time}</b><em>Field note</em><i style="--evidence-start:0%;--evidence-end:68%"></i></div></div><div class="water-cover-headcount"><span>ENTRY</span><strong>01</strong><small>Open the reading</small><i></i></div></div>
        <p class="batch-cover-note">Scroll to enter the article. Navigation and reading progress remain fixed.</p>
      </div>`;
    main.insertBefore(cover, hero);

    hero.classList.add("batch-article-hero");
    main.querySelector(".article-layout")?.classList.add("batch-article-layout");
    article.classList.add("batch-article-content");
    const headings = Array.from(article.querySelectorAll("h2")).slice(0, 5);
    if (!headings.length) return;

    headings.forEach((heading, index) => {
      const id = `legacy-${meta.lens.toLowerCase()}-${index + 1}`;
      heading.id = id;
      const section = heading.closest("section") || heading.parentElement;
      section?.classList.add("batch-prose-section");
      if (section && !section.querySelector(":scope > .batch-section-index")) {
        const indexLabel = document.createElement("p");
        indexLabel.className = "batch-section-index";
        indexLabel.textContent = `${String(index + 1).padStart(2, "0")} / ${meta.lens.toUpperCase()}`;
        section.insertBefore(indexLabel, heading);
      }
    });

    const nav = document.createElement("nav");
    nav.className = "batch-chapter-nav legacy-chapter-nav";
    nav.style.setProperty("--batch-nav-columns", String(Math.min(headings.length, 5)));
    nav.setAttribute("aria-label", "Article chapters");
    nav.innerHTML = headings.map((heading, index) => `<a href="#${heading.id}"><span>${String(index + 1).padStart(2, "0")}</span>${heading.textContent.trim()}</a>`).join("");
    hero.after(nav);
  }

  function initHomepageIndex() {
    const carousel = document.querySelector("[data-field-carousel]");
    const track = document.querySelector("[data-field-track]");
    const count = document.querySelector("[data-field-count]");
    const drawer = document.querySelector("[data-field-drawer]");
    if (!carousel || !track || !count || !drawer) return;

    function articleCover(essay) {
      const cover = essay.cover || {};
      return {
        src: cover.src || essay.image || "/assets/visual-notes/city-road.webp",
        alt: cover.alt || essay.imageAlt || `Field image for ${essay.title}`
      };
    }

    const essayItems = content.essays.map((essay) => {
      const cover = articleCover(essay);
      return {
        eyebrow: content.series?.[essay.series]?.en || "Essay",
        title: essay.title,
        excerpt: essay.excerpt,
        href: essay.url,
        image: cover.src,
        imageAlt: cover.alt,
        action: "Read the essay"
      };
    });

    const noteItems = [
      {
        eyebrow: "Xiamen / 01",
        title: "The old street edits itself for the camera.",
        excerpt: "Lanterns, shade, storefronts and the tourist-facing texture of an alley.",
        href: "/visual-notes/xiamen/",
        image: "/assets/visual-notes/old-street.webp",
        imageAlt: "Lanterns in an old Xiamen street",
        action: "Open the note"
      },
      {
        eyebrow: "Xiamen / 02",
        title: "Infrastructure becomes the daily stage.",
        excerpt: "A road curve holds movement, greenery, concrete and summer heat in one frame.",
        href: "/visual-notes/xiamen/",
        image: "/assets/visual-notes/city-road.webp",
        imageAlt: "Road curving beneath a bridge",
        action: "Open the note"
      },
      {
        eyebrow: "Xiamen / 03",
        title: "Water turns distance into composition.",
        excerpt: "Ferry routes, skyline edges and the quiet infrastructure of arrival and return.",
        href: "/visual-notes/xiamen/",
        image: "/assets/visual-notes/ferry.webp",
        imageAlt: "Ferry on blue water",
        action: "Open the note"
      }
    ];

    const collections = { views: essayItems, notes: noteItems };
    const labels = { views: "VIEWS", notes: "VISUAL NOTES" };
    let activeKey = "views";
    let activeItems = collections[activeKey];
    let activeIndex = 0;
    let drawerIndex = 0;
    let returnFocus = null;
    let swipeStartX = null;
    let closeTimer = 0;

    function pad(value) {
      return String(value).padStart(2, "0");
    }

    function renderCards() {
      track.innerHTML = activeItems.map((item, index) => `
        <article class="field-story-card" aria-label="${item.title}">
          <div class="field-story-card-media">
            <img src="${item.image}" alt="${item.imageAlt}" loading="${index === 0 ? "eager" : "lazy"}">
          </div>
          <div class="field-story-card-copy">
            <div><span>${item.eyebrow}</span><span>${pad(index + 1)} / ${pad(activeItems.length)}</span></div>
            <h3>${item.title}</h3>
            <p>${item.excerpt}</p>
            <div class="field-card-actions">
              <a class="field-primary field-primary--light" href="${item.href}">${item.action}</a>
              <button class="field-card-preview" type="button" data-story-preview="${index}">Preview</button>
            </div>
          </div>
        </article>
      `).join("");
      activeIndex = 0;
      syncCarousel();
    }

    function syncCarousel() {
      track.style.transform = `translate3d(${-activeIndex * 100}%, 0, 0)`;
      count.textContent = `${pad(activeIndex + 1)} / ${pad(activeItems.length)}`;
    }

    function moveCarousel(direction) {
      activeIndex = (activeIndex + direction + activeItems.length) % activeItems.length;
      syncCarousel();
    }

    function updateDrawer() {
      const item = activeItems[drawerIndex];
      if (!item) return;
      drawer.querySelector("[data-drawer-meta]").textContent = `${pad(drawerIndex + 1)} / ${labels[activeKey]}`;
      drawer.querySelector("[data-drawer-series]").textContent = item.eyebrow;
      drawer.querySelector("[data-drawer-title]").textContent = item.title;
      drawer.querySelector("[data-drawer-excerpt]").textContent = item.excerpt;
      drawer.querySelector("[data-drawer-count]").textContent = `${pad(drawerIndex + 1)} / ${pad(activeItems.length)}`;
      const image = drawer.querySelector("[data-drawer-image]");
      image.src = item.image;
      image.alt = item.imageAlt;
      const link = drawer.querySelector("[data-drawer-link]");
      link.href = item.href;
      link.textContent = item.action;
    }

    function openDrawer(index, trigger) {
      window.clearTimeout(closeTimer);
      drawerIndex = Number.isFinite(index) ? index : activeIndex;
      returnFocus = trigger || document.activeElement;
      updateDrawer();
      drawer.hidden = false;
      body.classList.add("field-drawer-open");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          drawer.classList.add("is-open");
          drawer.querySelector("header [data-story-close]")?.focus({ preventScroll: true });
        });
      });
    }

    function closeDrawer() {
      drawer.classList.remove("is-open");
      body.classList.remove("field-drawer-open");
      closeTimer = window.setTimeout(() => {
        drawer.hidden = true;
        if (returnFocus instanceof HTMLElement) returnFocus.focus({ preventScroll: true });
      }, reduceMotion ? 0 : 640);
    }

    document.querySelectorAll("[data-field-tab]").forEach((tab) => {
      tab.addEventListener("click", () => {
        activeKey = tab.dataset.fieldTab;
        activeItems = collections[activeKey];
        document.querySelectorAll("[data-field-tab]").forEach((item) => {
          item.setAttribute("aria-selected", String(item === tab));
        });
        renderCards();
      });
    });

    document.querySelector("[data-field-prev]")?.addEventListener("click", () => moveCarousel(-1));
    document.querySelector("[data-field-next]")?.addEventListener("click", () => moveCarousel(1));

    track.addEventListener("pointerdown", (event) => {
      swipeStartX = event.clientX;
    });
    track.addEventListener("pointerup", (event) => {
      if (swipeStartX === null) return;
      const delta = event.clientX - swipeStartX;
      swipeStartX = null;
      if (Math.abs(delta) < 48) return;
      moveCarousel(delta < 0 ? 1 : -1);
    });
    track.addEventListener("pointercancel", () => { swipeStartX = null; });

    document.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) return;
      const preview = event.target.closest("[data-story-preview]");
      if (preview) openDrawer(Number(preview.dataset.storyPreview), preview);
      const heroOpen = event.target.closest("[data-story-open]");
      if (heroOpen) openDrawer(Number(heroOpen.dataset.storyOpen), heroOpen);
    });

    drawer.querySelectorAll("[data-story-close]").forEach((button) => button.addEventListener("click", closeDrawer));
    drawer.querySelector("[data-story-prev]")?.addEventListener("click", () => {
      drawerIndex = (drawerIndex - 1 + activeItems.length) % activeItems.length;
      updateDrawer();
    });
    drawer.querySelector("[data-story-next]")?.addEventListener("click", () => {
      drawerIndex = (drawerIndex + 1) % activeItems.length;
      updateDrawer();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !drawer.hidden) closeDrawer();
    });

    renderCards();
  }

  enhanceAccessibilityShell();
  initLegacyArticleShell();
  enhanceNavigation();
  enhanceFooter();
  initGlobalContactModule();
  labelInteriorPage();
  initArticleProgress();
  initFieldHeroCarousel();
  initViewerParallax();
  initHomepageIndex();
})();
