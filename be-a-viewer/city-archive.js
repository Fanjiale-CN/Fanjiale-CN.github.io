(() => {
  const archiveRoots = [...document.querySelectorAll("[data-city-archive]")];
  if (!archiveRoots.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  archiveRoots.forEach((root) => {
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
})();
