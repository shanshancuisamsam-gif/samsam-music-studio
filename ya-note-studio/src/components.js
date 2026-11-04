import { pitches, staffY, choices, symbolsFor } from './music.js';

class Control extends HTMLElement {
  send(type, value) {
    this.dispatchEvent(new CustomEvent(type, {bubbles:true, detail:value}));
  }
}
class ScoreSheet extends Control {
  connectedCallback() {
    this.innerHTML = '<svg viewBox="0 0 1491 1055" aria-label="旋律五线谱"><image width="1491" height="1055"/><g class="notes"></g></svg>';
    this.querySelector('image').setAttribute('href', this.getAttribute('background'));
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
      const x = 385 + 180 * index, y = staffY(pitch), up = y > staffY(6);
      return `<g tabindex="0" role="button" data-note="${index}" aria-pressed="${index===active}" aria-label="第 ${index+1} 个音 ${pitches[pitch]}" class="${index===active?'selected':''}">
        <rect x="${x-65}" y="345" width="130" height="308" fill="transparent"/>
        ${index===active?`<ellipse class="halo" cx="${x}" cy="${y}" rx="31" ry="23"/>`:''}
        ${y===599?`<path d="M${x-25} 599h50" stroke="currentColor" stroke-width="3"/>`:''}
        <text x="${x-29}" y="${y+9}" text-anchor="end" font-family="serif" font-size="40">${symbols[index]}</text>
        <rect x="${x+(up?12.5:-15.5)}" y="${up?y-92:y}" width="3.2" height="92"/>
        <ellipse cx="${x}" cy="${y}" rx="17" ry="11" transform="rotate(-18 ${x} ${y})"/>
        <text x="${x}" y="642" text-anchor="middle" font-size="22">${pitches[pitch]}</text></g>`;
    }).join('');
  }
}
class PitchEditor extends Control {
  connectedCallback() {
    this.innerHTML = `<div class="panel"><small>01 &nbsp; / &nbsp; NOTE EDITOR</small><h2>音高编辑</h2><label>选择音符 · Note</label><div class="steps"></div><label>选择音高 · Pitch</label><div class="pitches"></div><p>← → 选音符　↑ ↓ 调音高</p><button class="reset">恢复初始旋律</button></div>`;
    const addButton = (parent, action, index) => {
      const button = document.createElement('button');
      button.dataset.index = index;
      button.onclick = () => this.send(action,index);
      parent.append(button);
      return button;
    };
    for (let index=0; index<5; index++) addButton(this.querySelector('.steps'),'pick',index);
    for (const spellings of choices) {
      const group = document.createElement('div');
      group.className = 'pitch-class';
      this.querySelector('.pitches').append(group);
      spellings.forEach((index, position) => {
        if (position) group.append(' = ');
        addButton(group,'pitch',index).textContent = pitches[index];
      });
    }
    this.querySelector('.reset').onclick = () => this.send('reset');
  }
  update(values, active) {
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
