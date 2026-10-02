'use strict';

const { app, BrowserWindow, Menu, dialog, session, shell, screen } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

app.setName('qPCR Studio');
app.setAppUserModelId('com.stevenliu.qpcrstudio');
app.commandLine.appendSwitch('disable-component-update');
app.commandLine.appendSwitch('disable-background-networking');

const entry = path.join(__dirname, 'index.html');
const entryURL = pathToFileURL(entry).href;
const referenceURL = 'https://assets.thermofisher.com/TFS-Assets/LSG/manuals/cms_042380.pdf';
let mainWindow;

function openReference(url) {
  if (url === referenceURL) {
    void shell.openExternal(referenceURL).catch(() => {
      dialog.showErrorBox('无法打开参考文献', '请检查默认浏览器及网络连接。数据分析功能可继续离线使用。');
    });
  }
}

function createWindow() {
  const workArea = screen.getPrimaryDisplay().workAreaSize;
  mainWindow = new BrowserWindow({
    width: Math.min(1440, workArea.width),
    height: Math.min(940, workArea.height),
    minWidth: Math.min(960, workArea.width),
    minHeight: Math.min(650, workArea.height),
    title: 'qPCR Studio',
    backgroundColor: '#f5f6f8',
    icon: path.join(__dirname, 'icon.png'),
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      spellcheck: false,
      devTools: false,
      navigateOnDragDrop: false
    }
  });

  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.on('closed', () => { mainWindow = null; });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    openReference(url);
    return { action: 'deny' };
  });
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url !== entryURL) {
      event.preventDefault();
      openReference(url);
    }
  });
  mainWindow.webContents.on('will-attach-webview', event => event.preventDefault());
  mainWindow.webContents.on('page-title-updated', event => event.preventDefault());
  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    if (details.reason !== 'clean-exit') {
      dialog.showErrorBox('程序页面已停止', '请关闭并重新打开 qPCR Studio，然后重新导入数据。');
    }
  });
  void mainWindow.loadFile(entry).catch(error => {
    dialog.showErrorBox('无法打开 qPCR Studio', error.message);
    app.quit();
  });
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    const localSession = session.defaultSession;
    localSession.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
    localSession.setPermissionCheckHandler(() => false);
    localSession.webRequest.onBeforeRequest(
      { urls: ['http://*/*', 'https://*/*', 'ws://*/*', 'wss://*/*', 'ftp://*/*'] },
      (_details, callback) => callback({ cancel: true })
    );
    localSession.on('will-download', (event, item) => {
      if (!/^(blob:|data:)/.test(item.getURL())) {
        event.preventDefault();
        return;
      }
      const name = path.basename(item.getFilename());
      const ext = path.extname(name).slice(1).toLowerCase();
      if (!['csv', 'svg', 'png'].includes(ext)) {
        event.preventDefault();
        return;
      }
      item.setSaveDialogOptions({
        title: '保存导出文件',
        defaultPath: path.join(app.getPath('documents'), name),
        filters: [{ name: ext.toUpperCase() + ' 文件', extensions: [ext] }],
        properties: ['showOverwriteConfirmation', 'createDirectory']
      });
      item.once('done', (_downloadEvent, state) => {
        if (state === 'interrupted') {
          dialog.showErrorBox('导出未完成', '文件未能写入，请重新导出并选择可写入的文件夹。');
        }
      });
    });

    Menu.setApplicationMenu(Menu.buildFromTemplate([
      { label: '文件', submenu: [{ label: '退出', role: 'quit' }] },
      { label: '编辑', submenu: [
        { label: '撤销', role: 'undo' }, { label: '重做', role: 'redo' },
        { type: 'separator' },
        { label: '剪切', role: 'cut' }, { label: '复制', role: 'copy' },
        { label: '粘贴', role: 'paste' }, { label: '全选', role: 'selectAll' }
      ] },
      { label: '视图', submenu: [
        { label: '放大', role: 'zoomIn' }, { label: '缩小', role: 'zoomOut' },
        { label: '实际大小', role: 'resetZoom' },
        { type: 'separator' }, { label: '全屏', role: 'togglefullscreen' }
      ] },
      { label: '帮助', submenu: [
        { label: '使用说明', click: () => { void dialog.showMessageBox(mainWindow, {
          type: 'info', title: '使用说明', message: 'qPCR Studio',
          detail: '1. 导入 XLSX、CSV 或 TSV 数据表。\n2. 确认内参、组别、时间点和重复设置。\n3. 点击“开始分析”，查看 ΔCt、ΔΔCt 与 2^−ΔCt。\n4. 导出 CSV 数据或带误差线的 SVG、PNG 图。\n\n“模拟示例”提供独立生成的 96 孔练习数据，载入后仍需点击“开始分析”。\n全部分析在本机完成。',
          buttons: ['确定']
        }); } },
        { label: '关于 qPCR Studio', click: () => { void dialog.showMessageBox(mainWindow, {
          type: 'info', title: '关于 qPCR Studio', message: 'qPCR Studio ' + app.getVersion(),
          detail: 'qPCR 数据分析与即时绘图\nWindows 64 位桌面程序\n\nSteven Liu', buttons: ['确定']
        }); } }
      ] }
    ]));
    createWindow();
  }).catch(error => {
    dialog.showErrorBox('启动失败', error.message);
    app.quit();
  });
  app.on('window-all-closed', () => app.quit());
}
