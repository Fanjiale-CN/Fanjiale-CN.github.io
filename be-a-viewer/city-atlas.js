(() => {
  const root = document.querySelector("[data-city-atlas]");
  if (!root) return;

  const mapElement = root.querySelector("[data-city-atlas-map]");
  const status = root.querySelector("[data-city-atlas-status]");
  const nav = root.querySelector("[data-city-atlas-nav]");
  const card = {
    meta: root.querySelector("[data-city-atlas-meta]"),
    title: root.querySelector("[data-city-atlas-title]"),
    text: root.querySelector("[data-city-atlas-text]"),
    link: root.querySelector("[data-city-atlas-link]")
  };
  let map;
  let records = [];
  let markers = [];
  let activeId = "beijing";

  const setStatus = (text, ready = false) => {
    if (!status) return;
    status.textContent = text;
    status.classList.toggle("is-ready", ready);
  };

  const loadStyle = () => new Promise((resolve, reject) => {
    if (document.querySelector("link[data-maplibre-style]")) return resolve();
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/maplibre-gl@5/dist/maplibre-gl.css";
    link.dataset.maplibreStyle = "true";
    link.onload = resolve;
    link.onerror = reject;
    document.head.append(link);
  });

  const loadScript = () => new Promise((resolve, reject) => {
    if (window.maplibregl) return resolve(window.maplibregl);
    const script = document.createElement("script");
    script.src = "https://unpkg.com/maplibre-gl@5/dist/maplibre-gl.js";
    script.async = true;
    script.onload = () => resolve(window.maplibregl);
    script.onerror = reject;
    document.head.append(script);
  });

  const escape = (value) => String(value).replace(/[&<>'\"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);

  function syncCard(city) {
    card.meta.textContent = `${city.number} / ${city.region}`;
    card.title.textContent = city.name;
    card.text.textContent = city.summary;
    card.link.href = city.route;
    card.link.setAttribute("aria-label", `Open ${city.name} city story`);
    nav?.querySelectorAll("button").forEach((button) => {
      const current = button.dataset.atlasCity === city.id;
      button.classList.toggle("is-active", current);
      button.setAttribute("aria-pressed", String(current));
    });
  }

  function popupHTML(point) {
    return `<p>${escape(point.kind)}</p><h3>${escape(point.name)}</h3><span>${escape(point.note)}</span><a href="${escape(point.href)}">Open chapter ↗</a>`;
  }

  function showCity(id, instant = false) {
    const city = records.find((entry) => entry.id === id);
    if (!city || !map) return;
    activeId = id;
    markers.forEach((marker) => marker.remove());
    markers = city.points.map((point) => {
      const element = document.createElement("button");
      element.className = "city-atlas-marker";
      element.type = "button";
      element.setAttribute("aria-label", `${point.name}: ${point.kind}`);
      const popup = new window.maplibregl.Popup({ offset: 15, className: "city-atlas-popup", closeButton: true })
        .setHTML(popupHTML(point));
      const marker = new window.maplibregl.Marker({ element, anchor: "center" })
        .setLngLat(point.coordinates)
        .setPopup(popup)
        .addTo(map);
      element.addEventListener("click", () => window.galokTrack?.("city_atlas_node_open", { city: city.id, node: point.name }));
      return marker;
    });
    syncCard(city);
    map.flyTo({ center: city.center, zoom: city.zoom, duration: instant || window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 700, essential: true });
  }

  function buildNav() {
    nav.innerHTML = records.map((city) => `<button type="button" data-atlas-city="${escape(city.id)}" aria-pressed="false"><span>${escape(city.number)}</span><b>${escape(city.name)}</b><span>${escape(city.region)}</span></button>`).join("");
    nav.addEventListener("click", (event) => {
      const button = event.target.closest("[data-atlas-city]");
      if (button) showCity(button.dataset.atlasCity);
    });
  }

  async function initialize() {
    try {
      setStatus("LOADING ATLAS");
      const [response, maplibregl] = await Promise.all([
        fetch("/data/city-atlas.json", { cache: "force-cache" }),
        Promise.all([loadStyle(), loadScript()]).then(([, library]) => library)
      ]);
      if (!response.ok) throw new Error("Atlas data unavailable");
      const payload = await response.json();
      records = Array.isArray(payload.cities) ? payload.cities : [];
      if (!records.length) throw new Error("Atlas has no records");
      map = new maplibregl.Map({
        container: mapElement,
        style: "https://tiles.openfreemap.org/styles/liberty",
        center: records[0].center,
        zoom: records[0].zoom,
        attributionControl: true,
        dragRotate: false,
        touchPitch: false,
        pitchWithRotate: false,
        scrollZoom: false
      });
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-left");
      map.on("load", () => {
        buildNav();
        showCity(activeId, true);
        setStatus("ATLAS READY", true);
      });
      map.on("error", () => setStatus("MAP CONNECTION ISSUE"));
    } catch (error) {
      setStatus("ATLAS UNAVAILABLE");
      mapElement.classList.add("is-unavailable");
      mapElement.innerHTML = '<p class="city-atlas-status is-ready">City Atlas could not load. Visit a city story from the index above.</p>';
    }
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      initialize();
    }, { rootMargin: "320px 0px" });
    observer.observe(root);
  } else {
    initialize();
  }
})();
