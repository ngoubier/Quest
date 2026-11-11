import { clamp, lerp, easeInOut } from '../core/math.js';

// Caméra. Deux modes :
//  - 'follow' : centrée sur la cible, bornée à la carte (jeux type RPG moderne) ;
//  - 'rooms'  : écran fixe par "salle", défilement animé quand on change de salle
//               (comme le Zelda original). Si l'écran est plus petit que la salle
//               (téléphone), la caméra suit le héros sans sortir de la salle.
//               Si l'écran est plus grand que la salle (PC grand écran), la salle est
//               centrée et on aperçoit les salles voisines sur les côtés.

export class Camera {
  constructor({ width, height, bounds = null, mode = 'follow', roomWidth = width, roomHeight = height, scrollDuration = 0.75 }) {
    this.width = width;
    this.height = height;
    this.bounds = bounds; // {w, h} en pixels
    this.mode = mode;
    this.roomWidth = roomWidth;
    this.roomHeight = roomHeight;
    this.scrollDuration = scrollDuration;
    this.x = 0;
    this.y = 0;
    this.target = null;
    this.room = { x: 0, y: 0 };
    this.transition = null;
    this.onRoomChange = null; // (newRoom, oldRoom) => void
    this._shake = null;
    this.shakeX = 0;
    this.shakeY = 0;
  }

  get isTransitioning() {
    return !!this.transition;
  }

  get view() {
    return { x: this.x, y: this.y, w: this.width, h: this.height };
  }

  follow(target, snap = true) {
    this.target = target;
    if (snap) this.snap();
  }

  roomOf(px, py) {
    return { x: Math.floor(px / this.roomWidth), y: Math.floor(py / this.roomHeight) };
  }

  /** Rectangle de la salle (en pixels monde). */
  roomRect(room = this.room) {
    return { x: room.x * this.roomWidth, y: room.y * this.roomHeight, w: this.roomWidth, h: this.roomHeight };
  }

  /** Position de la caméra dans une salle : centrée sur la cible, bornée à la salle. */
  _inRoom(room, px, py) {
    const rr = this.roomRect(room);
    const fit = (p, size, start, len) => (size >= len ? start - Math.floor((size - len) / 2) : clamp(p - size / 2, start, start + len - size));
    return { x: fit(px, this.width, rr.x, rr.w), y: fit(py, this.height, rr.y, rr.h) };
  }

  /** Place la caméra immédiatement sur la cible, sans animation. */
  snap() {
    this.transition = null;
    if (!this.target) return;
    if (this.mode === 'rooms') {
      this.room = this.roomOf(this.target.cx, this.target.cy);
      const p = this._inRoom(this.room, this.target.cx, this.target.cy);
      this.x = p.x;
      this.y = p.y;
    } else this._centerOn(this.target.cx, this.target.cy);
  }

  _centerOn(px, py) {
    this.x = px - this.width / 2;
    this.y = py - this.height / 2;
    if (this.bounds) {
      // Carte plus petite que l'écran : elle est centrée.
      const fit = (p, size, len) => (size >= len ? -Math.floor((size - len) / 2) : clamp(p, 0, len - size));
      this.x = fit(this.x, this.width, this.bounds.w);
      this.y = fit(this.y, this.height, this.bounds.h);
    }
  }

  shake(intensity = 2, duration = 0.25) {
    this._shake = { intensity, duration, t: 0 };
  }

  update(dt) {
    if (this._shake) {
      const s = this._shake;
      s.t += dt;
      const k = 1 - s.t / s.duration;
      if (k <= 0) {
        this._shake = null;
        this.shakeX = this.shakeY = 0;
      } else {
        this.shakeX = Math.round((Math.random() * 2 - 1) * s.intensity * k);
        this.shakeY = Math.round((Math.random() * 2 - 1) * s.intensity * k);
      }
    }

    if (this.transition) {
      const tr = this.transition;
      tr.t += dt;
      const k = Math.min(1, tr.t / tr.duration);
      const e = easeInOut(k);
      this.x = lerp(tr.from.x, tr.to.x, e);
      this.y = lerp(tr.from.y, tr.to.y, e);
      if (k >= 1) {
        this.transition = null;
        this.onRoomChange?.(this.room, tr.oldRoom);
      }
      return;
    }

    if (!this.target) return;
    if (this.mode === 'rooms') {
      const r = this.roomOf(this.target.cx, this.target.cy);
      if (r.x !== this.room.x || r.y !== this.room.y) {
        const oldRoom = this.room;
        this.room = r;
        this.transition = {
          t: 0,
          duration: this.scrollDuration,
          from: { x: this.x, y: this.y },
          to: this._inRoom(r, this.target.cx, this.target.cy),
          dir: { x: Math.sign(r.x - oldRoom.x), y: Math.sign(r.y - oldRoom.y) },
          oldRoom,
        };
      } else {
        const p = this._inRoom(this.room, this.target.cx, this.target.cy);
        this.x = p.x;
        this.y = p.y;
      }
    } else this._centerOn(this.target.cx, this.target.cy);
  }
}
