export const studies = {
 finance: {
  number:'01',
  title:'Suez Canal Bank',
  headline:'A clearer view of',
  emphasis:'financial performance.',
  category:'POWER BI / FINANCIAL ANALYSIS',
  color:'#d7ff82',
  summary:'A finance dashboard project focused on banking KPIs, revenue versus earnings, and year-over-year performance.',
  repository:'Suez-Canal-Bank-Finance-Dashboard',
  question:'How do revenue and earnings move together?',
  context:'The original project explores financial performance in Power BI. The browser replica keeps every KPI in one selected-year context so ratios, prior-year comparisons, and balance-sheet values remain analytically coherent.',
  brief:{
   problem:'Turn a dense multi-year bank dashboard into a view where annual performance, growth and ratios can be read without mixing grains.',
   data:'Illustrative annual banking series covering 2002–2022 for the web replica; not official bank financial statements.',
   method:'Selected-year KPI logic, prior-year comparisons, revenue and earnings trend analysis, and ratio views.',
   engineering:'State-driven dashboard calculations, shared calculation logic, bounded SVG charts, and regression checks for selected-year behavior.',
   result:'Changing the year updates KPIs, YoY values, ratios, gauges and the table under one coherent time context.',
   limitations:'The browser data is illustrative and the web replica is not a Power BI .pbix file or an official Suez Canal Bank report.',
   code:'Interactive browser replica plus the original project repository.'
  },
  demo:'Quarterly performance',
  control:'Choose a year',
  options:[['2024','2024'],['2025','2025']],
  default:'2025',
  explanation:'Compare the two series quarter by quarter. The difference between revenue and earnings shows why a rising top line is only part of the picture.',
  craft:['State-driven charts','Accessible data tables','Responsive dashboard layout'],
  next:'score'
 },
 score: {
  number:'02',
  title:'iScore Dashboard',
  headline:'See the shape of',
  emphasis:'the whole cohort.',
  category:'PYTHON / SQL / MODEL VALIDATION',
  color:'#8ee6dc',
  summary:'Synthetic credit-risk analytics with an interactive browser dashboard, model validation, and engineered SQL.',
  repository:'iScore-Dashboard',
  question:'How do borrower risk signals change across cohorts and thresholds?',
  context:'The iScore Credit Lab uses synthetic borrower data to demonstrate point-in-time feature engineering, probability ranking, calibration, threshold analysis and portfolio reporting without exposing real bureau or employer data.',
  brief:{
   problem:'Build a transparent credit-risk analytics workflow that connects source grain, features, model output and portfolio interpretation.',
   data:'Synthetic borrower, account-month, inquiry, repayment and model-output data; no customer or employer data.',
   method:'Point-in-time features, borrower-disjoint train/validation/test splits, logistic baseline, threshold analysis, calibration and stability diagnostics.',
   engineering:'Borrower-grain contracts, duplicate guards, anti-fan-out joins, web-based code/results exploration, automated build and regression checks.',
   result:'A browser case study where model metrics, portfolio concentration, SQL and Python can be inspected together.',
   limitations:'Synthetic cohort, random split rather than out-of-time validation, and no claim of real-world bureau accuracy or regulatory approval.',
   code:'SQL and Python are exposed in-browser with the GitHub source retained as the implementation reference.'
  },
  demo:'Cohort distribution',
  control:'Choose a cohort',
  options:[['all','All profiles'],['new','New profiles'],['established','Established profiles']],
  default:'all',
  explanation:'A distribution shows where observations concentrate. Switch cohorts to see the profile count and the shape of the distribution update together.',
  craft:['Linked summary metrics','Cohort filtering','Interactive chart selection'],
  next:'risk'
 },
 risk: {
  number:'03',
  title:'Credit Risk Management',
  headline:'Engineer the grain',
  emphasis:'before the join.',
  category:'SQL / DATA ENGINEERING',
  color:'#ffce8a',
  summary:'A relational SQL project exploring grain control, deduplication, safe aggregation, and credit-risk reporting through simulated banking data.',
  repository:'Credit-Risk-Management-Database-SQL-Project',
  question:'How do you stop one-to-many joins from silently multiplying risk data?',
  context:'The project schema links Customers, Accounts, Loans, Payments, Payment_Schedule and Credit_Scores. The browser demo keeps the score control, while the SQL showcase pre-aggregates one-to-many child tables, resolves the latest score, handles nulls, and checks that the final loan grain stays unique.',
  brief:{
   problem:'Produce customer and loan risk views without inflating balances, payments or delinquency counts through one-to-many joins.',
   data:'Simulated relational banking tables covering customers, accounts, loans, payments, repayment schedules, applications, credit scores and risk assessments.',
   method:'Define target grain first, aggregate payment and schedule detail separately, resolve latest point-in-time attributes, then join controlled datasets.',
   engineering:'Window-function deduplication, pre-aggregation, null handling, referential-integrity checks, duplicate release gates and reconciliation queries.',
   result:'Risk queries remain interpretable at customer or loan grain and the browser demo shows the engineering logic behind the filter.',
   limitations:'Small simulated dataset designed to demonstrate SQL structure rather than production scale or real underwriting performance.',
   code:'The browser shows the engineered pattern; the repository contains the relational schema and SQL analysis.'
  },
  demo:'Grain-safe query playground',
  control:'Minimum demonstration score',
  default:600,
  explanation:'The score threshold changes one business predicate while the surrounding SQL keeps the intended one-row-per-loan grain. The engineering checks matter more than the filter itself.',
  craft:['Deterministic deduplication','Fan-out-safe aggregation','Reconciliation release checks'],
  next:'people'
 },
 people: {
  number:'04',
  title:'Understanding Attrition',
  headline:'Look beyond',
  emphasis:'the headline number.',
  category:'PYTHON / EXPLORATORY ANALYSIS',
  color:'#bba5ff',
  summary:'A Python analysis of employee attrition patterns across role, income, overtime and other workforce dimensions.',
  repository:'HR-Attrition-Analysis-Using-Python',
  question:'Does the pattern change when you change the grouping?',
  context:'The original analysis investigates employee attrition with Python. This companion demo uses fictional aggregate counts to show how the same population can be grouped in different ways. Association does not establish causation.',
  brief:{
   problem:'Move beyond one overall attrition rate and identify which workforce segments differ enough to warrant closer investigation.',
   data:'IBM-style HR attrition data in the original analysis; the browser companion uses clearly labeled fictional aggregates.',
   method:'Exploratory grouping, derived attrition rates, distribution comparisons and interpretation across workforce dimensions.',
   engineering:'Reusable grouping logic, chart/table parity, explicit denominator handling and clear separation between source analysis and browser demo data.',
   result:'The project shows how the same workforce population tells different stories when grouped by department, overtime and related features.',
   limitations:'Exploratory associations only; no causal claim, intervention recommendation or production HR model.',
   code:'Python analysis lives in the project repository; the browser demo focuses on interpretation and interaction.'
  },
  demo:'Workforce lens',
  control:'Group the sample by',
  options:[['department','Department'],['overtime','Overtime']],
  default:'department',
  explanation:'Switch between department and overtime to change the level of detail. The total population stays the same; the rates within each group reveal different perspectives.',
  craft:['Alternative data groupings','Derived rate calculations','Chart and table parity'],
  next:'finance'
 }
};
export const sampleLoans=[{id:'DEMO-001',score:720,balance:42000},{id:'DEMO-002',score:610,balance:28000},{id:'DEMO-003',score:540,balance:18000},{id:'DEMO-004',score:780,balance:56000},{id:'DEMO-005',score:660,balance:35000},{id:'DEMO-006',score:590,balance:23000},{id:'DEMO-007',score:810,balance:68000},{id:'DEMO-008',score:690,balance:31000}];
export function getStudyView(key,selection){
 if(!studies[key])throw new Error('Unknown study');
 if(key==='finance'){
  const sets={'2024':[[42,46,49,54],[9,11,12,14]],'2025':[[51,55,59,66],[12,14,16,19]]};const s=sets[selection];if(!s)throw new Error('Invalid year');const revenue=s[0].reduce((a,b)=>a+b,0),earnings=s[1].reduce((a,b)=>a+b,0);
  return {columns:['Quarter','Revenue (demo units)','Earnings (demo units)'],rows:s[0].map((v,i)=>['Q'+(i+1),v,s[1][i]]),series:['Revenue','Earnings'],unit:'units',metrics:[['Annual revenue',revenue+' units'],['Annual earnings',earnings+' units'],['Earnings / revenue',(earnings/revenue*100).toFixed(1)+'%']]};
 }
 if(key==='score'){
  const bands=['300–499','500–599','600–699','700–799','800–850'];const sets={all:[35,105,290,410,160],new:[28,62,123,74,13],established:[7,43,167,336,147]};const values=sets[selection];if(!values)throw new Error('Invalid cohort');const total=values.reduce((a,b)=>a+b,0);return {columns:['Demonstration band','Profiles'],rows:values.map((v,i)=>[bands[i],v]),series:['Profiles'],unit:'profiles',metrics:[['Profiles in cohort',total.toLocaleString('en-US')],['Largest band',bands[values.indexOf(Math.max(...values))]],['Bands explored','5']]};
 }
 if(key==='risk'){
  const threshold=Number(selection);if(!Number.isFinite(threshold)||threshold<300||threshold>850)throw new Error('Invalid threshold');const filtered=sampleLoans.filter(r=>r.score>=threshold),balance=filtered.reduce((a,r)=>a+r.balance,0);return {columns:['Sample record','Score','Balance (demo units)'],rows:filtered.map(r=>[r.id,r.score,r.balance.toLocaleString('en-US')]),series:['Score'],unit:'score',metrics:[['Matching records',String(filtered.length)+' / '+sampleLoans.length],['Sample balance',balance.toLocaleString('en-US')+' units'],['Minimum score',String(threshold)]]};
 }
 const groups={department:[['Engineering',240,24],['Sales',180,36],['Operations',120,18],['People',60,6]],overtime:[['With overtime',180,45],['Without overtime',420,39]]};const values=groups[selection];if(!values)throw new Error('Invalid grouping');const total=values.reduce((a,r)=>a+r[1],0),left=values.reduce((a,r)=>a+r[2],0);return {columns:['Group','Attrition rate (%)','Employees','Departures'],rows:values.map(([label,n,l])=>[label,+(l/n*100).toFixed(1),n,l]),series:['Attrition rate'],unit:'%',metrics:[['Sample employees',String(total)],['Sample departures',String(left)],['Overall attrition',(left/total*100).toFixed(1)+'%']]};
}
