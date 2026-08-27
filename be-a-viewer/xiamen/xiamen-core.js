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
    const mobileMedia = window.matchMedia("(max-width: 760px)");

    const pauseAll = () => videos.forEach((video) => video?.pause());

    function ensureSource(video) {
      if (!video) return false;
      const source = mobileMedia.matches && video.dataset.mobileSrc
        ? video.dataset.mobileSrc
        : video.dataset.src || "";
      if (!source) return false;
      if (video.dataset.loadedSrc !== source) {
        video.src = source;
        video.dataset.loadedSrc = source;
        video.preload = "metadata";
        video.load();
      }
      return true;
    }

    function updateToggle() {
      if (!toggle) return;
      const video = videos[activeIndex];
      const playing = Boolean(video && !video.paused && !video.ended);
      toggle.textContent = playing ? "PAUSE" : "PLAY";
      toggle.setAttribute("aria-label", playing ? "Pause Xiamen hero" : "Play Xiamen hero");
      toggle.setAttribute("aria-pressed", String(playing));
    }

    async function playActive() {
      pauseAll();
      if (pausedByUser || !visible || document.hidden) {
        updateToggle();
        return;
      }
      const video = videos[activeIndex];
      if (!video || !ensureSource(video)) return;
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
        video.preload = active && video.dataset.loadedSrc ? "metadata" : "none";
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
      const video = videos[activeIndex];
      if (!pausedByUser && visible && !document.hidden && video && !video.paused) {
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
      const video = videos[activeIndex];
      if (!pausedByUser && video && !video.paused) {
        pausedByUser = true;
        elapsed += performance.now() - startedAt;
        pauseAll();
      } else {
        pausedByUser = false;
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
      updateToggle();
    });

    videos.forEach((video) => {
      ["play", "pause", "ended", "error"].forEach((eventName) => video?.addEventListener(eventName, updateToggle));
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

  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const ease = (value) => {
    const amount = clamp(value);
    return 1 - Math.pow(1 - amount, 3);
  };

  const tideSection = document.querySelector(".xm-tide");
  const coastTime = document.querySelector("[data-xm-coast-time]");
  const coastFrames = [...document.querySelectorAll("[data-xm-time-frame]")];
  const coastProgress = document.querySelector("[data-xm-time-progress]");
  const crossing = document.querySelector("[data-xm-crossing]");
  const gulangyuEntry = document.querySelector("[data-xm-gulangyu-entry]");
  const streetFlow = document.querySelector("[data-xm-street-flow]");
  const streetFragments = document.querySelector("[data-xm-street-fragments]");
  const streetProgress = document.querySelector("[data-xm-street-progress]");
  const cityWater = document.querySelector("[data-xm-city-water]");
  const cityLayers = [...document.querySelectorAll("[data-xm-city-layer]")];
  const cityProgress = document.querySelector("[data-xm-city-progress]");
  let narrativeMetrics = {};
  let streetTravel = 0;

  const narrativeSections = [tidePlayer, coastTime, crossing, gulangyuEntry, islandTrack, streetFlow, cityWater].filter(Boolean);
  if ("IntersectionObserver" in window) {
    const imageWarmup = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.querySelectorAll('img[loading="lazy"]').forEach((image) => {
          image.loading = "eager";
        });
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "80% 0px" });
    narrativeSections.forEach((section) => imageWarmup.observe(section));
  }

  function metricFor(element) {
    if (!element) return null;
    return { top: element.offsetTop, height: element.offsetHeight };
  }

  function measureNarratives() {
    narrativeMetrics = {
      tide: metricFor(tideSection),
      coast: metricFor(coastTime),
      crossing: metricFor(crossing),
      gulangyu: metricFor(gulangyuEntry),
      street: metricFor(streetFlow),
      city: metricFor(cityWater)
    };
    streetTravel = streetFragments ? Math.max(0, streetFragments.scrollWidth - window.innerWidth) : 0;
  }

  function sectionProgress(metric, scrollY, viewport) {
    if (!metric) return 0;
    return clamp((scrollY - metric.top) / Math.max(1, metric.height - viewport));
  }

  function tideClip(reveal) {
    const edge = 100 - clamp(reveal) * 100;
    const wave = Math.min(1.6, clamp(reveal) * 2.2);
    return `polygon(0 ${clamp(edge, 0, 100)}%, 18% ${clamp(edge - wave, 0, 100)}%, 38% ${clamp(edge + wave * .55, 0, 100)}%, 62% ${clamp(edge - wave * .7, 0, 100)}%, 82% ${clamp(edge + wave * .4, 0, 100)}%, 100% ${clamp(edge, 0, 100)}%, 100% 100%, 0 100%)`;
  }

  function renderNarratives(scrollY, viewport) {
    if (tideSection && narrativeMetrics.tide) {
      const metric = narrativeMetrics.tide;
      const entry = clamp((scrollY + viewport - metric.top) / Math.max(1, viewport + metric.height));
      tideSection.style.setProperty("--tide-lift", `${(entry - .5) * 18}px`);
    }

    if (coastTime && coastFrames.length && narrativeMetrics.coast) {
      const progress = sectionProgress(narrativeMetrics.coast, scrollY, viewport);
      const position = progress * (coastFrames.length - 1);
      const active = Math.min(coastFrames.length - 1, Math.round(position));
      coastFrames.forEach((frame, index) => {
        const distance = Math.abs(position - index);
        const visibility = clamp(1 - distance);
        frame.classList.toggle("is-active", index === active);
        frame.style.setProperty("--time-opacity", visibility.toFixed(4));
        frame.style.setProperty("--time-scale", (1.012 + clamp(distance) * .038).toFixed(4));
        frame.style.setProperty("--time-x", `${clamp(index - position, -1, 1) * 1.4}%`);
        frame.style.setProperty("--time-clip", `${clamp(distance) * 6}%`);
      });
      if (coastProgress) coastProgress.style.transform = `scaleX(${progress})`;
    }

    if (crossing && narrativeMetrics.crossing) {
      const progress = sectionProgress(narrativeMetrics.crossing, scrollY, viewport);
      crossing.style.setProperty("--crossing-progress", progress.toFixed(5));
      crossing.style.setProperty("--crossing-x", `${progress * -75}%`);
      crossing.style.setProperty("--crossing-boat", `${progress * 100}%`);
      crossing.style.setProperty("--crossing-parallax", `${progress * -2.4}vw`);
    }

    if (gulangyuEntry && narrativeMetrics.gulangyu) {
      const progress = sectionProgress(narrativeMetrics.gulangyu, scrollY, viewport);
      const reveal = ease((progress - .16) / .52);
      gulangyuEntry.style.setProperty("--g-sign-opacity", (1 - ease((progress - .08) / .3)).toFixed(4));
      gulangyuEntry.style.setProperty("--g-building-opacity", ease((progress - .17) / .24).toFixed(4));
      gulangyuEntry.style.setProperty("--g-inset", `${46 * (1 - reveal)}%`);
      gulangyuEntry.style.setProperty("--g-line", `${ease((progress - .06) / .36) * 100}%`);
      gulangyuEntry.style.setProperty("--g-sign-x", `${-34 * ease((progress - .1) / .32)}vw`);
      gulangyuEntry.style.setProperty("--g-background-y", `${-8 * progress}px`);
      gulangyuEntry.style.setProperty("--g-foreground-y", `${-22 * progress}px`);
      gulangyuEntry.style.setProperty("--g-word-opacity", ease((progress - .58) / .18).toFixed(4));
    }

    if (streetFlow && streetFragments && narrativeMetrics.street && window.innerWidth > 700 && !reducedMotion) {
      const progress = sectionProgress(narrativeMetrics.street, scrollY, viewport);
      streetFlow.style.setProperty("--street-x", `${-streetTravel * progress}px`);
      streetFlow.style.setProperty("--street-progress", progress.toFixed(5));
      if (streetProgress) streetProgress.style.transform = `scaleX(${progress})`;
    }

    if (cityWater && narrativeMetrics.city) {
      const progress = sectionProgress(narrativeMetrics.city, scrollY, viewport);
      const reveals = [
        ease((progress - .08) / .28),
        ease((progress - .36) / .28),
        ease((progress - .66) / .3)
      ];
      cityLayers.forEach((layer, index) => {
        layer.style.clipPath = tideClip(reveals[index] || 0);
      });
      cityWater.style.setProperty("--city-progress", progress.toFixed(5));
      cityWater.style.setProperty("--city-y", `${progress * -1.2}vh`);
      if (cityProgress) cityProgress.style.transform = `scaleY(${progress})`;
    }
  }

  let ticking = false;

  function measureScrollScenes() {
    measureNarratives();
  }

  function renderScroll() {
    ticking = false;
    const scrollY = window.scrollY;
    const viewport = window.innerHeight;
    siteNav?.classList.toggle("is-scrolled", scrollY > viewport * .7);
    if (!reducedMotion) renderNarratives(scrollY, viewport);
  }

  function requestScrollRender() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(renderScroll);
  }

  window.addEventListener("scroll", requestScrollRender, { passive: true });
  window.addEventListener("resize", () => {
    measureScrollScenes();
    requestScrollRender();
  }, { passive: true });
  window.addEventListener("load", () => {
    measureScrollScenes();
    requestScrollRender();
  }, { once: true });
  measureScrollScenes();
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
