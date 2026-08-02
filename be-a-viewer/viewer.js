(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
      const paused = pausedByUser || !video || video.paused;
      toggle.textContent = paused ? "PLAY" : "PAUSE";
      toggle.setAttribute("aria-label", paused ? "Play travel video" : "Pause travel video");
      toggle.setAttribute("aria-pressed", String(paused));
    }

    function clearFallback() {
      window.clearTimeout(fallbackTimer);
      fallbackTimer = 0;
    }

    function scheduleFallback() {
      clearFallback();
      if (pausedByUser || document.hidden || !heroVisible) return;
      fallbackTimer = window.setTimeout(() => showSlide(activeIndex + 1), 6200);
    }

    async function playActive() {
      const video = videos[activeIndex];
      pauseAll();
      clearFallback();
      if (!video || pausedByUser || !heroVisible || document.hidden) {
        updateToggle();
        return;
      }
      try {
        video.muted = true;
        await video.play();
      } catch {
        scheduleFallback();
      }
      updateToggle();
      if (!progressFrame) progressFrame = requestAnimationFrame(updateProgress);
    }

    function showSlide(index, autoplay = true, instant = false) {
      activeIndex = (index + slides.length) % slides.length;
      pauseAll();
      const preloadIndex = (activeIndex + 1) % slides.length;
      slides.forEach((slide, slideIndex) => {
        const active = slideIndex === activeIndex;
        slide.classList.toggle("is-active", active);
        const video = videos[slideIndex];
        if (!video) return;
        video.preload = active || slideIndex === preloadIndex ? "auto" : "metadata";
        if (!active) {
          try { video.currentTime = 0; } catch {}
        }
      });
      dots.forEach((dot, dotIndex) => {
        const selected = dotIndex === activeIndex;
        dot.classList.toggle("is-active", selected);
        dot.setAttribute("aria-pressed", String(selected));
      });

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
      if (autoplay) playActive();
      else updateToggle();
    }

    videos.forEach((video, index) => {
      video?.addEventListener("ended", () => {
        if (!pausedByUser && index === activeIndex) showSlide(activeIndex + 1);
      });
      video?.addEventListener("loadedmetadata", () => {
        if (index === activeIndex && !progressFrame) progressFrame = requestAnimationFrame(updateProgress);
      });
    });

    dots.forEach((dot, index) => dot.addEventListener("click", () => showSlide(index)));
    hero.querySelector("[data-viewer-prev]")?.addEventListener("click", () => showSlide(activeIndex - 1));
    hero.querySelector("[data-viewer-next]")?.addEventListener("click", () => showSlide(activeIndex + 1));
    toggle?.addEventListener("click", () => {
      pausedByUser = !pausedByUser;
      if (pausedByUser) {
        clearFallback();
        pauseAll();
        updateToggle();
      }
      else playActive();
    });

    stage?.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      swipeStartX = event.clientX;
    }, { passive: true });
    stage?.addEventListener("pointerup", (event) => {
      if (swipeStartX === null) return;
      const distance = event.clientX - swipeStartX;
      swipeStartX = null;
      if (Math.abs(distance) < 52) return;
      showSlide(activeIndex + (distance < 0 ? 1 : -1));
    }, { passive: true });

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(([entry]) => {
        heroVisible = entry.isIntersecting;
        if (heroVisible) playActive();
        else {
          clearFallback();
          pauseAll();
          updateToggle();
        }
      }, { threshold: 0.05 });
      observer.observe(hero);
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) pauseAll();
      else playActive();
    });

    showSlide(0, !reducedMotion, true);
    if (reducedMotion) pauseAll();
  }

  const cityData = {
    beijing: { index: "01 / NORTH CHINA", name: "BEIJING", description: "Power, ceremony and everyday movement.", status: "AVAILABLE · ENTER THE STORY ↗", href: "/be-a-viewer/beijing/" },
    shanghai: { index: "02 / EAST CHINA", name: "SHANGHAI", description: "River, streets and a vertical city.", status: "AVAILABLE · ENTER THE STORY ↗", href: "/be-a-viewer/shanghai/" },
    xian: { index: "03 / NORTHWEST CHINA", name: "XI’AN", description: "Empire, memory and life inside the wall.", status: "AVAILABLE · ENTER THE STORY ↗", href: "/be-a-viewer/xian/" },
    dali: { index: "04 / SOUTHWEST CHINA", name: "DALI", description: "Mountains, water and a slower rhythm.", status: "COMING SOON" },
    shenzhen: { index: "05 / SOUTH CHINA", name: "SHENZHEN", description: "A city built at the speed of possibility.", status: "COMING SOON" },
    xiamen: { index: "06 / SOUTHEAST CHINA", name: "XIAMEN", description: "Sea light, Minnan rooflines and a city moving with the tide.", status: "AVAILABLE · ENTER THE STORY ↗", href: "/be-a-viewer/xiamen/" },
    tibet: { index: "07 / WEST CHINA", name: "TIBET", description: "Altitude, belief and a landscape beyond scale.", status: "COMING SOON" }
  };

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
      feedbackTimer = window.setTimeout(() => {
        feedback.classList.remove("is-visible");
        window.setTimeout(() => { feedback.hidden = true; }, 250);
      }, 5000);
    }

    desktopChoices.forEach((choice) => {
      const city = choice.dataset.cityChoice;
      choice.addEventListener("pointerenter", () => setPreview(city));
      choice.addEventListener("focus", () => setPreview(city));
      if (choice.dataset.status === "coming") choice.addEventListener("click", () => showComingSoon(city));
    });

    fields.status?.addEventListener("click", (event) => {
      const href = fields.status.getAttribute("href");
      if (!href || fields.status.getAttribute("aria-disabled") === "true") return;
      event.preventDefault();
      window.location.assign(href);
    });

    selector.querySelectorAll("[data-city-card]").forEach((card) => {
      if (card.tagName === "BUTTON") card.addEventListener("click", () => showComingSoon(card.dataset.cityCard));
    });

    feedback?.querySelector("[data-city-feedback-close]")?.addEventListener("click", () => {
      clearTimeout(feedbackTimer);
      feedback.classList.remove("is-visible");
      window.setTimeout(() => { feedback.hidden = true; }, 250);
    });
  }

  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = new Date().getFullYear();
  });
})();
