(() => {
  if (window.__galokDongjingHookSidebar) return;
  window.__galokDongjingHookSidebar = true;

  const isDongjingEntry =
    document.body?.classList.contains('dongjing-page') &&
    /^\/reading\/dongjing-meng-hua-lu\/\d{2}\/?$/.test(window.location.pathname);
  if (!isDongjingEntry) return;

  const entryBody = Array.from(document.querySelectorAll('.dj-entry-body')).find(
    (node) => node.querySelector('.dj-entry-side') && node.querySelector('.dj-prose'),
  );
  if (!entryBody) return;

  const legacy = entryBody.querySelector(':scope > .dj-entry-side') || entryBody.querySelector('.dj-entry-side');
  let sidebar = entryBody.querySelector(':scope > [data-hook-sidebar]') || document.querySelector('[data-hook-sidebar]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pageMatch = window.location.pathname.match(/\/dongjing-meng-hua-lu\/(\d{2})\/?$/);
  const pageNumber = pageMatch?.[1] || '00';
  const CORNER = 12;

  const cleanText = (value = '') =>
    value
      .replace(/[↗↓↑]/g, ' ')
      .replace(/[←→]/g, ' · ')
      .replace(/^\s*\d+\s*[.)]\s*/, '')
      .replace(/\s+/g, ' ')
      .replace(/(?:\s*·\s*){2,}/g, ' · ')
      .trim();

  const shorten = (value, max = 46) => {
    const text = cleanText(value);
    if (text.length <= max) return text;
    const cut = text.slice(0, max - 1).replace(/\s+\S*$/, '').trim();
    return `${cut || text.slice(0, max - 1)}…`;
  };

  const ensureId = (node, fallbackIndex) => {
    if (node.id) return node.id;
    const seed = cleanText(node.textContent || '')
      .toLowerCase()
      .replace(/[^a-z0-9\u3400-\u9fff]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 44);
    let id = `entry-${pageNumber}-${seed || `section-${fallbackIndex + 1}`}`;
    let suffix = 2;
    while (document.getElementById(id)) id = `entry-${pageNumber}-${seed || `section-${fallbackIndex + 1}`}-${suffix++}`;
    node.id = id;
    return id;
  };

  const documentOrder = (a, b) => {
    if (a === b) return 0;
    const relation = a.compareDocumentPosition(b);
    if (relation & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
    if (relation & Node.DOCUMENT_POSITION_PRECEDING) return 1;
    return 0;
  };

  const collectItems = () => {
    const candidates = [];
    const seen = new Set();

    const add = (target, label, source) => {
      if (!target || !document.documentElement.contains(target)) return;
      const id = ensureId(target, candidates.length);
      if (seen.has(id)) return;
      seen.add(id);
      candidates.push({ target, id, label: shorten(label), source });
    };

    entryBody.querySelectorAll('.dj-prose h2').forEach((heading, index) => {
      add(heading, heading.textContent || `Section ${index + 1}`, 'heading');
    });

    legacy?.querySelectorAll('a[href^="#"]').forEach((link) => {
      const raw = link.getAttribute('href') || '';
      const id = raw.slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      add(target, link.textContent || id, 'legacy');
    });

    candidates.sort((a, b) => documentOrder(a.target, b.target));
    return candidates;
  };

  const makeRail = (kind) => {
    const rail = document.createElement('span');
    rail.className = `dj-hook-sidebar__rail${kind === 'hover' ? ' dj-hook-sidebar__rail--hover' : ''}`;
    rail.dataset.hookRail = kind;
    rail.setAttribute('aria-hidden', 'true');
    rail.innerHTML = '<span class="dj-hook-sidebar__stem"></span><span class="dj-hook-sidebar__corner"></span>';
    return rail;
  };

  const buildSidebar = () => {
    const items = collectItems();
    if (!items.length) return null;

    const aside = document.createElement('aside');
    aside.className = 'dj-hook-sidebar dj-hook-sidebar--auto';
    aside.dataset.hookSidebar = '';
    aside.setAttribute('aria-label', `Entry ${pageNumber} contents`);

    const head = document.createElement('div');
    head.className = 'dj-hook-sidebar__head';
    const title = document.createElement('p');
    const legacyTitle = legacy?.querySelector('p')?.textContent?.trim();
    const chineseTitle = document.querySelector('.dj-title-zh')?.textContent?.trim();
    title.textContent = legacyTitle || `${pageNumber} / ${chineseTitle || '東京夢華錄'}`;
    const subtitle = document.createElement('span');
    subtitle.textContent = 'Entry contents';
    head.append(title, subtitle);

    const nav = document.createElement('nav');
    nav.className = 'dj-hook-sidebar__list';
    nav.dataset.hookList = '';
    nav.setAttribute('aria-label', 'Sections');
    nav.append(makeRail('hover'), makeRail('active'));

    items.forEach((item, index) => {
      item.target.dataset.hookSection = '';
      const link = document.createElement('a');
      link.className = 'dj-hook-sidebar__item';
      link.href = `#${item.id}`;
      link.dataset.hookItem = '';
      link.dataset.hookTarget = item.id;
      link.dataset.active = index === 0 ? 'true' : 'false';

      const number = document.createElement('span');
      number.className = 'dj-hook-sidebar__index';
      number.textContent = String(index + 1).padStart(2, '0');

      const label = document.createElement('span');
      label.className = 'dj-hook-sidebar__label';
      label.textContent = item.label || `Section ${index + 1}`;
      link.append(number, label);
      nav.append(link);
    });

    const back = document.createElement('a');
    back.className = 'dj-hook-sidebar__back';
    back.href = '/reading/dongjing-meng-hua-lu/';
    back.textContent = '← READING ROOM';

    aside.append(head, nav, back);
    return aside;
  };

  if (!sidebar) {
    sidebar = buildSidebar();
    if (!sidebar) return;
    legacy?.classList.add('dj-entry-side--legacy');
    if (legacy) legacy.insertAdjacentElement('afterend', sidebar);
    else entryBody.prepend(sidebar);
  } else {
    sidebar.classList.add('dj-hook-sidebar--manual');
    legacy?.classList.add('dj-entry-side--legacy');
  }

  const assignGrid = () => {
    entryBody.classList.add('dj-hook-grid');
    const children = Array.from(entryBody.children).filter(
      (child) => child !== sidebar && child !== legacy,
    );

    children.forEach((child) => {
      child.classList.remove('dj-hook-grid-prose', 'dj-hook-grid-notes', 'dj-hook-grid-wide', 'dj-hook-grid-skip');
      child.style.removeProperty('--hook-grid-row');
    });

    let row = 1;
    for (let index = 0; index < children.length; index += 1) {
      const child = children[index];
      const emptySpacer =
        child.getAttribute('aria-hidden') === 'true' &&
        !child.textContent?.trim() &&
        child.children.length === 0;

      if (emptySpacer) {
        child.classList.add('dj-hook-grid-skip');
        continue;
      }

      if (child.classList.contains('dj-prose')) {
        child.classList.add('dj-hook-grid-prose');
        child.style.setProperty('--hook-grid-row', String(row));
        const next = children[index + 1];
        if (next?.classList.contains('dj-entry-notes')) {
          next.classList.add('dj-hook-grid-notes');
          next.style.setProperty('--hook-grid-row', String(row));
          index += 1;
        }
        row += 1;
        continue;
      }

      if (child.classList.contains('dj-entry-notes')) {
        child.classList.add('dj-hook-grid-notes');
        child.style.setProperty('--hook-grid-row', String(row));
        row += 1;
        continue;
      }

      child.classList.add('dj-hook-grid-wide');
      child.style.setProperty('--hook-grid-row', String(row));
      row += 1;
    }

    sidebar.style.setProperty('--hook-row-span', String(Math.max(1, row - 1)));
  };

  assignGrid();
  document.body.classList.add('dj-hook-pilot');

  const list = sidebar.querySelector('[data-hook-list]');
  const items = Array.from(sidebar.querySelectorAll('[data-hook-item]'));
  const activeRail = sidebar.querySelector('[data-hook-rail="active"]');
  const hoverRail = sidebar.querySelector('[data-hook-rail="hover"]');
  if (!list || !items.length || !activeRail) return;

  const sections = items.map((item) => document.getElementById(item.dataset.hookTarget || ''));
  sections.forEach((section) => {
    if (section) section.dataset.hookSection = '';
  });

  const hashIndex = items.findIndex((item) => item.getAttribute('href') === window.location.hash);
  let activeIndex = hashIndex >= 0 ? hashIndex : 0;
  let hoverIndex = null;
  let raf = 0;

  const centerOf = (index) => {
    const item = items[index];
    if (!item) return null;
    return item.offsetTop + item.offsetHeight / 2;
  };

  const placeRail = (rail, from, y, visible) => {
    if (!rail || y === null) return;
    const stem = rail.querySelector('.dj-hook-sidebar__stem');
    const corner = rail.querySelector('.dj-hook-sidebar__corner');
    if (!stem || !corner) return;

    const cornerTop = Math.max(0, y - CORNER);
    const stemTop = Math.max(0, from);
    stem.style.top = `${stemTop}px`;
    stem.style.height = `${Math.max(0, cornerTop - stemTop)}px`;
    corner.style.top = `${cornerTop}px`;
    rail.classList.toggle('is-visible', Boolean(visible));
  };

  const keepActiveVisible = () => {
    if (sidebar.scrollHeight <= sidebar.clientHeight + 2) return;
    const item = items[activeIndex];
    if (!item) return;
    const box = sidebar.getBoundingClientRect();
    const rect = item.getBoundingClientRect();
    const topGuard = box.top + 68;
    const bottomGuard = box.bottom - 54;
    if (rect.top < topGuard) sidebar.scrollBy({ top: rect.top - topGuard, behavior: 'auto' });
    else if (rect.bottom > bottomGuard) sidebar.scrollBy({ top: rect.bottom - bottomGuard, behavior: 'auto' });
  };

  const render = () => {
    const activeY = centerOf(activeIndex);
    placeRail(activeRail, 0, activeY, activeY !== null);

    items.forEach((item, index) => {
      const isActive = index === activeIndex;
      item.dataset.active = isActive ? 'true' : 'false';
      if (isActive) item.setAttribute('aria-current', 'location');
      else item.removeAttribute('aria-current');
    });

    if (hoverIndex === null || hoverIndex === activeIndex) {
      hoverRail?.classList.remove('is-visible');
      return;
    }

    const hoverY = centerOf(hoverIndex);
    if (hoverY === null || activeY === null) return;
    const hoverFrom = hoverY <= activeY ? Math.max(0, hoverY - CORNER) : activeY;
    placeRail(hoverRail, hoverFrom, hoverY, true);
  };

  const setActive = (index, keepVisible = true) => {
    if (index < 0 || index >= items.length) return;
    if (index !== activeIndex) activeIndex = index;
    render();
    if (keepVisible) keepActiveVisible();
  };

  const syncFromScroll = () => {
    raf = 0;
    const threshold = Math.max(140, Math.min(220, window.innerHeight * 0.28));
    let next = 0;

    sections.forEach((section, index) => {
      if (section && section.getBoundingClientRect().top <= threshold) next = index;
    });

    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 3;
    if (atBottom) next = items.length - 1;
    setActive(next);
  };

  const requestScrollSync = () => {
    if (raf) return;
    raf = window.requestAnimationFrame(syncFromScroll);
  };

  items.forEach((item, index) => {
    item.addEventListener('mouseenter', () => {
      hoverIndex = index;
      render();
    });

    item.addEventListener('focus', () => {
      hoverIndex = index;
      render();
    });

    item.addEventListener('click', (event) => {
      const target = sections[index];
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({
        behavior: reducedMotion.matches ? 'auto' : 'smooth',
        block: 'start',
      });
      history.replaceState(null, '', `#${target.id}`);
      setActive(index);
    });
  });

  list.addEventListener('mouseleave', () => {
    hoverIndex = null;
    render();
  });

  list.addEventListener('focusout', (event) => {
    if (event.relatedTarget && list.contains(event.relatedTarget)) return;
    hoverIndex = null;
    render();
  });

  window.addEventListener('scroll', requestScrollSync, { passive: true });
  window.addEventListener('resize', () => {
    assignGrid();
    render();
  }, { passive: true });
  window.addEventListener('hashchange', () => {
    const index = items.findIndex((item) => item.getAttribute('href') === window.location.hash);
    if (index >= 0) setActive(index);
  });

  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(render);
    observer.observe(list);
  }

  if (document.fonts?.ready) document.fonts.ready.then(render);
  reducedMotion.addEventListener?.('change', render);

  syncFromScroll();
  render();
})();
