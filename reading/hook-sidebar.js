(() => {
  const sidebar = document.querySelector('[data-hook-sidebar]');
  if (!sidebar) return;

  const list = sidebar.querySelector('[data-hook-list]');
  const items = Array.from(sidebar.querySelectorAll('[data-hook-item]'));
  const activeRail = sidebar.querySelector('[data-hook-rail="active"]');
  const hoverRail = sidebar.querySelector('[data-hook-rail="hover"]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const CORNER = 12;

  if (!list || !items.length || !activeRail) return;

  const sections = items.map((item) => document.getElementById(item.dataset.hookTarget || ''));
  let activeIndex = 0;
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

  const setActive = (index) => {
    if (index < 0 || index >= items.length || index === activeIndex) return;
    activeIndex = index;
    render();
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
  window.addEventListener('resize', render, { passive: true });

  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(render);
    observer.observe(list);
  }

  if (document.fonts?.ready) document.fonts.ready.then(render);
  reducedMotion.addEventListener?.('change', render);

  syncFromScroll();
  render();
})();
