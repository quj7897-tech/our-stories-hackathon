/* 互动控制只决定剧情走向，画面由原版 beat 动画播放器负责。 */
(function(){
  'use strict';
  const $=id=>document.getElementById(id), engine=LoveEngine.create(LOVE_STORY), cinema=LoveCinema;
  let view=engine.start(), mode='cover', selected=null, inspection='', started=false;
  function hint(text){const el=$('gameHint');if(el)el.textContent=text;}
  const boxes={B:'饭盒由 B 随身保管',A:'饭盒已交给 A',frontdesk:'前台已确认代收饭盒'};
  function paragraph(text){const p=document.createElement('p');p.textContent=text;return p;}
  function textOf(line){return typeof line==='string'?line:(line.who&&line.who!=='旁白'?line.who+'：':'')+line.text;}
  function hud(){
    $('routeCount').textContent=view.history.length+' 次决定 · '+(view.node.chapter===0?'序言':view.node.chapter===12?'尾声':'第 '+view.node.chapter+' 场');
    $('boxStatus').textContent=boxes[view.state.boxOwner];
    $('pct').textContent='已选 '+view.history.length+' 次';
    $('btnPrev').disabled=!view.history.length;
    $('chapters').replaceChildren(...view.history.map((entry,index)=>{
      const b=document.createElement('button');b.className='cp done';b.textContent=(index+1)+' · '+entry.label;
      b.title='回到这次决定重选，之后的经历会撤回';b.onclick=()=>rewind(index);return b;
    }));
  }
  function guard(fn){try{fn();}catch(e){$('chfb').replaceChildren(paragraph(e.message));$('chfb').classList.add('show');console.error(e);}}
  function showChoice(){
    mode='choice';view=engine.view();hud();
    hint('故事暂停，轮到你做决定。请在画面里选择一个行动，再继续这段故事。');
    $('choiceStatus').textContent='故事暂停 · 此刻你是 '+view.node.player+' · 第 '+(view.history.length+1)+' 次决定';
    $('chq').textContent=view.node.prompt;
    $('chfb').classList.remove('show');$('chfb').replaceChildren();$('outcomeContinue').hidden=true;
    $('chInspectText').hidden=!inspection;$('chInspectText').textContent=inspection;
    $('chInspect').hidden=false;
    $('chInspect').replaceChildren(...view.node.inspect.map(item=>{
      const b=document.createElement('button');b.textContent=(item.seen?'✓ ':'＋ ')+item.label;b.className=item.seen?'seen':'';
      b.onclick=()=>guard(()=>{const detail=engine.inspect(item.id);inspection=detail.text;showChoice();});return b;
    }));
    $('chopts').hidden=false;
    $('chopts').replaceChildren(...view.choices.map(op=>{
      const b=document.createElement('button');b.className='chop'+(selected===op.id?' selected':'');b.dataset.option=op.id;b.disabled=!op.enabled;
      const key=document.createElement('b'),detail=document.createElement('span');key.textContent=op.id+'. ';
      detail.textContent=op.enabled?op.detail:op.lockedReason;b.append(key,document.createTextNode(op.label),detail);
      if(view.node.mode==='message')b.setAttribute('aria-pressed',String(selected===op.id));
      b.onclick=()=>{if(view.node.mode==='message'){selected=op.id;showChoice();$('commitChoice').focus({preventScroll:true});}else choose(op.id);};return b;
    }));
    const draft=view.choices.find(op=>op.id===selected);
    $('draftPanel').hidden=!draft||view.node.mode!=='message';
    if(draft){$('draftText').textContent=draft.draft||draft.label;$('draftLabel').textContent=draft.previewLabel;$('commitChoice').textContent=draft.commitLabel;}
    $('choices').classList.add('show');
  }
  function intro(){
    view=engine.view();inspection='';selected=null;hud();$('review').classList.remove('show');
    hint('正在播放：'+view.node.title+'。点击字幕可先补全文字，再继续下一句。');
    mode=view.phase==='ending'?'endingAnimation':'intro';
    cinema.load(LoveScenes.intro(view),()=>{
      if(view.phase==='interlude'){view=engine.advance();intro();return;}
      if(view.phase==='ending'){mode='ending';showReview();}
      else {showChoice();$('chq').focus({preventScroll:true});}
    });
  }
  function choose(id){guard(()=>{
    if(mode!=='choice')return;
    view=engine.choose(id);selected=null;inspection='';mode='outcome';hud();cinema.clickSound();
    hint('正在演出这次选择的后果。演出结束后，点击“继续故事”。');
    cinema.load(LoveScenes.outcome(view),()=>{
      mode='outcomeReady';$('choiceStatus').textContent='这次选择之后';$('chq').textContent=view.chosenLabel;
      hint('已看到这次选择的后果。点击画面里的“继续故事”，进入下一段。');
      $('chInspect').hidden=true;$('chInspectText').hidden=true;$('chopts').hidden=true;$('draftPanel').hidden=true;
      $('chfb').replaceChildren(...view.outcome.map(line=>paragraph(textOf(line))));$('chfb').classList.add('show');
      $('outcomeContinue').hidden=false;$('choices').classList.add('show');$('outcomeContinue').focus({preventScroll:true});
    });
  });}
  function continueStory(){
    if(!started)return;
    if(mode==='outcomeReady'){guard(()=>{view=engine.advance();intro();});return;}
    if(mode==='choice'){$('chq').focus({preventScroll:true});return;}
    if(mode==='ending'){showReview();return;}
    cinema.skipLine();
  }
  function rewind(index){guard(()=>{view=engine.rewind(index);$('review').classList.remove('show');intro();});}
  function start(withPrologue=true){
    view=engine.restart();started=true;selected=null;inspection='';$('exportBtn').textContent='保存这轮经历';
    $('review').classList.remove('show');$('startcard').classList.add('hide');hud();
    if(withPrologue){mode='prologue';cinema.load(LoveScenes.prologue(),intro);}else intro();
  }
  function showReview(){
    const summary=view.summary;if(!summary)return;
    hint('完整一天已到20:00。你可以回顾这一轮的选择，或返回首页继续探索。');
    $('choices').classList.remove('show');$('endingTitle').textContent=summary.title;
    $('rvSum').replaceChildren(paragraph(summary.text));
    $('endingFacts').replaceChildren(...summary.facts.map(item=>paragraph(item.label+' · '+item.value)));
    $('rvList').replaceChildren(...view.history.map((entry,i)=>{
      const d=document.createElement('div');d.className='rv-item';d.textContent=(i+1)+'. '+entry.label+' — '+entry.outcome.map(textOf).join(' ');return d;
    }));
    $('endingReflection').textContent=summary.reflection;
    $('endingUnseen').replaceChildren(...summary.unseen.map(item=>paragraph(item.title+' · '+item.detail)));
    $('review').classList.add('show');$('endingTitle').focus({preventScroll:true});
  }
  $('btnStart').onclick=()=>start(true);
  $('btnAfternoon').onclick=()=>guard(()=>{
    view=LOVE_STORY.openAfternoonExample(engine);started=true;selected=null;inspection='';
    $('startcard').classList.add('hide');$('review').classList.remove('show');intro();
  });
  $('btnPlay').onclick=()=>{if(started)cinema.toggle();};
  $('btnPrev').onclick=()=>{if(view.history.length)rewind(view.history.length-1);};
  $('btnNext').onclick=continueStory;
  $('capNext').onclick=e=>{e.stopPropagation();continueStory();};
  $('caption').onclick=continueStory;
  $('stage').addEventListener('click',event=>{
    if(event.target.closest('button,.choices,.phone,.startcard,.caption'))return;
    if(!['choice','outcomeReady','ending'].includes(mode))continueStory();
  });
  $('commitChoice').onclick=()=>{if(selected)choose(selected);};
  $('outcomeContinue').onclick=continueStory;
  $('btnAuto').onclick=()=>{const auto=!cinema.snapshot().auto;cinema.setAuto(auto);$('btnAuto').textContent='自动播放：'+(auto?'开':'关');};
  $('btnSpeed').onclick=()=>{const current=cinema.snapshot().speed,next=current>=1.5?.75:current>=1?1.5:1;cinema.setSpeed(next);$('btnSpeed').textContent='速度 '+next+'×';};
  $('btnSound').onclick=()=>{const sound=!cinema.snapshot().sound;cinema.setSound(sound);$('btnSound').textContent='声音：'+(sound?'开':'关');};
  $('rvClose').onclick=()=>$('review').classList.remove('show');
  $('btnReplay').textContent='重看结局演出';
  $('btnReplay').onclick=intro;
  $('btnRestart').onclick=()=>start(true);
  $('exportBtn').onclick=()=>{
    const payload={version:LOVE_STORY.version,presentation:'original-animation',state:view.state,journey:view.history,summary:view.summary};
    const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));
    const a=document.createElement('a');a.href=url;a.download='惊喜_我的经历.json';document.body.append(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),30000);$('exportBtn').textContent='已保存这轮经历';
  };
  document.addEventListener('keydown',event=>{
    if(!started||event.target.closest('button,input,textarea,select'))return;
    if(event.code==='Space'){event.preventDefault();cinema.toggle();}
    else if(event.code==='ArrowRight'){event.preventDefault();continueStory();}
    else if(event.code==='ArrowLeft'&&view.history.length){event.preventDefault();rewind(view.history.length-1);}
  });
  cinema.load(LoveScenes.prologue(),()=>{});cinema.pause();hud();
  window.__loveGame={view:()=>engine.view(),mode:()=>mode,storyVersion:LOVE_STORY.version};
})();
