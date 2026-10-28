/* 剧情状态机：所有选择先展示真实后果，再进入下一节点。 */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.LoveEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const copy = value => JSON.parse(JSON.stringify(value));
  function create(story) {
    let state, nodeId, phase, history, inspected, pending;
    const getNode = () => story.nodes[nodeId];
    const resolve = value => typeof value === 'function' ? value(copy(state), copy(history)) : value;
    const patch = effects => {
      const changes = resolve(effects);
      if (changes) state = Object.assign({}, state, copy(changes));
    };
    function enter(id) {
      if (!story.nodes[id]) throw new Error('剧情节点不存在：' + id);
      nodeId = id;
      const node = getNode();
      patch(node.enter);
      const time = resolve(node.time);
      if (time) state.time = time;
      inspected = [];
      pending = null;
      phase = node.terminal ? 'ending' : node.next ? 'interlude' : 'choice';
      if (!node.terminal && !node.next && !(node.choices || []).some(op => op.available === undefined || resolve(op.available))) {
        throw new Error('节点没有可用选择：' + id);
      }
    }
    function view() {
      const node = getNode();
      return {
        phase, nodeId, state: copy(state), history: copy(history), inspected: inspected.slice(),
        node: {
          id: nodeId, chapter: node.chapter, role: node.role, player: node.player || node.role,
          title: resolve(node.title), time: resolve(node.time) || state.time, bg: resolve(node.bg) || 'city',
          actors: resolve(node.actors), lines: resolve(node.lines) || [], mode: node.mode || 'action',
          prompt: resolve(node.prompt) || '', terminal: !!node.terminal,
          inspect: (node.inspect || []).map(item => ({ id: item.id, label: resolve(item.label), seen: inspected.includes(item.id) })),
        },
        choices: (node.choices || []).map(op => ({
          id: op.id, label: resolve(op.label), detail: resolve(op.detail) || '', draft: resolve(op.draft) || '',
          commitLabel: resolve(op.commitLabel) || '就这样发送', previewLabel: resolve(op.previewLabel) || '消息草稿',
          enabled: op.available === undefined || !!resolve(op.available), lockedReason: resolve(op.lockedReason) || '先看看场景中的线索',
        })),
        outcome: pending ? copy(pending.outcome) : [],
        chosenLabel: pending ? pending.label : '',
        summary: phase === 'ending' ? copy(story.summary(copy(state), copy(history))) : null,
      };
    }
    function start() {
      state = copy(story.initialState); history = []; inspected = []; pending = null;
      enter(story.start); return view();
    }
    function inspect(id) {
      if (phase !== 'choice') throw new Error('请先进入可以行动的场景');
      const item = (getNode().inspect || []).find(item => item.id === id);
      if (!item) throw new Error('这件物品不在当前场景');
      const text = resolve(item.text);
      if (!inspected.includes(id)) { patch(item.effects); inspected.push(id); }
      return { id, label: resolve(item.label), text, view: view() };
    }
    function choose(id) {
      if (phase !== 'choice') throw new Error('这次选择已经提交，请先看完后果');
      const node = getNode(), op = (node.choices || []).find(op => op.id === id);
      if (!op) throw new Error('选项不存在');
      if (op.available !== undefined && !resolve(op.available)) throw new Error(resolve(op.lockedReason) || '这个选项尚未解锁');
      const before = copy(state), label = resolve(op.label);
      patch(op.effects);
      const outcome = resolve(op.outcome) || [];
      const next = resolve(op.next);
      if (!story.nodes[next]) { state = before; throw new Error('下一段剧情不存在：' + next); }
      if (!outcome.length) { state = before; throw new Error('该选择缺少后续反馈'); }
      history.push({ nodeId, optionId: id, chapter: node.chapter, title: resolve(node.title), label,
        outcome: copy(outcome), before, after: copy(state), inspected: inspected.slice(), next });
      pending = { outcome, next, label }; phase = 'outcome';
      return view();
    }
    function advance() {
      if (phase === 'interlude') { enter(resolve(getNode().next)); return view(); }
      if (phase !== 'outcome') throw new Error('当前没有待继续的选择后果');
      enter(pending.next); return view();
    }
    function rewind(index) {
      if (!Number.isInteger(index) || index < 0 || index >= history.length) throw new Error('无法返回该决定');
      const entry = history[index];
      state = copy(entry.before); nodeId = entry.nodeId; inspected = entry.inspected.slice();
      history = history.slice(0, index); pending = null; phase = 'choice';
      return view();
    }
    return { start, restart: start, inspect, choose, advance, rewind, view };
  }
  return { create };
});
