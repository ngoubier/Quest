// LES MONSTRES DES NIVEAUX 2 À 8 en dessins lisses (version PC détaillée, 32 × 32 pixels pour une case).
// Repère : 16 × 16 unités, comme l'image pixel, le sol en y = 15. Mêmes silhouettes, mêmes couleurs,
// mêmes deux images d'animation (step 0 / 1) ; tournés vers la droite comme en pixel.
//   paintMonsterHD(c, 'wolf_1') dessine dans un carré de 32 × 32 ; renvoie false si ce n'est pas un monstre.
import { fillOf, radial, ell, shape, line, halo } from './kit.js';

/** Place le repère 16 × 16 (sol en y = 15) : (x, y) = le sol, s = taille de 16 unités. */
export function unit16(c, x, y, s, fn) {
  c.save();
  c.translate(x - s / 2, y - (s * 15) / 16);
  c.scale(s / 16, s / 16);
  c.lineCap = 'round';
  c.lineJoin = 'round';
  fn(c);
  c.restore();
}

const shadow = (c, x, rx, a = 0.25) => ell(c, x, 15, rx, rx * 0.2, `rgba(0,0,0,${a})`);
/** Petit œil brillant. */
const dot = (c, x, y, r, col = '#141414', shine = true) => (ell(c, x, y, r, r, col), shine && ell(c, x - r * 0.35, y - r * 0.35, r * 0.35, r * 0.35, 'rgba(255,255,255,.9)'));
/** Pattes qui marchent : xs = positions, alternées selon step. */
const legs = (c, xs, y, step, col, w = 0.9) => xs.forEach((x, i) => line(c, col, w, [[x, y], [x + ((i + step) % 2 ? 0.5 : -0.5), y + 2.4]]));

// ------------------------------------------------------------------ Mont Givré
function snowman(c, s) {
  shadow(c, 8, 5);
  ell(c, 8, 11.5 + s * 0.4, 5, 3.6 - s * 0.3, radial(c, 6.5, 10, 6, ['#ffffff', '#ffffff', '#c3d5e8']));
  ell(c, 8, 6 + s, 3.4, 3.2, radial(c, 7, 5 + s, 4, ['#ffffff', '#ffffff', '#c3d5e8']));
  // chapeau
  shape(c, '#2a2a3a', [[5.2, 3.6 + s], [10.8, 3.6 + s], [10.8, 4.3 + s], [5.2, 4.3 + s]]);
  shape(c, '#2a2a3a', [[6.2, 0.8 + s], [9.8, 0.8 + s], [9.8, 3.8 + s], [6.2, 3.8 + s]]);
  shape(c, '#c8202a', [[6.2, 2.8 + s], [9.8, 2.8 + s], [9.8, 3.4 + s], [6.2, 3.4 + s]]);
  // visage fâché
  dot(c, 6.8, 5.6 + s, 0.45);
  dot(c, 9.2, 5.6 + s, 0.45);
  line(c, '#222', 0.35, [[6.1, 4.8 + s], [7.4, 5.1 + s]]);
  line(c, '#222', 0.35, [[9.9, 4.8 + s], [8.6, 5.1 + s]]);
  shape(c, '#ff8a1a', [[8, 6.3 + s], [10.6, 6.9 + s], [8, 7.3 + s]]);
  // écharpe et boutons
  line(c, '#3a8ad8', 1, [[5.5, 8.6 + s * 0.7], [10.5, 8.6 + s * 0.7]]);
  line(c, '#3a8ad8', 0.9, [[9.6, 8.8], [10.2, 10.8]]);
  for (const y of [10.4, 12.4]) dot(c, 8, y, 0.4, '#222', false);
  // bras en branches
  line(c, '#6b4a33', 0.5, [[3.6, 10.2], [1, 8.8], [0.4, 7.8]]);
  line(c, '#6b4a33', 0.5, [[12.4, 10.2 - s], [15, 8.4 - s], [15.4, 7.2 - s]]);
}

function wolf(c, s) {
  shadow(c, 8, 6);
  const FUR = ['#d8dee8', '#aab4c4', '#7c889a'];
  // queue touffue
  shape(c, fillOf(c, FUR, 4, 10), (k) => {
    k.moveTo(3, 8);
    k.quadraticCurveTo(0, 7.5 - s, 0.2, 5 - s * 1.2);
    k.quadraticCurveTo(2, 6.5, 3.5, 7.2);
  });
  legs(c, [3.6, 5.2, 9.4, 11], 11.6, s, '#7c889a', 1);
  // corps
  ell(c, 7.4, 9.2, 5.4, 3, fillOf(c, FUR, 6, 12.5));
  ell(c, 6.5, 10.6, 3.5, 1.2, 'rgba(255,255,255,.35)');
  // tête et museau
  ell(c, 12.2, 6.4, 2.8, 2.5, fillOf(c, ['#e8eef4', '#c4ccd8'], 4, 9));
  shape(c, '#c4ccd8', [[13, 6.5], [15.8, 7.6], [15.4, 8.8], [12.5, 8.6]]);
  ell(c, 15.4, 7.8, 0.55, 0.45, '#222');
  shape(c, '#c4ccd8', [[10.3, 5], [10.6, 2.2], [11.8, 4.2]]);
  shape(c, '#c4ccd8', [[12.4, 4.2], [13.4, 2], [13.8, 4.6]]);
  shape(c, '#e8a0a0', [[10.8, 4.4], [10.9, 3.1], [11.4, 4.1]]);
  ell(c, 12.6, 5.9, 0.6, 0.5, '#ffde3a');
  ell(c, 12.75, 5.9, 0.22, 0.42, '#222');
  line(c, '#5a6070', 0.3, [[11.8, 5.2], [13.3, 5.5]]);
  shape(c, '#ffffff', [[13.6, 8.5], [14, 9.4], [14.3, 8.5]]);
}

function penguin(c, s) {
  shadow(c, 8, 4);
  const y = s * 0.6;
  ell(c, 8, 8.6 + y, 4.2, 5.8 - y * 0.5, fillOf(c, ['#3a4058', '#22283a'], 3, 14));
  ell(c, 8, 9.6 + y, 2.7, 4.4 - y * 0.5, radial(c, 7.4, 8.5, 5, ['#ffffff', '#ffffff', '#dfe6f0']));
  // ailerons
  ell(c, 3.8, 9 + y, 1, 2.8, '#22283a', 0.35 + s * 0.3);
  ell(c, 12.2, 9 + y, 1, 2.8, '#22283a', -0.35 - s * 0.3);
  // yeux et bec
  for (const x of [6.4, 9.6]) (ell(c, x, 5.3 + y, 1.1, 1.1, '#ffffff'), dot(c, x + 0.15, 5.4 + y, 0.5));
  line(c, '#22283a', 0.4, [[5.4, 4.2 + y], [7.2, 4.7 + y]]);
  line(c, '#22283a', 0.4, [[10.6, 4.2 + y], [8.8, 4.7 + y]]);
  shape(c, '#ffb03a', [[6.9, 6.4 + y], [9.1, 6.4 + y], [8, 7.8 + y]]);
  // pieds
  ell(c, 6.2, 14.6, 1.4, 0.6, '#ffb03a');
  ell(c, 9.8, 14.6, 1.4, 0.6, '#ffb03a');
}

// ------------------------------------------------------------------ Forêt des Murmures
function boar(c, s) {
  shadow(c, 8, 6);
  legs(c, [3, 5.6, 8.8, 11.4], 11.6, s, '#3a2a20', 1.1);
  ell(c, 7, 9 + s * 0.4, 6, 3.6, fillOf(c, ['#8a6a58', '#6a4a3a', '#4a3428'], 5, 13));
  // crête de poils
  for (let x = 2.5; x < 10; x += 1.2) shape(c, '#4a3428', [[x - 0.6, 6 + s * 0.4], [x, 4.6 + s * 0.4 - (x % 2.4 < 1.2 ? 0.4 : 0)], [x + 0.6, 6 + s * 0.4]]);
  // tête
  ell(c, 12.2, 9 + s * 0.4, 3, 2.7, fillOf(c, ['#9a7a68', '#7a5a48'], 6, 12));
  ell(c, 14.6, 9.8 + s * 0.4, 1.3, 1.1, '#e8a0a0');
  for (const dy of [-0.3, 0.4]) ell(c, 15.1, 9.8 + dy + s * 0.4, 0.22, 0.22, '#5a2a2a');
  dot(c, 12.6, 8 + s * 0.4, 0.45);
  line(c, '#3a2420', 0.35, [[11.8, 7.2 + s * 0.4], [13.2, 7.6 + s * 0.4]]);
  shape(c, '#4a3428', [[10.6, 7.2 + s * 0.4], [11.2, 5.4 + s * 0.4], [12, 7]]);
  // défense
  shape(c, '#f4f0e0', (k) => {
    k.moveTo(13.4, 10.8 + s * 0.4);
    k.quadraticCurveTo(14.2, 11, 14.4, 9.4 + s * 0.4);
    k.lineTo(13.9, 10.4 + s * 0.4);
  });
  line(c, '#4a3428', 0.5, [[1.2, 8.2], [0.4, 7.4 - s * 0.6]]);
}

function squirrel(c, s) {
  shadow(c, 8, 5);
  // grande queue en panache
  shape(c, fillOf(c, ['#e8844a', '#c8642a', '#a8541a'], 2, 14), (k) => {
    k.moveTo(11, 13);
    k.bezierCurveTo(15.6, 12, 15.8, 4 + s, 13.4, 2 + s);
    k.bezierCurveTo(11.6, 0.8 + s, 9.4, 3 + s, 11.2, 4.6 + s);
    k.bezierCurveTo(13, 6, 12.6, 10, 9.6, 11.4);
  });
  line(c, 'rgba(255,220,180,.6)', 0.5, [[13.2, 3.2 + s], [14.4, 6], [13.4, 10]]);
  // corps assis
  ell(c, 7, 10.8, 3.4, 3.8, fillOf(c, ['#c8642a', '#a8541a'], 7, 14.5));
  ell(c, 6.2, 11.4, 1.9, 2.6, '#f4d8a8');
  // tête
  ell(c, 5.4, 6, 2.6, 2.3, fillOf(c, ['#c8642a', '#a8541a'], 4, 8.5));
  shape(c, '#a8541a', [[4.2, 4.4], [3.8, 1.8], [5.6, 3.8]]);
  shape(c, '#e8a0a0', [[4.4, 4.1], [4.2, 2.8], [5.1, 3.9]]);
  dot(c, 4.4, 5.8, 0.5);
  ell(c, 3, 6.8, 0.45, 0.35, '#3a1a0a');
  ell(c, 4, 7.4, 0.8, 0.4, '#f4d8a8');
  // le gland qu'il tient
  ell(c, 3, 9.6, 1.1, 1.3, '#b07a30');
  ell(c, 3, 8.6, 1.2, 0.6, '#6a4a20');
  ell(c, 4.2, 9.8, 0.8, 0.6, '#a8541a');
  ell(c, 6.4, 14.6, 1.6, 0.5, '#a8541a');
}

function wasp(c, s) {
  ell(c, 8, 15.2, 3, 0.5, 'rgba(0,0,0,.18)');
  const y = s * 0.6;
  // ailes qui vibrent
  for (const [x, rot] of [[5.5, -0.5], [10, 0.4]]) {
    ell(c, x, 4.4 + y - s * 1.2, 2.4, 1.4, 'rgba(220,240,255,.75)', rot + s * 0.5);
    line(c, 'rgba(160,190,220,.8)', 0.2, [[x - 1.6, 4.4 + y - s * 1.2], [x + 1.6, 4.4 + y - s * 1.2]]);
  }
  // abdomen rayé et dard
  ell(c, 9.6, 9.2 + y, 4, 2.6, fillOf(c, ['#ffe060', '#f4c020', '#c89010'], 6.5, 12));
  for (const x of [8.2, 10.2, 12]) line(c, '#141414', 0.8, [[x, 7 + y], [x + 0.3, 11.4 + y]]);
  shape(c, '#2a2a2a', [[13.4, 8.6 + y], [15.6, 9.5 + y], [13.4, 10.2 + y]]);
  // tête
  ell(c, 4.4, 8.8 + y, 2.4, 2.2, '#2a2a2a');
  ell(c, 3.8, 8.4 + y, 1.1, 1, '#ff4a4a');
  ell(c, 3.5, 8.1 + y, 0.35, 0.3, 'rgba(255,255,255,.8)');
  line(c, '#2a2a2a', 0.35, [[4.2, 6.8 + y], [3.4, 4.8 + y], [2.4, 4.4 + y]]);
  shape(c, '#f4c020', [[2.4, 9.8 + y], [3.4, 9.6 + y], [2.8, 10.6 + y]]);
}

function shroom(c, s) {
  shadow(c, 8, 5);
  const y = -s * 1.6;
  // pied avec visage
  shape(c, fillOf(c, ['#fff8e8', '#e8dcc0'], 8, 15), [[5, 8 + y], [11, 8 + y], [11.4, 14 + y * 0.2], [4.6, 14 + y * 0.2]]);
  dot(c, 6.6, 10.4 + y, 0.5);
  dot(c, 9.4, 10.4 + y, 0.5);
  line(c, '#141414', 0.35, [[7, 12 + y], [8, 12.5 + y], [9, 12 + y]]);
  if (s) (ell(c, 5.8, 14.8, 1, 0.4, '#e8dcc0'), ell(c, 10.2, 14.8, 1, 0.4, '#e8dcc0'));
  // chapeau à pois
  shape(c, fillOf(c, ['#b46ae8', '#8a3ac8', '#5a2a8a'], 1 + y, 9 + y), (k) => {
    k.moveTo(1.2, 8.6 + y);
    k.bezierCurveTo(1, 2 + y, 15, 2 + y, 14.8, 8.6 + y);
    k.quadraticCurveTo(8, 9.8 + y, 1.2, 8.6 + y);
  });
  for (const [x, yy, r] of [[4.6, 5.4, 1], [10.8, 4.8, 1.2], [7.6, 3.4, 0.7], [12.8, 7.2, 0.6], [6.6, 7.2, 0.6]]) ell(c, x, yy + y, r, r * 0.8, '#ffe066');
  ell(c, 5, 3.8 + y, 1.6, 0.6, 'rgba(255,255,255,.35)', -0.4);
}

function acorn(c, s) {
  ell(c, 8, 8.6, 2.6, 3, fillOf(c, ['#d89a4a', '#b07a30'], 6, 12));
  ell(c, 8, 6.2, 3, 1.4, '#6a4a20');
  line(c, '#4a3410', 0.5, [[8, 5], [8.6, 3.8 - s * 0.4]]);
  ell(c, 7.2, 8, 0.6, 1.2, 'rgba(255,240,200,.5)');
}

function thorn(c, s) {
  c.save();
  c.translate(8, 8);
  c.rotate(s * 0.6);
  shape(c, '#3a1a3a', [[-4, 0], [0, -1.2], [4, 0], [0, 1.2]]);
  shape(c, '#e8e0d0', [[2.6, -0.4], [4.4, 0], [2.6, 0.4]]);
  shape(c, '#e8e0d0', [[-2.6, -0.4], [-4.4, 0], [-2.6, 0.4]]);
  c.restore();
}

// ------------------------------------------------------------------ Bourg-Lanterne
function rat(c, s) {
  shadow(c, 8, 5.5);
  line(c, '#e8a0a0', 0.6, [[3.2, 11.4], [1.4, 11.4 - s], [0.4, 10]]);
  legs(c, [4.4, 7, 9.8], 12.4, s, '#5a5450', 0.8);
  ell(c, 7.2, 10.4 + s * 0.4, 4.6, 2.7, fillOf(c, ['#9a9490', '#7a7470', '#5a5450'], 8, 13));
  ell(c, 11.8, 9.4 + s * 0.4, 2.4, 2, fillOf(c, ['#9a9490', '#8a8480'], 7.5, 11.5));
  shape(c, '#8a8480', [[12.8, 8.6 + s * 0.4], [15.4, 10 + s * 0.4], [12.8, 10.8 + s * 0.4]]);
  ell(c, 15.3, 10 + s * 0.4, 0.45, 0.4, '#e8a0a0');
  ell(c, 10.8, 7.4 + s * 0.4, 1.3, 1.4, '#8a8480');
  ell(c, 10.8, 7.5 + s * 0.4, 0.8, 0.9, '#e8a0a0');
  dot(c, 12.6, 8.9 + s * 0.4, 0.45, '#c8202a');
  for (const dy of [-0.3, 0.3]) line(c, 'rgba(240,240,240,.7)', 0.15, [[14.6, 10 + s * 0.4], [16, 9.6 + dy * 2 + s * 0.4]]);
}

function bat(c, s, col = '#5a3a6a', body = '#3a2a4a', eyes = '#ff4a4a') {
  ell(c, 8, 15.2, 2.6, 0.5, 'rgba(0,0,0,.18)');
  for (const dir of [-1, 1]) {
    shape(c, col, (k) => {
      const tipY = s ? 2.4 : 9.4;
      k.moveTo(8 + dir * 1.4, 6.4);
      k.quadraticCurveTo(8 + dir * 4.5, s ? 2 : 5, 8 + dir * 7.4, tipY);
      k.quadraticCurveTo(8 + dir * 6.4, tipY + 1.6, 8 + dir * 5.4, tipY + (s ? 2.6 : 0.6));
      k.quadraticCurveTo(8 + dir * 4.6, tipY + (s ? 2 : 1.6), 8 + dir * 3.6, s ? 6.6 : 9.6);
      k.quadraticCurveTo(8 + dir * 2.6, 8, 8 + dir * 1.4, 8.6);
    });
    line(c, 'rgba(0,0,0,.3)', 0.2, [[8 + dir * 1.6, 7], [8 + dir * 5.4, s ? 4.6 : 9.4]]);
  }
  ell(c, 8, 7.6, 2.1, 2.6, body);
  shape(c, body, [[6.4, 6], [6.6, 3.6], [7.6, 5.4]]);
  shape(c, body, [[9.6, 6], [9.4, 3.6], [8.4, 5.4]]);
  for (const x of [7.2, 8.8]) (halo(c, x, 6.8, 1.2, eyes, 0.5), ell(c, x, 6.8, 0.45, 0.45, eyes));
  shape(c, '#ffffff', [[7.4, 8.6], [7.7, 9.5], [8, 8.6]]);
  shape(c, '#ffffff', [[8, 8.6], [8.3, 9.5], [8.6, 8.6]]);
}

function thief(c, s) {
  shadow(c, 8, 4, 0.3);
  // jambes
  ell(c, 6, 14.4, 1.2, 0.8, '#2a2a3a');
  ell(c, 10, 14.4 - s, 1.2, 0.8, '#2a2a3a');
  // corps (tunique sombre)
  shape(c, fillOf(c, ['#4a4a5e', '#3a3a4a', '#2a2a3a'], 7, 14.5), [[4.4, 7.6 + s * 0.6], [11.6, 7.6 + s * 0.6], [12, 14], [4, 14]]);
  line(c, '#8a6a30', 0.6, [[4.2, 11.4], [11.8, 11.4]]);
  // sac de butin
  ell(c, 12.4, 11, 1.9, 2.2, fillOf(c, ['#e0c070', '#c8a050'], 9, 13));
  line(c, '#8a6a30', 0.5, [[11.6, 9.2], [13.2, 9.2]]);
  ell(c, 12.2, 11.4, 0.4, 0.4, '#ffd35a');
  // tête, bonnet, masque de bandit
  ell(c, 8, 5 + s * 0.6, 3, 2.9, '#e8b88a');
  shape(c, '#2a2a3a', (k) => {
    k.moveTo(4.8, 4.4 + s * 0.6);
    k.bezierCurveTo(5, 1 + s * 0.6, 11, 1 + s * 0.6, 11.2, 4.4 + s * 0.6);
  });
  shape(c, '#141414', [[4.8, 4.4 + s * 0.6], [11.2, 4.4 + s * 0.6], [11.2, 5.8 + s * 0.6], [4.8, 5.8 + s * 0.6]]);
  line(c, '#141414', 0.5, [[4.8, 5], [3.6, 6.4 - s]]);
  for (const x of [6.6, 9.4]) ell(c, x, 5.1 + s * 0.6, 0.55, 0.45, '#ffffff');
  line(c, '#a8784a', 0.35, [[7, 7.2 + s * 0.6], [9, 7 + s * 0.6]]);
}

function knife(c, s) {
  c.save();
  c.translate(8, 8);
  c.rotate(s * (Math.PI / 2));
  shape(c, fillOf(c, ['#ffffff', '#b8bcc8'], -1, 1), [[-1, -0.9], [4.6, 0], [-1, 0.9]]);
  line(c, '#6a4a2a', 1.1, [[-1.4, 0], [-3.8, 0]]);
  line(c, '#c8a050', 0.5, [[-1.3, -1.2], [-1.3, 1.2]]);
  c.restore();
}

// ------------------------------------------------------------------ Labyrinthe des Mille Portes
function skeleton(c, s) {
  shadow(c, 8, 4, 0.3);
  const BONE = '#f0ecdc';
  const BONE_D = '#c8c4b0';
  // jambes
  line(c, BONE_D, 1, [[6, 12.4], [5.8, 15 - s * 0.6]]);
  line(c, BONE_D, 1, [[10, 12.4], [10.2, 15 - (1 - s) * 0.6]]);
  // colonne et côtes
  line(c, BONE_D, 1.1, [[8, 6.6], [8, 12.4]]);
  for (const y of [8, 9.4, 10.8]) line(c, BONE, 0.7, (k) => (k.moveTo(5.2, y + 0.4), k.quadraticCurveTo(8, y - 0.8, 10.8, y + 0.4)));
  ell(c, 8, 12.4, 2.4, 0.9, BONE_D);
  // bras, épée rouillée
  line(c, BONE, 0.8, [[5.4, 7.6], [4, 9.6 - s], [4.2, 12 - s]]);
  line(c, BONE, 0.8, [[10.6, 7.6], [12, 9.6 + s], [12.4, 10.8 + s]]);
  shape(c, fillOf(c, ['#c8c8d8', '#8a8a9a'], 2, 11), [[12, 10.6 + s], [12.6, 2.4 + s], [13.2, 10.6 + s]]);
  for (const [x, y] of [[12.5, 5.4], [12.7, 8]]) ell(c, x, y + s, 0.3, 0.4, '#a8603a');
  line(c, '#6a4a2a', 0.6, [[11.4, 10.8 + s], [13.8, 10.8 + s]]);
  // crâne
  ell(c, 8, 3.8 + s * 0.6, 3.2, 3, radial(c, 7, 3 + s * 0.6, 4, ['#ffffff', BONE, BONE_D]));
  shape(c, BONE, [[6.2, 5.6 + s * 0.6], [9.8, 5.6 + s * 0.6], [9.4, 7.2 + s * 0.6], [6.6, 7.2 + s * 0.6]]);
  for (const x of [6.7, 9.3]) (ell(c, x, 4 + s * 0.6, 1, 1.1, '#141414'), ell(c, x, 4.2 + s * 0.6, 0.35, 0.35, '#ff6a3a'));
  shape(c, '#141414', [[7.6, 5.6 + s * 0.6], [8.4, 5.6 + s * 0.6], [8, 4.8 + s * 0.6]]);
  for (const x of [7, 8, 9]) line(c, '#5a5650', 0.2, [[x, 6.2 + s * 0.6], [x, 7.1 + s * 0.6]]);
}

function ghost(c, s, t = 0) {
  const y = s * 0.8;
  halo(c, 8, 8 + y, 7, 'rgba(200,210,255,.35)');
  shape(c, fillOf(c, ['rgba(250,252,255,.95)', 'rgba(220,228,255,.8)', 'rgba(200,210,255,.5)'], 2 + y, 15), (k) => {
    k.moveTo(2.6, 13.4 + y);
    k.bezierCurveTo(2, 1 + y, 14, 1 + y, 13.4, 13.4 + y);
    for (let i = 0; i < 4; i++) {
      const x = 13.4 - (i + 1) * 2.7;
      k.quadraticCurveTo(x + 1.35, (i % 2 ? 12 : 15.4) + (s ? -0.6 : 0.6) * (i % 2 ? -1 : 1), x, 13.4 + y);
    }
  });
  ell(c, 6.2, 6.6 + y, 1.1, 1.6, '#2a2a4a');
  ell(c, 9.8, 6.6 + y, 1.1, 1.6, '#2a2a4a');
  ell(c, 6, 6.1 + y, 0.35, 0.4, 'rgba(255,255,255,.8)');
  ell(c, 9.6, 6.1 + y, 0.35, 0.4, 'rgba(255,255,255,.8)');
  ell(c, 8, 10 + y, 1, 0.8 + s * 0.3, '#2a2a4a');
  ell(c, 4.8, 9.2 + y, 0.9, 0.5, 'rgba(255,170,200,.5)');
  ell(c, 11.2, 9.2 + y, 0.9, 0.5, 'rgba(255,170,200,.5)');
}

function armor(c, s) {
  shadow(c, 8, 5, 0.3);
  const STEEL = ['#e8e8f4', '#a8a8c0', '#6a6a80'];
  // lance
  line(c, '#8a6a4a', 0.6, [[0.6, 14.6 - s], [0.6, 3 - s]]);
  shape(c, fillOf(c, ['#ffffff', '#a8a8b8'], 0, 4), [[-0.2, 3.4 - s], [0.6, 0.2 - s], [1.4, 3.4 - s]]);
  // jambes
  shape(c, fillOf(c, STEEL, 12, 15), [[4.4, 12.6], [7, 12.6], [7, 15.2 - s * 0.6], [4.2, 15.2 - s * 0.6]]);
  shape(c, fillOf(c, STEEL, 12, 15), [[9, 12.6], [11.6, 12.6], [11.8, 15.2 - (1 - s) * 0.6], [9, 15.2 - (1 - s) * 0.6]]);
  // cuirasse
  shape(c, fillOf(c, STEEL, 6.5, 13), (k) => {
    k.moveTo(3, 7.4);
    k.quadraticCurveTo(8, 6.2, 13, 7.4);
    k.lineTo(12.2, 13);
    k.lineTo(3.8, 13);
  });
  line(c, '#6a6a80', 0.3, [[8, 7], [8, 12.8]]);
  line(c, 'rgba(255,255,255,.7)', 0.5, [[4, 8], [6.6, 7.4]]);
  // bras et gantelets
  ell(c, 2, 9.6 + s, 1.2, 2.6, fillOf(c, STEEL, 7, 12.5));
  ell(c, 14, 9.6 - s, 1.2, 2.6, fillOf(c, STEEL, 7, 12.5));
  ell(c, 1.4, 12 + s, 0.9, 0.8, '#6a6a80');
  // heaume à fente, plumet rouge
  shape(c, fillOf(c, ['#c8c8dc', '#8a8aa0', '#5a5a70'], 0.5, 7), (k) => {
    k.moveTo(4.2, 7);
    k.bezierCurveTo(3.6, 0.6, 12.4, 0.6, 11.8, 7);
  });
  shape(c, '#141414', [[5, 3.4], [11, 3.4], [11, 4.4], [5, 4.4]]);
  for (const x of [6.6, 9.4]) (halo(c, x, 3.9, 1.3, 'rgba(255,60,60,.8)', 0.7), ell(c, x, 3.9, 0.4, 0.35, '#ff4a4a'));
  shape(c, '#e83a3a', (k) => {
    k.moveTo(7.4, 1.4);
    k.quadraticCurveTo(9.5, -1.2, 12, 0.4 + s * 0.4);
    k.quadraticCurveTo(10, 0.4, 8.6, 1.6);
  });
}

// ------------------------------------------------------------------ Désert des Mirages
function snake(c, s) {
  shadow(c, 8, 6, 0.2);
  const pts = [];
  for (let x = 1.4; x <= 11; x += 1.2) pts.push([x, 12 + Math.sin(x / 1.5 + s * 2) * 1.4]);
  line(c, '#2a6a1a', 2.6, pts);
  line(c, '#5aa83a', 2, pts);
  pts.forEach(([x, y], i) => i % 2 && ell(c, x, y, 0.5, 0.4, '#2a6a1a'));
  line(c, '#e8d870', 0.5, pts.map(([x, y]) => [x, y + 0.7]));
  // cou dressé et tête
  line(c, '#5aa83a', 1.8, [[10.6, 12], [11.4, 10], [12, 8.6]]);
  ell(c, 12.6, 8, 2.4, 1.8, fillOf(c, ['#7ac85a', '#4a983a'], 6, 10));
  ell(c, 13.2, 7.3, 0.6, 0.55, '#ffe066');
  ell(c, 13.3, 7.3, 0.18, 0.45, '#141414');
  if (s) line(c, '#e83a3a', 0.35, [[14.8, 8.6], [16, 8.8], [16.4, 8.4]]);
  else line(c, '#e83a3a', 0.35, [[14.8, 8.6], [15.6, 8.8]]);
}

function scorpion(c, s) {
  shadow(c, 8, 6, 0.2);
  const SHELL = ['#5a4040', '#3a2a2a', '#1a1010'];
  legs(c, [4.6, 6.2, 8.4, 10], 12, s, '#3a2a2a', 0.6);
  // pinces
  for (const [x, dir, up] of [[2.2, -1, s], [12.8, 1, -s]]) {
    line(c, '#3a2a2a', 0.8, [[x + dir * -1.4, 10], [x, 8.8 + up]]);
    ell(c, x, 8 + up, 1.6, 1.2, fillOf(c, SHELL, 6.5, 9.5));
    shape(c, '#1a1010', [[x + dir * 0.4, 7.4 + up], [x + dir * 1.8, 6.8 + up], [x + dir * 0.6, 8 + up]]);
  }
  // corps
  ell(c, 7.4, 10.8, 3.8, 2.4, fillOf(c, SHELL, 8.4, 13.2));
  for (const x of [5.6, 7.4, 9.2]) line(c, '#1a1010', 0.25, [[x, 9], [x, 12.4]]);
  ell(c, 6.2, 9.8, 1.4, 0.5, 'rgba(255,220,200,.25)');
  // queue courbée et dard
  line(c, '#3a2a2a', 1.4, [[6.4, 9], [6, 5.4], [7.6, 2.6], [9.6, 2.4]]);
  for (const [x, y] of [[6.1, 7], [6.4, 4.6], [8, 2.6]]) ell(c, x, y, 0.9, 0.8, '#4a3434');
  shape(c, '#e83a3a', [[9.2, 1.8], [11, 2.8], [9.4, 3.2]]);
  dot(c, 9.6, 10, 0.3, '#ff4a4a', false);
  dot(c, 10.4, 10, 0.3, '#ff4a4a', false);
}

function vulture(c, s) {
  ell(c, 8, 15.2, 3, 0.5, 'rgba(0,0,0,.18)');
  // ailes
  for (const dir of [-1, 1]) {
    shape(c, fillOf(c, ['#5a4a4a', '#3a2a2a'], 2, 11), (k) => {
      const tip = s ? 3 : 9.6;
      k.moveTo(8 + dir * 2, 6.4);
      k.quadraticCurveTo(8 + dir * 5, s ? 2.6 : 6, 8 + dir * 8, tip);
      for (let i = 0; i < 3; i++) k.lineTo(8 + dir * (7 - i * 1.4), tip + 1.6 + (i % 2) * 0.6);
      k.quadraticCurveTo(8 + dir * 3, 9, 8 + dir * 2, 9.4);
    });
  }
  // corps
  ell(c, 8, 8.4, 2.8, 3.2, fillOf(c, ['#5a4a4a', '#3a2a2a'], 5, 12));
  ell(c, 8, 5.6, 2.4, 0.9, '#f4f0e0'); // collerette
  // tête chauve et bec crochu
  ell(c, 8.4, 3.4, 1.8, 1.6, '#e8a0a0');
  dot(c, 8.2, 3, 0.35);
  shape(c, '#f4c020', (k) => {
    k.moveTo(9.6, 3);
    k.quadraticCurveTo(11.6, 3, 11.2, 4.8);
    k.lineTo(10.4, 3.8);
    k.lineTo(9.6, 4);
  });
  line(c, '#f4c020', 0.4, [[7, 11.4], [6.8, 12.6]]);
  line(c, '#f4c020', 0.4, [[9, 11.4], [9.2, 12.6]]);
}

function mummy(c, s) {
  shadow(c, 8, 4.5, 0.3);
  const WRAP = ['#f4ecd4', '#e8e0c8', '#c8c0a8'];
  // bras tendus
  for (const [dir, dy] of [[-1, s], [1, -s]]) {
    shape(c, fillOf(c, WRAP, 5, 9), [[8 + dir * 3.4, 6.2 + dy], [8 + dir * 7.4, 6.2 + dy], [8 + dir * 7.4, 8 + dy], [8 + dir * 3.4, 8 + dy]]);
    line(c, '#b8b098', 0.25, [[8 + dir * 5, 6.2 + dy], [8 + dir * 5.6, 8 + dy]]);
  }
  // corps entouré de bandelettes
  shape(c, fillOf(c, WRAP, 1, 15), (k) => {
    k.moveTo(4.6, 15);
    k.lineTo(4, 4.6);
    k.bezierCurveTo(4, 0.4, 12, 0.4, 12, 4.6);
    k.lineTo(11.4, 15);
  });
  for (let y = 2.4; y < 15; y += 1.6) line(c, '#b8b098', 0.3, [[4.2 + (y > 5 ? 0 : 0.6), y + (y % 3.2 < 1.6 ? 0.4 : -0.2)], [11.8 - (y > 5 ? 0 : 0.6), y - (y % 3.2 < 1.6 ? 0.2 : -0.4)]]);
  // bandelette qui pend
  line(c, '#e8e0c8', 0.6, [[11.4, 10], [12.6, 12.4 + s * 0.6], [12.2, 14]]);
  // fente des yeux rouges
  shape(c, '#2a1a10', [[5, 3.6], [11, 3.6], [11, 5], [5, 5]]);
  for (const x of [6.6, 9.4]) (halo(c, x, 4.3, 1.4, 'rgba(255,60,40,.7)', 0.8), ell(c, x, 4.3, 0.45, 0.4, '#ff4a3a'));
}

// ------------------------------------------------------------------ Abysses de Corail
function crab(c, s) {
  shadow(c, 8, 6);
  legs(c, [3.2, 4.6, 11.4, 12.8], 11.6, s, '#a83a1a', 0.6);
  // pinces levées
  for (const [x, dir, up] of [[1.6, -1, -s], [14.4, 1, s]]) {
    line(c, '#c8401a', 0.8, [[x - dir * 3, 9.4], [x - dir * 0.6, 7.4 + up]]);
    ell(c, x, 6.2 + up, 1.7, 1.5, fillOf(c, ['#ff7a4a', '#e8502a'], 4.6, 7.8));
    shape(c, '#c8401a', [[x - dir * 0.2, 5 + up], [x + dir * 0.2, 6 + up], [x - dir * 1.4, 5.4 + up]]);
  }
  // carapace
  ell(c, 8, 10, 4.6, 3.2, fillOf(c, ['#ff8a5a', '#e8502a', '#b83a1a'], 7, 13));
  ell(c, 6.6, 8.6, 2, 0.8, 'rgba(255,230,210,.5)', -0.2);
  for (const x of [5, 11]) ell(c, x, 11, 0.5, 0.4, '#c8401a');
  // yeux sur tiges
  for (const x of [6, 10]) (line(c, '#e8502a', 0.6, [[x, 7.6], [x, 4.6]]), ell(c, x, 4.2, 1, 1, '#ffffff'), dot(c, x + 0.2, 4.3, 0.45));
  line(c, '#7a2a10', 0.35, [[7, 11], [8, 11.6], [9, 11]]);
}

function jelly(c, s, t = 0) {
  const y = s * 0.8;
  halo(c, 8, 6 + y, 7, 'rgba(255,140,220,.35)');
  // filaments
  for (let i = 0; i < 5; i++) {
    const x = 4.4 + i * 1.8;
    line(c, 'rgba(255,170,230,.75)', 0.5, [[x, 8.6 + y], [x + (s ? 0.6 : -0.6), 11 + y], [x, 13.6 + y - s + (i % 2) * 0.8]]);
  }
  // ombrelle
  shape(c, fillOf(c, ['rgba(255,200,240,.95)', 'rgba(255,140,220,.88)', 'rgba(220,90,190,.85)'], 1 + y, 9 + y), (k) => {
    k.moveTo(2.4, 8.8 + y);
    k.bezierCurveTo(2, 0.6 + y, 14, 0.6 + y, 13.6, 8.8 + y);
    for (let i = 0; i < 4; i++) k.quadraticCurveTo(13.6 - i * 2.8 - 1.4, 10 + y, 13.6 - (i + 1) * 2.8, 8.8 + y);
  });
  ell(c, 6, 3.8 + y, 2, 1.1, 'rgba(255,240,252,.8)', -0.3);
  dot(c, 6.6, 6.4 + y, 0.45, '#5a1a4a');
  dot(c, 9.4, 6.4 + y, 0.45, '#5a1a4a');
  line(c, '#5a1a4a', 0.3, [[7.4, 7.6 + y], [8, 8 + y], [8.6, 7.6 + y]]);
}

function eel(c, s) {
  const pts = [];
  for (let x = 1; x <= 12.4; x += 1.1) pts.push([x, 8.4 + Math.sin(x / 2 + s * 2) * 2]);
  line(c, '#1a4a3a', 3.2, pts);
  line(c, '#3a8a5a', 2.6, pts);
  line(c, '#a8e0a0', 0.5, pts.map(([x, y]) => [x, y + 0.9]));
  // nageoire dorsale
  line(c, '#ffd23a', 0.5, pts.slice(1, -1).map(([x, y]) => [x, y - 1.5]));
  // tête et gueule
  ell(c, 13.4, 7.6, 2.6, 2.2, fillOf(c, ['#5ab87a', '#3a8a5a'], 5.4, 9.8));
  ell(c, 14.2, 6.8, 0.65, 0.6, '#ffe066');
  ell(c, 14.3, 6.8, 0.2, 0.45, '#141414');
  shape(c, '#1a3a2a', [[13, 8.8], [16, 8.4], [15.6, 9.6]]);
  shape(c, '#ffffff', [[14.4, 8.6], [14.7, 9.2], [15, 8.5]]);
}

function lantern(c, s) {
  // la lumière au bout de l'antenne
  line(c, '#2a2a4a', 0.5, [[8.6, 6.4], [8.4, 2.6], [9.6, 1.4]]);
  halo(c, 9.6, 1.4, 4, s ? 'rgba(255,250,170,.85)' : 'rgba(255,224,102,.7)');
  ell(c, 9.6, 1.4, 1.1, 1.1, s ? '#fff8a0' : '#ffe066');
  // nageoire de queue
  shape(c, '#2a2a5a', [[3.4, 9.4], [0.4, 6.8 + s], [0.6, 12.2 + s]]);
  // corps rond
  ell(c, 7.8, 9.4, 5, 3.8, fillOf(c, ['#4a4a7a', '#3a3a6a', '#22224a'], 5.6, 13.2));
  ell(c, 6.4, 7.6, 2, 0.8, 'rgba(180,180,255,.3)', -0.3);
  // grand œil et grande bouche à dents
  ell(c, 11, 7.8, 1.4, 1.4, '#ffffff');
  dot(c, 11.3, 7.9, 0.7);
  shape(c, '#141428', (k) => {
    k.moveTo(8.6, 10.4);
    k.quadraticCurveTo(11.6, 12.4, 13, 9.6);
    k.quadraticCurveTo(11.6, 10.6, 8.6, 10.4);
  });
  for (const x of [9.6, 10.8, 12]) shape(c, '#ffffff', [[x - 0.3, 10.4 + (x - 9.6) * 0.1], [x, 11.4], [x + 0.3, 10.4 + (x - 9.6) * 0.1]]);
}

function tentacle(c, s) {
  ell(c, 8, 15, 3.6, 0.8, 'rgba(0,0,0,.25)');
  const pts = [];
  for (let y = 15; y >= 1.4; y -= 1.7) pts.push([8 + Math.sin(y / 3 + s * 1.5) * 2, y]);
  pts.forEach(([x, y], i) => i < pts.length - 1 && line(c, i % 2 ? '#7a2a7a' : '#8a3a8a', 3.6 - i * 0.32, [[x, y], pts[i + 1]]));
  line(c, 'rgba(255,200,255,.35)', 0.5, pts.map(([x, y]) => [x - 1, y]));
  pts.slice(1, -1).forEach(([x, y], i) => ell(c, x + 0.9, y, 0.5 - i * 0.04, 0.45 - i * 0.04, '#f0b0e8'));
}

// ------------------------------------------------------------------ Volcan Noir
function firebat(c, s) {
  halo(c, 8, 7.6, 7, 'rgba(255,110,30,.35)');
  bat(c, s, '#c83a10', '#3a1010', '#ffd060');
  // ailes bordées de flammes
  for (const dir of [-1, 1]) {
    const tipY = s ? 2.4 : 9.4;
    ell(c, 8 + dir * 7.2, tipY - 0.2, 0.8, 0.8, '#ff8a2a');
    ell(c, 8 + dir * 6, tipY + (s ? 0.6 : 1.4), 0.6, 0.6, '#ffd060');
  }
  shape(c, '#ff8a2a', (k) => (k.moveTo(7, 5), k.quadraticCurveTo(8, 1.6, 9, 5)));
  shape(c, '#ffd060', (k) => (k.moveTo(7.6, 5), k.quadraticCurveTo(8, 3.2, 8.4, 5)));
}

function imp(c, s) {
  shadow(c, 8, 4, 0.3);
  const y = -s * 0.8;
  // queue fourchue
  line(c, '#7a1a10', 0.6, [[11, 11], [13.4, 10 + s], [14.6, 8.4]]);
  shape(c, '#7a1a10', [[14, 8.6], [15.4, 7.4], [15, 9.2]]);
  // pieds
  ell(c, 6, 14.4, 1.2, 0.7, '#7a1a10');
  ell(c, 10, 14.4, 1.2, 0.7, '#7a1a10');
  // corps rond
  ell(c, 8, 9 + y, 4.2, 4.4, radial(c, 6.6, 7.4 + y, 6, ['#ff7a5a', '#d83a2a', '#a8201a']));
  ell(c, 8, 11 + y, 2.2, 1.8, 'rgba(255,190,140,.4)');
  // cornes
  shape(c, '#7a1a10', [[4.6, 6.4 + y], [3, 2.4 + y], [6, 5.4 + y]]);
  shape(c, '#7a1a10', [[11.4, 6.4 + y], [13, 2.4 + y], [10, 5.4 + y]]);
  // yeux et sourire malin
  for (const [x, dir] of [[6.2, -1], [9.8, 1]]) {
    ell(c, x, 7.8 + y, 1.1, 1.1, '#ffe066');
    ell(c, x + dir * -0.1, 8 + y, 0.4, 0.55, '#3a0a08');
    line(c, '#7a1a10', 0.4, [[x - dir * 1.2, 6.4 + y], [x + dir * 1, 6.9 + y]]);
  }
  shape(c, '#3a0a08', (k) => (k.moveTo(5.8, 10.2 + y), k.quadraticCurveTo(8, 12.4 + y, 10.2, 10.2 + y), k.quadraticCurveTo(8, 11.2 + y, 5.8, 10.2 + y)));
  shape(c, '#ffffff', [[6.6, 10.5 + y], [7, 11.3 + y], [7.3, 10.7 + y]]);
  shape(c, '#ffffff', [[8.7, 10.7 + y], [9, 11.3 + y], [9.4, 10.5 + y]]);
}

function lavawolf(c, s) {
  shadow(c, 8, 6, 0.3);
  // queue de flammes
  shape(c, '#ff6a1a', (k) => (k.moveTo(2.6, 8), k.quadraticCurveTo(-0.4, 7 + s, 0.4, 4.4 + s), k.quadraticCurveTo(1.6, 6.4, 3.4, 7)));
  shape(c, '#ffd060', (k) => (k.moveTo(2.4, 7.8), k.quadraticCurveTo(0.8, 7 + s, 1.2, 5.6 + s), k.quadraticCurveTo(2, 6.8, 3, 7.2)));
  legs(c, [3.6, 5.4, 9, 10.8], 11.4, s, '#2a1a1a', 1.1);
  // corps de roche noire fendue de lave
  ell(c, 7.2, 9, 5.2, 3, fillOf(c, ['#4a3a3a', '#3a2a2a', '#1a1010'], 6, 12));
  line(c, '#ff6a1a', 0.6, [[3.4, 8.4], [5.4, 9.2], [7, 8.2], [9, 9], [10.6, 8.2]]);
  halo(c, 7, 8.6, 3, 'rgba(255,110,30,.5)');
  // tête
  ell(c, 12.2, 6.4, 2.7, 2.4, fillOf(c, ['#4a3a3a', '#2a1a1a'], 4, 9));
  shape(c, '#3a2a2a', [[13, 6.4], [15.8, 7.4], [15.4, 8.8], [12.4, 8.6]]);
  shape(c, '#3a2a2a', [[10.4, 5], [10.8, 2.2], [11.8, 4.2]]);
  shape(c, '#3a2a2a', [[12.4, 4.2], [13.4, 2], [13.8, 4.6]]);
  shape(c, '#ff6a1a', [[10.9, 4.4], [11, 3.1], [11.4, 4.1]]);
  halo(c, 12.8, 5.8, 1.4, 'rgba(255,200,80,.8)', 0.8);
  ell(c, 12.8, 5.8, 0.55, 0.45, '#ffd060');
  line(c, '#ff6a1a', 0.5, [[13.4, 8.4], [15.6, 8.2]]);
}

function golem(c, s) {
  shadow(c, 8, 6, 0.35);
  const ROCK = ['#6a6066', '#4a4046', '#2a2226'];
  // pieds
  ell(c, 5.4, 14.2, 1.8, 1, '#2a2226');
  ell(c, 10.6, 14.2, 1.8, 1, '#2a2226');
  // bras massifs
  ell(c, 1.6, 9 + s, 1.7, 3.2, fillOf(c, ROCK, 6, 12.5), 0.1);
  ell(c, 14.4, 9 + (1 - s), 1.7, 3.2, fillOf(c, ROCK, 6, 12.5), -0.1);
  // corps en blocs de pierre
  shape(c, fillOf(c, ROCK, 3, 14), [[3, 5], [13, 5], [13.4, 13.6], [2.6, 13.6]]);
  line(c, '#2a2226', 0.3, [[3, 9.4], [13.2, 9.4]]);
  line(c, '#2a2226', 0.3, [[7.4, 9.4], [7, 13.6]]);
  // fissures de lave
  line(c, '#ff5a1a', 0.5, [[5, 10.6], [6.2, 11.8], [5.6, 13]]);
  line(c, '#ff5a1a', 0.5, [[10.6, 10.4], [9.6, 11.6], [10.4, 12.8]]);
  halo(c, 8, 11.4, 3.5, 'rgba(255,90,30,.45)');
  // tête
  shape(c, fillOf(c, ['#7a7076', '#5a5056'], 1.6, 6.4), [[4, 2.4], [12, 2], [12.4, 6.4], [3.6, 6.6]]);
  for (const x of [6, 10]) (halo(c, x, 4.4, 1.8, 'rgba(255,138,42,.8)', 0.9), shape(c, '#ff8a2a', [[x - 1, 3.8], [x + 1, 3.8], [x + 0.6, 5], [x - 0.6, 5]]));
  line(c, '#ff5a1a', 0.6, [[6.4, 8], [9.6, 8]]);
  ell(c, 5, 2.6, 1.4, 0.5, 'rgba(255,255,255,.2)');
}

function fireball(c, s) {
  halo(c, 8, 8, 7, 'rgba(255,110,30,.6)');
  shape(c, '#ff5a1a', (k) => (k.moveTo(3, 9.6), k.quadraticCurveTo(4, 2 + s, 9 + s, 1.4), k.quadraticCurveTo(7.4, 4, 13, 8), k.quadraticCurveTo(12, 13.4, 8, 13.4), k.quadraticCurveTo(3.4, 13.4, 3, 9.6)));
  ell(c, 8, 9.6, 3.4, 3, '#ff9a2a');
  ell(c, 8, 10, 2, 1.8, '#ffe080');
}

// ------------------------------------------------------------------ tableau
export const MONSTER_ART = {
  snowman, wolf, penguin,
  boar, squirrel, wasp, shroom, acorn, thorn,
  rat, bat: (c, s) => bat(c, s), thief, knife,
  skeleton, ghost, armor,
  snake, scorpion, vulture, mummy,
  crab, jelly, eel, lantern, tentacle,
  firebat, imp, lavawolf, golem, fireball,
};

/** Dessine un monstre en grand : (x, y) = le sol sous lui, s = taille de 16 unités. */
export function drawMonster(c, kind, x, y, s, step = 0) {
  unit16(c, x, y, s, (k) => MONSTER_ART[kind](k, step));
}

/** Image détaillée d'un monstre (PC) : 'wolf_0'... dans un carré de 32 × 32. False sinon. */
export function paintMonsterHD(c, name) {
  const m = /^([a-z]+)_([01])$/.exec(name);
  if (!m || !MONSTER_ART[m[1]]) return false;
  unit16(c, 16, 30, 32, (k) => MONSTER_ART[m[1]](k, Number(m[2])));
  return true;
}

