/* 《惊喜》互动动画 —— 播放器 */
(function () {
  "use strict";

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

  var WALK = { boy: [4, 5, 6, 7], girl: [4, 5, 6, 7] };

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
  function clearBubbles() {
    var bs = actorsEl.querySelectorAll(".bubble");
    for (var i = 0; i < bs.length; i++) bs[i].remove();
  }

  function buildScene(idx) {
    var sc = SCENES[idx];
    state.si = idx;
    state.queue = sc.beats.slice();
    state.qi = 0; state.entered = false; state.sceneTime = 0;
    state.beatStart = 0; state.beatDur = 0; state.sceneDone = false;
    state.awaiting = false;

    var cfg = BG[sc.bg] || BG.cover;
    var cls = "bg " + (sc.bg === "subway2" ? "subway subway2" : sc.bg);
    if (sc.bg === "subway" || sc.bg === "subway2") cls += " moving";
    bgEl.className = cls;
    bgEl.innerHTML = cfg.html;

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
        el: el, img: img, char: a.char, frame: a.f, flip: !!a.flip,
        base: a.f, talking: false, blinkOff: Math.random() * 3,
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
    clearBubbles();

    markChapters();
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
        if (a) { a.talking = true; a.talkFrom = state.sceneTime; }
        if (a && b.s.length <= 34) {
          capBox.style.opacity = "0";
          var bub = document.createElement("div");
          bub.className = "bubble " + (b.who === "A" ? "byA" : "byB");
          bub.textContent = b.s;
          a.el.appendChild(bub);
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
        if (state.actors[b.id]) state.actors[b.id].base = b.f;
        break;
      case "think":
        capBox.style.opacity = "0";
        state.typeSkip = false;
        showThink(b.who, b.s);
        break;
      case "move": {
        var ac = state.actors[b.id];
        if (ac) {
          ac.el.style.setProperty("--move", (b.dur || 2) + "s");
          ac.el.style.setProperty("--x", b.x + "%");
          ac.el.classList.remove("idle"); ac.el.classList.add("walking");
          ac.walkFrom = state.sceneTime;
        }
        break;
      }
      case "phone": {
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
        (function (cls, html) {
          setTimeout(function () {
            bgEl.className = cls;
            bgEl.innerHTML = html;
            bgEl.style.opacity = "1";
          }, 260);
        })(clsx, cfgx.html);
        break;
      }
      case "choice": openChoice(b.node); break;
      case "wait": break;
    }
  }

  function exitBeat(b) {
    if (b.t === "think") { hideThink(); capBox.style.opacity = "1"; }
    if (b.t === "move") {
      var ac = state.actors[b.id];
      if (ac) { ac.el.classList.remove("walking"); ac.el.classList.add("idle"); setFrame(b.id, ac.base); }
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

  /* ---------------- 选择节点 ---------------- */
  function applyChoice(nodeId, op) {
    state.choices[nodeId] = op;
    setMeter(state.meter + op.delta);
    if (op.branch) {
      state.queue = state.queue.slice(0, state.qi + 1)
        .concat(op.branch, state.queue.slice(state.qi + 1));
    }
    state.awaiting = false;
    choicesEl.classList.remove("show");
    $("chfb").classList.remove("show");
    nextBeat();
  }

  function openChoice(nodeId) {
    state.awaiting = true;
    var node = CHOICES[nodeId];
    $("chq").innerHTML = node.q + "<small>" + node.hint + "</small>";
    var box = $("chopts"); box.innerHTML = "";
    node.opts.forEach(function (op) {
      var btn = document.createElement("button");
      btn.className = "chop";
      btn.innerHTML = "<b>" + op.key + ".</b>" + op.label + "<span>" + op.desc + "</span>";
      btn.onclick = function () {
        sfxClick();
        $("chfb").innerHTML = "你选择了 <b>" + op.label + "</b>：" + op.say + "<br>" + node.feedback;
        $("chfb").classList.add("show");
        var cont = document.createElement("div");
        cont.style.cssText = "margin-top:12px;text-align:right";
        var b2 = document.createElement("button");
        b2.className = "bigbtn"; b2.style.cssText = "margin-top:0;padding:10px 24px;font-size:14px";
        b2.textContent = "继续故事 ▸";
        b2.onclick = function () { sfxClick(); applyChoice(nodeId, op); };
        cont.appendChild(b2);
        box.appendChild(cont);
        // 禁用其它选项
        var all = box.querySelectorAll(".chop");
        for (var i = 0; i < all.length; i++) { all[i].disabled = true; all[i].style.opacity = ".5"; }
      };
      box.appendChild(btn);
    });
    choicesEl.classList.add("show");
  }

  /* ---------------- 播放循环 ---------------- */
  function nextBeat() {
    if (state.qi < state.queue.length) exitBeat(state.queue[state.qi]);
    state.qi++;
    state.entered = false;
    state.beatStart = state.sceneTime;
    if (state.qi >= state.queue.length) {
      // 场景结束
      capBox.style.opacity = "0";
      clearBubbles();
      state.sceneDone = true;
      if (state.si >= SCENES.length - 1) {
        setTimeout(showReview, 1600);
      } else if (state.auto) {
        toast("下一幕：" + SCENES[state.si + 1].title, 1800);
        setTimeout(function () {
          if (state.auto && state.sceneDone) { buildScene(state.si + 1); step(); }
        }, 1500);
      }
    }
  }

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
    // 行走帧循环
    Object.keys(state.actors).forEach(function (id) {
      var a = state.actors[id];
      if (a.el.classList.contains("walking")) {
        var wf = WALK[a.char];
        var k = Math.floor(el / 0.13) % wf.length;
        if (a.frame !== wf[k]) setFrame(id, wf[k]);
      }
    });
    // 说话时帧动画 + 待机眨眼
    Object.keys(state.actors).forEach(function (id) {
      var a = state.actors[id];
      if (a.el.classList.contains("walking")) return;
      if (a.talking) {
        var tf = [8, 10];
        var tk = Math.floor((state.sceneTime - (a.talkFrom || 0)) / 0.24) % 2;
        if (a.frame !== tf[tk]) setFrame(id, tf[tk]);
      } else if (a.base === 0) {
        // 待机眨眼：3.8s 一个周期，末 0.35s 闭眼（帧 2）
        var ph = (state.sceneTime + a.blinkOff) % 3.8;
        var want = ph > 3.45 ? 2 : 0;
        if (a.frame !== want) setFrame(id, want);
      }
    });
    if (el >= state.beatDur) {
      if (b.t === "choice") return; // 等待用户选择
      nextBeat();
    }
  }

  function advance(dt) {
    if (!state.started || state.paused) return;
    if (state.awaiting) {
      // 渲染模式：让选择面板停留一会儿，然后自动走正史选项
      if (RENDER) {
        state._choiceHold = (state._choiceHold || 0) + dt;
        if (state._choiceHold >= 4) {
          state._choiceHold = 0;
          var cur = state.queue[state.qi];
          if (cur && cur.t === "choice") {
            var node = CHOICES[cur.node];
            applyChoice(cur.node, node.opts[node.canon || 0]);
          }
        }
      }
      return;
    }
    if (state.sceneDone) return;
    state.sceneTime += dt * state.speed;
    step();
    updateProgress();
  }

  var last = 0;
  function loop(ts) {
    if (!last) last = ts;
    var dt = (ts - last) / 1000; last = ts;
    if (dt > 0.25) dt = 0.25;
    advance(dt);
    requestAnimationFrame(loop);
  }

  function updateProgress() {
    var totalBeats = state.queue.length;
    var done = state.qi + Math.min(1, (state.sceneTime - state.beatStart) / Math.max(0.001, state.beatDur));
    var pDone = Math.min(1, done / totalBeats);
    var per = 1 / SCENES.length;
    var p = Math.min(1, (state.si + pDone) * per);
    $("barFill").style.width = (p * 100) + "%";
    $("pct").textContent = Math.round(p * 100) + "%";
  }

  /* ---------------- 控制 ---------------- */
  function play() {
    state.paused = false;
    $("btnPlay").textContent = "⏸ 暂停";
  }
  function pause() {
    state.paused = true;
    $("btnPlay").textContent = "▶ 播放";
  }
  function togglePlay() { state.paused ? play() : pause(); }

  function goScene(i) {
    if (i < 0 || i >= SCENES.length) return;
    buildScene(i); play(); step();
  }

  function showReview() {
    var keys = Object.keys(state.choices);
    var sum = 0; keys.forEach(function (k) { sum += state.choices[k].delta; });
    var txt;
    if (sum >= 15) txt = "你们今天没有立刻和好，但这是这一年以来，第一次把话真正说了出口。心的距离可以慢慢收回来——只要还愿意说话。";
    else if (sum >= 0) txt = "问题还在那儿，指责没有被完全吞回去，但至少有一点点松动。<b>他们还需要很多次这样的对话。</b>";
    else txt = "故事讲完了。这一次，谁都没有先伸出手。<b>沉默不会自动变成理解，它只会变成长久的习惯。</b>";
    $("rvSum").innerHTML = "最终「心的距离」：<b>" + state.meter + "</b> / 100<br>" + txt;

    var list = $("rvList"); list.innerHTML = "";
    [1, 2, 3].forEach(function (n) {
      var op = state.choices[n];
      if (!op) return;
      var d = document.createElement("div");
      d.className = "rv-item";
      d.innerHTML = '<span class="tag">节点 ' + n + "</span><b>" + op.label + "</b> —— " + op.desc +
        '<br><span style="color:#6d675e">' + op.say + "</span>";
      list.appendChild(d);
    });
    reviewEl.classList.add("show");
  }

  /* ---------------- 事件绑定 ---------------- */
  $("btnStart").onclick = function () {
    startcard.classList.add("hide");
    state.started = true;
    buildScene(0); play(); step();
  };
  $("btnPlay").onclick = togglePlay;
  $("btnPrev").onclick = function () { goScene(state.si - 1); };
  $("btnNext").onclick = function () { goScene(state.si + 1); };
  $("btnAuto").onclick = function () {
    state.auto = !state.auto;
    $("btnAuto").textContent = "自动连播：" + (state.auto ? "开" : "关");
    if (state.auto && state.sceneDone && state.si < SCENES.length - 1) goScene(state.si + 1);
  };
  $("btnSpeed").onclick = function () {
    state.speed = state.speed >= 1.5 ? 0.75 : (state.speed >= 1 ? 1.5 : 1);
    $("btnSpeed").textContent = "速度 " + state.speed.toFixed(2).replace(/0$/, "").replace(/\.$/, "") + "×";
  };
  $("btnSound").onclick = function () {
    state.sound = !state.sound;
    $("btnSound").textContent = "声音：" + (state.sound ? "开" : "关");
  };
  // 点字幕框：正在打字 → 立刻显示整行；已显示完 → 进入下一句
  function captionClick() {
    if (!state.started || state.paused) return;
    var b = state.queue[state.qi];
    if (b && (b.t === "nar" || b.t === "say" || b.t === "think")) {
      var el = state.sceneTime - state.beatStart;
      var td = state.beatDur * (b.t === "think" ? 0.62 : 0.72);
      if (!state.typeSkip && el < td) { state.typeSkip = true; return; }
    }
    nextBeat();
  }
  $("caption").onclick = captionClick;
  $("capNext").onclick = function (e) { e.stopPropagation(); captionClick(); };
  // 画面空白处点击同样生效（避开按钮、选择面板、手机浮层）
  stage.addEventListener("click", function (e) {
    if (state.awaiting) return;
    var t = e.target;
    if (t && t.closest && t.closest("button, .choices, .ctrl, .phone, .review, .themecard")) return;
    captionClick();
  });
  $("rvClose").onclick = function () { reviewEl.classList.remove("show"); };
  $("btnReplay").onclick = function () {
    reviewEl.classList.remove("show");
    goScene(0);
  };
  $("btnRestart").onclick = function () {
    reviewEl.classList.remove("show");
    state.choices = {}; setMeter(50);
    goScene(0);
  };

  document.addEventListener("keydown", function (e) {
    if (!state.started) return;
    if (e.code === "Space") { e.preventDefault(); togglePlay(); }
    else if (e.code === "ArrowRight") { e.preventDefault(); goScene(state.si + 1); }
    else if (e.code === "ArrowLeft") { e.preventDefault(); goScene(state.si - 1); }
  });

  /* 章节按钮 */
  (function buildChapters() {
    var box = $("chapters");
    SCENES.forEach(function (sc, i) {
      var b = document.createElement("button");
      b.className = "cp";
      b.textContent = (i === 0 ? "序" : i) + " · " + sc.title.replace(/^第.*场 · /, "").replace(/^尾声 · /, "");
      b.onclick = function () { goScene(i); };
      box.appendChild(b);
    });
  })();

  preload();

  /* 渲染模式：index.html?render=1&scene=N —— 由外部程序逐帧驱动，用于录制成视频 */
  var qs = new URLSearchParams(location.search);
  var RENDER = qs.has("render");
  if (RENDER) {
    document.body.classList.add("render");
    startcard.classList.add("hide");
    state.started = true;
    state.auto = false;
    state.paused = false;
    state.sound = false;
    buildScene(parseInt(qs.get("scene") || "0", 10) || 0);
    window.__jingxiRender = {
      step: function (dt) { advance(dt); },
      done: function () { return state.sceneDone; },
    };
  } else {
    buildScene(0);
    requestAnimationFrame(loop);
  }
  window.__jingxi = state; // 调试用：暴露播放状态
})();
