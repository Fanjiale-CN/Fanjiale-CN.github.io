const VERSION = "20260830-beijing-cinema1";
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const compact = window.matchMedia("(max-width: 820px)");
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));

const stylesheet = document.createElement("link");
stylesheet.rel = "stylesheet";
stylesheet.href = `/be-a-viewer/beijing/beijing-time.css?v=${VERSION}`;
document.head.append(stylesheet);

const commons = (file, width = 2400) =>
  `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(file)}?width=${width}`;

const cuts = [
  {
    chapter: "NOW", year: "2026", era: "BEIJING / PRESENT", mark: "NOW",
    title: "Begin at the center.",
    copy: "Beijing still faces a center shaped by walls, gates, palaces, streets and infrastructure built across very different ages.",
    image: "https://media.galok.me/cities/beijing/beijing-hero-poster--b135511e06f4.jpg",
    source: "GALOK / BEIJING FIELD FRAME", rights: "GALOK city media", href: "https://www.galok.me/be-a-viewer/beijing/",
    tone: "present", fit: "cover", scale: 1.05, x: 0, y: 0
  },
  {
    chapter: "ORIGIN", year: "c. 700,000 BP", era: "ZHOUKOUDIAN / HUMAN PRESENCE", mark: "700K",
    title: "Before the city, there were people.",
    copy: "At Zhoukoudian, caves and excavation layers preserve evidence of human occupation long before any capital existed here.",
    image: commons("Zhoukoudian 66032-Peking-Man-Site (28637019031).jpg", 2600),
    source: "WIKIMEDIA COMMONS / XIQUINHOSILVA", rights: "CC BY 2.0",
    href: "https://commons.wikimedia.org/wiki/File:Zhoukoudian_66032-Peking-Man-Site_(28637019031).jpg",
    tone: "relic", fit: "cover", scale: 1.06, x: 0, y: 0
  },
  {
    chapter: "YAN", year: "c. 1045 BCE", era: "LIULIHE / WESTERN ZHOU", mark: "YAN",
    title: "The city begins southwest of today's center.",
    copy: "Liulihe preserves the earliest known capital of Yan. Burials, chariot pits and bronze objects anchor Beijing's urban story in excavated ground.",
    image: commons("Liulihe bronze ding 3.jpg", 2600),
    source: "WIKIMEDIA COMMONS / BABELSTONE", rights: "CC BY-SA 3.0",
    href: "https://commons.wikimedia.org/wiki/File:Liulihe_bronze_ding_3.jpg",
    tone: "object", fit: "contain", scale: 1.0, x: 0, y: 0
  },
  {
    chapter: "LIAO", year: "1119–1120", era: "LIAO NANJING / TIANNING TEMPLE", mark: "LIAO",
    title: "A tower survives another capital.",
    copy: "The Tianning Temple Pagoda remains from the Liao period, a vertical fragment of a Beijing that occupied a different urban footprint.",
    image: commons("Tianning Temple Pagoda.jpg", 2800),
    source: "WIKIMEDIA COMMONS / BABELSTONE", rights: "CC BY-SA 3.0",
    href: "https://commons.wikimedia.org/wiki/File:Tianning_Temple_Pagoda.jpg",
    tone: "relic", fit: "cover", scale: 1.05, x: 0, y: -2
  },
  {
    chapter: "JIN", year: "12TH CENTURY", era: "JIN ZHONGDU / WATER GATE", mark: "JIN",
    title: "The next capital survives underground.",
    copy: "At the Zhongdu water gate site, masonry and infrastructure pull the Jin capital back out of the soil without reconstructing a vanished skyline.",
    image: commons("金中都水关遗址.JPG", 3000),
    source: "WIKIMEDIA COMMONS / SANLIE", rights: "CC BY-SA 4.0",
    href: "https://commons.wikimedia.org/wiki/File:%E9%87%91%E4%B8%AD%E9%83%BD%E6%B0%B4%E5%85%B3%E9%81%97%E5%9D%80.JPG",
    tone: "relic-dark", fit: "cover", scale: 1.08, x: 0, y: 0
  },
  {
    chapter: "YUAN", year: "1267 →", era: "YUAN DADU / EARTH WALL", mark: "DADU",
    title: "The capital moves north.",
    copy: "Dadu established a new geometry. Its rammed-earth wall survives as a low, almost abstract ridge inside the modern city.",
    image: commons("Grass taken in Yuan Dadu City Wall Ruins Park on May 7 2017(5).jpg", 3000),
    source: "WIKIMEDIA COMMONS / WUYUESHUSHENG", rights: "CC BY-SA 4.0",
    href: "https://commons.wikimedia.org/wiki/File:Grass_taken_in_Yuan_Dadu_City_Wall_Ruins_Park_on_May_7_2017(5).jpg",
    tone: "relic", fit: "cover", scale: 1.05, x: 0, y: 0
  },
  {
    chapter: "YUAN", year: "1271–1279", era: "MIAOYING TEMPLE / WHITE STUPA", mark: "1279",
    title: "One Yuan landmark still rises above the street.",
    copy: "The White Stupa survives above neighborhoods built by later dynasties, turning the lost Yuan capital into a visible point in today's Beijing.",
    image: commons("Miaoying Temple 1.jpg", 3000),
    source: "WIKIMEDIA COMMONS / EDITQ", rights: "CC0",
    href: "https://commons.wikimedia.org/wiki/File:Miaoying_Temple_1.jpg",
    tone: "relic", fit: "cover", scale: 1.06, x: 0, y: -1
  },
  {
    chapter: "MING", year: "1420", era: "MING BEIJING / FORBIDDEN CITY", mark: "1420",
    title: "A center takes the form we still recognize.",
    copy: "The Forbidden City completed a monumental center whose orientation, gates and sequence still organize how Beijing is read today.",
    image: "https://media.galok.me/cities/beijing/beijing-hero-poster--b135511e06f4.jpg",
    source: "GALOK / BEIJING FIELD FRAME", rights: "GALOK city media", href: "https://www.galok.me/be-a-viewer/beijing/",
    tone: "present", fit: "cover", scale: 1.1, x: 0, y: -2
  },
  {
    chapter: "WALLS", year: "MING → QING", era: "BEIJING CITY WALL / URBAN EDGE", mark: "WALL",
    title: "For centuries, the city had a hard edge.",
    copy: "Walls and gates defined where Beijing ended. That physical boundary becomes essential later, when infrastructure starts taking its place.",
    image: "https://cdn.loc.gov/service/pnp/stereo/1s10000/1s19000/1s19600/1s19625v.jpg",
    source: "LIBRARY OF CONGRESS / PEKING CITY WALL", rights: "No known restrictions on publication",
    href: "https://www.loc.gov/item/2006689672/",
    tone: "archive", fit: "contain", scale: 1.0, x: 0, y: 0
  },
  {
    chapter: "PHOTO", year: "1900", era: "PEKING / PHOTOGRAPHY ARRIVES", mark: "1900",
    title: "The past starts photographing itself.",
    copy: "From here onward, Beijing increasingly survives in photographs made in its own time. The page no longer depends on present-day ruins alone.",
    image: commons("111-SC-75080 (17716298160).jpg", 2600),
    source: "U.S. NATIONAL ARCHIVES / WU-MEN GATE", rights: "Public domain / U.S. government record",
    href: "https://commons.wikimedia.org/wiki/File:111-SC-75080_(17716298160).jpg",
    tone: "archive", fit: "contain", scale: 1.0, x: 0, y: 0
  },
  {
    chapter: "1919", year: "1919", era: "BEIJING STREET / CROWD", mark: "1919",
    title: "The street fills the frame.",
    copy: "A panoramic crowd turns the archive from static architecture into motion. Beijing is now visible as bodies moving through public space.",
    image: commons("1919 crowds on street in Beijing.jpg", 4000),
    source: "WIKIMEDIA COMMONS / HISTORICAL PHOTOGRAPH", rights: "Public domain in China and United States",
    href: "https://commons.wikimedia.org/wiki/File:1919_crowds_on_street_in_Beijing.jpg",
    tone: "archive", fit: "contain", scale: 1.0, x: 0, y: 0
  },
  {
    chapter: "1920s", year: "c. 1925", era: "REPUBLICAN PEKING / STREET", mark: "1925",
    title: "The archive becomes ordinary life.",
    copy: "A street scene pulls attention away from palaces toward transport, trade and daily movement: the city experienced at human height.",
    image: "https://cdn.loc.gov/service/pnp/cph/3c30000/3c37000/3c37000/3c37021v.jpg",
    source: "LIBRARY OF CONGRESS / CARPENTER COLLECTION", rights: "No known restrictions on publication",
    href: "https://www.loc.gov/item/2006689699/",
    tone: "archive", fit: "contain", scale: 1.0, x: 0, y: 0
  },
  {
    chapter: "1949", year: "1 OCT 1949", era: "FOUNDING CEREMONY / OBJECT RECORD", mark: "1949",
    title: "A new state is proclaimed in Beijing.",
    copy: "A high-resolution photograph of a loudspeaker used on Tiananmen Gate keeps the founding ceremony in the timeline without stretching uncertain low-resolution press photographs across the screen.",
    image: commons("开国大典喇叭.jpg", 3200),
    source: "WIKIMEDIA COMMONS / HUANOKINHEJO", rights: "CC BY-SA 4.0",
    href: "https://commons.wikimedia.org/wiki/File:%E5%BC%80%E5%9B%BD%E5%A4%A7%E5%85%B8%E5%96%87%E5%8F%AD.jpg",
    tone: "object", fit: "cover", scale: 1.03, x: 0, y: 0
  },
  {
    chapter: "1959", year: "1959", era: "BEIJING RAILWAY STATION / SURVIVING BUILDING", mark: "1959",
    title: "A new station stands beside the old city.",
    copy: "Opened in 1959, Beijing Railway Station marks the growing scale of the capital. This cut uses a current photograph of the surviving building rather than an uncertain archival substitute.",
    image: commons("Beijing Railway Station (20210521181346).jpg", 3000),
    source: "WIKIMEDIA COMMONS / N509FZ", rights: "CC BY-SA 4.0",
    href: "https://commons.wikimedia.org/wiki/File:Beijing_Railway_Station_(20210521181346).jpg",
    tone: "archive-site", fit: "cover", scale: 1.04, x: 0, y: 0
  },
  {
    chapter: "1967", year: "20 SEP 1967", era: "BEIJING SUBWAY / CORONA", mark: "1967",
    title: "The wall becomes a line.",
    copy: "A declassified CORONA satellite photograph records Beijing Subway construction along the old urban edge. Fortification is being replaced by infrastructure.",
    image: commons("Beijing Subway in Construction - satellite image (1967-09-20).jpg", 4400),
    source: "CIA / NRO / USGS / CORONA", rights: "Public domain / U.S. government work",
    href: "https://commons.wikimedia.org/wiki/File:Beijing_Subway_in_Construction_-_satellite_image_(1967-09-20).jpg",
    tone: "satellite", fit: "contain", scale: 1.0, x: -6, y: 0
  },
  {
    chapter: "1972", year: "1972", era: "STREET BEIJING / DAILY MOVEMENT", mark: "1972",
    title: "Return from orbit to the street.",
    copy: "Pedestrians, bicycles, automobiles and carts share the frame. The city becomes readable again at the scale of everyday movement.",
    image: commons("Street Views of Peking with Pedestrians, Bicyclists, Automobiles, and Carts - DPLA - dfb1476b2ed0a3ec3778a48e6feb53dd.tiff", 2800),
    source: "NIXON WHITE HOUSE PHOTO OFFICE / NARA", rights: "Public domain / U.S. government work",
    href: "https://commons.wikimedia.org/wiki/Category:1972_photographs_of_Beijing",
    tone: "archive", fit: "contain", scale: 1.0, x: 0, y: 0
  },
  {
    chapter: "1982", year: "1982", era: "BEIJING / COLOUR RETURNS", mark: "1982",
    title: "Colour changes the distance.",
    copy: "A U.S. government architectural record puts colour back into the timeline. The city starts to feel less archaeological and more like living memory.",
    image: commons("Beijing - Annex Office Building - 1982 - DPLA - 1abe053e98cbbbc7764800efe1609ad4.jpg", 2800),
    source: "U.S. DEPARTMENT OF STATE / NARA / DPLA", rights: "Public domain / U.S. government record",
    href: "https://commons.wikimedia.org/wiki/Category:1982_in_Beijing",
    tone: "late-archive", fit: "cover", scale: 1.03, x: 0, y: 0
  },
  {
    chapter: "1985", year: "1985", era: "BEIJING RAILWAY STATION", mark: "1985",
    title: "The same station. A different city.",
    copy: "Traffic, signage and crowds around Beijing Railway Station make modernization visible without needing a skyline montage.",
    image: commons("北京站1985.jpg", 1800),
    source: "WIKIMEDIA COMMONS / PIECEOFMETALWORK", rights: "CC BY-SA 4.0",
    href: "https://commons.wikimedia.org/wiki/File:%E5%8C%97%E4%BA%AC%E7%AB%991985.jpg",
    tone: "late-archive", fit: "cover", scale: 1.03, x: 0, y: 0
  },
  {
    chapter: "1995", year: "1995", era: "BICYCLE CITY / STREET LIFE", mark: "1995",
    title: "Two wheels fill the ordinary city.",
    copy: "A Beijing street scene catches bicycles, traffic, workers and street commerce together. Daily movement becomes the record of urban change.",
    image: commons("China 1995 - 8.jpg", 3000),
    source: "WIKIMEDIA COMMONS / KARL OPPOLZER", rights: "CC BY-SA 3.0",
    href: "https://commons.wikimedia.org/wiki/File:China_1995_-_8.jpg",
    tone: "late-archive", fit: "cover", scale: 1.04, x: 0, y: 0
  },
  {
    chapter: "2008", year: "2008", era: "QIANMEN / GLOBAL BEIJING", mark: "2008",
    title: "Old Beijing returns as a new image.",
    copy: "Qianmen is restored and reframed for a global audience. Preservation and reconstruction begin to occupy the same street.",
    image: commons("Beijing Qianmen 2008.jpg", 2400),
    source: "WIKIMEDIA COMMONS / GAO JING", rights: "Worldwide public domain dedication",
    href: "https://commons.wikimedia.org/wiki/File:Beijing_Qianmen_2008.jpg",
    tone: "digital", fit: "cover", scale: 1.04, x: 0, y: 0
  },
  {
    chapter: "NOW", year: "2026", era: "BEIJING / RETURN", mark: "NOW",
    title: "Return to the center.",
    copy: "Yan. Nanjing. Zhongdu. Dadu. Peking. Beijing. The names changed, the edge moved, and the center kept being rebuilt.",
    image: "https://media.galok.me/cities/beijing/beijing-hero-poster--b135511e06f4.jpg",
    source: "GALOK / BEIJING FIELD FRAME", rights: "GALOK city media", href: "https://www.galok.me/be-a-viewer/beijing/",
    tone: "present", fit: "cover", scale: 1.09, x: 0, y: -1
  }
];

const oldMap = document.querySelector(".cl-stage");
const anchor = oldMap || document.querySelector("#central-axis") || document.querySelector("[data-axis-explorer]");

if (anchor && !document.querySelector("[data-beijing-time-root]")) {
  const chapterEntries = [];
  cuts.forEach((cut, index) => {
    if (!chapterEntries.some((entry) => entry.name === cut.chapter)) chapterEntries.push({ name: cut.chapter, index });
  });

  const section = document.createElement("section");
  section.className = "beijing-time beijing-cinema";
  section.id = "beijing-time";
  section.dataset.beijingTimeRoot = "";
  section.setAttribute("aria-labelledby", "beijing-time-title");
  section.innerHTML = `
    <header class="beijing-time-intro beijing-time-reveal">
      <div class="beijing-time-intro__meta">
        <span>GALOK CINEMATIC ARCHIVE / BEIJING</span>
        <span>${cuts.length} VISUAL CUTS</span>
      </div>
      <div class="beijing-time-intro__grid">
        <h2 id="beijing-time-title">SCROLL<br>THROUGH<br>BEIJING.</h2>
        <div>
          <p>From prehistoric occupation and the first Yan capital to walls, historical photography, subway construction and the city today. Ancient cuts are anchored in real sites, excavations or directly related objects.</p>
          <span>SCROLL DOWN · THE PHOTOGRAPH IS THE TIMELINE</span>
        </div>
      </div>
    </header>

    <nav class="beijing-time-chapters" aria-label="Beijing cinematic archive chapters">
      <div class="beijing-time-chapters__track">
        ${chapterEntries.map((entry) => `<button type="button" data-beijing-time-jump="${entry.index}"><span>${entry.name}</span></button>`).join("")}
      </div>
      <button type="button" class="beijing-time-archive-button" data-beijing-time-open-archive>ARCHIVE +</button>
    </nav>

    <div class="beijing-time-story" data-beijing-time-story>
      <div class="beijing-time-stage" data-beijing-time-stage>
        <div class="beijing-time-media" data-beijing-time-media>
          <img class="beijing-time-frame beijing-time-frame--a is-visible" data-beijing-time-frame-a src="${cuts[0].image}" alt="Modern Beijing">
          <img class="beijing-time-frame beijing-time-frame--b" data-beijing-time-frame-b alt="">
          <div class="beijing-time-vignette" aria-hidden="true"></div>
          <div class="beijing-time-grain" aria-hidden="true"></div>
          <b class="beijing-time-mark" data-beijing-time-mark aria-hidden="true">${cuts[0].mark}</b>
        </div>

        <div class="beijing-time-readout" aria-live="polite">
          <div class="beijing-time-readout__top">
            <span data-beijing-time-era>${cuts[0].era}</span>
            <button type="button" data-beijing-time-current-source>VIEW SOURCE ↗</button>
          </div>
          <b data-beijing-time-year>${cuts[0].year}</b>
          <strong data-beijing-time-title>${cuts[0].title}</strong>
          <small data-beijing-time-source>${cuts[0].source} · ${cuts[0].rights}</small>
        </div>

        <div class="beijing-time-counter" aria-hidden="true">
          <span data-beijing-time-count>01</span><i></i><span>${String(cuts.length).padStart(2, "0")}</span>
        </div>
        <div class="beijing-time-progress" aria-hidden="true"><i data-beijing-time-progress></i></div>
      </div>

      <div class="beijing-time-steps">
        ${cuts.map((cut, index) => `
          <article class="beijing-time-step${index === 0 ? " is-active" : ""}" id="beijing-time-step-${index}" data-beijing-time-step="${index}">
            <span>${String(index + 1).padStart(2, "0")} / ${cut.era}</span>
            <b>${cut.year}</b>
            <h3>${cut.title}</h3>
            <p>${cut.copy}</p>
            <a href="${cut.href}" target="_blank" rel="noopener noreferrer">${cut.source} · ${cut.rights} ↗</a>
          </article>`).join("")}
      </div>
    </div>

    <footer class="beijing-time-outro beijing-time-reveal">
      <p>THE CITY MOVED. THE WALLS MOVED. THE CENTER REMAINED.</p>
      <h3>BEIJING IS STILL BEING REBUILT.</h3>
      <a href="#central-axis">CONTINUE TO BEIJING ↓</a>
    </footer>

    <dialog class="beijing-time-archive" data-beijing-time-archive aria-labelledby="beijing-time-archive-title">
      <div class="beijing-time-archive__head">
        <div><span>SECOND LAYER / SOURCES</span><h3 id="beijing-time-archive-title">ARCHIVE</h3></div>
        <button type="button" data-beijing-time-close-archive aria-label="Close archive">CLOSE ×</button>
      </div>
      <div class="beijing-time-archive__list">
        ${cuts.map((cut, index) => `<a href="${cut.href}" target="_blank" rel="noopener noreferrer"><span>${String(index + 1).padStart(2, "0")} · ${cut.year}</span><strong>${cut.era}</strong><small>${cut.source}<br>${cut.rights}</small></a>`).join("")}
      </div>
    </dialog>
  `;

  anchor.parentNode.insertBefore(section, anchor);
  oldMap?.remove();

  const heroEnter = document.querySelector(".beijing-hero-footer a");
  if (heroEnter) {
    heroEnter.href = "#beijing-time";
    heroEnter.innerHTML = 'ENTER THE ARCHIVE <span aria-hidden="true">↓</span>';
  }

  const story = section.querySelector("[data-beijing-time-story]");
  const stage = section.querySelector("[data-beijing-time-stage]");
  const media = section.querySelector("[data-beijing-time-media]");
  const stepNodes = [...section.querySelectorAll("[data-beijing-time-step]")];
  const frameA = section.querySelector("[data-beijing-time-frame-a]");
  const frameB = section.querySelector("[data-beijing-time-frame-b]");
  const yearNode = section.querySelector("[data-beijing-time-year]");
  const eraNode = section.querySelector("[data-beijing-time-era]");
  const titleNode = section.querySelector("[data-beijing-time-title]");
  const sourceNode = section.querySelector("[data-beijing-time-source]");
  const markNode = section.querySelector("[data-beijing-time-mark]");
  const countNode = section.querySelector("[data-beijing-time-count]");
  const progressNode = section.querySelector("[data-beijing-time-progress]");
  const sourceButton = section.querySelector("[data-beijing-time-current-source]");
  const archive = section.querySelector("[data-beijing-time-archive]");

  let activeFrame = frameA;
  let inactiveFrame = frameB;
  let activeStep = 0;
  let activeImage = cuts[0].image;
  let pendingImage = "";
  let mediaToken = 0;
  let animationFrame = 0;

  function applyFrameStyle(node, cut) {
    if (!node) return;
    node.dataset.tone = cut.tone;
    node.dataset.fit = cut.fit;
    node.style.setProperty("--beijing-time-scale", String(cut.scale ?? 1));
    node.style.setProperty("--beijing-time-x", `${cut.x ?? 0}%`);
    node.style.setProperty("--beijing-time-y", `${cut.y ?? 0}%`);
  }

  applyFrameStyle(activeFrame, cuts[0]);
  media.dataset.tone = cuts[0].tone;

  function preloadAround(index) {
    [cuts[index - 2], cuts[index - 1], cuts[index + 1], cuts[index + 2]].filter(Boolean).forEach((cut) => {
      const image = new Image();
      image.decoding = "async";
      image.fetchPriority = "low";
      image.src = cut.image;
    });
  }

  function setFrame(cut) {
    const next = cut.image;
    media.dataset.tone = cut.tone;
    if (next === activeImage) {
      mediaToken += 1;
      pendingImage = "";
      applyFrameStyle(activeFrame, cut);
      return;
    }
    if (next === pendingImage) {
      applyFrameStyle(inactiveFrame, cut);
      return;
    }

    const token = ++mediaToken;
    pendingImage = next;
    inactiveFrame.src = next;
    inactiveFrame.alt = `${cut.year} — ${cut.era}`;
    applyFrameStyle(inactiveFrame, cut);

    const reveal = () => {
      if (token !== mediaToken || pendingImage !== next) return;
      inactiveFrame.classList.add("is-visible");
      activeFrame.classList.remove("is-visible");
      [activeFrame, inactiveFrame] = [inactiveFrame, activeFrame];
      activeImage = next;
      pendingImage = "";
    };

    if (inactiveFrame.complete) requestAnimationFrame(reveal);
    else inactiveFrame.addEventListener("load", reveal, { once: true });
  }

  function setStep(index) {
    const safeIndex = clamp(Number(index) || 0, 0, cuts.length - 1);
    const cut = cuts[safeIndex];
    activeStep = safeIndex;
    stepNodes.forEach((node, nodeIndex) => node.classList.toggle("is-active", nodeIndex === safeIndex));
    section.querySelectorAll("[data-beijing-time-jump]").forEach((button) => {
      const chapterIndex = Number(button.dataset.beijingTimeJump);
      button.classList.toggle("is-active", cuts[chapterIndex]?.chapter === cut.chapter);
    });
    yearNode.textContent = cut.year;
    eraNode.textContent = cut.era;
    titleNode.textContent = cut.title;
    sourceNode.textContent = `${cut.source} · ${cut.rights}`;
    markNode.textContent = cut.mark;
    countNode.textContent = String(safeIndex + 1).padStart(2, "0");
    sourceButton.dataset.href = cut.href;
    setFrame(cut);
    preloadAround(safeIndex);
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setStep(Number(visible.target.dataset.beijingTimeStep));
    }, { rootMargin: "-31% 0px -31% 0px", threshold: [0, .12, .32, .58] });
    stepNodes.forEach((node) => observer.observe(node));
  } else setStep(0);

  section.querySelectorAll("[data-beijing-time-jump]").forEach((button) => {
    button.addEventListener("click", () => {
      stepNodes[Number(button.dataset.beijingTimeJump)]?.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: compact.matches ? "center" : "center"
      });
    });
  });

  sourceButton?.addEventListener("click", () => {
    const href = sourceButton.dataset.href;
    if (href) window.open(href, "_blank", "noopener,noreferrer");
  });

  section.querySelector("[data-beijing-time-open-archive]")?.addEventListener("click", () => archive?.showModal());
  section.querySelector("[data-beijing-time-close-archive]")?.addEventListener("click", () => archive?.close());
  archive?.addEventListener("click", (event) => { if (event.target === archive) archive.close(); });

  function updateProgress() {
    animationFrame = 0;
    if (!story) return;
    const rect = story.getBoundingClientRect();
    const travel = Math.max(1, rect.height - window.innerHeight);
    const progress = clamp(-rect.top / travel);
    progressNode.style.transform = `scaleX(${progress})`;
    section.style.setProperty("--beijing-time-depth", progress.toFixed(4));

    if (!reducedMotion && stage && activeFrame) {
      const activeNode = stepNodes[activeStep];
      if (activeNode) {
        const local = clamp((window.innerHeight * .5 - activeNode.getBoundingClientRect().top) / Math.max(1, activeNode.offsetHeight));
        activeFrame.style.setProperty("--beijing-time-ken", `${(local - .5) * 1.2}%`);
      }
    }
  }

  function requestProgressUpdate() {
    if (animationFrame) return;
    animationFrame = requestAnimationFrame(updateProgress);
  }

  window.addEventListener("scroll", requestProgressUpdate, { passive: true });
  window.addEventListener("resize", requestProgressUpdate);
  requestProgressUpdate();

  const revealNodes = [...section.querySelectorAll(".beijing-time-reveal")];
  if (reducedMotion || !("IntersectionObserver" in window)) revealNodes.forEach((node) => node.classList.add("is-visible"));
  else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: .06 });
    revealNodes.forEach((node) => revealObserver.observe(node));
  }
}
