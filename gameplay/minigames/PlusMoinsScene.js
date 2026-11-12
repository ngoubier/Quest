import { Scene } from '../../engine/index.js';
import { settingsForAge, judge, range } from './plusmoins.js';

// PLUS OU MOINS contre un habitant. Il pense à un nombre ; l'enfant le choisit (Haut/Bas : 1 de plus
// ou de moins, Gauche/Droite : 10 de moins ou de plus, ou les boutons à l'écran) et le propose (Action).
// L'habitant répond « plus grand » ou « plus petit ». B : abandonner.
// onDone(result) : 'win' | 'lose' | 'quit'

export class PlusMoinsScene extends Scene {
  constructor({ opponent = 'Habitant', age = 8, onDone, rand = Math.random } = {}) {
    super();
    this.transparent = true;
    this.opponent = String(opponent).split(',')[0];
    this.onDone = onDone;
    this.cfg = settingsForAge(age);
    this.secret = 1 + Math.floor(rand() * this.cfg.max);
    this.value = Math.ceil(this.cfg.max / 2);
    this.history = [];
    this.result = null;
    this.t = 0;
  }

  get box() {
    const r = this.game.renderer;
    const w = Math.min(r.width - 8, 210);
    const h = 150;
    return { x: Math.round((r.width - w) / 2), y: Math.max(18, Math.round((r.height - h) / 2) + 4), w, h };
  }

  /** Boutons tactiles : −10, −1, +1, +10, Proposer. */
  get buttons() {
    const b = this.box;
    const y = b.y + 58;
    const cx = b.x + b.w / 2;
    return [
      { id: -10, label: '−10', x: cx - 86, y, w: 28, h: 16 },
      { id: -1, label: '−1', x: cx - 54, y, w: 24, h: 16 },
      { id: 1, label: '+1', x: cx + 30, y, w: 24, h: 16 },
      { id: 10, label: '+10', x: cx + 58, y, w: 28, h: 16 },
      { id: 'ok', label: 'Proposer', x: cx - 26, y: y + 20, w: 52, h: 15 },
    ];
  }

  finish(res) {
    this.close();
    this.onDone?.(res);
  }

  change(d) {
    this.value = Math.max(1, Math.min(this.cfg.max, this.value + d));
    this.game.audio.play('menu_move');
  }

  propose() {
    const answer = judge(this.secret, this.value);
    this.history.push({ guess: this.value, answer });
    if (answer === 'gagne') {
      this.result = 'win';
      this.game.audio.play('quest_done');
    } else if (this.history.length >= this.cfg.tries) {
      this.result = 'lose';
      this.game.audio.play('quiz_ko');
    } else this.game.audio.play(answer === 'plus' ? 'shell_2' : 'shell_3');
    this.t = 0;
  }

  update(dt) {
    const i = this.input;
    this.t += dt;
    if (this.result) {
      if (this.t > 2.4 || (this.t > 0.8 && i.validated())) this.finish(this.result);
      return;
    }
    if (i.cancelled()) return this.finish('quit');
    if (i.pressed('up')) this.change(1);
    if (i.pressed('down')) this.change(-1);
    if (i.pressed('right')) this.change(10);
    if (i.pressed('left')) this.change(-10);
    for (const btn of this.buttons) {
      if (!i.tappedIn(btn)) continue;
      i.consumeTaps();
      return btn.id === 'ok' ? this.propose() : this.change(btn.id);
    }
    if (i.validated()) {
      i.consume('action');
      this.propose();
    }
  }

  draw(r) {
    const s = this.game.style;
    r.withAlpha(0.7, () => r.rect(0, 0, r.width, r.height, '#000'));
    const b = this.box;
    r.rect(b.x, b.y, b.w, b.h, s.box);
    r.strokeRect(b.x, b.y, b.w, b.h, s.border);
    const cx = b.x + b.w / 2;
    r.fitText(`Plus ou moins avec ${this.opponent}`, cx, b.y + 5, b.w - 8, { color: s.accent, size: 8, font: s.font, bold: true, align: 'center' });
    const left = this.cfg.tries - this.history.length;
    const last = this.history.at(-1);
    let msg = `Je pense à un nombre entre 1 et ${this.cfg.max}. Trouve-le en ${this.cfg.tries} essais !`;
    if (this.result === 'win') msg = `Bravo ! C’était bien ${this.secret}, trouvé en ${this.history.length} essai${this.history.length > 1 ? 's' : ''} !`;
    else if (this.result === 'lose') msg = `Perdu ! Mon nombre était ${this.secret}.`;
    else if (last) msg = `${last.guess} ? C’est ${last.answer === 'plus' ? 'PLUS GRAND' : 'PLUS PETIT'} ! (encore ${left} essai${left > 1 ? 's' : ''})`;
    r.fitText(msg, cx, b.y + 18, b.w - 10, { color: s.text, size: 7, font: s.font, align: 'center' });
    // le nombre choisi
    r.rect(cx - 22, b.y + 32, 44, 22, '#1a1020');
    r.strokeRect(cx - 22, b.y + 32, 44, 22, s.accent);
    r.text(String(this.value), cx, b.y + 36, { color: '#fff', size: 14, font: s.font, bold: true, align: 'center' });
    if (!this.result) {
      for (const btn of this.buttons) {
        r.rect(btn.x, btn.y, btn.w, btn.h, btn.id === 'ok' ? '#3a6a2a' : '#3a2a4a');
        r.strokeRect(btn.x, btn.y, btn.w, btn.h, s.border);
        r.text(btn.label, btn.x + btn.w / 2, btn.y + (btn.h - 8) / 2, { color: '#fff', size: 7, font: s.font, align: 'center' });
      }
    }
    // ce qu'on sait déjà : une règle de 1 au max, avec la zone encore possible
    const [lo, hi] = range(this.history, this.cfg.max);
    const rx = b.x + 14;
    const rw = b.w - 28;
    const ry = b.y + 100;
    const px = (v) => rx + ((v - 1) / Math.max(1, this.cfg.max - 1)) * rw;
    r.rect(rx, ry, rw, 4, '#444');
    if (lo <= hi) r.rect(Math.round(px(lo)) - 1, ry, Math.max(3, Math.round(px(hi) - px(lo)) + 2), 4, '#5ad87a');
    for (const h of this.history) r.rect(Math.round(px(h.guess)) - 1, ry - 3, 2, 10, h.answer === 'gagne' ? '#ffe066' : '#ff6a4a');
    r.text('1', rx, ry + 7, { color: s.dim, size: 6, font: s.font, align: 'center' });
    r.text(String(this.cfg.max), rx + rw, ry + 7, { color: s.dim, size: 6, font: s.font, align: 'center' });
    r.fitText('En vert : où le nombre peut encore être', cx, ry + 16, b.w - 8, { color: s.dim, size: 6, font: s.font, align: 'center' });
    r.fitText('▲▼ : ±1 · ◀▶ : ±10 · Action : proposer · B : abandonner', cx, b.y + b.h - 11, b.w - 8, { color: s.dim, size: 6, font: s.font, align: 'center' });
  }
}
