// Jeu de tuiles : la liste des types de tuiles (nom, solide, animation, propriétés)
// et l'image qui les contient. L'id 0 est réservé au "vide".
//
// Atlas : la tuile d'id N occupe la ligne N ; colonnes = variantes × images d'animation.
// Variantes : plusieurs dessins d'une même tuile, choisis selon la position (moins répétitif).

export class Tileset {
  /**
   * @param {object} opts
   * @param {number} [opts.tileSize=16]
   * @param {{name:string, solid?:boolean, frames?:number, fps?:number, props?:object}[]} opts.tiles
   * @param {CanvasImageSource|null} [opts.image]
   * @param {number} [opts.detail=1]  l'image est `detail` fois plus fine que la grille du jeu
   */
  constructor({ tileSize = 16, tiles = [], image = null, detail = 1 } = {}) {
    this.tileSize = tileSize;
    this.image = image;
    this.detail = detail; // pixels d'image par pixel de jeu (2 = haute définition)
    this.defs = [{ id: 0, name: null, solid: false, frames: 1, fps: 0, variants: 1, props: {} }];
    this.ids = new Map();
    tiles.forEach((t, i) => {
      const id = i + 1;
      this.defs[id] = { solid: false, frames: 1, fps: 3, variants: 1, props: {}, ...t, id };
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

  draw(r, id, x, y, time = 0, variant = 0) {
    if (!id || !this.image) return;
    const d = this.defs[id];
    const f = d.frames > 1 ? Math.floor(time * d.fps) % d.frames : 0;
    const v = d.variants > 1 ? variant % d.variants : 0;
    const ts = this.tileSize;
    const s = ts * this.detail;
    r.image(this.image, (v * d.frames + f) * s, id * s, s, s, x, y, ts, ts);
  }
}
