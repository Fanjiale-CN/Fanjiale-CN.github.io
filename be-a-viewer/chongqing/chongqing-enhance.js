(() => {
  const VERSION = "20260828-cq-v2";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobile = window.matchMedia("(max-width: 760px)");

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

  const fallbackLink = (video, href = "https://www.pexels.com/search/videos/chongqing/") => {
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
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.loop = true;
    video.preload = "metadata";
    video.autoplay = autoplay && !reduced.matches;
    video.controls = controls;
    video.classList.add("cq-native-video");
    video.src = src;
    video.dataset.loaded = "true";
    video.addEventListener("error", () => fallbackLink(video, sourcePage), { once: true });
    video.load();
    if (video.autoplay) video.play().catch(() => {});
  };

  const hero = document.querySelector("[data-cq-hero-video]");
  wireVideo(hero, {
    src: mobile.matches
      ? "https://videos.pexels.com/video-files/13655505/13655505-hd_1080_1920_30fps.mp4"
      : "https://videos.pexels.com/video-files/16544239/16544239-hd_1920_1080_60fps.mp4",
    controls: false,
    autoplay: true,
    sourcePage: "https://www.pexels.com/search/videos/chongqing%20monorail/"
  });

  const transitVideo = document.querySelector("[data-cq-inline-video]");
  wireVideo(transitVideo, {
    src: "https://videos.pexels.com/video-files/16544239/16544239-hd_1920_1080_60fps.mp4",
    controls: true,
    autoplay: false,
    sourcePage: "https://www.pexels.com/search/videos/chongqing%20monorail/"
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
        <span>Rail, bridge, river and night are easier to understand in motion. These clips extend the transit chapter instead of reducing Chongqing to a single hero loop.</span>
      </header>
      <div class="cq-motion-grid">
        <figure class="cq-motion-card"><video muted loop playsinline controls preload="metadata" poster="https://images.pexels.com/photos/11826996/pexels-photo-11826996.jpeg?auto=compress&cs=tinysrgb&w=1400"></video><figcaption><span>01</span><b>MONORAIL / APARTMENT EDGE</b></figcaption></figure>
        <figure class="cq-motion-card"><video muted loop playsinline controls preload="metadata" poster="https://images.pexels.com/photos/11827002/pexels-photo-11827002.jpeg?auto=compress&cs=tinysrgb&w=1400"></video><figcaption><span>02</span><b>BRIDGE / RIVER / CITY</b></figcaption></figure>
        <figure class="cq-motion-card"><video muted loop playsinline controls preload="metadata" poster="https://images.pexels.com/photos/28883787/pexels-photo-28883787.jpeg?auto=compress&cs=tinysrgb&w=1400"></video><figcaption><span>03</span><b>RED STEEL / TRAIN FRAME</b></figcaption></figure>
        <figure class="cq-motion-card"><video muted loop playsinline controls preload="metadata" poster="https://images.pexels.com/photos/19225936/pexels-photo-19225936.jpeg?auto=compress&cs=tinysrgb&w=1400"></video><figcaption><span>04</span><b>BRIDGE / WEATHER</b></figcaption></figure>
        <figure class="cq-motion-card"><video muted loop playsinline controls preload="metadata" poster="https://images.pexels.com/photos/14062542/pexels-photo-14062542.jpeg?auto=compress&cs=tinysrgb&w=1400"></video><figcaption><span>05</span><b>RIVER / SUNSET</b></figcaption></figure>
        <figure class="cq-motion-card cq-motion-card--vertical"><video muted loop playsinline controls preload="metadata" poster="https://images.pexels.com/photos/34947071/pexels-photo-34947071.jpeg?auto=compress&cs=tinysrgb&w=1000"></video><figcaption><span>06</span><b>NIGHT / VERTICAL</b></figcaption></figure>
      </div>`;
    transit.insertAdjacentElement("afterend", section);

    const clips = [
      ["https://videos.pexels.com/video-files/16544239/16544239-hd_1920_1080_60fps.mp4", "https://www.pexels.com/search/videos/chongqing%20monorail/"],
      ["https://videos.pexels.com/video-files/14497440/14497440-hd_1920_1080_30fps.mp4", "https://www.pexels.com/search/videos/chongqing%20bridge/"],
      ["https://videos.pexels.com/video-files/14537310/14537310-hd_1920_1080_60fps.mp4", "https://www.pexels.com/search/videos/chongqing%20train%20bridge/"],
      ["https://videos.pexels.com/video-files/14537318/14537318-hd_1920_1080_60fps.mp4", "https://www.pexels.com/search/videos/chongqing%20bridge/"],
      ["https://videos.pexels.com/video-files/14537301/14537301-hd_1920_1080_60fps.mp4", "https://www.pexels.com/search/videos/chongqing%20bridge/"],
      ["https://videos.pexels.com/video-files/13655505/13655505-hd_1080_1920_30fps.mp4", "https://www.pexels.com/search/videos/chongqing%20night/"],
    ];
    section.querySelectorAll("video").forEach((video, index) => wireVideo(video, {
      src: clips[index][0],
      controls: true,
      autoplay: false,
      sourcePage: clips[index][1]
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
      <header class="cq-mini-head">
        <p>06B / MORE GROUND</p>
        <h2>MORE THAN<br>THE SKYLINE.</h2>
        <span>Bridges, lantern alleys, transit, river edges and food fill the levels between the towers.</span>
      </header>
      <div class="cq-expanded-grid">
        <figure class="cq-expanded-card cq-expanded-card--wide"><img src="https://images.pexels.com/photos/11826841/pexels-photo-11826841.jpeg?auto=compress&cs=tinysrgb&w=1800" alt="Cable car and bridge above Chongqing" loading="lazy"><figcaption><span>01</span><small>CABLE / BRIDGE / RIVER</small></figcaption></figure>
        <figure class="cq-expanded-card cq-expanded-card--tall cq-expanded-card--offset"><img src="https://images.pexels.com/photos/11827006/pexels-photo-11827006.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="People walking through a Chongqing street" loading="lazy"><figcaption><span>02</span><small>STREET / CROWD</small></figcaption></figure>
        <figure class="cq-expanded-card"><img src="https://images.pexels.com/photos/11826843/pexels-photo-11826843.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="Chongqing cable car suspended with bridge infrastructure behind it" loading="lazy"><figcaption><span>03</span><small>CABLEWAY / STRUCTURE</small></figcaption></figure>
        <figure class="cq-expanded-card cq-expanded-card--wide"><img src="https://images.pexels.com/photos/11826842/pexels-photo-11826842.jpeg?auto=compress&cs=tinysrgb&w=1800" alt="Chongqing river bridges and dense city skyline" loading="lazy"><figcaption><span>04</span><small>TWO BANKS / MANY LEVELS</small></figcaption></figure>
        <figure class="cq-expanded-card"><img src="https://images.pexels.com/photos/11827007/pexels-photo-11827007.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="Traditional Chongqing rooflines beside a bridge at dusk" loading="lazy"><figcaption><span>05</span><small>ROOF / BRIDGE / DUSK</small></figcaption></figure>
        <figure class="cq-expanded-card cq-expanded-card--tall cq-expanded-card--offset"><img src="https://images.pexels.com/photos/11826827/pexels-photo-11826827.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="Modern Chongqing towers rising above the river" loading="lazy"><figcaption><span>06</span><small>RIVER CORE / HIGH RISE</small></figcaption></figure>
        <figure class="cq-expanded-card"><img src="https://images.pexels.com/photos/11826859/pexels-photo-11826859.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="People moving through a lantern-lit Chongqing alley" loading="lazy"><figcaption><span>07</span><small>ALLEY / LANTERNS</small></figcaption></figure>
        <figure class="cq-expanded-card cq-expanded-card--wide"><img src="https://images.pexels.com/photos/11827002/pexels-photo-11827002.jpeg?auto=compress&cs=tinysrgb&w=1800" alt="Caiyuanba Bridge crossing the Chongqing skyline" loading="lazy"><figcaption><span>08</span><small>BRIDGE / CITY SECTION</small></figcaption></figure>
      </div>
      <div class="cq-food-strip">
        <figure><img src="https://images.pexels.com/photos/11826872/pexels-photo-11826872.jpeg?auto=compress&cs=tinysrgb&w=1000" alt="Noodles served in a Chongqing street setting" loading="lazy"><figcaption>NOODLES / STREET</figcaption></figure>
        <figure><img src="https://images.pexels.com/photos/36034214/pexels-photo-36034214.jpeg?auto=compress&cs=tinysrgb&w=1000" alt="Chongqing street food stall" loading="lazy"><figcaption>STALL / NIGHT</figcaption></figure>
        <figure><img src="https://images.pexels.com/photos/34205541/pexels-photo-34205541.jpeg?auto=compress&cs=tinysrgb&w=1000" alt="Older Chongqing tiled roofs beneath apartment towers" loading="lazy"><figcaption>ROOF / HOME</figcaption></figure>
      </div>`;
    life.insertAdjacentElement("afterend", section);
  };

  createMotionSection();
  createExpandedField();

  const newlyPlayable = [...document.querySelectorAll(".cq-motion-card video")];
  const pauseObserver = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const video = entry.target;
      if (!entry.isIntersecting && !video.paused) video.pause();
    });
  }, { threshold: 0.02 }) : null;
  newlyPlayable.forEach((video) => pauseObserver?.observe(video));

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) return;
    document.querySelectorAll(".cq-motion-card video, [data-cq-hero-video], [data-cq-inline-video]").forEach((video) => video.pause());
  });
})();
