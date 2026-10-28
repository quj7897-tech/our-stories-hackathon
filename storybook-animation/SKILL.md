---
name: storybook-animation
description: 把手绘水彩/蜡笔绘本风（奶油纸底、歪扭深棕描线、软水彩色块、颗粒渐晕）应用到网页动画场景，并用无头浏览器逐帧截图导出 MP4。当需要把扁平 CSS/HTML 场景改成绘本插画风、需要统一的「手绘线 + 纸质感」UI 卡面、或需要把网页动画录成视频时，应使用本技能。
agent_created: true
---

# Storybook Animation（绘本风网页动画）

## Overview

把「扁平矢量感」的网页动画改造为「手绘水彩/蜡笔绘本」风格：奶油纸底 + 歪扭描线 + 软水彩色块 + 纸张颗粒 + 渐晕；并提供从改造到导出 MP4 的完整流程（无头浏览器逐帧截图 + ffmpeg 合成）。

## 适用场景

- 用户要求某一幕/页面「更像插画 / 更有手绘感 / 更有绘本感」
- 需要把配色、描线、边框、卡片统一到故事书质感
- 需要给已有网页动画加纸质感（颗粒、渐晕、柔光）
- 需要把网页动画导出成 MP4 视频
- 用户给的参考图是水彩、蜡笔、彩铅、儿童绘本插画类

## 工作流

### 1. 加手绘抖动描线（最关键的一步）

在 HTML 里放隐藏 SVG 滤镜定义（见 `references/style-guide.md` 第 2 节），给场景元素加 `filter: url(#wobble)`（大抖动，家具/边框/色块）或 `url(#wobble2)`（小抖动，装饰图形）。

抖动能把「干净的矢量矩形」变成「手画出来的形状」。**含正文的容器不要加抖动**（文字会变形），改用不规则 border-radius 模拟手绘卡片。

### 2. 铺纸感覆盖层

在舞台层加两个 `pointer-events:none` 覆盖层：`.grain`（feTurbulence 噪点 data-uri + `mix-blend-mode:multiply`）与 `.vignette`（中心透明的径向渐变）。

两者 z-index 置于背景与角色之上、字幕之下（约 8），让角色也吃到颗粒，画面才统一。

### 3. 重画场景元素

按参考图重做背景而非微调颜色。手绘元素通用配方：水彩色块 + 深棕描线 + 错位圆角；色块用 `blur(9~16px)` 或低透明度做柔和边缘。

### 4. 统一 UI 卡面

字幕框、对话气泡、场号牌统一为：纸白底 `#fffdf6` + 2.5px 深棕描线 `#6b5f52` + 错位圆角 + 偏移硬投影。直接复制 `assets/storybook-base.css`。

### 5. 导出视频（可选）

给播放器加渲染模式（`?render=1&scene=N`，由外部逐帧驱动而非真实时钟）→ `scripts/render_capture.mjs` 逐帧截图 → `scripts/encode_video.py` 合成 MP4。命令与踩坑见 `references/render-pipeline.md`。

## 关键约束

- 逐帧截图比实时慢约 3.6 倍，所有 CSS 装饰动画必须按比例放慢，否则视频里装饰会以数倍速乱飞
- 依赖真实 `setTimeout` 的切换（换场、等待）在截图模式下不推进，必须可编程驱动
- 帧目录一律用带时间戳的新目录，**不要整目录删除**（会触发批量删除保护）
- `filter: url(#wobble)` 会成为后代包含块，并可能让 `overflow:hidden` 的裁切边缘轻微溢出——这正是手绘感的来源，通常无需修

## Resources

### references/
- `style-guide.md` — 完整配色、滤镜参数、元素配方、常见坑
- `render-pipeline.md` — 渲染模式改造、截图命令、编码命令、验证方法

### assets/
- `storybook-base.css` — 可直接粘贴的绘本风基础样式（滤镜、颗粒、渐晕、卡片、色块）

### scripts/
- `render_capture.mjs` — 无头 Edge 逐帧截图器
- `encode_video.py` — 帧序列合成 MP4
