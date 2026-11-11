import { Animator, DIRS, rectsOverlap } from '../../engine/index.js';
import { Actor } from './Actor.js';
import { Effect } from './Effect.js';

// LE HÉROS, réutilisable d'un jeu à l'autre.
//  - déplacement 8 directions, aide aux coins
//  - Action : parler / ouvrir si quelque chose est devant, sinon coup d'épée
//  - pousser : marcher contre un objet "poussable" pendant un court instant
//  - se cogner à une porte verrouillée : l'ouvre si on a la clé
//  - la vie est stockée dans GameState (sauvegardée), pas dans l'entité
//
// Sprites attendus (planche 'chars') : player_{down|up|side}_{0|1}
// et (planche 'objects') : sword_{down|up|side}

const animDir = (f) => (f === 'left' || f === 'right' ? 'side' : f);

export class Hero extends Actor {
  constructor(x, y, facing = 'down') {
    super({ x, y, w: 10, h: 8, tags: ['hero', 'player'], solid: true, facing, invulnTime: 1 });
    this.speed = 72;
    this.attack = null;
    this.attackTime = 0.24;
    this.pushTimer = 0;
    const anims = {};
    for (const d of ['down', 'up', 'side']) {
      anims[`walk_${d}`] = { frames: [`player_${d}_0`, `player_${d}_1`], fps: 7 };
      anims[`idle_${d}`] = { frames: [`player_${d}_0`], fps: 1 };
    }
    this.anim = new Animator(anims);
    this.anim.play(`idle_${animDir(facing)}`);
  }

  applyDamage(amount) {
    return this.adv.state.damage(amount);
  }

  onHurt() {
    this.game.audio.play('hurt');
    this.world.camera.shake(2, 0.2);
    this.attack = null;
  }

  die() {
    // Une potion dans le sac sauve automatiquement le héros.
    const st = this.adv.state;
    if (st.take('potion', 1)) {
      st.heal(st.maxHp);
      this.game.audio.play('heal');
      this.adv.toast('La potion te sauve !');
      return;
    }
    this.adv.gameOver();
  }

  update(dt) {
    const input = this.game.input;
    if (this.updateStatus(dt)) return this.anim.update(dt);

    if (this.attack) {
      this.attack.t += dt;
      this._swordHits();
      if (this.attack.t >= this.attackTime) this.attack = null;
      return;
    }

    const { x, y } = input.axis();
    if (x || y) {
      const keep = (this.facing === 'left' && x < 0) || (this.facing === 'right' && x > 0) || (this.facing === 'up' && y < 0) || (this.facing === 'down' && y > 0);
      if (!keep) this.facing = x < 0 ? 'left' : x > 0 ? 'right' : y < 0 ? 'up' : 'down';
      const len = Math.hypot(x, y);
      const res = this.move((x / len) * this.speed * dt, (y / len) * this.speed * dt, { cornerAssist: 6 });
      this.anim.play(`walk_${animDir(this.facing)}`);
      // Contre quelque chose : pousser un bloc ? ouvrir une porte verrouillée ?
      const straight = !x || !y;
      if (straight && (res.hitX || res.hitY) && !res.nudged) {
        const front = this.frontEntity(3);
        if (front?.onBump) front.onBump(this);
        if (front?.tryPush) {
          this.pushTimer += dt;
          if (this.pushTimer > 0.3) {
            front.tryPush(this.facing, this);
            this.pushTimer = 0;
          }
        } else this.pushTimer = 0;
      } else this.pushTimer = 0;
    } else {
      this.anim.play(`idle_${animDir(this.facing)}`);
      this.pushTimer = 0;
    }
    this.anim.update(dt);

    if (input.pressed('action')) {
      input.consume('action');
      if (!this.interact()) this.startAttack();
    }
  }

  /** Première entité juste devant le héros (à `reach` pixels). */
  frontEntity(reach = 10, filter = null) {
    const d = DIRS[this.facing];
    const probe = { x: this.cx - 4 + d.x * (this.w / 2 + reach - 2), y: this.cy - 4 + d.y * (this.h / 2 + reach - 2), w: 8, h: 8 };
    return this.world.query(probe, (e) => e !== this && (!filter || filter(e)))[0] ?? null;
  }

  interact() {
    const talkable = (e) => typeof e.talk === 'function' && (e.canTalk?.() ?? true);
    let target = this.frontEntity(10, talkable);
    // Comptoir (propriété de tuile `counter`) : on parle au marchand par-dessus.
    if (!target) {
      const d = DIRS[this.facing];
      const tm = this.world.tilemap;
      const fx = Math.floor((this.cx + d.x * 12) / tm.tileSize);
      const fy = Math.floor((this.cy + d.y * 12) / tm.tileSize);
      if (tm.propAt(fx, fy, 'counter')) target = this.frontEntity(26, talkable);
    }
    if (!target) return false;
    target.talk(this);
    return true;
  }

  startAttack() {
    this.attack = { t: 0, hit: new Set() };
    this.game.audio.play('sword');
  }

  /** Zone touchée par l'épée, selon la direction. */
  swordRect() {
    const { x, y, w, h } = this;
    switch (this.facing) {
      case 'up':
        return { x: x + 1, y: y - 16, w: 6, h: 16 };
      case 'down':
        return { x: x + 3, y: y + h, w: 6, h: 13 };
      case 'left':
        return { x: x - 13, y: y - 2, w: 13, h: 7 };
      default:
        return { x: x + w, y: y - 2, w: 13, h: 7 };
    }
  }

  _swordHits() {
    const r = this.swordRect();
    for (const e of this.world.query(r, (e) => e !== this && typeof e.onSwordHit === 'function')) {
      if (this.attack.hit.has(e)) continue;
      this.attack.hit.add(e);
      e.onSwordHit(this);
    }
    // Tuiles "coupables" (buissons...) : propriété de tuile { cuttable: true, cutTo: 'floor' }
    const tm = this.world.tilemap;
    const ts = tm.tileSize;
    for (let ty = Math.floor(r.y / ts); ty <= Math.floor((r.y + r.h - 1) / ts); ty++) {
      for (let tx = Math.floor(r.x / ts); tx <= Math.floor((r.x + r.w - 1) / ts); tx++) {
        if (!tm.propAt(tx, ty, 'cuttable')) continue;
        if (!rectsOverlap(r, { x: tx * ts + 3, y: ty * ts + 3, w: ts - 6, h: ts - 6 })) continue;
        tm.set('ground', tx, ty, tm.propAt(tx, ty, 'cutTo') || 'floor');
        this.world.add(new Effect(tx * ts + 8, ty * ts + 8));
        this.game.audio.play('cut');
        this.adv.onTileCut?.(tx, ty);
      }
    }
  }

  updateDuringScroll(dt, camera) {
    const tr = camera.transition;
    const push = 16 / camera.scrollDuration;
    this.x += tr.dir.x * push * dt;
    this.y += tr.dir.y * push * dt;
    this.anim.update(dt);
  }

  draw(r) {
    if (this.flashing) return;
    const th = this.game.themes.current.sprites;
    const flipX = this.facing === 'left';
    const dir = animDir(this.facing);
    const sx = this.x - 3;
    const sy = this.y - 8;
    if (this.attack) {
      // Épée derrière le héros quand il regarde vers le haut.
      const sw = this.swordRect();
      const swordFrame = `sword_${dir}`;
      const drawSword = () => {
        if (dir === 'side') th.objects.draw(r, swordFrame, flipX ? sw.x - 3 : sw.x - 3, sw.y - 5, { flipX });
        else if (dir === 'up') th.objects.draw(r, swordFrame, sw.x - 5, sw.y);
        else th.objects.draw(r, swordFrame, sw.x - 5, sw.y - 3);
      };
      if (dir === 'up') drawSword();
      th.chars.draw(r, `player_${dir}_1`, sx, sy, { flipX });
      if (dir !== 'up') drawSword();
      return;
    }
    th.chars.draw(r, this.anim.frame, sx, sy, { flipX });
  }
}
