// LES HABITANTS QUI NE SONT PAS DES HUMAINS, en dessins lisses (version PC détaillée, 32 × 32 pixels) :
// Pingo le pingouin, Hulotte la chouette, le chat de Bourg-Lanterne, le gnome du Labyrinthe, le puits
// qui parle, la sirène et Alia. Repère 16 × 16 (sol en y = 15), comme les personnages pixel ;
// dir = 'down' (de face), 'up' (de dos), 'side' (de profil, vers la droite) ; step = pas de marche.
import { fillOf, radial, ell, shape, line, twinkle } from './kit.js';
import { unit16 } from './monsters.js';
import { drawAlia, RAINBOW } from '../data/story.js';

const shadow = (c, rx = 4) => ell(c, 8, 15, rx, rx * 0.2, 'rgba(0,0,0,.28)');
const dot = (c, x, y, r, col = '#141414') => (ell(c, x, y, r, r, col), ell(c, x - r * 0.35, y - r * 0.35, r * 0.35, r * 0.35, 'rgba(255,255,255,.9)'));

function pingo(c, dir, step) {
  shadow(c);
  const side = dir === 'side';
  ell(c, 6, 14.6, 1.3, 0.5 + step * 0.2, '#ffb03a');
  ell(c, 10, 14.6, 1.3, 0.7 - step * 0.2, '#ffb03a');
  ell(c, 8, 8.8, 4.3, 5.8, fillOf(c, ['#3a4058', '#22283a'], 3, 14.5));
  ell(c, 3.8, 9.4 + step * 0.5, 1, 2.8, '#22283a', 0.3);
  ell(c, 12.2, 9.4 - step * 0.5 + 0.5, 1, 2.8, '#22283a', -0.3);
  if (dir !== 'up') {
    ell(c, side ? 9.4 : 8, 9.8, side ? 2.2 : 2.8, 4.4, radial(c, 7.4, 8.5, 5, ['#ffffff', '#ffffff', '#dfe6f0']));
    if (side) (ell(c, 10.4, 5.4, 1.1, 1.1, '#ffffff'), dot(c, 10.7, 5.5, 0.5), shape(c, '#ffb03a', [[11.6, 6], [14, 6.6], [11.6, 7.2]]));
    else {
      for (const x of [6.5, 9.5]) (ell(c, x, 5.4, 1.1, 1.1, '#ffffff'), dot(c, x + 0.1, 5.5, 0.5));
      shape(c, '#ffb03a', [[7, 6.5], [9, 6.5], [8, 7.8]]);
      ell(c, 5.4, 7, 0.7, 0.4, 'rgba(255,140,160,.5)');
      ell(c, 10.6, 7, 0.7, 0.4, 'rgba(255,140,160,.5)');
    }
  }
  // écharpe rouge : on le reconnaît de loin
  line(c, '#e83a4a', 1.1, [[4.2, 9], [8, 9.6], [11.8, 9]]);
  line(c, '#e83a4a', 0.9, side || dir === 'up' ? [[4.6, 9.4], [3, 11.6 + step * 0.4]] : [[10, 9.6], [10.6, 12]]);
  line(c, '#ffffff', 0.3, [[5.5, 9.1], [6, 9.3]]);
}

function owl(c, dir, step) {
  shadow(c);
  const y = step * 0.6;
  const side = dir === 'side';
  ell(c, 6, 14.8, 1, 0.4, '#f08a1a');
  ell(c, 10, 14.8, 1, 0.4, '#f08a1a');
  ell(c, 8, 9.2 + y, 5, 5.8 - y * 0.5, radial(c, 7, 7, 7, ['#b07a40', '#8a5a2a', '#6a4220']));
  // aigrettes
  shape(c, '#8a5a2a', [[3.4, 5 + y], [3, 1.6 + y], [5.6, 4 + y]]);
  shape(c, '#8a5a2a', [[12.6, 5 + y], [13, 1.6 + y], [10.4, 4 + y]]);
  // ailes
  ell(c, 3.2, 10 + y, 1.4, 3.6, '#6a4220', 0.15);
  ell(c, 12.8, 10 + y, 1.4, 3.6, '#6a4220', -0.15);
  for (const yy of [8.6, 10.4, 12.2]) (line(c, '#4a2a10', 0.2, [[2.6, yy + y], [3.6, yy + 0.6 + y]]), line(c, '#4a2a10', 0.2, [[13.4, yy + y], [12.4, yy + 0.6 + y]]));
  if (dir === 'up') {
    for (const [x, yy] of [[6, 7], [10, 8], [7.4, 10.6], [9.6, 12]]) shape(c, '#6a4220', [[x - 0.8, yy + y], [x, yy + 1 + y], [x + 0.8, yy + y]]);
    return;
  }
  // ventre moucheté
  ell(c, side ? 9 : 8, 11.4 + y, 2.8, 2.8 - y * 0.3, '#e8c890');
  for (const [x, yy] of [[7, 10.6], [9, 11.2], [8, 12.6], [10, 12.4]]) shape(c, '#a87a40', [[x - 0.4, yy + y], [x, yy + 0.6 + y], [x + 0.4, yy + y]]);
  // grands yeux (lunettes de savante)
  const eyes = side ? [9.6] : [5.9, 10.1];
  for (const x of eyes) {
    ell(c, x, 6.2 + y, 2, 2, '#f4e0b0');
    ell(c, x, 6.2 + y, 1.5, 1.5, '#ffe066');
    dot(c, x + (side ? 0.4 : 0), 6.3 + y, 0.8);
  }
  shape(c, '#f08a1a', side ? [[11.4, 7 + y], [13.4, 7.8 + y], [11.4, 8.6 + y]] : [[7.2, 7.6 + y], [8.8, 7.6 + y], [8, 9.2 + y]]);
}

function cat(c, dir, step) {
  shadow(c);
  const ORANGE = ['#f8b050', '#e8902a', '#c8701a'];
  // queue
  line(c, '#e8902a', 1.2, [[11, 11], [13 - step * 0.6, 8], [12.4 - step, 4.4]]);
  line(c, '#c8701a', 0.5, [[12.6 - step * 0.6, 7], [12.8 - step * 0.8, 6]]);
  // corps assis
  ell(c, 7.4, 11.4, 4.2, 3.2, fillOf(c, ORANGE, 8, 14.6));
  if (dir !== 'up') ell(c, 7, 12, 2.4, 2.2, '#ffffff');
  ell(c, 5, 14.4 + step * 0.2, 1.3, 0.7, '#e8902a');
  ell(c, 9.6, 14.6 - step * 0.2, 1.3, 0.6, '#e8902a');
  // tête
  ell(c, 6.6, 6.6, 3.8, 3.2, fillOf(c, ORANGE, 3.4, 10));
  shape(c, '#e8902a', [[3.2, 5.4], [3.4, 1.8], [5.8, 4]]);
  shape(c, '#e8902a', [[10, 5.4], [9.8, 1.8], [7.4, 4]]);
  shape(c, '#ffb0c0', [[3.8, 4.6], [3.9, 2.8], [5.2, 4]]);
  shape(c, '#ffb0c0', [[9.4, 4.6], [9.3, 2.8], [8, 4]]);
  // rayures
  for (const x of [5.6, 6.6, 7.6]) line(c, '#c8701a', 0.35, [[x, 3.6], [x, 4.8]]);
  for (const yy of [10, 11.6]) line(c, '#c8701a', 0.4, [[3.4, yy], [4.6, yy + 0.3]]);
  if (dir === 'up') return;
  ell(c, 6.6, 8.2, 1.8, 1, '#ffffff');
  for (const x of [5, 8.2]) (ell(c, x, 6.4, 0.9, 1, '#5ac85a'), ell(c, x, 6.4, 0.25, 0.8, '#141414'));
  shape(c, '#e86a8a', [[6.2, 7.6], [7, 7.6], [6.6, 8.2]]);
  for (const dy of [-0.4, 0.3]) (line(c, 'rgba(255,255,255,.8)', 0.15, [[5, 8.4], [2.4, 8.2 + dy * 2]]), line(c, 'rgba(255,255,255,.8)', 0.15, [[8.2, 8.4], [10.8, 8.2 + dy * 2]]));
}

function gnome(c, dir, step) {
  shadow(c);
  ell(c, 6, 14.4, 1.4, 0.8 + step * 0.2, '#5a3a1c');
  ell(c, 10, 14.4, 1.4, 1 - step * 0.2, '#5a3a1c');
  // manteau bleu
  shape(c, fillOf(c, ['#5a8ae8', '#3a6ac8', '#2a4a98'], 8, 14), [[4.4, 8.6], [11.6, 8.6], [12.4, 14], [3.6, 14]]);
  ell(c, 3.4, 10.6 + step * 0.4, 1, 1.8, '#3a6ac8');
  ell(c, 12.6, 10.6 - step * 0.4 + 0.4, 1, 1.8, '#3a6ac8');
  ell(c, 3.4, 12.2 + step * 0.4, 0.8, 0.7, '#f2c49b');
  ell(c, 12.6, 12.6 - step * 0.4, 0.8, 0.7, '#f2c49b');
  // visage
  ell(c, 8, 7, 3, 2.4, '#f2c49b');
  if (dir !== 'up') {
    // grande barbe blanche
    shape(c, fillOf(c, ['#ffffff', '#e0e0e8'], 7, 13), (k) => {
      k.moveTo(4.6, 7.4);
      k.quadraticCurveTo(4.4, 12, 8, 13.4);
      k.quadraticCurveTo(11.6, 12, 11.4, 7.4);
      k.quadraticCurveTo(8, 9.4, 4.6, 7.4);
    });
    line(c, '#d0d0d8', 0.25, [[6.4, 9.4], [7, 11.6]]);
    line(c, '#d0d0d8', 0.25, [[9.6, 9.4], [9, 11.6]]);
    dot(c, 6.6, 6.8, 0.45);
    dot(c, 9.4, 6.8, 0.45);
    ell(c, 8, 8, 1, 0.8, '#e89a7a');
    ell(c, 5.6, 7.8, 0.6, 0.4, 'rgba(255,120,120,.4)');
    ell(c, 10.4, 7.8, 0.6, 0.4, 'rgba(255,120,120,.4)');
  } else ell(c, 8, 8.4, 3, 1.6, '#e0e0e8');
  // bonnet pointu rouge
  shape(c, fillOf(c, ['#ff5a5a', '#e83a3a', '#b82a2a'], 0, 6), (k) => {
    k.moveTo(3.4, 5.8);
    k.quadraticCurveTo(6, 3, 8.4, -0.4 + step * 0.4);
    k.quadraticCurveTo(11, 2.6, 12.6, 5.8);
  });
  line(c, '#c82a2a', 0.8, [[3.4, 5.6], [12.6, 5.6]]);
  ell(c, 8.4, -0.2 + step * 0.4, 0.6, 0.6, '#ffd35a');
}

function well(c) {
  shadow(c, 6);
  // margelle de pierres
  shape(c, fillOf(c, ['#c8a870', '#a8885a', '#7a6040'], 8, 15), [[2, 8.4], [14, 8.4], [14, 14.6], [2, 14.6]]);
  for (const [x, y] of [[2, 10.4], [6, 10.4], [10, 10.4], [4, 12.6], [8, 12.6], [12, 12.6]]) line(c, '#6a5030', 0.25, [[x, y], [Math.min(14, x + 4), y]]);
  for (const [x, y] of [[6, 8.4], [10, 8.4], [4, 10.4], [8, 10.4], [12, 10.4], [6, 12.6], [10, 12.6]]) line(c, '#6a5030', 0.25, [[x, y], [x, y + 2.2]]);
  ell(c, 8, 8.6, 6, 1.4, '#c8a870');
  ell(c, 8, 8.8, 4.6, 0.9, fillOf(c, ['#5a9ae8', '#2a5aa8'], 8, 9.6));
  ell(c, 6.6, 8.6, 1, 0.25, 'rgba(255,255,255,.7)');
  // poteaux et toit rouge
  line(c, '#6a4220', 1, [[3, 8.6], [3, 1.6]]);
  line(c, '#6a4220', 1, [[13, 8.6], [13, 1.6]]);
  shape(c, fillOf(c, ['#f05a4a', '#d84a3a', '#a8302a'], -0.4, 2.6), [[0.6, 2.4], [8, -0.6], [15.4, 2.4], [14.6, 2.8], [1.4, 2.8]]);
  line(c, '#8a2a2a', 0.3, [[2, 2.2], [8, -0.1], [14, 2.2]]);
  // corde et seau
  line(c, '#c8b070', 0.4, [[8, 2.6], [8, 6]]);
  shape(c, fillOf(c, ['#a87040', '#7a4a20'], 5.8, 8), [[6.6, 5.8], [9.4, 5.8], [9, 7.8], [7, 7.8]]);
  line(c, '#4a2a10', 0.3, [[6.8, 6.6], [9.2, 6.6]]);
  // un visage gentil : c'est le puits qui parle
  dot(c, 6.4, 11.2, 0.4);
  dot(c, 9.6, 11.2, 0.4);
  line(c, '#4a3020', 0.35, [[7.2, 12.2], [8, 12.7], [8.8, 12.2]]);
}

function mermaid(c, dir, step) {
  shadow(c, 5);
  const back = dir === 'up';
  // queue de poisson
  shape(c, fillOf(c, ['#7ae8c8', '#3ac8a8', '#1a9a88'], 9, 15), (k) => {
    k.moveTo(4.6, 10);
    k.quadraticCurveTo(4.4, 14.6, 9, 14.4);
    k.quadraticCurveTo(12, 14, 12.6, 12.6 - step * 0.6);
    k.quadraticCurveTo(10.6, 12, 11.2, 10);
  });
  shape(c, '#7ae8c8', [[12.2, 12.8 - step * 0.6], [15.4, 10.4 - step], [14.6, 13.2 - step * 0.4], [15.6, 15 - step * 0.2]]);
  for (const [x, y] of [[6, 11.4], [7.6, 12.4], [9.2, 12.8], [6.8, 13.2]]) line(c, 'rgba(255,255,255,.5)', 0.25, (k) => k.arc(x, y, 0.6, 0, Math.PI));
  // cheveux roux derrière
  shape(c, fillOf(c, ['#ff8a4a', '#e8642a'], 0, 10), (k) => {
    k.moveTo(4, 2.6);
    k.quadraticCurveTo(2.4, 7, 3.4, 10.4);
    k.lineTo(12.6, 10.4);
    k.quadraticCurveTo(13.6, 7, 12, 2.6);
  });
  // buste et coquillages
  shape(c, '#f2c49b', [[5.4, 6.4], [10.6, 6.4], [11, 10.2], [5, 10.2]]);
  if (!back) for (const x of [6.8, 9.2]) (ell(c, x, 8, 1.2, 1, '#ff6a8a'), line(c, '#c84a6a', 0.2, [[x, 7.1], [x, 8.9]]));
  // tête
  ell(c, 8, 3.8, 2.8, 3, back ? '#e8642a' : '#f2c49b');
  shape(c, '#e8642a', (k) => {
    k.moveTo(4.8, 4.2);
    k.bezierCurveTo(4.4, -0.6, 11.6, -0.6, 11.2, 4.2);
    k.quadraticCurveTo(9.6, 1.8, 8, 2.2);
    k.quadraticCurveTo(6.4, 1.8, 4.8, 4.2);
  });
  if (!back) {
    dot(c, 6.9, 4.1, 0.45, '#2a6a8a');
    dot(c, 9.1, 4.1, 0.45, '#2a6a8a');
    line(c, '#e86a6a', 0.35, [[7.4, 5.4], [8, 5.8], [8.6, 5.4]]);
  }
  // étoile de mer dans les cheveux
  twinkle(c, 11.6, 1.4 + step * 0.3, 1, '#ffd35a');
  ell(c, 11.6, 1.4 + step * 0.3, 0.4, 0.4, '#ffb030');
}

function alia(c, dir, step, t = 0) {
  shadow(c, 6);
  // Alia vient de l'histoire en images (story.js) : on la réduit à la case. De face ou de dos, on la
  // voit de profil vers la gauche (comme en pixel).
  c.save();
  if (dir !== 'side') (c.translate(16, 0), c.scale(-1, 1));
  drawAlia(c, 7.6, 15, 8.6, 0.6 + step * 0.4);
  c.restore();
  for (const [x, y] of [[2, 4], [14, 9]]) twinkle(c, x, y, 0.8, RAINBOW[(x + step) % 6], 0.8);
}

export const FOLK_ART = { pingo, owl, cat, gnome, well, mermaid, alia };

/** Image détaillée d'un habitant (PC) dans un carré 32 × 32. False si ce n'en est pas un. */
export function paintFolkHD(c, who, dir, step) {
  const f = FOLK_ART[who];
  if (!f) return false;
  unit16(c, 16, 30, 32, (k) => f(k, dir, step));
  return true;
}

