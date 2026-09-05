(() => {
  document.documentElement.classList.add('djx-js');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveal = [...document.querySelectorAll('[data-djx-reveal]')];

  if (reduce || !('IntersectionObserver' in window)) {
    reveal.forEach((el) => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    reveal.forEach((el) => revealObserver.observe(el));
  }

  // Batch 35-39 — highlight the specimen currently in view. Each page marks its
  // panels with a data attribute; without IntersectionObserver (or under reduced
  // motion) every panel stays active and the pages remain fully readable.
  const groups = [
    ['.dj35-page', '[data-dj35-set]'],
    ['.dj36-page', '[data-dj36-house]'],
    ['.dj36-page', '[data-dj36-step]'],
    ['.dj37-page', '[data-dj37-cut]'],
    ['.dj38-page', '[data-dj38-step]']
  ];

  for (const [pageScope, itemScope] of groups) {
    const root = document.querySelector(pageScope);
    if (!root) continue;
    const items = [...root.querySelectorAll(itemScope)];
    if (!items.length) continue;
    if ('IntersectionObserver' in window && !reduce) {
      const observer = new IntersectionObserver((entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        items.forEach((item) => item.classList.toggle('is-active', item === visible.target));
      }, { rootMargin: '-30% 0px -40% 0px', threshold: [0.1, 0.4] });
      items.forEach((item) => observer.observe(item));
    } else {
      items.forEach((item) => item.classList.add('is-active'));
    }
  }
})();
