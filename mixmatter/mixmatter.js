(() => {
  const root=document.querySelector('[data-mm-lab]');
  if(!root) return;
  const base='https://raw.githubusercontent.com/Fanjiale-CN/press-print/main/examples/showcase/';
  const local='/mixmatter/assets/demo/';
  const cases=[
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
  const buttons=[...root.querySelectorAll('[data-mm-case]')];
  const source=root.querySelector('[data-mm-source]');
  const result=root.querySelector('[data-mm-result]');
  const label=root.querySelector('[data-mm-case-label]');
  const state=root.querySelector('[data-mm-state]');
  const run=root.querySelector('[data-mm-run]');
  const app=root.querySelector('.mm-lab__app');
  const steps=[...root.querySelectorAll('[data-mm-step]')];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let index=0,timers=[];

  const clear=()=>{timers.forEach(clearTimeout);timers=[];steps.forEach(x=>x.classList.remove('is-active'));};
  const select=(next)=>{
    clear();index=next;
    const c=cases[index];
    buttons.forEach((b,i)=>{b.classList.toggle('is-active',i===index);b.setAttribute('aria-pressed',String(i===index));});
    source.src=c.source;result.src=c.result;label.textContent=c.label;state.textContent='READY';app.classList.remove('is-revealed');
  };
  buttons.forEach((b,i)=>b.addEventListener('click',()=>select(i)));
  run?.addEventListener('click',()=>{
    clear();app.classList.remove('is-revealed');state.textContent='READING';
    const delay=reduced?45:330;
    steps.forEach((step,i)=>{
      timers.push(setTimeout(()=>{
        steps.forEach(x=>x.classList.remove('is-active'));step.classList.add('is-active');
        state.textContent=['READING','ANCHORS','HIERARCHY','MATERIALS'][i];
      },delay*i));
    });
    timers.push(setTimeout(()=>{steps.forEach(x=>x.classList.remove('is-active'));state.textContent='RESULT READY';app.classList.add('is-revealed');},delay*4+80));
  });
  select(0);
})();