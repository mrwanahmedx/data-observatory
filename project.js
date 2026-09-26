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
Production-style pattern over the project schema.
Target grain: one row per LoanID after all one-to-many sources are aggregated.
*/
WITH score_ranked AS (
    SELECT
        cs.CustomerID,
        cs.ScoreDate,
        cs.CreditScore,
        ROW_NUMBER() OVER (
            PARTITION BY cs.CustomerID
            ORDER BY cs.ScoreDate DESC, cs.CreditScore DESC
        ) AS rn
    FROM Credit_Scores AS cs
),
latest_score AS (
    SELECT CustomerID, CreditScore
    FROM score_ranked
    WHERE rn = 1
),
payment_agg AS (
    SELECT
        p.LoanID,
        COUNT(*) AS PaymentCount,
        SUM(COALESCE(p.PaymentAmount, 0.0)) AS TotalPayments
    FROM Payments AS p
    GROUP BY p.LoanID
),
schedule_agg AS (
    SELECT
        ps.LoanID,
        SUM(COALESCE(ps.DueAmount, 0.0)) AS ScheduledDue,
        SUM(COALESCE(ps.PaidAmount, 0.0)) AS ScheduledPaid,
        MAX(COALESCE(ps.DaysLate, 0)) AS MaxDaysLate
    FROM Payment_Schedule AS ps
    GROUP BY ps.LoanID
),
loan_grain AS (
    SELECT
        l.LoanID,
        a.CustomerID,
        s.CreditScore,
        l.LoanType,
        l.Principal,
        l.InterestRate,
        l.Status,
        COALESCE(p.PaymentCount, 0) AS PaymentCount,
        COALESCE(p.TotalPayments, 0.0) AS TotalPayments,
        COALESCE(sc.ScheduledDue, 0.0) AS ScheduledDue,
        COALESCE(sc.ScheduledPaid, 0.0) AS ScheduledPaid,
        COALESCE(sc.MaxDaysLate, 0) AS MaxDaysLate
    FROM Loans AS l
    JOIN Accounts AS a
        ON a.AccountID = l.AccountID
    LEFT JOIN latest_score AS s
        ON s.CustomerID = a.CustomerID
    LEFT JOIN payment_agg AS p
        ON p.LoanID = l.LoanID
    LEFT JOIN schedule_agg AS sc
        ON sc.LoanID = l.LoanID
),
final AS (
    SELECT *
    FROM loan_grain
    WHERE CreditScore >= ${Number(selection)}
)
SELECT
    LoanID, CustomerID, CreditScore, LoanType, Principal,
    PaymentCount, TotalPayments, ScheduledDue, ScheduledPaid, MaxDaysLate
FROM final
ORDER BY CreditScore DESC, LoanID;

-- Release gate: must return zero rows.
SELECT LoanID, COUNT(*) AS RowsAfterJoin
FROM final
GROUP BY LoanID
HAVING COUNT(*) <> 1;`;}
 $('.selection-note').textContent=data.rows.length?'Select a bar to inspect it.':'0 records matched.';applyMode();}
function applyMode(){$('#study-chart').hidden=mode!=='chart';$('#study-table').hidden=mode!=='table';$('.study-legend').hidden=mode!=='chart';$('.selection-note').hidden=mode!=='chart';$$('[data-view]').forEach(b=>{const active=b.dataset.view===mode;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));});}
$$('[data-option]').forEach(b=>b.addEventListener('click',()=>{selection=b.dataset.option;selected=null;render();}));$$('[data-view]').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.view;applyMode();}));$('#score-filter')?.addEventListener('input',e=>{selection=+e.target.value;selected=null;render();});$('.reset-study').addEventListener('click',()=>{selection=study.default;mode='chart';selected=null;render();});render();
