(() => {
  "use strict";

  const route = window.location.pathname.replace(/index\.html$/, "");
  const brandMarkBlack = "/assets/galok-symbol.svg?v=20260907-brand";
  const brandMarkWhite = "/assets/galok-symbol-white.svg?v=20260907-brand";
  const darkScheme = window.matchMedia("(prefers-color-scheme: dark)");

  const navNeedsInverseMark = (nav) => {
    if (!nav) return false;
    const cityChrome = [...nav.classList].some((name) => name.endsWith("-site-nav"));
    if (!cityChrome) return false;
    if (document.body.classList.contains("nav-open")) return false;
    return !nav.classList.contains("is-scrolled");
  };

  const syncBrandMarks = () => {
    document.querySelectorAll(".brand-mark").forEach((mark) => {
      const nav = mark.closest(".site-nav");
      const next = navNeedsInverseMark(nav) ? brandMarkWhite : brandMarkBlack;
      if (mark.getAttribute("src") !== next) mark.setAttribute("src", next);
    });
  };

  const syncBrandFavicon = () => {
    document.querySelectorAll('link[rel="icon"][href*="galok-symbol"]').forEach((icon) => {
      const next = darkScheme.matches ? brandMarkWhite : brandMarkBlack;
      if (icon.getAttribute("href") !== next) icon.setAttribute("href", next);
    });
  };

  syncBrandMarks();
  syncBrandFavicon();
  document.querySelectorAll(".site-nav").forEach((nav) => {
    new MutationObserver(syncBrandMarks).observe(nav, { attributes: true, attributeFilter: ["class"] });
  });
  new MutationObserver(syncBrandMarks).observe(document.body, { attributes: true, attributeFilter: ["class"] });
  darkScheme.addEventListener?.("change", syncBrandFavicon);
  window.addEventListener("DOMContentLoaded", syncBrandMarks, { once: true });
  window.addEventListener("load", syncBrandMarks, { once: true });

  const eventNames = new Set([
    "essay_open", "research_open", "city_open", "postcard_open",
    "archive_search", "archive_result_open", "research_toc_use",
    "city_video_play", "city_video_pause", "city_atlas_node_open", "external_link_open",
    "support_open"
  ]);
  const lastEvents = new Map();
  const text = (value, limit = 120) => String(value || "").replace(/\s+/g, " ").trim().slice(0, limit);
  const slug = (value) => text(value, 80).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const pageKind = () => {
    if (route.startsWith("/essays/") && route !== "/essays/") return "essay";
    if (route.startsWith("/research/") && route !== "/research/") return "research";
    if (route.startsWith("/reading/") && route !== "/reading/") return "reading";
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
    if (toc && kind === "research") window.galokTrack("research_toc_use", { paper: slug(pageName()), section: toc.dataset.tocLink || toc.getAttribute("href")?.slice(1) });
    const postcard = target.closest("[data-postcard-select], [data-postcard-next], [data-postcard-previous]");
    if (postcard) window.galokTrack("postcard_open", { city: text(document.querySelector("[data-postcard-city]")?.textContent, 48), title: text(document.querySelector("[data-postcard-title]")?.textContent, 96) });
    const support = target.closest("[data-galok-support]");
    if (support) window.galokTrack("support_open", { surface: support.dataset.galokSupport || "unknown", page_kind: kind, route });
    const link = target.closest("a[href]");
    if (!link) return;
    let destination;
    try { destination = new URL(link.href, window.location.href); } catch { return; }
    if (destination.origin !== window.location.origin && /^https?:$/.test(destination.protocol)) window.galokTrack("external_link_open", { destination_domain: destination.hostname, label: text(link.textContent || link.getAttribute("aria-label"), 96) });
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

  const isCitiesDesign = route === "/cities/" || route.startsWith("/be-a-viewer/");
  const pureLongform = kind === "essay" || kind === "research";

  if (!isCitiesDesign) {
    document.body.classList.add("galok-modern-site");
    document.body.dataset.galokSection = route.split("/").filter(Boolean)[0] || "home";
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.setAttribute("content", "#f5f6f7");
  }

  if (pureLongform) {
    document.body.classList.add("galok-pure-longform");
    appendStylesheet("/assets/editorial-modern-20260913.css?v=20260913a");
  }

  const normalizeLensData = () => {
    const content = window.GALOK_CONTENT;
    if (!content) return;
    if (content.series?.macro) { content.series.macro.glyph = "视"; content.series.macro.color = "#ff4057"; }
    if (content.series?.frame) content.series.frame.color = "#2f63ff";
    if (content.series?.scene) content.series.scene.color = "#b7e600";
    if (Array.isArray(content.essays)) content.essays.forEach((essay) => { if (essay.series === "macro") essay.anchor = "视"; });
  };

  const normalizeLensUI = (root = document) => {
    const selector = '[data-glyph], .glyph-draw, .notes-row-seal, .archive-index-seal, .design-lens-mark, .themes-glyph, .lens-glyph';
    const nodes = [];
    if (root instanceof Element && root.matches?.(selector)) nodes.push(root);
    root.querySelectorAll?.(selector).forEach((node) => nodes.push(node));
    nodes.forEach((node) => {
      if (node.dataset?.glyph === "視") node.dataset.glyph = "视";
      if ((node.textContent || "").trim() === "視") node.textContent = "视";
    });
    root.querySelectorAll?.('[data-notes-lens="macro"]').forEach((button) => {
      if ((button.textContent || "").includes("視")) button.textContent = button.textContent.replaceAll("視", "视");
    });
  };

  const setEssayLens = () => {
    if (kind !== "essay") return;
    document.body.classList.add("galok-editorial-essay");
    if (route === "/essays/china-in-more-than-one-number/") { document.body.classList.add("galok-lens-frame"); return; }
    const anchor = document.querySelector(".article-anchor, [data-glyph]");
    let glyph = anchor?.dataset?.glyph || (anchor?.textContent || "").trim();
    if (!glyph && Array.isArray(window.GALOK_CONTENT?.essays)) {
      const entry = window.GALOK_CONTENT.essays.find((essay) => essay.url === route);
      glyph = entry?.anchor || (entry?.series === "macro" ? "视" : entry?.series === "frame" ? "框" : entry?.series === "scene" ? "察" : "");
    }
    if (glyph === "視" || glyph === "视") document.body.classList.add("galok-lens-view");
    if (glyph === "框") document.body.classList.add("galok-lens-frame");
    if (glyph === "察") document.body.classList.add("galok-lens-observe");
  };

  if (kind === "research") {
    document.body.classList.add("galok-research-detail");
    let label = "RESEARCH / GALOK";
    if (route === "/research/who-captures-growth/") label = "RESEARCH 001 / CYAN";
    if (route === "/research/fast-metabolism-economy/") label = "RESEARCH 002 / CYAN";
    if (route === "/research/love-by-the-hour/") { label = "RESEARCH 003 / CYAN"; document.body.classList.add("galok-theme-research003"); }
    document.body.dataset.researchLabel = label;
  }

  normalizeLensData();
  normalizeLensUI();
  setEssayLens();
  const lensObserver = new MutationObserver((records) => {
    records.forEach((record) => record.addedNodes.forEach((node) => { if (node instanceof Element) normalizeLensUI(node); }));
    normalizeLensData();
  });
  if (!isCitiesDesign) lensObserver.observe(document.body, { childList: true, subtree: true });
  window.addEventListener("load", () => { normalizeLensData(); normalizeLensUI(); setEssayLens(); }, { once: true });

  if (kind === "reading" && document.querySelector(".gwn, [data-gwn], [data-reading-progress]")) {
    appendStylesheet("/galok-wave.css?v=20260912-pill");
    appendScript("/galok-wave.js?v=20260912-pill");
  }
  if (route === "/be-a-viewer/beijing/") appendStylesheet("/assets/ui-fixes-20260830.css?v=1");

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

  const supportUrl = "https://ko-fi.com/galok";
  const supportMarkup = (surface) => `<section class="galok-support" aria-labelledby="galok-support-title" data-galok-support-panel="${surface}"><div class="galok-support__inner"><p class="galok-support__eyebrow">Support / Independent work</p><div class="galok-support__copy"><h2 id="galok-support-title">Keep Galok independent.</h2><p>Research, archives, photography and long-form publishing take time. If this work was useful, you can help fund the next piece.</p><a class="galok-support__action" href="${supportUrl}" target="_blank" rel="noreferrer" data-galok-support="${surface}">Support this work <span aria-hidden="true">↗</span></a></div></div></section>`;
  const parts = route.split("/").filter(Boolean);
  const isEssayDetail = parts[0] === "essays" && parts.length >= 2;
  const isResearchDetail = parts[0] === "research" && parts.length >= 2;
  const isReadingDetail = parts[0] === "reading" && parts.length >= 3;
  const supportSurface = isEssayDetail ? "essay-end" : isResearchDetail ? "research-end" : isReadingDetail ? "reading-end" : null;
  if (supportSurface && !document.querySelector("[data-galok-support-panel]")) {
    const main = document.querySelector("main");
    if (main) { main.insertAdjacentHTML("beforeend", supportMarkup(supportSurface)); appendStylesheet("/assets/support.css?v=20260904"); }
  }
  if (route === "/about/" && !document.querySelector("[data-galok-support-panel]")) {
    const contact = document.querySelector(".about-contact");
    if (contact) { contact.insertAdjacentHTML("beforebegin", supportMarkup("about")); appendStylesheet("/assets/support.css?v=20260904"); }
  }

  const footerTargets = [document.querySelector(".footer-directory .footer-column:last-of-type"), document.querySelector("footer.field-footer .footer-inner > div:nth-child(2)"), document.querySelector(".about-footer > div")].filter(Boolean);
  footerTargets.forEach((target) => { if (!target.querySelector(`a[href="${supportUrl}"]`)) target.insertAdjacentHTML("beforeend", `<a href="${supportUrl}" target="_blank" rel="noreferrer" data-galok-support="footer">Support</a>`); });
  if (footerTargets.length) appendStylesheet("/assets/support.css?v=20260904");

  if (route === "/cities/" && !document.querySelector("[data-city-atlas]")) {
    const selector = document.querySelector("[data-city-selector]");
    if (selector) {
      selector.insertAdjacentHTML("afterend", `<section class="city-atlas" id="city-atlas" aria-labelledby="city-atlas-title" data-city-atlas><header class="city-atlas-head"><p class="city-atlas-eyebrow">02 / CITY ATLAS</p><div><h2 id="city-atlas-title">READ THE CITY<br>IN POINTS.</h2><p class="city-atlas-deck">Seven open city stories, placed as an editorial index. Each red point leads back to a chapter, image or moving frame in Galok.</p></div></header><div class="city-atlas-shell"><aside class="city-atlas-sidebar" aria-label="City Atlas controls"><nav class="city-atlas-nav" data-city-atlas-nav aria-label="Choose an Atlas city"></nav><div class="city-atlas-card" aria-live="polite"><small data-city-atlas-meta>01 / NORTH CHINA</small><strong data-city-atlas-title>BEIJING</strong><p data-city-atlas-text>Loading city record.</p><a href="/be-a-viewer/beijing/" data-city-atlas-link>Open city story ↗</a></div></aside><div class="city-atlas-map" data-city-atlas-map role="region" aria-label="Interactive Galok City Atlas"><span class="city-atlas-status" data-city-atlas-status>ATLAS STANDBY</span></div></div></section>`);
      appendStylesheet("/be-a-viewer/city-atlas.css?v=20260830-livefix");
      appendScript("/be-a-viewer/city-atlas.js?v=20260830-livefix");
    }
  }

  if (!isCitiesDesign) appendStylesheet("/assets/galok-modern-system.css?v=20260913a");
})();
