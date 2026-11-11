import { Scene } from '../../engine/index.js';
import { check } from '../script/conditions.js';

// CARTE DU MONDE — un écran plein qui montre les lieux du jeu et permet d'y voyager.
//
//   new WorldMapScene({
//     title: 'Carte du royaume',
//     nodes: [{ id, label, x: 0.36, y: 0.83,          position (0..1) sur l'image
//               color, kind: 'start' | 'stone' | 'final',
//               open: condition, done: condition,       lieu accessible ? quête du lieu finie ?
//               closedText: 'Il faut les 6 pierres.',
//               mapId, at: [tx, ty], facing }],         où arrive le héros
//     paint(r, box, state, time),                      dessine le fond dans la zone `box`
//     state, current: 'id', travel: true,
//     onTravel(node), onClose(),
//   })
// Croix : passer d'un lieu à l'autre · Action : y aller · B : fermer.

const ASPECT = 256 / 176;

export class WorldMapScene extends Scene {
  constructor(cfg) {
    super();
    this.cfg = cfg;
    this.nodes = cfg.nodes;
    this.index = Math.max(0, this.nodes.findIndex((n) => n.id === cfg.current));
    this.message = null;
  }

  get box() {
    const r = this.game.renderer;
    const availH = r.height - 30;
    let w = r.width;
    let h = Math.round(w / ASPECT);
    if (h > availH) (h = availH), (w = Math.round(h * ASPECT));
    return { x: Math.round((r.width - w) / 2), y: 0, w, h };
  }

  pos(n) {
    const b = this.box;
    return { x: b.x + n.x * b.w, y: b.y + n.y * b.h };
  }

  isOpen(n) {
    return check(n.open, this.cfg.state);
  }

  isDone(n) {
    return n.done ? check(n.done, this.cfg.state) : false;
  }

  /** Lieu le plus proche dans la direction (dx, dy). */
  neighbour(dx, dy) {
    const from = this.pos(this.nodes[this.index]);
    let best = -1;
    let bestScore = Infinity;
    this.nodes.forEach((n, i) => {
      if (i === this.index) return;
      const p = this.pos(n);
      const vx = p.x - from.x;
      const vy = p.y - from.y;
      const d = Math.hypot(vx, vy);
      const along = (vx * dx + vy * dy) / d;
      if (along < 0.35) return;
      const score = d * (2 - along);
      if (score < bestScore) (bestScore = score), (best = i);
    });
    return best;
  }

  update(dt) {
    const i = this.input;
    if (this.message && (this.message.t -= dt) <= 0) this.message = null;
    if (i.cancelled()) {
      this.close();
      return this.cfg.onClose?.();
    }
    for (const [a, dx, dy] of [['left', -1, 0], ['right', 1, 0], ['up', 0, -1], ['down', 0, 1]]) {
      if (!i.pressed(a)) continue;
      const k = this.neighbour(dx, dy);
      if (k >= 0) (this.index = k), this.game.audio.play('menu_move'), (this.message = null);
    }
    // toucher un lieu
    this.nodes.forEach((n, k) => {
      const p = this.pos(n);
      if (i.tappedIn({ x: p.x - 9, y: p.y - 9, w: 18, h: 18 })) {
        i.consumeTaps();
        if (k === this.index) this.choose();
        else (this.index = k), this.game.audio.play('menu_move');
      }
    });
    if (i.validated()) {
      i.consume('action');
      this.choose();
    }
  }

  choose() {
    const n = this.nodes[this.index];
    if (!this.isOpen(n)) {
      this.game.audio.play('menu_no');
      this.message = { text: this.fmt(n.closedText ?? 'Ce lieu est fermé.'), t: 3 };
      return;
    }
    if (!this.cfg.travel) {
      this.game.audio.play('menu_no');
      this.message = { text: 'Pour voyager, prends la route à la sortie d’un lieu.', t: 3 };
      return;
    }
    this.game.audio.play('menu_ok');
    this.close();
    this.cfg.onTravel?.(n);
  }

  fmt(t) {
    return this.cfg.format ? this.cfg.format(t) : t;
  }

  draw(r) {
    const s = this.game.style;
    const t = this.game.time;
    r.rect(0, 0, r.width, r.height, '#0b0d1c');
    const b = this.box;
    this.cfg.paint?.(r, b, this.cfg.state, t);
    // lieux
    this.nodes.forEach((n, k) => {
      const p = this.pos(n);
      const open = this.isOpen(n);
      const done = this.isDone(n);
      r.rect(p.x - 6, p.y - 6, 12, 12, 'rgba(10,8,20,.8)');
      const col = n.kind === 'start' ? '#ffd35a' : done || n.kind === 'final' ? n.color : open ? '#d8d8e0' : '#6a6a78';
      diamond(r, p.x, p.y, 4, col);
      if (!open) r.rect(p.x + 2, p.y + 1, 4, 4, '#2a2a34'), r.rect(p.x + 3, p.y - 1, 2, 2, '#9a9aa8');
      if (k === this.index && Math.floor(t * 3) % 3 !== 0) r.strokeRect(p.x - 8, p.y - 8, 16, 16, s.accent, 1);
    });
    // panneau du bas
    const n = this.nodes[this.index];
    const py = r.height - 30;
    r.rect(0, py, r.width, 30, s.box);
    r.rect(0, py, r.width, 1, s.border);
    r.fitText(this.fmt(n.label), 6, py + 4, r.width - 12, { color: s.accent, size: 8, font: s.font, bold: true });
    const status = this.message?.text ?? (this.isDone(n) ? (n.doneText ?? 'Terminé ✓') : this.isOpen(n) ? (this.cfg.travel ? 'Action : y aller · B : fermer' : 'B : fermer') : (n.closedText ?? 'Fermé'));
    r.fitText(this.fmt(status), 6, py + 16, r.width - 12, { color: this.message ? s.text : s.dim, size: 7, font: s.font });
    r.fitText(this.cfg.title ?? 'Carte', b.x + b.w - 4, 3, b.w - 8, { color: '#ffe8a0', size: 8, font: s.font, bold: true, align: 'right', shadow: '#000' });
  }
}

function diamond(r, cx, cy, s, col) {
  const c = r.ctx;
  c.fillStyle = col;
  c.beginPath();
  c.moveTo(cx, cy - s);
  c.lineTo(cx + s, cy);
  c.lineTo(cx, cy + s);
  c.lineTo(cx - s, cy);
  c.closePath();
  c.fill();
  c.fillStyle = 'rgba(255,255,255,.7)';
  c.fillRect(cx - 1, cy - 2, 1, 2);
}
