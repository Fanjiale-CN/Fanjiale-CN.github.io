(() => {
  const phases = [...document.querySelectorAll('[data-market-phase]')];
  const times = [...document.querySelectorAll('[data-market-time]')];
  if (!phases.length || !times.length) return;

  function activate(key) {
    times.forEach((item) => item.classList.toggle('is-active', item.dataset.marketTime === key));
  }

  activate(phases[0].dataset.marketPhase);

  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => {
    const active = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (active) activate(active.target.dataset.marketPhase);
  }, { rootMargin: '-22% 0px -48% 0px', threshold: [0.08, 0.2, 0.42] });

  phases.forEach((phase) => observer.observe(phase));
})();
