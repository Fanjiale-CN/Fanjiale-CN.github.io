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

if (window.location.pathname.replace(/index\.html$/, "") === "/cities/") {
  document.documentElement.classList.add("cities-conversation-loading");

  if (!document.querySelector("[data-cities-conversation-boot-style]")) {
    const bootStyle = document.createElement("style");
    bootStyle.dataset.citiesConversationBootStyle = "";
    bootStyle.textContent = ".viewer-hero,.city-selector{visibility:hidden!important}";
    document.head.append(bootStyle);
  }

  if (!document.querySelector('link[href^="/assets/cities-conversation.css"]')) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/assets/cities-conversation.css?v=20260913f";
    document.head.append(link);
  }

  if (!document.querySelector('link[href^="/assets/cities-sticker-repair.css"]')) {
    const repairLink = document.createElement("link");
    repairLink.rel = "stylesheet";
    repairLink.href = "/assets/cities-sticker-repair.css?v=20260913f";
    document.head.append(repairLink);
  }

  if (!document.querySelector('link[href^="/assets/cities-conversation-stream.css"]')) {
    const streamLink = document.createElement("link");
    streamLink.rel = "stylesheet";
    streamLink.href = "/assets/cities-conversation-stream.css?v=20260913f";
    document.head.append(streamLink);
  }

  if (!document.querySelector('link[href^="/assets/cities-conversation-theme.css"]')) {
    const themeLink = document.createElement("link");
    themeLink.rel = "stylesheet";
    themeLink.href = "/assets/cities-conversation-theme.css?v=20260914a";
    document.head.append(themeLink);
  }

  if (!document.querySelector('link[href^="/assets/cities-conversation-preview-radius.css"]')) {
    const previewRadiusLink = document.createElement("link");
    previewRadiusLink.rel = "stylesheet";
    previewRadiusLink.href = "/assets/cities-conversation-preview-radius.css?v=20260914b";
    document.head.append(previewRadiusLink);
  }

  if (!document.querySelector('link[href^="/assets/cities-modernize.css"]')) {
    const modernLink = document.createElement("link");
    modernLink.rel = "stylesheet";
    modernLink.href = "/assets/cities-modernize.css?v=20260914c";
    document.head.append(modernLink);
  }

  if (!document.querySelector('link[href^="/assets/galok-dual-islands.css"]')) {
    const islandsLink = document.createElement("link");
    islandsLink.rel = "stylesheet";
    islandsLink.href = "/assets/galok-dual-islands.css?v=20260914b";
    document.head.append(islandsLink);
  }

  if (!document.querySelector('link[href^="/assets/cities-islands-unified.css"]')) {
    const citiesIslandsLink = document.createElement("link");
    citiesIslandsLink.rel = "stylesheet";
    citiesIslandsLink.href = "/assets/cities-islands-unified.css?v=20260914b";
    document.head.append(citiesIslandsLink);
  }

  if (!document.querySelector('script[src^="/assets/cities-conversation.js"]')) {
    const script = document.createElement("script");
    script.src = "/assets/cities-conversation.js?v=20260913f";
    script.defer = true;
    document.head.append(script);
  }

  if (!document.querySelector('script[src^="/assets/cities-modernize.js"]')) {
    const modernScript = document.createElement("script");
    modernScript.src = "/assets/cities-modernize.js?v=20260914c";
    modernScript.defer = true;
    document.head.append(modernScript);
  }

  if (!document.querySelector('script[src^="/assets/cities-islands-unified.js"]')) {
    const islandsScript = document.createElement("script");
    islandsScript.src = "/assets/cities-islands-unified.js?v=20260914b";
    islandsScript.defer = true;
    document.head.append(islandsScript);
  }
}
