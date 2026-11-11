import { Scene } from '../scene/Scene.js';
import { wrapText } from './text.js';

// Boîte de dialogue : texte qui s'affiche lettre par lettre, plusieurs pages.
// Action : accélérer / page suivante. Le style vient de game.style (donc du thème).
//
//   game.scenes.push(new DialogScene(['Bonjour !', 'Deuxième page.'], { speaker: 'Vieil homme' }))

export class DialogScene extends Scene {
  constructor(pages, { speaker = null, speed = 45, lines = 3, onClose = null, sound = 'blip' } = {}) {
    super();
    this.transparent = true;
    this.pages = Array.isArray(pages) ? pages : [pages];
    this.speaker = speaker;
    this.speed = speed; // caractères par seconde
    this.maxLines = lines;
    this.onClose = onClose;
    this.sound = sound;
  }

  enter() {
    const r = this.game.renderer;
    const s = this.game.style;
    const pad = 8;
    this.box = { x: 8, w: r.width - 16, h: this.maxLines * (s.fontSize + 4) + pad * 2 + (this.speaker ? 4 : 0) };
    this.box.y = r.height - this.box.h - 8;
    const measure = (str) => r.measure(str, s.fontSize, s.font);
    // Chaque page est découpée en "écrans" de maxLines lignes.
    this.screens = [];
    for (const p of this.pages) {
      const lines = wrapText(p, this.box.w - pad * 2, measure);
      for (let i = 0; i < lines.length; i += this.maxLines) this.screens.push(lines.slice(i, i + this.maxLines));
    }
    this.index = 0;
    this._startScreen();
  }

  _startScreen() {
    this.shown = 0;
    this.total = this.screens[this.index].join('\n').length;
    this._lastBlip = 0;
  }

  update(dt) {
    const input = this.input;
    if (this.shown < this.total) {
      this.shown = Math.min(this.total, this.shown + this.speed * dt);
      const whole = Math.floor(this.shown);
      if (whole - this._lastBlip >= 3) {
        this._lastBlip = whole;
        this.game.audio.play(this.sound);
      }
      if (input.pressed('action')) this.shown = this.total;
    } else if (input.pressed('action') || input.pressed('secondary')) {
      if (this.index < this.screens.length - 1) {
        this.index++;
        this._startScreen();
      } else {
        this.close();
        this.onClose?.();
      }
    }
    input.consume('action');
  }

  draw(r) {
    const s = this.game.style;
    const { x, y, w, h } = this.box;
    r.rect(x, y, w, h, s.box);
    r.strokeRect(x, y, w, h, s.border);
    r.strokeRect(x + 2, y + 2, w - 4, h - 4, s.border);
    let ty = y + 8;
    if (this.speaker) {
      r.text(this.speaker, x + 8, y - 4, { color: s.accent, size: s.fontSize, font: s.font, bold: true, shadow: '#000' });
      ty += 2;
    }
    let left = Math.floor(this.shown);
    for (const line of this.screens[this.index]) {
      if (left <= 0) break;
      r.text(line.slice(0, left), x + 8, ty, { color: s.text, size: s.fontSize, font: s.font });
      left -= line.length + 1;
      ty += s.fontSize + 4;
    }
    if (this.shown >= this.total && Math.floor(this.game.time * 3) % 2 === 0) {
      const more = this.index < this.screens.length - 1;
      r.text(more ? '▼' : '■', x + w - 12, y + h - 12, { color: s.accent, size: s.fontSize, font: s.font });
    }
  }
}
