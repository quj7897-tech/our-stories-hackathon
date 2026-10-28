/* 《惊喜》互动动画 —— 播放器 */
(function () {
  "use strict";

  var SCENES = [], complete = null, revision = 0;
  var $ = function (id) { return document.getElementById(id); };
  var stage = $("stage"), bgEl = $("bg"), actorsEl = $("actors");
  var capWho = $("capWho"), capText = $("capText"), capBox = $("caption");
  var phBody = $("phbody"), phoneEl = $("phone");
  var choicesEl = $("choices"), startcard = $("startcard");
  var reviewEl = $("review");

  /* ---------------- 背景模板 ---------------- */
  var BG = {
    cover: { floor: "11%", html: '<div class="wall"></div><div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div><div class="ring1"></div><div class="ring2"></div><div class="floor"></div>' },
    campus: {
      floor: "13%",
      html: '<div class="sky"></div>' +
        '<div class="ccloud" style="left:8%;top:8%"></div><div class="ccloud c2" style="left:56%;top:15%"></div>' +
        '<div class="roof"></div><div class="chim" style="left:30%"></div><div class="chim" style="left:48%"></div><div class="chim" style="left:66%"></div>' +
        '<div class="school"><div class="swins"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="sdoor"></div></div>' +
        '<div class="tree" style="left:10%"></div><div class="tree" style="right:8%;height:26%"></div>' +
        '<div class="flowers"><i style="left:4%"></i><i style="left:12%"></i><i style="left:22%"></i><i style="left:70%"></i><i style="left:80%"></i><i style="left:90%"></i><i style="left:34%"></i><i style="left:60%"></i></div>' +
        '<div class="floor"></div><div class="track"></div>',
    },
    city: {
      floor: "13%",
      html: '<div class="sky"></div><div class="sun2"></div><div class="back"></div>' +
        '<div class="bld" style="left:4%;width:14%;height:34%;background:#e8cfc0"></div>' +
        '<div class="bld" style="left:20%;width:11%;height:44%;background:#cfd8c9"></div>' +
        '<div class="bld" style="left:33%;width:15%;height:28%;background:#e6d9b8"></div>' +
        '<div class="bld" style="left:52%;width:12%;height:40%;background:#c3d4de"></div>' +
        '<div class="bld" style="left:68%;width:14%;height:31%;background:#e0cbc0"></div>' +
        '<div class="bld" style="left:84%;width:11%;height:37%;background:#d5d0c2"></div>' +
        '<div class="road"></div><div class="zebra"></div><div class="cl"></div><div class="bus"></div>',
    },
    subway: {
      floor: "15%",
      html: '<div class="wash"></div><div class="blob b1"></div><div class="blob b2"></div>' +
        '<div class="win"><div class="skywash"></div><div class="drift"><i></i><i></i><i></i><i class="hill"></i></div></div>' +
        '<div class="mapsign"><i></i><i></i><i></i><i></i><i></i></div>' +
        '<div class="rail"></div>' +
        '<div class="strap" style="left:16%"><span class="stem"></span><span class="ring"></span></div>' +
        '<div class="strap" style="left:38%;animation-delay:.6s"><span class="stem"></span><span class="ring"></span></div>' +
        '<div class="strap" style="left:62%;animation-delay:1.1s"><span class="stem"></span><span class="ring"></span></div>' +
        '<div class="strap" style="left:86%;animation-delay:1.7s"><span class="stem"></span><span class="ring"></span></div>' +
        '<div class="door"><div class="dwin"><i></i></div><div class="dseam"></div><div class="dline"></div></div>' +
        '<div class="seat seatl"></div><div class="seat seatr"></div>' +
        '<div class="pg p1"></div><div class="pg p2"></div>' +
        '<div class="crowd cd1"></div><div class="crowd cd2"></div><div class="crowd cd3"></div>' +
        '<div class="crowd cd4"></div><div class="crowd cd5"></div><div class="crowd cd6"></div>' +
        '<div class="floor"><span class="seam"></span></div>' +
        '<div class="charwash" style="left:52%"></div>',
    },
    subway2: {
      floor: "15%",
      html: '<div class="wash"></div><div class="blob b1"></div><div class="blob b2"></div>' +
        '<div class="win"><div class="skywash"></div><div class="drift"><i></i><i></i><i></i><i class="hill"></i></div></div>' +
        '<div class="mapsign"><i></i><i></i><i></i><i></i><i></i></div>' +
        '<div class="rail"></div>' +
        '<div class="strap" style="left:16%"><span class="stem"></span><span class="ring"></span></div>' +
        '<div class="strap" style="left:38%;animation-delay:.6s"><span class="stem"></span><span class="ring"></span></div>' +
        '<div class="strap" style="left:62%;animation-delay:1.1s"><span class="stem"></span><span class="ring"></span></div>' +
        '<div class="strap" style="left:86%;animation-delay:1.7s"><span class="stem"></span><span class="ring"></span></div>' +
        '<div class="door"><div class="dwin"><i></i></div><div class="dseam"></div><div class="dline"></div></div>' +
        '<div class="seat seatl"></div><div class="seat seatr"></div>' +
        '<div class="pg p1"></div><div class="pg p2"></div>' +
        '<div class="floor"><span class="seam"></span></div>' +
        '<div class="charwash" style="left:42%"></div>',
    },
    night: {
      floor: "13%",
      html: '<div class="wall"></div><div class="stars"></div><div class="lampglow"></div>' +
        '<div class="win"></div><div class="bed"></div>' +
        '<div class="monitor"><div class="txt"></div><div class="txt m"></div><div class="txt s"></div>' +
        '<div class="txt"></div><div class="txt s"></div></div>' +
        '<div class="desk"></div>' +
        '<div class="cup"></div><div class="floor"></div>',
    },
    office: {
      floor: "15%",
      html: '<div class="wall"></div><div class="ceil"></div>' +
        '<div class="winbeam"></div>' +
        '<div class="light" style="left:14%"></div><div class="light" style="left:44%"></div><div class="light" style="left:74%"></div>' +
        '<div class="desks"></div><div class="deskmain"></div>' +
        '<div class="monitor"><div class="txt"></div><div class="txt m"></div><div class="txt s"></div>' +
        '<div class="txt"></div><div class="txt s"></div></div>' +
        '<div class="clockpanel">离汇报还有 1 小时</div><div class="floor"></div>',
    },
    split: {
      floor: "15%",
      html: '<div class="half l"></div><div class="half r"></div>' +
        '<div class="labeltag l1">便利店 · B</div><div class="labeltag l2">公司 · A</div>' +
        '<div class="window"></div><div class="shelf"></div><div class="shelf s2"></div><div class="goods"></div>' +
        '<div class="deskr"></div><div class="dashboard"></div>' +
        '<div class="divider"></div><div class="floorl"></div><div class="floorr"></div>',
    },
    call: {
      floor: "13%",
      html: '<div class="wall"></div><div class="halo"></div><div class="line"></div><div class="floor"></div>',
    },
    lobby: {
      floor: "15%",
      html: '<div class="wall"></div><div class="door"></div><div class="sunspot"></div>' +
        '<div class="counter"></div><div class="sofa"></div><div class="plant"></div><div class="pot"></div>' +
        '<div class="floor"></div>',
    },
    meeting: {
      floor: "16%",
      html: '<div class="wall"></div>' +
        '<div class="screen"><div class="stitle"></div><div class="chart">' +
        '<i style="height:44%"></i><i style="height:72%"></i><i style="height:58%"></i><i></i></div></div>' +
        '<div class="people"><i></i><i></i><i></i><i></i><i></i><i></i></div>' +
        '<div class="table"></div><div class="floor"></div>',
    },
    street: {
      floor: "14%",
      html: '<div class="sky"></div><div class="sun"></div><div class="far"></div><div class="near"></div>' +
        '<div class="trees" style="left:14%"></div><div class="trees" style="left:58%;height:20%"></div>' +
        '<div class="floor"></div><div class="road"></div>',
    },
    platform: {
      floor: "19%",
      html: '<div class="wall"></div><div class="ceil"></div>' +
        '<div class="lamp" style="left:16%"></div><div class="lamp" style="left:44%"></div><div class="lamp" style="left:72%"></div>' +
        '<div class="sign">2 号线</div><div class="track"></div><div class="line"></div>' +
        '<div class="bench"></div><div class="floor"></div>',
    },
    epilogue: {
      floor: "17%",
      html: '<div class="halfl"></div><div class="halfr"></div><div class="winl"></div>' +
        '<div class="memo">备忘录<br>· 想去的那家面馆<br>· 她说想看的展<br>· 一个什么都不做的周末</div>' +
        '<div class="divider"></div><div class="shelf"></div><div class="boxclean"></div><div class="glow"></div>',
    },
  };

  /* ---------------- 回想气泡模板 ---------------- */
  // 地铁：聊天记录停在三天前
  var CHAT_DAY =
    '<span class="db-tail rt"></span>' +
    '<div class="cb-phone">' +
    '<div class="cb-head"><span>‹</span><b>❤ A</b><span>···</span></div>' +
    '<div class="cb-time">三天前&nbsp;&nbsp;23:47</div>' +
    '<div class="cb-row me"><div class="cb-bub g"><i class="ln"></i><i class="ln"></i><i class="ln s"></i></div><i class="cb-face gf"></i></div>' +
    '<div class="cb-row him"><i class="cb-face bf"></i><div class="cb-bub w">🌙</div></div>' +
    '<div class="cb-time">昨天&nbsp;&nbsp;15:20</div>' +
    '<div class="cb-row me"><div class="cb-bub g pic"><div class="cat">' +
    '<i class="ear l"></i><i class="ear r"></i><i class="eye l"></i><i class="eye r"></i><i class="nose"></i>' +
    '</div></div><i class="cb-face gf"></i></div>' +
    '<div class="cb-time">4 小时后</div>' +
    '<div class="cb-row him"><i class="cb-face bf"></i><div class="cb-bub w">哈哈可爱</div></div>' +
    '</div><span class="db-cap">聊天记录，停在三天前</span>';

  // 出租屋：点开聊天框，未读消息
  var CHAT_NIGHT =
    '<span class="db-tail rt"></span>' +
    '<div class="cb-phone night">' +
    '<div class="cb-head"><span>‹</span><b>❤ B</b><span>···</span></div>' +
    '<div class="cb-time">下午&nbsp;&nbsp;15:02</div>' +
    '<div class="cb-row him"><i class="cb-face gf"></i><div class="cb-bub w"><i class="ln"></i><i class="ln"></i><i class="ln s"></i></div></div>' +
    '<div class="cb-row him"><i class="cb-face gf"></i><div class="cb-bub w">♥</div></div>' +
    '<div class="cb-unread">未读 1 条</div>' +
    '</div><span class="db-cap">她下午发的消息，他还没回</span>';

  var motion = window.LoveMotion;

  /* ---------------- 状态 ---------------- */
  var state = {
    si: 0, queue: [], qi: 0, entered: false,
    sceneTime: 0, beatStart: 0, beatDur: 0,
    paused: true, awaiting: false, started: false,
    auto: true, speed: 1, sound: true,
    actors: {}, choices: {}, meter: 50, sceneDone: false,
  };

  /* ---------------- 音效 ---------------- */
  var actx = null;
  function tone(freq, dur, type, vol) {
    if (!state.sound) return;
    try {
      if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
      var o = actx.createOscillator(), g = actx.createGain();
      o.type = type || "sine"; o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, actx.currentTime);
      g.gain.linearRampToValueAtTime(vol || 0.06, actx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + dur);
      o.connect(g); g.connect(actx.destination);
      o.start(); o.stop(actx.currentTime + dur + 0.02);
    } catch (e) { /* ignore */ }
  }
  function sfxMsg() { tone(880, 0.1, "sine", 0.05); setTimeout(function () { tone(1320, 0.12, "sine", 0.045); }, 90); }
  function sfxClick() { tone(660, 0.09, "triangle", 0.05); }
  function sfxScene() { tone(440, 0.12, "sine", 0.04); setTimeout(function () { tone(660, 0.16, "sine", 0.035); }, 90); }

  /* ---------------- 工具 ---------------- */
  function frameSrc(char, f) {
    return "assets/frames/" + char + "_" + (f < 10 ? "0" + f : f) + ".png";
  }
  function preload() {
    ["boy", "girl"].forEach(function (c) {
      for (var i = 0; i < 16; i++) { var im = new Image(); im.src = frameSrc(c, i); }
    });
  }
  function setFrame(id, f) {
    var a = state.actors[id]; if (!a) return;
    a.frame = f; a.img.src = frameSrc(a.char, f);
  }
  function setMeter(v) {
    state.meter = Math.max(3, Math.min(97, v));
    $("meterFill").style.width = state.meter + "%";
    $("meterVal").textContent = state.meter;
  }
  function toast(msg, ms) {
    var t = $("toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(t._t); t._t = setTimeout(function () { t.classList.remove("show"); }, ms || 1900);
  }

  /* ---------------- 场景装载 ---------------- */
  function layoutBubble(bub) {
    // Absolute auto-width otherwise shrinks to the space left in half an actor.
    // Measure the complete line once, so typewriting cannot change its wrapping.
    if (!bub.getBoundingClientRect || !stage.getBoundingClientRect) return;
    var current = bub.textContent;
    bub.textContent = bub.dataset.speech;
    bub.style.maxWidth = Math.max(60, Math.min(320, stage.clientWidth - 32)) + 'px';
    bub.style.width = 'max-content';
    bub.style.minHeight = '0';
    var measured = bub.getBoundingClientRect(), width = measured.width;
    bub.style.width = Math.ceil(width) + 'px';
    bub.style.minHeight = Math.ceil(measured.height) + 'px';
    bub.textContent = current;
    var box = stage.getBoundingClientRect(), actor = bub.parentElement.getBoundingClientRect();
    var anchor = actor.left + actor.width / 2;
    var center = Math.max(box.left + 16 + width / 2, Math.min(anchor, box.right - 16 - width / 2));
    bub.style.left = (center - actor.left) + 'px';
    bub.style.setProperty('--speech-tail', (anchor - center + width / 2) + 'px');
  }
  window.addEventListener('resize', function () {
    actorsEl.querySelectorAll('.bubble').forEach(layoutBubble);
  });
  function clearBubbles() {
    var bs = actorsEl.querySelectorAll(".bubble");
    for (var i = 0; i < bs.length; i++) bs[i].remove();
  }

  function buildScene(idx) {
    revision++;
    state.visualRevision = revision;
    var sc = SCENES[idx];
    state.godotScene = sc.bg === 'subway' || sc.bg === 'night' ? sc.bg : '';
    state.boxOwner = sc.state ? sc.state.boxOwner : null;
    state.storyTime = sc.state ? sc.state.time : sc.time;
    state.presentationId = sc.id;
    bgEl.style.opacity = '1';
    state.si = idx;
    state.queue = sc.beats.slice();
    state.qi = 0; state.entered = false; state.sceneTime = 0;
    state.beatStart = 0; state.beatDur = 0; state.sceneDone = false;
    state.awaiting = false;

    var cfg = BG[sc.bg] || BG.cover;
    var cls = "bg " + (sc.bg === "subway2" ? "subway subway2" : sc.bg);
    if (sc.bg === "subway" || sc.bg === "subway2") cls += " moving";
    bgEl.className = cls;
    bgEl.innerHTML = window.LoveArt.html(sc.bg,cfg.html);

    actorsEl.innerHTML = "";
    state.actors = {};
    sc.actors.forEach(function (a) {
      var el = document.createElement("div");
      el.className = "actor idle" + (a.flip ? " flip" : "");
      el.style.setProperty("--x", a.x + "%");
      el.style.setProperty("--size", a.size + "%");
      el.style.setProperty("--floorY", cfg.floor);
      el.style.setProperty("--move", "0s");
      var bob = document.createElement("div"); bob.className = "bob";
      var img = document.createElement("img");
      img.addEventListener('load', function () {
        el.querySelectorAll('.bubble').forEach(layoutBubble);
      });
      img.src = frameSrc(a.char, a.f);
      img.alt = "";
      bob.appendChild(img);
      var sh = document.createElement("div"); sh.className = "shadow";
      el.appendChild(bob); el.appendChild(sh);
      if (a.props) {
        a.props.forEach(function (p) {
          var d = document.createElement("div");
          d.className = "prop " + p;
          el.appendChild(d);
        });
      }
      actorsEl.appendChild(el);
      state.actors[a.id] = {
        el: el, img: img, bob: bob, char: a.char, frame: a.f, flip: !!a.flip,
        x: a.x, base: a.f, talking: false, blinkOff: Math.random() * 3,
      };
    });

    $("sbTitle").textContent = sc.title;
    $("sbTime").textContent = sc.time;
    capBox.style.opacity = "1";
    capText.textContent = "";
    capWho.textContent = ""; capWho.className = "who"; capWho.style.display = "none";
    phBody.innerHTML = "";
    phoneEl.classList.remove("show");
    $("tears").classList.remove("off");
    $("tears").classList.remove("on");
    $("ringcall").classList.remove("on");
    $("fxclock").classList.remove("show");
    $("propbox").className = "propbox";
    $("dishbub").classList.remove("show");
    $("chatbub").classList.remove("show");
    $("doorbub").classList.remove("show");
    $("themecard").classList.remove("show");
    clearBubbles(); hideThink();

    paintBox();
    sfxScene();
  }

  function markChapters() {
    var cs = $("chapters").children;
    for (var i = 0; i < cs.length; i++) {
      cs[i].className = "cp" + (i === state.si ? " on" : "") + (i < state.si ? " done" : "");
    }
  }

  /* ---------------- 时长计算 ---------------- */
  function beatDur(b) {
    if (b.d) return b.d;
    switch (b.t) {
      case "nar": case "say": return Math.min(7.5, Math.max(2, 1.1 + b.s.length * 0.075));
      case "phone": return Math.max(1.6, 0.8 + b.s.length * 0.05);
      case "move": return b.dur || 2;
      case "bgx": return 1.4;
      case "wait": return 1;
      case "pose": return 0.35;
      case "fx": return b.k === "theme" ? 4 : 0.5;
      case "think": return Math.max(2.6, 1.4 + b.s.length * 0.085);
      default: return 1;
    }
  }

  /* ---------------- 单帧效果 ---------------- */
  function enterBeat(b) {
    Object.keys(state.actors).forEach(function (id) {
      var a = state.actors[id];
      a.listening = b.t === 'say' && id !== b.who;
      a.thinking = b.t === 'think' && id === b.who;
      if (a.listening || a.thinking) a.actionFrom = state.sceneTime;
    });
    if (b.t === 'nar' && /气喘吁吁/.test(b.s) && state.actors.A)
      motion.gesture(state.actors.A, 'tired', state.sceneTime, 2.8);
    if (b.t === 'nar' && /听见有人叫/.test(b.s) && state.actors.B)
      motion.gesture(state.actors.B, 'surprise', state.sceneTime, 1.3);
    if (b.t === 'nar' && /一起走出了地铁站/.test(b.s))
      Object.values(state.actors).forEach(function(a) { motion.startMove(a, Math.min(88,a.x+13),state.sceneTime,2.6); });
    switch (b.t) {
      case "nar":
        capBox.style.opacity = "1";
        capBox.classList.add("nospeech");
        capWho.style.display = "none";
        capText.textContent = "";
        clearBubbles();
        state.typeSkip = false;
        break;
      case "say": {
        clearBubbles();
        state.typeSkip = false;
        var a = state.actors[b.who];
        if (a) {
          a.talking = true; a.actionFrom = state.sceneTime;
          a.cheerful = /太好|好开心|好呀|谢谢|哈哈/.test(b.s);
          if (/我知道|我明白|好的|嗯/.test(b.s)) motion.gesture(a,'nod',state.sceneTime,1.1);
          if (/不是|没有|不想/.test(b.s)) motion.gesture(a,'shake',state.sceneTime,.9);
        }
        if (a && b.s.length <= 34) {
          capBox.style.opacity = "0";
          var bub = document.createElement("div");
          bub.className = "bubble " + (b.who === "A" ? "byA" : "byB");
          bub.textContent = b.s;
          bub.dataset.speech = b.s;
          a.el.appendChild(bub);
          layoutBubble(bub);
          requestAnimationFrame(function () { bub.classList.add("show"); });
        } else {
          capBox.style.opacity = "1";
          capBox.classList.remove("nospeech");
          capWho.style.display = "inline-block";
          capWho.textContent = b.who;
          capWho.className = "who" + (b.who === "B" ? " g" : "");
          capText.textContent = "";
        }
        break;
      }
      case "pose":
        setFrame(b.id, b.f);
        if (state.actors[b.id]) {
          var pa=state.actors[b.id]; pa.base=b.f>=12?0:b.f;
          if(b.f>=13)motion.gesture(pa,'wave',state.sceneTime,1.8);
          else if(b.f===1)motion.gesture(pa,'surprise',state.sceneTime,1.1);
          else if(b.f===2||b.f===11)motion.gesture(pa,'happy',state.sceneTime,1.2);
          else if(b.f===3)motion.gesture(pa,'think',state.sceneTime,1.5);
        }
        break;
      case "think":
        capBox.style.opacity = "0";
        state.typeSkip = false;
        showThink(b.who, b.s);
        break;
      case "move": {
        var ac = state.actors[b.id];
        if (ac) {
          motion.startMove(ac, b.x, state.sceneTime, b.dur || 2, SCENES[state.si].id === 'chase');
        }
        break;
      }
      case "phone": {
        var reader=state.actors[b.side==='him'?'A':'B'];
        if(reader)motion.gesture(reader,'read',state.sceneTime,beatDur(b));
        phoneEl.classList.add("show");
        var m = document.createElement("div");
        m.className = "msg " + b.side;
        m.textContent = b.s;
        phBody.appendChild(m);
        phBody.scrollTop = phBody.scrollHeight;
        sfxMsg();
        break;
      }
      case "fx": applyFx(b.k, b.v); break;
      case "bgx": {
        var cfgx = BG[b.v] || BG.cover;
        var clsx = "bg " + (b.v === "subway2" ? "subway subway2" : b.v);
        if (b.v === "subway" || b.v === "subway2") clsx += " moving";
        bgEl.style.transition = "opacity .45s ease";
        bgEl.style.opacity = "0";
        (function (cls, html, sceneName, token) {
          setTimeout(function () {
            if (token !== revision) return;
            state.godotScene = sceneName === 'subway' || sceneName === 'night' ? sceneName : '';
            var targetFloor = (BG[sceneName] || BG.cover).floor;
            Object.values(state.actors).forEach(function(actor) { actor.el.style.setProperty('--floorY', targetFloor); });
            if (sceneName === 'office' && state.presentationId === 'C2_WORK' && state.actors.A) state.actors.A.el.style.setProperty('--size','44%');
            bgEl.className = cls;
            bgEl.innerHTML = html; paintBox();
            bgEl.style.opacity = "1";
          }, 260);
        })(clsx, window.LoveArt.html(b.v,cfgx.html), b.v, revision);
        break;
      }
      case "badge":
        $('sbTitle').textContent = b.title; $('sbTime').textContent = b.time; break;
      case "choice":
        finishClip(); break;
      case "wait": break;
    }
  }

  function exitBeat(b) {
    if (b.t === "think") { hideThink(); capBox.style.opacity = "1"; }
    if (b.t === "move") {
      var ac = state.actors[b.id];
      if (ac) { motion.finishMove(ac); setFrame(b.id,ac.base); }
    }
    if (b.t === "say") {
      var sa = state.actors[b.who];
      if (sa) { sa.talking = false; setFrame(b.who, sa.base); }
    }
  }

  function applyFx(k, v) {
    if (k === "clock") {
      var c = $("fxclock"); c.textContent = v; c.classList.add("show");
    } else if (k === "phone") {
      if (v === "show") phoneEl.classList.add("show");
      else { phoneEl.classList.remove("show"); phBody.innerHTML = ""; }
    } else if (k === "ring") {
      $("ringcall").classList.toggle("on", v === "on");
    } else if (k === "tears") {
      $("tears").classList.toggle("on", v === "on");
    } else if (k === "prop") {
      var pb = $("propbox");
      pb.innerHTML = '<div style="width:54px;height:34px;background:#e6d3ac;border:2.5px solid #6b5f52;' +
        'border-radius:6px 8px 7px 9px;position:relative;filter:url(#wobble2)">' +
        '<div style="position:absolute;left:8px;right:8px;top:-8px;height:9px;background:#f0e5d3;' +
        'border:2.5px solid #6b5f52;border-radius:4px"></div></div>';
      pb.className = "propbox show";
      pb.style.display = "block";
      pb.style.left = "62%"; pb.style.bottom = "15%";
    } else if (k === "dish") {
      $("dishbub").classList.toggle("show", v === "on");
    } else if (k === "chat") {
      if (v === "off") { $("chatbub").classList.remove("show"); }
      else {
        $("chatbub").innerHTML = (v === "night" ? CHAT_NIGHT : CHAT_DAY);
        $("chatbub").classList.add("show");
      }
    } else if (k === "door") {
      $("doorbub").classList.toggle("show", v === "on");
    } else if (k === "theme") {
      $("themecard").innerHTML = '<div class="tc">爱是愿意把自己的感受说出来，<br>也愿意停下来，听听对方究竟在经历什么。<small>' + v + '</small></div>';
      $("themecard").classList.add("show");
    } else if (k === "msg") {
      phoneEl.classList.add("show");
      var mm = document.createElement("div");
      mm.className = "msg him"; mm.textContent = v;
      phBody.appendChild(mm);
    }
  }

  /* ---------------- 想法气泡（人物左上角） ---------------- */
  function showThink(who, text) {
    var tb = $("thinkbub");
    var a = who && state.actors[who];
    var x = 50;
    if (a) {
      var vx = parseFloat(a.el.style.getPropertyValue("--x"));
      if (!isNaN(vx)) x = vx;
    }
    tb.querySelector(".tb-txt").textContent = text;
    tb.style.left = Math.max(1.5, Math.min(64, x - 30)) + "%";
    tb.style.top = "12%";
    tb.classList.add("show");
  }
  function hideThink() { $("thinkbub").classList.remove("show"); }


  function step() {
    var b = state.queue[state.qi];
    if (!b) return;
    if (!state.entered) {
      enterBeat(b);
      state.beatDur = beatDur(b);
      state.beatStart = state.sceneTime;
      state.entered = true;
    }
    var el = state.sceneTime - state.beatStart;
    // 打字机（点一下可整行立刻显示）
    if (b.t === "nar" || b.t === "say") {
      var full = b.s, typeDur = state.beatDur * 0.72;
      var n = state.typeSkip ? full.length : Math.floor(full.length * Math.min(1, el / typeDur));
      var target = (b.t === "say" && full.length <= 34)
        ? null : capText;
      if (target) target.textContent = full.slice(0, n);
      if (b.t === "say" && full.length <= 34) {
        var bub = document.querySelector(".bubble.show");
        if (bub) bub.textContent = full.slice(0, n);
      }
      capBox.classList.toggle("typing", !state.typeSkip && el < typeDur);
    } else if (b.t === "think") {
      var tf = b.s, tdur = state.beatDur * 0.62;
      var tn = state.typeSkip ? tf.length : Math.floor(tf.length * Math.min(1, el / tdur));
      var tt = $("thinkbub").querySelector(".tb-txt");
      if (tt) tt.textContent = tf.slice(0, tn);
    }
    // All actor frames and local poses share the same pause/speed-aware clock.
    Object.keys(state.actors).forEach(function (id) {
      var a = state.actors[id];
      var want = motion.sample(a,state.sceneTime);
      if (a.frame !== want) setFrame(id,want);
    });
    if (el >= state.beatDur && (state.auto || !["nar", "say", "think"].includes(b.t))) {
      if (b.t === "choice") return; // 等待用户选择
      nextBeat();
    }
  }


  BG.kitchen = {floor:'13%',html:'<div class="wall"></div><div class="kitchen-window"></div><div class="kitchen-shelf"><i></i><i></i><i></i></div><div class="kitchen-counter"></div><div class="kitchen-stove"></div><div class="kitchen-pan"></div><div class="floor"></div>'};
  BG.cafe = {floor:'14%',html:'<div class="wall"></div><div class="cafe-window"></div><div class="cafe-sign">先吃点东西</div><div class="cafe-table"></div><div class="cafe-cup"></div><div class="floor"></div>'};

  function paintBox() {
    var clockPanel=bgEl.querySelector('.clockpanel');
    if(clockPanel)clockPanel.textContent=parseInt(state.storyTime,10)>=13?'会议结束 · 重新回应':'汇报准备 · 核对图表与结论';
    actorsEl.querySelectorAll('.paperbag,.lunchbox').forEach(function(el){el.remove();});
    $('propbox').classList.remove('show');
    var owner = state.actors[state.boxOwner];
    if (owner) {
      var p = document.createElement('div'); p.className = 'prop paperbag';
      p.title = state.boxOwner === 'A' ? 'A已经接到饭盒' : 'B随身带着饭盒';
      owner.el.appendChild(p);
    } else if(state.boxOwner === 'frontdesk' && bgEl.classList.contains('lobby')) applyFx('prop','show');
  }
  function finishClip() {
    if (state.sceneDone) return;
    state.sceneDone = true; state.awaiting = true;
    clearBubbles(); hideThink(); capBox.style.opacity = '0';
    var done = complete; complete = null;
    if(done) done();
  }
  function nextBeat() {
    if(state.awaiting || state.sceneDone) return;
    if(state.qi < state.queue.length) exitBeat(state.queue[state.qi]);
    state.qi++; state.entered = false; state.beatStart = state.sceneTime;
    if(state.qi >= state.queue.length) finishClip();
  }
  function advance(dt) {
    if(!state.started || state.paused || state.awaiting || state.sceneDone) return;
    state.sceneTime += dt * state.speed;
    step();
    syncDecorations();
    var part = Math.min(1, (state.qi + Math.min(1,(state.sceneTime-state.beatStart)/Math.max(.001,state.beatDur)))/Math.max(1,state.queue.length));
    $('barFill').style.width = (part*100)+'%';
  }
  function syncDecorations() {
    // Freeze CSS background/FX clocks at story time; keep their original tracks.
    var frozen = !state.started || state.paused || state.awaiting || state.sceneDone;
    var animations = stage.getAnimations ? stage.getAnimations({subtree:true}) : [];
    animations.forEach(function(a) {
      if (!a.animationName) return; // preserve finite transitions, e.g. bubble entry
      if (a.animationName === 'popin' || a.animationName === 'fadein') return;
      a.pause();
      a.currentTime = state.sceneTime * 1000;
    });
    stage.classList.toggle('motion-paused',frozen);
  }
  var last = 0;
  function loop(ts) {
    var dt = last ? Math.min(.25, (ts-last)/1000) : 0; last = ts;
    advance(dt); requestAnimationFrame(loop);
  }
  function play() {state.paused=false;syncDecorations(); $('btnPlay').textContent='⏸ 暂停';}
  function pause() {state.paused=true;syncDecorations(); $('btnPlay').textContent='▶ 播放';}
  function skipLine() {
    if(!state.started || state.awaiting || state.sceneDone || state.paused) return;
    var b=state.queue[state.qi];
    if(!state.entered) {step(); b=state.queue[state.qi];}
    if(b && ['nar','say','think'].includes(b.t) && !state.typeSkip) {state.typeSkip=true; step(); return;}
    nextBeat(); if(!state.sceneDone) step();
  }
  window.LoveCinema = {
    load: function(scene,onComplete) {
      complete=null; choicesEl.classList.remove('show');
      SCENES=[scene]; state.started=true; buildScene(0); complete=onComplete;
      play(); step();
    },
    play:play,pause:pause,toggle:function(){state.paused?play():pause();},
    skipLine:skipLine,
    setAuto:function(value){state.auto=value;},
    setSpeed:function(value){state.speed=value;},
    setSound:function(value){state.sound=value;},
    clickSound:sfxClick,
    effects:applyFx,
    snapshot:function(){return {started:state.started,paused:state.paused,auto:state.auto,speed:state.speed,sound:state.sound,awaiting:state.awaiting,sceneDone:state.sceneDone,qi:state.qi,time:state.sceneTime,beat:state.queue[state.qi],godotScene:state.godotScene};},
    advance:advance,
  };
  preload(); window.__jingxi=state; requestAnimationFrame(loop);
})();
