// GRANDS ARBRES SUR 2 CASES — le tronc est sur la case de l'arbre (celle qui bloque le passage),
// la cime déborde sur la case du dessus et passe DEVANT les personnages (voir `tall` dans
// engine/theme/ThemeRegistry.js). Quand le héros passe derrière, la cime devient transparente.
//
// Chaque arbre est dessiné une seule fois dans un repère de 16 × 32 pixels de jeu (sol en y = 32),
// avec un facteur `s` : 1 = pixel art (mobile), 2 = haute définition (PC, 32 × 64).
import { disc, ellipse } from '../../demos/02-gameplay/hd.js';

/** Outils de dessin dans le repère 16 × 32, multipliés par s. */
const pen = (c, s) => ({
  rect: (x, y, w, h, col) => ((c.fillStyle = col), c.fillRect(Math.round(x * s), Math.round(y * s), Math.max(1, Math.round(w * s)), Math.max(1, Math.round(h * s)))),
  disc: (x, y, r, col) => disc(c, Math.round(x * s), Math.round(y * s), Math.max(1, Math.round(r * s)), col),
  ell: (x, y, rx, ry, col) => ellipse(c, Math.round(x * s), Math.round(y * s), Math.max(1, Math.round(rx * s)), Math.max(1, Math.round(ry * s)), col),
  dot: (x, y, col) => ((c.fillStyle = col), c.fillRect(Math.round(x * s), Math.round(y * s), 1, 1)),
});

/** Feuillage en boules : ombre, masse, lumière en haut à gauche. */
function foliage(p, s, blobs, [dark, mid, light, spark], rng) {
  for (const [x, y, r] of blobs) p.disc(x + 0.5, y + 0.7, r, dark);
  for (const [x, y, r] of blobs) p.disc(x, y, r - 0.5, mid);
  for (const [x, y, r] of blobs) p.disc(x - r / 3, y - r / 3, Math.max(1, r / 2.6), light);
  // petites feuilles claires (plus nombreuses en HD)
  for (let i = 0; i < (s > 1 ? 14 : 5); i++) {
    const [x, y, r] = blobs[i % blobs.length];
    const a = rng() * Math.PI * 2;
    const d = rng() * (r - 1);
    p.dot(x + Math.cos(a) * d, y + Math.sin(a) * d, i % 3 ? light : spark);
  }
}

/** Tronc avec racines et ombre au sol. */
function trunk(p, s, x, top, w, [bark, light, dark]) {
  p.ell(8.5, 30.5, 7, 1.6, 'rgba(0,0,0,.28)');
  p.rect(x, top, w, 31 - top, bark);
  p.rect(x, top, 1, 31 - top, light);
  p.rect(x + w - 1, top, 1, 31 - top, dark);
  p.rect(x - 1, 29, w + 2, 2, bark);
  if (s > 1) for (let y = top + 2; y < 29; y += 3) p.rect(x + 1.5, y, 1, 1.5, dark);
}

// ------------------------------------------------------------------ les arbres
/** Prébois : grand arbre rond du village. */
export function villageTree(c, { rng, variant = 0 }, s = 1) {
  const p = pen(c, s);
  trunk(p, s, 6.5, 18, 3, ['#5a3a1c', '#7a5230', '#3e2812']);
  // deux branches qui partent du tronc
  p.rect(5, 19, 2, 1, '#5a3a1c');
  p.rect(9.5, 20, 2, 1, '#5a3a1c');
  const blobs = variant
    ? [[5, 13, 5], [11, 12, 5], [8, 7, 6], [8, 16, 4.5], [4, 9, 3.5]]
    : [[4.5, 12, 5], [11.5, 13, 5], [8, 7.5, 6], [7.5, 16, 4.5], [12, 8, 3.5]];
  foliage(p, s, blobs, ['#1d4a1a', '#2f7a2a', '#5aaf48', '#8ad06a'], rng);
}

/** Forêt des Murmures : arbre sombre, haut et touffu. */
export function forestTree(c, { rng, variant = 0 }, s = 1) {
  const p = pen(c, s);
  trunk(p, s, 6, 19, 4, ['#4a2e16', '#6e4a26', '#2e1c0c']);
  const blobs = variant
    ? [[8, 4, 4.5], [4.5, 9, 5], [11.5, 9, 5], [8, 13, 6], [4, 17, 4], [12, 17, 4]]
    : [[8, 3.5, 4], [5, 8, 5], [11, 9, 5.5], [7, 13.5, 6], [12.5, 16, 4], [3.5, 16, 4]];
  foliage(p, s, blobs, ['#0e2e12', '#24622a', '#3c8a3a', '#6cbf5a'], rng);
}

/** Mont Givré : sapin enneigé en étages. */
export function snowPine(c, { rng }, s = 1) {
  const p = pen(c, s);
  p.ell(8.5, 30.5, 6, 1.5, 'rgba(40,60,100,.25)');
  p.rect(7, 25, 2, 6, '#6b4a33');
  p.rect(7, 25, 1, 6, '#8a6448');
  // étages du haut vers le bas : [haut, bas, demi-largeur]
  const tiers = [[1, 8, 3], [5, 14, 4.8], [10, 20, 6.2], [15, 26, 7.5]];
  for (const [top, bot, hw] of tiers) {
    for (let y = top; y < bot; y += 1 / s) {
      const w = (hw * (y - top)) / (bot - top) + 0.5;
      p.rect(8 - w, y, w * 2, 1 / s, y > bot - 1.5 ? '#1b4a3c' : '#2c6e5a');
      p.rect(8 - w, y, w * 0.9, 1 / s, '#3a8a70'); // côté éclairé (gauche)
    }
    // neige posée sur l'étage
    for (let y = top; y < top + (bot - top) * 0.45; y += 1 / s) {
      const w = (hw * (y - top)) / (bot - top) + 0.3;
      p.rect(8 - w, y, w * 1.4, 1 / s, '#ffffff');
    }
    p.rect(8 - hw * 0.8, bot - 2, hw * 0.6, 1, '#e8f2ff');
  }
  if (s > 1) for (let i = 0; i < 6; i++) p.dot(3 + rng() * 10, 4 + rng() * 20, '#ffffff');
}

/** Désert : palmier au tronc courbé, palmes et noix de coco. */
export function palmTree(c, o, s = 1) {
  const p = pen(c, s);
  p.ell(9, 30.5, 6, 1.5, 'rgba(0,0,0,.25)');
  for (let y = 9; y < 31; y += 1 / s) {
    const x = 7 + Math.sin((31 - y) / 9) * 2.2;
    const ring = Math.floor(y * 1.5) % 3 === 0;
    p.rect(x, y, 2.6, 1 / s, ring ? '#7a4a20' : '#9a6a3a');
    p.rect(x, y, 0.8, 1 / s, '#b8844a');
  }
  const top = [9.4, 8.5];
  const fronds = [[-8, 5], [8, 5], [-7, -1], [7, -1], [-2, -6], [3, -6]];
  for (const [i, [dx, dy]] of fronds.entries()) {
    for (let k = 0; k <= 10; k++) {
      const t = k / 10;
      const x = top[0] + dx * t;
      const y = top[1] + dy * t - Math.sin(t * Math.PI) * 2.5 + t * t * 2;
      const w = 1.6 * (1 - t * 0.5);
      p.rect(x - w / 2, y - w / 2, w, w, k > 6 ? '#3a9a3a' : i % 2 ? '#2e7a2e' : '#348a34');
      if (s > 1 && k % 2) p.rect(x - w / 2, y + w / 2, w, 0.5, '#1e5a1e');
    }
  }
  p.disc(8.5, 10, 1.3, '#6a4220');
  p.disc(10.6, 10.4, 1.3, '#8a5a2a');
  if (s > 1) p.dot(8, 9.5, '#c09060');
}

/** Volcan Noir : grand arbre mort, branches tordues. */
export function deadTree(c, { rng }, s = 1) {
  const p = pen(c, s);
  const bark = '#1e1614';
  const light = '#3a2c28';
  p.ell(8.5, 30.5, 6, 1.4, 'rgba(0,0,0,.35)');
  p.rect(7, 8, 2.4, 23, bark);
  p.rect(7, 8, 0.8, 23, light);
  p.rect(6, 29, 4.5, 2, bark);
  const branch = (pts, w) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[i + 1];
      const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * s * 2);
      for (let k = 0; k <= n; k++) p.rect(x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n, w, w, bark);
    }
  };
  branch([[8, 18], [4, 14], [2, 9], [2.5, 6]], 1.3);
  branch([[4, 14], [5.5, 10]], 1);
  branch([[9, 15], [12, 11], [14, 7]], 1.3);
  branch([[12, 11], [11, 7]], 1);
  branch([[8, 9], [6.5, 4], [7.5, 1.5]], 1.2);
  branch([[9, 10], [11, 5]], 1);
  // braises au bout de quelques branches
  for (const [x, y] of [[2.5, 6], [14, 7], [7.5, 1.5]]) p.dot(x, y, '#ff6a1a');
  if (s > 1) for (let i = 0; i < 4; i++) p.dot(7.4, 12 + i * 4 + rng() * 2, light);
}

/**
 * Description `tall` d'une tuile : le sol (dessin de la tuile `groundTile`), puis l'arbre.
 * @param {object} tiles  les tuiles du thème (pour dessiner le sol sous l'arbre)
 */
export function tallTree(tiles, groundTile, draw) {
  const ground = tiles[groundTile];
  return {
    ground: (c, o) => ground.paint(c, { ...o, variant: 0 }),
    groundHD: ground.paintHD ? (c, o) => ground.paintHD(c, { ...o, variant: 0 }) : null,
    paint: (c, o) => draw(c, o, 1),
    paintHD: (c, o) => draw(c, o, o.k),
  };
}
