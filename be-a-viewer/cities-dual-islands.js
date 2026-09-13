(() => {
  const body = document.body;
  if (!body?.classList.contains('viewer-page-body')) return;
  if (document.querySelector('.cities-dual-islands')) return;

  const hero = document.querySelector('[data-viewer-hero]');
  const selector = document.querySelector('[data-city-selector]');
  const weather = document.querySelector('galok-city-weather[data-live-city]');
  const archive = document.querySelector('#visual-archive-preview');
  if (!hero || !selector || !archive) return;

  hero.id ||= 'cities-overview';
  selector.id ||= 'choose-city';
  if (weather) weather.id ||= 'live-city';

  const sections = [
    { id: hero.id, label: '01 Overview', element: hero, surface: 'dark' },
    { id: selector.id, label: '02 City Index', element: selector, surface: 'light' },
    ...(weather ? [{ id: weather.id, label: '03 Conditions', element: weather, surface: 'weather' }] : []),
    { id: archive.id, label: weather ? '04 Archive' : '03 Archive', element: archive, surface: 'light' }
  ];

  const menuIcon = `
    <svg class="cities-dual-islands__menu-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 7h11M8 12h11M8 17h11"/>
      <path d="M4 7h.01M4 12h.01M4 17h.01" stroke-width="2.8"/>
    </svg>`;

  const root = document.createElement('div');
  root.className = 'cities-dual-islands';
  root.dataset.mode = 'page';
  root.dataset.surface = 'dark';
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
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
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

  const footer = document.querySelector('.field-footer');
  let activeId = '';
  let raf = 0;

  const setSurface = (section) => {
    if (footer && footer.getBoundingClientRect().top < window.innerHeight * .72) {
      root.dataset.surface = 'dark';
      return;
    }
    if (!section) return;
    root.dataset.surface = section.surface === 'weather' ? weatherSurface() : section.surface;
  };

  const updateCurrent = (instant = false) => {
    raf = 0;
    if (!sections.length) return;

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
        behavior: instant || matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
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

  if (weather) {
    const weatherObserver = new MutationObserver(scheduleCurrent);
    weatherObserver.observe(weather, { attributes: true, childList: true, subtree: true });
  }

  setMode('page');
  updateCurrent(true);
})();
