(() => {
  const fontPatch = document.createElement('style');
  fontPatch.textContent = `@font-face{font-family:"Galok Entry22-25 Rare";src:url("/assets/fonts/entry22-25-serif-patch.woff2?v=20260903") format("woff2");font-style:normal;font-weight:400;font-display:swap}.dongjing-page.djx-page :where(:lang(zh-Hans),:lang(zh-Hant)){font-family:"Galok Source Han Serif TC","Galok Entry22-25 Rare","Galok HanaMin Reading","Source Han Serif TC","Noto Serif TC","Songti TC",STSong,serif!important;font-weight:400!important;font-synthesis:none!important}`;
  document.head.append(fontPatch);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveal = [...document.querySelectorAll('[data-djx-reveal]')];

  if (reduce || !('IntersectionObserver' in window)) {
    reveal.forEach((el) => el.classList.add('is-visible'));
    document.querySelectorAll('[data-djx-path]').forEach((el) => el.classList.add('is-active'));
    document.querySelectorAll('[data-djx-node]').forEach((el) => el.classList.add('is-active'));
    document.querySelectorAll('.dj25-signal > i').forEach((el) => el.classList.add('is-active'));
    return;
  }

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
  reveal.forEach((el) => revealObserver.observe(el));

  const paths = [...document.querySelectorAll('[data-djx-path]')];
  if (paths.length) {
    const pathObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.target.classList.toggle('is-active', entry.isIntersecting));
    }, { threshold: 0.45 });
    paths.forEach((el) => pathObserver.observe(el));
  }

  const network = document.querySelector('[data-djx-signal]');
  if (network) {
    const nodes = [...network.querySelectorAll('[data-djx-node]')];
    const links = [...network.querySelectorAll(':scope > i')];
    const networkObserver = new IntersectionObserver((entries, observer) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      nodes.forEach((node, index) => {
        window.setTimeout(() => {
          node.classList.add('is-active');
          if (links[index - 1]) links[index - 1].classList.add('is-active');
        }, index * 120);
      });
      observer.disconnect();
    }, { threshold: 0.35 });
    networkObserver.observe(network);
  }
})();
