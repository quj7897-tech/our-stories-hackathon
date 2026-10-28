# 绘本风（手绘水彩 / 蜡笔）样式指南

参考原型：小红书「不不露 / MORE PARSLEY」插画 —— 奶油纸底、歪歪扭扭的深棕描线、糊成一团边界的软水彩色块、雾蒙蒙的圆角云朵、低饱和粉/绿/蓝。

## 1. 配色

| 用途 | 色值 |
|---|---|
| 纸底 / 背景 | `#f7f1e4`（默认）、`#f5e8d4`（黄昏） |
| 卡面纸白 | `#fffdf6` |
| 描线（唯一深色） | `#6b5f52` |
| 天蓝（窗景/座） | `#bcdcea` `#a5cfe4` `#8fb8cd` |
| 草绿 | `#8fbf92` `#9dbf9a` `#148,178,142` |
| 雾粉 | `#e8a9b5` `#e3a8b0` |
| 灰紫 | `#a5a0c4` |
| 土金（扶手/吊环） | `#b9a06a` `#c9b489` `#e4d3a4` |
| 沙尘粉（夜晚/暖调） | `#d9b380` |
| 水彩雾（大色块） | `#dde8d3` `#dde8ee`（blur 16px，opacity .55） |
| 渐晕 | `rgba(96,78,58,.15)` |

原则：**只用一条深色线**（`#6b5f52`）勾遍所有东西，其余全是中低明度、中低饱和的水彩色。不要出现纯黑、纯白、高饱和。

## 2. 手绘抖动滤镜

放在 HTML 里（`<body>` 开头，`width=0 height=0`）：

```html
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <defs>
    <filter id="wobble" x="-12%" y="-12%" width="124%" height="124%">
      <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="7" result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="4.5" />
    </filter>
    <filter id="wobble2" x="-12%" y="-12%" width="124%" height="124%">
      <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="11" result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" />
    </filter>
  </defs>
</svg>
```

- `scale` 2~5；超过 6 会明显撕裂，低于 1.5 看不出效果
- `baseFrequency` 越大抖动越碎（0.02 是「整块歪扭」，0.03+ 是「毛边」）
- 不同 `seed` 让相邻元素抖动不一致，避免「复制粘贴感」

## 3. 纸张颗粒 + 渐晕

```css
.grain {
  position: absolute; inset: 0; z-index: 8; pointer-events: none;
  opacity: .5; mix-blend-mode: multiply;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 0.45 0 0 0 0 0.4 0 0 0 0 0.32 0 0 0 0.055 0'/></filter><rect width='140' height='140' filter='url(%23n)'/></svg>");
}
.vignette {
  position: absolute; inset: 0; z-index: 8; pointer-events: none;
  background: radial-gradient(ellipse at 50% 42%, transparent 56%, rgba(96,78,58,.15) 100%);
}
```

- data-uri 里的 `#` 必须写成 `%23`
- 颗粒 opacity 0.3~0.6 之间微调；超过 0.7 画面会脏
- 两个层要压在角色之上（角色也吃颗粒才不出戏），压在字幕之下

## 4. 元素配方

### 手绘边框（窗 / 门 / 座椅 / 牌）

```css
.handrect {
  border: 3px solid #6b5f52;
  border-radius: 22px 18px 20px 16px / 18px 22px 16px 20px;  /* 斜杠两侧不同 = 错位圆角 */
  filter: url(#wobble);
}
```

四角圆角值全部错开（18/22/16/20），才不会显得是机器画的。

### 水彩云 / 远景色块

```css
.cloud {
  position: absolute; border-radius: 50%;
  background: rgba(255,255,255,.92);
  filter: blur(9px);
  animation: cloudx 42s linear infinite;
}
@keyframes cloudx { from { transform: translateX(130%); } to { transform: translateX(-280%); } }
```

用负 `animation-delay`（-14s、-27s）错开初始位置，避免云排队。

### 波点/道具/小图形：蜡笔缓动摇摆

```css
.sway { transform-origin: 50% 0; animation: strapSway 4.2s ease-in-out infinite; }
@keyframes strapSway { 0%,100% { transform: rotate(-3.5deg); } 50% { transform: rotate(3.5deg); } }
```

### 绘本小人物剪影（背景群众）

```css
.pg {
  position: absolute; width: 3.4%; height: 9%;
  border: 2.5px solid #6b5f52; border-radius: 45% 45% 30% 30%;
  background: #9dbf9a; filter: url(#wobble);
}
.pg::before {                       /* 头 */
  content: ""; position: absolute; left: 50%; top: -56%; width: 76%;
  aspect-ratio: 1; transform: translateX(-50%);
  background: inherit; border: 2.5px solid #6b5f52; border-radius: 50%;
}
```

`aspect-ratio: 1` 保证头是正圆（用百分比宽高会得到椭圆）。

### UI 卡面（字幕框 / 气泡 / 场号牌）

```css
.card {
  background: #fffdf6;
  border: 2.5px solid #6b5f52;
  border-radius: 20px 16px 18px 15px / 15px 18px 16px 20px;
  box-shadow: 4px 5px 0 rgba(107,95,82,.15);
}
```

气泡小尾巴要跟着换搬边 + 深棕描边：

```css
.bubble::after {
  content: ""; position: absolute; left: 50%; bottom: -8px;
  width: 13px; height: 13px; background: #fffdf6;
  border-right: 2.5px solid #6b5f52; border-bottom: 2.5px solid #6b5f52;
  transform: translateX(-50%) rotate(45deg);
}
```

### 角色贴图统一进画面

扁平卡通风的贴图放进水彩场景会「贴上去」，三招缓解：

```css
.actor img {
  filter: drop-shadow(0 6px 10px rgba(0,0,0,.12)) saturate(.94);
}
```

再配一圈水彩地影：`background: radial-gradient(ellipse, rgba(107,95,82,.28), transparent 70%)`。

## 5. 常见坑

- **文字不能加 wobble**：位移会让笔画断裂。用错位 border-radius 代替
- **wobble + overflow:hidden**：滤镜在裁切之后作用，边缘会被推出框外。做窗景时这反而好看，做遮挡时会露馅
- **硬投影要小**：`3px 4px 0` 足够，传统 UI 的 `0 10px 30px` 会立刻把绘本感压扁
- **一次只改一幕**：全局换色容易让其它场景的旧色系（如深蓝夜景）突兀
- **扁平插图慎用 blur**：需要清晰轮廓的角色/图标不要加 blur，只有色块能糊
