import { Scene } from '../../engine/index.js';
import { aiTake, MAX_TAKE } from './nim.js';
import { skillForAge } from './tictactoe.js';

// LE DERNIER GLAÇON contre un habitant. 15 glaçons : chacun en prend 1, 2 ou 3.
// Celui qui prend le dernier a perdu. L'enfant commence.
// Gauche/Droite : choisir combien · Action : prendre · B : abandonner. Tactile : toucher 1, 2 ou 3.
// onDone(result) : 'win' | 'lose' | 'quit'

export class NimScene extends Scene {
  constructor({ opponent = 'Habitant', age = 8, onDone, rand = Math.random, count = 15 } = {}) {
    super();
    this.transparent = true;
    this.opponent = String(opponent).split(',')[0];
    this.skill = skillForAge(age);
    this.onDone = onDone;
    this.rand = rand;
    this.total = count;
    this.left = count;
    this.pick = 1;
    this.turn = 'me';
    this.last = null; // dernier coup : { who, n }
    this.result = null;
    this.wait = 0;
  }

  get box() {
    const r = this.game.renderer;
    const w = Math.min(r.width - 8, 200);
    return { x: Math.round((r.width - w) / 2), y: 30, w, h: 132 };
  }

  button(k) {
    const b = this.box;
    return { x: b.x + b.w / 2 - 51 + (k - 1) * 36, y: b.y + 86, w: 30, h: 20 };
  }

  take(n, who) {
    n = Math.max(1, Math.min(n, this.left, MAX_TAKE));
    this.left -= n;
    this.last = { who, n };
    this.game.audio.play(who === 'me' ? 'menu_ok' : 'menu_move');
    if (this.left === 0) {
      this.result = who === 'me' ? 'lose' : 'win';
      this.wait = 1.8;
      this.game.audio.play(this.result === 'win' ? 'quest_done' : 'quiz_ko');
      return;
    }
    this.turn = who === 'me' ? 'ai' : 'me';
    this.wait = 0.8;
    this.pick = Math.min(this.pick, this.left);
  }

  finish(result) {
    this.close();
    this.onDone?.(result);
  }

  update(dt) {
    const i = this.input;
    if (this.result) {
      this.wait -= dt;
      if (this.wait <= 0 || (this.wait < 1.3 && i.validated())) this.finish(this.result);
      return;
    }
    if (i.cancelled()) return this.finish('quit');
    if (this.turn === 'ai') {
      if ((this.wait -= dt) <= 0) this.take(aiTake(this.left, { skill: this.skill, rand: this.rand }), 'ai');
      return;
    }
    const max = Math.min(MAX_TAKE, this.left);
    const p = this.pick;
    if (i.pressed('left')) this.pick = Math.max(1, this.pick - 1);
    if (i.pressed('right')) this.pick = Math.min(max, this.pick + 1);
    if (this.pick !== p) this.game.audio.play('menu_move');
    for (let k = 1; k <= max; k++) {
      if (i.tappedIn(this.button(k))) {
        i.consumeTaps();
        return this.take(k, 'me');
      }
    }
    if (i.validated()) {
      i.consume('action');
      this.take(this.pick, 'me');
    }
  }

  draw(r) {
    const s = this.game.style;
    r.withAlpha(0.7, () => r.rect(0, 0, r.width, r.height, '#000'));
    const b = this.box;
    r.rect(b.x, b.y, b.w, b.h, s.box);
    r.strokeRect(b.x, b.y, b.w, b.h, s.border);
    r.fitText(`Le dernier glaçon contre ${this.opponent}`, r.width / 2, b.y + 5, b.w - 8, { color: s.accent, size: 8, font: s.font, bold: true, align: 'center' });
    const status = this.result
      ? this.result === 'win'
        ? `${this.opponent} prend le dernier : tu gagnes !`
        : 'Tu as pris le dernier : perdu...'
      : this.turn === 'me'
        ? this.last
          ? `${this.opponent} en a pris ${this.last.n}. À toi !`
          : 'Prends 1, 2 ou 3 glaçons. Ne prends pas le dernier !'
        : `${this.opponent} réfléchit...`;
    r.fitText(status, r.width / 2, b.y + 18, b.w - 8, { color: s.text, size: 7, font: s.font, align: 'center' });
    // les glaçons (les pris sont en pointillés)
    const perRow = 8;
    const gx = b.x + Math.round((b.w - perRow * 20) / 2);
    for (let k = 0; k < this.total; k++) {
      const x = gx + (k % perRow) * 20 + (k >= perRow ? 10 : 0);
      const y = b.y + 34 + Math.floor(k / perRow) * 22;
      if (k < this.left) {
        const hot = this.turn === 'me' && !this.result && k >= this.left - this.pick;
        r.rect(x, y, 16, 16, '#3a8ac0');
        r.rect(x, y, 15, 15, hot ? '#fff2a0' : '#9fdcff');
        r.rect(x + 1, y + 1, 13, 2, '#ffffff');
        r.rect(x + 2, y + 4, 2, 6, '#e6f8ff');
      } else r.strokeRect(x + 2, y + 2, 12, 12, s.dim);
    }
    r.fitText(`Il reste ${this.left} glaçon${this.left > 1 ? 's' : ''}`, r.width / 2, b.y + 76, b.w - 8, { color: s.dim, size: 6, font: s.font, align: 'center' });
    // boutons 1 2 3
    if (!this.result) {
      const max = Math.min(MAX_TAKE, this.left);
      for (let k = 1; k <= MAX_TAKE; k++) {
        const q = this.button(k);
        const sel = this.turn === 'me' && k === this.pick;
        r.rect(q.x, q.y, q.w, q.h, sel ? s.accent : s.dim);
        r.rect(q.x + 1, q.y + 1, q.w - 2, q.h - 2, s.box);
        r.text(String(k), q.x + q.w / 2, q.y + 5, { color: k > max ? s.dim : sel ? s.accent : s.text, size: 10, font: s.font, bold: true, align: 'center' });
      }
    }
    r.fitText('◀ ▶ : combien · Action : prendre · B : abandonner', r.width / 2, b.y + b.h - 13, b.w - 8, { color: s.dim, size: 6, font: s.font, align: 'center' });
  }
}
