import { rectsOverlap } from '../core/math.js';
import { moveAndSlide } from '../physics/collision.js';

// Le monde : une carte + des entités + une caméra.
// Il met à jour les entités, gère leurs collisions et les dessine triées en profondeur.

export class World {
  /**
   * @param {object} o
   * @param {import('../core/Game.js').Game} o.game
   * @param {import('./Tilemap.js').Tilemap} o.tilemap
   * @param {import('./Camera.js').Camera} o.camera
   * @param {{x:number,y:number,w:number,h:number}} [o.viewport] zone de l'écran où le monde est affiché
   */
  constructor({ game, tilemap, camera, viewport }) {
    this.game = game;
    this.tilemap = tilemap;
    this.camera = camera;
    this.viewport = viewport || { x: 0, y: 0, w: camera.width, h: camera.height };
    this.entities = [];
    this.time = 0;
  }

  add(entity) {
    entity.world = this;
    entity.dead = false;
    this.entities.push(entity);
    entity.added(this);
    return entity;
  }

  remove(entity) {
    entity.dead = true;
  }

  /** Une zone est bloquée par la carte ou par une entité solide (autre que `self`). */
  isBlocked(x, y, w, h, self = null) {
    if (this.tilemap.rectHitsSolid(x, y, w, h)) return true;
    const r = { x, y, w, h };
    for (const e of this.entities) {
      if (e !== self && e.solid && !e.dead && rectsOverlap(r, e)) return true;
    }
    return false;
  }

  moveEntity(entity, dx, dy, opts) {
    return moveAndSlide(entity, dx, dy, (x, y, w, h) => this.isBlocked(x, y, w, h, entity), opts);
  }

  /** Entités qui chevauchent `rect`, filtrées optionnellement. */
  query(rect, filter = null) {
    return this.entities.filter((e) => !e.dead && rectsOverlap(rect, e) && (!filter || filter(e)));
  }

  byTag(tag) {
    return this.entities.filter((e) => !e.dead && e.has(tag));
  }

  update(dt) {
    this.time += dt;
    const scrolling = this.camera.isTransitioning;
    for (const e of [...this.entities]) {
      if (e.dead) continue;
      if (scrolling) e.updateDuringScroll(dt, this.camera);
      else e.update(dt);
    }
    if (this.entities.some((e) => e.dead)) {
      this.entities = this.entities.filter((e) => {
        if (e.dead) e.removed(this);
        return !e.dead;
      });
    }
    this.camera.update(dt);
  }

  draw(r) {
    const cam = this.camera;
    const view = cam.view;
    r.pushWorld(cam, this.viewport);
    this.tilemap.draw(r, view, this.time);
    const visible = this.entities
      .filter((e) => e.visible && !e.dead)
      .sort((a, b) => a.sortY - b.sortY);
    for (const e of visible) e.draw(r);
    this.tilemap.draw(r, view, this.time, { above: true });
    if (this.game?.debug?.enabled) this._drawDebug(r, view);
    r.popWorld();
  }

  _drawDebug(r, view) {
    const ts = this.tilemap.tileSize;
    const tm = this.tilemap;
    const x0 = Math.floor(view.x / ts);
    const y0 = Math.floor(view.y / ts);
    for (let ty = y0; ty <= y0 + Math.ceil(view.h / ts); ty++) {
      for (let tx = x0; tx <= x0 + Math.ceil(view.w / ts); tx++) {
        if (tm.inBounds(tx, ty) && tm.isSolidTile(tx, ty)) r.rect(tx * ts, ty * ts, ts, ts, 'rgba(255,40,40,0.28)');
      }
    }
    for (const e of this.entities) {
      if (e.dead) continue;
      r.strokeRect(Math.round(e.x), Math.round(e.y), e.w, e.h, e.solid ? '#ff0' : '#0f0');
    }
  }
}
