import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join } from "node:path";

const projectRoot = new URL("../", import.meta.url).pathname;
const paper = "#f1ede2";
const ink = "#151615";
const muted = "#68665f";
const sans = "Helvetica-Narrow-Bold";
const serif = "C059-Roman";

const cities = {
  xiamen: { label: "Xiamen", display: "XIAMEN", code: "XM", coordinates: "24.4798° N / 118.0894° E", fallback: "#8d3c35" },
  xian: { label: "Xi’an", display: "XI'AN", code: "XA", coordinates: "34.3416° N / 108.9398° E", fallback: "#8b342c" },
  beijing: { label: "Beijing", display: "BEIJING", code: "BJ", coordinates: "39.9042° N / 116.4074° E", fallback: "#a53b2e" },
  shanghai: { label: "Shanghai", display: "SHANGHAI", code: "SH", coordinates: "31.2304° N / 121.4737° E", fallback: "#174c58" }
};

const preferred = {
  xiamen: [
    ["/assets/be-a-viewer/xiamen/editorial/pexels-peter-xie-371876898-35157085-desktop.webp", "xiamen-arrival-lines", "Arrival Lines", "Photo Abstract Editorial"],
    ["/assets/be-a-viewer/xiamen/editorial/pexels-zhicheng-zhang-312594413-20200335-desktop.webp", "xiamen-island-city", "Island / City", "Photo Abstract Editorial"],
    ["/assets/be-a-viewer/xiamen/editorial/pexels-norriexf-20453481-9359225-desktop.webp", "xiamen-wall-still-speaks", "Wall Still Speaks", "Minimal Zine Edition"],
    ["/assets/be-a-viewer/xiamen/editorial/pexels-158520687-14520168-desktop.webp", "xiamen-sea-holds-light", "Sea Holds Light", "Minimal Zine Edition"]
  ],
  xian: [
    ["/assets/be-a-viewer/xian/city-wall-skyline.jpeg", "xian-wall-as-horizon", "Wall as Horizon", "Photo Abstract Editorial"],
    ["/assets/be-a-viewer/xian/bell-tower-blue-hour.jpeg", "xian-bell-after-blue", "Bell After Blue", "Minimal Zine Edition"],
    ["/assets/be-a-viewer/xian/terracotta-formation.jpeg", "xian-earth-keeps-ranks", "Earth Keeps Ranks", "Photo Abstract Editorial"],
    ["/assets/be-a-viewer/xian/red-eaves.jpeg", "xian-painted-sky", "Painted Sky", "Minimal Zine Edition"]
  ],
  beijing: [
    ["/assets/be-a-viewer/beijing/tiananmen-courtyard.webp", "beijing-measured-courtyard", "Measured Courtyard", "Photo Abstract Editorial"],
    ["/assets/be-a-viewer/beijing/hutong-door.webp", "beijing-doorway-at-noon", "Doorway at Noon", "Minimal Zine Edition"],
    ["/assets/be-a-viewer/beijing/street-motion.webp", "beijing-ordinary-velocity", "Ordinary Velocity", "Minimal Zine Edition"],
    ["/assets/be-a-viewer/beijing/galaxy-soho.webp", "beijing-rings-of-light", "Rings of Light", "Photo Abstract Editorial"],
    ["/assets/be-a-viewer/beijing/palace-sunset.webp", "beijing-roofs-hold-evening", "Roofs Hold Evening", "Photo Abstract Editorial"],
    ["/assets/be-a-viewer/beijing/imperial-eaves.webp", "beijing-order-under-sky", "Order Under Sky", "Photo Abstract Editorial"],
    ["/assets/be-a-viewer/beijing/modern-curve.webp", "beijing-the-city-bends", "The City Bends", "Photo Abstract Editorial"],
    ["/assets/be-a-viewer/beijing/modern-skyline.webp", "beijing-storm-over-glass", "Storm Over Glass", "Photo Abstract Editorial"],
    ["/assets/be-a-viewer/beijing/great-wall.webp", "beijing-ridge-after-ridge", "Ridge After Ridge", "Photo Abstract Editorial"],
    ["/assets/be-a-viewer/beijing/rain-curb.webp", "beijing-rain-keeps-the-street", "Rain Keeps the Street", "Photo Abstract Editorial"],
    ["/assets/be-a-viewer/beijing/hutong-storefront.webp", "beijing-the-shop-stays-open", "The Shop Stays Open", "Minimal Zine Edition"],
    ["/assets/be-a-viewer/beijing/street-conversation.webp", "beijing-between-two-chairs", "Between Two Chairs", "Minimal Zine Edition"],
    ["/assets/be-a-viewer/beijing/candied-hawthorn.webp", "beijing-winter-in-sugar", "Winter in Sugar", "Minimal Zine Edition"],
    ["/assets/be-a-viewer/beijing/duck-window.webp", "beijing-behind-the-glass", "Behind the Glass", "Minimal Zine Edition"],
    ["/assets/be-a-viewer/beijing/winter-street.webp", "beijing-winter-holds-red", "Winter Holds Red", "Minimal Zine Edition"],
    ["/assets/be-a-viewer/beijing/beijing-hero-poster.jpg", "beijing-the-square-after-dark", "The Square After Dark", "Minimal Zine Edition"]
  ],
  shanghai: [
    ["/assets/be-a-viewer/shanghai/shanghai-fog.webp", "shanghai-river-in-fog", "River in Fog", "Photo Abstract Editorial"],
    ["/assets/be-a-viewer/shanghai/blue-hour-street.webp", "shanghai-blue-hour-crossing", "Blue Hour Crossing", "Photo Abstract Editorial"],
    ["/assets/be-a-viewer/shanghai/peace-hotel.webp", "shanghai-door-stays-gold", "The Door Stays Gold", "Minimal Zine Edition"],
    ["/assets/be-a-viewer/shanghai/qipao-light.webp", "shanghai-city-worn-close", "The City, Worn Close", "Photo Abstract Editorial"]
  ]
};

const titleOverrides = {
  "adrian2019-xiamen-4622472_1920-desktop": "Coast at 16:42",
  "fatdada-xiamen-1585095_1920-desktop": "Last Light Offshore",
  "pexels-158520687-10753852-desktop": "Ferry / West",
  "pexels-158520687-14520168-desktop": "Bay After Gold",
  "pexels-aqin-19334569-desktop": "Skyline Under Cloud",
  "pexels-chunry-5392389-desktop": "Open Water",
  "pexels-norriexf-20453481-9359225-desktop": "Wall / Old Sign",
  "pexels-peter-xie-371876898-35157085-desktop": "Gulangyu Directions",
  "pexels-thomas-lin-2951901-15360513-desktop": "Pier at Dusk",
  "pexels-toter-yau-5305300-17737729-desktop": "City Inside Bay",
  "pexels-toter-yau-5305300-17737860-desktop": "Bridge to the Coast",
  "pexels-toter-yau-5305300-17985042-desktop": "Street Under Heat",
  "pexels-toter-yau-5305300-37714844-desktop": "Blue City / Red Lights",
  "pexels-zhicheng-zhang-312594413-20200335-desktop": "Island Looking Back",
  "pexels-zhicheng-zhang-312594413-20361316-desktop": "Between Two Signs",
  "pexels-zhicheng-zhang-312594413-21134732-desktop": "Xiamen / Wall",
  "poly-theatre-01": "Theatre / Curve I",
  "poly-theatre-02": "Theatre / Curve II",
  "qin-chariot-horses": "Bronze Procession",
  "qin-cloud-pattern-tile": "Cloud Pattern",
  "shaanxi-buddhist-shrine": "Shrine in Shadow",
  "shaanxi-painted-procession": "Painted Procession",
  "shaanxi-standing-buddha": "Standing Figure",
  "xian-arrival-threshold": "Arrival Threshold"
};

function slug(value) {
  return value.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function humanTitle(source) {
  const key = basename(source, extname(source));
  if (titleOverrides[key]) return titleOverrides[key];
  return key.replace(/-desktop$/, "").replace(/-\d+$/, (number) => ` ${number.slice(1)}`).split("-").map((word) => word ? word[0].toUpperCase() + word.slice(1) : word).join(" ");
}

function sourceImages(city) {
  const html = readFileSync(join(projectRoot, "be-a-viewer", city, "index.html"), "utf8");
  const matches = [...html.matchAll(/\/assets\/be-a-viewer\/[^"' )]+/g)].map((match) => match[0]);
  const sources = matches.filter((path) => /\.(?:jpe?g|png|webp|avif)$/i.test(path))
    .filter((path) => !/-mobile(?:\.|-poster)|hero-(?:city|stone|water).*poster|shanghai-hero.*poster|jingan-temple.*poster/i.test(path));
  if (city === "xian") sources.push("/assets/be-a-viewer/xian/terracotta-formation.jpeg");
  if (city === "beijing") sources.push("/assets/be-a-viewer/beijing/beijing-hero-poster.jpg");
  return [...new Set(sources)];
}

function dimensions(source) {
  const value = execFileSync("identify", ["-format", "%w %h", join(projectRoot, source.slice(1))], { encoding: "utf8" }).trim();
  const [width, height] = value.split(/\s+/).map(Number);
  return { width, height };
}

function rgbToHsl(hex) {
  const value = hex.slice(1);
  const [r, g, b] = [0, 2, 4].map((offset) => parseInt(value.slice(offset, offset + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;
  const delta = max - min;
  const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));
  return { saturation, lightness };
}

function photoAccent(source, fallback) {
  const histogram = execFileSync("convert", [join(projectRoot, source.slice(1)), "-auto-orient", "-resize", "80x80!", "-colors", "10", "-format", "%c", "histogram:info:-"], { encoding: "utf8", maxBuffer: 1024 * 1024 });
  const candidates = [...histogram.matchAll(/\s*(\d+):[^#]*(#[0-9A-Fa-f]{6})/g)].map((match) => ({ count: Number(match[1]), hex: match[2] }));
  candidates.sort((a, b) => {
    const ah = rgbToHsl(a.hex);
    const bh = rgbToHsl(b.hex);
    return (bh.saturation * 1.8 + bh.count / 6400) - (ah.saturation * 1.8 + ah.count / 6400);
  });
  const chosen = candidates.find((item) => {
    const hsl = rgbToHsl(item.hex);
    return hsl.saturation > 0.22 && hsl.lightness > 0.2 && hsl.lightness < 0.72;
  });
  return chosen?.hex || fallback;
}

function wrapTitle(title, limit) {
  const words = title.toUpperCase().split(/\s+/);
  const lines = [];
  let line = "";
  words.forEach((word) => {
    const next = line ? `${line} ${word}` : word;
    if (next.length > limit && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  });
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

function runConvert(args) {
  execFileSync("convert", args, { stdio: "inherit" });
}

function drawLandscape(card, sourcePath, outputPath, tempPhoto, index) {
  const photoHeight = card.technique === "Minimal Zine Edition" ? 1220 : 1140;
  runConvert([sourcePath, "-auto-orient", "-resize", `1200x${photoHeight}^`, "-gravity", "center", "-extent", `1200x${photoHeight}`, tempPhoto]);
  const lines = wrapTitle(card.title, 15);
  const titleSize = lines.length > 2 ? 70 : lines.length > 1 ? 82 : 94;
  const titleY = photoHeight + 150;
  const args = [
    "-size", "1200x1800", `xc:${paper}`,
    tempPhoto, "-geometry", "+0+0", "-composite",
    "-fill", card.color, "-draw", `rectangle 0,${photoHeight} 1200,${photoHeight + 18}`,
    "-fill", ink, "-font", sans, "-pointsize", "34", "-gravity", "NorthWest", "-annotate", `+62+${photoHeight + 54}`, card.cityDisplay,
    "-fill", muted, "-font", sans, "-pointsize", "20", "-annotate", `+850+${photoHeight + 64}`, `${String(index + 1).padStart(2, "0")} / CITY ARCHIVE`,
    "-fill", ink, "-font", card.technique === "Minimal Zine Edition" ? sans : serif, "-pointsize", String(titleSize)
  ];
  lines.forEach((line, lineIndex) => args.push("-annotate", `+62+${titleY + lineIndex * (titleSize + 4)}`, line));
  args.push(
    "-fill", muted, "-font", sans, "-pointsize", "19", "-annotate", "+62+1690", card.coordinates,
    "-fill", ink, "-font", sans, "-pointsize", "17", "-annotate", "+62+1735", "BE A VIEWER / GALOK.ME",
    "-fill", card.color, "-draw", card.technique === "Photo Abstract Editorial"
      ? `rectangle 900,${photoHeight + 370} 1125,${photoHeight + 415} rectangle 970,${photoHeight + 450} 1125,${photoHeight + 475} rectangle 1040,${photoHeight + 510} 1125,${photoHeight + 525}`
      : `rectangle 1080,${photoHeight + 88} 1135,${photoHeight + 143}`,
    "-quality", "84", "-define", "webp:method=6", outputPath
  );
  runConvert(args);
}

function drawPortrait(card, sourcePath, outputPath, tempPhoto, index) {
  const photoWidth = 780;
  runConvert([sourcePath, "-auto-orient", "-resize", `${photoWidth}x1800^`, "-gravity", "center", "-extent", `${photoWidth}x1800`, tempPhoto]);
  const lines = wrapTitle(card.title, 10);
  const titleSize = lines.length > 2 ? 56 : 64;
  const args = [
    "-size", "1200x1800", `xc:${paper}`,
    tempPhoto, "-geometry", "+0+0", "-composite",
    "-fill", card.color, "-draw", "rectangle 780,0 798,1800",
    "-fill", ink, "-font", sans, "-pointsize", "30", "-gravity", "NorthWest", "-annotate", "+840+86", card.cityDisplay,
    "-fill", muted, "-font", sans, "-pointsize", "18", "-annotate", "+840+138", `${String(index + 1).padStart(2, "0")} / ARCHIVE`,
    "-fill", ink, "-font", card.technique === "Minimal Zine Edition" ? sans : serif, "-pointsize", String(titleSize)
  ];
  lines.forEach((line, lineIndex) => args.push("-annotate", `+840+${330 + lineIndex * (titleSize + 4)}`, line));
  args.push(
    "-fill", card.color, "-draw", card.technique === "Photo Abstract Editorial"
      ? "rectangle 840,760 1120,804 rectangle 930,838 1120,863 rectangle 1020,900 1120,915"
      : "rectangle 1060,760 1120,820",
    "-fill", muted, "-font", sans, "-pointsize", "17", "-annotate", "+840+1510", card.coordinates.replace(" / ", "\n"),
    "-fill", ink, "-font", sans, "-pointsize", "17", "-annotate", "+840+1690", "BE A VIEWER",
    "-annotate", "+840+1730", "GALOK.ME",
    "-quality", "84", "-define", "webp:method=6", outputPath
  );
  runConvert(args);
}

function buildCard(card, index) {
  const sourcePath = join(projectRoot, card.source.slice(1));
  const outputPath = join(projectRoot, card.image.slice(1));
  const thumbPath = join(projectRoot, card.thumb.slice(1));
  const tempPhoto = join("/tmp", `galok-postcard-${process.pid}-${slug(card.id)}.png`);
  mkdirSync(dirname(outputPath), { recursive: true });
  mkdirSync(dirname(thumbPath), { recursive: true });
  const { width, height } = dimensions(card.source);
  if (width / height < 0.82) drawPortrait(card, sourcePath, outputPath, tempPhoto, index);
  else drawLandscape(card, sourcePath, outputPath, tempPhoto, index);
  runConvert([outputPath, "-resize", "420x630", "-quality", "76", "-define", "webp:method=6", thumbPath]);
  rmSync(tempPhoto, { force: true });
}

const cards = [];
Object.keys(cities).forEach((city) => {
  const config = cities[city];
  const sources = sourceImages(city);
  const selected = new Set();
  const ordered = [];
  preferred[city].forEach(([source, id, title, technique]) => {
    if (!sources.includes(source)) sources.unshift(source);
    selected.add(source);
    ordered.push({ source, id, title, technique });
  });
  sources.filter((source) => !selected.has(source)).forEach((source, index) => {
    const title = humanTitle(source);
    ordered.push({ source, id: `${city}-${slug(title)}`, title, technique: index % 2 === 0 ? "Photo Abstract Editorial" : "Minimal Zine Edition" });
  });
  ordered.forEach((entry) => {
    const file = `${entry.id.replace(`${city}-`, "")}.webp`;
    cards.push({
      ...entry,
      city,
      cityLabel: config.label,
      cityDisplay: config.display,
      code: config.code,
      coordinates: config.coordinates,
      image: `/assets/editorial/${city}/postcard/${file}`,
      thumb: `/assets/editorial/${city}/postcard/thumb/${file}`,
      color: photoAccent(entry.source, config.fallback)
    });
  });
});

if (process.env.SKIP_IMAGES !== "1") {
  cards.forEach((card, index) => {
    process.stdout.write(`[${String(index + 1).padStart(2, "0")}/${cards.length}] ${card.id}\n`);
    buildCard(card, index);
  });
}

for (let pass = 1; pass <= 3; pass += 1) {
  const invalid = cards.filter((card) => {
    try {
      return statSync(join(projectRoot, card.image.slice(1))).size < 1024 || statSync(join(projectRoot, card.thumb.slice(1))).size < 512;
    } catch (error) {
      return true;
    }
  });
  if (!invalid.length) break;
  process.stdout.write(`Repairing ${invalid.length} incomplete exports (pass ${pass}).\n`);
  invalid.forEach((card) => buildCard(card, cards.indexOf(card)));
}

const stillInvalid = cards.filter((card) => {
  try {
    return statSync(join(projectRoot, card.image.slice(1))).size < 1024 || statSync(join(projectRoot, card.thumb.slice(1))).size < 512;
  } catch (error) {
    return true;
  }
});
if (stillInvalid.length) throw new Error(`Incomplete postcard exports: ${stillInvalid.map((card) => card.id).join(", ")}`);

const publicCards = cards.map(({ source, ...card }) => card);
writeFileSync(join(projectRoot, "postcards", "postcards-data.js"), `window.GALOK_POSTCARDS = Object.freeze(${JSON.stringify(publicCards, null, 2)});\n`);
writeFileSync(join(projectRoot, "postcards", "postcards-manifest.json"), `${JSON.stringify(cards, null, 2)}\n`);
process.stdout.write(`Built ${cards.length} postcard editions.\n`);
