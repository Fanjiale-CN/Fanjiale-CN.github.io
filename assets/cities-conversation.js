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
      line: "A city organised by axes, enclosure and ceremony, softened by trees, walls and the pace of ordinary movement.",
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
      line: "River light, compressed streets and vertical ambition keep Shanghai in constant visual motion.",
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
      line: "Stone, brick, ritual scale and contemporary traffic keep history close without freezing the city into a museum.",
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
      line: "A city still arriving, where speed becomes skyline, reflection and ordinary night.",
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
      line: "Coastline, humidity and softer light make the city feel defined by edges rather than pressure.",
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
      line: "Water often arrives before the street, allowing the city to appear gradually through distance, foliage and reflection.",
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
      line: "Two rivers set the baseline while streets, rail and buildings keep climbing above it.",
      questions: {
        notice: ["What stays with you?", "Ground level never feels final. The city keeps stacking another route, bridge or entrance above and below the last one."],
        archive: ["What should I look for?", "Vertical circulation, river crossings, rail, night light and the accidental views created by extreme topography."],
        enter: ["Where do I begin?", "Begin at river level, then climb. Chongqing becomes legible only when you experience how often the city changes altitude."]
      }
    }
  };

  const STICKERS = [
    ["/assets/cities/stickers/shanghai-lujiazui.webp", "Shanghai skyline"],
    ["/assets/cities/stickers/xian-dayanta.webp", "Xi’an pagoda"],
    ["/assets/cities/stickers/beijing-gugong.webp", "Beijing palace"],
    ["/assets/cities/stickers/pagoda.webp", "Pagoda"],
    ["/assets/cities/stickers/xiamen-harbor.webp", "Xiamen harbour"]
  ];

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
            ${Object.entries(CITIES).map(([slug, city]) => `<option value="${slug}"${slug === "shanghai" ? " selected" : ""}>${city.name}</option>`).join("")}
          </select>
        </span>
        <button class="cities-conversation__ask" type="button" data-cities-ask aria-label="Ask Galok about this city">OK</button>
      </div>
      <p class="cities-conversation__hint">Choose a city Galok already knows. The answers are part of the archive.</p>
      <div data-cities-answer aria-live="polite"></div>
    </div>
  `;

  const main = document.querySelector("main");
  if (!main) return;
  main.prepend(section);
  document.querySelector("[data-cities-conversation-boot-style]")?.remove();
  document.documentElement.classList.remove("cities-conversation-loading");

  const stickerLayer = section.querySelector("[data-cities-stickers]");
  const count = window.matchMedia("(max-width: 720px)").matches ? 3 : 4;
  const chosen = shuffle(STICKERS).slice(0, count);
  const slots = ["a", "b", "c", "d"];

  chosen.forEach(([src, alt], index) => {
    const sticker = document.createElement("div");
    sticker.className = "cities-sticker";
    sticker.dataset.slot = slots[index];
    sticker.style.setProperty("--float", `${7 + index * .65}s`);
    sticker.innerHTML = `<img src="${src}" alt="${alt}" loading="${index < 2 ? "eager" : "lazy"}" decoding="async" draggable="false">`;

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
    stickerLayer.append(sticker);
  });

  const select = section.querySelector("#cities-conversation-select");
  const answerSlot = section.querySelector("[data-cities-answer]");

  const render = (slug) => {
    const city = CITIES[slug];
    if (!city) return;
    answerSlot.innerHTML = `
      <article class="cities-answer">
        <figure class="cities-answer__media"><img src="${city.image}" alt="${city.name}" loading="eager" decoding="async"></figure>
        <div class="cities-answer__body">
          <div class="cities-answer__meta"><span>GALOK / CITY NOTE</span><span>${city.coordinate}</span></div>
          <h2>${city.name}</h2>
          <p>${city.line}</p>
          <div class="cities-answer__questions">
            <button type="button" class="cities-answer__question" data-question="notice">What stays with you?</button>
            <button type="button" class="cities-answer__question" data-question="archive">What should I look for?</button>
            <button type="button" class="cities-answer__question" data-question="enter">Where do I begin?</button>
            <a class="cities-answer__enter" href="${city.href}">Enter ${city.name} ↗</a>
          </div>
        </div>
      </article>
      <div data-cities-followups></div>
    `;
    answerSlot.dataset.city = slug;
    answerSlot.querySelector(".cities-answer")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  section.querySelector("[data-cities-ask]").addEventListener("click", () => render(select.value));
  select.addEventListener("keydown", (event) => {
    if (event.key === "Enter") render(select.value);
  });

  answerSlot.addEventListener("click", (event) => {
    const button = event.target.closest("[data-question]");
    if (!button) return;
    const city = CITIES[answerSlot.dataset.city];
    const response = city?.questions?.[button.dataset.question];
    if (!response) return;
    const slot = answerSlot.querySelector("[data-cities-followups]");
    slot.innerHTML = `<div class="cities-followup"><strong>${response[0]}</strong><p>${response[1]}</p></div>`;
  });
})();
