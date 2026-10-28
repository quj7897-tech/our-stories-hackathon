const assert=require('node:assert/strict');
const {create}=require('../dist/engine.js');
const story=require('../dist/full-day.js')(require('../dist/story.js'));
const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const ctx={window:{},LOVE_STORY:story};
for(const file of ['cinematic-scenes.js','full-day-scenes.js'])vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../dist',file),'utf8'),ctx);
const seen=new Set(),edges=new Set(),boxOwners=new Set(),endingModes=new Set();
let seed=1237,rewinds=0;
const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
for(let round=0;round<240;round++){
  const engine=create(story);let v=engine.start(),previous=0,guard=0;
  while(guard++<60){
    seen.add(v.nodeId);boxOwners.add(v.state.boxOwner);
    const now=Number(v.state.time.slice(0,2))*60+Number(v.state.time.slice(3));
    assert.ok(now>=previous,'Facts must not travel backward in time');previous=now;
    const before=JSON.stringify(v),scene=ctx.window.LoveScenes.intro(v);
    assert.equal(JSON.stringify(v),before,'Animation adapter must not change branch facts');
    assert.ok(scene.beats.length&&scene.actors.length);
    assert.ok(!scene.beats.some(b=>b.t==='choice'),'Choice UI must have exactly one authority');
    if(v.nodeId==='DAY10'&&!v.state.meetConsent)assert.ok(!scene.beats.some(b=>b.t==='move'),'No uninvited chase');
    if(v.nodeId==='DAY8'&&v.state.boxOwner==='A')assert.ok(!scene.beats.some(b=>/前台叫住|留了一个东西/.test(b.s||'')),'No duplicate front-desk pickup');
    if(v.phase==='ending'){
      assert.equal(v.state.time,'20:00');assert.equal(v.nodeId,'DAY12');
      endingModes.add(v.state.followUpMode);
      const index=v.history.findIndex(e=>e.nodeId==='DAY9');
      const back=engine.rewind(index);assert.equal(back.state.meetConsent,undefined);rewinds++;
      break;
    }
    if(v.phase==='interlude'){v=engine.advance();continue;}
    for(const item of v.node.inspect)engine.inspect(item.id);
    v=engine.view();
    const available=v.choices.filter(o=>o.enabled),unseen=available.filter(o=>!edges.has(v.nodeId+'/'+o.id));
    const pool=unseen.length?unseen:available,choice=pool[Math.floor(random()*pool.length)];
    const id=v.nodeId;edges.add(id+'/'+choice.id);v=engine.choose(choice.id);
    const rendered=ctx.window.LoveScenes.outcome(v);assert.ok(rendered.beats.length);
    v=engine.advance();
  }
  assert.ok(guard<60,'Unexpected branch loop');
}
const expected=Object.values(story.nodes).flatMap(n=>(n.choices||[]).map(o=>n.id+'/'+o.id));
assert.equal(seen.size,Object.keys(story.nodes).length);
assert.equal(edges.size,expected.length);assert.equal(boxOwners.size,3);assert.equal(endingModes.size,3);
console.log(JSON.stringify({runs:240,nodes:seen.size,options:edges.size,boxOwners:[...boxOwners],afternoonRoutes:[...endingModes],rewinds},null,2));
console.log('PASS: full-day branch coverage, chronology, fact-aware animation, box continuity, consent and rewind');
