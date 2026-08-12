(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const heroVideo = document.querySelector("[data-hz-hero-video]");
  const heroToggle = document.querySelector("[data-hz-hero-toggle]");

  function syncHero() {
    if (!heroVideo || !heroToggle) return;
    const paused = heroVideo.paused;
    heroToggle.textContent = paused ? "PLAY" : "PAUSE";
    heroToggle.setAttribute("aria-pressed", String(paused));
    heroToggle.setAttribute("aria-label", `${paused ? "Play" : "Pause"} Hangzhou hero video`);
  }

  heroToggle?.addEventListener("click", () => {
    if (heroVideo.paused) heroVideo.play().catch(() => {});
    else heroVideo.pause();
    syncHero();
  });
  if (reducedMotion) heroVideo?.pause();
  ["play", "pause"].forEach((eventName) => heroVideo?.addEventListener(eventName, syncHero));
  syncHero();

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

  const chapters = [...document.querySelectorAll("[data-hz-chapter]")];
  const chapterLinks = [...document.querySelectorAll("[data-hz-chapter-link]")];
  const progressBar = document.querySelector("[data-hz-chapter-progress]");

  function updatePageProgress() {
    if (!progressBar) return;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const progress = total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0;
    progressBar.style.transform = `scaleX(${progress})`;
  }
  window.addEventListener("scroll", updatePageProgress, { passive: true });
  updatePageProgress();

  if ("IntersectionObserver" in window) {
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

  const frames = [
    ["01-night-kiosk.webp", "NIGHT KIOSK", "Small Hangzhou kiosk and bicycle at night", "night", "01 / NIGHT KIOSK · CAELYRETH / UNSPLASH"],
    ["02-love-hangzhou.webp", "我爱杭州", "Red I love Hangzhou sign at night", "night", "02 / 我爱杭州 · CAELYRETH / UNSPLASH"],
    ["03-lake-pavilion-mist.webp", "PAVILION / MIST", "Lake pavilion in mist", "water", "03 / LAKE PAVILION IN MIST · CHENGLIN HAO / UNSPLASH"],
    ["04-vertical-city-window.webp", "CITY WINDOW", "Black and white vertical urban frame", "street", "04 / VERTICAL CITY WINDOW · CLU SOH / UNSPLASH"],
    ["05-rain-taxi.webp", "RAIN TAXI", "Taxi traffic in rain", "street", "05 / RAIN TAXI · JEFFREY ZHANG / UNSPLASH"],
    ["06-rain-figures.webp", "RAIN FIGURES", "People with umbrellas behind rain glass", "street", "06 / FIGURES BEHIND GLASS · JOEY HUANG / UNSPLASH"],
    ["07-lakeside-evening.webp", "LAKESIDE EVENING", "People resting beside West Lake", "water", "07 / LAKESIDE EVENING · LI GUOWEN / UNSPLASH"],
    ["08-stone-water-markers.webp", "STONE / WATER", "Stone markers in water", "water", "08 / STONE WATER MARKERS · ANTHONY TUTTLE / PEXELS"],
    ["09-pagoda-shore.webp", "PAGODA SHORE", "Pagoda across West Lake", "water", "09 / PAGODA SHORE · CENCIAL / PEXELS"],
    ["10-night-pavilion.webp", "NIGHT PAVILION", "Pavilion lit at night beside water", "night", "10 / NIGHT PAVILION · DAWN LIO / PEXELS"],
    ["11-metro-escalator.webp", "METRO DESCENT", "Black and white metro escalator", "city", "11 / METRO DESCENT · FANGYUANZHIWAI / PEXELS"],
    ["12-old-neighbourhood.webp", "NEIGHBOURHOOD", "Old Hangzhou neighbourhood", "street", "12 / OLD NEIGHBOURHOOD · FILMMAKER YU / PEXELS"],
    ["13-lake-horizon.webp", "LAKE HORIZON", "West Lake horizon framed by a tree", "water", "13 / LAKE HORIZON · KEAT007 / PEXELS"],
    ["14-qianjiang-night.webp", "CITY IN RINGS", "Qianjiang skyline at night", "city", "14 / QIANJIANG NIGHT · MOLIN LIU / PEXELS"],
    ["15-qianjiang-dusk.webp", "QIANJIANG DUSK", "Qianjiang skyline at dusk", "city", "15 / QIANJIANG DUSK · ORANGE OCEAN / PEXELS"],
    ["16-old-street.webp", "OLD STREET", "Traditional old street", "street", "16 / OLD STREET · PATRICK HO / PEXELS"],
    ["17-temple-gate.webp", "TEMPLE GATE", "People passing a temple gate", "street", "17 / TEMPLE GATE · RYAN LEE / PEXELS"],
    ["18-lake-boat.webp", "LAKE BOAT", "Boat crossing West Lake", "water", "18 / LAKE BOAT · WONG PETER / PEXELS"],
    ["19-mountain-afterglow.webp", "AFTERGLOW", "Mountains under an evening sky", "water", "19 / MOUNTAIN AFTERGLOW · QIYAN ZHANG / UNSPLASH"],
    ["20-glass-city.webp", "GLASS + GREEN", "Glass architecture behind green leaves", "city", "20 / GLASS + GREEN · ZHANG HUI / UNSPLASH"]
  ];

  const sheet = document.querySelector("[data-hz-contact-sheet]");
  const frameNodes = [];
  frames.forEach(([file, title, alt, theme, caption], index) => {
    const button = document.createElement("button");
    button.className = "hz-contact-card";
    button.type = "button";
    button.dataset.hzFrame = "";
    button.dataset.theme = theme;
    button.dataset.src = `/assets/be-a-viewer/hangzhou/gallery/${file}`;
    button.dataset.caption = caption;
    button.innerHTML = `<img src="${button.dataset.src}" loading="lazy" decoding="async" alt="${alt}"><span>${String(index + 1).padStart(2, "0")}</span><b>${title}</b>`;
    sheet?.appendChild(button);
    frameNodes.push(button);
  });

  const filterButtons = [...document.querySelectorAll("[data-hz-filter]")];
  const filterStatus = document.querySelector("[data-hz-filter-status]");
  filterButtons.forEach((button) => button.addEventListener("click", () => {
    const filter = button.dataset.hzFilter;
    let visible = 0;
    filterButtons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    frameNodes.forEach((frame) => {
      const match = filter === "all" || frame.dataset.theme.split(" ").includes(filter);
      frame.hidden = !match;
      if (match) visible += 1;
    });
    if (filterStatus) filterStatus.textContent = `${visible} frame${visible === 1 ? "" : "s"} visible`;
  }));

  const lightbox = document.querySelector("[data-hz-lightbox]");
  const lightboxImage = lightbox?.querySelector("[data-hz-lightbox-image]");
  const lightboxCaption = lightbox?.querySelector("[data-hz-lightbox-caption]");
  const lightboxIndex = lightbox?.querySelector("[data-hz-lightbox-index]");
  let activeFrame = 0;

  function renderLightbox(index) {
    activeFrame = (index + frameNodes.length) % frameNodes.length;
    const frame = frameNodes[activeFrame];
    const image = frame.querySelector("img");
    if (lightboxImage) {
      lightboxImage.src = frame.dataset.src;
      lightboxImage.alt = image?.alt || "Hangzhou field photograph";
    }
    if (lightboxCaption) lightboxCaption.textContent = frame.dataset.caption;
    if (lightboxIndex) lightboxIndex.textContent = `${String(activeFrame + 1).padStart(2, "0")} / ${frameNodes.length}`;
  }

  frameNodes.forEach((frame, index) => frame.addEventListener("click", () => {
    renderLightbox(index);
    if (typeof lightbox?.showModal === "function") lightbox.showModal();
  }));
  lightbox?.querySelector("[data-hz-lightbox-close]")?.addEventListener("click", () => lightbox.close());
  lightbox?.querySelector("[data-hz-lightbox-prev]")?.addEventListener("click", () => renderLightbox(activeFrame - 1));
  lightbox?.querySelector("[data-hz-lightbox-next]")?.addEventListener("click", () => renderLightbox(activeFrame + 1));
  lightbox?.addEventListener("click", (event) => { if (event.target === lightbox) lightbox.close(); });
  lightbox?.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") renderLightbox(activeFrame - 1);
    if (event.key === "ArrowRight") renderLightbox(activeFrame + 1);
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
