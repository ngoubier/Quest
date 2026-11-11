import { Scene, wrapText } from '../../engine/index.js';

// HISTOIRE EN IMAGES — une suite de pages : une illustration (dessinée par le jeu) et un texte
// qui s'écrit lettre par lettre. Action : accélérer puis page suivante. Start : passer l'histoire.
//
//   new StoryScene({ pages: [{ text: 'Il était une fois...', paint(r, box, t) {} }], onDone() {} })
//   paint reçoit la zone de l'image `box` ({x, y, w, h}) et le temps écoulé sur la page `t`.

export class StoryScene extends Scene {
  constructor({ pages, onDone, speed = 40 } = {}) {
    super();
    this.pages = pages;
    this.onDone = onDone;
    this.speed = speed;
    this.page = 0;
    this.t = 0;
    this.done = false;
  }

  get textH() {
    return 52;
  }

  finish() {
    if (this.done) return;
    this.done = true;
    this.onDone?.();
  }

  next() {
    if (this.page >= this.pages.length - 1) return this.finish();
    this.page++;
    this.t = 0;
    this.game.audio.play('menu_move');
  }

  update(dt) {
    if (this.done) return;
    const i = this.input;
    this.t += dt;
    const len = this.pages[this.page].text.length;
    const shown = this.t * this.speed;
    if (i.pressed('start')) return this.finish();
    const tap = i.tappedIn({ x: 0, y: 0, w: this.game.width, h: this.game.height });
    if (tap) i.consumeTaps();
    if (i.validated() || tap) {
      i.consume('action');
      if (shown < len) this.t = len / this.speed;
      else this.next();
    }
  }

  draw(r) {
    const s = this.game.style;
    const p = this.pages[this.page];
    r.rect(0, 0, r.width, r.height, '#07060f');
    const box = { x: 0, y: 0, w: r.width, h: r.height - this.textH };
    const c = r.ctx;
    c.save();
    c.beginPath();
    c.rect(box.x, box.y, box.w, box.h);
    c.clip();
    p.paint?.(r, box, this.t);
    c.restore();
    // fondu d'entrée de page
    if (this.t < 0.4) r.withAlpha(1 - this.t / 0.4, () => r.rect(0, 0, r.width, box.h, '#07060f'));
    const ty = box.h;
    r.rect(0, ty, r.width, this.textH, s.box);
    r.rect(0, ty, r.width, 1, s.border);
    const shown = Math.floor(this.t * this.speed);
    const lines = wrapText(p.text, r.width - 16, (str) => r.measure(str, 8, s.font));
    let left = shown;
    lines.slice(0, 4).forEach((l, k) => {
      const part = l.slice(0, Math.max(0, left));
      left -= l.length + 1;
      r.text(part, 8, ty + 5 + k * 11, { color: s.text, size: 8, font: s.font });
    });
    if (shown >= p.text.length && Math.floor(this.game.time * 2) % 2 === 0) r.text('▼', r.width - 12, r.height - 11, { color: s.accent, size: 7, font: s.font });
    r.text(`${this.page + 1}/${this.pages.length} · Start : passer`, r.width - 4, 3, { color: 'rgba(255,255,255,.55)', size: 6, font: s.font, align: 'right' });
  }
}
