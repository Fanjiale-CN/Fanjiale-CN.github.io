(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items = [...document.querySelectorAll('[data-dj-reveal], [data-dj12-node]')];
  if (!items.length) return;
  const reveal = (el, index = 0) => {
    if (el.dataset.djMotionDone === 'true') return;
    el.dataset.djMotionDone = 'true';
    if (reduce || !el.animate) return;
    el.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 220, delay: Math.min(index * 22, 88), easing: 'cubic-bezier(.2,.72,.2,1)', fill: 'both' });
  };
  if (!('IntersectionObserver' in window)) { items.forEach((el, index) => reveal(el, index)); return; }
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const index = items.indexOf(entry.target);
      reveal(entry.target, index < 0 ? 0 : index);
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
  items.forEach((el) => observer.observe(el));
})();
