// Carte en grille de tuiles, sur une ou plusieurs couches.
// Les couches marquées `above: true` sont dessinées PAR-DESSUS les personnages
// (feuillages, toits, arches de portes...).

/** Variante d'une tuile selon sa position (stable, sans motif visible). */
function variantAt(tx, ty) {
  let v = Math.imul(tx + 0x9e37, 0x85ebca6b) ^ Math.imul(ty + 0x7f4a, 0xc2b2ae35);
  v = Math.imul(v ^ (v >>> 13), 0x27d4eb2d);
  return ((v ^ (v >>> 15)) >>> 0) % 97;
}

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
   * @param {Record<string, string | {tile:string, marker?:string, over?:string, props?:object}>} o.legend
   * @param {import('./Tileset.js').Tileset} o.tileset
   * @returns {{tilemap: Tilemap, markers: {name:string, char:string, tx:number, ty:number, x:number, y:number, props:object}[]}}
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
        if (entry.marker) markers.push({ name: entry.marker, char: ch, tx, ty, x: tx * ts, y: ty * ts, props: entry.props || {} });
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

  /**
   * Dessine les tuiles visibles dans `view` ({x,y,w,h} en pixels monde).
   * Effets automatiques (selon les propriétés des tuiles) :
   *  - variantes choisies selon la position ;
   *  - `props.shadow` : ombre portée sur la tuile du dessous ;
   *  - `props.edge`   : liseré de couleur là où la tuile touche une autre tuile (berges...).
   * `soft` : ombres en dégradé (occlusion au pied des murs) au lieu d'un trait net.
   * Passe du dessus (`above`) : les cimes des grands éléments (arbres sur 2 cases) ; elles deviennent
   * transparentes là où passe quelqu'un (`reveal` : rectangles en pixels monde).
   */
  draw(r, view, time = 0, { above = false, soft = false, reveal = [] } = {}) {
    const ts = this.tileSize;
    const x0 = Math.max(0, Math.floor(view.x / ts));
    const y0 = Math.max(0, Math.floor(view.y / ts));
    const x1 = Math.min(this.width - 1, Math.floor((view.x + view.w) / ts));
    const y1 = Math.min(this.height - 1, Math.floor((view.y + view.h) / ts));
    const ground = this.layers[0];
    for (const layer of this.layers) {
      if (layer.above !== above) continue;
      for (let ty = y0; ty <= y1; ty++) {
        for (let tx = x0; tx <= x1; tx++) {
          const id = layer.data[ty * this.width + tx];
          if (!id) continue;
          this.tileset.draw(r, id, tx * ts, ty * ts, time, variantAt(tx, ty));
          if (layer !== ground) continue;
          const def = this.tileset.def(id);
          // Liseré
          if (def.props.edge) {
            const other = (nx, ny) => this.inBounds(nx, ny) && this.tileset.def(ground.data[ny * this.width + nx]).name !== def.name;
            const c = def.props.edge;
            if (other(tx, ty - 1)) r.rect(tx * ts, ty * ts, ts, 1, c);
            if (other(tx, ty + 1)) r.rect(tx * ts, ty * ts + ts - 1, ts, 1, c);
            if (other(tx - 1, ty)) r.rect(tx * ts, ty * ts, 1, ts, c);
            if (other(tx + 1, ty)) r.rect(tx * ts + ts - 1, ty * ts, 1, ts, c);
          }
          // Ombre portée par la tuile du dessus (et, en ombres douces, par celle de gauche :
          // le soleil vient d'en haut à gauche)
          if (!def.solid) {
            const occ = (nx, ny) => this.inBounds(nx, ny) && !!this.tileset.def(ground.data[ny * this.width + nx]).props.shadow;
            if (soft && occ(tx, ty - 1)) {
              // Mur (d'autres obstacles à côté) : bande d'ombre ; obstacle isolé (arbre, rocher) : ombre ronde.
              const wall = occ(tx - 1, ty - 1) || occ(tx + 1, ty - 1);
              this._softShadow(r, tx, ty, wall ? 'band' : 'blob');
            }
            // Face d'un mur vertical à gauche : ombre portée vers la droite.
            if (soft && occ(tx - 1, ty) && (occ(tx - 1, ty - 1) || occ(tx - 1, ty + 1))) this._softShadow(r, tx, ty, 'side', occ(tx, ty - 1));
            if (!soft && occ(tx, ty - 1)) {
              r.rect(tx * ts, ty * ts, ts, 3, 'rgba(0,0,0,0.22)');
              r.rect(tx * ts, ty * ts, ts, 1, 'rgba(0,0,0,0.18)');
            }
          }
        }
      }
    }
    if (above && this.tileset.crowns?.size) this._drawCrowns(r, x0, x1, y0, Math.min(this.height - 1, y1 + 1), time, reveal);
  }

  /** Cimes des arbres : sur la case au-dessus de l'arbre, semi-transparentes si quelqu'un est derrière. */
  _drawCrowns(r, x0, x1, y0, y1, time, reveal) {
    const ts = this.tileSize;
    const ground = this.layers[0];
    for (let ty = Math.max(1, y0); ty <= y1; ty++) {
      for (let tx = x0; tx <= x1; tx++) {
        const id = ground.data[ty * this.width + tx];
        if (!this.tileset.hasCrown(id)) continue;
        const x = tx * ts;
        const y = (ty - 1) * ts;
        const behind = reveal.some((q) => q.x < x + ts && q.x + q.w > x && q.y < y + ts && q.y + q.h > y);
        const draw = () => this.tileset.drawCrown(r, id, x, y, time, variantAt(tx, ty));
        if (behind) r.withAlpha(0.45, draw);
        else draw();
      }
    }
  }

  /**
   * Ombre douce sur une case de sol : 'band' sous un mur, 'blob' sous un obstacle isolé,
   * 'side' à droite d'un mur. Les dégradés sont créés une fois, puis déplacés.
   */
  _softShadow(r, tx, ty, kind, underWall = false) {
    const c = r.ctx;
    const ts = this.tileSize;
    if (this._aoCtx !== c) {
      this._aoCtx = c;
      const band = c.createLinearGradient(0, 0, 0, 9);
      band.addColorStop(0, 'rgba(18,14,34,0.4)');
      band.addColorStop(0.35, 'rgba(18,14,34,0.18)');
      band.addColorStop(1, 'rgba(18,14,34,0)');
      const side = c.createLinearGradient(0, 0, 6, 0);
      side.addColorStop(0, 'rgba(18,14,34,0.24)');
      side.addColorStop(1, 'rgba(18,14,34,0)');
      const blob = c.createRadialGradient(0, 0, 0, 0, 0, 7);
      blob.addColorStop(0, 'rgba(18,14,34,0.38)');
      blob.addColorStop(0.5, 'rgba(18,14,34,0.18)');
      blob.addColorStop(1, 'rgba(18,14,34,0)');
      this._ao = { band, side, blob };
    }
    c.save();
    c.translate(tx * ts, ty * ts);
    if (kind === 'band') (c.fillStyle = this._ao.band), c.fillRect(0, 0, ts, 9);
    else if (kind === 'side') (c.fillStyle = this._ao.side), c.fillRect(0, underWall ? 3 : 0, 6, ts - (underWall ? 3 : 0));
    else {
      // ombre ronde, un peu à droite (soleil en haut à gauche), aplatie
      c.translate(ts / 2 + 2, 0);
      c.scale(1.25, 0.6);
      c.fillStyle = this._ao.blob;
      c.fillRect(-7, 0, 14, 7);
    }
    c.restore();
  }
}
