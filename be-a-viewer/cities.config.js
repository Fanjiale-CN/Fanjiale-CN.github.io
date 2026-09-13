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

/*
 * /cities/ is intentionally absent here.
 * Its CSS is now loaded from the render-blocking cities-dual-islands.css entry
 * and its runtime is loaded in a deterministic sequence by cities-dual-islands.js.
 * Keeping the hub bootstrap out of this module prevents the late cascade swap
 * that previously caused typography and layout to jump after first paint.
 */

if (/^\/be-a-viewer\/[^/]+\/?$/.test(currentRoute)) {
  appendStyle("/assets/galok-dual-islands.css?v=20260914b");
  appendStyle("/assets/city-detail-islands.css?v=20260914b");
  appendDeferredScript("/assets/city-detail-islands.js?v=20260914b");
}
