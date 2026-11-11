// Objets en HAUTE DÉFINITION (profil PC) : 32×32 pixels d'image pour une case de 16×16.
// Chaque fonction renvoie false si l'objet n'a pas de version HD (il est alors agrandi
// automatiquement).
import { P, R, disc, ellipse, tint, chestHD, coinHD } from './hd.js';

const shadow = (c, cx = 16, y = 29, rx = 9) => ellipse(c, cx, y, rx, 1, 'rgba(0,0,0,.28)');

/** Cœur au pixel près (motif 7×6 agrandi), avec reflet et ombre intérieure. */
function heartShape(c, x, y, s, col, light, dark) {
  const rows = ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...'];
  rows.forEach((row, j) => [...row].forEach((ch, i) => ch === '#' && P(c, x + i * s, y + j * s, s, s, col)));
  P(c, x + 5 * s, y + 2 * s, s, 2 * s, dark);
  P(c, x + 4 * s, y + 4 * s, s, s, dark);
  P(c, x + s, y + s, s, s, light);
  P(c, x + s + Math.floor(s / 2), y + Math.floor(s / 2), Math.ceil(s / 2), Math.ceil(s / 2), '#ffffff');
}

function flower(c, x, y, petal, heart = '#ffd84a') {
  P(c, x - 1, y - 3, 3, 2, petal);
  P(c, x - 1, y + 2, 3, 2, petal);
  P(c, x - 3, y - 1, 2, 3, petal);
  P(c, x + 2, y - 1, 2, 3, petal);
  P(c, x - 2, y - 2, 1, 1, tint(petal, -0.15));
  R(c, x - 1, y - 1, 3, 3, heart);
  P(c, x - 1, y - 1, 1, 1, '#ffffff');
}

/**
 * Dessine l'objet `name` en 32×32. `p` : palette de l'ambiance.
 * @returns {boolean|void} false = pas de version HD
 */
export function objectHD(c, name, p) {
  switch (name) {
    case 'chest':
    case 'chest_open':
      return chestHD(c, name === 'chest_open', p);
    case 'coin':
      return coinHD(c, p);
    case 'key': {
      const k = p.key;
      const kd = tint(k, -0.35);
      disc(c, 9, 16, 6, kd);
      disc(c, 9, 15, 6, k);
      c.clearRect(8, 14, 3, 3); // trou de l'anneau
      P(c, 6, 11, 3, 2, tint(k, 0.5));
      R(c, 14, 14, 15, 4, kd);
      R(c, 14, 13, 15, 4, k);
      P(c, 15, 13, 13, 1, tint(k, 0.5));
      P(c, 22, 17, 3, 4, k);
      P(c, 26, 17, 3, 5, k);
      P(c, 22, 20, 3, 1, kd);
      return;
    }
    case 'heart':
      shadow(c, 16, 27, 6);
      return heartShape(c, 9, 9, 2, p.heart, p.heartLight, tint(p.heart, -0.3));
    case 'heart_container':
      shadow(c, 16, 30, 11);
      heartShape(c, 2, 4, 4, p.heart, p.heartLight, tint(p.heart, -0.3));
      for (const [x, y] of [[26, 3], [3, 20], [28, 14]]) (P(c, x, y - 1, 1, 3, '#fff4a0'), P(c, x - 1, y, 3, 1, '#fff4a0'));
      return;
    case 'potion': {
      shadow(c, 16, 29, 8);
      R(c, 12, 2, 8, 4, '#8a5a2a'); // bouchon
      P(c, 13, 2, 3, 1, '#c8904a');
      R(c, 12, 6, 8, 6, '#dceeff'); // goulot
      disc(c, 16, 20, 9, '#dceeff');
      disc(c, 16, 21, 8, p.potion);
      P(c, 8, 17, 17, 3, '#dceeff'); // surface du liquide
      P(c, 9, 19, 15, 1, tint(p.potion, 0.35));
      R(c, 10, 21, 3, 5, 'rgba(255,255,255,.6)');
      disc(c, 20, 24, 1, tint(p.potion, 0.4));
      return;
    }
    case 'sword_down':
    case 'sword_up':
    case 'sword_side': {
      const blade = p.blade;
      const hilt = p.hilt;
      if (name === 'sword_side') {
        R(c, 0, 13, 6, 6, hilt);
        P(c, 1, 14, 4, 1, tint(hilt, 0.3));
        R(c, 6, 9, 3, 14, '#d8c070'); // garde
        P(c, 9, 13, 20, 6, blade);
        P(c, 9, 13, 20, 2, '#ffffff');
        P(c, 9, 17, 20, 2, tint(blade, -0.25));
        P(c, 29, 14, 2, 4, blade);
        P(c, 31, 15, 1, 2, blade);
        return;
      }
      const upw = name === 'sword_up';
      const flip = (y, h) => (upw ? 32 - y - h : y);
      P(c, 14, flip(0, 6), 4, 6, hilt);
      P(c, 15, flip(0, 6), 1, 6, tint(hilt, 0.3));
      R(c, 9, flip(6, 3), 14, 3, '#d8c070');
      P(c, 13, flip(9, 20), 6, 20, blade);
      P(c, 13, flip(9, 20), 2, 20, '#ffffff');
      P(c, 17, flip(9, 20), 2, 20, tint(blade, -0.25));
      P(c, 14, flip(29, 2), 4, 2, blade);
      P(c, 15, flip(31, 1), 2, 1, blade);
      return;
    }
    case 'poof_0':
      disc(c, 16, 16, 8, 'rgba(255,255,255,.95)');
      for (const [x, y] of [[8, 10], [24, 11], [10, 23], [23, 22]]) disc(c, x, y, 4, 'rgba(230,230,230,.9)');
      return;
    case 'poof_1':
      for (const [x, y] of [[5, 5], [26, 5], [5, 26], [26, 26], [16, 2], [16, 29], [2, 16], [29, 16]]) disc(c, x, y, 2, 'rgba(210,210,210,.85)');
      return;
    case 'flowers':
    case 'bouquet': {
      const stem = '#3a8a2a';
      for (const [x, y] of [[15, 18], [11, 20], [20, 20], [16, 22]]) P(c, x, y, 2, 30 - y, stem);
      P(c, 9, 22, 3, 2, '#5ab048');
      P(c, 20, 24, 3, 2, '#5ab048');
      flower(c, 9, 7, p.flowerA);
      flower(c, 19, 6, p.flowerB);
      flower(c, 14, 13, p.flowerB);
      flower(c, 23, 14, p.flowerA);
      if (name === 'bouquet') {
        R(c, 8, 20, 16, 4, p.ribbon);
        P(c, 9, 20, 14, 1, tint(p.ribbon, 0.35));
        P(c, 7, 24, 4, 6, p.ribbon);
        P(c, 21, 24, 4, 6, p.ribbon);
        R(c, 14, 19, 4, 6, p.ribbonDark);
      }
      return;
    }
    case 'ribbon':
      R(c, 3, 9, 11, 11, p.ribbon);
      R(c, 18, 9, 11, 11, p.ribbon);
      P(c, 5, 11, 6, 2, tint(p.ribbon, 0.35));
      P(c, 20, 11, 6, 2, tint(p.ribbon, 0.35));
      R(c, 12, 11, 8, 7, p.ribbonDark);
      P(c, 10, 18, 4, 11, p.ribbon);
      P(c, 18, 18, 4, 11, p.ribbon);
      P(c, 10, 28, 2, 2, p.ribbonDark);
      P(c, 20, 28, 2, 2, p.ribbonDark);
      return;
    case 'mushroom':
      shadow(c, 16, 28, 7);
      R(c, 12, 17, 8, 10, p.mushStem);
      P(c, 18, 18, 2, 9, tint(p.mushStem, -0.15));
      ellipse(c, 16, 12, 12, 7, tint(p.mushCap, -0.25));
      ellipse(c, 16, 11, 11, 6, p.mushCap);
      P(c, 5, 15, 23, 3, tint(p.mushCap, -0.25));
      for (const [x, y, r] of [[10, 9, 2], [19, 7, 2], [22, 13, 1], [14, 14, 1]]) disc(c, x, y, r, '#ffffff');
      P(c, 8, 7, 3, 1, tint(p.mushCap, 0.4));
      return;
    case 'amulet':
      for (let i = 0; i <= 12; i++) P(c, 9 + i, 3 + Math.round(Math.abs(i - 6) * 0.7), 1, 1, p.metal);
      disc(c, 16, 18, 9, p.metalDark);
      disc(c, 16, 18, 8, p.metal);
      disc(c, 16, 18, 6, tint(p.amulet, -0.3));
      disc(c, 16, 18, 5, p.amulet);
      R(c, 12, 14, 3, 3, 'rgba(255,255,255,.8)');
      return;
    case 'apple':
      shadow(c, 16, 29, 9);
      P(c, 15, 2, 2, 6, '#6a4220');
      ellipse(c, 21, 5, 4, 2, '#3a8a2a');
      P(c, 19, 5, 4, 1, '#6ac04a');
      disc(c, 11, 17, 8, '#c8282a');
      disc(c, 21, 17, 8, '#c8282a');
      disc(c, 16, 19, 9, '#d8302a');
      P(c, 13, 8, 6, 2, '#a82020');
      R(c, 9, 12, 4, 5, '#ff9a8a');
      P(c, 22, 22, 4, 3, '#a82020');
      return;
    case 'cake':
      shadow(c, 16, 29, 12);
      R(c, 4, 15, 24, 13, '#e8c890'); // biscuit
      P(c, 4, 21, 24, 2, '#ff8ab0'); // crème
      R(c, 4, 11, 24, 6, '#ff8ab0');
      for (const x of [6, 11, 16, 21, 25]) P(c, x, 16, 2, 2 + (x % 3), '#ff8ab0'); // coulures
      P(c, 5, 11, 22, 1, '#ffc0d8');
      R(c, 14, 3, 4, 8, '#ffffff'); // bougie
      P(c, 15, 3, 1, 8, '#e0e0ff');
      ellipse(c, 16, 1, 1, 2, '#ffb030');
      for (const [x, y, col] of [[8, 13, '#e8303a'], [22, 13, '#e8303a'], [11, 12, '#5ac83a'], [19, 12, '#3a8ad8']]) P(c, x, y, 2, 2, col);
      return;
    case 'tarte':
      shadow(c, 16, 28, 13);
      ellipse(c, 16, 19, 14, 7, '#a8602a');
      ellipse(c, 16, 17, 13, 6, '#e8b060');
      ellipse(c, 16, 17, 10, 4, '#c8402a'); // fruits
      for (let i = 0; i < 5; i++) P(c, 7 + i * 4, 13 + (i % 2) * 6, 6, 1, '#f0c878'); // croisillons
      for (const [x, y] of [[10, 16], [18, 15], [22, 18], [14, 19]]) P(c, x, y, 2, 1, '#ff7a6a');
      P(c, 3, 22, 26, 2, '#8a4a20');
      return;
    case 'planks':
      for (let i = 0; i < 3; i++) {
        const y = 5 + i * 8;
        R(c, 2 + i, y + 1, 28 - i, 6, '#7a5028');
        R(c, 2 + i, y, 28 - i, 6, '#b07a40');
        P(c, 3 + i, y, 26 - i, 1, '#d8a060');
        P(c, 6 + i * 5, y + 2, 8, 1, '#946232');
        disc(c, 9 + i * 6, y + 3, 1, '#5a3a1c');
      }
      return;
    case 'nails':
      for (const [x, tilt] of [[8, 0], [16, 1], [24, 0]]) {
        R(c, x - 3, 4 + tilt, 7, 3, '#d8d8e0');
        P(c, x - 2, 4 + tilt, 4, 1, '#ffffff');
        P(c, x - 1, 7 + tilt, 3, 18, '#9a9aa8');
        P(c, x - 1, 7 + tilt, 1, 18, '#c8c8d0');
        P(c, x, 25 + tilt, 1, 3, '#7a7a88');
      }
      return;
    case 'hint':
      disc(c, 16, 11, 9, tint(p.hint, -0.2));
      disc(c, 16, 10, 9, p.hint);
      disc(c, 13, 7, 3, '#fff8c8');
      R(c, 12, 19, 8, 7, '#9a9aa8');
      for (const y of [21, 24]) P(c, 12, y, 8, 1, '#6a6a78');
      R(c, 14, 26, 4, 2, '#6a6a78');
      for (const [x, y] of [[3, 4], [28, 4], [2, 14], [29, 14]]) P(c, x, y, 2, 2, '#fff4a0');
      return;
    case 'big_bag':
      shadow(c, 16, 30, 12);
      R(c, 9, 2, 14, 4, p.bagDark); // anses
      P(c, 6, 4, 4, 7, p.bagDark);
      P(c, 22, 4, 4, 7, p.bagDark);
      R(c, 3, 9, 26, 20, p.bag);
      P(c, 3, 9, 26, 4, p.bagDark);
      P(c, 5, 14, 3, 12, tint(p.bag, 0.2));
      R(c, 11, 16, 10, 7, p.bagDark);
      R(c, 14, 18, 4, 3, '#ffd35a');
      for (const y of [14, 27]) for (let x = 6; x < 28; x += 4) P(c, x, y, 2, 1, tint(p.bag, -0.3)); // coutures
      return;
    case 'block':
      P(c, 0, 0, 32, 32, p.blockDark);
      R(c, 0, 0, 30, 30, p.block);
      P(c, 1, 0, 28, 2, p.blockLight);
      P(c, 0, 1, 2, 28, p.blockLight);
      R(c, 7, 7, 16, 16, p.blockDark);
      R(c, 9, 9, 13, 13, p.block);
      P(c, 9, 9, 13, 1, p.blockLight);
      for (const [x, y] of [[4, 4], [25, 4], [4, 25], [25, 25]]) (P(c, x, y, 2, 2, p.blockDark), P(c, x, y, 1, 1, p.blockLight));
      return;
    case 'plate':
    case 'plate_down': {
      const up = name === 'plate';
      R(c, 3, 3, 26, 26, p.plateDark);
      R(c, 5, up ? 4 : 6, 22, 22, up ? p.plate : tint(p.plateDark, 0.1));
      if (up) P(c, 6, 4, 20, 2, p.plateLight);
      disc(c, 16, up ? 15 : 17, 3, up ? p.plateDark : p.plate);
      return;
    }
    case 'gate':
      P(c, 0, 0, 32, 32, 'rgba(0,0,0,.5)');
      for (let x = 2; x < 32; x += 8) (P(c, x, 0, 4, 32, p.metal), P(c, x, 0, 1, 32, tint(p.metal, 0.4)), P(c, x + 3, 0, 1, 32, p.metalDark));
      for (const y of [6, 22]) (P(c, 0, y, 32, 4, p.metalDark), P(c, 0, y, 32, 1, tint(p.metalDark, 0.3)));
      for (let x = 2; x < 32; x += 8) for (const y of [7, 23]) P(c, x + 1, y, 2, 2, p.metal);
      return;
    case 'locked':
      P(c, 0, 0, 32, 32, p.chestDark);
      R(c, 2, 2, 28, 28, p.chest);
      for (const x of [9, 22]) P(c, x, 2, 1, 28, tint(p.chest, -0.2));
      P(c, 14, 0, 4, 32, p.chestDark);
      R(c, 9, 10, 14, 13, p.metalDark);
      R(c, 10, 10, 12, 12, p.metal);
      P(c, 11, 11, 10, 1, tint(p.metal, 0.4));
      disc(c, 16, 14, 2, '#141414');
      P(c, 15, 15, 3, 5, '#141414');
      return;
    case 'lever_off':
    case 'lever_on': {
      const on = name === 'lever_on';
      R(c, 5, 21, 22, 9, p.metalDark);
      P(c, 6, 21, 20, 2, p.metal);
      for (let i = 0; i < 14; i++) P(c, (on ? 16 + i * 0.6 : 15 - i * 0.6) | 0, 21 - i, 2, 1, '#8a5a2a');
      disc(c, on ? 24 : 7, 6, 3, on ? p.on : p.off);
      P(c, on ? 23 : 6, 4, 2, 1, '#ffffff');
      return;
    }
    case 'pet_0':
    case 'pet_1':
    case 'blob_0':
    case 'blob_1':
    case 'flyer_0':
    case 'flyer_1':
      return false; // dessinés dans hd-people.js
    default:
      return false;
  }
}
