import { maxNotes, pitches, staffY, octaveChoices, symbolsFor, bassPitch, ledgerYs } from './music.js';

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
const titleStrokes = {
  音:'M28 3l4 4M9 11h44M16 16l5 10M46 16l-6 10M5 29h52M15 37h34v24H15zM17 49h30',
  练:'M15 5L5 22l11-2M19 15L5 37l15-4M4 53l16-6M27 14h31M43 5L28 35h26M43 24v32q0 6-8 3M30 43l-8 12M51 42l8 10',
  习:'M7 8h47l-2 42q-1 12-14 8M16 22l12 9M11 48l28-12',
  曲:'M8 20h47v38H8zM24 5v52M40 5v52M9 39h45',
  符:'M13 4L5 18M12 10h16M18 12l5 8M40 4l-9 15M38 10h19M46 12l5 8M23 25L8 44M17 37v24M29 34h29M47 24v32q0 5-8 3M30 41l6 7',
  编:'M14 5L4 22l11-2M18 15L5 37l14-4M4 54l15-6M39 3l5 4M25 12h31v12H26M26 13v19q0 16-7 25M30 32h27v27M30 33v25M32 43h23M39 34v22M48 34v22',
  辑:'M3 14h21M14 5L6 31h19M17 23v37M3 45l22-4M31 6h22v12H31zM27 25h32M32 26v27M51 25v36M33 34h17M33 43h17M27 54l31-4',
  室:'M27 4l5 4M8 18v-6h48v6M16 24h32M28 25l-11 12 30-3M41 29l9 9M31 40v18M13 46h36M6 58h51'
};
function titleElement(tag, attributes) {
  const el = document.createElementNS('http://www.w3.org/2000/svg',tag);
  for(const [name,value] of Object.entries(attributes)) el.setAttribute(name,value);
  return el;
}
export function drawHeading(node, syllable, words, maxWidth) {
  node.replaceChildren();
  const letters = titleElement('g',{});
  const word = titleElement('g',{transform:'translate(0 65)'});
  word.append(letters);
  const letterWidth = drawBubbles(letters,syllable);
  const letterScale = 1/Math.min(2.05,800/(syllable.length*73));
  word.setAttribute('transform','translate(0 63) scale('+letterScale+')');
  node.append(word);
  const offset = letterWidth*letterScale+20;
  const colors = ['#599b64','#408bb7','#8861a8','#cc6d81','#548f82'];
  [...words].forEach((ch,i) => {
    const glyph=titleElement('g',{transform:'translate('+(offset+72*i)+' '+(i%2?2:0)+') rotate('+(i%2?2:-2)+' 32 32)'});
    const path=titleElement('path',{d:titleStrokes[ch],fill:'none',stroke:colors[i%colors.length],'stroke-width':6.3,'stroke-linejoin':'round','stroke-linecap':'round'});
    glyph.append(path);
    node.append(glyph);
  });
  const width = offset+words.length*72;
  const scale = Math.min(1,maxWidth/width);
  return {width,scale};
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
        <g class="sheet-heading" aria-label="练习曲标题"></g>
        <text x="745" y="213" font-size="34" class="sheet-subtitle"></text>
        <text class="studio-mark" x="745" y="1017" font-size="23">samsam music studio</text>
      </g>
      <g class="grand-staff">
      <path d="${staff(342)} ${staff(590)} M197 342V698" stroke="#252a27" stroke-width="2.4" fill="none"/>
      <path d="M192 341Q170 354 180 432Q192 500 166 520Q192 539 180 605Q169 686 192 699Q181 676 189 610Q201 543 174 520Q201 499 189 432Q182 370 192 341Z" fill="#252a27"/>
      <!-- Bravura regular, SMuFL gClef and fClef. See licenses/Bravura.txt. -->
      <path aria-label="高音谱号" fill="#202020" transform="translate(222 423) scale(.108 -.108)" d="M376 415C374 427 376 428 382 434C398 449 419 470 438 491C522 583 572 702 572 815C572 902 548 988 507 1048C492 1070 466 1098 455 1098C441 1098 410 1072 390 1050C316 968 292 843 292 739C292 681 299 616 306 575C308 563 309 561 297 551C233 498 164 437 112 373C43 287 0 194 0 87C0 -87 119 -252 364 -252C387 -252 413 -250 433 -246C444 -244 446 -243 448 -255C460 -322 475 -409 475 -456C475 -604 375 -622 316 -622C262 -622 236 -606 236 -593C236 -586 245 -583 268 -576C299 -567 335 -540 335 -482C335 -427 300 -380 239 -380C172 -380 132 -433 132 -495C132 -560 171 -658 322 -658C389 -658 519 -628 519 -458C519 -401 501 -306 490 -244C488 -232 489 -233 503 -227C604 -187 671 -102 671 11C671 139 577 252 430 252C404 252 404 252 401 270ZM470 943C503 943 530 916 530 861C530 792 497 728 419 650C403 634 379 611 356 591C349 585 345 586 343 599C339 625 337 659 337 691C337 847 409 943 470 943ZM361 262C364 243 364 244 346 238C258 208 201 129 201 44C201 -46 248 -110 316 -133C324 -136 336 -139 343 -139C351 -139 355 -134 355 -128C355 -121 347 -118 340 -115C298 -97 268 -54 268 -8C268 49 307 92 368 109C384 113 386 112 388 101L438 -197C440 -208 439 -208 424 -211C408 -214 388 -216 368 -216C193 -216 80 -119 80 20C80 79 90 158 173 252C233 319 279 356 326 394C336 402 338 401 340 390ZM430 103C428 115 429 118 441 117C522 110 589 42 589 -46C589 -109 551 -160 495 -188C483 -194 481 -194 479 -182Z"/>
      <path aria-label="低音谱号" fill="#202020" transform="translate(222 617) scale(.108 -.108)" d="M252 262C78 262 0 135 0 39C0 -41 42 -110 123 -110C186 -110 229 -66 229 -4C229 60 182 100 133 100C106 100 96 93 83 93C70 93 67 101 67 111C67 151 127 224 229 224C335 224 381 120 381 -37C381 -140 359 -260 297 -356C237 -449 134 -534 10 -605C1 -610 -5 -615 -5 -623C-5 -629 -1 -635 8 -635C13 -635 19 -633 25 -630C158 -565 286 -489 392 -375C479 -281 531 -159 531 -28C531 146 425 262 252 262ZM629 180C598 180 574 156 574 125C574 94 598 70 629 70C660 70 684 94 684 125C684 156 660 180 629 180ZM630 -71C599 -71 576 -94 576 -125C576 -156 599 -179 630 -179C661 -179 684 -156 684 -125C684 -94 661 -71 630 -71Z"/>
      <g aria-label="终止线 · Final barline" fill="#252a27"><rect x="1273" y="342" width="3.5" height="356"/><rect x="1283" y="342" width="11" height="356"/></g>
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
        
        <g class="mouth" transform="translate(292 350) scale(.71)"><use href="#ink" clip-path="url(#painted-mouth)"/></g>`;
    }
    this.setSyllable('YA');
    this.bindNotes();
  }
  setSyllable(value) {
    const original = this.watercolor && value === 'YA';
    this.querySelectorAll('.mouth').forEach(part => part.style.display = original ? '' : 'none');

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
    const heading = this.querySelector('.sheet-heading');
    const {width,scale} = drawHeading(heading,value,'音练习曲',670);
    const zoom = 1.37*scale;
    heading.setAttribute('transform','translate('+(745-width*zoom/2)+' 62) scale('+zoom+')');
    heading.setAttribute('aria-label',value+' 音练习曲');
    paintText(this.querySelector('.sheet-subtitle'),value+' Vocal Exercise',colors);
    const vowel = this.querySelector('.sheet-vowel');
    const vowelWidth = drawBubbles(vowel,value);
    this.querySelector('.end-mark').setAttribute('transform','translate('+(vowelWidth+12)+' 0)');
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
      const actions = {ArrowLeft:['pick', Math.max(0,index-1)],ArrowRight:['pick',Math.min(this.querySelector('.notes').children.length-1,index+1)],ArrowUp:['step',1],ArrowDown:['step',-1],Enter:['pick',index],' ':['pick',index]};
      if (!actions[event.key]) return;
      event.preventDefault();
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') this.send('pick', index);
      this.send(...actions[event.key]);
      this.querySelector('[aria-pressed="true"]').focus();
    };
  }
  update(values, active) {
    const symbols = symbolsFor(values);
    const spacing = Math.min(220, 880/Math.max(1,values.length-1));
    const hitWidth = Math.min(spacing,130);
    this.querySelector('.notes').innerHTML = values.map((pitch,index) => {
      const x = 360 + spacing * index, y = staffY(pitch), up = y > (bassPitch(pitch) ? 644 : 396);
      return `<g tabindex="0" role="button" data-note="${index}" aria-pressed="${index===active}" aria-label="第 ${index+1} 个音 ${pitches[pitch]}" class="${index===active?'selected':''}">
        <rect x="${x-hitWidth/2}" y="245" width="${hitWidth}" height="545" fill="transparent"/>
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
    this.innerHTML = `<div class="panel"><small>01 &nbsp; / &nbsp; NOTE EDITOR</small><h2>音高编辑</h2><label>练声音节 · Syllable <input id="syllable" value="YA" maxlength="12" lang="en" inputmode="text" autocapitalize="off" spellcheck="false"></label><br><label>选择音符 · Note</label><div class="steps"></div><div class="note-count"><button class="insert">＋ 加音</button> <button class="remove">− 删音</button> <output></output></div><label>八度组 · Octave <select class="octave"><option>3</option><option selected>4</option><option>5</option></select></label><div class="pitches"></div><p>← → 选音符　↑ ↓ 调音高</p><button class="reset">恢复初始旋律</button></div>`;
    const addButton = (parent, action, index) => {
      const button = document.createElement('button');
      button.dataset.index = index;
      button.onclick = () => this.send(action,index);
      parent.append(button);
      return button;
    };
    this.makeStep = index => addButton(this.querySelector('.steps'),'pick',index);
    this.querySelector('.insert').onclick = () => this.send('insert-note');
    this.querySelector('.remove').onclick = () => this.send('remove-note');
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
    const steps = this.querySelector('.steps');
    while (steps.children.length < values.length) this.makeStep(steps.children.length);
    while (steps.children.length > values.length) steps.lastElementChild.remove();
    this.querySelector('.insert').disabled = values.length >= maxNotes;
    this.querySelector('.remove').disabled = !values.length;
    this.querySelector('output').textContent = values.length+' / '+maxNotes;
    this.querySelectorAll('.pitches button').forEach(button => button.disabled = !values.length);
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
