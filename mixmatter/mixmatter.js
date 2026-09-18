(() => {
  document.documentElement.classList.add('js');

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gsapReady = typeof window.gsap !== 'undefined';

  const reveal = () => {
    const nodes = [...document.querySelectorAll('.mm-reveal')];
    if (!nodes.length) return;
    if (reduced || !('IntersectionObserver' in window)) {
      nodes.forEach(node => { node.style.opacity = '1'; node.style.transform = 'none'; });
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const node = entry.target;
        observer.unobserve(node);
        if (gsapReady) {
          window.gsap.to(node, { opacity: 1, y: 0, duration: .72, ease: 'power3.out', clearProps: 'transform' });
        } else {
          node.animate([
            { opacity: 0, transform: 'translateY(28px)' },
            { opacity: 1, transform: 'translateY(0)' }
          ], { duration: 720, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' });
        }
      });
    }, { threshold: .12, rootMargin: '0px 0px -8% 0px' });
    nodes.forEach(node => observer.observe(node));
  };

  const heroMotion = () => {
    if (reduced) return;
    const canvas = document.querySelector('[data-mm-hero-canvas]');
    if (!canvas) return;
    const fragments = [...canvas.querySelectorAll('[data-mm-depth]')];

    if (gsapReady) {
      window.gsap.from('.mm-hero__word-row i', {
        yPercent: 112,
        rotation: 2.2,
        duration: .92,
        stagger: .11,
        ease: 'expo.out',
        delay: .16
      });
      window.gsap.from('.mm-fragment', {
        y: 42,
        opacity: 0,
        rotation: (i) => [1.5, -2, 1, 0, 0][i] || 0,
        duration: 1.05,
        stagger: .07,
        ease: 'power3.out',
        delay: .24
      });
    }

    const moves = fragments.map(el => {
      if (gsapReady) {
        return {
          x: window.gsap.quickTo(el, 'x', { duration: .55, ease: 'power3.out' }),
          y: window.gsap.quickTo(el, 'y', { duration: .55, ease: 'power3.out' })
        };
      }
      return null;
    });

    canvas.addEventListener('pointermove', event => {
      const rect = canvas.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / rect.width - .5;
      const ny = (event.clientY - rect.top) / rect.height - .5;
      fragments.forEach((el, i) => {
        const depth = Number(el.dataset.mmDepth || .2);
        const x = nx * 26 * depth;
        const y = ny * 22 * depth;
        if (moves[i]) { moves[i].x(x); moves[i].y(y); }
        else el.style.transform = `translate3d(${x}px,${y}px,0)`;
      });
    });
    canvas.addEventListener('pointerleave', () => {
      fragments.forEach((el, i) => {
        if (moves[i]) { moves[i].x(0); moves[i].y(0); }
        else el.style.transform = '';
      });
    });
  };

  const lab = () => {
    const root = document.querySelector('[data-mm-lab]');
    if (!root) return;
    const base = 'https://raw.githubusercontent.com/Fanjiale-CN/press-print/main/examples/showcase/';
    const local = '/mixmatter/assets/demo/';
    const cases = [
      {label:'01 / TRAIN INTERIOR',source:local+'01-train-source.avif',result:base+'0D0EB3E7-CDA9-4F6C-B8C5-B6613F6CEBCB.png'},
      {label:'02 / MUSEUM',source:local+'02-museum-source.avif',result:base+'2045E30A-8BAE-4625-B726-1EBC31166618.png'},
      {label:'03 / SHIBUYA',source:local+'03-shibuya-source.avif',result:base+'43A519AD-FAA7-40EE-9425-D8EA1CCAA11C.png'},
      {label:'04 / METRO SIGN',source:local+'04-metro-source.avif',result:base+'48FEE737-3D46-446B-AAEF-6F1ADB22E70F.png'},
      {label:'05 / DANCE',source:local+'05-dance-source.jpg',result:base+'A9F371AC-D68C-4BC5-AD10-261487723695.png'},
      {label:'06 / AERIAL PERFORMANCE',source:local+'06-aerial-source.jpg',result:base+'8E3C63CD-7AD2-4E0A-A4AD-AB9C82A9044A.png'},
      {label:'07 / OBJECTS',source:local+'07-noodle-source.jpg',result:base+'C24DF515-DCB7-4D3A-A871-BDC8F58B38C1.png'},
      {label:'08 / TEMPLE / AIRCRAFT',source:local+'08-temple-plane-source.jpg',result:local+'08-temple-plane-result.webp'},
      {label:'09 / XIAMEN COAST',source:local+'09-xiamen-source.jpg',result:local+'09-xiamen-result.webp'}
    ];
    const buttons = [...root.querySelectorAll('[data-mm-case]')];
    const source = root.querySelector('[data-mm-source]');
    const result = root.querySelector('[data-mm-result]');
    const label = root.querySelector('[data-mm-case-label]');
    const state = root.querySelector('[data-mm-state]');
    const run = root.querySelector('[data-mm-run]');
    const bench = root.querySelector('.mm-lab__workbench');
    const steps = [...root.querySelectorAll('[data-mm-step]')];
    let timers = [];

    const clear = () => {
      timers.forEach(clearTimeout);
      timers = [];
      steps.forEach(step => step.classList.remove('is-active'));
    };

    const select = (index) => {
      clear();
      const current = cases[index];
      buttons.forEach((button, i) => {
        button.classList.toggle('is-active', i === index);
        button.setAttribute('aria-pressed', String(i === index));
      });
      source.src = current.source;
      result.src = current.result;
      label.textContent = current.label;
      state.textContent = 'READY';
      bench.classList.remove('is-revealed');
    };

    buttons.forEach((button, index) => button.addEventListener('click', () => select(index)));
    run?.addEventListener('click', () => {
      clear();
      bench.classList.remove('is-revealed');
      state.textContent = 'READING';
      const delay = reduced ? 70 : 360;
      const states = ['READING','PROTECTING','REBUILDING','MATERIALIZING'];
      steps.forEach((step, index) => {
        timers.push(setTimeout(() => {
          steps.forEach(item => item.classList.remove('is-active'));
          step.classList.add('is-active');
          state.textContent = states[index];
        }, delay * index));
      });
      timers.push(setTimeout(() => {
        steps.forEach(item => item.classList.remove('is-active'));
        state.textContent = 'RESULT READY';
        bench.classList.add('is-revealed');
      }, delay * 4 + 100));
    });
    select(0);
  };

  reveal();
  heroMotion();
  lab();
})();
