import { pitches, staffY, octaveChoices, symbolsFor, bassPitch, ledgerYs } from './music.js';

class Control extends HTMLElement {
  send(type, value) {
    this.dispatchEvent(new CustomEvent(type, {bubbles:true, detail:value}));
  }
}
class ScoreSheet extends Control {
  connectedCallback() {
    const staff = top => Array.from({length:5}, (_,i) => 'M197 '+(top+27*i)+'H1294').join(' ');
    this.innerHTML = `<svg viewBox="0 0 1491 1055" aria-label="高音和低音大谱表">
      <defs><clipPath id="edges"><rect width="180" height="1055"/><rect x="1310" width="181" height="1055"/></clipPath></defs>
      <rect width="1491" height="1055" fill="white"/><image clip-path="url(#edges)" width="1491" height="1055"/>
      <g text-anchor="middle" fill="#2c6659" font-family="system-ui">
        <text x="745" y="145" font-size="64" font-weight="bold" class="sheet-title"></text>
        <text x="745" y="213" font-size="34" class="sheet-subtitle"></text>
        <text x="745" y="1017" font-size="23">samsam music studio</text>
      </g>
      <path d="${staff(342)} ${staff(590)} M197 342V698" stroke="#252a27" stroke-width="2.4" fill="none"/>
      <path d="M192 341Q170 354 180 432Q192 500 166 520Q192 539 180 605Q169 686 192 699Q181 676 189 610Q201 543 174 520Q201 499 189 432Q182 370 192 341Z" fill="#252a27"/>
      <g transform="translate(252 423) scale(1.35)" fill="none" stroke="#202020" stroke-width="3.8" stroke-linecap="round">
        <path d="M-2 10C-19 5 -12 -12 0 -12C21 -12 24 13 8 19C-10 27 -27 12 -21 -5C-17 -17 0 -30 5 -42C11 -55 10 -68 6 -72C-2 -69 -5 -54 -3 -39L8 38Q10 54 -5 52Q-14 51 -12 43"/><circle cx="-10" cy="43" r="3.6" fill="#202020"/>
      </g>
      <g transform="translate(225 617)" fill="#202020"><path d="M2 1C1 -15 10 -28 26 -28C50 -28 61 -10 55 12C49 36 21 56 0 65C23 49 43 27 44 3C45 -12 39 -24 26 -24C15 -24 8 -16 7 -7C20 -16 31 -3 23 7C15 17 2 12 2 1Z"/><circle cx="66" cy="-13.5" r="4.2"/><circle cx="66" cy="13.5" r="4.2"/></g>
      <text class="sheet-vowel" x="197" y="904" font-family="system-ui" font-size="78" fill="#bd5747" font-weight="bold"></text>
      <g class="notes"></g></svg>`;
    this.querySelector('image').setAttribute('href', this.getAttribute('background'));
    if (this.getAttribute('background').includes('webp')) {
      const svg = this.querySelector('svg');
      svg.insertAdjacentHTML('beforeend', '<svg class="original-title" x="180" width="1130" height="280" viewBox="180 0 1130 280"><image width="1491" height="1055"/></svg><svg class="mouth" x="870" y="802" width="380" height="135" viewBox="747 625 490 174"><image width="1491" height="1055"/></svg>');
      for (const image of svg.querySelectorAll('svg image')) image.setAttribute('href',this.getAttribute('background'));
    }
    this.setSyllable('YA');
    this.bindNotes();
  }
  setSyllable(value) {
    this.querySelectorAll('.original-title,.mouth').forEach(part => part.style.display = value.toUpperCase()==='YA' ? '' : 'none');
    this.querySelector('.sheet-title').textContent = value+' 音练习曲';
    this.querySelector('.sheet-subtitle').textContent = value+' Vocal Exercise';
    this.querySelector('.sheet-vowel').textContent = value;
  }
  bindNotes() {
    this.onclick = event => {
      const note = event.target.closest('[data-note]');
      if (note) this.send('pick', Number(note.dataset.note));
    };
    this.onkeydown = event => {
      const note = event.target.closest('[data-note]');
      if (!note) return;
      const index = Number(note.dataset.note);
      const actions = {ArrowLeft:['pick', Math.max(0,index-1)],ArrowRight:['pick',Math.min(4,index+1)],ArrowUp:['step',1],ArrowDown:['step',-1],Enter:['pick',index],' ':['pick',index]};
      if (!actions[event.key]) return;
      event.preventDefault();
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') this.send('pick', index);
      this.send(...actions[event.key]);
      this.querySelector('[aria-pressed="true"]').focus();
    };
  }
  update(values, active) {
    const symbols = symbolsFor(values);
    this.querySelector('.notes').innerHTML = values.map((pitch,index) => {
      const x = 385 + 180 * index, y = staffY(pitch), up = y > (bassPitch(pitch) ? 644 : 396);
      return `<g tabindex="0" role="button" data-note="${index}" aria-pressed="${index===active}" aria-label="第 ${index+1} 个音 ${pitches[pitch]}" class="${index===active?'selected':''}">
        <rect x="${x-65}" y="245" width="130" height="545" fill="transparent"/>
        ${index===active?`<ellipse class="halo" cx="${x}" cy="${y}" rx="31" ry="23"/>`:''}
        ${ledgerYs(pitch).map(line => `<path d="M${x-25} ${line}h50" stroke="currentColor" stroke-width="3"/>`).join('')}
        <text x="${x-29}" y="${y+9}" text-anchor="end" font-family="serif" font-size="40">${symbols[index]}</text>
        <rect x="${x+(up?12.5:-15.5)}" y="${up?y-92:y}" width="3.2" height="92"/>
        <ellipse cx="${x}" cy="${y}" rx="17" ry="11" transform="rotate(-18 ${x} ${y})"/>
        <text x="${x}" y="776" text-anchor="middle" font-size="22">${pitches[pitch]}</text></g>`;
    }).join('');
  }
}
class PitchEditor extends Control {
  connectedCallback() {
    this.innerHTML = `<div class="panel"><small>01 &nbsp; / &nbsp; NOTE EDITOR</small><h2>音高编辑</h2><label>练声音节 · Syllable <input id="syllable" value="YA" maxlength="12" lang="en" inputmode="text" autocapitalize="off" spellcheck="false"></label><br><label>选择音符 · Note</label><div class="steps"></div><label>八度组 · Octave <select class="octave"><option>3</option><option selected>4</option><option>5</option></select></label><div class="pitches"></div><p>← → 选音符　↑ ↓ 调音高</p><button class="reset">恢复初始旋律</button></div>`;
    const addButton = (parent, action, index) => {
      const button = document.createElement('button');
      button.dataset.index = index;
      button.onclick = () => this.send(action,index);
      parent.append(button);
      return button;
    };
    for (let index=0; index<5; index++) addButton(this.querySelector('.steps'),'pick',index);
    const selector = this.querySelector('.octave');
    const populate = () => {
      this.querySelector('.pitches').replaceChildren();
      for (const spellings of octaveChoices[selector.value]) {
        const group = document.createElement('div');
        group.className = 'pitch-class';
        this.querySelector('.pitches').append(group);
        spellings.forEach((index, position) => {
          if (position) group.append(' = ');
          addButton(group,'pitch',index).textContent = pitches[index];
        });
      }
      if (this.values) this.update(this.values,this.active);
    };
    this.populate = populate;
    selector.onchange = populate;
    populate();
    this.querySelector('.reset').onclick = () => this.send('reset');
  }
  update(values, active) {
    this.values = values;
    this.active = active;
    this.querySelectorAll('.steps button').forEach((button,index) => {
      button.textContent = pitches[values[index]];
      button.setAttribute('aria-label', '第 '+(index+1)+' 个音 '+button.textContent);
      button.setAttribute('aria-pressed',index===active);
    });
    this.querySelectorAll('.pitches button').forEach((button,index) => button.setAttribute('aria-pressed',Number(button.dataset.index)===values[active]));
  }
}
class MelodyPlayer extends Control {
  connectedCallback() {
    this.innerHTML = '<div class="panel"><small>02 &nbsp; / &nbsp; PLAYBACK</small><h2>旋律试听</h2><div class="row"><button class="play">▶ 试听旋律</button><label>速度 <select aria-label="速度 BPM"><option>60</option><option selected>90</option><option>120</option></select> BPM</label></div><p aria-live="polite">每个音唱一拍。</p></div>';
    this.querySelector('button').onclick = () => this.send('play', Number(this.querySelector('select').value));
    this.querySelector('select').onchange = () => this.send('halt');
  }
  state(playing, message='每个音唱一拍。') {
    this.querySelector('button').textContent = playing ? '■ 停止试听' : '▶ 试听旋律';
    this.querySelector('p').textContent = message;
  }
}
customElements.define('score-sheet',ScoreSheet);
customElements.define('pitch-editor',PitchEditor);
customElements.define('melody-player',MelodyPlayer);
