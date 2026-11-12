import { Animator, DIRS, rectsOverlap } from '../../engine/index.js';
import { Actor } from './Actor.js';
import { Effect } from './Effect.js';
import { Projectile } from './Projectile.js';
import { Boomerang } from './Boomerang.js';
import { Bomb } from './Bomb.js';

// LE HÉROS, réutilisable d'un jeu à l'autre.
//  - déplacement 8 directions, aide aux coins
//  - Action : parler / ouvrir si quelque chose est devant, sinon coup d'épée
//  - pousser : marcher contre un objet "poussable" pendant un court instant
//  - se cogner à une porte verrouillée : l'ouvre si on a la clé
//  - la vie est stockée dans GameState (sauvegardée), pas dans l'entité
//  - bouton Objet : utilise l'objet équipé (bâton de feu...)
//  - glace (propriété de tuile `slippery`) : on glisse tout droit jusqu'au prochain obstacle
//  - trou (propriété de tuile `pit`) : on tombe, on perd un demi-cœur et on revient au dernier endroit sûr
//  - sables mouvants (propriété `quicksand`) : on avance lentement et on s'enfonce ; trop longtemps → comme un trou
//  - courant (propriété `current: [dx, dy]`) : il entraîne le héros ; sous l'eau, on nage un peu moins vite
//  - pelle : creuse la case devant (propriété `diggable` : tuile après le trou) ; objets enterrés (onDig)
//  - pouvoirs (adv.power) : bulle qui bloque un coup (rechargée en 20 s), armure (dégâts de 2 et plus
//    divisés par 2), épée de feu (coups doubles), gel (marcher contre la lave la fige : propriété
//    de tuile `freezable: 'tuile'`)
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
    this.slide = null; // direction de glissade sur la glace
    this.toolCooldown = 0;
    const anims = {};
    for (const d of ['down', 'up', 'side']) {
      anims[`walk_${d}`] = { frames: [`player_${d}_0`, `player_${d}_1`], fps: 7 };
      anims[`idle_${d}`] = { frames: [`player_${d}_0`], fps: 1 };
    }
    this.anim = new Animator(anims);
    this.anim.play(`idle_${animDir(facing)}`);
  }

  applyDamage(amount) {
    // Armure : les gros coups (Morgor, pluie de feu) font moitié moins mal.
    const a = amount >= 2 && this.adv.power('armor') ? Math.ceil(amount / 2) : amount;
    return this.adv.state.damage(a);
  }

  /** Dégâts d'un coup d'épée (épée de feu : double). */
  get swordDamage() {
    return this.adv.power('fireSword') ? 2 : 1;
  }

  /** Bulle des Marées : elle bloque un coup (pas une chute), puis se recharge. */
  hurt(amount, from, opts) {
    if (from && this.invuln <= 0 && !this.dead && (this.bubbleWait ?? 0) <= 0 && this.adv.power('bubble')) {
      this.bubbleWait = 20;
      this.invuln = this.invulnTime;
      this.game.audio.play('bubble');
      this.adv.toast('La bulle des Marées te protège !');
      return false;
    }
    return super.hurt(amount, from, opts);
  }

  onHurt() {
    this.game.audio.play('hurt');
    this.world.camera.shake(2, 0.2);
    this.attack = null;
    this.slide = null;
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
    if (this.bubbleWait > 0) this.bubbleWait -= dt;
    if (this.updateStatus(dt)) return this.anim.update(dt);

    if (this.attack) {
      this.attack.t += dt;
      this._swordHits();
      if (this.attack.t >= this.attackTime) this.attack = null;
      return;
    }

    if (this._checkPit(dt)) return;
    this._current(dt);
    this.toolCooldown -= dt;
    if (input.pressed('item')) {
      input.consume('item');
      if (this.adv.useTool()) return;
    }

    const { x, y } = input.axis();
    // Glace : on glisse tout droit jusqu'à un obstacle ou jusqu'au bord de la glace.
    const onIce = this.onSlippery();
    if (this.slide && !onIce) this.slide = null;
    if (!this.slide && onIce && (x || y)) {
      this.slide = Math.abs(x) >= Math.abs(y) ? { x: Math.sign(x), y: 0 } : { x: 0, y: Math.sign(y) };
      this.facing = this.slide.x < 0 ? 'left' : this.slide.x > 0 ? 'right' : this.slide.y < 0 ? 'up' : 'down';
    }
    if (this.slide) {
      const res = this.move(this.slide.x * 120 * dt, this.slide.y * 120 * dt);
      if (res.hitX || res.hitY) this.slide = null;
      this.anim.play(`idle_${animDir(this.facing)}`);
      this.anim.update(dt);
      return;
    }
    if (x || y) {
      const keep = (this.facing === 'left' && x < 0) || (this.facing === 'right' && x > 0) || (this.facing === 'up' && y < 0) || (this.facing === 'down' && y > 0);
      if (!keep) this.facing = x < 0 ? 'left' : x > 0 ? 'right' : y < 0 ? 'up' : 'down';
      const len = Math.hypot(x, y);
      const sp = this.speed * (this.sinking > 0 ? 0.35 : 1) * (this.adv.mapDef.underwater ? 0.85 : 1);
      const res = this.move((x / len) * sp * dt, (y / len) * sp * dt, { cornerAssist: 6 });
      this.anim.play(`walk_${animDir(this.facing)}`);
      // Contre quelque chose : pousser un bloc ? ouvrir une porte verrouillée ?
      const straight = !x || !y;
      if (straight && (res.hitX || res.hitY) && !res.nudged) {
        this._tryFreeze(dt);
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

  /** Trous : mémorise le dernier endroit sûr ; tombe si le centre du héros est au-dessus d'un trou. */
  _checkPit(dt = 0) {
    const tm = this.world.tilemap;
    const ts = tm.tileSize;
    const tx = Math.floor(this.cx / ts);
    const ty = Math.floor(this.cy / ts);
    // sables mouvants : on s'enfonce peu à peu
    if (tm.propAt(tx, ty, 'quicksand')) this.sinking = (this.sinking ?? 0) + dt;
    else this.sinking = 0;
    const sunk = this.sinking > 1.6;
    if (tm.propAt(tx, ty, 'pit') || sunk) {
      this.sinking = 0;
      this.game.audio.play('fall');
      const back = this.safe ?? this.adv.entry; // dernier endroit sûr, sinon l'entrée de la carte
      if (back) (this.x = back.x), (this.y = back.y);
      this.slide = null;
      this.invuln = 0;
      this.hurt(1, null, { knockback: 0 });
      this.adv.toast(sunk ? 'Les sables mouvants t’ont avalé ! Ne reste pas dedans.' : 'Tu es tombé dans un trou !');
      return true;
    }
    let near = false;
    for (let dy = -1; dy <= 1 && !near; dy++) for (let dx = -1; dx <= 1; dx++) if (tm.propAt(tx + dx, ty + dy, 'pit') || tm.propAt(tx + dx, ty + dy, 'quicksand')) near = true;
    if (!near) this.safe = { x: this.x, y: this.y };
    return false;
  }

  /** Pouvoir « freeze » : contre de la lave (ou de l'eau gelable), on la fige en un instant. */
  _tryFreeze(dt) {
    if (!this.adv.power('freeze')) return;
    const tm = this.world.tilemap;
    const ts = tm.tileSize;
    const d = DIRS[this.facing];
    const tx = Math.floor((this.cx + d.x * 10) / ts);
    const ty = Math.floor((this.cy + d.y * 10) / ts);
    const to = tm.propAt(tx, ty, 'freezable');
    if (!to) return (this.freezeTimer = 0);
    this.freezeTimer = (this.freezeTimer ?? 0) + dt;
    if (this.freezeTimer < 0.25) return;
    this.freezeTimer = 0;
    this.adv.freezeTile(tx, ty, to);
    this.game.audio.play('crack');
    this.world.add(new Effect(tx * ts + 8, ty * ts + 8, { duration: 0.3 }));
  }

  /** Courants marins : la tuile pousse le héros dans sa direction. */
  _current(dt) {
    const tm = this.world.tilemap;
    const cur = tm.propAt(Math.floor(this.cx / tm.tileSize), Math.floor(this.cy / tm.tileSize), 'current');
    if (cur) this.move(cur[0] * 70 * dt, cur[1] * 70 * dt); // plus fort que la nage : on ne remonte pas un courant
  }

  /** Pelle : creuse la case devant le héros. */
  dig() {
    if (this.toolCooldown > 0) return false;
    this.toolCooldown = 0.35;
    const tm = this.world.tilemap;
    const ts = tm.tileSize;
    const d = DIRS[this.facing];
    const tx = Math.floor((this.cx + d.x * 12) / ts);
    const ty = Math.floor((this.cy + d.y * 12) / ts);
    const to = tm.propAt(tx, ty, 'diggable');
    if (!to) {
      this.game.audio.play('menu_no');
      this.adv.toast('Le sol est trop dur ici. On creuse dans le sable !');
      return true;
    }
    tm.set('ground', tx, ty, to);
    this.game.audio.play('dig');
    this.world.add(new Effect(tx * ts + 8, ty * ts + 8, { duration: 0.25 }));
    const found = this.world.query({ x: tx * ts + 2, y: ty * ts + 2, w: ts - 4, h: ts - 4 }, (e) => typeof e.onDig === 'function');
    if (found.length) found.forEach((e) => e.onDig(this));
    else if (Math.random() < 0.12) this.adv.spawnPickup('coin', tx * ts, ty * ts);
    return true;
  }

  /** Pose une bombe devant soi (une seule à la fois). Renvoie false s'il n'y en a plus. */
  placeBomb() {
    if (this.world.entities.some((e) => e instanceof Bomb && !e.dead)) return false;
    if (!this.adv.state.take('bomb', 1)) return (this.adv.toast('Tu n’as plus de bombes !'), false);
    const d = DIRS[this.facing];
    this.world.add(new Bomb(this.cx + d.x * 12, this.cy + d.y * 12));
    this.game.audio.play('push');
    return true;
  }

  /** Le héros est-il sur une tuile glissante ? */
  onSlippery() {
    const tm = this.world.tilemap;
    return !!tm.propAt(Math.floor(this.cx / tm.tileSize), Math.floor(this.cy / tm.tileSize), 'slippery');
  }

  /** Lance un projectile devant soi (bâton de feu, arc...). Renvoie false si l'objet recharge. */
  shoot(kind = 'fire', { cooldown = 0.45, speed = 150, range = 150, sound = 'fire', cuts = false, damage = 1 } = {}) {
    if (this.toolCooldown > 0) return false;
    this.toolCooldown = cooldown;
    const d = DIRS[this.facing];
    this.world.add(new Projectile({ x: this.cx + d.x * 9, y: this.cy - 3 + d.y * 9, dir: d, kind, speed, range, owner: this, cuts, damage }));
    this.game.audio.play(sound);
    return true;
  }

  /** Lance le boomerang (un seul à la fois). */
  throwBoomerang() {
    if (this.world.entities.some((e) => e instanceof Boomerang && !e.dead)) return false;
    const d = DIRS[this.facing];
    this.world.add(new Boomerang({ x: this.cx + d.x * 8, y: this.cy - 3 + d.y * 8, dir: d, owner: this }));
    this.game.audio.play('throw');
    return true;
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

  /** Image du héros : en scaphandre sous l'eau (diver_*), si l'ambiance a ce dessin. */
  frameName(name) {
    const chars = this.game.themes.current.sprites.chars;
    return this.adv.mapDef?.underwater && chars.has?.('diver_down_0') ? name.replace('player_', 'diver_') : name;
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
      th.chars.draw(r, this.frameName(`player_${dir}_1`), sx, sy, { flipX });
      if (dir !== 'up') drawSword();
      if (this.adv.power('fireSword')) {
        // épée de feu : des flammèches le long de la lame
        const t = this.game.time * 20;
        for (let k = 0; k < 4; k++) r.rect(Math.round(sw.x + ((k * 5 + t) % Math.max(1, sw.w))), Math.round(sw.y + ((k * 3 + t * 0.7) % Math.max(1, sw.h))), 2, 2, k % 2 ? '#ffb03a' : '#ff5a1a');
      }
      return this._drawBubble(r);
    }
    if (this.sinking > 0) {
      // s'enfonce dans le sable : le bas du corps disparaît
      const k = Math.min(7, Math.round(this.sinking * 3.5));
      th.chars.draw(r, this.frameName(this.anim.frame), sx, sy + k, { flipX });
      r.rect(sx + 1, this.y + 5, 14, 4, '#c8a050');
      r.rect(sx + 3, this.y + 4, 10, 1, '#e0c070');
      return;
    }
    th.chars.draw(r, this.frameName(this.anim.frame), sx, sy, { flipX });
    this._drawBubble(r);
  }

  /** Bulle des Marées prête : un cercle léger autour du héros. */
  _drawBubble(r) {
    if ((this.bubbleWait ?? 0) > 0 || !this.adv.power('bubble')) return;
    const c = r.ctx;
    c.save();
    c.globalAlpha = 0.45 + 0.1 * Math.sin(this.game.time * 3);
    c.strokeStyle = '#a8e0ff';
    c.lineWidth = 1;
    c.beginPath();
    c.ellipse(this.cx, this.cy - 4, 10, 11, 0, 0, Math.PI * 2);
    c.stroke();
    c.restore();
  }
}
