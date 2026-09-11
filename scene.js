const vertex=`
attribute vec3 aPosition;
attribute vec3 aTarget;
attribute vec3 aFinal;
attribute float aSeed;
uniform float uTime,uMorph,uAspect,uPixel,uScale,uMotion,uFly;
uniform vec2 uPointer;
varying float vAlpha,vSeed;
mat3 rotX(float a){float s=sin(a),c=cos(a);return mat3(1.,0.,0.,0.,c,s,0.,-s,c);}
mat3 rotY(float a){float s=sin(a),c=cos(a);return mat3(c,0.,-s,0.,1.,0.,s,0.,c);}
void main(){
 float first=smoothstep(0.,1.,uMorph);
 float second=smoothstep(1.,2.,uMorph);
 vec3 p=mix(mix(aPosition,aTarget,first),aFinal,second);
 p+=.016*sin(uTime*.7+aSeed*25.)*uMotion;
 p=rotX(.28+uPointer.y*.18)*rotY(uTime*.075+uPointer.x*.35)*p;
 float depth=6.7-p.z-uFly;
 if(depth<=.1){gl_Position=vec4(3.,3.,0.,1.);gl_PointSize=1.;vAlpha=0.;vSeed=aSeed;return;}
 gl_Position=vec4(p.x*uScale/uAspect/depth,p.y*uScale/depth,0.,1.);
 gl_PointSize=clamp(uPixel*(1.4+aSeed*1.6)*(6./depth),1.,6.);
 vAlpha=clamp(.26+(p.z+2.)*.14,.2,.9);
 vSeed=aSeed;
}`;
const fragment=`
precision mediump float;
varying float vAlpha,vSeed;
void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;float edge=1.-smoothstep(.12,.5,d);vec3 color=mix(vec3(.50,.69,.34),vec3(.88,1.,.69),vSeed);gl_FragColor=vec4(color,vAlpha*edge*.8);}`;
const rand=i=>{const n=Math.sin(i*127.1+311.7)*43758.5453;return n-Math.floor(n);};
export class PointScene{
 constructor(canvas,kind){
  this.canvas=canvas;this.kind=kind;this.morph=0;this.fly=0;this.pointer=[0,0];this.reduced=false;
  const gl=canvas.getContext('webgl',{alpha:true,antialias:false,powerPreference:'low-power',premultipliedAlpha:false});this.gl=gl;
  if(!gl){canvas.parentElement.classList.add('no-webgl');return;}
  const compile=(type,source)=>{const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(shader));return shader;};
  try{const program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Scene could not initialize');this.program=program;gl.useProgram(program);}catch{canvas.parentElement.classList.add('no-webgl');this.gl=null;return;}
  const pos=[],target=[],final=[],seeds=[];const count=kind==='hero'?18432:4096;this.count=count;
  for(let i=0;i<count;i++){
   const seed=rand(i+1);seeds.push(seed);
   if(kind==='hero'){
    const u=(i%192)/192*Math.PI*2,v=Math.floor(i/192)/96*Math.PI*2;
    const r=1.5+.47*Math.cos(3*u),tube=.22;
    const p=[(r+tube*Math.cos(v))*Math.cos(2*u),(r+tube*Math.cos(v))*Math.sin(2*u),.62*Math.sin(3*u)+tube*Math.sin(v)];
    pos.push(...p);target.push(...p);final.push(...p);
   }else if(kind==='entry'){
    pos.push((rand(i*3+1)-.5)*7,(rand(i*3+2)-.5)*5,(rand(i*3+3)-.5)*4.8);
    const y=1-2*(i+.5)/count,r=Math.sqrt(1-y*y),angle=i*Math.PI*(3-Math.sqrt(5));
    target.push(Math.cos(angle)*r*2,y*2,Math.sin(angle)*r*2);
    const u=(i%128)/128*Math.PI*2,v=Math.floor(i/128)/32*Math.PI*2,ring=1.7+.32*Math.cos(v);
    final.push(ring*Math.cos(u),ring*Math.sin(u),.32*Math.sin(v));
   }else{
    pos.push((rand(i*3+1)-.5)*4.4,(rand(i*3+2)-.5)*3.4,(rand(i*3+3)-.5)*3.4);
    const y=1-2*(i+.5)/count,r=Math.sqrt(1-y*y),a=i*Math.PI*(3-Math.sqrt(5));
    target.push(Math.cos(a)*r*1.8,y*1.8,Math.sin(a)*r*1.8);
    const x=(i%64)/63*3.8-1.9,z=Math.floor(i/64)/63*3.8-1.9;
    final.push(x,Math.sin(x*1.2+z*.8)*.65+Math.cos(z*1.5)*.35,z);
   }
  }
  const bind=(name,data,size)=>{const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);const loc=gl.getAttribLocation(this.program,name);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,size,gl.FLOAT,false,0,0);};
  bind('aPosition',pos,3);bind('aTarget',target,3);bind('aFinal',final,3);bind('aSeed',seeds,1);
  this.uniforms={};for(const name of ['uTime','uMorph','uAspect','uPixel','uScale','uMotion','uPointer','uFly'])this.uniforms[name]=gl.getUniformLocation(this.program,name);
  gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.clearColor(0,0,0,0);
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();this.gl=null;canvas.parentElement.classList.add('no-webgl');});
  this.resize();this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(canvas);
 }
 resize(){if(!this.gl)return;const r=this.canvas.getBoundingClientRect();this.width=r.width;this.height=r.height;this.pixel=Math.min(devicePixelRatio||1,1.8);this.canvas.width=Math.round(r.width*this.pixel);this.canvas.height=Math.round(r.height*this.pixel);this.gl.viewport(0,0,this.canvas.width,this.canvas.height);}
 draw(time){const gl=this.gl;if(!gl||!this.height)return;const u=this.uniforms;gl.useProgram(this.program);gl.clear(gl.COLOR_BUFFER_BIT);gl.uniform1f(u.uTime,time);gl.uniform1f(u.uFly,this.fly);gl.uniform1f(u.uMorph,this.morph);gl.uniform1f(u.uAspect,this.width/this.height);gl.uniform1f(u.uPixel,this.pixel);gl.uniform1f(u.uScale,this.kind==='entry'?3.8:this.kind==='hero'?2.65:2.4);gl.uniform1f(u.uMotion,this.reduced?0:1);gl.uniform2f(u.uPointer,...this.pointer);gl.drawArrays(gl.POINTS,0,this.count);}
}
