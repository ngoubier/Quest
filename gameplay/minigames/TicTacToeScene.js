import { Scene } from '../../engine/index.js';
import { winner, winningLine, aiMove, skillForAge } from './tictactoe.js';

// MORPION contre un habitant. L'enfant joue les croix et commence.
// Croix directionnelle pour choisir une case, Action pour jouer, B pour abandonner.
// Sur écran tactile, on touche directement la case.
// onDone(result) : 'win' | 'lose' | 'draw' | 'quit'

export class TicTacToeScene extends Scene {
  constructor({ opponent = 'Habitant', age = 8, onDone, rand = Math.random } = {}) {
    super();
    this.transparent = true;
    this.opponent = String(opponent).split(',')[0]; // « Bastien, le garde » -> « Bastien »
    this.skill = skillForAge(age);
    this.onDone = onDone;
    this.rand = rand;
    this.board = Array(9).fill(null);
    this.cursor = 4;
    this.turn = 'X';
    this.result = null;
    this.wait = 0;
  }

  get cell() {
    return 22;
  }

  get origin() {
    const r = this.game.renderer;
    const size = this.cell * 3;
    return { x: Math.round((r.width - size) / 2), y: Math.round((r.height - size) / 2) + 6 };
  }

  rect(i) {
    const o = this.origin;
    return { x: o.x + (i % 3) * this.cell, y: o.y + Math.floor(i / 3) * this.cell, w: this.cell, h: this.cell };
  }

  play(i, who) {
    if (this.board[i] || this.result) return false;
    this.board[i] = who;
    this.game.audio.play(who === 'X' ? 'menu_ok' : 'menu_move');
    const w = winner(this.board);
    if (w) {
      this.result = w === 'X' ? 'win' : w === 'O' ? 'lose' : 'draw';
      this.wait = 1.6;
      this.game.audio.play(this.result === 'win' ? 'quest_done' : this.result === 'lose' ? 'quiz_ko' : 'menu_no');
    } else {
      this.turn = who === 'X' ? 'O' : 'X';
      this.wait = 0.45; // l'habitant « réfléchit »
    }
    return true;
  }

  finish(result) {
    this.close();
    this.onDone?.(result);
  }

  update(dt) {
    const i = this.input;
    if (this.result) {
      this.wait -= dt;
      if (this.wait <= 0 || (this.wait < 1.2 && i.validated())) this.finish(this.result);
      return;
    }
    if (i.cancelled()) return this.finish('quit');
    if (this.turn === 'O') {
      if ((this.wait -= dt) <= 0) this.play(aiMove(this.board, { skill: this.skill, rand: this.rand }), 'O');
      return;
    }
    const c = this.cursor;
    if (i.pressed('left') && c % 3 > 0) this.cursor--;
    if (i.pressed('right') && c % 3 < 2) this.cursor++;
    if (i.pressed('up') && c > 2) this.cursor -= 3;
    if (i.pressed('down') && c < 6) this.cursor += 3;
    if (this.cursor !== c) this.game.audio.play('menu_move');
    for (let k = 0; k < 9; k++) {
      if (i.tappedIn(this.rect(k))) {
        i.consumeTaps();
        this.cursor = k;
        this.play(k, 'X');
        return;
      }
    }
    if (i.validated()) {
      i.consume('action');
      if (!this.play(this.cursor, 'X')) this.game.audio.play('menu_no');
    }
  }

  draw(r) {
    const s = this.game.style;
    r.withAlpha(0.7, () => r.rect(0, 0, r.width, r.height, '#000'));
    const o = this.origin;
    const size = this.cell * 3;
    const bw = Math.min(r.width - 8, 170);
    const box = { x: Math.round((r.width - bw) / 2), y: o.y - 34, w: bw, h: size + 58 };
    r.rect(box.x, box.y, box.w, box.h, s.box);
    r.strokeRect(box.x, box.y, box.w, box.h, s.border);
    r.fitText(`Morpion contre ${this.opponent}`, r.width / 2, box.y + 5, box.w - 8, { color: s.accent, size: 8, font: s.font, bold: true, align: 'center' });
    const status = this.result
      ? { win: 'Gagné, bravo !', lose: 'Perdu... Rejoue !', draw: 'Égalité !' }[this.result]
      : this.turn === 'X'
        ? 'À toi : aligne 3 croix'
        : `${this.opponent} réfléchit...`;
    r.fitText(status, r.width / 2, box.y + 17, box.w - 8, { color: s.text, size: 7, font: s.font, align: 'center' });
    // plateau
    r.rect(o.x, o.y, size, size, '#f4e8c8');
    for (let k = 1; k < 3; k++) {
      r.rect(o.x + k * this.cell - 1, o.y + 2, 2, size - 4, '#7a5a30');
      r.rect(o.x + 2, o.y + k * this.cell - 1, size - 4, 2, '#7a5a30');
    }
    const line = winningLine(this.board);
    this.board.forEach((v, k) => {
      const c = this.rect(k);
      if (line?.includes(k)) r.rect(c.x + 2, c.y + 2, c.w - 4, c.h - 4, '#ffe08a');
      const cx = c.x + c.w / 2;
      const cy = c.y + c.h / 2;
      if (v === 'X') {
        for (let d = -6; d <= 6; d++) {
          r.rect(cx + d - 1, cy + d - 1, 3, 3, '#d83a3a');
          r.rect(cx + d - 1, cy - d - 1, 3, 3, '#d83a3a');
        }
      } else if (v === 'O') {
        const ctx = r.ctx;
        ctx.strokeStyle = '#3a6ad8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, 6.5, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
    if (!this.result && this.turn === 'X' && Math.floor(this.game.time * 3) % 3 !== 0) {
      const c = this.rect(this.cursor);
      r.strokeRect(c.x + 1, c.y + 1, c.w - 2, c.h - 2, s.accent, 2);
    }
    r.fitText('Action : jouer · B : abandonner', r.width / 2, o.y + size + 8, box.w - 8, { color: s.dim, size: 6, font: s.font, align: 'center' });
  }
}
