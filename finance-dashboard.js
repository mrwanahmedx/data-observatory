import {rows,pct,financeView,yoyDomain,chartY} from './finance-dashboard-core.js';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const fmt=n=>Number(n).toFixed(2);
let selected=2022;
function svg(tag,attrs={}){const n=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);return n}
function poly(values,w,h,min,max){return values.map((v,i)=>`${28+i*(w-48)/(values.length-1)},${12+(max-v)*(h-30)/(max-min)}`).join(' ')}
function spark(target,key){const el=$(target);el.replaceChildren();const s=svg('svg',{viewBox:'0 0 160 36',preserveAspectRatio:'none'}),vals=rows.map(d=>d[key]),mn=Math.min(...vals),mx=Math.max(...vals);s.append(svg('polyline',{points:poly(vals,160,36,mn,mx),fill:'none',stroke:'#7d8995','stroke-width':'2'}));el.append(s)}
function renderTrend(){
  const el=$('#scb-trend');el.replaceChildren();
  const w=390,h=200,top=14,bottom=176,left=45,right=w-14;
  const rv=rows.map(d=>d.r),ev=rows.map(d=>d.e);
  // Both series are dollar billions, so draw them on one shared zero-based scale.
  const yMax=Math.ceil(Math.max(...rv,...ev)/5)*5;
  const x=i=>left+i*(right-left)/(rows.length-1);
  const y=v=>bottom-v/yMax*(bottom-top);
  const points=values=>values.map((v,i)=>`${x(i)},${y(v)}`).join(' ');
  const s=svg('svg',{viewBox:`0 0 ${w} ${h}`,preserveAspectRatio:'none',role:'img','aria-label':'Revenue and earnings in billions of dollars on a common vertical scale'});
  const defs=svg('defs'),clip=svg('clipPath',{id:'scb-trend-clip'});
  clip.append(svg('rect',{x:left,y:top,width:right-left,height:bottom-top}));defs.append(clip);s.append(defs);
  for(let i=0;i<5;i++){
    const level=yMax*(4-i)/4,gy=y(level);
    s.append(svg('line',{x1:left,y1:gy,x2:right,y2:gy,stroke:'#d9e2ea','stroke-width':'1'}));
    const label=svg('text',{x:left-6,y:gy+3,'text-anchor':'end','font-size':'9',fill:'#62778b'});
    label.textContent=level.toFixed(0);s.append(label);
  }
  const plot=svg('g',{'clip-path':'url(#scb-trend-clip)'});
  plot.append(svg('polyline',{points:points(rv),fill:'none',stroke:'#16a050','stroke-width':'2.2'}));
  plot.append(svg('polyline',{points:points(ev),fill:'none',stroke:'#142f94','stroke-width':'2.2'}));
  const idx=rows.findIndex(d=>d.y===selected);
  if(idx>=0)plot.append(svg('line',{x1:x(idx),x2:x(idx),y1:top,y2:bottom,stroke:'#62778b','stroke-width':'1','stroke-dasharray':'3 3'}));
  s.append(plot);
  rows.forEach((d,i)=>{if(i%4===0||i===rows.length-1){const t=svg('text',{x:x(i),y:h-3,'font-size':'8',fill:'#62778b','text-anchor':'middle'});t.textContent=d.y;s.append(t)}});
  el.append(s);
}
function renderYoy(){const el=$('#scb-yoy');el.replaceChildren();const w=520,h=200,left=35,right=w-8,top=14,bottom=176,s=svg('svg',{viewBox:`0 0 ${w} ${h}`,preserveAspectRatio:'none'});const points=[];for(let i=1;i<rows.length;i++)points.push(pct(rows[i].r,rows[i-1].r),pct(rows[i].e,rows[i-1].e));const {min,max}=yoyDomain(points),y=v=>chartY(v,{min,max,top,bottom}),zero=y(0);const defs=svg('defs'),clip=svg('clipPath',{id:'scb-yoy-clip'});clip.append(svg('rect',{x:left,y:top,width:right-left,height:bottom-top}));defs.append(clip);s.append(defs);for(let i=0;i<5;i++){const gy=top+i*(bottom-top)/4;s.append(svg('line',{x1:left,y1:gy,x2:right,y2:gy,stroke:'#d9e2ea','stroke-width':'1'}))}s.append(svg('line',{x1:left,y1:zero,x2:right,y2:zero,stroke:'#9eb0c0','stroke-width':'1.2'}));const plot=svg('g',{'clip-path':'url(#scb-yoy-clip)'}),bw=5;for(let i=1;i<rows.length;i++){const x=left+(i-1)*(right-left)/(rows.length-2),yr=pct(rows[i].r,rows[i-1].r),ye=pct(rows[i].e,rows[i-1].e);for(const [v,dx,c] of [[yr,-3,'#159fea'],[ye,3,'#142f94']]){const yy=Math.max(top,Math.min(bottom,y(v))),barTop=Math.min(zero,yy),barBottom=Math.max(zero,yy);plot.append(svg('rect',{x:x+dx-bw/2,y:barTop,width:bw,height:Math.max(1,barBottom-barTop),fill:c}))}}s.append(plot);el.append(s)}
function renderTable(){const tb=$('#scb-table-body');tb.replaceChildren();[...rows].reverse().forEach(d=>{const tr=document.createElement('tr');if(d.y===selected)tr.className='active';[d.y,fmt(d.r),fmt(d.e),fmt(d.a),fmt(d.pe)].forEach((v,i)=>{const c=document.createElement(i?'td':'th');c.textContent=v;tr.append(c)});tr.addEventListener('click',()=>selectYear(d.y));tb.append(tr)})}
function gauge(id,val,max){const g=$(id);g.style.setProperty('--p',`${Math.min(50,Math.max(0,val/max*50))}%`);g.parentElement.querySelector('strong').textContent=val.toFixed(2)}
function setFocus(name){$$('.scb-tab').forEach(b=>b.classList.toggle('active',b.dataset.focus===name));$$('.scb-focus').forEach(n=>n.classList.remove('scb-focus'));const sels={performance:['#k-revenue','#k-earnings','#scb-yoy-panel','#scb-trend-panel'],balance:['#k-assets','#k-cash','#scb-trend-panel'],market:['#k-pe','#k-margin','#g-roa','#g-roe','#g-de'],reports:['#scb-table-panel']}[name]||[];sels.forEach(s=>$(s)?.classList.add('scb-focus'))}
function selectYear(y){selected=+y;let view;try{view=financeView(selected);}catch{return;}const d=view.current,p=view.previous;
$$('.scb-year').forEach(b=>b.classList.toggle('active',+b.dataset.year===selected));
$('#v-assets').textContent=fmt(d.a);$('#v-revenue').textContent=fmt(d.r);$('#v-cash').textContent=fmt(d.c);$('#v-eps').textContent=fmt(view.eps);$('#v-earnings').textContent=fmt(d.e);$('#v-pe').textContent=d.pe.toFixed(1);$('#v-margin').textContent=d.m.toFixed(1);
$('#l-assets').textContent=`Total assets ($B) · ${d.y}`;$('#l-revenue').textContent=`Revenue ($B) · ${d.y}`;$('#l-cash').textContent=`Cash on hand ($B) · ${d.y}`;$('#l-eps').textContent=`EPS ($) · ${d.y}`;$('#l-earnings').textContent=`Earnings ($B) · ${d.y}`;$('#l-pe').textContent=`P/E ratio · ${d.y}`;$('#l-margin').textContent=`Operating margin (%) · ${d.y}`;
const ry=view.revenueYoy,ey=view.earningsYoy;$('#v-rev-yoy').textContent=ry==null?'—':`${ry>=0?'+':''}${ry.toFixed(2)}%`;$('#v-earn-yoy').textContent=ey==null?'—':`${ey>=0?'+':''}${ey.toFixed(2)}%`;$('#v-prev').textContent=p?fmt(p.r):'—';$('#s-prev').textContent=p?`Previous year revenue · ${p.y}`:'No previous year';
gauge('#d-roa',d.roa,2.5);gauge('#d-roe',d.roe,20);gauge('#d-de',d.de,5);renderTable();renderTrend();$('#scb-stamp-year').textContent=d.y;
}
function init(){const list=$('#scb-year-list');[...rows].reverse().forEach(d=>{const b=document.createElement('button');b.type='button';b.className='scb-year';b.dataset.year=d.y;b.textContent=d.y;b.addEventListener('click',()=>selectYear(d.y));list.append(b)});$$('.scb-tab').forEach(b=>b.addEventListener('click',()=>setFocus(b.dataset.focus)));spark('#spark-assets','a');spark('#spark-eps','e');renderYoy();selectYear(selected);setFocus('performance')}
init();
