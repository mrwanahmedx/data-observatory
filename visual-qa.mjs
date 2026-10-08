import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const out='qa-captures';
await mkdir(out,{recursive:true});
const base='https://mrwanahmedx.github.io/data-observatory/';
const routes=[
 ['home',''],['finance','finance.html'],['score','score.html'],
 ['risk','risk.html'],['people','people.html'],['about','about.html'],
 ['credit-lab','credit-lab.html'],['methodology','credit-methodology.html']
];
const devices=[
 {name:'desktop',width:1440,height:900},
 {name:'mobile',width:390,height:844},
 {name:'tablet',width:768,height:1024}
];
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const report={timestamp:new Date().toISOString(),base,devices:[],routes:[],notes:[]};
for(const device of devices){
 const context=await browser.newContext({viewport:{width:device.width,height:device.height},deviceScaleFactor:1,isMobile:device.name==='mobile',hasTouch:device.name==='mobile',reducedMotion:'reduce'});
 const page=await context.newPage();
 for(const [key,route] of routes){
  if(device.name==='tablet' && !['home','finance','score','credit-lab'].includes(key))continue;
  const errors=[],badResponses=[],requests=[];
  const onError=e=>errors.push(String(e.message||e));
  const onConsole=m=>{if(m.type()==='error')errors.push('console: '+m.text())};
  const onResponse=r=>{if(r.status()>=400)badResponses.push(r.status()+' '+r.url())};
  const onFailed=r=>requests.push(r.url()+' '+r.failure()?.errorText);
  page.on('pageerror',onError);page.on('console',onConsole);page.on('response',onResponse);page.on('requestfailed',onFailed);
  let status=null,exception=null;
  try{
   const res=await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:45000}); status=res?.status()??null;
   await page.waitForTimeout(850);
   await page.evaluate(()=>document.fonts?.ready||Promise.resolve());
   const state=await page.evaluate(()=>{
    const right=[];
    for(const el of [...document.querySelectorAll('body *')]){
     const r=el.getBoundingClientRect(),s=getComputedStyle(el);
     if(r.width>0&&r.right>innerWidth+3&&!['fixed','absolute'].includes(s.position)&&right.length<12)right.push({element:el.tagName.toLowerCase(),className:String(el.className).slice(0,70),right:Math.round(r.right)});
    }
    return {title:document.title,documentWidth:document.documentElement.scrollWidth,viewportWidth:innerWidth,documentHeight:document.documentElement.scrollHeight,overflowPx:Math.max(0,document.documentElement.scrollWidth-innerWidth),visibleText:document.body.innerText.slice(0,400),possibleOverflowElements:right};
   });
   const fname=device.name+'-'+key+'.jpg';
   await page.screenshot({path:out+'/'+fname,type:'jpeg',quality:55,fullPage:true,animations:'disabled',timeout:30000});
   report.routes.push({device:device.name,route:base+route,key,status,...state,errors,badResponses,requests,screenshot:fname});
   if(key==='home'&&device.name==='desktop'){
    await page.locator('#hero-title').scrollIntoViewIfNeeded();
    await page.screenshot({path:out+'/desktop-home-hero.jpg',type:'jpeg',quality:65});
    await page.locator('#work').scrollIntoViewIfNeeded();
    await page.screenshot({path:out+'/desktop-home-work.jpg',type:'jpeg',quality:65});
    await page.locator('[data-lens="retention"]').click();await page.locator('[data-range="6"]').click();
    report.notes.push({test:'home lenses/range',label:await page.locator('#metric-label').innerText(),value:await page.locator('#metric-value').innerText()});
   }
   if(key==='finance'&&device.name==='desktop'){
    await page.locator('.scb-year[data-year="2002"]').click();
    report.notes.push({test:'finance year 2002',selectedYear:await page.locator('#scb-stamp-year').innerText(),revenue:await page.locator('#v-revenue').innerText()});
    await page.locator('.scb-year[data-year="2022"]').click();
   }
   if(key==='risk'){
    await page.locator('#score-filter').fill('850');
    report.notes.push({test:'risk empty state',device:device.name,found:(await page.locator('#study-chart').innerText()).slice(0,180)});
   }
   if(key==='score'||key==='credit-lab'){
    for(const panel of ['performance','monitoring','code','governance']){
     await page.locator('[data-panel="'+panel+'"]').click();
     if(device.name==='desktop')await page.screenshot({path:out+'/desktop-'+key+'-'+panel+'.jpg',type:'jpeg',quality:60});
     report.notes.push({test:key+' panel',device:device.name,panel,visible:await page.locator('#panel-'+panel).isVisible()});
    }
   }
  }catch(e){exception=String(e.message||e);report.routes.push({device:device.name,key,route:base+route,status,exception,errors,badResponses,requests});}
  page.off('pageerror',onError);page.off('console',onConsole);page.off('response',onResponse);page.off('requestfailed',onFailed);
 }
 await context.close();
}
await browser.close();
await writeFile(out+'/manifest.json',JSON.stringify(report,null,2));
const summary={pages:report.routes.length,statuses:report.routes.map(r=>({key:r.key,device:r.device,status:r.status,overflow:r.overflowPx,errors:r.errors?.length||0,requests:r.requests?.length||0,exception:r.exception})),notes:report.notes};
console.log(JSON.stringify(summary,null,2));
