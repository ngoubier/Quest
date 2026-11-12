import { Scene } from '../../engine/index.js';
import { makeDeck, remember, aiFirst, aiSecond, result } from './memory.js';
import { skillForAge } from './tictactoe.js';
import { drawPanel } from '../../engine/index.js';

// MEMORY DES ANIMAUX contre un habitant. 12 cartes (6 paires d'animaux de la forêt).
// Croix : choisir une carte · Action : la retourner · B : abandonner. Tactile : toucher la carte.
// Une paire trouvée = un point, et on rejoue. Celui qui a le plus de paires gagne.
// onDone(result) : 'win' | 'lose' | 'draw' | 'quit'

const COLS = 4;
const ROWS = 3;
export const ANIMALS = ['hibou', 'renard', 'lapin', 'écureuil', 'hérisson', 'grenouille'];

/** Petit dessin d'animal (environ 18 x 18) centré en (cx, cy). */
function drawAnimal(r, kind, cx, cy) {
  const R = (x, y, w, h, c) => r.rect(cx + x, cy + y, w, h, c);
  switch (kind) {
    case 0: // hibou
      R(-7, -7, 14, 15, '#8a5a2a');
      R(-8, -9, 3, 3, '#8a5a2a');
      R(5, -9, 3, 3, '#8a5a2a');
      R(-5, 1, 10, 6, '#d8b070');
      R(-6, -5, 5, 5, '#ffe066');
      R(1, -5, 5, 5, '#ffe066');
      R(-4, -3, 2, 2, '#141414');
      R(3, -3, 2, 2, '#141414');
      R(-1, 0, 2, 2, '#f08a1a');
      return;
    case 1: // renard
      R(-7, -4, 14, 9, '#e8742a');
      R(-7, -9, 4, 5, '#e8742a');
      R(3, -9, 4, 5, '#e8742a');
      R(-6, -8, 2, 3, '#141414');
      R(4, -8, 2, 3, '#141414');
      R(-4, 2, 8, 5, '#ffffff');
      R(-1, 6, 2, 2, '#141414');
      R(-4, -2, 2, 2, '#141414');
      R(2, -2, 2, 2, '#141414');
      return;
    case 2: // lapin
      R(-5, -3, 10, 10, '#e8e8f0');
      R(-4, -11, 3, 9, '#e8e8f0');
      R(1, -11, 3, 9, '#e8e8f0');
      R(-3, -10, 1, 6, '#f0a0b8');
      R(2, -10, 1, 6, '#f0a0b8');
      R(-3, 0, 2, 2, '#141414');
      R(1, 0, 2, 2, '#141414');
      R(-1, 3, 2, 1, '#f0a0b8');
      return;
    case 3: // écureuil
      R(2, -9, 7, 14, '#c8642a');
      R(4, -10, 5, 3, '#c8642a');
      R(-7, -3, 9, 10, '#a8541a');
      R(-6, -7, 7, 6, '#a8541a');
      R(-6, -9, 2, 3, '#a8541a');
      R(-4, -5, 2, 2, '#141414');
      R(-5, 1, 5, 4, '#f4d8a8');
      return;
    case 4: // hérisson
      R(-8, -3, 16, 9, '#6a5040');
      for (let k = -8; k < 8; k += 3) R(k, -6 + (k & 1), 2, 4, '#4a3428');
      R(4, 0, 6, 5, '#e8c8a0');
      R(9, 2, 2, 2, '#141414');
      R(6, 1, 1, 1, '#141414');
      return;
    default: // grenouille
      R(-8, -2, 16, 9, '#4ab04a');
      R(-7, -7, 5, 5, '#4ab04a');
      R(2, -7, 5, 5, '#4ab04a');
      R(-6, -6, 3, 3, '#ffffff');
      R(3, -6, 3, 3, '#ffffff');
      R(-5, -5, 1, 1, '#141414');
      R(4, -5, 1, 1, '#141414');
      R(-5, 3, 10, 1, '#2a7a2a');
  }
}

export class MemoryScene extends Scene {
  constructor({ opponent = 'Habitant', age = 8, onDone, rand = Math.random } = {}) {
    super();
    this.transparent = true;
    this.opponent = String(opponent).split(',')[0];
    this.skill = skillForAge(age);
    this.onDone = onDone;
    this.rand = rand;
    this.deck = makeDeck(ANIMALS.length, rand);
    this.found = this.deck.map(() => null); // null, 'me' ou 'ai'
    this.open = []; // cartes retournées ce tour-ci
    this.memory = new Map();
    this.cursor = 0;
    this.turn = 'me';
    this.score = { me: 0, ai: 0 };
    this.wait = 0;
    this.result = null;
    this.message = 'Retourne deux cartes : trouve les paires !';
  }

  get box() {
    const r = this.game.renderer;
    const w = Math.min(r.width - 8, 200);
    return { x: Math.round((r.width - w) / 2), y: Math.max(18, Math.round((r.height - 160) / 2)), w, h: 160 };
  }

  cardRect(i) {
    const b = this.box;
    const cw = 30;
    const ch = 30;
    const gap = 4;
    const x0 = b.x + Math.round((b.w - (COLS * cw + (COLS - 1) * gap)) / 2);
    return { x: x0 + (i % COLS) * (cw + gap), y: b.y + 28 + Math.floor(i / COLS) * (ch + gap), w: cw, h: ch };
  }

  flip(i, who) {
    if (this.found[i] || this.open.includes(i) || this.open.length >= 2) return false;
    this.open.push(i);
    this.game.audio.play(who === 'me' ? 'menu_ok' : 'menu_move');
    // L'habitant voit toutes les cartes retournées (et en retient une partie).
    remember(this.memory, i, this.deck[i], { skill: this.skill, rand: this.rand });
    if (this.open.length === 2) this.wait = 1.1;
    else this.wait = 0.7;
    return true;
  }

  /** Deux cartes retournées : paire ou pas ? */
  resolve() {
    const [a, b] = this.open;
    this.open = [];
    if (this.deck[a] === this.deck[b]) {
      this.found[a] = this.found[b] = this.turn;
      this.score[this.turn]++;
      this.game.audio.play(this.turn === 'me' ? 'coin' : 'menu_no');
      this.message = this.turn === 'me' ? `Une paire de ${ANIMALS[this.deck[a]]}s ! Rejoue.` : `${this.opponent} trouve une paire et rejoue.`;
      if (this.found.every(Boolean)) {
        this.result = result(this.score.me, this.score.ai);
        this.wait = 2;
        this.game.audio.play(this.result === 'win' ? 'quest_done' : this.result === 'lose' ? 'quiz_ko' : 'menu_no');
      }
    } else {
      this.turn = this.turn === 'me' ? 'ai' : 'me';
      this.message = this.turn === 'me' ? 'À toi !' : `${this.opponent} joue...`;
    }
    this.wait = this.result ? 2 : 0.5;
  }

  finish(res) {
    this.close();
    this.onDone?.(res);
  }

  update(dt) {
    const i = this.input;
    if (this.result) {
      this.wait -= dt;
      if (this.wait <= 0 || (this.wait < 1.5 && i.validated())) this.finish(this.result);
      return;
    }
    if (i.cancelled()) return this.finish('quit');
    if (this.open.length === 2) {
      if ((this.wait -= dt) <= 0) this.resolve();
      return;
    }
    if (this.turn === 'ai') {
      if ((this.wait -= dt) > 0) return;
      const opts = { rand: this.rand };
      const pick = this.open.length === 0 ? aiFirst(this.found, this.memory, opts) : aiSecond(this.found, this.memory, this.open[0], this.deck[this.open[0]], opts);
      this.flip(pick, 'ai');
      return;
    }
    this.wait -= dt;
    const c = this.cursor;
    if (i.pressed('left') && c % COLS > 0) this.cursor--;
    if (i.pressed('right') && c % COLS < COLS - 1) this.cursor++;
    if (i.pressed('up') && c >= COLS) this.cursor -= COLS;
    if (i.pressed('down') && c < COLS * (ROWS - 1)) this.cursor += COLS;
    if (this.cursor !== c) this.game.audio.play('menu_move');
    for (let k = 0; k < this.deck.length; k++) {
      if (i.tappedIn(this.cardRect(k))) {
        i.consumeTaps();
        this.cursor = k;
        if (!this.flip(k, 'me')) this.game.audio.play('menu_no');
        return;
      }
    }
    if (i.validated()) {
      i.consume('action');
      if (!this.flip(this.cursor, 'me')) this.game.audio.play('menu_no');
    }
  }

  draw(r) {
    const s = this.game.style;
    r.withAlpha(0.7, () => r.rect(0, 0, r.width, r.height, '#000'));
    const b = this.box;
    drawPanel(r, b.x, b.y, b.w, b.h, s);
    r.fitText(`Memory contre ${this.opponent}`, r.width / 2, b.y + 4, b.w - 8, { color: s.accent, size: 8, font: s.font, bold: true, align: 'center' });
    const status = this.result ? { win: 'Tu as gagné, bravo !', lose: `${this.opponent} a gagné... Rejoue !`, draw: 'Égalité !' }[this.result] : this.message;
    r.fitText(status, r.width / 2, b.y + 15, b.w - 8, { color: s.text, size: 7, font: s.font, align: 'center' });
    this.deck.forEach((v, k) => {
      const c = this.cardRect(k);
      const shown = this.found[k] || this.open.includes(k);
      if (shown) {
        r.rect(c.x, c.y, c.w, c.h, this.found[k] === 'me' ? '#3ac46a' : this.found[k] === 'ai' ? '#8a8aa0' : '#ffd35a');
        r.rect(c.x + 2, c.y + 2, c.w - 4, c.h - 4, '#f4e8c8');
        drawAnimal(r, v, c.x + c.w / 2, c.y + c.h / 2 + 1);
      } else {
        r.rect(c.x, c.y, c.w, c.h, '#2a5a2a');
        r.rect(c.x + 2, c.y + 2, c.w - 4, c.h - 4, '#3f8a36');
        r.rect(c.x + 12, c.y + 9, 6, 12, '#6bc458'); // feuille au dos de la carte
        r.rect(c.x + 14, c.y + 7, 2, 16, '#2a5a2a');
      }
    });
    if (!this.result && this.turn === 'me' && this.open.length < 2 && Math.floor(this.game.time * 3) % 3 !== 0) {
      const c = this.cardRect(this.cursor);
      r.strokeRect(c.x - 1, c.y - 1, c.w + 2, c.h + 2, s.accent, 2);
    }
    const y = b.y + b.h - 22;
    r.fitText(`Toi : ${this.score.me} paire${this.score.me > 1 ? 's' : ''}  ·  ${this.opponent} : ${this.score.ai}`, r.width / 2, y, b.w - 8, { color: s.text, size: 7, font: s.font, bold: true, align: 'center' });
    r.fitText('Action : retourner · B : abandonner', r.width / 2, y + 10, b.w - 8, { color: s.dim, size: 6, font: s.font, align: 'center' });
  }
}
