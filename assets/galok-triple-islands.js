(() => {
  "use strict";

  if (window.__GALOK_TRIPLE_ISLANDS__) return;
  window.__GALOK_TRIPLE_ISLANDS__ = true;

  const path = location.pathname.replace(/index\.html$/, "");
  const supported =
    /^\/essays\/[^/]+\/?$/.test(path) ||
    /^\/research\/[^/]+\/?$/.test(path) ||
    (path.startsWith("/reading/") && path !== "/reading/");
  if (!supported || document.querySelector(".galok-triple-islands")) return;

  const retireLegacyIslands = () => {
    document.querySelectorAll(".galok-dual-islands, .s003-dual-islands").forEach((node) => node.remove());
    document.body.classList.remove("galok-dual-islands-active");
  };
  retireLegacyIslands();
  const legacyObserver = new MutationObserver(retireLegacyIslands);
  legacyObserver.observe(document.body, { childList:true, subtree:false, attributes:true, attributeFilter:["class"] });

  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const menuIcon = `
    <svg class="galok-triple-islands__menu-icon" viewBox="0 0 24 24" aria-hidden="true">
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
    return `gti-${base || "section"}-${index + 1}`;
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
    if (!main.id) main.id = "gti-page-top";
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
  root.className = "galok-triple-islands";
  root.setAttribute("aria-label", "Page, Galok and AI navigation");
  root.innerHTML = `
    <div class="galok-triple-islands__local" data-gti-local-island>
      <button class="galok-triple-islands__circle galok-triple-islands__local-toggle" type="button" data-gti-local-toggle aria-label="Open page contents" aria-expanded="false" aria-controls="galok-triple-local-panel">${menuIcon}</button>
      <div class="galok-triple-islands__local-panel" id="galok-triple-local-panel" data-gti-local-panel aria-hidden="true">
        <div class="galok-triple-islands__local-head"><small>ON THIS PAGE</small><span data-gti-current-label>Contents</span></div>
        <div class="galok-triple-islands__local-list" data-gti-local-list></div>
      </div>
    </div>
    <div class="galok-triple-islands__site" aria-label="Galok navigation">
      <a class="galok-triple-islands__home" href="/" aria-label="Galok home" title="Galok home">
        <img class="galok-triple-islands__logo" src="/assets/galok-symbol.svg" alt="" aria-hidden="true">
      </a>
      <div class="galok-triple-islands__site-links" data-gti-site-links>
        ${siteLinks.map(([label, href]) => `<a class="galok-triple-islands__site-link" href="${href}"${path.startsWith(href) ? ' aria-current="page"' : ""}>${label}</a>`).join("")}
        <a class="galok-triple-islands__site-link galok-triple-islands__more" href="/index/" aria-label="Open full Galok index">•••</a>
      </div>
    </div>
    <button class="galok-triple-islands__circle galok-triple-islands__ai" type="button" data-gti-ai aria-label="Open Galok AI" aria-expanded="false" aria-controls="galok-context-ai-panel" title="Ask Galok">
      <span class="galok-triple-islands__ai-word" aria-hidden="true">AI</span>
      <span class="galok-triple-islands__ai-close" aria-hidden="true">×</span>
      <span class="galok-triple-islands__ai-spark" aria-hidden="true">✦</span>
    </button>`;

  document.body.append(root);
  document.body.classList.add("galok-triple-islands-active");

  const localToggle = root.querySelector("[data-gti-local-toggle]");
  const localPanel = root.querySelector("[data-gti-local-panel]");
  const localList = root.querySelector("[data-gti-local-list]");
  const currentLabel = root.querySelector("[data-gti-current-label]");
  const aiToggle = root.querySelector("[data-gti-ai]");

  let localItems = [];
  let localLinks = [];
  let activeId = "";
  let raf = 0;
  let localOpen = false;

  const closeLocal = (restoreFocus = false) => {
    if (!localOpen) return;
    localOpen = false;
    root.classList.remove("is-local-open");
    localToggle.setAttribute("aria-expanded", "false");
    localToggle.setAttribute("aria-label", "Open page contents");
    localPanel.setAttribute("aria-hidden", "true");
    if (restoreFocus) localToggle.focus({ preventScroll: true });
  };

  const openLocal = () => {
    if (localOpen) return;
    localOpen = true;
    root.classList.add("is-local-open");
    localToggle.setAttribute("aria-expanded", "true");
    localToggle.setAttribute("aria-label", "Close page contents");
    localPanel.setAttribute("aria-hidden", "false");
    window.galokContextAI?.close?.();
  };

  const scrollToItem = (item) => {
    const target = document.getElementById(item.target);
    if (!target) return;
    target.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", `#${item.target}`);
    closeLocal();
  };

  const renderLocalItems = () => {
    localItems = collectLocalItems();
    localList.replaceChildren(...localItems.map((item) => {
      const link = document.createElement("a");
      link.className = "galok-triple-islands__local-link";
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
    localLinks = [...localList.querySelectorAll(".galok-triple-islands__local-link")];
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
    currentLabel.textContent = current.label;
    localToggle.title = `On this page · ${current.fullLabel || current.label}`;
    if (activeId === current.target) return;
    activeId = current.target;
    localLinks.forEach((link) => link.classList.toggle("is-current", link.dataset.target === activeId));
    const activeLink = localLinks.find((link) => link.dataset.target === activeId);
    if (activeLink && localOpen) activeLink.scrollIntoView({ behavior: instant || reducedMotion.matches ? "auto" : "smooth", block: "nearest" });
  }

  const scheduleCurrent = () => {
    if (!raf) raf = requestAnimationFrame(() => updateCurrent(false));
  };

  localToggle.addEventListener("click", () => localOpen ? closeLocal() : openLocal());

  aiToggle.addEventListener("click", () => {
    closeLocal();
    if (window.galokContextAI?.toggle) {
      window.galokContextAI.toggle();
      return;
    }
    window.__GALOK_CONTEXT_AI_PENDING_OPEN__ = true;
    window.dispatchEvent(new CustomEvent("galok:context-ai-toggle"));
  });

  window.addEventListener("galok:context-ai-state", (event) => {
    const open = Boolean(event.detail?.open);
    root.classList.toggle("is-ai-open", open);
    aiToggle.setAttribute("aria-expanded", String(open));
    aiToggle.setAttribute("aria-label", open ? "Close Galok AI" : "Open Galok AI");
    aiToggle.title = open ? "Close Galok AI" : "Ask Galok";
  });

  document.addEventListener("click", (event) => {
    if (!localOpen) return;
    const target = event.target instanceof Node ? event.target : null;
    if (target && !root.querySelector("[data-gti-local-island]").contains(target)) closeLocal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && localOpen) {
      event.preventDefault();
      closeLocal(true);
    }
  });

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
      }, 160);
    }).observe(main, { childList: true, subtree: true });
  }

  renderLocalItems();
  window.dispatchEvent(new CustomEvent("galok:triple-islands-ready"));
})();
