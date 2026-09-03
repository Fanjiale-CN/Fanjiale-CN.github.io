(() => {
  const loadStylesheet = (href, id) => {
    if (id && document.getElementById(id)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    if (id) link.id = id;
    document.head.append(link);
  };
  const auditEntries = window.__dongjingAuditEntries || {};

  function makeAuditCard([label, title, copy]) {
    const article = document.createElement('article');
    article.className = 'dj-audit-card';
    article.innerHTML = `<small>${label}</small><strong>${title}</strong><p>${copy}</p>`;
    return article;
  }

  function insertInlineAfterQuote(needle, html) {
    const quote = [...document.querySelectorAll('blockquote')].find((node) => node.textContent.includes(needle));
    if (!quote || quote.nextElementSibling?.classList.contains('dj-audit-inline')) return;
    const note = document.createElement('div');
    note.className = 'dj-audit-inline';
    note.innerHTML = html;
    quote.insertAdjacentElement('afterend', note);
  }

  function installDongjingAudit() {
    const match = window.location.pathname.match(/^\/reading\/dongjing-meng-hua-lu\/(\d{2})\/?$/);
    if (!match) return;
    const entry = match[1];
    const config = auditEntries[entry];
    if (!config) return;
    if (document.querySelector('[data-dongjing-audit="20260904"]')) return;

    loadStylesheet('/reading/dongjing-audit-20260904.css?v=20260904a', 'dongjing-audit-20260904');
    document.documentElement.dataset.dongjingAudit = '20260904';
    document.body.classList.add('dj-audit-enabled');

    const section = document.createElement('section');
    section.className = `dj-audit-layer${config.severity ? ` is-${config.severity}` : ''}`;
    section.dataset.dongjingAudit = '20260904';
    section.setAttribute('aria-labelledby', `dj-audit-${entry}-title`);
    section.innerHTML = `
      <header class="dj-audit-head">
        <div><small>WHOLE-BOOK RECALIBRATION / 2026-09-04</small><h2 id="dj-audit-${entry}-title">${config.title}</h2></div>
        <p>${config.summary}</p>
      </header>
      <div class="dj-audit-grid"></div>
      ${config.timeline ? '<div class="dj-audit-timeline" aria-label="Urban state timeline"></div>' : ''}
      <footer class="dj-audit-source"><span>SOURCE BASIS</span><b>孟元老《東京夢華錄》 + uploaded Zhonghua annotated edition (Yang Chunqiao)</b><small>Modern annotation is used as research evidence and collation guidance; it does not automatically replace the project’s base witness.</small></footer>`;

    const grid = section.querySelector('.dj-audit-grid');
    config.cards.forEach((card) => grid.append(makeAuditCard(card)));

    if (config.timeline) {
      const timeline = section.querySelector('.dj-audit-timeline');
      config.timeline.forEach(([time, text], index) => {
        const item = document.createElement('div');
        item.innerHTML = `<span>${String(index + 1).padStart(2, '0')}</span><small>${time}</small><b>${text}</b>`;
        timeline.append(item);
      });
    }

    const hero = document.querySelector('main > header.dj-entry-hero, main > header[class*="hero"], .dj-entry-hero');
    if (hero) hero.insertAdjacentElement('afterend', section);
    else document.querySelector('main')?.prepend(section);

    if (entry === '02') {
      insertInlineAfterQuote('景龍門', '<small>TEXT VARIANT / PLACE NAME</small><strong lang="zh-Hant">實籙宮 ↔ 寶籙宮</strong><p>The uploaded Zhonghua edition prints <span lang="zh-Hant">實籙宮</span> and annotates it as likely <span lang="zh-Hant">寶籙宮</span>. The normalized place-name should remain an explicit editorial judgment.</p>');
    }

    if (entry === '03') {
      insertInlineAfterQuote('河上有橋十一', '<small>TEXT PROBLEM / COUNT</small><strong><span lang="zh-Hant">有橋十一</span> · LIST = 13</strong><p>The transmitted count and the enumerated sequence disagree. Both remain visible; the diagram must not silently choose one.</p>');
    }

    if (entry === '15') {
      insertInlineAfterQuote('馬行北去', '<small>COLLATION / SEGMENTATION</small><strong lang="zh-Hant">杜金鈎家｜曹家獨勝元｜山水李家口齒咽喉藥｜石魚兒班防禦｜銀孩兒栢郎中家醫小兒｜大鞋任家產科</strong><p>This segmentation follows the uploaded Zhonghua annotated edition. It is shown as a collation reading beside the project witness, with the sign-like shop identifiers kept visible.</p>');

      const strip = document.querySelector('.dj15-strip');
      if (strip) {
        strip.setAttribute('aria-label', 'Medical storefront identities, status and specialties along Mahang Street');
        strip.innerHTML = `
          <article data-dj15-node><small>STREET</small><b>SMALL GOODS</b><span lang="zh-Hant">小貨行</span></article>
          <article data-dj15-node><small>MEDICAL STATUS</small><b>JINZI OFFICIALS</b><span lang="zh-Hant">金紫醫官藥鋪</span></article>
          <article data-dj15-node class="dj15-sign-node"><small>SIGN / SHOP ID</small><b>GOLD HOOK</b><span lang="zh-Hant">杜金鈎家</span></article>
          <article data-dj15-node><small>REMEDY / SHOP</small><b>DUSHENG YUAN</b><span lang="zh-Hant">曹家獨勝元</span></article>
          <article data-dj15-node class="dj15-sign-node"><small>SIGN + SPECIALTY</small><b>LANDSCAPE LI</b><span lang="zh-Hant">山水李家 · 口齒咽喉藥</span></article>
          <article data-dj15-node class="dj15-sign-node"><small>SIGN + PRACTITIONER</small><b>STONE FISH</b><span lang="zh-Hant">石魚兒 · 班防禦</span></article>
          <article data-dj15-node class="dj15-sign-node"><small>SIGN + SPECIALTY</small><b>SILVER CHILD</b><span lang="zh-Hant">銀孩兒 · 栢郎中家 · 醫小兒</span></article>
          <article data-dj15-node class="dj15-sign-node"><small>SIGN + SPECIALTY</small><b>LARGE SHOE</b><span lang="zh-Hant">大鞋任家 · 產科</span></article>`;
      }
    }
  }

  installDongjingAudit();
})();
