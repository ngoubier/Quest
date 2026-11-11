import { Entity, Animator, createRng, rectsOverlap } from '../../engine/index.js';
import { check } from '../script/conditions.js';
import { runActions } from '../script/actions.js';
import { Effect } from '../actors/Effect.js';

// OBJETS DU MONDE — les briques des énigmes et de l'exploration.
// Ils s'appuient sur GameState (drapeaux) : un coffre ouvert le reste après sauvegarde,
// une grille s'ouvre quand sa condition devient vraie, etc.
// Chaque objet placé sur une carte reçoit un identifiant unique `uid` ("carte:x,y")
// qui sert à mémoriser son état.

const objSheet = (e) => e.world.game.themes.current.sprites.objects;

/** Base : accès pratique à la scène d'aventure et à l'état. */
export class WorldObject extends Entity {
  constructor(opts) {
    super(opts);
    this.uid = opts.uid;
    this.props = opts.props ?? {};
  }

  get adv() {
    return this.world.adv;
  }

  get state() {
    return this.world.adv.state;
  }
}

// ------------------------------------------------------------------ objet à ramasser
export class Pickup extends WorldObject {
  /** props : { item, count?, hidden? (caché sous une tuile coupable), persist? } */
  constructor({ x, y, uid, props }) {
    super({ x: x + 3, y: y + 3, w: 10, h: 10, uid, props, tags: ['pickup'] });
    this.t = 0;
    this.phase = Math.random() * 3;
    this.z = -2;
  }

  added() {
    if (this.props.persist !== false && this.uid && this.state.flag(`taken:${this.uid}`)) this.kill();
  }

  /** Caché tant que la tuile au-dessus est encore "coupable" (buisson...). */
  get hidden() {
    if (!this.props.hidden) return false;
    const tm = this.world.tilemap;
    return !!tm.propAt(Math.floor(this.cx / tm.tileSize), Math.floor(this.cy / tm.tileSize), 'cuttable');
  }

  update(dt) {
    this.t += dt;
    if (this.props.lifetime && this.t > this.props.lifetime) return this.kill();
    if (this.hidden) return;
    const hero = this.adv.hero;
    if (hero && rectsOverlap(this, hero)) {
      // Sac plein : l'objet reste au sol.
      if (!this.adv.collect(this.props.item, this.props.count ?? 1, { feedback: true })) return;
      if (this.uid && this.props.persist !== false) this.state.setFlag(`taken:${this.uid}`);
      this.kill();
    }
  }

  draw(r) {
    if (this.hidden) return;
    const lt = this.props.lifetime;
    if (lt && this.t > lt - 2 && Math.floor(this.t * 10) % 2) return; // clignote avant de disparaître
    const bob = Math.round(Math.sin((this.t + this.phase) * 4));
    objSheet(this).draw(r, this.adv.itemIcon(this.props.item), this.x - 3, this.y - 3 + bob);
  }
}

// ------------------------------------------------------------------ coffre
export class Chest extends WorldObject {
  /** props : { item, count?, appearWhen?: condition } */
  constructor({ x, y, uid, props }) {
    super({ x: x + 1, y: y + 4, w: 14, h: 11, uid, props, solid: true, tags: ['chest'] });
    this.wasVisible = null;
  }

  get opened() {
    return this.state.flag(`opened:${this.uid}`);
  }

  get present() {
    return check(this.props.appearWhen, this.state);
  }

  update() {
    const p = this.present;
    if (this.wasVisible === false && p) {
      this.world.game.audio.play('secret');
      this.world.add(new Effect(this.cx, this.cy));
    }
    this.wasVisible = p;
    this.visible = p;
    this.solid = p;
  }

  canTalk() {
    return this.present && !this.opened;
  }

  talk() {
    if (!this.adv.canStore(this.props.item)) {
      return runActions([{ say: 'Ton sac est plein ! Libère une place avant d’ouvrir ce coffre.' }], this.adv.actionContext());
    }
    this.state.setFlag(`opened:${this.uid}`);
    this.world.game.audio.play('chest');
    runActions([{ give: this.props.item, count: this.props.count ?? 1, announce: true }], this.adv.actionContext());
  }

  draw(r) {
    objSheet(this).draw(r, this.opened ? 'chest_open' : 'chest', this.x - 1, this.y - 4);
  }
}

// ------------------------------------------------------------------ PNJ
export class Npc extends WorldObject {
  /**
   * props : { name, sprite: 'npc', wander?: bool,
   *           dialogue: [{ when?: condition, do: [actions] }, ...] }  (première règle vraie)
   */
  constructor({ x, y, uid, props }) {
    super({ x: x + 3, y: y + 8, w: 10, h: 8, uid, props, solid: true, tags: ['npc'] });
    const s = props.sprite ?? 'npc';
    const anims = {};
    for (const d of ['down', 'up', 'side']) {
      anims[`walk_${d}`] = { frames: [`${s}_${d}_0`, `${s}_${d}_1`], fps: 6 };
      anims[`idle_${d}`] = { frames: [`${s}_${d}_0`], fps: 1 };
    }
    this.anim = new Animator(anims);
    this.anim.play('idle_down');
    this.facing = 'down';
    this.rng = createRng(x * 7 + y);
    this.timer = 0;
    this.talking = false;
    this.home = { x: x - 32, y: y - 32, w: 80, h: 80 };
  }

  _dir() {
    return this.facing === 'left' || this.facing === 'right' ? 'side' : this.facing;
  }

  update(dt) {
    let moving = false;
    if (this.props.wander && !this.talking) {
      this.timer -= dt;
      if (this.timer <= 0) {
        this.walking = this.rng() < 0.5;
        this.facing = this.rng.pick(['up', 'down', 'left', 'right']);
        this.timer = 0.8 + this.rng() * 1.5;
      }
      if (this.walking) {
        const d = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[this.facing];
        const px = this.x;
        const py = this.y;
        this.move(d[0] * 20 * dt, d[1] * 20 * dt);
        const h = this.home;
        if (this.x < h.x || this.y < h.y || this.x + this.w > h.x + h.w || this.y + this.h > h.y + h.h) {
          this.x = px;
          this.y = py;
          this.timer = 0;
        }
        moving = true;
      }
    }
    this.anim.play(`${moving ? 'walk' : 'idle'}_${this._dir()}`);
    this.anim.update(dt);
  }

  talk(hero) {
    const dx = hero.cx - this.cx;
    const dy = hero.cy - this.cy;
    this.facing = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : dy < 0 ? 'up' : 'down';
    const rule = (this.props.dialogue ?? []).find((r) => check(r.when, this.state));
    if (!rule) return;
    this.talking = true;
    const ctx = this.adv.actionContext({ speaker: this.props.name });
    runActions(rule.do, ctx, () => (this.talking = false));
  }

  draw(r) {
    const s = this.world.game.themes.current.sprites.chars;
    s.draw(r, this.anim.frame, this.x - 3, this.y - 8, { flipX: this.facing === 'left' });
  }
}

// ------------------------------------------------------------------ panneau
export class Sign extends WorldObject {
  /** props : { text } */
  constructor({ x, y, uid, props }) {
    super({ x: x + 1, y: y + 6, w: 14, h: 10, uid, props, solid: true, tags: ['sign'] });
  }

  talk() {
    runActions([{ say: this.props.text }], this.adv.actionContext({ speaker: this.props.title ?? 'Panneau' }));
  }

  draw(r) {
    this.world.game.themes.current.sprites.chars.draw(r, 'sign', this.x - 1, this.y - 6);
  }
}

// ------------------------------------------------------------------ bloc à pousser
export class PushBlock extends WorldObject {
  /** props : { once?: bool } — once : ne bouge qu'une fois (classique Zelda) */
  constructor({ x, y, uid, props }) {
    super({ x, y, w: 16, h: 16, uid, props, solid: true, tags: ['block', 'heavy'] });
    this.sliding = null;
    this.pushes = 0;
  }

  tryPush(dir) {
    if (this.sliding || (this.props.once && this.pushes > 0)) return;
    const d = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[dir];
    const tx = this.x + d[0] * 16;
    const ty = this.y + d[1] * 16;
    if (this.world.isBlocked(tx, ty, 16, 16, this)) return;
    if (this.world.query({ x: tx, y: ty, w: 16, h: 16 }, (e) => e !== this && (e.solid || e.has('enemy'))).length) return;
    this.sliding = { fx: this.x, fy: this.y, tx, ty, t: 0 };
    this.pushes++;
    this.world.game.audio.play('push');
  }

  update(dt) {
    const s = this.sliding;
    if (!s) return;
    s.t = Math.min(1, s.t + dt / 0.35);
    this.x = s.fx + (s.tx - s.fx) * s.t;
    this.y = s.fy + (s.ty - s.fy) * s.t;
    if (s.t >= 1) this.sliding = null;
  }

  draw(r) {
    objSheet(this).draw(r, 'block', this.x, this.y);
  }
}

// ------------------------------------------------------------------ dalle de pression
export class PressurePlate extends WorldObject {
  /** props : { flag, sticky?: bool } — sticky : reste enfoncée une fois activée */
  constructor({ x, y, uid, props }) {
    super({ x, y, w: 16, h: 16, uid, props, tags: ['plate'] });
    this.z = -1000; // toujours dessinée sous les personnages
    this.pressed = false;
  }

  update() {
    const zone = { x: this.x + 4, y: this.y + 4, w: 8, h: 8 };
    let now = this.world.query(zone, (e) => e.has('hero') || e.has('heavy')).length > 0;
    if (this.props.sticky && this.state.flag(this.props.flag)) now = true;
    if (now !== this.pressed) {
      this.pressed = now;
      this.world.game.audio.play(now ? 'plate_on' : 'plate_off');
      this.state.setFlag(this.props.flag, now);
    }
  }

  draw(r) {
    objSheet(this).draw(r, this.pressed ? 'plate_down' : 'plate', this.x, this.y);
  }
}

// ------------------------------------------------------------------ grille (s'ouvre sous condition)
export class Gate extends WorldObject {
  /** props : { openWhen: condition } */
  constructor({ x, y, uid, props }) {
    super({ x, y, w: 16, h: 16, uid, props, solid: true, tags: ['gate'] });
    this.open = null;
  }

  update() {
    const want = check(this.props.openWhen, this.state);
    if (want === this.open) return;
    // Ne pas refermer sur quelqu'un.
    if (!want && this.world.query(this, (e) => e !== this && (e.has('hero') || e.has('enemy') || e.has('block'))).length) return;
    if (this.open !== null) this.world.game.audio.play(want ? 'gate_open' : 'gate_close');
    this.open = want;
    this.solid = !want;
  }

  draw(r) {
    if (!this.open) objSheet(this).draw(r, 'gate', this.x, this.y);
  }
}

// ------------------------------------------------------------------ porte verrouillée
export class LockedDoor extends WorldObject {
  /** props : { key: 'key' } — consomme une clé ; reste ouverte (drapeau unlocked:<uid>) */
  constructor({ x, y, uid, props }) {
    super({ x, y, w: 16, h: 16, uid, props, solid: true, tags: ['locked'] });
    this._hintCooldown = 0;
  }

  added() {
    if (this.state.flag(`unlocked:${this.uid}`)) this.kill();
  }

  update(dt) {
    this._hintCooldown -= dt;
  }

  onBump() {
    const key = this.props.key ?? 'key';
    if (this.state.take(key, 1)) {
      this.state.setFlag(`unlocked:${this.uid}`);
      this.world.game.audio.play('unlock');
      this.world.add(new Effect(this.cx, this.cy));
      this.kill();
    } else if (this._hintCooldown <= 0) {
      this._hintCooldown = 2.5;
      this.adv.toast(`Il faut une {w:${key}}.`);
    }
  }

  draw(r) {
    objSheet(this).draw(r, 'locked', this.x, this.y);
  }
}

// ------------------------------------------------------------------ levier / interrupteur
export class Lever extends WorldObject {
  /** props : { flag } — bascule le drapeau quand on le frappe ou qu'on l'actionne */
  constructor({ x, y, uid, props }) {
    super({ x: x + 2, y: y + 6, w: 12, h: 9, uid, props, solid: true, tags: ['lever'] });
    this.cooldown = 0;
  }

  update(dt) {
    this.cooldown -= dt;
  }

  toggle() {
    if (this.cooldown > 0) return;
    this.cooldown = 0.4;
    this.state.setFlag(this.props.flag, !this.state.flag(this.props.flag));
    this.world.game.audio.play('lever');
  }

  onSwordHit() {
    this.toggle();
  }

  talk() {
    this.toggle();
  }

  draw(r) {
    objSheet(this).draw(r, this.state.flag(this.props.flag) ? 'lever_on' : 'lever_off', this.x - 2, this.y - 6);
  }
}

// ------------------------------------------------------------------ tuile qui change (pont réparé...)
export class TileSwitch extends WorldObject {
  /** props : { when: condition, to: 'path' } — remplace la tuile quand la condition devient vraie */
  constructor({ x, y, uid, props }) {
    super({ x, y, w: 16, h: 16, uid, props, tags: ['tileswitch'] });
    this.visible = false;
    this.applied = false;
    this.first = true;
  }

  update() {
    if (this.applied) return;
    if (check(this.props.when, this.state)) {
      const tm = this.world.tilemap;
      tm.set('ground', Math.floor(this.x / tm.tileSize), Math.floor(this.y / tm.tileSize), this.props.to);
      this.applied = true;
      if (!this.first) {
        this.world.game.audio.play('secret');
        this.world.add(new Effect(this.cx, this.cy));
      }
    }
    this.first = false;
  }
}

// ------------------------------------------------------------------ animal égaré (devient le compagnon)
export class StrayPet extends WorldObject {
  /** props : { name, text } — lui parler : il te suit (drapeau 'pet_joined') */
  constructor({ x, y, uid, props }) {
    super({ x: x + 3, y: y + 8, w: 10, h: 8, uid, props, solid: true, tags: ['pet'] });
    this.t = 0;
  }

  added() {
    if (this.state.flag('pet_joined')) this.kill();
  }

  update(dt) {
    this.t += dt;
  }

  talk() {
    runActions(
      [{ say: this.props.text ?? 'Il a l’air perdu... Il veut te suivre !' }, { setFlag: 'pet_joined' }, { call: () => this.adv.spawnCompanion() }],
      this.adv.actionContext({ speaker: this.props.name }),
    );
    this.kill();
  }

  draw(r) {
    const hop = Math.floor(this.t * 2) % 4 === 0 ? -1 : 0;
    objSheet(this).draw(r, Math.floor(this.t * 3) % 2 ? 'pet_1' : 'pet_0', this.x - 3, this.y - 8 + hop);
  }
}
