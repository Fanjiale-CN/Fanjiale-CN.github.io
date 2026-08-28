import { GALOK_CITIES, normalizeCitySlug } from "./cities.config.js?v=batch4-content-20260824";

const announceCity = (value) => {
  const city = normalizeCitySlug(value);
  if (city) window.dispatchEvent(new CustomEvent("galok:citychange", { detail: { city } }));
};

(() => {
  const mountChongqingEntry = () => {
    if (!GALOK_CITIES.chongqing) return;
    const heroStage = document.querySelector("[data-viewer-hero-stage]");
    const dotGroup = document.querySelector(".viewer-hero-dots");
    if (heroStage && !heroStage.querySelector('[data-city="CHONGQING"]')) {
      const slide = document.createElement("figure");
      slide.className = "viewer-hero-slide";
      slide.dataset.viewerSlide = "";
      slide.dataset.city = "CHONGQING";
      slide.dataset.kicker = "Ground level undefined";
      slide.dataset.copy = "Two rivers set the baseline. Streets, rail and buildings keep climbing above it.";
      slide.dataset.place = "YUZHONG PENINSULA";
      slide.dataset.coordinate = "29.5630° N";
      slide.dataset.number = "07";
      slide.dataset.region = "SOUTHWEST";
      slide.dataset.subject = "VERTICAL";
      slide.innerHTML = `<video data-viewer-video muted playsinline preload="none" poster="https://images.pexels.com/photos/29775115/pexels-photo-29775115.jpeg?auto=compress&cs=tinysrgb&w=1600" data-src="https://www.pexels.com/download/video/34315145/" data-mobile-src="https://www.pexels.com/download/video/34315145/"></video>`;
      heroStage.appendChild(slide);
    }
    if (dotGroup && !dotGroup.querySelector('[aria-label="Show Chongqing"]')) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.dataset.viewerDot = "6";
      dot.setAttribute("aria-label", "Show Chongqing");
      dot.setAttribute("aria-pressed", "false");
      dot.textContent = "07";
      dotGroup.appendChild(dot);
    }

    const selector = document.querySelector("[data-city-selector]");
    const list = selector?.querySelector(".city-selector-list");
    const visual = selector?.querySelector(".city-selector-visual");
    if (list && !list.querySelector('[data-city-choice="chongqing"]')) {
      const link = document.createElement("a");
      link.href = "/be-a-viewer/chongqing/";
      link.dataset.cityChoice = "chongqing";
      link.dataset.status = "available";
      link.innerHTML = `<span>07</span><strong>CHONGQING</strong><small>AVAILABLE</small>`;
      list.appendChild(link);
    }
    if (visual && !visual.querySelector('[data-city-visual="chongqing"]')) {
      const figure = document.createElement("figure");
      figure.dataset.cityVisual = "chongqing";
      figure.innerHTML = `<img src="https://images.pexels.com/photos/29775115/pexels-photo-29775115.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="" width="1600" height="1067" loading="lazy">`;
      const caption = visual.querySelector(".city-selector-caption");
      visual.insertBefore(figure, caption || null);
    }
  };

  mountChongqingEntry();

  const reducedMotionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobileMedia = window.matchMedia("(max-width: 760px)");
  let reducedMotion = reducedMotionMedia.matches;
  const hero = document.querySelector("[data-viewer-hero]");

  if (hero) {
    const stage = hero.querySelector("[data-viewer-hero-stage]");
    const slides = [...hero.querySelectorAll("[data-viewer-slide]")];
    const videos = slides.map((slide) => slide.querySelector("[data-viewer-video]"));
    const dots = [...hero.querySelectorAll("[data-viewer-dot]")];
    const progress = hero.querySelector("[data-viewer-progress]");
    const toggle = hero.querySelector("[data-viewer-toggle]");
    const fields = {
      city: hero.querySelector("[data-viewer-city]"),
      kicker: hero.querySelector("[data-viewer-kicker]"),
      copy: hero.querySelector("[data-viewer-copy]"),
      place: hero.querySelector("[data-viewer-place]"),
      coordinate: hero.querySelector("[data-viewer-coordinate]"),
      number: hero.querySelector("[data-viewer-number]"),
      region: hero.querySelector("[data-viewer-region]"),
      subject: hero.querySelector("[data-viewer-subject]")
    };
    let activeIndex = 0;
    let pausedByUser = false;
    let heroVisible = true;
    let progressFrame = 0;
    let copyTimer = 0;
    let fallbackTimer = 0;
    let swipeStartX = null;

    const pauseAll = () => videos.forEach((video) => video?.pause());

    function preferredSource(video) {
      if (!video) return "";
      return mobileMedia.matches && video.dataset.mobileSrc
        ? video.dataset.mobileSrc
        : video.dataset.src || "";
    }

    function ensureSource(video) {
      const source = preferredSource(video);
      if (!video || !source || video.dataset.loadedSrc === source) return Boolean(source);
      video.src = source;
      video.dataset.loadedSrc = source;
      video.preload = "metadata";
      video.load();
      return true;
    }

    function syncCopy(slide) {
      Object.entries(fields).forEach(([key, node]) => {
        if (node && slide.dataset[key] !== undefined) node.textContent = slide.dataset[key];
      });
    }

    function updateProgress() {
      progressFrame = 0;
      const video = videos[activeIndex];
      if (!video || !progress) return;
      const amount = video.duration ? video.currentTime / video.duration : 0;
      progress.style.transform = `scaleX(${Math.min(1, Math.max(0, amount))})`;
      if (!video.paused && heroVisible) progressFrame = requestAnimationFrame(updateProgress);
    }

    function updateToggle() {
      if (!toggle) return;
      const video = videos[activeIndex];
      const playing = Boolean(video && !video.paused && !video.ended);
      toggle.textContent = playing ? "PAUSE" : "PLAY";
      toggle.setAttribute("aria-label", playing ? "Pause travel video" : "Play travel video");
      toggle.setAttribute("aria-pressed", String(playing));
    }

    function clearFallback() {
      window.clearTimeout(fallbackTimer);
      fallbackTimer = 0;
    }

    function scheduleFallback() {
      clearFallback();
    }

    async function playActive({ userInitiated = false } = {}) {
      const video = videos[activeIndex];
      pauseAll();
      clearFallback();
      if (!video || pausedByUser || !heroVisible || document.hidden || (reducedMotion && !userInitiated)) {
        updateToggle();
        return;
      }
      if (!ensureSource(video)) {
        updateToggle();
        return;
      }
      try {
        video.muted = true;
        await video.play();
      } catch {}
      updateToggle();
      if (!progressFrame) progressFrame = requestAnimationFrame(updateProgress);
    }

    function showSlide(index, { autoplay = !pausedByUser && !reducedMotion, instant = false } = {}) {
      activeIndex = (index + slides.length) % slides.length;
      pauseAll();
      slides.forEach((slide, slideIndex) => {
        const active = slideIndex === activeIndex;
        slide.classList.toggle("is-active", active);
        const video = videos[slideIndex];
        if (!video) return;
        video.preload = active && video.dataset.loadedSrc ? "metadata" : "none";
        if (!active) {
          try { video.currentTime = 0; } catch {}
        }
      });
      dots.forEach((dot, dotIndex) => {
        const selected = dotIndex === activeIndex;
        dot.classList.toggle("is-active", selected);
        dot.setAttribute("aria-pressed", String(selected));
      });
      announceCity(slides[activeIndex].dataset.city);

      window.clearTimeout(copyTimer);
      if (reducedMotion || instant) {
        syncCopy(slides[activeIndex]);
        hero.classList.remove("is-copy-changing");
      } else {
        hero.classList.add("is-copy-changing");
        copyTimer = window.setTimeout(() => {
          syncCopy(slides[activeIndex]);
          hero.classList.remove("is-copy-changing");
        }, 260);
      }

      try { videos[activeIndex].currentTime = 0; } catch {}
      if (progress) progress.style.transform = "scaleX(0)";
      if (autoplay) {
        requestAnimationFrame(playActive);
      } else {
        updateToggle();
      }
    }

    function togglePlay() {
      const video = videos[activeIndex];
      if (!video) return;
      if (pausedByUser || video.paused) {
        pausedByUser = false;
        playActive({ userInitiated: true });
      } else {
        pausedByUser = true;
        pauseAll();
        updateToggle();
      }
    }

    videos.forEach((video, index) => {
      video?.addEventListener("ended", () => {
        updateToggle();
        if (index === activeIndex && !pausedByUser && !reducedMotion) showSlide(activeIndex + 1);
      });
      video?.addEventListener("loadedmetadata", () => {
        if (index === activeIndex && !progressFrame) progressFrame = requestAnimationFrame(updateProgress);
      });
      ["play", "pause", "error"].forEach((eventName) => video?.addEventListener(eventName, updateToggle));
    });

    dots.forEach((dot, index) => dot.addEventListener("click", () => showSlide(index)));
    hero.querySelector("[data-viewer-prev]")?.addEventListener("click", () => showSlide(activeIndex - 1));
    hero.querySelector("[data-viewer-next]")?.addEventListener("click", () => showSlide(activeIndex + 1));
    toggle?.addEventListener("click", togglePlay);

    stage?.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      swipeStartX = event.clientX;
    }, { passive: true });
    stage?.addEventListener("pointerup", (event) => {
      if (swipeStartX === null) return;
      const distance = event.clientX - swipeStartX;
      swipeStartX = null;
      if (Math.abs(distance) < 52) { togglePlay(); return; }
      showSlide(activeIndex + (distance < 0 ? 1 : -1));
    }, { passive: true });

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(([entry]) => {
        heroVisible = entry.isIntersecting;
        if (!heroVisible) {
          clearFallback();
          pauseAll();
          updateToggle();
        } else if (!pausedByUser) playActive();
      }, { threshold: 0.05 });
      observer.observe(hero);
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) pauseAll();
      else if (!pausedByUser) playActive();
      updateToggle();
    });

    reducedMotionMedia.addEventListener?.("change", (event) => {
      reducedMotion = event.matches;
      if (reducedMotion) {
        pauseAll();
      } else if (!pausedByUser) {
        playActive();
      }
      updateToggle();
    });

    showSlide(0, { autoplay: !reducedMotion, instant: true });
  }

  const cityData = GALOK_CITIES;

  const selector = document.querySelector("[data-city-selector]");
  if (selector) {
    const desktopChoices = [...selector.querySelectorAll("[data-city-choice]")];
    const visuals = [...selector.querySelectorAll("[data-city-visual]")];
    const fields = {
      index: selector.querySelector("[data-city-index]"),
      name: selector.querySelector("[data-city-name]"),
      description: selector.querySelector("[data-city-description]"),
      status: selector.querySelector("[data-city-status]")
    };
    const feedback = selector.querySelector("[data-city-feedback]");
    let feedbackTimer = 0;

    function setPreview(city) {
      const data = cityData[city];
      if (!data) return;
      announceCity(city);
      desktopChoices.forEach((choice) => choice.classList.toggle("is-active", choice.dataset.cityChoice === city));
      visuals.forEach((visual) => visual.classList.toggle("is-active", visual.dataset.cityVisual === city));
      Object.entries(fields).forEach(([key, node]) => {
        if (node) node.textContent = data[key];
      });
      if (fields.status) {
        if (data.href) {
          fields.status.setAttribute("href", data.href);
          fields.status.removeAttribute("aria-disabled");
          fields.status.removeAttribute("tabindex");
        } else {
          fields.status.removeAttribute("href");
          fields.status.setAttribute("aria-disabled", "true");
          fields.status.setAttribute("tabindex", "-1");
        }
      }
    }

    function showComingSoon(city) {
      const data = cityData[city];
      if (!feedback || !data) return;
      clearTimeout(feedbackTimer);
      feedback.querySelector("[data-city-feedback-index]").textContent = data.index;
      feedback.querySelector("[data-city-feedback-name]").textContent = data.name;
      feedback.querySelector("[data-city-feedback-copy]").textContent = `${data.description} The full city story is coming soon.`;
      feedback.hidden = false;
      feedback.classList.remove("is-visible");
      requestAnimationFrame(() => feedback.classList.add("is-visible"));
      feedbackTimer = window.setTimeout(() => dismissFeedback(), 5000);
    }

    function dismissFeedback() {
      if (!feedback) return;
      clearTimeout(feedbackTimer);
      if (!feedback.classList.contains("is-visible")) { feedback.hidden = true; return; }
      feedback.classList.remove("is-visible");
      if (!reducedMotion) feedback.classList.add("is-exiting");
      window.setTimeout(() => {
        feedback.classList.remove("is-exiting");
        feedback.hidden = true;
      }, 240);
    }

    desktopChoices.forEach((choice) => {
      const city = choice.dataset.cityChoice;
      choice.addEventListener("pointerenter", () => setPreview(city));
      choice.addEventListener("focus", () => setPreview(city));
      if (choice.dataset.status === "coming") {
        choice.addEventListener("click", (event) => {
          event.preventDefault();
          showComingSoon(city);
        });
      }
    });

    fields.status?.addEventListener("click", (event) => {
      const href = fields.status.getAttribute("href");
      if (!href || fields.status.getAttribute("aria-disabled") === "true") return;
      event.preventDefault();
      window.location.assign(href);
    });

    feedback?.querySelector("[data-city-feedback-close]")?.addEventListener("click", () => dismissFeedback());
  }

  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = new Date().getFullYear();
  });
})();
