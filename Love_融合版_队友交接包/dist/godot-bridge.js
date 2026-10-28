/* Bounded Godot visual layer. Existing app.js/story.js remain authoritative. */
(function () {
  'use strict';
  const stage = document.getElementById('stage');
  const frame = document.createElement('iframe');
  frame.id = 'godotStage';
  frame.title = '前两幕游戏画面';
  frame.tabIndex = -1;
  frame.setAttribute('aria-hidden', 'true');
  frame.src = 'godot/index.html';
  stage.insertBefore(frame, stage.firstChild);
  let ready = false, painted = '', previous = '', generation = 0;
  window.addEventListener('message', function (event) {
    if (event.origin !== location.origin || event.source !== frame.contentWindow) return;
    if (event.data?.type === 'love-godot-ready') ready = true;
    if (event.data?.type === 'love-godot-painted' && event.data.generation === generation) painted = event.data.scene;
  });
  function update() {
    const state = window.__jingxi;
    const scene = state?.si === 1 ? 'subway' : state?.si === 2 ? 'night' : '';
    if (scene !== previous) { stage.classList.remove('godot-active'); previous = scene; painted = ''; generation++; }
    if (ready && scene) {
      const box = stage.getBoundingClientRect();
      const actors = Object.values(state.actors).map(function (actor) {
        const rect = actor.img.getBoundingClientRect();
        const style = getComputedStyle(actor.el);
        return {kind: actor.char, frame: actor.frame, flip: actor.flip,
          x: rect.left - box.left, y: rect.top - box.top,
          width: rect.width, height: rect.height, opacity: Number(style.opacity)};
      });
      try {
        frame.contentWindow.loveGodotSetState(JSON.stringify({scene, generation, width: box.width, height: box.height, actors}));
        stage.classList.toggle('godot-active', painted === scene);
      } catch (e) {
        stage.classList.remove('godot-active');
      }
    } else stage.classList.remove('godot-active');
    requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
})();
