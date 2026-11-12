import { Animator, rectsOverlap, createRng } from '../../engine/index.js';
import { Actor } from './Actor.js';
import { Effect } from './Effect.js';
import { Projectile } from './Projectile.js';

// MONSTRES. Un monstre = des statistiques + un comportement (fonction réutilisable).
// Les monstres hors de l'écran sont figés (économie, et lisibilité comme dans Zelda).
//
// Sprites attendus (planche 'objects') : {sprite}_0, {sprite}_1

export const BEHAVIORS = {
  /** Erre au hasard. */
  wander(e, dt) {
    e.timer -= dt;
    if (e.timer <= 0) {
      e.moving = e.rng() < 0.7;
      e.dir = e.rng.pick([
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]);
      e.timer = 0.5 + e.rng() * 1.2;
    }
    if (!e.moving) return;
    const res = e.move(e.dir[0] * e.speed * dt, e.dir[1] * e.speed * dt);
    if (res.hitX || res.hitY) e.timer = 0;
  },

  /** Fonce sur le héros s'il est proche, sinon erre. */
  chase(e, dt) {
    const h = e.adv.hero;
    const dx = h.cx - e.cx;
    const dy = h.cy - e.cy;
    const d = Math.hypot(dx, dy);
    if (d < (e.sight ?? 72) && d > 1) {
      // Petite hésitation aléatoire pour ne pas être un missile parfait.
      e.jitter = (e.jitter ?? 0) + dt;
      const wob = Math.sin(e.jitter * 6) * 0.4;
      e.move(((dx / d) + wob * (dy / d)) * e.speed * dt, ((dy / d) - wob * (dx / d)) * e.speed * dt);
    } else BEHAVIORS.wander(e, dt);
  },

  /** Erre, et lance un projectile (boule de neige...) vers le héros quand il est en vue. */
  shooter(e, dt) {
    BEHAVIORS.wander(e, dt);
    e.cool = (e.cool ?? 1 + e.rng()) - dt;
    if (e.cool > 0) return;
    const h = e.adv.hero;
    const dx = h.cx - e.cx;
    const dy = h.cy - e.cy;
    if (Math.hypot(dx, dy) > (e.sight ?? 88)) return;
    e.cool = 2 + e.rng();
    e.world.add(new Projectile({ x: e.cx, y: e.cy, dir: { x: dx, y: dy }, kind: e.shot, speed: 70, hostile: true, range: 120, owner: e }));
    e.game.audio.play('throw');
  },

  /** Saute vers le héros par petits bonds, avec une pause entre deux bonds (champignon sauteur). */
  hopper(e, dt) {
    if (e.hop) {
      e.hop.t -= dt;
      e.move(e.hop.vx * dt, e.hop.vy * dt);
      if (e.hop.t <= 0) (e.hop = null), (e.rest = 0.7 + e.rng() * 0.5);
      return;
    }
    if ((e.rest = (e.rest ?? e.rng()) - dt) > 0) return;
    const h = e.adv.hero;
    let dx = h.cx - e.cx;
    let dy = h.cy - e.cy;
    const d = Math.hypot(dx, dy);
    if (d > (e.sight ?? 80) || d < 1) {
      const a = e.rng() * Math.PI * 2;
      (dx = Math.cos(a)), (dy = Math.sin(a));
    } else (dx /= d), (dy /= d);
    e.hop = { vx: dx * e.speed * 2.5, vy: dy * e.speed * 2.5, t: 0.3 };
  },

  /** Fonce tout droit quand le héros est dans sa ligne ou sa colonne, puis se repose. */
  charger(e, dt) {
    if (e.charge) {
      e.charge.t -= dt;
      const res = e.move(e.charge.x * e.speed * 3.4 * dt, e.charge.y * e.speed * 3.4 * dt);
      if (e.charge.t <= 0 || res.hitX || res.hitY) (e.charge = null), (e.rest = 0.9);
      return;
    }
    if ((e.rest = (e.rest ?? 0) - dt) > 0) return;
    const h = e.adv.hero;
    const dx = h.cx - e.cx;
    const dy = h.cy - e.cy;
    if (Math.hypot(dx, dy) < (e.sight ?? 96)) {
      if (Math.abs(dy) < 9) return void (e.charge = { x: Math.sign(dx), y: 0, t: 1.1 });
      if (Math.abs(dx) < 9) return void (e.charge = { x: 0, y: Math.sign(dy), t: 1.1 });
    }
    BEHAVIORS.wander(e, dt);
  },
};

export class Enemy extends Actor {
  /**
   * @param {object} o
   * @param {string} o.kind     identifiant (sert aux compteurs : kills_<kind>)
   * @param {string} o.sprite   préfixe d'images
   * @param {keyof BEHAVIORS | Function} o.behavior
   */
  constructor({ x, y, uid = null, kind = 'blob', sprite = kind, hp = 2, speed = 24, damage = 1, behavior = 'wander', sight, shot = 'snowball', drops = [['heart', 0.25], ['coin', 0.35]], seed = 1 }) {
    super({ x: x + 2, y: y + 6, w: 12, h: 10, tags: ['enemy'], solid: false, hp, invulnTime: 0.3 });
    this.uid = uid;
    this.kind = kind;
    this.speed = speed;
    this.damage = damage;
    this.behavior = typeof behavior === 'function' ? behavior : BEHAVIORS[behavior];
    this.sight = sight;
    this.shot = shot; // projectile lancé (comportement 'shooter')
    this.drops = drops;
    this.rng = createRng(seed);
    this.timer = 0;
    this.anim = new Animator({ idle: { frames: [`${sprite}_0`, `${sprite}_1`], fps: 4 } });
    this.anim.play('idle');
  }

  /** Un monstre vaincu ne revient pas, sauf si on recommence le niveau. */
  added() {
    if (this.uid && this.adv.state.flag(`killed:${this.uid}`)) this.dead = true;
  }

  /** Actif seulement s'il est visible à l'écran. */
  get active() {
    const v = this.world.camera.view;
    return rectsOverlap({ x: v.x - 8, y: v.y - 8, w: v.w + 16, h: v.h + 16 }, this);
  }

  update(dt) {
    if (!this.active) return;
    this.anim.update(dt);
    if (this.updateStatus(dt)) return;
    this.behavior(this, dt);
    const hero = this.adv.hero;
    if (hero && !hero.dead && rectsOverlap(this, hero)) hero.hurt(this.damage, this);
  }

  onSwordHit(hero) {
    if (this.hurt(1, hero, { knockback: 200 })) this.game.audio.play('hit');
  }

  die() {
    super.die();
    this.game.audio.play('kill');
    this.world.add(new Effect(this.cx, this.cy - 2));
    if (this.uid) this.adv.state.setFlag(`killed:${this.uid}`);
    this.adv.state.addCounter(`kills_${this.kind}`);
    this.game.events.emit('enemy:killed', { kind: this.kind, enemy: this });
    // Butin aléatoire.
    let roll = this.rng();
    for (const [item, p] of this.drops) {
      if (roll < p) {
        this.adv.spawnPickup(item, this.cx - 8, this.cy - 8);
        break;
      }
      roll -= p;
    }
  }

  draw(r) {
    if (this.flashing) return;
    this.game.themes.current.sprites.objects.draw(r, this.anim.frame, this.x - 2, this.y - 6);
  }
}
