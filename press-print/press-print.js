(() => {
  const root = document.querySelector('[data-pp-demo]');
  if (!root || root.dataset.ready === 'true') return;
  root.dataset.ready = 'true';

  const files = [
    '0D0EB3E7-CDA9-4F6C-B8C5-B6613F6CEBCB.png',
    '2045E30A-8BAE-4625-B726-1EBC31166618.png',
    '43A519AD-FAA7-40EE-9425-D8EA1CCAA11C.png',
    '48FEE737-3D46-446B-AAEF-6F1ADB22E70F.png'
  ];
  const base = 'https://raw.githubusercontent.com/Fanjiale-CN/press-print/main/examples/showcase/';
  const cases = files.map((file, i) => ({ label: `PLATE ${String(i + 1).padStart(2, '0')}`, src: base + file }));

  const run = root.querySelector('[data-pp-run]');
  const caseButtons = [...root.querySelectorAll('[data-pp-case]')];
  const sourcePreview = root.querySelector('[data-pp-source-preview]');
  const result = root.querySelector('[data-pp-result]');
  const label = root.querySelector('[data-pp-case-label]');
  const stage = root.querySelector('[data-pp-stage]');
  const elapsed = root.querySelector('[data-pp-elapsed]');
  const progressBar = root.querySelector('[data-pp-progress]');
  const outputState = root.querySelector('[data-pp-output-state]');
  const reveal = root.querySelector('[data-pp-reveal]');
  const caption = root.querySelector('[data-pp-grid-caption]');
  const canvas = root.querySelector('[data-pp-canvas]');
  const ctx = canvas?.getContext('2d');
  const steps = [...root.querySelectorAll('[data-pp-step]')];
  if (!run || !sourcePreview || !result || !label || !stage || !elapsed || !progressBar || !outputState || !reveal || !caption || !canvas || !ctx) return;

  let selected = 0, playing = false, raf = 0, cells = [], image = null, colorsReady = false, runStarted = 0;
  const phases = [
    { at: 0.00, label: 'Reading source structure...' },
    { at: 0.17, label: 'Identifying visual anchors...' },
    { at: 0.36, label: 'Disassembling composition...' },
    { at: 0.57, label: 'Recomposing visual hierarchy...' },
    { at: 0.78, label: 'Applying print treatment...' },
    { at: 0.94, label: 'Finalizing reconstruction...' }
  ];
  const duration = 6400;
  const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, n));
  const smooth = t => t * t * (3 - 2 * t);
  const hash = (x, y, z) => { const n = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return n - Math.floor(n); };

  function makeCell(x, y, w, h, depth = 0) {
    return { x, y, w, h, depth, tone: hash(x + .31, y + .79, w * 17.3), r: 0, g: 0, b: 0, detail: 0, split: 0 };
  }

  function buildCells(aspect) {
    const leaves = [makeCell(0, 0, 1, 1, 0)];
    while (leaves.length < 180) {
      let pick = 0, score = -1;
      leaves.forEach((c, i) => {
        const area = c.w * aspect * c.h * (1 + .16 * hash(c.x, c.y, 4.7));
        if (area > score) { score = area; pick = i; }
      });
      const p = leaves.splice(pick, 1)[0];
      const wide = p.w * aspect >= p.h;
      const bias = .42 + hash(p.x, p.y, p.depth + 1) * .16;
      const a = wide ? makeCell(p.x, p.y, p.w * bias, p.h, p.depth + 1) : makeCell(p.x, p.y, p.w, p.h * bias, p.depth + 1);
      const b = wide ? makeCell(p.x + p.w * bias, p.y, p.w * (1 - bias), p.h, p.depth + 1) : makeCell(p.x, p.y + p.h * bias, p.w, p.h * (1 - bias), p.depth + 1);
      leaves.push(a, b);
    }
    leaves.sort((a, b) => (b.w * b.h) - (a.w * a.h));
    leaves.forEach((c, i) => { c.split = i / Math.max(1, leaves.length - 1); });
    return leaves;
  }

  function cover(iw, ih, w, h) {
    const scale = Math.max(w / iw, h / ih);
    return { dx: (w - iw * scale) / 2, dy: (h - ih * scale) / 2, dw: iw * scale, dh: ih * scale };
  }

  function sizeCanvas() {
    const rect = reveal.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    cells = buildCells(canvas.width / canvas.height);
    if (image && colorsReady) measureCells();
    draw(playing ? clamp((performance.now() - runStarted) / duration) : 0);
  }

  function measureCells() {
    if (!image || !image.naturalWidth) return;
    const sample = document.createElement('canvas');
    const aspect = canvas.width / canvas.height;
    sample.width = 160;
    sample.height = Math.max(90, Math.round(sample.width / aspect));
    const sctx = sample.getContext('2d', { willReadFrequently: true });
    if (!sctx) return;
    const fit = cover(image.naturalWidth, image.naturalHeight, sample.width, sample.height);
    sctx.drawImage(image, fit.dx, fit.dy, fit.dw, fit.dh);
    try {
      const pixels = sctx.getImageData(0, 0, sample.width, sample.height).data;
      cells.forEach(c => {
        const x0 = clamp(Math.floor(c.x * sample.width), 0, sample.width - 1);
        const y0 = clamp(Math.floor(c.y * sample.height), 0, sample.height - 1);
        const x1 = clamp(Math.ceil((c.x + c.w) * sample.width), x0 + 1, sample.width);
        const y1 = clamp(Math.ceil((c.y + c.h) * sample.height), y0 + 1, sample.height);
        let n = 0, r = 0, g = 0, b = 0, lum = 0, lum2 = 0;
        for (let y = y0; y < y1; y += 2) for (let x = x0; x < x1; x += 2) {
          const idx = (y * sample.width + x) * 4, rr = pixels[idx], gg = pixels[idx + 1], bb = pixels[idx + 2];
          const l = .299 * rr + .587 * gg + .114 * bb;
          n++; r += rr; g += gg; b += bb; lum += l; lum2 += l * l;
        }
        n ||= 1; c.r = r / n; c.g = g / n; c.b = b / n; c.detail = Math.max(0, lum2 / n - Math.pow(lum / n, 2));
      });
      cells.sort((a, b) => b.detail - a.detail);
      cells.forEach((c, i) => { c.split = i / Math.max(1, cells.length - 1); });
      colorsReady = true;
    } catch (_) { colorsReady = false; }
  }

  function draw(progress) {
    const w = canvas.width, h = canvas.height;
    if (!w || !h) return;
    ctx.clearRect(0, 0, w, h); ctx.fillStyle = '#1b1b1b'; ctx.fillRect(0, 0, w, h);
    const visible = .04 + progress * .96;
    const gutter = Math.max(0, (1 - progress) * Math.min(w, h) * .007);
    const tint = smooth(clamp((progress - .18) / .60));
    const punch = smooth(clamp((progress - .58) / .28));
    cells.forEach(c => {
      if (c.split > visible) return;
      const x = Math.round(c.x * w + gutter), y = Math.round(c.y * h + gutter);
      const cw = Math.max(1, Math.round(c.w * w - gutter * 2)), ch = Math.max(1, Math.round(c.h * h - gutter * 2));
      const grey = 38 + c.tone * 100;
      let rr = grey + (c.r - grey) * tint, gg = grey + (c.g - grey) * tint, bb = grey + (c.b - grey) * tint;
      if (punch > 0 && c.split > .62 && c.split < .78) { rr = rr * (1 - punch) + 35 * punch; gg = gg * (1 - punch) + 71 * punch; bb = bb * (1 - punch) + 255 * punch; }
      else if (punch > 0 && c.split > .80 && c.split < .88) { rr = rr * (1 - punch) + 255 * punch; gg = gg * (1 - punch) + 59 * punch; bb = bb * (1 - punch) + 48 * punch; }
      ctx.fillStyle = `rgb(${Math.round(rr)},${Math.round(gg)},${Math.round(bb)})`; ctx.fillRect(x, y, cw, ch);
    });
    if (image && progress > .91) {
      const a = smooth(clamp((progress - .91) / .09));
      const fit = cover(image.naturalWidth, image.naturalHeight, w, h);
      ctx.globalAlpha = a; ctx.drawImage(image, fit.dx, fit.dy, fit.dw, fit.dh); ctx.globalAlpha = 1;
    }
  }

  function resetState() {
    playing = false; cancelAnimationFrame(raf); root.classList.remove('is-running', 'is-finished'); reveal.classList.remove('is-finished');
    outputState.textContent = 'WAITING'; caption.textContent = 'READY / RUN DEMO'; stage.textContent = 'Ready to reconstruct.'; elapsed.textContent = '00.0s';
    progressBar.style.width = '0%'; run.disabled = false; run.querySelector('span').textContent = 'RUN RECONSTRUCTION';
    steps.forEach(step => step.classList.remove('is-current', 'is-done'));
  }

  function loadCase(index) {
    selected = clamp(Number(index) || 0, 0, cases.length - 1); const item = cases[selected]; resetState();
    label.textContent = item.label; sourcePreview.src = item.src; result.src = item.src;
    caseButtons.forEach((button, i) => { const active = i === selected; button.classList.toggle('is-active', active); button.setAttribute('aria-pressed', String(active)); });
    colorsReady = false; image = new Image(); image.crossOrigin = 'anonymous'; image.decoding = 'async';
    image.onload = () => { measureCells(); draw(0); }; image.onerror = () => { colorsReady = false; draw(0); }; image.src = item.src; draw(0);
  }

  function phaseAt(progress) { let phase = 0; phases.forEach((item, i) => { if (progress >= item.at) phase = i; }); return phase; }

  function animate(now) {
    if (!playing) return;
    const ms = now - runStarted, progress = clamp(ms / duration), phase = phaseAt(progress);
    stage.textContent = phases[phase].label; elapsed.textContent = `${(ms / 1000).toFixed(1).padStart(4, '0')}s`;
    progressBar.style.width = `${Math.round(progress * 100)}%`;
    caption.textContent = `${String(Math.round(progress * 100)).padStart(2, '0')}% / ${phases[phase].label.toUpperCase()}`;
    steps.forEach((step, i) => { step.classList.toggle('is-current', i === Math.min(phase, steps.length - 1)); step.classList.toggle('is-done', i < phase || progress === 1); });
    draw(progress);
    if (progress < 1) { raf = requestAnimationFrame(animate); return; }
    playing = false; root.classList.remove('is-running'); root.classList.add('is-finished'); run.disabled = false;
    run.querySelector('span').textContent = 'RUN AGAIN'; reveal.classList.add('is-finished'); outputState.textContent = 'COMPLETE';
    caption.textContent = 'RECONSTRUCTION COMPLETE'; stage.textContent = 'Reconstruction complete.';
  }

  function start() {
    if (playing) return;
    playing = true; cancelAnimationFrame(raf); root.classList.remove('is-finished'); root.classList.add('is-running'); reveal.classList.remove('is-finished');
    outputState.textContent = 'PROCESSING'; run.disabled = true; run.querySelector('span').textContent = 'RECONSTRUCTING'; runStarted = performance.now(); raf = requestAnimationFrame(animate);
    window.setTimeout(() => root.querySelector('.pp-agent-frame')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' }), 220);
  }

  caseButtons.forEach(button => button.addEventListener('click', () => { if (!playing) loadCase(button.dataset.ppCase); }));
  run.addEventListener('click', start);
  const resize = typeof ResizeObserver === 'function' ? new ResizeObserver(sizeCanvas) : null;
  resize?.observe(reveal); window.addEventListener('resize', sizeCanvas, { passive: true }); sizeCanvas(); loadCase(0);
})();

(() => {
  const board = document.querySelector('.pp-hero-board');
  if (!board || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const pieces = [...board.querySelectorAll('.pp-board-blue, .pp-board-red, .pp-board-lime, .pp-board-type')];
  board.addEventListener('pointermove', event => {
    const rect = board.getBoundingClientRect(), x = (event.clientX - rect.left) / rect.width - .5, y = (event.clientY - rect.top) / rect.height - .5;
    pieces.forEach((piece, i) => { const depth = (i + 1) * 2.2; piece.style.translate = `${x * depth}px ${y * depth}px`; });
  });
  board.addEventListener('pointerleave', () => pieces.forEach(piece => { piece.style.translate = ''; }));
})();
