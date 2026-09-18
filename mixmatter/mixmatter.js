(() => {
  document.documentElement.classList.add('js');

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gsapReady = typeof window.gsap !== 'undefined';
  const gsap = window.gsap;
  const clamp = (v,min,max) => Math.max(min,Math.min(max,v));

  const reveal = () => {
    const nodes = [...document.querySelectorAll('.mm-reveal')];
    if (!nodes.length) return;
    if (reduced || !('IntersectionObserver' in window)) {
      nodes.forEach(n => { n.style.opacity='1'; n.style.transform='none'; });
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        if (gsapReady) {
          gsap.to(entry.target,{opacity:1,y:0,duration:.68,ease:'power3.out',clearProps:'transform'});
        } else {
          entry.target.animate(
            [{opacity:0,transform:'translateY(24px)'},{opacity:1,transform:'translateY(0)'}],
            {duration:680,easing:'cubic-bezier(.2,.8,.2,1)',fill:'forwards'}
          );
        }
      });
    },{threshold:.1,rootMargin:'0px 0px -7% 0px'});
    nodes.forEach(n => io.observe(n));
  };

  const stickerSystem = () => {
    const stage=document.querySelector('[data-mm-sticker-stage]');
    const hero=document.querySelector('[data-mm-orbit-hero]');
    const scene=document.querySelector('[data-mm-orbit-scene]');
    const plane=document.querySelector('[data-mm-plane]');
    const title=document.querySelector('[data-mm-title]');
    const path=document.querySelector('[data-mm-orbit-path]');
    if(!stage||!hero||!scene) return;

    const types=['pineapple','mango','pear','apple','orange','grapes','ice'];
    let z=52;
    const updateStage=()=>{ stage.style.height=Math.max(document.body.scrollHeight,document.documentElement.scrollHeight)+'px'; };
    updateStage();
    addEventListener('resize',updateStage,{passive:true});
    if('ResizeObserver' in window) new ResizeObserver(updateStage).observe(document.body);

    const makeSticker=(type)=>{
      const el=document.createElement('i');
      el.className='mm-drop-sticker';
      if(type==='ice') el.classList.add('mm-drop-sticker--ice');
      else el.classList.add('mm-fruit','mm-fruit--'+type);
      el.dataset.stickerType=type;
      el.style.zIndex=String(z++);
      const tag=document.createElement('span');
      tag.className='mm-drop-sticker__grab';
      tag.textContent='DRAG';
      el.appendChild(tag);
      stage.appendChild(el);
      enableDrag(el);
      return el;
    };

    function enableDrag(el){
      let active=false,dx=0,dy=0;
      const move=e=>{
        if(!active) return;
        const r=stage.getBoundingClientRect();
        const x=clamp(e.pageX-dx,0,stage.clientWidth-el.offsetWidth);
        const y=clamp(e.pageY-dy,0,parseFloat(stage.style.height)-el.offsetHeight);
        el.style.left=x+'px'; el.style.top=y+'px';
      };
      const up=e=>{
        if(!active) return;
        active=false;el.classList.remove('is-dragging');
        try{el.releasePointerCapture(e.pointerId)}catch(_){}
      };
      el.addEventListener('pointerdown',e=>{
        active=true;
        if(gsapReady) gsap.killTweensOf(el);
        const r=el.getBoundingClientRect();
        dx=e.clientX-r.left;dy=e.clientY-r.top;
        el.classList.add('is-dragging');el.style.zIndex=String(++z);
        try{el.setPointerCapture(e.pointerId)}catch(_){}
        e.preventDefault();
      });
      el.addEventListener('pointermove',move);
      el.addEventListener('pointerup',up);
      el.addEventListener('pointercancel',up);
    }

    const land=(type,targetX,targetY,fromX,fromY,rotation=0,scale=1)=>{
      const el=makeSticker(type);
      el.style.left=targetX+'px';el.style.top=targetY+'px';
      if(reduced||!gsapReady){
        el.style.transform='rotate('+rotation+'deg) scale('+scale+')';
        return el;
      }
      gsap.fromTo(el,
        {x:fromX-targetX,y:fromY-targetY,rotation:rotation-28,scale:scale*.72,opacity:0},
        {x:0,y:0,rotation,scale,opacity:1,duration:.86,ease:'back.out(1.35)',clearProps:'x,y'}
      );
      return el;
    };

    const heroTarget=(xp,yp)=>{
      const r=scene.getBoundingClientRect();
      return {x:r.left+scrollX+r.width*xp,y:r.top+scrollY+r.height*yp};
    };

    const planePoint=()=>{
      if(!plane) return {x:innerWidth*.5,y:scrollY+120};
      const r=plane.getBoundingClientRect();
      return {x:r.left+scrollX+r.width*.5,y:r.top+scrollY+r.height*.5};
    };

    const dropFromPlane=(type,xp,yp,rotation,scale)=>{
      const p=planePoint(),t=heroTarget(xp,yp);
      land(type,t.x-70,t.y-70,p.x,p.y,rotation,scale);
    };

    const playOrbit=()=>{
      if(!plane||!title) return;
      const sr=scene.getBoundingClientRect();
      const place=(p)=>{
        const angle=(-165+360*p)*Math.PI/180;
        const cx=sr.width*.5,cy=sr.height*.48,rx=sr.width*.43,ry=sr.height*.34;
        const x=cx+Math.cos(angle)*rx;
        const y=cy+Math.sin(angle)*ry;
        const dx=-Math.sin(angle)*rx;
        const dy=Math.cos(angle)*ry;
        const rot=Math.atan2(dy,dx)*180/Math.PI;
        plane.style.transform='translate3d('+(x-plane.offsetWidth*.5)+'px,'+(y-plane.offsetHeight*.5)+'px,0) rotate('+rot+'deg)';
      };

      if(reduced||!gsapReady){
        title.style.opacity='1';title.style.clipPath='none';
        place(.86);
        plane.classList.add('is-parked');
        [['pineapple',.34,.37,-8,1.05],['orange',.12,.69,-10,.94],['ice',.79,.68,9,.9],['pear',.67,.56,7,.98]].forEach(v=>dropFromPlane(...v));
        return;
      }

      const state={p:0};
      place(0);
      gsap.to(path,{strokeDashoffset:0,duration:2.65,ease:'power1.inOut',delay:.16});
      const orbit=gsap.to(state,{
        p:1,duration:2.7,ease:'power1.inOut',delay:.18,
        onUpdate:()=>place(state.p),
        onComplete:()=>{
          plane.classList.add('is-parked');
          const pr=plane.getBoundingClientRect();
          const targetX=sr.width*.78-plane.offsetWidth*.5;
          const targetY=sr.height*.105-plane.offsetHeight*.5;
          gsap.to(plane,{x:targetX-(pr.left-sr.left),y:targetY-(pr.top-sr.top),rotation:10,duration:.58,ease:'power3.out'});
        }
      });

      gsap.to(title,{opacity:1,clipPath:'inset(0 0% 0 0)',duration:.82,ease:'power3.out',delay:1.0});
      gsap.delayedCall(.78,()=>dropFromPlane('pineapple',.34,.38,-8,1.05));
      gsap.delayedCall(1.14,()=>dropFromPlane('mango',.13,.40,-10,.93));
      gsap.delayedCall(1.50,()=>dropFromPlane('ice',.79,.69,9,.90));
      gsap.delayedCall(1.84,()=>dropFromPlane('pear',.68,.58,7,.98));
      gsap.delayedCall(2.12,()=>dropFromPlane('grapes',.86,.42,8,.92));
    };

    playOrbit();

    const sectionDrops=[
      ['#system','orange',.87,.35,10,.88],
      ['#cases','apple',.08,.52,-9,.92],
      ['#work','grapes',.86,.18,7,.92],
      ['#method','pineapple',.10,.68,-8,.88],
      ['#open','ice',.82,.34,10,.88]
    ];

    if('IntersectionObserver' in window){
      const seen=new Set();
      const io=new IntersectionObserver(entries=>{
        entries.forEach(entry=>{
          if(!entry.isIntersecting||seen.has(entry.target)) return;
          seen.add(entry.target);
          const spec=sectionDrops.find(v=>document.querySelector(v[0])===entry.target);
          if(!spec) return;
          const [,type,xp,yp,rot,scale]=spec;
          const r=entry.target.getBoundingClientRect();
          const tx=scrollX+r.left+r.width*xp-70;
          const ty=scrollY+r.top+r.height*yp-70;
          const fromX=scrollX+r.left+r.width*(xp>.5?.82:.18);
          const fromY=scrollY-120;
          land(type,tx,ty,fromX,fromY,rot,scale);
        });
      },{threshold:.16,rootMargin:'0px 0px -12% 0px'});
      sectionDrops.forEach(v=>{const el=document.querySelector(v[0]);if(el)io.observe(el)});
    }
  };

  const methodStates=()=>{
    const rows=[...document.querySelectorAll('.mm-method__list li')];
    if(!rows.length) return;
    const activate=row=>rows.forEach(r=>r.classList.toggle('is-active',r===row));
    rows.forEach(row=>{
      row.addEventListener('pointerenter',()=>activate(row));
      row.addEventListener('focusin',()=>activate(row));
      row.addEventListener('click',()=>activate(row));
    });
  };

  reveal();
  stickerSystem();
  methodStates();
})();