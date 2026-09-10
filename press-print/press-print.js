(() => {
  const root = document.querySelector('[data-pp-demo]');
  if (!root || root.dataset.ready === 'true') return;
  root.dataset.ready = 'true';

  const base = 'https://raw.githubusercontent.com/Fanjiale-CN/press-print/main/examples/showcase/';
  const local = '/press-print/assets/demo/';
  const sourceAtlasPayload = local + 'source-atlas-v2.b64';
  let sourceAtlasUrl = '';
  let sourceAtlasPromise = null;
  const cases = [
    { label: '01 / TRAIN INTERIOR', type: 'TRAIN INTERIOR', result: base + '0D0EB3E7-CDA9-4F6C-B8C5-B6613F6CEBCB.png' },
    { label: '02 / MUSEUM', type: 'SHAANXI HISTORY MUSEUM', result: base + '2045E30A-8BAE-4625-B726-1EBC31166618.png' },
    { label: '03 / SHIBUYA', type: 'SHIBUYA', result: base + '43A519AD-FAA7-40EE-9425-D8EA1CCAA11C.png' },
    { label: '04 / METRO SIGN', type: 'METRO SIGN', result: base + '48FEE737-3D46-446B-AAEF-6F1ADB22E70F.png' },
    { label: '05 / DANCE', type: 'DANCE PERFORMANCE', result: base + 'A9F371AC-D68C-4BC5-AD10-261487723695.png' },
    { label: '06 / AERIAL PERFORMANCE', type: 'AERIAL PERFORMANCE', result: base + '8E3C63CD-7AD2-4E0A-A4AD-AB9C82A9044A.png' },
    { label: '07 / NOODLE SHELF', type: 'NOODLE SHELF', result: base + 'C24DF515-DCB7-4D3A-A871-BDC8F58B38C1.png' },
    { label: '08 / TEMPLE + AIRCRAFT', type: 'TEMPLE + AIRCRAFT', result: local + '08-temple-plane-result.webp' },
    { label: '09 / XIAMEN COAST', type: 'XIAMEN COAST', result: local + '09-xiamen-result.webp' }
  ];

  const run = root.querySelector('[data-pp-run]');
  const caseButtons = [...root.querySelectorAll('[data-pp-case]')];
  const sourcePreview = root.querySelector('[data-pp-source-preview]');
  const result = root.querySelector('[data-pp-result]');
  const label = root.querySelector('[data-pp-case-label]');
  const attachmentLabel = root.querySelector('.pp-chat-attachment figcaption b');
  const stage = root.querySelector('[data-pp-stage]');
  const elapsed = root.querySelector('[data-pp-elapsed]');
  const progressBar = root.querySelector('[data-pp-progress]');
  const outputState = root.querySelector('[data-pp-output-state]');
  const reveal = root.querySelector('[data-pp-reveal]');
  const caption = root.querySelector('[data-pp-grid-caption]');
  const canvas = root.querySelector('[data-pp-canvas]');
  const thread = root.querySelector('[data-pp-chat-thread]');
  const copy = root.querySelector('[data-pp-copy]');
  const steps = [...root.querySelectorAll('[data-pp-step]')];
  const ctx = canvas?.getContext('2d');

  if (!run || !sourcePreview || !result || !label || !stage || !elapsed || !progressBar || !outputState || !reveal || !caption || !canvas || !ctx || !thread) return;

  const phases = [
    { at: 0.00, label: 'Reading source structure...' },
    { at: 0.17, label: 'Identifying visual anchors...' },
    { at: 0.36, label: 'Disassembling composition...' },
    { at: 0.57, label: 'Recomposing visual hierarchy...' },
    { at: 0.78, label: 'Applying print treatment...' },
    { at: 0.94, label: 'Finalizing reconstruction...' }
  ];

  const duration = 6800;
  let selected = 0;
  let playing = false;
  let raf = 0;
  let cells = [];
  let image = null;
  let colorsReady = false;
  let runStarted = 0;
  let lastPhase = -1;

  const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, n));

  function ensureSourceAtlas() {
    if (sourceAtlasUrl) return Promise.resolve(sourceAtlasUrl);
    if (sourceAtlasPromise) return sourceAtlasPromise;

    sourceAtlasPromise = fetch(sourceAtlasPayload, { cache: 'force-cache' })
      .then(response => {
        if (!response.ok) throw new Error(`Source atlas HTTP ${response.status}`);
        return response.text();
      })
      .then(base64 => {
        const clean = base64.replace(/\s+/g, '');
        if (!clean.startsWith('UklGR')) throw new Error('Invalid source atlas payload');
        sourceAtlasUrl = `data:image/webp;base64,${clean}`;
        return sourceAtlasUrl;
      })
      .catch(error => {
        sourceAtlasPromise = null;
        console.error('[Press-Print] Failed to load source atlas', error);
        throw error;
      });

    return sourceAtlasPromise;
  }
  const smooth = t => t * t * (3 - 2 * t);
  const hash = (x, y, z) => {
    const n = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
    return n - Math.floor(n);
  };

  function makeCell(x, y, w, h, depth = 0) {
    return {
      x, y, w, h, depth,
      tone: hash(x + .31, y + .79, w * 17.3),
      r: 0, g: 0, b: 0,
      detail: 0,
      split: 0
    };
  }

  function buildCells(aspect) {
    const leaves = [makeCell(0, 0, 1, 1, 0)];
    while (leaves.length < 180) {
      let pick = 0;
      let score = -1;
      leaves.forEach((cell, index) => {
        const area = cell.w * aspect * cell.h * (1 + .12 * hash(cell.x, cell.y, 4.7));
        if (area > score) {
          score = area;
          pick = index;
        }
      });

      const parent = leaves.splice(pick, 1)[0];
      const wide = parent.w * aspect >= parent.h;
      const jitter = .46 + hash(parent.x, parent.y, parent.depth) * .08;

      if (wide) {
        leaves.push(
          makeCell(parent.x, parent.y, parent.w * jitter, parent.h, parent.depth + 1),
          makeCell(parent.x + parent.w * jitter, parent.y, parent.w * (1 - jitter), parent.h, parent.depth + 1)
        );
      } else {
        leaves.push(
          makeCell(parent.x, parent.y, parent.w, parent.h * jitter, parent.depth + 1),
          makeCell(parent.x, parent.y + parent.h * jitter, parent.w, parent.h * (1 - jitter), parent.depth + 1)
        );
      }
    }

    leaves.sort((a, b) => (b.w * b.h) - (a.w * a.h));
    leaves.forEach((cell, i) => {
      cell.split = i / Math.max(1, leaves.length - 1);
    });
    return leaves;
  }

  function cover(iw, ih, w, h) {
    const scale = Math.max(w / iw, h / ih);
    return {
      dx: (w - iw * scale) / 2,
      dy: (h - ih * scale) / 2,
      dw: iw * scale,
      dh: ih * scale
    };
  }

  function sizeCanvas() {
    const rect = reveal.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    cells = buildCells(canvas.width / canvas.height);
    if (image && colorsReady) measureCells();
    draw(0);
  }

  function measureCells() {
    if (!image || !image.naturalWidth || !canvas.width || !canvas.height) return;

    const sample = document.createElement('canvas');
    const aspect = canvas.width / canvas.height;
    sample.width = 180;
    sample.height = Math.max(96, Math.round(sample.width / aspect));
    const sctx = sample.getContext('2d', { willReadFrequently: true });
    if (!sctx) return;

    const fit = cover(image.naturalWidth, image.naturalHeight, sample.width, sample.height);
    sctx.drawImage(image, fit.dx, fit.dy, fit.dw, fit.dh);

    try {
      const pixels = sctx.getImageData(0, 0, sample.width, sample.height).data;
      cells.forEach(cell => {
        const x0 = clamp(Math.floor(cell.x * sample.width), 0, sample.width - 1);
        const y0 = clamp(Math.floor(cell.y * sample.height), 0, sample.height - 1);
        const x1 = clamp(Math.ceil((cell.x + cell.w) * sample.width), x0 + 1, sample.width);
        const y1 = clamp(Math.ceil((cell.y + cell.h) * sample.height), y0 + 1, sample.height);
        let n = 0, r = 0, g = 0, b = 0, lum = 0, lum2 = 0;

        for (let y = y0; y < y1; y += 2) {
          for (let x = x0; x < x1; x += 2) {
            const idx = (y * sample.width + x) * 4;
            const rr = pixels[idx];
            const gg = pixels[idx + 1];
            const bb = pixels[idx + 2];
            const l = .299 * rr + .587 * gg + .114 * bb;
            n += 1;
            r += rr;
            g += gg;
            b += bb;
            lum += l;
            lum2 += l * l;
          }
        }

        n ||= 1;
        cell.r = r / n;
        cell.g = g / n;
        cell.b = b / n;
        cell.detail = Math.max(0, lum2 / n - Math.pow(lum / n, 2));
      });

      cells.sort((a, b) => b.detail - a.detail);
      cells.forEach((cell, i) => {
        cell.split = i / Math.max(1, cells.length - 1);
      });
      colorsReady = true;
    } catch (_) {
      colorsReady = false;
    }
  }

  function draw(progress) {
    const w = canvas.width;
    const h = canvas.height;
    if (!w || !h) return;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#d6d8dc';
    ctx.fillRect(0, 0, w, h);

    const visible = .06 + progress * .94;
    const gutter = Math.max(0, (1 - progress) * Math.min(w, h) * .0052);
    const tint = smooth(clamp((progress - .22) / .6));
    const electric = smooth(clamp((progress - .38) / .32)) * (1 - smooth(clamp((progress - .78) / .18)));

    cells.forEach((cell, index) => {
      if (cell.split > visible) return;

      const x = Math.round(cell.x * w + gutter);
      const y = Math.round(cell.y * h + gutter);
      const cw = Math.max(1, Math.round(cell.w * w - gutter * 2));
      const ch = Math.max(1, Math.round(cell.h * h - gutter * 2));
      const grey = 190 + cell.tone * 48;
      let rr = grey + (cell.r - grey) * tint;
      let gg = grey + (cell.g - grey) * tint;
      let bb = grey + (cell.b - grey) * tint;

      if (electric > .03) {
        const selector = (index + cell.depth) % 11;
        if (selector === 0 || selector === 5) {
          rr = rr * (1 - electric) + 35 * electric;
          gg = gg * (1 - electric) + 71 * electric;
          bb = bb * (1 - electric) + 255 * electric;
        } else if (selector === 3) {
          rr = rr * (1 - electric) + 255 * electric;
          gg = gg * (1 - electric) + 59 * electric;
          bb = bb * (1 - electric) + 48 * electric;
        }
      }

      ctx.fillStyle = `rgb(${Math.round(rr)},${Math.round(gg)},${Math.round(bb)})`;
      ctx.fillRect(x, y, cw, ch);
    });

    if (image && progress > .91) {
      const alpha = smooth(clamp((progress - .91) / .09));
      const fit = cover(image.naturalWidth, image.naturalHeight, w, h);
      ctx.globalAlpha = alpha;
      ctx.drawImage(image, fit.dx, fit.dy, fit.dw, fit.dh);
      ctx.globalAlpha = 1;
    }
  }

  function scrollConversation(behavior = 'smooth') {
    requestAnimationFrame(() => {
      thread.scrollTo({ top: thread.scrollHeight, behavior });
    });
  }

  function resetConversation() {
    playing = false;
    cancelAnimationFrame(raf);
    root.classList.remove('is-running', 'is-finished');
    reveal.classList.remove('is-finished');
    run.disabled = false;
    run.querySelector('span').textContent = 'RUN RECONSTRUCTION';
    outputState.textContent = 'WAITING';
    stage.textContent = 'Ready to reconstruct.';
    elapsed.textContent = '00.0s';
    progressBar.style.width = '0%';
    caption.textContent = 'READY / ORIGINAL → PRESS-PRINT';
    steps.forEach(step => step.classList.remove('is-current', 'is-done'));
    lastPhase = -1;
    draw(0);
    thread.scrollTo({ top: 0, behavior: 'auto' });
  }

  function loadCase(index) {
    selected = clamp(Number(index) || 0, 0, cases.length - 1);
    const item = cases[selected];
    label.textContent = item.label;
    if (attachmentLabel) attachmentLabel.textContent = `ORIGINAL / ${String(selected + 1).padStart(2, '0')}`;
    const caseIndex = selected;
    sourcePreview.removeAttribute('src');
    sourcePreview.alt = `Original source photograph for ${item.type}`;
    sourcePreview.style.width = `${cases.length * 100}%`;
    sourcePreview.style.height = '100%';
    sourcePreview.style.maxWidth = 'none';
    sourcePreview.style.transform = `translateX(-${selected * (100 / cases.length)}%)`;
    ensureSourceAtlas()
      .then(url => {
        if (selected !== caseIndex) return;
        sourcePreview.src = url;
      })
      .catch(() => {
        if (selected === caseIndex) sourcePreview.alt = 'Source photograph unavailable.';
      });
    result.src = item.result;

    caseButtons.forEach((button, i) => {
      const active = i === selected;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    colorsReady = false;
    image = new Image();
    image.crossOrigin = 'anonymous';
    image.decoding = 'async';
    image.onload = () => {
      reveal.style.aspectRatio = `${image.naturalWidth} / ${image.naturalHeight}`;
      measureCells();
      sizeCanvas();
      draw(0);
    };
    image.onerror = () => {
      colorsReady = false;
      draw(0);
    };
    image.src = item.result;

    resetConversation();
  }

  function phaseAt(progress) {
    let phase = 0;
    phases.forEach((item, i) => {
      if (progress >= item.at) phase = i;
    });
    return phase;
  }

  function animate(now) {
    if (!playing) return;

    const ms = now - runStarted;
    const progress = clamp(ms / duration);
    const phase = phaseAt(progress);

    if (phase !== lastPhase) {
      lastPhase = phase;
      scrollConversation();
    }

    stage.textContent = phases[phase].label;
    elapsed.textContent = `${(ms / 1000).toFixed(1).padStart(4, '0')}s`;
    progressBar.style.width = `${Math.round(progress * 100)}%`;
    caption.textContent = `${String(Math.round(progress * 100)).padStart(2, '0')}% / ${phases[phase].label.toUpperCase()}`;

    steps.forEach((step, i) => {
      const activePhase = Math.min(phase, steps.length - 1);
      step.classList.toggle('is-current', i === activePhase && progress < 1);
      step.classList.toggle('is-done', i < activePhase || progress === 1);
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
    root.classList.remove('is-running');
    root.classList.add('is-finished');
    outputState.textContent = 'COMPLETE';
    caption.textContent = 'PRESS-PRINT RECONSTRUCTION COMPLETE';
    stage.textContent = 'Reconstruction complete.';
    scrollConversation();
  }

  function start() {
    if (playing) return;

    playing = true;
    cancelAnimationFrame(raf);
    root.classList.remove('is-finished');
    root.classList.add('is-running');
    reveal.classList.remove('is-finished');
    outputState.textContent = 'PROCESSING';
    stage.textContent = phases[0].label;
    run.disabled = true;
    run.querySelector('span').textContent = 'RECONSTRUCTING';
    progressBar.style.width = '0%';
    lastPhase = -1;
    runStarted = performance.now();

    setTimeout(() => {
      sizeCanvas();
      scrollConversation();
    }, 360);

    raf = requestAnimationFrame(animate);
  }

  caseButtons.forEach(button => {
    button.addEventListener('click', () => {
      if (playing) return;
      loadCase(button.dataset.ppCase);
    });
  });

  run.addEventListener('click', start);

  copy?.addEventListener('click', async () => {
    const text = '@Press-Print Transform this photograph with Press-Print. Do not add new text or typography.';
    const previous = copy.textContent;
    try {
      await navigator.clipboard.writeText(text);
      copy.textContent = 'COPIED';
    } catch (_) {
      copy.textContent = 'COPY FAILED';
    }
    setTimeout(() => { copy.textContent = previous; }, 1200);
  });

  const resize = typeof ResizeObserver === 'function' ? new ResizeObserver(sizeCanvas) : null;
  resize?.observe(reveal);
  window.addEventListener('resize', sizeCanvas, { passive: true });

  sizeCanvas();
  loadCase(0);
})();

(() => {
  const board = document.querySelector('.pp-hero-board');
  if (!board || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const pieces = [...board.querySelectorAll('.pp-board-blue,.pp-board-red,.pp-board-lime,.pp-board-type')];
  board.addEventListener('pointermove', event => {
    const rect = board.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    pieces.forEach((piece, i) => {
      const power = (i + 1) * 2.1;
      piece.style.translate = `${x * power}px ${y * power}px`;
    });
  });
  board.addEventListener('pointerleave', () => pieces.forEach(piece => { piece.style.translate = ''; }));
})();