(() => {
  const VERSION = "20260828-cq-v5";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  const addStylesheet = (href, marker) => {
    if (document.querySelector(`link[${marker}]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.setAttribute(marker, "true");
    document.head.appendChild(link);
  };
  addStylesheet(`/be-a-viewer/chongqing/chongqing-enhance.css?v=${VERSION}`, "data-cq-enhance");
  addStylesheet(`/be-a-viewer/chongqing/chongqing-local.css?v=${VERSION}`, "data-cq-local");

  document.querySelectorAll('link[href*="pexels"], a[href*="pexels.com"]').forEach((node) => node.remove());

  const decodeAsset = async (url, type = "image/webp") => {
    const encoded = await fetch(url, { cache: "force-cache" }).then((response) => {
      if (!response.ok) throw new Error(`asset ${response.status}`);
      return response.text();
    });
    const binary = atob(encoded.trim());
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return URL.createObjectURL(new Blob([bytes], { type }));
  };

  const paintAtlas = (atlasUrl) => {
    const positions = [0, 33.333, 66.667, 100];
    document.querySelectorAll(".cq-local-slice, .cq-atlas-card").forEach((node) => {
      const match = [...node.classList].find((name) => /^cq-slice-\d{2}$/.test(name));
      if (!match) return;
      const index = Number(match.slice(-2));
      const x = positions[index % 4];
      const y = positions[Math.floor(index / 4)];
      node.style.backgroundImage = `url("${atlasUrl}")`;
      node.style.backgroundSize = "400% 400%";
      node.style.backgroundPosition = `${x}% ${y}%`;
      node.style.backgroundRepeat = "no-repeat";
    });
  };

  Promise.all([
    decodeAsset(`/assets/be-a-viewer/chongqing/field-atlas-v2.webp.b64?v=${VERSION}`),
    decodeAsset(`/assets/be-a-viewer/chongqing/cable-car-v2.webp.b64?v=${VERSION}`)
  ]).then(([atlasUrl, cableUrl]) => {
    paintAtlas(atlasUrl);
    const cable = document.querySelector(".cq-local-cable");
    if (cable) {
      cable.src = cableUrl;
      cable.removeAttribute("srcset");
      cable.alt = "Red Chongqing Yangtze River Cableway cabin from the supplied Chongqing archive";
    }
  }).catch(() => {});

  const skip = document.querySelector(".skip-link");
  const main = document.querySelector("#main-content");
  if (skip && main) skip.addEventListener("click", (event) => {
    event.preventDefault();
    main.focus({ preventScroll: true });
    main.scrollIntoView({ block: "start" });
    skip.blur();
  });

  const localVideos = [
    "/assets/video/chongqing/rail.mp4",
    "/assets/video/chongqing/train-red-bridge.mp4",
    "/assets/video/chongqing/bridge-skyline.mp4"
  ];

  document.querySelectorAll("video").forEach((video) => {
    video.removeAttribute("data-src");
    video.removeAttribute("data-mobile-src");
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.preload = "metadata";
  });

  const hero = document.querySelector("[data-cq-hero-video]");
  if (hero) {
    hero.src = localVideos[0];
    hero.controls = false;
    if (!reduced.matches) hero.play().catch(() => {});
  }
  const transit = document.querySelector("[data-cq-inline-video]");
  if (transit) {
    transit.src = localVideos[1];
    transit.controls = true;
  }

  if (!document.querySelector(".cq-motion-lab")) {
    const section = document.createElement("section");
    section.className = "cq-motion-lab";
    section.dataset.cqAltitude = "252";
    section.innerHTML = `<header class="cq-mini-head"><p>04B / MOTION STUDIES</p><h2>THE CITY<br>MOVES IN SECTION.</h2><span>Three clips from the supplied Chongqing pack: rail, red bridge and skyline. All are self-hosted.</span></header><div class="cq-motion-grid">${localVideos.map((src, i) => `<figure class="cq-motion-card"><video muted loop playsinline controls preload="metadata" src="${src}"></video><figcaption><span>0${i + 1}</span><b>${["LIGHT RAIL / HEIGHT", "TRAIN / RED BRIDGE", "BRIDGE / SKYLINE"][i]}</b></figcaption></figure>`).join("")}</div>`;
    document.querySelector(".cq-transit")?.insertAdjacentElement("afterend", section);
  }

  if (!document.querySelector(".cq-expanded")) {
    const labels = ["NIGHT GRID", "RIVERFRONT", "BRIDGE", "I AM IN CHONGQING", "OLD ROOFS", "STREET FOOD", "METRO PLATFORM", "MONORAIL / BUILDINGS", "HONGYADONG", "TEMPLE / SKYLINE", "HOT POT", "CABLE / BRIDGE", "CROWD / SLOPE", "MONORAIL", "CITY / BRIDGE", "VERTICAL SHAFT"];
    const section = document.createElement("section");
    section.className = "cq-expanded";
    section.dataset.cqAltitude = "264";
    section.innerHTML = `<header class="cq-mini-head"><p>06B / MORE GROUND</p><h2>THE PACK<br>OPENS UP.</h2><span>Sixteen more frames from the supplied archive: food, rail, roofs, crowds, bridges and the river edge.</span></header><div class="cq-atlas-grid">${labels.map((label, i) => `<figure class="cq-atlas-card cq-slice-${String(i).padStart(2, "0")}" role="img" aria-label="${label}"><figcaption><span>${String(i + 1).padStart(2, "0")}</span><b>${label}</b><small>USER ARCHIVE</small></figcaption></figure>`).join("")}</div>`;
    document.querySelector(".cq-life")?.insertAdjacentElement("afterend", section);
    Promise.allSettled([decodeAsset(`/assets/be-a-viewer/chongqing/field-atlas-v2.webp.b64?v=${VERSION}`)]).then(([result]) => {
      if (result.status === "fulfilled") paintAtlas(result.value);
    });
  }

  const observer = "IntersectionObserver" in window ? new IntersectionObserver((entries) => entries.forEach((entry) => {
    const video = entry.target;
    if (!entry.isIntersecting && !video.paused) video.pause();
  }), { threshold: .02 }) : null;
  document.querySelectorAll(".cq-motion-card video").forEach((video) => observer?.observe(video));
})();
