/* galok-growth — a hand-drawn growth story told by code.
   Seed → water → break the line → roots → tree → fruit → back to seed.
   ~42s loop, opacity + transform only (plus SVG stroke-dashoffset draw-ins,
   which are pure stroke painting, never layout). Respects reduced motion. */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var INK = '#171717';
  var RED = '#9e2a2b';
  var PAPER = '#f7f4ef';

  var CYCLE = 42000; // ms, matches BGM 41.09s loop
  var sceneStarts = [
    0.00, // sow: seed pressed into the earth
    0.12, // water: can tilts, drops fall
    0.22, // sprout: stem breaks the line
    0.32, // roots: root network spreads below
    0.42, // grow: trunk rises, canopy draws itself
    0.60, // fruit: red berries appear one by one
    0.78, // wind / settle: canopy sways gently
    0.90  // return: fruit fall, scene fades back to seed
  ];
  var captions = [
    'A SEED. PLANTED QUIETLY.',
    'WATER. WAIT.',
    'IT BREAKS THE LINE.',
    'ROOTS BEFORE LEAVES.',
    'A FIELD THAT GROWS ITSELF.',
    'IT BEARS FRUIT. THEN IT STARTS AGAIN.',
    'THE FIELD RESTS.',
    'EVERY FRUIT IS A SEED.'
  ];

  function el(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    return e;
  }

  // deterministic pseudo-random for stable drawings
  function rand(seed) {
    var x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  // --- geometry builders ---

  function buildRoots(cx, cy, maxDepth, len, seed) {
    // returns {paths: [{d}], depth grows downward from (cx, cy)}
    var paths = [];
    var segs = [];

    function branch(x, y, angle, length, depth, s) {
      if (depth < 0.5 || length < 4) return;
      var ex = x + Math.cos(angle) * length;
      var ey = y + Math.sin(angle) * length;
      segs.push({ x: x, y: y, ex: ex, ey: ey, w: Math.max(0.4, depth * 0.9), s: s });
      var r1 = rand(s) * 0.5 + 0.25;
      var r2 = rand(s + 100) * 0.5 + 0.25;
      branch(ex, ey, angle - r1, length * 0.72, depth * 0.72, s * 2.1);
      branch(ex, ey, angle + r2, length * 0.66, depth * 0.66, s * 3.7);
    }

    branch(cx, cy, Math.PI / 2 + 0.25, len * 0.5, 1, seed);
    branch(cx, cy, Math.PI / 2 - 0.25, len * 0.5, 1, seed + 1);
    branch(cx, cy, Math.PI / 2, len * 0.6, 1.2, seed + 2);

    var d = '';
    segs.forEach(function (seg) {
      var mx = (seg.x + seg.ex) / 2 + (rand(seg.s) - 0.5) * 3;
      var my = (seg.y + seg.ey) / 2;
      d += 'M' + seg.x.toFixed(1) + ' ' + seg.y.toFixed(1) +
           ' Q' + mx.toFixed(1) + ' ' + my.toFixed(1) + ' ' +
           seg.ex.toFixed(1) + ' ' + seg.ey.toFixed(1) + ' ';
    });
    paths.push({ d: d });
    return paths;
  }

  function buildTree(cx, baseY, h, seed) {
    // trunk + canopy drawn as one continuous path for a draw-in feel
    var segs = [];

    function wood(x, y, angle, length, depth, s) {
      if (depth < 0.4 || length < 5) return;
      var ex = x + Math.cos(angle) * length;
      var ey = y + Math.sin(angle) * length;
      segs.push({ x: x, y: y, ex: ex, ey: ey, w: Math.max(0.5, depth * 0.85), s: s });
      var n = depth > 1.4 ? 3 : 2;
      for (var i = 0; i < n; i++) {
        var spread = 0.55 + rand(s + i * 31) * 0.45;
        var dir = i % 2 === 0 ? 1 : -1;
        wood(ex, ey, angle + dir * (spread + (rand(s + i) - 0.5) * 0.2),
             length * 0.68, depth * 0.68, s * 2.3 + i);
      }
    }

    // trunk: slightly curved
    var tx = cx, ty = baseY;
    var mid = baseY - h * 0.55;
    segs.push({ x: tx, y: ty, ex: cx + 2, ey: mid, w: 1.6, s: seed });
    wood(cx + 2, mid, -Math.PI / 2, h * 0.42, 1.5, seed + 1);

    var d = '';
    var leaves = [];
    segs.forEach(function (seg) {
      var mx = (seg.x + seg.ex) / 2 + (rand(seg.s) - 0.5) * 4;
      var my = (seg.y + seg.ey) / 2 + (rand(seg.s + 7) - 0.5) * 4;
      d += 'M' + seg.x.toFixed(1) + ' ' + seg.y.toFixed(1) +
           ' Q' + mx.toFixed(1) + ' ' + my.toFixed(1) + ' ' +
           seg.ex.toFixed(1) + ' ' + seg.ey.toFixed(1) + ' ';
      // tiny v-leaf at the tip of the thinnest branches
      if (seg.w < 0.85) {
        var ang = Math.atan2(seg.ey - seg.y, seg.ex - seg.x);
        var a1 = ang + 0.7, a2 = ang - 0.7, L = 5 + rand(seg.s + 3) * 4;
        leaves.push(
          'M' + seg.ex.toFixed(1) + ' ' + seg.ey.toFixed(1) +
          ' L' + (seg.ex + Math.cos(a1) * L).toFixed(1) + ' ' + (seg.ey + Math.sin(a1) * L).toFixed(1) + ' ' +
          'M' + seg.ex.toFixed(1) + ' ' + seg.ey.toFixed(1) +
          ' L' + (seg.ex + Math.cos(a2) * L).toFixed(1) + ' ' + (seg.ey + Math.sin(a2) * L).toFixed(1) + ' '
        );
      }
    });
    return { d: d, leafD: leaves.join(''), canopyY: mid - h * 0.38 };
  }

  // --- player ---

  function mount(root) {
    var W = 1440, H = 810;
    var svg = el('svg', {
      viewBox: '0 0 ' + W + ' ' + H,
      preserveAspectRatio: 'xMidYMid meet',
      role: 'img',
      'aria-label': 'A hand-drawn animation of a seed growing into a tree, then starting again.'
    });
    svg.classList.add('growth-stage');

    // paper background
    svg.appendChild(el('rect', { x: 0, y: 0, width: W, height: H, fill: PAPER }));
    // subtle paper grain via feTurbulence (static, no motion)
    var defs = el('defs');
    defs.innerHTML =
      '<filter id="growth-grain" x="0" y="0" width="100%" height="100%">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" result="n"/>' +
      '<feColorMatrix type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.52  0 0 0 0 0.48  0 0 0 0.05 0" in="n" result="c"/>' +
      '<feBlend in="SourceGraphic" in2="c" mode="multiply"/>' +
      '</filter>';
    svg.appendChild(defs);
    svg.appendChild(el('rect', { x: 0, y: 0, width: W, height: H, fill: 'none', filter: 'url(#growth-grain)' }));

    var scene = el('g');
    svg.appendChild(scene);

    // horizon hairline
    var GROUND_Y = 560;
    var ground = el('path', { d: 'M60 ' + GROUND_Y + ' L' + (W - 60) + ' ' + GROUND_Y, stroke: INK, 'stroke-width': 1, fill: 'none' });
    scene.appendChild(ground);

    // caption
    var caption = el('text', {
      x: 64, y: H - 44, fill: INK,
      'font-family': "'Source Code Pro', 'Courier New', monospace",
      'font-size': 15, 'letter-spacing': 4
    });
    caption.textContent = captions[0];
    scene.appendChild(caption);

    // corner registration mark (zine detail, static)
    var mark = el('g', { stroke: INK, 'stroke-width': 1, fill: 'none', opacity: 0.5 });
    mark.appendChild(el('circle', { cx: W - 60, cy: 44, r: 9 }));
    mark.appendChild(el('line', { x1: W - 82, y1: 44, x2: W - 38, y2: 44 }));
    mark.appendChild(el('line', { x1: W - 60, y1: 22, x2: W - 60, y2: 66 }));
    scene.appendChild(mark);

    // --- actors ---
    var seed = el('rect', { x: 0, y: 0, width: 14, height: 14, fill: RED });
    var seedWrap = el('g'); seedWrap.appendChild(seed); scene.appendChild(seedWrap);

    // watering can
    var can = el('g');
    can.innerHTML =
      '<path d="M-34 8 C-34 -8 -14 -12 -2 -10 L18 -18 C20 -26 30 -28 32 -20 L16 -10 L38 -14 L36 -8 L16 -4 C10 6 0 10 -14 10 C-26 10 -34 4 -34 8 Z" stroke="' + INK + '" stroke-width="1.2" fill="none"/>' +
      '<path d="M-10 -6 Q-16 -26 4 -28" stroke="' + INK + '" stroke-width="1.2" fill="none"/>' +
      '<circle cx="36" cy="-12" r="2.2" fill="' + INK + '"/>';
    scene.appendChild(can);

    // droplets
    var drops = [0, 1, 2].map(function (i) {
      var d = el('path', { d: 'M0 -4 C2.5 0 2.5 3.5 0 5 C-2.5 3.5 -2.5 0 0 -4 Z', fill: 'none', stroke: INK, 'stroke-width': 1 });
      var g = el('g'); g.appendChild(d); scene.appendChild(g);
      return g;
    });

    // ripple
    var ripples = [0, 1].map(function () {
      var r = el('ellipse', { cx: 0, cy: 0, rx: 0, ry: 3.5, fill: 'none', stroke: INK, 'stroke-width': 0.8 });
      scene.appendChild(r);
      return r;
    });

    // sprout stem + leaves, anchored at the seed position (stem grows upward from it)
    var sprout = el('g');
    sprout.style.opacity = '0';
    var stem = el('path', { d: 'M0 0 L0 -60', stroke: INK, 'stroke-width': 1.3, fill: 'none' });
    var leaves = el('g');
    leaves.innerHTML =
      '<path d="M0 -56 Q-16 -70 -26 -50 Q-14 -44 0 -50 Z" stroke="' + INK + '" stroke-width="1" fill="none"/>' +
      '<path d="M0 -50 Q18 -64 28 -44 Q16 -38 0 -44 Z" stroke="' + INK + '" stroke-width="1" fill="none"/>' +
      '<path d="M0 -54 L-13 -48 M0 -48 L14 -42" stroke="' + INK + '" stroke-width="0.7" fill="none"/>';
    sprout.appendChild(stem);
    sprout.appendChild(leaves);
    scene.appendChild(sprout);

    // roots + tree (draw-in via stroke-dashoffset)
    var rootLayer = el('path', { stroke: INK, 'stroke-width': 1, fill: 'none' });
    rootLayer.style.opacity = '0';
    var treeLayer = el('path', { stroke: INK, 'stroke-width': 1.2, fill: 'none' });
    treeLayer.style.opacity = '0';
    scene.appendChild(rootLayer);
    scene.appendChild(treeLayer);

    // fruits
    var fruitPositions = [
      [-80, -120], [-46, -135], [-10, -125], [24, -140], [66, -130], [96, -115], [-28, -100], [40, -95]
    ];
    var fruits = fruitPositions.map(function () {
      var f = el('circle', { r: 5.5, fill: RED });
      scene.appendChild(f);
      return f;
    });

    // pre-compute drawings
    var SEED_X = W / 2 - 7, SEED_Y = GROUND_Y + 4;
    var rootPaths = buildRoots(W / 2, GROUND_Y + 6, 5, 150, 2026);
    rootLayer.setAttribute('d', rootPaths[0].d);
    var tree = buildTree(W / 2, GROUND_Y + 2, 300, 2026);
    treeLayer.setAttribute('d', tree.d + tree.leafD);
    // measure draw-in lengths
    var rootLen = rootLayer.getTotalLength();
    var treeLen = treeLayer.getTotalLength();
    rootLayer.style.strokeDasharray = rootLen;
    rootLayer.style.strokeDashoffset = rootLen;
    treeLayer.style.strokeDasharray = treeLen;
    treeLayer.style.strokeDashoffset = treeLen;

    // --- state helpers ---
    function cap(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
    function setCap(el, x, y) { el.setAttribute('transform', 'translate(' + x.toFixed(1) + ',' + y.toFixed(1) + ')'); }

    var playing = true;
    var muted = false;
    var t0 = Date.now();    // wall-clock base so time never wraps across seeks
    var seekMs = 0;         // injected loop offset (ms), for inspection & screenshots
    var raf = null;
    var audio = null;
    var audioReady = null;

    // initial hidden states
    can.style.opacity = '0';
    drops.forEach(function (d) { d.style.opacity = '0'; });
    ripples.forEach(function (r) { r.setAttribute('rx', '0'); });
    stem.style.opacity = '0';
    leaves.style.opacity = '0';
    fruits.forEach(function (fr) { fr.style.opacity = '0'; });

    var audioSrc = root.getAttribute('data-bgm');
    if (audioSrc) {
      audio = new Audio(audioSrc);
      audio.loop = true;
      audio.volume = 0.35;
      audioReady = audio.play().then(function () { /* autoplay ok */ }).catch(function () { /* muted autoplay blocked */ });
    }

    function render(p) {
      var s = p * CYCLE;
      var f = s / CYCLE;

      // index of current scene
      var i = 0;
      for (var k = sceneStarts.length - 1; k >= 0; k--) { if (f >= sceneStarts[k]) { i = k; break; } }
      var local = (f - sceneStarts[i]) / (sceneStarts[i + 1] - sceneStarts[i]);

      caption.textContent = captions[i >= captions.length ? captions.length - 1 : i];

      // ---- reset all actors to neutral state before painting the scene ----
      // (prevents elements from previous scenes lingering, e.g. the watering can
      // staying on screen during the fruit scene)
      can.style.opacity = 0;
      drops.forEach(function (d) { d.style.opacity = 0; });
      ripples.forEach(function (r) { r.setAttribute('rx', 0); });
      sprout.style.opacity = 0;
      stem.setAttribute('d', 'M0 0 L0 0');
      leaves.style.opacity = 0;
      rootLayer.style.opacity = 0;
      rootLayer.style.strokeDashoffset = rootLen;
      treeLayer.style.opacity = 0;
      treeLayer.style.strokeDashoffset = treeLen;
      treeLayer.setAttribute('transform', '');
      scene.style.opacity = 1;
      fruits.forEach(function (fr) { fr.style.opacity = 0; });
      

      // 0 sow: seed sinks gently
      if (i === 0) {
        var sink = easeOut(local) * 10;
        setCap(seedWrap, SEED_X, SEED_Y + sink);
        seedWrap.style.opacity = 1;
        can.style.opacity = 0;
        drops.forEach(function (d) { d.style.opacity = 0; });
        ripples.forEach(function (r) { r.setAttribute('rx', 0); });
      }
      // 1 water: can + drops
      else if (i === 1) {
        setCap(seedWrap, SEED_X, SEED_Y + 10);
        can.style.opacity = cap(local * 3);
        var canX = SEED_X - 150, canY = 240 + Math.sin(local * Math.PI * 2) * 6;
        setCap(can, canX, canY);
        can.setAttribute('transform', 'translate(' + canX.toFixed(1) + ',' + canY.toFixed(1) + ') rotate(' + (local * 12).toFixed(1) + ')');
        drops.forEach(function (d, idx) {
          var dl = cap((local - 0.25 - idx * 0.12) * 2.2);
          var yy = 258 + dl * (GROUND_Y + 14 - 258);
          setCap(d, SEED_X - 110 + idx * 26, yy);
          d.style.opacity = dl < 1 ? 1 : 0;
        });
        var rip = easeOut(cap(local * 1.6));
        ripples[0].setAttribute('rx', (rip * 34).toFixed(1));
        ripples[1].setAttribute('rx', (rip * 18).toFixed(1));
      }
      // 2 sprout
      else if (i === 2) {
        var sh = easeOut(cap(local * 1.4)) * 60;
        sprout.style.opacity = local > 0.05 ? 1 : 0;
        stem.setAttribute('d', 'M0 0 L0 ' + (-sh).toFixed(1));
        leaves.style.opacity = cap((local - 0.4) * 2.5);
        setCap(sprout, SEED_X + 7, SEED_Y + 10);
        setCap(seedWrap, SEED_X, SEED_Y + 10);
      }
      // 3 roots
      else if (i === 3) {
        sprout.style.opacity = 1;
        leaves.style.opacity = 1;
        setCap(sprout, SEED_X + 7, SEED_Y + 10);
        setCap(seedWrap, SEED_X, SEED_Y + 10);
        var rh = easeOut(local);
        rootLayer.style.strokeDashoffset = (rootLen * (1 - rh)).toFixed(1);
        rootLayer.style.opacity = 1;
      }
      // 4 grow tree
      else if (i === 4) {
        var th = easeOut(local);
        treeLayer.style.strokeDashoffset = (treeLen * (1 - th)).toFixed(1);
        treeLayer.style.opacity = 1;
        setCap(seedWrap, SEED_X, SEED_Y + 10);
        rootLayer.style.opacity = 1;
        rootLayer.style.strokeDashoffset = 0;
      }
      // 5 fruit: fall-through keeps fruits hidden (reset above)
      else if (i === 5) {
        treeLayer.style.opacity = 1;
        treeLayer.style.strokeDashoffset = 0;
        fruits.forEach(function (fr, idx) {
          var fl = cap((local - 0.1 - idx * 0.08) * 3);
          var bounce = 1 - Math.pow(1 - fl, 2);
          var fx = SEED_X + 7 + fruitPositions[idx][0];
          fr.setAttribute('transform', 'translate(' + fx.toFixed(1) + ',' + (tree.canopyY + fruitPositions[idx][1] * bounce).toFixed(1) + ')');
          fr.style.opacity = fl > 0.05 ? 1 : 0;
        });
        rootLayer.style.strokeDashoffset = 0;
      }
      // 6 settle: canopy sways
      else if (i === 6) {
        treeLayer.style.opacity = 1;
        treeLayer.style.strokeDashoffset = 0;
        var sway = Math.sin(local * Math.PI * 3) * 1.2;
        treeLayer.setAttribute('transform', 'rotate(' + sway.toFixed(2) + ' ' + (W / 2) + ' ' + (GROUND_Y + 2) + ')');
        fruits.forEach(function (fr, idx) {
          var fx = SEED_X + 7 + fruitPositions[idx][0];
          fr.setAttribute('transform', 'translate(' + fx.toFixed(1) + ',' + (tree.canopyY + fruitPositions[idx][1]).toFixed(1) + ')');
          fr.style.opacity = 1;
        });
        rootLayer.style.strokeDashoffset = 0;
      }
      // 7 return: fruit fall, fade to seed
      else {
        treeLayer.setAttribute('transform', '');
        var fade = cap((local - 0.5) * 2);
        var sceneOpacity = 1 - fade;
        scene.style.opacity = 0.35 + 0.65 * (1 - fade);
        fruits.forEach(function (fr, idx) {
          var fl = cap((0.4 - local) * 3);
          var yy = tree.canopyY + fruitPositions[idx][1] + fl * (GROUND_Y - 40 - (tree.canopyY + fruitPositions[idx][1]));
          var fx = SEED_X + 7 + fruitPositions[idx][0];
          fr.setAttribute('transform', 'translate(' + fx.toFixed(1) + ',' + yy.toFixed(1) + ')');
          fr.style.opacity = fl > 0.05 ? 1 : 0;
        });
        rootLayer.style.strokeDashoffset = 0;
      }
    }

    // expose time control: host.__growthSeek(ms) jumps within the loop
    root.__growthSeek = function (ms) { seekMs = ms % CYCLE; t0 = Date.now(); };
    // debug probe: current scene, canopyY, fruit positions in SVG units
    root.__growthProbe = function () {
      var p = (((Date.now() - t0) + seekMs) % CYCLE + CYCLE) % CYCLE / CYCLE;
      var i = 0;
      for (var k = sceneStarts.length - 1; k >= 0; k--) { if (p >= sceneStarts[k]) { i = k; break; } }
      var out = { scene: i, canopyY: tree.canopyY, groundY: GROUND_Y, seedX: SEED_X, seedY: SEED_Y };
      out.fruits = fruits.map(function (fr, idx) {
        var ct = fr.getScreenCTM();
        return { idx: idx, t: fr.getAttribute('transform'),
                 sx: ct ? ct.e.toFixed(0) : '-', sy: ct ? ct.f.toFixed(0) : '-', op: getComputedStyle(fr).opacity };
      });
      return out;
    };

    function tick() {
      var p = (((Date.now() - t0) + seekMs) % CYCLE + CYCLE) % CYCLE / CYCLE;
      render(p);
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    // reduced motion: keep the static end-state (full tree)
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    function applyReduced() {
      if (reduced.matches) {
        playing = false;
        rootLayer.style.strokeDashoffset = 0;
        treeLayer.style.strokeDashoffset = 0;
        fruits.forEach(function (fr, idx) {
          var fx = SEED_X + 7 + fruitPositions[idx][0];
          fr.setAttribute('transform', 'translate(' + fx.toFixed(1) + ',' + (tree.canopyY + fruitPositions[idx][1]).toFixed(1) + ')');
          fr.style.opacity = 1;
        });
        caption.textContent = captions[4];
        if (audio) audio.pause();
      }
    }
    applyReduced();
    reduced.addEventListener('change', applyReduced);

    // controls
    var btn = root.querySelector('.growth-toggle');
    if (btn) {
      btn.addEventListener('click', function () {
        muted = !muted;
        if (audio) audio.muted = muted;
        btn.classList.toggle('is-muted', muted);
        btn.setAttribute('aria-label', muted ? 'Unmute music' : 'Mute music');
      });
      if (audio) audio.muted = muted;
    }

    return svg;
  }

  // auto-mount
  document.addEventListener('DOMContentLoaded', function () {
    var host = document.querySelector('.growth-host');
    if (!host) return;
    var svg = mount(host);
    host.appendChild(svg);
    host.classList.add('growth-ready');
  });
})();
