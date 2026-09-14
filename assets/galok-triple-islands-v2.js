(() => {
  "use strict";

  if (window.__GALOK_TRIPLE_ISLANDS_V2__) return;
  window.__GALOK_TRIPLE_ISLANDS_V2__ = true;

  const path = location.pathname.replace(/index\.html$/, "");
  const supported =
    /^\/essays\/[^/]+\/?$/.test(path) ||
    /^\/research\/[^/]+\/?$/.test(path) ||
    (path.startsWith("/reading/") && path !== "/reading/");
  if (!supported || document.querySelector(".galok-triple-islands-v2")) return;

  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const menuIcon = `
    <svg class="galok-triple-islands-v2__menu-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 7h11M8 12h11M8 17h11"/>
      <path d="M4 7h.01M4 12h.01M4 17h.01" stroke-width="2.8"/>
    </svg>`;

  const compactText = (value, fallback = "Section") => {
    const clean = String(value || fallback).replace(/\s+/g, " ").trim();
    return clean.length > 34 ? `${clean.slice(0, 33).trim()}…` : clean;
  };

  const slugify = (value, index) => {
    const base = String(value || "section")
      .toLowerCase()
      .replace(/[^a-z0-9\u3400-\u9fff]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 46);
    return `gti2-${base || "section"}-${index + 1}`;
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
    const scope = document.querySelector("main article, .article-content, .batch-article-content, .research-manuscript, .dj-prose, [data-reading-entry], main") || document.body;
    const headings = [...scope.querySelectorAll("h2, h3")]
      .filter((heading) => !heading.closest("footer, nav, [data-reader-contact], [data-galok-support-panel], .galok-context-ai"))
      .filter((heading) => heading.textContent.trim())
      .slice(0, 20);
    return headings.map((heading, index) => {
      if (!heading.id) heading.id = slugify(heading.textContent, index);
      return { target: heading.id, label: compactText(heading.textContent), fullLabel: heading.textContent.trim() };
    });
  };

  const collectLocalItems = () => {
    const tocSelectors = [
      ".research-paper-toc [data-toc-link]",
      ".research-mobile-toc [data-toc-link]",
      ".research-wave-toc a[href^='#']",
      ".gwn a[href^='#']",
      "[data-gwn] a[href^='#']",
      ".batch-chapter-nav a[href^='#']",
      ".data-article-nav a[href^='#']",
      ".dj-v3-toc a[href^='#']"
    ];
    for (const selector of tocSelectors) {
      const items = fromAnchors(selector);
      if (items.length >= 2) return items;
    }

    const headingItems = fromHeadings();
    if (headingItems.length) return headingItems;

    const main = document.querySelector("main") || document.body;
    if (!main.id) main.id = "gti2-page-top";
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
  root.className = "galok-triple-islands-v2";
  root.dataset.mode = "site";
  root.setAttribute("aria-label", "Page, Galok and AI navigation");
  root.innerHTML = `
    <div class="galok-triple-islands-v2__island galok-triple-islands-v2__island--local" data-gti2-local>
      <button class="galok-triple-islands-v2__toggle galok-triple-islands-v2__local-toggle" type="button" data-gti2-local-toggle aria-label="Show page contents" aria-expanded="false">${menuIcon}</button>
      <div class="galok-triple-islands-v2__content galok-triple-islands-v2__local-content" aria-label="On this page">
        <div class="galok-triple-islands-v2__local-track" data-gti2-local-track></div>
      </div>
    </div>
    <div class="galok-triple-islands-v2__island galok-triple-islands-v2__island--site" data-gti2-site>
      <button class="galok-triple-islands-v2__toggle galok-triple-islands-v2__site-toggle" type="button" data-gti2-site-toggle aria-label="Show Galok navigation" aria-expanded="true" title="Galok navigation">
        <span class="galok-triple-islands-v2__home-disc" aria-hidden="true"><img class="galok-triple-islands-v2__logo" src="/assets/galok-symbol.svg" alt=""></span>
      </button>
      <div class="galok-triple-islands-v2__content galok-triple-islands-v2__site-content">
        <div class="galok-triple-islands-v2__site-links">
          ${siteLinks.map(([label, href]) => `<a class="galok-triple-islands-v2__site-link" href="${href}"${path.startsWith(href) ? ' aria-current="page"' : ""}>${label}</a>`).join("")}
          <a class="galok-triple-islands-v2__site-link galok-triple-islands-v2__more" href="/index/" aria-label="Open full Galok index">•••</a>
        </div>
      </div>
    </div>
    <button class="galok-triple-islands-v2__circle galok-triple-islands-v2__ai" type="button" data-gti2-ai aria-label="Open Galok AI" aria-expanded="false" aria-controls="galok-context-ai-panel" title="Ask Galok">
      <span class="galok-triple-islands-v2__ai-word" aria-hidden="true">AI</span>
      <span class="galok-triple-islands-v2__ai-close" aria-hidden="true">×</span>
      <span class="galok-triple-islands-v2__ai-spark" aria-hidden="true">✦</span>
    </button>`;

  document.body.append(root);
  document.body.classList.add("galok-triple-islands-v2-active");

  const localIsland = root.querySelector("[data-gti2-local]");
  const siteIsland = root.querySelector("[data-gti2-site]");
  const localToggle = root.querySelector("[data-gti2-local-toggle]");
  const siteToggle = root.querySelector("[data-gti2-site-toggle]");
  const localTrack = root.querySelector("[data-gti2-local-track]");
  const aiToggle = root.querySelector("[data-gti2-ai]");

  let localItems = [];
  let localLinks = [];
  let activeId = "";
  let raf = 0;

  const setMode = (mode, focus = false) => {
    const next = mode === "local" ? "local" : "site";
    if (root.dataset.mode === next) return;
    root.dataset.mode = next;
    localToggle.setAttribute("aria-expanded", String(next === "local"));
    siteToggle.setAttribute("aria-expanded", String(next === "site"));
    localToggle.setAttribute("aria-label", next === "local" ? "Show Galok navigation" : "Show page contents");
    siteToggle.setAttribute("aria-label", next === "site" ? "Show page contents" : "Show Galok navigation");
    if (focus) (next === "local" ? localToggle : siteToggle).focus({ preventScroll: true });
    requestAnimationFrame(() => updateCurrent(true));
  };

  const toggleLocal = () => setMode(root.dataset.mode === "local" ? "site" : "local");
  const toggleSite = () => setMode(root.dataset.mode === "site" ? "local" : "site");

  const scrollToItem = (item) => {
    const target = document.getElementById(item.target);
    if (!target) return;
    target.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", `#${item.target}`);
  };

  const renderLocalItems = () => {
    localItems = collectLocalItems();
    localTrack.replaceChildren(...localItems.map((item) => {
      const link = document.createElement("a");
      link.className = "galok-triple-islands-v2__local-link";
      link.href = `#${item.target}`;
      link.dataset.target = item.target;
      link.textContent = item.label;
      link.title = item.fullLabel;
      link.addEventListener("click", (event) => {
        event.preventDefault();
        scrollToItem(item);
      });
      return link;
    }));
    localLinks = [...localTrack.querySelectorAll(".galok-triple-islands-v2__local-link")];
    updateCurrent(true);
  };

  function updateCurrent(instant = false) {
    raf = 0;
    if (!localItems.length) return;
    const resolved = localItems
      .map((item) => ({ ...item, element: document.getElementById(item.target) }))
      .filter((item) => item.element);
    if (!resolved.length) return;

    const marker = Math.min(220, innerHeight * .28);
    let current = resolved[0];
    for (const item of resolved) {
      if (item.element.getBoundingClientRect().top <= marker) current = item;
      else break;
    }
    if (!current) return;
    localToggle.title = `On this page · ${current.fullLabel || current.label}`;
    if (activeId === current.target) return;
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

  localToggle.addEventListener("click", toggleLocal);
  siteToggle.addEventListener("click", toggleSite);

  localIsland.addEventListener("click", (event) => {
    if (root.dataset.mode === "local") return;
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest("a,button")) return;
    setMode("local");
  });

  siteIsland.addEventListener("click", (event) => {
    if (root.dataset.mode === "site") return;
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest("a,button")) return;
    setMode("site");
  });

  aiToggle.addEventListener("click", () => {
    if (window.galokContextAI?.toggle) {
      window.galokContextAI.toggle();
      return;
    }
    window.__GALOK_CONTEXT_AI_PENDING_OPEN__ = !window.__GALOK_CONTEXT_AI_PENDING_OPEN__;
    window.dispatchEvent(new CustomEvent("galok:context-ai-toggle"));
  });

  window.addEventListener("galok:context-ai-state", (event) => {
    const open = Boolean(event.detail?.open);
    root.classList.toggle("is-ai-open", open);
    aiToggle.setAttribute("aria-expanded", String(open));
    aiToggle.setAttribute("aria-label", open ? "Close Galok AI" : "Open Galok AI");
    aiToggle.title = open ? "Close Galok AI" : "Ask Galok";
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (root.dataset.mode === "local") {
      setMode("site", true);
    }
  });

  addEventListener("scroll", scheduleCurrent, { passive: true });
  addEventListener("resize", scheduleCurrent, { passive: true });

  /* Safe content refresh only. This never observes body/class attributes. */
  const main = document.querySelector("main");
  if (main) {
    let refreshTimer = 0;
    new MutationObserver(() => {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => {
        const next = collectLocalItems();
        const nextSignature = next.map((item) => `${item.target}:${item.label}`).join("|");
        const currentSignature = localItems.map((item) => `${item.target}:${item.label}`).join("|");
        if (nextSignature !== currentSignature) renderLocalItems();
      }, 180);
    }).observe(main, { childList: true, subtree: true });
  }

  renderLocalItems();
  setTimeout(renderLocalItems, 650);
  addEventListener("load", () => renderLocalItems(), { once: true });
  window.dispatchEvent(new CustomEvent("galok:triple-islands-v2-ready"));
})();
