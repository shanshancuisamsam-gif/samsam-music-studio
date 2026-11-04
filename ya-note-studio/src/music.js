export const pitches = ['C4','D4','E4','F4','G4','A4','B4','C5','D5','E5','F5','C♯4','D♭4','D♯4','E♭4','F♯4','G♭4','G♯4','A♭4','A♯4','B♭4'];
export const midi = [60,62,64,65,67,69,71,72,74,76,77,61,61,63,63,66,66,68,68,70,70];
export const initial = [0,1,2,1,0];
export const storageKey = 'samsam-ya-notes.v1';
// The first eleven IDs retain the meaning of saved exercises from version 1.
export const choices = [[0],[11,12],[1],[13,14],[2],[3],[15,16],[4],[17,18],[5],[19,20],[6]];
const steps = [0,1,2,3,4,5,6,7,8,9,10,0,1,1,2,3,4,4,5,5,6];
export const staffY = pitch => 599 - 13.5 * steps[pitch];
export function nextPitch(pitch, direction) {
  const target = Math.min(71, Math.max(60, midi[pitch] + direction));
  if (target === midi[pitch]) return pitch;
  const options = choices[target - 60];
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
export function restore(value) {
  return Array.isArray(value) && value.length === 5 &&
    value.every(n => Number.isInteger(n) && n >= 0 && n < pitches.length)
    ? value.slice() : initial.slice();
}
