(() => {
  "use strict";

  const route = window.location.pathname.replace(/index\.html$/, "");
  const eventNames = new Set([
    "essay_open", "research_open", "city_open", "postcard_open",
    "archive_search", "archive_result_open", "research_toc_use",
    "city_video_play", "city_video_pause", "city_atlas_node_open", "external_link_open"
  ]);
  const lastEvents = new Map();

  const text = (value, limit = 120) => String(value || "").replace(/\s+/g, " ").trim().slice(0, limit);
  const slug = (value) => text(value, 80).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const pageKind = () => {
    if (route.startsWith("/essays/") && route !== "/essays/") return "essay";
    if (route.startsWith("/research/") && route !== "/research/") return "research";
    if (route.startsWith("/be-a-viewer/")) return "city";
    if (route.startsWith("/postcards/")) return "postcard";
    return "site";
  };
  const pageName = () => document.querySelector("h1")?.textContent || document.title;
  const onceKey = (name, params) => `${name}:${JSON.stringify(params)}`;

  window.galokTrack = (name, params = {}) => {
    if (!eventNames.has(name)) return;
    const payload = Object.fromEntries(Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null && value !== "")
      .map(([key, value]) => [key, typeof value === "string" ? text(value) : value]));
    const key = onceKey(name, payload);
    const now = Date.now();
    if (now - (lastEvents.get(key) || 0) < 750) return;
    lastEvents.set(key, now);
    if (typeof window.gtag === "function") window.gtag("event", name, payload);
    window.dispatchEvent(new CustomEvent("galok:track", { detail: { name, params: payload } }));
  };

  const kind = pageKind();
  if (kind === "essay") window.galokTrack("essay_open", { essay: slug(pageName()) });
  if (kind === "research") window.galokTrack("research_open", { paper: slug(pageName()) });
  if (kind === "city") window.galokTrack("city_open", { city: route.split("/").filter(Boolean).at(-1) });

  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const toc = target.closest("[data-toc-link]");
    if (toc && kind === "research") {
      window.galokTrack("research_toc_use", { paper: slug(pageName()), section: toc.dataset.tocLink || toc.getAttribute("href")?.slice(1) });
    }

    const postcard = target.closest("[data-postcard-select], [data-postcard-next], [data-postcard-previous]");
    if (postcard) {
      window.galokTrack("postcard_open", {
        city: text(document.querySelector("[data-postcard-city]")?.textContent, 48),
        title: text(document.querySelector("[data-postcard-title]")?.textContent, 96)
      });
    }

    const link = target.closest("a[href]");
    if (!link) return;
    let destination;
    try { destination = new URL(link.href, window.location.href); } catch { return; }
    if (destination.origin !== window.location.origin && /^https?:$/.test(destination.protocol)) {
      window.galokTrack("external_link_open", {
        destination_domain: destination.hostname,
        label: text(link.textContent || link.getAttribute("aria-label"), 96)
      });
    }
  }, { capture: true });

  if (kind === "city") {
    document.querySelectorAll("video").forEach((video, index) => {
      const media = video.dataset.galokMedia || video.dataset.src || video.currentSrc || `video-${index + 1}`;
      video.addEventListener("play", () => window.galokTrack("city_video_play", { city: route.split("/").filter(Boolean).at(-1), media: text(media, 96) }));
      video.addEventListener("pause", () => window.galokTrack("city_video_pause", { city: route.split("/").filter(Boolean).at(-1), media: text(media, 96) }));
    });
  }

  const appendStylesheet = (href) => {
    if (document.querySelector(`link[href^="${href}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.append(link);
  };
  const appendScript = (src) => {
    if (document.querySelector(`script[src^="${src}"]`)) return;
    const script = document.createElement("script");
    script.src = src;
    script.defer = true;
    document.head.append(script);
  };
  const readerMarkup = (id, label, title, copy, context) => `<section class="reader-contact" aria-labelledby="${id}" data-reader-contact data-reader-contact-context="${context}"><header class="reader-contact-head"><p>${label}</p><div><h2 id="${id}">${title}</h2><p>${copy}</p></div></header><div class="reader-contact-body" data-reader-contact-body><p class="reader-contact-note">Reader desk loading.</p></div></section>`;
  const readerDesk = {
    "/about/": ["reader-contact-about-title", "Reader desk / 01", "Corrections.<br>Sources. <em>Notes.</em>", "Found an error, a source, a contradiction or a collaboration lead? Send it to Galok’s reader desk.", "About page"],
    "/data/": ["reader-contact-data-title", "Reader desk / Data", "Put a number<br>on the <em>record.</em>", "Send a correction, a direct source or a methodological objection with the relevant page URL.", "Data page"],
    "/research/who-captures-growth/": ["reader-contact-r001-title", "Reader desk / Research 001", "Found a source,<br>error or <em>contradiction?</em>", "Send it with the relevant section or figure. Evidence can change a paper; it should have a way in.", "Research 001: Who Captures Growth"],
    "/research/fast-metabolism-economy/": ["reader-contact-r002-title", "Reader desk / Research 002", "Found a source,<br>error or <em>contradiction?</em>", "Store counts and local evidence change quickly. Send a correction or source with the page it concerns.", "Research 002: The Fast Metabolism Economy"]
  };
  if (readerDesk[route]) {
    const target = document.querySelector("main article") || document.querySelector("main");
    if (target && !document.querySelector("[data-reader-contact]")) {
      target.insertAdjacentHTML("beforeend", readerMarkup(...readerDesk[route]));
      appendStylesheet("/assets/reader-contact.css?v=upgrade05-20260825");
      appendScript("/assets/reader-contact.js?v=upgrade05-20260825");
    }
  }
  if (route === "/cities/" && !document.querySelector("[data-city-atlas]")) {
    const selector = document.querySelector("[data-city-selector]");
    if (selector) {
      selector.insertAdjacentHTML("afterend", `<section class="city-atlas" id="city-atlas" aria-labelledby="city-atlas-title" data-city-atlas><header class="city-atlas-head"><p class="city-atlas-eyebrow">02 / CITY ATLAS</p><div><h2 class="city-atlas-title" id="city-atlas-title">READ THE CITY<br>IN POINTS.</h2><p class="city-atlas-deck">Five open city stories, placed as an editorial index. Each red point leads back to a chapter, image or moving frame in Galok.</p></div></header><div class="city-atlas-shell"><aside class="city-atlas-sidebar" aria-label="City Atlas controls"><div class="city-atlas-nav" data-city-atlas-nav aria-label="Choose an Atlas city"></div><div class="city-atlas-card" aria-live="polite"><small data-city-atlas-meta>01 / NORTH CHINA</small><strong data-city-atlas-title>BEIJING</strong><p data-city-atlas-text>Loading city record.</p><a href="/be-a-viewer/beijing/" data-city-atlas-link>Open city story ↗</a></div></aside><div class="city-atlas-map" data-city-atlas-map aria-label="Interactive Galok City Atlas"><span class="city-atlas-status" data-city-atlas-status>ATLAS STANDBY</span></div></div></section>`);
      appendStylesheet("/be-a-viewer/city-atlas.css?v=upgrade05-20260825");
      appendScript("/be-a-viewer/city-atlas.js?v=upgrade05-20260825");
    }
  }
})();
