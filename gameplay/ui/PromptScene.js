import { Scene, TextField } from '../../engine/index.js';

// Demande un texte court (prénom...) dans une petite fenêtre.
export class PromptScene extends Scene {
  constructor({ title, message = '', placeholder = '', maxLength = 12, inputMode = 'text', fieldWidth = 140, validate = (v) => (v.trim() ? null : 'Écris quelque chose !'), onOk }) {
    super();
    this.transparent = true;
    Object.assign(this, { title, message, placeholder, maxLength, inputMode, fieldWidth, validate, onOk });
    this.error = '';
  }

  enter() {
    this.field = new TextField(this.game);
    const fw = Math.min(this.fieldWidth, this.game.width - 24);
    this.field.open({ x: Math.round((this.game.width - fw) / 2), y: 108, w: fw, h: 20 }, { onSubmit: (v) => this._submit(v), placeholder: this.placeholder, maxLength: this.maxLength, inputMode: this.inputMode });
  }

  exit() {
    this.field.close();
  }

  _submit(v) {
    const err = this.validate(v);
    if (err) {
      this.error = err;
      return this.game.audio.play('menu_no');
    }
    this.game.audio.play('menu_ok');
    this.close();
    this.onOk(v.trim());
  }

  update() {
    const i = this.input;
    if (i.pressed('action') && this.field.value) this._submit(this.field.value);
    if (i.pressed('secondary') || i.pressed('start')) {
      i.consume('start');
      this.close();
    }
    i.consume('action');
  }

  draw(r) {
    const s = this.game.style;
    this.field.place();
    r.withAlpha(0.7, () => r.rect(0, 0, r.width, r.height, '#000'));
    const x = 10;
    const y = 50;
    const w = r.width - 20;
    const h = 100;
    r.rect(x, y, w, h, s.box);
    r.strokeRect(x, y, w, h, s.border);
    r.fitText(this.title, r.width / 2, y + 10, w - 16, { color: s.accent, size: 9, font: s.font, bold: true, align: 'center' });
    if (this.message) r.textBlock(this.message, r.width / 2, y + 26, w - 16, { color: s.text, size: 7, font: s.font, align: 'center', lineHeight: 9, maxLines: 3 });
    if (this.error) r.textBlock(this.error, r.width / 2, y + 84, w - 16, { color: '#ff7a6a', size: 7, font: s.font, align: 'center', lineHeight: 9, maxLines: 2 });
  }
}
