(() => {
  "use strict";

  const route = window.location.pathname.replace(/index\.html$/, "");
  const eventNames = new Set([
    "essay_open", "research_open", "city_open", "postcard_open",
    "archive_search", "archive_result_open", "research_toc_use",
    "city_video_play", "city_video_pause", "external_link_open"
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
})();
