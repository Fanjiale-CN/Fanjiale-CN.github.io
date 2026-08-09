(() => {
  const root = document.querySelector("[data-postcard-studio]");
  if (!root) return;

  const fallbackCards = [
    { id: "xiamen-arrival-lines", city: "xiamen", cityLabel: "Xiamen", cityDisplay: "XIAMEN", code: "XM", coordinates: "24.4798° N / 118.0894° E", title: "Arrival Lines", technique: "Photo Abstract Editorial", image: "/assets/editorial/xiamen/poster/arrival-lines.webp", thumb: "/assets/editorial/xiamen/poster/thumb/arrival-lines.webp", color: "#c8a16e" },
    { id: "xiamen-island-city", city: "xiamen", cityLabel: "Xiamen", cityDisplay: "XIAMEN", code: "XM", coordinates: "24.4798° N / 118.0894° E", title: "Island / City", technique: "Photo Abstract Editorial", image: "/assets/editorial/xiamen/poster/island-city.webp", thumb: "/assets/editorial/xiamen/poster/thumb/island-city.webp", color: "#3d5550" },
    { id: "xiamen-wall-still-speaks", city: "xiamen", cityLabel: "Xiamen", cityDisplay: "XIAMEN", code: "XM", coordinates: "24.4798° N / 118.0894° E", title: "Wall Still Speaks", technique: "Minimal Zine Edition", image: "/assets/editorial/xiamen/poster/wall-still-speaks.webp", thumb: "/assets/editorial/xiamen/poster/thumb/wall-still-speaks.webp", color: "#a45c50" },
    { id: "xiamen-sea-holds-light", city: "xiamen", cityLabel: "Xiamen", cityDisplay: "XIAMEN", code: "XM", coordinates: "24.4798° N / 118.0894° E", title: "Sea Holds Light", technique: "Minimal Zine Edition", image: "/assets/editorial/xiamen/poster/sea-holds-light.webp", thumb: "/assets/editorial/xiamen/poster/thumb/sea-holds-light.webp", color: "#507a91" },
    { id: "xian-wall-as-horizon", city: "xian", cityLabel: "Xi’an", cityDisplay: "XI’AN", code: "XA", coordinates: "34.3416° N / 108.9398° E", title: "Wall as Horizon", technique: "Photo Abstract Editorial", image: "/assets/editorial/xian/poster/wall-as-horizon.webp", thumb: "/assets/editorial/xian/poster/thumb/wall-as-horizon.webp", color: "#6c7160" },
    { id: "xian-bell-after-blue", city: "xian", cityLabel: "Xi’an", cityDisplay: "XI’AN", code: "XA", coordinates: "34.3416° N / 108.9398° E", title: "Bell After Blue", technique: "Minimal Zine Edition", image: "/assets/editorial/xian/poster/bell-after-blue.webp", thumb: "/assets/editorial/xian/poster/thumb/bell-after-blue.webp", color: "#586a8b" },
    { id: "xian-earth-keeps-ranks", city: "xian", cityLabel: "Xi’an", cityDisplay: "XI’AN", code: "XA", coordinates: "34.3416° N / 108.9398° E", title: "Earth Keeps Ranks", technique: "Photo Abstract Editorial", image: "/assets/editorial/xian/poster/earth-keeps-ranks.webp", thumb: "/assets/editorial/xian/poster/thumb/earth-keeps-ranks.webp", color: "#766451" },
    { id: "xian-painted-sky", city: "xian", cityLabel: "Xi’an", cityDisplay: "XI’AN", code: "XA", coordinates: "34.3416° N / 108.9398° E", title: "Painted Sky", technique: "Minimal Zine Edition", image: "/assets/editorial/xian/poster/painted-sky.webp", thumb: "/assets/editorial/xian/poster/thumb/painted-sky.webp", color: "#8d332c" },
    { id: "beijing-measured-courtyard", city: "beijing", cityLabel: "Beijing", cityDisplay: "BEIJING", code: "BJ", coordinates: "39.9042° N / 116.4074° E", title: "Measured Courtyard", technique: "Photo Abstract Editorial", image: "/assets/editorial/beijing/poster/measured-courtyard.webp", thumb: "/assets/editorial/beijing/poster/thumb/measured-courtyard.webp", color: "#a44435" },
    { id: "beijing-doorway-at-noon", city: "beijing", cityLabel: "Beijing", cityDisplay: "BEIJING", code: "BJ", coordinates: "39.9042° N / 116.4074° E", title: "Doorway at Noon", technique: "Minimal Zine Edition", image: "/assets/editorial/beijing/poster/doorway-at-noon.webp", thumb: "/assets/editorial/beijing/poster/thumb/doorway-at-noon.webp", color: "#b0935c" },
    { id: "beijing-ordinary-velocity", city: "beijing", cityLabel: "Beijing", cityDisplay: "BEIJING", code: "BJ", coordinates: "39.9042° N / 116.4074° E", title: "Ordinary Velocity", technique: "Minimal Zine Edition", image: "/assets/editorial/beijing/poster/ordinary-velocity.webp", thumb: "/assets/editorial/beijing/poster/thumb/ordinary-velocity.webp", color: "#6e5a50" },
    { id: "beijing-rings-of-light", city: "beijing", cityLabel: "Beijing", cityDisplay: "BEIJING", code: "BJ", coordinates: "39.9042° N / 116.4074° E", title: "Rings of Light", technique: "Photo Abstract Editorial", image: "/assets/editorial/beijing/poster/rings-of-light.webp", thumb: "/assets/editorial/beijing/poster/thumb/rings-of-light.webp", color: "#403f3a" },
    { id: "beijing-roofs-hold-evening", city: "beijing", cityLabel: "Beijing", cityDisplay: "BEIJING", code: "BJ", coordinates: "39.9042° N / 116.4074° E", title: "Roofs Hold Evening", technique: "Photo Abstract Editorial", image: "/assets/editorial/beijing/poster/roofs-hold-evening.webp", thumb: "/assets/editorial/beijing/poster/thumb/roofs-hold-evening.webp", color: "#9a6a32" },
    { id: "beijing-order-under-sky", city: "beijing", cityLabel: "Beijing", cityDisplay: "BEIJING", code: "BJ", coordinates: "39.9042° N / 116.4074° E", title: "Order Under Sky", technique: "Photo Abstract Editorial", image: "/assets/editorial/beijing/poster/order-under-sky.webp", thumb: "/assets/editorial/beijing/poster/thumb/order-under-sky.webp", color: "#a44632" },
    { id: "beijing-the-city-bends", city: "beijing", cityLabel: "Beijing", cityDisplay: "BEIJING", code: "BJ", coordinates: "39.9042° N / 116.4074° E", title: "The City Bends", technique: "Photo Abstract Editorial", image: "/assets/editorial/beijing/poster/the-city-bends.webp", thumb: "/assets/editorial/beijing/poster/thumb/the-city-bends.webp", color: "#d5b96b" },
    { id: "beijing-storm-over-glass", city: "beijing", cityLabel: "Beijing", cityDisplay: "BEIJING", code: "BJ", coordinates: "39.9042° N / 116.4074° E", title: "Storm Over Glass", technique: "Photo Abstract Editorial", image: "/assets/editorial/beijing/poster/storm-over-glass.webp", thumb: "/assets/editorial/beijing/poster/thumb/storm-over-glass.webp", color: "#4e5b75" },
    { id: "beijing-ridge-after-ridge", city: "beijing", cityLabel: "Beijing", cityDisplay: "BEIJING", code: "BJ", coordinates: "39.9042° N / 116.4074° E", title: "Ridge After Ridge", technique: "Photo Abstract Editorial", image: "/assets/editorial/beijing/poster/ridge-after-ridge.webp", thumb: "/assets/editorial/beijing/poster/thumb/ridge-after-ridge.webp", color: "#465443" },
    { id: "beijing-rain-keeps-the-street", city: "beijing", cityLabel: "Beijing", cityDisplay: "BEIJING", code: "BJ", coordinates: "39.9042° N / 116.4074° E", title: "Rain Keeps the Street", technique: "Photo Abstract Editorial", image: "/assets/editorial/beijing/poster/rain-keeps-the-street.webp", thumb: "/assets/editorial/beijing/poster/thumb/rain-keeps-the-street.webp", color: "#d46b27" },
    { id: "beijing-the-shop-stays-open", city: "beijing", cityLabel: "Beijing", cityDisplay: "BEIJING", code: "BJ", coordinates: "39.9042° N / 116.4074° E", title: "The Shop Stays Open", technique: "Minimal Zine Edition", image: "/assets/editorial/beijing/poster/the-shop-stays-open.webp", thumb: "/assets/editorial/beijing/poster/thumb/the-shop-stays-open.webp", color: "#ad3629" },
    { id: "beijing-between-two-chairs", city: "beijing", cityLabel: "Beijing", cityDisplay: "BEIJING", code: "BJ", coordinates: "39.9042° N / 116.4074° E", title: "Between Two Chairs", technique: "Minimal Zine Edition", image: "/assets/editorial/beijing/poster/between-two-chairs.webp", thumb: "/assets/editorial/beijing/poster/thumb/between-two-chairs.webp", color: "#41817a" },
    { id: "beijing-winter-in-sugar", city: "beijing", cityLabel: "Beijing", cityDisplay: "BEIJING", code: "BJ", coordinates: "39.9042° N / 116.4074° E", title: "Winter in Sugar", technique: "Minimal Zine Edition", image: "/assets/editorial/beijing/poster/winter-in-sugar.webp", thumb: "/assets/editorial/beijing/poster/thumb/winter-in-sugar.webp", color: "#bd2b25" },
    { id: "beijing-behind-the-glass", city: "beijing", cityLabel: "Beijing", cityDisplay: "BEIJING", code: "BJ", coordinates: "39.9042° N / 116.4074° E", title: "Behind the Glass", technique: "Minimal Zine Edition", image: "/assets/editorial/beijing/poster/behind-the-glass.webp", thumb: "/assets/editorial/beijing/poster/thumb/behind-the-glass.webp", color: "#b16c2f" },
    { id: "beijing-winter-holds-red", city: "beijing", cityLabel: "Beijing", cityDisplay: "BEIJING", code: "BJ", coordinates: "39.9042° N / 116.4074° E", title: "Winter Holds Red", technique: "Minimal Zine Edition", image: "/assets/editorial/beijing/poster/winter-holds-red.webp", thumb: "/assets/editorial/beijing/poster/thumb/winter-holds-red.webp", color: "#9c2825" },
    { id: "beijing-the-square-after-dark", city: "beijing", cityLabel: "Beijing", cityDisplay: "BEIJING", code: "BJ", coordinates: "39.9042° N / 116.4074° E", title: "The Square After Dark", technique: "Minimal Zine Edition", image: "/assets/editorial/beijing/poster/the-square-after-dark.webp", thumb: "/assets/editorial/beijing/poster/thumb/the-square-after-dark.webp", color: "#7d2325" },
    { id: "shanghai-river-in-fog", city: "shanghai", cityLabel: "Shanghai", cityDisplay: "SHANGHAI", code: "SH", coordinates: "31.2304° N / 121.4737° E", title: "River in Fog", technique: "Photo Abstract Editorial", image: "/assets/editorial/shanghai/poster/river-in-fog.webp", thumb: "/assets/editorial/shanghai/poster/thumb/river-in-fog.webp", color: "#8b9391" },
    { id: "shanghai-blue-hour-crossing", city: "shanghai", cityLabel: "Shanghai", cityDisplay: "SHANGHAI", code: "SH", coordinates: "31.2304° N / 121.4737° E", title: "Blue Hour Crossing", technique: "Photo Abstract Editorial", image: "/assets/editorial/shanghai/poster/blue-hour-crossing.webp", thumb: "/assets/editorial/shanghai/poster/thumb/blue-hour-crossing.webp", color: "#35546a" },
    { id: "shanghai-door-stays-gold", city: "shanghai", cityLabel: "Shanghai", cityDisplay: "SHANGHAI", code: "SH", coordinates: "31.2304° N / 121.4737° E", title: "The Door Stays Gold", technique: "Minimal Zine Edition", image: "/assets/editorial/shanghai/poster/door-stays-gold.webp", thumb: "/assets/editorial/shanghai/poster/thumb/door-stays-gold.webp", color: "#b48a2b" },
    { id: "shanghai-city-worn-close", city: "shanghai", cityLabel: "Shanghai", cityDisplay: "SHANGHAI", code: "SH", coordinates: "31.2304° N / 121.4737° E", title: "The City, Worn Close", technique: "Photo Abstract Editorial", image: "/assets/editorial/shanghai/poster/city-worn-close.webp", thumb: "/assets/editorial/shanghai/poster/thumb/city-worn-close.webp", color: "#5c5948" }
  ];
  const cards = Array.isArray(window.GALOK_POSTCARDS) && window.GALOK_POSTCARDS.length
    ? [...window.GALOK_POSTCARDS]
    : fallbackCards;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const object = root.querySelector("[data-postcard-object]");
  const stage = root.querySelector("[data-postcard-stage]");
  const strip = root.querySelector("[data-postcard-strip]");
  const image = root.querySelector("[data-postcard-image]");
  const message = root.querySelector("[data-postcard-message]");
  const sender = root.querySelector("[data-postcard-sender]");
  const recipient = root.querySelector("[data-postcard-recipient]");
  const toast = document.querySelector("[data-postcard-toast]");
  const soundButton = root.querySelector("[data-postcard-sound]");
  const audio = Object.fromEntries([...document.querySelectorAll("[data-postcard-audio]")].map((item) => [item.dataset.postcardAudio, item]));
  const draftsKey = "galok-postcard-drafts-v1";
  const soundKey = "galok-postcard-sound-v1";
  let activeFilter = "all";
  let activeIndex = Math.max(0, cards.findIndex((card) => card.id === new URLSearchParams(window.location.search).get("card")));
  let filteredIndexes = cards.map((_, index) => index);
  let soundEnabled = false;
  let toastTimer = 0;
  let switchTimer = 0;
  let pointerStartX = null;
  let suppressFlipClick = false;
  let drafts = {};
  let initialized = false;

  try {
    drafts = JSON.parse(window.localStorage.getItem(draftsKey) || "{}") || {};
    soundEnabled = window.localStorage.getItem(soundKey) === "on";
  } catch (error) {
    drafts = {};
  }

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function setText(selector, value) {
    const node = root.querySelector(selector);
    if (node) node.textContent = value;
  }

  function playCue(name) {
    if (!soundEnabled || !audio[name]) return;
    const cue = audio[name];
    cue.pause();
    cue.currentTime = 0;
    cue.volume = name === "stamp" ? 0.58 : 0.42;
    cue.play().catch(() => {});
  }

  function showToast(text) {
    if (!toast) return;
    window.clearTimeout(toastTimer);
    toast.textContent = text;
    toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2800);
  }

  function saveDraft() {
    const current = cards[activeIndex];
    if (!current) return;
    drafts[current.id] = {
      message: message?.value || "",
      sender: sender?.value || "",
      recipient: recipient?.value || ""
    };
    try {
      window.localStorage.setItem(draftsKey, JSON.stringify(drafts));
    } catch (error) {
      // The editor continues when storage is unavailable.
    }
  }

  function loadDraft(card) {
    const draft = drafts[card.id] || {};
    if (message) message.value = draft.message || "";
    if (sender) sender.value = draft.sender || "";
    if (recipient) recipient.value = draft.recipient || "";
  }

  function syncSoundButton() {
    if (!soundButton) return;
    soundButton.setAttribute("aria-pressed", String(soundEnabled));
    const label = soundButton.querySelector("span");
    if (label) label.textContent = soundEnabled ? "Sound on" : "Sound off";
  }

  function renderStrip() {
    const cityLabels = { all: "All", xiamen: "Xiamen", xian: "Xi’an", beijing: "Beijing", shanghai: "Shanghai" };
    root.querySelectorAll("[data-postcard-filter]").forEach((button) => {
      const filter = button.dataset.postcardFilter || "all";
      const count = filter === "all" ? cards.length : cards.filter((card) => card.city === filter).length;
      button.textContent = `${cityLabels[filter] || filter} / ${pad(count)}`;
      button.setAttribute("aria-label", `Show ${count} ${cityLabels[filter] || filter} postcards`);
    });
    strip.setAttribute("aria-label", `${cards.length} city postcards`);
    strip.innerHTML = cards.map((card, index) => `
      <button class="postcard-thumb" type="button" data-postcard-select="${index}" data-city="${card.city}" aria-label="Open ${card.title}, ${card.cityLabel}" aria-setsize="${cards.length}" aria-posinset="${index + 1}">
        <span class="postcard-thumb-image"><img src="${card.thumb}" alt="${card.title} postcard from ${card.cityLabel}" loading="lazy" decoding="async" width="480" height="720"></span>
        <span><b>${pad(index + 1)}</b><small>${card.cityDisplay}<br>${card.title.toUpperCase()}</small></span>
      </button>
    `).join("");
  }

  function visiblePosition(index) {
    const position = filteredIndexes.indexOf(index);
    return position >= 0 ? position : 0;
  }

  function keepSelectedThumbVisible() {
    const selected = strip.querySelector(`[data-postcard-select="${activeIndex}"]`);
    if (!selected) return;
    const horizontal = strip.scrollWidth > strip.clientWidth && window.getComputedStyle(strip).overflowX !== "hidden";
    if (horizontal) {
      const target = selected.offsetLeft - (strip.clientWidth - selected.offsetWidth) / 2;
      strip.scrollTo({ left: Math.max(0, target), behavior: reduceMotion ? "auto" : "smooth" });
      return;
    }
    const top = selected.offsetTop;
    const bottom = top + selected.offsetHeight;
    if (top < strip.scrollTop) strip.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
    else if (bottom > strip.scrollTop + strip.clientHeight) {
      strip.scrollTo({ top: bottom - strip.clientHeight, behavior: reduceMotion ? "auto" : "smooth" });
    }
  }

  function syncCard() {
    const card = cards[activeIndex];
    const position = visiblePosition(activeIndex);
    if (!card) return;

    object?.style.setProperty("--postcard-city-color", card.color);
    if (image) {
      image.src = card.image;
      image.alt = `${card.title} editorial postcard from ${card.cityLabel}`;
    }
    setText("[data-postcard-edition]", `${pad(activeIndex + 1)} / ${pad(cards.length)}`);
    setText("[data-postcard-city]", card.cityDisplay);
    setText("[data-postcard-coordinates]", card.coordinates);
    setText("[data-postcard-title]", card.title.toUpperCase());
    setText("[data-postcard-back-city]", card.cityDisplay);
    setText("[data-postcard-back-coordinates]", card.coordinates);
    setText("[data-postcard-stamp-city]", card.code);
    setText("[data-postcard-tool-title]", card.title);
    setText("[data-postcard-tool-detail]", `${card.cityLabel} / ${card.technique}`);
    setText("[data-postcard-current]", pad(position + 1));
    setText("[data-postcard-total]", pad(filteredIndexes.length));
    setText("[data-postcard-status]", `${card.cityLabel} / ${card.title} / ${pad(position + 1)} of ${pad(filteredIndexes.length)}`);
    loadDraft(card);

    strip.querySelectorAll("[data-postcard-select]").forEach((button) => {
      const selected = Number(button.dataset.postcardSelect) === activeIndex;
      if (selected) button.setAttribute("aria-current", "true");
      else button.removeAttribute("aria-current");
    });
    if (initialized) window.requestAnimationFrame(keepSelectedThumbVisible);

    const url = new URL(window.location.href);
    url.searchParams.set("card", card.id);
    window.history.replaceState({}, "", url);

    const nextIndex = filteredIndexes[(position + 1) % filteredIndexes.length];
    if (Number.isFinite(nextIndex)) {
      const preload = new Image();
      preload.src = cards[nextIndex].image;
    }
  }

  function setCard(index, options = {}) {
    if (!cards[index] || index === activeIndex) return;
    saveDraft();
    activeIndex = index;
    if (object?.classList.contains("is-flipped")) object.classList.remove("is-flipped");
    window.clearTimeout(switchTimer);

    if (reduceMotion || options.instant) {
      syncCard();
    } else {
      object?.classList.add("is-switching");
      switchTimer = window.setTimeout(() => {
        syncCard();
        window.requestAnimationFrame(() => object?.classList.remove("is-switching"));
      }, 180);
    }
    playCue("select");
  }

  function move(direction) {
    const currentPosition = visiblePosition(activeIndex);
    const nextPosition = (currentPosition + direction + filteredIndexes.length) % filteredIndexes.length;
    setCard(filteredIndexes[nextPosition]);
  }

  function setFlipped(flipped) {
    if (!object || object.classList.contains("is-flipped") === flipped) return;
    saveDraft();
    object.classList.toggle("is-flipped", flipped);
    stage?.setAttribute("data-side", flipped ? "back" : "front");
    const flipLabel = root.querySelector("[data-postcard-flip] span");
    const flipDetail = root.querySelector("[data-postcard-flip] small");
    if (flipLabel) flipLabel.textContent = flipped ? "Show front" : "Turn over";
    if (flipDetail) flipDetail.textContent = flipped ? "Return to artwork" : "Write the back";
    playCue("turn");
    if (flipped) window.setTimeout(() => message?.focus({ preventScroll: true }), reduceMotion ? 0 : 420);
  }

  function applyFilter(filter) {
    activeFilter = filter;
    filteredIndexes = cards.map((card, index) => ({ card, index }))
      .filter(({ card }) => filter === "all" || card.city === filter)
      .map(({ index }) => index);
    if (!filteredIndexes.length) return;

    root.querySelectorAll("[data-postcard-filter]").forEach((button) => {
      button.setAttribute("aria-selected", String(button.dataset.postcardFilter === filter));
    });
    strip.querySelectorAll("[data-postcard-select]").forEach((button) => {
      button.hidden = filter !== "all" && button.dataset.city !== filter;
    });

    if (!filteredIndexes.includes(activeIndex)) {
      setCard(filteredIndexes[0], { instant: reduceMotion });
    } else {
      syncCard();
    }
  }

  function loadImage(source) {
    return new Promise((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = reject;
      element.src = source;
    });
  }

  function drawContained(context, source, x, y, width, height) {
    const ratio = Math.min(width / source.naturalWidth, height / source.naturalHeight);
    const renderWidth = source.naturalWidth * ratio;
    const renderHeight = source.naturalHeight * ratio;
    context.drawImage(source, x + (width - renderWidth) / 2, y + (height - renderHeight) / 2, renderWidth, renderHeight);
  }

  function wrapText(context, value, x, y, maxWidth, lineHeight, maxLines = 8) {
    const words = (value || "").trim().split(/\s+/).filter(Boolean);
    const lines = [];
    let line = "";
    words.forEach((word) => {
      const test = line ? `${line} ${word}` : word;
      if (context.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    });
    if (line) lines.push(line);
    lines.slice(0, maxLines).forEach((item, index) => context.fillText(item, x, y + index * lineHeight));
  }

  async function buildPostcardBlob() {
    saveDraft();
    const card = cards[activeIndex];
    const draft = drafts[card.id] || {};
    const [art, mark] = await Promise.all([loadImage(card.image), loadImage("/assets/galok-symbol.svg")]);
    const canvas = document.createElement("canvas");
    canvas.width = 3000;
    canvas.height = 1080;
    const context = canvas.getContext("2d");
    const paper = "#f3efe5";
    const ink = "#151615";
    const muted = "#69675f";
    const accent = "#9e3028";

    context.fillStyle = "#d8d1c3";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Front / 1440 × 960
    context.fillStyle = paper;
    context.fillRect(40, 60, 1440, 960);
    context.fillStyle = card.color;
    context.fillRect(40, 60, 610, 960);
    drawContained(context, art, 100, 110, 490, 860);
    context.fillStyle = ink;
    context.font = "700 38px Helvetica Neue, Arial, sans-serif";
    context.fillText(`${pad(activeIndex + 1)} / ${pad(cards.length)}`, 720, 150);
    context.font = "800 104px Helvetica Neue, Arial, sans-serif";
    wrapText(context, card.cityDisplay, 720, 470, 620, 104, 2);
    context.fillStyle = muted;
    context.font = "700 24px Helvetica Neue, Arial, sans-serif";
    context.fillText(card.coordinates, 720, 580);
    context.strokeStyle = "rgba(21,22,21,.28)";
    context.beginPath();
    context.moveTo(720, 690);
    context.lineTo(1390, 690);
    context.stroke();
    context.fillStyle = ink;
    context.font = "500 40px Georgia, serif";
    wrapText(context, card.title.toUpperCase(), 720, 770, 620, 48, 3);
    context.fillStyle = muted;
    context.font = "700 18px Helvetica Neue, Arial, sans-serif";
    context.fillText("GALOK.ME / BE A VIEWER", 720, 950);

    // Back / 1440 × 960
    const backX = 1520;
    context.fillStyle = paper;
    context.fillRect(backX, 60, 1440, 960);
    context.strokeStyle = "rgba(21,22,21,.25)";
    context.beginPath();
    context.moveTo(backX + 780, 140);
    context.lineTo(backX + 780, 940);
    context.stroke();
    context.fillStyle = accent;
    context.font = "800 26px Helvetica Neue, Arial, sans-serif";
    context.fillText(card.cityDisplay, backX + 90, 150);
    context.fillStyle = muted;
    context.font = "700 18px Helvetica Neue, Arial, sans-serif";
    context.fillText("CITY POSTCARD / 2026", backX + 90, 190);
    context.fillStyle = ink;
    context.font = "400 34px Georgia, serif";
    wrapText(context, draft.message || "A note from the city…", backX + 90, 290, 610, 54, 10);
    context.fillStyle = muted;
    context.font = "700 18px Helvetica Neue, Arial, sans-serif";
    context.fillText(`FROM / ${draft.sender || "GALOK VIEWER"}`, backX + 90, 910);

    context.strokeStyle = accent;
    context.lineWidth = 4;
    context.strokeRect(backX + 1190, 120, 150, 182);
    drawContained(context, mark, backX + 1212, 142, 106, 112);
    context.fillStyle = accent;
    context.font = "800 18px Helvetica Neue, Arial, sans-serif";
    context.fillText(`${card.code} / 2026`, backX + 1210, 282);
    context.fillStyle = muted;
    context.font = "700 18px Helvetica Neue, Arial, sans-serif";
    context.fillText("TO", backX + 850, 390);
    context.fillStyle = ink;
    context.font = "500 32px Georgia, serif";
    context.fillText(draft.recipient || "Recipient", backX + 850, 440);
    context.strokeStyle = "rgba(21,22,21,.25)";
    for (let line = 0; line < 4; line += 1) {
      const y = 520 + line * 95;
      context.beginPath();
      context.moveTo(backX + 850, y);
      context.lineTo(backX + 1350, y);
      context.stroke();
    }
    context.fillStyle = muted;
    context.font = "700 17px Helvetica Neue, Arial, sans-serif";
    context.fillText(card.coordinates, backX + 850, 910);
    context.fillText("GALOK CITY VISUAL ARCHIVE", backX + 850, 945);

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Canvas export failed")), "image/png", 0.96);
    });
  }

  async function downloadPostcard() {
    const button = root.querySelector("[data-postcard-download]");
    button?.setAttribute("aria-busy", "true");
    try {
      const blob = await buildPostcardBlob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `galok-postcard-${cards[activeIndex].id}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(link.href), 1200);
      playCue("stamp");
      showToast("Postcard set downloaded as a high-resolution PNG.");
    } catch (error) {
      showToast("The postcard could not be exported. Please try again.");
    } finally {
      button?.removeAttribute("aria-busy");
    }
  }

  async function sharePostcard() {
    saveDraft();
    const card = cards[activeIndex];
    const url = new URL(window.location.href);
    url.search = "";
    url.searchParams.set("card", card.id);
    const title = `${card.title} — ${card.cityLabel} / GALOK`;
    const text = `A city postcard from ${card.cityLabel}: ${card.title}.`;

    try {
      if (navigator.share) {
        const blob = await buildPostcardBlob();
        const file = new File([blob], `galok-postcard-${card.id}.png`, { type: "image/png" });
        const data = { title, text, url: url.toString() };
        if (navigator.canShare?.({ files: [file] })) data.files = [file];
        await navigator.share(data);
        playCue("stamp");
        showToast("Postcard shared.");
        return;
      }
      await navigator.clipboard.writeText(url.toString());
      showToast("Postcard link copied.");
      playCue("stamp");
    } catch (error) {
      if (error?.name !== "AbortError") showToast("Sharing was unavailable. The postcard is still here.");
    }
  }

  renderStrip();
  syncSoundButton();
  applyFilter("all");
  initialized = true;

  root.querySelectorAll("[data-postcard-filter]").forEach((button) => {
    button.addEventListener("click", () => applyFilter(button.dataset.postcardFilter || "all"));
  });
  strip.addEventListener("click", (event) => {
    const button = event.target.closest("[data-postcard-select]");
    if (button) setCard(Number(button.dataset.postcardSelect));
  });
  root.querySelector("[data-postcard-previous]")?.addEventListener("click", () => move(-1));
  root.querySelector("[data-postcard-next]")?.addEventListener("click", () => move(1));
  root.querySelector("[data-postcard-flip]")?.addEventListener("click", () => setFlipped(!object?.classList.contains("is-flipped")));
  root.querySelector("[data-postcard-flip-front]")?.addEventListener("click", (event) => {
    if (suppressFlipClick) {
      event.preventDefault();
      return;
    }
    setFlipped(true);
  });
  root.querySelector("[data-postcard-flip-back]")?.addEventListener("click", () => setFlipped(false));
  root.querySelector("[data-postcard-download]")?.addEventListener("click", downloadPostcard);
  root.querySelector("[data-postcard-share]")?.addEventListener("click", sharePostcard);
  soundButton?.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    try { window.localStorage.setItem(soundKey, soundEnabled ? "on" : "off"); } catch (error) {}
    syncSoundButton();
    if (soundEnabled) playCue("select");
    showToast(soundEnabled ? "Postcard sounds are on." : "Postcard sounds are off.");
  });

  [message, sender, recipient].forEach((field) => field?.addEventListener("input", saveDraft));
  window.addEventListener("pagehide", saveDraft);

  stage?.addEventListener("pointerdown", (event) => {
    if (event.target.closest("input, textarea")) return;
    const button = event.target.closest("button");
    if (button && !button.matches("[data-postcard-flip-front]")) return;
    pointerStartX = event.clientX;
  }, { passive: true });
  stage?.addEventListener("pointerup", (event) => {
    if (pointerStartX === null) return;
    const distance = event.clientX - pointerStartX;
    pointerStartX = null;
    if (Math.abs(distance) >= 54) {
      suppressFlipClick = true;
      move(distance < 0 ? 1 : -1);
      window.setTimeout(() => { suppressFlipClick = false; }, 0);
    }
  }, { passive: true });
  stage?.addEventListener("pointercancel", () => { pointerStartX = null; });

  document.addEventListener("keydown", (event) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
    if (event.key === "ArrowLeft") move(-1);
    if (event.key === "ArrowRight") move(1);
    if (event.key.toLowerCase() === "f") setFlipped(!object?.classList.contains("is-flipped"));
  });
})();
