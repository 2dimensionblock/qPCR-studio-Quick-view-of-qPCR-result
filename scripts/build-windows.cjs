'use strict';
const { build, Platform, Arch } = require('electron-builder');
const path = require('node:path');

// Use a moderate 7z level to avoid excessive compression memory use.
process.env.ELECTRON_BUILDER_COMPRESSION_LEVEL ||= '5';
process.env.CSC_IDENTITY_AUTO_DISCOVERY = 'false';
build({
  projectDir: path.resolve(__dirname, '..'),
  targets: Platform.WINDOWS.createTarget(['portable'], Arch.x64),
  publish: 'never'
}).catch(error => { console.error(error); process.exitCode = 1; });
