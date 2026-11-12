import { Scene } from '../../engine/index.js';
import { drawPanel } from '../../engine/index.js';

// CADENAS À CHIFFRES (coffre à code). Chaque chiffre est une petite roue :
// Haut/Bas : changer le chiffre · Gauche/Droite : chiffre suivant · Action : ouvrir · B : annuler.
// Tactile : toucher ▲ ou ▼ au-dessus / au-dessous d'un chiffre, puis « Ouvrir ».
// onOk(code) reçoit les chiffres choisis (ex. '42') ; la vérification est faite par l'appelant.

export class DigitLockScene extends Scene {
  constructor({ digits = 2, title = 'Coffre à code', onOk, onCancel } = {}) {
    super();
    this.transparent = true;
    this.values = Array(digits).fill(0);
    this.cursor = 0;
    this.title = title;
    this.onOk = onOk;
    this.onCancel = onCancel;
  }

  get box() {
    const r = this.game.renderer;
    const w = Math.min(r.width - 16, 180);
    return { x: Math.round((r.width - w) / 2), y: Math.round((r.height - 120) / 2) + 8, w, h: 120 };
  }

  wheel(i) {
    const b = this.box;
    const n = this.values.length;
    const x0 = Math.round(b.x + b.w / 2 - (n * 30 - 6) / 2);
    return { x: x0 + i * 30, y: b.y + 30, w: 24, h: 60 };
  }

  get okButton() {
    const b = this.box;
    return { x: b.x + b.w / 2 - 30, y: b.y + b.h - 24, w: 60, h: 16 };
  }

  change(i, by) {
    this.values[i] = (this.values[i] + by + 10) % 10;
    this.game.audio.play('menu_move');
  }

  submit() {
    this.game.audio.play('menu_ok');
    this.close();
    this.onOk?.(this.values.join(''));
  }

  update() {
    const i = this.input;
    if (i.cancelled()) {
      this.close();
      return this.onCancel?.();
    }
    const n = this.values.length;
    if (i.pressed('left')) (this.cursor = (this.cursor - 1 + n) % n), this.game.audio.play('menu_move');
    if (i.pressed('right')) (this.cursor = (this.cursor + 1) % n), this.game.audio.play('menu_move');
    if (i.pressed('up')) this.change(this.cursor, 1);
    if (i.pressed('down')) this.change(this.cursor, -1);
    for (let k = 0; k < n; k++) {
      const w = this.wheel(k);
      if (i.tappedIn({ x: w.x, y: w.y, w: w.w, h: 20 })) (i.consumeTaps(), (this.cursor = k), this.change(k, 1));
      if (i.tappedIn({ x: w.x, y: w.y + 40, w: w.w, h: 20 })) (i.consumeTaps(), (this.cursor = k), this.change(k, -1));
    }
    if (i.tappedIn(this.okButton)) return (i.consumeTaps(), this.submit());
    if (i.validated()) {
      i.consume('action');
      this.submit();
    }
  }

  draw(r) {
    const s = this.game.style;
    r.withAlpha(0.7, () => r.rect(0, 0, r.width, r.height, '#000'));
    const b = this.box;
    drawPanel(r, b.x, b.y, b.w, b.h, s);
    r.fitText(this.title, r.width / 2, b.y + 5, b.w - 8, { color: s.accent, size: 8, font: s.font, bold: true, align: 'center' });
    r.fitText('Trouve le bon code !', r.width / 2, b.y + 17, b.w - 8, { color: s.dim, size: 6, font: s.font, align: 'center' });
    this.values.forEach((v, k) => {
      const w = this.wheel(k);
      const sel = k === this.cursor;
      r.text('▲', w.x + w.w / 2, w.y + 4, { color: sel ? s.accent : s.dim, size: 8, font: s.font, align: 'center' });
      r.rect(w.x, w.y + 18, w.w, 24, sel ? s.accent : s.dim);
      r.rect(w.x + 1, w.y + 19, w.w - 2, 22, '#f4e8c8');
      r.text(String(v), w.x + w.w / 2, w.y + 22, { color: '#2a1a0c', size: 14, font: s.font, bold: true, align: 'center' });
      r.text('▼', w.x + w.w / 2, w.y + 46, { color: sel ? s.accent : s.dim, size: 8, font: s.font, align: 'center' });
    });
    const o = this.okButton;
    r.rect(o.x, o.y, o.w, o.h, s.accent);
    r.rect(o.x + 1, o.y + 1, o.w - 2, o.h - 2, s.box);
    r.fitText('Ouvrir', o.x + o.w / 2, o.y + 4, o.w - 4, { color: s.accent, size: 7, font: s.font, bold: true, align: 'center' });
  }
}
