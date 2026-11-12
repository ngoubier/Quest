import { Scene } from '../../engine/index.js';
import { extend, check, targetForAge } from './simon.js';

// LE CHANT DES COQUILLAGES contre une habitante : elle chante une suite, l'enfant la répète.
// 4 coquillages = 4 directions (Haut, Droite, Bas, Gauche) ; tactile : toucher le coquillage. B : abandonner.
// onDone(result) : 'win' | 'lose' | 'quit'

const SHELLS = [
  { dir: 'up', col: '#ff6a8a', light: '#ffc0d0' },
  { dir: 'right', col: '#5ac8ff', light: '#c8f0ff' },
  { dir: 'down', col: '#ffd35a', light: '#fff4c0' },
  { dir: 'left', col: '#7ae07a', light: '#d0ffd0' },
];

export class SimonScene extends Scene {
  constructor({ opponent = 'Habitante', age = 8, onDone, rand = Math.random } = {}) {
    super();
    this.transparent = true;
    this.opponent = String(opponent).split(',')[0];
    this.onDone = onDone;
    this.rand = rand;
    this.target = targetForAge(age);
    this.seq = extend(extend([], rand), rand);
    this.inputs = [];
    this.phase = 'listen';
    this.t = -0.6;
    this.lit = -1;
    this.litT = 0;
    this.result = null;
  }

  get box() {
    const r = this.game.renderer;
    const w = Math.min(r.width - 8, 180);
    return { x: Math.round((r.width - w) / 2), y: Math.round((r.height - 150) / 2) + 8, w, h: 150 };
  }

  shellRect(i) {
    const b = this.box;
    const cx = b.x + b.w / 2;
    const cy = b.y + 78;
    const [dx, dy] = [[0, -1], [1, 0], [0, 1], [-1, 0]][i];
    return { x: Math.round(cx + dx * 34 - 14), y: Math.round(cy + dy * 30 - 12), w: 28, h: 24 };
  }

  light(i) {
    this.lit = i;
    this.litT = 0.35;
    this.game.audio.play(`shell_${i}`);
  }

  press(i) {
    this.light(i);
    this.inputs.push(i);
    const res = check(this.seq, this.inputs);
    if (res === 'wrong') return this.end('lose');
    if (res === 'round') {
      if (this.seq.length >= this.target) return this.end('win');
      this.seq = extend(this.seq, this.rand);
      this.inputs = [];
      this.phase = 'listen';
      this.t = -0.9;
    }
  }

  end(result) {
    this.result = result;
    this.phase = 'end';
    this.t = 0;
    this.game.audio.play(result === 'win' ? 'quest_done' : 'quiz_ko');
  }

  finish(res) {
    this.close();
    this.onDone?.(res);
  }

  update(dt) {
    const i = this.input;
    this.litT -= dt;
    if (this.litT <= 0) this.lit = -1;
    if (this.phase === 'end') {
      this.t += dt;
      if (this.t > 2 || (this.t > 0.8 && i.validated())) this.finish(this.result);
      return;
    }
    if (i.cancelled()) return this.finish('quit');
    if (this.phase === 'listen') {
      // l'habitante chante la suite, un coquillage toutes les 0,6 s
      const before = Math.floor(this.t / 0.6);
      this.t += dt;
      const now = Math.floor(this.t / 0.6);
      if (now !== before && now >= 0 && now < this.seq.length) this.light(this.seq[now]);
      if (this.t > this.seq.length * 0.6 + 0.2) this.phase = 'play';
      return;
    }
    for (let k = 0; k < 4; k++) {
      if (i.pressed(SHELLS[k].dir) || i.tappedIn(this.shellRect(k))) {
        i.consumeTaps();
        return this.press(k);
      }
    }
  }

  draw(r) {
    const s = this.game.style;
    r.withAlpha(0.7, () => r.rect(0, 0, r.width, r.height, '#000'));
    const b = this.box;
    r.rect(b.x, b.y, b.w, b.h, '#0c2a4a');
    r.strokeRect(b.x, b.y, b.w, b.h, s.border);
    r.fitText(`Le chant des coquillages de ${this.opponent}`, r.width / 2, b.y + 5, b.w - 8, { color: s.accent, size: 8, font: s.font, bold: true, align: 'center' });
    const msg = this.phase === 'listen' ? 'Écoute bien...' : this.phase === 'play' ? `À toi ! (${this.inputs.length}/${this.seq.length})` : this.result === 'win' ? 'Bravo, tu chantes comme une sirène !' : 'Oups, ce n’était pas celui-là...';
    r.fitText(msg, r.width / 2, b.y + 17, b.w - 8, { color: s.text, size: 7, font: s.font, align: 'center' });
    SHELLS.forEach((sh, k) => {
      const q = this.shellRect(k);
      const on = this.lit === k;
      const c = on ? sh.light : sh.col;
      // coquillage en éventail
      r.rect(q.x + 4, q.y + 2, q.w - 8, q.h - 4, '#141414');
      r.rect(q.x + 2, q.y + 5, q.w - 4, q.h - 10, '#141414');
      r.rect(q.x + 5, q.y + 3, q.w - 10, q.h - 6, c);
      r.rect(q.x + 3, q.y + 6, q.w - 6, q.h - 12, c);
      for (let x = q.x + 7; x < q.x + q.w - 6; x += 4) r.rect(x, q.y + 4, 1, q.h - 8, on ? '#ffffff' : 'rgba(0,0,0,.25)');
      r.rect(q.x + q.w / 2 - 3, q.y + q.h - 4, 6, 3, '#141414');
      if (on) r.strokeRect(q.x - 2, q.y - 2, q.w + 4, q.h + 4, '#ffffff', 2);
    });
    r.fitText(`Manche : ${this.seq.length} coquillages · but : ${this.target}`, r.width / 2, b.y + b.h - 22, b.w - 8, { color: s.dim, size: 6, font: s.font, align: 'center' });
    r.fitText('Flèches (ou toucher) : chanter · B : abandonner', r.width / 2, b.y + b.h - 12, b.w - 8, { color: s.dim, size: 6, font: s.font, align: 'center' });
  }
}
