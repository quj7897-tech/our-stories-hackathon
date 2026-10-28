const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {create}=require('../dist/engine.js');
const base=require('../dist/story.js');
const story=fs.existsSync(require('node:path').join(__dirname,'../dist/full-day.js'))?require('../dist/full-day.js')(base):base;
function run(seed=0){
  const engine=create(story);let v=engine.start(),count=0;const trace=[];
  while(v.phase!=='ending'&&count++<90){
    trace.push(v.nodeId);
    if(v.phase==='interlude'){v=engine.advance();continue;}
    for(const item of v.node.inspect)engine.inspect(item.id);
    v=engine.view();const options=v.choices.filter(o=>o.enabled);
    const selected=options[(seed+count)%options.length];
    v=engine.choose(selected.id);v=engine.advance();
  }
  return {engine,v,trace};
}
test('阶段结局之后继续到晚上，恢复会议、保温盒、回程、追赶、站台和尾声',()=>{
  const {v,trace}=run();
  assert.equal(v.state.time,'20:00','交接包不能再止于12:40');
  for(const id of ['DAY7','DAY8','DAY9','DAY10','DAY11','DAY12'])assert.ok(trace.includes(id)||v.nodeId===id,id+'缺失');
  assert.equal(v.phase,'ending');assert.ok(v.summary?.facts?.length);
});
test('下午体验入口通过真实上午选择建立示例，仍可回退',()=>{
  assert.equal(typeof story.openAfternoonExample,'function');
  const engine=create(story),v=story.openAfternoonExample(engine);
  assert.equal(v.nodeId,'DAY7');assert.ok(v.history.length>=14);
  assert.ok(v.history.some(e=>e.nodeId==='M2'));
  assert.equal(engine.rewind(0).nodeId,'P1');
});
test('早期21个选择全部保留，并接上下午；重新选择撤销后续事实',()=>{
  assert.equal(Object.values(story.nodes).filter(n=>n.chapter<=6&&n.choices?.length===3).length,21);
  for(let seed=0;seed<30;seed++){
    const {v,engine}=run(seed);
    assert.equal(v.state.time,'20:00');
    const last=v.history.findIndex(e=>e.nodeId==='DAY9');
    const back=engine.rewind(last);
    assert.equal(back.nodeId,'DAY9');
    assert.equal(back.state.meetConsent,undefined,'回退要清除后来的见面决定');
    assert.equal(back.history.length,last);
  }
});
test('未获邀请不会追赶；前台饭盒只有明确领取后才换持有人',()=>{
  for(let seed=0;seed<30;seed++){
    const {v}=run(seed),h=v.history;
    const pickup=h.find(e=>e.nodeId==='DAY8');
    if(pickup.before.boxOwner==='A')assert.equal(pickup.after.boxOwner,'A');
    if(pickup.before.boxOwner==='B')assert.equal(pickup.after.boxOwner,'B');
    if(pickup.before.boxOwner==='frontdesk'&&pickup.optionId!=='A')assert.equal(pickup.after.boxOwner,'frontdesk');
    const reply=h.find(e=>e.nodeId==='DAY9');
    if(reply.optionId!=='A')assert.equal(v.state.meetConsent,false);
    assert.equal(v.state.boundaryRespected,true);
  }
});
