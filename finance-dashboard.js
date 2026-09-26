
const rows=[
{y:2002,r:15.50,e:1.51,a:18.20,c:1.30,pe:18.4,m:9.7,roa:.82,roe:5.9,de:2.10},
{y:2003,r:17.50,e:2.40,a:19.10,c:1.45,pe:19.1,m:13.7,roa:.93,roe:6.4,de:2.16},
{y:2004,r:19.20,e:3.10,a:20.40,c:1.62,pe:20.7,m:16.1,roa:1.02,roe:7.2,de:2.22},
{y:2005,r:20.80,e:3.70,a:21.80,c:1.75,pe:21.5,m:17.8,roa:1.08,roe:7.8,de:2.28},
{y:2006,r:21.20,e:4.20,a:23.30,c:1.88,pe:22.2,m:19.8,roa:1.12,roe:8.1,de:2.34},
{y:2007,r:21.77,e:3.40,a:24.90,c:1.96,pe:20.8,m:15.6,roa:1.03,roe:7.5,de:2.40},
{y:2008,r:23.50,e:7.30,a:26.70,c:2.15,pe:17.9,m:31.1,roa:1.34,roe:9.7,de:2.46},
{y:2009,r:25.00,e:6.80,a:28.60,c:2.24,pe:18.6,m:27.2,roa:1.28,roe:9.3,de:2.51},
{y:2010,r:26.00,e:5.90,a:30.80,c:2.33,pe:21.6,m:22.7,roa:1.18,roe:8.7,de:2.56},
{y:2011,r:27.00,e:8.01,a:33.00,c:2.42,pe:20.4,m:29.7,roa:1.31,roe:9.8,de:2.61},
{y:2012,r:27.56,e:8.07,a:35.20,c:2.50,pe:21.0,m:29.3,roa:1.29,roe:9.6,de:2.65},
{y:2013,r:28.10,e:8.20,a:37.60,c:2.58,pe:21.9,m:29.2,roa:1.27,roe:9.4,de:2.69},
{y:2014,r:26.90,e:7.60,a:39.40,c:2.61,pe:22.6,m:28.3,roa:1.20,roe:9.0,de:2.72},
{y:2015,r:24.90,e:6.80,a:41.00,c:2.55,pe:23.4,m:27.3,roa:1.09,roe:8.4,de:2.75},
{y:2016,r:23.50,e:7.00,a:42.70,c:2.60,pe:22.8,m:29.8,roa:1.10,roe:8.6,de:2.78},
{y:2017,r:22.82,e:8.57,a:44.10,c:2.72,pe:21.7,m:37.6,roa:1.19,roe:9.6,de:2.81},
{y:2018,r:19.20,e:7.40,a:45.30,c:2.68,pe:22.3,m:38.5,roa:1.12,roe:9.1,de:2.84},
{y:2019,r:21.28,e:8.01,a:46.70,c:2.74,pe:21.1,m:37.6,roa:1.16,roe:9.5,de:2.87},
{y:2020,r:18.70,e:5.60,a:47.80,c:2.58,pe:24.8,m:29.9,roa:.96,roe:8.2,de:2.90},
{y:2021,r:23.22,e:9.12,a:49.20,c:2.93,pe:23.0,m:39.3,roa:1.23,roe:10.4,de:2.93},
{y:2022,r:23.18,e:7.82,a:50.43,c:3.14,pe:20.4,m:33.7,roa:1.08,roe:9.1,de:2.95}
];
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const fmt=n=>Number(n).toFixed(2);
const pct=(v,p)=>p?((v/p-1)*100):null;
let selected=2022;
function svg(tag,attrs={}){const n=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);return n}
function poly(values,w,h,min,max){return values.map((v,i)=>`${28+i*(w-48)/(values.length-1)},${12+(max-v)*(h-30)/(max-min)}`).join(' ')}
function spark(target,key){const el=$(target);el.replaceChildren();const s=svg('svg',{viewBox:'0 0 160 36',preserveAspectRatio:'none'}),vals=rows.map(d=>d[key]),mn=Math.min(...vals),mx=Math.max(...vals);s.append(svg('polyline',{points:poly(vals,160,36,mn,mx),fill:'none',stroke:'#7d8995','stroke-width':'2'}));el.append(s)}
function renderTrend(){const el=$('#scb-trend');el.replaceChildren();const w=390,h=200,top=14,bottom=176,left=28,right=w-12,s=svg('svg',{viewBox:`0 0 ${w} ${h}`,preserveAspectRatio:'none'});const defs=svg('defs'),clip=svg('clipPath',{id:'scb-trend-clip'});clip.append(svg('rect',{x:left,y:top,width:right-left,height:bottom-top}));defs.append(clip);s.append(defs);for(let i=0;i<4;i++){const y=top+i*(bottom-top)/3;s.append(svg('line',{x1:left,y1:y,x2:right,y2:y,stroke:'#d9e2ea','stroke-width':'1'}))}const rv=rows.map(d=>d.r),ev=rows.map(d=>d.e),plot=svg('g',{'clip-path':'url(#scb-trend-clip)'});plot.append(svg('polyline',{points:poly(rv,w,h,14,30),fill:'none',stroke:'#16a050','stroke-width':'2.2'}));plot.append(svg('polyline',{points:poly(ev,w,h,0,10),fill:'none',stroke:'#142f94','stroke-width':'2.2'}));s.append(plot);rows.forEach((d,i)=>{if(i%4===0||i===rows.length-1){const t=svg('text',{x:left+i*(right-left)/(rows.length-1),y:h-3,'font-size':'8',fill:'#62778b','text-anchor':'middle'});t.textContent=d.y;s.append(t)}});el.append(s)}
function renderYoy(){const el=$('#scb-yoy');el.replaceChildren();const w=520,h=200,left=35,right=w-8,top=14,bottom=176,s=svg('svg',{viewBox:`0 0 ${w} ${h}`,preserveAspectRatio:'none'});const points=[];for(let i=1;i<rows.length;i++)points.push(pct(rows[i].r,rows[i-1].r),pct(rows[i].e,rows[i-1].e));const rawMin=Math.min(0,...points),rawMax=Math.max(0,...points),span=Math.max(10,rawMax-rawMin),pad=Math.max(4,span*.10),min=rawMin-pad,max=rawMax+pad,y=v=>top+(max-v)*(bottom-top)/(max-min),zero=y(0);const defs=svg('defs'),clip=svg('clipPath',{id:'scb-yoy-clip'});clip.append(svg('rect',{x:left,y:top,width:right-left,height:bottom-top}));defs.append(clip);s.append(defs);for(let i=0;i<5;i++){const gy=top+i*(bottom-top)/4;s.append(svg('line',{x1:left,y1:gy,x2:right,y2:gy,stroke:'#d9e2ea','stroke-width':'1'}))}s.append(svg('line',{x1:left,y1:zero,x2:right,y2:zero,stroke:'#9eb0c0','stroke-width':'1.2'}));const plot=svg('g',{'clip-path':'url(#scb-yoy-clip)'}),bw=5;for(let i=1;i<rows.length;i++){const x=left+(i-1)*(right-left)/(rows.length-2),yr=pct(rows[i].r,rows[i-1].r),ye=pct(rows[i].e,rows[i-1].e);for(const [v,dx,c] of [[yr,-3,'#159fea'],[ye,3,'#142f94']]){const yy=Math.max(top,Math.min(bottom,y(v))),barTop=Math.min(zero,yy),barBottom=Math.max(zero,yy);plot.append(svg('rect',{x:x+dx-bw/2,y:barTop,width:bw,height:Math.max(1,barBottom-barTop),fill:c}))}}s.append(plot);el.append(s)}
function renderTable(){const tb=$('#scb-table-body');tb.replaceChildren();[...rows].reverse().forEach(d=>{const tr=document.createElement('tr');if(d.y===selected)tr.className='active';[d.y,fmt(d.r),fmt(d.e),fmt(d.a),fmt(d.pe)].forEach((v,i)=>{const c=document.createElement(i?'td':'th');c.textContent=v;tr.append(c)});tr.addEventListener('click',()=>selectYear(d.y));tb.append(tr)})}
function gauge(id,val,max){const g=$(id);g.style.setProperty('--p',`${Math.min(50,Math.max(0,val/max*50))}%`);g.parentElement.querySelector('strong').textContent=val.toFixed(2)}
function setFocus(name){$$('.scb-tab').forEach(b=>b.classList.toggle('active',b.dataset.focus===name));$$('.scb-focus').forEach(n=>n.classList.remove('scb-focus'));const sels={performance:['#k-revenue','#k-earnings','#scb-yoy-panel','#scb-trend-panel'],balance:['#k-assets','#k-cash','#scb-trend-panel'],market:['#k-pe','#k-margin','#g-roa','#g-roe','#g-de'],reports:['#scb-table-panel']}[name]||[];sels.forEach(s=>$(s)?.classList.add('scb-focus'))}
function selectYear(y){selected=+y;const i=rows.findIndex(d=>d.y===selected),d=rows[i],p=rows[i-1];if(!d)return;
$$('.scb-year').forEach(b=>b.classList.toggle('active',+b.dataset.year===selected));
$('#v-assets').textContent=fmt(d.a);$('#v-revenue').textContent=fmt(d.r);$('#v-cash').textContent=fmt(d.c);$('#v-eps').textContent=fmt(d.e/15);$('#v-earnings').textContent=fmt(d.e);$('#v-pe').textContent=d.pe.toFixed(1);$('#v-margin').textContent=d.m.toFixed(1);
$('#l-assets').textContent=`Total assets ($B) · ${d.y}`;$('#l-revenue').textContent=`Revenue ($B) · ${d.y}`;$('#l-cash').textContent=`Cash on hand ($B) · ${d.y}`;$('#l-eps').textContent=`EPS ($) · ${d.y}`;$('#l-earnings').textContent=`Earnings ($B) · ${d.y}`;$('#l-pe').textContent=`P/E ratio · ${d.y}`;$('#l-margin').textContent=`Operating margin (%) · ${d.y}`;
const ry=p?pct(d.r,p.r):null,ey=p?pct(d.e,p.e):null;$('#v-rev-yoy').textContent=ry==null?'—':`${ry>=0?'+':''}${ry.toFixed(2)}%`;$('#v-earn-yoy').textContent=ey==null?'—':`${ey>=0?'+':''}${ey.toFixed(2)}%`;$('#v-prev').textContent=p?fmt(p.r):'—';$('#s-prev').textContent=p?`Previous year revenue · ${p.y}`:'No previous year';
gauge('#d-roa',d.roa,2.5);gauge('#d-roe',d.roe,20);gauge('#d-de',d.de,5);renderTable();$('#scb-stamp-year').textContent=d.y;
}
function init(){const list=$('#scb-year-list');[...rows].reverse().forEach(d=>{const b=document.createElement('button');b.type='button';b.className='scb-year';b.dataset.year=d.y;b.textContent=d.y;b.addEventListener('click',()=>selectYear(d.y));list.append(b)});$$('.scb-tab').forEach(b=>b.addEventListener('click',()=>setFocus(b.dataset.focus)));spark('#spark-assets','a');spark('#spark-eps','e');renderTrend();renderYoy();selectYear(selected);setFocus('performance')}
init();
