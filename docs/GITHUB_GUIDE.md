# 把项目分享到 GitHub

## 1. 解压并确认目录

解压项目 ZIP 后，进入 `qpcr-studio` 文件夹。这里应能直接看到 `README.md`、`package.json`、`app` 和 `.github`。

不要把整个 ZIP 当作仓库的唯一文件上传；仓库应展示解压后的文件结构。保留 `.github`、`.gitignore` 等以点开头的文件。

## 2. 创建空仓库并推送

在 GitHub 新建名为 `qpcr-studio` 的仓库。若希望公开分享，选择 Public。先不要让 GitHub 自动生成 README、许可证或 `.gitignore`，本项目已经包含这些文件。

在解压后的 `qpcr-studio` 文件夹内打开终端，执行：

```bash
git init
git add .
git commit -m "Prepare qPCR Studio for GitHub sharing"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/qpcr-studio.git
git push -u origin main
```

把 `YOUR_GITHUB_USERNAME` 改为您的 GitHub 用户名。Git 的登录按系统提供的正常登录流程完成，不要把访问令牌写入任何项目文件。如果 Git 要求配置提交者身份，填写您自己的姓名和希望公开的提交邮箱；也可使用 GitHub 提供的 no-reply 邮箱。

也可以使用 GitHub Desktop 创建本地仓库、提交这些文件后 Publish repository。若使用网页 Upload files，上传解压后的项目内容，并确认 `.github/workflows/` 也已上传。

## 3. 检查自动流程

推送到 `main` 后，Actions 中的 **Project checks** 会检查文件、示例数据和功能回归。

在 Actions 中选择 **Windows portable build → Run workflow**。该流程将安装依赖、打包 EXE、解包核对、运行 Windows 桌面冒烟测试，并生成名为 `qPCR-Studio-Windows-x64` 的下载产物。

流程需要访问 npm、Electron 和打包工具的下载服务。首次运行若失败，请查看对应步骤日志。仓库级策略可能要求您先允许 GitHub Actions。

本工作流只生成供下载的构建产物，**不会自动创建公开 Release**。运行成功不等于完成所有实际实验场景验收，仍应在自己的 Windows 电脑上确认导入和图形导出。

## 4. 创建 Release

下载并解压 Actions 产物后，在仓库 **Releases → Draft a new release** 创建版本，建议首版标签为 `v1.0.0`。

发布说明可以复制 [RELEASE_NOTES.md](RELEASE_NOTES.md)。将构建产物中的以下文件添加到 Release 附件：

- `qPCR_Studio_Windows_x64.exe`
- `qPCR_Studio.html`
- `synthetic_96_wells.csv`
- `SHA256SUMS.txt`
- `LICENSE.txt`、`THIRD_PARTY_NOTICES.md`、`THIRD_PARTY_LICENSES.txt`
- `verification.json`（可选，记录此次包完整性检查）

确认附件和描述后再点击 Publish release。也可先使用已收到的原始 EXE 创建首版 Release；对应校验值见 [已有文件校验](EXISTING_RELEASE_SHA256SUMS.txt)。新构建的 EXE 请使用新生成的校验值，不能沿用旧值。

**EXE 约 109 MiB，超过 GitHub 普通 Git 文件的 100 MiB 限制，应作为 Release 附件上传，不要提交到源码仓库。** `.gitignore` 已排除 EXE、构建目录和依赖目录。GitHub 官方说明：[大文件限制](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github)、[管理 Releases](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository)。

## 5. 仓库简介与关键词

建议名称：`qpcr-studio`

建议 About 描述：

> Offline qPCR analysis and plotting tool with a Chinese interface, ΔCt/ΔΔCt calculations, and mean ± SD/SEM plots of 2^−ΔCt.

建议 Topics：`qpcr`、`bioinformatics`、`data-analysis`、`electron`、`offline`、`scientific-visualization`。

## 6. 后续版本

修改程序后更新 `package.json` 的版本和 `build.electronVersion`（如需升级 Electron），运行 `npm install --package-lock-only` 更新锁文件，补充 CHANGELOG，再重新测试和打包。`devDependencies.electron` 与 `build.electronVersion` 必须保持一致。

若推送 `v*` 标签，Windows 工作流会自动构建，标签必须与 `package.json` 版本匹配。发布仍由您手动完成。首次公开前可更换原创代码的 MIT 许可方案；第三方版权声明应保留。
