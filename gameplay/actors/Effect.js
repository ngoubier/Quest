import { Entity } from '../../engine/index.js';

// Effet visuel éphémère (fumée de disparition...). Images prises dans la planche 'objects'.
export class Effect extends Entity {
  constructor(cx, cy, { frames = ['poof_0', 'poof_1'], duration = 0.3 } = {}) {
    super({ x: cx - 8, y: cy - 8, w: 16, h: 16 });
    this.frames = frames;
    this.duration = duration;
    this.t = 0;
    this.z = 100;
  }

  update(dt) {
    this.t += dt;
    if (this.t >= this.duration) this.kill();
  }

  draw(r) {
    const i = Math.min(this.frames.length - 1, Math.floor((this.t / this.duration) * this.frames.length));
    this.world.game.themes.current.sprites.objects.draw(r, this.frames[i], this.x, this.y);
  }
}
