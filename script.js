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

  function glyph(value, className = "", pinyin = pinyinFor(value)) {
    return `<span class="glyph-draw ${className}" data-glyph="${value}" data-pinyin="${pinyin}" aria-hidden="true">${value}</span>`;
  }

  function essayCard(essay) {
    const series = seriesFor(essay.series);
    return `
      <a class="essay-card" href="${essay.url}" style="--accent:${series.color}" data-series="${essay.series}" data-reveal>
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

  const filterButtons = document.querySelectorAll("[data-filter]");
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      filterButtons.forEach((item) => item.setAttribute("aria-pressed", "false"));
      button.setAttribute("aria-pressed", "true");
      document.querySelectorAll(".essay-card[data-series]").forEach((card) => {
        const visible = filter === "all" || card.dataset.series === filter;
        card.hidden = !visible;
      });
    });
  });

  function initInteractiveCharts() {
    document.querySelectorAll(".interactive-chart").forEach((chart) => {
      const detail = chart.querySelector(".chart-detail");
      const controls = chart.querySelectorAll("[data-detail]");

      function activate(control) {
        if (!control || !detail) return;
        const group = control.closest(".interactive-chart");
        group?.querySelectorAll("[data-detail].is-active").forEach((item) => item.classList.remove("is-active"));
        control.classList.add("is-active");
        detail.textContent = control.dataset.detail || "";
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
          seriesSection.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
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
      { threshold: 0.12, rootMargin: "0px 0px -40px" }
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

  function enhanceNavigation() {
    if (!siteNav) return;

    const navInner = siteNav.querySelector(".nav-inner");
    const brand = siteNav.querySelector(".brand");
    const links = siteNav.querySelector(".nav-links");
    if (!navInner || !brand || !links) return;

    if (!brand.querySelector(".brand-lockup")) {
      brand.innerHTML = `
        <span class="brand-seal glyph-draw" data-glyph="視" data-pinyin="shi" aria-hidden="true">視</span>
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

    function setMenu(open) {
      body.classList.toggle("nav-open", open);
      toggle.textContent = open ? "Close" : "Menu";
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    }

    toggle.addEventListener("click", () => setMenu(!body.classList.contains("nav-open")));
    links.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && body.classList.contains("nav-open")) setMenu(false);
    });

    const syncNavTone = () => siteNav.classList.toggle("is-scrolled", window.scrollY > 24);
    syncNavTone();
    window.addEventListener("scroll", syncNavTone, { passive: true });
  }

  function labelInteriorPage() {
    const hero = document.querySelector(".page-hero");
    if (!hero) return;
    const path = window.location.pathname;
    let index = "01";
    if (path.includes("/series/")) index = "02";
    if (path.includes("/visual-notes/")) index = "03";
    if (path.includes("/about/")) index = "04";
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

  function initHomepageIndex() {
    const carousel = document.querySelector("[data-field-carousel]");
    const track = document.querySelector("[data-field-track]");
    const count = document.querySelector("[data-field-count]");
    const drawer = document.querySelector("[data-field-drawer]");
    if (!carousel || !track || !count || !drawer) return;

    const essayImages = [
      "/assets/visual-notes/city-road.webp",
      "/assets/visual-notes/ferry.webp",
      "/assets/visual-notes/old-street.webp",
      "/assets/visual-notes/botanical-02.webp",
      "/assets/visual-notes/return-01.webp",
      "/assets/visual-notes/gulangyu-08.webp"
    ];

    const essayItems = content.essays.map((essay, index) => ({
      eyebrow: content.series?.[essay.series]?.en || "Essay",
      title: essay.title,
      excerpt: essay.excerpt,
      href: essay.url,
      image: essayImages[index % essayImages.length],
      imageAlt: `Field image for ${essay.title}`,
      action: "Read the essay"
    }));

    const seriesItems = [
      {
        eyebrow: "View / 01",
        title: "Macro pressure becomes visible.",
        excerpt: "Follow policy, balance sheets and price signals back into ordinary choices.",
        href: "/series/macro/",
        image: "/assets/visual-notes/return-01.webp",
        imageAlt: "City and water at dusk",
        action: "Open View"
      },
      {
        eyebrow: "Frame / 02",
        title: "Scattered facts become a usable lens.",
        excerpt: "Maps, loops, receipts and concepts that keep working after the article ends.",
        href: "/series/frame/",
        image: "/assets/visual-notes/city-road.webp",
        imageAlt: "Urban road and infrastructure",
        action: "Open Frame"
      },
      {
        eyebrow: "Observe / 03",
        title: "A small scene carries the system.",
        excerpt: "Street-level evidence from stores, platforms, cities and repeated routines.",
        href: "/series/scene/",
        image: "/assets/visual-notes/old-street.webp",
        imageAlt: "Old street with lanterns",
        action: "Open Observe"
      }
    ];

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

    const collections = { essays: essayItems, series: seriesItems, notes: noteItems };
    const labels = { essays: "ESSAYS", series: "SERIES", notes: "VISUAL NOTES" };
    let activeKey = "essays";
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
        drawer.classList.add("is-open");
        drawer.querySelector("[data-story-close]")?.focus({ preventScroll: true });
      });
    }

    function closeDrawer() {
      drawer.classList.remove("is-open");
      body.classList.remove("field-drawer-open");
      closeTimer = window.setTimeout(() => {
        drawer.hidden = true;
        if (returnFocus instanceof HTMLElement) returnFocus.focus({ preventScroll: true });
      }, reduceMotion ? 0 : 420);
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

  enhanceNavigation();
  labelInteriorPage();
  initArticleProgress();
  initHomepageIndex();
})();
