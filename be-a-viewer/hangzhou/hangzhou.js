(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hero = document.querySelector("[data-hz-hero]");
  const heroVideo = hero?.querySelector("[data-hz-hero-video]");
  const heroToggle = hero?.querySelector("[data-hz-hero-toggle]");

  function setHeroState() {
    if (!heroVideo || !heroToggle) return;
    const paused = heroVideo.paused;
    heroToggle.textContent = paused ? "PLAY" : "PAUSE";
    heroToggle.setAttribute("aria-pressed", String(paused));
    heroToggle.setAttribute("aria-label", `${paused ? "Play" : "Pause"} Hangzhou hero video`);
  }

  heroToggle?.addEventListener("click", () => {
    if (!heroVideo) return;
    if (heroVideo.paused) heroVideo.play().catch(() => {});
    else heroVideo.pause();
    setHeroState();
  });

  if (reducedMotion) heroVideo?.pause();
  heroVideo?.addEventListener("play", setHeroState);
  heroVideo?.addEventListener("pause", setHeroState);
  setHeroState();

  const film = document.querySelector("[data-hz-film]");
  const filmVideo = film?.querySelector("[data-hz-film-video]");
  const filmToggle = film?.querySelector("[data-hz-film-toggle]");
  const filmRange = film?.querySelector("[data-hz-film-range]");
  const timeNode = film?.querySelector("[data-hz-film-time]");
  const durationNode = film?.querySelector("[data-hz-film-duration]");
  let rangeActive = false;

  function formatTime(value) {
    const seconds = Math.max(0, Math.round(Number(value) || 0));
    return `00:${String(seconds).padStart(2, "0")}`;
  }

  function updateFilm() {
    if (!filmVideo || !filmRange) return;
    const duration = Number.isFinite(filmVideo.duration) ? filmVideo.duration : 0;
    if (!rangeActive && duration) filmRange.value = String(Math.round((filmVideo.currentTime / duration) * 1000));
    if (timeNode) timeNode.textContent = formatTime(filmVideo.currentTime);
    if (durationNode && duration) durationNode.textContent = formatTime(duration);
    if (filmToggle) {
      filmToggle.textContent = filmVideo.paused ? "PLAY" : "PAUSE";
      filmToggle.setAttribute("aria-pressed", String(!filmVideo.paused));
      filmToggle.setAttribute("aria-label", `${filmVideo.paused ? "Play" : "Pause"} Hangzhou field note`);
    }
  }

  filmToggle?.addEventListener("click", () => {
    if (!filmVideo) return;
    if (filmVideo.paused) filmVideo.play().catch(() => {});
    else filmVideo.pause();
    updateFilm();
  });

  filmRange?.addEventListener("pointerdown", () => { rangeActive = true; });
  filmRange?.addEventListener("input", () => {
    if (!filmVideo || !Number.isFinite(filmVideo.duration)) return;
    filmVideo.currentTime = (Number(filmRange.value) / 1000) * filmVideo.duration;
    updateFilm();
  });
  ["pointerup", "change", "blur"].forEach((eventName) => filmRange?.addEventListener(eventName, () => { rangeActive = false; updateFilm(); }));
  ["loadedmetadata", "timeupdate", "play", "pause", "ended"].forEach((eventName) => filmVideo?.addEventListener(eventName, updateFilm));

  if (filmVideo && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting && !filmVideo.paused) filmVideo.pause();
    }, { threshold: .15 });
    observer.observe(filmVideo);
  }

  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = new Date().getFullYear();
  });
})();
