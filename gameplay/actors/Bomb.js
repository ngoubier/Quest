import { Entity } from '../../engine/index.js';
import { Effect } from './Effect.js';

// BOMBE : posée devant le héros, elle explose au bout de quelques secondes.
//  - tuiles avec la propriété `bombable: 'tuile'` (mur fissuré) : elles s'ouvrent (mémorisé) ;
//  - monstres blessés (2), héros blessé (1) s'il est trop près ;
//  - objets avec onBomb() (interrupteur cristal...) ; un boss peut aussi réagir avec onBomb().
// Images (planche 'objects') : bomb_0, bomb_1.

export class Bomb extends Entity {
  constructor(x, y, { fuse = 1.8, radius = 22 } = {}) {
    super({ x: x - 6, y: y - 6, w: 12, h: 12, tags: ['bomb'] });
    this.fuse = fuse;
    this.radius = radius;
    this.t = 0;
    this.z = -1;
  }

  get adv() {
    return this.world.adv;
  }

  update(dt) {
    this.t += dt;
    if ((this.fuse -= dt) <= 0) this.explode();
  }

  explode() {
    const w = this.world;
    const g = w.game;
    const r = this.radius;
    const zone = { x: this.cx - r, y: this.cy - r, w: r * 2, h: r * 2 };
    // murs fissurés
    const tm = w.tilemap;
    const ts = tm.tileSize;
    for (let ty = Math.floor(zone.y / ts); ty <= Math.floor((zone.y + zone.h) / ts); ty++) {
      for (let tx = Math.floor(zone.x / ts); tx <= Math.floor((zone.x + zone.w) / ts); tx++) {
        const to = tm.propAt(tx, ty, 'bombable');
        if (!to) continue;
        // seulement les murs vraiment proches (pas en diagonale lointaine)
        if (Math.hypot(tx * ts + 8 - this.cx, ty * ts + 8 - this.cy) > r + 6) continue;
        this.adv.blastTile(tx, ty, to);
        w.add(new Effect(tx * ts + 8, ty * ts + 8, { duration: 0.4 }));
        g.audio.play('secret');
      }
    }
    for (const e of w.query(zone, (o) => o !== this && !o.dead)) {
      if (typeof e.onBomb === 'function') e.onBomb(this);
      else if (e.has('enemy')) e.hurt?.(2, this, { knockback: 220 });
      else if (e.has('hero')) e.hurt(1, this);
    }
    for (let k = 0; k < 5; k++) w.add(new Effect(this.cx + Math.cos(k * 1.26) * (k ? 10 : 0), this.cy + Math.sin(k * 1.26) * (k ? 10 : 0), { duration: 0.35 }));
    w.camera.shake(3, 0.3);
    g.audio.play('boom');
    this.kill();
  }

  draw(r) {
    const fast = this.fuse < 0.7 ? 14 : 6;
    const frame = Math.floor(this.t * fast) % 2 ? 'bomb_1' : 'bomb_0';
    this.world.game.themes.current.sprites.objects.draw(r, frame, this.x - 2, this.y - 3);
  }
}

