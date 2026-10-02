'use strict';
const { app } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'qpcr-smoke-'));
app.setPath('userData', path.join(temp, 'profile'));
const downloads = [];
let completed = false;
const watchdog = setTimeout(() => { console.error('Desktop smoke test timed out.'); app.exit(1); }, 65000);
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(fn) {
  for (let i = 0; i < 150; i++) { if (fn()) return; await pause(100); }
  throw new Error('Timed out waiting for export.');
}
app.on('browser-window-created', (_event, win) => {
  win.webContents.session.on('will-download', (_event, item) => {
    const file = path.join(temp, path.basename(item.getFilename()));
    item.setSavePath(file);
    item.once('done', (_event, state) => downloads.push({ file, state }));
  });
  win.webContents.once('did-finish-load', async () => {
    if (completed) return;
    completed = true;
    try {
      const result = await win.webContents.executeJavaScript(`(async () => {
        const delay = ms => new Promise(r => setTimeout(r, ms));
        const button = label => [...document.querySelectorAll('button')].find(x => x.textContent.trim() === label);
        for (let n = 0; n < 100 && !button('模拟示例'); n++) await delay(50);
        const initial = [...document.querySelectorAll('.metrics strong')].map(x => x.textContent.trim());
        button('模拟示例').click(); await delay(150);
        const staged = [...document.querySelectorAll('.metrics strong')].map(x => x.textContent.trim());
        button('开始分析').click();
        for (let n = 0; n < 100 && !document.querySelector('#expression-svg'); n++) await delay(50);
        await document.fonts.ready;
        return {initial, staged, points: document.querySelectorAll('#expression-svg circle[r="4.5"]').length};
      })()`);
      assert.deepEqual(result.initial, ['', '', '', '']);
      assert.deepEqual(result.staged, ['', '', '', '']);
      assert.equal(result.points, 8);
      for (const label of ['汇总 CSV', 'SVG', 'PNG']) {
        const before = downloads.length;
        await win.webContents.executeJavaScript(`([...document.querySelectorAll('button')].find(x=>x.textContent.trim()===${JSON.stringify(label)})).click()`);
        await until(() => downloads.length > before);
        const item = downloads.at(-1);
        assert.equal(item.state, 'completed');
        const bytes = fs.readFileSync(item.file);
        assert.ok(bytes.length > 100);
        if (label === 'PNG') assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
        if (label === 'SVG') assert.ok(bytes.toString().includes('data:font/woff2'));
        if (label === '汇总 CSV') assert.ok(bytes.toString().includes('Mean_2^-DeltaCt'));
      }
      const report = { startup: true, emptyBeforeAnalysis: true, demo96: true, plotPoints: 8, csv: true, svg: true, png: true };
      fs.mkdirSync(path.join(root, 'test-results'), { recursive: true });
      fs.writeFileSync(path.join(root, 'test-results/windows-smoke.json'), JSON.stringify(report, null, 2));
      console.log(report);
      clearTimeout(watchdog); app.exit(0);
    } catch (error) { console.error(error); clearTimeout(watchdog); app.exit(1); }
  });
});
require('../app/main.cjs');
