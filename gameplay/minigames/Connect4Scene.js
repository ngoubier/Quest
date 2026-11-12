import { Scene } from '../../engine/index.js';
import { COLS, ROWS, empty, drop, landingRow, winner, winningCells, aiCol } from './connect4.js';
import { skillForAge } from './tictactoe.js';

// PUISSANCE 4 contre un habitant. L'enfant joue les jetons rouges et commence.
// Gauche/Droite : choisir la colonne · Action : lâcher le jeton · B : abandonner.
// Tactile : toucher la colonne. Le premier qui aligne 4 jetons gagne.
// onDone(result) : 'win' | 'lose' | 'draw' | 'quit'

const CELL = 16;

export class Connect4Scene extends Scene {
  constructor({ opponent = 'Habitant', age = 8, onDone, rand = Math.random } = {}) {
    super();
    this.transparent = true;
    this.opponent = String(opponent).split(',')[0];
    this.skill = skillForAge(age);
    this.onDone = onDone;
    this.rand = rand;
    this.board = empty();
    this.col = 3;
    this.turn = 'X';
    this.result = null;
    this.wait = 0;
    this.falling = null; // { c, r, y, who } : jeton qui tombe
  }

  get origin() {
    const r = this.game.renderer;
    return { x: Math.round((r.width - COLS * CELL) / 2), y: Math.round((r.height - ROWS * CELL) / 2) + 14 };
  }

  play(c, who) {
    const r = landingRow(this.board, c);
    if (r < 0 || this.result || this.falling) return false;
    this.falling = { c, r, y: -1, who };
    this.game.audio.play(who === 'X' ? 'menu_ok' : 'menu_move');
    return true;
  }

  land() {
    const { c, who } = this.falling;
    this.falling = null;
    this.board = drop(this.board, c, who);
    const w = winner(this.board);
    if (w) {
      this.result = w === 'X' ? 'win' : w === 'O' ? 'lose' : 'draw';
      this.wait = 2;
      this.game.audio.play(this.result === 'win' ? 'quest_done' : this.result === 'lose' ? 'quiz_ko' : 'menu_no');
    } else {
      this.turn = who === 'X' ? 'O' : 'X';
      this.wait = 0.5;
    }
  }

  finish(result) {
    this.close();
    this.onDone?.(result);
  }

  update(dt) {
    const i = this.input;
    if (this.falling) {
      this.falling.y += dt * 14;
      if (this.falling.y >= this.falling.r) this.land();
      return;
    }
    if (this.result) {
      this.wait -= dt;
      if (this.wait <= 0 || (this.wait < 1.5 && i.validated())) this.finish(this.result);
      return;
    }
    if (i.cancelled()) return this.finish('quit');
    if (this.turn === 'O') {
      if ((this.wait -= dt) <= 0) this.play(aiCol(this.board, { skill: this.skill, rand: this.rand }), 'O');
      return;
    }
    const c = this.col;
    if (i.pressed('left')) this.col = Math.max(0, this.col - 1);
    if (i.pressed('right')) this.col = Math.min(COLS - 1, this.col + 1);
    if (this.col !== c) this.game.audio.play('menu_move');
    const o = this.origin;
    for (let k = 0; k < COLS; k++) {
      if (i.tappedIn({ x: o.x + k * CELL, y: o.y - 18, w: CELL, h: ROWS * CELL + 18 })) {
        i.consumeTaps();
        this.col = k;
        if (!this.play(k, 'X')) this.game.audio.play('menu_no');
        return;
      }
    }
    if (i.validated()) {
      i.consume('action');
      if (!this.play(this.col, 'X')) this.game.audio.play('menu_no');
    }
  }

  token(r, x, y, who, glow = false) {
    const col = who === 'X' ? ['#e83a3a', '#ff8a8a', '#a82020'] : ['#f4c020', '#fff0a0', '#b08010'];
    r.rect(x + 2, y + 1, 12, 14, col[2]);
    r.rect(x + 1, y + 2, 14, 12, col[2]);
    r.rect(x + 2, y + 2, 12, 11, col[0]);
    r.rect(x + 4, y + 3, 4, 2, col[1]);
    if (glow) r.strokeRect(x, y, 16, 16, '#ffffff');
  }

  draw(r) {
    const s = this.game.style;
    r.withAlpha(0.7, () => r.rect(0, 0, r.width, r.height, '#000'));
    const o = this.origin;
    const bw = Math.min(r.width - 8, 170);
    const box = { x: Math.round((r.width - bw) / 2), y: o.y - 46, w: bw, h: ROWS * CELL + 68 };
    r.rect(box.x, box.y, box.w, box.h, s.box);
    r.strokeRect(box.x, box.y, box.w, box.h, s.border);
    r.fitText(`Puissance 4 contre ${this.opponent}`, r.width / 2, box.y + 4, box.w - 8, { color: s.accent, size: 8, font: s.font, bold: true, align: 'center' });
    const status = this.result
      ? { win: 'Gagné, bravo !', lose: 'Perdu... Rejoue !', draw: 'Égalité !' }[this.result]
      : this.turn === 'X'
        ? 'À toi : aligne 4 jetons rouges'
        : `${this.opponent} réfléchit...`;
    r.fitText(status, r.width / 2, box.y + 15, box.w - 8, { color: s.text, size: 7, font: s.font, align: 'center' });
    // jeton au-dessus de la colonne choisie
    if (!this.result && this.turn === 'X' && !this.falling) this.token(r, o.x + this.col * CELL, o.y - 17, 'X');
    // plateau bleu, trous
    r.rect(o.x - 3, o.y - 1, COLS * CELL + 6, ROWS * CELL + 4, '#1a3ea8');
    const line = new Set(winningCells(this.board) ?? []);
    for (let row = 0; row < ROWS; row++) {
      for (let c = 0; c < COLS; c++) {
        const x = o.x + c * CELL;
        const y = o.y + row * CELL;
        const v = this.board[row * COLS + c];
        if (v) this.token(r, x, y, v, line.has(row * COLS + c));
        else (r.rect(x + 3, y + 2, 10, 12, '#0c1a4a'), r.rect(x + 2, y + 3, 12, 10, '#0c1a4a'));
      }
    }
    if (this.falling) this.token(r, o.x + this.falling.c * CELL, o.y + Math.min(this.falling.y, this.falling.r) * CELL, this.falling.who);
    r.fitText('◀ ▶ : colonne · Action : jouer · B : abandonner', r.width / 2, o.y + ROWS * CELL + 8, box.w - 8, { color: s.dim, size: 6, font: s.font, align: 'center' });
  }
}
