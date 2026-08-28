import { existsSync, readFileSync, statSync } from "node:fs";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");
const failures = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};

const hub = read("cities/index.html");
const hubVideos = [...hub.matchAll(/<video\b[^>]*data-viewer-video[^>]*>/g)].map((match) => match[0]);
check(hubVideos.length === 7, `expected 7 hub videos, found ${hubVideos.length}`);
hubVideos.forEach((tag, index) => {
  check(/\bpreload="none"/.test(tag), `hub video ${index + 1} is not poster-first`);
  check(/\bdata-src="/.test(tag), `hub video ${index + 1} has no lazy desktop source`);
  check(/\bdata-mobile-src="/.test(tag), `hub video ${index + 1} has no lazy mobile source`);
  check(!/(?:^|\s)src="/.test(tag), `hub video ${index + 1} assigns a source before activation`);
});
check(!/<source\b[^>]*src=/.test(hub.slice(hub.indexOf("data-viewer-hero-stage"), hub.indexOf("viewer-hero-shade"))), "hub stage contains eager source elements");
check(/beijing-poster(?:--[a-f0-9]+)?\.webp" as="image" fetchpriority="high"/.test(hub), "hub poster is not high priority");
check(!/data-city="DALI"|data-city-choice="dali"|data-city-visual="dali"|ERHAI, YUNNAN/.test(hub), "Dali / Erhai remains in the Cities hub");
check(!/data-city="TIBET"|data-city-choice="tibet"|data-city-visual="tibet"|TIBETAN PLATEAU/.test(hub), "Tibet remains in the Cities hub");

const mobileVideos = ["beijing", "shanghai", "xian", "shenzhen", "xiamen", "hangzhou"];
mobileVideos.forEach((name) => {
  const path = new URL(`assets/be-a-viewer/video/mobile/${name}.mp4`, root);
  check(existsSync(path), `missing hub mobile video: ${name}`);
  if (existsSync(path)) check(statSync(path).size < 2_000_000, `hub mobile video exceeds 2 MB: ${name}`);
});

const details = ["beijing", "shanghai", "xian", "xiamen", "hangzhou"];
details.forEach((city) => {
  const html = read(`be-a-viewer/${city}/index.html`);
  check(/rel="preload"[^>]*as="image"[^>]*fetchpriority="high"/.test(html), `${city}: hero poster/image is not high priority`);
  check(!/preload="auto"/.test(html), `${city}: eager video preload remains`);
  check(!/videos\.pexels\.com/.test(html), `${city}: external hero video remains`);
  ["gsap.min.js", "DrawSVGPlugin.min.js", "ScrollTrigger.min.js", "city-mapline.js"].forEach((script) => {
    const pattern = new RegExp(`<script[^>]*\\bdefer\\b[^>]*${script.replaceAll(".", "\\.")}`);
    check(pattern.test(html), `${city}: ${script} is not deferred in dependency order`);
  });

  for (const match of html.matchAll(/<img\b[^>]*>/g)) {
    const tag = match[0];
    const src = (tag.match(/\bsrc="([^"]+)"/) || [])[1] || "";
    if (!/\.(?:jpe?g|png|webp)(?:\?|$)/i.test(src)) continue;
    check(/\bwidth="\d+"/.test(tag) && /\bheight="\d+"/.test(tag), `${city}: missing image dimensions for ${src}`);
  }
});

const viewer = read("be-a-viewer/viewer.js");
check(/function ensureSource\(/.test(viewer), "hub lazy source assignment is missing");
check(!/preloadIndex|slideIndex === preloadIndex/.test(viewer), "hub still preloads the next slide");
check(/visibilitychange/.test(viewer) && /IntersectionObserver/.test(viewer), "hub pause/resume guards are incomplete");
check(/aria-pressed.*String\(playing\)/s.test(viewer), "hub control state is not tied to actual playback");
check(/prefers-reduced-motion: reduce/.test(viewer), "hub reduced-motion handling is missing");

const cityConfig = read("be-a-viewer/cities.config.js");
check(/new Set\(\["dali", "tibet"\]\)/.test(cityConfig), "removed city records are not filtered from city config");

if (failures.length) {
  console.error(`Cities performance validation failed (${failures.length})`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Cities performance validation passed.");
