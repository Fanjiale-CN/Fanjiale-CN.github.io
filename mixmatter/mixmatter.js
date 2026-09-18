(() => {
  document.documentElement.classList.add('js');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gsapReady = typeof window.gsap !== 'undefined';

  const reveal = () => {
    const nodes = [...document.querySelectorAll('.mm-reveal')];
    if (!nodes.length) return;
    if (reduced || !('IntersectionObserver' in window)) {
      nodes.forEach(n => { n.style.opacity = '1'; n.style.transform = 'none'; });
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        if (gsapReady) {
          window.gsap.to(entry.target,{opacity:1,y:0,duration:.68,ease:'power3.out',clearProps:'transform'});
        } else {
          entry.target.animate([{opacity:0,transform:'translateY(24px)'},{opacity:1,transform:'translateY(0)'}],
            {duration:680,easing:'cubic-bezier(.2,.8,.2,1)',fill:'forwards'});
        }
      });
    },{threshold:.1,rootMargin:'0px 0px -7% 0px'});
    nodes.forEach(n => io.observe(n));
  };

  const hero = () => {
    if (reduced) return;
    const canvas = document.querySelector('[data-mm-hero-canvas]');
    if (!canvas) return;
    const fragments = [...canvas.querySelectorAll('[data-mm-depth]')];

    if (gsapReady) {
      window.gsap.from('.mm-hero__word-row i',{yPercent:106,duration:.88,stagger:.08,ease:'expo.out',delay:.12});
      window.gsap.from('.mm-fragment',{y:28,opacity:0,duration:.92,stagger:.05,ease:'power3.out',delay:.2});
    }

    const quick = fragments.map(el => gsapReady ? {
      x:window.gsap.quickTo(el,'x',{duration:.45,ease:'power3.out'}),
      y:window.gsap.quickTo(el,'y',{duration:.45,ease:'power3.out'})
    } : null);

    canvas.addEventListener('pointermove', e => {
      const r = canvas.getBoundingClientRect();
      const nx=(e.clientX-r.left)/r.width-.5, ny=(e.clientY-r.top)/r.height-.5;
      fragments.forEach((el,i)=>{
        const d=Number(el.dataset.mmDepth||.12), x=nx*20*d, y=ny*16*d;
        if(quick[i]){quick[i].x(x);quick[i].y(y)} else el.style.transform=`translate3d(${x}px,${y}px,0)`;
      });
    });
    canvas.addEventListener('pointerleave',()=>fragments.forEach((el,i)=>{
      if(quick[i]){quick[i].x(0);quick[i].y(0)} else el.style.transform='';
    }));
  };

  reveal();
  hero();
})();