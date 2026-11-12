// TRANSITIONS ENTRE TERRAINS (« autotiling » sans images à dessiner).
// Chaque terrain a une priorité (`props.blend`) : le plus haut déborde sur le plus bas avec un bord
// irrégulier (l'herbe mord sur le chemin, le sable et l'herbe forment une berge sur l'eau...).
// Les morceaux de bord sont découpés une seule fois dans l'atlas des tuiles, puis mis en cache.
//
// Morceaux, sur la case qui REÇOIT le débordement :
//   n, e, s, w        : bande le long d'un côté (2 dessins par côté, pour éviter la répétition)
//   ne, nw, se, sw    : coin extérieur (seule la case en diagonale est d'un terrain plus haut)
//   nei, nwi, sei, swi: coin intérieur arrondi (deux côtés voisins plus hauts)
import { createCanvas } from '../graphics/canvas.js';

const BASE = 3; // profondeur du bord aux extrémités des côtés (en pixels de jeu) : les cases se raccordent
const INNER = 6.5; // taille du coin intérieur arrondi

/** Profondeur du bord le long d'un côté (t de 0 à 1), irrégulière mais égale à BASE aux deux bouts. */
function depth(t, seed) {
  const wave = 1.7 * Math.sin(Math.PI * 2 * (t * 1.15 + seed * 0.37)) + 0.9 * Math.sin(Math.PI * 2 * (t * 2.7 + seed * 0.61));
  return Math.max(1.2, Math.min(6, BASE + Math.sin(Math.PI * t) * wave));
}

/** Le pixel (x, y) (en pixels de jeu, case de 16) appartient-il au morceau ? */
function inPiece(piece, x, y, ts, seed) {
  const far = ts;
  switch (piece) {
    case 'n': return y < depth(x / ts, seed);
    case 's': return y > far - depth(x / ts, seed + 2);
    case 'w': return x < depth(y / ts, seed + 4);
    case 'e': return x > far - depth(y / ts, seed + 6);
    case 'nw': return Math.hypot(x, y) < BASE;
    case 'ne': return Math.hypot(far - x, y) < BASE;
    case 'sw': return Math.hypot(x, far - y) < BASE;
    case 'se': return Math.hypot(far - x, far - y) < BASE;
    default: {
      // coin intérieur : le carré du coin, moins un quart de disque (le coin devient arrondi)
      const dx = piece[1] === 'w' ? x : far - x;
      const dy = piece[0] === 'n' ? y : far - y;
      return dx < INNER && dy < INNER && Math.hypot(INNER - dx, INNER - dy) > INNER - BASE;
    }
  }
}

export class TerrainBlend {
  /** @param {import('./Tileset.js').Tileset} tileset */
  constructor(tileset) {
    this.tileset = tileset;
    this.cache = new Map();
  }

  /**
   * Morceau de bord, à la résolution de l'atlas : la texture du terrain `id` découpée en forme,
   * avec un liseré (plus sombre, ou couleur `edge` de la case qui reçoit : l'écume sur l'eau).
   * Renvoie null hors navigateur.
   */
  piece(id, piece, variant = 0, edge = null) {
    const key = `${id}|${piece}|${variant}|${edge}`;
    let canvas = this.cache.get(key);
    if (canvas !== undefined) return canvas;
    canvas = this._build(id, piece, variant, edge);
    this.cache.set(key, canvas);
    return canvas;
  }

  _build(id, piece, variant, edge) {
    const ts = this.tileset;
    const k = ts.detail;
    const s = ts.tileSize * k;
    const canvas = ts.image && createCanvas(s, s);
    const c = canvas?.getContext('2d');
    if (!c?.getImageData) return null;
    c.drawImage(ts.image, 0, id * s, s, s, 0, 0, s, s);
    const img = c.getImageData(0, 0, s, s);
    const d = img.data;
    const seed = variant * 1.7 + id * 0.13;
    const mask = new Uint8Array(s * s);
    for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) mask[y * s + x] = inPiece(piece, (x + 0.5) / k, (y + 0.5) / k, ts.tileSize, seed) ? 1 : 0;
    // Distance (en pixels d'image, carrée) au bord du morceau, en ne regardant que l'intérieur de la case :
    // le liseré suit la découpe, pas les bords de la case.
    const near = (x, y, want) => {
      for (let j = -k; j <= k; j++) {
        for (let i = -k; i <= k; i++) {
          const nx = x + i;
          const ny = y + j;
          if (nx < 0 || ny < 0 || nx >= s || ny >= s) continue;
          if (mask[ny * s + nx] === want) return true;
        }
      }
      return false;
    };
    const [er, eg, eb] = edge ? hex(edge) : [0, 0, 0];
    for (let y = 0; y < s; y++) {
      for (let x = 0; x < s; x++) {
        const i = (y * s + x) * 4;
        if (mask[y * s + x]) {
          // liseré foncé côté terrain qui déborde (sauf s'il y a de l'écume de l'autre côté)
          if (!edge && near(x, y, 0)) for (let ch = 0; ch < 3; ch++) d[i + ch] = Math.round(d[i + ch] * 0.72);
        } else if (edge && near(x, y, 1)) {
          d[i] = er;
          d[i + 1] = eg;
          d[i + 2] = eb;
          d[i + 3] = 215;
        } else d[i + 3] = 0;
      }
    }
    c.putImageData(img, 0, 0);
    return canvas;
  }
}

function hex(col) {
  const n = parseInt(col.slice(1, 7), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export { inPiece as _inPiece, depth as _depth };
