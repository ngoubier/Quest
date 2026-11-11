import { Scene } from '../scene/Scene.js';
import { wrapText } from './text.js';

// Boîte de dialogue : texte qui s'affiche lettre par lettre, plusieurs pages,
// et éventuellement un choix à la fin (Oui / Non...).
// Action : accélérer / page suivante / valider le choix. Le style vient de game.style (donc du thème).
//
//   game.scenes.push(new DialogScene(['Bonjour !', 'Deuxième page.'], { speaker: 'Vieil homme' }))
//   game.scenes.push(new DialogScene('M\'aideras-tu ?', { choices: [
//     { label: 'Oui', onSelect: () => ... }, { label: 'Non', onSelect: () => ... } ] }))

export class DialogScene extends Scene {
  constructor(pages, { speaker = null, speed = 45, lines = 3, onClose = null, sound = 'blip', choices = null } = {}) {
    super();
    this.transparent = true;
    this.pages = Array.isArray(pages) ? pages : [pages];
    this.speaker = speaker;
    this.speed = speed; // caractères par seconde
    this.maxLines = lines;
    this.onClose = onClose;
    this.sound = sound;
    this.choices = choices && choices.length ? choices : null;
    this.choice = 0;
  }

  enter() {
    const r = this.game.renderer;
    const s = this.game.style;
    const pad = 8;
    this.box = { x: 8, w: r.width - 16, h: this.maxLines * (s.fontSize + 4) + pad * 2 + (this.speaker ? 4 : 0) };
    this.box.y = r.height - this.box.h - 6;
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

  get _isLast() {
    return this.index === this.screens.length - 1;
  }

  get _choosing() {
    return this.choices && this._isLast && this.shown >= this.total;
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
    } else if (this._choosing) {
      const n = this.choices.length;
      if (input.pressed('up')) (this.choice = (this.choice - 1 + n) % n), this.game.audio.play('menu_move');
      if (input.pressed('down')) (this.choice = (this.choice + 1) % n), this.game.audio.play('menu_move');
      if (input.pressed('action')) {
        input.consume('action');
        this.game.audio.play('menu_ok');
        this.close();
        this.choices[this.choice].onSelect?.();
        return;
      }
    } else if (input.pressed('action') || input.pressed('secondary')) {
      if (!this._isLast) {
        this.index++;
        this._startScreen();
      } else {
        input.consume('action');
        this.close();
        this.onClose?.();
        return;
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
      // Onglet bien visible avec le nom de celui qui parle.
      const nw = Math.min(w - 12, Math.ceil(r.measure(this.speaker, s.fontSize + 1, s.font, true)) + 14);
      const th = s.fontSize + 7;
      r.rect(x + 6, y - th + 2, nw, th, s.box);
      r.strokeRect(x + 6, y - th + 2, nw, th, s.accent);
      r.rect(x + 7, y, nw - 2, 2, s.box);
      r.fitText(this.speaker, x + 13, y - th + 5, nw - 12, { color: s.accent, size: s.fontSize + 1, font: s.font, bold: true });
      ty += 2;
    }
    let left = Math.floor(this.shown);
    for (const line of this.screens[this.index]) {
      if (left <= 0) break;
      r.text(line.slice(0, left), x + 8, ty, { color: s.text, size: s.fontSize, font: s.font });
      left -= line.length + 1;
      ty += s.fontSize + 4;
    }
    if (this._choosing) {
      const lh = s.fontSize + 6;
      const cw = Math.min(w, Math.max(...this.choices.map((c) => r.measure(c.label, s.fontSize, s.font))) + 28);
      const ch = this.choices.length * lh + 10;
      const cx = x + w - cw;
      // Au-dessus de l'onglet du nom (s'il y en a un), sans sortir de l'écran.
      const tabH = this.speaker ? s.fontSize + 7 : 0;
      const cy = Math.max(2, y - ch - 4 - tabH);
      r.rect(cx, cy, cw, ch, s.box);
      r.strokeRect(cx, cy, cw, ch, s.border);
      this.choices.forEach((c, i) => {
        const sel = i === this.choice;
        if (sel) r.text('▶', cx + 6, cy + 6 + i * lh, { color: s.accent, size: s.fontSize, font: s.font });
        r.fitText(c.label, cx + 18, cy + 6 + i * lh, cw - 24, { color: sel ? s.accent : s.text, size: s.fontSize, font: s.font });
      });
    } else if (this.shown >= this.total && Math.floor(this.game.time * 3) % 2 === 0) {
      r.text(this._isLast ? '■' : '▼', x + w - 12, y + h - 12, { color: s.accent, size: s.fontSize, font: s.font });
    }
  }
}
