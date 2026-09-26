import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {metrics,curve,confusion,calibration,psi,selectRows,deciles,segments,sum} from './risk-metrics.js';
const data=JSON.parse(await readFile('assets/credit-lab/analytics.json','utf8'));
// Relative tolerance absorbs summation order noise well below one currency cent.
const near=(a,b)=>assert.ok(Math.abs(a-b)<Math.max(1e-10,1e-12*Math.max(Math.abs(a),Math.abs(b))),`${a} != ${b}`);
test('All split metrics match independent Python outputs',()=>{for(const split of ['train','validation','test']){const rows=selectRows(data.rows,split),m=metrics(rows),expected=data.splits[split].metrics;for(const key of Object.keys(m))near(m[key],expected[key]);const c=confusion(rows,data.threshold);for(const key of ['tp','fp','fn','tn','precision','recall'])near(c[key],expected[key]);}});
test('Every ROC threshold and calibration interval matches Python',()=>{for(const split of ['train','validation','test']){const rows=selectRows(data.rows,split),c=curve(rows),e=data.splits[split].curves;assert.equal(c.length,e.length);c.forEach((p,i)=>{for(const k of ['fpr','tpr','precision','population'])near(p[k],e[i][k]);});const bins=calibration(rows);assert.equal(bins.length,data.splits[split].calibration.length);bins.forEach((b,i)=>{for(const k of Object.keys(b))near(b[k],data.splits[split].calibration[i][k]);});}});
test('PSI matches Python with fixed full-training reference',()=>{const ref=selectRows(data.rows,'train').map(r=>r.pd);for(const s of ['train','validation','test'])near(psi(ref,selectRows(data.rows,s).map(r=>r.pd)).value,data.splits[s].psi.value);});
test('History slicer partitions each split without duplicates',()=>{for(const s of ['train','validation','test'])assert.equal(selectRows(data.rows,s,'short').length+selectRows(data.rows,s,'established').length,selectRows(data.rows,s).length);});
test('Deciles and product segments preserve borrower and exposure totals',()=>{for(const s of ['train','validation','test']){const rows=selectRows(data.rows,s),d=deciles(rows);assert.equal(sum(d,'n'),rows.length);assert.equal(sum(d,'events'),sum(rows,'bad_6m'));near(d.at(-1).capture,1);near(sum(segments(rows),'exposure_egp'),sum(rows,'exposure'));}});
test('Tie scores, exact threshold and empty/single-class samples are safe',()=>{const rows=[{pd:.5,bad_6m:1},{pd:.5,bad_6m:0}];near(metrics(rows).roc_auc,.5);near(metrics(rows).average_precision,.5);assert.equal(confusion(rows,.5).tp,1);assert.equal(metrics([]).roc_auc,null);assert.equal(metrics([{pd:.4,bad_6m:0}]).roc_auc,null);assert.equal(psi([],[.1]).value,null);assert.deepEqual(deciles([]),[]);});
test('All 14 SQL reports have matching source, with synthetic-only mart',async()=>{const queries=JSON.parse(await readFile('assets/credit-lab/queries.json','utf8'));assert.equal(Object.keys(queries).length,14);assert.deepEqual(Object.keys(queries),Object.keys(data.reports));assert.equal(new Set(data.rows.map(r=>r.borrower_id)).size,3200);assert.ok(data.rows.every(r=>/^SYN-\d{5}$/.test(r.borrower_id)));assert.equal(data.synthetic,true);});
test('Dashboard entry points include all five functional destinations',async()=>{for(const name of ['score','credit-lab']){const html=await readFile(`dist/${name}.html`,'utf8');for(const panel of ['overview','performance','monitoring','code','governance']){assert.ok(html.includes(`data-panel="${panel}"`));assert.ok(html.includes(`id="panel-${panel}"`));}assert.ok(html.includes('risk-dashboard.js'));}});

test('SQL showcase demonstrates grain control and anti-fan-out engineering',async()=>{
  const queries=JSON.parse(await readFile('assets/credit-lab/queries.json','utf8'));
  assert.ok(Object.values(queries).every(q=>/WITH|ROW_NUMBER|GRAIN|FAN-OUT|SOURCE-GRAIN/i.test(q)));
  const joined=['03_utilization_segments','07_product_mix','08_history_segments','09_analytical_mart','12_exposure_by_risk','14_training_woe_counts'];
  for(const key of joined){
    assert.ok(/ROW_NUMBER\(\) OVER/i.test(queries[key]),key+' missing duplicate guard');
    assert.ok(/JOIN/i.test(queries[key]),key+' missing controlled join');
  }
});
test('Built iScore pages are web-first and contain no project download controls',async()=>{
  for(const name of ['score','credit-lab']){
    const html=await readFile(`dist/${name}.html`,'utf8');
    assert.ok(html.includes('data-open-panel="code"'));
    assert.ok(!/Download project|Export report CSV|Export CSV|download href/i.test(html));
    assert.ok(html.includes('WEB CODE SHOWCASE / SAVED OUTPUT'));
  }
});
