(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const portraitMedia = window.matchMedia("(orientation: portrait)");
  const hero = document.querySelector("[data-beijing-hero]");
  const heroVideo = document.querySelector("[data-beijing-hero-video]");
  const heroBeats = [...document.querySelectorAll("[data-beijing-hero-beat]")];
  const heroIndex = document.querySelector("[data-beijing-hero-index]");
  const heroProgress = document.querySelector("[data-beijing-hero-progress]");
  const heroToggle = document.querySelector("[data-beijing-video-toggle]");
  let heroPausedByUser = reducedMotion;
  let heroVisible = true;
  let activeHeroBeat = 0;
  let heroFrame = 0;

  function preferredHeroSource() {
    if (!heroVideo) return "";
    return portraitMedia.matches && heroVideo.dataset.mobileSrc
      ? heroVideo.dataset.mobileSrc
      : heroVideo.dataset.src || "";
  }

  function ensureHeroSource() {
    const source = preferredHeroSource();
    if (!heroVideo || !source || heroVideo.dataset.loadedSrc === source) return Boolean(source);
    heroVideo.src = source;
    heroVideo.dataset.loadedSrc = source;
    heroVideo.preload = "metadata";
    heroVideo.load();
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

  function setHeroBeat(index) {
    const next = Math.max(0, Math.min(heroBeats.length - 1, index));
    if (next === activeHeroBeat && heroBeats[next]?.classList.contains("is-active")) return;
    activeHeroBeat = next;
    heroBeats.forEach((beat, beatIndex) => {
      beat.classList.toggle("is-active", beatIndex === activeHeroBeat);
    });
    if (heroIndex) {
      heroIndex.textContent = `${String(activeHeroBeat + 1).padStart(2, "0")} / ${String(heroBeats.length).padStart(2, "0")}`;
    }
  }

  function renderHeroTimeline() {
    if (!heroVideo) return;
    const duration = Number.isFinite(heroVideo.duration) && heroVideo.duration > 0
      ? heroVideo.duration
      : 9.44;
    const progress = Math.max(0, Math.min(1, heroVideo.currentTime / duration));
    if (heroProgress) heroProgress.style.transform = `scaleX(${progress})`;
    setHeroBeat(Math.min(heroBeats.length - 1, Math.floor(progress * heroBeats.length)));
  }

  function runHeroTimeline() {
    cancelAnimationFrame(heroFrame);
    renderHeroTimeline();
    if (heroVideo && !heroVideo.paused && heroVisible && !document.hidden) {
      heroFrame = requestAnimationFrame(runHeroTimeline);
    }
  }

  function updateHeroButton() {
    if (!heroToggle) return;
    const playing = Boolean(heroVideo && !heroVideo.paused && !heroVideo.ended);
    heroToggle.textContent = playing ? "PAUSE" : "PLAY";
    heroToggle.setAttribute("aria-label", playing ? "Pause Beijing hero video" : "Play Beijing hero video");
    heroToggle.setAttribute("aria-pressed", String(playing));
  }

  async function syncHeroVideo() {
    if (!heroVideo) return;
    if (heroPausedByUser || !heroVisible || document.hidden) {
      heroVideo.pause();
      cancelAnimationFrame(heroFrame);
      renderHeroTimeline();
      updateHeroButton();
      return;
    }
    if (!ensureHeroSource()) return;
    try {
      heroVideo.muted = true;
      await heroVideo.play();
      runHeroTimeline();
    } catch {}
    updateHeroButton();
  }

  heroToggle?.addEventListener("click", () => {
    heroPausedByUser = !(heroPausedByUser || heroVideo?.paused);
    syncHeroVideo();
  });

  heroVideo?.addEventListener("loadedmetadata", renderHeroTimeline);
  heroVideo?.addEventListener("play", () => {
    updateHeroButton();
    runHeroTimeline();
  });
  heroVideo?.addEventListener("pause", () => {
    updateHeroButton();
    cancelAnimationFrame(heroFrame);
  });
  heroVideo?.addEventListener("ended", renderHeroTimeline);

  if ("IntersectionObserver" in window && hero && heroVideo) {
    const heroObserver = new IntersectionObserver(([entry]) => {
      heroVisible = entry.isIntersecting;
      syncHeroVideo();
    }, { threshold: .06 });
    heroObserver.observe(hero);
  }

  document.addEventListener("visibilitychange", syncHeroVideo);
  portraitMedia.addEventListener?.("change", () => {
    syncHeroPoster();
    if (heroVideo?.dataset.loadedSrc && heroVideo.dataset.loadedSrc !== preferredHeroSource()) {
      ensureHeroSource();
      syncHeroVideo();
    }
  });
  syncHeroPoster();
  setHeroBeat(0);
  updateHeroButton();
  syncHeroVideo();

  const axisExplorer = document.querySelector("[data-axis-explorer]");
  const axisControls = axisExplorer?.querySelector(".beijing-axis-controls");
  const axisTrack = axisExplorer?.querySelector("[data-axis-track]");
  const axisPanels = [...(axisExplorer?.querySelectorAll("[data-axis-panel]") || [])];
  const axisStops = [...(axisExplorer?.querySelectorAll("[data-axis-stop]") || [])];
  let activeAxisIndex = 0;
  let dragPointerId = null;

  function renderAxis(index, position = index / Math.max(1, axisPanels.length - 1)) {
    const nextIndex = Math.max(0, Math.min(axisPanels.length - 1, index));
    const nextPosition = Math.max(0, Math.min(1, position));
    activeAxisIndex = nextIndex;
    axisControls?.style.setProperty("--axis-position", `${nextPosition * 100}%`);
    axisPanels.forEach((panel, panelIndex) => {
      const active = panelIndex === activeAxisIndex;
      panel.classList.toggle("is-active", active);
      panel.setAttribute("aria-hidden", String(!active));
    });
    axisStops.forEach((stop, stopIndex) => {
      const active = stopIndex === activeAxisIndex;
      stop.classList.toggle("is-active", active);
      stop.setAttribute("aria-selected", String(active));
    });
    if (axisTrack) {
      axisTrack.setAttribute("aria-valuenow", String(activeAxisIndex));
      axisTrack.setAttribute("aria-valuetext", axisStops[activeAxisIndex]?.textContent.trim() || "");
    }
  }

  function setAxis(index, { focus = false } = {}) {
    const nextIndex = Math.max(0, Math.min(axisPanels.length - 1, index));
    renderAxis(nextIndex);
    if (focus) axisStops[nextIndex]?.focus();
  }

  function axisPositionFromPointer(clientX) {
    if (!axisTrack) return 0;
    const bounds = axisTrack.getBoundingClientRect();
    if (!bounds.width) return 0;
    return Math.max(0, Math.min(1, (clientX - bounds.left) / bounds.width));
  }

  function updateAxisFromPointer(clientX) {
    const position = axisPositionFromPointer(clientX);
    const index = Math.round(position * Math.max(1, axisPanels.length - 1));
    renderAxis(index, position);
  }

  axisTrack?.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 && event.pointerType !== "touch") return;
    dragPointerId = event.pointerId;
    axisControls?.classList.add("is-dragging");
    axisTrack.setPointerCapture(event.pointerId);
    updateAxisFromPointer(event.clientX);
  });

  axisTrack?.addEventListener("pointermove", (event) => {
    if (event.pointerId !== dragPointerId) return;
    updateAxisFromPointer(event.clientX);
  });

  function finishAxisDrag(event) {
    if (event.pointerId !== dragPointerId) return;
    dragPointerId = null;
    axisControls?.classList.remove("is-dragging");
    setAxis(activeAxisIndex);
  }

  axisTrack?.addEventListener("pointerup", finishAxisDrag);
  axisTrack?.addEventListener("pointercancel", finishAxisDrag);

  axisTrack?.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      setAxis(activeAxisIndex + 1);
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      setAxis(activeAxisIndex - 1);
    }
    if (event.key === "Home") {
      event.preventDefault();
      setAxis(0);
    }
    if (event.key === "End") {
      event.preventDefault();
      setAxis(axisPanels.length - 1);
    }
  });

  axisStops.forEach((stop, index) => {
    stop.addEventListener("click", () => setAxis(index));
    stop.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        setAxis((index + 1) % axisStops.length, { focus: true });
      }
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        setAxis((index - 1 + axisStops.length) % axisStops.length, { focus: true });
      }
      if (event.key === "Home") {
        event.preventDefault();
        setAxis(0, { focus: true });
      }
      if (event.key === "End") {
        event.preventDefault();
        setAxis(axisStops.length - 1, { focus: true });
      }
    });
  });
  renderAxis(0);

  const typewriter = document.querySelector("[data-beijing-typewriter]");
  let typewriterStarted = false;

  function writeTitle() {
    if (!typewriter || typewriterStarted) return;
    typewriterStarted = true;
    const title = typewriter.dataset.beijingTypewriter || "";
    if (reducedMotion) {
      typewriter.textContent = title;
      return;
    }
    let index = 0;
    function writeNext() {
      typewriter.textContent = title.slice(0, index);
      if (index >= title.length) return;
      const character = title[index];
      index += 1;
      const delay = character === " " ? 38 : character === "." ? 180 : 58 + (index % 3) * 14;
      window.setTimeout(writeNext, delay);
    }
    window.setTimeout(writeNext, 180);
  }

  if ("IntersectionObserver" in window && typewriter) {
    const typeObserver = new IntersectionObserver(([entry], observer) => {
      if (!entry.isIntersecting) return;
      writeTitle();
      observer.disconnect();
    }, { threshold: .38 });
    typeObserver.observe(typewriter);
  } else {
    writeTitle();
  }

  const revealItems = [...document.querySelectorAll("[data-beijing-reveal]")];
  if (!reducedMotion && "IntersectionObserver" in window) {
    document.body.classList.add("beijing-motion-ready");
    revealItems.forEach((item, index) => {
      item.style.transitionDelay = `${(index % 4) * 65}ms`;
    });
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, {
      rootMargin: "0px 0px -7% 0px",
      threshold: .08
    });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  const archiveModule = document.createElement("script");
  archiveModule.src = "/be-a-viewer/beijing/beijing-archive.js?v=20260830-beijing-cinema1";
  archiveModule.defer = true;
  document.head.append(archiveModule);
})();