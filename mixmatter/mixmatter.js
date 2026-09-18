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
    const scene=document.querySelector('[data-mm-orbit-scene]');
    const plane=document.querySelector('[data-mm-plane]');
    const title=document.querySelector('[data-mm-title]');
    const path=document.querySelector('[data-mm-orbit-path]');
    if(!stage||!scene||!plane||!title||!path) return;

    let z=52;
    const updateStage=()=>{ stage.style.height=Math.max(document.body.scrollHeight,document.documentElement.scrollHeight)+'px'; };
    updateStage();
    addEventListener('resize',updateStage,{passive:true});
    if('ResizeObserver' in window) new ResizeObserver(updateStage).observe(document.body);

    function enableDrag(el){
      let active=false,dx=0,dy=0;
      const move=e=>{
        if(!active) return;
        const x=clamp(e.pageX-dx,0,stage.clientWidth-el.offsetWidth);
        const y=clamp(e.pageY-dy,0,parseFloat(stage.style.height)-el.offsetHeight);
        el.style.left=x+'px';
        el.style.top=y+'px';
      };
      const up=e=>{
        if(!active) return;
        active=false;
        el.classList.remove('is-dragging');
        try{el.releasePointerCapture(e.pointerId)}catch(_){}
      };
      el.addEventListener('pointerdown',e=>{
        active=true;
        if(gsapReady) gsap.killTweensOf(el);
        const r=el.getBoundingClientRect();
        dx=e.clientX-r.left;
        dy=e.clientY-r.top;
        el.classList.add('is-dragging');
        el.style.zIndex=String(++z);
        try{el.setPointerCapture(e.pointerId)}catch(_){}
        e.preventDefault();
      });
      el.addEventListener('pointermove',move);
      el.addEventListener('pointerup',up);
      el.addEventListener('pointercancel',up);
    }

    const addGrabTag=el=>{
      const tag=document.createElement('span');
      tag.className='mm-drop-sticker__grab';
      tag.textContent='DRAG';
      el.appendChild(tag);
    };

    const makeSticker=type=>{
      const el=document.createElement('i');
      el.className='mm-drop-sticker mm-fruit mm-fruit--'+type;
      el.dataset.stickerType=type;
      el.style.zIndex=String(z++);
      addGrabTag(el);
      stage.appendChild(el);
      enableDrag(el);
      return el;
    };

    const makePlaneSticker=(left,top,width)=>{
      const el=document.createElement('i');
      el.className='mm-drop-sticker mm-drop-sticker--plane';
      el.dataset.stickerType='plane';
      el.style.zIndex=String(z++);
      el.style.left=left+'px';
      el.style.top=top+'px';
      if(width) el.style.width=Math.round(width)+'px';
      addGrabTag(el);
      stage.appendChild(el);
      enableDrag(el);
      return el;
    };

    const land=(type,targetX,targetY,fromX,fromY,rotation=0,scale=1)=>{
      const el=makeSticker(type);
      el.style.left=targetX+'px';
      el.style.top=targetY+'px';
      if(reduced||!gsapReady){
        el.style.transform='rotate('+rotation+'deg) scale('+scale+')';
        return el;
      }
      gsap.fromTo(el,
        {x:fromX-targetX,y:fromY-targetY,rotation:rotation-24,scale:scale*.64,autoAlpha:0},
        {x:0,y:0,rotation,scale,autoAlpha:1,duration:1.2,ease:'back.out(1.22)',clearProps:'x,y'}
      );
      return el;
    };

    const heroTarget=(xp,yp)=>{
      const r=scene.getBoundingClientRect();
      return {x:r.left+scrollX+r.width*xp,y:r.top+scrollY+r.height*yp};
    };

    const planePoint=()=>{
      const r=plane.getBoundingClientRect();
      return {x:r.left+scrollX+r.width*.5,y:r.top+scrollY+r.height*.5};
    };

    const dropFromPlane=(type,xp,yp,rotation,scale)=>{
      const p=planePoint(),t=heroTarget(xp,yp);
      return land(type,t.x-70,t.y-70,p.x,p.y,rotation,scale);
    };

    const parkPlane=()=>{
      const r=plane.getBoundingClientRect();
      const sticker=makePlaneSticker(r.left+scrollX,r.top+scrollY,r.width);
      if(gsapReady){
        gsap.set(plane,{autoAlpha:0});
        gsap.fromTo(sticker,{rotation:-6,scale:1.08},{rotation:7,scale:1,duration:.5,ease:'back.out(1.5)'});
      }else{
        plane.style.opacity='0';
        sticker.style.transform='rotate(7deg)';
      }
    };

    const playFlight=()=>{
      const sr=scene.getBoundingClientRect();
      const total=path.getTotalLength();
      const state={p:0};

      const pointAt=p=>{
        const a=path.getPointAtLength(total*clamp(p,0,1));
        const b=path.getPointAtLength(total*clamp(p+.003,0,1));
        const x=a.x/1000*sr.width;
        const y=a.y/620*sr.height;
        const nx=b.x/1000*sr.width;
        const ny=b.y/620*sr.height;
        const rot=Math.atan2(ny-y,nx-x)*180/Math.PI+90;
        const scale=2.15-(1.57*p);
        plane.style.transform='translate3d('+(x-plane.offsetWidth*.5)+'px,'+(y-plane.offsetHeight*.5)+'px,0) rotate('+rot+'deg) scale('+scale+')';
      };

      pointAt(0);

      if(reduced||!gsapReady){
        title.style.opacity='1';
        title.style.clipPath='none';
        pointAt(1);
        scene.classList.add('is-complete');
        [
          ['pineapple',.28,.39,-8,1],
          ['orange',.14,.70,-10,.92],
          ['ice',.78,.69,8,.9],
          ['grapes',.85,.43,7,.9],
          ['lemon',.66,.58,-6,.9]
        ].forEach(v=>dropFromPlane(...v));
        parkPlane();
        return;
      }

      const tl=gsap.timeline({defaults:{ease:'power2.out'}});
      tl.fromTo(path,{opacity:0},{opacity:.24,duration:.55,ease:'power1.out'},.18);
      tl.to(title,{
        opacity:1,
        clipPath:'inset(0 0% 0 0)',
        duration:1.3,
        ease:'power3.out'
      },1.02);
      tl.to(state,{
        p:1,
        duration:6.6,
        ease:'power1.inOut',
        onUpdate:()=>pointAt(state.p),
        onComplete:()=>{
          plane.classList.add('is-parked');
          scene.classList.add('is-complete');
          gsap.to(path,{opacity:.08,duration:.8,ease:'power2.out'});
          parkPlane();
        }
      },.2);

      tl.call(()=>dropFromPlane('pineapple',.29,.39,-8,1.03),[],1.65);
      tl.call(()=>dropFromPlane('orange',.14,.69,-10,.93),[],2.65);
      tl.call(()=>dropFromPlane('ice',.78,.69,8,.90),[],3.55);
      tl.call(()=>dropFromPlane('grapes',.85,.43,7,.90),[],4.55);
      tl.call(()=>dropFromPlane('lemon',.66,.58,-6,.90),[],5.45);
    };

    playFlight();

    const sectionDrops=[
      ['#system','avocado',.88,.30,8,.88],
      ['#cases','apple',.08,.52,-9,.92],
      ['#work','pear',.86,.18,7,.90],
      ['#method','mango',.10,.68,-8,.90],
      ['#open','ice',.82,.34,9,.88]
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
          const fromY=scrollY-110;
          land(type,tx,ty,fromX,fromY,rot,scale);
        });
      },{threshold:.18,rootMargin:'0px 0px -12% 0px'});
      sectionDrops.forEach(v=>{const el=document.querySelector(v[0]);if(el) io.observe(el)});
    }
  };

  const systemCards=()=>{
    const cards=[...document.querySelectorAll('[data-mm-system-card]')];
    if(!cards.length) return;
    const activate=card=>cards.forEach(c=>c.classList.toggle('is-active',c===card));
    cards.forEach(card=>{
      card.addEventListener('pointerenter',()=>activate(card));
      card.addEventListener('focusin',()=>activate(card));
      card.addEventListener('click',()=>activate(card));
    });
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
  systemCards();
  methodStates();
})();