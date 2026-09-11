import test from 'node:test';
import assert from 'node:assert/strict';
import {introState,projectPoint,drawModel} from './model-intro.js';
test('Model entrance assembles before travel and resolves into a chart',()=>{
  assert.equal(introState(-1).progress,0);assert.equal(introState(2).progress,1);
  assert.equal(introState(.28).assemble,1);assert.equal(introState(.28).fly,0);
  assert.equal(introState(.5).stage,1);assert.equal(introState(.92).chart,1);
  assert.equal(introState(1).opacity,0);
  let previous=0;for(let i=0;i<=100;i++){const s=introState(i/100);assert.ok(s.fly>=previous);previous=s.fly;}
});
test('Perspective clips points behind the camera and grows nearer layers',()=>{
  assert.equal(projectPoint(1,1,0,1200,800),null);
  assert.ok(projectPoint(1,1,2,1200,800).k>projectPoint(1,1,8,1200,800).k);
});
test('All scroll frames render finite coordinates on mobile and desktop',()=>{
  let strokes=0;const finite=(...args)=>args.forEach(n=>assert.ok(Number.isFinite(n)));
  const ctx={clearRect:finite,beginPath(){},moveTo:finite,lineTo:finite,stroke(){strokes++;},arc:finite,fill(){},fillText(text,x,y){finite(x,y);}};
  for(const [w,h] of [[390,844],[1440,900]])for(let i=0;i<=100;i++)drawModel(ctx,w,h,introState(i/100),2);
  assert.ok(strokes>1000);
});
