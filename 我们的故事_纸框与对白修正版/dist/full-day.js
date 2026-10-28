/* Full-day continuation. The supplied 21 morning decisions remain intact. */
(function(root,factory){
  if(typeof module!=='undefined'&&module.exports)module.exports=factory;
  else factory(LOVE_STORY);
})(typeof globalThis!=='undefined'?globalThis:this,function(story){
  'use strict';
  if(story.fullDay)return story;
  const n=text=>({who:'旁白',text}),a=text=>({who:'A',text}),b=text=>({who:'B',text});
  const box=s=>s.boxOwner==='A'?'饭盒已经在 A 手里':s.boxOwner==='frontdesk'?'饭盒还在已确认代收的前台':'饭盒仍由 B 带着';
  const op=(id,label,detail,effects,outcome,next)=>({id,label,detail,effects,outcome,next});
  const add=(id,chapter,title,time,bg,role,lines,prompt,choices)=>{
    story.nodes[id]={id,chapter,title,time,bg,role,player:role==='AB'?'B':role,lines,prompt,choices,inspect:[]};
  };
  // Original late-morning endings become honest checkpoints, not final endings.
  for(const node of Object.values(story.nodes))if(node.terminal){
    node.terminal=false;node.next='DAY7';node.checkpoint=true;
    node.enter={morningCheckpoint:node.id};node.chapter=6;
  }
  const stages={P1:0,P2:0,C1_TRAVEL:1,C1_CONTACT:4,C1_SILENCE:4,C2_WORK:3,C2_ROUTE:5,M1:5,M2:5,F1:5,F2:5,V1:5,V2:5};
  for(const node of Object.values(story.nodes)){
    if(stages[node.id]!==undefined)node.chapter=stages[node.id];
    else if(node.id.startsWith('C3_'))node.chapter=6;
  }
  add('DAY7',7,'第七场 · 会议室','13:00','meeting','A',[
    n('会议室里，A 坐在投影幕布旁边。面前是那份熬了整个晚上的报告。'),
    a('这一组数据已经重新核对过，下半年的投入可以集中在现有渠道。'),
    n('他不敢分心。翻页的时候，却想起了 B。之前说过的话和做出的安排，不会因为忙碌就消失。'),
    n('会议一直开到下午三点。他终于拿起手机，准备面对还没有说完的话。')
  ],'会议结束后，A 怎么重新开口？',[
    op('A','先承认让她等了，询问现在是否方便','说明会议结束，先确认她的位置和意愿。',{afternoonContact:'ask'},[a('会刚结束。让你等了这么久，对不起。你现在在哪里？还有力气聊一会儿吗？')],'DAY8'),
    op('B','说明现状，并兑现晚饭后联络的安排','她先前需要空间时，尊重已经说出的边界。',{afternoonContact:'plan'},s=>[a(s.spaceRequested?'会刚结束。我记得你说今天需要空间，我不会再催你回复。明天等你方便时再联系。':'会刚结束。先前说好的晚饭后联系，我会记得。你不用继续留在楼下等。')],'DAY8'),
    op('C','先发一句会议结束了','事实传到了，感受和具体安排还没有说清。',{afternoonContact:'brief'},[a('会议结束了。')],'DAY8')
  ]);
  add('DAY8',8,'第八场 · 保温盒','15:05','lobby','A',s=>[
    n(s.boxOwner==='A'?'A 低头看见已经交到自己手里的保温盒。它不需要再被领取一次。':s.boxOwner==='frontdesk'?'A 来到大厅。前台还妥善保管着已经确认代收的饭盒。':'A 走到大厅，想起饭盒一直由 B 带着。前台没有收到，不会凭空出现。'),
    n('他想起以前，两个人一起出门，B 嫌外卖不好吃，特意早起做了午饭。'),
    b('那你就是我的第一个顾客。'),
    n('报告交了，会开完了。怎样回应今天这份心意，仍要由他自己决定。')
  ],'面对这只饭盒和今天的期待，A 做什么？',[
    op('A',s=>s.boxOwner==='frontdesk'?'核对姓名领取，并确认收到':s.boxOwner==='A'?'告诉她饭盒和心意都收到了':'确认饭盒仍在她那里，别让她折返','根据真实交接状态行动，不重复交接。',s=>({boxOwner:s.boxOwner==='frontdesk'?'A':s.boxOwner,boxCollected:s.boxOwner==='frontdesk',aKnowsBox:true,acknowledgedCare:true}),s=>[a(s.boxOwner==='A'?'饭盒我已经拿到了。你今天花的时间和心意，我也想认真回应。':'饭盒还在你那里，不用为了送它再回来。你花了这么多心思，我知道了。')],'DAY9'),
    op('B','先回应她想被看见的感受','不把送饭当成一件需要处理的事务。',{acknowledgedCare:true},[a('我刚才一直想着怎么安排，却没有先问你今天想要什么。谢谢你愿意靠近我。')],'DAY9'),
    op('C','只说明眼前的工作安排','这次回应仍然简短，后面还需要把话说开。',{acknowledgedCare:false},[a('报告交了，接下来还要补几个数据。')],'DAY9')
  ]);
  add('DAY9',9,'第九场 · 归途与选择','15:20',s=>s.afternoonOnTrain?'subway2':'night','B',s=>[
    n(!s.afternoonOnTrain?'B 已经结束了现场等待。她在回到自己的生活之后，才重新打开手机。':'到了自己设定的等待期限，B 不再一直守在大厅。她走向地铁，重新看见手机上的消息。'),
    n('她知道 A 工作忙，也知道他昨天熬了夜。但理解他的处境，不代表她的感受就不需要被回应。'),
    n('这次，她可以自己决定：想见面，想晚点聊，还是今天先留一点空间。')
  ],'B 现在愿意怎样继续？',[
    op('A','愿意在站台见面，发出明确位置','这是一份新的邀请，不是默认她仍在原地。',{meetConsent:true,spaceRequested:false,followUpMode:'meet',bLocation:'约好的地铁站台'},[b('我愿意聊一会儿。我在地铁站出口旁边，你方便过来时告诉我。')],'DAY10'),
    op('B','约晚饭后通话，先各自回去','不用为了回应期待再多跑一趟。',{meetConsent:false,followUpMode:'evening'},[b('我今天先回去休息。晚饭后再通话，好吗？这次我想把感受说清楚。')],'DAY10'),
    op('C','今天需要空间，明天再联系','明确表达边界，今天不勉强见面。',{meetConsent:false,spaceRequested:true,followUpMode:'tomorrow'},[b('我现在需要缓一缓。今天先不见面，明天我方便时再联系你。')],'DAY10')
  ]);
  story.nodes.DAY9.enter=s=>({afternoonOnTrain:!s.departed,departed:true,bLocation:s.departed?'自己的住处':'回程地铁'});
  add('DAY10',10,s=>s.meetConsent?'第十场 · 追赶':'第十场 · 回应与分寸','15:30',s=>s.meetConsent?'street':'office','A',s=>s.meetConsent?[
    n('收到明确的邀请后，A 冲出公司大门。这一次，他没有先解释自己有多忙。'),
    n('他还没想好见到她要说些什么。他只知道，不想再把经营关系推到所有事情都完成之后。')
  ]:[n('A 看到 B 已经说清楚了自己的选择。他停下脚步，没有追到她没有邀请自己去的地方。'),n('主动靠近，也包括尊重对方此刻能承受的距离。')],
  'A 如何回应她刚刚说出的意愿？',[
    op('A','按她选择的方式回应','愿意见面才过去；需要空间就等约好的时间。',{boundaryRespected:true,responseStyle:'follow'},s=>[a(s.meetConsent?'好，我现在过去。到站后告诉你，不让你猜我在哪里。':s.spaceRequested?'好。今天不再打扰你，明天等你方便。':'好，晚饭后联系。路上注意安全，不用急着回复。')],'DAY11'),
    op('B','先承认感受，再确认约定','把看见她的期待说出来，也保留她的决定。',{boundaryRespected:true,responseStyle:'ack'},s=>[a('今天你想被看见，这一点我明白了。'+(s.meetConsent?'我来赴约。':'我会尊重你说好的时间。'))],'DAY11'),
    op('C','说出自己此刻的状态','不要求她立刻安慰自己，也不改动她的安排。',{boundaryRespected:true,responseStyle:'honest'},s=>[a('我也很累，但不想再用忙把这件事盖过去。'+(s.meetConsent?'等见面后，我们慢慢说。':'等你愿意聊的时候，我们慢慢说。'))],'DAY11')
  ]);
  add('DAY11',11,s=>s.meetConsent?'第十一场 · 站台':'第十一场 · 把话说开','15:45',s=>s.meetConsent?'platform':'split','AB',s=>s.meetConsent?[
    n('站台上人来人往。B 站在约好的出口旁边，看见 A 气喘吁吁地跑来。'),
    a('对不起。我以前以为，只要把工作做好，就能给两个人更好的生活。'),
    b('我不是要你放下工作来陪我。我只是想知道，你是不是也想见我。'),
    n('这一次，他没有急着解释，而是停下来认真听。')
  ]:s.spaceRequested?[n('15:45，两个人各自在自己的空间里。今天没有站台见面，也没有一通未经约定就打来的电话。'),n('B 可以先整理自己想说的话。草稿留在自己这里，等到明天愿意开口时再决定。')]:[
    n('两个人各自回去，把谈话留在约好的晚饭后。B 先想一想，自己最想说清楚的到底是什么。')
  ],s=>s.meetConsent?'见面时，B 想先表达什么？':'留给下一次谈话的话，B 想怎样准备？',[
    op('A','把自己的感受和请求说清楚','不靠猜测确认爱，也不要求对方猜中心意。',{conversation:'honest'},s=>[s.meetConsent?b('等不到回应时，我会觉得自己不重要。下次忙的时候，能不能先告诉我你大概什么时候方便？'):n('B 在自己的备忘录写下：等不到回应时，我会觉得自己不重要。下次想请他先说明什么时候方便。这些话还没有自动发出。')],'DAY12'),
    op('B','先听彼此实际经历了什么','把理解落到具体处境，再谈下一步。',{conversation:'listen'},s=>[s.meetConsent?b('你今天最难的是什么？我也想告诉你，我一路上在想什么。'):n('B 留下一份谈话提纲：先听听他的处境，也把自己的经历完整说出来。提纲仍是草稿。')],'DAY12'),
    op('C','先停下来，不要求今天立刻解决','把暂停说明白，留一个可以再次谈话的入口。',{conversation:'pause'},s=>[s.meetConsent?b('今天先到这里吧。我们都累了，明天再一起想想怎样做得更好。'):n('B 决定今天先休息。没有自动发送消息，也没有把沉默当成已经和好。')],'DAY12')
  ]);
  story.nodes.DAY12={id:'DAY12',chapter:12,role:'AB',player:'B',title:'尾声 · 爱的译差',time:'20:00',bg:'epilogue',terminal:true,
    lines:s=>[n('晚上，两个人各自回到生活里。'+box(s)+'。'),
      n(s.followUpMode==='tomorrow'?'今天需要的空间得到了尊重。下一次谈话还没有发生，明天是否开口仍由他们自己决定。':s.followUpMode==='evening'?(s.conversation==='pause'?'晚饭后，他们按约接通电话，也说明了今天还需要休息，约好明天再慢慢聊。':'晚饭后，他们按约定接通电话。A 先问她现在有没有力气聊，B 也把自己的感受说了出来。'):'他们没有立刻和好，也没有保证以后不会再有误解。但今天，至少有一次真正停下来，听了听彼此。'),
      n('爱不是要求对方猜中心意，也不是要求自己永远理解对方。'),
      n('爱是愿意把感受说出来，也愿意停下来，听听对方究竟在经历什么。')]};
  for(const id of ['DAY7','DAY8','DAY9','DAY10']){
    const node=story.nodes[id];node.mode='message';
    for(const choice of node.choices){
      choice.draft=s=>{
        const changes=typeof choice.effects==='function'?choice.effects(s):choice.effects;
        const after=Object.assign({},s,changes);
        const lines=typeof choice.outcome==='function'?choice.outcome(after):choice.outcome;
        return lines.filter(line=>line.who===node.player).map(line=>line.text).join('\n');
      };
      choice.commitLabel='确认发送';choice.previewLabel='这条回应将这样说';
    }
  }
  story.summary=(s,h)=>({
    title:s.conversation==='pause'?'愿意停下，也留下下一次':s.meetConsent?'在站台，开始真正听见彼此':s.followUpMode==='evening'?'按约定，重新接通':'让空间得到尊重',
    text:s.meetConsent?'这次见面来自 B 的明确邀请。今天的误解没有被一笔抹去，彼此终于开始回应真实的感受。':s.followUpMode==='evening'?'两个人没有追到站台，晚饭后的通话按约发生。表达自己的需要，也给对方一个能够回应的时机。':'今天没有勉强见面，明天的谈话也还没有提前发生。尊重已经说出的边界，是这轮选择留下的实际行动。',
    facts:[{label:'故事进度',value:'完整一天 · 20:00'},{label:'饭盒去处',value:box(s)},
      {label:'当面交接',value:s.met?'之前已经见面':'没有虚构一次当面交接'},
      {label:'站台见面',value:s.meetConsent?'收到邀请后赴约':'没有未经同意追赶'},
      {label:'后续联络',value:s.followUpMode==='tomorrow'?'明天由 B 方便时联系':s.followUpMode==='evening'?'晚饭后的通话已发生':'站台的谈话已经发生'},
      {label:'经过的决定',value:String(h.length)+' 次，回退会撤销后续事实'}],
    reflection:'送达一顿饭、回应一次期待、尊重一个边界，分别需要实际的行动。',
    unseen:[{title:'重选可以改变什么',detail:'早期联络方式、三分钟交接、会议提前后的回应、等待期限，以及下午是否见面，都会保留在这一轮经历里。'}]
  });
  story.fullDay=true;story.version='full-day-repaired-2026-10-25';
  story.openAfternoonExample=function(engine){
    let v=engine.restart(),guard=0;
    while(v.nodeId!=='DAY7'&&guard++<40){
      if(v.phase==='interlude'){v=engine.advance();continue;}
      v.node.inspect.forEach(item=>engine.inspect(item.id));
      v=engine.view();
      const choice=v.choices.find(item=>item.enabled);
      if(!choice)throw Error('示例路线没有可选行动');
      engine.choose(choice.id);v=engine.advance();
    }
    if(v.nodeId!=='DAY7')throw Error('示例路线未进入下午');
    return v;
  };
  return story;
});
