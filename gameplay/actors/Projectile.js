import { Entity } from '../../engine/index.js';
import { Effect } from './Effect.js';

// PROJECTILE : flammèche du bâton de feu, boule de neige d'un monstre, flèche...
//  - vole en ligne droite, disparaît contre un mur ou au bout de sa portée ;
//  - passe au-dessus des tuiles basses (propriété de tuile `low` : eau, trou) ;
//  - un objet peut réagir avec onProjectile(p) (brasero, mur de glace, boss) : renvoie true s'il l'arrête ;
//  - `hostile` : lancé par un monstre, il blesse le héros (un coup d'épée le détruit).
//
// Images (planche 'objects') : {kind}_0, {kind}_1

export class Projectile extends Entity {
  constructor({ x, y, dir, kind = 'fire', speed = 150, hostile = false, damage = 1, range = 150, owner = null }) {
    super({ x: x - 3, y: y - 3, w: 6, h: 6, tags: ['projectile'] });
    const len = Math.hypot(dir.x, dir.y) || 1;
    this.vx = (dir.x / len) * speed;
    this.vy = (dir.y / len) * speed;
    this.kind = kind;
    this.hostile = hostile;
    this.damage = damage;
    this.left = range;
    this.owner = owner;
    this.t = 0;
    this.z = 50;
  }

  get adv() {
    return this.world.adv;
  }

  stop() {
    if (this.dead) return;
    this.world.add(new Effect(this.cx, this.cy, { duration: 0.18 }));
    this.kill();
  }

  /** Mur ? Les tuiles basses (eau...) laissent passer. */
  _hitsWall() {
    const tm = this.world.tilemap;
    const ts = tm.tileSize;
    const tx = Math.floor(this.cx / ts);
    const ty = Math.floor(this.cy / ts);
    if (tx < 0 || ty < 0 || tx >= tm.width || ty >= tm.height) return true;
    return tm.isSolidTile(tx, ty) && !tm.propAt(tx, ty, 'low');
  }

  update(dt) {
    this.t += dt;
    const step = Math.hypot(this.vx, this.vy) * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.left -= step;
    if (this.left <= 0 || this._hitsWall()) return this.stop();
    for (const e of this.world.query(this, (o) => o !== this && o !== this.owner && !o.has('projectile'))) {
      if (typeof e.onProjectile === 'function') {
        if (e.onProjectile(this)) return this.stop();
        continue;
      }
      if (this.hostile) {
        if (e.has('hero')) {
          e.hurt(this.damage, this);
          return this.stop();
        }
        if (e.solid && !e.has('enemy')) return this.stop();
      } else if (e.has('enemy')) {
        if (e.hurt(this.damage, this, { knockback: 120 })) this.world.game.audio.play('hit');
        return this.stop();
      } else if (e.solid && !e.has('hero')) return this.stop();
    }
  }

  /** Un coup d'épée détruit un projectile ennemi. */
  onSwordHit() {
    if (this.hostile) this.stop();
  }

  draw(r) {
    const frame = `${this.kind}_${Math.floor(this.t * 10) % 2}`;
    this.world.game.themes.current.sprites.objects.draw(r, frame, this.x - 5, this.y - 5);
  }
}
