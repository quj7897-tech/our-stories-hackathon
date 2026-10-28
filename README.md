# 我们的故事 · 黑客松项目

绘本风互动故事游戏《惊喜》，包含网页播放器、故事站首页、分支剧情、角色动画和 Godot 工程。当前完整版本覆盖校园序章至当天 20:00 的故事。

## 本地运行

安装 Node.js 后，在仓库根目录执行：

```sh
cd "我们的故事_纸框与对白修正版"
node server.cjs
```

浏览器打开 <http://127.0.0.1:8190>。从首页的《惊喜》卡片进入游戏，或直接访问 `/play.html`。需要保持服务运行；运行现成网页无需安装 Godot。

也可在该目录运行 `python3 server.py`，或使用已有的 Windows / macOS 启动脚本。端口被占用时以终端提示为准。

## 目录

| 目录 | 内容 |
| --- | --- |
| `我们的故事_纸框与对白修正版/` | 当前完整版本、可运行网页、Godot 源码及测试 |
| `Love_融合版_队友交接包/` | 较早的融合版本，保留用于对照 |
| `剧本一动画/` | 原始网页动画版本 |
| `storybook-animation/` | 绘本动画样式与逐帧录制、视频编码工具 |
| `reference-assets/` | 界面及角色参考图，使用通用文件名 |

版本细节与操作说明见[完整版本说明](我们的故事_纸框与对白修正版/README.md)。录制工具按脚本目录解析依赖；自定义浏览器位置使用 `BROWSER_PATH`，自定义 FFmpeg 位置使用 `FFMPEG_PATH`，无需修改代码写入本机路径。

## 验证

在完整版本目录执行：

```sh
node --test tests/player.test.cjs tests/full-day.test.cjs tests/portal.test.cjs tests/story-model.test.cjs
node tests/full-day-coverage.cjs
node tests/engine.test.cjs
node tests/visual-preservation.test.cjs
```

## 发布与隐私

此仓库使用经过检查的发布副本与独立 Git 历史。系统缓存、重复压缩包、原始视频和本机环境配置不随仓库发布。隐私维护说明见 [SECURITY.md](SECURITY.md)。

Godot 的许可文本随各工程保留。原有素材许可说明见各版本文档；本仓库没有为第三方素材新增或扩大授权。
