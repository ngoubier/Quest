// Jeu de tuiles : la liste des types de tuiles (nom, solide, animation, propriétés)
// et l'image qui les contient. L'id 0 est réservé au "vide".
//
// Atlas : la tuile d'id N occupe la ligne N ; ses images d'animation sont en colonnes.

export class Tileset {
  /**
   * @param {object} opts
   * @param {number} [opts.tileSize=16]
   * @param {{name:string, solid?:boolean, frames?:number, fps?:number, props?:object}[]} opts.tiles
   * @param {CanvasImageSource|null} [opts.image]
   */
  constructor({ tileSize = 16, tiles = [], image = null } = {}) {
    this.tileSize = tileSize;
    this.image = image;
    this.defs = [{ id: 0, name: null, solid: false, frames: 1, fps: 0, props: {} }];
    this.ids = new Map();
    tiles.forEach((t, i) => {
      const id = i + 1;
      this.defs[id] = { solid: false, frames: 1, fps: 3, props: {}, ...t, id };
      this.ids.set(t.name, id);
    });
  }

  id(name) {
    const id = this.ids.get(name);
    if (id === undefined) throw new Error(`Tileset : tuile "${name}" inconnue`);
    return id;
  }

  def(id) {
    return this.defs[id] || this.defs[0];
  }

  isSolid(id) {
    return !!this.def(id).solid;
  }

  draw(r, id, x, y, time = 0) {
    if (!id || !this.image) return;
    const d = this.defs[id];
    const f = d.frames > 1 ? Math.floor(time * d.fps) % d.frames : 0;
    const ts = this.tileSize;
    r.image(this.image, f * ts, id * ts, ts, ts, x, y);
  }
}
