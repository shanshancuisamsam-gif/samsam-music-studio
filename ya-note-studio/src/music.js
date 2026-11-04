export const pitches = ['C4','D4','E4','F4','G4','A4','B4','C5','D5','E5','F5','C♯4','D♭4','D♯4','E♭4','F♯4','G♭4','G♯4','A♭4','A♯4','B♭4'];
export const midi = [60,62,64,65,67,69,71,72,74,76,77,61,61,63,63,66,66,68,68,70,70];
export const initial = [0,1,2,1,0];
export const storageKey = 'samsam-ya-notes.v1';
// The first eleven IDs retain the meaning of saved exercises from version 1.
export const choices = [[0],[11,12],[1],[13,14],[2],[3],[15,16],[4],[17,18],[5],[19,20],[6]];
export const octaveChoices = {4: choices};
for (const octave of [3,5]) {
  octaveChoices[octave] = choices.map(group => group.map(base => {
    const name = pitches[base].replace('4',String(octave));
    const existing = pitches.indexOf(name);
    if (existing >= 0) return existing;
    const id = pitches.push(name)-1;
    midi[id] = midi[base] + 12*(octave-4);
    return id;
  }));
}
const steps = pitches.map(name => 'CDEFGAB'.indexOf(name[0]) + 7*(Number(name.at(-1))-4));
export const bassPitch = id => midi[id] < 60;
export const staffY = id => (bassPitch(id) ? 563 : 477) - 13.5*steps[id];
export function ledgerYs(id) {
  const y = staffY(id);
  const top = bassPitch(id) ? 590 : 342;
  const bottom = top + 108;
  const lines = [];
  for (let line = top-27; line >= y; line -= 27) lines.push(line);
  for (let line = bottom+27; line <= y; line += 27) lines.push(line);
  return lines;
}
export function nextPitch(pitch, direction) {
  const target = Math.min(83, Math.max(48, midi[pitch] + direction));
  if (target === midi[pitch]) return pitch;
  const options = octaveChoices[Math.floor(target/12)-1][target%12];
  return direction < 0 ? options.at(-1) : options[0];
}
export function symbolsFor(values) {
  const alterations = new Map();
  return values.map(pitch => {
    const step = steps[pitch];
    const sign = pitches[pitch].match(/[♯♭]/)?.[0] || '';
    const previous = alterations.get(step);
    alterations.set(step, sign);
    return sign || (previous ? '♮' : '');
  });
}
export const maxNotes = 12;
export function restore(value) {
  return Array.isArray(value) && value.length <= maxNotes &&
    value.every(n => Number.isInteger(n) && n >= 0 && n < pitches.length)
    ? value.slice() : initial.slice();
}
