import {studies,getStudyView} from './studies.js';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const key=$('[data-study]').dataset.study,study=studies[key];let selection=study.default,mode='chart',selected=null;
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
function render(){const data=getStudyView(key,selection);$('.study-metrics').replaceChildren(...data.metrics.map(([label,value])=>{const item=el('div');item.append(el('span',label),el('strong',value));return item;}));
 const table=el('table'),thead=el('thead'),heading=el('tr');data.columns.forEach(c=>{const th=el('th',c);th.scope='col';heading.append(th);});thead.append(heading);const tbody=el('tbody');for(const row of data.rows){const tr=el('tr');row.forEach((v,i)=>{const cell=el(i?'td':'th',v);if(!i)cell.scope='row';tr.append(cell);});tbody.append(tr);}table.append(el('caption',study.demo+' — simulated data'),thead,tbody);$('#study-table').replaceChildren(table);
 const chart=$('#study-chart');chart.replaceChildren();$('.study-legend').replaceChildren(...data.series.map((s,i)=>el('span',s,i?'secondary':'')));
 if(!data.rows.length){const empty=el('div',undefined,'chart-empty');empty.append(el('h3','No records match this filter.'),el('p','Lower the minimum score to bring sample records back into view.'));chart.append(empty);$('#study-table').append(el('p','No records match this filter.'));}
 else {const count=data.series.length,max=Math.max(...data.rows.flatMap(r=>r.slice(1,1+count).map(Number)),1);data.rows.forEach((row,i)=>{const group=el('div',undefined,'bar-group');const label=el('span',row[0],'bar-label'),track=el('div',undefined,'bar-tracks');for(let s=0;s<count;s++){const v=+row[s+1],b=el('button',undefined,'interactive-bar'+(s?' secondary':''));b.type='button';b.style.setProperty('--bar-width',`${Math.max(1,v/max*100)}%`);b.setAttribute('aria-label',`${row[0]}, ${data.series[s]}: ${v} ${data.unit}`);b.setAttribute('aria-pressed',String(selected===`${i}-${s}`));b.append(el('span',v+(data.unit==='%'?'%':'')));b.addEventListener('click',()=>{selected=`${i}-${s}`;$$('.interactive-bar').forEach(n=>n.setAttribute('aria-pressed',String(n===b)));$('.selection-note').textContent=`${row[0]} · ${data.series[s]}: ${v} ${data.unit}`;});track.append(b);}group.append(label,track);chart.append(group);});}
 $$('.option-group [data-option]').forEach(b=>{const active=b.dataset.option===String(selection);b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));});if(key==='risk'){$('#score-output').textContent=selection;$('#score-filter').value=selection;$('.query-example').textContent=`/*
Synthetic T-SQL engineering pattern.
Target grain: one row per loan after all joins.
*/
WITH loan_ranked AS (
    SELECT
        l.record_id,
        l.customer_id,
        l.score,
        l.balance,
        ROW_NUMBER() OVER (
            PARTITION BY l.record_id
            ORDER BY l.source_updated_at DESC, l.source_row_id DESC
        ) AS rn
    FROM demo_loans AS l
),
loan_dedup AS (
    SELECT record_id, customer_id, score, balance
    FROM loan_ranked
    WHERE rn = 1
),
payment_agg AS (
    SELECT
        p.record_id,
        SUM(COALESCE(p.payment_amount, 0.0)) AS payments_90d,
        MAX(COALESCE(p.days_past_due, 0)) AS max_dpd_90d
    FROM demo_payments AS p
    GROUP BY p.record_id
),
final AS (
    SELECT
        l.record_id,
        l.score,
        l.balance,
        COALESCE(p.payments_90d, 0.0) AS payments_90d,
        COALESCE(p.max_dpd_90d, 0) AS max_dpd_90d
    FROM loan_dedup AS l
    LEFT JOIN payment_agg AS p
        ON p.record_id = l.record_id
    WHERE l.score >= ${Number(selection)}
)
SELECT record_id, score, balance, payments_90d, max_dpd_90d
FROM final
ORDER BY score DESC, record_id;

-- Release gate: must return zero rows.
SELECT record_id, COUNT(*) AS rows_after_join
FROM final
GROUP BY record_id
HAVING COUNT(*) <> 1;`;}
 $('.selection-note').textContent=data.rows.length?'Select a bar to inspect it.':'0 records matched.';applyMode();}
function applyMode(){$('#study-chart').hidden=mode!=='chart';$('#study-table').hidden=mode!=='table';$('.study-legend').hidden=mode!=='chart';$('.selection-note').hidden=mode!=='chart';$$('[data-view]').forEach(b=>{const active=b.dataset.view===mode;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));});}
$$('[data-option]').forEach(b=>b.addEventListener('click',()=>{selection=b.dataset.option;selected=null;render();}));$$('[data-view]').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.view;applyMode();}));$('#score-filter')?.addEventListener('input',e=>{selection=+e.target.value;selected=null;render();});$('.reset-study').addEventListener('click',()=>{selection=study.default;mode='chart';selected=null;render();});render();
