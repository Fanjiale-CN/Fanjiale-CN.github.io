const VERSION = "20260828-growth1";
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const compact = window.matchMedia("(max-width: 820px)");
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const escapeHTML = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));

const stylesheet = document.createElement("link");
stylesheet.rel = "stylesheet";
stylesheet.href = `/be-a-viewer/shenzhen/shenzhen-time.css?v=${VERSION}`;
document.head.append(stylesheet);

const anchor = document.querySelector("#frequency-board");
if (!anchor || document.querySelector("[data-sz-time-root]")) {
  // Already mounted or page structure changed.
} else {
  const growth = [{"year": "1973", "label": "BEFORE THE EXPERIMENT", "mode": "LANDSAT / 01", "nasa": 0.0, "title": "The urban footprint is still thin.", "copy": "NASA’s Landsat sequence begins in 1973. The modern metropolis has not yet spread across the frame.", "stat": "LANDSAT · 1973", "source": "NASA / GSFC", "image": null}, {"year": "1979", "label": "CITY + SHEKOU", "mode": "START / 02", "nasa": 0.18, "title": "The switch is thrown.", "copy": "Shenzhen was established as a city in 1979. Shekou Industrial Zone was approved in January; the July 8 construction blast became an early symbol of reform and opening.", "stat": "1979 · CITY ESTABLISHED", "source": "Shenzhen Government / China Merchants history", "image": null}, {"year": "1980", "label": "SPECIAL ECONOMIC ZONE", "mode": "SEZ / 03", "nasa": 0.27, "title": "A policy experiment gets a map.", "copy": "On August 26, 1980, the National People’s Congress Standing Committee approved the establishment of the Shenzhen Special Economic Zone.", "stat": "26 AUG 1980", "source": "Shenzhen Government", "image": null}, {"year": "1982", "label": "LUOHU", "mode": "BUILD / 04", "nasa": 0.36, "title": "The city starts appearing in the photograph.", "copy": "A surviving 1982 slide from Luohu catches Shenzhen while cranes, roads, banks and commercial buildings were still arriving almost simultaneously.", "stat": "1982 · LUOHU", "source": "Robert Schediwy / Wikimedia Commons", "image": "https://commons.wikimedia.org/wiki/Special:Redirect/file/Shenchen%20in%201982.jpg"}, {"year": "1990", "label": "FINANCE", "mode": "MARKET / 05", "nasa": 0.58, "title": "A construction city gains financial machinery.", "copy": "The Shenzhen Stock Exchange was established in 1990, adding a new institutional layer to a city already expanding through trade and manufacturing.", "stat": "1990 · SZSE", "source": "Shenzhen Government", "image": null}, {"year": "1997", "label": "BORDER METROPOLIS", "mode": "CROSSING / 06", "nasa": 0.77, "title": "The skyline reaches the river.", "copy": "From the Hong Kong side of the Shenzhen River, the 1997 city already reads as a dense border metropolis rather than a frontier town.", "stat": "1997 · SHENZHEN RIVER", "source": "Wikimedia Commons", "image": "https://commons.wikimedia.org/wiki/Special:Redirect/file/Blick%20von%20Hong%20Kong%20nach%20Shenzhen%20im%20M%C3%A4rz%201997.jpg"}, {"year": "2001", "label": "LANDSAT END FRAME", "mode": "SPRAWL / 07", "nasa": 1.0, "title": "Twenty-eight years of satellite frames end here.", "copy": "NASA’s sequence dissolves from 1973 to 2001. By the end of 2000, World Bank material records Shenzhen’s population at about 4.33 million.", "stat": "2001 · NASA END FRAME", "source": "NASA / World Bank", "image": "https://commons.wikimedia.org/wiki/Special:Redirect/file/2001%E5%B9%B4%20%E8%90%BD%E9%A9%AC%E6%B4%B2%20Lok%20Ma%20Chau%202001%20-%20panoramio.jpg"}, {"year": "2010", "label": "WHOLE CITY", "mode": "EXPAND / 08", "nasa": 1.0, "title": "The special-zone line disappears.", "copy": "In July 2010, the Shenzhen Special Economic Zone was expanded to cover the entire city, ending the old inside/outside distinction.", "stat": "2010 · SEZ CITYWIDE", "source": "Shenzhen Government", "image": null}, {"year": "2015", "label": "VERTICAL CITY", "mode": "SKYLINE / 09", "nasa": 1.0, "title": "The skyline becomes the evidence.", "copy": "By the mid-2010s, the built form itself tells the story: towers, metro lines, ports and new districts now occupy the territory that the Landsat sequence watched fill in.", "stat": "2015 · SHENZHEN BAY", "source": "Wishds / Wikimedia Commons", "image": "https://commons.wikimedia.org/wiki/Special:Redirect/file/A%20spectacular%20view%20of%20Shenzhen%20Skyline.jpg"}, {"year": "2020", "label": "FORTY YEARS", "mode": "BAY / 10", "nasa": 1.0, "title": "A new centre forms on the bay.", "copy": "Forty years after the SEZ was established, Houhai and Shenzhen Bay show another shift: the growth story has moved from sheer expansion toward technology, finance and high-density urban life.", "stat": "2020 · HOUHAI", "source": "Charlie fong / Wikimedia Commons", "image": "https://commons.wikimedia.org/wiki/Special:Redirect/file/Skylineinshenzhenhouhai202009.jpg"}, {"year": "2024", "label": "TODAY'S SCALE", "mode": "NOW / 11", "nasa": 1.0, "title": "17.99 million permanent residents.", "copy": "At the end of 2024 Shenzhen recorded 17.9895 million permanent residents and GDP of 3.680187 trillion yuan. The experiment now operates at megacity scale.", "stat": "2024 · ¥3.68T GDP", "source": "Shenzhen Statistics Bureau", "image": "/assets/be-a-viewer/shenzhen/gallery/01-bay-sunset.webp"}];
  const section = document.createElement("section");
  section.className = "sz-time";
  section.id = "shenzhen-time";
  section.dataset.szTimeRoot = "";
  section.setAttribute("aria-labelledby", "sz-time-title");
  section.innerHTML = `
    <header class="sz-time-intro sz-time-reveal">
      <p class="sz-time-kicker">CITY MEMORY / 1898 → NOW</p>
      <div class="sz-time-intro-grid">
        <h2 id="sz-time-title">BEFORE THE SIGNAL,<br>THERE WAS TIME.</h2>
        <p>Shenzhen’s modern metropolis is young. The ground beneath it is not. Border surveys, railways, markets and older settlements sit underneath the city that reform and opening then accelerated at extraordinary speed.</p>
      </div>
      <div class="sz-time-scale" aria-label="Time structure">
        <span><b>01</b> ROOTS</span><i aria-hidden="true"></i><span><b>02</b> GROWTH</span><i aria-hidden="true"></i><span><b>03</b> TODAY</span>
      </div>
    </header>

    <section class="sz-roots" aria-labelledby="sz-roots-title">
      <header class="sz-time-section-head sz-time-reveal">
        <p>01 / ROOTS · 历史沿革</p>
        <h2 id="sz-roots-title">THE CITY<br>BEFORE THE CITY.</h2>
        <div>
          <p>The archive begins at the Shenzhen River frontier, then moves through the railway, Luohu and the first visible layers of the modern city.</p>
          <span data-sz-archive-count>LOADING ARCHIVE…</span>
        </div>
      </header>
      <div class="sz-roots-milestones sz-time-reveal" aria-label="Selected historical milestones">
        <article><b>1573</b><span>Xin’an County was established with its seat at Nantou.</span></article>
        <article><b>1898</b><span>The Shenzhen River became part of a newly surveyed international boundary.</span></article>
        <article><b>1911</b><span>The Chinese section of the Canton–Kowloon Railway opened; the first train arrived at Shum Chun.</span></article>
        <article><b>1953</b><span>Bao’an County moved its government to Shenzhen, strengthening the border town’s regional role.</span></article>
        <article><b>1979</b><span>Shenzhen was established as a city. The modern growth story begins.</span></article>
      </div>
      <div class="sz-archive-grid" data-sz-archive-grid aria-live="polite"></div>
      <p class="sz-archive-note sz-time-reveal">Archive images remain soft, scratched or low-resolution when that is how they survive. The page preserves the frame instead of manufacturing detail.</p>
    </section>

    <section class="sz-growth" id="shenzhen-growth" aria-labelledby="sz-growth-title">
      <header class="sz-time-section-head sz-time-section-head--growth sz-time-reveal">
        <p>02 / GROWTH · 改革开放以后</p>
        <h2 id="sz-growth-title">WATCH<br>SHENZHEN GROW.</h2>
        <div>
          <p>Scroll through the experiment. The satellite record runs from 1973 to 2001; later photographs carry the city into the present.</p>
          <span>NASA LANDSAT / 1973–2001</span>
        </div>
      </header>

      <div class="sz-growth-story" data-sz-growth-story>
        <div class="sz-growth-stage" data-sz-growth-stage>
          <div class="sz-growth-media">
            <video data-sz-growth-video muted playsinline preload="metadata" poster="https://svs.gsfc.nasa.gov/vis/a000000/a002700/a002763/alltime.0140.jpg" aria-label="NASA Landsat animation showing Shenzhen urbanization from 1973 to 2001">
              <source src="https://svs.gsfc.nasa.gov/vis/a000000/a002700/a002763/widershenzhen.webmhd.webm" type="video/webm">
            </video>
            <img class="sz-growth-overlay sz-growth-overlay--a" data-sz-growth-overlay-a alt="">
            <img class="sz-growth-overlay sz-growth-overlay--b" data-sz-growth-overlay-b alt="">
            <div class="sz-growth-shade" aria-hidden="true"></div>
            <div class="sz-growth-gridlines" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
          </div>
          <div class="sz-growth-readout" aria-live="polite">
            <div><span data-sz-growth-mode>LANDSAT / 01</span><b data-sz-growth-year>1973</b></div>
            <strong data-sz-growth-label>BEFORE THE EXPERIMENT</strong>
            <p data-sz-growth-stat>LANDSAT · 1973</p>
            <small data-sz-growth-source>NASA / GSFC</small>
          </div>
          <div class="sz-growth-progress" aria-hidden="true"><i data-sz-growth-progress></i></div>
          <p class="sz-growth-credit">LANDSAT VISUALIZATION · NASA/GODDARD SPACE FLIGHT CENTER · SCIENTIFIC VISUALIZATION STUDIO</p>
        </div>

        <div class="sz-growth-steps">
          ${growth.map((step, index) => `
            <article class="sz-growth-step" data-sz-growth-step="${index}" data-nasa="${step.nasa}">
              <span>${String(index + 1).padStart(2, "0")} / ${step.mode}</span>
              <b>${step.year}</b>
              <h3>${step.title}</h3>
              <p>${step.copy}</p>
              <small>${step.source}</small>
            </article>`).join("")}
        </div>
      </div>

      <div class="sz-growth-results sz-time-reveal" aria-label="Selected indicators of Shenzhen growth">
        <article><span>1980</span><b>SEZ</b><p>One of China’s first special economic zones.</p></article>
        <article><span>2000</span><b>4.33M</b><p>Population recorded in World Bank historical material.</p></article>
        <article><span>2010</span><b>CITYWIDE</b><p>The special economic zone expands to the whole city.</p></article>
        <article><span>2024</span><b>17.99M</b><p>Permanent residents.</p></article>
        <article><span>2024</span><b>¥3.68T</b><p>Gross domestic product.</p></article>
      </div>

      <footer class="sz-time-sources sz-time-reveal">
        <p>FACT CHECK / SOURCES</p>
        <div>
          <a href="https://svs.gsfc.nasa.gov/2763" target="_blank" rel="noreferrer">NASA Landsat urbanization sequence ↗</a>
          <a href="https://www.sz.gov.cn/en_szgov/aboutsz/profile/content/post_12542766.html" target="_blank" rel="noreferrer">Shenzhen Government city profile ↗</a>
          <a href="https://www.sz.gov.cn/cn/xxgk/zfxxgj/tjsj/tjgb/content/post_12190855.html" target="_blank" rel="noreferrer">2024 statistical bulletin ↗</a>
          <a href="https://documents1.worldbank.org/curated/en/622661468339570756/pdf/690730PUB0Publ067902B09780821389706.pdf" target="_blank" rel="noreferrer">World Bank SEZ / land reform study ↗</a>
        </div>
      </footer>
    </section>

    <section class="sz-today-bridge sz-time-reveal" aria-labelledby="sz-today-title">
      <p>03 / TODAY · 现在</p>
      <h2 id="sz-today-title">THE CITY<br>IS STILL ARRIVING.</h2>
      <div><span>FROM DECADES → TO A SINGLE DAY</span><a href="#frequency-board">ENTER TODAY’S FIVE SIGNALS <b aria-hidden="true">↓</b></a></div>
    </section>
  `;

  anchor.parentNode.insertBefore(section, anchor);

  const heroEnter = document.querySelector(".sz-enter");
  if (heroEnter) {
    heroEnter.href = "#shenzhen-time";
    heroEnter.innerHTML = 'ENTER THE TIMELINE <span aria-hidden="true">↓</span>';
  }

  const archiveGrid = section.querySelector("[data-sz-archive-grid]");
  const archiveCount = section.querySelector("[data-sz-archive-count]");
  fetch(`/be-a-viewer/shenzhen/shenzhen-history.json?v=${VERSION}`)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((payload) => {
      const items = Array.isArray(payload?.items) ? payload.items : [];
      if (archiveCount) archiveCount.textContent = `${String(items.length).padStart(2, "0")} ARCHIVE FRAMES`;
      if (!archiveGrid) return;
      archiveGrid.innerHTML = items.map((item, index) => `
        <figure class="sz-archive-card sz-time-reveal" data-archive-index="${index + 1}">
          <a class="sz-archive-media" href="${escapeHTML(item.sourceUrl)}" target="_blank" rel="noreferrer" aria-label="Open source for ${escapeHTML(item.title)}">
            <img src="${escapeHTML(item.imageUrl)}" loading="lazy" decoding="async" alt="${escapeHTML(item.title)}, ${escapeHTML(item.dateLabel)}">
          </a>
          <figcaption>
            <span>${String(index + 1).padStart(2, "0")} / ${escapeHTML(item.dateLabel)}</span>
            <b>${escapeHTML(item.title)}</b>
            <small>${escapeHTML(item.location)} · ${escapeHTML(item.sourceLabel)}</small>
          </figcaption>
        </figure>`).join("");
      observeReveals(archiveGrid.querySelectorAll(".sz-time-reveal"));
    })
    .catch((error) => {
      if (archiveCount) archiveCount.textContent = "ARCHIVE TEMPORARILY UNAVAILABLE";
      if (archiveGrid) archiveGrid.innerHTML = `<p class="sz-archive-error">Historical image manifest could not be loaded. ${escapeHTML(error.message)}</p>`;
    });

  function observeReveals(nodes = section.querySelectorAll(".sz-time-reveal")) {
    const list = [...nodes];
    if (reducedMotion || !("IntersectionObserver" in window)) {
      list.forEach((node) => node.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: .04 });
    list.forEach((node) => observer.observe(node));
  }
  observeReveals();

  const story = section.querySelector("[data-sz-growth-story]");
  const video = section.querySelector("[data-sz-growth-video]");
  const steps = [...section.querySelectorAll("[data-sz-growth-step]")];
  const yearNode = section.querySelector("[data-sz-growth-year]");
  const modeNode = section.querySelector("[data-sz-growth-mode]");
  const labelNode = section.querySelector("[data-sz-growth-label]");
  const statNode = section.querySelector("[data-sz-growth-stat]");
  const sourceNode = section.querySelector("[data-sz-growth-source]");
  const progressNode = section.querySelector("[data-sz-growth-progress]");
  const overlayA = section.querySelector("[data-sz-growth-overlay-a]");
  const overlayB = section.querySelector("[data-sz-growth-overlay-b]");
  let activeOverlay = overlayA;
  let inactiveOverlay = overlayB;
  let activeStep = -1;
  let frame = 0;
  let videoDuration = 0;
  let currentImage = "";

  function setOverlay(step) {
    const next = step.image || "";
    if (next === currentImage) return;
    currentImage = next;
    if (!next) {
      [overlayA, overlayB].forEach((node) => node?.classList.remove("is-visible"));
      return;
    }
    inactiveOverlay.src = next;
    inactiveOverlay.alt = `${step.year} Shenzhen — ${step.label}`;
    const reveal = () => {
      inactiveOverlay.classList.add("is-visible");
      activeOverlay.classList.remove("is-visible");
      [activeOverlay, inactiveOverlay] = [inactiveOverlay, activeOverlay];
    };
    if (inactiveOverlay.complete) requestAnimationFrame(reveal);
    else inactiveOverlay.addEventListener("load", reveal, { once: true });
  }

  function setStep(index) {
    const next = clamp(Number(index), 0, growth.length - 1);
    if (next === activeStep) return;
    activeStep = next;
    const step = growth[next];
    steps.forEach((node, nodeIndex) => node.classList.toggle("is-active", nodeIndex === next));
    if (yearNode) yearNode.textContent = step.year;
    if (modeNode) modeNode.textContent = step.mode;
    if (labelNode) labelNode.textContent = step.label;
    if (statNode) statNode.textContent = step.stat;
    if (sourceNode) sourceNode.textContent = step.source;
    setOverlay(step);
    if ((compact.matches || reducedMotion) && videoDuration && step.nasa < 1) {
      try { video.currentTime = videoDuration * step.nasa; } catch {}
    }
  }

  if (video) {
    video.addEventListener("loadedmetadata", () => {
      videoDuration = Number.isFinite(video.duration) ? video.duration : 0;
      const index = Math.max(0, activeStep);
      const step = growth[index];
      if ((compact.matches || reducedMotion) && videoDuration && step?.nasa < 1) {
        try { video.currentTime = videoDuration * step.nasa; } catch {}
      }
    });
  }

  if (steps.length && "IntersectionObserver" in window) {
    const stepObserver = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setStep(Number(visible.target.dataset.szGrowthStep));
    }, { rootMargin: "-34% 0px -34% 0px", threshold: [0, .1, .35, .65] });
    steps.forEach((step) => stepObserver.observe(step));
  } else {
    setStep(0);
  }

  function updateGrowth() {
    frame = 0;
    if (!story) return;
    const rect = story.getBoundingClientRect();
    const travel = Math.max(1, rect.height - window.innerHeight);
    const progress = clamp(-rect.top / travel);
    if (progressNode) progressNode.style.transform = `scaleX(${progress})`;
    if (!reducedMotion && !compact.matches && videoDuration) {
      const nasaProgress = clamp(progress / .68);
      try {
        const target = videoDuration * nasaProgress;
        if (Math.abs(video.currentTime - target) > .06) video.currentTime = target;
      } catch {}
    }
  }

  function requestGrowthUpdate() {
    if (frame) return;
    frame = requestAnimationFrame(updateGrowth);
  }
  window.addEventListener("scroll", requestGrowthUpdate, { passive: true });
  window.addEventListener("resize", requestGrowthUpdate);
  compact.addEventListener?.("change", requestGrowthUpdate);
  setStep(0);
  updateGrowth();

  section.querySelector(".sz-today-bridge a")?.addEventListener("click", (event) => {
    const target = document.querySelector("#frequency-board");
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  });
}
