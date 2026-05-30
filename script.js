(function () {
  const root = document.documentElement;
  const progress = document.querySelector("#scroll-progress");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let ticking = false;

  function updateScrollState() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    if (progress) {
      progress.style.width = `${pct}%`;
    }
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollState);
        ticking = true;
      }
    },
    { passive: true }
  );
  updateScrollState();

  const revealItems = document.querySelectorAll("[data-reveal]");
  if (revealItems.length && !reduceMotion) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -40px" }
    );
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  const hero = document.querySelector("[data-hero]");
  const heroImage = document.querySelector("[data-hero-image]");
  const heroButtons = document.querySelectorAll("[data-hero-src]");

  if (hero && heroImage && !reduceMotion) {
    hero.addEventListener("pointermove", (event) => {
      const rect = hero.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 14;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 10;
      root.style.setProperty("--hero-x", `${x}px`);
      root.style.setProperty("--hero-y", `${y}px`);
    });

    hero.addEventListener("pointerleave", () => {
      root.style.setProperty("--hero-x", "0px");
      root.style.setProperty("--hero-y", "0px");
    });
  }

  heroButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (!heroImage || button.getAttribute("aria-pressed") === "true") return;
      const nextSrc = button.dataset.heroSrc;
      const nextAlt = button.dataset.heroAlt || "";
      heroButtons.forEach((item) => item.setAttribute("aria-pressed", "false"));
      button.setAttribute("aria-pressed", "true");
      heroImage.classList.add("is-switching");
      window.setTimeout(() => {
        heroImage.src = nextSrc;
        heroImage.alt = nextAlt;
        heroImage.classList.remove("is-switching");
      }, 180);
    });
  });

  const filterButtons = document.querySelectorAll("[data-filter]");
  const photoCards = document.querySelectorAll("[data-category]");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      filterButtons.forEach((item) => item.setAttribute("aria-pressed", "false"));
      button.setAttribute("aria-pressed", "true");
      photoCards.forEach((card) => {
        const categories = (card.dataset.category || "").split(" ");
        const show = filter === "all" || categories.includes(filter);
        card.classList.toggle("is-hidden", !show);
      });
    });
  });

  const lightbox = document.querySelector("[data-lightbox]");
  if (lightbox) {
    const lightboxImage = lightbox.querySelector("[data-lightbox-image]");
    const lightboxTitle = lightbox.querySelector("[data-lightbox-title]");
    const lightboxCaption = lightbox.querySelector("[data-lightbox-caption]");
    const closeButton = lightbox.querySelector("[data-lightbox-close]");

    document.querySelectorAll("[data-lightbox-trigger]").forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const image = trigger.querySelector("img");
        if (!image || !lightboxImage) return;
        lightboxImage.src = trigger.dataset.full || image.currentSrc || image.src;
        lightboxImage.alt = image.alt;
        if (lightboxTitle) {
          lightboxTitle.textContent = trigger.dataset.title || "";
        }
        if (lightboxCaption) {
          lightboxCaption.textContent = trigger.dataset.caption || "";
        }
        if (typeof lightbox.showModal === "function") {
          lightbox.showModal();
          document.body.classList.add("lightbox-open");
        }
      });
    });

    function closeLightbox() {
      if (lightbox.open) {
        lightbox.close();
      }
      document.body.classList.remove("lightbox-open");
      if (lightboxImage) {
        lightboxImage.removeAttribute("src");
      }
    }

    closeButton?.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });
    lightbox.addEventListener("close", () => document.body.classList.remove("lightbox-open"));
  }

  document.querySelectorAll("img").forEach((image) => {
    image.setAttribute("draggable", "false");
  });

  ["contextmenu", "selectstart", "dragstart", "gesturestart"].forEach((eventName) => {
    document.addEventListener(eventName, (event) => event.preventDefault(), {
      capture: true,
      passive: false,
    });
  });

  document.querySelectorAll("[data-filmstrip]").forEach((strip) => {
    let isDown = false;
    let startX = 0;
    let startScroll = 0;

    strip.addEventListener("pointerdown", (event) => {
      isDown = true;
      strip.classList.add("is-dragging");
      startX = event.clientX;
      startScroll = strip.scrollLeft;
      strip.setPointerCapture(event.pointerId);
    });

    strip.addEventListener("pointermove", (event) => {
      if (!isDown) return;
      const walk = event.clientX - startX;
      strip.scrollLeft = startScroll - walk;
    });

    function release(event) {
      if (!isDown) return;
      isDown = false;
      strip.classList.remove("is-dragging");
      if (event.pointerId && strip.hasPointerCapture(event.pointerId)) {
        strip.releasePointerCapture(event.pointerId);
      }
    }

    strip.addEventListener("pointerup", release);
    strip.addEventListener("pointercancel", release);
    strip.addEventListener("pointerleave", release);
  });
})();
