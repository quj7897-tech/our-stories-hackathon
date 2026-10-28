const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const dist=path.join(__dirname,'../dist');
test('首页保留原主按钮文案与去向，游戏从案例卡片进入',()=>{
  const html=fs.readFileSync(path.join(dist,'index.html'),'utf8');
  assert.ok(html.includes('我们的故事'),'首页应使用提供的故事站格式');
  assert.match(html, /class="paper-button primary" href="#my-stories">看看我们的故事/);
  assert.ok(!html.includes('开始《惊喜》'),'不把主按钮改成游戏入口');
  for(const id of ['home-view','my-stories','love-shop'])assert.ok(html.includes('id="'+id+'"'));
});
test('内置故事指向完整播放器，没有用展示占位替代游戏',()=>{
  const file=path.join(dist,'portal-catalog.js');
  const game=fs.existsSync(file)?require(file).game:{};
  assert.equal(game.title,'惊喜');assert.equal(game.href,'play.html');
  const html=fs.readFileSync(path.join(dist,game.href),'utf8');
  for(const script of ['full-day.js','cinema.js','app.js'])assert.ok(html.includes('src="'+script+'"'));
  assert.ok(html.includes('id="choices"'));assert.ok(html.includes('href="index.html#stories"'));
});
test('首页脚本、样式、图片与游戏都随包提供',()=>{
  const html=fs.readFileSync(path.join(dist,'index.html'),'utf8');
  for(const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)){
    const ref=match[1];if(/^(?:data:|https?:)/.test(ref))continue;
    assert.ok(fs.existsSync(path.join(dist,ref)),ref+'必须在包内');
  }
});
