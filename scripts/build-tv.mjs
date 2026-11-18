#!/usr/bin/env node
// Packages the app for Samsung (Tizen) and LG (webOS) TVs:
//
//   dist/Nocturne.wgt                        Samsung, unsigned
//   dist/io.vibeview.nocturne_1.0.0_all.ipk  LG
//
// The .wgt is unsigned: VibeView re-signs Samsung apps when it installs them.
// To install it on your own Samsung TV, sign it with your Tizen certificate
// profile first. The .ipk needs ares-package (npm i -g @webos-tools/cli);
// without it only the .wgt is built.
import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { transformSync } from 'esbuild';

const root = resolve(import.meta.dirname, '..');
const out = join(root, 'dist');
const web = join(out, 'web');

// The oldest TV browser VibeView runs: LG webOS 6, Chrome 79 (Samsung Tizen 8
// is Chrome 108). Metro leaves newer syntax (?., ??) in the bundle; newer
// built-ins come from src/polyfills.ts.
const TARGET = 'chrome79';

function run(cmd, args, opts = {}) {
  execFileSync(cmd, args, { stdio: 'inherit', cwd: root, ...opts });
}

function has(cmd) {
  try {
    execFileSync('which', [cmd], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

rmSync(out, { recursive: true, force: true });

// Relative paths (app.config.js). --clear: Metro otherwise reuses a previous
// build's inlined settings.
run('npx', ['expo', 'export', '--clear', '--platform', 'web', '--output-dir', web], {
  env: { ...process.env, NOCTURNE_TV_PACKAGE: '1' },
});

const jsDir = join(web, '_expo', 'static', 'js', 'web');
for (const name of readdirSync(jsDir).filter((n) => n.endsWith('.js'))) {
  const file = join(jsDir, name);
  const { code } = transformSync(readFileSync(file, 'utf8'), { target: TARGET, minifyWhitespace: true, charset: 'utf8' });
  writeFileSync(file, code);
}

// No white flash before the app draws.
const indexPath = join(web, 'index.html');
writeFileSync(indexPath, readFileSync(indexPath, 'utf8').replace('</head>', '<style>html,body{background:#0E1B19}</style></head>'));

const stage = mkdtempSync(join(tmpdir(), 'nocturne-'));
try {
  // Samsung: config.xml and the app's files, zipped.
  const tizen = join(stage, 'tizen');
  cpSync(web, tizen, { recursive: true });
  cpSync(join(root, 'packaging', 'tizen'), tizen, { recursive: true });
  run('zip', ['-qr', join(out, 'Nocturne.wgt'), '.'], { cwd: tizen });
  console.log('built dist/Nocturne.wgt (unsigned)');

  // LG: appinfo.json and the app's files, through ares-package.
  if (has('ares-package')) {
    const webos = join(stage, 'webos');
    cpSync(web, webos, { recursive: true });
    cpSync(join(root, 'packaging', 'webos'), webos, { recursive: true });
    run('ares-package', [webos, '-o', out, '--no-minify']);
  } else {
    console.warn('ares-package not found (npm i -g @webos-tools/cli): skipped the LG .ipk');
  }
} finally {
  rmSync(stage, { recursive: true, force: true });
}
