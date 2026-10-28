/* 逐帧截图录制器：用无头 Edge / Chrome 驱动渲染模式，把网页动画录成图片序列
   用法: node render_capture.mjs <sceneIndex> <fps>
   前置: 页面需支持 ?render=1&scene=N，并暴露 window.__jingxiRender = { step(dt), done() } */
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import fs from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
const puppeteer = require("puppeteer-core");

const SCENE = Number(process.argv[2] ?? 0);
const FPS = Number(process.argv[3] ?? 30);

// 输出到一个带时间戳的新目录，绝不删除任何已有文件
const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const OUT = path.resolve("render_frames_s" + SCENE + "_" + stamp);

const BROWSERS = [
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
];
const EDGE = [process.env.BROWSER_PATH, ...BROWSERS].filter(Boolean).find((p) => fs.existsSync(p));

if (!EDGE) {
  console.error("找不到 Edge / Chrome，请在脚本里补充 executablePath");
  process.exit(1);
}

const URL_ = pathToFileURL(path.resolve("index.html")).href +
  "?render=1&scene=" + SCENE;

fs.mkdirSync(OUT, { recursive: true });
console.log("启动无头浏览器，录制场景", SCENE, "@", FPS + "fps");

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: true,
  args: ["--disable-gpu", "--no-sandbox", "--hide-scrollbars"],
  defaultViewport: { width: 1280, height: 720, deviceScaleFactor: 1 },
});
const page = await browser.newPage();
page.on("pageerror", (e) => console.log("页面错误:", e.message));
await page.goto(URL_, { waitUntil: "networkidle0" });
await page.waitForFunction("window.__jingxiRender !== undefined", { timeout: 15000 });
await page.waitForFunction(
  "[...document.querySelectorAll('.actor img, figure img')].every(i => i.complete && i.naturalWidth > 0)",
  { timeout: 15000 }
);
await new Promise((r) => setTimeout(r, 600)); // 字体 / 背景稳定

let f = 0;
const dt = 1 / FPS;
let done = false;
let tailStart = -1;
const TAIL = Math.round(FPS * 1.2); // 结尾留 1.2s 余韵

while (true) {
  if (!done) {
    await page.evaluate((d) => window.__jingxiRender.step(d), dt);
    done = await page.evaluate(() => window.__jingxiRender.done());
    if (done) tailStart = f;
  } else if (f >= tailStart + TAIL) {
    break;
  }
  const file = path.join(OUT, "f_" + String(f).padStart(5, "0") + ".jpg");
  await page.screenshot({ path: file, type: "jpeg", quality: 90 });
  f++;
  if (f % 90 === 0) console.log("  帧", f, done ? "(收尾)" : "", "虚拟时长", (f / FPS).toFixed(1) + "s");
  if (f > 3000) { console.log("超过安全帧数上限，强制结束"); break; }
}

await browser.close();
console.log("完成：", f, "帧 →", OUT);
