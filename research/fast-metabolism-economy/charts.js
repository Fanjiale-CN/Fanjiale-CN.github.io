
(function(){
  const D = window.GALOK_R002_DATA;
  if(!D) throw new Error("GALOK_R002_DATA not found");
  const isMobile=window.matchMedia("(max-width: 600px)").matches;
  const $ = (q,root=document)=>root.querySelector(q);
  const $$ = (q,root=document)=>[...root.querySelectorAll(q)];
  const ns="http://www.w3.org/2000/svg";
  const el=(tag,attrs={})=>{
    const n=document.createElementNS(ns,tag);
    Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v));
    return n;
  };
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const tooltip=$("#r002-tooltip");
  function showTip(e,html){
    tooltip.innerHTML=html; tooltip.classList.add("show");
    const x=clamp(e.clientX+14,10,window.innerWidth-tooltip.offsetWidth-10);
    const y=clamp(e.clientY+14,10,window.innerHeight-tooltip.offsetHeight-10);
    tooltip.style.left=x+"px";tooltip.style.top=y+"px";
  }
  function hideTip(){tooltip.classList.remove("show")}

  function hero(){
    const h=D["headline"];
    $("#hero-net").textContent=h.conservative_core.net_growth_pct.toFixed(1)+"%";
    $("#hero-mmr").textContent=h.conservative_core.mmr_pct.toFixed(1)+"%";
    $("#hero-expanded").textContent=`Expanded final-issuer pool: ${h.expanded_final_issuer.net_growth_pct.toFixed(1)}% net growth · ${h.expanded_final_issuer.mmr_pct.toFixed(1)}% MMR`;
    const field=$("#hero-dots");
    for(let i=0;i<100;i++){
      const d=document.createElement("span");d.className="r002-dot";
      if(i<18)d.classList.add("flow");
      if(i>=18&&i<25)d.classList.add("exit");
      d.style.animationDelay=((i%13)*.07)+"s";
      field.appendChild(d);
    }
  }

  function figure2(){
    const g=D["brand-anatomy"].cards.find(x=>x.brand==="Guming");
    $("#g-begin").textContent="9,914";
    $("#g-open").textContent="+"+g.opened.toLocaleString();
    $("#g-close").textContent="−"+g.closed.toLocaleString();
    $("#g-end").textContent="13,554";
    $("#g-net").textContent=g.net_growth_pct.toFixed(1)+"%";
    $("#g-mmr").textContent=g.mmr_pct.toFixed(1)+"%";
  }

  function scatter(rootId,rows,opts){
    const root=document.getElementById(rootId);
    const W=isMobile?640:1000,H=isMobile?560:590,p=isMobile?{l:58,r:24,t:28,b:64}:{l:74,r:40,t:32,b:64};
    const svg=el("svg",{viewBox:`0 0 ${W} ${H}`,class:`r002-svg${isMobile?" is-mobile":""}`,"aria-label":opts.aria||"scatter chart"});
    const xmin=opts.xmin,xmax=opts.xmax,ymin=opts.ymin,ymax=opts.ymax;
    const sx=x=>p.l+(x-xmin)/(xmax-xmin)*(W-p.l-p.r);
    const sy=y=>H-p.b-(y-ymin)/(ymax-ymin)*(H-p.t-p.b);
    const xticks=opts.xticks,yticks=opts.yticks;

    yticks.forEach(v=>{
      svg.appendChild(el("line",{x1:p.l,y1:sy(v),x2:W-p.r,y2:sy(v),class:"r002-gridline"}));
      const t=el("text",{x:p.l-12,y:sy(v)+4,"text-anchor":"end",class:"r002-axis-label"});t.textContent=v+"%";svg.appendChild(t);
    });
    xticks.forEach(v=>{
      const t=el("text",{x:sx(v),y:H-p.b+26,"text-anchor":"middle",class:"r002-axis-label"});t.textContent=v+"%";svg.appendChild(t);
    });
    svg.appendChild(el("line",{x1:p.l,y1:H-p.b,x2:W-p.r,y2:H-p.b,class:"r002-axis"}));
    svg.appendChild(el("line",{x1:p.l,y1:p.t,x2:p.l,y2:H-p.b,class:"r002-axis"}));

    if(opts.vref!==undefined) svg.appendChild(el("line",{x1:sx(opts.vref),y1:p.t,x2:sx(opts.vref),y2:H-p.b,class:"r002-refline"}));
    if(opts.href!==undefined) svg.appendChild(el("line",{x1:p.l,y1:sy(opts.href),x2:W-p.r,y2:sy(opts.href),class:"r002-refline"}));

    if(opts.regions&&!isMobile){
      opts.regions.forEach(r=>{
        const t=el("text",{x:sx(r.x),y:sy(r.y),class:"r002-region-label","text-anchor":r.anchor||"start"});
        t.textContent=r.text;svg.appendChild(t);
      });
    }

    rows.forEach(r=>{
      const x=opts.x(r),y=opts.y(r);
      const key=opts.key(r);
      let cls="r002-point base";
      if(opts.negative && opts.negative(r))cls="r002-point negative";
      if(opts.highlight && opts.highlight.includes(key))cls="r002-point highlight";
      const c=el("circle",{cx:sx(x),cy:sy(y),r:5,class:cls,tabindex:"0"});
      const html=opts.tip(r);
      c.addEventListener("mousemove",e=>showTip(e,html)); c.addEventListener("mouseleave",hideTip);
      c.addEventListener("focus",e=>{const b=c.getBoundingClientRect();showTip({clientX:b.left,clientY:b.top},html)}); c.addEventListener("blur",hideTip);
      svg.appendChild(c);
      if(opts.labels && opts.labels[key]){
        const cfg=opts.labels[key];
        const t=el("text",{x:sx(x)+(cfg.dx||8),y:sy(y)+(cfg.dy||-8),class:"r002-label","text-anchor":cfg.anchor||"start"});
        t.textContent=cfg.text||key;svg.appendChild(t);
      }
    });

    const xl=el("text",{x:(p.l+W-p.r)/2,y:H-12,"text-anchor":"middle",class:"r002-axis-label"});xl.textContent=opts.xlabel;svg.appendChild(xl);
    const yl=el("text",{x:18,y:(p.t+H-p.b)/2,transform:`rotate(-90 18 ${(p.t+H-p.b)/2})`,"text-anchor":"middle",class:"r002-axis-label"});yl.textContent=opts.ylabel;svg.appendChild(yl);
    root.appendChild(svg);
  }

  function fig3(){
    const q=D["quadrants"];
    const labels={
      "Guming|2025":{text:"Guming 2025",dx:10,dy:-11},
      "Busy Ming Group|2024":{text:"Busy Ming 2024",dx:-10,dy:-12,anchor:"end"},
      "Busy Ming Group|2025":{text:"Busy Ming 2025",dx:10,dy:-10},
      "Auntea Jenny|2025":{text:"Auntea Jenny 2025",dx:10,dy:-8},
      "Jiumaojiu|2025":{text:"Jiumaojiu 2025",dx:10,dy:16},
      "Yum China Other Brands|2025":{text:"Yum Other 2025",dx:10,dy:18},
      "Xiabuxiabu Group|2025":{text:"Xiabuxiabu 2025",dx:10,dy:18},
      "MIXUE Group|2024":{text:"MIXUE 2024",dx:10,dy:-10},
    };
    const mobileLabels={
      "Guming|2025":labels["Guming|2025"],
      "Busy Ming Group|2025":labels["Busy Ming Group|2025"],
      "Jiumaojiu|2025":labels["Jiumaojiu|2025"],
    };
    scatter("quadrant-chart",q.observations,{
      xmin:-25,xmax:135,ymin:15,ymax:85,
      xticks:[-20,0,20,40,60,80,100,120],yticks:[20,30,40,50,60,70,80],
      vref:0,href:q.median_mmr_pct,
      xlabel:"Net store growth",ylabel:"Market Metabolism Rate (MMR)",
      key:r=>`${r.system}|${r.year}`,x:r=>r.net_growth_pct,y:r=>r.mmr_pct,
      negative:r=>r.net_growth_pct<0,
      highlight:["Guming|2025","Busy Ming Group|2024","Busy Ming Group|2025","Auntea Jenny|2025","MIXUE Group|2024"],
      labels:isMobile?mobileLabels:labels,
      regions:[
        {x:4,y:82,text:"HIGH METABOLISM · EXPANSION"},
        {x:4,y:27,text:"LOW METABOLISM · EXPANSION"},
        {x:-23,y:82,text:"HIGH METABOLISM · CONTRACTION"},
        {x:-23,y:27,text:"LOW METABOLISM · CONTRACTION"},
      ],
      tip:r=>`<b>${r.system} · ${r.year}</b><br>MMR ${r.mmr_pct.toFixed(1)}%<br>Net growth ${r.net_growth_pct.toFixed(1)}%`
    });
    $("#quadrant-n").textContent=q.n;
    $("#quadrant-median").textContent=q.median_mmr_pct.toFixed(1)+"%";
    $("#quadrant-agree").textContent=Math.round(q.fixed_30pct_agreement_rate*100)+"%";
  }

  function fig4(){
    const l=D["brand-lifecycle"], root=$("#life-groups");
    const grouped={};
    l.state_order.forEach(s=>grouped[s]=[]);
    l.brands.forEach(b=>(grouped[b.state]||(grouped[b.state]=[])).push(b));
    l.state_order.forEach(state=>{
      const brands=grouped[state]||[];
      const g=document.createElement("div");g.className="r002-life-group";
      const lab=document.createElement("div");lab.className="r002-life-label";
      lab.innerHTML=`<strong>${l.state_labels[state]}</strong><small>${brands.length} brands</small>`;
      const mat=document.createElement("div");mat.className="r002-life-matrix";
      brands.forEach(b=>{
        b.present.forEach((v,i)=>{
          const c=document.createElement("span");c.className="r002-life-cell"+(v?" on":"");
          c.title=`${b.brand} · ${l.years[i]} · ${v?"present":"absent"}`;
          c.addEventListener("mousemove",e=>showTip(e,`<b>${b.brand}</b><br>${l.years[i]}: ${v?"present in roster":"not in roster"}<br>${l.state_labels[state]}`));
          c.addEventListener("mouseleave",hideTip);
          mat.appendChild(c);
        });
      });
      g.append(lab,mat);root.appendChild(g);
    });
    $("#life-brands").textContent=l.canonical_brands;
    $("#life-presences").textContent=l.brand_year_presences;
    $("#life-core").textContent=l.present_all_four_years;
    $("#life-retention").textContent="69% → 75% → 64%";
  }

  function fig5(){
    const f=D["franchise-association"];
    $("#fr-p").textContent=f.pearson_r.toFixed(2);
    $("#fr-s").textContent=f.spearman_rho.toFixed(2);
    $("#fr-part").textContent=(f.partial_r_controlling_log_initial_size<0?"−":"")+Math.abs(f.partial_r_controlling_log_initial_size).toFixed(2);
    scatter("franchise-chart",f.rows,{
      xmin:0,xmax:101,ymin:-45,ymax:55,
      xticks:[0,20,40,60,80,100],yticks:[-40,-20,0,20,40],
      xlabel:"Franchise intensity",ylabel:"Subsequent network growth",
      key:r=>r.brand_en,x:r=>r.franchise_intensity_pct,y:r=>r.growth_pct,
      negative:r=>r.growth_pct<0,
      tip:r=>`<b>${r.brand_en}</b><br>Franchise intensity ${r.franchise_intensity_pct.toFixed(1)}%<br>Growth ${r.growth_pct.toFixed(1)}%<br>Initial stores ${r.initial_stores.toLocaleString()}`,
      labels:{}
    });
  }

  function fig6(){
    const root=$("#brand-cards");
    D["brand-anatomy"].cards.forEach(c=>{
      const card=document.createElement("article");card.className="r002-card"+(c.message?" break":"");
      let html=`<div class="r002-card-year">${c.year}</div><h3>${c.brand}</h3>`;
      if(c.message){
        html+=`<div class="r002-card-pair"><div><b>${c.franchisee_terminations.toLocaleString()}</b><small>Franchisee terminations</small></div><div><b>${c.stores_transferred_to_other_franchisees.toLocaleString()}</b><small>Stores transferred</small></div></div><div class="r002-card-message">${c.message}</div>`;
      }else{
        html+=`<div class="r002-card-pair"><div><b>${c.opened.toLocaleString()}</b><small>Opened</small></div><div><b>${c.closed.toLocaleString()}</b><small>Closed</small></div><div><b>${c.net_growth_pct.toFixed(1)}%</b><small>Net growth</small></div><div><b>${c.mmr_pct.toFixed(1)}%</b><small>MMR</small></div></div>`;
      }
      card.innerHTML=html;root.appendChild(card);
    });
  }

  function fig7(){
    const t=D["closure-taxonomy"],root=$("#taxonomy");
    const descriptions={
      "License expiry":"The administrative licence reaches its stated end date. This does not establish that the physical outlet stopped trading at the same moment.",
      "License cancellation":"A licence is cancelled in the administrative system. Physical closure still requires outlet-level evidence.",
      "Legal-entity cancellation":"The legal subject ceases to exist. The storefront may continue under another subject.",
      "Legal-entity revocation":"A legal sanction/status event. It does not, by itself, timestamp physical closure.",
      "Franchisee exit":"The operator leaves the franchise relationship. The store may be transferred and continue operating.",
      "Store transfer":"The operator changes while the physical outlet may remain open.",
      "Relocation / address change":"The old location may cease while the business continues elsewhere; relocation and destruction are different events.",
      "Ranking disappearance":"The brand leaves a ranking universe. It says nothing direct about outlet survival.",
      "Verified physical closure":"The source supports the interpretation that the outlet ceased operating at the location."
    };
    t.groups.filter(g=>g.group!=="Physical outcome").forEach(g=>{
      const col=document.createElement("div");col.className="r002-tax-group";
      col.innerHTML=`<h3>${g.group}</h3>`;
      g.events.forEach(ev=>{
        const b=document.createElement("button");b.type="button";b.className="r002-tax-event";b.textContent=ev.event;
        b.onclick=()=>{
          $$(".r002-tax-event").forEach(x=>x.classList.remove("active"));b.classList.add("active");
          $("#tax-detail").innerHTML=`<b>${ev.event}</b> — ${descriptions[ev.event]}`;
        };
        col.appendChild(b);
      });
      root.appendChild(col);
    });
    $("#tax-question").textContent=t.question;
    $("#tax-detail").innerHTML="<b>Verified physical closure</b> — "+descriptions["Verified physical closure"];
  }

  hero();figure2();fig3();fig4();fig5();fig6();fig7();
})();
