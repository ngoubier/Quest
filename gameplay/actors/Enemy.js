import { Animator, rectsOverlap, createRng } from '../../engine/index.js';
import { Actor } from './Actor.js';
import { Effect } from './Effect.js';
import { Projectile } from './Projectile.js';

// MONSTRES. Un monstre = des statistiques + un comportement (fonction réutilisable).
// Les monstres hors de l'écran sont figés (économie, et lisibilité comme dans Zelda).
//
// Sprites attendus (planche 'objects') : {sprite}_0, {sprite}_1
// Options : fast: true — monstre rapide (le pouvoir « slow » le ralentit) ;
//           drops: [['coin', 0.5, 3], ...] — butin : objet, probabilité, quantité (1 par défaut).

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

  /** Ondule sur place (tentacule du Kraken, algue vivante...). */
  sway(e, dt) {
    e.home ??= { x: e.x, y: e.y };
    e.jitter = (e.jitter ?? e.rng() * 6) + dt;
    e.x = e.home.x + Math.sin(e.jitter * 2.2) * 5;
    e.y = e.home.y + Math.cos(e.jitter * 1.4) * 2;
  },

  /** Fantôme : flotte vers le héros en traversant les murs. */
  ghost(e, dt) {
    const h = e.adv.hero;
    const dx = h.cx - e.cx;
    const dy = h.cy - e.cy;
    const d = Math.hypot(dx, dy);
    e.jitter = (e.jitter ?? 0) + dt;
    if (d > (e.sight ?? 110) || d < 1) {
      e.x += Math.cos(e.jitter) * e.speed * 0.4 * dt;
      e.y += Math.sin(e.jitter * 1.3) * e.speed * 0.4 * dt;
      return;
    }
    e.x += (dx / d) * e.speed * dt + Math.sin(e.jitter * 5) * 0.3;
    e.y += (dy / d) * e.speed * dt;
  },

  /** Voleur : s'approche du héros ; une fois les pièces volées, il s'enfuit. */
  thief(e, dt) {
    const h = e.adv.hero;
    if (e.flee > 0) {
      e.flee -= dt;
      const dx = e.cx - h.cx;
      const dy = e.cy - h.cy;
      const d = Math.hypot(dx, dy) || 1;
      const res = e.move((dx / d) * e.speed * 1.2 * dt, (dy / d) * e.speed * 1.2 * dt);
      if (res.hitX && res.hitY) e.flee = 0;
      return;
    }
    BEHAVIORS.chase(e, dt);
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
  constructor({ x, y, uid = null, kind = 'blob', sprite = kind, hp = 2, speed = 24, damage = 1, behavior = 'wander', sight, shot = 'snowball', steals = 0, drops = [['heart', 0.25], ['coin', 0.35]], seed = 1, fast = false }) {
    super({ x: x + 2, y: y + 6, w: 12, h: 10, tags: ['enemy'], solid: false, hp, invulnTime: 0.3 });
    this.shadow = 6;
    this.fast = fast;
    this.uid = uid;
    this.kind = kind;
    this.speed = speed;
    this.damage = damage;
    this.behavior = typeof behavior === 'function' ? behavior : BEHAVIORS[behavior];
    this.sight = sight;
    this.shot = shot; // projectile lancé (comportement 'shooter')
    this.steals = steals; // voleur : pièces prises au héros au lieu de le blesser
    this.loot = 0;
    this.stunned = 0;
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

  /** Étourdi (boomerang) : il ne bouge plus et ne blesse plus pendant `t` secondes. */
  stun(t) {
    this.stunned = Math.max(this.stunned, t);
  }

  update(dt) {
    if (!this.active) return;
    if (this.updateStatus(dt)) return;
    if (this.stunned > 0) return void (this.stunned -= dt);
    this.anim.update(dt);
    // Pouvoir « slow » : les monstres rapides vont presque deux fois moins vite.
    this.behavior(this, this.fast && this.adv.power('slow') ? dt * 0.55 : dt);
    const hero = this.adv.hero;
    // Contact à 1 pixel près : le héros est solide, un monstre s'arrête juste contre lui.
    if (!hero || hero.dead || !rectsOverlap({ x: this.x - 1, y: this.y - 1, w: this.w + 2, h: this.h + 2 }, hero)) return;
    if (this.steals && !this.loot && this.adv.state.count('coin') > 0) {
      // Le voleur prend des pièces et s'enfuit ; le vaincre les rend.
      const n = Math.min(this.steals, this.adv.state.count('coin'));
      this.adv.state.take('coin', n);
      this.loot = n;
      this.flee = 3;
      this.game.audio.play('hurt');
      this.adv.toast(`Un voleur t’a pris ${n} pièce${n > 1 ? 's' : ''} ! Rattrape-le !`);
    } else if (!(this.flee > 0)) hero.hurt(this.damage, this);
  }

  onSwordHit(hero) {
    if (this.hurt(hero.swordDamage ?? 1, hero, { knockback: 200 })) this.game.audio.play('hit');
  }

  die() {
    super.die();
    this.game.audio.play('kill');
    this.world.add(new Effect(this.cx, this.cy - 2));
    if (this.uid) this.adv.state.setFlag(`killed:${this.uid}`);
    this.adv.state.addCounter(`kills_${this.kind}`);
    this.game.events.emit('enemy:killed', { kind: this.kind, enemy: this });
    if (this.loot) this.adv.spawnPickup('coin', this.cx - 8, this.cy - 8, 15, this.loot);
    // Butin aléatoire.
    let roll = this.rng();
    for (const [item, p, count = 1] of this.drops) {
      if (roll < p) {
        this.adv.spawnPickup(item, this.cx - 8, this.cy - 8, 10, count);
        break;
      }
      roll -= p;
    }
  }

  draw(r) {
    if (this.flashing) return;
    this.game.themes.current.sprites.objects.draw(r, this.anim.frame, this.x - 2, this.y - 6);
    if (this.stunned > 0) {
      // petites étoiles qui tournent au-dessus de la tête
      const t = this.world.time * 6;
      for (let k = 0; k < 3; k++) r.rect(Math.round(this.cx - 1 + Math.cos(t + k * 2.1) * 6), Math.round(this.y - 9 + Math.sin(t + k * 2.1) * 2), 2, 2, '#ffe066');
    }
  }
}
