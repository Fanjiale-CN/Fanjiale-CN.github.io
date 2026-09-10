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
  const cases = files.map((file, i) => ({
    label: `PLATE ${String(i + 1).padStart(2, '0')}`,
    src: base + file
  }));

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

  let selected = 0;
  let playing = false;
  let raf = 0;
  let cells = [];
  let image = null;
  let colorsReady = false;
  let runStarted = 0;

  const phases = [
    { at: 0.00, label: 'Reading source structure...' },
    { at: 0.18, label: 'Identifying visual anchors...' },
    { at: 0.38, label: 'Disassembling composition...' },
    { at: 0.58, label: 'Recomposing visual hierarchy...' },
    { at: 0.78, label: 'Applying print treatment...' },
    { at: 0.94, label: 'Finalizing reconstruction...' }
  ];
  const duration = 6200;

  const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, n));
  const smooth = t => t * t * (3 - 2 * t);
  const hash = (x, y, z) => {
    const n = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
    return n - Math.floor(n);
  };

  function makeCell(x, y, w, h, depth = 0) {
    return { x, y, w, h, depth, tone: hash(x + .31, y + .79, w * 17.3), r: 0, g: 0, b: 0, detail: 0, split: 0 };
  }

  function buildCells(aspect) {
    const leaves = [makeCell(0, 0, 1, 1, 0)];
    while (leaves.length < 150) {
      let pick = 0;
      let score = -1;
      leaves.forEach((c, i) => {
        const area = c.w * aspect * c.h * (1 + .12 * hash(c.x, c.y, 4.7));
        if (area > score) { score = area; pick = i; }
      });
      const p = leaves.splice(pick, 1)[0];
      const wide = p.w * aspect >= p.h;
      const a = wide
        ? makeCell(p.x, p.y, p.w / 2, p.h, p.depth + 1)
        : makeCell(p.x, p.y, p.w, p.h / 2, p.depth + 1);
      const b = wide
        ? makeCell(p.x + p.w / 2, p.y, p.w / 2, p.h, p.depth + 1)
        : makeCell(p.x, p.y + p.h / 2, p.w, p.h / 2, p.depth + 1);
      leaves.push(a, b);
    }
    leaves.sort((a, b) => (b.w * b.h) - (a.w * a.h));
    leaves.forEach((c, i) => { c.split = i / Math.max(1, leaves.length - 1); });
    return leaves;
  }

  function sizeCanvas() {
    const rect = reveal.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    const aspect = canvas.width / canvas.height;
    cells = buildCells(aspect);
    if (image && colorsReady) measureCells();
  }

  function cover(iw, ih, w, h) {
    const scale = Math.max(w / iw, h / ih);
    return { dx: (w - iw * scale) / 2, dy: (h - ih * scale) / 2, dw: iw * scale, dh: ih * scale };
  }

  function measureCells() {
    if (!image || !image.naturalWidth) return;
    const sample = document.createElement('canvas');
    const aspect = canvas.width / canvas.height;
    sample.width = 144;
    sample.height = Math.max(80, Math.round(144 / aspect));
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
        for (let y = y0; y < y1; y += 2) {
          for (let x = x0; x < x1; x += 2) {
            const idx = (y * sample.width + x) * 4;
            const rr = pixels[idx], gg = pixels[idx + 1], bb = pixels[idx + 2];
            const l = .299 * rr + .587 * gg + .114 * bb;
            n++; r += rr; g += gg; b += bb; lum += l; lum2 += l * l;
          }
        }
        n ||= 1;
        c.r = r / n; c.g = g / n; c.b = b / n;
        c.detail = Math.max(0, lum2 / n - Math.pow(lum / n, 2));
      });
      cells.sort((a, b) => b.detail - a.detail);
      cells.forEach((c, i) => { c.split = i / Math.max(1, cells.length - 1); });
      colorsReady = true;
    } catch (_) {
      colorsReady = false;
    }
  }

  function draw(progress) {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#c8c0b5';
    ctx.fillRect(0, 0, w, h);

    const visible = .08 + progress * .92;
    const gutter = Math.max(0, (1 - progress) * Math.min(w, h) * .0045);
    const tint = smooth(clamp((progress - .24) / .58));

    cells.forEach(c => {
      if (c.split > visible) return;
      const x = Math.round(c.x * w + gutter);
      const y = Math.round(c.y * h + gutter);
      const cw = Math.max(1, Math.round(c.w * w - gutter * 2));
      const ch = Math.max(1, Math.round(c.h * h - gutter * 2));
      const grey = 205 + c.tone * 28;
      const rr = Math.round(grey + (c.r - grey) * tint);
      const gg = Math.round(grey + (c.g - grey) * tint);
      const bb = Math.round(grey + (c.b - grey) * tint);
      ctx.fillStyle = `rgb(${rr},${gg},${bb})`;
      ctx.fillRect(x, y, cw, ch);
    });

    if (image && progress > .91) {
      const a = smooth(clamp((progress - .91) / .09));
      const fit = cover(image.naturalWidth, image.naturalHeight, w, h);
      ctx.globalAlpha = a;
      ctx.drawImage(image, fit.dx, fit.dy, fit.dw, fit.dh);
      ctx.globalAlpha = 1;
    }
  }

  function loadCase(index) {
    selected = clamp(Number(index) || 0, 0, cases.length - 1);
    const item = cases[selected];
    label.textContent = item.label;
    sourcePreview.src = item.src;
    result.src = item.src;
    reveal.classList.remove('is-finished');
    outputState.textContent = 'WAITING';
    caption.textContent = 'READY / RUN DEMO';
    stage.textContent = 'Ready to reconstruct.';
    elapsed.textContent = '00.0s';
    progressBar.style.width = '0%';
    steps.forEach(step => step.classList.remove('is-current', 'is-done'));
    caseButtons.forEach((button, i) => {
      const active = i === selected;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    colorsReady = false;
    image = new Image();
    image.crossOrigin = 'anonymous';
    image.decoding = 'async';
    image.onload = () => { measureCells(); draw(0); };
    image.onerror = () => { colorsReady = false; draw(0); };
    image.src = item.src;
    draw(0);
  }

  function phaseAt(progress) {
    let phase = 0;
    phases.forEach((item, i) => { if (progress >= item.at) phase = i; });
    return phase;
  }

  function animate(now) {
    if (!playing) return;
    const ms = now - runStarted;
    const progress = clamp(ms / duration);
    const phase = phaseAt(progress);
    stage.textContent = phases[phase].label;
    elapsed.textContent = `${(ms / 1000).toFixed(1).padStart(4, '0')}s`;
    progressBar.style.width = `${Math.round(progress * 100)}%`;
    caption.textContent = `${String(Math.round(progress * 100)).padStart(2, '0')}% / ${phases[phase].label.toUpperCase()}`;
    steps.forEach((step, i) => {
      step.classList.toggle('is-current', i === Math.min(phase, steps.length - 1));
      step.classList.toggle('is-done', i < phase || progress === 1);
    });
    draw(progress);

    if (progress < 1) {
      raf = requestAnimationFrame(animate);
      return;
    }
    playing = false;
    run.disabled = false;
    run.querySelector('span').textContent = 'RUN AGAIN';
    reveal.classList.add('is-finished');
    outputState.textContent = 'COMPLETE';
    caption.textContent = 'RECONSTRUCTION COMPLETE';
    stage.textContent = 'Reconstruction complete.';
  }

  function start() {
    if (playing) return;
    playing = true;
    cancelAnimationFrame(raf);
    reveal.classList.remove('is-finished');
    outputState.textContent = 'PROCESSING';
    run.disabled = true;
    run.querySelector('span').textContent = 'RECONSTRUCTING';
    runStarted = performance.now();
    raf = requestAnimationFrame(animate);
  }

  caseButtons.forEach(button => {
    button.addEventListener('click', () => {
      if (playing) return;
      loadCase(button.dataset.ppCase);
    });
  });
  run.addEventListener('click', start);

  const resize = typeof ResizeObserver === 'function' ? new ResizeObserver(sizeCanvas) : null;
  resize?.observe(reveal);
  window.addEventListener('resize', sizeCanvas, { passive: true });
  sizeCanvas();
  loadCase(0);
})();
