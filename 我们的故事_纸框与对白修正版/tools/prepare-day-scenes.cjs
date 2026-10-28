// Run once with an original story.js path to preserve the actual afternoon beats.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
if(!process.argv[2])throw Error('Pass the original 13-scene story.js');
const ctx={};vm.runInNewContext(fs.readFileSync(process.argv[2],'utf8')+';globalThis.original=SCENES;',ctx);
const legacy=ctx.original.slice(7);
const adapter=`
(function(root){
  const api=root.LoveScenes, originalIntro=api.intro,originalOutcome=api.outcome;
  const clone=x=>JSON.parse(JSON.stringify(x));
  const N=s=>({t:'nar',s,d:Math.min(6,Math.max(2.4,1.2+s.length*.068))});
  const FX=(k,v)=>({t:'fx',k,v,d:.25});
  function beats(lines){return lines.map(line=>line.who==='A'||line.who==='B'?{t:'say',who:line.who,s:line.text,d:Math.max(2.4,1.2+line.text.length*.068)}:N(line.text));}
  api.intro=function(v){
    const index=Number(v.nodeId.slice(3));
    if(!/^DAY(?:7|8|9|10|11|12)$/.test(v.nodeId))return originalIntro(v);
    const scene=clone(legacy[index-7]);
    scene.title=v.node.title;scene.time=v.node.time;scene.state=clone(v.state);scene.bg=v.node.bg;
    scene.actors.forEach(a=>a.props=(a.props||[]).filter(p=>p!=='paperbag'));
    if(index===7){
      scene.beats=scene.beats.filter(b=>!b.s||!b.s.includes('十七条未读'));
      scene.beats.push(N('他重新打开聊天，看到的是这一轮已经发生的联络和约定。'));
    }else if(index===10&&v.state.meetConsent){
      scene.beats=scene.beats.map(b=>b.s&&b.s.includes('你别走')?{...b,s:'你愿意见面，我现在过来。到了会告诉你。'}:b);
      scene.beats.unshift(N('B 已明确发出站台见面的邀请，A 才出发。'));
    }else{
      scene.beats=beats(v.node.lines);
      if(index===8)scene.beats.unshift(FX('clock','15:05'));
      if(index===9){
        if(!v.state.acknowledgedCare)scene.beats.unshift(FX('tears','on'));
        scene.beats.push(FX('tears','off'));
      }
      if(index===10){scene.actors=[{id:'A',char:'boy',x:50,f:0,size:42}];}
      if(index===11&&!v.state.meetConsent){
        scene.actors=[{id:'B',char:'girl',x:24,f:3,size:36},{id:'A',char:'boy',x:78,f:0,flip:true,size:36}];
      }
      if(index===12)scene.beats.push(FX('theme','《惊喜》· 完'));
    }
    return scene;
  };
  api.outcome=function(v){
    const scene=originalOutcome(v);
    if(/^DAY/.test(v.nodeId)&&v.node.mode==='message')scene.beats=scene.beats.filter(b=>!(b.t==='say'&&b.who===v.node.player));
    if(v.nodeId==='DAY11'&&v.state.meetConsent)scene.beats.push(N('两个人一起走出了地铁站。这一次，他们没有急着赶去下一个地方。'));
    return scene;
  };
})(typeof window!=='undefined'?window:globalThis);
`;
fs.writeFileSync(path.join(__dirname,'../dist/full-day-scenes.js'),'/* Original afternoon animation data plus fact-aware full-day adapter. */\nconst legacy='+JSON.stringify(legacy,null,2)+';\n'+adapter);
