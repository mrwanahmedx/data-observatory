export const rows=[
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
export const pct=(value,previous)=>previous?((value/previous-1)*100):null;
export const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
export function financeView(year){
  const index=rows.findIndex(r=>r.y===Number(year));
  if(index<0)throw new Error('Unknown finance year');
  const current=rows[index],previous=rows[index-1]||null;
  return {
    current,
    previous,
    revenueYoy:previous?pct(current.r,previous.r):null,
    earningsYoy:previous?pct(current.e,previous.e):null,
    eps:current.e/15
  };
}
export function yoyDomain(values){
  const finite=values.filter(Number.isFinite);
  const rawMin=Math.min(0,...finite),rawMax=Math.max(0,...finite);
  const span=Math.max(10,rawMax-rawMin),pad=Math.max(4,span*.10);
  return {min:rawMin-pad,max:rawMax+pad};
}
export function chartY(value,{min,max,top=14,bottom=176}){
  if(!Number.isFinite(value)||!Number.isFinite(min)||!Number.isFinite(max)||max<=min)throw new Error('Invalid chart scale');
  return clamp(top+(max-value)*(bottom-top)/(max-min),top,bottom);
}
