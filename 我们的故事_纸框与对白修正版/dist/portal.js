'use strict';
const model = window.StoryModel;
const $ = selector => document.querySelector(selector);
let state = model.emptyState();
let storageHealthy = true;
try { state = model.loadState(window.localStorage); }
catch (error) { storageHealthy = false; $('#storage-error').hidden = false; $('#storage-error').textContent = error.message; }
let uploadedCover = null;
let previewDraft = null;
let returnFocus = null;
const placeholders = [
  { id: 'slot-one', title: '第一篇，等你来写', summary: '一张图片，一个名字，一小段回忆。这里留给你即将带来的剧本。', cover: 'train', placeholder: true },
  { id: 'slot-two', title: '把回忆留在这里', summary: '等你给我剧本，再把属于你们的标题、简介和封面放进来。', cover: 'house', placeholder: true },
  { id: 'slot-three', title: '下一页，未完待续', summary: '不必急着写完。先替下一段故事，留一个小小的位置。', cover: 'forest', placeholder: true }
];
function persist(next) {
  if (!storageHealthy) throw new Error('已有存储无法读取，暂时没有覆盖它。请先保留当前文字，再检查浏览器设置。');
  model.saveState(window.localStorage, next);
  state = next;
}
function coverElement(element, cover) {
  element.className = 'photo';
  element.style.backgroundImage = '';
  if (cover.startsWith('data:')) { element.style.backgroundImage = `url("${cover}")`; element.classList.add('photo-upload'); }
  else element.classList.add(`photo-${cover}`);
}
function makeCard(story) {
  const card = $('#story-card-template').content.firstElementChild.cloneNode(true);
  card.querySelector('.card-title').textContent = story.title;
  card.querySelector('.card-description').textContent = story.summary;
  const cover = card.querySelector('.photo');
  coverElement(cover, story.cover);
  cover.setAttribute('aria-label', `${story.title}的封面`);
  card.querySelector('.story-card-state').textContent = story.playable ? '互动游戏 · 完整一天' : story.placeholder ? '待添加剧本' : '已发布 · 本机';
  if(story.playable){cover.style.backgroundImage='url('+story.coverImage+')';cover.classList.add('photo-upload');}
  card.querySelectorAll('button').forEach(button => { button.setAttribute('aria-label', story.playable ? '开始游玩《惊喜》' : `查看${story.title}`); button.addEventListener('click', () => story.playable ? location.assign(story.href) : openStory(story, button)); });
  return card;
}
function renderStories() {
  const query = $('#story-search').value.trim().toLowerCase();
  const all = [window.StoryCatalog.game, ...state.stories, ...placeholders.slice(Math.min(state.stories.length + 1, 3))];
  const visible = all.filter(story => `${story.title} ${story.summary}`.toLowerCase().includes(query));
  $('#published-grid').replaceChildren(...visible.map(makeCard));
  const storyCount = visible.filter(story => !story.placeholder).length;
  const emptyCount = visible.length - storyCount;
  $('#result-status').textContent = `找到 ${storyCount} 篇故事` + (emptyCount ? `，另有 ${emptyCount} 个待添加位置` : '');
  $('#search-empty').hidden = visible.length !== 0;
  $('#placeholder-note').hidden = state.stories.length >= 2;
  $('#story-count').textContent = state.stories.length + 1;
  const list = $('#my-story-list');
  list.replaceChildren();
  if (!state.stories.length) { const empty = document.createElement('p'); empty.className = 'shelf-empty'; empty.textContent = '《惊喜》已可直接体验。你写下的文字故事也会保存在这里，点击预览和保存，就能加入自己的故事架。'; list.append(empty); }
  const gameItem=document.createElement('div');gameItem.className='shelf-item';
  const gameLink=document.createElement('a');gameLink.className='shelf-story-title';gameLink.href='play.html';gameLink.textContent='惊喜 · 开始游玩 →';gameItem.append(gameLink);list.prepend(gameItem);
  state.stories.forEach(story => {
    const item = document.createElement('div'); item.className = 'shelf-item';
    const title = document.createElement('button'); title.className = 'shelf-story-title'; title.textContent = story.title; title.addEventListener('click', () => openStory(story, title));
    const status = document.createElement('span'); status.textContent = '已发布 · 本机';
    const edit = document.createElement('button'); edit.className = 'text-link'; edit.textContent = '编辑'; edit.setAttribute('aria-label', `编辑${story.title}`); edit.addEventListener('click', () => { fillEditor(story); $('#story-title').focus(); });
    item.append(title, status, edit); list.append(item);
  });
}
function currentDraft() {
  return model.normalizeDraft({ id: $('#story-id').value, title: $('#story-title').value, summary: $('#story-summary').value, content: $('#story-content').value, cover: uploadedCover || document.querySelector('[name="cover"]:checked').value });
}
function fillEditor(draft) {
  $('#story-id').value = draft.id || '';
  $('#story-title').value = draft.title || '';
  $('#story-summary').value = draft.summary || '';
  $('#story-content').value = draft.content || '';
  uploadedCover = draft.cover?.startsWith('data:') ? draft.cover : null;
  $('#uploaded-cover').hidden = !uploadedCover;
  if (uploadedCover) $('#uploaded-cover').src = uploadedCover;
  else { $('#uploaded-cover').removeAttribute('src'); document.querySelector(`[name="cover"][value="${draft.cover || 'train'}"]`).checked = true; }
  $('#draft-status').textContent = draft.id ? '正在编辑已发布故事' : '草稿已恢复';
  $('#editor-feedback').textContent = '';
}
function openDialog(title, eyebrow, trigger, isPreview = false) {
  returnFocus = trigger;
  $('#dialog-title').textContent = title;
  $('#dialog-eyebrow').textContent = eyebrow;
  $('#dialog-body').replaceChildren();
  $('#publish-feedback').textContent = '';
  $('#publish-story').hidden = !isPreview;
  $('#back-to-edit').hidden = !isPreview;
  $('.dialog-done').hidden = isPreview;
  $('#story-dialog').showModal();
  document.body.style.overflow = 'hidden';
  $('.dialog-close').focus();
}
function storyContents(story) {
  const cover = document.createElement('div'); cover.className = 'reading-cover'; const photo = document.createElement('span'); coverElement(photo, story.cover); cover.append(photo);
  const summary = document.createElement('p'); summary.className = 'reading-summary'; summary.textContent = story.summary;
  const content = document.createElement('div'); content.className = 'reading-content'; content.textContent = story.content || '这个位置还在等你的剧本。到「我的故事」粘贴正文，生成预览后就可以发布。';
  $('#dialog-body').append(cover, summary, content);
  if (story.placeholder) { const link = document.createElement('a'); link.href = '#my-stories'; link.className = 'text-link'; link.textContent = '去写我们的故事 →'; link.addEventListener('click', () => $('#story-dialog').close()); $('#dialog-body').append(link); }
}
function openStory(story, trigger) { openDialog(story.title, story.placeholder ? '留给下一段故事的位置' : '我们的故事 · 本机收藏', trigger); storyContents(story); }
$('#story-form').addEventListener('submit', event => {
  event.preventDefault();
  try {
    previewDraft = model.normalizeDraft(currentDraft(), true);
    persist({ ...state, draft: previewDraft });
    $('#draft-status').textContent = '草稿已保存在本机';
    openDialog(previewDraft.title, '故事预览 · 发布后加入本机故事架', event.submitter, true);
    storyContents(previewDraft);
  } catch (error) { $('#editor-feedback').textContent = error.message; }
});
$('#save-draft').addEventListener('click', () => {
  try { persist({ ...state, draft: currentDraft() }); $('#draft-status').textContent = '草稿已保存在本机'; $('#editor-feedback').textContent = '草稿已保存，下次在这个浏览器打开可以继续写。'; }
  catch (error) { $('#editor-feedback').textContent = error.message; }
});
$('#publish-story').addEventListener('click', () => {
  if (!previewDraft) return;
  try {
    const stories = model.publishStory(previewDraft, state.stories, { id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `story-${Date.now()}-${Math.random().toString(36).slice(2)}`, now: new Date().toISOString() });
    persist({ ...state, stories, draft: null });
    previewDraft = null;
    renderStories();
    $('#story-dialog').close();
    $('#story-form').reset(); $('#story-id').value = ''; uploadedCover = null; $('#uploaded-cover').hidden = true; $('#uploaded-cover').removeAttribute('src');
    $('#draft-status').textContent = '可以开始下一篇了';
    $('#editor-feedback').textContent = '已发布到本机故事架，刷新后仍会保留。点击「看看已有故事」就能看到。';
  } catch (error) { $('#publish-feedback').textContent = error.message; }
});
document.querySelectorAll('.dialog-close,.dialog-done').forEach(button => button.addEventListener('click', () => $('#story-dialog').close()));
$('#back-to-edit').addEventListener('click', () => $('#story-dialog').close());
$('#story-dialog').addEventListener('close', () => { document.body.style.overflow = ''; returnFocus?.focus({ preventScroll: true }); });
$('#story-dialog').addEventListener('click', event => { if (event.target !== $('#story-dialog')) return; const r = $('#story-dialog').getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) $('#story-dialog').close(); });
$('#cover-upload').addEventListener('change', async () => {
  const file = $('#cover-upload').files[0]; if (!file) return;
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 1048576) { $('#cover-help').textContent = '请选择 1MB 以内的 PNG、JPG 或 WebP 图片。'; $('#cover-upload').value = ''; return; }
  try {
    uploadedCover = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });
    $('#uploaded-cover').src = uploadedCover; $('#uploaded-cover').hidden = false; $('#cover-help').textContent = '已选择你的封面。预览并发布后会一起保存在本机。';
  } catch { $('#cover-help').textContent = '图片没有读取成功，请重新选择。'; }
});
document.querySelectorAll('[name="cover"]').forEach(input => input.addEventListener('change', () => { uploadedCover = null; $('#uploaded-cover').hidden = true; $('#uploaded-cover').removeAttribute('src'); $('#cover-upload').value = ''; $('#cover-help').textContent = '已选择内置封面。也可以上传 1MB 以内的 PNG、JPG 或 WebP 图片。'; }));
$('#export-stories').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = '我们的故事-备份.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
});
function route() {
  const hash = location.hash.slice(1);
  const view = ['my-stories', 'love-shop'].includes(hash) ? hash : 'home';
  document.querySelectorAll('[data-view]').forEach(section => { section.hidden = section.dataset.view !== view; });
  document.querySelectorAll('[data-nav]').forEach(link => { const active = link.dataset.nav === view; link.classList.toggle('active', active); if (active) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current'); });
  $('#mobile-nav').hidden = true; $('.menu-toggle').setAttribute('aria-expanded', 'false'); $('.menu-toggle').setAttribute('aria-label', '展开菜单');
  if (view !== 'home') { window.scrollTo({ top: 0, behavior: 'instant' }); document.querySelector(`#${view} h1`).focus({ preventScroll: true }); }
  else if (hash === 'stories' || hash === 'cases') requestAnimationFrame(() => $('#stories').scrollIntoView());
  else window.scrollTo({ top: 0, behavior: 'instant' });
}
window.addEventListener('hashchange', route);
$('.menu-toggle').addEventListener('click', () => { const open = $('.menu-toggle').getAttribute('aria-expanded') !== 'true'; $('.menu-toggle').setAttribute('aria-expanded', String(open)); $('.menu-toggle').setAttribute('aria-label', open ? '收起菜单' : '展开菜单'); $('#mobile-nav').hidden = !open; });
$('#mobile-nav').addEventListener('click', event => { const link = event.target.closest('a'); if (!link) return; $('#mobile-nav').hidden = true; $('.menu-toggle').setAttribute('aria-expanded', 'false'); $('.menu-toggle').setAttribute('aria-label', '展开菜单'); if (link.hash === location.hash) $('.menu-toggle').focus(); });
$('#story-search').addEventListener('input', renderStories);
function clearSearch() { $('#story-search').value = ''; renderStories(); $('#story-search').focus(); }
$('#clear-search').addEventListener('click', clearSearch); $('#reset-search').addEventListener('click', clearSearch);
$('.search-toggle').addEventListener('click', () => {
  const open = $('#archive-search').hidden;
  if (location.hash !== '#stories') location.hash = 'stories';
  $('#archive-search').hidden = !open; $('.search-toggle').setAttribute('aria-expanded', String(open));
  if (open) requestAnimationFrame(() => { $('#archive-search').scrollIntoView({ block: 'center' }); $('#story-search').focus({ preventScroll: true }); });
});
if (state.draft) fillEditor(state.draft);
renderStories(); route();
