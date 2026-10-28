/* 把互动状态映射到原版演出指令；不修改剧情状态，也不替玩家作选择。 */
(function (root) {
  'use strict';
  const N = (s, d) => ({ t: 'nar', s, d });
  const S = (who, s, d) => ({ t: 'say', who, s, d });
  const P = (id, f) => ({ t: 'pose', id, f, d: .2 });
  const MV = (id, x, dur) => ({ t: 'move', id, x, dur });
  const FX = (k, v) => ({ t: 'fx', k, v, d: .22 });
  const MSG = (who, s) => ({ t: 'phone', side: who === 'A' ? 'him' : 'me', s });
  const TH = (who, s, d) => ({ t: 'think', who, s, d });
  const BGX = v => ({ t: 'bgx', v, d: .65 });
  const badge = (title, time) => ({ t: 'badge', title, time, d: .1 });
  const clone = value => JSON.parse(JSON.stringify(value));
  const duration = s => Math.min(5.6, Math.max(2.25, 1.15 + String(s).length * .064));
  const actor = (id, x, f, size, flip, props) => ({ id, char: id === 'A' ? 'boy' : 'girl', x, f, size, flip: !!flip, props: props || [] });
  const pair = type => type === 'split'
    ? [actor('B', 24, 0, 36, false, ['phone', 'faceglow']), actor('A', 78, 1, 36, true, ['phone'])]
    : type === 'call'
      ? [actor('B', 30, 10, 40, false, ['phone']), actor('A', 70, 8, 40, true, ['phone'])]
      : [actor('B', 35, 0, 42), actor('A', 65, 3, 42, true)];
  function actorsFor(v) {
    const node = v.node, bg = node.bg;
    if (node.role === 'AB') return pair('meet');
    if (bg === 'split' || bg === 'call') return pair(bg);
    if (bg === 'subway' || bg === 'subway2') return [actor('B', 62, 0, 44)];
    if (node.player === 'A' || node.role === 'A') return [actor('A', bg === 'meeting' ? 38 : 50, bg === 'meeting' ? 8 : 1, 44, false, node.mode === 'message' ? ['phone'] : [])];
    return [actor('B', bg === 'street' ? 35 : bg === 'lobby' ? 46 : 50, 0, 42, false, node.mode === 'message' ? ['phone', 'faceglow'] : [])];
  }
  function baseScene(v, suffix) {
    return { id: v.nodeId + (suffix || ''), title: v.node.title, time: v.state.time || v.node.time,
      bg: v.node.bg, actors: actorsFor(v), beats: [], state: clone(v.state) };
  }
  function lineBeat(line, thought) {
    if (typeof line === 'string') return N(line, duration(line));
    if (thought && (line.who === 'A' || line.who === 'B')) return TH(line.who, line.text, duration(line.text));
    return line.who === 'A' || line.who === 'B' ? S(line.who, line.text, duration(line.text)) : N(line.text, duration(line.text));
  }
  function prologue() {
    return {
      id: 'prologue', title: '序 · 从校园到城市', time: '一年前 → 现在', bg: 'campus',
      actors: [actor('B', 38, 2, 40), actor('A', 62, 2, 42, true)],
      beats: [N('一年前，他们开始恋爱。', 2.1), P('B', 14), P('A', 14), { t: 'wait', d: .4 },
        BGX('city'), MV('B', 30, 1.05), MV('A', 70, 1.05), P('B', 1), P('A', 3),
        N('毕业后，两个人开始学着做一个“上班的人”。', 2.6),
        N('不知不觉，他们之间的话越来越少了。今天，B 想主动靠近一点。', 3.15)]
    };
  }
  function intro(v) {
    const scene = baseScene(v), id = v.nodeId, lines = v.node.lines || [], beats = scene.beats;
    if (id === 'C2_WORK') {
      // 只改变演出的场景与角标；游戏的事实时间仍是本次联络后的中午。
      scene.bg = 'night'; scene.actors = [actor('A', 50, 3, 46)];
      scene.title = '回想 · 前一晚的出租屋'; scene.time = '前一晚 · 凌晨';
      beats.push(N('前一晚，A 在出租屋修改报告，直到凌晨两点才睡。', 3.3), P('A', 1),
        FX('chat', 'night'), { t: 'wait', d: 1.25 }, FX('chat', 'off'), P('A', 3),
        BGX('office'), badge(v.node.title, v.state.time || v.node.time));
    }
    if (id === 'C1_TRAVEL') beats.push(MV('B', 50, 1.8));
    if (id === 'M1') { scene.actors[1].x = 79; beats.push(MV('A', 65, 1.35), P('A', 0)); }
    if (id === 'F1' || id === 'C3_BOX') { scene.actors[0].x = 35; beats.push(MV('B', 46, 1.1)); }
    if (id === 'V1' || id === 'V2') beats.push(FX('ring', 'on'));
    if (id.startsWith('C3_') || v.node.terminal) beats.push(FX('clock', v.state.time || v.node.time));
    if (id === 'P2') beats.push(FX('dish', 'on'));
    lines.forEach((line, index) => {
      if (id === 'P2' && index === 1) beats.push(FX('dish', 'off'));
      if (id === 'C1_TRAVEL' && index === 1) beats.push(FX('chat', 'on'));
      beats.push(lineBeat(line, ['P2', 'C1_SILENCE', 'V1'].includes(id)));
    });
    if (id === 'P2') beats.push(FX('dish', 'off'));
    if (id === 'C1_TRAVEL') beats.push(FX('chat', 'off'));
    if (id === 'V1' || id === 'V2') beats.push(FX('ring', 'off'));
    return scene;
  }
  function selectedOption(v, entry) {
    const story = typeof LOVE_STORY !== 'undefined' ? LOVE_STORY : root.LOVE_STORY;
    const op = story && story.nodes[entry.nodeId] && story.nodes[entry.nodeId].choices.find(item => item.id === entry.optionId);
    if (!op) return null;
    const resolve = value => typeof value === 'function' ? value(clone(entry.before), clone(v.history.slice(0, -1))) : value;
    return { draft: resolve(op.draft) || '', commitLabel: resolve(op.commitLabel) || '', previewLabel: resolve(op.previewLabel) || '' };
  }
  function cleanedDraft(text) { return String(text).replace(/^【[^】]*】\s*/, ''); }
  function sentQuote(line) {
    if (!line || typeof line !== 'object' || !/^你发(?:出|给)/.test(line.text)) return null;
    const match = line.text.match(/[“「]([\s\S]*)[”」]/);
    return match ? match[1] : null;
  }
  function outcome(v) {
    const scene = baseScene(v, '-outcome'), beats = scene.beats;
    const entry = v.history[v.history.length - 1];
    if (!entry || !v.outcome) return scene;
    const id = entry.nodeId, choice = entry.optionId, op = selectedOption(v, entry);
    const who = v.node.player === 'A' || v.node.role === 'A' ? 'A' : 'B';
    const draft = op && op.draft;
    const isCall = (id === 'C1_CONTACT' && choice === 'B') || (id === 'C1_SILENCE' && choice === 'C') || (id === 'C3_UPDATE' && choice === 'C');
    const isSpoken = id === 'M1' || id === 'V1' || id === 'V2';
    const isSilent = (id === 'C1_TRAVEL' && choice === 'C') || (id === 'C3_ACK' && choice === 'C');
    const delayedSend = id === 'C1_SILENCE' && choice === 'B';
    const sentPhoto = id === 'C1_TRAVEL' && choice === 'B';
    if (isCall || id === 'V1' || id === 'V2') {
      scene.bg = 'call'; scene.actors = pair('call'); beats.push(FX('ring', 'on'));
    }
    if (id === 'P1' && choice === 'B') beats.push(FX('door', 'on'));
    if ((id === 'P2' && choice === 'B') || sentPhoto) beats.push(FX('dish', 'on'));
    if (id === 'M1') beats.push(P('A', choice === 'A' ? 14 : choice === 'B' ? 3 : 0));
    if (id === 'M2' && choice !== 'C') beats.push(MV('B', 41, .8), P('B', 8), P('A', 0));
    if (draft && !isSilent && !delayedSend) {
      if (isCall || isSpoken) beats.push(S(who, cleanedDraft(draft), duration(cleanedDraft(draft))));
      else beats.push(MSG(who, draft.startsWith('【发送语音】') ? '〔语音〕' + cleanedDraft(draft) : sentPhoto ? '〔饭盒照片〕' + cleanedDraft(draft) : draft));
    }
    for (const line of v.outcome) {
      const quote = sentQuote(line);
      if (quote && !draft) beats.push(MSG(line.who === 'A' ? 'A' : 'B', quote));
      else if (id === 'C2_ROUTE' && line.who === 'A') beats.push(MSG('A', line.text.replace(/^[“「]|[”」]$/g, '')));
      else if (id === 'P2' && choice === 'A' && line.who === 'B') beats.push(N(line.text, duration(line.text)));
      else beats.push(lineBeat(line, false));
    }
    if (delayedSend) beats.push(FX('clock', '12:15'), MSG('B', '我到了，在你公司对面的便利店。'));
    if (id === 'P1' && choice === 'B') beats.push(FX('door', 'off'));
    if ((id === 'P2' && choice === 'B') || sentPhoto) beats.push(FX('dish', 'off'));
    if (id === 'M2') beats.push(P('B', 0), MV('A', 75, 1.2));
    if (id === 'C3_WAIT') {
      const dest = v.state.waitActivity === 'eat' ? 'cafe' : 'lobby';
      beats.push(FX('phone', 'off'), BGX(dest), MV('B', v.state.waitActivity === 'quiet' ? 35 : 50, 1.2));
    }
    if ((id === 'C3_LEAVE' && v.state.departed) || id === 'C3_BOX') {
      beats.push(FX('phone', 'off'), BGX('street'), MV('B', 70, 1.65));
    }
    if (isCall || id === 'V1' || id === 'V2') beats.push(FX('ring', 'off'));
    // 已发送内容留在手机浮层供观看；不会把尚未选中的草稿展示为消息。
    return scene;
  }
  root.LoveScenes = { prologue, intro, outcome };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.LoveScenes;
})(typeof window !== 'undefined' ? window : globalThis);
