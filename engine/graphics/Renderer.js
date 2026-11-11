// Dessin 2D. Tout est exprimé en pixels LOGIQUES (ex. 256x192) ; le renderer
// multiplie par un facteur entier pour que le pixel art reste net, tandis que
// le texte est rendu en haute résolution (lisible, accents compris).

export class Renderer {
  constructor(canvas, width, height) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = width;
    this.height = height;
    this.scale = 1;
    this.defaultFont = "ui-monospace, Menlo, Consolas, 'Courier New', monospace";
  }

  resize(scale) {
    this.scale = scale;
    this.canvas.width = this.width * scale;
    this.canvas.height = this.height * scale;
  }

  /** À appeler au début de chaque image. */
  begin() {
    const c = this.ctx;
    c.setTransform(this.scale, 0, 0, this.scale, 0, 0);
    c.imageSmoothingEnabled = false;
    c.globalAlpha = 1;
  }

  clear(color = '#000') {
    this.rect(0, 0, this.width, this.height, color);
  }

  /**
   * Passe en coordonnées "monde" : tout ce qui est dessiné ensuite est décalé
   * par la caméra et découpé à la zone `viewport` de l'écran.
   */
  pushWorld(camera, viewport = { x: 0, y: 0, w: this.width, h: this.height }) {
    const c = this.ctx;
    c.save();
    c.beginPath();
    c.rect(viewport.x, viewport.y, viewport.w, viewport.h);
    c.clip();
    const cx = Math.round(camera.x + (camera.shakeX || 0));
    const cy = Math.round(camera.y + (camera.shakeY || 0));
    c.translate(viewport.x - cx, viewport.y - cy);
  }

  popWorld() {
    this.ctx.restore();
  }

  rect(x, y, w, h, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, w, h);
  }

  /** Contour d'1 pixel logique, net. */
  strokeRect(x, y, w, h, color, t = 1) {
    this.rect(x, y, w, t, color);
    this.rect(x, y + h - t, w, t, color);
    this.rect(x, y, t, h, color);
    this.rect(x + w - t, y, t, h, color);
  }

  image(img, sx, sy, sw, sh, dx, dy, dw = sw, dh = sh, flipX = false) {
    if (!img) return;
    const c = this.ctx;
    dx = Math.round(dx);
    dy = Math.round(dy);
    if (flipX) {
      c.save();
      c.translate(dx + dw, dy);
      c.scale(-1, 1);
      c.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh);
      c.restore();
    } else c.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
  }

  _font(size, font, bold) {
    return `${bold ? 'bold ' : ''}${size}px ${font || this.defaultFont}`;
  }

  text(str, x, y, { color = '#fff', size = 8, align = 'left', baseline = 'top', font, bold = false, shadow } = {}) {
    const c = this.ctx;
    c.font = this._font(size, font, bold);
    c.textAlign = align;
    c.textBaseline = baseline;
    if (shadow) {
      c.fillStyle = shadow;
      c.fillText(str, x + 1, y + 1);
    }
    c.fillStyle = color;
    c.fillText(str, x, y);
  }

  measure(str, size = 8, font, bold = false) {
    this.ctx.font = this._font(size, font, bold);
    return this.ctx.measureText(str).width;
  }

  /** Exécute `fn` avec une opacité donnée. */
  withAlpha(alpha, fn) {
    const c = this.ctx;
    const prev = c.globalAlpha;
    c.globalAlpha = prev * alpha;
    fn();
    c.globalAlpha = prev;
  }
}
