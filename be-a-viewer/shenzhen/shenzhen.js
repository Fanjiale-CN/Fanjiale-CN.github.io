(() => {
  const body = document.body;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const compact = window.matchMedia("(max-width: 700px)");
  const hero = document.querySelector("[data-sz-hero]");
  const video = document.querySelector("[data-sz-hero-video]");
  const toggle = document.querySelector("[data-sz-video-toggle]");
  const replay = document.querySelector("[data-sz-replay]");
  const chapters = [...document.querySelectorAll("[data-sz-chapter]")];
  const jumpLinks = [...document.querySelectorAll("[data-sz-jump]")];
  const readout = {
    time: document.querySelector("[data-sz-readout-time]"),
    place: document.querySelector("[data-sz-readout-place]"),
    mode: document.querySelector("[data-sz-readout-mode]")
  };
  let heroVisible = true;

  const setVideoLabel = () => {
    if (!toggle || !video) return;
    const playing = !video.paused;
    toggle.setAttribute("aria-pressed", String(playing));
    toggle.setAttribute("aria-label", `${playing ? "Pause" : "Play"} Shenzhen field film`);
    const icon = toggle.querySelector("span");
    const label = toggle.querySelector("b");
    if (icon) icon.textContent = playing ? "Ⅱ" : "▶";
    if (label) label.textContent = playing ? "PAUSE FIELD FILM" : "PLAY FIELD FILM";
  };

  const loadVideo = () => {
    if (!video) return;
    const nextSource = compact.matches ? video.dataset.mobileSrc : video.dataset.desktopSrc;
    if (!nextSource || video.getAttribute("src") === nextSource) return;
    video.src = nextSource;
    video.load();
  };

  const tryPlay = () => {
    if (!video || reducedMotion.matches || !heroVisible || document.hidden) return;
    video.play().then(setVideoLabel).catch(setVideoLabel);
  };

  loadVideo();
  if (!reducedMotion.matches) {
    requestAnimationFrame(() => {
      body.classList.add("sz-motion-ready");
      tryPlay();
    });
  }

  compact.addEventListener?.("change", () => {
    const wasPlaying = video && !video.paused;
    loadVideo();
    if (wasPlaying) tryPlay();
  });

  toggle?.addEventListener("click", () => {
    if (!video) return;
    if (video.paused) video.play().catch(setVideoLabel);
    else video.pause();
  });
  video?.addEventListener("play", setVideoLabel);
  video?.addEventListener("pause", setVideoLabel);

  if (hero && video && "IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      heroVisible = entry.isIntersecting;
      if (heroVisible) tryPlay();
      else video.pause();
    }, { threshold: .16 }).observe(hero);
  }

  const setChapter = (chapter) => {
    const id = chapter.id;
    body.dataset.szTone = chapter.dataset.tone || "bay";
    if (readout.time) readout.time.textContent = chapter.dataset.time || "";
    if (readout.place) readout.place.textContent = chapter.dataset.place || "";
    if (readout.mode) readout.mode.textContent = chapter.dataset.mode || "";
    jumpLinks.forEach((link) => {
      if (link.dataset.szJump === id) link.setAttribute("aria-current", "step");
      else link.removeAttribute("aria-current");
    });
  };

  if (chapters.length && "IntersectionObserver" in window) {
    const chapterObserver = new IntersectionObserver((entries) => {
      const active = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (active) setChapter(active.target);
    }, { rootMargin: "-38% 0px -38% 0px", threshold: [0, .1, .4] });
    chapters.forEach((chapter) => chapterObserver.observe(chapter));
  } else if (chapters[0]) {
    setChapter(chapters[0]);
  }

  const reveals = [...document.querySelectorAll(".sz-reveal")];
  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    reveals.forEach((node) => node.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -9% 0px", threshold: .05 });
    reveals.forEach((node) => revealObserver.observe(node));
  }

  jumpLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.getElementById(link.dataset.szJump);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth", block: "start" });
    });
  });

  replay?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reducedMotion.matches ? "auto" : "smooth" });
    if (video) {
      video.currentTime = 0;
      window.setTimeout(tryPlay, reducedMotion.matches ? 0 : 220);
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (!video) return;
    if (document.hidden) video.pause();
    else tryPlay();
  });
})();
