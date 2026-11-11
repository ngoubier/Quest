import { Scene, TextField, wrapText, createRng, Speech } from '../../engine/index.js';
import { checkAnswer } from './answers.js';
import { SUBJECTS } from './QuestionBank.js';

// Écran de questions (énigmes scolaires) : QCM, réponse à écrire, image à nommer.
// Après chaque réponse : correction bienveillante, avec la bonne réponse si besoin.
// À la fin : bilan, puis onDone({ correct, total, results }).

const PRAISE = ['Bravo !', 'Excellent !', 'Bien joué !', 'Super !', 'Parfait !'];
const EMOJI_FONT = "'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',system-ui,sans-serif";

export class QuizScene extends Scene {
  /**
   * @param {object} o
   * @param {{ left: () => number, spend: () => boolean }} [o.hints]
   *   indices du jeu (compteur) : 2 au plus par question, chacun coûte 1 indice
   */
  constructor({ questions, speaker = null, onDone = null, hints = null }) {
    super();
    this.hints = hints;
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
      if (this.phase !== 'ask') return;
      const c = this.game.canvas.getBoundingClientRect();
      const x = ((e.clientX - c.left) * this.game.width) / c.width;
      const y = ((e.clientY - c.top) * this.game.height) / c.height;
      const inside = (b) => b && x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h;
      // Boutons gérés ici, dans le geste (exigé pour la voix).
      if (inside(this.hintButton)) return this._hint();
      if (this.q.type !== 'dictation') return;
      if (inside(this.listenButton)) this._listen();
      else if (inside(this.fallbackButton)) this._fallback();
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
      this.hintLevel = 0;
      this.hintMsg = '';
    } else {
      const numeric = q.type !== 'dictation' && /^[\d\s.,]+$/.test(String(q.answer));
      // Dictée : Tab = écouter (ou voir), ? = indice.
      const onKey = (e) => {
        if (e.key === '?') return this._hint(), true;
        if (q.type === 'dictation' && e.key === 'Tab') return this._listen(), true;
        return false;
      };
      this.flashT = 0;
      this.triedVoice = false;
      this.showImage = false;
      this.hintLevel = 0;
      this.hintMsg = '';
      this.field.open({ x: Math.round((this.game.width - 160) / 2), y: 142, w: 160, h: 18 }, { onSubmit: (v) => this._answer(v), onKey, placeholder: 'Ta réponse', inputMode: numeric ? 'decimal' : 'text' });
    }
  }

  /** L'appareil sait-il parler ? */
  get voiceOk() {
    return Speech.available;
  }

  /**
   * Mode de la dictée :
   *  - 'voice' : la voix dicte le mot ;
   *  - 'image' : l'appareil ne parle pas (ou « Pas de son ? ») → on montre l'objet à écrire ;
   *  - 'flash' : ni voix ni image (mot ajouté par les parents) → le mot s'affiche 3 s.
   */
  get mode() {
    const q = this.q;
    if (this.voiceOk && !this.showImage) return 'voice';
    return q.image ? 'image' : 'flash';
  }

  /** Bouton principal : écouter (voix) ou voir le mot (flash). Pas de bouton en mode image. */
  _listen() {
    if (this.q.type !== 'dictation') return;
    if (this.mode === 'flash') return this._flash();
    if (this.mode !== 'voice') return;
    this.spoke = Speech.speak(this.q.say ?? `Écris le mot : ${this.q.answer}.`);
    this.triedVoice = true;
    if (!this.spoke) this._fallback();
  }

  /** « Pas de son ? » : image de l'objet si elle existe, sinon le mot quelques secondes. */
  _fallback() {
    if (this.q.image) this.showImage = true;
    else this._flash();
  }

  _flash() {
    this.flashT = 3;
    this.spoke = true;
  }

  /** Indices restants dans le jeu (compteur du bandeau). */
  get hintsLeft() {
    return this.hints ? this.hints.left() : 0;
  }

  /** Un indice est-il possible pour cette question ? (2 au plus) */
  get canHint() {
    if (!this.hints || this.phase !== 'ask' || this.hintLevel >= 2) return false;
    if (this.q.type === 'choice') return this.options.length > 2; // on garde toujours 2 choix
    return true;
  }

  /**
   * Utilise un indice du jeu :
   *  - réponse écrite / dictée : 1 = un tiret par lettre (ou chiffre), 2 = une ou deux lettres dévoilées ;
   *  - QCM : retire une mauvaise réponse.
   */
  _hint() {
    if (!this.canHint) return;
    if (this.hintsLeft <= 0 || !this.hints.spend()) {
      this.hintMsg = 'Plus d’indice ! Gagnes-en avec les quêtes ou au magasin.';
      this.game.audio.play('menu_no');
      return;
    }
    this.hintLevel++;
    this.hintMsg = '';
    this.game.audio.play('secret');
    if (this.q.type === 'choice') {
      const wrong = this.options.filter((o) => o !== this.q.answer);
      const out = wrong[Math.floor(this.rng() * wrong.length)];
      const cur = this.options[this.sel];
      this.options = this.options.filter((o) => o !== out);
      this.sel = Math.max(0, this.options.indexOf(cur));
    }
  }

  /** Motif d'indice : « _ _ _ _ » puis « é _ _ _ _ a _ t » (lettres et chiffres). */
  hintPattern() {
    const isChar = (c) => /[\p{L}\p{N}]/u.test(c);
    const chars = [...String(this.q.answer)];
    const letters = chars.map((c, i) => (isChar(c) ? i : -1)).filter((i) => i >= 0);
    const shown = new Set();
    if (this.hintLevel >= 2) {
      shown.add(letters[0]);
      if (letters.length >= 8) shown.add(letters[Math.floor(letters.length / 2)]);
    }
    return chars.map((c, i) => (isChar(c) ? (shown.has(i) ? c : '_') : c)).join(' ');
  }

  // --- zones des boutons (pixels logiques)
  get listenButton() {
    if (this.q?.type !== 'dictation' || this.mode === 'image') return null;
    const W = this.game.width;
    return { x: Math.round(W / 2 - 64), y: 32, w: 128, h: 20 };
  }

  get fallbackButton() {
    if (this.q?.type !== 'dictation' || this.mode !== 'voice' || !this.triedVoice) return null;
    const W = this.game.width;
    return { x: Math.round(W / 2 - 70), y: 55, w: 140, h: 11 };
  }

  get hintButton() {
    if (!this.q || !this.canHint) return null;
    const W = this.game.width;
    const w = 112;
    const y = this.q.type === 'choice' ? this.game.height - 36 : 126;
    return { x: Math.round(W / 2 - w / 2), y, w, h: 13 };
  }

  /** Bouton et message d'indice (tous types de questions). */
  _drawHintButton(r, s) {
    const hb = this.hintButton;
    const W = this.game.width;
    if (hb) {
      const left = this.hintsLeft;
      r.rect(hb.x, hb.y, hb.w, hb.h, left > 0 ? s.border : s.dim);
      r.rect(hb.x + 1, hb.y + 1, hb.w - 2, hb.h - 2, s.box);
      r.fitText(`💡 Indice ${this.hintLevel + 1}/2 · il t’en reste ${left}`, W / 2, hb.y + 3, hb.w - 6, { color: left > 0 ? s.text : s.dim, size: 6, font: s.font, align: 'center' });
    }
    if (this.hintMsg) {
      const y = hb ? hb.y - 18 : this.q.type === 'choice' ? this.game.height - 42 : 120;
      r.textBlock(this.hintMsg, W / 2, y, W - 36, { color: '#ff7a6a', size: 6, font: s.font, align: 'center', lineHeight: 8, maxLines: 2 });
    }
  }

  _answer(value) {
    if (this.phase !== 'ask') return;
    const q = this.q;
    const ok = checkAnswer(q, value);
    this.results.push({ id: q.id, subject: q.subject, ok, given: value, prompt: describe(q), answer: q.answer, hints: this.hintLevel ?? 0, question: JSON.parse(JSON.stringify(q)) });
    this.hintMsg = '';
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
      if (this.q.type === 'dictation') input.consumeTaps(); // boutons gérés dans le geste (voir enter)
      if (this.flashT > 0) this.flashT -= dt;
      if (this.q.type === 'choice') {
        const n = this.options.length;
        if (input.pressed('up') || input.pressed('left')) (this.sel = (this.sel - 1 + n) % n), this.game.audio.play('menu_move');
        if (input.pressed('down') || input.pressed('right')) (this.sel = (this.sel + 1) % n), this.game.audio.play('menu_move');
        if (input.pressed('action') && this.t > 0.2) this._answer(this.options[this.sel]);
        if (input.pressed('hint')) this._hint();
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
      r.fitText('BILAN', W / 2, y + 24, w - 16, { color: s.accent, size: 10, font: s.font, bold: true, align: 'center' });
      r.fitText(`${this.correct} bonne${this.correct > 1 ? 's' : ''} réponse${this.correct > 1 ? 's' : ''} sur ${n}`, W / 2, y + 56, w - 16, { color: s.text, size: 10, font: s.font, align: 'center' });
      const stars = n <= 8 ? '★'.repeat(this.correct) + '☆'.repeat(n - this.correct) : `★ ${this.correct} / ${n}`;
      r.fitText(stars, W / 2, y + 82, w - 16, { color: s.accent, size: 18, font: s.font, align: 'center' });
      const msg = this.correct === n ? 'Sans faute, félicitations !' : this.correct >= n / 2 ? 'Très bien, continue comme ça !' : 'Tu progresseras en t’entraînant !';
      r.fitText(msg, W / 2, y + 120, w - 16, { color: s.text, size: 8, font: s.font, align: 'center' });
      r.fitText('Action : continuer', W / 2, y + h - 18, w - 16, { color: s.dim, size: 7, font: s.font, align: 'center' });
      return;
    }

    const q = this.q;
    // En-tête : qui demande, matière, progression.
    const sub = `${SUBJECTS[q.subject] ?? q.subject} · ${this.i + 1}/${this.questions.length}`;
    const subW = r.measure(sub, 7, s.font);
    r.text(sub, x + w - 8, y + 7, { color: s.dim, size: 7, font: s.font, align: 'right' });
    r.fitText(this.speaker ?? '', x + 8, y + 7, w - 24 - subW, { color: s.accent, size: 8, font: s.font, bold: true });
    r.rect(x + 6, y + 19, w - 12, 1, s.border);

    let ty = y + 26;
    if (q.image && typeof q.image === 'object') {
      ty += drawPicture(r, q.image, W / 2, ty, s) + 6;
    } else if (q.image && q.type !== 'dictation') {
      const count = [...q.image].length;
      const size = count > 6 ? 16 : count > 3 ? 22 : 34;
      r.fitText(q.image, W / 2, ty, w - 16, { size, font: EMOJI_FONT, align: 'center', color: s.text });
      ty += size + 8;
    }
    if (q.type === 'dictation') {
      const mode = this.mode;
      const b = this.listenButton;
      if (b) {
        const pulse = this.phase === 'ask' && !this.spoke && Math.floor(this.game.time * 2) % 2 === 0;
        r.rect(b.x, b.y, b.w, b.h, pulse ? s.accent : s.border);
        r.rect(b.x + 1, b.y + 1, b.w - 2, b.h - 2, s.box);
        r.fitText(mode === 'voice' ? '🔊 Écouter l’énigme' : '👁 Voir le mot (3 s)', W / 2, b.y + 6, w - 16, { color: s.accent, size: 8, font: s.font, bold: true, align: 'center' });
        ty = b.y + b.h + 4;
      }
      const fb = this.fallbackButton;
      if (fb) {
        r.fitText(q.image ? 'Pas de son ? 🖼 Voir l’image' : 'Pas de son ? 👁 Voir le mot', W / 2, fb.y + 2, w - 16, { color: s.dim, size: 7, font: s.font, align: 'center' });
        ty = fb.y + fb.h + 2;
      }
      if (mode === 'image') {
        // L'objet à écrire
        const size = b ? 24 : 34;
        r.fitText(q.image, W / 2, ty + 2, w - 16, { size, font: EMOJI_FONT, align: 'center', color: s.text });
        ty += size + 8;
      }
      if (this.flashT > 0 && this.phase === 'ask') {
        r.fitText(q.answer, W / 2, ty + 2, w - 16, { color: s.text, size: 18, font: s.font, bold: true, align: 'center' });
        ty += 26;
      }
      const prompt = mode === 'voice' ? 'Écris le mot que tu entends.' : mode === 'image' ? 'Écris le nom de ce que tu vois.' : 'Regarde bien le mot, puis écris-le.';
      r.fitText(prompt, W / 2, ty, w - 16, { color: s.text, size: 8, font: s.font, align: 'center' });
      ty += 12;
      // Indices
      if (this.hintLevel > 0 && this.phase === 'ask') {
        r.fitText(this.hintPattern(), W / 2, ty, w - 16, { color: s.accent, size: 10, font: s.font, bold: true, align: 'center' });
        ty += 14;
      }
    }
    const prompt = q.type === 'dictation' ? '' : q.prompt;
    for (const line of prompt ? this._wrapped(r, prompt, w - 24, 9) : []) {
      r.fitText(line, W / 2, ty, w - 16, { color: s.text, size: 9, font: s.font, align: 'center' });
      ty += 12;
    }
    if (q.type === 'text' && this.hintLevel > 0 && this.phase === 'ask') {
      ty += 2;
      r.fitText(this.hintPattern(), W / 2, ty, w - 16, { color: s.accent, size: 10, font: s.font, bold: true, align: 'center' });
      ty += 12;
    }
    if (this.phase === 'ask') this._drawHintButton(r, s);
    ty += 4;

    if (this.phase === 'ask') {
      if (q.type === 'choice') {
        this.options.forEach((o, i) => {
          const sel = i === this.sel;
          const bx = x + 24;
          const bw = w - 48;
          if (sel) r.rect(bx, ty - 2, bw, 13, s.accent);
          r.fitText(o, W / 2, ty, w - 16, { color: sel ? s.box : s.text, size: 8, font: s.font, align: 'center', bold: sel });
          ty += 15;
        });
        r.fitText(W < 240 ? 'Haut/Bas · A : valider · B : passer' : 'Haut/Bas : choisir · A : valider · H : indice · B : passer', W / 2, y + h - 12, w - 16, { color: s.dim, size: 6, font: s.font, align: 'center' });
      } else {
        this.field.place();
        const narrow = W < 240;
        const hint =
          q.type === 'dictation'
            ? narrow
              ? 'Entrée : valider · ? : indice'
              : (this.mode === 'voice' ? 'Bouton (ou Tab) : écouter' : this.mode === 'image' ? 'Écris le mot' : 'Bouton (ou Tab) : voir le mot') + ' · Entrée : valider · ? : indice'
            : narrow
              ? 'Entrée : valider · ? : indice'
              : 'Entrée (ou A) : valider · ? : indice · B : je ne sais pas';
        r.fitText(hint, W / 2, y + h - 12, w - 16, { color: s.dim, size: 6, font: s.font, align: 'center' });
      }
      return;
    }

    // Correction.
    const res = this.results[this.results.length - 1];
    const fy = Math.max(ty, 112);
    let answerH = 0;
    if (res.ok) {
      r.fitText(`✓ ${this.praise}`, W / 2, fy, w - 16, { color: '#5adc5a', size: 12, font: s.font, bold: true, align: 'center' });
    } else {
      r.fitText(res.given == null ? 'Pas grave !' : '✗ Pas tout à fait...', W / 2, fy, w - 16, { color: '#ff7a6a', size: 10, font: s.font, bold: true, align: 'center' });
      answerH = r.textBlock(`La bonne réponse : ${q.answer}`, W / 2, fy + 16, w - 20, { color: s.text, size: 8, font: s.font, align: 'center', lineHeight: 10 });
    }
    if (q.explain) {
      let ey = fy + (res.ok ? 18 : 18 + answerH);
      for (const line of this._wrapped(r, q.explain, w - 24, 7)) {
        r.fitText(line, W / 2, ey, w - 16, { color: s.dim, size: 7, font: s.font, align: 'center' });
        ey += 9;
      }
    }
    r.fitText('Action : continuer', W / 2, y + h - 12, w - 16, { color: s.dim, size: 6, font: s.font, align: 'center' });
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
