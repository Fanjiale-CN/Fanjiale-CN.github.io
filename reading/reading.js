(() => {
  function mountReadingLibrary() {
    if (document.querySelector('#reading-library')) return;

    if (!document.querySelector('link[href*="reading-library.css"]')) {
      const stylesheet = document.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.href = '/reading/reading-library.css?v=20260830a';
      document.head.append(stylesheet);
    }

    const feature = document.querySelector('.reading-feature');
    if (!feature) return;

    const featureCta = feature.querySelector('.reading-feature-intro a');
    if (featureCta) {
      featureCta.href = '#reading-library';
      featureCta.innerHTML = 'Enter the library <span aria-hidden="true">↓</span>';
      featureCta.setAttribute('aria-label', 'Enter the Reading library');
    }

    const statusValues = feature.querySelectorAll('.reading-feature-status b');
    if (statusValues[1]) statusValues[1].textContent = 'Opening note live';

    const library = document.createElement('section');
    library.className = 'reading-library';
    library.id = 'reading-library';
    library.setAttribute('aria-labelledby', 'reading-library-title');
    library.innerHTML = `
      <header class="reading-library-head">
        <p>01 / LIBRARY</p>
        <div>
          <h2 id="reading-library-title">Choose a text.</h2>
          <span>Each shelf opens into its own reading room. Notes, source audits and later essays stay with the book they came from.</span>
        </div>
      </header>
      <div class="reading-library-stage">
        <div class="reading-library-shelf" aria-label="Reading library">
          <a class="reading-volume reading-volume--active" href="/reading/salt-and-iron/">
            <div class="reading-volume-top"><span>READING / 001</span><span>WESTERN HAN / 81 BCE</span></div>
            <div class="reading-volume-title">
              <strong>鹽鐵論</strong>
              <b>Salt &amp; Iron</b>
              <small>State revenue, monopoly, merchants and the argument over who bears the cost.</small>
            </div>
            <div class="reading-volume-foot"><span>STATE / MARKET</span><strong>OPEN READING →</strong></div>
          </a>
          <article class="reading-volume reading-volume--guanzi reading-volume--queued" aria-label="Guanzi research queue">
            <div class="reading-volume-top"><span>NEXT SHELF</span><span>TEXT LAYERS</span></div>
            <div class="reading-volume-title">
              <strong>管子</strong>
              <b>Guanzi</b>
              <small>Prices, grain, circulation and the administrative ambition to see and steer a market.</small>
            </div>
            <div class="reading-volume-foot"><span>MARKET / PRICE</span><strong>RESEARCH QUEUE</strong></div>
          </article>
          <article class="reading-volume reading-volume--dongjing reading-volume--queued" aria-label="Dongjing Meng Hua Lu research queue">
            <div class="reading-volume-top"><span>ON THE SHELF</span><span>12TH C. / KAIFENG</span></div>
            <div class="reading-volume-title">
              <strong>東京夢華錄</strong>
              <b>Eastern Capital</b>
              <small>Night markets, services, consumption and the density of ordinary urban commerce.</small>
            </div>
            <div class="reading-volume-foot"><span>CITY / PEOPLE</span><strong>RESEARCH QUEUE</strong></div>
          </article>
        </div>
      </div>
      <div class="reading-library-note"><span>ACTIVE SHELF / 1</span><span>New texts enter only when there is something worth reading closely.</span></div>`;

    feature.insertAdjacentElement('afterend', library);

    const sectionLabels = [
      ['.reading-time .reading-section-head > p', '02 / IN TIME'],
      ['.reading-questions .reading-section-head > p', '03 / READ BY QUESTION'],
      ['.reading-index .reading-section-head > p', '04 / READING INDEX'],
      ['.reading-sources .reading-section-head > p', '05 / SOURCE SHELF'],
      ['.reading-method > header > p', '06 / HOW WE READ']
    ];
    sectionLabels.forEach(([selector, value]) => {
      const label = document.querySelector(selector);
      if (label) label.textContent = value;
    });
  }

  mountReadingLibrary();

  const previewData = {
    salt: {
      className: 'reading-preview-plate--salt',
      kicker: "81 BCE / CHANG'AN",
      title: '鹽鐵論',
      copy: 'A court argument over how a state pays for ambition, who captures commercial profit and who bears the cost.',
      meta: '001 / OPENING NOTE LIVE'
    },
    guanzi: {
      className: 'reading-preview-plate--guanzi',
      kicker: 'TEXT LAYERS / WARRING STATES TO HAN',
      title: '管子',
      copy: 'A research path into grain, prices, hoarding and the administrative fantasy of seeing a market clearly enough to steer it.',
      meta: 'RESEARCH QUEUE / MARKET + PRICE'
    },
    dongjing: {
      className: 'reading-preview-plate--dongjing',
      kicker: '12TH C. / KAIFENG REMEMBERED',
      title: '東京夢華錄',
      copy: 'A research path into night markets, services, consumption and the ordinary commercial density of a capital city.',
      meta: 'RESEARCH QUEUE / CITY + PEOPLE'
    }
  };

  const sourceData = {
    scan: {
      kicker: 'TEXT WITNESS / PUBLIC DOMAIN',
      title: 'Yantie Lun — Ming printed edition',
      description: 'National Library of China digitization on Wikimedia Commons. The scan is used as a textual witness and visual source; transcription is checked separately before quotation.',
      link: 'https://commons.wikimedia.org/wiki/File:NLC892-411999030778-149199_%E9%B9%BD%E9%90%B5%E8%AB%96_%E7%AC%AC1%E5%86%8A.pdf'
    },
    map: {
      kicker: 'SPACE / PUBLIC DOMAIN',
      title: 'Han Dynasty map, 2 CE',
      description: 'A modern reference map released to the public domain. It is useful for spatial orientation, not as a substitute for a historical-gazetteer reconstruction of 81 BCE.',
      link: 'https://commons.wikimedia.org/wiki/File:Han_Dynasty_map_2CE.png'
    },
    coin: {
      kicker: 'OBJECT / CC0',
      title: 'Western Han Wu Zhu coin',
      description: "A Wu Zhu coin attributed to Emperor Wu's reign. The photograph is dedicated to the public domain under CC0 by Gary Lee Todd.",
      link: 'https://commons.wikimedia.org/wiki/File:042_S-114_W._Han_Wu_Zhu,_Han_Wudi,_140-87,_25.5mm.jpg'
    }
  };

  async function loadCommonsThumbnail(img) {
    const title = img.dataset.commonsTitle;
    if (!title) return;
    const width = Math.max(320, Number(img.dataset.commonsWidth || 900));
    const params = new URLSearchParams({
      origin: '*',
      action: 'query',
      format: 'json',
      prop: 'imageinfo',
      iiprop: 'url|mime',
      iiurlwidth: String(width),
      titles: title
    });
    try {
      const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params.toString()}`, { mode: 'cors', credentials: 'omit' });
      if (!response.ok) return;
      const data = await response.json();
      const page = Object.values(data?.query?.pages || {})[0];
      const info = page?.imageinfo?.[0];
      const source = info?.thumburl || '';
      if (!source || /\.pdf(?:$|\?)/i.test(source)) return;
      img.addEventListener('load', () => img.closest('[data-commons-figure]')?.classList.add('is-loaded'), { once: true });
      img.src = source;
    } catch {
      // The typographic facsimile remains visible when Commons is unavailable.
    }
  }

  document.querySelectorAll('img[data-commons-title]').forEach((img) => loadCommonsThumbnail(img));

  const previewPlate = document.querySelector('[data-reading-preview-plate]');
  const previewKicker = document.querySelector('[data-reading-preview-kicker]');
  const previewTitle = document.querySelector('[data-reading-preview-title]');
  const previewCopy = document.querySelector('[data-reading-preview-copy]');
  const previewMeta = document.querySelector('[data-reading-preview-meta]');
  const previewRows = [...document.querySelectorAll('[data-reading-preview]')];

  function selectPreview(key, row) {
    const item = previewData[key];
    if (!item || !previewPlate) return;
    previewPlate.classList.remove('reading-preview-plate--salt', 'reading-preview-plate--guanzi', 'reading-preview-plate--dongjing');
    previewPlate.classList.add(item.className);
    if (previewKicker) previewKicker.textContent = item.kicker;
    if (previewTitle) previewTitle.textContent = item.title;
    if (previewCopy) previewCopy.textContent = item.copy;
    if (previewMeta) previewMeta.textContent = item.meta;
    previewRows.forEach((button) => button.classList.toggle('is-active', button === row));
  }

  previewRows.forEach((row) => {
    const activate = () => selectPreview(row.dataset.readingPreview, row);
    row.addEventListener('click', activate);
    row.addEventListener('mouseenter', activate);
    row.addEventListener('focus', activate);
  });

  const dialog = document.querySelector('[data-reading-dialog]');
  const dialogMedia = document.querySelector('[data-reading-dialog-media]');
  const dialogKicker = document.querySelector('[data-reading-dialog-kicker]');
  const dialogTitle = document.querySelector('[data-reading-dialog-title]');
  const dialogDescription = document.querySelector('[data-reading-dialog-description]');
  const dialogLink = document.querySelector('[data-reading-dialog-link]');
  const dialogClose = document.querySelector('[data-reading-dialog-close]');

  function mediaFor(sourceId, trigger) {
    if (!dialogMedia) return;
    dialogMedia.replaceChildren();
    const sourceImage = trigger.querySelector('img');
    if (sourceImage?.src) {
      const image = new Image();
      image.alt = sourceImage.alt || '';
      image.decoding = 'async';
      image.src = sourceImage.src;
      dialogMedia.append(image);
      return;
    }
    if (sourceId === 'scan') {
      const fallback = document.createElement('div');
      fallback.className = 'reading-source-paper';
      fallback.setAttribute('aria-hidden', 'true');
      fallback.innerHTML = '<div class="reading-source-columns"><span>鹽鐵論</span><span>御史進曰昔太公封於營丘</span><span>通利末之道極女工之巧</span><span>總一鹽鐵通山川之利</span><span>縣官用饒足民不困乏</span></div>';
      dialogMedia.append(fallback);
    }
  }

  document.querySelectorAll('[data-source-open]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      if (!dialog || typeof dialog.showModal !== 'function') return;
      const id = trigger.dataset.sourceOpen;
      const item = sourceData[id];
      if (!item) return;
      if (dialogKicker) dialogKicker.textContent = item.kicker;
      if (dialogTitle) dialogTitle.textContent = item.title;
      if (dialogDescription) dialogDescription.textContent = item.description;
      if (dialogLink) dialogLink.href = item.link;
      mediaFor(id, trigger);
      dialog.showModal();
    });
  });

  dialogClose?.addEventListener('click', () => dialog?.close());
  dialog?.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
})();
