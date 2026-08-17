/* Xiamen reading wave — a desktop-only scroll minimap inspired by Codex. */
(function () {
  "use strict";

  var chapterNav = document.querySelector(".xiamen-page-body .gcn--city");
  if (!chapterNav || matchMedia("(max-width: 900px), (hover: none), (pointer: coarse)").matches) return;

  var chapterLinks = Array.from(chapterNav.querySelectorAll("a[href^='#']")).filter(function (link) {
    return !link.classList.contains("gcn-chapter");
  });
  var chapters = chapterLinks.map(function (link) {
    var target = document.querySelector(link.getAttribute("href"));
    return {
      number: (link.querySelector("b") || {}).textContent || "",
      title: (link.querySelector("span") || {}).textContent || link.textContent.trim(),
      target: target
    };
  }).filter(function (chapter) { return chapter.target instanceof HTMLElement; });

  if (chapters.length < 2) return;

  var TICK_COUNT = 73;
  var CENTER_INDEX = Math.floor(TICK_COUNT / 2);
  var reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var rail = document.createElement("aside");
  rail.className = "xm-wave-rail";
  rail.setAttribute("aria-label", "Xiamen reading progress");

  var track = document.createElement("div");
  track.className = "xm-wave-track";
  track.setAttribute("role", "scrollbar");
  track.setAttribute("tabindex", "0");
  track.setAttribute("aria-orientation", "vertical");
  track.setAttribute("aria-valuemin", "0");
  track.setAttribute("aria-valuemax", "100");
  track.setAttribute("aria-valuenow", "0");

  var ticks = [];
  var fragment = document.createDocumentFragment();
  for (var i = 0; i < TICK_COUNT; i += 1) {
    var tick = document.createElement("i");
    tick.className = "xm-wave-tick";
    tick.setAttribute("aria-hidden", "true");
    fragment.appendChild(tick);
    ticks.push(tick);
  }
  track.appendChild(fragment);

  var label = document.createElement("div");
  label.className = "xm-wave-label";
  label.setAttribute("aria-hidden", "true");
  label.innerHTML = "<b><em>01</em>Tide Table</b><span>0% through Xiamen</span>";

  rail.appendChild(track);
  rail.appendChild(label);
  document.body.appendChild(rail);

  var storyStart = 0;
  var storyEnd = 1;
  var chapterRatios = [];
  var currentProgress = 0;
  var activeChapter = 0;
  var hoverIndex = -1;
  var dragging = false;
  var frame = 0;

  function clamp(value, min, max) {
    return Math.max(min === undefined ? 0 : min, Math.min(max === undefined ? 1 : max, value));
  }

  function measure() {
    storyStart = chapters[0].target.offsetTop;
    storyEnd = Math.max(storyStart + 1, document.documentElement.scrollHeight - window.innerHeight);
    chapterRatios = chapters.map(function (chapter) {
      return clamp((chapter.target.offsetTop - storyStart) / (storyEnd - storyStart));
    });
  }

  function chapterAt(ratio) {
    var index = 0;
    chapterRatios.forEach(function (chapterRatio, chapterIndex) {
      if (chapterRatio <= ratio + 0.012) index = chapterIndex;
    });
    return index;
  }

  function updateLabel(ratio, pointerY) {
    var chapterIndex = chapterAt(ratio);
    var chapter = chapters[chapterIndex];
    var percent = Math.round(ratio * 100);
    label.innerHTML = "<b><em>" + chapter.number + "</em>" + chapter.title + "</b><span>" + percent + "% through Xiamen</span>";
    rail.style.setProperty("--xm-wave-label-y", clamp(pointerY, 28, rail.clientHeight - 28) + "px");
  }

  function renderWave(focusIndex) {
    var center = focusIndex >= 0 ? focusIndex : CENTER_INDEX;
    var phase = currentProgress * (TICK_COUNT - 1);

    ticks.forEach(function (tick, index) {
      var distance = Math.abs(index - center);
      var energy = clamp(1 - distance / 5);
      var ambient = 0.22 + (Math.sin((index + phase) * 1.17) + 1) * 0.035;
      var scale = ambient + energy * (1 - ambient);
      var past = index < CENTER_INDEX;
      var chapterIndex = chapterRatios.findIndex(function (ratio) {
        var markerIndex = CENTER_INDEX + (ratio - currentProgress) * (TICK_COUNT - 1);
        return Math.abs(index - markerIndex) < 0.5;
      });

      tick.style.setProperty("--xm-wave-scale", scale.toFixed(3));
      tick.style.setProperty("--xm-wave-opacity", (0.28 + energy * 0.72).toFixed(3));
      tick.classList.toggle("is-past", past);
      tick.classList.toggle("is-current", index === CENTER_INDEX);
      tick.classList.toggle("is-chapter", chapterIndex >= 0);
    });
  }

  function render() {
    frame = 0;
    var y = window.scrollY;
    currentProgress = clamp((y - storyStart) / (storyEnd - storyStart));
    var readingProgress = clamp((y + window.innerHeight * 0.42 - storyStart) / (storyEnd - storyStart));
    activeChapter = chapterAt(readingProgress);
    var chapter = chapters[activeChapter];
    var visible = y > storyStart - window.innerHeight * 0.42;

    rail.classList.toggle("is-visible", visible);
    track.setAttribute("aria-valuenow", String(Math.round(currentProgress * 100)));
    track.setAttribute("aria-valuetext", chapter.number + " " + chapter.title + ", " + Math.round(currentProgress * 100) + " percent");
    renderWave(hoverIndex);
  }

  function requestRender() {
    if (frame) return;
    frame = requestAnimationFrame(render);
  }

  function ratioFromPointer(event) {
    var rect = track.getBoundingClientRect();
    return clamp((event.clientY - rect.top) / Math.max(1, rect.height));
  }

  function inspect(event) {
    var ratio = ratioFromPointer(event);
    hoverIndex = ratio * (TICK_COUNT - 1);
    rail.classList.add("is-inspecting");
    updateLabel(ratio, event.clientY - rail.getBoundingClientRect().top);
    renderWave(hoverIndex);
    return ratio;
  }

  function scrollToRatio(ratio, smooth) {
    var target = storyStart + ratio * (storyEnd - storyStart);
    window.scrollTo({ top: target, behavior: smooth && !reducedMotion ? "smooth" : "auto" });
  }

  track.addEventListener("pointermove", function (event) {
    var ratio = inspect(event);
    if (dragging) scrollToRatio(ratio, false);
  });

  track.addEventListener("pointerleave", function () {
    if (dragging) return;
    hoverIndex = -1;
    rail.classList.remove("is-inspecting");
    renderWave(-1);
  });

  track.addEventListener("pointerdown", function (event) {
    if (event.button !== 0) return;
    dragging = true;
    rail.classList.add("is-scrubbing");
    track.setPointerCapture(event.pointerId);
    scrollToRatio(inspect(event), false);
    event.preventDefault();
  });

  function stopScrubbing(event) {
    if (!dragging) return;
    dragging = false;
    rail.classList.remove("is-scrubbing");
    if (event.pointerId !== undefined && track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
  }

  track.addEventListener("pointerup", stopScrubbing);
  track.addEventListener("pointercancel", stopScrubbing);

  track.addEventListener("click", function (event) {
    if (dragging) return;
    scrollToRatio(ratioFromPointer(event), true);
  });

  track.addEventListener("focus", function () {
    rail.classList.add("is-inspecting");
    updateLabel(currentProgress, rail.clientHeight / 2);
  });

  track.addEventListener("blur", function () {
    rail.classList.remove("is-inspecting");
  });

  track.addEventListener("keydown", function (event) {
    var step = 0;
    if (event.key === "ArrowDown") step = 0.02;
    else if (event.key === "ArrowUp") step = -0.02;
    else if (event.key === "PageDown") step = 0.1;
    else if (event.key === "PageUp") step = -0.1;
    else if (event.key === "Home") currentProgress = 0;
    else if (event.key === "End") currentProgress = 1;
    else return;

    event.preventDefault();
    currentProgress = clamp(currentProgress + step);
    scrollToRatio(currentProgress, true);
    updateLabel(currentProgress, rail.clientHeight / 2);
    renderWave(-1);
  });

  window.addEventListener("scroll", requestRender, { passive: true });
  window.addEventListener("resize", function () {
    measure();
    requestRender();
  }, { passive: true });
  window.addEventListener("load", function () {
    measure();
    requestRender();
  }, { once: true });

  measure();
  render();
})();
