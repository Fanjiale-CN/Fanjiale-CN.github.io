(() => {
  const input = document.querySelector('[data-data-search]');
  const cards = [...document.querySelectorAll('[data-series]')];
  const buttons = [...document.querySelectorAll('[data-data-filter]')];
  const empty = document.querySelector('[data-data-empty]');
  if (!input || !cards.length) return;
  let category = 'all';
  const apply = () => {
    const q = input.value.trim().toLowerCase();
    let shown = 0;
    cards.forEach((card) => {
      const categoryMatch = category === 'all' || card.dataset.category === category;
      const searchMatch = !q || (card.dataset.searchText || card.textContent).toLowerCase().includes(q);
      card.hidden = !(categoryMatch && searchMatch);
      if (!card.hidden) shown += 1;
    });
    if (empty) empty.hidden = shown !== 0;
  };
  input.addEventListener('input', apply);
  buttons.forEach((button) => button.addEventListener('click', () => {
    category = button.dataset.dataFilter || 'all';
    buttons.forEach((item) => {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    apply();
  }));
})();
