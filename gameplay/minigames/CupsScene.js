import { Scene } from '../../engine/index.js';
import { makeSwaps, ballSlot, settingsForAge } from './cups.js';

// LES 3 GOBELETS contre un habitant. Il montre la bille, la cache, mélange les gobelets ;
// l'enfant choisit (Gauche/Droite + Action, ou toucher le gobelet). B : abandonner.
// onDone(result) : 'win' | 'lose' | 'quit'

export class CupsScene extends Scene {
  constructor({ opponent = 'Habitant', age = 8, onDone, rand = Math.random } = {}) {
    super();
    this.transparent = true;
    this.opponent = String(opponent).split(',')[0];
    this.onDone = onDone;
    this.cfg = settingsForAge(age);
    this.start = Math.floor(rand() * 3);
    this.swaps = makeSwaps(this.cfg.swaps, rand);
    this.answer = ballSlot(this.start, this.swaps);
    this.phase = 'show'; // show → shuffle → choose → reveal
    this.t = 0;
    this.step = 0;
    this.slotOf = [0, 1, 2]; // place de chaque gobelet (gobelet i est à la place slotOf[i])
    this.ballCup = this.start; // le gobelet qui couvre la bille
    this.cursor = 1;
    this.result = null;
  }

  get box() {
    const r = this.game.renderer;
    const w = Math.min(r.width - 8, 190);
    return { x: Math.round((r.width - w) / 2), y: Math.round((r.height - 120) / 2) + 6, w, h: 120 };
  }

  slotX(slot) {
    const b = this.box;
    return b.x + b.w / 2 + (slot - 1) * 50;
  }

  cupRect(slot) {
    return { x: this.slotX(slot) - 16, y: this.box.y + 40, w: 32, h: 36 };
  }

  finish(res) {
    this.close();
    this.onDone?.(res);
  }

  choose(slot) {
    this.phase = 'reveal';
    this.t = 0;
    this.picked = slot;
    this.result = slot === this.answer ? 'win' : 'lose';
    this.game.audio.play(this.result === 'win' ? 'quest_done' : 'quiz_ko');
  }

  update(dt) {
    const i = this.input;
    this.t += dt;
    if (this.phase === 'show') {
      if (this.t > 1.6) (this.phase = 'shuffle'), (this.t = 0);
      return;
    }
    if (this.phase === 'shuffle') {
      if (this.t >= this.cfg.duration) {
        const [a, b] = this.swaps[this.step];
        for (let c = 0; c < 3; c++) this.slotOf[c] = this.slotOf[c] === a ? b : this.slotOf[c] === b ? a : this.slotOf[c];
        this.step++;
        this.t = 0;
        this.game.audio.play('menu_move');
        if (this.step >= this.swaps.length) this.phase = 'choose';
      }
      return;
    }
    if (this.phase === 'reveal') {
      if (this.t > 2.2 || (this.t > 0.8 && i.validated())) this.finish(this.result);
      return;
    }
    if (i.cancelled()) return this.finish('quit');
    if (i.pressed('left')) (this.cursor = Math.max(0, this.cursor - 1)), this.game.audio.play('menu_move');
    if (i.pressed('right')) (this.cursor = Math.min(2, this.cursor + 1)), this.game.audio.play('menu_move');
    for (let s = 0; s < 3; s++) if (i.tappedIn(this.cupRect(s))) return (i.consumeTaps(), this.choose(s));
    if (i.validated()) {
      i.consume('action');
      this.choose(this.cursor);
    }
  }

  /** Position (x) d'un gobelet, avec l'animation d'échange en arc. */
  cupPos(c) {
    let x = this.slotX(this.slotOf[c]);
    let lift = 0;
    if (this.phase === 'shuffle' && this.step < this.swaps.length) {
      const [a, b] = this.swaps[this.step];
      const s = this.slotOf[c];
      if (s === a || s === b) {
        const to = s === a ? b : a;
        const k = Math.min(1, this.t / this.cfg.duration);
        x = this.slotX(s) + (this.slotX(to) - this.slotX(s)) * k;
        lift = Math.sin(k * Math.PI) * (s === a ? 10 : -6);
      }
    }
    return { x, lift };
  }

  drawCup(r, x, y) {
    r.rect(x - 12, y, 24, 30, '#7a3a1a');
    r.rect(x - 11, y + 1, 22, 28, '#c8642a');
    r.rect(x - 14, y + 28, 28, 4, '#7a3a1a');
    r.rect(x - 8, y + 4, 4, 20, '#e8945a');
    r.rect(x - 6, y - 2, 12, 3, '#7a3a1a');
  }

  draw(r) {
    const s = this.game.style;
    r.withAlpha(0.7, () => r.rect(0, 0, r.width, r.height, '#000'));
    const b = this.box;
    r.rect(b.x, b.y, b.w, b.h, s.box);
    r.strokeRect(b.x, b.y, b.w, b.h, s.border);
    r.fitText(`Les 3 gobelets de ${this.opponent}`, r.width / 2, b.y + 5, b.w - 8, { color: s.accent, size: 8, font: s.font, bold: true, align: 'center' });
    const msg = {
      show: 'Regarde bien : la bille est ici !',
      shuffle: 'Ne quitte pas le gobelet des yeux...',
      choose: 'Où est la bille ?',
      reveal: this.result === 'win' ? 'Bravo, tu l’as trouvée !' : 'Raté ! Elle était là.',
    }[this.phase];
    r.fitText(msg, r.width / 2, b.y + 18, b.w - 8, { color: s.text, size: 7, font: s.font, align: 'center' });
    const table = b.y + 78;
    r.rect(b.x + 8, table, b.w - 16, 4, '#8a5a2a');
    const ballVisible = this.phase === 'show' || this.phase === 'reveal';
    const ballX = this.slotX(this.phase === 'show' ? this.start : this.answer);
    if (ballVisible) (r.rect(ballX - 4, table - 8, 8, 8, '#e83a3a'), r.rect(ballX - 2, table - 7, 2, 2, '#ffb0b0'));
    for (let c = 0; c < 3; c++) {
      const { x, lift } = this.cupPos(c);
      const slot = this.slotOf[c];
      const raised = (this.phase === 'show' && slot === this.start) || (this.phase === 'reveal' && (slot === this.answer || slot === this.picked));
      this.drawCup(r, x, table - 32 - lift - (raised ? 16 : 0));
    }
    if (this.phase === 'choose' && Math.floor(this.game.time * 3) % 3 !== 0) r.text('▲', this.slotX(this.cursor), table + 8, { color: s.accent, size: 9, font: s.font, align: 'center' });
    r.fitText('◀ ▶ : choisir · Action : soulever · B : abandonner', r.width / 2, b.y + b.h - 12, b.w - 8, { color: s.dim, size: 6, font: s.font, align: 'center' });
  }
}
