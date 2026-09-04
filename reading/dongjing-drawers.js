(() => {
  const archive = document.querySelector('[data-volume-archive-static], [data-volume-archive]');
  if (!archive) return;

  const drawers = [...archive.querySelectorAll('details[data-volume-drawer]')];
  if (!drawers.length) return;

  function openOnly(target, { updateHash = true } = {}) {
    drawers.forEach((drawer) => { drawer.open = drawer === target; });
    if (updateHash && target?.id) history.replaceState(null, '', `#${target.id}`);
  }

  drawers.forEach((drawer) => {
    drawer.addEventListener('toggle', () => {
      if (drawer.open) openOnly(drawer);
    });
  });

  function restoreFromHash() {
    const id = location.hash.slice(1);
    const target = drawers.find((drawer) => drawer.id === id);
    if (target) {
      openOnly(target, { updateHash: false });
      return;
    }
    const current = drawers.find((drawer) => drawer.open) || drawers.find((drawer) => drawer.classList.contains('is-current')) || drawers[0];
    if (current) openOnly(current, { updateHash: false });
  }

  window.addEventListener('hashchange', restoreFromHash);
  restoreFromHash();
})();