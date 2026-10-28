# Love：前两幕 Godot 合并层

来源：用户提供的 Surprise-Godot-Source.zip（Godot 4.7.2）。

## 合并范围

- 第一场地铁、第二场出租屋：Godot Compatibility/Web 单线程运行，实际绘制背景和角色。
- 采用原 Godot 项目的 subway-color-pencil-v2.png、office-night-crayon.png，并沿用等比取景与82%背景地面定位。
- 使用 Love 当前32张动作帧，不替换为另一项目经过校准的角色帧，避免覆盖已确认的动作。
- 网页剧情时钟、角色动作/位移、字幕、对话框、思想气泡、道具、回忆动画、选择与控制继续由现有 app.js、story.js 和 style.css 管理。
- godot-bridge.js 将实际布局位置和当前动作帧传给引擎绘制，避免两套计时器产生不同步。
- 序章及第三场之后保留原网页渲染。按章节索引1、2启用，不因其他场景也使用地铁背景而扩大范围。
- WebGL或引擎加载失败时保留原网页画面，不隐藏现有字幕和操作。

## 构建

Godot 4.7.2，安装对应的官方 Web 单线程导出模板。将 export_presets.cfg 的 custom_template/release 改成模板的本地绝对路径，运行：

```
godot --headless --path . --editor --import
godot --headless --path . --export-release Web
node compress-web.cjs
```

导出至 ../dist/godot/。压缩步骤将官方引擎压缩到约10MB，网页内置加载器在浏览器中自动解压，无外部CDN依赖。不将编辑器、模板下载缓存或另一项目的历史构建记录放入网站。

Godot MIT 许可随工程提供；背景、角色为用户提供素材。
