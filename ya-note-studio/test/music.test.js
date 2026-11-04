import test from 'node:test';
import assert from 'node:assert/strict';
import { initial, restore, staffY } from '../src/music.js';
test('中央 C、D、E 对齐下加一线、第一线下方和第一线', () => {
  assert.deepEqual(initial.map(staffY), [599,585.5,572,585.5,599]);
});
test('保留旧版旋律并拒绝无效存档', () => {
  const old = [10,6,4,1,0];
  assert.deepEqual(restore(old),old);
  assert.deepEqual(restore([11,1,2,1,0]),initial);
});
