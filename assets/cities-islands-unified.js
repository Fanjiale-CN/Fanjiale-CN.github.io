(() => {
  "use strict";

  const path = location.pathname.replace(/index\.html$/, "");
  if (path !== "/cities/") return;

  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const siteLinks = [
    ["Cities", "/cities/"],
    ["Research", "/research/"],
    ["Essays", "/essays/"],
    ["Reading", "/reading/"],
    ["Radar", "/radar/"]
  ];

  const menuIcon = `
    <svg class="galok-dual-islands__menu-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 7h11M8 12h11M8 17h11"/>
      <path d="M4 7h.01M4 12h.01M4 17h.01" stroke-width="2.8"/>
    </svg>`;

  const resolveSections = () => {
    const ask = document.querySelector("[data-cities-conversation]");
    const weather = document.querySelector("galok-city-weather[data-live-city]");
    const archive = document.querySelector("#visual-archive-preview");
    if (!ask || !archive) return null;

    ask.id ||= "cities-ask";
    if (weather) weather.id ||= "live-city";
    archive.id ||= "visual-archive-preview";

    return [
      { id: ask.id, label: "01 Ask", element: ask },
      ...(weather ? [{ id: weather.id, label: "02 Conditions", element: weather }] : []),
      { id: archive.id, label: weather ? "03 Archive" : "02 Archive", element: archive }
    ];
  };

  const mount = () => {
    const sections = resolveSections();
    if (!sections) return false;
    if (document.querySelector(".galok-dual-islands--cities")) return true;

    document.querySelectorAll(".cities-dual-islands").forEach((node) => node.remove());
    document.body.classList.remove("cities-dual-islands-enhanced");

    const root = document.createElement("nav");
    root.className = "galok-dual-islands galok-dual-islands--cities";
    root.dataset.mode = "local";
    root.setAttribute("aria-label", "Cities page and Galok navigation");
    root.innerHTML = `
      <div class="galok-dual-islands__island galok-dual-islands__island--local" data-gdi-island="local">
        <button class="galok-dual-islands__toggle" type="button" data-gdi-toggle="local" aria-label="Cities page sections" aria-pressed="true">
          ${menuIcon}
        </button>
        <div class="galok-dual-islands__content">
          <div class="galok-dual-islands__track" data-gdi-local></div>
        </div>
      </div>
      <div class="galok-dual-islands__island galok-dual-islands__island--site" data-gdi-island="site">
        <button class="galok-dual-islands__toggle" type="button" data-gdi-toggle="site" aria-label="Open Galok site navigation" aria-pressed="false">
          <img class="galok-dual-islands__logo" src="/assets/galok-symbol.svg" alt="" aria-hidden="true">
        </button>
        <div class="galok-dual-islands__content">
          <div class="galok-dual-islands__site-links">
            ${siteLinks.map(([label, href]) => `<a class="galok-dual-islands__site-link" href="${href}"${href === "/cities/" ? ' aria-current="page"' : ""}>${label}</a>`).join("")}
            <a class="galok-dual-islands__site-link galok-dual-islands__more" href="/index/" aria-label="Open full Galok index">•••</a>
          </div>
        </div>
      </div>`;

    document.body.append(root);
    document.body.classList.add("galok-dual-islands-active", "cities-islands-unified");

    const track = root.querySelector("[data-gdi-local]");
    const localToggle = root.querySelector('[data-gdi-toggle="local"]');
    const siteToggle = root.querySelector('[data-gdi-toggle="site"]');
    const localIsland = root.querySelector('[data-gdi-island="local"]');
    const siteIsland = root.querySelector('[data-gdi-island="site"]');
    const links = [];

    sections.forEach((section) => {
      const link = document.createElement("a");
      link.className = "galok-dual-islands__local-link";
      link.href = `#${section.id}`;
      link.dataset.target = section.id;
      link.textContent = section.label;
      link.addEventListener("click", (event) => {
        event.preventDefault();
        section.element.scrollIntoView({
          behavior: reducedMotion.matches ? "auto" : "smooth",
          block: "start"
        });
        history.replaceState(null, "", `#${section.id}`);
      });
      track.append(link);
      links.push(link);
    });

    const setMode = (mode, focus = false) => {
      if (!new Set(["local", "site"]).has(mode)) return;
      root.dataset.mode = mode;
      localToggle.setAttribute("aria-pressed", String(mode === "local"));
      siteToggle.setAttribute("aria-pressed", String(mode === "site"));
      localIsland.setAttribute("aria-expanded", String(mode === "local"));
      siteIsland.setAttribute("aria-expanded", String(mode === "site"));
      siteToggle.setAttribute("aria-label", mode === "site" ? "Galok home" : "Open Galok site navigation");
      if (focus) (mode === "local" ? localToggle : siteToggle).focus({ preventScroll: true });
    };

    localToggle.addEventListener("click", () => {
      if (root.dataset.mode === "site") setMode("local");
    });

    siteToggle.addEventListener("click", () => {
      if (root.dataset.mode === "local") setMode("site");
      else location.href = "/";
    });

    root.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && root.dataset.mode === "site") {
        event.preventDefault();
        setMode("local", true);
      }
    });

    let activeId = "";
    let raf = 0;

    const updateCurrent = (instant = false) => {
      raf = 0;
      const marker = Math.min(220, innerHeight * .28);
      let current = sections[0];

      for (const section of sections) {
        if (section.element.getBoundingClientRect().top <= marker) current = section;
        else break;
      }

      if (!current || activeId === current.id) return;
      activeId = current.id;
      links.forEach((link) => link.classList.toggle("is-current", link.dataset.target === activeId));

      if (root.dataset.mode === "local") {
        links.find((link) => link.dataset.target === activeId)?.scrollIntoView({
          behavior: instant || reducedMotion.matches ? "auto" : "smooth",
          block: "nearest",
          inline: "center"
        });
      }
    };

    const scheduleCurrent = () => {
      if (!raf) raf = requestAnimationFrame(() => updateCurrent(false));
    };

    addEventListener("scroll", scheduleCurrent, { passive: true });
    addEventListener("resize", scheduleCurrent, { passive: true });

    if (document.querySelector("galok-city-weather[data-live-city]")) {
      const weatherObserver = new MutationObserver(scheduleCurrent);
      weatherObserver.observe(document.querySelector("galok-city-weather[data-live-city]"), {
        attributes: true,
        childList: true,
        subtree: true
      });
    }

    setMode("local");
    updateCurrent(true);
    return true;
  };

  if (mount()) return;

  const observer = new MutationObserver(() => {
    if (!mount()) return;
    observer.disconnect();
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener("load", mount, { once: true });
})();
