import { Entity } from '../../engine/index.js';
import { hitFx } from './juice.js';

// Acteur = entité qui a des points de vie, peut être blessée, repoussée, et clignote
// pendant son invulnérabilité. Base commune du héros et des monstres.

export class Actor extends Entity {
  constructor(opts = {}) {
    super(opts);
    this.hp = opts.hp ?? 1;
    this.maxHp = this.hp;
    this.invulnTime = opts.invulnTime ?? 0.35;
    this.invuln = 0;
    this.knock = null;
    this.facing = opts.facing ?? 'down';
  }

  /** La scène d'aventure (état, quêtes, dialogues...). */
  get adv() {
    return this.world.adv;
  }

  get game() {
    return this.world.game;
  }

  /** Applique les dégâts et renvoie les PV restants (le héros redirige vers GameState). */
  applyDamage(amount) {
    this.hp -= amount;
    return this.hp;
  }

  /**
   * Blesse l'acteur. `from` = qui frappe (pour la direction du recul).
   * Le recul suit l'axe dominant, comme dans les Zelda classiques.
   */
  hurt(amount, from, { knockback = 160, duration = 0.15 } = {}) {
    if (this.invuln > 0 || this.dead) return false;
    const left = this.applyDamage(amount);
    this.invuln = this.invulnTime;
    const dx = this.cx - (from?.cx ?? this.cx);
    const dy = this.cy - (from?.cy ?? this.cy + 1);
    const kx = Math.abs(dx) >= Math.abs(dy) ? Math.sign(dx) || 1 : 0;
    const ky = kx ? 0 : Math.sign(dy) || 1;
    this.knock = { vx: kx * knockback, vy: ky * knockback, t: duration };
    this.onHurt(amount, from);
    // étincelles, éclair blanc, arrêt sur image (pas pour le héros : il clignote déjà)
    if (!this.has('hero')) hitFx(this, from, { big: !!this.bigHit });
    if (left <= 0) this.die(from);
    return true;
  }

  /** Met à jour invulnérabilité et recul. Renvoie true tant que l'acteur est repoussé. */
  updateStatus(dt) {
    if (this.invuln > 0) this.invuln -= dt;
    if (this.hitFlash > 0) this.hitFlash -= dt;
    if (this.knock) {
      this.move(this.knock.vx * dt, this.knock.vy * dt);
      this.knock.t -= dt;
      if (this.knock.t <= 0) this.knock = null;
      return true;
    }
    return false;
  }

  get flashing() {
    return this.invuln > 0 && Math.floor(this.invuln * 20) % 2 === 0;
  }

  onHurt(amount, from) {}

  die(from) {
    this.kill();
  }
}
