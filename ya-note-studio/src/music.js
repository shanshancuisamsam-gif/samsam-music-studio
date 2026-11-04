export const pitches = ['C4','D4','E4','F4','G4','A4','B4','C5','D5','E5','F5'];
export const midi = [60,62,64,65,67,69,71,72,74,76,77];
export const initial = [0,1,2,1,0];
export const storageKey = 'samsam-ya-notes.v1';
export const staffY = pitch => 599 - 13.5 * pitch;
export function restore(value) {
  return Array.isArray(value) && value.length === 5 &&
    value.every(n => Number.isInteger(n) && n >= 0 && n < pitches.length)
    ? value.slice() : initial.slice();
}
