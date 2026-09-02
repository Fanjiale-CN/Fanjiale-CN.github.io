(() => {
  const archive = document.querySelector('[data-volume-archive-static], [data-volume-archive]');
  if (!archive) return;

  const volume3 = archive.querySelector('#volume-3');
  if (volume3) {
    const progress = volume3.querySelector('.dj-drawer-progress');
    if (progress) progress.textContent = '6 / 13';

    const subtitle = volume3.querySelector('.dj-drawer-title small');
    if (subtitle) subtitle.textContent = 'IN PROGRESS / SPECIALISTS + STATE + ARRIVAL + TEMPLE + STREET + SACRED NETWORK';

    const intro = volume3.querySelector('.dj-drawer-panel-intro p');
    if (intro) intro.textContent = 'Volume III begins with medical specialization, the western government edge and arrivals, enters Xiangguo Temple as a periodic market, follows commerce beyond its east gate, then expands into a citywide sacred directory.';

    const queued20 = [...volume3.querySelectorAll('.dj-drawer-entry.is-queued')].find((entry) => entry.firstElementChild?.textContent.trim() === '20');
    if (queued20) {
      const link = document.createElement('a');
      link.className = 'dj-drawer-entry';
      link.href = '/reading/dongjing-meng-hua-lu/20/';
      link.innerHTML = '<span>20</span><span class="dj-drawer-entry-title"><strong>Shangqing Palace</strong><small lang="zh-Hant">上清宮</small></span><span class="dj-drawer-entry-note">A dispersed directory of religious institutions across gates, streets and lanes of the capital.</span><span class="dj-drawer-entry-state">LIVE</span><span class="dj-drawer-entry-time">≈ 16 MIN</span>';
      queued20.replaceWith(link);
    }
  }

  const archiveTitle = archive.querySelector('#archive-title');
  if (archiveTitle) archiveTitle.textContent = 'Ten volumes. Twenty entries live.';
  const archiveDeck = archiveTitle?.nextElementSibling;
  if (archiveDeck) archiveDeck.textContent = 'Volumes I–II establish the city frame and street economy. Volume III now opens the operating city: specialists, the government edge, arrivals, a temple market, the streets beyond its east gate and a citywide sacred network.';

  const roomFooter = document.querySelector('.dj-footer span');
  if (roomFooter?.textContent.includes('READING / 003 /')) roomFooter.textContent = 'READING / 003 / 20 OF 86 LIVE';

  const drawers = [...archive.querySelectorAll('details[data-volume-drawer]')];
  function openOnly(target, { updateHash = true } = {}) {
    drawers.forEach((drawer) => { drawer.open = drawer === target; });
    if (updateHash && target?.id) history.replaceState(null, '', `#${target.id}`);
  }
  drawers.forEach((drawer) => { drawer.addEventListener('toggle', () => { if (drawer.open) openOnly(drawer); }); });
  function restoreFromHash() {
    const id = location.hash.slice(1);
    const target = drawers.find((drawer) => drawer.id === id);
    if (target) { openOnly(target, { updateHash: false }); return; }
    const current = drawers.find((drawer) => drawer.open) || drawers.find((drawer) => drawer.classList.contains('is-current'));
    if (current) openOnly(current, { updateHash: false });
  }
  window.addEventListener('hashchange', restoreFromHash);
  restoreFromHash();
})();