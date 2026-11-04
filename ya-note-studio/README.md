# YA 音符编辑室

面向初学者的五音声乐练习。点选五线谱或右侧的音符，然后选择音高。支持键盘方向键、三档速度试听、本机保存和 A4 横向打印。

## 本地开发

使用 Node.js 20 或更高版本。在本目录运行以下命令：

```sh
npm ci
npm run dev
```

打开 http://localhost:5173 。修改源码后刷新页面即可。运行 `npm test` 检查音符位置及存档兼容性，运行 `npm run build` 将静态站点输出至 `dist/`。

## 组件

- `score-sheet` 展示五线谱，处理点选及键盘输入。
- `pitch-editor` 负责选音、改音和恢复默认旋律。
- `melody-player` 提供速度与播放控制。
- `src/music.js` 定义音高、谱位和旧版存档读取规则。

使用浏览器原生 Web Components，无第三方运行依赖。

开源版使用内置矢量谱纸。程序代码采用本目录的 MIT 许可证。
