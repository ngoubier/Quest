import { Entity, Animator, createRng, rectsOverlap } from '../../engine/index.js';
import { check } from '../script/conditions.js';
import { runActions } from '../script/actions.js';
import { Effect } from '../actors/Effect.js';
import { DigitLockScene } from '../ui/DigitLockScene.js';
import { Projectile } from '../actors/Projectile.js';

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
    if (this.carrier) {
      // rapporté par le boomerang
      if (this.carrier.dead) this.carrier = null;
      else (this.x = this.carrier.cx - 5), (this.y = this.carrier.cy - 5);
    } else if (this.props.lifetime && this.t > this.props.lifetime) return this.kill();
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
  /** props : { item, count?, appearWhen?: condition, code?: '42' (coffre à code), codeTitle? } */
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
    // Coffre à code : il faut trouver les bons chiffres (props.code : '42').
    const code = this.props.code;
    if (code && !this.state.flag(`coded:${this.uid}`)) {
      return this.world.game.scenes.push(
        new DigitLockScene({
          digits: String(code).length,
          title: this.props.codeTitle ?? 'Coffre à code',
          onOk: (v) => {
            if (v !== String(code)) {
              this.world.game.audio.play('menu_no');
              return this.adv.toast('Ce n’est pas le bon code...');
            }
            this.state.setFlag(`coded:${this.uid}`);
            this.world.game.audio.play('unlock');
            this.talk();
          },
        }),
      );
    }
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
   * props : { name: 'Margot, la cuisinière', sprite: 'npc', wander?: bool,
   *           role?: 'quest' | 'quiz' | 'shop',     // repère affiché au-dessus de la tête
   *           gives?: ['id de quête'],              // quêtes qu'il donne  → « ! » doré
   *           involved?: ['id de quête'],           // quêtes où il intervient → « ? » quand elles sont en cours
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

  /** showWhen : le personnage n'est là que si la condition est vraie (chat retrouvé...). */
  get present() {
    return check(this.props.showWhen, this.state);
  }

  canTalk() {
    return this.present;
  }

  update(dt) {
    const here = this.present;
    this.visible = here;
    this.solid = here;
    if (!here) return;
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

  /** Repère : '!' quête à prendre, '?' quête en cours, 'quiz' énigmes, 'shop' magasin, ou null. */
  get marker() {
    const st = this.state;
    const gives = this.props.gives ?? [];
    const involved = [...gives, ...(this.props.involved ?? [])];
    if (gives.some((q) => st.questStatus(q) === 'none')) return '!';
    if (involved.some((q) => st.questStatus(q) === 'active')) return '?';
    if (this.props.role === 'quiz') return 'quiz';
    if (this.props.role === 'shop') return 'shop';
    return null;
  }

  /** Prénom affiché au-dessus de la tête (partie avant la virgule du nom). */
  get firstName() {
    return this.adv.format(this.props.name ?? '').split(',')[0].trim();
  }

  draw(r) {
    if (!this.present) return;
    const s = this.world.game.themes.current.sprites.chars;
    s.draw(r, this.anim.frame, this.x - 3, this.y - 8, { flipX: this.facing === 'left' });
    const t = this.world.time;
    const top = this.y - 10;
    const m = this.marker;
    if (m) drawMarker(r, this.cx, top - 9 + Math.round(Math.sin(t * 4) * 1.5), m);
    // Prénom quand le héros s'approche
    const h = this.adv.hero;
    if (h && Math.hypot(h.cx - this.cx, h.cy - this.cy) < 40 && this.firstName) {
      const g = this.world.game;
      const name = this.firstName;
      const w = Math.ceil(r.measure(name, 6, g.style.font)) + 6;
      const ny = top - (m ? 20 : 9);
      r.withAlpha(0.85, () => r.rect(Math.round(this.cx - w / 2), ny, w, 8, '#000'));
      r.text(name, this.cx, ny + 1, { color: '#fff', size: 6, font: g.style.font, align: 'center' });
    }
  }
}

/**
 * Bulle de repère au-dessus d'un personnage (couleurs fixes, lisibles dans toutes les ambiances) :
 *   '!'    doré    : a une quête à donner
 *   '?'    argent  : quête en cours avec lui
 *   'quiz' bleu    : pose des énigmes (livre)
 *   'shop' vert    : magasin (€)
 */
export function drawMarker(r, cx, y, kind) {
  const x = Math.round(cx - 5);
  const col = { '!': '#ffd35a', '?': '#d8dde8', quiz: '#3a8ad8', shop: '#3ac46a' }[kind];
  r.rect(x, y, 10, 9, '#141414');
  r.rect(x + 1, y + 1, 8, 7, col);
  r.rect(x + 4, y + 9, 2, 1, '#141414'); // pointe de la bulle
  const ink = kind === 'quiz' || kind === 'shop' ? '#ffffff' : '#141414';
  if (kind === '!') {
    r.rect(x + 4, y + 2, 2, 3, ink);
    r.rect(x + 4, y + 6, 2, 1, ink);
  } else if (kind === '?') {
    r.rect(x + 3, y + 2, 4, 1, ink);
    r.rect(x + 6, y + 3, 1, 1, ink);
    r.rect(x + 4, y + 4, 2, 1, ink);
    r.rect(x + 4, y + 6, 2, 1, ink);
  } else if (kind === 'quiz') {
    // livre ouvert
    r.rect(x + 2, y + 2, 3, 5, ink);
    r.rect(x + 5, y + 2, 3, 5, ink);
    r.rect(x + 5, y + 2, 1, 5, col);
    r.rect(x + 3, y + 3, 1, 1, col);
    r.rect(x + 6, y + 4, 1, 1, col);
  } else if (kind === 'shop') {
    r.rect(x + 3, y + 2, 4, 1, ink);
    r.rect(x + 3, y + 2, 1, 5, ink);
    r.rect(x + 3, y + 6, 4, 1, ink);
    r.rect(x + 2, y + 4, 4, 1, ink);
  }
}

// ------------------------------------------------------------------ panneau
export class Sign extends WorldObject {
  /** props : { text, title?, sprite? (image de la planche 'objects', ex. un livre),
   *           byAge?: [[âge minimum, texte], ...] — texte adapté à l'âge (calcul plus ou moins dur) } */
  constructor({ x, y, uid, props }) {
    super({ x: x + 1, y: y + 6, w: 14, h: 10, uid, props, solid: true, tags: ['sign'] });
  }

  get text() {
    const age = this.state.profile?.age ?? 8;
    const fit = (this.props.byAge ?? []).filter(([min]) => age >= min).at(-1);
    return fit ? fit[1] : this.props.text;
  }

  talk() {
    runActions([{ say: this.text }], this.adv.actionContext({ speaker: this.props.title ?? 'Panneau' }));
  }

  draw(r) {
    if (this.props.sprite) return objSheet(this).draw(r, this.props.sprite, this.x - 1, this.y - 6);
    this.world.game.themes.current.sprites.chars.draw(r, 'sign', this.x - 1, this.y - 6);
  }
}

// ------------------------------------------------------------------ bloc à pousser
export class PushBlock extends WorldObject {
  /** props : { once?: bool, slide?: bool, sink?: bool, sprite?: 'block' }
   *  once : ne bouge qu'une fois (classique Zelda) ; slide : glisse jusqu'au prochain obstacle (bloc de glace) ;
   *  sink : poussé dans l'eau (tuile avec la propriété `fillable: 'tuile'`), il coule et fait un passage (rondin) */
  constructor({ x, y, uid, props }) {
    super({ x, y, w: 16, h: 16, uid, props, solid: true, tags: ['block', 'heavy'] });
    this.sliding = null;
    this.pushes = 0;
  }

  added() {
    if (this.props.sink && this.uid && this.state.flag(`sunk:${this.uid}`)) this.kill();
  }

  /** Case d'eau (propriété de tuile `fillable`) où un rondin peut couler : renvoie la tuile qui la remplace. */
  _fillAt(px, py) {
    if (!this.props.sink) return null;
    const tm = this.world.tilemap;
    return tm.propAt(Math.floor(px / tm.tileSize), Math.floor(py / tm.tileSize), 'fillable') ?? null;
  }

  tryPush(dir, by = null, carryOn = false) {
    if (this.sliding || (!carryOn && this.props.once && this.pushes > 0)) return;
    const d = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[dir];
    const tx = this.x + d[0] * 16;
    const ty = this.y + d[1] * 16;
    if (this.world.query({ x: tx, y: ty, w: 16, h: 16 }, (e) => e !== this && (e.solid || e.has('enemy'))).length) return;
    const fill = this._fillAt(tx + 8, ty + 8);
    if (!fill && this.world.isBlocked(tx, ty, 16, 16, this)) return;
    this.sliding = { fx: this.x, fy: this.y, tx, ty, t: 0, dir, fill };
    if (carryOn) return;
    this.pushes++;
    this.world.game.audio.play('push');
  }

  update(dt) {
    const s = this.sliding;
    if (!s) return;
    s.t = Math.min(1, s.t + dt / (this.props.slide ? 0.16 : 0.35));
    this.x = s.fx + (s.tx - s.fx) * s.t;
    this.y = s.fy + (s.ty - s.fy) * s.t;
    if (s.t >= 1) {
      this.sliding = null;
      if (s.fill) return this._sink(s.fill);
      if (this.props.slide) this.tryPush(s.dir, null, true); // continue tant que la voie est libre
    }
  }

  /** Le rondin tombe dans l'eau et devient un passage (mémorisé : voir AdventureScene.fillTile). */
  _sink(tile) {
    const ts = this.world.tilemap.tileSize;
    this.adv.fillTile(Math.floor((this.x + 8) / ts), Math.floor((this.y + 8) / ts), tile);
    if (this.uid) this.state.setFlag(`sunk:${this.uid}`);
    this.world.game.audio.play('secret');
    this.world.add(new Effect(this.cx, this.cy));
    this.kill();
  }

  draw(r) {
    objSheet(this).draw(r, this.props.sprite ?? 'block', this.x, this.y);
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
  /** props : { openWhen: condition, sprite?: 'gate', openSprite?: image dessinée quand elle est ouverte,
   *           every?: secondes — porte à horloge : ouverte/fermée à tour de rôle (phase 0 ou 1) } */
  constructor({ x, y, uid, props }) {
    super({ x, y, w: 16, h: 16, uid, props, solid: true, tags: ['gate'] });
    this.open = null;
  }

  /** Porte à horloge : secondes avant le prochain changement. */
  get clockLeft() {
    const e = this.props.every;
    return e ? e - (this.state.playTime % e) : 0;
  }

  update() {
    const e = this.props.every;
    const want = e ? Math.floor(this.state.playTime / e) % 2 === (this.props.phase ?? 0) : check(this.props.openWhen, this.state);
    if (want === this.open) return;
    // Ne pas refermer sur quelqu'un.
    if (!want && this.world.query(this, (e) => e !== this && (e.has('hero') || e.has('enemy') || e.has('block'))).length) return;
    if (this.open !== null) this.world.game.audio.play(e ? 'chime' : want ? 'gate_open' : 'gate_close');
    this.open = want;
    this.solid = !want;
  }

  draw(r) {
    if (!this.open) objSheet(this).draw(r, this.props.sprite ?? 'gate', this.x, this.y);
    else if (this.props.openSprite) objSheet(this).draw(r, this.props.openSprite, this.x, this.y);
    // Porte à horloge : elle clignote juste avant de changer.
    if (this.props.every && this.clockLeft < 1 && Math.floor(this.world.game.time * 8) % 2) r.withAlpha(0.5, () => r.rect(this.x + 2, this.y + 2, 12, 12, '#ffe066'));
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
      this.adv.toast(key === 'key' ? `Il faut une {w:${key}}.` : `Il faut : ${this.adv.itemName(key)}.`);
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

  /** Un boomerang (ou une flèche) l'actionne à distance. */
  onProjectile(p) {
    if (p.hostile) return false;
    this.toggle();
    return true;
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

// ------------------------------------------------------------------ brasero (s'allume avec du feu)
export class Brazier extends WorldObject {
  /** props : { flag? } — allumé par un projectile de feu ; lève le drapeau (par défaut lit:<uid>) et le reste */
  constructor({ x, y, uid, props }) {
    super({ x: x + 2, y: y + 5, w: 12, h: 10, uid, props, solid: true, tags: ['brazier'] });
    this.hint = 0;
  }

  get flag() {
    return this.props.flag ?? `lit:${this.uid}`;
  }

  get lit() {
    return this.state.flag(this.flag);
  }

  update(dt) {
    this.hint -= dt;
  }

  onProjectile(p) {
    if (p.kind === 'fire' && !this.lit) {
      this.state.setFlag(this.flag);
      this.world.game.audio.play('secret');
      this.world.add(new Effect(this.cx, this.cy - 6));
    }
    return true;
  }

  talk() {
    if (this.lit || this.hint > 0) return;
    this.hint = 2;
    this.adv.toast('Un brasero éteint. Il faudrait du feu pour l’allumer.');
  }

  canTalk() {
    return !this.lit;
  }

  draw(r) {
    const frame = this.lit ? `brazier_${Math.floor(this.world.game.time * 8) % 2}` : 'brazier_off';
    objSheet(this).draw(r, frame, this.x - 2, this.y - 5);
  }
}

// ------------------------------------------------------------------ mur de glace (fond avec du feu)
export class IceWall extends WorldObject {
  /** Bloque le passage jusqu'à ce qu'un projectile de feu le fasse fondre (drapeau melted:<uid>). */
  constructor({ x, y, uid, props }) {
    super({ x, y, w: 16, h: 16, uid, props, solid: true, tags: ['icewall'] });
    this.hint = 0;
  }

  added() {
    if (this.state.flag(`melted:${this.uid}`)) this.kill();
  }

  update(dt) {
    this.hint -= dt;
  }

  onProjectile(p) {
    if (p.kind === 'fire') {
      this.state.setFlag(`melted:${this.uid}`);
      this.world.game.audio.play('gate_open');
      this.world.add(new Effect(this.cx, this.cy));
      this.kill();
    }
    return true;
  }

  onSwordHit() {
    if (this.hint > 0) return;
    this.hint = 2.5;
    this.world.game.audio.play('boss_shield');
    this.adv.toast('La glace est trop dure pour l’épée. Il faudrait du feu !');
  }

  draw(r) {
    objSheet(this).draw(r, 'icewall', this.x, this.y);
  }
}

// ------------------------------------------------------------------ cible (à toucher avec l'arc)
export class Target extends WorldObject {
  /** props : { flag?, hitBy?: 'arrow' } — touchée par le bon projectile, elle lève son drapeau (par défaut hit:<uid>) */
  constructor({ x, y, uid, props }) {
    super({ x: x + 2, y: y + 3, w: 12, h: 12, uid, props, solid: true, tags: ['target'] });
    this.hint = 0;
  }

  get flag() {
    return this.props.flag ?? `hit:${this.uid}`;
  }

  get hit() {
    return this.state.flag(this.flag);
  }

  update(dt) {
    this.hint -= dt;
  }

  onProjectile(p) {
    if (p.hostile) return false;
    if (p.kind === (this.props.hitBy ?? 'arrow') && !this.hit) {
      this.state.setFlag(this.flag);
      this.world.game.audio.play('secret');
      this.world.add(new Effect(this.cx, this.cy));
    } else if (!this.hit) this._hint();
    return true;
  }

  _hint() {
    if (this.hint > 0) return;
    this.hint = 2.5;
    this.adv.toast('Une cible ! Il faut la toucher avec une flèche.');
  }

  onSwordHit() {
    if (!this.hit) this._hint();
  }

  canTalk() {
    return !this.hit;
  }

  talk() {
    this._hint();
  }

  draw(r) {
    objSheet(this).draw(r, this.hit ? 'target_hit' : 'target', this.x - 2, this.y - 3);
  }
}

// ------------------------------------------------------------------ interrupteur cristal (bleu ↔ rouge)
export class CrystalSwitch extends WorldObject {
  /** props : { flag } — frappé (épée, flèche, boomerang, bombe), il bascule le drapeau.
   *  Les blocs bleus / rouges sont des grilles : openWhen: flag (rouges) ou { flag, is: false } (bleus). */
  constructor({ x, y, uid, props }) {
    super({ x: x + 2, y: y + 3, w: 12, h: 12, uid, props, solid: true, tags: ['crystal'] });
    this.cooldown = 0;
  }

  update(dt) {
    this.cooldown -= dt;
  }

  hit() {
    if (this.cooldown > 0) return;
    this.cooldown = 0.5;
    this.state.setFlag(this.props.flag, !this.state.flag(this.props.flag));
    this.world.game.audio.play('switch');
    this.world.add(new Effect(this.cx, this.cy, { duration: 0.2 }));
  }

  onSwordHit() {
    this.hit();
  }

  onProjectile(p) {
    if (p.hostile) return false;
    this.hit();
    return true;
  }

  onBomb() {
    this.hit();
  }

  draw(r) {
    objSheet(this).draw(r, this.state.flag(this.props.flag) ? 'crystal_red' : 'crystal_blue', this.x - 2, this.y - 3);
  }
}

// ------------------------------------------------------------------ piques qui sortent en rythme
export class Spikes extends WorldObject {
  /** props : { period?: 2, phase?: 0 } — sorties la moitié du temps ; elles blessent le héros. */
  constructor({ x, y, uid, props }) {
    super({ x, y, w: 16, h: 16, uid, props, tags: ['spikes'] });
    this.z = -900;
  }

  get up() {
    const p = this.props.period ?? 2;
    const t = (this.world.game.time + (this.props.phase ?? 0) * p) % p;
    return t >= p / 2;
  }

  /** Bientôt dehors : elles tremblent (pour prévenir l'enfant). */
  get warning() {
    const p = this.props.period ?? 2;
    const t = (this.world.game.time + (this.props.phase ?? 0) * p) % p;
    return t >= p / 2 - 0.35 && t < p / 2;
  }

  update() {
    if (!this.up) return;
    const h = this.adv.hero;
    if (h && rectsOverlap({ x: this.x + 3, y: this.y + 3, w: 10, h: 10 }, h)) h.hurt(1, this);
  }

  draw(r) {
    objSheet(this).draw(r, this.up ? 'spikes_up' : 'spikes_down', this.x, this.y + (this.warning && Math.floor(this.world.game.time * 20) % 2 ? 1 : 0));
  }
}

// ------------------------------------------------------------------ lance-flèches dans un mur
export class ArrowTrap extends WorldObject {
  /** props : { dir: 'down' | 'up' | 'left' | 'right', every?: 2, phase?: 0 } — tire une flèche à intervalle régulier. */
  constructor({ x, y, uid, props }) {
    super({ x, y, w: 16, h: 16, uid, props, solid: true, tags: ['trap'] });
    this.timer = (props.every ?? 2) * (props.phase ?? 0);
  }

  update(dt) {
    // seulement à l'écran
    const v = this.world.camera.view;
    if (!rectsOverlap({ x: v.x - 16, y: v.y - 16, w: v.w + 32, h: v.h + 32 }, this)) return;
    this.timer += dt;
    const every = this.props.every ?? 2;
    if (this.timer < every) return;
    this.timer -= every;
    const d = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[this.props.dir ?? 'down'];
    this.world.add(new Projectile({ x: this.cx + d[0] * 12, y: this.cy + d[1] * 12, dir: { x: d[0], y: d[1] }, kind: 'arrow', speed: 110, hostile: true, range: 200, owner: this }));
    this.world.game.audio.play('arrow');
  }

  draw(r) {
    objSheet(this).draw(r, `trap_${this.props.dir ?? 'down'}`, this.x, this.y);
  }
}

// ------------------------------------------------------------------ dalle qui s'effondre
export class Crumble extends WorldObject {
  /** Le héros marche dessus : elle tremble, puis devient un trou (tuile props.to, par défaut 'pit'). */
  constructor({ x, y, uid, props }) {
    super({ x, y, w: 16, h: 16, uid, props, tags: ['crumble'] });
    this.z = -950;
    this.t = null;
  }

  update(dt) {
    const h = this.adv.hero;
    if (this.t === null) {
      if (h && rectsOverlap({ x: this.x + 2, y: this.y + 2, w: 12, h: 12 }, h)) (this.t = 0), this.world.game.audio.play('crack');
      return;
    }
    this.t += dt;
    if (this.t < (this.props.delay ?? 0.6)) return;
    const tm = this.world.tilemap;
    tm.set('ground', Math.floor(this.x / tm.tileSize), Math.floor(this.y / tm.tileSize), this.props.to ?? 'pit');
    this.world.add(new Effect(this.cx, this.cy, { duration: 0.3 }));
    this.kill();
  }

  draw(r) {
    const shake = this.t !== null && Math.floor(this.t * 30) % 2 ? 1 : 0;
    objSheet(this).draw(r, this.t === null ? 'crumble' : 'crumble_crack', this.x + shake, this.y);
  }
}
