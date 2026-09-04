(() => {
  const root = document.querySelector('.dj30-page');
  if (!root) return;

  const stages = [...root.querySelectorAll('[data-dj30-stage]')];
  const links = [...root.querySelectorAll('[data-dj30-link]')];
  if (!stages.length || !links.length) return;

  const activate = (index) => {
    stages.forEach((stage, i) => stage.classList.toggle('is-active', i === index));
    links.forEach((link, i) => {
      link.classList.toggle('is-active', i === index);
      if (i === index) link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
    });
  };

  activate(0);

  if (!('IntersectionObserver' in window)) {
    stages.forEach((stage) => stage.classList.add('is-active'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    const index = Number(visible.target.dataset.dj30Stage || 0);
    activate(index);
  }, { rootMargin: '-28% 0px -48% 0px', threshold: [0.15, 0.35, 0.6] });

  stages.forEach((stage) => observer.observe(stage));
})();
