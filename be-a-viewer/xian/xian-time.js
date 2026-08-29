const VERSION = "20260829-strata1";
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const compact = window.matchMedia("(max-width: 820px)");
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));

const stylesheet = document.createElement("link");
stylesheet.rel = "stylesheet";
stylesheet.href = `/be-a-viewer/xian/xian-time.css?v=${VERSION}`;
document.head.append(stylesheet);

const anchor = document.querySelector("#arrival") || document.querySelector(".xian-editorial-section");
if (!anchor || document.querySelector("[data-xian-time-root]")) {
  // Page structure changed or the module is already mounted.
} else {
  const maps = {
    republic: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Lo-yang%20and%20Ch%27ang-an%20Ancient%20and%20Modern%20%28VI%29.jpg?width=1916",
    tang: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Lo-yang%20and%20Ch%27ang-an%20Ancient%20and%20Modern%20%28IV%29.jpg?width=1800",
    han: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Lo-yang%20and%20Ch%27ang-an%20Ancient%20and%20Modern%20%28III%29.jpg?width=1800",
    compare: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Lo-yang%20and%20Ch%27ang-an%20Ancient%20and%20Modern%20%28V%29.jpg?width=1600"
  };

  const steps = [
    {
      year: "2026",
      era: "XI’AN / NOW",
      mark: "今",
      label: "THE PRESENT CITY",
      title: "Start with the wall as a landmark, not a boundary.",
      copy: "Modern Xi’an spreads far beyond the Ming-era walled core. The old rectangle still organises the centre, while the metropolitan city has long escaped it.",
      source: "GALOK / FIELD FRAME",
      image: "https://media.galok.me/cities/xian/city-wall-skyline--7eda7148ec5d.jpeg",
      kind: "photo",
      scale: 1.06,
      x: 0,
      y: 0
    },
    {
      year: "1935",
      era: "REPUBLIC / MAP VI",
      mark: "民",
      label: "THE WALLED CITY",
      title: "The modern centre contracts back inside the fortifications.",
      copy: "Herrmann and Westermann’s 1935 atlas records Republican Xi’an together with its Ming and Qing fortifications, gates, schools, courts, police headquarters and post office.",
      source: "HISTORICAL & COMMERCIAL ATLAS OF CHINA / PUBLIC DOMAIN",
      image: maps.republic,
      kind: "map",
      scale: 1.02,
      x: 0,
      y: 0
    },
    {
      year: "MING–QING",
      era: "WALLED CORE / SAME GROUND",
      mark: "城",
      label: "THE RECTANGLE HARDENS",
      title: "Zoom in. The wall becomes the whole frame.",
      copy: "The 1935 sheet preserves the inherited Ming–Qing urban enclosure. Scroll slowly here: the map stays the same while the camera tightens around the fortifications that still define central Xi’an today.",
      source: "MAP VI / CAMERA CROP BY GALOK",
      image: maps.republic,
      kind: "map",
      scale: 1.34,
      x: 0,
      y: 1
    },
    {
      year: "SUI / TANG",
      era: "CHANG’AN / MAP IV",
      mark: "唐",
      label: "THE CAPITAL OPENS SOUTH",
      title: "The city suddenly becomes much larger than the later wall.",
      copy: "The atlas separates outer city, imperial city and palace city, and marks the Big and Small Wild Goose Pagodas. The gridded capital pushes far south of the later Xi’an core.",
      source: "1935 ATLAS / MAP IV / PUBLIC DOMAIN",
      image: maps.tang,
      kind: "map",
      scale: 1.02,
      x: 0,
      y: 0
    },
    {
      year: "c. 200 BCE",
      era: "HAN CHANG’AN / MAP III",
      mark: "汉",
      label: "THE CAPITAL SHIFTS NORTHWEST",
      title: "Chang’an moves again.",
      copy: "On the Han sheet, palace compounds including Weiyang and Changle dominate a different urban footprint. The later Ming–Qing centre is no longer the centre of the story.",
      source: "1935 ATLAS / MAP III / PUBLIC DOMAIN",
      image: maps.han,
      kind: "map",
      scale: 1.03,
      x: -1,
      y: 0
    },
    {
      year: "2200+ YEARS",
      era: "OVERLAP / MAP V",
      mark: "叠",
      label: "ONE NAME, SEVERAL CITIES",
      title: "Put the layers on one sheet.",
      copy: "The comparative atlas places Qin, Han, Sui–Tang and Republican locations together. Xi’an did not simply expand from one fixed centre: different capitals occupied different footprints across the same wider plain.",
      source: "1935 ATLAS / MAP V / PUBLIC DOMAIN",
      image: maps.compare,
      kind: "map",
      scale: 1.0,
      x: 0,
      y: 0
    }
  ];

  const section = document.createElement("section");
  section.className = "xian-time";
  section.id = "xian-time";
  section.dataset.xianTimeRoot = "";
  section.setAttribute("aria-labelledby", "xian-time-title");
  section.innerHTML = `
    <header class="xian-time-intro xian-time-reveal">
      <p class="xian-time-kicker">CITY STRATA / 2026 → c. 200 BCE</p>
      <div class="xian-time-intro-grid">
        <h2 id="xian-time-title">PEEL<br>XI’AN BACK.</h2>
        <div>
          <p>Scroll backward through the city. The present metropolis contracts to the walled core; Tang Chang’an opens south; Han Chang’an shifts northwest.</p>
          <span>向下滚动 / 两千多年一层层退场</span>
        </div>
      </div>
      <div class="xian-time-rule" aria-hidden="true"><span>NOW</span><i></i><span>1935</span><i></i><span>TANG</span><i></i><span>HAN</span></div>
    </header>

    <div class="xian-time-story" data-xian-time-story>
      <div class="xian-time-stage" data-xian-time-stage>
        <div class="xian-time-media">
          <img class="xian-time-frame xian-time-frame--a is-visible" data-xian-time-frame-a src="${steps[0].image}" alt="2026 Xi’an city wall and skyline">
          <img class="xian-time-frame xian-time-frame--b" data-xian-time-frame-b alt="">
          <div class="xian-time-vignette" aria-hidden="true"></div>
          <div class="xian-time-grid" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
          <b class="xian-time-mark" data-xian-time-mark aria-hidden="true">今</b>
        </div>
        <div class="xian-time-readout" aria-live="polite">
          <div><span data-xian-time-era>XI’AN / NOW</span><b data-xian-time-year>2026</b></div>
          <strong data-xian-time-label>THE PRESENT CITY</strong>
          <small data-xian-time-source>GALOK / FIELD FRAME</small>
        </div>
        <div class="xian-time-progress" aria-hidden="true"><i data-xian-time-progress></i></div>
        <p class="xian-time-credit">HISTORICAL MAP SEQUENCE · HERRMANN & WESTERMANN · 1935 · PUBLIC DOMAIN</p>
      </div>

      <div class="xian-time-steps">
        ${steps.map((step, index) => `
          <article class="xian-time-step${index === 0 ? " is-active" : "}" data-xian-time-step="${index}">
            <span>${String(index + 1).padStart(2, "0")} / ${step.era}</span>
            <b>${step.year}</b>
            <h3>${step.title}</h3>
            <p>${step.copy}</p>
            <small>${step.source}</small>
          </article>`).join("")}
      </div>
    </div>

    <footer class="xian-time-sources xian-time-reveal">
      <div><p>MAP SOURCES / RIGHTS</p><strong>One atlas gives the transitions a single visual grammar.</strong></div>
      <div>
        <a href="https://commons.wikimedia.org/wiki/File:Lo-yang_and_Ch%27ang-an_Ancient_and_Modern_(VI).jpg" target="_blank" rel="noreferrer">1935 / Republican Xi’an + Ming–Qing fortifications ↗</a>
        <a href="https://commons.wikimedia.org/wiki/File:Lo-yang_and_Ch%27ang-an_Ancient_and_Modern_(IV).jpg" target="_blank" rel="noreferrer">1935 / Sui–Tang Chang’an ↗</a>
        <a href="https://commons.wikimedia.org/wiki/File:Lo-yang_and_Ch%27ang-an_Ancient_and_Modern_(III).jpg" target="_blank" rel="noreferrer">1935 / Han Chang’an ↗</a>
        <a href="https://commons.wikimedia.org/wiki/File:Lo-yang_and_Ch%27ang-an_Ancient_and_Modern_(V).jpg" target="_blank" rel="noreferrer">1935 / Comparative Xi’an–Chang’an sheet ↗</a>
      </div>
      <p>Albert Herrmann & Georg Westermann · Historical and Commercial Atlas of China · public domain. Historical romanisation is retained inside the original maps.</p>
    </footer>
  `;

  anchor.parentNode.insertBefore(section, anchor);

  const heroEnter = document.querySelector(".xian-hero > a");
  if (heroEnter) {
    heroEnter.href = "#xian-time";
    heroEnter.innerHTML = 'SCROLL BACK IN TIME <span aria-hidden="true">↓</span>';
  }

  const story = section.querySelector("[data-xian-time-story]");
  const stepNodes = [...section.querySelectorAll("[data-xian-time-step]")];
  const frameA = section.querySelector("[data-xian-time-frame-a]");
  const frameB = section.querySelector("[data-xian-time-frame-b]");
  const yearNode = section.querySelector("[data-xian-time-year]");
  const eraNode = section.querySelector("[data-xian-time-era]");
  const labelNode = section.querySelector("[data-xian-time-label]");
  const sourceNode = section.querySelector("[data-xian-time-source]");
  const markNode = section.querySelector("[data-xian-time-mark]");
  const progressNode = section.querySelector("[data-xian-time-progress]");

  let activeFrame = frameA;
let inactiveFrame = frameB;
let activeStep = 0;
let activeImage = steps[0].image;
let pendingImage = "";
let mediaToken = 0;
let animationFrame = 0;

  function applyFrameStyle(node, step) {
    if (!node) return;
    node.dataset.kind = step.kind;
    node.style.setProperty("--xian-time-scale", String(step.scale ?? 1));
    node.style.setProperty("--xian-time-x", `${step.x ?? 0}%`);
    node.style.setProperty("--xian-time-y", `${step.y ?? 0}%`);
  }

  applyFrameStyle(activeFrame, steps[0]);

  function preloadAround(index) {
    [steps[index - 1], steps[index + 1]].filter(Boolean).forEach((step) => {
      const image = new Image();
      image.src = step.image;
    });
  }

  function setFrame(step) {
  const next = step.image;
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
  inactiveFrame.alt = `${step.year} — ${step.label}`;
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
    const safeIndex = clamp(index, 0, steps.length - 1);
    const step = steps[safeIndex];
    activeStep = safeIndex;
    stepNodes.forEach((node, nodeIndex) => node.classList.toggle("is-active", nodeIndex === safeIndex));
    if (yearNode) yearNode.textContent = step.year;
    if (eraNode) eraNode.textContent = step.era;
    if (labelNode) labelNode.textContent = step.label;
    if (sourceNode) sourceNode.textContent = step.source;
    if (markNode) markNode.textContent = step.mark;
    setFrame(step);
    preloadAround(safeIndex);
  }

  if (stepNodes.length && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setStep(Number(visible.target.dataset.xianTimeStep));
    }, { rootMargin: "-34% 0px -34% 0px", threshold: [0, .1, .35, .65] });
    stepNodes.forEach((step) => observer.observe(step));
  } else {
    setStep(0);
  }

  function updateProgress() {
    animationFrame = 0;
    if (!story) return;
    const rect = story.getBoundingClientRect();
    const travel = Math.max(1, rect.height - window.innerHeight);
    const progress = clamp(-rect.top / travel);
    if (progressNode) progressNode.style.transform = `scaleX(${progress})`;
    section.style.setProperty("--xian-time-depth", progress.toFixed(4));
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

  compact.addEventListener?.("change", () => setStep(activeStep));
}
