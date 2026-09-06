(() => {
  const archive = document.querySelector('[data-volume-archive-static], [data-volume-archive]');
  if (!archive) return;

  const drawers = [...archive.querySelectorAll('details[data-volume-drawer]')];
  if (!drawers.length) return;

  function closeAll() {
    drawers.forEach((drawer) => { drawer.open = false; });
  }

  function openOnly(target, { updateHash = true } = {}) {
    drawers.forEach((drawer) => { drawer.open = drawer === target; });
    if (updateHash && target?.id) history.replaceState(null, '', `#${target.id}`);
  }

  drawers.forEach((drawer) => {
    drawer.addEventListener('toggle', () => {
      if (drawer.open) {
        openOnly(drawer);
        return;
      }
      if (location.hash === `#${drawer.id}`) {
        history.replaceState(null, '', `${location.pathname}${location.search}`);
      }
    });
  });

  function restoreFromHash() {
    const id = location.hash.slice(1);
    const target = drawers.find((drawer) => drawer.id === id);
    if (target) {
      openOnly(target, { updateHash: false });
      return;
    }
    closeAll();
  }

  window.addEventListener('hashchange', restoreFromHash);
  restoreFromHash();
})();
