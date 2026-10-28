/* Actor motion uses the story clock, including pause, speed and frame export.
   All 32 supplied frames face right (the original atlas comment for 3 is wrong). */
(function () {
  'use strict';
  function frameAt(frames, elapsed, duration) {
    return frames[Math.min(frames.length-1, Math.floor(Math.max(0,elapsed)/duration*frames.length))];
  }
  function startMove(a, x, now, duration, hurry) {
    if (x === a.x) return;
    a.flip = x < a.x;
    a.el.classList.toggle('flip',a.flip);
    a.move = {from:a.x,to:x,start:now,duration:duration||2,hurry:!!hurry};
    a.gesture = null;
    a.el.classList.remove('idle'); a.el.classList.add('walking');
  }
  function finishMove(a) {
    if (!a.move) return;
    a.x = a.move.to; a.el.style.setProperty('--x',a.x+'%'); a.move=null;
    if (a.base >= 4 && a.base <= 7) a.base=0;
    a.el.classList.remove('walking'); a.el.classList.add('idle');
  }
  function gesture(a,kind,now,duration) {
    a.gesture={kind,start:now,duration:duration||1.25};
  }
  function sample(a,now) {
    if(a.move && now-a.move.start >= a.move.duration-1e-8) finishMove(a);
    if(a.gesture && now-a.gesture.start >= a.gesture.duration) a.gesture=null;
    var g=a.gesture, elapsed=g?now-g.start:now-(a.actionFrom||0);
    var kind=a.move?(a.move.hurry?'hurry':'walk'):g?g.kind:a.talking?'speak':a.listening?'listen':a.thinking?'think':'idle';
    var f=a.base, x=0, y=0, sx=1, sy=1;
    if(a.move) {
      var m=a.move, t=Math.max(0,Math.min(1,(now-m.start)/m.duration));
      a.x=m.from+(m.to-m.from)*t; a.el.style.setProperty('--x',a.x+'%');
      var cadence=m.hurry?.095:.15;
      var walkTime=now-m.start;
      f=[4,5,6,7][Math.floor(walkTime/cadence)%4];
      y=-Math.abs(Math.sin(walkTime/cadence*Math.PI))*(m.hurry?2.2:1);
      sy=1-Math.abs(Math.sin(walkTime/cadence*Math.PI))*.008;
    } else if(kind==='wave') {
      f=frameAt([12,13,14,15,14,13,14,13,12],elapsed,g.duration);
      y=-Math.sin(Math.min(1,elapsed/g.duration)*Math.PI)*.65;
    } else if(kind==='surprise') {
      f=1; y=-Math.sin(Math.min(1,elapsed/g.duration)*Math.PI)*1.5;
      sy=1+.015*Math.sin(elapsed/g.duration*Math.PI);
    } else if(kind==='happy') {
      f=elapsed<.45?11:2; y=-Math.max(0,Math.sin(elapsed*7))*1.3;
    } else if(kind==='shake') {
      f=3; x=Math.sin(elapsed*15)*1.4*Math.sin(elapsed/g.duration*Math.PI);
    } else if(kind==='tired') {
      f=3; sy=1-Math.abs(Math.sin(elapsed*5))*.025;
    } else if(kind==='nod'||kind==='listen') {
      f=(now+a.blinkOff)%3.8>3.55?2:0;
      var nod=kind==='nod'?Math.abs(Math.sin(elapsed*5)):Math.pow(Math.max(0,Math.sin(elapsed*2)),6);
      sy=1-nod*.025; y=nod*.35;
    } else if(kind==='think'||kind==='read') {
      f=(now+a.blinkOff)%4.2>3.85?2:3; sy=.988; y=.35+Math.sin(elapsed*1.6)*.3;
    } else if(kind==='speak') {
      // Serious conversations keep a neutral expression; happy lines opt in.
      f=(a.cheerful?[8,10,11,10]:[8,9,8,0])[Math.floor(elapsed/.22)%4];
      y=-Math.sin(elapsed*4)*.35;
    } else {
      if(f>=4) f=0;
      if((now+a.blinkOff)%3.8>3.53) f=2;
      sy=1+Math.sin((now+a.blinkOff)*2)*.004;
      y=-Math.sin((now+a.blinkOff)*2)*.25;
    }
    a.action=kind;
    a.bob.style.transform='translate('+x+'%, '+y+'%) scale('+sx+', '+sy+')';
    a.el.setAttribute('data-action',kind);
    return f;
  }
  window.LoveMotion={startMove,finishMove,gesture,sample};
})();
