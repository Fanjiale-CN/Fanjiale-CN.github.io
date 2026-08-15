/* Galok Capsule Nav — shared component logic (v1, 2026-08-15)
   Usage:
     <nav class="gcn gcn--data"> ...chapter links... </nav>   (data page skin)
     <nav class="gcn gcn--essay"> ...chapter links... </nav>  (essay skin)
   Requires host JS to set chapter data via `data-gcn-chapters` JSON on the nav
   and keep "is-active" / aria-current on chapter links. This file:
     - expands at page top / on scroll-up / hover; collapses on scroll-down
     - builds the capsule bar (chapter + dots + prev/next + grip) on demand
     - drag-to-move with snap anchors (top / right / left), persisted in localStorage
   Motion: transform only, 260ms ease-out, reduced-motion silent.
*/
(function () {
  "use strict";

  var STORAGE_KEY = "galok-capsule-pos";
  var EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";

  function q(s, root) { return (root || document).querySelector(s); }
  function qa(s, root) { return Array.from((root || document).querySelectorAll(s)); }

  function initCapsuleNav(root) {
    var nav = q(".gcn", root) || q("[data-gcn]", root);
    if (!nav) return;
    if (nav.querySelector(".gcn-bar") || nav.hasAttribute("data-gcn-init")) return;
    nav.setAttribute("data-gcn-init", "1");

    var isReduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    var isTouch = matchMedia("(hover: none)").matches;

    // ---- chapter data from host nav links ----
    var chapterLinks = qa("a[href^='#']", nav).filter(function (l) {
      return !l.classList.contains("data-nav-skip");
    });
    var chapters = chapterLinks.map(function (link) {
      var target = q(link.getAttribute("href"));
      // host markup is "<b>01</b><span>Growth</span>" — join parts with a space.
      var parts = [];
      link.childNodes.forEach(function (n) {
        var t = (n.textContent || "").replace(/\s+/g, " ").trim();
        if (t) parts.push(t);
      });
      return {
        link: link,
        target: target instanceof HTMLElement ? target : null,
        label: parts.join(" ")
      };
    }).filter(function (c) { return !!c.target; });

    if (!chapters.length) return;

    // ---- capsule bar DOM ----
    var bar = document.createElement("div");
    bar.className = "gcn-bar";
    var chapterEl = document.createElement("a");
    chapterEl.className = "gcn-chapter";
    chapterEl.href = "#";
    bar.appendChild(chapterEl);

    var dots = document.createElement("div");
    dots.className = "gcn-dots";
    var dotEls = chapters.map(function (c, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "gcn-dot" + (c.link.classList.contains("is-active") || c.link.getAttribute("aria-current") ? " is-active" : "");
      dot.setAttribute("aria-label", "Chapter " + (i + 1));
      dot.addEventListener("click", function (e) {
        e.preventDefault();
        jumpTo(i);
      });
      dots.appendChild(dot);
      return dot;
    });
    bar.appendChild(dots);

    var actions = document.createElement("div");
    actions.className = "gcn-actions";

    function chevron(dir) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "gcn-btn gcn-btn-" + dir;
      b.innerHTML = dir === "prev"
        ? '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3.5 5.5 8 10 12.5"/></svg>'
        : '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3.5 10.5 8 6 12.5"/></svg>';
      return b;
    }
    var prevBtn = chevron("prev");
    var nextBtn = chevron("next");
    actions.appendChild(prevBtn);
    actions.appendChild(nextBtn);

    if (!isTouch) {
      var grip = document.createElement("div");
      grip.className = "gcn-grip";
      grip.setAttribute("role", "button");
      grip.setAttribute("tabindex", "0");
      grip.setAttribute("aria-label", "Unlock and move navigation");
      grip.innerHTML = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4.5 5h7M4.5 8.5h7M4.5 12h7"/></svg>';
      actions.appendChild(grip);

      var hint = document.createElement("div");
      hint.className = "gcn-anchor-hint";
      hint.textContent = "Top · Right · Left — release to snap";
      nav.appendChild(hint);
    }
    bar.appendChild(actions);
    nav.appendChild(bar);

    var hairline = document.createElement("div");
    hairline.className = "gcn-hairline";
    nav.appendChild(hairline);

    // ---- chapter state ----
    var activeIndex = 0;

    function setChapter(i) {
      activeIndex = Math.max(0, Math.min(chapters.length - 1, i));
      chapters.forEach(function (c, idx) {
        var active = idx === activeIndex;
        c.link.classList.toggle("is-active", active);
        if (active) c.link.setAttribute("aria-current", "location");
        else c.link.removeAttribute("aria-current");
        dotEls[idx].classList.toggle("is-active", active);
      });
      var c = chapters[activeIndex];
      var parts = c.label.split(/\s+/);
      chapterEl.innerHTML = "<b>" + parts[0] + "</b> " + parts.slice(1).join(" ");
      chapterEl.href = c.link.getAttribute("href");
      prevBtn.disabled = activeIndex === 0;
      nextBtn.disabled = activeIndex === chapters.length - 1;
    }

    function jumpTo(i) {
      var c = chapters[Math.max(0, Math.min(chapters.length - 1, i))];
      if (!c || !c.target) return;
      var y = c.target.getBoundingClientRect().top + window.pageYOffset - 160;
      window.scrollTo({ top: y, behavior: "smooth" });
      setChapter(i);
    }

    prevBtn.addEventListener("click", function () { jumpTo(activeIndex - 1); });
    nextBtn.addEventListener("click", function () { jumpTo(activeIndex + 1); });
    chapterLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        var idx = chapters.findIndex(function (c) { return c.link === link; });
        if (idx >= 0) setChapter(idx);
      });
    });

    // Chapter state is driven by the HOST's scroll-spy (host JS keeps
    // is-active / aria-current on the nav links). The capsule simply mirrors
    // those markings onto the bar — one source of truth, no spy race.
    var mirrorTimer = 0;
    function mirrorChapterState() {
      chapters.forEach(function (c, idx) {
        var active = c.link.classList.contains("is-active") || c.link.getAttribute("aria-current") === "location";
        dotEls[idx].classList.toggle("is-active", active);
        if (active && idx !== activeIndex) {
          activeIndex = idx;
        }
        if (active) {
          var parts = c.label.split(/\s+/);
          chapterEl.innerHTML = "<b>" + parts[0] + "</b> " + parts.slice(1).join(" ");
          chapterEl.href = c.link.getAttribute("href");
          prevBtn.disabled = activeIndex === 0;
          nextBtn.disabled = activeIndex === chapters.length - 1;
        }
      });
    }
    if ("MutationObserver" in window) {
      new MutationObserver(function () {
        window.clearTimeout(mirrorTimer);
        mirrorTimer = window.setTimeout(mirrorChapterState, 60);
      }).observe(nav, { attributes: true, subtree: true, attributeFilter: ["class", "aria-current"] });
    }
    mirrorChapterState();

    // ---- expand / collapse ----
    var lastY = window.pageYOffset;
    var settleTimer = 0;
    var dragOffset = { x: 0, y: 0 };
    var isDragging = false;
    var pos = localStorage.getItem(STORAGE_KEY) || "top";
    nav.setAttribute("data-gcn-pos", pos);

    function isExpanded() {
      return !nav.classList.contains("is-collapsed") || nav.classList.contains("is-dragging");
    }

    function collapse() {
      if (isDragging) return;
      nav.classList.add("is-collapsed");
      nav.classList.remove("is-expanded");
    }
    function expand() {
      if (isDragging) return;
      nav.classList.remove("is-collapsed");
      nav.classList.add("is-expanded");
    }

    function applyLayout() {
      if (window.pageYOffset < 120) { expand(); return; }
      var dir = window.pageYOffset - lastY;
      if (dir > 6) collapse();
      else if (dir < -6) expand();
      lastY = window.pageYOffset;
    }

    var layoutTimer = 0;
    window.addEventListener("scroll", function () {
      if (isDragging) return;
      window.clearTimeout(layoutTimer);
      layoutTimer = window.setTimeout(applyLayout, 90);
      // reading progress hairline
      var docH = document.documentElement.scrollHeight - window.innerHeight;
      var progress = docH > 0 ? Math.min(1, Math.max(0, window.pageYOffset / docH)) : 0;
      hairline.style.setProperty("--gcn-progress", progress.toFixed(3));
      if (nav.classList.contains("is-collapsed")) {
        var r = nav.getBoundingClientRect();
        hairline.style.setProperty("--gcn-hair-x", r.left + "px");
        hairline.style.setProperty("--gcn-hair-tx", "0px");
        hairline.style.setProperty("--gcn-hair-w", r.width + "px");
      }
    }, { passive: true });

    nav.addEventListener("mouseenter", function () {
      if (!nav.classList.contains("is-collapsed")) return;
      expand();
    });
    nav.addEventListener("mouseleave", function () {
      if (nav.classList.contains("is-collapsed") || isDragging) return;
      collapse();
    });

    // apply once after mount
    applyLayout();

    // ---- drag + snap anchors (desktop only) ----
    if (isTouch || !q(".gcn-grip")) return;
    var grip = nav.querySelector(".gcn-grip");
    var anchors = ["top", "right", "left"];
    var dragStart = null;

    function unlock(e) {
      isDragging = true;
      dragStart = { x: e.clientX, y: e.clientY };
      nav.classList.add("is-dragging");
      var r = nav.getBoundingClientRect();
      dragOffset.x = e.clientX - (r.left + r.width / 2);
      dragOffset.y = e.clientY - (r.top + r.height / 2);
      e.preventDefault();
    }
    grip.addEventListener("pointerdown", unlock);
    grip.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        var idx = anchors.indexOf(pos);
        pos = anchors[(idx + 1) % anchors.length];
        localStorage.setItem(STORAGE_KEY, pos);
        nav.setAttribute("data-gcn-pos", pos);
      }
    });
    var longPressTimer = 0;
    bar.addEventListener("pointerdown", function () {
      window.clearTimeout(longPressTimer);
      longPressTimer = window.setTimeout(function () { unlock({ clientX: 0, clientY: 0, preventDefault: function () {} }); }, 500);
    });
    window.addEventListener("pointerup", function () { window.clearTimeout(longPressTimer); });

    var moveTimer = 0;
    window.addEventListener("pointermove", function (e) {
      if (!isDragging) return;
      if (moveTimer) window.cancelAnimationFrame(moveTimer);
      moveTimer = window.requestAnimationFrame(function () {
        moveTimer = 0;
        var nx = e.clientX - dragOffset.x;
        var ny = e.clientY - dragOffset.y;
        nav.style.left = nx + "px";
        nav.style.top = ny + "px";
        nav.style.transform = "translate(0, 0)";
      });
    }, { passive: false });

    window.addEventListener("pointerup", function (e) {
      if (!isDragging) return;
      isDragging = false;
      nav.classList.remove("is-dragging");
      nav.style.left = "";
      nav.style.top = "";
      nav.style.transform = "";

      // choose nearest anchor by distance from anchor points
      var W = window.innerWidth;
      var H = window.innerHeight;
      var cx = e.clientX, cy = e.clientY;
      var dTop = Math.hypot(cx - W / 2, cy - 72);
      var dRight = Math.hypot(cx - (W - 16), cy - H / 2);
      var dLeft = Math.hypot(cx - 16, cy - H / 2);
      var best = "top";
      if (dRight < dTop && dRight <= dLeft) best = "right";
      else if (dLeft < dTop) best = "left";
      pos = best;
      localStorage.setItem(STORAGE_KEY, pos);
      nav.setAttribute("data-gcn-pos", pos);
      if (isReduced) return;
      // snap animation: briefly allow transition
      nav.style.transition = "top 240ms " + EASE_OUT + ", left 240ms " + EASE_OUT + ", transform 240ms " + EASE_OUT;
      window.setTimeout(function () { nav.style.transition = ""; }, 260);
    });
  }

  // expose for hosts that need manual re-init
  window.GalokCapsule = { init: initCapsuleNav };

  // The script may run while the parser is still loading (body-end scripts execute
  // during loading), or after. Try immediately when the nav is already parsed;
  // otherwise wait for DOMContentLoaded (host JS may add the .gcn class there).
  function tryInit() {
    if (q(".gcn") || q("[data-gcn]")) { initCapsuleNav(document); return true; }
    return false;
  }
  if (!tryInit()) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", tryInit);
    } else {
      window.addEventListener("load", tryInit, { once: true });
    }
  }
})();
