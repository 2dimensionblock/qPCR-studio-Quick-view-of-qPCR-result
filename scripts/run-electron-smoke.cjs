'use strict';
const { spawnSync } = require('node:child_process');
const path = require('node:path');
if (process.platform !== 'win32') {
  console.error('This smoke test requires Windows with the Electron runtime installed.');
  process.exit(1);
}
const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;
const result = spawnSync(require('electron'), [path.join(__dirname, '../tests/electron-smoke.cjs')], {
  stdio: 'inherit', env, timeout: 90000
});
if (result.error) console.error(result.error.message);
process.exit(result.status ?? 1);
