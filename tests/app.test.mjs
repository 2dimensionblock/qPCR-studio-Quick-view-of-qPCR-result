import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM, ResourceLoader, VirtualConsole } from 'jsdom';

const html = await readFile(new URL('../app/index.html', import.meta.url), 'utf8');
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const parseCsv = text => text.replace(/^\uFEFF/, '').trim().split(/\r?\n/).map(line =>
  (line.match(/"(?:[^"]|"")*"|[^,]+/g) ?? []).map(cell => cell.startsWith('"') ? cell.slice(1, -1).replace(/""/g, '"') : cell));

async function openApp() {
  const requests = [], errors = [], downloads = [], blobs = new Map();
  let sequence = 0;
  class LocalOnly extends ResourceLoader {
    fetch(url) { requests.push(url); return null; }
  }
  const console = new VirtualConsole();
  console.on('jsdomError', error => {
    if (!String(error.message).includes('CSS')) errors.push(error.message);
  });
  const dom = new JSDOM(html, {
    url: 'file:///qPCR_Studio.html', runScripts: 'dangerously', pretendToBeVisual: true,
    resources: new LocalOnly(), virtualConsole: console,
    beforeParse(w) {
      w.TextEncoder = TextEncoder; w.TextDecoder = TextDecoder;
      w.Blob = Blob; w.File = File; w.structuredClone = structuredClone;
      w.URL.createObjectURL = blob => { const key = `blob:local/${++sequence}`; blobs.set(key, blob); return key; };
      w.URL.revokeObjectURL = () => {};
      w.HTMLAnchorElement.prototype.click = function () { downloads.push({ name: this.download, blob: blobs.get(this.href) }); };
      w.HTMLElement.prototype.scrollIntoView = () => {};
      w.HTMLElement.prototype.hasPointerCapture = () => false;
      w.HTMLElement.prototype.releasePointerCapture = () => {};
      w.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
      w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
      Object.defineProperty(w.SVGSVGElement.prototype, 'viewBox', { get() {
        const [x, y, width, height] = this.getAttribute('viewBox').split(/\s+/).map(Number);
        return { baseVal: { x, y, width, height } };
      } });
    }
  });
  const w = dom.window, document = w.document;
  async function until(fn, message) {
    for (let n = 0; n < 100; n++) { if (fn()) return; await wait(30); }
    assert.fail(`${message}; errors: ${errors.join('; ')}`);
  }
  const button = label => {
    const value = [...document.querySelectorAll('button')].find(x => x.textContent.trim() === label);
    assert.ok(value, `Missing button: ${label}`); return value;
  };
  const metrics = () => [...document.querySelectorAll('.metrics strong')].map(x => x.textContent.trim());
  const importFile = (data, name) => {
    const input = document.querySelector('input[type=file]');
    Object.defineProperty(input, 'files', { configurable: true, value: [new File([data], name)] });
    input.dispatchEvent(new w.Event('change', { bubbles: true }));
  };
  await until(() => document.querySelector('h1'), 'Initial render');
  return { dom, document, button, metrics, until, importFile, requests, errors, downloads };
}

test('Results stay empty until explicit analysis; synthetic demo and exports work offline', async t => {
  const app = await openApp(); t.after(() => app.dom.window.close());
  assert.equal(app.document.title, 'qPCR Studio');
  assert.equal(app.document.querySelector('.author-signature').textContent, 'Steven Liu');
  assert.deepEqual(app.metrics(), ['', '', '', '']);
  assert.ok(app.button('开始分析').disabled);
  assert.ok(app.button('汇总 CSV').disabled);
  app.button('模拟示例').click();
  await app.until(() => app.document.querySelector('.file-card')?.textContent.includes('96'), 'Load demo');
  assert.deepEqual(app.metrics(), ['', '', '', '']);
  assert.equal(app.document.querySelector('#expression-svg'), null);
  app.button('开始分析').click();
  await app.until(() => app.document.querySelector('#expression-svg'), 'Analyze demo');
  assert.deepEqual(app.metrics(), ['96 wells', '96 / 96', '24', 'Reference']);
  assert.equal(app.document.querySelectorAll('#expression-svg circle[r="4.5"]').length, 8);
  assert.ok(app.document.querySelectorAll('#expression-svg g[stroke] line').length >= 24);
  app.button('汇总 CSV').click();
  await app.until(() => app.downloads.length === 1, 'Export CSV');
  const csv = await app.downloads[0].blob.text();
  assert.match(csv, /Mean_2\^-DeltaCt/);
  assert.equal(csv.trim().split(/\r?\n/).length, 9);
  const [csvHeader, ...csvRows] = parseCsv(csv);
  const [expectedHeader, ...expectedRows] = parseCsv(await readFile(new URL('../examples/synthetic_96_expected_summary.csv', import.meta.url), 'utf8'));
  for (const expected of expectedRows) {
    const row = csvRows.find(candidate => candidate.slice(0, 3).join('|') === expected.slice(0, 3).join('|'));
    assert.ok(row, `Missing simulated summary ${expected.slice(0, 3).join('/')}`);
    for (const column of ['n', 'Mean_2^-DeltaCt', 'SD', 'SEM']) {
      assert.ok(Math.abs(Number(row[csvHeader.indexOf(column)]) - Number(expected[expectedHeader.indexOf(column)])) < 1e-12, column);
    }
  }
  app.button('SVG').click();
  await app.until(() => app.downloads.length === 2, 'Export SVG');
  const svg = await app.downloads[1].blob.text();
  assert.ok(svg.includes('@font-face') && svg.includes('data:font/woff2'));
  assert.ok(svg.includes('SIMULATED DATA'));
  app.importFile(await readFile(new URL('../examples/synthetic_96_wells.csv', import.meta.url)), 'synthetic_96_wells.csv');
  await app.until(() => app.document.querySelector('.file-card')?.textContent.includes('synthetic_96_wells.csv'), 'Import example');
  assert.deepEqual(app.metrics(), ['', '', '', '']);
  assert.equal(app.document.querySelector('#expression-svg'), null);
  app.button('清空数据').click();
  await app.until(() => !app.document.querySelector('.file-card'), 'Clear');
  assert.deepEqual(app.metrics(), ['', '', '', '']);
  assert.deepEqual(app.requests, []);
  assert.deepEqual(app.errors, []);
});

test('Known Ct values use mean of transformed expression values', async t => {
  const app = await openApp(); t.after(() => app.dom.window.close());
  app.importFile('Gene,Group,Time,Cq\nReference,Control,0,20\nGeneX,Control,0,23\nGeneX,Control,0,24\nGeneX,Control,0,25', 'known-values.csv');
  await app.until(() => app.document.querySelector('.file-card')?.textContent.includes('known-values.csv'), 'Import known data');
  assert.deepEqual(app.metrics(), ['', '', '', '']);
  app.button('开始分析').click();
  await app.until(() => app.document.querySelector('#expression-svg'), 'Analyze known data');
  app.button('汇总 CSV').click();
  await app.until(() => app.downloads.length === 1, 'Export known results');
  const [header, row] = parseCsv(await app.downloads[0].blob.text());
  const mean = Number(row[header.indexOf('Mean_2^-DeltaCt')]);
  assert.ok(Math.abs(mean - (0.125 + 0.0625 + 0.03125) / 3) < 1e-6, JSON.stringify({ header, row, mean }));
  assert.ok(Math.abs(mean - 2 ** -4) > 0.001);
  assert.equal(Number(row[header.indexOf('Mean_DeltaCt')]), 4);
  assert.equal(Number(row[header.indexOf('Mean_DeltaDeltaCt')]), 0);
  assert.deepEqual(app.errors, []);
});
