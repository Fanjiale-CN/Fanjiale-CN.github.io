(() => {
  const root = document.querySelector('.dj28-page');
  if (!root) return;

  const buttons = [...root.querySelectorAll('[data-dj28-filter]')];
  const cards = [...root.querySelectorAll('[data-dj28-capability]')];
  if (!buttons.length || !cards.length) return;

  const apply = (value) => {
    buttons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.dj28Filter === value));
    });
    cards.forEach((card) => {
      const groups = (card.dataset.dj28Capability || '').split(/\s+/).filter(Boolean);
      card.hidden = value !== 'all' && !groups.includes(value);
    });
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => apply(button.dataset.dj28Filter || 'all'));
  });

  apply('all');
})();
