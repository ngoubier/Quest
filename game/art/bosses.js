// LES 7 BOSS en dessins lisses. Chaque dessin est fait dans le repère 32 × 32 de kit.js (sol en y = 30) :
// il sert pour l'image détaillée du jeu (PC, 64 × 64 pixels) et pour la page qui présente le boss.
//   draw(c, pose, t) — pose 0 / 1 = les deux images de l'animation ; t = temps (pour les grandes images).
//   shield(c, t)    — ce qui le protège, dessiné par-dessus.
import { TAU, unit, fillOf, radial, ell, shape, line, groundShadow, halo, twinkle, eye } from './kit.js';

// ------------------------------------------------------------------ le Yéti Grondeur
function yeti(c, p, t) {
  const b = p * 0.8 + Math.sin(t * 2) * 0.3; // il respire
  groundShadow(c, 16, 12);
  const FUR = '#f4f8fd';
  const FUR_D = '#c6d6ea';
  const FUR_DD = '#9db4cc';
  // jambes
  for (const x of [10.5, 21.5]) (ell(c, x, 26.5, 4.2, 3.8, FUR_D), ell(c, x, 28.6, 4.4, 1.6, FUR_DD));
  // corps : grosse boule de poils
  ell(c, 16, 18 + b, 11.5, 10.5, radial(c, 13, 13 + b, 16, [FUR, FUR, FUR_D]));
  // touffes sur le bord
  for (let k = 0; k < 14; k++) {
    const a = Math.PI * 0.1 + (k / 13) * Math.PI * 0.8;
    const x = 16 + Math.cos(a) * 11;
    const y = 18 + b + Math.sin(a) * 10;
    shape(c, FUR_D, [[x - 1.3, y - 0.5], [x + Math.cos(a) * 2, y + Math.sin(a) * 2], [x + 1.3, y - 0.5]]);
  }
  ell(c, 16, 21 + b, 6.5, 6, 'rgba(206,224,242,.7)'); // ventre
  for (const [x, y] of [[13, 19], [18, 22], [15, 24]]) line(c, FUR_D, 0.5, [[x, y + b], [x + 0.8, y + 1.5 + b]]);
  // bras (levés sur l'image 1)
  for (const dir of [-1, 1]) {
    const ax = 16 + dir * 12;
    const ay = 17 + b - p * 2;
    ell(c, ax, ay, 3.6, 7.5, fillOf(c, [FUR, FUR_D], ay - 7, ay + 7), dir * (0.25 + p * 0.25));
    const hx = ax + dir * (1.6 + p);
    const hy = ay + 6.5 - p;
    ell(c, hx, hy, 3, 2.4, FUR_DD);
    for (const k of [-1, 0, 1]) shape(c, '#e8f8ff', [[hx + k * 1.4 - 0.5, hy + 1.6], [hx + k * 1.6, hy + 3.4], [hx + k * 1.4 + 0.5, hy + 1.6]]);
  }
  // tête
  const hy = 9.5 + b;
  ell(c, 16, hy, 8.5, 7.5, radial(c, 14, hy - 3, 10, [FUR, FUR_D]));
  // cornes de glace
  for (const dir of [-1, 1]) {
    shape(c, fillOf(c, ['#ffffff', '#9fd8f8', '#5aa8d8'], hy - 9, hy - 2), (k) => {
      k.moveTo(16 + dir * 5, hy - 4);
      k.quadraticCurveTo(16 + dir * 10, hy - 5, 16 + dir * 9.5, hy - 10.5);
      k.quadraticCurveTo(16 + dir * 8, hy - 7, 16 + dir * 7.5, hy - 2.5);
    });
    line(c, 'rgba(255,255,255,.8)', 0.4, [[16 + dir * 7, hy - 4.3], [16 + dir * 9, hy - 8.5]]);
  }
  // visage bleu
  ell(c, 16, hy + 1.8, 5.8, 4.8, fillOf(c, ['#8cc4ec', '#5a94c8'], hy - 3, hy + 6.5));
  eye(c, 13.4, hy + 0.8, 1.6, { iris: '#c8202a', pupil: '#4a0808', angry: -1, lid: '#3a6a98' });
  eye(c, 18.6, hy + 0.8, 1.6, { iris: '#c8202a', pupil: '#4a0808', angry: 1, lid: '#3a6a98' });
  // gueule et crocs
  shape(c, '#1c2a3c', (k) => {
    k.moveTo(12.6, hy + 3.6);
    k.quadraticCurveTo(16, hy + 4.8 + p * 1.2, 19.4, hy + 3.6);
    k.quadraticCurveTo(16, hy + 6.6 + p * 1.5, 12.6, hy + 3.6);
  });
  for (const x of [13.8, 18.2]) shape(c, '#ffffff', [[x - 0.6, hy + 3.9], [x, hy + 5.4], [x + 0.6, hy + 3.9]]);
  ell(c, 16, hy - 0.9, 0.9, 0.6, '#2a4a70'); // nez
  // flocons
  for (const [x, y, s] of [[3, 6, 0.9], [29, 4, 1.1], [27, 13, 0.7]]) twinkle(c, x, y + Math.sin(t * 3 + x) * 0.6, s, '#ffffff', 0.85);
}

function yetiShield(c, t) {
  // carapace de glace : des plaques translucides sur le corps
  const plates = [[6, 12, 8, 9], [14, 10, 8, 10], [21, 12, 7, 9], [8, 20, 8, 8], [17, 20, 8, 8]];
  plates.forEach(([x, y, w, h], i) => {
    shape(c, 'rgba(170,225,255,.55)', [[x + 1, y], [x + w, y + 1], [x + w - 1, y + h], [x, y + h - 1]]);
    line(c, 'rgba(255,255,255,.9)', 0.5, [[x + 1, y], [x + w, y + 1]]);
    line(c, 'rgba(255,255,255,.6)', 0.4, [[x + 2, y + 2 + (i % 2)], [x + 3.5, y + 4.5]]);
  });
  twinkle(c, 10, 13, 1.2 + Math.sin(t * 4) * 0.3, '#ffffff');
  twinkle(c, 22, 22, 1, '#ffffff');
}

// ------------------------------------------------------------------ Ronce-Noire
function ronce(c, p, t) {
  const s = p ? 1 : 0;
  const sway = Math.sin(t * 1.4) * 0.8 + (s ? 0.8 : -0.4);
  groundShadow(c, 16, 14, 0.35);
  // racines
  for (const [x0, x1, y1] of [[10, 2, 30], [12, 7, 31], [20, 25, 31], [22, 30, 29.5]]) line(c, '#3a2420', 2, [[x0, 26], [(x0 + x1) / 2, 28.5], [x1, y1]]);
  // tronc tordu
  shape(c, fillOf(c, ['#5a3a34', '#4a2e2a', '#3a2420'], 8, 29), (k) => {
    k.moveTo(8, 29);
    k.bezierCurveTo(10.5, 22, 7, 15, 9.5, 8);
    k.lineTo(22.5, 8);
    k.bezierCurveTo(25, 15, 21.5, 22, 24, 29);
    k.closePath();
  });
  for (const [x, y0, y1] of [[11, 10, 26], [20.5, 11, 27], [15.5, 22, 28]]) line(c, '#2a1a18', 0.6, [[x, y0], [x + 1.2, (y0 + y1) / 2], [x - 0.4, y1]]);
  line(c, 'rgba(255,220,200,.15)', 1, [[10, 10], [9.6, 18], [10.5, 26]]);
  // branches épineuses
  for (const dir of [-1, 1]) {
    const tip = [16 + dir * 15.5, 2.5 + (dir < 0 ? sway : -sway)];
    line(c, '#3a2420', 1.8, [[16 + dir * 5, 8.5], [16 + dir * 10, 5], tip]);
    line(c, '#3a2420', 1, [[16 + dir * 10, 5.5], [16 + dir * 12.5, 8.5 + sway * 0.3]]);
    for (const k of [0.45, 0.7, 0.92]) {
      const x = 16 + dir * (5 + 10.5 * k);
      const y = 8.5 - 6 * k + (dir < 0 ? sway : -sway) * k;
      shape(c, '#e8e0d0', [[x - 0.4, y], [x + dir * 0.3, y - 1.4], [x + 0.4, y]]);
      shape(c, '#e8e0d0', [[x - 0.4, y + 0.6], [x + dir * 0.6, y + 1.8], [x + 0.4, y + 0.6]]);
    }
  }
  // feuillage noir et violet
  for (const [x, y, r, col] of [[10, 4, 4.5, '#2a1a2a'], [16, 2.5, 5.5, '#2a1a2a'], [22, 4, 4.5, '#2a1a2a'], [11, 3, 2.5, '#4a2a4a'], [17, 1.5, 2.8, '#4a2a4a'], [22.5, 3.2, 2, '#4a2a4a']]) ell(c, x, y, r, r * 0.75, col);
  for (const [x, y] of [[9, 5], [14, 4], [20, 5.5], [24, 3]]) ell(c, x, y, 0.7, 0.7, '#c84ac8');
  // yeux jaunes à fente rouge, dans des creux d'écorce
  for (const [x, dir] of [[12.5, -1], [19.5, 1]]) {
    ell(c, x, 13.6, 3.4, 2.7, '#1a0e0c');
    halo(c, x, 13.6, 4, 'rgba(255,220,60,.5)', 0.7 + Math.sin(t * 3) * 0.2);
    eye(c, x, 13.6, 2.2, { white: '#ffde3a', iris: '#ff9a1a', pupil: '#c8202a', slit: true, angry: dir, lid: '#1a0e0c' });
  }
  // bouche
  shape(c, '#1a0e0c', (k) => {
    k.moveTo(11, 19.5 + s);
    k.quadraticCurveTo(16, 18 + s, 21, 19.5 + s);
    k.quadraticCurveTo(16, 23 + s * 1.5, 11, 19.5 + s);
  });
  for (const x of [13, 15.5, 18]) shape(c, '#e8e0d0', [[x - 0.5, 19.2 + s], [x + 0.1, 20.8 + s], [x + 0.6, 19.2 + s]]);
  // cœur qui luit
  halo(c, 16, 24.6, 4, 'rgba(232,106,232,.7)', 0.7 + Math.sin(t * 2.5) * 0.3);
  shape(c, '#8a2a8a', (k) => {
    k.moveTo(16, 26.3);
    k.bezierCurveTo(13.5, 24.5, 14.5, 22.5, 16, 23.6);
    k.bezierCurveTo(17.5, 22.5, 18.5, 24.5, 16, 26.3);
  });
  ell(c, 15.4, 24, 0.5, 0.4, '#f0a0f0');
}

function ronceShield(c) {
  // ronces qui protègent les yeux
  for (const [y0, y1] of [[10.5, 12.5], [16.5, 13.5]]) {
    line(c, '#3a1a3a', 1.6, [[4, y0], [10, y1], [16, y0 + 1], [22, y1], [28, y0]]);
    line(c, '#6a3a6a', 0.5, [[4, y0 - 0.5], [10, y1 - 0.5], [16, y0 + 0.5], [22, y1 - 0.5], [28, y0 - 0.5]]);
  }
  for (let x = 5; x < 28; x += 2.6) {
    const y = 11.4 + Math.sin(x) * 1.2;
    shape(c, '#e8e0d0', [[x - 0.4, y], [x, y - 1.4], [x + 0.4, y]]);
    shape(c, '#e8e0d0', [[x + 0.9, y + 3.6], [x + 1.3, y + 5], [x + 1.7, y + 3.6]]);
  }
}

// ------------------------------------------------------------------ le Chef des Masques
function masque(c, p, t) {
  const s = p ? 0.8 : 0;
  const flap = Math.sin(t * 2) * 0.8;
  groundShadow(c, 16, 11, 0.35);
  // grande cape
  shape(c, fillOf(c, ['#3a3050', '#2a2238', '#1a1428'], 10, 30), (k) => {
    k.moveTo(16, 6 + s);
    k.bezierCurveTo(8, 9, 6, 18, 3 - flap, 29.5);
    k.quadraticCurveTo(9, 28, 12, 29.5);
    k.quadraticCurveTo(16, 28.4, 20, 29.5);
    k.quadraticCurveTo(23, 28, 29 + flap, 29.5);
    k.bezierCurveTo(26, 18, 24, 9, 16, 6 + s);
  });
  for (const x of [10, 15.5, 21]) line(c, 'rgba(0,0,0,.35)', 0.6, [[x + (x - 16) * 0.1, 13], [x + (x - 16) * 0.35, 28.5]]);
  line(c, 'rgba(120,100,170,.4)', 0.8, [[9.5, 13], [7, 27]]);
  // doublure rouge qui dépasse
  shape(c, '#8a1a2a', [[12, 29.4], [16, 28.3], [20, 29.4], [16, 29.8]]);
  // ceinture et la Pierre d'Aurore volée
  line(c, '#5a4a2a', 1.2, [[11.5, 20.5], [16, 21.3], [20.5, 20.5]]);
  halo(c, 16, 21.6, 3.4, 'rgba(255,220,80,.7)', 0.8 + Math.sin(t * 3) * 0.2);
  shape(c, '#ffd23f', [[16, 19.6], [17.6, 21.6], [16, 23.6], [14.4, 21.6]]);
  shape(c, '#fff4b8', [[16, 19.9], [16.8, 21.2], [16, 21.6]]);
  // bras, mains et couteaux
  for (const dir of [-1, 1]) {
    const hy = 18.5 + (dir < 0 ? -s : s);
    line(c, '#2a2238', 2.4, [[16 + dir * 6, 12 + s], [16 + dir * 10, 15.5], [16 + dir * 12, hy]]);
    ell(c, 16 + dir * 12.4, hy + 0.6, 1.6, 1.6, '#e8b88a');
    shape(c, fillOf(c, ['#ffffff', '#b8bcc8'], hy - 6, hy), [[16 + dir * 12.8, hy - 0.4], [16 + dir * 13.8, hy - 6.5], [16 + dir * 14.4, hy - 0.2]]);
    line(c, '#6a4a2a', 0.9, [[16 + dir * 13, hy + 0.2], [16 + dir * 14.6, hy + 0.1]]);
  }
  // capuche
  shape(c, fillOf(c, ['#3a3050', '#1a1428'], 1, 14), (k) => {
    k.moveTo(8.5, 14 + s);
    k.bezierCurveTo(7, 4, 11, 0.6 + s, 16, 0.6 + s);
    k.bezierCurveTo(21, 0.6 + s, 25, 4, 23.5, 14 + s);
  });
  ell(c, 16, 8.4 + s, 6.2, 5.8, '#0e0a16');
  // masque blanc souriant
  const my = 8.4 + s;
  shape(c, fillOf(c, ['#ffffff', '#f4f0e0', '#d8d0bc'], my - 5, my + 5), (k) => {
    k.moveTo(10.6, my - 2.5);
    k.quadraticCurveTo(16, my - 6.2, 21.4, my - 2.5);
    k.quadraticCurveTo(21.6, my + 3.5, 16, my + 5.2);
    k.quadraticCurveTo(10.4, my + 3.5, 10.6, my - 2.5);
  });
  for (const dir of [-1, 1]) {
    shape(c, '#141414', (k) => {
      k.moveTo(16 + dir * 1.3, my - 0.4);
      k.quadraticCurveTo(16 + dir * 3, my - 2.2, 16 + dir * 4.4, my - 0.6);
      k.quadraticCurveTo(16 + dir * 3, my + 0.6, 16 + dir * 1.3, my - 0.4);
    });
    ell(c, 16 + dir * 2.9, my - 0.6, 0.5, 0.45, '#ff4a4a');
    halo(c, 16 + dir * 2.9, my - 0.6, 1.6, 'rgba(255,60,60,.6)', 0.7 + Math.sin(t * 5) * 0.3);
  }
  line(c, '#141414', 0.7, (k) => {
    k.moveTo(12.6, my + 1.6);
    k.quadraticCurveTo(16, my + 4.2, 19.4, my + 1.6);
  });
  // décor doré
  line(c, '#c8a050', 0.5, [[20.6, my - 3], [21.2, my], [20.4, my + 3]]);
  shape(c, '#c8a050', [[16, my - 4.6], [16.6, my - 3.6], [16, my - 2.6], [15.4, my - 3.6]]);
}

function masqueShield(c, t) {
  // nuage de fumée autour de lui
  for (const [x, y, r] of [[4, 20, 5], [27, 18, 5], [8, 6, 4], [24, 6, 4], [16, 27, 5], [5, 12, 3.5], [28, 26, 3.5]]) {
    const w = Math.sin(t * 1.5 + x) * 0.6;
    ell(c, x + w, y, r, r * 0.8, 'rgba(160,150,190,.45)');
    ell(c, x + w - r * 0.3, y - r * 0.3, r * 0.55, r * 0.45, 'rgba(220,214,240,.4)');
  }
}

// ------------------------------------------------------------------ le Minotaure de bronze
const BRONZE = ['#f4cc84', '#c88e44', '#8a5420'];

function minotaure(c, p, t) {
  const s = p ? 1 : 0;
  groundShadow(c, 16, 12, 0.35);
  // jambes et sabots
  for (const [x, lift] of [[10, s], [22, 1 - s]]) {
    shape(c, fillOf(c, BRONZE, 22, 29), [[x - 3, 22], [x + 3, 22], [x + 2.6, 28 - lift], [x - 2.6, 28 - lift]]);
    shape(c, '#3a2a1a', [[x - 3.2, 27.5 - lift], [x + 3.2, 27.5 - lift], [x + 3, 29.6 - lift], [x - 3, 29.6 - lift]]);
    line(c, '#1a120a', 0.5, [[x, 27.6 - lift], [x, 29.5 - lift]]);
  }
  // pagne de cuir
  shape(c, '#6a3a1a', [[9, 21], [23, 21], [21.5, 25.5], [16, 24.5], [10.5, 25.5]]);
  // torse
  shape(c, fillOf(c, BRONZE, 12, 23), (k) => {
    k.moveTo(6, 15);
    k.quadraticCurveTo(16, 11, 26, 15);
    k.quadraticCurveTo(25, 21, 23, 22);
    k.lineTo(9, 22);
    k.quadraticCurveTo(7, 21, 6, 15);
  });
  line(c, '#7a4a1a', 0.6, [[16, 14], [16, 21.5]]);
  line(c, '#7a4a1a', 0.5, [[10, 17.5], [13, 18.5], [15.5, 17.6]]);
  line(c, '#7a4a1a', 0.5, [[22, 17.5], [19, 18.5], [16.5, 17.6]]);
  for (const [x, y] of [[8, 15.5], [24, 15.5], [10, 21], [22, 21]]) (ell(c, x, y, 0.6, 0.6, '#5a3410'), ell(c, x - 0.2, y - 0.2, 0.25, 0.25, '#fff0c0'));
  line(c, 'rgba(255,250,220,.6)', 0.8, [[9, 15], [13, 13.6]]);
  // bras
  for (const dir of [-1, 1]) {
    const up = dir < 0 ? s : -s;
    shape(c, fillOf(c, BRONZE, 14, 24), [[16 + dir * 9.5, 14], [16 + dir * 13.5, 15.5 - up], [16 + dir * 14.5, 22 - up], [16 + dir * 11, 22 - up], [16 + dir * 10, 17]]);
    ell(c, 16 + dir * 12.8, 23.4 - up, 2.6, 2.2, '#7a4a1a');
    ell(c, 16 + dir * 12.4, 22.9 - up, 1.2, 0.8, '#a8703a');
    line(c, '#e8c040', 0.7, [[16 + dir * 11, 20.6 - up], [16 + dir * 14.4, 20.6 - up]]); // bracelet
  }
  // cornes
  for (const dir of [-1, 1]) {
    shape(c, fillOf(c, ['#fffaf0', '#e8dcc0', '#b8a888'], 0, 7), (k) => {
      k.moveTo(16 + dir * 6, 6.5 + s);
      k.bezierCurveTo(16 + dir * 11, 6.5 + s, 16 + dir * 14, 4 + s, 16 + dir * 13.2, 0.4 + s);
      k.bezierCurveTo(16 + dir * 12, 3 + s, 16 + dir * 10, 4 + s, 16 + dir * 6, 3.6 + s);
    });
  }
  // tête
  const hy = 7.5 + s;
  ell(c, 16, hy, 7, 5.6, fillOf(c, BRONZE, hy - 5, hy + 5));
  ell(c, 13.5, hy - 2.6, 2.4, 1, 'rgba(255,250,220,.55)', -0.3);
  for (const dir of [-1, 1]) shape(c, fillOf(c, BRONZE, hy - 3, hy + 1), [[16 + dir * 6.4, hy - 2], [16 + dir * 9.6, hy - 1], [16 + dir * 7, hy + 1]]); // oreilles
  // yeux rouges qui brillent
  for (const dir of [-1, 1]) {
    halo(c, 16 + dir * 3, hy - 0.6, 2.6, 'rgba(255,70,30,.8)', 0.7 + Math.sin(t * 4) * 0.3);
    shape(c, '#ff3a1a', [[16 + dir * 1.8, hy - 1.2], [16 + dir * 4.4, hy - 0.8 - dir * 0], [16 + dir * 3.8, hy + 0.2], [16 + dir * 2, hy]]);
    line(c, '#5a3410', 0.6, [[16 + dir * 1.4, hy - 2], [16 + dir * 4.6, hy - 1.2]]);
  }
  // museau, naseaux et anneau
  ell(c, 16, hy + 3.6, 4.4, 2.8, fillOf(c, ['#a8703a', '#7a4a1a'], hy + 1, hy + 6.4));
  for (const dir of [-1, 1]) ell(c, 16 + dir * 1.6, hy + 3.7, 0.8, 0.6, '#141414');
  c.strokeStyle = '#e8c040';
  c.lineWidth = 0.7;
  c.beginPath();
  c.arc(16, hy + 5.6, 1.3, 0, TAU);
  c.stroke();
  // la Pierre du Temps sur le front
  halo(c, 16, hy - 3.6, 2.6, 'rgba(180,110,255,.7)', 0.8);
  shape(c, '#b36bff', [[16, hy - 5], [17.2, hy - 3.6], [16, hy - 2.2], [14.8, hy - 3.6]]);
  ell(c, 15.6, hy - 4, 0.35, 0.35, '#ffffff');
}

function minotaureShield(c, t) {
  // reflets du bronze : invulnérable tant qu'il n'est pas sonné
  for (const [x, y, k] of [[9, 9, 0], [23, 8, 1], [11, 17, 2], [21, 20, 3], [16, 4, 4]]) twinkle(c, x, y, 2 + Math.sin(t * 5 + k) * 0.5, 'rgba(255,245,200,.95)');
  line(c, 'rgba(255,250,220,.5)', 1, [[7, 16], [12, 14]]);
}

// ------------------------------------------------------------------ le Ver des Dunes
function worm(c, p, t) {
  const s = p ? 1 : 0;
  const sway = Math.sin(t * 1.8) * 1 + (s ? 0.6 : -0.6);
  // trou dans le sable
  ell(c, 16, 27.5, 14, 3.6, '#c89a48');
  ell(c, 16, 27.2, 11.5, 2.6, '#6a4a20');
  ell(c, 16, 27.6, 9, 1.8, '#3a2810');
  // corps annelé qui sort du sable
  for (let k = 0; k < 5; k++) {
    const y = 25 - k * 4.3 - s;
    const w = 7 - k * 0.2;
    const x = 16 + sway * (k / 4);
    ell(c, x, y, w, 2.9, fillOf(c, k % 2 ? ['#f0b08a', '#c86a4a'] : ['#f8c09a', '#d87a5a'], y - 3, y + 3));
    line(c, '#a85a3a', 0.5, (q) => q.ellipse(x, y + 0.6, w - 0.3, 2.2, 0, 0.15, Math.PI - 0.15));
  }
  // tête : grande bouche ronde pleine de dents
  const hx = 16 + sway;
  const hy = 6 - s;
  ell(c, hx, hy, 9.5, 6.4, fillOf(c, ['#f8c09a', '#e8a07a', '#c86a4a'], hy - 6, hy + 6));
  ell(c, hx, hy + 0.6, 6.6, 4.4, '#5a1414');
  ell(c, hx, hy + 1, 4.4, 2.8, '#2a0606');
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * TAU;
    const x = hx + Math.cos(a) * 6;
    const y = hy + 0.6 + Math.sin(a) * 4;
    shape(c, '#fffaf0', [[x - Math.sin(a) * 0.7, y + Math.cos(a) * 0.5], [hx + Math.cos(a) * 4.2, hy + 0.6 + Math.sin(a) * 2.7], [x + Math.sin(a) * 0.7, y - Math.cos(a) * 0.5]]);
  }
  // petits yeux jaunes sur les côtés
  for (const dir of [-1, 1]) eye(c, hx + dir * 8, hy - 1.6, 1.3, { white: '#ffde3a', iris: '#ff8a1a', pupil: '#2a1206', slit: true });
  // la Pierre du Soleil sur la tête
  halo(c, hx, hy - 6, 3, 'rgba(255,160,40,.8)', 0.8 + Math.sin(t * 3) * 0.2);
  shape(c, '#ff8a1f', [[hx, hy - 7.6], [hx + 1.5, hy - 6], [hx, hy - 4.6], [hx - 1.5, hy - 6]]);
  ell(c, hx - 0.4, hy - 6.6, 0.4, 0.4, '#ffe0b0');
  // grains de sable qui tombent
  for (const [x, y] of [[6, 14], [26, 11], [24, 19]]) ell(c, x + sway * 0.5, y + ((t * 6 + x) % 6), 0.4, 0.4, '#e8c87a');
}

function wormShield(c) {
  // carapace de sable durci
  for (const [x, y, w] of [[8, 9, 4], [16, 3, 5], [23, 8, 4], [12, 17, 5], [20, 19, 4], [14, 23, 4]]) {
    shape(c, 'rgba(210,170,100,.88)', [[x - w / 2, y], [x, y - 1.6], [x + w / 2, y], [x + w / 2 - 0.6, y + 2.2], [x - w / 2 + 0.6, y + 2.2]]);
    line(c, 'rgba(255,240,200,.7)', 0.4, [[x - w / 2 + 0.4, y - 0.1], [x, y - 1.3]]);
    line(c, 'rgba(120,80,30,.6)', 0.35, [[x - 0.6, y + 0.4], [x + 0.4, y + 1.6]]);
  }
}

function wormUnder(c, p, t) {
  // une bosse de sable qui se déplace
  groundShadow(c, 16, 11, 0.2);
  shape(c, fillOf(c, ['#f0d48a', '#d8b060', '#b08440'], 18, 30), (k) => {
    k.moveTo(3, 29.5);
    k.bezierCurveTo(7, 22, 11, 18.5 + Math.sin(t * 6) * 0.5, 16, 18.5);
    k.bezierCurveTo(21, 18.5, 25, 22, 29, 29.5);
  });
  for (const [x, y] of [[9, 25], [14, 21.6], [20, 22.6], [24, 26]]) line(c, 'rgba(255,245,210,.7)', 0.5, [[x - 1.5, y], [x, y - 0.6], [x + 1.5, y]]);
}

// ------------------------------------------------------------------ le Kraken
function kraken(c, p, t) {
  const s = p ? 1 : 0;
  groundShadow(c, 16, 14, 0.35);
  const BODY = ['#c86ac8', '#9a3a9a', '#6a1a6a'];
  // tentacules qui ondulent
  [[-1, 4, 0], [-1, 9.5, 1], [1, 22.5, 2], [1, 28, 3], [-1, 13.5, 4], [1, 18.5, 5]].forEach(([dir, x, i]) => {
    const ph = t * 2.2 + i + s * 1.5;
    const pts = [];
    for (let k = 0; k <= 5; k++) pts.push([x + dir * k * 0.9 + Math.sin(ph + k * 0.9) * 1.4, 16 + k * 2.6]);
    line(c, '#6a1a6a', 3.2 - (i > 3 ? 0.8 : 0), pts);
    line(c, '#9a3a9a', 2.2 - (i > 3 ? 0.6 : 0), pts);
    for (let k = 1; k < 5; k++) ell(c, pts[k][0] - dir * 0.6, pts[k][1], 0.45, 0.45, '#f0b0e8');
    const [ex, ey] = pts[5];
    line(c, '#9a3a9a', 1.4, [[ex, ey], [ex + dir * 1.6, ey + 0.4], [ex + dir * 2, ey - 1.2]]);
  });
  // tête (manteau)
  shape(c, fillOf(c, BODY, 1, 20), (k) => {
    k.moveTo(5.5, 17 - s);
    k.bezierCurveTo(3.5, 7, 9, 0.5 - s, 16, 0.5 - s);
    k.bezierCurveTo(23, 0.5 - s, 28.5, 7, 26.5, 17 - s);
    k.quadraticCurveTo(16, 21.5 - s, 5.5, 17 - s);
  });
  ell(c, 11.5, 4.5 - s, 3.4, 2, 'rgba(255,220,255,.35)', -0.4);
  for (const [x, y, r] of [[8, 13, 0.9], [23.5, 7, 1.1], [24.5, 13, 0.7], [11.5, 7.6, 0.6], [20, 3.4, 0.7]]) ell(c, x, y - s, r, r, '#e8a0e8');
  // grands yeux jaunes, pupilles horizontales
  for (const [x, dir] of [[11.2, -1], [20.8, 1]]) {
    ell(c, x, 10.6 - s, 3.3, 3.1, '#5a1a5a');
    ell(c, x, 10.8 - s, 2.8, 2.6, fillOf(c, ['#fff2a0', '#ffd23a'], 8, 13.5));
    ell(c, x, 11 - s, 1.8, 0.75, '#141414');
    ell(c, x - 0.9, 9.8 - s, 0.6, 0.5, 'rgba(255,255,255,.9)');
    shape(c, '#5a1a5a', [[x - 3.6, 7.6 - s - (dir < 0 ? 0 : 1.2)], [x + 3.6, 7.6 - s - (dir < 0 ? 1.2 : 0)], [x + 3.4, 9.2 - s - (dir < 0 ? -0.4 : 0.6)], [x - 3.4, 9.2 - s - (dir < 0 ? 0.6 : -0.4)]]);
  }
  // bec
  shape(c, '#2a1a1a', [[14, 16 - s], [18, 16 - s], [16, 19 - s + s * 0.5]]);
  line(c, '#5a4a4a', 0.4, [[14.6, 16.4 - s], [16, 17 - s]]);
  // la Pierre des Marées
  halo(c, 16, 0.6 - s, 3, 'rgba(60,140,255,.8)', 0.8 + Math.sin(t * 3) * 0.2);
  shape(c, '#2f7bff', [[16, -1 - s], [17.4, 0.6 - s], [16, 2.2 - s], [14.6, 0.6 - s]]);
  ell(c, 15.6, 0 - s, 0.4, 0.4, '#d8e8ff');
}

function krakenShield(c, t) {
  // bulles protectrices
  for (const [x, y, r] of [[5, 10, 3.2], [27, 12, 3.2], [16, 2.5, 2.2], [8.5, 24, 2.4], [24, 24, 2.4], [3, 18, 1.6], [29, 20, 1.6]]) {
    const yy = y + Math.sin(t * 2 + x) * 0.6;
    ell(c, x, yy, r, r, 'rgba(200,240,255,.28)');
    c.strokeStyle = 'rgba(220,250,255,.9)';
    c.lineWidth = 0.4;
    c.beginPath();
    c.arc(x, yy, r, 0, TAU);
    c.stroke();
    ell(c, x - r * 0.4, yy - r * 0.4, r * 0.3, r * 0.22, 'rgba(255,255,255,.9)', -0.6);
  }
}

// ------------------------------------------------------------------ Morgor, le Seigneur des Cendres
function morgor(c, p, t) {
  const s = p ? 1 : 0;
  const sway = Math.sin(t * 1.5) * 0.8 + s * 0.6;
  groundShadow(c, 15, 12, 0.4);
  // grande cape
  shape(c, fillOf(c, ['#3a1028', '#2a0a1a', '#14040c'], 6, 30), (k) => {
    k.moveTo(15, 7);
    k.bezierCurveTo(9, 9, 6 + sway * 0.4, 20, 3 + sway, 30);
    k.lineTo(27 - sway, 30);
    k.bezierCurveTo(24 - sway * 0.4, 20, 21, 9, 15, 7);
  });
  shape(c, fillOf(c, ['#5a1a4e', '#3a1a4e'], 10, 30), (k) => {
    k.moveTo(15, 9);
    k.bezierCurveTo(12, 12, 11.4, 22, 11.6, 30);
    k.lineTo(18.4, 30);
    k.bezierCurveTo(18.6, 22, 18, 12, 15, 9);
  });
  for (const x of [8, 22]) line(c, 'rgba(0,0,0,.4)', 0.6, [[x + (x < 15 ? 2 : -2), 14], [x + (x < 15 ? -1.5 : 1.5), 29.5]]);
  // bordure de braises
  for (let x = 4; x < 27; x += 1.6) ell(c, x + sway * (x < 15 ? 1 : -1) * 0.3, 29.6, 0.5, 0.4, x % 3 < 1.6 ? '#ff6a1a' : '#ffb03a');
  // bras et bâton
  line(c, '#2a0a1a', 2.2, [[20, 12], [23.5, 16], [25.5, 18]]);
  ell(c, 25.8, 18.2, 1.3, 1.3, '#4a4a5a');
  line(c, '#3a2418', 1.1, [[26.4, 29.5], [26, 3 - s]]);
  line(c, '#5a3a24', 0.4, [[26.2, 28], [25.9, 5]]);
  halo(c, 26, 2.5 - s, 5, 'rgba(255,90,30,.85)', 0.75 + Math.sin(t * 7) * 0.25);
  for (const [dx, h, col] of [[-1.3, 2.4, '#ff3a1a'], [0, 3.6, '#ff8a1a'], [1.3, 2.2, '#ff3a1a'], [0, 2, '#ffd060']]) {
    shape(c, col, (k) => {
      k.moveTo(26 + dx - 1, 3 - s);
      k.quadraticCurveTo(26 + dx, 3 - s - h * 2 + Math.sin(t * 9 + dx) * 0.5, 26 + dx + 1, 3 - s);
    });
  }
  ell(c, 26, 3 - s, 1.5, 1.5, '#ffd060');
  // capuche et visage dans l'ombre
  ell(c, 15, 7.5, 5.6, 6, fillOf(c, ['#3a1028', '#1c0b2a'], 1.5, 13.5));
  ell(c, 15, 8.4, 3.8, 4.2, '#07030c');
  for (const dir of [-1, 1]) {
    halo(c, 15 + dir * 1.6, 8, 2.8, 'rgba(255,40,40,.9)', 0.75 + Math.sin(t * 5) * 0.25);
    ell(c, 15 + dir * 1.6, 8, 0.9, 0.5, '#ffd0c0', dir * -0.3);
  }
  // couronne de flammes
  [-3, -1, 1, 3].forEach((dx, i) => {
    const h = 2.4 + (i % 2) * 1.4 + Math.sin(t * 6 + i) * 0.5 + (s ? 0.4 : 0);
    shape(c, i % 2 ? '#ffb03a' : '#ff5a1a', (k) => {
      k.moveTo(15 + dx - 1.1, 2.4);
      k.quadraticCurveTo(15 + dx, 2.4 - h * 2, 15 + dx + 1.1, 2.4);
    });
  });
  line(c, '#4a4a5a', 0.8, [[11, 2.6], [19, 2.6]]);
}

function morgorShield(c, t, colors = ['#1a0a22', '#4a1a5a', '#7a3a8a']) {
  // bouclier noir : un anneau de fumée qui tourne
  for (let k = 0; k < 30; k++) {
    const a = (k / 30) * TAU + t * 0.8;
    const r = 13.5 + Math.sin(k * 1.7 + t * 3) * 0.8;
    ell(c, 16 + Math.cos(a) * r, 16 + Math.sin(a) * r, 1.6, 1.3, colors[k % colors.length]);
  }
}

// ------------------------------------------------------------------ tableau des boss
export const BOSS_ART = {
  yeti: { draw: yeti, shield: yetiShield },
  ronce: { draw: ronce, shield: ronceShield },
  masque: { draw: masque, shield: masqueShield },
  minotaure: { draw: minotaure, shield: minotaureShield },
  worm: { draw: worm, shield: wormShield, under: wormUnder },
  kraken: { draw: kraken, shield: krakenShield },
  morgor: { draw: morgor, shield: morgorShield, shield2: (c, t) => morgorShield(c, t, ['#ff5a1a', '#ffb03a', '#ffd060']) },
};

/** Dessine un boss en grand : (x, y) = le sol sous lui, s = taille de 32 unités. */
export function drawBoss(c, kind, x, y, s, t = 0, { pose = Math.floor(t * 2.5) % 2, shield = false } = {}) {
  const art = BOSS_ART[kind];
  unit(c, x, y, s, (k) => {
    art.draw(k, pose, t);
    if (shield) art.shield(k, t);
  });
}

/**
 * Image détaillée d'un boss pour le jeu (PC) : `name` = 'yeti_0', 'kraken_shield'... dans un carré de 64 × 64.
 * Renvoie false si ce n'est pas un des 7 boss.
 */
export function paintBossHD(c, name) {
  const m = /^([a-z]+)_(0|1|shield2?|under)$/.exec(name);
  const art = m && BOSS_ART[m[1]];
  if (!art || !art[m[2]] && !/^[01]$/.test(m[2])) return false;
  unit(c, 32, 60, 64, (k) => {
    if (m[2] === '0' || m[2] === '1') art.draw(k, Number(m[2]), 0);
    else if (m[2] === 'under') art.under(k, 0, 0);
    else art[m[2]](k, 0);
  });
  return true;
}
