import { pitches, staffY, octaveChoices, symbolsFor, bassPitch, ledgerYs } from './music.js';

class Control extends HTMLElement {
  send(type, value) {
    this.dispatchEvent(new CustomEvent(type, {bubbles:true, detail:value}));
  }
}
// Rounded centre lines keep the lettering consistent on screen and on printed sheets.
const bubblePaths = {
  A:'M3 0L23 -60Q25 -65 28 -58L48 0M12 -21H39', B:'M5 0V-60H24C51 -60 50 -32 25 -32H7M24 -32C56 -32 54 0 26 0Z',
  C:'M44 -50C18 -78 -9 -40 8 -12Q23 8 44 -7', D:'M5 0V-60H18C58 -60 58 0 18 0Z',
  E:'M42 -60H5V0H43M7 -31H34', F:'M5 0V-60H42M6 -31H34',
  G:'M44 -51C16 -76 -4 -40 7 -15Q18 8 44 -4V-26H29', H:'M5 -60V0M44 -60V0M6 -31H43',
  I:'M14 -60H36M25 -59V0M14 0H36', J:'M40 -60V-17C40 8 6 7 5 -13',
  K:'M5 -60V0M43 -60L6 -26M21 -37L45 0', L:'M7 -60V0H43',
  M:'M3 0V-60L25 -28L47 -60V0', N:'M5 0V-60L44 0V-60',
  O:'M25 -61C-3 -61 -4 0 25 0C54 0 54 -61 25 -61Z', P:'M6 0V-60H26C52 -60 52 -28 26 -28H8',
  Q:'M25 -61C-3 -61 -4 0 25 0C54 0 54 -61 25 -61ZM30 -15L48 4', R:'M5 0V-60H25C52 -60 52 -30 25 -30H7M24 -30L46 0',
  S:'M42 -53C20 -72 -5 -50 11 -36C20 -29 47 -30 44 -13C41 5 17 6 5 -5', T:'M2 -60H48M25 -59V0',
  U:'M5 -60V-21C5 8 44 8 44 -21V-60', V:'M2 -60L24 0L47 -60',
  W:'M0 -60L10 0L25 -35L39 0L50 -60', X:'M5 -60L45 0M44 -60L5 0',
  Y:'M2 -60L25 -30L48 -60M25 -29V0', Z:'M5 -60H45L5 0H45'
};
function drawBubbles(group,value) {
  group.replaceChildren();
  const scale = Math.min(2.05, 800/(value.length*73));
  group.setAttribute('transform','scale('+scale+')');
  group.setAttribute('aria-label',value);
  [...value].forEach((letter,i) => {
    const lowercase = letter !== letter.toUpperCase();
    const paint = i%2 ? ['#d77223','#ffab47','#ffdd97'] : ['#cf3757','#fb627f','#ffb0bf'];
    const ns = 'http://www.w3.org/2000/svg';
    const glyph = document.createElementNS(ns,lowercase?'text':'g');
    glyph.setAttribute('transform','translate('+(i*73)+' '+(i%2?-1:0)+') rotate('+(i%2?3:-3)+' 24 -30)');
    if (lowercase) {
      glyph.textContent=letter;
      for(const [key,val] of Object.entries({'font-family':'sans-serif','font-size':82,'font-weight':900,fill:paint[1],stroke:paint[1],'stroke-width':5,'stroke-linejoin':'round','paint-order':'stroke'})) glyph.setAttribute(key,val);
    } else {
      for(const [width,color,dy] of [[19,paint[0],1.5],[16,paint[1],0],[3,paint[2],-4]]) {
        const path = document.createElementNS(ns,'path');
        for(const [key,val] of Object.entries({d:bubblePaths[letter],fill:'none',stroke:color,'stroke-width':width,'stroke-linecap':'round','stroke-linejoin':'round',transform:'translate(0 '+dy+')'})) path.setAttribute(key,val);
        glyph.append(path);
      }
    }
    group.append(glyph);
  });
  return ((value.length-1)*73+57)*scale;
}
class ScoreSheet extends Control {
  connectedCallback() {
    const staff = top => Array.from({length:5}, (_,i) => 'M197 '+(top+27*i)+'H1294').join(' ');
    this.innerHTML = `<svg viewBox="0 0 1491 1055" aria-label="高音和低音大谱表">
      <defs>
        <image id="painted-paper" width="1491" height="1055"/>
        <filter id="paper-to-alpha" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -2 -2 -2 0 5.74"/>
          <feComposite in2="SourceAlpha" operator="in"/>
        </filter>
        <g id="ink"><use href="#painted-paper" filter="url(#paper-to-alpha)"/></g>
        <pattern id="paper-grain" width="110" height="90" patternUnits="userSpaceOnUse"><use href="#painted-paper" x="-630" y="-323"/></pattern>
        <mask id="decor-only" maskUnits="userSpaceOnUse" x="0" y="0" width="1491" height="1055">
          <rect width="1491" height="1055" fill="white"/>
          <path fill="black" d="M300 54h895v270H300z M192 415h1106v214H192z M854 636h278v142H854z M775 791h449v60H775z M275 720h480v211H275z"/>
        </mask>
        <clipPath id="painted-title"><rect x="300" y="54" width="895" height="269"/></clipPath>
        <clipPath id="painted-mouth"><path d="M854 636h278v142H854z M775 791h449v60H775z"/></clipPath>
        <linearGradient id="berry" x2=".8" y2="1"><stop stop-color="#ff8397"/><stop offset=".5" stop-color="#ea385f"/><stop offset="1" stop-color="#f55b74"/></linearGradient>
        <linearGradient id="apricot" x2=".7" y2="1"><stop stop-color="#ffc66b"/><stop offset=".5" stop-color="#ff922c"/><stop offset="1" stop-color="#ef7720"/></linearGradient>
      </defs>
      <rect width="1491" height="1055" fill="#fffdf8"/><rect class="paper-texture" width="1491" height="1055" fill="url(#paper-grain)"/>
      <g class="border-art" pointer-events="none"></g>
      <g text-anchor="middle" fill="#2c6659" font-family="system-ui">
        <text x="745" y="145" font-size="64" font-weight="bold" class="sheet-title"></text>
        <text x="745" y="213" font-size="34" class="sheet-subtitle"></text>
        <text class="studio-mark" x="745" y="1017" font-size="23">samsam music studio</text>
      </g>
      <g transform="translate(118 0) scale(.84 1)">
      <path d="${staff(342)} ${staff(590)} M197 342V698" stroke="#252a27" stroke-width="2.4" fill="none"/>
      <path d="M192 341Q170 354 180 432Q192 500 166 520Q192 539 180 605Q169 686 192 699Q181 676 189 610Q201 543 174 520Q201 499 189 432Q182 370 192 341Z" fill="#252a27"/>
      <g transform="translate(252 423) scale(1.35)" fill="none" stroke="#202020" stroke-width="3.8" stroke-linecap="round">
        <path d="M-2 10C-19 5 -12 -12 0 -12C21 -12 24 13 8 19C-10 27 -27 12 -21 -5C-17 -17 0 -30 5 -42C11 -55 10 -68 6 -72C-2 -69 -5 -54 -3 -39L8 38Q10 54 -5 52Q-14 51 -12 43"/><circle cx="-10" cy="43" r="3.6" fill="#202020"/>
      </g>
      <g transform="translate(225 617)" fill="#202020"><path d="M2 1C1 -15 10 -28 26 -28C50 -28 61 -10 55 12C49 36 21 56 0 65C23 49 43 27 44 3C45 -12 39 -24 26 -24C15 -24 8 -16 7 -7C20 -16 31 -3 23 7C15 17 2 12 2 1Z"/><circle cx="66" cy="-13.5" r="4.2"/><circle cx="66" cy="13.5" r="4.2"/></g>
      <g class="notes"></g></g>
      <g class="painted-details" pointer-events="none"></g>
      <g class="syllable-art" pointer-events="none" transform="translate(335 946)">
        <text x="-15" y="-55" font-size="52" text-anchor="end" fill="#ef912d">“</text>
        <path d="M-38 -27l-24 9 M-34 -12l-18 15" stroke="#f6c957" stroke-width="7" stroke-linecap="round"/>
        <g class="sheet-vowel"></g>
        <g class="end-mark"><text y="-55" font-size="52" fill="#ef912d">”</text><path d="M24 -20l22 4 M20 -7l14 12" stroke="#f4c75c" stroke-width="7" stroke-linecap="round"/></g>
      </g></svg>`;
    this.watercolor = this.getAttribute('background').includes('webp');
    if (this.watercolor) {
      this.querySelector('#painted-paper').setAttribute('href',this.getAttribute('background'));
      this.querySelector('.border-art').innerHTML = '<use href="#ink" mask="url(#decor-only)"/>';
      this.querySelector('.studio-mark').style.display = 'none';
      this.querySelector('.painted-details').innerHTML = `
        <g class="original-title" transform="translate(109 0) scale(.85)"><use href="#ink" clip-path="url(#painted-title)"/></g>
        <g class="mouth" transform="translate(292 350) scale(.71)"><use href="#ink" clip-path="url(#painted-mouth)"/></g>`;
    }
    this.setSyllable('YA');
    this.bindNotes();
  }
  setSyllable(value) {
    const original = this.watercolor && value === 'YA';
    this.querySelectorAll('.original-title,.mouth').forEach(part => part.style.display = original ? '' : 'none');
    this.querySelectorAll('.sheet-title,.sheet-subtitle').forEach(part => part.style.display = original ? 'none' : '');
    const colors = ['#eb4969','#ef9134','#60ad62','#4499cd','#9368ba'];
    const paintText = (node, text, palette) => {
      node.replaceChildren();
      Array.from(text).forEach((letter,i) => {
        const span = document.createElementNS('http://www.w3.org/2000/svg','tspan');
        span.setAttribute('fill',palette[i%palette.length]);
        span.textContent = letter;
        node.append(span);
      });
    };
    paintText(this.querySelector('.sheet-title'),value+' 音练习曲',colors);
    paintText(this.querySelector('.sheet-subtitle'),value+' Vocal Exercise',colors);
    const vowel = this.querySelector('.sheet-vowel');
    const width = drawBubbles(vowel,value);
    this.querySelector('.end-mark').setAttribute('transform','translate('+(width+12)+' 0)');
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
