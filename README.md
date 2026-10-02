# qPCR Studio

**离线 qPCR 数据分析与即时绘图工具。** 导入表格后计算 ΔCt、ΔΔCt 和 2^−ΔCt，并绘制以均值为点位、带 SD 或 SEM 误差线的折线图。

[English](README.en.md) · [数据格式](docs/DATA_FORMAT.md) · [计算方法](docs/METHODS.md) · [上传 GitHub](docs/GITHUB_GUIDE.md)

## 下载和使用

- **Windows 10/11，64 位：**在本仓库右侧 **Releases** 中下载 `qPCR_Studio_Windows_x64.exe`，双击运行。它自带运行环境，无需安装 Python 或 Node.js。
- **HTML：**下载 [app/index.html](app/index.html) 到本机，然后用现代浏览器打开。若从 GitHub 文件页下载，请选择 **Download raw file**；也可下载整个仓库 ZIP 后解压打开。
- 若仓库尚无 Release，可以先使用 HTML，或按下方说明构建 EXE。

使用顺序：**导入表格 → 检查列映射及分组 → 选择内参和重复类型 → 开始分析 → 导出结果**。

上传表格或点击“模拟示例”只会载入数据。点击“开始分析”前，统计结果保持空白。更换文件或清空数据后，结果也会清空。

## 功能

- 读取 XLSX、CSV、TSV；识别常用中英文表头，支持手动调整列映射。
- 选择工作表、内参基因、校准组和时间点；可配置多个组共用某组内参。
- 区分技术孔和生物重复模式；支持筛选、排除孔及缺失值提示。
- 输出 ΔCt、ΔΔCt、2^−ΔCt；按组别和时间点汇总均值、SD、SEM。
- 以 **2^−ΔCt 的算术均值**绘制折线和点位，支持 SD/SEM 误差线、线性/对数纵轴。
- 导出 CSV、SVG、PNG；界面采用中英文衬线字体，页脚署名 Steven Liu。
- 自带独立生成的 96 孔模拟数据，仅使用 `Reference`、`GeneX` 等通用名称。

不支持旧版二进制 `.xls`，请先转换为 `.xlsx` 或 CSV。程序不执行显著性检验，也不从扩增曲线估计扩增效率。

## 数据与计算

推荐输入列为 `Well, Sample, Gene, Group, Time, BioRep, Cq`。完整示例见 [examples/synthetic_96_wells.csv](examples/synthetic_96_wells.csv)，为 2 个基因 × 2 个组 × 4 个时间点 × 3 个生物重复 × 2 个技术孔，共 96 孔。

```text
ΔCt   = Ct(target) − mean(Ct(reference))
ΔΔCt  = ΔCt − mean(ΔCt(calibrator))
绘图值 = mean(2^(−ΔCt))
```

图中纵坐标是 **2^−ΔCt**，不是相对于校准组的 2^−ΔΔCt。内参匹配、重复合并方式及误差线解释见 [计算方法](docs/METHODS.md)。

## 本地开发和打包

推荐在 Windows 10/11 x64 上使用 Node.js 24 和 npm。**安装依赖、构建和 GitHub Actions 需要联网；已经构建好的程序可离线运行。**

```bash
npm ci
npm run check
npm test
npm start
```

构建 Windows 单文件 EXE：

```bash
npm run dist:win
npm run verify:dist
npm run smoke:windows
npm run release:files
```

产物位于 `dist/`；用于发布的 EXE、HTML、示例、说明及校验文件位于 `release/`。发布步骤见 [GitHub 操作指南](docs/GITHUB_GUIDE.md)。

## 项目内容与源码范围

| 路径 | 内容 |
| --- | --- |
| `app/main.cjs` | 可编辑的 Electron 桌面入口：窗口、菜单、导出保存和网络限制 |
| `app/index.html` | 已构建的完整前端，含分析逻辑、样式、字体和依赖；可直接离线使用 |
| `build/icon.ico` | Windows 图标 |
| `scripts/` | 打包、产物检查、Windows 冒烟测试和发布文件整理 |
| `tests/` | 初始状态、模拟数据、已知结果和 CSV 导出的回归测试 |
| `examples/` | 无真实实验信息的模拟数据与预期结果 |
| `.github/` | 自动检查、Windows 构建和 Issue/PR 模板 |
| `docs/` | 使用、计算、发布和验证说明 |

**本仓库保留的是可重新打包的桌面工程和已构建的 HTML 前端。原始 React/TypeScript 源文件、前端依赖锁文件和 source map 未保留。** `npm run dist:win` 将现有 HTML 打包为桌面程序，不会重新编译 React 源码。后续如果获得原始前端工程，应另行补入；详见 [架构说明](docs/ARCHITECTURE.md)。

## 隐私和验证状态

表格解析和计算在本机进行，不上传实验数据。桌面版阻止网页内网络请求；用户主动点击方法参考链接时，由默认浏览器联网打开。程序没有自动更新服务。Electron 可能在系统用户目录保存常规缓存；程序不提供实验项目的持久化保存功能。

本项目已有 DOM 功能回归和既有 EXE 的解包完整性校验。**尚未完成 Windows 实机验收；GitHub Actions 配置也需在首次上传后实际运行确认。** 当前构建未进行 Authenticode 数字签名。详细记录见 [验证状态](docs/VALIDATION.md)。

## 许可证

项目原创代码和文档默认采用 [MIT License](LICENSE)，署名 **Steven Liu**。第三方库和字体保留各自许可证，见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。发布者可在首次公开发布前调整原创内容的许可方式。

## English summary

qPCR Studio is an offline tool for ΔCt/ΔΔCt analysis and mean ± SD/SEM line plots of 2^−ΔCt. It reads XLSX/CSV/TSV, exports CSV/SVG/PNG, and includes a fully synthetic 96-well example. The Windows executable bundles its runtime. This repository includes the editable desktop launcher and the prebuilt, self-contained HTML frontend; the original React/TypeScript source project is not included.
