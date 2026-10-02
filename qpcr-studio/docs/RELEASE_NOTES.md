# qPCR Studio v1.0.0

离线 qPCR 数据分析与即时绘图工具，作者署名 Steven Liu。

## 功能

- 导入 XLSX、CSV、TSV。
- 计算 ΔCt、ΔΔCt、2^−ΔCt。
- 绘制 2^−ΔCt 均值折线，支持 SD/SEM 误差线。
- 技术孔与生物重复模式；可配置共用内参。
- 导出 CSV、SVG 和 PNG。
- 96 孔独立模拟数据；点击“开始分析”前结果为空。
- 中英文衬线字体界面，Windows x64 单文件免安装程序。

## 使用

Windows 10/11 64 位用户下载 EXE 后双击。HTML 文件可下载到本地后用浏览器打开。分析无需联网；桌面程序自带运行环境。

## 已知限制

- 当前 EXE 未进行数字签名。
- 不支持旧版 `.xls` 文件。
- 不执行显著性检验，不验证扩增效率或熔解曲线。
- 仓库提供桌面入口源码和已构建的 HTML，不包含原始前端 React/TypeScript 工程。
- 初始交付尚未完成 Windows 实机验收；发布者应在发布前更新本条验证状态。

本 Release 的 SHA-256 校验值见附件 `SHA256SUMS.txt`。

## English

Offline qPCR analysis with XLSX/CSV/TSV import, ΔCt and ΔΔCt calculation, and mean ± SD/SEM plots of 2^−ΔCt. CSV/SVG/PNG export and a fully synthetic 96-well example are included. Windows x64 portable executable; unsigned. The repository contains desktop launcher source and a prebuilt HTML frontend.
