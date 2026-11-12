// ÉCRAN TITRE — une vraie illustration : le royaume d'Iris au lever du jour, son arc-en-ciel,
// Alia la licorne, et le nom du jeu. Dessiné en formes lisses (outils de l'histoire en images),
// à la résolution de l'écran ; tout bouge doucement (nuages, crinière, étincelles).
import { RAINBOW, sky, glow, hills, cloud, mountain, tree, cottage, sparkle, drawAlia, vignette } from '../data/story.js';

const TAU = Math.PI * 2;

/**
 * @param {import('../../engine/index.js').Renderer} r
 * @param {number} t  temps (s)
 * @param {object} o
 * @param {string} o.titleFont  police du nom du jeu
 * @param {string} o.font       police du sous-titre
 * @param {number} o.groundY    hauteur où commence la fenêtre du bas (Alia se tient juste au-dessus)
 */
export function drawTitleArt(r, t, { titleFont, font, groundY }) {
  const c = r.ctx;
  const W = r.width;
  const H = r.height;
  const b = { x: 0, y: 0, w: W, h: H };
  const horizon = Math.min(H * 0.56, groundY - 6);
  c.save();
  sky(c, b, [[0, '#4aa4ee'], [0.45, '#a6dcff'], [0.75, '#ffe6c8'], [1, '#ffd0a8']]);
  // soleil levant
  const sx = W * 0.82;
  const sy = horizon - 30;
  glow(c, sx, sy, 60, 'rgba(255,236,170,.85)');
  c.fillStyle = '#fff4b0';
  c.beginPath();
  c.arc(sx, sy, 10, 0, TAU);
  c.fill();
  // nuages qui passent
  cloud(c, ((t * 5 + W * 0.15) % (W + 90)) - 45, H * 0.3, 0.8, '#ffffff', 0.85);
  cloud(c, ((t * 3 + W * 0.7) % (W + 90)) - 45, H * 0.22, 0.55, '#ffffff', 0.7);
  // arc-en-ciel derrière les montagnes
  c.globalAlpha = 0.75;
  c.lineWidth = 3.2;
  RAINBOW.forEach((col, i) => {
    c.strokeStyle = col;
    c.beginPath();
    c.arc(W * 0.46, horizon + 6, Math.min(W * 0.4, H * 0.5) - i * 3.2, Math.PI, TAU);
    c.stroke();
  });
  c.globalAlpha = 1;
  // montagnes et château
  mountain(c, W * 0.12, horizon, W * 0.3, H * 0.27, '#8a9ab8', '#6f7f9e', '#ffffff');
  mountain(c, W * 0.34, horizon, W * 0.36, H * 0.36, '#96a6c2', '#7888a6', '#ffffff');
  mountain(c, W * 0.56, horizon, W * 0.26, H * 0.22, '#8a9ab8', '#6f7f9e', '#ffffff');
  castle(c, W * 0.74, horizon - 4);
  // collines, arbres, village
  const bh = { x: 0, y: 0, w: W, h: horizon + 26 };
  hills(c, bh, 26, 5, 46, 0.6, '#58b04a', '#3f8f3c');
  [0.05, 0.16, 0.9, 0.97].forEach((fx, i) => tree(c, W * fx, horizon + 2 - (i % 2) * 2, 12 + (i % 2) * 3, '#3f9a3c', '#2a7030'));
  cottage(c, W * 0.6, horizon + 6, 13, '#f4e6c8', '#c0573e');
  cottage(c, W * 0.67, horizon + 9, 11, '#f4e6c8', '#3f6aa8');
  hills(c, b, H - horizon - 18, 4, 38, 2.2, '#78cc58', '#4a9a40');
  // fleurs
  for (let i = 0; i < 22; i++) {
    const fx = (i * 97 + 17) % W;
    const fy = horizon + 22 + ((i * 13) % Math.max(8, H - horizon - 22));
    c.fillStyle = RAINBOW[i % 6];
    c.beginPath();
    c.arc(fx, fy, 1.2 + Math.sin(t * 3 + i) * 0.3, 0, TAU);
    c.fill();
  }
  vignette(c, b, 0.35);
  // Alia, juste au-dessus de la fenêtre du bas, qui se balance doucement, avec des étincelles
  const ax = W < 260 ? W * 0.3 : W * 0.2;
  const ay = groundY - 3 + Math.sin(t * 2) * 0.6;
  const as = Math.max(20, Math.min(30, (groundY - horizon) * 0.9 + 10));
  glow(c, ax, ay - as * 0.6, as * 1.3, 'rgba(255,255,255,.55)');
  drawAlia(c, ax, ay, as, t);
  for (let i = 0; i < 6; i++) {
    const a = t * 0.9 + (i * TAU) / 6;
    const tw = Math.max(0, Math.sin(t * 3 + i * 1.7));
    sparkle(c, ax + Math.cos(a) * as * 0.9, ay - as * 0.6 + Math.sin(a) * as * 0.45, 1.6 + tw * 1.4, RAINBOW[i], 0.4 + tw * 0.6);
  }
  c.restore();
  logo(r, t, { titleFont, font });
}

/** Château aux toits violets, vu de loin. */
function castle(c, x, y) {
  c.fillStyle = '#e4d8f0';
  c.fillRect(x - 10, y - 15, 20, 15);
  c.fillRect(x - 15, y - 21, 6, 21);
  c.fillRect(x + 9, y - 21, 6, 21);
  c.fillStyle = '#c8b8dc';
  c.fillRect(x + 4, y - 15, 6, 15);
  c.fillStyle = '#5a3a6a';
  c.fillRect(x - 2, y - 7, 4, 7);
  c.fillStyle = '#a84a8a';
  for (const [px, py, w] of [[x - 12, y - 21, 5], [x + 12, y - 21, 5], [x, y - 15, 6]]) {
    c.beginPath();
    c.moveTo(px - w, py);
    c.lineTo(px, py - w * 1.8);
    c.lineTo(px + w, py);
    c.fill();
  }
  c.fillStyle = '#ffd35a';
  c.fillRect(x - 0.5, y - 29, 1, 4);
}

/** Le nom du jeu : lettres rondes dorées, contour brun, reflet ; le sous-titre en dessous. */
function logo(r, t, { titleFont, font }) {
  const c = r.ctx;
  const W = r.width;
  const text = 'La Quête d’Alia';
  let size = 26;
  c.font = `bold ${size}px ${titleFont}`;
  while (size > 14 && c.measureText(text).width > W - 24) c.font = `bold ${(size -= 1)}px ${titleFont}`;
  const y = 6 + Math.sin(t * 1.5) * 0.8;
  c.textAlign = 'center';
  c.textBaseline = 'top';
  c.lineJoin = 'round';
  // ombre portée
  c.fillStyle = 'rgba(40,20,10,.45)';
  c.fillText(text, W / 2 + 1.5, y + 2);
  c.strokeStyle = '#4a2410';
  c.lineWidth = 4;
  c.strokeText(text, W / 2, y);
  const g = c.createLinearGradient(0, y + 2, 0, y + size);
  g.addColorStop(0, '#fff8c0');
  g.addColorStop(0.45, '#ffd84a');
  g.addColorStop(1, '#f08a20');
  c.fillStyle = g;
  c.fillText(text, W / 2, y);
  // reflet qui passe sur les lettres
  const shine = ((t * 0.35) % 1.6) - 0.3;
  if (shine > 0 && shine < 1) {
    const w = c.measureText(text).width;
    sparkle(c, W / 2 - w / 2 + w * shine, y + size * 0.3, 3.5, '#ffffff', Math.sin(shine * Math.PI));
  }
  // sous-titre
  c.font = `${8}px ${font}`;
  c.lineWidth = 2.5;
  c.strokeStyle = 'rgba(40,30,60,.7)';
  c.strokeText('Délivre la licorne du royaume d’Iris', W / 2, y + size + 2);
  c.fillStyle = '#ffffff';
  c.fillText('Délivre la licorne du royaume d’Iris', W / 2, y + size + 2);
}
