(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const body = document.body;
  const siteNav = document.querySelector(".shanghai-site-nav");
  const hero = document.querySelector(".shanghai-hero");
  const heroVideo = document.querySelector("[data-shanghai-hero-video]");
  const portraitMedia = window.matchMedia("(orientation: portrait)");
  const videoToggle = document.querySelector("[data-shanghai-video-toggle]");
  const storyNav = document.querySelector("[data-shanghai-story-nav]");
  const storyLinks = [...document.querySelectorAll("[data-shanghai-section-link]")];
  const storySections = storyLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);
  const storyProgress = document.querySelector("[data-shanghai-story-progress]");
  let pausedByUser = reducedMotion;
  let heroVisible = true;
  let ticking = false;
  let sectionMetrics = [];
  let heroThreshold = 1;
  let activeHref = "";

  function syncHeroPoster() {
    if (!heroVideo) return;
    const poster = portraitMedia.matches
      ? heroVideo.dataset.posterPortrait
      : heroVideo.dataset.posterLandscape;
    if (poster && heroVideo.getAttribute("poster") !== poster) {
      heroVideo.setAttribute("poster", poster);
    }
  }

  function updateVideoButton() {
    if (!videoToggle) return;
    const paused = !heroVideo || heroVideo.paused;
    videoToggle.textContent = paused ? "PLAY" : "PAUSE";
    videoToggle.setAttribute("aria-label", paused ? "Play Shanghai hero video" : "Pause Shanghai hero video");
    videoToggle.setAttribute("aria-pressed", String(paused));
  }

  async function syncHeroVideo() {
    if (!heroVideo) return;
    if (pausedByUser || !heroVisible || document.hidden) {
      heroVideo.pause();
      updateVideoButton();
      return;
    }
    try {
      heroVideo.muted = true;
      await heroVideo.play();
    } catch {}
    updateVideoButton();
  }

  videoToggle?.addEventListener("click", () => {
    pausedByUser = !pausedByUser;
    syncHeroVideo();
  });

  if ("IntersectionObserver" in window && heroVideo) {
    const videoObserver = new IntersectionObserver(([entry]) => {
      heroVisible = entry.isIntersecting;
      syncHeroVideo();
    }, { threshold: .08 });
    videoObserver.observe(hero);
  }

  document.addEventListener("visibilitychange", syncHeroVideo);
  portraitMedia.addEventListener?.("change", syncHeroPoster);
  syncHeroPoster();
  if (reducedMotion) heroVideo?.pause();
  updateVideoButton();

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
    storyLinks.forEach((link) => {
      const active = link.getAttribute("href") === href;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    const activeLink = storyLinks.find((link) => link.getAttribute("href") === href);
    if (activeLink && storyNav && storyNav.scrollWidth > storyNav.clientWidth) {
      const targetLeft = activeLink.offsetLeft - (storyNav.clientWidth - activeLink.offsetWidth) / 2;
      const maxLeft = Math.max(0, storyNav.scrollWidth - storyNav.clientWidth);
      storyNav.scrollTo({
        left: Math.min(maxLeft, Math.max(0, targetLeft)),
        behavior: "auto"
      });
    }
  }

  function renderScrollState() {
    ticking = false;
    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    siteNav?.classList.toggle("is-scrolled", scrollY > heroThreshold);
    if (!sectionMetrics.length) return;
    const start = sectionMetrics[0].top;
    const end = sectionMetrics.at(-1).bottom - viewportHeight;
    const progress = Math.min(1, Math.max(0, (scrollY - start) / Math.max(1, end - start)));
    if (storyProgress) storyProgress.style.transform = `scaleX(${progress})`;
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

  storyLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
      history.replaceState(null, "", link.getAttribute("href"));
    });
  });

  const revealItems = [
    ...document.querySelectorAll(".shanghai-section-head > *, .shanghai-section > div, .shanghai-section > .shanghai-photo, .shanghai-closing > *")
  ];

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

  window.addEventListener("scroll", requestScrollRender, { passive: true });
  window.addEventListener("resize", () => {
    measure();
    requestScrollRender();
  }, { passive: true });
  window.addEventListener("load", () => {
    measure();
    renderScrollState();
    syncHeroVideo();
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
