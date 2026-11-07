import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { checkAssets, validatePng } from '../scripts/check-assets.js';

test('all image assets are intact and page references exist', checkAssets);
test('ME PNG has alpha, and corrupt or truncated PNGs are rejected', async () => {
  const bytes = await readFile(new URL('../assets/me-mouth-transparent.png', import.meta.url));
  assert.equal(validatePng(bytes).colorType, 6);
  assert.throws(() => validatePng(bytes.subarray(0, bytes.length - 20)));
  const corrupt = Buffer.from(bytes);
  corrupt[100] ^= 1;
  assert.throws(() => validatePng(corrupt));
});
test('development server honors its port and serves PNG/JS with correct MIME', async t => {
  const server = spawn(process.execPath, ['scripts/dev.js', '--host', '127.0.0.1', '--port', '0'], { cwd: new URL('../', import.meta.url), stdio: ['ignore', 'pipe', 'pipe'] });
  t.after(() => server.kill());
  const origin = await new Promise((resolve, reject) => {
    server.stdout.once('data', chunk => resolve(chunk.toString().match(/http:\/\/\S+/)[0]));
    server.once('error', reject);
    server.once('exit', code => reject(Error(`Server exited: ${code}`)));
  });
  for (const [path, mime] of [['/assets/me-mouth-transparent.png', 'image/png'], ['/assets/ma-approved.png', 'image/png'], ['/src/app.js', 'text/javascript'], ['/src/components.js', 'text/javascript'], ['/src/music.js', 'text/javascript']]) {
    const response = await fetch(origin + path);
    assert.equal(response.status, 200, path);
    assert.ok(response.headers.get('content-type').startsWith(mime), path);
    if (path.endsWith('.png')) validatePng(Buffer.from(await response.arrayBuffer()), path);
  }
});
