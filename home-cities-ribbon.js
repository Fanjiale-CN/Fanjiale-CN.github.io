(() => {
  const repairHref = '/home-cities-ribbon-repair.css?v=20260914a';
  if (!document.querySelector('link[href^="/home-cities-ribbon-repair.css"]')) {
    const repairLink = document.createElement('link');
    repairLink.rel = 'stylesheet';
    repairLink.href = repairHref;
    document.head.append(repairLink);
  }

  const root = document.querySelector('[data-city-ribbon]');
  if (!root) return;

  const track = root.querySelector('[data-city-ribbon-track]');
  const cards = [...root.querySelectorAll('[data-city-ribbon-card]')];
  const detailIndex = root.querySelector('[data-city-detail-index]');
  const detailName = root.querySelector('[data-city-detail-name]');
  const detailCopy = root.querySelector('[data-city-detail-copy]');
  const detailLink = root.querySelector('[data-city-detail-link]');
  const prev = root.querySelector('[data-city-prev]');
  const next = root.querySelector('[data-city-next]');
  const dots = [...root.querySelectorAll('[data-city-ribbon-dot]')];

  if (!track || !cards.length) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const mobile = matchMedia('(max-width: 700px)');
  let activeIndex = Math.max(0, cards.findIndex((card) => card.classList.contains('is-active')));
  let scrollRaf = 0;

  const updateDetail = (card, index) => {
    if (detailIndex) detailIndex.textContent = card.dataset.index || String(index + 1).padStart(2, '0');
    if (detailName) detailName.textContent = card.dataset.name || '';
    if (detailCopy) detailCopy.textContent = card.dataset.copy || '';
    if (detailLink) {
      detailLink.href = card.href;
      detailLink.textContent = `Open ${card.dataset.name || 'city'} ↗`;
      detailLink.setAttribute('aria-label', `Open ${card.dataset.name || 'city'} city story`);
    }
  };

  const scrollCardIntoTrack = (index, behavior = 'smooth') => {
    const card = cards[index];
    if (!card) return;
    track.scrollTo({
      left: Math.max(0, card.offsetLeft),
      behavior: reducedMotion.matches ? 'auto' : behavior
    });
  };

  const setActive = (index, options = {}) => {
    if (!Number.isInteger(index) || index < 0 || index >= cards.length) return;
    activeIndex = index;

    cards.forEach((card, cardIndex) => {
      const active = cardIndex === index;
      card.classList.toggle('is-active', active);
      card.dataset.active = active ? 'true' : 'false';
      card.setAttribute('aria-label', `${active ? 'Current city, ' : 'Preview '} ${card.dataset.name || 'city'}. ${active ? 'Open city story' : 'Select city'}`);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === index);
      dot.setAttribute('aria-current', dotIndex === index ? 'true' : 'false');
    });

    updateDetail(cards[index], index);

    if (prev) prev.disabled = index === 0;
    if (next) next.disabled = index === cards.length - 1;

    if (options.scroll && mobile.matches) scrollCardIntoTrack(index);
  };

  cards.forEach((card, index) => {
    card.addEventListener('pointerenter', () => {
      if (finePointer.matches && !mobile.matches) setActive(index);
    });

    card.addEventListener('focus', () => {
      if (!mobile.matches) setActive(index);
    });

    card.addEventListener('click', (event) => {
      if (index !== activeIndex) {
        event.preventDefault();
        setActive(index, { scroll: true });
      }
    });

    card.addEventListener('keydown', (event) => {
      let target = null;
      if (event.key === 'ArrowRight') target = Math.min(cards.length - 1, index + 1);
      if (event.key === 'ArrowLeft') target = Math.max(0, index - 1);
      if (event.key === 'Home') target = 0;
      if (event.key === 'End') target = cards.length - 1;
      if (target === null || target === index) return;
      event.preventDefault();
      setActive(target, { scroll: true });
      cards[target].focus({ preventScroll: true });
    });
  });

  prev?.addEventListener('click', () => {
    const target = Math.max(0, activeIndex - 1);
    setActive(target, { scroll: true });
    if (!mobile.matches) cards[target].focus({ preventScroll: true });
  });

  next?.addEventListener('click', () => {
    const target = Math.min(cards.length - 1, activeIndex + 1);
    setActive(target, { scroll: true });
    if (!mobile.matches) cards[target].focus({ preventScroll: true });
  });

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => setActive(index, { scroll: true }));
  });

  const syncMobileFromScroll = () => {
    scrollRaf = 0;
    if (!mobile.matches) return;
    const trackRect = track.getBoundingClientRect();
    let nearestIndex = activeIndex;
    let nearestDistance = Infinity;

    cards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const distance = Math.abs(rect.left - trackRect.left);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    if (nearestIndex !== activeIndex) setActive(nearestIndex);
  };

  track.addEventListener('scroll', () => {
    if (!scrollRaf) scrollRaf = requestAnimationFrame(syncMobileFromScroll);
  }, { passive: true });

  const onMobileChange = () => {
    setActive(activeIndex);
    if (mobile.matches) requestAnimationFrame(() => scrollCardIntoTrack(activeIndex, 'auto'));
  };

  if (typeof mobile.addEventListener === 'function') mobile.addEventListener('change', onMobileChange);
  else mobile.addListener(onMobileChange);

  setActive(activeIndex);
  if (mobile.matches) requestAnimationFrame(() => scrollCardIntoTrack(activeIndex, 'auto'));
})();
