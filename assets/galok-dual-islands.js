(() => {
  "use strict";

  const path = location.pathname.replace(/index\.html$/, "");
  const isCities = path === "/cities/" || path.startsWith("/be-a-viewer/");
  if (isCities) return;

  // Research 003 keeps its already-approved instance while the shared system rolls out elsewhere.
  if (document.querySelector(".s003-dual-islands")) return;
  if (document.querySelector(".galok-dual-islands")) return;

  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const menuIcon = `
    <svg class="galok-dual-islands__menu-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 7h11M8 12h11M8 17h11"/>
      <path d="M4 7h.01M4 12h.01M4 17h.01" stroke-width="2.8"/>
    </svg>`;

  const compactText = (value, fallback = "Section") => {
    const clean = String(value || fallback).replace(/\s+/g, " ").trim();
    return clean.length > 28 ? `${clean.slice(0, 27).trim()}…` : clean;
  };

  const slugify = (value, index) => {
    const base = String(value || "section")
      .toLowerCase()
      .replace(/[^a-z0-9\u3400-\u9fff]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 46);
    return `gdi-${base || "section"}-${index + 1}`;
  };

  const uniqueByTarget = (items) => {
    const seen = new Set();
    return items.filter((item) => {
      if (!item?.target || seen.has(item.target)) return false;
      seen.add(item.target);
      return true;
    });
  };

  const fromAnchors = (selector) => uniqueByTarget([...document.querySelectorAll(selector)].map((link) => {
    const href = link.getAttribute("href") || "";
    if (!href.startsWith("#") || href.length < 2) return null;
    const target = href.slice(1);
    return {
      target,
      label: compactText(link.textContent),
      fullLabel: String(link.textContent || "").replace(/\s+/g, " ").trim()
    };
  }).filter(Boolean));

  const fromHeadings = () => {
    const scope = document.querySelector("main article, .article-content, .research-manuscript, main") || document.body;
    const headings = [...scope.querySelectorAll("h2, h3")]
      .filter((heading) => !heading.closest("footer, nav, [data-reader-contact], [data-galok-support-panel]"))
      .filter((heading) => heading.textContent.trim())
      .slice(0, 18);
    return headings.map((heading, index) => {
      if (!heading.id) heading.id = slugify(heading.textContent, index);
      return { target: heading.id, label: compactText(heading.textContent), fullLabel: heading.textContent.trim() };
    });
  };

  const homeSections = () => {
    const labels = { research: "Research", "press-print": "Press Print", cities: "Cities", essays: "Essays", reading: "Reading", radar: "Radar" };
    return [...document.querySelectorAll("[data-home-section]")].map((section, index) => {
      const name = section.dataset.homeSection || `section-${index + 1}`;
      if (!section.id) section.id = `home-${name}`;
      return { target: section.id, label: labels[name] || compactText(name), fullLabel: labels[name] || name };
    });
  };

  const collectLocalItems = () => {
    if (path === "/" || path === "/index.html") {
      const items = homeSections();
      if (items.length) return items;
    }

    const tocSelectors = [
      ".research-paper-toc [data-toc-link]",
      ".research-mobile-toc [data-toc-link]",
      ".research-wave-toc a[href^='#']",
      ".gwn a[href^='#']",
      "[data-gwn] a[href^='#']",
      ".batch-chapter-nav a[href^='#']",
      ".data-article-nav a[href^='#']"
    ];
    for (const selector of tocSelectors) {
      const items = fromAnchors(selector);
      if (items.length >= 2) return items;
    }

    const headingItems = fromHeadings();
    if (headingItems.length) return headingItems;

    const main = document.querySelector("main") || document.body;
    if (!main.id) main.id = "gdi-page-top";
    const title = document.querySelector("h1")?.textContent || document.title.split("—")[0] || "Page";
    return [{ target: main.id, label: compactText(title, "Top"), fullLabel: String(title).trim() }];
  };

  const siteLinks = [
    ["Cities", "/cities/"],
    ["Research", "/research/"],
    ["Essays", "/essays/"],
    ["Reading", "/reading/"],
    ["Radar", "/radar/"]
  ];

  const root = document.createElement("nav");
  root.className = "galok-dual-islands";
  root.dataset.mode = "local";
  root.setAttribute("aria-label", "Page and Galok navigation");
  root.innerHTML = `
    <div class="galok-dual-islands__island galok-dual-islands__island--local" data-gdi-island="local">
      <button class="galok-dual-islands__toggle" type="button" data-gdi-toggle="local" aria-label="Page contents" aria-pressed="true">${menuIcon}</button>
      <div class="galok-dual-islands__content"><div class="galok-dual-islands__track" data-gdi-local></div></div>
    </div>
    <div class="galok-dual-islands__island galok-dual-islands__island--site" data-gdi-island="site">
      <button class="galok-dual-islands__toggle" type="button" data-gdi-toggle="site" aria-label="Galok site navigation" aria-pressed="false">
        <img class="galok-dual-islands__logo" src="/assets/galok-symbol.svg" alt="" aria-hidden="true">
      </button>
      <div class="galok-dual-islands__content">
        <div class="galok-dual-islands__site-links" data-gdi-site-links>
          ${siteLinks.map(([label, href]) => `<a class="galok-dual-islands__site-link" href="${href}"${path.startsWith(href) ? ' aria-current="page"' : ""}>${label}</a>`).join("")}
          <a class="galok-dual-islands__site-link galok-dual-islands__more" href="/index/" aria-label="Open full Galok index">•••</a>
        </div>
      </div>
    </div>`;

  document.body.append(root);
  document.body.classList.add("galok-dual-islands-active");

  const localTrack = root.querySelector("[data-gdi-local]");
  const localToggle = root.querySelector('[data-gdi-toggle="local"]');
  const siteToggle = root.querySelector('[data-gdi-toggle="site"]');
  const localIsland = root.querySelector('[data-gdi-island="local"]');
  const siteIsland = root.querySelector('[data-gdi-island="site"]');

  let localItems = [];
  let localLinks = [];
  let activeId = "";
  let raf = 0;

  const renderLocalItems = () => {
    localItems = collectLocalItems();
    localTrack.innerHTML = "";
    localItems.forEach((item) => {
      const link = document.createElement("a");
      link.className = "galok-dual-islands__local-link";
      link.href = `#${item.target}`;
      link.dataset.target = item.target;
      link.textContent = item.label;
      link.title = item.fullLabel;
      link.addEventListener("click", (event) => {
        const target = document.getElementById(item.target);
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth", block: "start" });
        history.replaceState(null, "", `#${item.target}`);
      });
      localTrack.append(link);
    });
    if (localItems.length > 4) {
      const more = document.createElement("button");
      more.type = "button";
      more.className = "galok-dual-islands__more";
      more.textContent = "•••";
      more.setAttribute("aria-label", "Show later sections");
      more.addEventListener("click", () => localTrack.scrollBy({ left: Math.max(180, localTrack.clientWidth * .72), behavior: reducedMotion.matches ? "auto" : "smooth" }));
      localTrack.append(more);
    }
    localLinks = [...localTrack.querySelectorAll(".galok-dual-islands__local-link")];
    updateCurrent(true);
  };

  const setMode = (mode, focus = false) => {
    if (mode !== "local" && mode !== "site") return;
    root.dataset.mode = mode;
    localToggle.setAttribute("aria-pressed", String(mode === "local"));
    siteToggle.setAttribute("aria-pressed", String(mode === "site"));
    localIsland.setAttribute("aria-expanded", String(mode === "local"));
    siteIsland.setAttribute("aria-expanded", String(mode === "site"));
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

  function updateCurrent(instant = false) {
    raf = 0;
    if (!localItems.length) return;
    const resolved = localItems
      .map((item, index) => ({ ...item, index, element: document.getElementById(item.target) }))
      .filter((item) => item.element);
    if (!resolved.length) return;

    const marker = Math.min(220, innerHeight * .28);
    let current = resolved[0];
    for (const item of resolved) {
      if (item.element.getBoundingClientRect().top <= marker) current = item;
      else break;
    }
    if (!current || activeId === current.target) return;
    activeId = current.target;
    localLinks.forEach((link) => link.classList.toggle("is-current", link.dataset.target === activeId));
    const activeLink = localLinks.find((link) => link.dataset.target === activeId);
    if (activeLink && root.dataset.mode === "local") {
      activeLink.scrollIntoView({ behavior: instant || reducedMotion.matches ? "auto" : "smooth", block: "nearest", inline: "center" });
    }
  }

  const scheduleCurrent = () => {
    if (!raf) raf = requestAnimationFrame(() => updateCurrent(false));
  };

  addEventListener("scroll", scheduleCurrent, { passive: true });
  addEventListener("resize", scheduleCurrent, { passive: true });

  const main = document.querySelector("main");
  if (main) {
    let refreshTimer = 0;
    new MutationObserver(() => {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => {
        const next = collectLocalItems();
        const signature = next.map((item) => `${item.target}:${item.label}`).join("|");
        const currentSignature = localItems.map((item) => `${item.target}:${item.label}`).join("|");
        if (signature !== currentSignature) renderLocalItems();
      }, 140);
    }).observe(main, { childList: true, subtree: true });
  }

  renderLocalItems();
  setMode("local");
})();
