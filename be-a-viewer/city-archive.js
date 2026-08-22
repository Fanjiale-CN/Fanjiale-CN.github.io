(() => {
  const archiveRoots = [...document.querySelectorAll("[data-city-archive]")];
  const archiveReels = [...document.querySelectorAll("[data-city-archive-reel]")];
  if (!archiveRoots.length && !archiveReels.length) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const postcardByCity = {
    xiamen: "xiamen-arrival-lines",
    xian: "xian-wall-as-horizon",
    beijing: "beijing-measured-courtyard",
    shanghai: "shanghai-river-in-fog"
  };

  archiveRoots.forEach((root) => {
    const city = root.dataset.city;
    const postcardId = postcardByCity[city];
    const header = root.querySelector(".city-archive-header");
    if (postcardId && header && !header.querySelector(".city-archive-postcard-link")) {
      const postcardLink = document.createElement("a");
      postcardLink.className = "city-archive-postcard-link";
      postcardLink.href = `/postcards/?card=${postcardId}`;
      postcardLink.innerHTML = "<span>Make a postcard</span><b>↗</b>";
      header.appendChild(postcardLink);
    }

    const dialog = root.querySelector("[data-archive-lightbox]");
    if (!dialog) return;

    const items = [...root.querySelectorAll("[data-archive-item]")];
    const image = dialog.querySelector("[data-archive-image]");
    const caption = dialog.querySelector("[data-archive-caption]");
    const count = dialog.querySelector("[data-archive-count]");
    const close = dialog.querySelector("[data-archive-close]");
    const previous = dialog.querySelector("[data-archive-previous]");
    const next = dialog.querySelector("[data-archive-next]");
    const figure = dialog.querySelector("figure");
    let activeIndex = 0;
    let returnFocus = null;
    let pointerStart = null;

    function syncImage(index) {
      if (!items.length || !image) return;
      activeIndex = (index + items.length) % items.length;
      const item = items[activeIndex];
      const source = item.dataset.archiveSrc || item.querySelector("img")?.currentSrc || item.querySelector("img")?.src;
      const alt = item.dataset.archiveAlt || item.querySelector("img")?.alt || "";
      const label = item.dataset.archiveCaption || item.querySelector("img")?.alt || "City visual archive image";
      if (source) image.src = source;
      image.alt = alt;
      if (caption) caption.textContent = label;
      if (count) count.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(items.length).padStart(2, "0")}`;
    }

    function openArchive(index, trigger) {
      returnFocus = trigger;
      syncImage(index);
      if (typeof dialog.showModal === "function") {
        dialog.showModal();
      } else {
        dialog.setAttribute("open", "");
        document.documentElement.classList.add("city-archive-modal-open");
      }
      close?.focus({ preventScroll: true });
    }

    function closeArchive() {
      if (typeof dialog.close === "function" && dialog.open) dialog.close();
      else {
        dialog.removeAttribute("open");
        document.documentElement.classList.remove("city-archive-modal-open");
        returnFocus?.focus({ preventScroll: true });
        returnFocus = null;
      }
    }

    items.forEach((item, index) => {
      item.addEventListener("click", () => openArchive(index, item));
    });

    close?.addEventListener("click", closeArchive);
    previous?.addEventListener("click", () => syncImage(activeIndex - 1));
    next?.addEventListener("click", () => syncImage(activeIndex + 1));

    dialog.addEventListener("close", () => {
      document.documentElement.classList.remove("city-archive-modal-open");
      returnFocus?.focus({ preventScroll: true });
      returnFocus = null;
    });

    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) closeArchive();
    });

    dialog.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") syncImage(activeIndex - 1);
      if (event.key === "ArrowRight") syncImage(activeIndex + 1);
      if (event.key === "Escape" && !dialog.close) closeArchive();
    });

    figure?.addEventListener("pointerdown", (event) => {
      if (event.isPrimary) pointerStart = event.clientX;
    }, { passive: true });

    figure?.addEventListener("pointerup", (event) => {
      if (!event.isPrimary || pointerStart === null) return;
      const distance = event.clientX - pointerStart;
      pointerStart = null;
      if (Math.abs(distance) < 55) return;
      syncImage(activeIndex + (distance < 0 ? 1 : -1));
    }, { passive: true });

    if (reduceMotion) root.classList.add("is-reduced-motion");
  });

  archiveReels.forEach((reel) => {
    const scenes = [...reel.querySelectorAll("[data-archive-reel-scene]")];
    const controls = [...reel.querySelectorAll("[data-archive-reel-control]")];
    if (!scenes.length) return;

    let activeIndex = Math.max(0, scenes.findIndex((scene) => scene.classList.contains("is-active")));
    let cycleTimer = null;
    let inView = false;

    function setScene(index) {
      activeIndex = (index + scenes.length) % scenes.length;
      scenes.forEach((scene, sceneIndex) => {
        const isActive = sceneIndex === activeIndex;
        scene.classList.toggle("is-active", isActive);
        scene.setAttribute("aria-hidden", String(!isActive));
        scene.tabIndex = -1;
        scene.querySelectorAll("a").forEach((link) => {
          link.tabIndex = isActive ? 0 : -1;
        });
      });
      controls.forEach((control, controlIndex) => {
        const isActive = controlIndex === activeIndex;
        control.setAttribute("aria-current", String(isActive));
        control.setAttribute("aria-selected", String(isActive));
        control.tabIndex = isActive ? 0 : -1;
      });
    }

    function stopCycle() {
      if (cycleTimer !== null) window.clearInterval(cycleTimer);
      cycleTimer = null;
    }

    function startCycle() {
      if (reduceMotion || !inView || document.hidden || cycleTimer !== null) return;
      cycleTimer = window.setInterval(() => setScene(activeIndex + 1), 6200);
    }

    controls.forEach((control, controlIndex) => {
      control.addEventListener("click", () => {
        stopCycle();
        setScene(controlIndex);
        startCycle();
      });
      control.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        const direction = event.key === "ArrowRight" ? 1 : -1;
        const nextIndex = (controlIndex + direction + controls.length) % controls.length;
        stopCycle();
        setScene(nextIndex);
        controls[nextIndex].focus();
        startCycle();
      });
    });

    reel.addEventListener("pointerenter", stopCycle);
    reel.addEventListener("pointerleave", startCycle);
    reel.addEventListener("focusin", stopCycle);
    reel.addEventListener("focusout", (event) => {
      if (!reel.contains(event.relatedTarget)) startCycle();
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopCycle();
      else startCycle();
    });

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        inView = entries.some((entry) => entry.isIntersecting);
        if (inView) startCycle();
        else stopCycle();
      }, { threshold: .25 });
      observer.observe(reel);
    } else {
      inView = true;
      startCycle();
    }

    setScene(activeIndex);
  });
})();
