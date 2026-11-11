import { createCanvas } from './canvas.js';
import { paintContext, DISPLAY_PROFILES } from './display.js';

// Traitements d'images pour le pixel art, selon le profil d'affichage.
// Les fonctions « pures » travaillent sur des objets {width, height, data} (comme
// ImageData) : elles sont testables sans navigateur.

const px = (img, x, y) => {
  const k = (y * img.width + x) * 4;
  const d = img.data;
  return ((d[k] << 24) | (d[k + 1] << 16) | (d[k + 2] << 8) | d[k + 3]) >>> 0;
};

const blank = (w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(w * h * 4) });

/** Agrandissement ×k sans lissage (chaque pixel devient un carré k×k). */
export function scaleNearest(src, k) {
  const out = blank(src.width * k, src.height * k);
  for (let y = 0; y < out.height; y++) {
    for (let x = 0; x < out.width; x++) {
      const s = ((Math.floor(y / k) * src.width + Math.floor(x / k)) * 4);
      const o = (y * out.width + x) * 4;
      out.data.set(src.data.subarray(s, s + 4), o);
    }
  }
  return out;
}

/**
 * Agrandissement ×2 « Scale2x » (EPX) : les escaliers des diagonales sont arrondis,
 * les aplats et les lignes droites restent nets. Idéal pour du pixel art.
 */
export function scale2x(src) {
  const w = src.width;
  const h = src.height;
  const out = blank(w * 2, h * 2);
  const get = (x, y) => px(src, Math.min(w - 1, Math.max(0, x)), Math.min(h - 1, Math.max(0, y)));
  const put = (x, y, v) => {
    const o = (y * out.width + x) * 4;
    out.data[o] = v >>> 24;
    out.data[o + 1] = (v >>> 16) & 255;
    out.data[o + 2] = (v >>> 8) & 255;
    out.data[o + 3] = v & 255;
  };
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = get(x, y);
      const a = get(x, y - 1);
      const b = get(x + 1, y);
      const c = get(x - 1, y);
      const d = get(x, y + 1);
      let e0 = p, e1 = p, e2 = p, e3 = p;
      if (c === a && c !== d && a !== b) e0 = a;
      if (a === b && a !== c && b !== d) e1 = b;
      if (d === c && d !== b && c !== a) e2 = c;
      if (b === d && b !== a && d !== c) e3 = d;
      put(x * 2, y * 2, e0);
      put(x * 2 + 1, y * 2, e1);
      put(x * 2, y * 2 + 1, e2);
      put(x * 2 + 1, y * 2 + 1, e3);
    }
  }
  return out;
}

const hexRgb = (color) => {
  const hex = color.replace('#', '');
  const full = hex.length === 3 ? [...hex].map((ch) => ch + ch).join('') : hex;
  return [0, 2, 4].map((k) => parseInt(full.slice(k, k + 2), 16));
};

/**
 * Contour autour des pixels opaques (alpha ≥ 160 ; les ombres translucides sont ignorées).
 * `thickness` en pixels d'image : 1 = fin, 3 = épais (mobile).
 */
export function outlineImage(img, color, thickness = 1) {
  const { width: w, height: h, data: d } = img;
  const solid = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) solid[i] = d[i * 4 + 3] >= 160 ? 1 : 0;
  const [r, g, b] = hexRgb(color);
  const t = Math.max(1, Math.round(thickness));
  const r2 = t * t + 0.5;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (solid[y * w + x]) continue;
      let near = false;
      for (let j = -t; j <= t && !near; j++) {
        for (let i = -t; i <= t; i++) {
          // épaisseur 1 : voisins directs seulement (comme le contour d'origine)
          if (t === 1 ? Math.abs(i) + Math.abs(j) !== 1 : i * i + j * j > r2) continue;
          const nx = x + i;
          const ny = y + j;
          if (nx >= 0 && ny >= 0 && nx < w && ny < h && solid[ny * w + nx]) {
            near = true;
            break;
          }
        }
      }
      if (!near) continue;
      const k = (y * w + x) * 4;
      d[k] = r;
      d[k + 1] = g;
      d[k + 2] = b;
      d[k + 3] = 255;
    }
  }
  return img;
}

/** Contraste et saturation (1 = inchangé). Rend les couleurs plus franches sur petit écran. */
export function adjustColors(img, { contrast = 1, saturation = 1 } = {}) {
  if (contrast === 1 && saturation === 1) return img;
  const d = img.data;
  for (let k = 0; k < d.length; k += 4) {
    if (!d[k + 3]) continue;
    let r = d[k], g = d[k + 1], b = d[k + 2];
    const l = 0.299 * r + 0.587 * g + 0.114 * b;
    r = l + (r - l) * saturation;
    g = l + (g - l) * saturation;
    b = l + (b - l) * saturation;
    d[k] = (r - 128) * contrast + 128;
    d[k + 1] = (g - 128) * contrast + 128;
    d[k + 2] = (b - 128) * contrast + 128;
  }
  return img;
}

/**
 * Finition « haute définition » : lumière douce venant d'en haut à gauche, grain très fin,
 * et léger assombrissement au bord des silhouettes (volume). Déterministe.
 * @param {'tile'|'sprite'} kind
 */
export function shadeImage(img, kind = 'tile', seed = 1) {
  const { width: w, height: h, data: d } = img;
  const alpha = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : d[(y * w + x) * 4 + 3]);
  const factors = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const k = (y * w + x) * 4;
      if (d[k + 3] < 160) continue;
      const u = (x + 0.5) / w;
      const v = (y + 0.5) / h;
      let f = 1 + (kind === 'tile' ? 0.06 : 0.1) * (1 - u - v);
      let n = Math.imul((x + 1) * 374761393 + (y + 1) * 668265263, seed | 1);
      n = Math.imul(n ^ (n >>> 13), 1274126177);
      f += (((n >>> 16) & 255) / 255 - 0.5) * (kind === 'tile' ? 0.05 : 0.025);
      if (kind === 'sprite' && (alpha(x - 1, y) < 160 || alpha(x + 1, y) < 160 || alpha(x, y + 1) < 160)) f *= 0.88;
      factors[y * w + x] = f;
    }
  }
  for (let i = 0; i < w * h; i++) {
    const f = factors[i];
    if (!f) continue;
    const k = i * 4;
    d[k] *= f;
    d[k + 1] *= f;
    d[k + 2] *= f;
  }
  return img;
}

/**
 * Fabrique une planche d'images (tuiles ou sprites) pour un profil d'affichage.
 * Chaque case est dessinée par `paint(ctx, i)` sur une grille de cellW×cellH « pixels de jeu »,
 * ou par `paintHD(ctx, i)` directement à la résolution fine (si le profil le permet et
 * que la case en a un). Puis : agrandissement, contour, couleurs, finition.
 *
 * @param {object} o
 * @param {number} o.count  nombre de cases
 * @param {(i:number)=>{col:number,row:number}} o.place  position de la case i dans la planche
 * @param {number} o.cols
 * @param {number} o.rows
 * @param {number} o.cellW  largeur d'une case en pixels de jeu
 * @param {number} o.cellH
 * @param {(ctx, i:number)=>void} o.paint
 * @param {((ctx, i:number)=>boolean)|null} [o.paintHD]  renvoie false si la case n'a pas de version HD
 * @param {string|null} [o.outline]  couleur du contour (sprites)
 * @param {'tile'|'sprite'} [o.kind]
 * @param {object} [o.profile]
 * @returns {{canvas: any, detail: number}}
 */
export function buildAtlas({ count, place, cols, rows, cellW, cellH, paint, paintHD = null, outline = null, kind = 'sprite', profile = DISPLAY_PROFILES.classic, seed = 1 }) {
  const k = profile.detail || 1;
  const canvas = createCanvas(cols * cellW * k, rows * cellH * k);
  if (!canvas) return { canvas: null, detail: k };
  const ctx = canvas.getContext('2d');
  const small = createCanvas(cellW, cellH);
  const sctx = small.getContext('2d', { willReadFrequently: true });
  const big = createCanvas(cellW * k, cellH * k);
  const bctx = big.getContext('2d', { willReadFrequently: true });
  const prev = paintContext.profile;
  paintContext.profile = profile;
  try {
    for (let i = 0; i < count; i++) {
      const { col, row } = place(i);
      let img = null;
      if (k > 1 && profile.hd && paintHD) {
        bctx.clearRect(0, 0, big.width, big.height);
        bctx.save();
        const done = paintHD(bctx, i) !== false;
        bctx.restore();
        if (done) img = bctx.getImageData(0, 0, big.width, big.height);
      }
      if (!img) {
        sctx.clearRect(0, 0, cellW, cellH);
        sctx.save();
        paint(sctx, i);
        sctx.restore();
        img = sctx.getImageData(0, 0, cellW, cellH);
        if (k > 1) img = k === 2 && profile.smooth ? scale2x(img) : scaleNearest(img, k);
      }
      if (outline) outlineImage(img, outline, k > 1 ? profile.outline : 1);
      adjustColors(img, profile);
      if (profile.shading) shadeImage(img, kind, seed + i * 31);
      const out = img instanceof ImageDataCtor() ? img : toImageData(ctx, img);
      ctx.putImageData(out, col * cellW * k, row * cellH * k);
    }
  } finally {
    paintContext.profile = prev;
  }
  return { canvas, detail: k };
}

const ImageDataCtor = () => (typeof ImageData !== 'undefined' ? ImageData : class {});
function toImageData(ctx, img) {
  const out = ctx.createImageData(img.width, img.height);
  out.data.set(img.data);
  return out;
}
