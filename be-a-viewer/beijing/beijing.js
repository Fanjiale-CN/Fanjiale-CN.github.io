(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const portraitMedia = window.matchMedia("(orientation: portrait)");
  const hero = document.querySelector("[data-beijing-hero]");
  const heroVideo = document.querySelector("[data-beijing-hero-video]");
  const heroBeats = [...document.querySelectorAll("[data-beijing-hero-beat]")];
  const heroIndex = document.querySelector("[data-beijing-hero-index]");
  const heroProgress = document.querySelector("[data-beijing-hero-progress]");
  const heroToggle = document.querySelector("[data-beijing-video-toggle]");
  let heroPausedByUser = reducedMotion;
  let heroVisible = true;
  let activeHeroBeat = 0;
  let heroFrame = 0;

  function syncHeroPoster() {
    if (!heroVideo) return;
    const poster = portraitMedia.matches
      ? heroVideo.dataset.posterPortrait
      : heroVideo.dataset.posterLandscape;
    if (poster && heroVideo.getAttribute("poster") !== poster) {
      heroVideo.setAttribute("poster", poster);
    }
  }

  function setHeroBeat(index) {
    const next = Math.max(0, Math.min(heroBeats.length - 1, index));
    if (next === activeHeroBeat && heroBeats[next]?.classList.contains("is-active")) return;
    activeHeroBeat = next;
    heroBeats.forEach((beat, beatIndex) => {
      beat.classList.toggle("is-active", beatIndex === activeHeroBeat);
    });
    if (heroIndex) {
      heroIndex.textContent = `${String(activeHeroBeat + 1).padStart(2, "0")} / ${String(heroBeats.length).padStart(2, "0")}`;
    }
  }

  function renderHeroTimeline() {
    if (!heroVideo) return;
    const duration = Number.isFinite(heroVideo.duration) && heroVideo.duration > 0
      ? heroVideo.duration
      : 9.44;
    const progress = Math.max(0, Math.min(1, heroVideo.currentTime / duration));
    if (heroProgress) heroProgress.style.transform = `scaleX(${progress})`;
    setHeroBeat(Math.min(heroBeats.length - 1, Math.floor(progress * heroBeats.length)));
  }

  function runHeroTimeline() {
    cancelAnimationFrame(heroFrame);
    renderHeroTimeline();
    if (heroVideo && !heroVideo.paused && heroVisible && !document.hidden) {
      heroFrame = requestAnimationFrame(runHeroTimeline);
    }
  }

  function updateHeroButton() {
    if (!heroToggle) return;
    const paused = !heroVideo || heroVideo.paused;
    heroToggle.textContent = paused ? "PLAY" : "PAUSE";
    heroToggle.setAttribute("aria-label", paused ? "Play Beijing hero video" : "Pause Beijing hero video");
    heroToggle.setAttribute("aria-pressed", String(paused));
  }

  async function syncHeroVideo() {
    if (!heroVideo) return;
    if (heroPausedByUser || !heroVisible || document.hidden) {
      heroVideo.pause();
      cancelAnimationFrame(heroFrame);
      renderHeroTimeline();
      updateHeroButton();
      return;
    }
    try {
      heroVideo.muted = true;
      await heroVideo.play();
      runHeroTimeline();
    } catch {}
    updateHeroButton();
  }

  heroToggle?.addEventListener("click", () => {
    heroPausedByUser = !heroPausedByUser;
    syncHeroVideo();
  });

  heroVideo?.addEventListener("loadedmetadata", renderHeroTimeline);
  heroVideo?.addEventListener("play", () => {
    updateHeroButton();
    runHeroTimeline();
  });
  heroVideo?.addEventListener("pause", () => {
    updateHeroButton();
    cancelAnimationFrame(heroFrame);
  });
  heroVideo?.addEventListener("ended", renderHeroTimeline);

  if ("IntersectionObserver" in window && hero && heroVideo) {
    const heroObserver = new IntersectionObserver(([entry]) => {
      heroVisible = entry.isIntersecting;
      syncHeroVideo();
    }, { threshold: .06 });
    heroObserver.observe(hero);
  }

  document.addEventListener("visibilitychange", syncHeroVideo);
  portraitMedia.addEventListener?.("change", syncHeroPoster);
  syncHeroPoster();
  setHeroBeat(0);
  updateHeroButton();
  syncHeroVideo();

  const axisExplorer = document.querySelector("[data-axis-explorer]");
  const axisControls = axisExplorer?.querySelector(".beijing-axis-controls");
  const axisTrack = axisExplorer?.querySelector("[data-axis-track]");
  const axisPanels = [...(axisExplorer?.querySelectorAll("[data-axis-panel]") || [])];
  const axisStops = [...(axisExplorer?.querySelectorAll("[data-axis-stop]") || [])];
  let activeAxisIndex = 0;
  let dragPointerId = null;

  function renderAxis(index, position = index / Math.max(1, axisPanels.length - 1)) {
    const nextIndex = Math.max(0, Math.min(axisPanels.length - 1, index));
    const nextPosition = Math.max(0, Math.min(1, position));
    activeAxisIndex = nextIndex;
    axisControls?.style.setProperty("--axis-position", `${nextPosition * 100}%`);
    axisPanels.forEach((panel, panelIndex) => {
      const active = panelIndex === activeAxisIndex;
      panel.classList.toggle("is-active", active);
      panel.setAttribute("aria-hidden", String(!active));
    });
    axisStops.forEach((stop, stopIndex) => {
      const active = stopIndex === activeAxisIndex;
      stop.classList.toggle("is-active", active);
      stop.setAttribute("aria-selected", String(active));
    });
    if (axisTrack) {
      axisTrack.setAttribute("aria-valuenow", String(activeAxisIndex));
      axisTrack.setAttribute("aria-valuetext", axisStops[activeAxisIndex]?.textContent.trim() || "");
    }
  }

  function setAxis(index, { focus = false } = {}) {
    const nextIndex = Math.max(0, Math.min(axisPanels.length - 1, index));
    renderAxis(nextIndex);
    if (focus) axisStops[nextIndex]?.focus();
  }

  function axisPositionFromPointer(clientX) {
    if (!axisTrack) return 0;
    const bounds = axisTrack.getBoundingClientRect();
    if (!bounds.width) return 0;
    return Math.max(0, Math.min(1, (clientX - bounds.left) / bounds.width));
  }

  function updateAxisFromPointer(clientX) {
    const position = axisPositionFromPointer(clientX);
    const index = Math.round(position * Math.max(1, axisPanels.length - 1));
    renderAxis(index, position);
  }

  axisTrack?.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 && event.pointerType !== "touch") return;
    dragPointerId = event.pointerId;
    axisControls?.classList.add("is-dragging");
    axisTrack.setPointerCapture(event.pointerId);
    updateAxisFromPointer(event.clientX);
  });

  axisTrack?.addEventListener("pointermove", (event) => {
    if (event.pointerId !== dragPointerId) return;
    updateAxisFromPointer(event.clientX);
  });

  function finishAxisDrag(event) {
    if (event.pointerId !== dragPointerId) return;
    dragPointerId = null;
    axisControls?.classList.remove("is-dragging");
    setAxis(activeAxisIndex);
  }

  axisTrack?.addEventListener("pointerup", finishAxisDrag);
  axisTrack?.addEventListener("pointercancel", finishAxisDrag);

  axisTrack?.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      setAxis(activeAxisIndex + 1);
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      setAxis(activeAxisIndex - 1);
    }
    if (event.key === "Home") {
      event.preventDefault();
      setAxis(0);
    }
    if (event.key === "End") {
      event.preventDefault();
      setAxis(axisPanels.length - 1);
    }
  });

  axisStops.forEach((stop, index) => {
    stop.addEventListener("click", () => setAxis(index));
    stop.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        setAxis((index + 1) % axisStops.length, { focus: true });
      }
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        setAxis((index - 1 + axisStops.length) % axisStops.length, { focus: true });
      }
      if (event.key === "Home") {
        event.preventDefault();
        setAxis(0, { focus: true });
      }
      if (event.key === "End") {
        event.preventDefault();
        setAxis(axisStops.length - 1, { focus: true });
      }
    });
  });
  renderAxis(0);

  const typewriter = document.querySelector("[data-beijing-typewriter]");
  let typewriterStarted = false;

  function writeTitle() {
    if (!typewriter || typewriterStarted) return;
    typewriterStarted = true;
    const title = typewriter.dataset.beijingTypewriter || "";
    if (reducedMotion) {
      typewriter.textContent = title;
      return;
    }
    let index = 0;
    function writeNext() {
      typewriter.textContent = title.slice(0, index);
      if (index >= title.length) return;
      const character = title[index];
      index += 1;
      const delay = character === " " ? 38 : character === "." ? 180 : 58 + (index % 3) * 14;
      window.setTimeout(writeNext, delay);
    }
    window.setTimeout(writeNext, 180);
  }

  if ("IntersectionObserver" in window && typewriter) {
    const typeObserver = new IntersectionObserver(([entry], observer) => {
      if (!entry.isIntersecting) return;
      writeTitle();
      observer.disconnect();
    }, { threshold: .38 });
    typeObserver.observe(typewriter);
  } else {
    writeTitle();
  }

  const frameCity = document.querySelector("[data-frame-city]");
  if (frameCity) {
    const launch = frameCity.querySelector("[data-frame-launch]");
    const launchLabel = frameCity.querySelector("[data-frame-launch-label]");
    const camera = frameCity.querySelector("[data-frame-app]");
    const stage = frameCity.querySelector("[data-frame-stage]");
    const source = frameCity.querySelector("[data-frame-source]");
    const viewfinder = frameCity.querySelector("[data-frame-window]");
    const frameCopy = frameCity.querySelector("[data-frame-copy]");
    const ratioLabel = frameCity.querySelector("[data-frame-ratio-label]");
    const hint = frameCity.querySelector("[data-frame-hint]");
    const flash = frameCity.querySelector("[data-frame-flash]");
    const status = frameCity.querySelector("[data-frame-status]");
    const aspectButtons = [...frameCity.querySelectorAll("[data-frame-aspect]")];
    const positionButtons = [...frameCity.querySelectorAll("[data-frame-position]")];
    const sceneButtons = [...frameCity.querySelectorAll("[data-frame-scene]")];
    const cityInput = frameCity.querySelector("[data-frame-city-input]");
    const dateInput = frameCity.querySelector("[data-frame-date-input]");
    const coordinatesInput = frameCity.querySelector("[data-frame-coordinates-input]");
    const cityPreview = frameCity.querySelector("[data-frame-city-preview]");
    const datePreview = frameCity.querySelector("[data-frame-date-preview]");
    const coordinatesPreview = frameCity.querySelector("[data-frame-coordinates-preview]");
    const generate = frameCity.querySelector("[data-frame-generate]");
    const dialog = frameCity.querySelector("[data-frame-dialog]");
    const dialogClose = frameCity.querySelector("[data-frame-dialog-close]");
    const output = frameCity.querySelector("[data-frame-output]");
    const download = frameCity.querySelector("[data-frame-download]");
    const aspects = {
      landscape: { ratio: 8 / 5, label: "LANDSCAPE 8:5", width: 1600, height: 1000 },
      square: { ratio: 1, label: "SQUARE 1:1", width: 1200, height: 1200 },
      portrait: { ratio: 4 / 5, label: "PORTRAIT 4:5", width: 1000, height: 1250 }
    };
    const frameState = {
      aspect: "landscape",
      position: "bottom-left",
      x: .5,
      y: .5,
      pointerId: null,
      grabX: 0,
      grabY: 0,
      box: { left: 0, top: 0, width: 0, height: 0 }
    };

    function setFrameStatus(message) {
      if (status) status.textContent = message;
    }

    function formatDate(value) {
      if (!value) return "";
      const date = new Date(`${value}T12:00:00`);
      if (Number.isNaN(date.getTime())) return value.toUpperCase();
      return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }).format(date).toUpperCase();
    }

    function setDefaultDate() {
      if (!dateInput || dateInput.value) return;
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      dateInput.value = `${year}-${month}-${day}`;
    }

    function syncFrameCopy() {
      if (cityPreview) cityPreview.textContent = cityInput?.value.trim() || "BEIJING";
      if (datePreview) datePreview.textContent = formatDate(dateInput?.value);
      if (coordinatesPreview) coordinatesPreview.textContent = coordinatesInput?.value.trim() || "";
    }

    function measureFrame() {
      if (!stage || !viewfinder || camera?.hidden) return null;
      const bounds = stage.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return null;
      const config = aspects[frameState.aspect];
      const maxWidth = bounds.width * (bounds.width < 560 ? .82 : .72);
      const maxHeight = bounds.height * (bounds.width < 560 ? .72 : .7);
      let width = maxWidth;
      let height = width / config.ratio;
      if (height > maxHeight) {
        height = maxHeight;
        width = height * config.ratio;
      }
      const travelX = Math.max(0, bounds.width - width);
      const travelY = Math.max(0, bounds.height - height);
      const left = travelX * frameState.x;
      const top = travelY * frameState.y;
      const sizeChanged = Math.abs(frameState.box.width - width) > .5
        || Math.abs(frameState.box.height - height) > .5;
      frameState.box = { left, top, width, height };
      if (sizeChanged) {
        viewfinder.style.width = `${width}px`;
        viewfinder.style.height = `${height}px`;
      }
      viewfinder.style.transform = `translate3d(${left}px, ${top}px, 0)`;
      return { bounds, travelX, travelY };
    }

    function setPressed(buttons, activeButton) {
      buttons.forEach((button) => {
        const active = button === activeButton;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
    }

    function setAspect(aspect, button) {
      if (!aspects[aspect]) return;
      frameState.aspect = aspect;
      if (ratioLabel) ratioLabel.textContent = aspects[aspect].label;
      setPressed(aspectButtons, button);
      measureFrame();
      setFrameStatus(`${aspects[aspect].label.toLowerCase()} frame selected.`);
    }

    function setTextPosition(position, button) {
      frameState.position = position;
      if (frameCopy) {
        frameCopy.className = `beijing-viewfinder-copy is-${position}`;
      }
      setPressed(positionButtons, button);
      setFrameStatus(`Text moved to ${position.replace("-", " ")}.`);
    }

    function fireCameraFlash() {
      if (!flash || reducedMotion) return;
      flash.classList.remove("is-firing");
      void flash.offsetWidth;
      flash.classList.add("is-firing");
    }

    function openCamera() {
      if (!camera || !launch) return;
      camera.hidden = false;
      camera.classList.remove("is-opening");
      void camera.offsetWidth;
      camera.classList.add("is-opening");
      launch.setAttribute("aria-expanded", "true");
      if (launchLabel) launchLabel.textContent = "CLOSE VIRTUAL CAMERA";
      window.requestAnimationFrame(() => {
        measureFrame();
        viewfinder?.focus({ preventScroll: true });
      });
      setFrameStatus("Camera open. Drag the frame to compose.");
    }

    function closeCamera() {
      if (!camera || !launch) return;
      camera.hidden = true;
      launch.setAttribute("aria-expanded", "false");
      if (launchLabel) launchLabel.textContent = "OPEN VIRTUAL CAMERA";
      launch.focus({ preventScroll: true });
    }

    launch?.addEventListener("click", () => {
      if (camera?.hidden) openCamera();
      else closeCamera();
    });

    aspectButtons.forEach((button) => {
      button.addEventListener("click", () => setAspect(button.dataset.frameAspect, button));
    });

    positionButtons.forEach((button) => {
      button.addEventListener("click", () => setTextPosition(button.dataset.framePosition, button));
    });

    function updateFrameFromPointer(clientX, clientY) {
      if (!stage) return;
      const bounds = stage.getBoundingClientRect();
      const travelX = Math.max(0, bounds.width - frameState.box.width);
      const travelY = Math.max(0, bounds.height - frameState.box.height);
      const left = Math.max(0, Math.min(travelX, clientX - bounds.left - frameState.grabX));
      const top = Math.max(0, Math.min(travelY, clientY - bounds.top - frameState.grabY));
      frameState.x = travelX ? left / travelX : .5;
      frameState.y = travelY ? top / travelY : .5;
      measureFrame();
    }

    viewfinder?.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 && event.pointerType !== "touch") return;
      const box = viewfinder.getBoundingClientRect();
      frameState.pointerId = event.pointerId;
      frameState.grabX = event.clientX - box.left;
      frameState.grabY = event.clientY - box.top;
      viewfinder.setPointerCapture(event.pointerId);
      viewfinder.classList.add("is-dragging");
      setFrameStatus("Reframing…");
    });

    viewfinder?.addEventListener("pointermove", (event) => {
      if (event.pointerId !== frameState.pointerId) return;
      updateFrameFromPointer(event.clientX, event.clientY);
    });

    function finishFrameDrag(event) {
      if (event.pointerId !== frameState.pointerId) return;
      frameState.pointerId = null;
      viewfinder?.classList.remove("is-dragging");
      setFrameStatus("Frame set.");
    }

    viewfinder?.addEventListener("pointerup", finishFrameDrag);
    viewfinder?.addEventListener("pointercancel", finishFrameDrag);

    viewfinder?.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home"].includes(event.key)) return;
      event.preventDefault();
      const step = event.shiftKey ? .12 : .035;
      if (event.key === "ArrowLeft") frameState.x = Math.max(0, frameState.x - step);
      if (event.key === "ArrowRight") frameState.x = Math.min(1, frameState.x + step);
      if (event.key === "ArrowUp") frameState.y = Math.max(0, frameState.y - step);
      if (event.key === "ArrowDown") frameState.y = Math.min(1, frameState.y + step);
      if (event.key === "Home") {
        frameState.x = .5;
        frameState.y = .5;
      }
      measureFrame();
      setFrameStatus("Frame moved with keyboard.");
    });

    sceneButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const nextSource = button.dataset.frameScene;
        if (!source || !nextSource || source.getAttribute("src") === nextSource) return;
        setPressed(sceneButtons, button);
        stage?.classList.add("is-changing");
        const finishSceneChange = () => {
          stage?.classList.remove("is-changing");
          frameState.x = .5;
          frameState.y = .5;
          measureFrame();
          fireCameraFlash();
          setFrameStatus(`${button.textContent.trim().toLowerCase()} loaded.`);
        };
        source.addEventListener("load", finishSceneChange, { once: true });
        source.src = nextSource;
        source.alt = button.dataset.frameAlt || "";
      });
    });

    [cityInput, dateInput, coordinatesInput].forEach((input) => {
      input?.addEventListener("input", syncFrameCopy);
      input?.addEventListener("change", syncFrameCopy);
    });

    function getSourceCrop() {
      if (!stage || !source) return null;
      const stageBounds = stage.getBoundingClientRect();
      const naturalWidth = source.naturalWidth;
      const naturalHeight = source.naturalHeight;
      if (!stageBounds.width || !stageBounds.height || !naturalWidth || !naturalHeight) return null;
      const scale = Math.max(stageBounds.width / naturalWidth, stageBounds.height / naturalHeight);
      const renderedWidth = naturalWidth * scale;
      const renderedHeight = naturalHeight * scale;
      const offsetX = (stageBounds.width - renderedWidth) / 2;
      const offsetY = (stageBounds.height - renderedHeight) / 2;
      return {
        sx: Math.max(0, (frameState.box.left - offsetX) / scale),
        sy: Math.max(0, (frameState.box.top - offsetY) / scale),
        sw: Math.min(naturalWidth, frameState.box.width / scale),
        sh: Math.min(naturalHeight, frameState.box.height / scale)
      };
    }

    function drawPostcardText(context, width, height) {
      const city = cityInput?.value.trim() || "BEIJING";
      const date = formatDate(dateInput?.value);
      const coordinates = coordinatesInput?.value.trim() || "";
      const margin = Math.round(width * .052);
      let citySize = Math.round(width * .052);
      let metaSize = Math.max(14, Math.round(width * .017));
      context.font = `750 ${citySize}px "Helvetica Neue", Arial, sans-serif`;
      while (context.measureText(city.toUpperCase()).width > width - margin * 2 && citySize > 24) {
        citySize -= 2;
        context.font = `750 ${citySize}px "Helvetica Neue", Arial, sans-serif`;
      }
      context.font = `750 ${metaSize}px "Helvetica Neue", Arial, sans-serif`;
      while (
        Math.max(context.measureText(date).width, context.measureText(coordinates.toUpperCase()).width) > width - margin * 2
        && metaSize > 12
      ) {
        metaSize -= 1;
        context.font = `750 ${metaSize}px "Helvetica Neue", Arial, sans-serif`;
      }
      const lineGap = Math.round(metaSize * 1.45);
      const isRight = frameState.position.endsWith("right");
      const isBottom = frameState.position.startsWith("bottom");
      const anchorX = isRight ? width - margin : margin;
      const blockHeight = citySize + lineGap * 2.15;
      const anchorY = isBottom ? height - margin - blockHeight : margin;

      context.save();
      context.textAlign = isRight ? "right" : "left";
      context.textBaseline = "top";
      context.fillStyle = "#f4f1e9";
      context.shadowColor = "rgba(0, 0, 0, .72)";
      context.shadowBlur = Math.round(width * .014);
      context.shadowOffsetY = Math.round(width * .003);
      context.font = `750 ${citySize}px "Helvetica Neue", Arial, sans-serif`;
      context.fillText(city.toUpperCase(), anchorX, anchorY);
      context.font = `750 ${metaSize}px "Helvetica Neue", Arial, sans-serif`;
      context.fillText(date, anchorX, anchorY + citySize + Math.round(metaSize * .38));
      context.fillText(coordinates.toUpperCase(), anchorX, anchorY + citySize + lineGap + Math.round(metaSize * .38));
      context.restore();

      context.save();
      context.fillStyle = "rgba(244, 241, 233, .82)";
      context.font = `750 ${Math.max(12, Math.round(width * .012))}px "Helvetica Neue", Arial, sans-serif`;
      context.textBaseline = "bottom";
      context.textAlign = "right";
      context.fillText("GALOK / FRAME THE CITY", width - margin, height - Math.round(margin * .38));
      context.restore();
    }

    async function generatePostcard() {
      if (!source || !output || !download) return;
      generate?.setAttribute("disabled", "");
      setFrameStatus("Rendering postcard…");
      try {
        if (!source.complete || !source.naturalWidth) await source.decode();
        measureFrame();
        const crop = getSourceCrop();
        if (!crop) throw new Error("Frame is not ready");
        const config = aspects[frameState.aspect];
        const canvas = document.createElement("canvas");
        canvas.width = config.width;
        canvas.height = config.height;
        const context = canvas.getContext("2d", { alpha: false });
        if (!context) throw new Error("Canvas is unavailable");
        context.drawImage(
          source,
          crop.sx,
          crop.sy,
          crop.sw,
          crop.sh,
          0,
          0,
          canvas.width,
          canvas.height
        );
        drawPostcardText(context, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/png");
        output.src = dataUrl;
        download.href = dataUrl;
        fireCameraFlash();
        if (typeof dialog?.showModal === "function") dialog.showModal();
        else dialog?.setAttribute("open", "");
        setFrameStatus("Postcard ready to download.");
        window.gtag?.("event", "beijing_postcard_created", {
          aspect: frameState.aspect,
          text_position: frameState.position
        });
      } catch {
        setFrameStatus("The postcard could not be rendered. Try another frame.");
      } finally {
        generate?.removeAttribute("disabled");
      }
    }

    generate?.addEventListener("click", generatePostcard);
    dialogClose?.addEventListener("click", () => {
      if (typeof dialog?.close === "function") dialog.close();
      else dialog?.removeAttribute("open");
    });
    dialog?.addEventListener("click", (event) => {
      if (event.target === dialog && typeof dialog.close === "function") dialog.close();
    });

    setDefaultDate();
    syncFrameCopy();
    if ("ResizeObserver" in window && stage) {
      const frameResizeObserver = new ResizeObserver(measureFrame);
      frameResizeObserver.observe(stage);
    } else {
      window.addEventListener("resize", measureFrame, { passive: true });
    }
  }

  const revealItems = [...document.querySelectorAll("[data-beijing-reveal]")];
  if (!reducedMotion && "IntersectionObserver" in window) {
    document.body.classList.add("beijing-motion-ready");
    revealItems.forEach((item, index) => {
      item.style.transitionDelay = `${(index % 4) * 65}ms`;
    });
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, {
      rootMargin: "0px 0px -7% 0px",
      threshold: .08
    });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }
})();
