const cityRecords = globalThis.GALOK_CONTENT?.cities;

if (!Array.isArray(cityRecords)) {
  throw new Error("GALOK_CONTENT.cities must load before the city modules.");
}

const removedCitySlugs = new Set(["dali", "tibet"]);
const visibleCityRecords = cityRecords
  .filter((city) => !removedCitySlugs.has(city.slug))
  .map((city, index) => {
    const number = String(index + 1).padStart(2, "0");
    const region = String(city.index || "").replace(/^\d+\s*\/\s*/, "");
    return Object.freeze({
      ...city,
      number,
      index: region ? `${number} / ${region}` : number
    });
  });

export const GALOK_CITIES = Object.freeze(
  Object.fromEntries(visibleCityRecords.map((city) => [city.slug, city]))
);

export function normalizeCitySlug(value = "") {
  return value.trim().toLowerCase().replace(/[’']/g, "").replace(/\s+/g, "-");
}

export function getGalokCity(value) {
  return GALOK_CITIES[normalizeCitySlug(value)] || GALOK_CITIES.beijing;
}

const currentRoute = window.location.pathname.replace(/index\.html$/, "");

const appendStyle = (href) => {
  if (document.querySelector(`link[href^="${href.split("?")[0]}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.append(link);
};

const appendDeferredScript = (src) => {
  if (document.querySelector(`script[src^="${src.split("?")[0]}"]`)) return;
  const script = document.createElement("script");
  script.src = src;
  script.defer = true;
  document.head.append(script);
};

if (currentRoute === "/cities/") {
  document.documentElement.classList.add("cities-conversation-loading");

  if (!document.querySelector("[data-cities-conversation-boot-style]")) {
    const bootStyle = document.createElement("style");
    bootStyle.dataset.citiesConversationBootStyle = "";
    bootStyle.textContent = ".viewer-hero,.city-selector{visibility:hidden!important}";
    document.head.append(bootStyle);
  }

  appendStyle("/assets/cities-conversation.css?v=20260913f");
  appendStyle("/assets/cities-sticker-repair.css?v=20260913f");
  appendStyle("/assets/cities-conversation-stream.css?v=20260913f");
  appendStyle("/assets/cities-conversation-theme.css?v=20260914a");
  appendStyle("/assets/cities-conversation-preview-radius.css?v=20260914b");
  appendStyle("/assets/cities-modernize.css?v=20260914c");
  appendStyle("/assets/galok-dual-islands.css?v=20260914b");
  appendStyle("/assets/cities-islands-unified.css?v=20260914b");
  appendStyle("/assets/cities-flat-chat.css?v=20260914a");
  appendStyle("/assets/cities-flat-chat-repair.css?v=20260914a");
  appendStyle("/assets/cities-ai-live.css?v=20260914b");

  appendDeferredScript("/assets/cities-conversation.js?v=20260913f");
  appendDeferredScript("/assets/cities-modernize.js?v=20260914c");
  appendDeferredScript("/assets/cities-islands-unified.js?v=20260914b");
  appendDeferredScript("/assets/cities-flat-chat.js?v=20260914a");
  appendDeferredScript("/assets/cities-ai-live.js?v=20260914b");
}

if (/^\/be-a-viewer\/[^/]+\/?$/.test(currentRoute)) {
  appendStyle("/assets/galok-dual-islands.css?v=20260914b");
  appendStyle("/assets/city-detail-islands.css?v=20260914b");
  appendDeferredScript("/assets/city-detail-islands.js?v=20260914b");
}
