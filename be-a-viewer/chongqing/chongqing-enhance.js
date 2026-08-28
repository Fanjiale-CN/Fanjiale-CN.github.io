(() => {
  const VERSION = "20260828-cq-v4";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!document.querySelector('link[data-cq-enhance]')) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `/be-a-viewer/chongqing/chongqing-enhance.css?v=${VERSION}`;
    link.dataset.cqEnhance = "true";
    document.head.appendChild(link);
  }

  document.querySelectorAll('link[href*="pexels"], a[href*="pexels.com"]').forEach((node) => node.remove());

  const skip = document.querySelector(".skip-link");
  const main = document.querySelector("#main-content");
  if (skip && main) skip.addEventListener("click", (event) => {
    event.preventDefault(); main.focus({ preventScroll: true }); main.scrollIntoView({ block: "start" }); skip.blur();
  });

  const localVideos = [
    "/assets/video/chongqing/rail.mp4",
    "/assets/video/chongqing/train-red-bridge.mp4",
    "/assets/video/chongqing/bridge-skyline.mp4"
  ];

  document.querySelectorAll("video").forEach((video) => {
    video.removeAttribute("data-src"); video.removeAttribute("data-mobile-src");
    video.muted = true; video.defaultMuted = true; video.playsInline = true; video.setAttribute("playsinline", "");
    video.preload = "metadata";
  });

  const hero = document.querySelector("[data-cq-hero-video]");
  if (hero) { hero.src = localVideos[0]; hero.controls = false; if (!reduced.matches) hero.play().catch(() => {}); }
  const transit = document.querySelector("[data-cq-inline-video]");
  if (transit) { transit.src = localVideos[1]; transit.controls = true; }

  if (!document.querySelector(".cq-motion-lab")) {
    const section = document.createElement("section");
    section.className = "cq-motion-lab";
    section.dataset.cqAltitude = "252";
    section.innerHTML = `<header class="cq-mini-head"><p>04B / MOTION STUDIES</p><h2>THE CITY<br>MOVES IN SECTION.</h2><span>Three clips from the supplied Chongqing pack: rail, red bridge and skyline. All are self-hosted.</span></header><div class="cq-motion-grid">${localVideos.map((src,i)=>`<figure class="cq-motion-card"><video muted loop playsinline controls preload="metadata" src="${src}"></video><figcaption><span>0${i+1}</span><b>${["LIGHT RAIL / HEIGHT","TRAIN / RED BRIDGE","BRIDGE / SKYLINE"][i]}</b></figcaption></figure>`).join("")}</div>`;
    document.querySelector(".cq-transit")?.insertAdjacentElement("afterend", section);
  }

  if (!document.querySelector(".cq-expanded")) {
    const labels = ["NIGHT GRID","RIVERFRONT","BRIDGE","I AM IN CHONGQING","OLD ROOFS","STREET FOOD","METRO PLATFORM","MONORAIL / BUILDINGS","HONGYADONG","TEMPLE / SKYLINE","HOT POT","CABLE / BRIDGE","CROWD / SLOPE","MONORAIL","CITY / BRIDGE","VERTICAL SHAFT"];
    const section = document.createElement("section");
    section.className = "cq-expanded";
    section.dataset.cqAltitude = "264";
    section.innerHTML = `<header class="cq-mini-head"><p>06B / MORE GROUND</p><h2>THE PACK<br>OPENS UP.</h2><span>Sixteen more frames from the supplied archive: food, rail, roofs, crowds, bridges and the river edge.</span></header><div class="cq-atlas-grid">${labels.map((label,i)=>`<figure class="cq-atlas-card cq-slice-${String(i).padStart(2,"0")}" role="img" aria-label="${label}"><figcaption><span>${String(i+1).padStart(2,"0")}</span><b>${label}</b><small>USER ARCHIVE</small></figcaption></figure>`).join("")}</div>`;
    document.querySelector(".cq-life")?.insertAdjacentElement("afterend", section);
  }

  const observer = "IntersectionObserver" in window ? new IntersectionObserver((entries) => entries.forEach((entry) => {
    const video = entry.target;
    if (!entry.isIntersecting && !video.paused) video.pause();
  }), { threshold: .02 }) : null;
  document.querySelectorAll(".cq-motion-card video").forEach((video) => observer?.observe(video));
})();
