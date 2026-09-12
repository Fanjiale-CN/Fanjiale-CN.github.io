(() => {
  const root = document.documentElement;
  const capsule = document.querySelector('[data-gv2-capsule]');
  const panelWrap = document.querySelector('[data-capsule-panel-wrap]');
  const triggers = Array.from(document.querySelectorAll('[data-capsule-trigger]'));
  const panels = Array.from(document.querySelectorAll('[data-capsule-panel]'));
  const themeCycle = document.querySelector('[data-theme-cycle]');
  const year = document.querySelector('[data-current-year]');
  let activePanel = null;
  let lastTrigger = null;

  if (year) year.textContent = String(new Date().getFullYear());

  const setPanel = (name, trigger) => {
    activePanel = name;
    lastTrigger = trigger || null;

    panels.forEach((panel) => {
      panel.classList.toggle('is-active', panel.dataset.capsulePanel === name);
    });

    triggers.forEach((button) => {
      const expanded = button.dataset.capsuleTrigger === name;
      button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });

    if (capsule) capsule.classList.toggle('is-open', Boolean(name));
    if (panelWrap) panelWrap.setAttribute('aria-hidden', name ? 'false' : 'true');
  };

  const closePanel = ({ restoreFocus = false } = {}) => {
    const previous = lastTrigger;
    setPanel(null, null);
    if (restoreFocus && previous) previous.focus();
  };

  triggers.forEach((button) => {
    button.addEventListener('click', () => {
      const name = button.dataset.capsuleTrigger;
      if (activePanel === name) {
        closePanel();
      } else {
        setPanel(name, button);
      }
    });
  });

  document.addEventListener('pointerdown', (event) => {
    if (!activePanel || !capsule) return;
    if (!capsule.contains(event.target)) closePanel();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && activePanel) closePanel({ restoreFocus: true });
  });

  const themeModes = ['auto', 'light', 'dark'];
  const storedTheme = localStorage.getItem('galok-theme');
  let themeMode = themeModes.includes(storedTheme) ? storedTheme : 'auto';
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
  const themeMeta = document.querySelector('meta[name="theme-color"]');

  const resolvedTheme = () => {
    if (themeMode === 'auto') return systemDark.matches ? 'dark' : 'light';
    return themeMode;
  };

  const updateThemeMeta = () => {
    if (!themeMeta) return;
    themeMeta.setAttribute('content', resolvedTheme() === 'dark' ? '#111416' : '#f3f2ee');
  };

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

  if (themeCycle) {
    themeCycle.addEventListener('click', () => {
      const index = themeModes.indexOf(themeMode);
      themeMode = themeModes[(index + 1) % themeModes.length];
      localStorage.setItem('galok-theme', themeMode);
      applyTheme();
    });
  }

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
    triggers.forEach((button) => {
      button.classList.toggle('is-current', button.dataset.capsuleTrigger === name);
    });
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
      else markCurrent(null);
    }, { threshold: [0, .12, .25, .5, .75] });

    sectionMap.forEach((element) => {
      if (element) observer.observe(element);
    });
  }
})();
