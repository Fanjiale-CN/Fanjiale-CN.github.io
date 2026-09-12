(() => {
  const root = document.documentElement;
  const brand = document.querySelector('.gv2-brand');
  const capsule = document.querySelector('[data-gv2-capsule]');
  const panelWrap = document.querySelector('[data-capsule-panel-wrap]');
  const bar = capsule?.querySelector('.gv2-capsule-bar');
  const year = document.querySelector('[data-current-year]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (year) year.textContent = String(new Date().getFullYear());

  // GALOK motion identity 01. Kept independent from navigation state.
  let logoTimer = 0;
  const playBrandMotion = () => {
    if (!brand || reducedMotion.matches) return;
    clearTimeout(logoTimer);
    brand.classList.remove('is-logo-playing');
    void brand.offsetWidth;
    brand.classList.add('is-logo-playing');
    logoTimer = window.setTimeout(() => brand.classList.remove('is-logo-playing'), 620);
  };

  brand?.addEventListener('click', (event) => {
    playBrandMotion();
    const plainClick = !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
    const onHome = location.pathname === '/' || location.pathname === '/index.html';
    if (plainClick && onHome) {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    }
  });

  if (!capsule || !panelWrap || !bar) return;

  const icons = {
    research: '<svg viewBox="0 0 24 24"><path d="M4 18V10M9 18V6M14 18v-4M19 18V8"/><path d="M3.5 18.5h17"/></svg>',
    press: '<svg viewBox="0 0 24 24"><path d="M7 4.5h9.5A2.5 2.5 0 0 1 19 7v10.5H9.5A2.5 2.5 0 0 1 7 15V4.5Z"/><path d="M5 7.5h10.5A2.5 2.5 0 0 1 18 10v9.5H7.5A2.5 2.5 0 0 1 5 17V7.5Z"/></svg>',
    cities: '<svg viewBox="0 0 24 24"><path d="M3 19h18M5 19V9h5v10M10 19V5h5v14M15 19v-7h4v7"/><path d="M7 12h1M12 8h1M12 11h1M17 15h1"/></svg>',
    essays: '<svg viewBox="0 0 24 24"><path d="M6 4.5h9l3 3V19.5H6z"/><path d="M15 4.5v3h3M9 11h6M9 14h6M9 17h4"/></svg>',
    reading: '<svg viewBox="0 0 24 24"><path d="M3.5 6.5c3.3-1.2 6-.7 8.5 1.2v11c-2.5-1.9-5.2-2.4-8.5-1.2z"/><path d="M20.5 6.5c-3.3-1.2-6-.7-8.5 1.2v11c2.5-1.9 5.2-2.4 8.5-1.2z"/></svg>',
    radar: '<svg viewBox="0 0 24 24"><path d="M12 20a8 8 0 1 0-8-8"/><path d="M12 16a4 4 0 1 0-4-4"/><path d="M12 12 18.5 6.5"/><circle cx="12" cy="12" r="1.2"/></svg>',
    menu: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="6" height="6" rx="1.4"/><rect x="14" y="4" width="6" height="6" rx="1.4"/><rect x="4" y="14" width="6" height="6" rx="1.4"/><rect x="14" y="14" width="6" height="6" rx="1.4"/></svg>'
  };

  // These are the homepage sections ScrollProgress tracks continuously.
  const localNames = ['research', 'press-print', 'cities'];
  const navItems = [
    ['research', 'Research', icons.research],
    ['press-print', 'Press Print', icons.press],
    ['cities', 'Cities', icons.cities],
    ['essays', 'Essays', icons.essays],
    ['reading', 'Reading', icons.reading],
    ['radar', 'Radar', icons.radar],
    ['menu', 'Menu', icons.menu]
  ];

  const navMeta = new Map(navItems.map(([name, label, icon]) => [name, { label, icon }]));

  bar.innerHTML = '<span class="gv2-capsule-lens" aria-hidden="true"></span>' + navItems.map(([name, label, icon]) => {
    const actionLabel = localNames.includes(name) ? `Go to ${label}` : `Open ${label} menu`;
    return `<button type="button" data-capsule-trigger="${name}" aria-expanded="false" aria-label="${actionLabel}"><span class="gv2-nav-icon" aria-hidden="true">${icon}</span><span class="gv2-nav-label">${label}</span></button>`;
  }).join('');

  const setPanelMarkup = (name, html) => {
    let panel = panelWrap.querySelector(`[data-capsule-panel="${name}"]`);
    if (!panel) {
      panel = document.createElement('section');
      panel.className = 'gv2-submenu';
      panel.dataset.capsulePanel = name;
      panel.setAttribute('aria-label', `${name} menu`);
      panelWrap.append(panel);
    }
    panel.innerHTML = html;
  };

  setPanelMarkup('research', '<div><span>Research</span><small>Evidence, arguments and working papers.</small></div><a href="/research/">All research</a><a href="/research/love-by-the-hour/">Research 003</a><a href="/research/fast-metabolism-economy/">Research 002</a><a href="/data/">Data</a>');
  setPanelMarkup('press-print', '<div><span>Press Print</span><small>Image reconstruction through print logic.</small></div><a href="/press-print/">Overview</a><a href="https://chatgpt.com/" target="_blank" rel="noreferrer">Try in ChatGPT ↗</a><a href="https://github.com/Fanjiale-CN/press-print" target="_blank" rel="noreferrer">Source ↗</a>');
  setPanelMarkup('cities', '<div><span>Cities</span><small>Visual records built from streets, weather and movement.</small></div><a href="/cities/">All cities</a><a href="/be-a-viewer/beijing/">Beijing</a><a href="/be-a-viewer/shanghai/">Shanghai</a><a href="/be-a-viewer/xian/">Xi’an</a><a href="/be-a-viewer/xiamen/">Xiamen</a>');
  setPanelMarkup('essays', '<div><span>Essays</span><small>Arguments, notes and ordinary evidence.</small></div><a href="/essays/">All essays</a><a href="/essays/the-curators-curse/">The Curator’s Curse</a><a href="/essays/platforms-redesign-choice/">Platforms & choice</a><a href="/essays/rmb-9-9-coffee/">RMB 9.9 coffee</a>');
  setPanelMarkup('reading', '<div><span>Reading</span><small>Texts, editions and source trails.</small></div><a href="/reading/">Reading room</a><a href="/reading/dongjing-meng-hua-lu/">東京夢華錄</a><a href="/reading/dongjing-meng-hua-lu/21/">Current chapter</a><a href="/index/">Reading index</a>');
  setPanelMarkup('radar', '<div><span>Radar</span><small>Signals before they become an argument.</small></div><a href="/radar/">Open Radar</a><a href="/research/">Research</a><a href="/data/">Data</a><a href="/index/">Archive index</a>');
  setPanelMarkup('menu', '<div><span>Galok</span><small>More ways into the archive.</small></div><a href="/work/">Work</a><a href="/index/">Index</a><a href="/about/">About</a><button type="button" data-theme-cycle>Theme · Auto</button>');

  const triggers = Array.from(capsule.querySelectorAll('[data-capsule-trigger]'));
  const panels = Array.from(panelWrap.querySelectorAll('[data-capsule-panel]'));
  const lens = bar.querySelector('.gv2-capsule-lens');
  const themeCycle = panelWrap.querySelector('[data-theme-cycle]');
  const sections = localNames.map((name) => ({ name, element: document.querySelector(`[data-home-section="${name}"]`) }));

  const mini = document.createElement('button');
  mini.type = 'button';
  mini.className = 'gv2-capsule-mini';
  mini.setAttribute('aria-label', 'Expand navigation');
  mini.innerHTML = '<span class="gv2-capsule-mini__icon" aria-hidden="true"></span><span class="gv2-capsule-mini__label"></span>';
  capsule.append(mini);

  let activePanel = null;
  let lastTrigger = null;
  let currentName = 'research';
  let isCollapsed = false;
  let isNavigating = false;
  let scrollAnimationFrame = 0;
  let progressFrame = 0;
  let targetProgress = 0;
  let visualProgress = 0;
  let previousProgressTime = performance.now();
  let lastY = window.scrollY;
  let downTravel = 0;
  let expandCooldownUntil = 0;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const lerp = (a, b, t) => a + (b - a) * t;
  const buttonFor = (name) => triggers.find((button) => button.dataset.capsuleTrigger === name) || null;

  const updateMini = (name) => {
    const meta = navMeta.get(name) || navMeta.get('research');
    mini.querySelector('.gv2-capsule-mini__icon').innerHTML = meta.icon;
    mini.querySelector('.gv2-capsule-mini__label').textContent = meta.label;
  };

  const sectionTop = (name) => {
    const item = sections.find((section) => section.name === name);
    if (!item?.element) return null;
    return Math.max(0, item.element.getBoundingClientRect().top + window.scrollY - 6);
  };

  const sectionTops = () => sections.map(({ element }) => (
    element ? Math.max(0, element.getBoundingClientRect().top + window.scrollY - 6) : 0
  ));

  // Equivalent to the supplied ScrollProgress sections model: the page scroll position
  // is the one source of truth, expressed as a continuous section index (0..N-1).
  const progressFromScroll = () => {
    const tops = sectionTops();
    const marker = window.scrollY + Math.min(220, window.innerHeight * 0.28);

    if (!tops.length || marker <= tops[0]) return 0;

    for (let index = 0; index < tops.length - 1; index += 1) {
      const start = tops[index];
      const end = tops[index + 1];
      if (marker <= end) {
        const span = Math.max(1, end - start);
        return index + clamp((marker - start) / span, 0, 1);
      }
    }

    return tops.length - 1;
  };

  const markCurrentFromProgress = (progress) => {
    const index = clamp(Math.round(progress), 0, localNames.length - 1);
    const name = localNames[index];
    if (name === currentName) return;

    currentName = name;
    triggers.forEach((button) => button.classList.toggle('is-current', button.dataset.capsuleTrigger === name));
    updateMini(name);
  };

  const renderLens = (progress) => {
    if (!lens || isCollapsed) return;

    const bounded = clamp(progress, 0, localNames.length - 1);
    const low = Math.floor(bounded);
    const high = Math.min(localNames.length - 1, Math.ceil(bounded));
    const t = bounded - low;
    const lowButton = buttonFor(localNames[low]);
    const highButton = buttonFor(localNames[high]);
    if (!lowButton || !highButton) return;

    const x = lerp(lowButton.offsetLeft, highButton.offsetLeft, t);
    const width = lerp(lowButton.offsetWidth, highButton.offsetWidth, t);
    bar.style.setProperty('--gv2-lens-x', `${x}px`);
    bar.style.setProperty('--gv2-lens-w', `${width}px`);
  };

  const progressTick = (now) => {
    const dt = Math.min(0.05, Math.max(0.001, (now - previousProgressTime) / 1000));
    previousProgressTime = now;

    if (reducedMotion.matches) {
      visualProgress = targetProgress;
    } else {
      // Critically damped, monotonic smoothing. It cannot overshoot or reverse by itself.
      const follow = 1 - Math.exp(-22 * dt);
      visualProgress += (targetProgress - visualProgress) * follow;
    }

    renderLens(visualProgress);
    markCurrentFromProgress(targetProgress);

    if (Math.abs(targetProgress - visualProgress) > 0.0005) {
      progressFrame = requestAnimationFrame(progressTick);
    } else {
      visualProgress = targetProgress;
      renderLens(visualProgress);
      progressFrame = 0;
    }
  };

  const updateScrollProgress = ({ immediate = false } = {}) => {
    targetProgress = progressFromScroll();
    markCurrentFromProgress(targetProgress);

    if (immediate || reducedMotion.matches) {
      cancelAnimationFrame(progressFrame);
      progressFrame = 0;
      visualProgress = targetProgress;
      renderLens(visualProgress);
      return;
    }

    if (!progressFrame) {
      previousProgressTime = performance.now();
      progressFrame = requestAnimationFrame(progressTick);
    }
  };

  const centerButton = (button, behavior = 'smooth') => {
    if (!button) return;
    const max = Math.max(0, bar.scrollWidth - bar.clientWidth);
    const left = clamp(button.offsetLeft + button.offsetWidth / 2 - bar.clientWidth / 2, 0, max);
    bar.scrollTo({ left, behavior });
  };

  const setPanel = (name, trigger) => {
    activePanel = name;
    lastTrigger = trigger || null;
    panels.forEach((panel) => panel.classList.toggle('is-active', panel.dataset.capsulePanel === name));
    triggers.forEach((button) => button.setAttribute('aria-expanded', button.dataset.capsuleTrigger === name ? 'true' : 'false'));
    capsule.classList.toggle('is-open', Boolean(name));
    panelWrap.setAttribute('aria-hidden', name ? 'false' : 'true');
    if (trigger) centerButton(trigger, reducedMotion.matches ? 'auto' : 'smooth');
  };

  const closePanel = ({ restoreFocus = false } = {}) => {
    const previous = lastTrigger;
    activePanel = null;
    lastTrigger = null;
    panels.forEach((panel) => panel.classList.remove('is-active'));
    triggers.forEach((button) => button.setAttribute('aria-expanded', 'false'));
    capsule.classList.remove('is-open');
    panelWrap.setAttribute('aria-hidden', 'true');
    if (restoreFocus && previous) previous.focus();
  };

  const collapseCapsule = () => {
    if (isCollapsed) return;
    closePanel();
    isCollapsed = true;
    capsule.classList.add('is-collapsed');
    mini.setAttribute('aria-expanded', 'false');
    updateMini(currentName);
  };

  const expandCapsule = () => {
    if (!isCollapsed) return;
    isCollapsed = false;
    downTravel = 0;
    expandCooldownUntil = performance.now() + 700;
    capsule.classList.remove('is-collapsed');
    mini.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(() => {
      centerButton(buttonFor(currentName), 'auto');
      updateScrollProgress({ immediate: true });
    });
  };

  mini.addEventListener('click', expandCapsule);

  const cancelNavigation = () => {
    if (!isNavigating) return;
    cancelAnimationFrame(scrollAnimationFrame);
    isNavigating = false;
  };

  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  const scrollToSection = (name) => {
    const targetY = sectionTop(name);
    if (targetY == null) return;

    cancelNavigation();
    closePanel();

    const startY = window.scrollY;
    const distance = targetY - startY;
    const absoluteDistance = Math.abs(distance);

    if (absoluteDistance < 2 || reducedMotion.matches) {
      window.scrollTo(0, targetY);
      lastY = targetY;
      updateScrollProgress({ immediate: true });
      return;
    }

    const duration = clamp(150 + Math.sqrt(absoluteDistance) * 1.45, 170, 260);
    const startedAt = performance.now();
    isNavigating = true;

    const step = (now) => {
      if (!isNavigating) return;
      const progress = clamp((now - startedAt) / duration, 0, 1);
      window.scrollTo(0, startY + distance * easeOutCubic(progress));

      if (progress >= 1) {
        window.scrollTo(0, targetY);
        isNavigating = false;
        lastY = targetY;
        updateScrollProgress({ immediate: false });
        return;
      }

      scrollAnimationFrame = requestAnimationFrame(step);
    };

    scrollAnimationFrame = requestAnimationFrame(step);
  };

  triggers.forEach((button) => {
    button.addEventListener('click', () => {
      const name = button.dataset.capsuleTrigger;

      if (localNames.includes(name)) {
        const targetY = sectionTop(name);
        const alreadyHere = targetY != null && Math.abs(window.scrollY - targetY) < 72;

        if (alreadyHere) {
          if (activePanel === name) closePanel();
          else setPanel(name, button);
        } else {
          scrollToSection(name);
        }
        return;
      }

      if (activePanel === name) closePanel();
      else setPanel(name, button);
    });
  });

  const updateScrollEdges = () => {
    const max = Math.max(0, bar.scrollWidth - bar.clientWidth);
    capsule.classList.toggle('is-scroll-start', bar.scrollLeft <= 5);
    capsule.classList.toggle('is-scroll-end', bar.scrollLeft >= max - 5);
  };

  bar.addEventListener('scroll', updateScrollEdges, { passive: true });

  // Collapse is based on actual user downward travel. Upward travel never expands it.
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const delta = y - lastY;

    if (!isNavigating && performance.now() > expandCooldownUntil) {
      if (delta > 0.5) downTravel += delta;
      else if (delta < -1) downTravel = 0;
      if (!isCollapsed && downTravel >= 28) collapseCapsule();
    }

    lastY = y;
    updateScrollProgress();
  }, { passive: true });

  // A manual gesture immediately takes control back from a programmatic section jump.
  window.addEventListener('wheel', cancelNavigation, { passive: true });
  window.addEventListener('touchstart', (event) => {
    if (!capsule.contains(event.target)) cancelNavigation();
  }, { passive: true });

  window.addEventListener('resize', () => {
    updateScrollEdges();
    updateScrollProgress({ immediate: true });
  }, { passive: true });

  window.addEventListener('load', () => updateScrollProgress({ immediate: true }), { once: true });

  document.addEventListener('pointerdown', (event) => {
    if (activePanel && !capsule.contains(event.target)) closePanel();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && activePanel) closePanel({ restoreFocus: true });
    if ((event.key === 'ArrowLeft' || event.key === 'ArrowRight') && capsule.contains(document.activeElement)) {
      const index = Math.max(0, triggers.indexOf(document.activeElement));
      const delta = event.key === 'ArrowRight' ? 1 : -1;
      const next = triggers[(index + delta + triggers.length) % triggers.length];
      if (next) {
        event.preventDefault();
        next.focus();
        centerButton(next);
      }
    }
  });

  // Theme ---------------------------------------------------------------
  const themeModes = ['auto', 'light', 'dark'];
  const storedTheme = localStorage.getItem('galok-theme');
  let themeMode = themeModes.includes(storedTheme) ? storedTheme : 'auto';
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
  const themeMeta = document.querySelector('meta[name="theme-color"]');

  const resolvedTheme = () => themeMode === 'auto' ? (systemDark.matches ? 'dark' : 'light') : themeMode;
  const updateThemeMeta = () => themeMeta?.setAttribute('content', resolvedTheme() === 'dark' ? '#111416' : '#f3f2ee');

  const applyTheme = () => {
    if (themeMode === 'auto') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', themeMode);
    if (themeCycle) {
      const label = themeMode.charAt(0).toUpperCase() + themeMode.slice(1);
      themeCycle.textContent = `Theme · ${label}`;
      themeCycle.setAttribute('aria-label', `Theme setting: ${label}. Activate to change theme.`);
    }
    updateThemeMeta();
  };

  themeCycle?.addEventListener('click', () => {
    const index = themeModes.indexOf(themeMode);
    themeMode = themeModes[(index + 1) % themeModes.length];
    localStorage.setItem('galok-theme', themeMode);
    applyTheme();
  });

  systemDark.addEventListener?.('change', () => {
    if (themeMode === 'auto') updateThemeMeta();
  });
  applyTheme();

  document.querySelector('.gv2-scroll-cue')?.addEventListener('click', (event) => {
    event.preventDefault();
    scrollToSection('research');
  });

  requestAnimationFrame(() => {
    // Initial state is derived from scroll position, never from a guessed active tab.
    targetProgress = progressFromScroll();
    visualProgress = targetProgress;
    currentName = localNames[clamp(Math.round(targetProgress), 0, localNames.length - 1)];
    triggers.forEach((button) => button.classList.toggle('is-current', button.dataset.capsuleTrigger === currentName));
    updateMini(currentName);
    renderLens(visualProgress);
    updateScrollEdges();
    capsule.dataset.scrollProgressReady = 'true';
  });
})();
