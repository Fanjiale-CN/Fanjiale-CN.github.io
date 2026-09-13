(() => {
  const body = document.body;
  if (!body?.classList.contains('viewer-page-body')) return;
  if (document.querySelector('.cities-dual-islands')) return;

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const darkScheme = matchMedia('(prefers-color-scheme: dark)');
  const archive = document.querySelector('#visual-archive-preview');
  const weather = document.querySelector('galok-city-weather[data-live-city]');
  const footer = document.querySelector('.field-footer');
  if (!archive) return;

  const isDarkResolved = () => {
    const theme = document.documentElement.dataset.theme;
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    return darkScheme.matches;
  };

  const boot = (conversation) => {
    if (document.querySelector('.cities-dual-islands')) return;

    const hero = document.querySelector('[data-viewer-hero]');
    const selector = document.querySelector('[data-city-selector]');

    if (conversation) conversation.id ||= 'cities-ask';
    if (weather) weather.id ||= 'live-city';
    archive.id ||= 'visual-archive-preview';

    const sections = conversation
      ? [
          { id: conversation.id, label: '01 Ask', element: conversation, surface: 'conversation' },
          ...(weather ? [{ id: weather.id, label: '02 Conditions', element: weather, surface: 'weather' }] : []),
          { id: archive.id, label: weather ? '03 Archive' : '02 Archive', element: archive, surface: 'light' }
        ]
      : [
          ...(hero ? [{ id: hero.id ||= 'cities-overview', label: '01 Overview', element: hero, surface: 'dark' }] : []),
          ...(selector ? [{ id: selector.id ||= 'choose-city', label: '02 City Index', element: selector, surface: 'light' }] : []),
          ...(weather ? [{ id: weather.id, label: '03 Conditions', element: weather, surface: 'weather' }] : []),
          { id: archive.id, label: weather ? '04 Archive' : '03 Archive', element: archive, surface: 'light' }
        ];

    if (!sections.length) return;

    const menuIcon = `
      <svg class="cities-dual-islands__menu-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 7h11M8 12h11M8 17h11"/>
        <path d="M4 7h.01M4 12h.01M4 17h.01" stroke-width="2.8"/>
      </svg>`;

    const root = document.createElement('div');
    root.className = 'cities-dual-islands';
    root.dataset.mode = 'page';
    root.dataset.surface = isDarkResolved() ? 'dark' : 'light';
    root.setAttribute('aria-label', 'Cities page and Galok site navigation');
    root.innerHTML = `
      <div class="cities-dual-islands__island cities-dual-islands__island--page" data-island="page">
        <button class="cities-dual-islands__toggle" type="button" data-island-toggle="page" aria-label="Cities page sections" aria-pressed="true">
          ${menuIcon}
        </button>
        <nav class="cities-dual-islands__content" aria-label="Cities page sections">
          <div class="cities-dual-islands__track" data-section-track></div>
        </nav>
      </div>
      <div class="cities-dual-islands__island cities-dual-islands__island--site" data-island="site">
        <button class="cities-dual-islands__toggle" type="button" data-island-toggle="site" aria-label="Galok site navigation" aria-pressed="false">
          <img class="cities-dual-islands__logo" src="/assets/galok-symbol.svg" alt="" aria-hidden="true">
        </button>
        <nav class="cities-dual-islands__content" aria-label="Galok site">
          <div class="cities-dual-islands__site-links">
            <a class="cities-dual-islands__site-link" href="/cities/" aria-current="page">Cities</a>
            <a class="cities-dual-islands__site-link" href="/research/">Research</a>
            <a class="cities-dual-islands__site-link" href="/essays/">Essays</a>
            <a class="cities-dual-islands__site-link" href="/reading/">Reading</a>
            <a class="cities-dual-islands__site-link" href="/radar/">Radar</a>
            <a class="cities-dual-islands__site-link cities-dual-islands__more" href="/index/" aria-label="Open full Galok index">•••</a>
          </div>
        </nav>
      </div>`;

    document.body.appendChild(root);
    body.classList.add('cities-dual-islands-enhanced');

    const track = root.querySelector('[data-section-track]');
    const pageToggle = root.querySelector('[data-island-toggle="page"]');
    const siteToggle = root.querySelector('[data-island-toggle="site"]');
    const pageIsland = root.querySelector('[data-island="page"]');
    const siteIsland = root.querySelector('[data-island="site"]');

    for (const section of sections) {
      const link = document.createElement('a');
      link.className = 'cities-dual-islands__section-link';
      link.href = `#${section.id}`;
      link.dataset.target = section.id;
      link.textContent = section.label;
      link.addEventListener('click', (event) => {
        event.preventDefault();
        section.element.scrollIntoView({
          behavior: reduceMotion.matches ? 'auto' : 'smooth',
          block: 'start'
        });
        history.replaceState(null, '', `#${section.id}`);
      });
      track.appendChild(link);
    }

    const sectionLinks = [...track.querySelectorAll('.cities-dual-islands__section-link')];

    const setMode = (mode, focus = false) => {
      if (mode !== 'page' && mode !== 'site') return;
      root.dataset.mode = mode;
      pageToggle.setAttribute('aria-pressed', String(mode === 'page'));
      siteToggle.setAttribute('aria-pressed', String(mode === 'site'));
      pageIsland.setAttribute('aria-expanded', String(mode === 'page'));
      siteIsland.setAttribute('aria-expanded', String(mode === 'site'));
      if (focus) (mode === 'page' ? pageToggle : siteToggle).focus({ preventScroll: true });
    };

    pageToggle.addEventListener('click', () => {
      if (root.dataset.mode === 'site') setMode('page');
    });

    siteToggle.addEventListener('click', () => {
      if (root.dataset.mode === 'page') setMode('site');
    });

    root.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && root.dataset.mode === 'site') {
        event.preventDefault();
        setMode('page', true);
      }
    });

    const weatherSurface = () => {
      if (!weather) return 'light';
      const panel = weather.querySelector('.city-weather');
      if (!panel) return 'dark';
      return panel.hasAttribute('data-cover') ? 'light' : 'dark';
    };

    let activeId = '';
    let raf = 0;

    const setSurface = (section) => {
      if (isDarkResolved()) {
        root.dataset.surface = 'dark';
        return;
      }
      if (footer && footer.getBoundingClientRect().top < window.innerHeight * .72) {
        root.dataset.surface = 'dark';
        return;
      }
      if (!section) return;
      if (section.surface === 'conversation') root.dataset.surface = 'light';
      else root.dataset.surface = section.surface === 'weather' ? weatherSurface() : section.surface;
    };

    const updateCurrent = (instant = false) => {
      raf = 0;
      const marker = Math.min(220, window.innerHeight * .28);
      let current = sections[0];
      for (const section of sections) {
        if (section.element.getBoundingClientRect().top <= marker) current = section;
        else break;
      }

      setSurface(current);

      if (activeId === current.id) return;
      activeId = current.id;
      sectionLinks.forEach((link) => link.classList.toggle('is-current', link.dataset.target === activeId));

      if (root.dataset.mode === 'page') {
        const activeLink = sectionLinks.find((link) => link.dataset.target === activeId);
        activeLink?.scrollIntoView({
          behavior: instant || reduceMotion.matches ? 'auto' : 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    };

    const scheduleCurrent = () => {
      if (!raf) raf = requestAnimationFrame(() => updateCurrent(false));
    };

    window.addEventListener('scroll', scheduleCurrent, { passive: true });
    window.addEventListener('resize', scheduleCurrent, { passive: true });
    darkScheme.addEventListener?.('change', scheduleCurrent);

    const themeObserver = new MutationObserver(scheduleCurrent);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    if (weather) {
      const weatherObserver = new MutationObserver(scheduleCurrent);
      weatherObserver.observe(weather, { attributes: true, childList: true, subtree: true });
    }

    setMode('page');
    updateCurrent(true);
  };

  const conversation = document.querySelector('[data-cities-conversation]');
  if (conversation) {
    boot(conversation);
    return;
  }

  let fallbackTimer = 0;
  const observer = new MutationObserver(() => {
    const mounted = document.querySelector('[data-cities-conversation]');
    if (!mounted) return;
    window.clearTimeout(fallbackTimer);
    observer.disconnect();
    boot(mounted);
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });
  fallbackTimer = window.setTimeout(() => {
    observer.disconnect();
    boot(null);
  }, 2400);
})();
