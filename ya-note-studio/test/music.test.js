import test from 'node:test';
import assert from 'node:assert/strict';
import { initial, restore, staffY } from '../src/music.js';
test('中央 C、D、E 对齐下加一线、第一线下方和第一线', () => {
  assert.deepEqual(initial.map(staffY), [477,463.5,450,463.5,477]);
});
test('保留旧版旋律并拒绝无效存档', () => {
  const old = [10,6,4,1,0];
  assert.deepEqual(restore(old),old);
  assert.deepEqual(restore([99,1,2,1,0]),initial);
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

import { octaveChoices, ledgerYs, pitches, nextPitch } from '../src/music.js';
test('C3–B5 covers 36 pitches and 51 spellings, including both octave crossings', () => {
  const groups = [3,4,5].flatMap(o => octaveChoices[o]);
  assert.equal(groups.flat().length,51);
  groups.forEach((ids,i) => ids.forEach(id => assert.equal(midi[id],48+i)));
  for(const [note,y] of [['C3',657.5],['F3',617],['B3',576.5],['C4',477],['F5',342],['A5',315],['B5',301.5]]) {
    assert.equal(staffY(pitches.indexOf(note)),y);
  }
  assert.deepEqual(ledgerYs(pitches.indexOf('B5')),[315]);
  assert.equal(pitches[nextPitch(pitches.indexOf('B3'),1)],'C4');
  assert.equal(pitches[nextPitch(pitches.indexOf('B4'),1)],'C5');
});
