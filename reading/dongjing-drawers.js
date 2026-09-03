(() => {
  const archive = document.querySelector('[data-volume-archive-static], [data-volume-archive]');
  if (!archive) return;

  const volume3 = archive.querySelector('#volume-3');
  if (volume3) {
    const progress = volume3.querySelector('.dj-drawer-progress');
    if (progress) progress.textContent = '7 / 13';

    const subtitle = volume3.querySelector('.dj-drawer-title small');
    if (subtitle) subtitle.textContent = 'IN PROGRESS / HOW THE CITY WORKS / RETAIL + LOGISTICS NEXT';

    const intro = volume3.querySelector('.dj-drawer-panel-intro p');
    if (intro) intro.textContent = 'Volume III now moves from specialist streets, institutions and religious-commercial space into the city’s economic operating system. Entry 21 returns to Mahang Street: prepared food, extended night-market hours and late-night tea reveal retail as everyday infrastructure.';

    function makeLive(number, href, title, zhTitle, noteText, timeText) {
      const row = [...volume3.querySelectorAll('.dj-drawer-entry')].find((entry) => entry.firstElementChild?.textContent.trim() === number);
      if (!row) return null;
      let link = row;
      if (row.tagName !== 'A') {
        link = document.createElement('a');
        link.className = row.className.replace(/\bis-queued\b/g, '').trim();
        link.innerHTML = row.innerHTML;
        row.replaceWith(link);
      }
      link.href = href;
      const titleNode = link.querySelector('.dj-drawer-entry-title');
      const note = link.querySelector('.dj-drawer-entry-note');
      const state = link.querySelector('.dj-drawer-entry-state');
      const time = link.querySelector('.dj-drawer-entry-time');
      if (titleNode) titleNode.innerHTML = `<strong>${title}</strong><small lang="zh-Hant">${zhTitle}</small>`;
      if (note) note.textContent = noteText;
      if (state) state.textContent = 'LIVE';
      if (time) time.textContent = timeText;
      return link;
    }

    makeLive('20', '/reading/dongjing-meng-hua-lu/20/', 'Shangqing Palace', '上清宮', 'A dispersed directory of religious institutions across gates, streets and lanes of the capital.', '≈ 16 MIN');
    makeLive('21', '/reading/dongjing-meng-hua-lu/21/', 'The City Eats Late', '馬行街鋪席', 'Prepared food, night-market time, winter trade and tea for people returning from public and private business.', '≈ 18 MIN');
  }

  const archiveTitle = archive.querySelector('#archive-title');
  if (archiveTitle) archiveTitle.textContent = 'Ten volumes. Twenty-one entries live.';
  const archiveDeck = archiveTitle?.nextElementSibling;
  if (archiveDeck) archiveDeck.textContent = 'Volumes I–II establish the city frame and street economy. Volume III now opens the operating city: specialists, institutions, temple commerce, a sacred network and an extended-hours retail economy.';

  const roomFooter = document.querySelector('.dj-footer span');
  if (roomFooter?.textContent.includes('READING / 003 /')) roomFooter.textContent = 'READING / 003 / 21 OF 86 LIVE';

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
