(() => {
  const root = document.documentElement;
  const head = document.head;

  const ensureStylesheet = (id, href, crossOrigin = false) => {
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    if (crossOrigin) link.crossOrigin = 'anonymous';
    head.append(link);
  };

  /* MiSans is the main-site typeface. The font is supplied through the
     subsetted web package and remains subject to Xiaomi's MiSans license. */
  ensureStylesheet('galok-misans-light', 'https://cdn.jsdelivr.net/npm/misans@4.1.0/lib/Normal/MiSans-Light.min.css', true);
  ensureStylesheet('galok-misans-medium', 'https://cdn.jsdelivr.net/npm/misans@4.1.0/lib/Normal/MiSans-Medium.min.css', true);
  ensureStylesheet('galok-misans-bold', 'https://cdn.jsdelivr.net/npm/misans@4.1.0/lib/Normal/MiSans-Bold.min.css', true);
  ensureStylesheet('galok-home-nav-21', '/home-v2-nav.css?v=20260913b');

  if (!document.querySelector('meta[name="font-credit"]')) {
    const credit = document.createElement('meta');
    credit.name = 'font-credit';
    credit.content = 'MiSans © Beijing Xiaomi Mobile Software Co., Ltd.; used under the MiSans font license.';
    head.append(credit);
  }

  const capsule = document.querySelector('[data-gv2-capsule]');
  const panelWrap = document.querySelector('[data-capsule-panel-wrap]');
  const bar = capsule?.querySelector('.gv2-capsule-bar');
  const year = document.querySelector('[data-current-year]');
  if (year) year.textContent = String(new Date().getFullYear());

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

  const navItems = [
    ['research', 'Research', icons.research],
    ['press-print', 'Press Print', icons.press],
    ['cities', 'Cities', icons.cities],
    ['essays', 'Essays', icons.essays],
    ['reading', 'Reading', icons.reading],
    ['radar', 'Radar', icons.radar],
    ['menu', 'Menu', icons.menu],
  ];

  bar.innerHTML = '<span class="gv2-capsule-lens" aria-hidden="true"></span>' + navItems.map(([name, label, icon]) => (
    `<button type="button" data-capsule-trigger="${name}" aria-expanded="false" aria-label="Open ${label} menu"><span class="gv2-nav-icon" aria-hidden="true">${icon}</span><span class="gv2-nav-label">${label}</span></button>`
  )).join('');

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
  let activePanel = null;
  let lastTrigger = null;
  let currentName = 'research';
  let lensFrame = 0;

  const buttonFor = (name) => triggers.find((button) => button.dataset.capsuleTrigger === name) || null;

  const syncLens = (button, { center = false } = {}) => {
    if (!button || !lens) return;
    cancelAnimationFrame(lensFrame);
    lensFrame = requestAnimationFrame(() => {
      bar.style.setProperty('--gv2-lens-x', `${button.offsetLeft}px`);
      bar.style.setProperty('--gv2-lens-w', `${button.offsetWidth}px`);
      if (center) button.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    });
  };

  const updateScrollEdges = () => {
    const max = Math.max(0, bar.scrollWidth - bar.clientWidth);
    capsule.classList.toggle('is-scroll-start', bar.scrollLeft <= 5);
    capsule.classList.toggle('is-scroll-end', bar.scrollLeft >= max - 5);
  };

  const setPanel = (name, trigger) => {
    activePanel = name;
    lastTrigger = trigger || null;
    panels.forEach((panel) => panel.classList.toggle('is-active', panel.dataset.capsulePanel === name));
    triggers.forEach((button) => {
      const expanded = button.dataset.capsuleTrigger === name;
      button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });
    capsule.classList.toggle('is-open', Boolean(name));
    panelWrap.setAttribute('aria-hidden', name ? 'false' : 'true');
    if (trigger) syncLens(trigger, { center: true });
  };

  const closePanel = ({ restoreFocus = false } = {}) => {
    const previous = lastTrigger;
    setPanel(null, null);
    syncLens(buttonFor(currentName) || previous || buttonFor('research'));
    if (restoreFocus && previous) previous.focus();
  };

  triggers.forEach((button) => {
    button.addEventListener('click', () => {
      const name = button.dataset.capsuleTrigger;
      if (activePanel === name) closePanel();
      else setPanel(name, button);
    });
  });

  bar.addEventListener('scroll', updateScrollEdges, { passive: true });
  window.addEventListener('resize', () => {
    updateScrollEdges();
    syncLens(buttonFor(activePanel || currentName || 'research'));
  }, { passive: true });

  document.addEventListener('pointerdown', (event) => {
    if (!activePanel) return;
    if (!capsule.contains(event.target)) closePanel();
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
        syncLens(next, { center: true });
      }
    }
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

  const sectionMap = new Map([
    ['research', document.querySelector('[data-home-section="research"]')],
    ['press-print', document.querySelector('[data-home-section="press-print"]')],
    ['cities', document.querySelector('[data-home-section="cities"]')],
  ]);

  const markCurrent = (name) => {
    currentName = name || currentName || 'research';
    triggers.forEach((button) => button.classList.toggle('is-current', button.dataset.capsuleTrigger === name));
    if (!activePanel && name) syncLens(buttonFor(name), { center: true });
  };

  if ('IntersectionObserver' in window) {
    const visible = new Map();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => visible.set(entry.target, entry.intersectionRatio));
      let bestName = null;
      let bestRatio = 0;
      sectionMap.forEach((element, name) => {
        const ratio = element ? (visible.get(element) || 0) : 0;
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestName = name;
        }
      });
      if (bestName && bestRatio > 0.12) markCurrent(bestName);
    }, { threshold: [0, .12, .25, .5, .75] });
    sectionMap.forEach((element) => element && observer.observe(element));
  }

  requestAnimationFrame(() => {
    syncLens(buttonFor('research'));
    updateScrollEdges();
  });
})();
