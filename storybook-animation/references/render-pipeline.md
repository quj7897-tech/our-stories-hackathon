# 网页动画 → MP4 渲染管线

本机实测通过的流程（Windows + Edge + imageio-ffmpeg + puppeteer-core）。

## 0. 依赖准备

```bash
# puppeteer-core（协议层，不下载浏览器），在 storybook-animation 目录安装
npm install --no-save puppeteer-core --no-audit --no-fund

# ffmpeg 二进制（走 imageio-ffmpeg，免去手动安装）
python.exe -m pip install imageio-ffmpeg
python.exe -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())"
```

浏览器路径（选存在的那个）：
- `C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`
- `C:/Program Files/Google/Chrome/Application/chrome.exe`

## 1. 给播放器加渲染模式

网页动画通常由 `requestAnimationFrame` 驱动真实时钟，无法控制节奏。改造方式：

1. 把每帧逻辑抽成 `advance(dt)`，rAF 循环只负责算 dt 再调用它
2. 检测到 `?render=1` 时不启动 rAF，改为暴露 `window.__jingxiRender = { step(dt), done() }`
3. 渲染模式里关掉音效、隐藏 UI 外框（body.render 隐藏 .top/.ctrl/.bar/.chapters/.foot，舞台铺满视口）
4. 若动画里有「选择节点 / 等待用户输入」，需在 `advance()` 里加自动应答（例如停留 4 秒后自动选正史选项），否则会卡死

```js
var qs = new URLSearchParams(location.search);
var RENDER = qs.has("render");
if (RENDER) {
  document.body.classList.add("render");
  state.started = true; state.auto = false; state.paused = false; state.sound = false;
  buildScene(parseInt(qs.get("scene") || "0", 10) || 0);
  window.__jingxiRender = { step: function (dt) { advance(dt); },
                            done: function () { return state.sceneDone; } };
} else { buildScene(0); requestAnimationFrame(loop); }
```

## 2. CSS 装饰动画必须放慢

截图速度远慢于实时：实测约 **12.5 帧/秒真实速度**，而视频是 30fps —— 时基相差约 3.6 倍。所有纯 CSS 动画都要按比例加长，否则成片里云朵和装饰会飞起来。

```css
body.render .subway .drift i { animation-duration: 150s; }  /* 原 42s */
body.render .subway .strap   { animation-duration: 15s; }   /* 原 4.2s */
```

用到的截图器会打印进度，按真实耗时反推比例再微调（`实际秒数 / 视频秒数`）。

## 3. 逐帧截图

```bash
node.exe render_capture.mjs <sceneIndex> <fps>     # 例：node render_capture.mjs 1 30
```

脚本要点（`scripts/render_capture.mjs`）：

- `puppeteer.launch({ executablePath: EDGE, headless: true, args: ["--disable-gpu","--no-sandbox","--hide-scrollbars"], defaultViewport: { width: 1280, height: 720, deviceScaleFactor: 1 } })`
- `page.goto(fileUrl + "?render=1&scene=N", { waitUntil: "networkidle0" })`
- 等 `window.__jingxiRender` 就绪 + 所有演员 `<img>` `complete && naturalWidth > 0`（贴图没加载完会截到空白）
- 循环：`await page.evaluate(d => __jingxiRender.step(d), 1/fps)` → `await page.screenshot({ path, type:"jpeg", quality:90 })`
- 场景 `done()` 后再多录 1~1.5 秒收尾（`fps * 1.2`）
- 输出目录用时间戳命名，**绝不整目录删除**

按脚本所在目录解析依赖（ESM 不吃 NODE_PATH）。如浏览器不在默认位置，可通过 BROWSER_PATH 指定：

```js
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const puppeteer = require("puppeteer-core");
```

## 4. 合成 MP4

```bash
python.exe scripts/encode_video.py            # 自动找最新的帧目录
python.exe scripts/encode_video.py --frames <dir> --out 名字.mp4 --fps 30 --crf 19
```

等价于这条 ffmpeg（`-pix_fmt yuv420p` 必加，否则部分播放器播不了；`+faststart` 让视频可边下边播）：

```bash
ffmpeg -y -framerate 30 -i <frames>/f_%05d.jpg \
  -c:v libx264 -pix_fmt yuv420p -crf 19 -preset medium -movflags +faststart out.mp4
```

## 5. 验证

看不到画面时用这两招判断有没有录崩：

```python
from PIL import Image
im = Image.open(frame).convert("L").resize((64, 36))
px = list(im.getdata())
print("mean", sum(px)/len(px), "std", pstdev(px))   # 全黑=0/全白=255 都是崩了；std 太小说明没内容
```

```bash
ffmpeg -i out.mp4 2>&1 | grep -E "Duration|Stream"   # 核对时长/分辨率/编码
```

## 6. 排错清单

| 现象 | 原因 |
|---|---|
| 视频里装饰飞快 | 忘了按比例放慢 CSS 动画 |
| 卡在某一段不动 | 依赖 `setTimeout` 的换场 / 等待 / 选择节点没被驱动 |
| 前几帧空白 | 贴图未加载完就开截，需 waitForFunction 校验 img.complete |
| 帧数暴涨却不推进 | 在等真实计时器，截图脚本没有让出事件循环（需周期性 `await setTimeout`） |
| 无法播放 | 缺 `-pix_fmt yuv420p` |
| 运行即报 safe-delete 错误 | 脚本里对旧帧目录做了 rmSync，改为时间戳新目录 |
