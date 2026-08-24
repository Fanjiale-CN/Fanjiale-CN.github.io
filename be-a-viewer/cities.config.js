const cityRecords = globalThis.GALOK_CONTENT?.cities;

if (!Array.isArray(cityRecords)) {
  throw new Error("GALOK_CONTENT.cities must load before the city modules.");
}

export const GALOK_CITIES = Object.freeze(
  Object.fromEntries(cityRecords.map((city) => [city.slug, Object.freeze({ ...city })]))
);

export function normalizeCitySlug(value = "") {
  return value.trim().toLowerCase().replace(/[’']/g, "").replace(/\s+/g, "-");
}

export function getGalokCity(value) {
  return GALOK_CITIES[normalizeCitySlug(value)] || GALOK_CITIES.beijing;
}
