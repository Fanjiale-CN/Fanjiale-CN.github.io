const VERSION = "20260830-cinema2";
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const compact = window.matchMedia("(max-width: 820px)");
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));

const stylesheet = document.createElement("link");
stylesheet.rel = "stylesheet";
stylesheet.href = `/be-a-viewer/xian/xian-time.css?v=${VERSION}`;
document.head.append(stylesheet);

const commons = (file, width = 1920) =>
  `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(file)}?width=${width}`;

const steps = [
  {
    chapter: "NOW", year: "2025", era: "XI’AN / PRESENT", mark: "NOW",
    title: "Start at the gate.", copy: "Yongning Gate still stands at the centre of Xi’an. From here, the sequence moves backward through surviving sites, archaeological excavations, and historical photography.",
    image: "https://media.galok.me/cities/xian/city-wall-skyline--7eda7148ec5d.jpeg",
    source: "GALOK / XI’AN FIELD FRAME", rights: "GALOK city media",
    href: "https://www.galok.me/be-a-viewer/xian/", tone: "present", fit: "cover", scale: 1.05, x: 0, y: 0
  },
  {
    chapter: "ORIGIN", year: "c. 4800 BCE", era: "BANPO / NEOLITHIC", mark: "BANPO",
    title: "Before the capital, there was a settlement.", copy: "Banpo preserves house foundations, kilns, and traces of settlement. There was no city yet, but people had already been living on this ground for generations.",
    image: commons("Banpo.jpg"), source: "WIKIMEDIA COMMONS / EECC", rights: "Public domain",
    href: "https://commons.wikimedia.org/wiki/File:Banpo.jpg", tone: "relic", fit: "cover", scale: 1.03, x: 0, y: 0
  },
  {
    chapter: "ZHOU", year: "c. 1046 BCE", era: "FENG / WESTERN ZHOU", mark: "ZHOU",
    title: "The capital moves onto the plain.", copy: "The Fengjing carriage pit brings the Western Zhou capital back from text into physical ground. The wooden vehicles are gone; wheel traces, horse bones, and soil layers remain.",
    image: commons("Western Zhou dynasty Carriages pit2 Xi'an.JPG"), source: "WIKIMEDIA COMMONS / DANIELINBLUE", rights: "CC BY-SA 3.0",
    href: "https://commons.wikimedia.org/wiki/File:Western_Zhou_dynasty_Carriages_pit2_Xi%27an.JPG", tone: "relic", fit: "cover", scale: 1.06, x: 0, y: 1
  },
  {
    chapter: "QIN", year: "221 BCE", era: "QIN / LINTONG", mark: "QIN",
    title: "A hill holds an unopened world.", copy: "The burial mound of Qin Shi Huang still rises above the plain. The camera pauses at the surface before descending into the parts of the underground complex that have been uncovered.",
    image: commons("秦始皇帝陵·秦始皇陵·西安臨潼·（封土正北側）.jpg"), source: "WIKIMEDIA COMMONS / LEGOLAS1024", rights: "CC BY-SA 4.0",
    href: "https://commons.wikimedia.org/wiki/File:%E7%A7%A6%E5%A7%8B%E7%9A%87%E5%B8%9D%E9%99%B5%C2%B7%E7%A7%A6%E5%A7%8B%E7%9A%87%E9%99%B5%C2%B7%E8%A5%BF%E5%AE%89%E8%87%A8%E6%BD%BC%C2%B7%EF%BC%88%E5%B0%81%E5%9C%9F%E6%AD%A3%E5%8C%97%E5%81%B4%EF%BC%89.jpg",
    tone: "relic", fit: "cover", scale: 1.08, x: 0, y: 1
  },
  {
    chapter: "QIN", year: "1974 →", era: "TERRACOTTA ARMY / PIT 1", mark: "QIN",
    title: "The underground army enters the light.", copy: "Pit 1 reveals the army at full scale. As the page moves, the view advances from the massed formation toward the terracotta figures themselves.",
    image: commons("Terracotta Army, View of Pit 1.jpg"), source: "WIKIMEDIA COMMONS / JEAN-MARIE HULLOT", rights: "CC BY 3.0",
    href: "https://commons.wikimedia.org/wiki/File:Terracotta_Army,_View_of_Pit_1.jpg", tone: "relic", fit: "cover", scale: 1.04, x: 0, y: 0
  },
  {
    chapter: "QIN", year: "221–206 BCE", era: "TERRACOTTA ARMY / DETAIL", mark: "QIN",
    title: "One army. Thousands of faces.", copy: "Close views bring the army back to human scale: hairstyles, armour plates, postures, and expressions all vary from figure to figure.",
    image: commons("Teracotta army pit 1 20090717-12.JPG", 1600), source: "WIKIMEDIA COMMONS / HANS A. ROSBACH", rights: "CC BY-SA 3.0",
    href: "https://commons.wikimedia.org/wiki/File:Teracotta_army_pit_1_20090717-12.JPG", tone: "relic", fit: "cover", scale: 1.12, x: 0, y: 4
  },
  {
    chapter: "HAN", year: "206 BCE →", era: "HAN CHANG’AN / WEIYANG", mark: "HAN",
    title: "The palace is gone. Its scale is not.", copy: "Only the vast platform and terrain of Weiyang Palace’s Front Hall remain. Once the architecture disappears, scale becomes the clearest evidence.",
    image: commons("Weiyang Palace site.JPG"), source: "WIKIMEDIA COMMONS / DANIELINBLUE", rights: "CC BY-SA 3.0",
    href: "https://commons.wikimedia.org/wiki/File:Weiyang_Palace_site.JPG", tone: "relic", fit: "cover", scale: 1.06, x: 0, y: 0
  },
  {
    chapter: "HAN", year: "153 BCE →", era: "HAN YANGLING / UNDERGROUND", mark: "HAN",
    title: "An empire reduced to daily life.", copy: "The burial pits at Yangling contain attendants, animals, and miniature fragments of everyday life. The underground world shifts from an army to a society.",
    image: commons("Yangling 01.jpg"), source: "WIKIMEDIA COMMONS / BRÜCKE-OSTEUROPA", rights: "CC BY-SA 3.0",
    href: "https://commons.wikimedia.org/wiki/File:Yangling_01.jpg", tone: "relic", fit: "cover", scale: 1.08, x: 0, y: 1
  },
  {
    chapter: "SUI", year: "582 →", era: "DAXING / MINGDE GATE SITE", mark: "SUI",
    title: "A new capital is drawn on new ground.", copy: "The Mingde Gate site belongs to the Sui Daxing–Tang Chang’an urban system. It bridges the move from Han Chang’an to the capital of the Sui and Tang.",
    image: commons("隋大兴唐长安城遗址-明德门 2023-09-30 10.jpg"), source: "WIKIMEDIA COMMONS / KCX36", rights: "CC BY-SA 4.0",
    href: "https://commons.wikimedia.org/wiki/File:%E9%9A%8B%E5%A4%A7%E5%85%B4%E5%94%90%E9%95%BF%E5%AE%89%E5%9F%8E%E9%81%97%E5%9D%80-%E6%98%8E%E5%BE%B7%E9%97%A8_2023-09-30_10.jpg",
    tone: "relic", fit: "cover", scale: 1.06, x: 0, y: 0
  },
  {
    chapter: "TANG", year: "618–907", era: "DÁMÍNG PALACE / HANYUAN HALL", mark: "TANG",
    title: "The palace returns as a horizon.", copy: "The Hanyuan Hall site restores the scale of Tang Chang’an. Platforms, ramps, and the distant horizon are enough; no reconstruction is needed.",
    image: commons("Daming Palace Hanyuan Hall Site.jpg"), source: "WIKIMEDIA COMMONS / DANIELINBLUE", rights: "CC BY-SA 3.0",
    href: "https://commons.wikimedia.org/wiki/File:Daming_Palace_Hanyuan_Hall_Site.jpg", tone: "relic", fit: "cover", scale: 1.04, x: 0, y: 0
  },
  {
    chapter: "TANG", year: "1911", era: "GIANT WILD GOOSE PAGODA / ARCHIVE", mark: "PAGODA",
    title: "Photography finally reaches the monument.", copy: "At the Giant Wild Goose Pagoda, the sequence shifts from present-day photographs of ancient remains to an actual historical photograph. The medium itself now becomes part of the timeline.",
    image: commons("西安府大雁塔.jpg", 1600), source: "WIKIMEDIA COMMONS / EIGHTEEN CAPITALS OF CHINA", rights: "Public domain",
    href: "https://commons.wikimedia.org/wiki/File:%E8%A5%BF%E5%AE%89%E5%BA%9C%E5%A4%A7%E9%9B%81%E5%A1%94.jpg", tone: "archive", fit: "contain", scale: 1.0, x: 0, y: 0
  },
  {
    chapter: "MING", year: "14th c. →", era: "XI’AN CITY WALL / SURVIVAL", mark: "CITY",
    title: "The city contracts behind a wall.", copy: "The Ming wall pulled the later city of Xi’an into a tighter enclosure. It was far smaller than Sui–Tang Chang’an, yet it remains the clearest historical boundary in the city today.",
    image: commons("1 xian city wall 2011.jpg"), source: "WIKIMEDIA COMMONS / CHENSIYUAN", rights: "GFDL / CC BY-SA",
    href: "https://commons.wikimedia.org/wiki/File:1_xian_city_wall_2011.jpg", tone: "present", fit: "cover", scale: 1.04, x: 0, y: 0
  },
  {
    chapter: "ARCHIVE", year: "1907", era: "DUANLI GATE / HISTORICAL PHOTO", mark: "ARCHIVE",
    title: "The past starts photographing itself.", copy: "From here, the sequence no longer depends on photographs taken in the present. A 1907 image of the gate takes us directly into the Xi’an seen by that camera.",
    image: commons("Duan Li Men, Xi'an, 1907.jpg", 1600), source: "WIKIMEDIA COMMONS / ÉDOUARD CHAVANNES", rights: "Public domain",
    href: "https://commons.wikimedia.org/wiki/File:Duan_Li_Men,_Xi%27an,_1907.jpg", tone: "archive", fit: "contain", scale: 1.0, x: 0, y: 0
  },
  {
    chapter: "ARCHIVE", year: "c. 1908", era: "CITY WALL / JOHN SHIELDS", mark: "ARCHIVE",
    title: "A wall before traffic and neon.", copy: "This photograph from around 1908 preserves the relationship between road, terrain, and wall. Its original proportions are kept intact rather than cropped into a generic web background.",
    image: commons("Xi'an walls.jpg", 1800), source: "WIKIMEDIA COMMONS / JOHN SHIELDS", rights: "Public domain",
    href: "https://commons.wikimedia.org/wiki/File:Xi%27an_walls.jpg", tone: "archive", fit: "contain", scale: 1.0, x: 0, y: 0
  },
  {
    chapter: "ARCHIVE", year: "1911", era: "PRIVATE COURTYARD / XI’AN", mark: "1911",
    title: "History moves indoors.", copy: "The courtyard shifts the timeline away from palaces, walls, and regimes toward ordinary domestic space. History continues across thresholds, tree shadows, and brick paving.",
    image: commons("西安府私人庭院.jpg", 1800), source: "WIKIMEDIA COMMONS / EIGHTEEN CAPITALS OF CHINA", rights: "Public domain",
    href: "https://commons.wikimedia.org/wiki/File:%E8%A5%BF%E5%AE%89%E5%BA%9C%E7%A7%81%E4%BA%BA%E5%BA%AD%E9%99%A2.jpg", tone: "archive", fit: "contain", scale: 1.0, x: 0, y: 0
  },
  {
    chapter: "1936", year: "12 DEC 1936", era: "XI’AN INCIDENT / ZHANG RESIDENCE", mark: "1936",
    title: "A house becomes a national political scene.", copy: "This chapter uses the surviving site of the Xi’an Incident and lets the place carry the history, avoiding unstable or poorly licensed historical image collages.",
    image: commons("Former Residence of Zhang Xueliang 張學良故居 - panoramio.jpg"), source: "WIKIMEDIA COMMONS / LIENYUAN LEE", rights: "CC BY-SA",
    href: "https://commons.wikimedia.org/wiki/File:Former_Residence_of_Zhang_Xueliang_%E5%BC%B5%E5%AD%B8%E8%89%AF%E6%95%85%E5%B1%85_-_panoramio.jpg",
    tone: "archive-site", fit: "cover", scale: 1.04, x: 0, y: 0
  },
  {
    chapter: "1950s", year: "1959", era: "PUBLIC LIFE / PARADE", mark: "CITY",
    title: "The city begins to spill beyond the old wall.", copy: "A 1959 photograph records public life in the city. Its source image is modest in resolution, so the shot stays brief and avoids aggressive enlargement.",
    image: commons("China 10th Anniversary Parade in Xi'an.jpg", 1200), source: "WIKIMEDIA COMMONS / 10TH ANNIVERSARY COLLECTION", rights: "Public domain",
    href: "https://commons.wikimedia.org/wiki/File:China_10th_Anniversary_Parade_in_Xi%27an.jpg", tone: "archive", fit: "contain", scale: 1.0, x: 0, y: 0
  },
  {
    chapter: "1980s", year: "1985", era: "XI’AN / SOUTH AERIAL VIEW", mark: "1985",
    title: "Colour returns.", copy: "The 1985 aerial view places the wall, roads, and expanding districts in one colour frame. The photographic medium is beginning to resemble the present.",
    image: commons("Xi'an aerial view 1985.jpg", 1600), source: "WIKIMEDIA COMMONS / PIECEOFMETALWORK", rights: "CC BY-SA 4.0",
    href: "https://commons.wikimedia.org/wiki/File:Xi%27an_aerial_view_1985.jpg", tone: "late-archive", fit: "cover", scale: 1.06, x: 0, y: 0
  },
  {
    chapter: "1990s", year: "1996", era: "STREET / MARKET", mark: "1996",
    title: "The archive becomes ordinary again.", copy: "Markets, crowds, and streets return the archive to ordinary life. By the mid-1990s, Xi’an already looks increasingly like the modern city held in living memory.",
    image: commons("1996 -253-27 Xian market (5068475729).jpg", 1600), source: "WIKIMEDIA COMMONS / 1996 CITY RECORD", rights: "Open license · source record",
    href: "https://commons.wikimedia.org/wiki/File:1996_-253-27_Xian_market_(5068475729).jpg", tone: "late-archive", fit: "cover", scale: 1.04, x: 0, y: 0
  },
  {
    chapter: "2000s", year: "2006", era: "CENTRAL XI’AN / STREET", mark: "2006",
    title: "Digital Xi’an arrives.", copy: "Early digital photography records signs, vehicles, and street life with new clarity. The visual distance between archive and present has become very short.",
    image: commons("Xian street 2006.JPG", 1800), source: "WIKIMEDIA COMMONS / DON-KUN", rights: "CC BY 3.0",
    href: "https://commons.wikimedia.org/wiki/File:Xian_street_2006.JPG", tone: "digital", fit: "cover", scale: 1.04, x: 0, y: 0
  },
  {
    chapter: "NOW", year: "2025", era: "YONGNINGMEN / RETURN", mark: "NOW",
    title: "Return to the gate.", copy: "More than three millennia of capital history did not leave one complete city behind. It left layers of places that can still be seen, crossed, and inhabited.",
    image: "https://media.galok.me/cities/xian/city-wall-skyline--7eda7148ec5d.jpeg",
    source: "GALOK / XI’AN FIELD FRAME", rights: "GALOK city media",
    href: "https://www.galok.me/be-a-viewer/xian/", tone: "present", fit: "cover", scale: 1.08, x: 0, y: 0
  }
];

const anchor = document.querySelector("#arrival") || document.querySelector(".xian-editorial-section");
if (anchor && !document.querySelector("[data-xian-time-root]")) {
  const chapters = [...new Set(steps.map((step) => step.chapter))];
  const section = document.createElement("section");
  section.className = "xian-time xian-cinema";
  section.id = "xian-time";
  section.dataset.xianTimeRoot = "";
  section.setAttribute("aria-labelledby", "xian-time-title");
  section.innerHTML = `
    <header class="xian-time-intro xian-time-reveal">
      <div class="xian-time-intro__meta">
        <span>GALOK CINEMATIC ARCHIVE / XI’AN</span>
        <span>${steps.length} VISUAL CUTS</span>
      </div>
      <div class="xian-time-intro__grid">
        <h2 id="xian-time-title">SCROLL<br>THROUGH<br>XI’AN.</h2>
        <div>
          <p>From Banpo, the Western Zhou, Qin and Han, through the Sui–Tang capital, into twentieth-century historical photography and back to the present. Nothing here invents a vanished city; the sequence looks only at what has genuinely survived.</p>
          <span>SCROLL DOWN · PHOTOGRAPHS ARE THE TIMELINE</span>
        </div>
      </div>
    </header>

    <nav class="xian-time-chapters" aria-label="Xi’an cinematic archive chapters">
      ${chapters.map((chapter) => {
        const index = steps.findIndex((step) => step.chapter === chapter);
        return `<button type="button" data-xian-time-jump="${index}"><span>${chapter}</span></button>`;
      }).join("")}
      <button type="button" class="xian-time-archive-button" data-xian-time-open-archive>ARCHIVE +</button>
    </nav>

    <div class="xian-time-story" data-xian-time-story>
      <div class="xian-time-stage" data-xian-time-stage>
        <div class="xian-time-media" data-xian-time-media>
          <img class="xian-time-frame xian-time-frame--a is-visible" data-xian-time-frame-a src="${steps[0].image}" alt="Modern Xi’an city wall and skyline">
          <img class="xian-time-frame xian-time-frame--b" data-xian-time-frame-b alt="">
          <div class="xian-time-shutter" aria-hidden="true"></div>
          <div class="xian-time-grain" aria-hidden="true"></div>
          <b class="xian-time-mark" data-xian-time-mark aria-hidden="true">${steps[0].mark}</b>
        </div>

        <div class="xian-time-readout" aria-live="polite">
          <div class="xian-time-readout__top">
            <span data-xian-time-era>${steps[0].era}</span>
            <button type="button" data-xian-time-current-source>VIEW SOURCE ↗</button>
          </div>
          <b data-xian-time-year>${steps[0].year}</b>
          <strong data-xian-time-title>${steps[0].title}</strong>
          <small data-xian-time-source>${steps[0].source} · ${steps[0].rights}</small>
        </div>

        <div class="xian-time-counter" aria-hidden="true">
          <span data-xian-time-count>01</span><i></i><span>${String(steps.length).padStart(2, "0")}</span>
        </div>
        <div class="xian-time-progress" aria-hidden="true"><i data-xian-time-progress></i></div>
      </div>

      <div class="xian-time-steps">
        ${steps.map((step, index) => `
          <article class="xian-time-step${index === 0 ? " is-active" : ""}" id="xian-time-step-${index}" data-xian-time-step="${index}">
            <span>${String(index + 1).padStart(2, "0")} / ${step.era}</span>
            <b>${step.year}</b>
            <h3>${step.title}</h3>
            <p>${step.copy}</p>
            <a href="${step.href}" target="_blank" rel="noopener noreferrer">${step.source} · ${step.rights} ↗</a>
          </article>`).join("")}
      </div>
    </div>

    <footer class="xian-time-outro xian-time-reveal">
      <p>THE CITY DID NOT KEEP ONE AGE.</p>
      <h3>IT LEFT MANY AGES ON THE SAME GROUND.</h3>
      <a href="#arrival">CONTINUE TO XI’AN ↓</a>
    </footer>

    <dialog class="xian-time-archive" data-xian-time-archive aria-labelledby="xian-time-archive-title">
      <div class="xian-time-archive__head">
        <div><span>SECOND LAYER / SOURCES</span><h3 id="xian-time-archive-title">ARCHIVE</h3></div>
        <button type="button" data-xian-time-close-archive aria-label="Close archive">CLOSE ×</button>
      </div>
      <div class="xian-time-archive__list">
        ${steps.map((step, index) => `
          <a href="${step.href}" target="_blank" rel="noopener noreferrer">
            <span>${String(index + 1).padStart(2, "0")} · ${step.year}</span>
            <strong>${step.era}</strong>
            <small>${step.source}<br>${step.rights}</small>
          </a>`).join("")}
      </div>
    </dialog>
  `;

  anchor.parentNode.insertBefore(section, anchor);

  const heroEnter = document.querySelector(".xian-hero > a");
  if (heroEnter) {
    heroEnter.href = "#xian-time";
    heroEnter.innerHTML = 'ENTER THE ARCHIVE <span aria-hidden="true">↓</span>';
  }

  const story = section.querySelector("[data-xian-time-story]");
  const stage = section.querySelector("[data-xian-time-stage]");
  const media = section.querySelector("[data-xian-time-media]");
  const stepNodes = [...section.querySelectorAll("[data-xian-time-step]")];
  const frameA = section.querySelector("[data-xian-time-frame-a]");
  const frameB = section.querySelector("[data-xian-time-frame-b]");
  const yearNode = section.querySelector("[data-xian-time-year]");
  const eraNode = section.querySelector("[data-xian-time-era]");
  const titleNode = section.querySelector("[data-xian-time-title]");
  const sourceNode = section.querySelector("[data-xian-time-source]");
  const markNode = section.querySelector("[data-xian-time-mark]");
  const countNode = section.querySelector("[data-xian-time-count]");
  const progressNode = section.querySelector("[data-xian-time-progress]");
  const sourceButton = section.querySelector("[data-xian-time-current-source]");
  const archive = section.querySelector("[data-xian-time-archive]");

  let activeFrame = frameA;
  let inactiveFrame = frameB;
  let activeStep = 0;
  let activeImage = steps[0].image;
  let pendingImage = "";
  let mediaToken = 0;
  let animationFrame = 0;

  function applyFrameStyle(node, step) {
    if (!node) return;
    node.dataset.tone = step.tone;
    node.dataset.fit = step.fit;
    node.style.setProperty("--xian-time-scale", String(step.scale ?? 1));
    node.style.setProperty("--xian-time-x", `${step.x ?? 0}%`);
    node.style.setProperty("--xian-time-y", `${step.y ?? 0}%`);
  }

  applyFrameStyle(activeFrame, steps[0]);
  media.dataset.tone = steps[0].tone;

  function preloadAround(index) {
    [steps[index - 1], steps[index + 1]].filter(Boolean).forEach((step) => {
      const image = new Image();
      image.decoding = "async";
      image.src = step.image;
    });
  }

  function setFrame(step) {
    const next = step.image;
    media.dataset.tone = step.tone;
    if (next === activeImage) {
      mediaToken += 1;
      pendingImage = "";
      applyFrameStyle(activeFrame, step);
      return;
    }
    if (next === pendingImage) {
      applyFrameStyle(inactiveFrame, step);
      return;
    }

    const token = ++mediaToken;
    pendingImage = next;
    inactiveFrame.src = next;
    inactiveFrame.alt = `${step.year} — ${step.era}`;
    applyFrameStyle(inactiveFrame, step);

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
    const safeIndex = clamp(Number(index) || 0, 0, steps.length - 1);
    const step = steps[safeIndex];
    activeStep = safeIndex;
    stepNodes.forEach((node, nodeIndex) => node.classList.toggle("is-active", nodeIndex === safeIndex));
    section.querySelectorAll("[data-xian-time-jump]").forEach((button) => {
      const chapterIndex = Number(button.dataset.xianTimeJump);
      const chapter = steps[chapterIndex]?.chapter;
      button.classList.toggle("is-active", chapter === step.chapter);
    });
    yearNode.textContent = step.year;
    eraNode.textContent = step.era;
    titleNode.textContent = step.title;
    sourceNode.textContent = `${step.source} · ${step.rights}`;
    markNode.textContent = step.mark;
    countNode.textContent = String(safeIndex + 1).padStart(2, "0");
    sourceButton.dataset.href = step.href;
    setFrame(step);
    preloadAround(safeIndex);
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setStep(Number(visible.target.dataset.xianTimeStep));
    }, { rootMargin: "-31% 0px -31% 0px", threshold: [0, .12, .32, .58] });
    stepNodes.forEach((node) => observer.observe(node));
  } else {
    setStep(0);
  }

  section.querySelectorAll("[data-xian-time-jump]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = stepNodes[Number(button.dataset.xianTimeJump)];
      target?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: compact.matches ? "center" : "center" });
    });
  });

  sourceButton?.addEventListener("click", () => {
    const href = sourceButton.dataset.href;
    if (href) window.open(href, "_blank", "noopener,noreferrer");
  });

  section.querySelector("[data-xian-time-open-archive]")?.addEventListener("click", () => archive?.showModal());
  section.querySelector("[data-xian-time-close-archive]")?.addEventListener("click", () => archive?.close());
  archive?.addEventListener("click", (event) => {
    if (event.target === archive) archive.close();
  });

  function updateProgress() {
    animationFrame = 0;
    if (!story) return;
    const rect = story.getBoundingClientRect();
    const travel = Math.max(1, rect.height - window.innerHeight);
    const progress = clamp(-rect.top / travel);
    progressNode.style.transform = `scaleX(${progress})`;
    section.style.setProperty("--xian-time-depth", progress.toFixed(4));

    if (!reducedMotion && stage && activeFrame) {
      const local = clamp((window.innerHeight * .5 - stepNodes[activeStep].getBoundingClientRect().top) / Math.max(1, stepNodes[activeStep].offsetHeight));
      activeFrame.style.setProperty("--xian-time-ken", `${(local - .5) * 1.4}%`);
    }
  }

  function requestProgressUpdate() {
    if (animationFrame) return;
    animationFrame = requestAnimationFrame(updateProgress);
  }

  window.addEventListener("scroll", requestProgressUpdate, { passive: true });
  window.addEventListener("resize", requestProgressUpdate);
  requestProgressUpdate();

  const revealNodes = [...section.querySelectorAll(".xian-time-reveal")];
  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealNodes.forEach((node) => node.classList.add("is-visible"));
  } else {
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
