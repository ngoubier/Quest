import { Animator, rectsOverlap } from '../../engine/index.js';
import { Enemy } from './Enemy.js';
import { Actor } from './Actor.js';
import { Effect } from './Effect.js';
import { Projectile } from './Projectile.js';
import { check } from '../script/conditions.js';

// BOSS de fin de donjon : combat + questions.
// Il est protégé par un BOUCLIER. Le frapper déclenche une question :
//  - bonne réponse → le bouclier tombe quelques secondes : on peut le frapper (2 coups max) ;
//  - mauvaise réponse → le héros est blessé.
// Vaincu, il lève un drapeau (props.flag) qui peut ouvrir une porte, faire apparaître un coffre...
//
// Options : meltWith: 'fire' — le bouclier ne réagit qu'à ce projectile (carapace de glace du Yéti,
//                                yeux de Ronce-Noire avec 'arrow') ;
//           shots: 'snowball' — il lance ce projectile de temps en temps ;
//           still: true       — il ne bouge pas (arbre enraciné) ;
//           shieldText / resistText — ce qu'il dit quand le bouclier est touché / quand l'épée ne sert à rien ;
//           defeatedText — message quand il est vaincu (« Ronce-Noire est vaincue ! ») ;
//           invisible: true   — presque invisible tant que son bouclier tient (on le devine à son ombre) ;
//           meltWith: 'wall'  — il fonce jusqu'au mur ; sonné, il devient vulnérable (Minotaure) ;
//           dashSpeed : vitesse de ses ruées ;
//           hiddenUntil : condition — absent tant qu'elle est fausse (le Ver sort quand les 3 tambours ont sonné) ;
//           guardedBy : condition — tant qu'elle est fausse, on ne peut pas l'atteindre (guardText) ;
//           burrow: true      — il passe sous le sable (intouchable, une simple bosse qui suit le héros),
//                               puis ressort quelques secondes.
//           damage : dégâts au contact (1 par défaut) ;
//           phases: [{ above: 8, meltWith, shots, rain, minions, shieldSprite, text }, ...] — le combat change
//                               quand ses points de vie passent sous `above` (Morgor) :
//                               rain: true = pluie de feu sur le héros ; minions: { count, enemy: {...} } =
//                               il appelle des sbires, et reste protégé tant qu'ils sont là.
// Sprites attendus (planche 'boss', 32x32) : {sprite}_0, {sprite}_1, et {sprite}_shield ou boss_shield

export class Boss extends Enemy {
  constructor({ x, y, uid, name = 'Boss', hp = 6, flag = null, sprite = 'boss', seed = 1, meltWith = null, shots = null, still = false, shieldText = null, resistText = null, defeatedText = null, invisible = false, dashSpeed = 95, hiddenUntil = null, burrow = false, guardedBy = null, guardText = null, damage = 1, phases = null }) {
    super({ x, y, uid, kind: 'boss', sprite, hp, speed: 18, damage, behavior: 'wander', drops: [], seed });
    this.phases = phases;
    this.phase = -1;
    this.minions = [];
    this.rainTimer = 1.5;
    this.shieldSprite = null;
    this.x = x - 4;
    this.y = y + 4;
    this.w = 24;
    this.h = 18;
    this._name = name;
    this.flag = flag;
    this.meltWith = meltWith;
    this.shots = shots;
    this.still = still;
    this.shieldText = shieldText;
    this.resistText = resistText;
    this.defeatedText = defeatedText;
    this.invisible = invisible;
    this.dashSpeed = dashSpeed;
    this.dizzy = 0;
    this.hiddenUntil = hiddenUntil;
    this.burrow = burrow;
    this.guardedBy = guardedBy;
    this.guardText = guardText;
    this.under = burrow ? 2 : 0; // secondes restantes sous le sable
    this.surfaceTime = 0;
    this.wasHidden = null;
    this.revealed = 0;
    this.shotTimer = 3;
    this.hintCooldown = 0;
    this.invulnTime = 0.6;
    this.shield = true;
    this.openTime = 0;
    this.hitsThisWindow = 0;
    this.asking = false;
    this.dashCooldown = 2.5;
    this.dash = null;
    this.sprite = sprite;
    this.anim = new Animator({ idle: { frames: [`${sprite}_0`, `${sprite}_1`], fps: 3 } });
    this.anim.play('idle');
  }

  /** Nom affiché (peut venir du vocabulaire du thème : '{w:boss}'). */
  get displayName() {
    const t = this.adv.format(this._name);
    return t.charAt(0).toUpperCase() + t.slice(1);
  }

  /** Protégé (par ses tentacules, par ses sbires...) ? */
  get guarded() {
    if (this.minions.some((m) => !m.dead)) return true;
    return this.shield && !!this.guardedBy && !check(this.guardedBy, this.adv.state);
  }

  /** Combat en plusieurs phases : on passe à la suivante quand les points de vie baissent. */
  _updatePhase() {
    if (!this.phases) return;
    const i = Math.max(0, this.phases.findIndex((p) => this.hp > (p.above ?? 0)));
    if (i === this.phase) return;
    const first = this.phase < 0;
    this.phase = i;
    const p = this.phases[i];
    this.meltWith = p.meltWith ?? null;
    this.shots = p.shots ?? null;
    this.rain = !!p.rain;
    this.shieldSprite = p.shieldSprite ?? null;
    if (p.resistText) this.resistText = p.resistText;
    if (p.shieldText) this.shieldText = p.shieldText;
    if (p.guardText) this.guardText = p.guardText;
    this._raiseShield();
    if (p.minions) {
      const n = p.minions.count ?? 3;
      const ts = this.world.tilemap.tileSize;
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2 + 0.5;
        const m = new Enemy({ x: this.cx + Math.cos(a) * 40 - 8, y: this.cy + Math.sin(a) * 30 - 8, seed: k + 7, ...p.minions.enemy });
        if (this.world.tilemap.isSolidTile(Math.floor(m.cx / ts), Math.floor(m.cy / ts))) (m.x = this.cx - 6), (m.y = this.cy + 20);
        this.minions.push(this.world.add(m));
        this.world.add(new Effect(m.cx, m.cy, { duration: 0.4 }));
      }
    }
    if (!first) {
      this.world.camera.shake(4, 0.6);
      this.game.audio.play('boom');
      if (p.text) this.adv.say(p.text, { speaker: this.displayName });
    }
  }

  /** Pluie de feu : des boules tombent du ciel près du héros (leur ombre prévient). */
  _updateRain(dt) {
    if (!this.rain || this.asking) return;
    if ((this.rainTimer -= dt) > 0) return;
    this.rainTimer = 1.1 + this.rng() * 0.5;
    const h = this.adv.hero;
    if (!h) return;
    const slow = this.adv.power('slow');
    this.world.add(new FireDrop(h.cx + (this.rng() - 0.5) * 28, h.cy + (this.rng() - 0.5) * 20, { delay: slow ? 1.7 : 1.05 }));
  }

  _guardHint() {
    this.game.audio.play('boss_shield');
    if (this.hintCooldown <= 0) (this.hintCooldown = 2.5), this.adv.toast(this.guardText ?? 'Il est protégé !');
  }

  /** Absent (pas encore réveillé) ? */
  get hidden() {
    return !!this.hiddenUntil && !check(this.hiddenUntil, this.adv.state);
  }

  /** Sous le sable : il ne peut pas être touché. */
  get buried() {
    return this.burrow && this.under > 0;
  }

  update(dt) {
    if (!this.active) return;
    const hidden = this.hidden;
    if (this.wasHidden && !hidden) {
      // il se réveille !
      this.world.camera.shake(5, 0.8);
      this.game.audio.play('boom');
      this.adv.toast(`${this.displayName} sort du sable !`);
    }
    this.wasHidden = hidden;
    this.visible = !hidden;
    if (hidden) return;
    this.anim.update(dt);
    if (this.burrow && !this.asking) {
      if (this.under > 0) {
        this.under -= dt;
        const h = this.adv.hero;
        if (h) {
          const dx = h.cx - this.cx;
          const dy = h.cy - this.cy;
          const d = Math.hypot(dx, dy) || 1;
          this.move((dx / d) * 34 * dt, (dy / d) * 34 * dt);
        }
        if (this.under <= 0) {
          this.surfaceTime = 4.5;
          this.game.audio.play('boom');
          this.world.camera.shake(3, 0.3);
          this.world.add(new Effect(this.cx, this.cy));
        }
        return;
      }
      // à la surface : il replonge quand le temps est écoulé (sauf si son bouclier est baissé)
      if (this.shield && (this.surfaceTime -= dt) <= 0) {
        this.under = 3;
        this.world.add(new Effect(this.cx, this.cy));
        return;
      }
    }
    this._updatePhase();
    this._updateRain(dt);
    this.revealed -= dt;
    if (this.updateStatus(dt)) return;
    // Fenêtre de vulnérabilité
    if (!this.shield) {
      this.openTime -= dt;
      if (this.openTime <= 0 || this.hitsThisWindow >= 2) this._raiseShield();
    }
    // Ruée vers le héros de temps en temps
    const hero = this.adv.hero;
    this.hintCooldown -= dt;
    if (this.shots && hero && !this.asking && (this.shotTimer -= dt) <= 0) {
      this.shotTimer = 2.6 + this.rng() * 1.2;
      this.world.add(new Projectile({ x: this.cx, y: this.cy, dir: { x: hero.cx - this.cx, y: hero.cy - this.cy }, kind: this.shots, speed: 80, hostile: true, range: 170, owner: this }));
      this.game.audio.play('throw');
    }
    const wall = this.meltWith === 'wall';
    if (this.dizzy > 0) {
      // sonné contre un mur : il ne bouge plus
      this.dizzy -= dt;
    } else if (this.still) {
      // enraciné : ne bouge pas
    } else if (this.dash) {
      this.dash.t -= dt;
      const res = this.move(this.dash.vx * dt, this.dash.vy * dt);
      if (res.hitX || res.hitY) {
        this.dash = null;
        if (wall && this.shield) {
          this.dizzy = 3;
          this.world.camera.shake(4, 0.4);
          this.game.audio.play('boom');
          if (this.hintCooldown <= 0) (this.hintCooldown = 3), this.adv.toast('Il est sonné ! Frappe-le vite !');
        }
      } else if (this.dash.t <= 0) this.dash = null;
    } else {
      this.dashCooldown -= dt;
      if (this.dashCooldown <= 0 && hero) {
        const dx = hero.cx - this.cx;
        const dy = hero.cy - this.cy;
        const d = Math.hypot(dx, dy) || 1;
        // Le Minotaure fonce tout droit jusqu'au mur (sur l'axe principal).
        const sp = this.dashSpeed;
        this.dash = wall ? (Math.abs(dx) > Math.abs(dy) ? { vx: Math.sign(dx) * sp, vy: 0, t: 4 } : { vx: 0, vy: Math.sign(dy) * sp, t: 4 }) : { vx: (dx / d) * sp, vy: (dy / d) * sp, t: 0.55 };
        this.dashCooldown = 2 + this.rng() * 1.5;
        this.game.audio.play('boss_dash');
      } else this.behavior(this, dt);
    }
    if (hero && !hero.dead && rectsOverlap(this, hero)) hero.hurt(this.damage, this);
  }

  _raiseShield() {
    if (this.shield) return;
    this.shield = true;
    this.game.audio.play('boss_shield');
  }

  onSwordHit(hero) {
    if (this.hidden) return;
    if (this.buried) {
      if (this.hintCooldown <= 0) (this.hintCooldown = 2.5), this.adv.toast('Il est sous le sable ! Attends qu’il sorte.');
      return;
    }
    if (this.guarded) return this._guardHint();
    if (!this.shield) {
      if (this.hurt(hero.swordDamage ?? 1, hero, { knockback: 60 })) {
        this.hitsThisWindow++;
        this.game.audio.play('hit');
        this.world.camera.shake(2, 0.2);
      }
      return;
    }
    if (this.meltWith === 'wall' && this.dizzy > 0) return this._challenge(hero);
    if (this.meltWith) {
      if (this.hintCooldown <= 0) (this.hintCooldown = 2.5), this.adv.toast(this.resistText ?? 'Sa carapace de glace résiste à l’épée : il faut du feu !');
      this.game.audio.play('boss_shield');
      return;
    }
    this._challenge(hero);
  }

  /** Projectile du héros : blesse le boss sans bouclier ; fait fondre la carapace si c'est le bon. */
  onProjectile(p) {
    if (p.hostile) return false;
    if (this.hidden || this.buried) return false;
    if (this.guarded) return (this._guardHint(), true);
    const hero = this.adv.hero;
    if (!this.shield) {
      if (this.hurt(1, p, { knockback: 60 })) (this.hitsThisWindow++, this.game.audio.play('hit'));
    } else if (!this.meltWith || p.kind === this.meltWith) this._challenge(hero);
    else this.game.audio.play('boss_shield');
    return true;
  }

  /** Bouclier touché : une question. Juste → le bouclier tombe ; faux → le héros est blessé. */
  _challenge(hero) {
    this.revealed = 2;
    if (this.asking) return;
    this.asking = true;
    this.game.audio.play('boss_shield');
    hero.knock = { vx: Math.sign(hero.cx - this.cx) * 120, vy: Math.sign(hero.cy - this.cy) * 120, t: 0.12 };
    const text = this.shieldText ?? (this.meltWith ? '« Grrr ! Ma carapace fond... mais elle ne tombera que si tu réponds juste ! »' : '« Mon bouclier ne tombera que si tu réponds juste ! »');
    this.adv.say(text, {
      speaker: this.displayName,
      onClose: () =>
        this.adv.quiz(
          { count: 1, cooldown: 0 },
          (res) => {
            this.asking = false;
            if (res.correct > 0) {
              this.shield = false;
              this.openTime = 6;
              this.hitsThisWindow = 0;
              this.game.audio.play('boss_open');
              this.adv.toast('Le bouclier tombe : frappe vite !');
            } else {
              hero.invuln = 0;
              hero.hurt(1, this);
              this.adv.toast('Raté ! Le bouclier tient bon.');
            }
          },
          this.displayName,
        ),
    });
  }

  die() {
    this.kill();
    this.rain = false;
    for (const m of this.minions) if (!m.dead) m.kill();
    if (this.uid) this.adv.state.setFlag(`killed:${this.uid}`);
    if (this.flag) this.adv.state.setFlag(this.flag);
    this.game.audio.play('quest_done');
    for (let i = 0; i < 4; i++) this.world.add(new Effect(this.cx + (i % 2 ? 8 : -8), this.cy + (i < 2 ? -6 : 6), { duration: 0.5 }));
    this.world.camera.shake(4, 0.5);
    this.adv.toast(this.defeatedText ?? `${this.displayName} est vaincu !`);
  }

  draw(r) {
    if (this.flashing || this.hidden) return;
    const sheet = this.game.themes.current.sprites.boss;
    if (this.buried) return sheet.draw(r, sheet.has(`${this.sprite}_under`) ? `${this.sprite}_under` : this.anim.frame, this.x - 4, this.y - 14);
    if (this.dizzy > 0) {
      const t = this.game.time * 6;
      for (let k = 0; k < 4; k++) r.rect(Math.round(this.cx - 1 + Math.cos(t + k * 1.6) * 10), Math.round(this.y - 18 + Math.sin(t + k * 1.6) * 3), 2, 2, '#ffe066');
    }
    if (this.invisible && this.shield && this.revealed <= 0 && !this.asking) {
      // Invisible : seulement une ombre et un reflet qui tremble.
      r.withAlpha(0.35, () => r.rect(this.x + 2, this.y + 14, this.w - 4, 3, '#000'));
      r.withAlpha(0.12 + 0.08 * Math.sin(this.game.time * 9), () => sheet.draw(r, this.anim.frame, this.x - 4, this.y - 14));
      return;
    }
    sheet.draw(r, this.anim.frame, this.x - 4, this.y - 14);
    // Bouclier : image propre au boss ({sprite}_shield) si elle existe.
    const shield = this.shieldSprite && sheet.has(this.shieldSprite) ? this.shieldSprite : sheet.has(`${this.sprite}_shield`) ? `${this.sprite}_shield` : 'boss_shield';
    if (this.shield && Math.floor(this.game.time * 6) % 3 !== 0) sheet.draw(r, shield, this.x - 4, this.y - 14);
    if (!this.shield) {
      // Jauge de la fenêtre de vulnérabilité
      const k = Math.max(0, this.openTime / 6);
      r.rect(this.x, this.y - 18, Math.round(24 * k), 2, '#ffd35a');
    }
    // Points de vie
    for (let i = 0; i < this.maxHp; i++) r.rect(this.x + i * 4, this.y - 22, 3, 2, i < this.hp ? '#ff4a4a' : '#444');
  }
}

/** Boule de feu qui tombe du ciel : son ombre grandit, puis elle s'écrase (2 dégâts). */
export class FireDrop extends Actor {
  constructor(cx, cy, { delay = 1.05, damage = 2 } = {}) {
    super({ x: cx - 8, y: cy - 6, w: 16, h: 12, tags: ['hazard'] });
    this.delay = delay;
    this.t = 0;
    this.damage = damage;
    this.z = -1;
  }

  update(dt) {
    this.t += dt;
    if (this.t < this.delay) return;
    const h = this.world.adv.hero;
    if (h && !h.dead && rectsOverlap({ x: this.x + 2, y: this.y + 1, w: this.w - 4, h: this.h - 2 }, h)) h.hurt(this.damage, this);
    this.world.add(new Effect(this.cx, this.cy, { duration: 0.35 }));
    this.world.game.audio.play('boom');
    this.kill();
  }

  draw(r) {
    const k = Math.min(1, this.t / this.delay);
    r.withAlpha(0.25 + 0.35 * k, () => r.rect(Math.round(this.cx - 3 - 5 * k), Math.round(this.cy - 1 - 2 * k), Math.round(6 + 10 * k), Math.round(2 + 4 * k), '#000'));
    const y = this.cy - 6 - (1 - k) * 90;
    this.world.game.themes.current.sprites.objects.draw(r, `fireball_${Math.floor(this.t * 10) % 2}`, this.cx - 8, y - 8);
  }
}
