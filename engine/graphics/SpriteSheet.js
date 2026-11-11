import { createCanvas } from './canvas.js';

// Planche de sprites : une image découpée en cases de taille fixe,
// adressables par index ou par nom ("player_down_0").
export class SpriteSheet {
  constructor(image, frameW, frameH, names = []) {
    this.image = image;
    this.frameW = frameW;
    this.frameH = frameH;
    this.cols = image ? Math.max(1, Math.floor(image.width / frameW)) : 1;
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

  draw(r, frame, x, y, { flipX = false } = {}) {
    const i = this.index(frame);
    const sx = (i % this.cols) * this.frameW;
    const sy = Math.floor(i / this.cols) * this.frameH;
    r.image(this.image, sx, sy, this.frameW, this.frameH, x, y, this.frameW, this.frameH, flipX);
  }

  /**
   * Génère une planche par programme (aucun fichier image requis).
   * @param {{frameW:number, frameH:number, frames:string[], paint:(ctx, name:string, index:number)=>void, outline?:string}} spec
   *   outline : couleur d'un contour d'1 pixel ajouté autour des formes (lisibilité "rétro")
   */
  static paint({ frameW, frameH, frames, paint, outline = null }) {
    const cols = Math.min(frames.length, 16);
    const rows = Math.ceil(frames.length / cols);
    const canvas = createCanvas(cols * frameW, rows * frameH);
    if (canvas) {
      const ctx = canvas.getContext('2d');
      frames.forEach((name, i) => {
        ctx.save();
        ctx.translate((i % cols) * frameW, Math.floor(i / cols) * frameH);
        ctx.beginPath();
        ctx.rect(0, 0, frameW, frameH);
        ctx.clip();
        paint(ctx, name, i);
        ctx.restore();
        if (outline) addOutline(ctx, (i % cols) * frameW, Math.floor(i / cols) * frameH, frameW, frameH, outline);
      });
    }
    return new SpriteSheet(canvas, frameW, frameH, frames);
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
