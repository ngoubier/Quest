// Carte en grille de tuiles, sur une ou plusieurs couches.
// Les couches marquées `above: true` sont dessinées PAR-DESSUS les personnages
// (feuillages, toits, arches de portes...).

export class Tilemap {
  /**
   * @param {object} o
   * @param {number} o.width   largeur en tuiles
   * @param {number} o.height  hauteur en tuiles
   * @param {import('./Tileset.js').Tileset} o.tileset
   * @param {{name:string, data:ArrayLike<number>, above?:boolean}[]} [o.layers]
   */
  constructor({ width, height, tileset, layers }) {
    this.width = width;
    this.height = height;
    this.tileset = tileset;
    this.tileSize = tileset.tileSize;
    this.layers = (layers || [{ name: 'ground', data: [] }]).map((l) => ({
      name: l.name,
      above: !!l.above,
      data: Uint16Array.from({ length: width * height }, (_, i) => l.data[i] || 0),
    }));
    this._recomputeSolid();
  }

  /**
   * Construit une carte depuis du texte ASCII — idéal pour prototyper.
   * @param {object} o
   * @param {string[]} o.rows  une chaîne par ligne
   * @param {Record<string, string | {tile:string, marker?:string, over?:string}>} o.legend
   * @param {import('./Tileset.js').Tileset} o.tileset
   * @returns {{tilemap: Tilemap, markers: {name:string, char:string, tx:number, ty:number, x:number, y:number}[]}}
   */
  static fromAscii({ rows, legend, tileset }) {
    const height = rows.length;
    const width = Math.max(...rows.map((r) => r.length));
    const ground = new Array(width * height).fill(0);
    const over = new Array(width * height).fill(0);
    const markers = [];
    const ts = tileset.tileSize;
    let hasOver = false;
    rows.forEach((row, ty) => {
      for (let tx = 0; tx < width; tx++) {
        const ch = row[tx] ?? ' ';
        if (ch === ' ') continue;
        let entry = legend[ch];
        if (entry === undefined) throw new Error(`Tilemap.fromAscii : caractère "${ch}" absent de la légende (${tx},${ty})`);
        if (typeof entry === 'string') entry = { tile: entry };
        ground[ty * width + tx] = tileset.id(entry.tile);
        if (entry.over) {
          over[ty * width + tx] = tileset.id(entry.over);
          hasOver = true;
        }
        if (entry.marker) markers.push({ name: entry.marker, char: ch, tx, ty, x: tx * ts, y: ty * ts });
      }
    });
    const layers = [{ name: 'ground', data: ground }];
    if (hasOver) layers.push({ name: 'over', data: over, above: true });
    return { tilemap: new Tilemap({ width, height, tileset, layers }), markers };
  }

  get pixelWidth() {
    return this.width * this.tileSize;
  }

  get pixelHeight() {
    return this.height * this.tileSize;
  }

  /** Change de jeu de tuiles (ex. changement d'ambiance) en gardant la même carte. */
  setTileset(tileset) {
    this.tileset = tileset;
    this.tileSize = tileset.tileSize;
    this._recomputeSolid();
  }

  _layer(layer) {
    return typeof layer === 'number' ? this.layers[layer] : this.layers.find((l) => l.name === layer);
  }

  inBounds(tx, ty) {
    return tx >= 0 && ty >= 0 && tx < this.width && ty < this.height;
  }

  get(layer, tx, ty) {
    if (!this.inBounds(tx, ty)) return 0;
    return this._layer(layer).data[ty * this.width + tx];
  }

  set(layer, tx, ty, idOrName) {
    if (!this.inBounds(tx, ty)) return;
    const id = typeof idOrName === 'string' ? this.tileset.id(idOrName) : idOrName;
    this._layer(layer).data[ty * this.width + tx] = id;
    this._updateSolidCell(tx, ty);
  }

  /** Nom de la tuile visible la plus haute à cette case. */
  nameAt(tx, ty) {
    for (let i = this.layers.length - 1; i >= 0; i--) {
      const id = this.get(i, tx, ty);
      if (id) return this.tileset.def(id).name;
    }
    return null;
  }

  /** Valeur d'une propriété de tuile (ex. 'damage', 'slippery') à une case. */
  propAt(tx, ty, key) {
    for (let i = this.layers.length - 1; i >= 0; i--) {
      const d = this.tileset.def(this.get(i, tx, ty));
      if (d.props && key in d.props) return d.props[key];
    }
    return undefined;
  }

  _recomputeSolid() {
    this.solid = new Uint8Array(this.width * this.height);
    for (let ty = 0; ty < this.height; ty++) for (let tx = 0; tx < this.width; tx++) this._updateSolidCell(tx, ty);
  }

  _updateSolidCell(tx, ty) {
    const i = ty * this.width + tx;
    this.solid[i] = this.layers.some((l) => this.tileset.isSolid(l.data[i])) ? 1 : 0;
  }

  /** Les bords de la carte comptent comme des murs. */
  isSolidTile(tx, ty) {
    if (!this.inBounds(tx, ty)) return true;
    return this.solid[ty * this.width + tx] === 1;
  }

  isSolidAt(px, py) {
    return this.isSolidTile(Math.floor(px / this.tileSize), Math.floor(py / this.tileSize));
  }

  /** Vrai si le rectangle touche au moins une tuile solide. */
  rectHitsSolid(x, y, w, h) {
    const ts = this.tileSize;
    const x0 = Math.floor(x / ts);
    const y0 = Math.floor(y / ts);
    const x1 = Math.floor((x + w - 1e-6) / ts);
    const y1 = Math.floor((y + h - 1e-6) / ts);
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (this.isSolidTile(tx, ty)) return true;
    return false;
  }

  /** Dessine les tuiles visibles dans `view` ({x,y,w,h} en pixels monde). */
  draw(r, view, time = 0, { above = false } = {}) {
    const ts = this.tileSize;
    const x0 = Math.max(0, Math.floor(view.x / ts));
    const y0 = Math.max(0, Math.floor(view.y / ts));
    const x1 = Math.min(this.width - 1, Math.floor((view.x + view.w) / ts));
    const y1 = Math.min(this.height - 1, Math.floor((view.y + view.h) / ts));
    for (const layer of this.layers) {
      if (layer.above !== above) continue;
      for (let ty = y0; ty <= y1; ty++) {
        for (let tx = x0; tx <= x1; tx++) {
          const id = layer.data[ty * this.width + tx];
          if (id) this.tileset.draw(r, id, tx * ts, ty * ts, time);
        }
      }
    }
  }
}
