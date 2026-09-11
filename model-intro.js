const clamp=n=>Math.max(0,Math.min(1,n));
const ease=n=>{n=clamp(n);return n*n*(3-2*n);};
export function introState(progress){const p=clamp(progress);return{progress:p,assemble:ease(p/.28),fly:ease((p-.28)/.48)*29,chart:ease((p-.74)/.18),stage:p<.28?0:p<.74?1:2,opacity:1-ease((p-.94)/.06)};}
export function projectPoint(x,y,z,w,h){if(z<=.35)return null;const k=Math.min(w,h)*.92/z;return{x:w/2+x*k,y:h*.55+y*k,k};}

// A schematic model, not real customer data or a trained network.
export function drawModel(ctx,w,h,s,time=0){
  ctx.clearRect(0,0,w+1,h+1);
  if(s.progress>=1)return;
  const line=(a,b,color,width=1)=>{if(!a||!b)return;ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();};
  const dot=(p,r,color)=>{if(!p)return;ctx.fillStyle=color;ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fill();};
  const world=(x,y,z)=>projectPoint(x,y,z-s.fly,w,h);
  ctx.globalAlpha=1-s.chart;
  for(let i=0;i<66;i++){
    const angle=i*2.39996,r=3.1+(i%7)*.29,z=1+(i*.71+time*.65)%32,x=Math.cos(angle)*r,y=Math.sin(angle)*r;
    line(world(x,y,z),world(x,y,z+1.4+s.fly*.07),i%3?'#56777d66':'#b7f77899',1.1);
    if(i%6===0){const p=world(x,y,z);if(p){ctx.fillStyle='#9dbbb9';ctx.font='12px monospace';ctx.fillText((i*.0137).toFixed(3),p.x+6,p.y);}}
  }
  for(let layer=5;layer>=0;layer--){
    const z=5+layer*5,twist=(1-s.assemble)*.8+layer*.055,nodes=[],positions=[];
    for(let n=0;n<16;n++){
      const side=Math.floor(n/4),u=(n%4)/4;
      let x=side===0?-2.6+5.2*u:side===1?2.6:side===2?2.6-5.2*u:-2.6;
      let y=side===0?-1.8:side===1?-1.8+3.6*u:side===2?1.8:1.8-3.6*u;
      const scatter=1-s.assemble;x+=Math.sin(n*7+layer)*scatter*4;y+=Math.cos(n*3-layer)*scatter*3;
      positions.push([x,y]);nodes.push(world(x*Math.cos(twist)-y*Math.sin(twist),x*Math.sin(twist)+y*Math.cos(twist),z));
    }
    const alpha=clamp((z-s.fly)/2)*clamp(1-(z-s.fly)/42);
    for(let n=0;n<16;n++){
      line(nodes[n],nodes[(n+1)%16],`rgba(161,234,184,${alpha*.7})`,1.2);
      const p=nodes[n];if(p)dot(p,Math.min(5,1.1+p.k*.018),n%4===0?'#d5ff9a':'#61d7d8');
      if(layer<5&&s.assemble>.1)line(p,world(...positions[n],z+5),`rgba(95,203,207,${alpha*.18*s.assemble})`);
    }
    const label=world(-2.6,-2.05,z);if(label){ctx.font='12px monospace';ctx.fillStyle=`rgba(190,223,218,${alpha})`;ctx.fillText(['INPUT / 01','FEATURES / 02','WEIGHTS / 03','PATTERNS / 04','OUTPUT / 05','PREDICTION / 06'][layer],label.x,label.y);}
  }
  ctx.globalAlpha=s.chart*s.opacity;
  const left=w*.16,right=w*.84,top=h*.38,bottom=h*.76;
  for(let i=0;i<5;i++)line({x:left,y:top+(bottom-top)*i/4},{x:right,y:top+(bottom-top)*i/4},'#6b919330');
  const points=Array.from({length:65},(_,i)=>{const t=i/64;return{x:left+(right-left)*t,y:bottom-(bottom-top)/(1+Math.exp(-9*(t-.48)))};});
  for(let i=1;i<points.length;i++){if(i/64>s.chart)break;line(points[i-1],points[i],'#caff8c',2.8);if(i%8===0)dot(points[i],4,'#dfffbe');}
  ctx.font='12px monospace';ctx.fillStyle='#a6c2c1';ctx.fillText('ILLUSTRATIVE MODEL RESPONSE',left,bottom+30);ctx.globalAlpha=1;
}

export function startIntro(){
  const section=document.querySelector('#intro'),canvas=document.querySelector('#intro-points');if(!section||!canvas)return;
  const ctx=canvas.getContext('2d'),reduced=matchMedia('(prefers-reduced-motion: reduce)');let width=0,height=0,dirty=true,visible=true,last=0,time=0,state=introState(0),raf=0;
  const labels=[['01 / INPUT','Inside the model.','Scroll to move through the layers.'],['02 / PROCESS','Follow the signal.','From features to a prediction.'],['03 / OUTPUT','A clearer picture.','Data science. Built by Marwan Ahmed.']];
  const root=document.documentElement,title=document.querySelector('#intro-title'),note=document.querySelector('#intro-note'),step=document.querySelector('#intro-step'),copy=document.querySelector('.intro-copy');
  function resize(){width=canvas.clientWidth;height=canvas.clientHeight;const dpr=Math.min(devicePixelRatio||1,1.75);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx?.setTransform(dpr,0,0,dpr,0,0);dirty=true;}
  function setup(){root.classList.toggle('intro-reduced',reduced.matches||!ctx);resize();wake();}
  function update(){const rect=section.getBoundingClientRect(),short=reduced.matches||!ctx;state=introState(short?0:-rect.top/Math.max(1,rect.height-innerHeight));const active=!short&&rect.top<=0&&rect.bottom>innerHeight*.5;if(root.classList.contains('entry-active')!==active)root.classList.toggle('entry-active',active);const text=labels[state.stage];step.textContent=text[0];title.textContent=short?'Marwan Ahmed.':text[1];note.textContent=short?'Data science. Risk analytics. SQL.':text[2];copy.style.opacity=String(state.opacity);document.querySelector('.intro-progress span').style.transform=`scaleX(${state.progress})`;document.querySelector('#intro-percent').textContent=String(Math.round(state.progress*100)).padStart(3,'0')+'%';dirty=false;}
  function frame(now){raf=0;const dt=Math.min((now-last)/1000,.05);last=now;if(document.hidden)return;if(dirty)update();if(ctx&&visible&&!reduced.matches){if(!root.classList.contains('motion-paused'))time+=dt;drawModel(ctx,width,height,state,time);}if(visible&&!reduced.matches&&!root.classList.contains('motion-paused'))raf=requestAnimationFrame(frame);}
  function wake(){if(!raf)raf=requestAnimationFrame(frame);}
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;dirty=true;wake();}).observe(section);
  new MutationObserver(wake).observe(root,{attributes:true,attributeFilter:['class']});
  addEventListener('scroll',()=>{dirty=true;wake();},{passive:true});addEventListener('resize',()=>{resize();wake();});document.addEventListener('visibilitychange',wake);reduced.addEventListener('change',setup);
  document.querySelector('#skip-intro').addEventListener('click',()=>{root.classList.remove('entry-active');document.querySelector('#home').focus({preventScroll:true});});setup();
}
if(typeof document!=='undefined')startIntro();
