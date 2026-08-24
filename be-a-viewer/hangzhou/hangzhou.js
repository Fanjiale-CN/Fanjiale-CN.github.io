(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobileMedia = window.matchMedia("(max-width: 760px)");

  const hero = document.querySelector("[data-hz-hero]");
  const heroVideo = document.querySelector("[data-hz-hero-video]");
  const heroToggle = document.querySelector("[data-hz-hero-toggle]");
  let heroPausedByUser = reducedMotion;
  let heroVisible = true;

  function ensureHeroSource() {
    if (!heroVideo) return false;
    const source = mobileMedia.matches && heroVideo.dataset.mobileSrc
      ? heroVideo.dataset.mobileSrc
      : heroVideo.dataset.src || "";
    if (!source) return false;
    if (heroVideo.dataset.loadedSrc !== source) {
      heroVideo.src = source;
      heroVideo.dataset.loadedSrc = source;
      heroVideo.preload = "metadata";
      heroVideo.load();
    }
    return true;
  }

  function syncHero() {
    if (!heroVideo || !heroToggle) return;
    const playing = !heroVideo.paused && !heroVideo.ended;
    heroToggle.textContent = playing ? "PAUSE" : "PLAY";
    heroToggle.setAttribute("aria-pressed", String(playing));
    heroToggle.setAttribute("aria-label", `${playing ? "Pause" : "Play"} Hangzhou hero video`);
  }

  async function syncHeroPlayback({ userInitiated = false } = {}) {
    if (!heroVideo) return;
    if (heroPausedByUser || !heroVisible || document.hidden || (reducedMotion && !userInitiated)) {
      heroVideo.pause();
      syncHero();
      return;
    }
    if (!ensureHeroSource()) return;
    try {
      heroVideo.muted = true;
      await heroVideo.play();
    } catch {}
    syncHero();
  }

  heroToggle?.addEventListener("click", () => {
    if (heroVideo.paused) {
      heroPausedByUser = false;
      syncHeroPlayback({ userInitiated: true });
    } else {
      heroPausedByUser = true;
      heroVideo.pause();
    }
  });
  ["play", "pause", "ended", "error"].forEach((eventName) => heroVideo?.addEventListener(eventName, syncHero));
  if (hero && "IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      heroVisible = entry.isIntersecting;
      syncHeroPlayback();
    }, { threshold: .06 }).observe(hero);
  }
  document.addEventListener("visibilitychange", () => syncHeroPlayback());
  syncHero();
  syncHeroPlayback();

  const filmStage = document.querySelector("[data-hz-film-stage]");
  const filmSlides = [...document.querySelectorAll("[data-hz-film-slide]")];
  const filmToggle = document.querySelector("[data-hz-film-toggle]");
  const timeNode = document.querySelector("[data-hz-film-time]");
  const filmProgress = document.querySelector("[data-hz-film-progress]");
  const filmDuration = 15;
  const slideDuration = filmDuration / Math.max(1, filmSlides.length);
  let filmElapsed = 0;
  let filmWanted = !reducedMotion;
  let filmVisible = true;
  let lastFilmStamp = performance.now();

  function formatTime(value) {
    const seconds = Math.max(0, Math.floor(Number(value) || 0));
    return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  }

  function syncFilm() {
    const activeIndex = Math.min(filmSlides.length - 1, Math.floor(filmElapsed / slideDuration));
    filmSlides.forEach((slide, index) => slide.classList.toggle("is-active", index === activeIndex));
    if (timeNode) timeNode.textContent = formatTime(filmElapsed);
    if (filmProgress) filmProgress.style.transform = `scaleX(${filmElapsed / filmDuration})`;
    if (filmToggle) {
      filmToggle.textContent = filmWanted ? "PAUSE" : "PLAY";
      filmToggle.setAttribute("aria-pressed", String(filmWanted));
      filmToggle.setAttribute("aria-label", `${filmWanted ? "Pause" : "Play"} Hangzhou field reel`);
    }
  }

  filmToggle?.addEventListener("click", () => {
    filmWanted = !filmWanted;
    syncFilm();
  });

  function runFilm(stamp) {
    if (filmWanted && filmVisible) filmElapsed = (filmElapsed + Math.min(100, stamp - lastFilmStamp) / 1000) % filmDuration;
    lastFilmStamp = stamp;
    syncFilm();
    requestAnimationFrame(runFilm);
  }
  requestAnimationFrame(runFilm);

  if (filmStage && "IntersectionObserver" in window) {
    const filmObserver = new IntersectionObserver(([entry]) => {
      filmVisible = entry.isIntersecting;
    }, { threshold: .12 });
    filmObserver.observe(filmStage);
  }

  /* Retired: chapter spy moved to the GalokWave component (city skin). */
  const chapters = [];
  const chapterLinks = [];
  const progressBar = null;

  function updatePageProgress() {
    if (!progressBar) return;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const progress = total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0;
    progressBar.style.transform = `scaleX(${progress})`;
  }
  window.addEventListener("scroll", updatePageProgress, { passive: true });
  updatePageProgress();

  /* Chapter observer retired (GalokWave owns the chapter spy). */
  if (false && "IntersectionObserver" in window) {
    const chapterObserver = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const id = visible.target.dataset.hzChapter;
      chapterLinks.forEach((link) => link.classList.toggle("is-active", link.dataset.hzChapterLink === id));
    }, { rootMargin: "-20% 0px -58%", threshold: [0, .2, .45] });
    chapters.forEach((chapter) => chapterObserver.observe(chapter));
  }

  const rail = document.querySelector("[data-hz-rail]");
  const railPrev = document.querySelector("[data-hz-rail-prev]");
  const railNext = document.querySelector("[data-hz-rail-next]");
  const moveRail = (direction) => rail?.scrollBy({ left: direction * rail.clientWidth * .78, behavior: reducedMotion ? "auto" : "smooth" });
  railPrev?.addEventListener("click", () => moveRail(-1));
  railNext?.addEventListener("click", () => moveRail(1));
  rail?.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      moveRail(event.key === "ArrowLeft" ? -1 : 1);
    }
  });

  const reveals = [...document.querySelectorAll(".hz-reveal")];
  if (reducedMotion || !("IntersectionObserver" in window)) reveals.forEach((node) => node.classList.add("is-visible"));
  else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8%", threshold: .06 });
    reveals.forEach((node) => revealObserver.observe(node));
  }

  document.querySelectorAll("[data-current-year]").forEach((node) => { node.textContent = new Date().getFullYear(); });
})();
