(() => {
  void import("/be-a-viewer/shanghai/shanghai-history.js?v=20260827-sh20-hotfix1").catch(() => {});

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const body = document.body;
  const siteNav = document.querySelector(".shanghai-site-nav");
  const hero = document.querySelector(".shanghai-hero");
  const heroVideo = document.querySelector("[data-shanghai-hero-video]");
  const portraitMedia = window.matchMedia("(orientation: portrait)");
  const videoToggle = document.querySelector("[data-shanghai-video-toggle]");
  const temple = document.querySelector("[data-shanghai-temple]");
  const templeVideo = document.querySelector("[data-shanghai-temple-video]");
  const templeToggle = document.querySelector("[data-shanghai-temple-toggle]");
  const templeBeats = [...document.querySelectorAll("[data-shanghai-temple-beat]")];
  const templeIndex = document.querySelector("[data-shanghai-temple-index]");
  const templeProgress = document.querySelector("[data-shanghai-temple-progress]");
    // Retired: chapter spy moved to the GalokWave component (city skin).
  const storyNav = null;
  const storyLinks = [];
  const storySections = [];
  const storyProgress = null;
  let pausedByUser = reducedMotion;
  let heroVisible = true;
  let templeVisible = false;
  let templePausedByUser = reducedMotion;
  let templeTimelineActive = false;
  let templeFrameHandle = 0;
  let activeTempleBeat = 0;
  let ticking = false;
  let sectionMetrics = [];
  let heroThreshold = 1;
  let activeHref = "";

  function preferredVideoSource(video) {
    if (!video) return "";
    return portraitMedia.matches && video.dataset.mobileSrc
      ? video.dataset.mobileSrc
      : video.dataset.src || "";
  }

  function ensureVideoSource(video) {
    const source = preferredVideoSource(video);
    if (!video || !source || video.dataset.loadedSrc === source) return Boolean(source);
    video.src = source;
    video.dataset.loadedSrc = source;
    video.preload = "metadata";
    video.load();
    return true;
  }

  function syncHeroPoster() {
    if (!heroVideo) return;
    const poster = portraitMedia.matches
      ? heroVideo.dataset.posterPortrait
      : heroVideo.dataset.posterLandscape;
    if (poster && heroVideo.getAttribute("poster") !== poster) {
      heroVideo.setAttribute("poster", poster);
    }
  }

  function syncTemplePoster() {
    if (!templeVideo) return;
    const poster = portraitMedia.matches
      ? templeVideo.dataset.posterPortrait
      : templeVideo.dataset.posterLandscape;
    if (poster && templeVideo.getAttribute("poster") !== poster) {
      templeVideo.setAttribute("poster", poster);
    }
  }

  function updateVideoButton() {
    if (!videoToggle) return;
    const playing = Boolean(heroVideo && !heroVideo.paused && !heroVideo.ended);
    videoToggle.textContent = playing ? "PAUSE" : "PLAY";
    videoToggle.setAttribute("aria-label", playing ? "Pause Shanghai hero video" : "Play Shanghai hero video");
    videoToggle.setAttribute("aria-pressed", String(playing));
  }

  async function syncHeroVideo() {
    if (!heroVideo) return;
    if (pausedByUser || !heroVisible || document.hidden) {
      heroVideo.pause();
      updateVideoButton();
      return;
    }
    if (!ensureVideoSource(heroVideo)) return;
    try {
      heroVideo.muted = true;
      await heroVideo.play();
    } catch {}
    updateVideoButton();
  }

  function setTempleBeat(index) {
    const nextIndex = Math.max(0, Math.min(templeBeats.length - 1, index));
    if (nextIndex === activeTempleBeat && templeBeats[nextIndex]?.classList.contains("is-active")) return;
    activeTempleBeat = nextIndex;
    templeBeats.forEach((beat, beatIndex) => {
      beat.classList.toggle("is-active", beatIndex === activeTempleBeat);
      beat.setAttribute("aria-hidden", String(beatIndex !== activeTempleBeat));
    });
    if (templeIndex) {
      templeIndex.textContent = `${String(activeTempleBeat + 1).padStart(2, "0")} / ${String(templeBeats.length).padStart(2, "0")}`;
    }
  }

  function renderTempleTimeline() {
    if (!templeVideo) return;
    const duration = Number.isFinite(templeVideo.duration) && templeVideo.duration > 0
      ? templeVideo.duration
      : 10.36;
    const progress = Math.min(1, Math.max(0, templeVideo.currentTime / duration));
    if (templeProgress) templeProgress.style.transform = `scaleX(${progress})`;
    setTempleBeat(Math.min(templeBeats.length - 1, Math.floor(progress * templeBeats.length)));
  }

  function scheduleTempleTimeline() {
    if (!templeTimelineActive || !templeVideo) return;
    renderTempleTimeline();
    if ("requestVideoFrameCallback" in HTMLVideoElement.prototype) {
      templeFrameHandle = templeVideo.requestVideoFrameCallback(scheduleTempleTimeline);
    } else {
      templeFrameHandle = requestAnimationFrame(scheduleTempleTimeline);
    }
  }

  function startTempleTimeline() {
    if (templeTimelineActive || !templeVideo) return;
    templeTimelineActive = true;
    scheduleTempleTimeline();
  }

  function stopTempleTimeline() {
    if (!templeTimelineActive || !templeVideo) return;
    templeTimelineActive = false;
    if ("cancelVideoFrameCallback" in HTMLVideoElement.prototype) {
      templeVideo.cancelVideoFrameCallback(templeFrameHandle);
    } else {
      cancelAnimationFrame(templeFrameHandle);
    }
    templeFrameHandle = 0;
    renderTempleTimeline();
  }

  function updateTempleButton() {
    if (!templeToggle) return;
    const playing = Boolean(templeVideo && !templeVideo.paused && !templeVideo.ended);
    templeToggle.textContent = playing ? "PAUSE" : "PLAY";
    templeToggle.setAttribute("aria-label", playing ? "Pause Jing’an Temple video" : "Play Jing’an Temple video");
    templeToggle.setAttribute("aria-pressed", String(playing));
  }

  async function syncTempleVideo() {
    if (!templeVideo) return;
    if (templePausedByUser || !templeVisible || document.hidden) {
      templeVideo.pause();
      stopTempleTimeline();
      updateTempleButton();
      return;
    }
    if (!ensureVideoSource(templeVideo)) return;
    try {
      templeVideo.muted = true;
      await templeVideo.play();
      startTempleTimeline();
    } catch {}
    updateTempleButton();
  }

  videoToggle?.addEventListener("click", () => {
    pausedByUser = !(pausedByUser || heroVideo?.paused);
    syncHeroVideo();
  });

  templeToggle?.addEventListener("click", () => {
    templePausedByUser = !(templePausedByUser || templeVideo?.paused);
    syncTempleVideo();
  });

  if ("IntersectionObserver" in window && heroVideo) {
    const videoObserver = new IntersectionObserver(([entry]) => {
      heroVisible = entry.isIntersecting;
      syncHeroVideo();
    }, { threshold: .08 });
    videoObserver.observe(hero);
  }

  if ("IntersectionObserver" in window && templeVideo && temple) {
    const templeObserver = new IntersectionObserver(([entry]) => {
      templeVisible = entry.isIntersecting;
      syncTempleVideo();
    }, { threshold: .08 });
    templeObserver.observe(temple);
  }

  document.addEventListener("visibilitychange", () => {
    syncHeroVideo();
    syncTempleVideo();
  });
  portraitMedia.addEventListener?.("change", () => {
    syncHeroPoster();
    syncTemplePoster();
    if (heroVideo?.dataset.loadedSrc) {
      ensureVideoSource(heroVideo);
      syncHeroVideo();
    }
    if (templeVideo?.dataset.loadedSrc && templeVisible) {
      ensureVideoSource(templeVideo);
      syncTempleVideo();
    }
  });
  syncHeroPoster();
  syncTemplePoster();
  if (reducedMotion) heroVideo?.pause();
  if (reducedMotion) templeVideo?.pause();
  updateVideoButton();
  updateTempleButton();
  setTempleBeat(0);
  templeVideo?.addEventListener("loadedmetadata", renderTempleTimeline);
  templeVideo?.addEventListener("play", () => {
    updateTempleButton();
    startTempleTimeline();
  });
  templeVideo?.addEventListener("pause", () => {
    updateTempleButton();
    stopTempleTimeline();
  });

  function measure() {
    heroThreshold = Math.max(1, (hero?.offsetHeight || 1) * .72);
    sectionMetrics = storySections.map((section) => ({
      section,
      top: section.offsetTop,
      bottom: section.offsetTop + section.offsetHeight
    }));
  }

  function setActiveSection(section) {
    if (!section) return;
    const href = `#${section.id}`;
    if (href === activeHref) return;
    activeHref = href;
    // Retired: spy marking now owned by GalokWave.
    storyLinks.forEach((link) => {
      const active = link.getAttribute("href") === href;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    /* Retired: host bar scrolled by GalokWave. */
    void storyLinks.find((link) => link.getAttribute("href") === href);
  }

  function renderScrollState() {
    ticking = false;
    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    siteNav?.classList.toggle("is-scrolled", scrollY > heroThreshold);
    if (!sectionMetrics.length) return;
    const start = sectionMetrics[0].top;
    const end = sectionMetrics.at(-1).bottom - viewportHeight;
    /* Retired: progress hairline now owned by GalokWave. */
    void (scrollY - start); void Math.max(1, end - start);
    const readingLine = scrollY + viewportHeight * .4;
    let active = sectionMetrics[0].section;
    sectionMetrics.forEach((metric) => {
      if (metric.top <= readingLine) active = metric.section;
    });
    setActiveSection(active);
  }

  function requestScrollRender() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(renderScrollState);
  }

  function scrollToSection(target, behavior = "auto") {
    if (!target) return;
    body.classList.add("site-chrome-hidden");
    window.scrollTo({
      top: target.offsetTop,
      behavior
    });
  }

  storyLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      event.preventDefault();
      scrollToSection(target, reducedMotion || coarsePointer ? "auto" : "smooth");
      history.replaceState(null, "", link.getAttribute("href"));
    });
  });

  const revealItems = [...new Set([
    ...document.querySelectorAll(".shanghai-section-head > *, .shanghai-section > div, .shanghai-section > .shanghai-photo, .shanghai-closing > *, [data-shanghai-reveal]")
  ])];

  if (!reducedMotion && "IntersectionObserver" in window) {
    revealItems.forEach((item) => item.classList.add("shanghai-reveal"));
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8%", threshold: .06 });
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  const frameGroups = [
    ...document.querySelectorAll(".shanghai-motion-sequence > div, .shanghai-qipao-story")
  ];
  if (!reducedMotion && "IntersectionObserver" in window) {
    frameGroups.forEach((group) => {
      const frames = [...group.querySelectorAll(".shanghai-photo")];
      frames.forEach((frame, index) => {
        frame.classList.add("shanghai-frame-reveal");
        frame.style.setProperty("--shanghai-frame-delay", `${Math.min(index * 90, 360)}ms`);
      });
    });
    const frameObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.querySelectorAll(".shanghai-frame-reveal").forEach((frame) => {
          frame.classList.add("is-frame-visible");
        });
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -10%", threshold: .08 });
    frameGroups.forEach((group) => frameObserver.observe(group));
  }

  const applePhoto = document.querySelector("[data-shanghai-photo-reveal]");
  if (!reducedMotion && applePhoto && "IntersectionObserver" in window) {
    const photoObserver = new IntersectionObserver(([entry], observer) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-shot");
      observer.unobserve(entry.target);
    }, { rootMargin: "0px 0px -12%", threshold: .18 });
    photoObserver.observe(applePhoto);
    applePhoto.querySelector("img")?.addEventListener("animationend", () => {
      applePhoto.classList.add("is-shot-complete");
    }, { once: true });
  }

  function typeVerticalTitle(title) {
    const lines = [...title.querySelectorAll("[data-shanghai-type-line]")];
    if (!lines.length) return;
    const values = lines.map((line) => line.dataset.shanghaiTypeLine || line.textContent.trim());
    const characterDelay = 58;
    let lineIndex = 0;
    let characterIndex = 0;
    let previousTime = 0;

    lines.forEach((line) => { line.textContent = ""; });
    title.classList.add("is-typing");

    function tick(timestamp) {
      if (!previousTime) previousTime = timestamp;
      if (timestamp - previousTime < characterDelay) {
        requestAnimationFrame(tick);
        return;
      }
      previousTime = timestamp;
      const value = values[lineIndex];
      characterIndex += 1;
      lines[lineIndex].textContent = value.slice(0, characterIndex);
      if (characterIndex < value.length) {
        requestAnimationFrame(tick);
        return;
      }
      lineIndex += 1;
      characterIndex = 0;
      if (lineIndex < values.length) {
        requestAnimationFrame(tick);
        return;
      }
      title.classList.remove("is-typing");
      title.classList.add("is-typed");
    }

    requestAnimationFrame(tick);
  }

  const typeTitle = document.querySelector("[data-shanghai-type-title]");
  if (!reducedMotion && typeTitle && "IntersectionObserver" in window) {
    const titleObserver = new IntersectionObserver(([entry], observer) => {
      if (!entry.isIntersecting) return;
      typeVerticalTitle(entry.target);
      observer.unobserve(entry.target);
    }, { rootMargin: "0px 0px -18%", threshold: .38 });
    titleObserver.observe(typeTitle);
  }

  window.addEventListener("scroll", requestScrollRender, { passive: true });
  window.addEventListener("resize", () => {
    measure();
    requestScrollRender();
  }, { passive: true });
  window.addEventListener("load", () => {
    measure();
    const hashTarget = storySections.find((section) => `#${section.id}` === window.location.hash);
    if (hashTarget) scrollToSection(hashTarget);
    renderScrollState();
    syncHeroVideo();
    syncTempleVideo();
  }, { once: true });
  measure();
  renderScrollState();

  const lightbox = document.querySelector("[data-shanghai-lightbox]");
  const lightboxImage = lightbox?.querySelector("[data-shanghai-lightbox-image]");
  const lightboxCaption = lightbox?.querySelector("[data-shanghai-lightbox-caption]");
  const lightboxCount = lightbox?.querySelector("[data-shanghai-lightbox-count]");
  const figures = [...document.querySelectorAll(".shanghai-photo")].filter((figure) => figure.querySelector("img"));
  let activeImage = 0;
  let returnFocus = null;
  let swipeStart = null;

  function showImage(index) {
    if (!lightboxImage || !lightboxCaption || !lightboxCount || !figures.length) return;
    activeImage = (index + figures.length) % figures.length;
    const image = figures[activeImage].querySelector("img");
    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt;
    lightboxCaption.textContent = image.alt;
    lightboxCount.textContent = `${String(activeImage + 1).padStart(2, "0")} / ${String(figures.length).padStart(2, "0")}`;
  }

  function openLightbox(index, trigger) {
    if (!lightbox) return;
    returnFocus = trigger;
    showImage(index);
    lightbox.showModal();
    body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox?.close();
  }

  figures.forEach((figure, index) => {
    figure.tabIndex = 0;
    figure.setAttribute("role", "button");
    figure.setAttribute("aria-label", `View larger photograph: ${figure.querySelector("img").alt}`);
    figure.addEventListener("click", () => openLightbox(index, figure));
    figure.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openLightbox(index, figure);
    });
  });

  lightbox?.querySelector("[data-shanghai-lightbox-close]")?.addEventListener("click", closeLightbox);
  lightbox?.querySelector("[data-shanghai-lightbox-previous]")?.addEventListener("click", () => showImage(activeImage - 1));
  lightbox?.querySelector("[data-shanghai-lightbox-next]")?.addEventListener("click", () => showImage(activeImage + 1));
  lightbox?.addEventListener("close", () => {
    body.style.overflow = "";
    returnFocus?.focus({ preventScroll: true });
    returnFocus = null;
  });
  lightbox?.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  lightbox?.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") showImage(activeImage - 1);
    if (event.key === "ArrowRight") showImage(activeImage + 1);
  });
  lightbox?.querySelector("figure")?.addEventListener("pointerdown", (event) => {
    if (event.isPrimary) swipeStart = event.clientX;
  }, { passive: true });
  lightbox?.querySelector("figure")?.addEventListener("pointerup", (event) => {
    if (!event.isPrimary || swipeStart === null) return;
    const distance = event.clientX - swipeStart;
    swipeStart = null;
    if (Math.abs(distance) > 55) showImage(activeImage + (distance < 0 ? 1 : -1));
  }, { passive: true });

  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = new Date().getFullYear();
  });
})();