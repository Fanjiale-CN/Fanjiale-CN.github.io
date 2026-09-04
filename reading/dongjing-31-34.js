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

  // Entry 31 — vehicle ladder: highlight the tier in view.
  const ladderRoot = document.querySelector('.dj31-page');
  if (ladderRoot) {
    const tiers = [...ladderRoot.querySelectorAll('[data-dj31-tier]')];
    if (tiers.length && 'IntersectionObserver' in window && !reduce) {
      const observer = new IntersectionObserver((entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        tiers.forEach((tier) => tier.classList.toggle('is-active', tier === visible.target));
      }, { rootMargin: '-30% 0px -40% 0px', threshold: [0.1, 0.4] });
      tiers.forEach((tier) => observer.observe(tier));
    } else {
      tiers.forEach((tier) => tier.classList.add('is-active'));
    }
  }

  // Entry 34 — service contract: highlight the clause in view.
  const contractRoot = document.querySelector('.dj34-page');
  if (contractRoot) {
    const clauses = [...contractRoot.querySelectorAll('[data-dj34-clause]')];
    if (clauses.length && 'IntersectionObserver' in window && !reduce) {
      const observer = new IntersectionObserver((entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        clauses.forEach((clause) => clause.classList.toggle('is-active', clause === visible.target));
      }, { rootMargin: '-30% 0px -40% 0px', threshold: [0.1, 0.4] });
      clauses.forEach((clause) => observer.observe(clause));
    } else {
      clauses.forEach((clause) => clause.classList.add('is-active'));
    }
  }
})();
