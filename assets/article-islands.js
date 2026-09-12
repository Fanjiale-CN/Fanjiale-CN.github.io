(() => {
  'use strict';

  if (document.querySelector('[data-galok-article-islands]')) return;

  const body = document.body;
  const route = location.pathname.replace(/index\.html$/, '');
  const parts = route.split('/').filter(Boolean);
  const isEssay = parts[0] === 'essays' && parts.length >= 2;
  const isResearch = parts[0] === 'research' && parts.length >= 2;
  const isReading = parts[0] === 'reading' && parts.length >= 3;
  if (!isEssay && !isResearch && !isReading) return;

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const slug = (value) => String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
    .replace(/(^-|-$)/g, '') || `section-${Math.random().toString(36).slice(2,8)}`;

  const collectFromExistingNav = () => {
    const selectors = [
      '.batch-chapter-nav a[href^="#"]',
      '.research-paper-toc a[href^="#"]',
      '.research-mobile-toc a[href^="#"]',
      '.research-wave-toc a[href^="#"]',
      '[data-hook-list] a[href^="#"]'
    ];
    const seen = new Set();
    const items = [];
    selectors.flatMap((selector) => [...document.querySelectorAll(selector)]).forEach((link) => {
      const href = link.getAttribute('href');
      if (!href || seen.has(href)) return;
      const target = document.querySelector(href);
      if (!target) return;
      seen.add(href);
      items.push({ id: href.slice(1), label: link.textContent.trim().replace(/^\d+[.)\s/-]*/, ''), target });
    });
    return items;
  };

  const collectFromHeadings = () => {
    const roots = [
      document.querySelector('.article-content'),
      document.querySelector('.batch-article-content'),
      document.querySelector('.research-manuscript'),
      document.querySelector('.reading-article-body'),
      document.querySelector('main article')
    ].filter(Boolean);
    const root = roots[0] || document.querySelector('main');
    if (!root) return [];

    return [...root.querySelectorAll('h2')].map((heading, index) => {
      if (!heading.id) heading.id = `${slug(heading.textContent)}-${index + 1}`;
      return { id: heading.id, label: heading.textContent.trim(), target: heading };
    });
  };

  let sections = collectFromExistingNav();
  if (sections.length < 2) sections = collectFromHeadings();
  if (!sections.length) return;

  const shell = document.createElement('div');
  shell.className = 'galok-article-islands';
  shell.dataset.galokArticleIslands = '';
  shell.innerHTML = `
    <section class="galok-article-island galok-article-island--toc" data-island="toc" aria-label="Article contents">
      <button class="galok-island-trigger" type="button" data-island-toggle="toc" aria-expanded="false">
        <span class="galok-island-index" data-island-index>01</span>
        <span class="galok-island-current"><small>ARTICLE / CONTENTS</small><strong data-island-current></strong></span>
        <span class="galok-island-progress" aria-hidden="true"></span>
      </button>
      <div class="galok-island-panel galok-island-panel--toc" data-island-panel="toc"></div>
    </section>
    <section class="galok-article-island galok-article-island--site" data-island="site" aria-label="Galok navigation">
      <button class="galok-island-trigger" type="button" data-island-toggle="site" aria-expanded="false" aria-label="Open Galok navigation">
        <img class="galok-island-site-logo" src="/assets/galok-symbol.svg" alt="" aria-hidden="true">
      </button>
      <div class="galok-island-panel galok-island-panel--site" data-island-panel="site">
        <div class="galok-island-site-head"><img src="/assets/galok-symbol.svg" alt="" aria-hidden="true"><div><strong>GALOK</strong><small>Visual research & publishing</small></div></div>
        <nav class="galok-island-site-grid" aria-label="Galok sections">
          <a href="/"><small>00</small><strong>Home</strong></a>
          <a href="/research/"><small>01</small><strong>Research</strong></a>
          <a href="/cities/"><small>02</small><strong>Cities</strong></a>
          <a href="/essays/"><small>03</small><strong>Essays</strong></a>
          <a href="/reading/"><small>04</small><strong>Reading</strong></a>
          <a href="/radar/"><small>05</small><strong>Radar</strong></a>
          <a href="/press-print/"><small>06</small><strong>Press Print</strong></a>
          <a href="/work/"><small>07</small><strong>Work</strong></a>
          <a href="/about/"><small>08</small><strong>About</strong></a>
        </nav>
      </div>
    </section>`;

  document.body.append(shell);
  body.classList.add('galok-article-islands-ready');

  const tocIsland = shell.querySelector('[data-island="toc"]');
  const siteIsland = shell.querySelector('[data-island="site"]');
  const tocToggle = shell.querySelector('[data-island-toggle="toc"]');
  const siteToggle = shell.querySelector('[data-island-toggle="site"]');
  const tocPanel = shell.querySelector('[data-island-panel="toc"]');
  const currentLabel = shell.querySelector('[data-island-current]');
  const currentIndex = shell.querySelector('[data-island-index]');

  tocPanel.innerHTML = sections.map((section, index) => `
    <button class="galok-island-toc-link" type="button" data-island-section="${section.id}">
      <span>${String(index + 1).padStart(2, '0')}</span><span>${section.label}</span>
    </button>`).join('');

  const links = [...tocPanel.querySelectorAll('[data-island-section]')];
  let activeIndex = 0;

  const setOpen = (which, open) => {
    const island = which === 'toc' ? tocIsland : siteIsland;
    const other = which === 'toc' ? siteIsland : tocIsland;
    const toggle = which === 'toc' ? tocToggle : siteToggle;
    const otherToggle = which === 'toc' ? siteToggle : tocToggle;

    island.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      other.classList.remove('is-open');
      otherToggle.setAttribute('aria-expanded', 'false');
    }
  };

  tocToggle.addEventListener('click', () => setOpen('toc', !tocIsland.classList.contains('is-open')));
  siteToggle.addEventListener('click', () => setOpen('site', !siteIsland.classList.contains('is-open')));

  document.addEventListener('pointerdown', (event) => {
    if (!shell.contains(event.target)) {
      setOpen('toc', false);
      setOpen('site', false);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setOpen('toc', false);
      setOpen('site', false);
    }
  });

  const updateActive = () => {
    const marker = window.scrollY + Math.min(window.innerHeight * .34, 300);
    let next = 0;
    sections.forEach((section, index) => {
      const top = section.target.getBoundingClientRect().top + window.scrollY;
      if (marker >= top) next = index;
    });
    if (next !== activeIndex) activeIndex = next;

    const section = sections[activeIndex];
    currentLabel.textContent = section.label;
    currentIndex.textContent = String(activeIndex + 1).padStart(2, '0');
    links.forEach((link, index) => link.classList.toggle('is-current', index === activeIndex));

    const doc = document.documentElement;
    const max = Math.max(1, doc.scrollHeight - innerHeight);
    shell.style.setProperty('--galok-read-progress', String(Math.min(1, Math.max(0, scrollY / max))));
  };

  links.forEach((button, index) => {
    button.addEventListener('click', () => {
      const section = sections[index];
      section.target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      setOpen('toc', false);
      history.replaceState(null, '', `#${section.id}`);
      window.galokTrack?.('research_toc_use', { section: section.id });
    });
  });

  let frame = 0;
  const onScroll = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      updateActive();
    });
  };

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  updateActive();
})();
