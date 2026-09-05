(() => {
  document.documentElement.classList.add('djx-js');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveal = [...document.querySelectorAll('[data-djx-reveal]')];
  if (reduce || !('IntersectionObserver' in window)) {
    reveal.forEach((el) => el.classList.add('is-visible'));
  } else {
    const ro = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => { if (!e.isIntersecting) return; e.target.classList.add('is-visible'); obs.unobserve(e.target); });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    reveal.forEach((el) => ro.observe(el));
  }
  const groups = [
    ['.dj45-page', '[data-dj45-envoy]'],
    ['.dj47-page', '[data-dj47-mach]'],
    ['.dj48-page', '[data-dj48-order]'],
    ['.dj50-page', '[data-dj50-signal]'],
    ['.dj51-page', '[data-dj51-map]']
  ];
  for (const [pageScope, itemScope] of groups) {
    const root = document.querySelector(pageScope);
    if (!root) continue;
    const items = [...root.querySelectorAll(itemScope)];
    if (!items.length) continue;
    if ('IntersectionObserver' in window && !reduce) {
      const obs = new IntersectionObserver((entries) => {
        const v = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!v) return;
        items.forEach((item) => item.classList.toggle('is-active', item === v.target));
      }, { rootMargin: '-30% 0px -40% 0px', threshold: [0.1, 0.4] });
      items.forEach((item) => obs.observe(item));
    } else {
      items.forEach((item) => item.classList.add('is-active'));
    }
  }
})();
