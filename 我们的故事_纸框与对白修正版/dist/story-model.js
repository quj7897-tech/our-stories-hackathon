(function (root) {
  'use strict';
  const KEY = 'our-stories-v1';
  const covers = ['train', 'house', 'forest'];
  const emptyState = () => ({ version: 1, draft: null, stories: [] });
  function normalizeDraft(value, complete = false) {
    const draft = {
      id: typeof value?.id === 'string' ? value.id : '',
      title: String(value?.title ?? '').trim(),
      summary: String(value?.summary ?? '').trim(),
      content: String(value?.content ?? '').trim(),
      cover: String(value?.cover ?? 'train')
    };
    for (const [key, name, max] of [['title', '标题', 40], ['summary', '简介', 160], ['content', '正文', 30000]]) {
      if (complete && !draft[key]) throw new Error(`请填写故事${name}。`);
      if (draft[key].length > max) throw new Error(`故事${name}最多 ${max} 字。`);
    }
    if (!covers.includes(draft.cover) && !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(draft.cover)) throw new Error('请选择有效的故事封面。');
    if (draft.cover.length > 1500000) throw new Error('封面过大，请选择 1MB 以内的图片。');
    return draft;
  }
  function publishStory(draft, stories, options) {
    const clean = normalizeDraft(draft, true);
    const id = clean.id || options.id;
    const previous = stories.find(story => story.id === id);
    const story = { ...clean, id, status: 'published', createdAt: previous?.createdAt || options.now, updatedAt: options.now };
    return [story, ...stories.filter(item => item.id !== id)];
  }
  function loadState(storage) {
    try {
      const raw = storage.getItem(KEY);
      if (!raw) return emptyState();
      const state = JSON.parse(raw);
      if (state.version !== 1 || !Array.isArray(state.stories)) throw new Error('schema');
      state.stories.forEach(story => { normalizeDraft(story, true); if (!story.id || story.status !== 'published') throw new Error('story'); });
      if (state.draft) normalizeDraft(state.draft);
      return state;
    } catch { throw new Error('无法读取本机故事，已有数据未被覆盖。请在原浏览器打开，或检查浏览器存储设置。'); }
  }
  function saveState(storage, state) {
    try { storage.setItem(KEY, JSON.stringify(state)); }
    catch { throw new Error('保存失败：浏览器存储不可用或空间不足。文字仍在页面中，请先复制保留，或换一张更小的封面。'); }
  }
  const api = { KEY, emptyState, normalizeDraft, publishStory, loadState, saveState };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.StoryModel = api;
})(typeof window !== 'undefined' ? window : globalThis);
