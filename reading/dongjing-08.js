(() => {
  const fontFix = document.createElement('link');
  fontFix.rel = 'stylesheet';
  fontFix.href = '/reading/dongjing-08-fontfix.css?v=20260831a';
  document.head.append(fontFix);

  const sections = [...document.querySelectorAll('[data-corridor-focus]')];
  const nodes = [...document.querySelectorAll('[data-corridor-node]')];
  if (!sections.length || !nodes.length) return;

  function activate(key) {
    nodes.forEach((node) => node.classList.toggle('is-active', node.dataset.corridorNode === key));
  }

  activate(sections[0].dataset.corridorFocus);

  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) activate(visible.target.dataset.corridorFocus);
  }, { rootMargin: '-24% 0px -52% 0px', threshold: [0.08, 0.22, 0.45] });

  sections.forEach((section) => observer.observe(section));
})();
