/* Galok Reading Progress — shared bottom capsule navigation (2026-09-12).
   Source chapter links remain in the page markup. This component turns them
   into a compact, bottom-centered reading-progress capsule with an expandable
   section list. */
(function () {
  "use strict";

  function query(selector, root) {
    return (root || document).querySelector(selector);
  }

  function queryAll(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function clamp(value, min, max) {
    return Math.max(min === undefined ? 0 : min, Math.min(max === undefined ? 1 : max, value));
  }

  function chapterLabel(link, index) {
    var text = (link.textContent || "").replace(/\s+/g, " ").trim();
    var match = text.match(/^(\d{1,2})\s*(?:\/\s*)?(.*)$/);
    return {
      number: match ? match[1].padStart(2, "0") : String(index + 1).padStart(2, "0"),
      title: match && match[2] ? match[2].trim() : text || "Section " + (index + 1)
    };
  }

  function removeLegacyProgress() {
    queryAll(".article-read-progress").forEach(function (node) {
      node.remove();
    });
  }

  function upgradeCapabilityMedia() {
    if (window.location.pathname.replace(/index\.html$/, "") !== "/essays/capability-laundering/") return;
    var replacements = {
      "/assets/views/articles/capability-laundering-cover.webp": [
        "/assets/views/articles/capability-laundering-cover.avif", "1672", "941"
      ],
      "/assets/views/articles/capability-laundering-subway.webp": [
        "/assets/views/articles/capability-laundering-subway.avif", "1536", "1024"
      ],
      "/assets/views/articles/capability-laundering-alibaba-guangzhou.webp": [
        "/assets/views/articles/capability-laundering-alibaba-guangzhou.avif", "1448", "1086"
      ]
    };

    queryAll(".article-content img").forEach(function (image) {
      var src = image.getAttribute("src");
      var next = replacements[src];
      if (!next) return;
      image.setAttribute("src", next[0]);
      image.setAttribute("width", next[1]);
      image.setAttribute("height", next[2]);
      image.removeAttribute("srcset");
      image.removeAttribute("sizes");
    });
  }

  function ensureAutoArticleNav(root) {
    var existing = query(".gwn, [data-gwn]", root);
    if (existing) return existing;

    var article = query(".article-content", root);
    if (!article) return null;

    var headings = queryAll("h2", article).filter(function (heading) {
      return heading.parentElement === article && (heading.textContent || "").trim().length > 0;
    });
    if (!headings.length) return null;

    var nav = document.createElement("nav");
    nav.className = "gwn gwn--essay gwn--auto";
    nav.setAttribute("aria-label", "Article sections");
    nav.setAttribute("data-gwn-start", ".article-content");

    headings.forEach(function (heading, index) {
      if (!heading.id) heading.id = "article-section-" + String(index + 1).padStart(2, "0");
      var link = document.createElement("a");
      link.href = "#" + heading.id;
      link.innerHTML = "<span>" + String(index + 1).padStart(2, "0") + "</span> " + (heading.textContent || "").trim();
      nav.appendChild(link);
    });

    document.body.appendChild(nav);
    return nav;
  }

  function initWaveNav(root) {
    removeLegacyProgress();
    upgradeCapabilityMedia();
    var nav = query(".gwn, [data-gwn]", root) || ensureAutoArticleNav(root);
    if (!nav) return;
    if (nav.hasAttribute("data-gwn-init")) {
      if (query(".gwn-surface", nav)) return;
      nav.removeAttribute("data-gwn-init");
      queryAll(".gwn-track, .gwn-label", nav).forEach(function (node) { node.remove(); });
    }
    nav.setAttribute("data-gwn-init", "1");

    var chapterLinks = queryAll("a[href^='#']", nav).filter(function (link) {
      return !link.classList.contains("data-nav-skip");
    });

    var chapters = chapterLinks.map(function (link, index) {
      var target = query(link.getAttribute("href"));
      var label = chapterLabel(link, index);
      return {
        link: link,
        target: target instanceof HTMLElement ? target : null,
        number: label.number,
        title: label.title
      };
    }).filter(function (chapter) {
      return chapter.target instanceof HTMLElement;
    });

    if (!chapters.length) return;

    var reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    var open = false;
    var activeIndex = 0;
    var storyStart = 0;
    var storyEnd = 1;
    var chapterPositions = [];
    var progress = 0;
    var frame = 0;

    var surface = document.createElement("div");
    surface.className = "gwn-surface";

    var collapsed = document.createElement("button");
    collapsed.type = "button";
    collapsed.className = "gwn-collapsed";
    collapsed.setAttribute("aria-label", "Show sections");
    collapsed.setAttribute("aria-expanded", "false");

    var ring = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    ring.setAttribute("viewBox", "0 0 24 24");
    ring.setAttribute("class", "gwn-ring");
    ring.setAttribute("aria-hidden", "true");

    var ringTrack = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    ringTrack.setAttribute("cx", "12");
    ringTrack.setAttribute("cy", "12");
    ringTrack.setAttribute("r", "10");
    ringTrack.setAttribute("pathLength", "1");
    ringTrack.setAttribute("class", "gwn-ring-track");

    var ringValue = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    ringValue.setAttribute("cx", "12");
    ringValue.setAttribute("cy", "12");
    ringValue.setAttribute("r", "10");
    ringValue.setAttribute("pathLength", "1");
    ringValue.setAttribute("class", "gwn-ring-value");

    ring.appendChild(ringTrack);
    ring.appendChild(ringValue);

    var currentLabel = document.createElement("span");
    currentLabel.className = "gwn-current-label";

    collapsed.appendChild(ring);
    collapsed.appendChild(currentLabel);

    var list = document.createElement("ul");
    list.className = "gwn-list";
    list.setAttribute("aria-label", nav.getAttribute("aria-label") || "Sections");

    chapters.forEach(function (chapter, index) {
      var item = document.createElement("li");
      var button = document.createElement("button");
      button.type = "button";
      button.className = "gwn-item";
      button.dataset.gwnIndex = String(index);
      button.innerHTML = '<span class="gwn-item-bg" aria-hidden="true"></span><span class="gwn-dot" aria-hidden="true"></span><span class="gwn-item-label"></span>';
      button.querySelector(".gwn-item-label").textContent = chapter.title;
      item.appendChild(button);
      list.appendChild(item);
    });

    surface.appendChild(collapsed);
    surface.appendChild(list);
    nav.appendChild(surface);

    function documentTop(element) {
      return window.scrollY + element.getBoundingClientRect().top;
    }

    function measure() {
      var startSelector = nav.getAttribute("data-gwn-start");
      var startTarget = startSelector ? query(startSelector) : null;
      var article = query(".article-content");
      var startElement = startTarget instanceof HTMLElement ? startTarget : (article || chapters[0].target);
      storyStart = documentTop(startElement);

      var documentEnd = Math.max(storyStart + 1, document.documentElement.scrollHeight - window.innerHeight);
      var lastTarget = chapters[chapters.length - 1].target;
      var lastBottom = documentTop(lastTarget) + lastTarget.offsetHeight - window.innerHeight * 0.4;
      storyEnd = Math.max(storyStart + 1, documentEnd, lastBottom);
      chapterPositions = chapters.map(function (chapter) {
        return documentTop(chapter.target);
      });

      var collapsedWidth = Math.ceil(collapsed.scrollWidth);
      var labels = chapters.map(function (chapter) { return chapter.title.length; });
      var longest = Math.max.apply(Math, labels);
      var maxWidth = Math.max(232, Math.min(420, longest * 7.2 + 76));
      var viewportWidth = Math.max(240, window.innerWidth - 32);
      var openWidth = Math.min(viewportWidth, Math.max(maxWidth, collapsedWidth));
      var rowHeight = 36;
      var maxHeight = Math.max(120, Math.min(window.innerHeight * 0.7, 520));
      var openHeight = Math.min(maxHeight, chapters.length * rowHeight + 12);

      nav.style.setProperty("--gwn-collapsed-width", collapsedWidth + "px");
      nav.style.setProperty("--gwn-open-width", Math.ceil(openWidth) + "px");
      nav.style.setProperty("--gwn-open-height", Math.ceil(openHeight) + "px");
    }

    function chapterAt(scrollPosition) {
      var anchor = scrollPosition + Math.min(140, window.innerHeight * 0.2);
      var index = 0;
      chapterPositions.forEach(function (top, chapterIndex) {
        if (top <= anchor) index = chapterIndex;
      });
      return index;
    }

    function setActiveChapter(index) {
      if (index < 0 || index >= chapters.length) index = 0;
      var changed = activeIndex !== index;
      activeIndex = index;
      currentLabel.textContent = chapters[index].title;

      chapters.forEach(function (chapter, chapterIndex) {
        var active = chapterIndex === index;
        chapter.link.classList.toggle("is-active", active);
        if (active) chapter.link.setAttribute("aria-current", "location");
        else chapter.link.removeAttribute("aria-current");
      });

      queryAll(".gwn-item", list).forEach(function (button, chapterIndex) {
        var active = chapterIndex === index;
        button.classList.toggle("is-active", active);
        if (active) button.setAttribute("aria-current", "location");
        else button.removeAttribute("aria-current");
      });

      if (changed) requestAnimationFrame(measure);
    }

    function setOpen(next) {
      open = Boolean(next);
      nav.classList.toggle("is-open", open);
      collapsed.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) {
        requestAnimationFrame(measure);
        var activeButton = query('.gwn-item[data-gwn-index="' + activeIndex + '"]', list);
        if (activeButton) activeButton.focus({ preventScroll: true });
      }
    }

    function render() {
      frame = 0;
      var y = window.scrollY;
      progress = clamp((y - storyStart + window.innerHeight * 0.12) / Math.max(1, storyEnd - storyStart));
      ringValue.style.strokeDashoffset = String(1 - progress);
      ring.setAttribute("aria-label", Math.round(progress * 100) + "% read");
      setActiveChapter(chapterAt(y));
      nav.classList.add("is-visible");
    }

    function requestRender() {
      if (frame) return;
      frame = requestAnimationFrame(render);
    }

    function scrollToChapter(index) {
      var chapter = chapters[index];
      if (!chapter) return;
      var siteNav = query(".site-nav");
      var navHeight = siteNav ? siteNav.getBoundingClientRect().height : 0;
      var top = documentTop(chapter.target) - Math.max(20, navHeight + 18);
      setOpen(false);
      window.scrollTo({ top: Math.max(0, top), behavior: reducedMotion ? "auto" : "smooth" });
    }

    collapsed.addEventListener("click", function () {
      setOpen(!open);
    });

    list.addEventListener("click", function (event) {
      var button = event.target.closest(".gwn-item");
      if (!button) return;
      scrollToChapter(Number(button.dataset.gwnIndex));
    });

    document.addEventListener("pointerdown", function (event) {
      if (!open || nav.contains(event.target)) return;
      setOpen(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && open) {
        setOpen(false);
        collapsed.focus({ preventScroll: true });
      }
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

    var legacyObserver = new MutationObserver(function () {
      removeLegacyProgress();
    });
    legacyObserver.observe(document.body, { childList: true });

    measure();
    setActiveChapter(0);
    render();
  }

  window.GalokWave = {
    version: "20260912-pill-hd1",
    init: initWaveNav,
    ensureArticleNav: ensureAutoArticleNav
  };

  function tryInit() {
    removeLegacyProgress();
    upgradeCapabilityMedia();
    var nav = query(".gwn, [data-gwn]") || ensureAutoArticleNav(document);
    if (nav) {
      initWaveNav(document);
      return true;
    }
    return false;
  }

  if (!tryInit()) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", tryInit, { once: true });
    else window.addEventListener("load", tryInit, { once: true });
  }
})();