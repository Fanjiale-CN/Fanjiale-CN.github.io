(() => {
  const root = document.documentElement;
  const head = document.head;

  const ensureStylesheet = (id, href, crossOrigin = false) => {
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    if (crossOrigin) link.crossOrigin = 'anonymous';
    head.append(link);
  };

  /* MiSans is the main-site typeface. The font is supplied through the
     subsetted web package and remains subject to Xiaomi's MiSans license. */
  ensureStylesheet('galok-misans-light', 'https://cdn.jsdelivr.net/npm/misans@4.1.0/lib/Normal/MiSans-Light.min.css', true);
  ensureStylesheet('galok-misans-medium', 'https://cdn.jsdelivr.net/npm/misans@4.1.0/lib/Normal/MiSans-Medium.min.css', true);
  ensureStylesheet('galok-misans-bold', 'https://cdn.jsdelivr.net/npm/misans@4.1.0/lib/Normal/MiSans-Bold.min.css', true);
  ensureStylesheet('galok-home-nav-22', '/home-v2-nav.css?v=20260913c');
  ensureStylesheet('galok-home-gesture-22', '/home-v2-mobile-gesture.css?v=20260913a');

  if (!document.querySelector('meta[name="font-credit"]')) {
    const credit = document.createElement('meta');
    credit.name = 'font-credit';
    credit.content = 'MiSans ¬© Beijing Xiaomi Mobile Software Co., Ltd.; used under the MiSans font license.';
    head.append(credit);
  }

  const capsule = document.querySelector('[data-gv2-capsule]');
  const panelWrap = document.querySelector('[data-capsule-panel-wrap]');
  const bar = capsule?.querySelector('.gv2-capsule-bar');
  const year = document.querySelector('[data-current-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  if (!capsule || !panelWrap || !bar) return;

  const icons = {
    research: '<svg viewBox="0 0 24 24"><path d="M4 18V10M9 18V6M14 18v-4M19 18V8"/><path d="M3.5 18.5h17"/></svg>',
    press: '<svg viewBox="0 0 24 24"><path d="M7 4.5h9.5A2.5 2.5 0 0 1 19 7v10.5H9.5A2.5 2.5 0 0 1 7 15V4.5Z"/><path d="M5 7.5h10.5A2.5 2.5 0 0 1 18 10v9.5H7.5A2.5 2.5 0 0 1 5 17V7.5Z"/></svg>',
    cities: '<svg viewBox="0 0 24 24"><path d="M3 19h18M5 19V9h5v10M10 19V5h5v14M15 19v-7h4v7"/><path d="M7 12h1M12 8h1M12 11h1M17 15h1"/></svg>',
    essays: '<svg viewBox="0 0 24 24"><path d="M6 4.5h9l3 3V19.5H6z"/><path d="M15 4.5v3h3M9 11h6M9 14h6M9 17h4"/></svg>',
    reading: '<svg viewBox="0 0 24 24"><path d="M3.5 6.5c3.3-1.2 6-.7 8.5 1.2v11c-2.5-1.9-5.2-2.4-8.5-1.2z"/><path d="M20.5 6.5c-3.3-1.2-6-.7-8.5 1.2v11c2.5-1.9 5.2-2.4 8.5-1.2z"/></svg>',
    radar: '<svg viewBox="0 0 24 24"><path d="M12 20a8 8 0 1 0-8-8"/><path d="M12 16a4 4 0 1 0-4-4"/><path d="M12 12 18.5 6.5"/><circle cx="12" cy="12" r="1.2"/></svg>',
    menu: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="6" height="6" rx="1.4"/><rect x="14" y="4" width="6" height="6" rx="1.4"/><rect x="4" y="14" width="6" height="6" rx="1.4"/><rect x="14" y="14" width="6" height="6" rx="1.4"/></svg>'
  };

  const navItems = [
    ['research', 'Research', icons.research],
    ['press-print', 'Press Print', icons.press],
    ['cities', 'Cities', icons.cities],
    ['essays', 'Essays', icons.essays],
    ['reading', 'Reading', icons.reading],
    ['radar', 'Radar', icons.radar],
    ['menu', 'Menu', icons.menu],
  ];

  bar.innerHTML = '<span class="gv2-capsule-lens" aria-hidden="true"></span>' + navItems.map(([name, label, icon]) => (
    `<button type="button" data-capsule-trigger="${name}" aria-expanded="false" aria-label="Open ${label} menu"><span class="gv2-nav-icon" aria-hidden="true">${icon}</span><span class="gv2-nav-label">${label}</span></button>`
  )).join('');

  const setPanelMarkup = (name, html) => {
    let panel = panelWrap.querySelector(`[data-capsule-panel="${name}"]`);
    if (!panel) {
      panel = document.createElement('section');
      panel.className = 'gv2-submenu';
      panel.dataset.capsulePanel = name;
      panel.setAttribute('aria-label', `${name} menu`);
      panelWrap.append(panel);
    }
    panel.innerHTML = html;
  };

  setPanelMarkup('research', '<div><span>Research</span><small>Evidence, arguments and working papers.</small></div><a href="/research/">All research</a><a href="/research/love-by-the-hour/">Research 003</a><a href="/research/fast-metabolism-economy/">Research 002</a><a href="/data/">Data</a>');
  setPanelMarkup('press-print', '<div><span>Press Print</span><small>Image reconstruction through print logic.</small></div><a href="/press-print/">Overview</a><a href="https://chatgpt.com/" target="_blank" rel="noreferrer">Try in ChatGPT ‚Üó</a><a href="https://github.com/Fanjiale-CN/press-print" target="_blank" rel="noreferrer">Source ‚Üó</a>');
  setPanelMarkup('cities', '<div><span>Cities</span><small>Visual records built from streets, weather and movement.</small></div><a href="/cities/">All cities</a><a href="/be-a-viewer/beijing/">Beijing</a><a href="/be-a-viewer/shanghai/">Shanghai</a><a href="/be-a-viewer/xian/">Xi‚Äôan</a><a href="/be-a-viewer/xiamen/">Xiamen</a>');
  setPanelMarkup('essays', '<div><span>Essays</span><small>Arguments, notes and ordinary evidence.</small></div><a href="/essays/">All essays</a><a href="/essays/the-curators-curse/">The Curator‚Äôs Curse</a><a href="/essays/platforms-redesign-choice/">Platforms & choice</a><a href="/essays/rmb-9-9-coffee/">RMB 9.9 coffee</a>');
  setPanelMarkup('reading', '<div><span>Reading</span><small>Texts, editions and source trails.</small></div><a href="/reading/">Reading room</a><a href="/reading/dongjing-meng-hua-lu/">Êù±‰∫¨Â§¢ËèØÈåÑ</a><a href="/reading/dongjing-meng-hua-lu/21/">Current chapter</a><a href="/index/">Reading index</a>');
  setPanelMarkup('radar', '<div><span>Radar</span><small>Signals before they become an argument.</small></div><a href="/radar/">Open Radar</a><a href="/research/">Research</a><a href="/data/">Data</a><a href="/index/">Archive index</a>');
  setPanelMarkup('menu', '<div><span>Galok</span><small>More ways into the archive.</small></div><a href="/work/">Work</a><a href="/index/">Index</a><a href="/about/">About</a><button type="button" data-theme-cycle>Theme ¬∑ Auto</button>');

  const triggers = Array.from(capsule.querySelectorAll('[data-capsule-trigger]'));
  const panels = Array.from(panelWrap.querySelectorAll('[data-capsule-panel]'));
  const lens = bar.querySelector('.gv2-capsule-lens');
  const themeCycle = panelWrap.querySelector('[data-theme-cycle]');
  const localNames = ['research', 'press-print', 'cities'];
  const sectionMap = new Map(localNames.map((name) => [name, document.querySelector(`[data-home-section="${name}"]`)]));
  const mobileGestureMQ = window.matchMedia('(max-width: 760px)');
  const reducedMotionMQ = window.matchMedia('(prefers-reduced-motion: reduce)');

  let activePanel = null;
  let lastTrigger = null;
  let currentName = 'research';
  let lensFrame = 0;
  let physicsFrame = 0;
  let suppressClickUntil = 0;
  let gesture = null;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const lerp = (from, to, t) => from + (to - from) * t;
  const buttonFor = (name) => triggers.find((button) => button.dataset.capsuleTrigger === name) || null;
  const indexFor = (name) => navItems.findIndex(([itemName]) => itemName === name);
  const mobileGestureEnabled = () => mobileGestureMQ.matches && !reducedMotionMQ.matches;

  const centerButton = (button, behavior = 'smooth') => {
    if (!button) return;
    const max = Math.max(0, bar.scrollWidth - bar.clientWidth);
    const target = clamp(button.offsetLeft + button.offsetWidth / 2 - bar.clientWidth / 2, 0, max);
    bar.scrollTo({ left: target, behavior });
  };

  const syncLens = (button, { center = false, behavior = 'smooth' } = {}) => {
    if (!button || !lens || gesture?.active) return;
    cancelAnimationFrame(lensFrame);
    lensFrame = requestAnimationFrame(() => {
      bar.style.setProperty('--gv2-lens-x', `${button.offsetLeft}px`);
      bar.style.setProperty('--gv2-lens-w', `${button.offsetWidth}px`);
      bar.style.setProperty('--gv2-lens-scale', '1');
      if (center) centerButton(button, behavior);
    });
  };

  const updateScrollEdges = () => {
    const max = Math.max(0, bar.scrollWidth - bar.clientWidth);
    capsule.classList.toggle('is-scroll-start', bar.scrollLeft <= 5);
    capsule.classList.toggle('is-scroll-end', bar.scrollLeft >= max - 5);
  };

  const setPanel = (name, trigger) => {
    activePanel = name;
    lastTrigger = trigger || null;
    panels.forEach((panel) => panel.classList.toggle('is-active', panel.dataset.capsulePanel === name));
    triggers.forEach((button) => {
      const expanded = button.dataset.capsuleTrigger === name;
      button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });
    capsule.classList.toggle('is-open', Boolean(name));
    panelWrap.setAttribute('aria-hidden', name ? 'false' : 'true');
    if (trigger) syncLens(trigger, { center: true });
  };

  const closePanel = ({ restoreFocus = false } = {}) => {
    const previous = lastTrigger;
    setPanel(null, null);
    syncLens(buttonFor(currentName) || previous || buttonFor('research'));
    if (restoreFocus && previous previous.focus();
  };

  const sectionPositions = () => localNames.map((name) => {
    const element = sectionMap.get(name);
    if (!element) return 0;
    return Math.max(0, element.getBoundingClientRect().top + window.scrollY - 8);
  });

  const pageYForVirtual = (virtualIndex, positions) => {
    if (virtualIndex < 0) {
      return lerp(0, positions[0], clamp(virtualIndex + 1, 0, 1));
    }
    const local = clamp(virtualIndex, 0, localNames.length - 1);
    const lo = Math.floor(local);
    const hi = Math.min(localNames.length - 1, Math.ceil(local));
    if (lo === hi) return positions[lo];
    return lerp(positions[lo], positions[hi], local - lo);
  };

  const virtualForPageY = (pageY, positions) => {
    if (!positions.length) return 0;
    if (pageY <= positions[0]) {
      return -1 + clamp(pageY / Math.max(1, positions[0]), 0, 1);
    }
    for (let index = 0; index < positions.length - 1; index += 1) {
      const start = positions[index];
      const end = positions[index + 1];
      if (pageY <= end) {
        const span = Math.max(1, end - start);
        return index + clamp((pageY - start§ÄºÅÕ¡Ö∏∞Ä¿∞Äƒ§Ï(ÄÄÄÄÄÅÙ(ÄÄÄÅÙ(ÄÄÄÅ…ï—’…∏Å¡ΩÕ•—•ΩπÃπ±ïπù—†Ä¥ÄƒÏ(ÄÅÙÏ((ÄÅçΩπÕ–ÅÕï—ïÕ—’…ï	’——ΩπY•Õ’Ö±ÃÄÙÄ°Ÿ•…—’Ö±%πëï‡§ÄÙ¯ÅÏ(ÄÄÄÅ—…•ùùï…ÃπôΩ…Öç††°â’——Ω∏∞Å•πëï‡§ÄÙ¯ÅÏ(ÄÄÄÄÄÅçΩπÕ–Å¡…Ω·•µ•—‰ÄÙÅç±Öµ¿†ƒÄ¥Å5Ö—†πÖâÃ°•πëï‡Ä¥ÅŸ•…—’Ö±%πëï‡§∞Ä¿∞Äƒ§Ï(ÄÄÄÄÄÅ•òÄ†ÖçÖ¡Õ’±îπç±ÖÕÕ1•Õ–πçΩπ—Ö•πÃ†ù•ÃµùïÕ—’…îú§ÄòòÄÖçÖ¡Õ’±îπç±ÖÕÕ1•Õ–πçΩπ—Ö•πÃ†ù•ÃµÕ¡…•πù•πúú§§ÅÏ(ÄÄÄÄÄÄÄÅâ’——Ω∏πÕ—Â±îπ…ïµΩŸïA…Ω¡ï…—‰†ùΩ¡Öç•—‰ú§Ï(ÄÄÄÄÄÄÄÅâ’——Ω∏πÕ—Â±îπ…ïµΩŸïA…Ω¡ï…—‰†ù—…ÖπÕôΩ…¥ú§Ï(ÄÄÄÄÄÄÄÅ…ï—’…∏Ï(ÄÄÄÄÄÅÙ(ÄÄÄÄÄÅâ’——Ω∏πÕ—Â±îπΩ¡Öç•—‰ÄÙÅM—…•πú†∏ÿ–Ä¨Å¡…Ω·•µ•—‰Ä®Ä∏Ãÿ§Ï(ÄÄÄÄÄÅâ’——Ω∏πÕ—Â±îπ—…ÖπÕôΩ…¥ÄÙÅÅ—…ÖπÕ±Ö—ïd†ëÏ¥ƒ∏‘Ä®Å¡…Ω·•µ•—Âı¡‡§ÅÕçÖ±î†ëÏƒÄ¨Ä∏¿Ã‘Ä®Å¡…Ω·•µ•—ÂÙ•ÅÄÏ(ÄÄÄÅÙ§Ï(ÄÅÙÏ((ÄÅçΩπÕ–ÅÕï—1ïπÕ—Y•…—’Ö∞ÄÙÄ°Ÿ•…—’Ö±%πëï‡∞ÅŸï±Ωç•—Â%πëï‡ÄÙÄ¿§ÄÙ¯ÅÏ(ÄÄÄÅ•òÄ†Ö±ïπÃ§Å…ï—’…∏Ï(ÄÄÄÅçΩπÕ–ÅâΩ’πëïêÄÙÅç±Öµ¿°Ÿ•…—’Ö±%πëï‡∞Ä¿∞Å—…•ùùï…Ãπ±ïπù—†Ä¥Äƒ§Ï(ÄÄÄÅçΩπÕ–Å±ºÄÙÅ5Ö—†πô±ΩΩ»°âΩ’πëïê§Ï(ÄÄÄÅçΩπÕ–Å°§ÄÙÅ5Ö—†πµ•∏°—…•ùùï…Ãπ±ïπù—†Ä¥Äƒ∞Å5Ö—†πçï•∞°âΩ’πëïê§§Ï(ÄÄÄÅçΩπÕ–Å–ÄÙÅâΩ’πëïêÄ¥Å±ºÏ(ÄÄÄÅçΩπÕ–ÅÑÄÙÅ—…•ùùï…Õm±ΩtÏ(ÄÄÄÅçΩπÕ–ÅàÄÙÅ—…•ùùï…Õm°•tÏ(ÄÄÄÅ•òÄ†ÖÑÅÒÄÖà§Å…ï—’…∏Ï((ÄÄÄÅçΩπÕ–Å‡ÄÙÅ±ï…¿°ÑπΩôôÕï—1ïô–∞ÅàπΩôôÕï—1ïô–∞Å–§Ï(ÄÄÄÅçΩπÕ–Å‹ÄÙÅ±ï…¿°ÑπΩôôÕï—]•ë—†∞ÅàπΩôôÕï—]•ë—†∞Å–§Ï(ÄÄÄÅçΩπÕ–ÅÕ—…ï—ç†ÄÙÄƒÄ¨Å5Ö—†πµ•∏†∏¿‡‘∞Å5Ö—†πÖâÃ°Ÿï±Ωç•—Â%πëï‡§Ä®Ä∏¿ƒ‡§Ï(ÄÄÄÅâÖ»πÕ—Â±îπÕï—A…Ω¡ï…—‰†ú¥µùÿ»µ±ïπÃµ‡ú∞ÅÄëÌ·ı¡·Ä§Ï(ÄÄÄÅâÖ»πÕ—Â±îπÕï—A…Ω¡ï…—‰†ú¥µùÿ»µ±ïπÃµ‹ú∞ÅÄëÌ›ı¡·Ä§Ï(ÄÄÄÅâÖ»πÕ—Â±îπÕï—A…Ω¡ï…—‰†ú¥µùÿ»µ±ïπÃµÕçÖ±îú∞ÅM—…•πú°Õ—…ï—ç†§§Ï((ÄÄÄÅçΩπÕ–Åçïπ—ï»ÄÙÅ‡Ä¨Å‹ÄºÄ»Ï(ÄÄÄÅçΩπÕ–ÅµÖ‡ÄÙÅ5Ö—†πµÖ‡†¿∞ÅâÖ»πÕç…Ω±±]•ë—†Ä¥ÅâÖ»πç±•ïπ—]•ë—†§Ï(ÄÄÄÅâÖ»πÕç…Ω±±1ïô–ÄÙÅç±Öµ¿°çïπ—ï»Ä¥ÅâÖ»πç±•ïπ—]•ë—†ÄºÄ»∞Ä¿∞ÅµÖ‡§Ï(ÄÄÄÅÕï—ïÕ—’…ï	’——ΩπY•Õ’Ö±Ã°âΩ’πëïê§Ï(ÄÅÙÏ((ÄÅçΩπÕ–Å…ïπëï…Y•…—’Ö∞ÄÙÄ°Ÿ•…—’Ö±%πëï‡∞ÅŸï±Ωç•—Â%πëï‡∞Å¡ΩÕ•—•ΩπÃ∞ÅÏÅµΩŸïAÖùîÄÙÅ—…’îÅÙÄÙÅÌÙ§ÄÙ¯ÅÏ(ÄÄÄÅÕï—1ïπÕ—Y•…—’Ö∞°Ÿ•…—’Ö±%πëï‡∞ÅŸï±Ωç•—Â%πëï‡§Ï(ÄÄÄÅ•òÄ°µΩŸïAÖùîÄòòÅ¡ΩÕ•—•ΩπÃ¸π±ïπù—†§ÅÏ(ÄÄÄÄÄÅ›•πëΩ‹πÕç…Ω±±Qº†¿∞Å¡ÖùïeΩ…Y•…—’Ö∞°Ÿ•…—’Ö±%πëï‡∞Å¡ΩÕ•—•ΩπÃ§§Ï(ÄÄÄÅÙ(ÄÅÙÏ((ÄÅçΩπÕ–Åç±ïÖ…A°ÂÕ•çÕ±ÖÕÕïÃÄÙÄ†§ÄÙ¯ÅÏ(ÄÄÄÅçÖ¡Õ’±îπç±ÖÕÕ1•Õ–π…ïµΩŸî†ù•ÃµùïÕ—’…îú∞Äù•ÃµÕ¡…•πù•πúú§Ï(ÄÄÄÅ…ΩΩ–πç±ÖÕÕ1•Õ–π…ïµΩŸî†ùùÿ»µπÖÿµë…Öùù•πúú∞Äùùÿ»µπÖÿµÕ¡…•πù•πúú§Ï(ÄÄÄÅâÖ»πÕ—Â±îπÕï—A…Ω¡ï…—‰†ú¥µùÿ»µ±ïπÃµÕçÖ±îú∞Äúƒú§Ï(ÄÄÄÅ—…•ùùï…ÃπôΩ…Öç††°â’——Ω∏§ÄÙ¯ÅÏ(ÄÄÄÄÄÅâ’——Ω∏πÕ—Â±îπ…ïµΩŸïA…Ω¡ï…—‰†ùΩ¡Öç•—‰ú§Ï(ÄÄÄÄÄÅâ’——Ω∏πÕ—Â±îπ…ïµΩŸïA…Ω¡ï…—‰†ù—…ÖπÕôΩ…¥ú§Ï(ÄÄÄÅÙ§Ï(ÄÅÙÏ((ÄÅçΩπÕ–ÅµÖ…≠’……ïπ–ÄÙÄ°πÖµî∞ÅÏÅçïπ—ï»ÄÙÅ—…’îÅÙÄÙÅÌÙ§ÄÙ¯ÅÏ(ÄÄÄÅ•òÄ°πÖµî§Åç’……ïπ—9ÖµîÄÙÅπÖµîÏ(ÄÄÄÅ—…•ùùï…ÃπôΩ…Öç††°â’——Ω∏§ÄÙ¯Åâ’——Ω∏πç±ÖÕÕ1•Õ–π—Ωùù±î†ù•Ãµç’……ïπ–ú∞Åâ’——Ω∏πëÖ—ÖÕï–πçÖ¡Õ’±ïQ…•ùùï»ÄÙÙÙÅπÖµî§§Ï(ÄÄÄÅ•òÄ†ÖÖç—•ŸïAÖπï∞ÄòòÅπÖµîÄòòÄÖùïÕ—’…î¸πÖç—•Ÿî§ÅÕÂπç1ïπÃ°â’——ΩπΩ»°πÖµî§∞ÅÏÅçïπ—ï»ÅÙ§Ï(ÄÅÙÏ((ÄÅçΩπÕ–Åô•π•Õ°—%πëï‡ÄÙÄ°—Ö…ùï—%πëï‡§ÄÙ¯ÅÏ(ÄÄÄÅçΩπÕ–Å—Ö…ùï—9ÖµîÄÙÅπÖŸ%—ïµÕm—Ö…ùï—%πëï·t¸πl¡tÏ(ÄÄÄÅçΩπÕ–Å—Ö…ùï—	’——Ω∏ÄÙÅ—…•ùùï…Õm—Ö…ùï—%πëï·tÏ(ÄÄÄÅç±ïÖ…A°ÂÕ•çÕ±ÖÕÕïÃ†§Ï(ÄÄÄÅùïÕ—’…îÄÙÅπ’±∞Ï((ÄÄÄÅ•òÄ†Ö—Ö…ùï—9ÖµîÅÒÄÖ—Ö…ùï—	’——Ω∏§Å…ï—’…∏Ï(ÄÄÄÅ•òÄ°±ΩçÖ±9ÖµïÃπ•πç±’ëïÃ°—Ö…ùï—9Öµî§§ÅÏ(ÄÄÄÄÄÅµÖ…≠’……ïπ–°—Ö…ùï—9Öµî∞ÅÏÅçïπ—ï»ËÅôÖ±ÕîÅÙ§Ï(ÄÄÄÄÄÅÕÂπç1ïπÃ°—Ö…ùï—	’——Ω∏∞ÅÏÅçïπ—ï»ËÅ—…’î∞Åâï°ÖŸ•Ω»ËÄùÕµΩΩ—†úÅÙ§Ï(ÄÄÄÄÄÅ›•πëΩ‹πÕç…Ω±±Qº†¿∞Å¡ÖùïeΩ…Y•…—’Ö∞°—Ö…ùï—%πëï‡∞ÅÕïç—•ΩπAΩÕ•—•ΩπÃ†§§§Ï(ÄÄÄÅÙÅï±ÕîÅÏ(ÄÄÄÄÄÅÕï—AÖπï∞°—Ö…ùï—9Öµî∞Å—Ö…ùï—	’——Ω∏§Ï(ÄÄÄÅÙ(ÄÅÙÏ((ÄÅçΩπÕ–ÅÕ¡…•πùQΩ%πëï‡ÄÙÄ°ô…Ωµ%πëï‡∞Å—Ö…ùï—%πëï‡∞Å•π•—•Ö±Yï±Ωç•—‰ÄÙÄ¿∞Å¡ΩÕ•—•ΩπÃÄÙÅÕïç—•ΩπAΩÕ•—•ΩπÃ†§§ÄÙ¯ÅÏ(ÄÄÄÅçÖπçï±π•µÖ—•Ωπ…Öµî°¡°ÂÕ•çÕ…Öµî§Ï(ÄÄÄÅçÖ¡Õ’±îπç±ÖÕÕ1•Õ–π…ïµΩŸî†ù•ÃµùïÕ—’…îú§Ï(ÄÄÄÅçÖ¡Õ’±îπç±ÖÕÕ1•Õ–πÖëê†ù•ÃµÕ¡…•πù•πúú§Ï(ÄÄÄÅ…ΩΩ–πç±ÖÕÕ1•Õ–π…ïµΩŸî†ùùÿ»µπÖÿµë…Öùù•πúú§Ï(ÄÄÄÅ…ΩΩ–πç±ÖÕÕ1•Õ–πÖëê†ùùÿ»µπÖÿµÕ¡…•πù•πúú§Ï((ÄÄÄÅ±ï–Å¡ΩÕ•—•Ω∏ÄÙÅô…Ωµ%πëï‡Ï(ÄÄÄÅ±ï–ÅŸï±Ωç•—‰ÄÙÅç±Öµ¿°•π•—•Ö±Yï±Ωç•—‰∞Ä¥‹∞Ä‹§Ï(ÄÄÄÅ±ï–Å¡…ïŸ•Ω’ÃÄÙÅ¡ï…ôΩ…µÖπçîππΩ‹†§Ï(ÄÄÄÅçΩπÕ–ÅÕ—•ôôπïÕÃÄÙÄ‰»Ï(ÄÄÄÅçΩπÕ–ÅëÖµ¡•πúÄÙÄƒ‹∏‘Ï((ÄÄÄÅçΩπÕ–ÅÕ—ï¿ÄÙÄ°πΩ‹§ÄÙ¯ÅÏ(ÄÄÄÄÄÅçΩπÕ–Åë–ÄÙÅ5Ö—†πµ•∏†∏¿Ã»∞Å5Ö—†πµÖ‡†∏¿¿ƒ∞Ä°πΩ‹Ä¥Å¡…ïŸ•Ω’Ã§ÄºÄƒ¿¿¿§§Ï(ÄÄÄÄÄÅ¡…ïŸ•Ω’ÃÄÙÅπΩ‹Ï(ÄÄÄÄÄÅçΩπÕ–ÅÖççï±ï…Ö—•Ω∏ÄÙÄµÕ—•ôôπïÕÃÄ®Ä°¡ΩÕ•—•Ω∏Ä¥Å—Ö…ùï—%πëï‡§Ä¥ÅëÖµ¡•πúÄ®ÅŸï±Ωç•—‰Ï(ÄÄÄÄÄÅŸï±Ωç•—‰Ä¨ÙÅÖççï±ï…Ö—•Ω∏Ä®Åë–Ï(ÄÄÄÄÄÅ¡ΩÕ•—•Ω∏Ä¨ÙÅŸï±Ωç•—‰Ä®Åë–Ï(ÄÄÄÄÄÅ…ïπëï…Y•…—’Ö∞°¡ΩÕ•—•Ω∏∞ÅŸï±Ωç•—‰∞Å¡ΩÕ•—•ΩπÃ∞ÅÏÅµΩŸïAÖùîËÅ—Ö…ùï—%πëï‡ÄÙÄ»ÅÒÅ¡ΩÕ•—•Ω∏ÄÙÄ»∏¿‡ÅÙ§Ï((ÄÄÄÄÄÅ•òÄ°5Ö—†πÖâÃ°¡ΩÕ•—•Ω∏Ä¥Å—Ö…ùï—%πëï‡§ÄÄ∏¿¿»‘ÄòòÅ5Ö—†πÖâÃ°Ÿï±Ωç•—‰§ÄÄ∏¿»‘§ÅÏ(ÄÄÄÄÄÄÄÅ…ïπëï…Y•…—’Ö∞°—Ö…ùï—%πëï‡∞Ä¿∞Å¡ΩÕ•—•ΩπÃ∞ÅÏÅµΩŸïAÖùîËÅ—Ö…ùï—%πëï‡ÄÙÄ»ÅÙ§Ï(ÄÄÄÄÄÄÄÅô•π•Õ°—%πëï‡°—Ö…ùï—%πëï‡§Ï(ÄÄÄÄÄÄÄÅ…ï—’…∏Ï(ÄÄÄÄÄÅÙ(ÄÄÄÄÄÅ¡°ÂÕ•çÕ…ÖµîÄÙÅ…ï≈’ïÕ—π•µÖ—•Ωπ…Öµî°Õ—ï¿§Ï(ÄÄÄÅÙÏ(ÄÄÄÅ¡°ÂÕ•çÕ…ÖµîÄÙÅ…ï≈’ïÕ—π•µÖ—•Ωπ…Öµî°Õ—ï¿§Ï(ÄÅÙÏ((ÄÅçΩπÕ–ÅÕï±ïç—1ΩçÖ±	ÂQÖ¿ÄÙÄ°πÖµî§ÄÙ¯ÅÏ(ÄÄÄÅçΩπÕ–Å—Ö…ùï—%πëï‡ÄÙÅ•πëï·Ω»°πÖµî§Ï(ÄÄÄÅçΩπÕ–Åç’……ïπ—%πëï‡ÄÙÅ5Ö—†πµÖ‡†¿∞Å•πëï·Ω»°ç’……ïπ—9Öµî§§Ï(ÄÄÄÅ•òÄ°—Ö…ùï—%πëï‡ÄÄ¿§Å…ï—’…∏Ï(ÄÄÄÅç±ΩÕïAÖπï∞†§Ï(ÄÄÄÅçΩπÕ–Å¡ΩÕ•—•ΩπÃÄÙÅÕïç—•ΩπAΩÕ•—•ΩπÃ†§Ï(ÄÄÄÅçΩπÕ–Åô…Ωµ%πëï‡ÄÙÅŸ•…—’Ö±Ω…AÖùïd°›•πëΩ‹πÕç…Ω±±d∞Å¡ΩÕ•—•ΩπÃ§Ï(ÄÄÄÅ…ïπëï…Y•…—’Ö∞°ô…Ωµ%πëï‡∞Ä¿∞Å¡ΩÕ•—•ΩπÃ§Ï(ÄÄÄÅÕ¡…•πùQΩ%πëï‡°ô…Ωµ%πëï‡∞Å—Ö…ùï—%πëï‡∞Ä¿∞Å¡ΩÕ•—•ΩπÃ§Ï(ÄÅÙÏ((ÄÅ—…•ùùï…ÃπôΩ…Öç††°â’——Ω∏§ÄÙ¯ÅÏ(ÄÄÄÅâ’——Ω∏πÖëëŸïπ—1•Õ—ïπï»†ùç±•ç¨ú∞Ä°ïŸïπ–§ÄÙ¯ÅÏ(ÄÄÄÄÄÅ•òÄ°¡ï…ôΩ…µÖπçîππΩ‹†§ÄÅÕ’¡¡…ïÕÕ±•ç≠Uπ—•∞§ÅÏ(ÄÄÄÄÄÄÄÅïŸïπ–π¡…ïŸïπ—ïôÖ’±–†§Ï(ÄÄÄÄÄÄÄÅ…ï—’…∏Ï(ÄÄÄÄÄÅÙ(ÄÄÄÄÄÅçΩπÕ–ÅπÖµîÄÙÅâ’——Ω∏πëÖ—ÖÕï–πçÖ¡Õ’±ïQ…•ùùï»Ï(ÄÄÄÄÄÅ•òÄ°µΩâ•±ïïÕ—’…ïπÖâ±ïê†§ÄòòÅ±ΩçÖ±9ÖµïÃπ•πç±’ëïÃ°πÖµî§ÄòòÅπÖµîÄÑÙÙÅç’……ïπ—9Öµî§ÅÏ(ÄÄÄÄÄÄÄÅÕï±ïç—1ΩçÖ±	ÂQÖ¿°πÖµî§Ï(ÄÄÄÄÄÄÄÅ…ï—’…∏Ï(ÄÄÄÄÄÅÙ(ÄÄÄÄÄÅ•òÄ°Öç—•ŸïAÖπï∞ÄÙÙÙÅπÖµî§Åç±ΩÕïAÖπï∞†§Ï(ÄÄÄÄÄÅï±ÕîÅÕï—AÖπï∞°πÖµî∞Åâ’——Ω∏§Ï(ÄÄÄÅÙ§Ï(ÄÅÙ§Ï((ÄÅçΩπÕ–Åâïù•πïÕ—’…îÄÙÄ°ïŸïπ–§ÄÙ¯ÅÏ(ÄÄÄÅ•òÄ†ÖµΩâ•±ïïÕ—’…ïπÖâ±ïê†§ÅÒÅïŸïπ–π¡Ω•π—ï…QÂ¡îÄÙÙÙÄùµΩ’ÕîúÅÒÅïŸïπ–πâ’——Ω∏ÄÑÙÙÄ¿§Å…ï—’…∏Ï(ÄÄÄÅçÖπçï±π•µÖ—•Ωπ…Öµî°¡°ÂÕ•çÕ…Öµî§Ï(ÄÄÄÅçΩπÕ–Å¡ΩÕ•—•ΩπÃÄÙÅÕïç—•ΩπAΩÕ•—•ΩπÃ†§Ï(ÄÄÄÅçΩπÕ–ÅπÖµïë%πëï‡ÄÙÅ5Ö—†πµÖ‡†¿∞Å•πëï·Ω»°Öç—•ŸïAÖπï∞ÅÒÅç’……ïπ—9Öµî§§Ï(ÄÄÄÅçΩπÕ–ÅÕï±ïç—ïë%πëï‡ÄÙÅÖç—•ŸïAÖπï∞Ä¸ÅπÖµïë%πëï‡ÄËÅŸ•…—’Ö±Ω…AÖùïd°›•πëΩ‹πÕç…Ω±±d∞Å¡ΩÕ•—•ΩπÃ§Ï(ÄÄÄÅùïÕ—’…îÄÙÅÏ(ÄÄÄÄÄÅ¡Ω•π—ï…%êËÅïŸïπ–π¡Ω•π—ï…%ê∞(ÄÄÄÄÄÅÕ—Ö…—`ËÅïŸïπ–πç±•ïπ—`∞(ÄÄÄÄÄÅÕ—Ö…—dËÅïŸïπ–πç±•ïπ—d∞(ÄÄÄÄÄÅÕ—Ö…—%πëï‡ËÅÕï±ïç—ïë%πëï‡∞(ÄÄÄÄÄÅŸÖ±’îËÅÕï±ïç—ïë%πëï‡∞(ÄÄÄÄÄÅŸï±Ωç•—‰ËÄ¿∞(ÄÄÄÄÄÅ±ÖÕ—`ËÅïŸïπ–πç±•ïπ—`∞(ÄÄÄÄÄÅ±ÖÕ—Q•µîËÅ¡ï…ôΩ…µÖπçîππΩ‹†§∞(ÄÄÄÄÄÅÖç—•ŸîËÅôÖ±Õî∞(ÄÄÄÄÄÅçÖπçï±±ïêËÅôÖ±Õî∞(ÄÄÄÄÄÅ¡ΩÕ•—•ΩπÃ∞(ÄÄÄÄÄÅµ•π%πëï‡ËÅÕï±ïç—ïë%πëï‡ÄÄ¿Ä¸Ä¥ƒÄËÄ¿∞(ÄÄÄÅÙÏ(ÄÅÙÏ((ÄÅçΩπÕ–ÅµΩŸïïÕ—’…îÄÙÄ°ïŸïπ–§ÄÙ¯ÅÏ(ÄÄÄÅ•òÄ†ÖùïÕ—’…îÅÒÅùïÕ—’…îπ¡Ω•π—ï…%êÄÑÙÙÅïŸïπ–π¡Ω•π—ï…%êÅÒÅùïÕ—’…îπçÖπçï±±ïê§Å…ï—’…∏Ï(ÄÄÄÅçΩπÕ–Åë‡ÄÙÅïŸïπ–πç±•ïπ—`Ä¥ÅùïÕ—’…îπÕ—Ö…—`Ï(ÄÄÄÅçΩπÕ–Åë‰ÄÙÅïŸïπ–πç±•ïπ—dÄ¥ÅùïÕ—’…îπÕ—Ö…—dÏ((ÄÄÄÅ•òÄ†ÖùïÕ—’…îπÖç—•Ÿî§ÅÏ(ÄÄÄÄÄÅ•òÄ°5Ö—†π°Â¡Ω–°ë‡∞Åë‰§ÄÄ‹§Å…ï—’…∏Ï(ÄÄÄÄÄÅ•òÄ°5Ö—†πÖâÃ°ë‰§Ä¯Å5Ö—†πÖâÃ°ë‡§Ä®Äƒ∏¿‘§ÅÏ(ÄÄÄÄÄÄÄÅùïÕ—’…îπçÖπçï±±ïêÄÙÅ—…’îÏ(ÄÄÄÄÄÄÄÅ…ï—’…∏Ï(ÄÄÄÄÄÅÙ(ÄÄÄÄÄÅùïÕ—’…îπÖç—•ŸîÄÙÅ—…’îÏ(ÄÄÄÄÄÅç±ΩÕïAÖπï∞†§Ï(ÄÄÄÄÄÅçÖ¡Õ’±îπç±ÖÕÕ1•Õ–πÖëê†ù•ÃµùïÕ—’…îú§Ï(ÄÄÄÄÄÅ…ΩΩ–πç±ÖÕÕ1•Õ–πÖëê†ùùÿ»µπÖÿµë…Öùù•πúú§Ï(ÄÄÄÄÄÅ—…‰ÅÏÅâÖ»πÕï—AΩ•π—ï…Ö¡—’…î°ïŸïπ–π¡Ω•π—ï…%ê§ÏÅÙÅçÖ—ç†Ä°|§ÅÌÙ(ÄÄÄÅÙ((ÄÄÄÅïŸïπ–π¡…ïŸïπ—ïôÖ’±–†§Ï(ÄÄÄÅçΩπÕ–Å¡•—ç†ÄÙÅ5Ö—†πµÖ‡†‹»∞Ä°—…•ùùï…Õl≈t¸πΩôôÕï—1ïô–ÅÒÅ—…•ùùï…Õl¡tπΩôôÕï—]•ë—†§Ä¥Å—…•ùùï…Õl¡tπΩôôÕï—1ïô–§Ï(ÄÄÄÅçΩπÕ–Å…Ö‹ÄÙÅùïÕ—’…îπÕ—Ö…—%πëï‡Ä¨Åë‡ÄºÅ¡•—ç†Ï(ÄÄÄÅ±ï–ÅŸÖ±’îÄÙÅ…Ö‹Ï(ÄÄÄÅ•òÄ°…Ö‹ÄÅùïÕ—’…îπµ•π%πëï‡§ÅŸÖ±’îÄÙÅùïÕ—’…îπµ•π%πëï‡Ä¨Ä°…Ö‹Ä¥ÅùïÕ—’…îπµ•π%πëï‡§Ä®Ä∏»»Ï(ÄÄÄÅ•òÄ°…Ö‹Ä¯Å—…•ùùï…Ãπ±ïπù—†Ä¥Äƒ§ÅŸÖ±’îÄÙÄ°—…•ùùï…Ãπ±ïπù—†Ä¥Äƒ§Ä¨Ä°…Ö‹Ä¥Ä°—…•ùùï…Ãπ±ïπù—†Ä¥Äƒ§§Ä®Ä∏»»Ï((ÄÄÄÅçΩπÕ–ÅπΩ‹ÄÙÅ¡ï…ôΩ…µÖπçîππΩ‹†§Ï(ÄÄÄÅçΩπÕ–Åë–ÄÙÅ5Ö—†πµÖ‡†‡∞ÅπΩ‹Ä¥ÅùïÕ—’…îπ±ÖÕ—Q•µî§Ï(ÄÄÄÅçΩπÕ–Å•πÕ—Öπ—ÖπïΩ’ÃÄÙÄ†°ïŸïπ–πç±•ïπ—`Ä¥ÅùïÕ—’…îπ±ÖÕ—`§ÄºÅ¡•—ç†§Ä®Ä†ƒ¿¿¿ÄºÅë–§Ï(ÄÄÄÅùïÕ—’…îπŸï±Ωç•—‰ÄÙÅùïÕ—’…îπŸï±Ωç•—‰Ä®Ä∏‹»Ä¨Å•πÕ—Öπ—ÖπïΩ’ÃÄ®Ä∏»‡Ï(ÄÄÄÅùïÕ—’…îπ±ÖÕ—`ÄÙÅïŸïπ–πç±•ïπ—`Ï(ÄÄÄÅùïÕ—’…îπ±ÖÕ—Q•µîÄÙÅπΩ‹Ï(ÄÄÄÅùïÕ—’…îπŸÖ±’îÄÙÅŸÖ±’îÏ(ÄÄÄÅ…ïπëï…Y•…—’Ö∞°ŸÖ±’î∞ÅùïÕ—’…îπŸï±Ωç•—‰∞ÅùïÕ—’…îπ¡ΩÕ•—•ΩπÃ§Ï(ÄÅÙÏ((ÄÅçΩπÕ–ÅïπëïÕ—’…îÄÙÄ°ïŸïπ–§ÄÙ¯ÅÏ(ÄÄÄÅ•òÄ†ÖùïÕ—’…îÅÒÅùïÕ—’…îπ¡Ω•π—ï…%êÄÑÙÙÅïŸïπ–π¡Ω•π—ï…%ê§Å…ï—’…∏Ï(ÄÄÄÅçΩπÕ–ÅïπëïêÄÙÅùïÕ—’…îÏ(ÄÄÄÅùïÕ—’…îÄÙÅπ’±∞Ï((ÄÄÄÅ•òÄ†ÖïπëïêπÖç—•Ÿî§Å…ï—’…∏Ï(ÄÄÄÅÕ’¡¡…ïÕÕ±•ç≠Uπ—•∞ÄÙÅ¡ï…ôΩ…µÖπçîππΩ‹†§Ä¨Ä‘»¿Ï(ÄÄÄÅ—…‰ÅÏÅâÖ»π…ï±ïÖÕïAΩ•π—ï…Ö¡—’…î°ïŸïπ–π¡Ω•π—ï…%ê§ÏÅÙÅçÖ—ç†Ä°|§ÅÌÙ((ÄÄÄÅçΩπÕ–Å¡…Ω©ïç—ïêÄÙÅïπëïêπŸÖ±’îÄ¨Åç±Öµ¿°ïπëïêπŸï±Ωç•—‰Ä®Ä∏ƒ»∞Ä¥∏‹‡∞Ä∏‹‡§Ï(ÄÄÄÅçΩπÕ–Å—Ö…ùï—%πëï‡ÄÙÅç±Öµ¿°5Ö—†π…Ω’πê°¡…Ω©ïç—ïê§∞Ä¿∞Å—…•ùùï…Ãπ±ïπù—†Ä¥Äƒ§Ï(ÄÄÄÅùïÕ—’…îÄÙÅÏÅÖç—•ŸîËÅ—…’îÅÙÏ(ÄÄÄÅÕ¡…•πùQΩ%πëï‡°ïπëïêπŸÖ±’î∞Å—Ö…ùï—%πëï‡∞ÅïπëïêπŸï±Ωç•—‰∞Åïπëïêπ¡ΩÕ•—•ΩπÃ§Ï(ÄÅÙÏ((ÄÅâÖ»πÖëëŸïπ—1•Õ—ïπï»†ù¡Ω•π—ï…ëΩ›∏ú∞Åâïù•πïÕ—’…î§Ï(ÄÅâÖ»πÖëëŸïπ—1•Õ—ïπï»†ù¡Ω•π—ï…µΩŸîú∞ÅµΩŸïïÕ—’…î∞ÅÏÅ¡ÖÕÕ•ŸîËÅôÖ±ÕîÅÙ§Ï(ÄÅâÖ»πÖëëŸïπ—1•Õ—ïπï»†ù¡Ω•π—ï…’¿ú∞ÅïπëïÕ—’…î§Ï(ÄÅâÖ»πÖëëŸïπ—1•Õ—ïπï»†ù¡Ω•π—ï…çÖπçï∞ú∞ÅïπëïÕ—’…î§Ï((ÄÅâÖ»πÖëëŸïπ—1•Õ—ïπï»†ùÕç…Ω±∞ú∞Å’¡ëÖ—ïMç…Ω±±ëùïÃ∞ÅÏÅ¡ÖÕÕ•ŸîËÅ—…’îÅÙ§Ï(ÄÅ›•πëΩ‹πÖëëŸïπ—1•Õ—ïπï»†ù…ïÕ•Èîú∞Ä†§ÄÙ¯ÅÏ(ÄÄÄÅ’¡ëÖ—ïMç…Ω±±ëùïÃ†§Ï(ÄÄÄÅ•òÄ†ÖùïÕ—’…î¸πÖç—•Ÿî§ÅÕÂπç1ïπÃ°â’——ΩπΩ»°Öç—•ŸïAÖπï∞ÅÒÅç’……ïπ—9ÖµîÅÒÄù…ïÕïÖ…ç†ú§§Ï(ÄÅÙ∞ÅÏÅ¡ÖÕÕ•ŸîËÅ—…’îÅÙ§Ï((ÄÅëΩç’µïπ–πÖëëŸïπ—1•Õ—ïπï»†ù¡Ω•π—ï…ëΩ›∏ú∞Ä°ïŸïπ–§ÄÙ¯ÅÏ(ÄÄÄÅ•òÄ†ÖÖç—•ŸïAÖπï∞§Å…ï—’…∏Ï(ÄÄÄÅ•òÄ†ÖçÖ¡Õ’±îπçΩπ—Ö•πÃ°ïŸïπ–π—Ö…ùï–§§Åç±ΩÕïAÖπï∞†§Ï(ÄÅÙ§Ï((ÄÅëΩç’µïπ–πÖëëŸïπ—1•Õ—ïπï»†ù≠ïÂëΩ›∏ú∞Ä°ïŸïπ–§ÄÙ¯ÅÏ(ÄÄÄÅ•òÄ°ïŸïπ–π≠ï‰ÄÙÙÙÄùÕçÖ¡îúÄòòÅÖç—•ŸïAÖπï∞§Åç±ΩÕïAÖπï∞°ÏÅ…ïÕ—Ω…ïΩç’ÃËÅ—…’îÅÙ§Ï(ÄÄÄÅ•òÄ†°ïŸïπ–π≠ï‰ÄÙÙÙÄù……Ω›1ïô–úÅÒÅïŸïπ–π≠ï‰ÄÙÙÙÄù……Ω›I•ù°–ú§ÄòòÅçÖ¡Õ’±îπçΩπ—Ö•πÃ°ëΩç’µïπ–πÖç—•Ÿï±ïµïπ–§§ÅÏ(ÄÄÄÄÄÅçΩπÕ–Å•πëï‡ÄÙÅ5Ö—†πµÖ‡†¿∞Å—…•ùùï…Ãπ•πëï·=ò°ëΩç’µïπ–πÖç—•Ÿï±ïµïπ–§§Ï(ÄÄÄÄÄÅçΩπÕ–Åëï±—ÑÄÙÅïŸïπ–π≠ï‰ÄÙÙÙÄù……Ω›I•ù°–úÄ¸ÄƒÄËÄ¥ƒÏ(ÄÄÄÄÄÅçΩπÕ–Åπï·–ÄÙÅ—…•ùùï…Õl°•πëï‡Ä¨Åëï±—ÑÄ¨Å—…•ùùï…Ãπ±ïπù—†§ÄîÅ—…•ùùï…Ãπ±ïπù—°tÏ(ÄÄÄÄÄÅ•òÄ°πï·–§ÅÏ(ÄÄÄÄÄÄÄÅïŸïπ–π¡…ïŸïπ—ïôÖ’±–†§Ï(ÄÄÄÄÄÄÄÅπï·–πôΩç’Ã†§Ï(ÄÄÄÄÄÄÄÅÕÂπç1ïπÃ°πï·–∞ÅÏÅçïπ—ï»ËÅ—…’îÅÙ§Ï(ÄÄÄÄÄÅÙ(ÄÄÄÅÙ(ÄÅÙ§Ï((ÄÅçΩπÕ–Å—°ïµï5ΩëïÃÄÙÅlùÖ’—ºú∞Äù±•ù°–ú∞ÄùëÖ…¨ùtÏ(ÄÅçΩπÕ–ÅÕ—Ω…ïëQ°ïµîÄÙÅ±ΩçÖ±M—Ω…Öùîπùï—%—ï¥†ùùÖ±Ω¨µ—°ïµîú§Ï(ÄÅ±ï–Å—°ïµï5ΩëîÄÙÅ—°ïµï5ΩëïÃπ•πç±’ëïÃ°Õ—Ω…ïëQ°ïµî§Ä¸ÅÕ—Ω…ïëQ°ïµîÄËÄùÖ’—ºúÏ(ÄÅçΩπÕ–ÅÕÂÕ—ïµÖ…¨ÄÙÅ›•πëΩ‹πµÖ—ç°5ïë•Ñ†ú°¡…ïôï…ÃµçΩ±Ω»µÕç°ïµîËÅëÖ…¨§ú§Ï(ÄÅçΩπÕ–Å—°ïµï5ï—ÑÄÙÅëΩç’µïπ–π≈’ï…ÂMï±ïç—Ω»†ùµï—ÖmπÖµîÙâ—°ïµîµçΩ±Ω»âtú§Ï((ÄÅçΩπÕ–Å…ïÕΩ±ŸïëQ°ïµîÄÙÄ†§ÄÙ¯Å—°ïµï5ΩëîÄÙÙÙÄùÖ’—ºúÄ¸Ä°ÕÂÕ—ïµÖ…¨πµÖ—ç°ïÃÄ¸ÄùëÖ…¨úÄËÄù±•ù°–ú§ÄËÅ—°ïµï5ΩëîÏ(ÄÅçΩπÕ–Å’¡ëÖ—ïQ°ïµï5ï—ÑÄÙÄ†§ÄÙ¯Å—°ïµï5ï—Ñ¸πÕï———…•â’—î†ùçΩπ—ïπ–ú∞Å…ïÕΩ±ŸïëQ°ïµî†§ÄÙÙÙÄùëÖ…¨úÄ¸Äúåƒƒƒ–ƒÿúÄËÄúçòÕò…ïîú§Ï((ÄÅçΩπÕ–ÅÖ¡¡±ÂQ°ïµîÄÙÄ†§ÄÙ¯ÅÏ(ÄÄÄÅ•òÄ°—°ïµï5ΩëîÄÙÙÙÄùÖ’—ºú§Å…ΩΩ–π…ïµΩŸï——…•â’—î†ùëÖ—Ñµ—°ïµîú§Ï(ÄÄÄÅï±ÕîÅ…ΩΩ–πÕï———…•â’—î†ùëÖ—Ñµ—°ïµîú∞Å—°ïµï5Ωëî§Ï(ÄÄÄÅ•òÄ°—°ïµïÂç±î§ÅÏ(ÄÄÄÄÄÅçΩπÕ–Å±Öâï∞ÄÙÅ—°ïµï5Ωëîπç°Ö…–†¿§π—ΩU¡¡ï…ÖÕî†§Ä¨Å—°ïµï5ΩëîπÕ±•çî†ƒ§Ï(ÄÄÄÄÄÅ—°ïµïÂç±îπ—ï·—Ωπ—ïπ–ÄÙÅÅQ°ïµîÉ
‹ÄëÌ±Öâï±ıÄÏ(ÄÄÄÄÄÅ—°ïµïÂç±îπÕï———…•â’—î†ùÖ…•Ñµ±Öâï∞ú∞ÅÅQ°ïµîÅÕï——•πúËÄëÌ±Öâï±Ù∏Åç—•ŸÖ—îÅ—ºÅç°ÖπùîÅ—°ïµîπÄ§Ï(ÄÄÄÅÙ(ÄÄÄÅ’¡ëÖ—ïQ°ïµï5ï—Ñ†§Ï(ÄÅÙÏ((ÄÅ—°ïµïÂç±î¸πÖëëŸïπ—1•Õ—ïπï»†ùç±•ç¨ú∞Ä†§ÄÙ¯ÅÏ(ÄÄÄÅçΩπÕ–Å•πëï‡ÄÙÅ—°ïµï5ΩëïÃπ•πëï·=ò°—°ïµï5Ωëî§Ï(ÄÄÄÅ—°ïµï5ΩëîÄÙÅ—°ïµï5ΩëïÕl°•πëï‡Ä¨Äƒ§ÄîÅ—°ïµï5ΩëïÃπ±ïπù—°tÏ(ÄÄÄÅ±ΩçÖ±M—Ω…ÖùîπÕï—%—ï¥†ùùÖ±Ω¨µ—°ïµîú∞Å—°ïµï5Ωëî§Ï(ÄÄÄÅÖ¡¡±ÂQ°ïµî†§Ï(ÄÅÙ§Ï((ÄÅÕÂÕ—ïµÖ…¨πÖëëŸïπ—1•Õ—ïπï»¸∏†ùç°Öπùîú∞Ä†§ÄÙ¯ÅÏ(ÄÄÄÅ•òÄ°—°ïµï5ΩëîÄÙÙÙÄùÖ’—ºú§Å’¡ëÖ—ïQ°ïµï5ï—Ñ†§Ï(ÄÅÙ§Ï(ÄÅÖ¡¡±ÂQ°ïµî†§Ï((ÄÅ•òÄ†ù%π—ï…Õïç—•Ωπ=âÕï…Ÿï»úÅ•∏Å›•πëΩ‹§ÅÏ(ÄÄÄÅçΩπÕ–ÅŸ•Õ•â±îÄÙÅπï‹Å5Ö¿†§Ï(ÄÄÄÅçΩπÕ–ÅΩâÕï…Ÿï»ÄÙÅπï‹Å%π—ï…Õïç—•Ωπ=âÕï…Ÿï»†°ïπ—…•ïÃ§ÄÙ¯ÅÏ(ÄÄÄÄÄÅ•òÄ°ùïÕ—’…î¸πÖç—•ŸîÅÒÅçÖ¡Õ’±îπç±ÖÕÕ1•Õ–πçΩπ—Ö•πÃ†ù•ÃµÕ¡…•πù•πúú§§Å…ï—’…∏Ï(ÄÄÄÄÄÅïπ—…•ïÃπôΩ…Öç††°ïπ—…‰§ÄÙ¯ÅŸ•Õ•â±îπÕï–°ïπ—…‰π—Ö…ùï–∞Åïπ—…‰π•π—ï…Õïç—•ΩπIÖ—•º§§Ï(ÄÄÄÄÄÅ±ï–ÅâïÕ—9ÖµîÄÙÅπ’±∞Ï(ÄÄÄÄÄÅ±ï–ÅâïÕ—IÖ—•ºÄÙÄ¿Ï(ÄÄÄÄÄÅÕïç—•Ωπ5Ö¿πôΩ…Öç††°ï±ïµïπ–∞ÅπÖµî§ÄÙ¯ÅÏ(ÄÄÄÄÄÄÄÅçΩπÕ–Å…Ö—•ºÄÙÅï±ïµïπ–Ä¸Ä°Ÿ•Õ•â±îπùï–°ï±ïµïπ–§ÅÒÄ¿§ÄËÄ¿Ï(ÄÄÄÄÄÄÄÅ•òÄ°…Ö—•ºÄ¯ÅâïÕ—IÖ—•º§ÅÏ(ÄÄÄÄÄÄÄÄÄÅâïÕ—IÖ—•ºÄÙÅ…Ö—•ºÏ(ÄÄÄÄÄÄÄÄÄÅâïÕ—9ÖµîÄÙÅπÖµîÏ(ÄÄÄÄÄÄÄÅÙ(ÄÄÄÄÄÅÙ§Ï(ÄÄÄÄÄÅ•òÄ°âïÕ—9ÖµîÄòòÅâïÕ—IÖ—•ºÄ¯Ä¿∏ƒ»§ÅµÖ…≠’……ïπ–°âïÕ—9Öµî§Ï(ÄÄÄÅÙ∞ÅÏÅ—°…ïÕ°Ω±êËÅl¿∞Ä∏ƒ»∞Ä∏»‘∞Ä∏‘∞Ä∏‹’tÅÙ§Ï(ÄÄÄÅÕïç—•Ωπ5Ö¿πôΩ…Öç††°ï±ïµïπ–§ÄÙ¯Åï±ïµïπ–ÄòòÅΩâÕï…Ÿï»πΩâÕï…Ÿî°ï±ïµïπ–§§Ï(ÄÅÙ((ÄÅ…ï≈’ïÕ—π•µÖ—•Ωπ…Öµî††§ÄÙ¯ÅÏ(ÄÄÄÅÕÂπç1ïπÃ°â’——Ωπº(∞Äù…ïÕïÖ…ç†ú§§Ï(ÄÄÄÅ’¡ëÖ—ïMç…Ω±±ëùïÃ†§Ï(ÄÅÙ§Ï)Ù§†§Ï