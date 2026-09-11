export const datasets={
 growth:{label:'REVENUE INDEX',title:'Growth trajectory',unit:'',values:[100,108,105,117,113,126,121,134,131,141,136,148.2]},
 engagement:{label:'ACTIVE SESSIONS',title:'Engagement pattern',unit:'k',values:[12.2,13.1,15.4,14.7,18.3,17.8,19.5,22.1,20.4,24.8,23.6,27.3]},
 retention:{label:'RETENTION RATE',title:'Retention over time',unit:'%',values:[68,70,69,73,75,72,77,79,78,82,81,84.6]}
};
export const months=['January','February','March','April','May','June','July','August','September','October','November','December'];
export function seriesFor(lens,range){if(!datasets[lens])throw new Error('Unknown dataset');if(![6,12].includes(range))throw new Error('Invalid range');return datasets[lens].values.slice(-range);}
export function changeFor(values,index){return ((values[index]-values[0])/values[0])*100;}
export function plotPoints(values){const min=Math.floor(Math.min(...values)*.82),max=Math.ceil(Math.max(...values)*1.08);return values.map((v,i)=>({x:48+i*640/(values.length-1),y:220-(v-min)/(max-min)*190,value:v}));}
