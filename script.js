(function () {
  const content = window.GALOK_CONTENT || { essays: [], series: {} };
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const pinyinByGlyph = {
    "\u89c6": "shi",
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
        <path class="visual-note-fill visual-note-fill-main" d="M52 58h67v24c0 17-13 29-30 29h-7c-17 0-30-12-30-29V58Z"></path>
        <path class="visual-note-fill visual-note-fill-soft" d="M35 107c21 9 75 11 105 0 5-2 6 8-2 11-28 11-80 9-104 0-8-3-5-13 1-11Z"></path>
        <path class="visual-note-line" style="--draw-delay:0ms" pathLength="1" d="M52 58h67v24c0 17-13 29-30 29h-7c-17 0-30-12-30-29V58Z"></path>
        <path class="visual-note-line" style="--draw-delay:90ms" pathLength="1" d="M119 64h14c12 0 20 8 20 19s-9 20-22 20h-13"></path>
        <path class="visual-note-line" style="--draw-delay:180ms" pathLength="1" d="M35 107c21 9 75 11 105 0"></path>
        <path class="visual-note-line" style="--draw-delay:270ms" pathLength="1" d="M70 43c-8-9 8-14 0-24"></path>
        <path class="visual-note-line" style="--draw-delay:360ms" pathLength="1" d="M88 43c-8-9 8-14 0-24"></path>
        <path class="visual-note-line" style="--draw-delay:450ms" pathLength="1" d="M106 43c-8-9 8-14 0-24"></path>
        <path class="visual-note-line visual-note-receipt" style="--draw-delay:540ms" pathLength="1" d="M137 24h29v48l-5-4-5 4-5-4-5 4-5-4-4 3V24Z"></path>
        <path class="visual-note-line visual-note-receipt" style="--draw-delay:620ms" pathLength="1" d="M144 36h15M144 47h12M144 58h16"></path>
        <circle class="visual-note-dot" cx="32" cy="31" r="3"></circle>
        <circle class="visual-note-dot" cx="42" cy="25" r="2.5"></circle>
      </svg>
      <div class="visual-note-label">coffee as price evidence</div>
    `;
  }

  const visualNoteIcons = {
    coffee: renderCoffeeIcon
  };

  function resolveKeywordAccent(element) {
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
    popover.className = "visual-note-popover";
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
      const scope = event.target.closest(".essay-card, .series-card, .filter-button, .article-hero, .page-kicker, .hero-system span");
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
      const nextGlyph = next instanceof Element ? (next.closest(".glyph-draw") || next.closest(".essay-card, .series-card, .filter-button, .article-hero, .page-kicker, .hero-system span")?.querySelector(".glyph-draw")) : null;
      if (current === activeGlyph && nextGlyph !== activeGlyph) hideGlyphCue();
    });

    document.addEventListener("mouseout", (event) => {
      if (!activeGlyph) return;
      const next = event.relatedTarget;
      if (next instanceof Element && activeGlyph.contains(next)) return;
      const current = glyphTargetFromEvent(event);
      const nextGlyph = next instanceof Element ? (next.closest(".glyph-draw") || next.closest(".essay-card, .series-card, .filter-button, .article-hero, .page-kicker, .hero-system span")?.querySelector(".glyph-draw")) : null;
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
