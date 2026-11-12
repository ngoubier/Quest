import { Projectile } from './Projectile.js';

// BOOMERANG : il part tout droit, puis revient vers le héros (en passant au-dessus des murs).
//  - il rapporte les objets qu'il touche (une clé sur un îlot, une lettre derrière des caisses...) ;
//  - il étourdit les monstres (ils s'arrêtent quelques secondes) ;
//  - il actionne les leviers et les cibles à distance (objets avec onProjectile).
// Un seul boomerang à la fois. Images (planche 'objects') : boomerang_0, boomerang_1.

export class Boomerang extends Projectile {
  constructor({ x, y, dir, owner, speed = 150, range = 100 }) {
    super({ x, y, dir, kind: 'boomerang', speed, range, owner });
    this.returning = false;
    this.speed = speed;
    this.hits = new Set();
    this.carried = [];
  }

  /** Touché quelque chose : il fait demi-tour au lieu de disparaître. */
  stop() {
    if (!this.returning) this.returning = true;
  }

  update(dt) {
    this.t += dt;
    const owner = this.owner;
    if (this.returning) {
      if (!owner || owner.dead) return this.kill();
      const dx = owner.cx - this.cx;
      const dy = owner.cy - this.cy;
      const d = Math.hypot(dx, dy);
      if (d < 8) return this.kill(); // de retour dans la main : les objets portés tombent sur le héros
      const v = this.speed * 1.15;
      this.x += (dx / d) * v * dt;
      this.y += (dy / d) * v * dt;
    } else {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.left -= this.speed * dt;
      if (this.left <= 0 || this._hitsWall()) this.returning = true;
    }
    for (const e of this.world.query(this, (o) => o !== this && o !== owner && !o.has('projectile') && !this.hits.has(o))) {
      if (e.has('pickup')) {
        if (!e.hidden && !e.carrier) (e.carrier = this), this.carried.push(e);
        continue;
      }
      this.hits.add(e);
      if (typeof e.onProjectile === 'function') {
        if (e.onProjectile(this)) this.returning = true;
        continue;
      }
      if (e.has('enemy')) {
        e.stun?.(2.2);
        this.world.game.audio.play('hit');
        this.returning = true;
      } else if (e.solid && !e.has('hero') && !this.returning) this.returning = true;
    }
  }

  kill() {
    for (const p of this.carried) p.carrier = null;
    super.kill();
  }

  draw(r) {
    this.world.game.themes.current.sprites.objects.draw(r, `boomerang_${Math.floor(this.t * 12) % 2}`, this.x - 5, this.y - 5);
  }
}
