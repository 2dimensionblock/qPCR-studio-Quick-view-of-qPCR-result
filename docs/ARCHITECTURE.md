# 架构与维护范围

`app/main.cjs` 使用 Electron 创建本地窗口，加载 `app/index.html`。渲染页面不开启 Node.js 集成，启用上下文隔离和沙箱。导出使用页面生成的 Blob，通过系统保存对话框写入 CSV、SVG 或 PNG。

HTML 包含已经构建好的 React 前端、计算逻辑、Excel 读取依赖、样式和字体。普通使用不依赖 CDN 或本地 Web 服务器。导入的表格只在当前运行会话中处理。

## 已保留与未保留

已保留：完整单文件 HTML、可读桌面入口、图标、第三方声明、桌面构建配置和锁定的桌面开发依赖。

未保留：原始 React/TypeScript 前端源文件、前端构建脚本、原前端依赖锁文件、source map。因此此仓库的 `package-lock.json` **只锁定桌面构建和测试工具**，不表示 HTML 内部依赖已经可从这些锁定项重建。

## 如何修改

窗口、菜单、保存行为修改 `app/main.cjs`。简单文案或样式可谨慎修改 `app/index.html` 后运行测试；它含压缩的第三方脚本，不适合直接进行大规模业务重构。

若重建前端，建议新增独立源码目录和构建任务，并让产物仍输出到 `app/index.html`，保持全部资源自包含。替换后运行回归测试，核对示例预期结果，更新许可证说明和版本号，再在 Windows 上构建及验收。

## 构建与可复现性

桌面工具版本固定在 `package.json` 和 `package-lock.json`；默认目标是 Windows x64 portable。构建没有自动发布步骤，也不使用签名凭据。每次产物单独生成 SHA-256；不同系统、时间戳和工具环境下生成的 EXE 不保证逐字节相同。

`.github/workflows/ci.yml` 运行跨平台 DOM 测试；`windows-build.yml` 生成 Windows 产物并执行桌面冒烟测试。工作流成功后仍需人工确认中文显示、XLSX 导入、导出质量及运行兼容性。
