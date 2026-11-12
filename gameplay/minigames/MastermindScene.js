import { Scene } from '../../engine/index.js';
import { makeCode, score, settingsForAge } from './mastermind.js';

// CODE SECRET contre un habitant : il cache 3 couleurs, l'enfant a 8 essais pour les trouver.
// Gauche/Droite : choisir la case · Haut/Bas : changer la couleur · Action : proposer · B : abandonner.
// Tactile : toucher une case change sa couleur ; « OK » propose.
// Après chaque essai : ● vert = bonne couleur à la bonne place, ● jaune = bonne couleur mal placée.
// onDone(result) : 'win' | 'lose' | 'quit'

export const CODE_COLORS = [
  ['#e83a3a', 'rouge'],
  ['#3a7ae8', 'bleu'],
  ['#4ac84a', 'vert'],
  ['#f4c020', 'jaune'],
  ['#b36bff', 'violet'],
];

export class MastermindScene extends Scene {
  constructor({ opponent = 'Habitant', age = 8, onDone, rand = Math.random } = {}) {
    super();
    this.transparent = true;
    this.opponent = String(opponent).split(',')[0];
    this.onDone = onDone;
    this.cfg = settingsForAge(age);
    this.code = makeCode(this.cfg.length, this.cfg.colors, rand);
    this.guess = Array(this.cfg.length).fill(0);
    this.cursor = 0;
    this.history = [];
    this.result = null;
    this.wait = 0;
  }

  get box() {
    const r = this.game.renderer;
    const w = Math.min(r.width - 8, 196);
    const h = Math.min(r.height - 20, 176);
    return { x: Math.round((r.width - w) / 2), y: Math.round((r.height - h) / 2) + 8, w, h };
  }

  slot(i) {
    const b = this.box;
    return { x: b.x + 22 + i * 22, y: b.y + b.h - 42, w: 18, h: 18 };
  }

  get okButton() {
    const s = this.slot(this.cfg.length);
    return { x: s.x + 6, y: s.y, w: 28, h: 18 };
  }

  propose() {
    const res = score(this.code, this.guess);
    this.history.push({ guess: [...this.guess], ...res });
    if (res.exact === this.cfg.length) {
      this.result = 'win';
      this.game.audio.play('quest_done');
    } else if (this.history.length >= this.cfg.tries) {
      this.result = 'lose';
      this.game.audio.play('quiz_ko');
    } else this.game.audio.play(res.exact + res.near ? 'menu_ok' : 'menu_no');
    if (this.result) this.wait = 2.5;
  }

  change(i, by) {
    const n = this.cfg.colors;
    this.guess[i] = (this.guess[i] + by + n) % n;
    this.game.audio.play('menu_move');
  }

  finish(result) {
    this.close();
    this.onDone?.(result);
  }

  update(dt) {
    const i = this.input;
    if (this.result) {
      this.wait -= dt;
      if (this.wait <= 0 || (this.wait < 2 && i.validated())) this.finish(this.result);
      return;
    }
    if (i.cancelled()) return this.finish('quit');
    const n = this.cfg.length;
    if (i.pressed('left')) (this.cursor = (this.cursor - 1 + n) % n), this.game.audio.play('menu_move');
    if (i.pressed('right')) (this.cursor = (this.cursor + 1) % n), this.game.audio.play('menu_move');
    if (i.pressed('up')) this.change(this.cursor, 1);
    if (i.pressed('down')) this.change(this.cursor, -1);
    for (let k = 0; k < n; k++) if (i.tappedIn(this.slot(k))) (i.consumeTaps(), (this.cursor = k), this.change(k, 1));
    if (i.tappedIn(this.okButton)) return (i.consumeTaps(), this.propose());
    if (i.validated()) {
      i.consume('action');
      this.propose();
    }
  }

  peg(r, x, y, c, size = 10) {
    r.rect(x + 1, y, size - 2, size, '#141414');
    r.rect(x, y + 1, size, size - 2, '#141414');
    r.rect(x + 1, y + 1, size - 2, size - 2, CODE_COLORS[c][0]);
    r.rect(x + 2, y + 2, 2, 2, 'rgba(255,255,255,.6)');
  }

  draw(r) {
    const s = this.game.style;
    r.withAlpha(0.7, () => r.rect(0, 0, r.width, r.height, '#000'));
    const b = this.box;
    r.rect(b.x, b.y, b.w, b.h, s.box);
    r.strokeRect(b.x, b.y, b.w, b.h, s.border);
    r.fitText(`Code secret de ${this.opponent}`, r.width / 2, b.y + 4, b.w - 8, { color: s.accent, size: 8, font: s.font, bold: true, align: 'center' });
    const left = this.cfg.tries - this.history.length;
    const status = this.result === 'win' ? 'Bravo, tu as trouvé le code !' : this.result === 'lose' ? 'Perdu ! Le code était :' : `${this.cfg.length} couleurs cachées · ${left} essai${left > 1 ? 's' : ''}`;
    r.fitText(status, r.width / 2, b.y + 15, b.w - 8, { color: s.text, size: 7, font: s.font, align: 'center' });
    // essais précédents, sur deux colonnes
    const rowsY = b.y + 27;
    const rowH = Math.min(12, Math.floor((b.h - 80) / 4));
    this.history.forEach((h, k) => {
      const x = b.x + 8 + (k >= 4 ? Math.round(b.w / 2) : 0);
      const y = rowsY + (k % 4) * rowH;
      h.guess.forEach((c, j) => this.peg(r, x + j * 11, y, c, 9));
      let px = x + h.guess.length * 11 + 4;
      for (let e = 0; e < h.exact; e++, px += 6) r.rect(px, y + 2, 5, 5, '#3ac46a');
      for (let e = 0; e < h.near; e++, px += 6) r.rect(px, y + 2, 5, 5, '#f4c020');
    });
    // proposition en cours (ou le code, à la fin)
    const shown = this.result ? this.code : this.guess;
    shown.forEach((c, k) => {
      const q = this.slot(k);
      if (!this.result && k === this.cursor) r.strokeRect(q.x - 2, q.y - 2, q.w + 4, q.h + 4, s.accent, 2);
      this.peg(r, q.x, q.y, c, 18);
    });
    if (!this.result) {
      const o = this.okButton;
      r.rect(o.x, o.y, o.w, o.h, s.accent);
      r.rect(o.x + 1, o.y + 1, o.w - 2, o.h - 2, s.box);
      r.fitText('OK', o.x + o.w / 2, o.y + 5, o.w - 4, { color: s.accent, size: 8, font: s.font, bold: true, align: 'center' });
    }
    // légende avec les vraies couleurs
    const y = b.y + b.h - 20;
    const t1 = 'bien placée';
    const t2 = 'mal placée';
    const w1 = r.measure(t1, 6, s.font);
    const w2 = r.measure(t2, 6, s.font);
    let lx = Math.round(r.width / 2 - (w1 + w2 + 30) / 2);
    r.rect(lx, y + 1, 5, 5, '#3ac46a');
    r.text(t1, lx + 8, y, { color: s.dim, size: 6, font: s.font });
    lx += w1 + 22;
    r.rect(lx, y + 1, 5, 5, '#f4c020');
    r.text(t2, lx + 8, y, { color: s.dim, size: 6, font: s.font });
    r.fitText('▲▼ : couleur · ◀▶ : case · Action : proposer', r.width / 2, b.y + b.h - 11, b.w - 8, { color: s.dim, size: 6, font: s.font, align: 'center' });
  }
}
