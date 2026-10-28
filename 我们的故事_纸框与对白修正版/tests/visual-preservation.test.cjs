'use strict';

// Run anywhere: node tests/visual-preservation.test.cjs
// Baseline hashes travel with the package; no access to the original Downloads folder is needed.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'original-visual-manifest.json'), 'utf8'));
// Rebuilt actor-layer source/export are intentional changes; original artwork,
// character frames and the complete original style sheet remain hash-checked.
const rebuilt=new Set(['godot/project.godot','godot/stage.gd','godot/compress-web.cjs','dist/godot/index.html','dist/godot/index.pck','dist/godot-bridge.css','godot/README.md']);
for (const [relative, expected] of Object.entries(manifest.files)) {
  if(rebuilt.has(relative))continue;
  const file = path.join(root, relative);
  assert.ok(fs.existsSync(file), 'Missing original visual file: ' + relative);
  const bytes = fs.readFileSync(file);
  assert.equal(bytes.length, expected.bytes, 'Original file size changed: ' + relative);
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), expected.sha256, 'Original visual bytes changed: ' + relative);
}

const html = fs.readFileSync(path.join(root, fs.existsSync(path.join(root,'dist/play.html'))?'dist/play.html':'dist/index.html'), 'utf8');
const originalStageIds = ['stage', 'bg', 'actors', 'fxclock', 'tears', 'ringcall', 'propbox', 'dishbub', 'chatbub', 'thinkbub', 'doorbub', 'toast', 'phone', 'phbody', 'themecard', 'scenebadge', 'sbTitle', 'sbTime', 'caption', 'capWho', 'capText', 'capNext', 'choices', 'chq', 'chopts', 'chfb', 'btnPlay', 'btnAuto', 'btnSpeed', 'btnSound'];
for (const id of originalStageIds) assert.ok(html.includes('id="' + id + '"'), 'Original presentation surface missing: ' + id);
for (const layer of ['vignette', 'grain']) assert.ok(html.includes('class="' + layer + '"'), 'Original texture layer missing: ' + layer);
assert.ok(!html.includes('class="play-layout"'), 'The replacement split-column layout must not be the player surface');

const cinema = fs.readFileSync(path.join(root, 'dist/cinema.js'), 'utf8');
for (const method of ['buildScene', 'enterBeat', 'exitBeat', 'applyFx', 'showThink', 'step', 'advance']) assert.ok(cinema.includes('function ' + method + '('), 'Original animation function missing: ' + method);
for (const type of ['nar', 'say', 'think', 'pose', 'move', 'phone', 'fx', 'bgx']) assert.ok(cinema.includes('case "' + type + '"') || cinema.includes("case '" + type + "'"), 'Original beat capability missing: ' + type);
const motion=fs.readFileSync(path.join(root,'dist/motion.js'),'utf8');
assert.ok(motion.includes('[4,5,6,7]'),'Walking retains the original four real sprite frames');
assert.ok(motion.includes('3.8'),'Idle blinking remains available with the shared story clock');
assert.ok(!cinema.includes('_choiceHold'), 'Render mode must not automatically choose an option');
const transitionCase = cinema.slice(cinema.indexOf('case "bgx": {'), cinema.indexOf('case "badge":'));
assert.ok(transitionCase.indexOf('paintBox()') > transitionCase.indexOf('bgEl.innerHTML = html'), 'After BGX updates the background, recompute lunchbox visibility so a front-desk box cannot appear in the street');
assert.ok(transitionCase.includes('token !== revision'), 'A stale scene transition must not overwrite a rewound scene');

const story = require('../dist/story.js');
const {create} = require('../dist/engine.js');
const context = {window: {}, LOVE_STORY: story, console};
vm.runInNewContext(fs.readFileSync(path.join(root, 'dist/cinematic-scenes.js'), 'utf8'), context, {timeout: 3000, filename: 'cinematic-scenes.js'});
const scenes = context.window.LoveScenes;
assert.ok(scenes && scenes.prologue && scenes.intro && scenes.outcome, 'Scene adapter API is complete');
const valid = new Set(['nar', 'say', 'pose', 'think', 'move', 'phone', 'fx', 'bgx', 'wait', 'badge']);
const allBeats = [];
const visitedNodes = new Set(), visitedEdges = new Set(), visitedEnds = new Set();
function sceneChecks(scene, label) {
  assert.ok(scene && scene.bg && scene.title, label + ' lacks a scene or title');
  assert.ok(Array.isArray(scene.actors) && scene.actors.length > 0, label + ' loses character presentation');
  for (const actor of scene.actors) {
    assert.ok(['A', 'B'].includes(actor.id), label + ' contains unknown actor');
    assert.ok(['girl', 'boy'].includes(actor.char), label + ' replaces original characters');
    assert.ok(actor.f >= 0 && actor.f <= 15, label + ' references an unknown character frame');
    assert.ok(actor.size >= 30 && actor.size <= 55, label + ' unexpectedly rescales a character');
    assert.ok(!(actor.props || []).some(prop => prop === 'lunchbox' || prop === 'paperbag'), label + ' duplicates state-controlled lunchbox');
  }
  assert.ok(Array.isArray(scene.beats) && scene.beats.length, label + ' is a still image without beats');
  for (const beat of scene.beats) {
    assert.ok(valid.has(beat.t), label + ' unsupported beat ' + beat.t);
    if (['nar', 'say', 'think', 'phone'].includes(beat.t)) assert.ok(typeof beat.s === 'string' && beat.s.length > 0, label + ' empty dialogue beat');
    allBeats.push(beat);
  }
  return scene;
}
const prologue = sceneChecks(scenes.prologue(), 'prologue');
assert.equal(prologue.bg, 'campus', 'Original campus opening must actually be used');
assert.ok(prologue.beats.some(b => b.t === 'bgx' && b.v === 'city'), 'Campus-to-city transition must actually play');
assert.ok(prologue.beats.some(b => b.t === 'move' && b.id === 'A') && prologue.beats.some(b => b.t === 'move' && b.id === 'B'), 'Both opening characters must walk');

let seed = 93467;
const rand = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;
const clone = value => JSON.parse(JSON.stringify(value));
const expectedNodes = Object.keys(story.nodes);
const expectedEdges = Object.values(story.nodes).filter(n => !n.terminal).flatMap(n => n.choices.map(op => n.id + '/' + op.id));
let nightUsed = false, rounds = 0;
for (; rounds < 900; rounds++) {
  const engine = create(story);
  let view = engine.start();
  let guard = 0;
  while (guard++ < 30) {
    visitedNodes.add(view.nodeId);
    const introInput = clone(view), before = JSON.stringify(introInput);
    const scene = sceneChecks(scenes.intro(introInput), view.nodeId + ' intro');
    assert.equal(JSON.stringify(introInput), before, 'Rendering changes game state');
    if (view.nodeId === 'C2_WORK') {
      nightUsed ||= scene.bg === 'night' || scene.beats.some(b => b.t === 'bgx' && b.v === 'night');
      assert.ok(scene.beats.some(b => b.t === 'bgx' && b.v === 'office') || scene.bg === 'office', 'Night recollection must return to current office');
    }
    if (view.phase === 'ending') {visitedEnds.add(view.nodeId); break;}
    for (const item of view.node.inspect) engine.inspect(item.id);
    view = engine.view();
    const available = view.choices.filter(op => op.enabled);
    const unseen = available.filter(op => !visitedEdges.has(view.nodeId + '/' + op.id));
    const options = unseen.length ? unseen : available;
    const choice = options[Math.floor(rand() * options.length)];
    visitedEdges.add(view.nodeId + '/' + choice.id);
    const result = engine.choose(choice.id);
    const outcomeInput = clone(result), beforeOutcome = JSON.stringify(outcomeInput);
    sceneChecks(scenes.outcome(outcomeInput), view.nodeId + '/' + choice.id + ' outcome');
    assert.equal(JSON.stringify(outcomeInput), beforeOutcome, 'Outcome rendering changes game state');
    assert.equal(engine.view().phase, 'outcome', 'Rendering must not automatically continue past a choice');
    assert.equal(engine.view().history.length, result.history.length, 'Rendering must not select additional choices');
    view = engine.advance();
  }
  assert.ok(guard < 30, 'Unexpected story loop');
  if (rounds >= 239 && visitedNodes.size === expectedNodes.length && visitedEdges.size === expectedEdges.length) {rounds++; break;}
}
assert.deepEqual(expectedNodes.filter(id => !visitedNodes.has(id)), [], 'Every story node must have a valid animated presentation');
assert.deepEqual(expectedEdges.filter(id => !visitedEdges.has(id)), [], 'Every option must have a valid animated consequence');
assert.equal(visitedEnds.size, 6, 'All six stage endings must remain reachable');
assert.ok(nightUsed, 'Original Godot night scene is copied but never presented');
const effects = new Set(allBeats.filter(b => b.t === 'fx').map(b => b.k));
for (const effect of ['dish', 'chat', 'door', 'ring', 'clock']) assert.ok(effects.has(effect), 'Original effect not reached by any playable scene: ' + effect);
for (const type of ['think', 'phone', 'move', 'pose', 'say']) assert.ok(allBeats.some(b => b.t === type), 'Original animation form never plays: ' + type);
console.log(JSON.stringify({baseline: manifest.counts, verifiedVisualFiles: Object.keys(manifest.files).filter(p=>!rebuilt.has(p)).length, rounds, animatedNodes: visitedNodes.size, animatedOptions: visitedEdges.size, endings: visitedEnds.size, originalEffects: [...effects].sort(), nightRecollection: nightUsed}, null, 2));
console.log('PASS: preserved original artwork and UI bytes, original stage surfaces, original animation forms, and all animated branch presentations.');
