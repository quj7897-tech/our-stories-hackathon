# Love 角色渲染层

Godot 4.7.2 Compatibility/Web单线程实际绘制地铁和深夜场景中的角色。网页cinema.js是帧、位置、朝向和时钟的唯一来源；engine.js是剧情事实的唯一来源。

背景及其动态元素留在网页中，Godot画布、视口和网页壳透明。字幕、气泡、道具、选择和控制照常工作。以人物中心为原点的Transform2D执行镜像，保持与网页矩形一致，避免负宽度带来的偏移。

每次装载演出增加版本号，收到对应首次绘制回执后再隐藏网页角色。引擎加载失败时保留网页画面。

网页运行不需要编辑器。重建时在项目根目录运行：

```text
powershell -File tools/build-web.ps1 -Editor GODOT_EDITOR_PATH -WebTemplate GODOT_WEB_TEMPLATE_PATH
```

编辑器与Web单线程模板使用官方4.7.2版本。脚本会导入、导出、压缩官方WASM并设置透明网页壳，最后恢复模板配置中的空路径。网站无外部CDN依赖。

镜像几何测试命令：编辑器 `--headless --path godot --script ../tests/stage-test.gd`。

MIT许可见Godot-LICENSE.txt。背景与角色沿用已提供素材。
