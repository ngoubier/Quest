import { Animator, rectsOverlap } from '../../engine/index.js';
import { Enemy } from './Enemy.js';
import { Effect } from './Effect.js';
import { Projectile } from './Projectile.js';

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
//           defeatedText — message quand il est vaincu (« Ronce-Noire est vaincue ! »).
// Sprites attendus (planche 'boss', 32x32) : {sprite}_0, {sprite}_1, et {sprite}_shield ou boss_shield

export class Boss extends Enemy {
  constructor({ x, y, uid, name = 'Boss', hp = 6, flag = null, sprite = 'boss', seed = 1, meltWith = null, shots = null, still = false, shieldText = null, resistText = null, defeatedText = null }) {
    super({ x, y, uid, kind: 'boss', sprite, hp, speed: 18, damage: 1, behavior: 'wander', drops: [], seed });
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

  update(dt) {
    if (!this.active) return;
    this.anim.update(dt);
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
    if (this.still) {
      // enraciné : ne bouge pas
    } else if (this.dash) {
      this.dash.t -= dt;
      const res = this.move(this.dash.vx * dt, this.dash.vy * dt);
      if (this.dash.t <= 0 || res.hitX || res.hitY) this.dash = null;
    } else {
      this.dashCooldown -= dt;
      if (this.dashCooldown <= 0 && hero) {
        const dx = hero.cx - this.cx;
        const dy = hero.cy - this.cy;
        const d = Math.hypot(dx, dy) || 1;
        this.dash = { vx: (dx / d) * 95, vy: (dy / d) * 95, t: 0.55 };
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
    if (!this.shield) {
      if (this.hurt(1, hero, { knockback: 60 })) {
        this.hitsThisWindow++;
        this.game.audio.play('hit');
        this.world.camera.shake(2, 0.2);
      }
      return;
    }
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
    const hero = this.adv.hero;
    if (!this.shield) {
      if (this.hurt(1, p, { knockback: 60 })) (this.hitsThisWindow++, this.game.audio.play('hit'));
    } else if (!this.meltWith || p.kind === this.meltWith) this._challenge(hero);
    else this.game.audio.play('boss_shield');
    return true;
  }

  /** Bouclier touché : une question. Juste → le bouclier tombe ; faux → le héros est blessé. */
  _challenge(hero) {
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
    if (this.uid) this.adv.state.setFlag(`killed:${this.uid}`);
    if (this.flag) this.adv.state.setFlag(this.flag);
    this.game.audio.play('quest_done');
    for (let i = 0; i < 4; i++) this.world.add(new Effect(this.cx + (i % 2 ? 8 : -8), this.cy + (i < 2 ? -6 : 6), { duration: 0.5 }));
    this.world.camera.shake(4, 0.5);
    this.adv.toast(this.defeatedText ?? `${this.displayName} est vaincu !`);
  }

  draw(r) {
    if (this.flashing) return;
    const sheet = this.game.themes.current.sprites.boss;
    sheet.draw(r, this.anim.frame, this.x - 4, this.y - 14);
    // Bouclier : image propre au boss ({sprite}_shield) si elle existe.
    const shield = sheet.has(`${this.sprite}_shield`) ? `${this.sprite}_shield` : 'boss_shield';
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
