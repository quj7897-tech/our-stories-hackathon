'use strict';

// Run from any directory: node outputs/Love_高互动重制版/tests/engine.test.cjs
// Uses deterministic walks and uncovered-option weighting instead of enumerating 3^N paths.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { create } = require('../dist/engine.js');
const story = require('../dist/story.js');
const clone = value => JSON.parse(JSON.stringify(value));
const coveragePath = process.env.LOVE_COVERAGE_PATH || path.join(os.tmpdir(), 'love-interactive-coverage.json');
const nodeEntries = Object.entries(story.nodes);
const decisionEntries = nodeEntries.filter(([, node]) => !node.terminal);
const terminalEntries = nodeEntries.filter(([, node]) => node.terminal);
const expectedEdges = new Set(decisionEntries.flatMap(([id, node]) => node.choices.map(choice => id + '/' + choice.id)));
const nodeSamples = {};
const edgeSamples = {};
const terminalSamples = {};
const inspectSamples = {};
const paths = [];
const modeCounts = {};
const routeCounts = {};
const edgeCounts = {};
const lengths = [];
let seed = 0x51a17c;
let lockedAttempts = 0;
let unlockedByInspection = 0;
let inspectedCount = 0;
let rewindChecks = 0;
let runs = 0;
function random() {
  seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
  return seed / 4294967296;
}
function minutes(time) {
  assert.match(time, /^\d{2}:\d{2}$/, '每个场景必须有 HH:MM 时间');
  const [h, m] = time.split(':').map(Number);
  assert.ok(h < 24 && m < 60, '无效时间 ' + time);
  return h * 60 + m;
}
function stateChecks(view, lastTime) {
  assert.ok(['B', 'A', 'frontdesk'].includes(view.state.boxOwner), '饭盒必须恰有一位持有者');
  if (view.state.boxOwner === 'frontdesk') assert.equal(view.state.frontdeskConfirmed, true, '前台只能在明确确认后持有饭盒');
  if (view.state.boxOwner === 'A') assert.equal(view.state.met, true, 'A 拿到饭盒前必须实际见面交接');
  if (view.state.aReadNote) {
    assert.equal(view.state.note, true, '没有放入便签就不能读取便签');
    assert.equal(view.state.boxOwner, 'A', '尚未交出的便签不能被 A 隔空读取');
  }
  if (view.state.aKnowsNeed) assert.ok(view.state.needSource, '已知期待必须有实际传达来源');
  if (view.state.requestedMeal && view.state.intent === 'meal') {
    assert.equal(view.state.aKnowsNeed, true, '当面明确说出一起吃饭，应传播相同的最初来意');
  }
  const now = minutes(view.state.time);
  assert.ok(now >= lastTime, `${view.nodeId} 时间倒流：${view.state.time}`);
  assert.ok(now <= 12 * 60 + 40, '前三章不能提前演出后续时刻');
  assert.ok([null, '13:00', '15:00'].includes(view.state.waitUntil), '等待期限必须为 null/13:00/15:00');
  if (view.phase === 'ending') {
    assert.equal(view.state.time, '12:40', '所有阶段结局止于 12:40');
    assert.ok(view.summary && view.summary.title && view.summary.text, '阶段结局必须有具体复盘');
    assert.ok(Array.isArray(view.summary.facts) && view.summary.facts.length, '复盘必须显示实际事实');
    if (view.state.waitUntil) {
      assert.equal(view.state.departed, false, '选择等待期限不应同时自动离开');
      assert.ok(minutes(view.state.waitUntil) > now, '13:00/15:00 是未来计划，不是已完成的等待');
    }
    const endingText = view.node.lines.map(line => line.text).join('');
    if (view.state.departed && view.state.leaveMessage === 'short' && view.state.followUp) {
      assert.match(endingText, /晚饭后/, '离开结局不能遗忘此前已经提出的晚饭后联系承诺');
    }
    if (view.nodeId === 'E_MEET_WAIT' && view.state.boxOwner === 'B') {
      assert.doesNotMatch(endingText, /午饭发生过/, '尚未交接或一起吃饭，不能把午饭写成已经发生');
    }
  }
  return now;
}
function recordNode(view, prefix) {
  const sample = nodeSamples[view.nodeId];
  if (!sample || prefix.length < sample.prefix.length) {
    nodeSamples[view.nodeId] = {
      nodeId: view.nodeId, state: clone(view.state), prefix: clone(prefix),
      title: view.node.title, lines: clone(view.node.lines), terminal: view.node.terminal,
      inspect: clone(view.node.inspect), choices: clone(view.choices),
    };
  }
}
function recordEdge(before, after, choice, prefix) {
  const key = before.nodeId + '/' + choice.id;
  const next = after.history.at(-1).next;
  edgeCounts[key] = (edgeCounts[key] || 0) + 1;
  const old = edgeSamples[key];
  if (!edgeSamples[key] || prefix.length < edgeSamples[key].prefix.length) {
    edgeSamples[key] = {
      nodeId: before.nodeId, optionId: choice.id, label: choice.label, draft: choice.draft,
      state: clone(before.state), after: clone(after.state), inspected: clone(before.inspected),
      outcome: clone(after.outcome), next, prefix: clone(prefix),
      nextVariants: old?.nextVariants || [], variants: old?.variants || [],
    };
  }
  const sample = edgeSamples[key];
  sample.nextVariants ||= [];
  if (!sample.nextVariants.includes(next)) sample.nextVariants.push(next);
  const signature = JSON.stringify([next, after.outcome]);
  if (!sample.variants.some(variant => variant.signature === signature)) {
    sample.variants.push({ signature, next, outcome: clone(after.outcome), state: clone(before.state),
      after: clone(after.state), prefix: clone(prefix), inspected: clone(before.inspected) });
  }
}
function replay(prefix) {
  const engine = create(story);
  let view = engine.start();
  for (const step of prefix) {
    assert.equal(view.nodeId, step.nodeId, '采样前缀必须可重放');
    for (const id of step.inspected || []) engine.inspect(id);
    engine.choose(step.optionId);
    view = engine.advance();
  }
  return engine;
}
function doInspections(engine, view, run) {
  for (const item of view.node.inspect) {
    // All / none / mixed clue use exercises both locked and unlocked states.
    if (run % 3 === 1 || (run % 3 === 2 && random() < 0.5)) continue;
    const before = engine.view();
    const first = engine.inspect(item.id);
    const second = engine.inspect(item.id);
    stateChecks(first.view, minutes(before.state.time));
    assert.deepEqual(second.view.state, first.view.state, '重复查看线索不能重复改变状态');
    assert.deepEqual(second.view.inspected, first.view.inspected, '线索只记录一次');
    assert.equal(first.view.nodeId, before.nodeId, '查看物件不能自动跳场景');
    assert.equal(first.view.phase, 'choice', '查看物件后应继续等待玩家选择');
    assert.ok(first.text, '每个线索必须提供可阅读的信息');
    inspectedCount++;
    const unlocked = first.view.choices.filter(c => c.enabled && !before.choices.find(old => old.id === c.id).enabled);
    unlockedByInspection += unlocked.length;
    inspectSamples[view.nodeId + '/' + item.id] ||= {
      nodeId: view.nodeId, id: item.id, text: clone(first.text),
      before: clone(before.state), after: clone(first.view.state), unlocked: unlocked.map(c => c.id),
    };
  }
  return engine.view();
}
function pick(view) {
  const options = view.choices.filter(c => c.enabled);
  assert.ok(options.length, '决策节点必须有可用选项');
  const unseen = options.filter(c => !edgeSamples[view.nodeId + '/' + c.id]);
  if (unseen.length) return unseen[Math.floor(random() * unseen.length)];
  // Weighted random keeps less-frequent state combinations in the sample.
  const weights = options.map(c => 1 / Math.sqrt(edgeCounts[view.nodeId + '/' + c.id] || 1));
  let ticket = random() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < options.length; i++) { ticket -= weights[i]; if (ticket <= 0) return options[i]; }
  return options.at(-1);
}
function runOne(run) {
  const engine = create(story);
  let view = engine.start();
  let lastTime = 0;
  const prefix = [];
  while (view.phase !== 'ending') {
    assert.ok(prefix.length < 30, '检测到循环或过长单轮');
    lastTime = stateChecks(view, lastTime);
    assert.equal(view.phase, 'choice', '只有玩家提交后才能离开 choice');
    assert.ok(view.node.lines.length >= 1 && view.node.lines.length <= 3, `${view.nodeId} 应在 1—3 句后暂停`);
    assert.ok(view.node.prompt, '每个节点必须提出玩家要决定的问题');
    recordNode(view, prefix);
    const unchanged = engine.view();
    assert.throws(() => engine.advance(), /没有待继续/, '未选择时不能跳过');
    assert.deepEqual(engine.view(), unchanged, '查看或非法前进不能改变剧情');
    const leaked = engine.view();
    leaked.state.boxOwner = 'invalid';
    assert.notEqual(engine.view().state.boxOwner, 'invalid', 'view 不得泄露可写状态引用');
    view = doInspections(engine, view, run);
    for (const locked of view.choices.filter(c => !c.enabled)) {
      const snap = engine.view();
      assert.throws(() => engine.choose(locked.id), '条件未满足时不能提交');
      assert.deepEqual(engine.view(), snap, '被锁定的选项不产生副作用');
      lockedAttempts++;
    }
    const option = pick(view);
    modeCounts[view.node.mode] = (modeCounts[view.node.mode] || 0) + 1;
    if (view.node.mode === 'message') assert.ok(option.draft, '消息互动应有实际发送草稿');
    const before = view;
    const after = engine.choose(option.id);
    if (before.nodeId === 'C2_ROUTE' && option.id === 'C' && !before.state.aKnowsFood) {
      assert.equal(after.state.aKnowsFood, false, '提出假设的前台方案不能自动获知 B 确实带了饭');
    }
    assert.equal(after.nodeId, before.nodeId, '选择后先停在本节点展示后果');
    assert.equal(after.phase, 'outcome', '选择必须进入独立后果阶段');
    assert.equal(after.history.length, before.history.length + 1, '一次提交只写一次历史');
    assert.ok(after.outcome.length, '每个选项都要有自己的剧情后果');
    assert.ok(after.outcome.every(line => line.text), '后果不能是空行');
    lastTime = stateChecks(after, lastTime);
    assert.throws(() => engine.choose(option.id), /已经提交/, '不能重复提交同一选择');
    if (before.node.inspect.length) assert.throws(() => engine.inspect(before.node.inspect[0].id), /可以行动/, '后果阶段不能修改已提交的知识');
    assert.deepEqual(engine.view(), after, '被拒绝的重复提交不应改状态');
    recordEdge(before, after, option, prefix);
    prefix.push({ nodeId: before.nodeId, optionId: option.id, inspected: clone(before.inspected) });
    view = engine.advance();
  }
  stateChecks(view, lastTime);
  recordNode(view, prefix);
  terminalSamples[view.nodeId] ||= { state: clone(view.state), summary: clone(view.summary), prefix: clone(prefix), lines: clone(view.node.lines) };
  assert.ok(prefix.length >= 12, '每轮至少有 12 次真实决定');
  assert.ok(prefix.length <= 16, '前三章单轮最多 16 次决定');
  lengths.push(prefix.length);
  const routeNodes = { meet: ['M1', 'M2'], voice: ['V1', 'V2'], desk: ['F1', 'F2'] };
  const visited = new Set(prefix.map(step => step.nodeId));
  const enteredRoutes = Object.entries(routeNodes).filter(([, ids]) => ids.some(id => visited.has(id)));
  assert.equal(enteredRoutes.length, 1, '同轮只能进入一条专属中段路线');
  assert.equal(enteredRoutes[0][0], view.state.route, '记录的路线必须与实际场景相同');
  assert.ok(enteredRoutes[0][1].every(id => visited.has(id)), '每条中段路线必须经历两个独立节点');
  routeCounts[view.state.route] = (routeCounts[view.state.route] || 0) + 1;
  if (view.nodeId === 'E_LEFT_BOX') assert.ok(view.state.departed && view.state.boxOwner === 'B');
  if (view.nodeId === 'E_LEFT_DELIVERED') assert.ok(view.state.departed && view.state.boxOwner !== 'B');
  if (view.nodeId === 'E_WAIT_UNCONFIRMED') assert.ok(!view.state.departed && !view.state.waitAcknowledged);
  if (view.nodeId === 'E_MEET_WAIT') assert.equal(view.state.route, 'meet');
  if (view.nodeId === 'E_VOICE_WAIT') assert.equal(view.state.route, 'voice');
  if (view.nodeId === 'E_DESK_WAIT') assert.equal(view.state.route, 'desk');
  paths.push({ ending: view.nodeId, decisions: prefix.length, prefix: clone(prefix) });
  if (run < 40) {
    const history = clone(view.history);
    const candidates = [...new Set([0, Math.floor(history.length / 2), history.length - 1])];
    for (const index of candidates) {
      const replayEngine = replay(prefix);
      const rewound = replayEngine.rewind(index);
      assert.equal(rewound.nodeId, history[index].nodeId);
      assert.equal(rewound.phase, 'choice');
      assert.deepEqual(rewound.state, history[index].before, '回退必须逐字段恢复，未来信息与物品不能残留');
      assert.deepEqual(rewound.inspected, history[index].inspected);
      assert.equal(rewound.history.length, index, '回退清除当前决定和全部未来历史');
      assert.deepEqual(rewound.outcome, []);
      const alternatives = rewound.choices.filter(c => c.enabled && c.id !== history[index].optionId);
      if (alternatives.length) {
        const after = replayEngine.choose(alternatives[0].id);
        assert.equal(after.history.length, index + 1);
        assert.deepEqual(after.history[index].before, history[index].before);
        stateChecks(after, minutes(history[index].before.time));
      }
      rewindChecks++;
    }
    assert.deepEqual(engine.restart(), create(story).start(), '重开不能保留未来选择、物品或知识');
  }
}

assert.ok(decisionEntries.length >= 18 && decisionEntries.length <= 24, '总决策节点应为 18—24');
assert.ok(terminalEntries.length >= 5 && terminalEntries.length <= 8, '总阶段结局应为 5—8');
for (const [id, node] of nodeEntries) {
  assert.equal(node.id, id, '节点键与 id 必须一致');
  if (node.terminal) continue;
  assert.equal(node.choices.length, 3, `${id} 应有 3 个具体选项`);
  assert.equal(new Set(node.choices.map(c => c.id)).size, node.choices.length, '选项 ID 不可重复');
  for (const choice of node.choices) assert.ok(choice.outcome && choice.next, `${id}/${choice.id} 缺后果或走向`);
}

for (runs = 0; runs < 1800; runs++) {
  runOne(runs);
  const complete = Object.keys(nodeSamples).length === nodeEntries.length && Object.keys(edgeSamples).length === expectedEdges.size;
  if (runs >= 239 && complete) { runs++; break; }
}

const missingNodes = nodeEntries.map(([id]) => id).filter(id => !nodeSamples[id]);
const missingEdges = [...expectedEdges].filter(id => !edgeSamples[id]);
// Save useful diagnostics even if a coverage assertion fails.
const stats = {
  runs, totalNodes: nodeEntries.length, decisionNodes: decisionEntries.length, terminalNodes: terminalEntries.length,
  reachableNodes: Object.keys(nodeSamples).length, totalOptions: expectedEdges.size, coveredOptions: Object.keys(edgeSamples).length,
  minDecisions: Math.min(...lengths), maxDecisions: Math.max(...lengths),
  decisionDistribution: lengths.reduce((out, n) => (out[n] = (out[n] || 0) + 1, out), {}),
  terminalIds: Object.keys(terminalSamples), routeCounts, modeCounts, inspectedCount, inspectedProps: Object.keys(inspectSamples).length,
  lockedAttempts, unlockedByInspection, rewindChecks, missingNodes, missingEdges,
};
fs.mkdirSync(path.dirname(coveragePath), { recursive: true });
fs.writeFileSync(coveragePath, JSON.stringify({ generatedAt: new Date().toISOString(), stats, nodes: nodeSamples, options: edgeSamples, terminals: terminalSamples, inspections: inspectSamples, paths }, null, 2) + '\n');
assert.deepEqual(missingNodes, [], '每个决策与终点都应可达');
assert.deepEqual(missingEdges, [], '每个选项都应有成功执行的覆盖');
assert.ok(lengths.filter(n => n >= 14 && n <= 16).length > lengths.length / 2, '大多数单轮应有 14—16 次决定');
assert.ok(Object.keys(inspectSamples).length >= 3, '至少三个可选物件提供额外信息');
assert.ok(lockedAttempts > 0 && unlockedByInspection > 0, '线索必须实际影响可选条件');
const actualEndings = new Set(Object.values(terminalSamples).map(s => JSON.stringify([s.summary.text, s.summary.facts])));
assert.equal(actualEndings.size, terminalEntries.length, '阶段结局需要不同事实与后果，不能只换标题');
console.log(JSON.stringify(stats, null, 2));
console.log('PASS: immediate decisions, consequences, conditions, state isolation, rewind, chronology, unique box, and all-option coverage.');
console.log('Coverage data: ' + coveragePath);
