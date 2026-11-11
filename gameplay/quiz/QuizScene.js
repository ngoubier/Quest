import { Scene, TextField, wrapText, createRng, Speech } from '../../engine/index.js';
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
    // Safari (iPhone, iPad) n'accepte la voix que si elle est lancée PENDANT le toucher :
    // on écoute donc le toucher directement, sans attendre la boucle de jeu.
    this._onPointer = (e) => {
      if (this.phase !== 'ask' || this.q.type !== 'dictation') return;
      const c = this.game.canvas.getBoundingClientRect();
      const x = ((e.clientX - c.left) * this.game.width) / c.width;
      const y = ((e.clientY - c.top) * this.game.height) / c.height;
      const b = this.listenButton;
      if (x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h) {
        this._speak();
        this._spokeByTap = true;
      }
    };
    this.game.canvas.addEventListener('pointerdown', this._onPointer);
    this._start(0);
  }

  exit() {
    this.field.close();
    this.game.canvas.removeEventListener('pointerdown', this._onPointer);
    Speech.stop();
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
      const numeric = q.type !== 'dictation' && /^[\d\s.,]+$/.test(String(q.answer));
      // Dictée : Tab (ou le bouton à l'écran) fait réécouter le mot.
      const onKey = (e) => (q.type === 'dictation' && e.key === 'Tab' ? (this._speak(), true) : false);
      this.field.open({ x: Math.round((this.game.width - 160) / 2), y: 142, w: 160, h: 18 }, { onSubmit: (v) => this._answer(v), onKey, placeholder: 'Ta réponse', inputMode: numeric ? 'decimal' : 'text' });
    }
  }

  /** Texte prononcé pour une dictée. */
  _speak() {
    const q = this.q;
    if (q.type !== 'dictation') return;
    this.spoke = Speech.speak(q.say ?? `Écris le mot : ${q.answer}.`);
    if (!this.spoke) this.noVoice = true;
  }

  /** Bouton « Écouter l'énigme » (zone tactile, en pixels logiques). */
  get listenButton() {
    const W = this.game.width;
    return { x: Math.round(W / 2 - 64), y: 62, w: 128, h: 20 };
  }

  _answer(value) {
    if (this.phase !== 'ask') return;
    const q = this.q;
    const ok = checkAnswer(q, value);
    this.results.push({ id: q.id, subject: q.subject, ok, given: value, prompt: describe(q), answer: q.answer, question: JSON.parse(JSON.stringify(q)) });
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
      if (this.q.type === 'dictation' && input.tappedIn(this.listenButton)) {
        input.consumeTaps();
        if (!this._spokeByTap) this._speak(); // déjà prononcé dans le geste
        this._spokeByTap = false;
      }
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
    if (q.image && typeof q.image === 'object') {
      ty += drawPicture(r, q.image, W / 2, ty, s) + 6;
    } else if (q.image) {
      const count = [...q.image].length;
      const size = count > 6 ? 16 : count > 3 ? 22 : 34;
      r.text(q.image, W / 2, ty, { size, font: EMOJI_FONT, align: 'center', color: s.text });
      ty += size + 8;
    }
    if (q.type === 'dictation') {
      const b = this.listenButton;
      const pulse = this.phase === 'ask' && !this.spoke && Math.floor(this.game.time * 2) % 2 === 0;
      r.rect(b.x, b.y, b.w, b.h, pulse ? s.accent : s.border);
      r.rect(b.x + 1, b.y + 1, b.w - 2, b.h - 2, pulse ? s.box : s.box);
      r.text('🔊 Écouter l’énigme', W / 2, b.y + 6, { color: s.accent, size: 8, font: s.font, bold: true, align: 'center' });
      ty = b.y + b.h + 10;
      if (this.noVoice) {
        r.text('Ton appareil ne sait pas lire à voix haute.', W / 2, ty, { color: '#ff7a6a', size: 7, font: s.font, align: 'center' });
        ty += 12;
      }
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
        const hint = q.type === 'dictation' ? 'Touche le bouton (ou Tab) pour écouter · Entrée : valider' : 'Écris ta réponse puis Entrée (ou A) · B : je ne sais pas';
        r.text(hint, W / 2, y + h - 12, { color: s.dim, size: 6, font: s.font, align: 'center' });
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

/** Texte de la question pour le bilan des parents (image décrite). */
function describe(q) {
  const img = q.image;
  if (q.type === 'dictation') return `Dictée : « ${q.answer} »`;
  if (!img) return q.prompt;
  if (typeof img === 'string') return `${img} ${q.prompt}`;
  if (img.clock) return `[horloge ${img.clock[0]} h ${String(img.clock[1]).padStart(2, '0')}] ${q.prompt}`;
  if (img.money) return `[${img.money.map(moneyLabel).join(' + ')}] ${q.prompt}`;
  return q.prompt;
}

const moneyLabel = (v) => (v >= 1 ? `${v} €` : `${Math.round(v * 100)} c`);

/**
 * Images dessinées par le jeu (pas d'emoji) :
 *   { clock: [h, m] }          horloge à aiguilles
 *   { money: [2, 1, 0.5, 10] } pièces et billets en euros
 * Renvoie la hauteur utilisée.
 */
export function drawPicture(r, img, cx, top, s) {
  const c = r.ctx;
  if (img.clock) {
    const [h, m] = img.clock;
    const R = 22;
    const y = top + R;
    c.save();
    c.fillStyle = '#fbf6e8';
    c.strokeStyle = '#333';
    c.lineWidth = 2;
    c.beginPath();
    c.arc(cx, y, R, 0, Math.PI * 2);
    c.fill();
    c.stroke();
    c.fillStyle = '#333';
    for (let i = 1; i <= 12; i++) {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
      c.font = "bold 5px system-ui, sans-serif";
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText(String(i), cx + Math.cos(a) * (R - 6), y + Math.sin(a) * (R - 6));
    }
    const hand = (angle, len, width, color) => {
      c.strokeStyle = color;
      c.lineWidth = width;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(cx, y);
      c.lineTo(cx + Math.cos(angle) * len, y + Math.sin(angle) * len);
      c.stroke();
    };
    hand((((h % 12) + m / 60) / 12) * Math.PI * 2 - Math.PI / 2, R * 0.5, 2.5, '#c43a3a'); // petite aiguille : heures
    hand((m / 60) * Math.PI * 2 - Math.PI / 2, R * 0.8, 1.5, '#2a4a9a'); // grande aiguille : minutes
    c.fillStyle = '#333';
    c.beginPath();
    c.arc(cx, y, 1.5, 0, Math.PI * 2);
    c.fill();
    c.restore();
    return R * 2;
  }
  if (img.money) {
    const items = img.money;
    const widths = items.map((v) => (v >= 5 ? 30 : 16));
    const total = widths.reduce((a, b) => a + b + 3, -3);
    let x = cx - total / 2;
    const H = 18;
    c.save();
    items.forEach((v, i) => {
      const w = widths[i];
      if (v >= 5) {
        // billet
        const col = { 5: '#9aa4a8', 10: '#d88a8a', 20: '#7a9ad8', 50: '#e8a050' }[v] ?? '#9ad89a';
        c.fillStyle = col;
        c.fillRect(x, top, w, H);
        c.strokeStyle = '#333';
        c.lineWidth = 0.6;
        c.strokeRect(x, top, w, H);
      } else {
        // pièce : 1 € et 2 € bicolores, centimes cuivre / or
        const rr = v >= 1 ? 7.5 : v >= 0.1 ? 6.5 : 5.5;
        const outer = v === 2 ? '#d8b040' : v === 1 ? '#c0c0c8' : v >= 0.1 ? '#d8b040' : '#c87a4a';
        const inner = v === 2 ? '#c0c0c8' : v === 1 ? '#d8b040' : outer;
        c.fillStyle = outer;
        c.beginPath();
        c.arc(x + w / 2, top + H / 2, rr, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = inner;
        c.beginPath();
        c.arc(x + w / 2, top + H / 2, rr * 0.65, 0, Math.PI * 2);
        c.fill();
      }
      c.fillStyle = '#111';
      c.font = 'bold 5px system-ui, sans-serif';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText(moneyLabel(v).replace(' ', ''), x + w / 2, top + H / 2 + 0.5);
      x += w + 3;
    });
    c.restore();
    return H;
  }
  return 0;
}
