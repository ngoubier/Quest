import { Scene, TextField, wrapText, createRng } from '../../engine/index.js';
import { checkAnswer } from './answers.js';
import { SUBJECTS } from './QuestionBank.js';

// Écran de questions (énigmes scolaires) : QCM, réponse à écrire, image à nommer.
// Après chaque réponse : correction bienveillante, avec la bonne réponse si besoin.
// À la fin : bilan, puis onDone({ correct, total, results }).

const PRAISE = ['Bravo !', 'Excellent !', 'Bien joué !', 'Super !', 'Parfait !'];
const EMOJI_FONT = "'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',system-ui,sans-serif";

export class QuizScene extends Scene {
  constructor({ questions, speaker = null, onDone = null }) {
    super();
    this.transparent = true;
    this.questions = questions;
    this.speaker = speaker;
    this.onDone = onDone;
    this.rng = createRng(Date.now() % 1e9);
    this.results = [];
  }

  enter() {
    this.field = new TextField(this.game);
    this._start(0);
  }

  exit() {
    this.field.close();
  }

  get q() {
    return this.questions[this.i];
  }

  _start(i) {
    this.i = i;
    this.phase = 'ask';
    this.t = 0;
    const q = this.q;
    if (q.type === 'choice') {
      this.options = [...q.choices].sort(() => this.rng() - 0.5);
      this.sel = 0;
    } else {
      const numeric = /^[\d\s.,]+$/.test(String(q.answer));
      this.field.open({ x: 48, y: 142, w: 160, h: 18 }, { onSubmit: (v) => this._answer(v), placeholder: 'Ta réponse', inputMode: numeric ? 'decimal' : 'text' });
    }
  }

  _answer(value) {
    if (this.phase !== 'ask') return;
    const q = this.q;
    const ok = checkAnswer(q, value);
    this.results.push({ id: q.id, subject: q.subject, ok, given: value, prompt: q.image ? `${q.image} ${q.prompt}` : q.prompt, answer: q.answer });
    this.field.close();
    this.phase = 'feedback';
    this.t = 0;
    this.praise = this.rng.pick(PRAISE);
    this.game.audio.play(ok ? 'quiz_ok' : 'quiz_ko');
  }

  update(dt) {
    this.t += dt;
    const input = this.input;
    if (this.phase === 'ask') {
      if (this.q.type === 'choice') {
        const n = this.options.length;
        if (input.pressed('up') || input.pressed('left')) (this.sel = (this.sel - 1 + n) % n), this.game.audio.play('menu_move');
        if (input.pressed('down') || input.pressed('right')) (this.sel = (this.sel + 1) % n), this.game.audio.play('menu_move');
        if (input.pressed('action') && this.t > 0.2) this._answer(this.options[this.sel]);
      } else if (input.pressed('action') && this.t > 0.2) {
        // Bouton A tactile : valide ce qui est écrit.
        if (this.field.value.trim()) this._answer(this.field.value);
      }
      if (input.pressed('secondary') && this.t > 0.2) this._answer(null); // « Je ne sais pas »
    } else if (this.phase === 'feedback') {
      if (this.t > 0.4 && (input.pressed('action') || input.pressed('secondary') || input.pressed('start'))) {
        if (this.i + 1 < this.questions.length) this._start(this.i + 1);
        else {
          this.phase = 'summary';
          this.t = 0;
          this.game.audio.play(this.correct === this.questions.length ? 'quest_done' : 'menu_ok');
        }
      }
    } else if (this.phase === 'summary') {
      if (this.t > 0.4 && (input.pressed('action') || input.pressed('secondary') || input.pressed('start'))) {
        this.close();
        this.onDone?.({ correct: this.correct, total: this.questions.length, results: this.results });
      }
    }
    input.consume('action');
    input.consume('start');
  }

  get correct() {
    return this.results.filter((r) => r.ok).length;
  }

  _wrapped(r, text, width, size) {
    const s = this.game.style;
    return wrapText(text, width, (str) => r.measure(str, size, s.font));
  }

  draw(r) {
    const s = this.game.style;
    const W = r.width;
    r.withAlpha(0.6, () => r.rect(0, 0, W, r.height, '#000'));
    const x = 8;
    const y = 8;
    const w = W - 16;
    const h = r.height - 16;
    r.rect(x, y, w, h, s.box);
    r.strokeRect(x, y, w, h, s.border);
    r.strokeRect(x + 2, y + 2, w - 4, h - 4, s.border);

    if (this.phase === 'summary') {
      const n = this.questions.length;
      r.text('BILAN', W / 2, y + 24, { color: s.accent, size: 10, font: s.font, bold: true, align: 'center' });
      r.text(`${this.correct} bonne${this.correct > 1 ? 's' : ''} réponse${this.correct > 1 ? 's' : ''} sur ${n}`, W / 2, y + 56, { color: s.text, size: 10, font: s.font, align: 'center' });
      const stars = '★'.repeat(this.correct) + '☆'.repeat(n - this.correct);
      r.text(stars, W / 2, y + 82, { color: s.accent, size: 18, font: s.font, align: 'center' });
      const msg = this.correct === n ? 'Sans faute, félicitations !' : this.correct >= n / 2 ? 'Très bien, continue comme ça !' : 'Tu progresseras en t’entraînant !';
      r.text(msg, W / 2, y + 120, { color: s.text, size: 8, font: s.font, align: 'center' });
      r.text('Action : continuer', W / 2, y + h - 18, { color: s.dim, size: 7, font: s.font, align: 'center' });
      return;
    }

    const q = this.q;
    // En-tête : qui demande, matière, progression.
    r.text(this.speaker ?? '', x + 8, y + 7, { color: s.accent, size: 8, font: s.font, bold: true });
    r.text(`${SUBJECTS[q.subject] ?? q.subject} · ${this.i + 1}/${this.questions.length}`, x + w - 8, y + 7, { color: s.dim, size: 7, font: s.font, align: 'right' });
    r.rect(x + 6, y + 19, w - 12, 1, s.border);

    let ty = y + 26;
    if (q.image) {
      const count = [...q.image].length;
      const size = count > 6 ? 16 : count > 3 ? 22 : 34;
      r.text(q.image, W / 2, ty, { size, font: EMOJI_FONT, align: 'center', color: s.text });
      ty += size + 8;
    }
    for (const line of this._wrapped(r, q.prompt, w - 24, 9)) {
      r.text(line, W / 2, ty, { color: s.text, size: 9, font: s.font, align: 'center' });
      ty += 12;
    }
    ty += 4;

    if (this.phase === 'ask') {
      if (q.type === 'choice') {
        this.options.forEach((o, i) => {
          const sel = i === this.sel;
          const bx = x + 24;
          const bw = w - 48;
          if (sel) r.rect(bx, ty - 2, bw, 13, s.accent);
          r.text(o, W / 2, ty, { color: sel ? s.box : s.text, size: 8, font: s.font, align: 'center', bold: sel });
          ty += 15;
        });
        r.text('Haut/Bas : choisir · Action : valider · B : je ne sais pas', W / 2, y + h - 12, { color: s.dim, size: 6, font: s.font, align: 'center' });
      } else {
        this.field.place();
        r.text('Écris ta réponse puis Entrée (ou A) · B : je ne sais pas', W / 2, y + h - 12, { color: s.dim, size: 6, font: s.font, align: 'center' });
      }
      return;
    }

    // Correction.
    const res = this.results[this.results.length - 1];
    const fy = Math.max(ty, 118);
    if (res.ok) {
      r.text(`✓ ${this.praise}`, W / 2, fy, { color: '#5adc5a', size: 12, font: s.font, bold: true, align: 'center' });
    } else {
      r.text(res.given == null ? 'Pas grave !' : '✗ Pas tout à fait...', W / 2, fy, { color: '#ff7a6a', size: 10, font: s.font, bold: true, align: 'center' });
      r.text(`La bonne réponse : ${q.answer}`, W / 2, fy + 16, { color: s.text, size: 8, font: s.font, align: 'center' });
    }
    if (q.explain) {
      let ey = fy + (res.ok ? 18 : 30);
      for (const line of this._wrapped(r, q.explain, w - 24, 7)) {
        r.text(line, W / 2, ey, { color: s.dim, size: 7, font: s.font, align: 'center' });
        ey += 9;
      }
    }
    r.text('Action : continuer', W / 2, y + h - 12, { color: s.dim, size: 6, font: s.font, align: 'center' });
  }
}
