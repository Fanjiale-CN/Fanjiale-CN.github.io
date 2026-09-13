(() => {
  "use strict";

  const path = location.pathname.replace(/index\.html$/, "");
  const match = path.match(/^\/be-a-viewer\/([^/]+)\/?$/);
  if (!match) return;
  if (document.querySelector(".galok-dual-islands--city-detail")) return;

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

  const compact = (value, fallback = "Section") => {
    const clean = String(value || fallback).replace(/\s+/g, " ").trim();
    return clean.length > 25 ? `${clean.slice(0, 24).trim()}…` : clean;
  };

  const stripOrdinal = (value) => String(value || "")
    .replace(/^\s*\d{1,2}\s*(?:[./:·—-]\s*)?/, "")
    .replace(/\s+/g, " ")
    .trim();

  const numbered = (index, value) => `${String(index + 1).padStart(2, "0")} ${compact(stripOrdinal(value) || "Section")}`;

  const slugify = (value, index) => {
    const base = String(value || "section")
      .toLowerCase()
      .replace(/[^a-z0-9\u3400-\u9fff]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 42);
    return `city-section-${base || index + 1}`;
  };

  const semanticLabel = (element, index) => {
    const id = String(element.id || "").toLowerCase();
    const candidates = [
      [/hero|overview|opening|intro/, "Overview"],
      [/history|timeline|memory/, "History"],
      [/writer|literary|words|poem|reading/, "Words"],
      [/weather|condition|climate/, "Conditions"],
      [/archive|collection/, "Archive"],
      [/atlas|map|route/, "Atlas"],
      [/street|walk|ground/, "Street"],
      [/night/, "Night"],
      [/future|frequency|rhythm/, "Rhythm"]
    ];

    for (const [pattern, label] of candidates) {
      if (pattern.test(id)) return numbered(index, label);
    }

    const heading = element.querySelector?.("h1, h2, h3")?.textContent;
    const aria = element.getAttribute?.("aria-label");
    const raw = heading || aria || id.replace(/[-_]+/g, " ") || `Section ${index + 1}`;
    return numbered(index, raw);
  };

  const unique = (items) => {
    const seen = new Set();
    return items.filter((item) => {
      if (!item?.target || seen.has(item.target)) return false;
      seen.add(item.target);
      return true;
    });
  };

  const collectFromWave = () => {
    const anchors = [...document.querySelectorAll(".gwn a[href^='#'], [data-gwn] a[href^='#']")];
    return unique(anchors.map((link, index) => {
      const href = link.getAttribute("href") || "";
      if (!href.startsWith("#") || href.length < 2) return null;
      const target = href.slice(1);
      const element = document.getElementById(target);
      if (!element) return null;
      const title = String(link.textContent || "").replace(/\s+/g, " ").trim();
      return {
        target,
        element,
        label: numbered(index, title),
        title
      };
    }).filter(Boolean));
  };

  const collectFallback = () => {
    const main = document.querySelector("main") || document.body;
    const candidates = [...main.querySelectorAll(
      ":scope > section[id], :scope > article[id], :scope > galok-city-weather, .city-archive-section[id], .city-archive-preview[id]"
    )];

    const normalized = unique(candidates.map((element, index) => {
      if (!element.id) element.id = slugify(element.getAttribute("aria-label") || element.tagName, index);
      return {
        target: element.id,
        element,
        label: semanticLabel(element, index),
        title: element.querySelector?.("h1, h2, h3")?.textContent?.trim() || element.getAttribute?.("aria-label") || element.id
      };
    }));

    if (normalized.length) return normalized.slice(0, 14);

    if (!main.id) main.id = "city-page-top";
    return [{
      target: main.id,
      element: main,
      label: "01 Overview",
      title: document.querySelector("h1")?.textContent?.trim() || "City"
    }];
  };

  const collectSections = () => {
    const wave = collectFromWave();
    return wave.length >= 2 ? wave.slice(0, 16) : collectFallback();
  };

  const mount = () => {
    if (document.querySelector(".galok-dual-islands--city-detail")) return true;
    const sections = collectSections();
    if (!sections.length) return false;

    const root = document.createElement("nav");
    root.className = "galok-dual-islands galok-dual-islands--city-detail";
    root.dataset.mode = "local";
    root.setAttribute("aria-label", "City page and Galok navigation");
    root.innerHTML = `
      <div class="galok-dual-islands__island galok-dual-islands__island--local" data-gdi-island="local">
        <button class="galok-dual-islands__toggle" type="button" data-gdi-toggle="local" aria-label="City page sections" aria-pressed="true">
          ${menuIcon}
        </button>
        <div class="galok-dual-islands__content"><div class="galok-dual-islands__track" data-gdi-local></div></div>
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
    document.body.classList.add("galok-dual-islands-active", "city-detail-islands-unified");

    const track = root.querySelector("[data-gdi-local]");
    const localToggle = root.querySelector('[data-gdi-toggle="local"]');
    const siteToggle = root.querySelector('[data-gdi-toggle="site"]');
    const localIsland = root.querySelector('[data-gdi-island="local"]');
    const siteIsland = root.querySelector('[data-gdi-island="site"]');
    const links = [];

    sections.forEach((section) => {
      const link = document.createElement("a");
      link.className = "galok-dual-islands__local-link";
      link.href = `#${section.target}`;
      link.dataset.target = section.target;
      link.textContent = section.label;
      link.title = section.title || section.label;
      link.addEventListener("click", (event) => {
        event.preventDefault();
        section.element.scrollIntoView({
          behavior: reducedMotion.matches ? "auto" : "smooth",
          block: "start"
        });
        history.replaceState(null, "", `#${section.target}`);
      });
      track.append(link);
      links.push(link);
    });

    if (sections.length > 4) {
      const more = document.createElement("button");
      more.type = "button";
      more.className = "galok-dual-islands__more";
      more.textContent = "•••";
      more.setAttribute("aria-label", "Show later city sections");
      more.addEventListener("click", () => {
        track.scrollBy({
          left: Math.max(180, track.clientWidth * .72),
          behavior: reducedMotion.matches ? "auto" : "smooth"
        });
      });
      track.append(more);
    }

    const setMode = (mode, focus = false) => {
      if (mode !== "local" && mode !== "site") return;
      root.dataset.mode = mode;
      localToggle.setAttribute("aria-pressed", String(mode === "local"));
      siteToggle.setAttribute("aria-pressed", String(mode === "site"));
      localIsland.setAttribute("aria-expanded", String(mode === "local"));
      siteIsland.setAttribute("aria-expanded", String(mode === "site"));
      siteToggle.setAttribute("aria-label", mode === "site" ? "Galok home" : "Open Galok site navigation");
      siteToggle.title = mode === "site" ? "Galok home" : "Open Galok site navigation";
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
      const marker = Math.min(210, innerHeight * .27);
      let current = sections[0];
      for (const section of sections) {
        if (section.element.getBoundingClientRect().top <= marker) current = section;
        else break;
      }

      if (!current || current.target === activeId) return;
      activeId = current.target;
      links.forEach((link) => link.classList.toggle("is-current", link.dataset.target === activeId));

      if (root.dataset.mode === "local") {
        links.find((link) => link.dataset.target === activeId)?.scrollIntoView({
          behavior: instant || reducedMotion.matches ? "auto" : "smooth",
          block: "nearest",
          inline: "center"
        });
      }
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(() => updateCurrent(false));
    };

    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule, { passive: true });

    setMode("local");
    updateCurrent(true);
    return true;
  };

  const boot = () => {
    if (mount()) return;
    const observer = new MutationObserver(() => {
      if (!mount()) return;
      observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.addEventListener("load", mount, { once: true });
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
