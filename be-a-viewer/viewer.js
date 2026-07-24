(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hero = document.querySelector("[data-viewer-hero]");

  if (hero) {
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

    async function playActive() {
      const video = videos[activeIndex];
      if (!video || pausedByUser || !heroVisible) return;
      try {
        await video.play();
      } catch {
        pausedByUser = true;
        toggle.textContent = "PLAY";
        toggle.setAttribute("aria-pressed", "true");
      }
      if (!progressFrame) progressFrame = requestAnimationFrame(updateProgress);
    }

    function showSlide(index, autoplay = true) {
      activeIndex = (index + slides.length) % slides.length;
      pauseAll();
      slides.forEach((slide, slideIndex) => slide.classList.toggle("is-active", slideIndex === activeIndex));
      dots.forEach((dot, dotIndex) => {
        const selected = dotIndex === activeIndex;
        dot.classList.toggle("is-active", selected);
        dot.setAttribute("aria-pressed", String(selected));
      });
      syncCopy(slides[activeIndex]);
      if (progress) progress.style.transform = "scaleX(0)";
      if (autoplay) playActive();
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
      toggle.textContent = pausedByUser ? "PLAY" : "PAUSE";
      toggle.setAttribute("aria-pressed", String(pausedByUser));
      if (pausedByUser) pauseAll();
      else playActive();
    });

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(([entry]) => {
        heroVisible = entry.isIntersecting;
        if (heroVisible) playActive();
        else pauseAll();
      }, { threshold: 0.05 });
      observer.observe(hero);
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) pauseAll();
      else playActive();
    });

    showSlide(0, !reducedMotion);
    if (reducedMotion) pauseAll();
  }

  const cityData = {
    beijing: { index: "01 / NORTH CHINA", name: "BEIJING", description: "Power, ceremony and everyday movement.", status: "COMING SOON" },
    shanghai: { index: "02 / EAST CHINA", name: "SHANGHAI", description: "Ambition reflected in glass and water.", status: "COMING SOON" },
    xian: { index: "03 / NORTHWEST CHINA", name: "XI’AN", description: "Empire, memory and life inside the wall.", status: "AVAILABLE · ENTER THE STORY ↗" },
    dali: { index: "04 / SOUTHWEST CHINA", name: "DALI", description: "Mountains, water and a slower rhythm.", status: "COMING SOON" },
    shenzhen: { index: "05 / SOUTH CHINA", name: "SHENZHEN", description: "A city built at the speed of possibility.", status: "COMING SOON" },
    xiamen: { index: "06 / SOUTHEAST CHINA", name: "XIAMEN", description: "A coastal city read through light and edges.", status: "COMING SOON" },
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
