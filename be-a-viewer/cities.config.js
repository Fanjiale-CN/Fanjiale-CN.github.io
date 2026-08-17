export const GALOK_CITIES = Object.freeze({
  beijing: Object.freeze({
    slug: "beijing",
    number: "01",
    index: "01 / NORTH CHINA",
    name: "BEIJING",
    latitude: 39.9042,
    longitude: 116.4074,
    description: "Power, ceremony and everyday movement.",
    status: "AVAILABLE · ENTER THE STORY ↗",
    href: "/be-a-viewer/beijing/"
  }),
  shanghai: Object.freeze({
    slug: "shanghai",
    number: "02",
    index: "02 / EAST CHINA",
    name: "SHANGHAI",
    latitude: 31.2304,
    longitude: 121.4737,
    description: "River, streets and a vertical city.",
    status: "AVAILABLE · ENTER THE STORY ↗",
    href: "/be-a-viewer/shanghai/"
  }),
  xian: Object.freeze({
    slug: "xian",
    number: "03",
    index: "03 / NORTHWEST CHINA",
    name: "XI’AN",
    latitude: 34.3416,
    longitude: 108.9398,
    description: "Empire, memory and life inside the wall.",
    status: "AVAILABLE · ENTER THE STORY ↗",
    href: "/be-a-viewer/xian/"
  }),
  dali: Object.freeze({
    slug: "dali",
    number: "04",
    index: "04 / SOUTHWEST CHINA",
    name: "DALI",
    latitude: 25.6065,
    longitude: 100.2676,
    description: "Mountains, water and a slower rhythm.",
    status: "COMING SOON"
  }),
  shenzhen: Object.freeze({
    slug: "shenzhen",
    number: "05",
    index: "05 / SOUTH CHINA",
    name: "SHENZHEN",
    latitude: 22.5431,
    longitude: 114.0579,
    description: "A city built at the speed of possibility.",
    status: "COMING SOON"
  }),
  xiamen: Object.freeze({
    slug: "xiamen",
    number: "06",
    index: "06 / SOUTHEAST CHINA",
    name: "XIAMEN",
    latitude: 24.4798,
    longitude: 118.0894,
    description: "Sea light, Minnan rooflines and a city moving with the tide.",
    status: "AVAILABLE · ENTER THE STORY ↗",
    href: "/be-a-viewer/xiamen/"
  }),
  tibet: Object.freeze({
    slug: "tibet",
    number: "07",
    index: "07 / WEST CHINA",
    name: "TIBET",
    latitude: 29.65,
    longitude: 91.1,
    description: "Altitude, belief and a landscape beyond scale.",
    status: "COMING SOON"
  }),
  hangzhou: Object.freeze({
    slug: "hangzhou",
    number: "08",
    index: "08 / EAST CHINA",
    name: "HANGZHOU",
    latitude: 30.2741,
    longitude: 120.1551,
    description: "Water, hills and a city held behind the lake.",
    status: "AVAILABLE · ENTER THE FIELD NOTE ↗",
    href: "/be-a-viewer/hangzhou/"
  })
});

export function normalizeCitySlug(value = "") {
  return value.trim().toLowerCase().replace(/[’']/g, "").replace(/\s+/g, "-");
}

export function getGalokCity(value) {
  return GALOK_CITIES[normalizeCitySlug(value)] || GALOK_CITIES.beijing;
}
