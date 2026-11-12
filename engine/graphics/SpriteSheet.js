import { buildAtlas } from './pixelart.js';
import { DISPLAY_PROFILES } from './display.js';

// Planche de sprites : une image découpée en cases de taille fixe,
// adressables par index ou par nom ("player_down_0").
// `detail` : pixels d'image par pixel de jeu (2 = haute définition). frameW/frameH
// restent en pixels de jeu : la logique ne voit aucune différence.
export class SpriteSheet {
  constructor(image, frameW, frameH, names = [], detail = 1) {
    this.image = image;
    this.frameW = frameW;
    this.frameH = frameH;
    this.detail = detail;
    this.cols = image ? Math.max(1, Math.floor(image.width / (frameW * detail))) : 1;
    this.names = new Map(names.map((n, i) => [n, i]));
  }

  index(frame) {
    if (typeof frame === 'number') return frame;
    const i = this.names.get(frame);
    if (i === undefined) throw new Error(`SpriteSheet : image "${frame}" inconnue`);
    return i;
  }

  has(name) {
    return this.names.has(name);
  }

  /** Dessine une image ; `scale` l'agrandit (ex. icônes du bandeau sur mobile). */
  draw(r, frame, x, y, { flipX = false, scale = 1 } = {}) {
    const i = this.index(frame);
    const k = this.detail;
    const sx = (i % this.cols) * this.frameW * k;
    const sy = Math.floor(i / this.cols) * this.frameH * k;
    r.image(this.image, sx, sy, this.frameW * k, this.frameH * k, x, y, this.frameW * scale, this.frameH * scale, flipX);
  }

  /**
   * Génère une planche par programme (aucun fichier image requis).
   * @param {{frameW:number, frameH:number, frames:string[], paint:(ctx, name:string, index:number)=>void,
   *          paintHD?:(ctx, name:string, index:number, k:number)=>boolean|void, outline?:string}} spec
   *   paint   : dessin sur la grille du jeu (frameW×frameH)
   *   paintHD : dessin fin (frameW×k par frameH×k), utilisé sur PC ; renvoyer false = pas de version HD
   *   outline : couleur d'un contour ajouté autour des formes (lisibilité "rétro"),
   *             ou fonction (name, hd) => couleur | null (null : pas de contour pour cette image)
   * @param {object} [profile] profil d'affichage (voir display.js)
   */
  static paint({ frameW, frameH, frames, paint, paintHD = null, outline = null }, profile = DISPLAY_PROFILES.classic) {
    const cols = Math.min(frames.length, 16);
    const rows = Math.ceil(frames.length / cols);
    const { canvas, detail } = buildAtlas({
      count: frames.length,
      place: (i) => ({ col: i % cols, row: Math.floor(i / cols) }),
      cols,
      rows,
      cellW: frameW,
      cellH: frameH,
      paint: (ctx, i) => paint(ctx, frames[i], i),
      paintHD: paintHD && ((ctx, i) => paintHD(ctx, frames[i], i, profile.detail)),
      outline: typeof outline === 'function' ? (i, hd) => outline(frames[i], hd) : outline,
      kind: 'sprite',
      profile,
    });
    return new SpriteSheet(canvas, frameW, frameH, frames, detail);
  }
}

/** Ajoute un contour autour des pixels opaques d'une case (les ombres translucides sont ignorées). */
export function addOutline(ctx, x, y, w, h, color) {
  const img = ctx.getImageData(x, y, w, h);
  const d = img.data;
  const solid = (i, j) => i >= 0 && j >= 0 && i < w && j < h && d[(j * w + i) * 4 + 3] >= 160;
  const hex = color.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((k) => parseInt(hex.slice(k, k + 2), 16));
  const marks = [];
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      if (solid(i, j)) continue;
      if (solid(i - 1, j) || solid(i + 1, j) || solid(i, j - 1) || solid(i, j + 1)) marks.push((j * w + i) * 4);
    }
  }
  for (const k of marks) {
    d[k] = r;
    d[k + 1] = g;
    d[k + 2] = b;
    d[k + 3] = 255;
  }
  ctx.putImageData(img, x, y);
}
