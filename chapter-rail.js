(() => {
  const coarsePointer = window.matchMedia("(hover: none), (pointer: coarse)");

  function enhance(rail) {
    if (!rail || rail.dataset.chapterRailReady === "true") return;
    rail.dataset.chapterRailReady = "true";
    const links = [...rail.querySelectorAll("a[href]")];
    if (!links.length) return;

    rail.style.setProperty("--chapter-rail-count", String(links.length));

    links.forEach((link, index) => {
      if (!link.querySelector("b")) {
        const currentSpan = link.querySelector("span");
        const firstText = [...link.childNodes].find((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
        const numberMatch = (currentSpan?.textContent || firstText?.textContent || "").trim().match(/^(\d{2})\b/);
        const number = document.createElement("span");
        number.textContent = numberMatch?.[1] || String(index + 1).padStart(2, "0");
        const rawNodes = [...link.childNodes];
        const labelText = rawNodes.map((node) => node.textContent || "").join(" ").trim().replace(/\s+/g, " ").replace(/^\d{2}\s*[\/·:–—-]?\s*/, "");
        rawNodes.forEach((node) => node.remove());
        const label = document.createElement("span");
        label.textContent = labelText;
        link.append(number, label);
      }

      link.addEventListener("click", (event) => {
        if (!coarsePointer.matches) return;
        const alreadyPreviewed = link.classList.contains("is-preview");
        links.forEach((item) => item.classList.remove("is-preview"));
        if (!alreadyPreviewed) {
          event.preventDefault();
          link.classList.add("is-preview");
          link.focus({ preventScroll: true });
        }
      });

      link.addEventListener("blur", () => {
        window.setTimeout(() => link.classList.remove("is-preview"), 120);
      });
    });

    document.addEventListener("pointerdown", (event) => {
      if (!rail.contains(event.target)) links.forEach((link) => link.classList.remove("is-preview"));
    }, { passive: true });

    const targets = links.map((link) => {
      const href = link.getAttribute("href") || "";
      if (!href.startsWith("#")) return null;
      try { return document.querySelector(href); } catch { return null; }
    });

    const updateActiveChapter = () => {
      const readingLine = Math.min(window.innerHeight * .42, 360);
      let activeIndex = targets.findIndex(Boolean);
      targets.forEach((target, index) => {
        if (target && target.getBoundingClientRect().top <= readingLine) activeIndex = index;
      });
      if (activeIndex < 0) return;
      links.forEach((link, index) => {
        const active = index === activeIndex;
        link.classList.toggle("is-active", active);
        if (active) link.setAttribute("aria-current", "location");
        else if (link.getAttribute("aria-current") === "location") link.removeAttribute("aria-current");
      });
    };

    const updateRailProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? Math.max(0, Math.min(1, window.scrollY / scrollable)) : 0;
      rail.style.setProperty("--chapter-rail-progress-scale", ratio.toFixed(4));
    };

    updateRailProgress();
    updateActiveChapter();
    let ticking = false;
    const requestUpdate = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        updateRailProgress();
        updateActiveChapter();
        ticking = false;
      });
    };
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
  }

  window.GALOK_CHAPTER_RAILS = { enhance };
  document.querySelectorAll(".chapter-rail").forEach(enhance);
})();
