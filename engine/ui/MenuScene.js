import { Scene } from '../scene/Scene.js';
import { wrapText } from './text.js';
import { drawPanel } from './panel.js';

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
    const titleH = this.title ? titleLines.length * (s.fontSize + 3) + lineH - s.fontSize + 3 : 0;
    // Trop de lignes pour la hauteur de l'écran : la liste défile autour de la ligne choisie.
    const n = this.items.length;
    const rows = Math.max(1, Math.min(n, Math.floor((r.height - 4 - titleH - 14) / lineH)));
    const first = Math.max(0, Math.min(this.index - Math.floor(rows / 2), n - rows));
    const h = rows * lineH + titleH + 14;
    const width = Math.min(this.width, r.width - 8);
    const x = Math.round((r.width - width) / 2);
    const y = Math.round((r.height - h) / 2);
    drawPanel(r, x, y, width, h, s);
    let ty = y + 8;
    if (this.title) {
      titleLines.forEach((l, i) => r.fitText(l, x + width / 2, ty + i * (s.fontSize + 3), width - 16, { color: s.accent, size: s.fontSize, font: s.font, bold: true, align: 'center' }));
      ty += (titleLines.length - 1) * (s.fontSize + 3);
      ty += lineH + 6;
    }
    const arrow = { color: s.dim, size: Math.max(6, s.fontSize - 2), font: s.font, align: 'right' };
    if (first > 0) r.text('▲', x + width - 8, ty, arrow);
    if (first + rows < n) r.text('▼', x + width - 8, ty + (rows - 1) * lineH, arrow);
    this.items.slice(first, first + rows).forEach((it, k) => {
      const sel = first + k === this.index;
      const color = !this._enabled(it) ? s.dim : sel ? s.accent : s.text;
      if (sel) r.text('▶', x + 8, ty, { color: s.accent, size: s.fontSize, font: s.font });
      r.fitText(this._label(it), x + 20, ty, width - 36, { color, size: s.fontSize, font: s.font });
      ty += lineH;
    });
  }
}
