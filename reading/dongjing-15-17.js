(() => {
  if (document.body.classList.contains('dj19-page')) {
    const queued = document.querySelector('.dj-v3-entry-nav span');
    if (queued?.textContent.includes('20 / 上清宮')) {
      const link = document.createElement('a');
      link.href = '/reading/dongjing-meng-hua-lu/20/';
      link.innerHTML = '<small>NEXT</small><strong>20 / 上清宮</strong>';
      queued.replaceWith(link);
    }
    const status = document.querySelector('.dj19-exit em');
    if (status) status.textContent = 'LIVE / Continue to the citywide sacred network';
  }

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items = [...document.querySelectorAll('[data-dj-v3-reveal], [data-dj15-node], [data-dj16-node], [data-dj17-node]')];
  if (!items.length) return;
  const reveal = (el, index = 0) => {
    if (el.dataset.djV3MotionDone === 'true') return;
    el.dataset.djV3MotionDone = 'true';
    if (reduce || !el.animate) return;
    el.animate(
      [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 220, delay: Math.min(index * 18, 72), easing: 'cubic-bezier(.2,.72,.2,1)', fill: 'both' }
    );
  };
  if (!('IntersectionObserver' in window)) {
    items.forEach((el, index) => reveal(el, index));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const index = items.indexOf(entry.target);
      reveal(entry.target, index < 0 ? 0 : index);
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
  items.forEach((el) => observer.observe(el));
})();