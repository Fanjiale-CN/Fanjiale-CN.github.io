(() => {
  const VERSION = "20260828-cq-v3";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  const addStylesheet = () => {
    if (document.querySelector('link[data-cq-enhance]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `/be-a-viewer/chongqing/chongqing-enhance.css?v=${VERSION}`;
    link.dataset.cqEnhance = "true";
    document.head.appendChild(link);
  };
  addStylesheet();

  const skip = document.querySelector(".skip-link");
  const main = document.querySelector("#main-content");
  if (skip && main) {
    skip.addEventListener("click", (event) => {
      event.preventDefault();
      main.focus({ preventScroll: true });
      main.scrollIntoView({ block: "start", behavior: "auto" });
      skip.blur();
    });
  }

  const VIDEO = {
    rail: "https://www.pexels.com/download/video/34315145/",
    train: "https://www.pexels.com/download/video/34315155/",
    bridge: "https://www.pexels.com/download/video/34315152/",
    redBridge: "https://www.pexels.com/download/video/36119302/",
    skyline: "https://www.pexels.com/download/video/36149401/",
    dusk: "https://www.pexels.com/download/video/34315149/"
  };

  const fallbackLink = (video, href) => {
    const shell = video.parentElement;
    if (!shell || shell.querySelector(".cq-video-fallback")) return;
    shell.classList.add("is-video-error");
    const link = document.createElement("a");
    link.className = "cq-video-fallback is-visible";
    link.href = href;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = "OPEN SOURCE VIDEO ↗";
    shell.appendChild(link);
  };

  const wireVideo = (video, { src, poster, controls = true, autoplay = false, sourcePage } = {}) => {
    if (!video || !src) return;
    if (poster) video.poster = poster;
    video.removeAttribute("crossorigin");
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute("playsinline", "");
    video.playsInline = true;
    video.loop = true;
    video.preload = "metadata";
    video.autoplay = autoplay && !reduced.matches;
    video.controls = controls;
    video.classList.add("cq-native-video");
    video.dataset.loaded = "true";
    video.dataset.loadedSrc = src;
    video.src = src;
    video.addEventListener("error", () => fallbackLink(video, sourcePage), { once: true });
    video.load();
    if (video.autoplay) video.play().catch(() => {});
  };

  const hero = document.querySelector("[data-cq-hero-video]");
  wireVideo(hero, {
    src: VIDEO.rail,
    controls: false,
    autoplay: true,
    sourcePage: "https://www.pexels.com/video/chongqing-light-rail-crossing-dongshuimen-bridge-34315145/"
  });

  const transitVideo = document.querySelector("[data-cq-inline-video]");
  wireVideo(transitVideo, {
    src: VIDEO.train,
    controls: true,
    autoplay: false,
    sourcePage: "https://www.pexels.com/video/chongqing-cityscape-with-dongshuimen-bridge-train-34315155/"
  });

  const createMotionSection = () => {
    if (document.querySelector(".cq-motion-lab")) return;
    const transit = document.querySelector(".cq-transit");
    if (!transit) return;
    const section = document.createElement("section");
    section.className = "cq-motion-lab";
    section.setAttribute("aria-label", "Chongqing motion studies");
    section.dataset.cqAltitude = "252";
    section.innerHTML = `
      <header class="cq-mini-head">
        <p>04B / MOTION STUDIES</p>
        <h2>THE CITY<br>MOVES IN SECTION.</h2>
        <span>Rail, bridge, river and night are easier to understand in motion. Every clip here has a verified Chongqing source page.</span>
      </header>
      <div class="cq-motion-grid">
        <figure class="cq-motion-card"><video muted loop playsinline controls preload="metadata" poster="https://images.pexels.com/photos/11826996/pexels-photo-11826996.jpeg?auto=compress&cs=tinysrgb&w=1400"></video><figcaption><span>01</span><b>LIGHT RAIL / BRIDGE</b></figcaption></figure>
        <figure class="cq-motion-card"><video muted loop playsinline controls preload="metadata" poster="https://images.pexels.com/photos/11827002/pexels-photo-11827002.jpeg?auto=compress&cs=tinysrgb&w=1400"></video><figcaption><span>02</span><b>DONGSHUIMEN / YANGTZE</b></figcaption></figure>
        <figure class="cq-motion-card"><video muted loop playsinline controls preload="metadata" poster="https://images.pexels.com/photos/28883787/pexels-photo-28883787.jpeg?auto=compress&cs=tinysrgb&w=1400"></video><figcaption><span>03</span><b>TRAIN / RED STEEL</b></figcaption></figure>
        <figure class="cq-motion-card"><video muted loop playsinline controls preload="metadata" poster="https://images.pexels.com/photos/19225936/pexels-photo-19225936.jpeg?auto=compress&cs=tinysrgb&w=1400"></video><figcaption><span>04</span><b>RED BRIDGE / TRAFFIC</b></figcaption></figure>
        <figure class="cq-motion-card"><video muted loop playsinline controls preload="metadata" poster="https://images.pexels.com/photos/14062542/pexels-photo-14062542.jpeg?auto=compress&cs=tinysrgb&w=1400"></video><figcaption><span>05</span><b>SKYLINE / BRIDGE</b></figcaption></figure>
        <figure class="cq-motion-card cq-motion-card--vertical"><video muted loop playsinline controls preload="metadata" poster="https://images.pexels.com/photos/34947071/pexels-photo-34947071.jpeg?auto=compress&cs=tinysrgb&w=1000"></video><figcaption><span>06</span><b>DUSK / CITY LIGHT</b></figcaption></figure>
      </div>`;
    transit.insertAdjacentElement("afterend", section);

    const clips = [
      [VIDEO.rail, "https://www.pexels.com/video/chongqing-light-rail-crossing-dongshuimen-bridge-34315145/"],
      [VIDEO.bridge, "https://www.pexels.com/video/dongshuimen-bridge-over-yangtze-river-in-chongqing-34315152/"],
      [VIDEO.train, "https://www.pexels.com/video/chongqing-cityscape-with-dongshuimen-bridge-train-34315155/"],
      [VIDEO.redBridge, "https://www.pexels.com/video/chongqing-cityscape-with-red-suspension-bridge-36119302/"],
      [VIDEO.skyline, "https://www.pexels.com/video/chongqing-cityscape-with-iconic-bridge-view-36149401/"],
      [VIDEO.dusk, "https://www.pexels.com/zh-cn/video/34315149/"]
    ];
    section.querySelectorAll("video").forEach((video, index) => wireVideo(video, {
      src: clips[index][0], controls: true, autoplay: false, sourcePage: clips[index][1]
    }));
  };

  const createExpandedField = () => {
    if (document.querySelector(".cq-expanded")) return;
    const life = document.querySelector(".cq-life");
    if (!life) return;
    const section = document.createElement("section");
    section.className = "cq-expanded";
    section.dataset.cqAltitude = "264";
    section.setAttribute("aria-label", "More Chongqing field photographs");
    section.innerHTML = `
      <header class="cq-mini-head"><p>06B / MORE GROUND</p><h2>MORE THAN<br>THE SKYLINE.</h2><span>Bridges, alleys, river edges and food fill the levels between the towers.</span></header>
      <div class="cq-expanded-grid">
        <figure class="cq-expanded-card cq-expanded-card--wide"><img src="https://images.pexels.com/photos/11826841/pexels-photo-11826841.jpeg?auto=compress&cs=tinysrgb&w=1800" alt="Cable car and bridge above Chongqing" loading="lazy"><figcaption><span>01</span><small>CABLE / BRIDGE / RIVER</small></figcaption></figure>
        <figure class="cq-expanded-card cq-expanded-card--tall cq-expanded-card--offset"><img src="https://images.pexels.com/photos/11827006/pexels-photo-11827006.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="People walking through a Chongqing street" loading="lazy"><figcaption><span>02</span><small>STREET / CROWD</small></figcaption></figure>
        <figure class="cq-expanded-card"><img src="https://images.pexels.com/photos/11826843/pexels-photo-11826843.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="Chongqing cableway structure" loading="lazy"><figcaption><span>03</span><small>CABLEWAY / STRUCTURE</small></figcaption></figure>
        <figure class="cq-expanded-card cq-expanded-card--wide"><img src="https://images.pexels.com/photos/11826842/pexels-photo-11826842.jpeg?auto=compress&cs=tinysrgb&w=1800" alt="Chongqing river bridges and dense skyline" loading="lazy"><figcaption><span>04</span><small>TWO BANKS / MANY LEVELS</small></figcaption></figure>
        <figure class="cq-expanded-card"><img src="https://images.pexels.com/photos/11827007/pexels-photo-11827007.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="Traditional Chongqing rooflines beside a bridge at dusk" loading="lazy"><figcaption><span>05</span><small>ROOF / BRIDGE / DUSK</small></figcaption></figure>
        <figure class="cq-expanded-card cq-expanded-card--tall cq-expanded-card--offset"><img src="https://images.pexels.com/photos/11826827/pexels-photo-11826827.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="Modern Chongqing towers above the river" loading="lazy"><figcaption><span>06</span><small>RIVER CORE / HIGH RISE</small></figcaption></figure>
        <figure class="cq-expanded-card"><img src="https://images.pexels.com/photos/11826859/pexels-photo-11826859.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="People moving through a lantern-lit Chongqing alley" loading="lazy"><figcaption><span>07</span><small>ALLEY / LANTERNS</small></figcaption></figure>
        <figure class="cq-expanded-card cq-expanded-card--wide"><img src="https://images.pexels.com/photos/11827002/pexels-photo-11827002.jpeg?auto=compress&cs=tinysrgb&w=1800" alt="Bridge crossing the Chongqing skyline" loading="lazy"><figcaption><span>08</span><small>BRIDGE / CITY SECTION</small></figcaption></figure>
      </div>
      <div class="cq-food-strip">
        <figure><img src="https://images.pexels.com/photos/11826872/pexels-photo-11826872.jpeg?auto=compress&cs=tinysrgb&w=1000" alt="Noodles served in Chongqing" loading="lazy"><figcaption>NOODLES / STREET</figcaption></figure>
        <figure><img src="https://images.pexels.com/photos/36034214/pexels-photo-36034214.jpeg?auto=compress&cs=tinysrgb&w=1000" alt="Chongqing street food stall" loading="lazy"><figcaption>STALL / NIGHT</figcaption></figure>
        <figure><img src="https://images.pexels.com/photos/34205541/pexels-photo-34205541.jpeg?auto=compress&cs=tinysrgb&w=1000" alt="Older Chongqing tiled roofs beneath apartment towers" loading="lazy"><figcaption>ROOF / HOME</figcaption></figure>
      </div>`;
    life.insertAdjacentElement("afterend", section);
  };

  createMotionSection();
  createExpandedField();

  const pauseObserver = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const video = entry.target;
      if (!entry.isIntersecting && !video.paused) video.pause();
    });
  }, { threshold: 0.02 }) : null;
  document.querySelectorAll(".cq-motion-card video").forEach((video) => pauseObserver?.observe(video));

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) return;
    document.querySelectorAll(".cq-motion-card video, [data-cq-hero-video], [data-cq-inline-video]").forEach((video) => video.pause());
  });
})();