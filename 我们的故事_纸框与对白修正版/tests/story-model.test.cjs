const { test } = require('node:test');
const assert = require('node:assert/strict');
const { publishStory, loadState, saveState, emptyState } = require('../dist/story-model.js');

const draft = { title: '我们的第一天', summary: '一次普通又特别的相遇。', content: '那天下午，我们在车站见面。', cover: 'train' };
test('publishing requires a title, introduction and complete story', () => {
  for (const key of ['title', 'summary', 'content']) assert.throws(() => publishStory({ ...draft, [key]: '  ' }, [], { id: 'one', now: '2026-10-25T09:00:00Z' }));
});
test('publishing preserves script content and replaces the same story instead of duplicating it', () => {
  const first = publishStory(draft, [], { id: 'one', now: '2026-10-25T09:00:00Z' });
  const updated = publishStory({ ...draft, content: '<script>test</script>\n第二幕' }, first, { id: 'one', now: '2026-10-25T10:00:00Z' });
  assert.equal(updated.length, 1);
  assert.equal(updated[0].content, '<script>test</script>\n第二幕');
  assert.equal(updated[0].status, 'published');
});
test('saved stories and drafts survive a fresh storage load', () => {
  const data = new Map();
  const storage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
  const state = { ...emptyState(), draft, stories: publishStory(draft, [], { id: 'one', now: '2026-10-25T09:00:00Z' }) };
  saveState(storage, state);
  assert.deepEqual(loadState(storage), state);
});
test('storage failure is reported and corrupt data is not overwritten while loading', () => {
  assert.throws(() => saveState({ setItem: () => { throw new Error('quota'); } }, emptyState()), /保存失败/);
  assert.throws(() => loadState({ getItem: () => '{broken' }), /无法读取/);
});
test('publishing rejects unsupported covers and oversized story inputs', () => {
  assert.throws(() => publishStory({ ...draft, cover: 'javascript:alert(1)' }, [], { id: 'one', now: 'now' }));
  assert.throws(() => publishStory({ ...draft, title: '字'.repeat(41) }, [], { id: 'one', now: 'now' }));
});
