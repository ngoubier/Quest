import { Scene, TextField } from '../../engine/index.js';

// Demande un texte court (prénom...) dans une petite fenêtre.
export class PromptScene extends Scene {
  constructor({ title, message = '', placeholder = '', maxLength = 12, inputMode = 'text', validate = (v) => (v.trim() ? null : 'Écris quelque chose !'), onOk }) {
    super();
    this.transparent = true;
    Object.assign(this, { title, message, placeholder, maxLength, inputMode, validate, onOk });
    this.error = '';
  }

  enter() {
    this.field = new TextField(this.game);
    this.field.open({ x: 58, y: 108, w: 140, h: 20 }, { onSubmit: (v) => this._submit(v), placeholder: this.placeholder, maxLength: this.maxLength, inputMode: this.inputMode });
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
    const x = 24;
    const y = 50;
    const w = r.width - 48;
    const h = 100;
    r.rect(x, y, w, h, s.box);
    r.strokeRect(x, y, w, h, s.border);
    r.text(this.title, r.width / 2, y + 10, { color: s.accent, size: 9, font: s.font, bold: true, align: 'center' });
    if (this.message) r.text(this.message, r.width / 2, y + 28, { color: s.text, size: 7, font: s.font, align: 'center' });
    if (this.error) r.text(this.error, r.width / 2, y + 84, { color: '#ff7a6a', size: 7, font: s.font, align: 'center' });
  }
}
