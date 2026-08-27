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
