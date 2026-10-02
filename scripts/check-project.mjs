import { readFile, readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('../', import.meta.url));
const required = ['README.md', 'README.en.md', 'LICENSE', 'THIRD_PARTY_NOTICES.md', 'package-lock.json', 'app/main.cjs', 'app/index.html', 'app/icon.png', 'build/icon.ico', '.github/workflows/ci.yml', '.github/workflows/windows-build.yml'];
for (const name of required) assert.ok((await stat(path.join(root, name))).isFile(), name);
const html = await readFile(path.join(root, 'app/index.html'), 'utf8');
assert.match(html, /<title>qPCR Studio<\/title>/);
assert.ok(html.includes('Steven Liu'));
assert.ok(!/<script\b[^>]*\bsrc\s*=/i.test(html), 'Runtime scripts must be embedded.');
assert.ok(!/<link\b[^>]*rel=["']stylesheet/i.test(html), 'Runtime styles must be embedded.');
const disallowedGeneNames = new RegExp(String.fromCharCode(112, 97, 120) + '[0-9]', 'i');
assert.ok(!disallowedGeneNames.test(html), 'Prior experimental target names must not be bundled.');
const pkg = JSON.parse(await readFile(path.join(root, 'package.json')));
const lock = JSON.parse(await readFile(path.join(root, 'package-lock.json')));
assert.equal(pkg.version, lock.packages[''].version);
assert.equal(pkg.devDependencies.electron, pkg.build.electronVersion);
assert.equal(pkg.build.win.signExecutable, false);
const rows = (await readFile(path.join(root, 'examples/synthetic_96_wells.csv'), 'utf8')).trim().replace(/^\uFEFF/, '').split(/\r?\n/).slice(1).map(x => x.split(','));
assert.equal(rows.length, 96);
assert.equal(new Set(rows.map(x => x[0])).size, 96);
assert.deepEqual([...new Set(rows.map(x => x[2]))].sort(), ['GeneX', 'Reference']);
assert.ok(rows.every(x => Number.isFinite(Number(x[6])) && Number(x[6]) > 0));
const ignored = new Set(['node_modules', '.git', 'dist', 'release', 'coverage', 'test-results']);
async function inspect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) await inspect(file);
    else {
      assert.ok(!/\.(exe|pfx|p12|pem)$/i.test(entry.name), `Keep binaries and signing keys outside tracked source: ${entry.name}`);
      assert.ok((await stat(file)).size < 100 * 1024 * 1024, `Oversized repository file: ${entry.name}`);
    }
  }
}
await inspect(root);
console.log('Project checks passed: embedded frontend, metadata, files, and 96-well example.');
