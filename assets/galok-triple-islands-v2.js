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
  root.setAttribute("aria-label", "Page, Galok and AI navigation");
  root.innerHTML = `
    <div class="galok-triple-islands-v2__left" data-gti2-left>
      <button class="galok-triple-islands-v2__circle" type="button" data-gti2-toc-toggle aria-label="Open page contents" aria-expanded="false" aria-controls="galok-triple-islands-v2-toc">${menuIcon}</button>
      <div class="galok-triple-islands-v2__toc-panel" id="galok-triple-islands-v2-toc" data-gti2-toc-panel aria-hidden="true">
        <div class="galok-triple-islands-v2__toc-head"><small>ON THIS PAGE</small><span data-gti2-current>Contents</span></div>
        <div class="galok-triple-islands-v2__toc-list" data-gti2-toc-list></div>
      </div>
    </div>
    <div class="galok-triple-islands-v2__site" aria-label="Galok navigation">
      <a class="galok-triple-islands-v2__home" href="/" aria-label="Galok home" title="Galok home">
        <img class="galok-triple-islands-v2__logo" src="/assets/galok-symbol.svg" alt="" aria-hidden="true">
      </a>
      <div class="galok-triple-islands-v2__site-links">
        ${siteLinks.map(([label, href]) => `<a class="galok-triple-islands-v2__site-link" href="${href}"${path.startsWith(href) ? ' aria-current="page"' : ""}>${label}</a>`).join("")}
        <a class="galok-triple-islands-v2__site-link galok-triple-islands-v2__more" href="/index/" aria-label="Open full Galok index">•••</a>
      </div>
    </div>
    <button class="galok-triple-islands-v2__circle galok-triple-islands-v2__ai" type="button" data-gti2-ai aria-label="Open Galok AI" aria-expanded="false" aria-controls="galok-context-ai-panel" title="Ask Galok">
      <span class="galok-triple-islands-v2__ai-word" aria-hidden="true">AI</span>
      <span class="galok-triple-islands-v2__ai-close" aria-hidden="true">×</span>
      <span class="galok-triple-islands-v2__ai-spark" aria-hidden="true">✦</span>
    </button>`;

  document.body.append(root);
  document.body.classList.add("galok-triple-islands-v2-active");

  const tocToggle = root.querySelector("[data-gti2-toc-toggle]");
  const tocPanel = root.querySelector("[data-gti2-toc-panel]");
  const tocList = root.querySelector("[data-gti2-toc-list]");
  const currentLabel = root.querySelector("[data-gti2-current]");
  const aiToggle = root.querySelector("[data-gti2-ai]");
  const leftIsland = root.querySelector("[data-gti2-left]");

  let localItems = [];
  let localLinks = [];
  let activeId = "";
  let raf = 0;
  let tocOpen = false;

  const closeToc = (restoreFocus = false) => {
    if (!tocOpen) return;
    tocOpen = false;
    root.classList.remove("is-toc-open");
    tocToggle.setAttribute("aria-expanded", "false");
    tocToggle.setAttribute("aria-label", "Open page contents");
    tocPanel.setAttribute("aria-hidden", "true");
    if (restoreFocus) tocToggle.focus({ preventScroll: true });
  };

  const openToc = () => {
    if (tocOpen) return;
    tocOpen = true;
    root.classList.add("is-toc-open");
    tocToggle.setAttribute("aria-expanded", "true");
    tocToggle.setAttribute("aria-label", "Close page contents");
    tocPanel.setAttribute("aria-hidden", "false");
    window.galokContextAI?.close?.();
  };

  const scrollToItem = (item) => {
    const target = document.getElementById(item.target);
    if (!target) return;
    target.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", `#${item.target}`);
    closeToc();
  };

  const renderLocalItems = () => {
    localItems = collectLocalItems();
    tocList.replaceChildren(...localItems.map((item) => {
      const link = document.createElement("a");
      link.className = "galok-triple-islands-v2__toc-link";
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
    localLinks = [...tocList.querySelectorAll(".galok-triple-islands-v2__toc-link")];
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
    tocToggle.title = `On this page · ${current.fullLabel || current.label}`;
    if (activeId === current.target) return;
    activeId = current.target;
    localLinks.forEach((link) => link.classList.toggle("is-current", link.dataset.target === activeId));
    const activeLink = localLinks.find((link) => link.dataset.target === activeId);
    if (activeLink && tocOpen) activeLink.scrollIntoView({ behavior: instant || reducedMotion.matches ? "auto" : "smooth", block: "nearest" });
  }

  const scheduleCurrent = () => {
    if (!raf) raf = requestAnimationFrame(() => updateCurrent(false));
  };

  tocToggle.addEventListener("click", () => tocOpen ? closeToc() : openToc());

  aiToggle.addEventListener("click", () => {
    closeToc();
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

  document.addEventListener("click", (event) => {
    if (!tocOpen) return;
    const target = event.target instanceof Node ? event.target : null;
    if (target && !leftIsland.contains(target)) closeToc();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && tocOpen) {
      event.preventDefault();
      closeToc(true);
    }
  });

  addEventListener("scroll", scheduleCurrent, { passive: true });
  addEventListener("resize", scheduleCurrent, { passive: true });

  /* Safe content refresh only. We observe child-list changes in main, never body classes. */
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
