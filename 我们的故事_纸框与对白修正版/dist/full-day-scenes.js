/* Original afternoon animation data plus fact-aware full-day adapter. */
const legacy=[
  {
    "id": "meeting",
    "title": "第七场 · 会议室",
    "time": "下午 13:00 — 15:00",
    "bg": "meeting",
    "actors": [
      {
        "id": "A",
        "char": "boy",
        "x": 38,
        "f": 8,
        "flip": false,
        "size": 44
      }
    ],
    "beats": [
      {
        "t": "nar",
        "s": "会议室里，A 坐在投影幕布旁边。面前是那份熬了整个晚上的报告。",
        "d": 3.8
      },
      {
        "t": "say",
        "who": "A",
        "s": "这一组数据是重新核对过的，和上个月的变化主要在第二季度。",
        "d": 3.8
      },
      {
        "t": "pose",
        "id": "A",
        "f": 10
      },
      {
        "t": "say",
        "who": "A",
        "s": "所以我们判断，下半年的投入可以集中在现有渠道。",
        "d": 3.2
      },
      {
        "t": "nar",
        "s": "他很清楚，如果今天的汇报出了问题，后面的项目都会受影响。他不敢分心。",
        "d": 4
      },
      {
        "t": "nar",
        "s": "但在翻页的时候，他突然想起了 B。她现在在哪里？是不是还在楼下？",
        "d": 4.2
      },
      {
        "t": "fx",
        "k": "clock",
        "v": "15:00"
      },
      {
        "t": "nar",
        "s": "会议比预想中长。数据要重新解释，方案要调整，最后还临时派了新的活。",
        "d": 4.2
      },
      {
        "t": "nar",
        "s": "直到下午三点，会议才终于结束。",
        "d": 2.6
      },
      {
        "t": "say",
        "who": "领导",
        "s": "这次准备得不错，后面几个数据再补一下。",
        "d": 3
      },
      {
        "t": "pose",
        "id": "A",
        "f": 2
      },
      {
        "t": "nar",
        "s": "他终于松了一口气。报告交了，会开完了。",
        "d": 2.8
      },
      {
        "t": "nar",
        "s": "他拿起手机，准备给 B 打电话——然后，他发现了十七条未读消息。",
        "d": 3.8
      }
    ]
  },
  {
    "id": "box",
    "title": "第八场 · 保温盒",
    "time": "下午 15:05",
    "bg": "lobby",
    "actors": [
      {
        "id": "A",
        "char": "boy",
        "x": 50,
        "f": 1,
        "flip": false,
        "size": 44,
        "props": [
          "phone",
          "faceglow"
        ]
      }
    ],
    "beats": [
      {
        "t": "fx",
        "k": "prop",
        "v": "box"
      },
      {
        "t": "nar",
        "s": "A 走到楼下，前台叫住了他。",
        "d": 2.6
      },
      {
        "t": "say",
        "who": "前台",
        "s": "先生，刚才有位女生留了一个东西，说是给你的。",
        "d": 3.4
      },
      {
        "t": "nar",
        "s": "是他认识的那个保温盒。B 以前也用它给他带过饭。",
        "d": 3.4
      },
      {
        "t": "nar",
        "s": "那时候两个人一起出门，B 嫌外卖不好吃，特意早起做了午饭。",
        "d": 3.6
      },
      {
        "t": "nar",
        "s": "他还笑她，说以后可以开一家小饭馆。",
        "d": 2.8
      },
      {
        "t": "say",
        "who": "B",
        "s": "那你就是我的第一个顾客。",
        "d": 2.6
      },
      {
        "t": "nar",
        "s": "他低头看着保温盒。还温着。",
        "d": 2.4
      },
      {
        "t": "fx",
        "k": "phone",
        "v": "show"
      },
      {
        "t": "phone",
        "side": "me",
        "s": "你不用下来了。我坐地铁回去了。"
      },
      {
        "t": "phone",
        "side": "me",
        "s": "我废了这么大力气跑来，在你那儿到底算什么？"
      },
      {
        "t": "phone",
        "side": "me",
        "s": "你的爱有没有被看见我不知道，我的爱，你看见了吗？"
      },
      {
        "t": "nar",
        "s": "他站在大厅里。报告交了，会开完了，领导拍了拍他的肩膀。",
        "d": 3.6
      },
      {
        "t": "nar",
        "s": "他终于完成了所有必须完成的事情，却看着那几条消息，不知道接下来该做什么。",
        "d": 4
      },
      {
        "t": "fx",
        "k": "phone",
        "v": "hide"
      },
      {
        "t": "nar",
        "s": "因为他突然意识到：自己一直在想如何解决问题、如何把事情安排妥当。",
        "d": 4
      },
      {
        "t": "nar",
        "s": "而 B 今天想要的，可能根本不是一个安排。",
        "d": 3
      },
      {
        "t": "nar",
        "s": "第一次觉得，自己好像把一件很重要的事情弄丢了。",
        "d": 3
      }
    ]
  },
  {
    "id": "back",
    "title": "第九场 · 回程地铁",
    "time": "下午 15:20",
    "bg": "subway2",
    "actors": [
      {
        "id": "B",
        "char": "girl",
        "x": 50,
        "f": 1,
        "flip": false,
        "size": 44,
        "props": [
          "phone",
          "faceglow"
        ]
      }
    ],
    "beats": [
      {
        "t": "nar",
        "s": "B 坐在地铁上，把手机调成了静音。",
        "d": 2.8
      },
      {
        "t": "nar",
        "s": "她看着窗户里自己的倒影，眼睛有些红。",
        "d": 3
      },
      {
        "t": "fx",
        "k": "tears",
        "v": "on"
      },
      {
        "t": "nar",
        "s": "她其实也不知道自己为什么会哭得这么厉害。",
        "d": 3
      },
      {
        "t": "nar",
        "s": "她知道 A 工作忙，知道他昨天熬了夜，知道他今天有很重要的会议。",
        "d": 3.8
      },
      {
        "t": "nar",
        "s": "她知道这些。但她还是很难过。",
        "d": 2.6
      },
      {
        "t": "nar",
        "s": "因为她突然觉得，自己好像一直在努力靠近一个人，却不知道那个人有没有在向自己走来。",
        "d": 5
      },
      {
        "t": "choice",
        "node": 3
      },
      {
        "t": "fx",
        "k": "phone",
        "v": "show"
      },
      {
        "t": "phone",
        "side": "me",
        "s": "你不用下来了。我坐地铁回去了。"
      },
      {
        "t": "phone",
        "side": "me",
        "s": "我废了这么大力气跑来，在你那儿到底算什么？"
      },
      {
        "t": "phone",
        "side": "me",
        "s": "你的爱有没有被看见我不知道，我的爱，你看见了吗？"
      },
      {
        "t": "fx",
        "k": "phone",
        "v": "hide"
      },
      {
        "t": "nar",
        "s": "她把手机放在膝盖上，眼泪又掉了下来。",
        "d": 3
      },
      {
        "t": "fx",
        "k": "tears",
        "v": "off"
      }
    ]
  },
  {
    "id": "chase",
    "title": "第十场 · 追赶",
    "time": "下午 15:30",
    "bg": "street",
    "actors": [
      {
        "id": "A",
        "char": "boy",
        "x": 20,
        "f": 4,
        "flip": false,
        "size": 42
      }
    ],
    "beats": [
      {
        "t": "nar",
        "s": "这一次，他没有先解释自己有多忙。",
        "d": 2.8
      },
      {
        "t": "fx",
        "k": "phone",
        "v": "show"
      },
      {
        "t": "phone",
        "side": "him",
        "s": "你别走，告诉我你到哪一站了，我来找你。"
      },
      {
        "t": "fx",
        "k": "phone",
        "v": "hide"
      },
      {
        "t": "move",
        "id": "A",
        "x": 62,
        "dur": 3.2
      },
      {
        "t": "nar",
        "s": "A 冲出公司大门的时候，太阳依然很大。他没有想好见到她要说些什么。",
        "d": 4
      },
      {
        "t": "nar",
        "s": "他只知道，他不想让她一个人带着这样的心情回去。",
        "d": 3.2
      },
      {
        "t": "move",
        "id": "A",
        "x": 78,
        "dur": 2
      },
      {
        "t": "nar",
        "s": "一路上他想起这几个月：等忙完这阵就好了，等报告交上去，等工作稳定下来，等以后有时间。",
        "d": 4.6
      },
      {
        "t": "nar",
        "s": "他一直觉得，只要把眼前的事情做好，就能给两个人更好的生活。",
        "d": 3.8
      },
      {
        "t": "nar",
        "s": "他没有意识到，在这些「等以后」的日子里，B 可能已经等了很久。",
        "d": 4
      },
      {
        "t": "nar",
        "s": "他终于明白，自己不能只在一切都安排妥当的时候，才开始经营一段关系。",
        "d": 4
      }
    ]
  },
  {
    "id": "platform",
    "title": "第十一场 · 站台",
    "time": "下午 15:45",
    "bg": "platform",
    "actors": [
      {
        "id": "B",
        "char": "girl",
        "x": 35,
        "f": 0,
        "flip": false,
        "size": 42
      },
      {
        "id": "A",
        "char": "boy",
        "x": 65,
        "f": 3,
        "flip": true,
        "size": 42
      }
    ],
    "beats": [
      {
        "t": "nar",
        "s": "站台上人来人往。B 站在出口旁边，看着手机。她不知道 A 会不会真的来。",
        "d": 4
      },
      {
        "t": "fx",
        "k": "prop",
        "v": "box"
      },
      {
        "t": "nar",
        "s": "几分钟后，她听见有人叫她的名字。",
        "d": 2.6
      },
      {
        "t": "nar",
        "s": "A 站在不远处，气喘吁吁，头发有些乱，手里还拿着那个保温盒。他没有立刻走过来。",
        "d": 4.6
      },
      {
        "t": "pose",
        "id": "A",
        "f": 8
      },
      {
        "t": "say",
        "who": "A",
        "s": "对不起。",
        "d": 2
      },
      {
        "t": "pose",
        "id": "B",
        "f": 1
      },
      {
        "t": "say",
        "who": "B",
        "s": "你知道我今天为什么来吗？",
        "d": 2.8
      },
      {
        "t": "nar",
        "s": "这一次，他没有急着解释自己有多忙。",
        "d": 2.8
      },
      {
        "t": "pose",
        "id": "A",
        "f": 11
      },
      {
        "t": "say",
        "who": "A",
        "s": "我以前以为，你来找我，是因为你想见我。",
        "d": 3.4
      },
      {
        "t": "say",
        "who": "A",
        "s": "但我今天才发现……你可能已经很久没有感受到，我也想见你了。",
        "d": 4.4
      },
      {
        "t": "pose",
        "id": "B",
        "f": 3
      },
      {
        "t": "say",
        "who": "B",
        "s": "我不是要你放下工作来陪我。",
        "d": 2.8
      },
      {
        "t": "say",
        "who": "A",
        "s": "我知道。",
        "d": 1.8
      },
      {
        "t": "say",
        "who": "B",
        "s": "我只是觉得，我们好像越来越不像情侣了。",
        "d": 3.2
      },
      {
        "t": "pose",
        "id": "A",
        "f": 3
      },
      {
        "t": "say",
        "who": "A",
        "s": "我发现了。我也知道你最近很难过。",
        "d": 3
      },
      {
        "t": "say",
        "who": "A",
        "s": "我一直觉得，只要把工作做好，就有时间好好陪你。我没想到，你已经等了这么久。",
        "d": 4.8
      },
      {
        "t": "nar",
        "s": "她们没有立刻和好，也没有保证以后不会再发生这样的事。",
        "d": 3.8
      },
      {
        "t": "nar",
        "s": "只是这一次，他终于在认真听她说话。而她也终于把自己的感受说了出来。",
        "d": 4
      },
      {
        "t": "nar",
        "s": "两个人一起走出了地铁站。这一次，他们没有急着赶去下一个地方。",
        "d": 4
      }
    ]
  },
  {
    "id": "ending",
    "title": "尾声 · 爱的译差",
    "time": "当天晚上",
    "bg": "epilogue",
    "actors": [
      {
        "id": "A",
        "char": "boy",
        "x": 26,
        "f": 3,
        "flip": false,
        "size": 32
      },
      {
        "id": "B",
        "char": "girl",
        "x": 74,
        "f": 0,
        "flip": false,
        "size": 32
      }
    ],
    "beats": [
      {
        "t": "nar",
        "s": "晚上。A 回到家，打开手机，在备忘录里写下：",
        "d": 3
      },
      {
        "t": "nar",
        "s": "「我总觉得，只要把工作做好，就能给她更好的生活。",
        "d": 3.4
      },
      {
        "t": "nar",
        "s": "但我好像忘了，生活不是等所有事情都完成之后才开始的。」",
        "d": 4
      },
      {
        "t": "nar",
        "s": "另一边，B 把空了的保温盒洗干净，放在厨房的架子上。",
        "d": 3.6
      },
      {
        "t": "nar",
        "s": "她想起早上做菜时那个期待的自己，没有觉得自己傻。",
        "d": 3.2
      },
      {
        "t": "nar",
        "s": "只是她终于意识到：自己不能永远通过付出，来确认自己在一段关系里的位置。",
        "d": 4.6
      },
      {
        "t": "nar",
        "s": "她需要说出自己真正要什么，而他需要学会在没有力气的时候，也把处境说出口。",
        "d": 4.6
      },
      {
        "t": "nar",
        "s": "他们都没有做错所有的事情，也都没有完全理解对方。",
        "d": 3.6
      },
      {
        "t": "nar",
        "s": "但这一次，他们终于开始意识到——",
        "d": 2.6
      },
      {
        "t": "nar",
        "s": "爱不是要求对方猜中自己的心意，也不是要求自己永远理解对方。",
        "d": 4.2
      },
      {
        "t": "nar",
        "s": "爱是愿意把自己的感受说出来，也愿意停下来，听听对方究竟在经历什么。",
        "d": 4.6
      },
      {
        "t": "fx",
        "k": "theme",
        "v": "《惊喜》· 完"
      }
    ]
  }
];

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
