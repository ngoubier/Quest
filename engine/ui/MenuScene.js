import { Scene } from '../scene/Scene.js';
import { wrapText } from './text.js';

// Menu vertical générique (pause, choix, réglages...).
// items : [{ label: string | () => string, onSelect: (menu) => void, enabled?: () => boolean }]
// Haut/Bas pour naviguer, Action pour valider, Secondaire ou Start pour fermer.

export class MenuScene extends Scene {
  constructor({ title = '', items = [], onCancel = null, width = 160, dimBackground = true } = {}) {
    super();
    this.transparent = true;
    this.title = title;
    this.items = items;
    this.onCancel = onCancel;
    this.width = width;
    this.dimBackground = dimBackground;
    this.index = 0;
  }

  _label(it) {
    return typeof it.label === 'function' ? it.label() : it.label;
  }

  _enabled(it) {
    return it.enabled ? it.enabled() : true;
  }

  update() {
    const input = this.input;
    const n = this.items.length;
    if (input.pressed('up')) {
      this.index = (this.index - 1 + n) % n;
      this.game.audio.play('menu_move');
    }
    if (input.pressed('down')) {
      this.index = (this.index + 1) % n;
      this.game.audio.play('menu_move');
    }
    if (input.validated()) {
      const it = this.items[this.index];
      input.consume('action');
      if (this._enabled(it)) {
        this.game.audio.play('menu_ok');
        it.onSelect?.(this);
      } else this.game.audio.play('menu_no');
    } else if (input.cancelled()) {
      input.consume('start');
      this.close();
      this.onCancel?.();
    }
  }

  draw(r) {
    const s = this.game.style;
    if (this.dimBackground) r.withAlpha(0.45, () => r.rect(0, 0, r.width, r.height, '#000'));
    const lineH = s.fontSize + 6;
    const boxW = Math.min(this.width, r.width - 8);
    const titleLines = this.title ? wrapText(this.title, boxW - 16, (t) => r.measure(t, s.fontSize, s.font, true)) : [];
    const h = this.items.length * lineH + (this.title ? titleLines.length * (s.fontSize + 3) + lineH - s.fontSize + 3 : 0) + 14;
    const width = Math.min(this.width, r.width - 8);
    const x = Math.round((r.width - width) / 2);
    const y = Math.round((r.height - h) / 2);
    r.rect(x, y, width, h, s.box);
    r.strokeRect(x, y, width, h, s.border);
    r.strokeRect(x + 2, y + 2, width - 4, h - 4, s.border);
    let ty = y + 8;
    if (this.title) {
      titleLines.forEach((l, i) => r.fitText(l, x + width / 2, ty + i * (s.fontSize + 3), width - 16, { color: s.accent, size: s.fontSize, font: s.font, bold: true, align: 'center' }));
      ty += (titleLines.length - 1) * (s.fontSize + 3);
      ty += lineH + 6;
    }
    this.items.forEach((it, i) => {
      const sel = i === this.index;
      const color = !this._enabled(it) ? s.dim : sel ? s.accent : s.text;
      if (sel) r.text('▶', x + 8, ty, { color: s.accent, size: s.fontSize, font: s.font });
      r.fitText(this._label(it), x + 20, ty, width - 28, { color, size: s.fontSize, font: s.font });
      ty += lineH;
    });
  }
}
