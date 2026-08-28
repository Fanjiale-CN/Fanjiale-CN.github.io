(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobile = window.matchMedia("(max-width: 760px)");
  const altimeter = document.querySelector("[data-cq-altimeter]");
  const altitudeReadout = document.querySelector("[data-cq-altitude-readout]");
  const cableImage = document.querySelector(".cq-cable img");
  if (cableImage) {
    cableImage.src = "https://commons.wikimedia.org/wiki/Special:Redirect/file/Chongqing%20Changjiang%20Cableway.jpg?width=1600";
    cableImage.alt = "Chongqing Yangtze River Cableway suspended above the river";
  }
  let frame = 0;

  const loadVideo = (video) => {
    if (!video || video.dataset.loaded === "true" || reduced.matches) return;
    const src = mobile.matches && video.dataset.mobileSrc ? video.dataset.mobileSrc : video.dataset.src;
    if (!src) return;
    video.src = src;
    video.dataset.loaded = "true";
    video.load();
  };

  const heroVideo = document.querySelector("[data-cq-hero-video]");
  const heroToggle = document.querySelector("[data-cq-video-toggle]");
  const syncToggle = () => {
    if (!heroToggle || !heroVideo) return;
    const playing = !heroVideo.paused && !heroVideo.ended;
    heroToggle.textContent = playing ? "PAUSE" : "PLAY";
    heroToggle.setAttribute("aria-pressed", String(playing));
    heroToggle.setAttribute("aria-label", playing ? "Pause Chongqing hero video" : "Play Chongqing hero video");
  };

  heroToggle?.addEventListener("click", async () => {
    loadVideo(heroVideo);
    if (!heroVideo) return;
    if (heroVideo.paused) { try { await heroVideo.play(); } catch {} } else heroVideo.pause();
    syncToggle();
  });
  heroVideo?.addEventListener("play", syncToggle);
  heroVideo?.addEventListener("pause", syncToggle);

  const inlineVideos = [...document.querySelectorAll("[data-cq-inline-video]")];
  const videoObserver = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
    entries.forEach(async (entry) => {
      const video = entry.target;
      if (entry.isIntersecting) {
        loadVideo(video);
        try { await video.play(); } catch {}
      } else video.pause();
    });
  }, { threshold: .25 }) : null;
  inlineVideos.forEach((video) => videoObserver?.observe(video));

  if ("IntersectionObserver" in window) {
    const heroObserver = new IntersectionObserver(async ([entry]) => {
      if (!heroVideo) return;
      if (entry.isIntersecting && !reduced.matches) {
        loadVideo(heroVideo);
        try { await heroVideo.play(); } catch {}
      } else heroVideo.pause();
      syncToggle();
    }, { threshold: .08 });
    const hero = document.querySelector("[data-cq-hero]");
    if (hero) heroObserver.observe(hero);

    const revealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }), { threshold: .12, rootMargin: "0px 0px -6%" });
    document.querySelectorAll(".cq-reveal").forEach((node) => revealObserver.observe(node));

    const altitudeObserver = new IntersectionObserver((entries) => {
      const active = entries.filter((entry) => entry.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!active || !altitudeReadout) return;
      altitudeReadout.textContent = `${active.target.dataset.cqAltitude} M`;
      altimeter?.style.setProperty("--cq-altitude", active.target.dataset.cqAltitude);
    }, { threshold: [.15,.35,.55,.75] });
    document.querySelectorAll("[data-cq-altitude]").forEach((node) => altitudeObserver.observe(node));
  } else {
    document.querySelectorAll(".cq-reveal").forEach((node) => node.classList.add("is-visible"));
  }

  const terrain = document.querySelector("[data-cq-terrain]");
  const bridges = document.querySelector("[data-cq-bridges]");
  const bridgeTrack = document.querySelector("[data-cq-bridge-track]");
  const bridgeProgress = document.querySelector("[data-cq-bridge-progress]");
  const transit = document.querySelector("[data-cq-transit]");
  const transitModes = [...document.querySelectorAll(".cq-transit-modes span")];
  const descend = document.querySelector("[data-cq-descend]");

  const progressIn = (element) => {
    if (!element) return 0;
    const rect = element.getBoundingClientRect();
    const distance = Math.max(1, element.offsetHeight - window.innerHeight);
    return Math.min(1, Math.max(0, -rect.top / distance));
  };

  const updateScrollScenes = () => {
    frame = 0;
    if (!reduced.matches) {
      const tp = progressIn(terrain);
      terrain?.style.setProperty("--terrain-progress", tp.toFixed(4));

      if (bridges && bridgeTrack && !mobile.matches) {
        const bp = progressIn(bridges);
        const travel = Math.max(0, bridgeTrack.scrollWidth - window.innerWidth);
        bridgeTrack.style.transform = `translate3d(${-travel * bp}px,0,0)`;
        if (bridgeProgress) bridgeProgress.style.transform = `scaleX(${bp})`;
      }

      if (transit && transitModes.length) {
        const p = progressIn(transit);
        const index = Math.min(transitModes.length - 1, Math.floor(p * transitModes.length));
        transitModes.forEach((node, i) => node.classList.toggle("is-active", i === index));
      }

      if (descend) {
        const dp = progressIn(descend);
        descend.style.setProperty("--descend-progress", dp.toFixed(4));
        const rect = descend.getBoundingClientRect();
        if (altitudeReadout && rect.top < window.innerHeight * .55 && rect.bottom > window.innerHeight * .4) {
          altitudeReadout.textContent = `${Math.round(315 - 141 * dp)} M`;
        }
      }
    }
  };

  const requestUpdate = () => { if (!frame) frame = requestAnimationFrame(updateScrollScenes); };
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  reduced.addEventListener?.("change", requestUpdate);
  mobile.addEventListener?.("change", requestUpdate);
  document.addEventListener("visibilitychange", () => { if (document.hidden) [heroVideo,...inlineVideos].forEach((video) => video?.pause()); });
  requestUpdate();
})();
