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
   * @param {{frameW:number, frameH:number, frames:string[], paint:(ctx, name:string, index:number)=>void}} spec
   */
  static paint({ frameW, frameH, frames, paint }) {
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
      });
    }
    return new SpriteSheet(canvas, frameW, frameH, frames);
  }
}
