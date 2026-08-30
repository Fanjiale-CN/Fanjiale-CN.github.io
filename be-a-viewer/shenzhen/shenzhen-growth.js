(()=>{
  const root=document.querySelector('[data-sz-growth]'); if(!root)return;
  const track=root.querySelector('[data-sz-growth-track]'); const slides=[...track.querySelectorAll('.sz-growth-slide')];
  const prev=root.querySelector('[data-sz-growth-prev]'); const next=root.querySelector('[data-sz-growth-next]'); const current=root.querySelector('[data-sz-growth-current]'); const progress=root.querySelector('[data-sz-growth-progress]');
  let index=0,dragging=false,startX=0,startLeft=0,raf=0;
  const clamp=n=>Math.max(0,Math.min(slides.length-1,n));
  const update=(n)=>{index=clamp(n);slides.forEach((s,i)=>s.classList.toggle('is-current',i===index));current.textContent=String(index+1).padStart(2,'0');prev.disabled=index===0;next.disabled=index===slides.length-1;progress.style.transform=`scaleX(${index+1})`;};
  const go=n=>{index=clamp(n);track.scrollTo({left:slides[index].offsetLeft,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});update(index)};
  prev.addEventListener('click',()=>go(index-1)); next.addEventListener('click',()=>go(index+1));
  track.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();go(index-1)}else if(e.key==='ArrowRight'){e.preventDefault();go(index+1)}else if(e.key==='Home'){e.preventDefault();go(0)}else if(e.key==='End'){e.preventDefault();go(slides.length-1)}});
  track.addEventListener('scroll',()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{const center=track.scrollLeft+track.clientWidth/2;let best=0,dist=Infinity;slides.forEach((s,i)=>{const d=Math.abs((s.offsetLeft+s.offsetWidth/2)-center);if(d<dist){dist=d;best=i}});if(best!==index)update(best)})},{passive:true});
  track.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0)return;dragging=true;startX=e.clientX;startLeft=track.scrollLeft;track.classList.add('is-dragging');track.setPointerCapture(e.pointerId)});
  track.addEventListener('pointermove',e=>{if(!dragging)return;track.scrollLeft=startLeft-(e.clientX-startX)});
  const endDrag=e=>{if(!dragging)return;dragging=false;track.classList.remove('is-dragging');try{track.releasePointerCapture(e.pointerId)}catch{};go(Math.round(track.scrollLeft/Math.max(track.clientWidth,1)))};
  track.addEventListener('pointerup',endDrag);track.addEventListener('pointercancel',endDrag);track.addEventListener('dragstart',e=>e.preventDefault());
  update(0);
})();
