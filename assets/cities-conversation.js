(() => {
  "use strict";

  if (window.location.pathname.replace(/index\.html$/, "") !== "/cities/") return;
  if (document.querySelector("[data-cities-conversation]")) return;

  const CITIES = {
    beijing: {
      name: "Beijing",
      coordinate: "39.9042° N · 116.4074° E",
      image: "https://media.galok.me/cities/carousel/beijing-poster--b1032df64372.webp",
      href: "/be-a-viewer/beijing/",
      line: "I’ve been looking at Beijing through its axes, enclosures and ceremonial scale. The city becomes most interesting where that formal order softens into trees, walls, courtyards and the pace of ordinary movement.",
      questions: {
        notice: ["What stays with you?", "The tension between monumental order and small everyday movement. Beijing feels most alive where those two scales overlap."],
        archive: ["What should I look for?", "Rooflines, red walls, long sightlines, courtyards and the way trees interrupt otherwise formal geometry."],
        enter: ["Where do I begin?", "Begin with the central axis, then move outward. The city becomes more interesting as ceremony gives way to lived texture."]
      }
    },
    shanghai: {
      name: "Shanghai",
      coordinate: "31.2304° N · 121.4737° E",
      image: "https://media.galok.me/cities/carousel/shanghai-poster--593eecdd87b2.webp",
      href: "/be-a-viewer/shanghai/",
      line: "I’ve been looking at Shanghai through river light, compressed streets and vertical ambition. The city rarely settles into one scale, shifting from polished spectacle to tight, restless street life within a few minutes.",
      questions: {
        notice: ["What stays with you?", "The city rarely settles into one scale. A polished skyline can collapse into a tight street within minutes."],
        archive: ["What should I look for?", "Reflections, river edges, pedestrian crossings, towers, haze and the small surfaces that sit underneath the skyline."],
        enter: ["Where do I begin?", "Start at the river, then leave it. Shanghai becomes more legible when spectacle gives way to density."]
      }
    },
    xian: {
      name: "Xi’an",
      coordinate: "34.3416° N · 108.9398° E",
      image: "https://media.galok.me/cities/xian/city-wall-sunset--9a9bea178acf.jpeg",
      href: "/be-a-viewer/xian/",
      line: "I’ve been looking at Xi’an through stone, brick, ritual scale and contemporary traffic. History remains physically close here, but the strongest frames appear when old structures keep organising a city that is still moving around them.",
      questions: {
        notice: ["What stays with you?", "The old city keeps acting as structure, not scenery. Walls and pagodas still organise distance, orientation and attention."],
        archive: ["What should I look for?", "Thresholds, wall edges, pagodas, night lighting and the seam where tourism meets ordinary urban life."],
        enter: ["Where do I begin?", "Walk the wall as a horizon, then return to street level. The contrast between those two views is the city’s strongest frame."]
      }
    },
    shenzhen: {
      name: "Shenzhen",
      coordinate: "22.5431° N · 114.0579° E",
      image: "https://media.galok.me/cities/carousel/shenzhen-poster--4de3730c6da9.webp",
      href: "/be-a-viewer/shenzhen/",
      line: "I’ve been looking at Shenzhen as a city still arriving. Speed becomes skyline, reflection, infrastructure and ordinary night, while the lack of a single historic centre makes movement and transition more important than monuments.",
      questions: {
        notice: ["What stays with you?", "The lack of a single historic centre. Shenzhen reads through movement, edges and the confidence of things built recently."],
        archive: ["What should I look for?", "Glass, elevated roads, bay edges, new public space and the moments where polished infrastructure meets everyday use."],
        enter: ["Where do I begin?", "Begin near the bay, then follow the infrastructure inland. The city reveals itself through transitions more than monuments."]
      }
    },
    xiamen: {
      name: "Xiamen",
      coordinate: "24.4798° N · 118.0894° E",
      image: "https://media.galok.me/cities/carousel/xiamen-poster--719bd14e8b32.webp",
      href: "/be-a-viewer/xiamen/",
      line: "I’ve been looking at Xiamen through coastline, humidity and softer light. Water keeps returning to the frame, so ferries, roads, hills and towers feel less like separate objects and more like parts of one long coastal edge.",
      questions: {
        notice: ["What stays with you?", "The water keeps returning to the frame. Ferries, roads and towers all seem to negotiate with the coastline."],
        archive: ["What should I look for?", "Harbour edges, boats, sea-facing roads, hills and the warm shift in colour as the light lowers."],
        enter: ["Where do I begin?", "Begin at the water. In Xiamen the coastline is not a backdrop, it is part of the city’s basic visual structure."]
      }
    },
    hangzhou: {
      name: "Hangzhou",
      coordinate: "30.2741° N · 120.1551° E",
      image: "/assets/be-a-viewer/video/hangzhou-poster.webp",
      href: "/be-a-viewer/hangzhou/",
      line: "I’ve been looking at Hangzhou through distance, foliage, reflection and the way water often arrives before the street. The city feels strongest when architecture steps back and landscape is allowed to reorganise attention.",
      questions: {
        notice: ["What stays with you?", "The city is strongest when architecture does not dominate the frame. Water and vegetation keep reorganising attention."],
        archive: ["What should I look for?", "Lake edges, bridges, soft horizons, reflections and the shift between scenic order and contemporary city life."],
        enter: ["Where do I begin?", "Begin with the lake, but do not stop there. The useful contrast comes when the postcard image meets the city around it."]
      }
    },
    chongqing: {
      name: "Chongqing",
      coordinate: "29.5630° N · 106.5516° E",
      image: "https://images.pexels.com/photos/29775115/pexels-photo-29775115.jpeg?auto=compress&cs=tinysrgb&w=1600",
      href: "/be-a-viewer/chongqing/",
      line: "I’ve been looking at Chongqing from river level upward. Streets, rail, bridges and buildings keep stacking above one another, so the city never seems to agree on a single ground plane or a final horizon.",
      questions: {
        notice: ["What stays with you?", "Ground level never feels final. The city keeps stacking another route, bridge or entrance above and below the last one."],
        archive: ["What should I look for?", "Vertical circulation, river crossings, rail, night light and the accidental views created by extreme topography."],
        enter: ["Where do I begin?", "Begin at river level, then climb. Chongqing becomes legible only when you experience how often the city changes altitude."]
      }
    }
  };

  const STICKERS = [
    { image: "/assets/cities/stickers/shanghai-lujiazui-v2.webp", payload: "/assets/cities/stickers/shanghai-lujiazui-v2.base64.txt" },
    { image: "/assets/cities/stickers/xian-dayanta-v2.webp", payload: "/assets/cities/stickers/xian-dayanta-v2.base64.txt" },
    { image: "/assets/cities/stickers/beijing-gugong-v2.webp", payload: "/assets/cities/stickers/beijing-gugong-v2.base64.txt" },
    { image: "/assets/cities/stickers/xiamen-harbor-v2.webp", payload: "/assets/cities/stickers/xiamen-harbor-v2.base64.txt" }
  ];

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const delay = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

  let streamToken = 0;
  let followupToken = 0;

  const typeText = async (element, text, options = {}) => {
    const speed = options.speed ?? 15;
    const isCurrent = options.isCurrent ?? (() => true);
    const glyphs = Array.from(text);

    if (reducedMotion) {
      element.textContent = text;
      return isCurrent();
    }

    element.textContent = "";
    element.classList.add("cities-type-target", "is-typing");

    for (const glyph of glyphs) {
      if (!isCurrent()) {
        element.classList.remove("is-typing");
        return false;
      }

      element.textContent += glyph;
      let pause = speed;
      if (/[.!?。！？]/.test(glyph)) pause += 92;
      else if (/[,;:，；：]/.test(glyph)) pause += 46;
      else pause += Math.random() * 5;
      await delay(pause);
    }

    element.classList.remove("is-typing");
    return isCurrent();
  };

  const thinkingMarkup = (cityName) => `
    <div class="cities-thinking" role="status">
      <span class="cities-thinking__orb" aria-hidden="true"></span>
      <span>Galok is thinking about ${cityName}</span>
      <span class="cities-thinking__dots" aria-hidden="true"><i></i><i></i><i></i></span>
    </div>`;

  const shuffle = (input) => {
    const out = [...input];
    for (let i = out.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };

  const section = document.createElement("section");
  section.className = "cities-conversation";
  section.dataset.citiesConversation = "";
  section.setAttribute("aria-labelledby", "cities-conversation-label");
  section.innerHTML = `
    <div class="cities-stickers" aria-hidden="true" data-cities-stickers></div>
    <div class="cities-conversation__inner">
      <p class="cities-conversation__eyebrow">GALOK / CITIES</p>
      <div class="cities-conversation__prompt">
        <label class="cities-conversation__label" id="cities-conversation-label" for="cities-conversation-select">Cities: Ask me about</label>
        <span class="cities-conversation__select-wrap">
          <select class="cities-conversation__select" id="cities-conversation-select">
            ${Object.entries(CITIES).map(([slug, city]) => `<option value="${slug}"${slug === "beijing" ? " selected" : ""}>${city.name}</option>`).join("")}
          </select>
        </span>
        <button class="cities-conversation__ask" type="button" data-cities-ask aria-label="Ask Galok about this city">OK</button>
      </div>
      <p class="cities-conversation__hint">Choose a city Galok already knows. The answers are part of the archive.</p>
      <div data-cities-answer aria-live="polite"></div>
    </div>`;

  const main = document.querySelector("main");
  if (!main) return;
  main.prepend(section);
  document.querySelector("[data-cities-conversation-boot-style]")?.remove();
  document.documentElement.classList.remove("cities-conversation-loading");

  const stickerLayer = section.querySelector("[data-cities-stickers]");
  const count = window.matchMedia("(max-width: 720px)").matches ? 3 : 4;
  const chosen = shuffle(STICKERS).slice(0, count);
  const slots = ["a", "b", "c", "d"];

  const loadPayloadFallback = async (image, item, sticker) => {
    try {
      const response = await fetch(`${item.payload}?v=20260913f`, { cache: "force-cache" });
      if (!response.ok) throw new Error(`Sticker payload ${response.status}`);
      const payload = (await response.text()).replace(/\s+/g, "");
      if (!payload.startsWith("UklGR")) throw new Error("Invalid sticker payload");
      image.src = `data:image/webp;base64,${payload}`;
    } catch {
      sticker.remove();
    }
  };

  chosen.forEach((item, index) => {
    const sticker = document.createElement("div");
    sticker.className = "cities-sticker";
    sticker.dataset.slot = slots[index];
    sticker.style.setProperty("--float", `${7 + index * .65}s`);
    sticker.hidden = true;

    const image = document.createElement("img");
    image.alt = "";
    image.loading = "eager";
    image.decoding = "async";
    image.draggable = false;
    let fallbackTried = false;

    image.addEventListener("load", () => {
      sticker.hidden = false;
      requestAnimationFrame(() => sticker.classList.add("is-ready"));
    });
    image.addEventListener("error", () => {
      if (fallbackTried) {
        sticker.remove();
        return;
      }
      fallbackTried = true;
      loadPayloadFallback(image, item, sticker);
    });

    sticker.append(image);
    stickerLayer.append(sticker);
    image.src = `${item.image}?v=20260913f`;

    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      sticker.addEventListener("pointermove", (event) => {
        const rect = sticker.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        const base = Number.parseFloat(getComputedStyle(sticker).getPropertyValue("--r")) || 0;
        sticker.style.animation = "none";
        sticker.style.transform = `translate3d(${x * 14}px, ${y * 10 - 8}px, 0) rotate(${base + x * 3.5}deg) scale(1.035)`;
      });
      sticker.addEventListener("pointerleave", () => {
        sticker.style.animation = "";
        sticker.style.transform = "";
      });
    }
  });

  const select = section.querySelector("#cities-conversation-select");
  const answerSlot = section.querySelector("[data-cities-answer]");
  const askButton = section.querySelector("[data-cities-ask]");

  const setAskBusy = (busy) => {
    askButton.disabled = busy;
    askButton.classList.toggle("is-thinking", busy);
    askButton.textContent = busy ? "…" : "OK";
  };

  const preloadImage = (src) => {
    const image = new Image();
    image.decoding = "async";
    image.src = src;
    return image.decode?.().catch(() => undefined) ?? Promise.resolve();
  };

  const render = async (slug) => {
    const city = CITIES[slug];
    if (!city) return;

    const token = ++streamToken;
    followupToken += 1;
    const isCurrent = () => token === streamToken;

    setAskBusy(true);
    answerSlot.dataset.city = slug;
    answerSlot.setAttribute("aria-busy", "true");
    answerSlot.innerHTML = thinkingMarkup(city.name);

    preloadImage(city.image);
    await delay(reducedMotion ? 120 : 880 + Math.random() * 420);
    if (!isCurrent()) return;

    answerSlot.innerHTML = `
      <article class="cities-answer is-composing">
        <figure class="cities-answer__media is-pending"><img src="${city.image}" alt="${city.name}" loading="eager" decoding="async"></figure>
        <div class="cities-answer__body">
          <div class="cities-answer__meta"><span>GALOK / CITY NOTE</span><span>${city.coordinate}</span></div>
          <h2 class="cities-type-target" data-cities-title></h2>
          <p class="cities-type-target" data-cities-copy></p>
          <div class="cities-answer__questions is-pending" data-cities-questions>
            <button type="button" class="cities-answer__question" data-question="notice">What stays with you?</button>
            <button type="button" class="cities-answer__question" data-question="archive">What should I look for?</button>
            <button type="button" class="cities-answer__question" data-question="enter">Where do I begin?</button>
            <a class="cities-answer__enter" href="${city.href}">Enter ${city.name} ↗</a>
          </div>
        </div>
      </article>
      <div data-cities-followups></div>`;

    const article = answerSlot.querySelector(".cities-answer");
    const media = answerSlot.querySelector(".cities-answer__media");
    const title = answerSlot.querySelector("[data-cities-title]");
    const copy = answerSlot.querySelector("[data-cities-copy]");
    const questions = answerSlot.querySelector("[data-cities-questions]");

    const titleDone = await typeText(title, city.name, {
      speed: 44,
      isCurrent
    });
    if (!titleDone) return;

    await delay(reducedMotion ? 0 : 150);
    if (!isCurrent()) return;
    media.classList.add("is-visible");

    await delay(reducedMotion ? 0 : 190);
    if (!isCurrent()) return;

    const copyDone = await typeText(copy, city.line, {
      speed: 12,
      isCurrent
    });
    if (!copyDone) return;

    questions.classList.remove("is-pending");
    questions.classList.add("is-ready");
    article.classList.remove("is-composing");
    answerSlot.setAttribute("aria-busy", "false");
    setAskBusy(false);
  };

  askButton.addEventListener("click", () => render(select.value));
  select.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !askButton.disabled) render(select.value);
  });

  answerSlot.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-question]");
    if (!button) return;

    const city = CITIES[answerSlot.dataset.city];
    const response = city?.questions?.[button.dataset.question];
    if (!response) return;

    answerSlot.querySelectorAll("[data-question]").forEach((item) => item.classList.toggle("is-active", item === button));

    const slot = answerSlot.querySelector("[data-cities-followups]");
    if (!slot) return;

    const token = ++followupToken;
    const isCurrent = () => token === followupToken;
    slot.innerHTML = `<div class="cities-followup-thinking">Galok is thinking<span class="cities-thinking__dots" aria-hidden="true"><i></i><i></i><i></i></span></div>`;

    await delay(reducedMotion ? 100 : 520 + Math.random() * 300);
    if (!isCurrent()) return;

    slot.innerHTML = `
      <div class="cities-followup is-composing">
        <strong class="cities-type-target" data-followup-title></strong>
        <p class="cities-type-target" data-followup-copy></p>
      </div>`;

    const followupTitle = slot.querySelector("[data-followup-title]");
    const followupCopy = slot.querySelector("[data-followup-copy]");

    const titleDone = await typeText(followupTitle, response[0], {
      speed: 22,
      isCurrent
    });
    if (!titleDone) return;

    await delay(reducedMotion ? 0 : 90);
    const copyDone = await typeText(followupCopy, response[1], {
      speed: 11,
      isCurrent
    });
    if (!copyDone) return;

    slot.querySelector(".cities-followup")?.classList.remove("is-composing");
  });
})();
