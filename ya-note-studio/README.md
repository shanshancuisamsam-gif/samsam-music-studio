# YA 音符编辑室

面向初学者的声乐练习。支持 0–12 个音符、高低音谱表、C3–B5 十二音及等音选择、键盘方向键、三档速度试听、本机保存和 A4 横向打印。

GitHub 仓库中的应用目录是 `ya-note-studio/`，请先 `cd ya-note-studio`，不要在仓库根目录运行。根目录是工作室的另一个页面。

## 本地开发

使用 Node.js 20 或更高版本。在本目录运行以下命令：

```sh
npm ci
npm run dev
```

打开 http://localhost:5173 。修改源码后刷新页面即可。运行 `npm test` 检查音符位置及存档兼容性，运行 `npm run build` 将静态站点输出至 `dist/`。

也可以 `npm run dev -- --host 0.0.0.0 --port 4173` 指定预览地址。请使用 HTTP 服务，不要双击 HTML 以 `file://` 打开：浏览器会限制 JavaScript 模块。

`npm test` 同时检查 PNG 签名、每个数据块的 CRC、解压、资源引用、服务器 PNG/JavaScript MIME 类型及端口参数。构建前自动检查图片完整性。原生组件无需第三方运行依赖。

## 嘴形图片

输入 `ME`、`Me`、`me` 会统一显示 `ME`，使用 `assets/me-mouth-transparent.png` 的真实 RGBA 透明通道，英文步骤由 SVG 文本独立排版；MA 和 YA 保留各自的原有显示。不要把 PNG 改成文字内容、Base64 文本文件或 Git LFS 指针。复制项目时必须同时包含 `assets/`、`src/`、`licenses/`、`scripts/` 和 `index.html`。

## 组件

- `score-sheet` 展示五线谱，处理点选及键盘输入。
- `pitch-editor` 负责选音、改音和恢复默认旋律。
- `melody-player` 提供速度与播放控制。
- `src/music.js` 定义音高、谱位和旧版存档读取规则。

使用浏览器原生 Web Components，无第三方运行依赖。

练声音节可输入 1–12 个英文字母。选择第 3、4、5 八度组后点选音名。低于 C4 的音进入低音谱表，C4 及以上进入高音谱表。参考英国开放大学 OpenLearn《An introduction to music theory》第 2.4 节 Middle C and ledger lines。
