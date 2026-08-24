/* ==========================================================================
   city-mapline — self-drawing city boundary, scroll-scrubbed.
   Single shared module for all galok city pages.
   Loads: gsap + DrawSVGPlugin + ScrollTrigger (CDN, gsap@3.15.0).

   Behavior
   --------
   1. On first entry into the stage viewport the line starts drawing.
   2. Scroll position within the stage pin window scrubs the drawing
      progress (0% → 100%) — the animation is fully hand-driven.
   3. When the scrub passes ~82% the district hairlines fade in with a
      staggered reveal, then the whole map recedes to a watermark so the
      editorial content takes over.
   4. prefers-reduced-motion: nothing animates; a static faint hairline
      map is rendered by CSS alone (no JS path).

   Usage (per city page):
   <section class="cl-stage">
     <div class="cl-wordmark" aria-hidden="true">
       <span class="cl-latin">BEIJING</span><span class="cl-hanzi">北京</span>
     </div>
     <div class="cl-map-wrap">
       <!--{include /assets/city-lines/beijing.svg} inlined --></div>
   </section>
   The SVG is inlined in the page markup (no fetch) with layers
  <path class="cl-outline"> and <path class="cl-district">. Then:
  <script src="/be-a-viewer/city-mapline.js"></script> (after GSAP CDN)
   ========================================================================== */

(function () {
  "use strict";

  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var DRAW_DONE_RATIO = 0.82; // when district reveal starts

  /* SVG is inlined; paths already carry .cl-outline / .cl-district */
  function install(mapEl, onDistrictPaths) {
    onDistrictPaths(mapEl.querySelectorAll(".cl-district"));
  }

  function drawDistricts(gs, districts) {
    districts.forEach(function (d, i) {
      gs.fromTo(
        d,
        { opacity: 0, drawSVG: "0%" },
        {
          opacity: 1,
          drawSVG: "100%",
          duration: 0.35,
          delay: i * 0.05,
          ease: "none",
          overwrite: true
        }
      );
    });
  }

  function initStage(stage) {
    var wordmark = stage.querySelector(".cl-wordmark");
    var mapEl = stage.querySelector(".cl-map");
    if (!mapEl) { return; }

    // Reduced motion or a failed CDN dependency: keep the final map and copy readable.
    if (REDUCED || !window.gsap || !window.DrawSVGPlugin || !window.ScrollTrigger) {
      stage.classList.add("is-static");
      stage.classList.add("is-ghost");
      return;
    }

    stage.classList.add("is-animated");
    window.gsap.registerPlugin(window.DrawSVGPlugin, window.ScrollTrigger);

    var districts;
    install(mapEl, function (ds) { districts = Array.prototype.slice.call(ds); });

    function build() {
      var tl = window.gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: "top 88%",
          end: "bottom 38%",
          scrub: 0.35,
          anticipatePin: 1,
          onUpdate: function (self) {
            if (self.progress >= 0.96) {
              stage.classList.add("is-ghost");
            } else {
              stage.classList.remove("is-ghost");
            }
          }
        }
      });

      // main boundary draws over the first part of the pin
      tl.fromTo(
        mapEl.querySelector(".cl-outline"),
        { opacity: 1, drawSVG: "0%" },
        { drawSVG: "100%", duration: 1, ease: "none", overwrite: true },
        0
      );

      // district hairlines appear after the boundary is mostly drawn
      if (districts && districts.length) {
        drawDistricts(tl, districts);
      }
    }

    build();
  }

  function ready() {
    document.querySelectorAll(".cl-stage").forEach(initStage);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ready);
  } else {
    ready();
  }

  window.GalokCityMapline = { init: function () { document.querySelectorAll(".cl-stage").forEach(initStage); } };
})();
