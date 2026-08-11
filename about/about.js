(function () {
  const root = document.documentElement;
  const page = document.body;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  root.classList.add('about-js');
  window.requestAnimationFrame(() => page.classList.add('about-ready'));

  const revealItems = Array.from(document.querySelectorAll('[data-reveal]'));
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  const rail = document.querySelector('[data-selection-rail]');
  const previousButton = document.querySelector('[data-rail-prev]');
  const nextButton = document.querySelector('[data-rail-next]');

  if (rail && previousButton && nextButton) {
    const railStep = () => {
      const entry = rail.querySelector('.about-entry');
      if (!entry) return rail.clientWidth * 0.75;
      const style = window.getComputedStyle(rail);
      const gap = parseFloat(style.columnGap || style.gap) || 0;
      return entry.getBoundingClientRect().width + gap;
    };

    const moveRail = (direction) => {
      rail.scrollBy({ left: direction * railStep(), behavior: reduceMotion ? 'auto' : 'smooth' });
    };

    const updateRailButtons = () => {
      previousButton.disabled = rail.scrollLeft <= 4;
      nextButton.disabled = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 4;
    };

    previousButton.addEventListener('click', () => moveRail(-1));
    nextButton.addEventListener('click', () => moveRail(1));
    rail.addEventListener('scroll', updateRailButtons, { passive: true });
    window.addEventListener('resize', updateRailButtons);
    rail.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); moveRail(-1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); moveRail(1); }
    });

    let pointerStart = 0;
    let scrollStart = 0;
    let dragging = false;
    let draggedDistance = 0;

    rail.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'touch') return;
      dragging = true;
      pointerStart = event.clientX;
      scrollStart = rail.scrollLeft;
      draggedDistance = 0;
      rail.classList.add('is-dragging');
      rail.setPointerCapture(event.pointerId);
    });
    rail.addEventListener('pointermove', (event) => {
      if (!dragging) return;
      draggedDistance = Math.max(draggedDistance, Math.abs(event.clientX - pointerStart));
      rail.scrollLeft = scrollStart - (event.clientX - pointerStart);
    });
    const stopDragging = (event) => {
      if (!dragging) return;
      dragging = false;
      rail.classList.remove('is-dragging');
      if (rail.hasPointerCapture(event.pointerId)) rail.releasePointerCapture(event.pointerId);
    };
    rail.addEventListener('pointerup', stopDragging);
    rail.addEventListener('pointercancel', stopDragging);
    rail.addEventListener('click', (event) => {
      if (draggedDistance <= 8) return;
      event.preventDefault();
      event.stopPropagation();
      draggedDistance = 0;
    }, true);
    updateRailButtons();
  }

  const methodSteps = Array.from(document.querySelectorAll('[data-method-step]'));
  const methodImages = Array.from(document.querySelectorAll('[data-method-image]'));
  const methodCount = document.querySelector('.about-method-count');

  const activateMethod = (index) => {
    methodSteps.forEach((step, stepIndex) => {
      const active = stepIndex === index;
      step.classList.toggle('is-active', active);
      step.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    methodImages.forEach((image, imageIndex) => image.classList.toggle('is-active', imageIndex === index));
    if (methodCount) methodCount.textContent = String(index + 1).padStart(2, '0');
  };

  methodSteps.forEach((step, index) => {
    step.addEventListener('click', () => activateMethod(index));
    step.addEventListener('focus', () => activateMethod(index));
    step.addEventListener('pointerenter', () => activateMethod(index));
  });

  if (!reduceMotion && 'IntersectionObserver' in window) {
    const methodObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      activateMethod(Number(visible.target.dataset.methodStep));
    }, { threshold: [0.35, 0.55, 0.75], rootMargin: '-18% 0px -30% 0px' });
    methodSteps.forEach((step) => methodObserver.observe(step));
  }
})();
