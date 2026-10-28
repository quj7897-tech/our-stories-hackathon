const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');

// A DOM boundary double: the actual story and player run unchanged in a VM.
class Element {
  constructor() {
    this.children = []; this.className = ''; this.dataset = {}; this.style = {
      setProperty(k,v) { this[k]=v; }, getPropertyValue(k) { return this[k] || ''; }
    };
    this.classList = {
      contains: c => this.className.split(/\s+/).includes(c),
      add: (...cs) => { this.className = [...new Set([...this.className.split(/\s+/), ...cs])].join(' ').trim(); },
      remove: (...cs) => { this.className = this.className.split(/\s+/).filter(c=>!cs.includes(c)).join(' '); },
      toggle: (c,on) => { on ??= !this.classList.contains(c); this.classList[on?'add':'remove'](c); return on; }
    };
  }
  set innerHTML(s) { this.html=s; this.children=[]; }
  get innerHTML() { return this.html || ''; }
  appendChild(e) { this.children.push(e); e.parentNode=this; return e; }
  addEventListener() {}
  setAttribute(k,v) { this[k]=v; }
  remove() { if(this.parentNode) this.parentNode.children=this.parentNode.children.filter(e=>e!==this); }
  querySelectorAll(selector) {
    const cs=selector.split('.').filter(Boolean), result=[];
    for(const child of this.children) {
      if(cs.every(c=>child.classList.contains(c))) result.push(child);
      result.push(...child.querySelectorAll(selector));
    }
    return result;
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || new Element(); }
}

function player(scene) {
  const ids=new Map(), get=id=>{if(!ids.has(id))ids.set(id,new Element());return ids.get(id);};
  const tasks=[];
  const ctx={document:{getElementById:get,createElement:()=>new Element(),querySelector:()=>null,body:new Element()},
    Image:class {},requestAnimationFrame(){},addEventListener(){},setTimeout(fn){tasks.push(fn);return 1;},clearTimeout(){},console,Math};
  ctx.window=ctx;vm.createContext(ctx);
  for(const f of ['motion.js','scene-art.js','cinema.js'])vm.runInContext(fs.readFileSync(path.join(root,'dist',f),'utf8'),ctx,{filename:f});
  ctx.LoveCinema.load(scene,()=>{});
  return {ctx,state:ctx.__jingxi,get,step(dt){ctx.LoveCinema.advance(dt);while(tasks.length)tasks.shift()();}};
}
function actor(id,x,flip=false){return {id,char:id==='A'?'boy':'girl',x,flip,f:0,size:42};}
test('原图朝右，向左和向右移动都正确翻转，跳过也落到终点',()=>{
  const scene={id:'test',bg:'campus',title:'test',time:'10:00',actors:[actor('B',62),actor('A',30,true)],beats:[{t:'move',id:'B',x:50,dur:1.8},{t:'move',id:'A',x:70,dur:2}]};
  const g=player(scene);assert.equal(g.state.actors.B.flip,true);
  assert.equal(g.state.actors.B.x,62);g.step(.9);assert.equal(g.state.actors.B.x,56);
  g.ctx.LoveCinema.pause();g.step(3);assert.equal(g.state.actors.B.x,56);
  g.ctx.LoveCinema.play();g.ctx.LoveCinema.setSpeed(1.5);g.step(.6);assert.equal(g.state.actors.B.x,50);
  for(let i=0;i<3&&(!g.state.entered||g.state.qi===0);i++)g.step(.01);
  assert.equal(g.state.actors.A.flip,false);
  g.ctx.LoveCinema.skipLine();assert.equal(g.state.actors.A.x,70);
});
test('完整挥手跨短节拍播放，最后收手；暂停冻结姿态',()=>{
  const g=player({id:'wave',bg:'campus',title:'挥手',time:'10:00',actors:[actor('B',50)],beats:[{t:'pose',id:'B',f:14},{t:'wait',d:3}]});
  g.step(.6);assert.equal(g.state.actors.B.gesture.kind,'wave');
  const frame=g.state.actors.B.frame,pose=g.state.actors.B.bob.style.transform;
  g.ctx.LoveCinema.pause();g.step(1);assert.equal(g.state.actors.B.frame,frame);assert.equal(g.state.actors.B.bob.style.transform,pose);
  g.ctx.LoveCinema.play();g.step(1.4);assert.ok(g.state.actors.B.frame<4);
});
test('倾听和思考独立，严肃台词不强制开心表情',()=>{
  const g=player({id:'talk',bg:'platform',title:'对话',time:'15:45',actors:[actor('A',65,true),actor('B',35)],beats:[{t:'say',who:'A',s:'对不起。',d:2},{t:'think',who:'B',s:'我需要一点时间',d:3}]});
  assert.equal(g.state.actors.B.action,'listen');
  for(let i=0;i<8;i++){g.step(.1);assert.notEqual(g.state.actors.A.frame,10);}
  g.step(1.3);g.step(.01);assert.equal(g.state.actors.B.action,'think');
});
test('背景样式化仍保留动态窗景、吊环和回想特效入口',()=>{
  const g=player({id:'train',bg:'subway',title:'地铁',time:'10:00',actors:[actor('B',50)],beats:[{t:'fx',k:'dish',v:'on'},{t:'wait',d:2}]});
  assert.match(g.get('bg').innerHTML,/art-world art-subway/);
  assert.match(g.get('bg').innerHTML,/class="drift"/);
  assert.match(g.get('bg').innerHTML,/class="strap"/);
  assert.ok(g.get('dishbub').classList.contains('show'));
});
