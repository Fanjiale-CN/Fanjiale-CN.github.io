(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const body = document.body;
  const siteNav = document.querySelector(".xiamen-site-nav");
  const hero = document.querySelector("[data-xm-hero]");

  if (hero) {
    const stage = hero.querySelector("[data-xm-hero-stage]");
    const slides = [...hero.querySelectorAll("[data-xm-hero-slide]")];
    const videos = slides.map((slide) => slide.querySelector("video"));
    const count = hero.querySelector("[data-xm-hero-count]");
    const progress = hero.querySelector("[data-xm-hero-progress]");
    const toggle = hero.querySelector("[data-xm-hero-toggle]");
    const sceneDuration = 6800;
    let activeIndex = 0;
    let pausedByUser = reducedMotion;
    let visible = true;
    let startedAt = performance.now();
    let elapsed = 0;
    let frame = 0;
    let swipeStart = null;

    const pauseAll = () => videos.forEach((video) => video?.pause());

    function updateToggle() {
      if (!toggle) return;
      const paused = pausedByUser || !visible || document.hidden;
      toggle.textContent = paused ? "PLAY" : "PAUSE";
      toggle.setAttribute("aria-label", paused ? "Play Xiamen hero" : "Pause Xiamen hero");
      toggle.setAttribute("aria-pressed", String(paused));
    }

    async function playActive() {
      pauseAll();
      if (pausedByUser || !visible || document.hidden) {
        updateToggle();
        return;
      }
      const video = videos[activeIndex];
      if (!video) return;
      try {
        video.muted = true;
        await video.play();
      } catch {}
      updateToggle();
    }

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;
      elapsed = 0;
      startedAt = performance.now();
      slides.forEach((slide, slideIndex) => {
        const active = slideIndex === activeIndex;
        slide.classList.toggle("is-active", active);
        slide.setAttribute("aria-hidden", String(!active));
        const video = videos[slideIndex];
        if (!video) return;
        video.preload = active || slideIndex === (activeIndex + 1) % slides.length ? "auto" : "metadata";
        if (!active) {
          video.pause();
          try { video.currentTime = 0; } catch {}
        }
      });
      if (count) count.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
      if (progress) progress.style.transform = "scaleX(0)";
      playActive();
    }

    function renderHero(now) {
      frame = 0;
      if (!pausedByUser && visible && !document.hidden) {
        const current = elapsed + now - startedAt;
        const amount = Math.min(1, current / sceneDuration);
        if (progress) progress.style.transform = `scaleX(${amount})`;
        if (amount >= 1) showSlide(activeIndex + 1);
      }
      frame = requestAnimationFrame(renderHero);
    }

    hero.querySelector("[data-xm-hero-prev]")?.addEventListener("click", () => showSlide(activeIndex - 1));
    hero.querySelector("[data-xm-hero-next]")?.addEventListener("click", () => showSlide(activeIndex + 1));
    toggle?.addEventListener("click", () => {
      pausedByUser = !pausedByUser;
      if (pausedByUser) {
        elapsed += performance.now() - startedAt;
        pauseAll();
      } else {
        startedAt = performance.now();
        playActive();
      }
      updateToggle();
    });

    stage?.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      swipeStart = event.clientX;
    }, { passive: true });

    stage?.addEventListener("pointerup", (event) => {
      if (swipeStart === null) return;
      const distance = event.clientX - swipeStart;
      swipeStart = null;
      if (Math.abs(distance) > 54) showSlide(activeIndex + (distance < 0 ? 1 : -1));
    }, { passive: true });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible) {
          startedAt = performance.now();
          playActive();
        } else {
          if (!pausedByUser) elapsed += performance.now() - startedAt;
          pauseAll();
        }
        updateToggle();
      }, { threshold: .05 }).observe(hero);
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        if (!pausedByUser) elapsed += performance.now() - startedAt;
        pauseAll();
      } else {
        startedAt = performance.now();
        playActive();
      }
    });

    showSlide(0);
    if (!reducedMotion && !frame) frame = requestAnimationFrame(renderHero);
  }

  const tideData = [
    { index: "01 / SEA", title: "A line without an edge.", copy: "Water opens the frame before the city fills it." },
    { index: "02 / ISLAND", title: "Roofs hold the hill.", copy: "On Gulangyu, garden walls and tiled roofs climb at walking speed." },
    { index: "03 / STREET", title: "Colour keeps the address.", copy: "Old doors, enamel signs and a public telephone make memory usable." },
    { index: "04 / ROOFLINE", title: "Craft rises into weather.", copy: "Minnan roofs turn protection, belief and ornament into one skyline." }
  ];

  const tidePlayer = document.querySelector("[data-xm-tide-player]");
  if (tidePlayer) {
    const frames = [...tidePlayer.querySelectorAll("[data-xm-tide-frame]")];
    const buttons = [...tidePlayer.querySelectorAll("[data-xm-tide-button]")];
    const range = tidePlayer.querySelector("[data-xm-tide-range]");
    const indexNode = tidePlayer.querySelector("[data-xm-tide-index]");
    const titleNode = tidePlayer.querySelector("[data-xm-tide-title]");
    const copyNode = tidePlayer.querySelector("[data-xm-tide-copy]");
    const copyStack = tidePlayer.querySelector("[data-xm-tide-copy-stack]");
    let activeTide = 0;
    let transitionTimer;
    let copyTimer;
    let inputTimer;

    function setTide(index, { syncRange = true } = {}) {
      const next = Math.max(0, Math.min(tideData.length - 1, Math.round(Number(index))));
      if (next === activeTide) return;
      const previous = frames[activeTide];
      const incoming = frames[next];

      window.clearTimeout(transitionTimer);
      window.clearTimeout(copyTimer);
      frames.forEach((frame) => {
        if (frame !== previous && frame !== incoming) frame.classList.remove("is-leaving");
      });
      previous?.classList.remove("is-active");
      previous?.classList.add("is-leaving");
      incoming?.classList.remove("is-leaving");
      incoming?.classList.add("is-active");
      tidePlayer.classList.add("is-transitioning");
      buttons.forEach((button) => {
        const active = Number(button.dataset.xmTideButton) === next;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      if (range && syncRange) range.value = String(next);
      tidePlayer.style.setProperty("--tide-position", `${((syncRange ? next : Number(range?.value || next)) / (tideData.length - 1)) * 100}%`);

      copyStack?.classList.add("is-changing");
      copyTimer = window.setTimeout(() => {
        if (indexNode) indexNode.textContent = tideData[next].index;
        if (titleNode) titleNode.textContent = tideData[next].title;
        if (copyNode) copyNode.textContent = tideData[next].copy;
        requestAnimationFrame(() => copyStack?.classList.remove("is-changing"));
      }, reducedMotion ? 0 : 130);

      transitionTimer = window.setTimeout(() => {
        frames.forEach((frame) => frame.classList.remove("is-leaving"));
        tidePlayer.classList.remove("is-transitioning");
      }, reducedMotion ? 0 : 860);
      activeTide = next;
    }

    range?.addEventListener("input", (event) => {
      const value = Number(event.currentTarget.value);
      tidePlayer.style.setProperty("--tide-position", `${(value / (tideData.length - 1)) * 100}%`);
      const next = Math.round(value);
      window.clearTimeout(inputTimer);
      if (next !== activeTide) inputTimer = window.setTimeout(() => setTide(next, { syncRange: false }), 90);
    });
    range?.addEventListener("change", (event) => {
      window.clearTimeout(inputTimer);
      setTide(event.currentTarget.value, { syncRange: false });
    });
    buttons.forEach((button) => button.addEventListener("click", () => setTide(button.dataset.xmTideButton)));
    buttons.forEach((button, index) => button.setAttribute("aria-pressed", String(index === 0)));
    tidePlayer.style.setProperty("--tide-position", "0%");
  }

  const roofNotes = [
    { title: "燕尾脊 / SWALLOWTAIL RIDGE", copy: "Its lifted ends give the building a horizon of its own." },
    { title: "剪瓷雕 / CUT-PORCELAIN COLOUR", copy: "Broken ceramics return as dragons, flowers and flashes of sea-bright colour." },
    { title: "ROOF / AIR ROUTE", copy: "A passing aircraft joins the ornament for a second, old craft and present motion in one frame." }
  ];

  const roof = document.querySelector(".xm-roof");
  if (roof) {
    const buttons = [...roof.querySelectorAll("[data-xm-roof-note]")];
    const title = roof.querySelector(".xm-roof-callout b");
    const copy = roof.querySelector(".xm-roof-callout p");
    buttons.forEach((button) => button.addEventListener("click", () => {
      const index = Number(button.dataset.xmRoofNote);
      buttons.forEach((item, itemIndex) => {
        item.classList.toggle("is-active", itemIndex === index);
        item.setAttribute("aria-pressed", String(itemIndex === index));
      });
      if (title) title.textContent = roofNotes[index].title;
      if (copy) copy.textContent = roofNotes[index].copy;
    }));
  }

  const islandTrack = document.querySelector("[data-xm-island-track]");
  if (islandTrack && !coarsePointer) {
    let dragging = false;
    let startX = 0;
    let startScroll = 0;

    islandTrack.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      dragging = true;
      startX = event.clientX;
      startScroll = islandTrack.scrollLeft;
      islandTrack.classList.add("is-dragging");
      islandTrack.setPointerCapture(event.pointerId);
    });

    islandTrack.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      islandTrack.scrollLeft = startScroll - (event.clientX - startX);
    });

    const stopDrag = (event) => {
      if (!dragging) return;
      dragging = false;
      islandTrack.classList.remove("is-dragging");
      if (event.pointerId !== undefined && islandTrack.hasPointerCapture(event.pointerId)) islandTrack.releasePointerCapture(event.pointerId);
    };

    islandTrack.addEventListener("pointerup", stopDrag);
    islandTrack.addEventListener("pointercancel", stopDrag);
  }

  const streetReveal = document.querySelector("[data-xm-reveal]");
  const streetRange = streetReveal?.querySelector("[data-xm-reveal-range]");
  streetRange?.addEventListener("input", (event) => {
    streetReveal.style.setProperty("--split", `${event.currentTarget.value}%`);
  });

  const storyNav = document.querySelector("[data-xm-story-nav]");
  const storyLinks = [...document.querySelectorAll("[data-xm-section-link]")];
  const storySections = storyLinks.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
  const storyProgress = document.querySelector("[data-xm-story-progress]");
  let ticking = false;
  let sectionMetrics = [];
  let activeId = "";

  function measureSections() {
    sectionMetrics = storySections.map((section) => ({
      section,
      top: section.offsetTop,
      bottom: section.offsetTop + section.offsetHeight
    }));
  }

  function setActiveSection(section) {
    if (!section || section.id === activeId) return;
    activeId = section.id;
    storyLinks.forEach((link) => {
      const active = link.getAttribute("href") === `#${activeId}`;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    const activeLink = storyLinks.find((link) => link.classList.contains("is-active"));
    if (activeLink && storyNav && storyNav.scrollWidth > storyNav.clientWidth) {
      const left = activeLink.offsetLeft - (storyNav.clientWidth - activeLink.offsetWidth) / 2;
      storyNav.scrollTo({ left: Math.max(0, left), behavior: "auto" });
    }
  }

  function renderScroll() {
    ticking = false;
    const scrollY = window.scrollY;
    const viewport = window.innerHeight;
    siteNav?.classList.toggle("is-scrolled", scrollY > viewport * .7);
    if (!sectionMetrics.length) return;
    const start = sectionMetrics[0].top;
    const end = sectionMetrics.at(-1).bottom - viewport;
    const amount = Math.max(0, Math.min(1, (scrollY - start) / Math.max(1, end - start)));
    if (storyProgress) storyProgress.style.transform = `scaleX(${amount})`;
    const readingLine = scrollY + viewport * .42;
    let active = sectionMetrics[0].section;
    sectionMetrics.forEach((metric) => { if (metric.top <= readingLine) active = metric.section; });
    setActiveSection(active);
  }

  function requestScrollRender() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(renderScroll);
  }

  window.addEventListener("scroll", requestScrollRender, { passive: true });
  window.addEventListener("resize", () => {
    measureSections();
    requestScrollRender();
  }, { passive: true });
  window.addEventListener("load", () => {
    measureSections();
    requestScrollRender();
  }, { once: true });
  measureSections();
  renderScroll();

  const revealTargets = [
    ...document.querySelectorAll(".xm-section-head, .xm-tide-copy, .xm-island-copy, .xm-university, .xm-table")
  ];
  revealTargets.forEach((target) => target.setAttribute("data-xm-reveal-on-scroll", ""));

  if (!reducedMotion && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: .12 });
    revealTargets.forEach((target) => revealObserver.observe(target));
  } else {
    revealTargets.forEach((target) => target.classList.add("is-visible"));
  }

  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = new Date().getFullYear();
  });
})();
