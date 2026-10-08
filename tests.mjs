import test from 'node:test';
import assert from 'node:assert/strict';
import {seriesFor,changeFor,plotPoints,datasets} from './data.js';
import {studies,getStudyView} from './studies.js';
import {readFile,readdir,access} from 'node:fs/promises';
import path from 'node:path';
import {introState} from './intro.js';
import {rows as financeRows,financeView,yoyDomain,chartY} from './finance-dashboard-core.js';
test('Scroll opening clamps progress, changes stages, and flies through only after forming the ring',()=>{assert.equal(introState(-1).progress,0);assert.equal(introState(2).progress,1);assert.equal(introState(.2).stage,0);assert.equal(introState(.5).stage,1);assert.equal(introState(.8).stage,2);assert.equal(introState(.6).fly,0);assert.equal(introState(1).morph,2);assert.equal(introState(1).fly,9);assert.equal(introState(1).opacity,0);});
import {roles,titleAtTime,cycleDuration,createIdentity} from './identity.js';
test('Identity title holds, erases, types and loops through every requested role',()=>{assert.equal(titleAtTime(0).text,'Data Scientist');assert.equal(titleAtTime(cycleDuration).text,roles[0]);const seen=new Set();let erased=false,partial=false;for(let t=0;t<cycleDuration;t+=10){const s=titleAtTime(t);assert.ok(roles[s.index].startsWith(s.text));if(s.text===roles[s.index])seen.add(s.text);if(!s.text)erased=true;if(s.text&&s.text!==roles[s.index])partial=true;}assert.equal(seen.size,4);assert.ok(erased&&partial);});
test('Reduced motion and local pause show complete titles and freeze elapsed time',()=>{const text={},index={},button={setAttribute(){},addEventListener(_,fn){this.click=fn;}},root={classList:{toggle(){}}};const c=createIdentity({text,index,button,root,initialPaused:true});c.tick(5);assert.equal(text.textContent,roles[0]);assert.equal(button.disabled,true);c.setPaused(false);c.tick(2.4);button.click();assert.ok(roles.includes(text.textContent));const frozen=text.textContent;c.tick(10);assert.equal(text.textContent,frozen);button.click();assert.equal(button.textContent,'Pause titles');});
import {thresholdMetrics} from './credit-lab.js';
test('Credit lab JavaScript reproduces Python confusion and boundary cases',async()=>{const r=JSON.parse(await readFile('assets/credit-lab/results.json','utf8'));const m=thresholdMetrics(r.test_predictions,r.threshold);for(const k of Object.keys(m))assert.ok(Math.abs(m[k]-r.metrics.test[k])<1e-12);assert.equal(thresholdMetrics(r.test_predictions,0).fn,0);assert.equal(thresholdMetrics(r.test_predictions,1).tp,0);assert.equal(thresholdMetrics([{pd:.25,bad_6m:1}],.25).tp,1);});

test('SCB dashboard keeps one coherent selected-year context',()=>{
  assert.equal(financeRows.length,21);
  assert.equal(new Set(financeRows.map(r=>r.y)).size,21);
  const v=financeView(2022);
  assert.equal(v.current.a,50.43);
  assert.equal(v.current.r,23.18);
  assert.equal(v.previous.y,2021);
  assert.equal(v.previous.r,23.22);
  assert.equal(v.current.pe,20.4);
  assert.equal(v.current.m,33.7);
  assert.ok(Math.abs(v.revenueYoy-((23.18/23.22-1)*100))<1e-12);
  assert.ok(Math.abs(v.earningsYoy-((7.82/9.12-1)*100))<1e-12);
});
test('SCB YoY scaling contains every bar inside the chart plot',()=>{
  const values=[];
  for(let i=1;i<financeRows.length;i++){
    values.push((financeRows[i].r/financeRows[i-1].r-1)*100);
    values.push((financeRows[i].e/financeRows[i-1].e-1)*100);
  }
  const domain=yoyDomain(values);
  for(const value of values){
    const y=chartY(value,{...domain,top:14,bottom:176});
    assert.ok(Number.isFinite(y));
    assert.ok(y>=14&&y<=176);
  }
});
test('SCB presentation does not expose summed ratio labels and clips chart SVGs',async()=>{
  const [html,css,js]=await Promise.all([
    readFile('finance.html','utf8'),
    readFile('finance-dashboard.css','utf8'),
    readFile('finance-dashboard.js','utf8')
  ]);
  assert.ok(!/Sum of P\/E|Sum of Operating Margin|Sum of EPS/i.test(html));
  assert.ok(html.includes('Selected-year ratio'));
  assert.ok(css.includes('.scb-chart>svg'));
  assert.ok(css.includes('overflow:hidden'));
  assert.ok(js.includes("clip-path"));
});

test('Six-month range returns July through December for every lens',()=>{for(const key of Object.keys(datasets))assert.deepEqual(seriesFor(key,6),datasets[key].values.slice(6));});
test('Period change is relative to first visible month',()=>{assert.equal(changeFor([100,125],1),25);assert.equal(changeFor([100,125],0),0);assert.equal(changeFor([100,75],1),-25);});
test('All chart series remain within the plot bounds',()=>{for(const key of Object.keys(datasets))for(const range of [6,12]){const points=plotPoints(seriesFor(key,range));assert.equal(points.length,range);assert.equal(points[0].x,48);assert.equal(points.at(-1).x,688);for(const p of points){assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y));assert.ok(p.y>=30&&p.y<=220);}}});
test('Rejects unsupported chart inputs',()=>{assert.throws(()=>seriesFor('missing',12));assert.throws(()=>seriesFor('growth',4));});
test('Finance year selector changes totals and derives the correct margin',()=>{const a=getStudyView('finance','2024'),b=getStudyView('finance','2025');assert.equal(a.metrics[0][1],'191 units');assert.equal(b.metrics[0][1],'231 units');assert.equal(b.metrics[2][1],(61/231*100).toFixed(1)+'%');});
test('Score cohorts partition the full population',()=>{const all=getStudyView('score','all'),fresh=getStudyView('score','new'),established=getStudyView('score','established');all.rows.forEach((r,i)=>assert.equal(r[1],fresh.rows[i][1]+established.rows[i][1]));});
test('Score filter includes exact boundary and supports an empty state',()=>{assert.equal(getStudyView('risk',300).rows.length,8);assert.equal(getStudyView('risk',810).rows.length,1);assert.equal(getStudyView('risk',850).rows.length,0);assert.ok(getStudyView('risk',690).rows.every(r=>r[1]>=690));});
test('Workforce grouping preserves total employees and departures',()=>{const a=getStudyView('people','department'),b=getStudyView('people','overtime');assert.deepEqual(a.metrics,b.metrics);assert.equal(a.metrics[0][1],'600');assert.equal(a.metrics[2][1],'14.0%');assert.equal(b.rows[0][1],25);});
test('All project navigation forms one complete cycle',()=>{const visited=new Set();let current='finance';for(let i=0;i<4;i++){assert.ok(studies[current]);visited.add(current);current=studies[current].next;}assert.equal(visited.size,4);assert.equal(current,'finance');});
test('Every built local link, fragment, and asset resolves',async()=>{const files=(await readdir('dist')).filter(f=>f.endsWith('.html'));assert.equal(files.length,8);for(const file of files){const html=await readFile('dist/'+file,'utf8');for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){const href=match[1];if(/^(https?:|mailto:|data:)/.test(href))continue;const [target,fragment]=href.split('#'),resolved=path.join('dist',target||file);await access(resolved);if(fragment){const linked=await readFile(resolved,'utf8');assert.ok(linked.includes(`id="${fragment}"`),`${file}: missing ${href}`);}}}});

test('Project pages expose recruiter-first problem-to-code briefs',async()=>{
  for(const file of ['finance.html','risk.html','people.html']){
    const html=await readFile('dist/'+file,'utf8');
    for(const label of ['Problem','Data','Method','Engineering challenge','Result','Limitations','Code'])assert.ok(html.includes(label),file+' missing '+label);
    assert.ok(html.includes('RECRUITER BRIEF'),file+' missing recruiter brief');
  }
});
test('Repository change log records material reliability fixes',async()=>{
  const log=await readFile('CHANGELOG.md','utf8');
  assert.ok(log.includes('iScore Credit Lab runtime initialization'));
  assert.ok(log.includes('Suez Canal Bank dashboard KPI context'));
  assert.ok(log.includes('regression test'));
});

// Prevent regression of two analytical errors found in the independent audit.
test('SQL sample materializes the grain-safe result before its release gate',async()=>{
  const code=await readFile('project.js','utf8');
  assert.ok(code.includes('INTO #FilteredLoans'));
  assert.match(code,/FROM #FilteredLoans\s+GROUP BY LoanID/);
  assert.ok(code.includes('DROP TABLE #FilteredLoans;'));
  assert.ok(code.includes('cs.ScoreDate < DATEADD(day, 1, @AsOfDate)'));
  assert.doesNotMatch(code,/FROM final\s+GROUP BY LoanID/);
});
test('Finance trend uses one labeled dollar-billion scale for both series',async()=>{
  const js=await readFile('finance-dashboard.js','utf8');
  assert.ok(js.includes('const yMax=Math.ceil(Math.max(...rv,...ev)/5)*5;'));
  assert.ok(js.includes('points(rv)'));
  assert.ok(js.includes('points(ev)'));
  assert.ok(js.includes('common vertical scale'));
  assert.ok(!js.includes('poly(ev,w,h,0,10)'));
});
