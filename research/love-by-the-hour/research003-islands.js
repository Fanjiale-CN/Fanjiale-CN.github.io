(() => {
  const body = document.body;
  if (!body?.classList.contains('search003-paper-page')) return;

  const sourceLinks = [...document.querySelectorAll('.research-paper-toc [data-toc-link]')];
  if (!sourceLinks.length) return;

  const compactLabels = {
    'abstract': '00 Abstract',
    'introduction-someone-on-your-side': '01 Introduction',
    'from-emotional-labor-to-paid-intimacy': '02 Paid intimacy',
    'research-design-one-deep-case-eighteen-ecological-comparators': '03 Method',
    'someone-who-is-always-on-your-side': '04 Partiality',
    'a-person-with-a-back-office': '05 Back office',
    'selling-tenderness': '06 Tenderness',
    'from-public-content-to-private-orders': '07 Acquisition',
    'friendship-still-has-a-price': '08 Price',
    'from-customer-to-community-member': '09 Community',
    'when-intimacy-becomes-labor': '10 Labor',
    'discussion-the-social-life-of-paid-intimacy': '11 Discussion',
    'limitations': '12 Limitations',
    'conclusion-what-are-you-really-paying-for': '13 Conclusion',
    'field-evidence-note': 'Evidence',
    'references': 'References'
  };

  const menuIcon = `
    <svg class="s003-dual-islands__menu-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 7h11M8 12h11M8 17h11"/>
      <path d="M4 7h.01M4 12h.01M4 17h.01" stroke-width="2.8"/>
    </svg>`;

  const root = document.createElement('div');
  root.className = 's003-dual-islands';
  root.dataset.mode = 'reading';
  root.setAttribute('aria-label', 'Article and site navigation');
  root.innerHTML = `
    <div class="s003-dual-islands__island s003-dual-islands__island--article" data-island="article">
      <button class="s003-dual-islands__toggle" type="button" data-island-toggle="article" aria-label="Article contents" aria-pressed="true">
        ${menuIcon}
      </button>
      <nav class="s003-dual-islands__content" aria-label="Research 003 contents">
        <div class="s003-dual-islands__track" data-island-toc></div>
      </nav>
    </div>
    <div class="s003-dual-islands__island s003-dual-islands__island--site" data-island="site">
      <button class="s003-dual-islands__toggle" type="button" data-island-toggle="site" aria-label="Galok site navigation" aria-pressed="false">
        <img class="s003-dual-islands__logo" src="/assets/galok-symbol.svg" alt="" aria-hidden="true">
      </button>
      <nav class="s003-dual-islands__content" aria-label="Galok site">
        <span class="s003-dual-islands__site-brand" aria-hidden="true"><img src="/assets/galok-symbol.svg" alt=""></span>
        <div class="s003-dual-islands__site-links">
          <a class="s003-dual-islands__site-link" href="/cities/">Cities</a>
          <a class="s003-dual-islands__site-link" href="/research/" aria-current="page">Research</a>
          <a class="s003-dual-islands__site-link" href="/essays/">Essays</a>
          <a class="s003-dual-islands__site-link" href="/reading/">Reading</a>
          <a class="s003-dual-islands__site-link" href="/radar/">Radar</a>
          <a class="s003-dual-islands__site-link s003-dual-islands__more" href="/index/" aria-label="Open full Galok index">•••</a>
        </div>
      </nav>
    </div>`;

  document.body.appendChild(root);

  const tocTrack = root.querySelector('[data-island-toc]');
  const articleToggle = root.querySelector('[data-island-toggle="article"]');
  const siteToggle = root.querySelector('[data-island-toggle="site"]');
  const articleIsland = root.querySelector('[data-island="article"]');
  const siteIsland = root.querySelector('[data-island="site"]');

  sourceLinks.forEach((source) => {
    const id = source.dataset.tocLink || source.getAttribute('href')?.replace(/^#/, '');
    if (!id) return;
    const link = document.createElement('a');
    link.className = 's003-dual-islands__toc-link';
    link.href = `#${id}`;
    link.dataset.target = id;
    link.textContent = compactLabels[id] || source.textContent.trim();
    link.title = source.textContent.trim();
    link.addEventListener('click', (event) => {
      const target = document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      history.replaceState(null, '', `#${id}`);
    });
    tocTrack.appendChild(link);
  });

  const tocLinks = [...tocTrack.querySelectorAll('.s003-dual-islands__toc-link')];
  const more = document.createElement('button');
  more.type = 'button';
  more.className = 's003-dual-islands__more';
  more.textContent = '•••';
  more.setAttribute('aria-label', 'Show later sections');
  more.addEventListener('click', () => {
    tocTrack.scrollBy({ left: Math.max(180, tocTrack.clientWidth * .72), behavior: 'smooth' });
  });
  tocTrack.appendChild(more);

  const setMode = (mode, focus = false) => {
    if (mode !== 'reading' && mode !== 'site') return;
    root.dataset.mode = mode;
    articleToggle.setAttribute('aria-pressed', String(mode === 'reading'));
    siteToggle.setAttribute('aria-pressed', String(mode === 'site'));
    articleIsland.setAttribute('aria-expanded', String(mode === 'reading'));
    siteIsland.setAttribute('aria-expanded', String(mode === 'site'));
    if (focus) (mode === 'reading' ? articleToggle : siteToggle).focus({ preventScroll: true });
  };

  articleToggle.addEventListener('click', () => {
    if (root.dataset.mode === 'site') setMode('reading');
  });

  siteToggle.addEventListener('click', () => {
    if (root.dataset.mode === 'reading') setMode('site');
  });

  root.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && root.dataset.mode === 'site') {
      event.preventDefault();
      setMode('reading', true);
    }
  });

  let sections = [];
  let activeId = '';
  let raf = 0;

  const collectSections = () => {
    sections = tocLinks
      .map((link) => ({ id: link.dataset.target, element: document.getElementById(link.dataset.target), link }))
      .filter((item) => item.element);
    updateCurrent(true);
  };

  const updateCurrent = (instant = false) => {
    raf = 0;
    if (!sections.length) return;
    const marker = Math.min(190, window.innerHeight * .24);
    let current = sections[0];
    for (const item of sections) {
      if (item.element.getBoundingClientRect().top <= marker) current = item;
      else break;
    }
    if (!current || activeId === current.id) return;
    activeId = current.id;
    tocLinks.forEach((link) => link.classList.toggle('is-current', link.dataset.target === activeId));
    if (root.dataset.mode === 'reading') {
      current.link.scrollIntoView({ behavior: instant || matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  const scheduleCurrent = () => {
    if (!raf) raf = requestAnimationFrame(() => updateCurrent(false));
  };

  window.addEventListener('scroll', scheduleCurrent, { passive: true });
  window.addEventListener('resize', scheduleCurrent, { passive: true });

  const manuscript = document.querySelector('[data-research-manuscript]');
  if (manuscript) {
    const observer = new MutationObserver(() => {
      if (manuscript.querySelector('h2, [id]')) collectSections();
    });
    observer.observe(manuscript, { childList: true, subtree: true });
  }

  collectSections();
  setMode('reading');
})();
