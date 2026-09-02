(() => {
  const translations = {
    court: 'Before Xuande Tower … near the east side were the eight seats of the two administrations; on the west was the Department of State Affairs.',
    institutions: 'From in front of the imperial palace the Imperial Avenue ran south; Jingling East Palace stood to the left and the West Palace to the right.',
    market: 'Farther south were the Tang family gold-and-silver shop, a Wenzhou lacquerware and sundries shop, and Daxiangguo Monastery.',
    diplomacy: 'On the north side of the street was the Duting Relay Hostel … directly opposite stood the Liang family pearl shop.',
    street: 'The Imperial Avenue continued straight south, crossed Zhouqiao, and on both sides were residential households.'
  };

  const sections = [...document.querySelectorAll('[data-corridor-focus]')];
  sections.forEach((section) => {
    const key = section.dataset.corridorFocus;
    const source = section.querySelector('.dj08-source-line');
    if (!source || !translations[key] || section.querySelector('.dj08-working-translation')) return;
    const block = document.createElement('div');
    block.className = 'dj-translation dj08-working-translation';
    block.innerHTML = `<small>WORKING TRANSLATION</small><p>${translations[key]}</p>`;
    source.insertAdjacentElement('afterend', block);
  });

  const footer = document.querySelector('.dj-footer');
  if (footer) {
    const first = footer.firstElementChild;
    if (first && !first.matches('a')) {
      const link = document.createElement('a');
      link.href = '/reading/dongjing-meng-hua-lu/07/';
      link.textContent = '← 07 IMPERIAL AVENUE';
      first.replaceWith(link);
    }
  }

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
