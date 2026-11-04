import test from 'node:test';
import assert from 'node:assert/strict';
import { initial, restore, staffY } from '../src/music.js';
test('中央 C、D、E 对齐下加一线、第一线下方和第一线', () => {
  assert.deepEqual(initial.map(staffY), [599,585.5,572,585.5,599]);
});
test('保留旧版旋律并拒绝无效存档', () => {
  const old = [10,6,4,1,0];
  assert.deepEqual(restore(old),old);
  assert.deepEqual(restore([21,1,2,1,0]),initial);
});

import { choices, midi, symbolsFor } from '../src/music.js';
test('十二个半音，五组等音异名分别占相邻谱位', () => {
  assert.equal(choices.length,12);
  assert.equal(choices.flat().length,17);
  choices.forEach((options,index) => {
    options.forEach(id => assert.equal(midi[id],60+index));
    if(options.length===2) assert.equal(staffY(options[0])-staffY(options[1]),13.5);
  });
  assert.deepEqual(symbolsFor([11,12,0,1,2]),['♯','♭','♮','♮','']);
});
