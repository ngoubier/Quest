// Entité : tout ce qui vit dans le monde (joueur, PNJ, monstre, panneau, coffre...).
// (x, y, w, h) est la BOÎTE DE COLLISION ; le sprite peut être plus grand et décalé.
// Le gameplay crée ses propres entités en héritant de cette classe.

let nextId = 1;

export class Entity {
  constructor({ x = 0, y = 0, w = 16, h = 16, tags = [], solid = false, name } = {}) {
    this.id = nextId++;
    this.name = name;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.tags = new Set(tags);
    this.solid = solid; // bloque les autres entités
    this.dead = false;
    this.visible = true;
    this.world = null;
    this.z = 0; // décalage de tri d'affichage (positif = devant)
  }

  get cx() {
    return this.x + this.w / 2;
  }

  get cy() {
    return this.y + this.h / 2;
  }

  /** Clé de tri : plus on est bas à l'écran, plus on est dessiné devant. */
  get sortY() {
    return this.y + this.h + this.z;
  }

  has(tag) {
    return this.tags.has(tag);
  }

  kill() {
    this.dead = true;
  }

  /** Déplacement avec collisions contre la carte et les entités solides. */
  move(dx, dy, opts) {
    return this.world.moveEntity(this, dx, dy, opts);
  }

  // --- À surcharger ---
  added(world) {}
  removed(world) {}
  update(dt) {}
  /** Appelé à la place de update() pendant un défilement d'écran. */
  updateDuringScroll(dt, camera) {}
  draw(r) {}
}
