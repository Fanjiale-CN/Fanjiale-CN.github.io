(() => {
  const root = document.documentElement;
  const brand = document.querySelector('.gv2-brand');
  const capsule = document.querySelector('[data-gv2-capsule]');
  const panelWrap = document.querySelector('[data-capsule-panel-wrap]');
  const bar = capsule?.querySelector('.gv2-capsule-bar');
  const year = document.querySelector('[data-current-year]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (year) year.textContent = String(new Date().getFullYear());

  // Brand motion stays independent from navigation motion.
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
  const sectionMap = new Map(localNames.map((name) => [name, document.querySelector(`[data-home-section="${name}"]`)]));

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
  let scrollFrame = 0;
  let lastY = window.scrollY;
  let downTravel = 0;
  let expandCooldownUntil = 0;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const buttonFor = (name) => triggers.find((button) => button.dataset.capsuleTrigger === name) || null;

  const updateMini = (name) => {
    const meta = navMeta.get(name) || navMeta.get('research');
    mini.querySelector('.gv2-capsule-mini__icon').innerHTML = meta.icon;
    mini.querySelector('.gv2-capsule-mini__label').textContent = meta.label;
  };

  const centerButton = (button) => {
    if (!button) return;
    const max = Math.max(0, bar.scrollWidth - bar.clientWidth);
    const left = clamp(button.offsetLeft + button.offsetWidth / 2 - bar.clientWidth / 2, 0, max);
    bar.scrollTo({ left, behavior: 'auto' });
  };

  const syncLens = (button, animate = true) => {
    if (!button || !lens || isCollapsed) return;
    if (!animate || reducedMotion.matches) capsule.classList.add('is-lens-instant');
    bar.style.setProperty('--gv2-lens-x', `${button.offsetLeft}px`);
    bar.style.setProperty('--gv2-lens-w', `${button.offsetWidth}px`);
    centerButton(button);
    if (!animate || reducedMotion.matches) requestAnimationFrame(() => capsule.classList.remove('is-lens-instant'));
  };

  const markCurrent = (name, { animate = true } = {}) => {
    if (!name || !navMeta.has(name)) return;
    const changed = currentName !== name;
    currentName = name;
    triggers.forEach((button) => button.classList.toggle('is-current', button.dataset.capsuleTrigger === name));
    updateMini(name);
    if (changed || !lens.dataset.ready) {
      syncLens(buttonFor(name), animate && Boolean(lens.dataset.ready));
      lens.dataset.ready = 'true';
    }
  };

  const setPanel = (name, trigger) => {
    activePanel = name;
    lastTrigger = trigger || null;
    panels.forEach((panel) => panel.classList.toggle('is-active', panel.dataset.capsulePanel === name));
    triggers.forEach((button) => button.setAttribute('aria-expanded', button.dataset.capsuleTrigger === name ? 'true' : 'false'));
    capsule.classList.toggle('is-open', Boolean(name));
    panelWrap.setAttribute('aria-hidden', name ? 'false' : 'true');
    if (trigger && !isCollapsed) syncLens(trigger, true);
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
    requestAnimationFrame(() => syncLens(buttonFor(currentName), false));
  };

  mini.addEventListener('click', expandCapsule);

  const sectionTop = (name) => {
    const element = sectionMap.get(name);
    if (!element) return null;
    return Math.max(0, element.getBoundingClientRect().top + window.scrollY - 6);
  };

  const updateCurrentFromScroll = () => {
    const marker = window.scrollY + Math.min(220, window.innerHeight * 0.28);
    let next = 'research';
    localNames.forEach((name) => {
      const top = sectionTop(name);
      if (top != null && marker >= top) next = name;
    });
    markCurrent(next, { animate: !isCollapsed });
  };

  const cancelNavigation = () => {
    if (!isNavigating) return;
    cancelAnimationFrame(scrollFrame);
    isNavigating = false;
  };

  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  const fastScrollTo = (name) => {
    const targetY = sectionTop(name);
    if (targetY == null) return;

    cancelNavigation();
    closePanel();
    markCurrent(name, { animate: true });

    const startY = window.scrollY;
    const distance = targetY - startY;
    const absoluteDistance = Math.abs(distance);

    if (absoluteDistance < 2 || reducedMotion.matches) {
      window.scrollTo(0, targetY);
      lastY = targetY;
      return;
    }

    const duration = clamp(160 + Math.sqrt(absoluteDistance) * 1.6, 180, 280);
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
        return;
      }
      scrollFrame = requestAnimationFrame(step);
    };

    scrollFrame = requestAnimationFrame(step);
  };

  triggers.forEach((button) => {
    button.addEventListener('click', () => {
      const name = button.dataset.capsuleTrigger;

      if (localNames.includes(name)) {
        const targetY = sectionTop(name);
        const alreadyHere = currentName === name && targetY != null && Math.abs(window.scrollY - targetY) < 72;
        if (alreadyHere) {
          if (activePanel === name) closePanel();
          else setPanel(name, button);
        } else {
          fastScrollTo(name);
        }
        return;
      }

      if (activePanel === name) closePanel();
      else setPanel(name, button);
    });
  });

  let scrollTicking = false;
  window.addEventListener('scroll', () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      const delta = y - lastY;

      if (!isNavigating) {
        updateCurrentFromScroll();
        if (!isCollapsed && performance.now() > expandCooldownUntil) {
          if (delta > 0) downTravel += delta;
          else if (delta < 0) downTravel = 0;
          if (y > 72 && downTravel > 24) collapseCapsule();
        }
      }

      lastY = y;
      scrollTicking = false;
    });
  }, { passive: true });

  window.addEventListener('wheel', () => {
    if (isNavigating) cancelNavigation();
  }, { passive: true });

  window.addEventListener('touchstart', (event) => {
    if (isNavigating && !capsule.contains(event.target)) cancelNavigation();
  }, { passive: true });

  window.addEventListener('resize', () => {
    if (!isCollapsed) syncLens(buttonFor(currentName), false);
  }, { passive: true });

  document.addEventListener('pointerdown', (event) => {
    if (activePanel && !capsule.contains(event.target)) closePanel();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && activePanel) closePanel({ restoreFocus: true });
  });

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

  document.querySelector('.gv2-scroll-cue')?.addEventListener('click', (event) => {
    event.preventDefault();
    fastScrollTo('research');
  });

  applyTheme();
  updateCurrentFromScroll();
  updateMini(currentName);
  requestAnimationFrame(() => syncLens(buttonFor(currentName), false));
})();