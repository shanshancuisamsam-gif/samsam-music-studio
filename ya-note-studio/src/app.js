import { drawHeading } from './components.js';
import { maxNotes, initial, midi, pitches, restore, storageKey, nextPitch } from './music.js';

const score = document.querySelector('score-sheet');
const editor = document.querySelector('pitch-editor');
const player = document.querySelector('melody-player');
let values = initial.slice(), active = 0, sound, run = 0, playing = false;
let voices = [], timer;
try { values = restore(JSON.parse(localStorage.getItem(storageKey))); } catch {}
const input = editor.querySelector('#syllable');
const syllableKey = 'samsam-ya-syllable.v1';
try { input.value = localStorage.getItem(syllableKey) || 'YA'; } catch {}
function displaySyllable() {
  input.value = input.value.replace(/[^a-z]/gi,'').slice(0,12);
  const syllable = input.value || 'YA';
  score.setSyllable(syllable);
  const title = document.querySelector('h1');
  title.setAttribute('aria-label',syllable+' 音符编辑室');
  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  const {width} = drawHeading(svg,syllable,'音符编辑室',1250);
  svg.setAttribute('viewBox','-14 -12 '+(width+26)+' 99');
  svg.setAttribute('aria-hidden','true');
  title.replaceChildren(svg);
  document.title = syllable+' 音符编辑室 · Samsam Music Studio';
  try { localStorage.setItem(syllableKey,syllable); } catch {}
}
input.oninput = displaySyllable;
input.onblur = () => { if (!input.value) input.value = 'YA'; };
displaySyllable();
function draw() {
  score.update(values,active);
  const selector = editor.querySelector('.octave');
  if (values.length) selector.value = pitches[values[active]].at(-1);
  player.querySelector('.play').disabled = !values.length;
  editor.populate();
  editor.update(values,active);
}
function save() {
  try { localStorage.setItem(storageKey,JSON.stringify(values)); } catch {}
  draw();
}
function stop() {
  run++;
  clearTimeout(timer);
  voices.forEach(voice => { try { voice.stop(); } catch {} });
  voices = [];
  playing = false;
  player.state(false);
}
function change(value) {
  stop();
  values[active] = Math.max(0,Math.min(pitches.length-1,value));
  save();
}
document.addEventListener('pick',e => { active = e.detail; draw(); });
document.addEventListener('pitch',e => change(e.detail));
document.addEventListener('step',e => change(nextPitch(values[active],e.detail)));
document.addEventListener('insert-note',() => {
  if (values.length >= maxNotes) return;
  stop();
  const pitch = values[active] ?? 0;
  active = values.length ? active+1 : 0;
  values.splice(active,0,pitch);
  save();
});
document.addEventListener('remove-note',() => {
  if (!values.length) return;
  stop();
  values.splice(active,1);
  active = Math.max(0,Math.min(active,values.length-1));
  save();
});
document.addEventListener('reset',() => { stop(); values=initial.slice(); active=0; save(); });
document.addEventListener('halt',stop);
document.addEventListener('play',async event => {
  if (playing) return stop();
  const token = ++run, beat = 60/event.detail;
  playing = true;
  player.state(true,'播放中…');
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!sound || sound.state === 'closed') sound = new AudioContextClass();
    await sound.resume();
    if (token !== run) return;
    if (sound.state !== 'running') {
      stop();
      player.state(false,'声音尚未启动，请再次点击试听，并确认浏览器允许播放声音。');
      return;
    }
    const start = sound.currentTime + .04;
    values.forEach((pitch,index) => {
      const tone = sound.createOscillator(), gain = sound.createGain(), time = start + index*beat;
      tone.frequency.value = 440 * 2**((midi[pitch]-69)/12);
      gain.gain.setValueAtTime(.0001,time);
      gain.gain.exponentialRampToValueAtTime(.65,time+.025);
      gain.gain.exponentialRampToValueAtTime(.48,time+beat-.10);
      gain.gain.exponentialRampToValueAtTime(.0001,time+beat-.03);
      tone.connect(gain).connect(sound.destination);
      tone.onended = () => { tone.disconnect(); gain.disconnect(); };
      tone.start(time); tone.stop(time+beat); voices.push(tone);
    });
    timer = setTimeout(stop, 50+1000*values.length*beat);
  } catch { if (run===token) {stop(); player.state(false,'无法试听，请检查浏览器声音设置。');} }
});
document.querySelector('#print').onclick = () => window.print();
draw();
