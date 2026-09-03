(() => {
  const phases = [...document.querySelectorAll('[data-dj21-phase]')];
  const label = document.querySelector('[data-dj21-time-label]');
  if (!phases.length) return;

  const activate = (target) => {
    phases.forEach((phase) => phase.classList.toggle('is-active', phase === target));
    if (label) label.textContent = target?.dataset.time || '入夜';
  };

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    phases.forEach((phase) => phase.classList.add('is-active'));
    if (label) label.textContent = '三更 → 五更';
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) activate(visible.target);
  }, { threshold: [0.35, 0.55, 0.75], rootMargin: '-18% 0px -38% 0px' });

  phases.forEach((phase) => observer.observe(phase));
})();
