import {mkdir,copyFile,readFile,writeFile,cp} from 'node:fs/promises';
import {creditLabPage} from './credit-lab-page.mjs';
import {riskDashboardPage} from './risk-dashboard-page.mjs';
import {projectPage,aboutPage} from './pages.mjs';
import {studies} from './studies.js';
const files=['index.html','style.css','app.js','scene.js','data.js','favicon.svg','studies.js','project.js','pages.css','finance-dashboard.css','finance-dashboard.js'];
files.push('identity.js','identity.css');
files.push('intro.js','intro.css','model-intro.js','model-intro.css');
await mkdir('dist',{recursive:true});
for(const file of files){await copyFile(file,`dist/${file}`);}
for(const key of Object.keys(studies)){if(key==='finance')continue;await writeFile(`dist/${key}.html`,projectPage(key));}
await copyFile('finance.html','dist/finance.html');
await writeFile('dist/about.html',aboutPage());
const result=JSON.parse(await readFile('assets/credit-lab/results.json','utf8'));
await writeFile('dist/credit-lab.html',riskDashboardPage(result));
await writeFile('dist/score.html',riskDashboardPage(result));
await writeFile('dist/credit-methodology.html',creditLabPage(result));
for(const f of ['risk-dashboard.js','risk-dashboard.css','risk-metrics.js','credit-engineering.js'])await copyFile(f,`dist/${f}`);
await cp('assets','dist/assets',{recursive:true});
await copyFile('credit-lab.js','dist/credit-lab.js');
await copyFile('credit-lab.css','dist/credit-lab.css');
const html=await readFile('dist/index.html','utf8');
for(const asset of ['style.css','app.js','favicon.svg'])if(!html.includes(asset))throw new Error(`Missing reference: ${asset}`);
console.log('Built home, internal pages, interactive assets and web-first code showcases.');
