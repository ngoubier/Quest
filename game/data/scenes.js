// SCÈNES EN IMAGES DES NIVEAUX — avec le système de l'histoire d'ouverture (StoryScene) :
//  - la PRÉSENTATION D'UN BOSS, la première fois qu'on entre dans sa salle (option `intro` du boss) ;
//  - la FIN D'UN NIVEAU, quand on prend sa pierre (option `story` de l'objet).
// Chaque région a son décor ; les boss sont ceux de game/art/bosses.js, en grand.
import { TAU, desaturate, halo, twinkle } from '../art/kit.js';
import { drawBoss } from '../art/bosses.js';
import { STONE_COLORS } from '../themes.js';
import { RAINBOW, sky, glow, hills, cloud, mountain, tree, sparkle, vignette, cage, drawAlia } from './story.js';
import { STONES } from './worldmap.js';

// ------------------------------------------------------------------ décors des régions
function pine(c, x, y, s, snow = '#ffffff') {
  c.fillStyle = '#5a3a24';
  c.fillRect(x - s * 0.06, y - s * 0.2, s * 0.12, s * 0.2);
  [[0.2, 0.42], [0.45, 0.34], [0.68, 0.24]].forEach(([k, w]) => {
    c.fillStyle = '#245a4a';
    c.beginPath();
    c.moveTo(x - s * w, y - s * k);
    c.lineTo(x, y - s * (k + 0.38));
    c.lineTo(x + s * w, y - s * k);
    c.fill();
    c.fillStyle = snow;
    c.beginPath();
    c.moveTo(x - s * w * 0.5, y - s * (k + 0.19));
    c.lineTo(x, y - s * (k + 0.38));
    c.lineTo(x + s * w * 0.5, y - s * (k + 0.19));
    c.fill();
  });
}

function givre(c, b, t) {
  const W = b.w;
  const base = b.y + b.h;
  sky(c, b, [[0, '#5a8ad8'], [0.6, '#a8d0f4'], [1, '#e8f4ff']]);
  mountain(c, b.x + W * 0.2, base - 30, W * 0.5, b.h * 0.7, '#8a9ab8', '#6f7f9e', '#ffffff');
  mountain(c, b.x + W * 0.55, base - 30, W * 0.6, b.h * 0.85, '#96a6c2', '#7888a6', '#ffffff');
  mountain(c, b.x + W * 0.9, base - 30, W * 0.45, b.h * 0.6, '#8a9ab8', '#6f7f9e', '#ffffff');
  hills(c, b, 34, 6, 50, 1, '#e8f0fa', '#c8d8ea');
  [0.06, 0.16, 0.84, 0.95].forEach((fx, i) => pine(c, b.x + W * fx, base - 26 + (i % 2) * 4, 30 + (i % 2) * 6));
  hills(c, b, 18, 4, 40, 2.5, '#f4f8fd', '#dce8f4');
  for (let i = 0; i < 40; i++) {
    const x = b.x + ((i * 53 + t * (8 + (i % 3) * 4)) % W);
    const y = b.y + ((i * 37 + t * (14 + (i % 4) * 5)) % b.h);
    c.fillStyle = 'rgba(255,255,255,.85)';
    c.beginPath();
    c.arc(x, y, 0.8 + (i % 3) * 0.4, 0, TAU);
    c.fill();
  }
}

function seve(c, b, t) {
  const W = b.w;
  const base = b.y + b.h;
  sky(c, b, [[0, '#8ad0a0'], [0.5, '#4a9a5a'], [1, '#2a6a3a']]);
  // rayons de soleil entre les arbres
  for (let i = 0; i < 5; i++) {
    c.fillStyle = `rgba(255,250,200,${0.1 + 0.05 * Math.sin(t + i)})`;
    c.beginPath();
    const x = b.x + W * (0.15 + i * 0.18);
    c.moveTo(x, b.y);
    c.lineTo(x + 14, b.y);
    c.lineTo(x + 40, base);
    c.lineTo(x + 18, base);
    c.fill();
  }
  // grands troncs
  [0.04, 0.22, 0.78, 0.96].forEach((fx, i) => {
    const x = b.x + W * fx;
    c.fillStyle = i % 2 ? '#4a3020' : '#5a3a26';
    c.fillRect(x - 7, b.y, 14, b.h);
    c.fillStyle = 'rgba(0,0,0,.2)';
    c.fillRect(x + 3, b.y, 4, b.h);
    glow(c, x, b.y + 6, 30, 'rgba(40,110,50,.9)');
  });
  hills(c, b, 26, 5, 40, 0.4, '#3f8f3c', '#2a6a2a');
  [0.12, 0.33, 0.68, 0.88].forEach((fx, i) => tree(c, b.x + W * fx, base - 22, 18 + (i % 2) * 4, '#3f9a3c', '#2a7030'));
  hills(c, b, 12, 3, 30, 2, '#58b04a', '#3f8f3c');
  // champignons et lucioles
  [[0.3, '#e8303a'], [0.62, '#e8a030']].forEach(([fx, col]) => {
    const x = b.x + W * fx;
    c.fillStyle = '#f4e8c8';
    c.fillRect(x - 1.5, base - 9, 3, 5);
    c.fillStyle = col;
    c.beginPath();
    c.ellipse(x, base - 9, 5, 3, 0, Math.PI, TAU);
    c.fill();
  });
  for (let i = 0; i < 10; i++) sparkle(c, b.x + ((i * 61) % W) + Math.sin(t + i) * 6, b.y + 20 + ((i * 29) % (b.h - 40)) + Math.cos(t * 1.3 + i) * 4, 1.6, '#fff8a0', 0.4 + 0.5 * Math.sin(t * 3 + i));
}

function aurore(c, b, t) {
  const W = b.w;
  const base = b.y + b.h;
  sky(c, b, [[0, '#141a3a'], [0.6, '#2a3a6a'], [1, '#4a4a7a']]);
  for (let i = 0; i < 30; i++) {
    c.fillStyle = `rgba(255,255,255,${0.4 + 0.4 * Math.sin(t * 2 + i)})`;
    c.fillRect(b.x + ((i * 71) % W), b.y + ((i * 23) % (b.h * 0.5)), 1, 1);
  }
  glow(c, b.x + W * 0.8, b.y + 22, 30, 'rgba(255,250,220,.5)');
  c.fillStyle = '#f4f0dc';
  c.beginPath();
  c.arc(b.x + W * 0.8, b.y + 22, 9, 0, TAU);
  c.fill();
  // toits de la ville
  const roofs = [[0, 60, 30], [0.12, 74, 26], [0.25, 56, 34], [0.4, 80, 28], [0.55, 62, 30], [0.68, 70, 26], [0.8, 58, 32], [0.92, 76, 30]];
  roofs.forEach(([fx, h, w], i) => {
    const x = b.x + W * fx;
    c.fillStyle = i % 2 ? '#2a2440' : '#342c4e';
    c.fillRect(x, base - h * (b.h / 140), w, h * (b.h / 140));
    c.beginPath();
    c.moveTo(x - 3, base - h * (b.h / 140));
    c.lineTo(x + w / 2, base - h * (b.h / 140) - 14);
    c.lineTo(x + w + 3, base - h * (b.h / 140));
    c.fill();
    c.fillStyle = 'rgba(255,200,90,.85)';
    c.fillRect(x + w * 0.3, base - h * (b.h / 140) + 10, 4, 5);
    if (i % 2) c.fillRect(x + w * 0.65, base - h * (b.h / 140) + 20, 4, 5);
  });
  // lanternes qui flottent
  for (let i = 0; i < 7; i++) {
    const x = b.x + ((i * 47 + 20) % W) + Math.sin(t * 0.8 + i) * 4;
    const y = b.y + b.h * 0.5 - ((t * 6 + i * 13) % (b.h * 0.5));
    glow(c, x, y, 9, 'rgba(255,190,80,.8)');
    c.fillStyle = '#ffb040';
    c.fillRect(x - 2, y - 3, 4, 5);
  }
}

function temps(c, b, t) {
  const W = b.w;
  const base = b.y + b.h;
  sky(c, b, [[0, '#3a2a5a'], [0.6, '#6a4a8a'], [1, '#9a7aaa']]);
  // grande horloge dans le ciel
  const cx = b.x + W / 2;
  const cy = b.y + b.h * 0.36;
  const R = b.h * 0.3;
  glow(c, cx, cy, R * 1.6, 'rgba(200,160,255,.35)');
  c.fillStyle = '#e8dcc0';
  c.beginPath();
  c.arc(cx, cy, R, 0, TAU);
  c.fill();
  c.strokeStyle = '#8a6a3a';
  c.lineWidth = 3;
  c.stroke();
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * TAU;
    c.fillStyle = '#5a4a3a';
    c.fillRect(cx + Math.cos(a) * R * 0.8 - 1, cy + Math.sin(a) * R * 0.8 - 1, 2, 2);
  }
  c.strokeStyle = '#3a2a1a';
  c.lineWidth = 2;
  [[t * 0.5, 0.5], [t * 3, 0.75]].forEach(([a, l]) => {
    c.beginPath();
    c.moveTo(cx, cy);
    c.lineTo(cx + Math.sin(a) * R * l, cy - Math.cos(a) * R * l);
    c.stroke();
  });
  // murs du labyrinthe
  for (let row = 0; row < 3; row++) {
    const y = base - 18 - row * 14;
    const h = 14;
    c.fillStyle = ['#7a7088', '#6a6078', '#5a5068'][row];
    for (let x = (row % 2) * 30 - 10; x < W; x += 60) c.fillRect(b.x + x, y - h, 40 - row * 6, h);
    c.fillStyle = 'rgba(0,0,0,.2)';
    for (let x = (row % 2) * 30 - 10; x < W; x += 60) c.fillRect(b.x + x, y - 2, 40 - row * 6, 2);
  }
  c.fillStyle = '#4a4058';
  c.fillRect(b.x, base - 18, W, 18);
  for (let x = 0; x < W; x += 12) c.fillRect(b.x + x, base - 19, 11, 1);
}

function soleil(c, b, t) {
  const W = b.w;
  const base = b.y + b.h;
  sky(c, b, [[0, '#ff9a4a'], [0.5, '#ffc870'], [1, '#ffe8a8']]);
  glow(c, b.x + W * 0.72, b.y + 30, 50, 'rgba(255,240,170,.9)');
  c.fillStyle = '#fff2c0';
  c.beginPath();
  c.arc(b.x + W * 0.72, b.y + 30, 14, 0, TAU);
  c.fill();
  // pyramides
  [[0.2, 52, 70], [0.36, 38, 54]].forEach(([fx, h, w]) => {
    const x = b.x + W * fx;
    c.fillStyle = '#d89a50';
    c.beginPath();
    c.moveTo(x - w / 2, base - 34);
    c.lineTo(x, base - 34 - h);
    c.lineTo(x + w / 2, base - 34);
    c.fill();
    c.fillStyle = '#b8783a';
    c.beginPath();
    c.moveTo(x, base - 34 - h);
    c.lineTo(x + w / 2, base - 34);
    c.lineTo(x + w * 0.1, base - 34);
    c.fill();
  });
  hills(c, b, 34, 8, 60, 0.4, '#f0c070', '#e0a858');
  // palmiers de l'oasis
  [0.86, 0.94].forEach((fx, i) => {
    const x = b.x + W * fx;
    const y = base - 32 - i * 4;
    c.strokeStyle = '#8a5a2a';
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(x, y);
    c.quadraticCurveTo(x - 4, y - 16, x + 2, y - 30);
    c.stroke();
    c.strokeStyle = '#3a8a3a';
    c.lineWidth = 3;
    for (let k = 0; k < 5; k++) {
      const a = -Math.PI / 2 + (k - 2) * 0.6 + Math.sin(t + k) * 0.05;
      c.beginPath();
      c.moveTo(x + 2, y - 30);
      c.quadraticCurveTo(x + 2 + Math.cos(a) * 12, y - 34 + Math.sin(a) * 8, x + 2 + Math.cos(a) * 18, y - 26 + Math.sin(a) * 6);
      c.stroke();
    }
  });
  hills(c, b, 16, 6, 46, 2, '#f8d890', '#f0c070');
  // chaleur qui ondule
  for (let i = 0; i < 4; i++) {
    c.strokeStyle = 'rgba(255,255,255,.18)';
    c.lineWidth = 1;
    c.beginPath();
    for (let x = 0; x <= W; x += 6) c.lineTo(b.x + x, base - 50 - i * 12 + Math.sin(x / 10 + t * 3 + i) * 1.5);
    c.stroke();
  }
}

function marees(c, b, t) {
  const W = b.w;
  const base = b.y + b.h;
  sky(c, b, [[0, '#3aa0d8'], [0.5, '#1a6aa8'], [1, '#0a3a6a']]);
  for (let i = 0; i < 5; i++) {
    c.fillStyle = `rgba(200,240,255,${0.08 + 0.04 * Math.sin(t * 1.2 + i)})`;
    const x = b.x + W * (0.1 + i * 0.2) + Math.sin(t * 0.5 + i) * 6;
    c.beginPath();
    c.moveTo(x, b.y);
    c.lineTo(x + 12, b.y);
    c.lineTo(x - 10, base);
    c.lineTo(x - 30, base);
    c.fill();
  }
  hills(c, b, 16, 4, 40, 1, '#d8c890', '#a89860');
  // algues et coraux
  [0.05, 0.14, 0.86, 0.95].forEach((fx, i) => {
    const x = b.x + W * fx;
    c.strokeStyle = i % 2 ? '#3a9a5a' : '#2a7a4a';
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(x, base - 10);
    for (let k = 1; k <= 6; k++) c.lineTo(x + Math.sin(t * 1.5 + k * 0.8 + i) * 4, base - 10 - k * 9);
    c.stroke();
  });
  [[0.24, '#ff7a8a'], [0.72, '#ffa040'], [0.8, '#c86ae8']].forEach(([fx, col]) => {
    const x = b.x + W * fx;
    c.strokeStyle = col;
    c.lineWidth = 2.5;
    [[-6, -14], [0, -20], [6, -12]].forEach(([dx, dy]) => {
      c.beginPath();
      c.moveTo(x, base - 12);
      c.quadraticCurveTo(x + dx * 0.3, base - 12 + dy * 0.6, x + dx, base - 12 + dy);
      c.stroke();
    });
  });
  for (let i = 0; i < 14; i++) {
    const x = b.x + ((i * 43) % W) + Math.sin(t * 2 + i) * 3;
    const y = base - ((t * (10 + (i % 4) * 4) + i * 19) % b.h);
    c.strokeStyle = 'rgba(220,250,255,.7)';
    c.lineWidth = 0.8;
    c.beginPath();
    c.arc(x, y, 1.2 + (i % 3) * 0.7, 0, TAU);
    c.stroke();
  }
}

function volcan(c, b, t) {
  const W = b.w;
  const base = b.y + b.h;
  sky(c, b, [[0, '#1a0a14'], [0.6, '#4a1420'], [1, '#8a3020']]);
  const vx = b.x + W * 0.5;
  glow(c, vx, base - b.h * 0.72, 60, 'rgba(255,90,30,.6)', 0.8 + Math.sin(t * 2) * 0.2);
  c.fillStyle = '#2a1418';
  c.beginPath();
  c.moveTo(b.x + W * 0.1, base - 20);
  c.lineTo(vx - 18, base - b.h * 0.7);
  c.lineTo(vx + 18, base - b.h * 0.7);
  c.lineTo(b.x + W * 0.9, base - 20);
  c.fill();
  c.strokeStyle = '#ff6a1a';
  c.lineWidth = 2;
  [[-8, 0.3], [6, 0.5]].forEach(([dx, k]) => {
    c.beginPath();
    c.moveTo(vx + dx, base - b.h * 0.7);
    c.quadraticCurveTo(vx + dx * 3, base - b.h * (0.7 - k * 0.5), vx + dx * 5, base - 22);
    c.stroke();
  });
  for (let i = 0; i < 16; i++) {
    const k = (t * 0.25 + i / 16) % 1;
    cloud(c, vx + Math.sin(i * 2.3) * 20 * k, base - b.h * 0.72 - k * 60, 0.25 + k * 0.5, '#3a2a2a', 0.6 * (1 - k));
  }
  c.fillStyle = '#140a0c';
  c.fillRect(b.x, base - 22, W, 22);
  for (let i = 0; i < 20; i++) {
    c.fillStyle = `rgba(255,${120 + (i % 3) * 40},40,${0.6 + 0.4 * Math.sin(t * 3 + i)})`;
    c.fillRect(b.x + ((i * 59 + t * 10) % W), b.y + ((i * 31 - t * 18) % b.h + b.h) % b.h, 1.2, 1.2);
  }
}

export const BACKDROPS = { givre, seve, aurore, temps, soleil, marees, volcan };

// ------------------------------------------------------------------ présentation d'un boss
/** Bandeau avec le nom du boss, en bas de l'image. */
function banner(r, b, title, t) {
  const c = r.ctx;
  const a = Math.min(1, t * 2);
  c.globalAlpha = a;
  const y = b.y + b.h - 15;
  c.fillStyle = 'rgba(10,6,20,.72)';
  c.fillRect(b.x, y, b.w, 15);
  c.fillStyle = '#ffd35a';
  c.fillRect(b.x, y, b.w, 1);
  c.fillRect(b.x, y + 14, b.w, 1);
  c.globalAlpha = 1;
  r.withAlpha(a, () => r.text(title, b.x + b.w / 2, y + 3, { color: '#ffe8a0', size: 8, align: 'center' }));
}

/**
 * Une page qui présente un boss : décor de sa région (assombri), le boss en grand, son nom.
 * @param {string} kind    dessin du boss (game/art/bosses.js) : 'yeti', 'ronce'...
 * @param {string} region  décor : 'givre', 'seve'...
 */
export function bossIntro(kind, region, title, text) {
  return [
    {
      text,
      paint(r, b, t) {
        const c = r.ctx;
        BACKDROPS[region](c, b, t);
        c.fillStyle = 'rgba(10,0,20,.45)';
        c.fillRect(b.x, b.y, b.w, b.h);
        const s = Math.min(b.h * 0.74, b.w * 0.5);
        const x = b.x + b.w / 2;
        const y = b.y + b.h - 14;
        // il arrive d'en bas, puis respire
        const rise = Math.max(0, 1 - t * 1.6);
        halo(c, x, y - s * 0.45, s * 0.8, 'rgba(255,60,60,.35)', Math.min(1, t));
        c.save();
        c.globalAlpha = Math.min(1, t * 2);
        drawBoss(c, kind, x, y + rise * s * 0.3, s, t, { pose: Math.floor(t * 1.5) % 2 });
        c.restore();
        if (t < 0.5) {
          c.fillStyle = `rgba(255,255,255,${0.5 - t})`;
          c.fillRect(b.x, b.y, b.w, b.h);
        }
        vignette(c, b, 0.55);
        banner(r, b, title, t);
      },
    },
  ];
}

// ------------------------------------------------------------------ fin d'un niveau
/** Pierre magique, en grand : (x, y) = son centre, s = sa hauteur. */
export function drawStone(c, region, x, y, s, t = 0, { dim = false } = {}) {
  const [col, light, dark] = STONE_COLORS[region];
  if (!dim) halo(c, x, y, s * 1.4, col, 0.55 + Math.sin(t * 3) * 0.15);
  c.globalAlpha = dim ? 0.35 : 1;
  const w = s * 0.36;
  const h = s / 2;
  const pts = [[0, -h], [w, -h * 0.3], [w, h * 0.3], [0, h], [-w, h * 0.3], [-w, -h * 0.3]];
  const face = (i, colr) => {
    c.fillStyle = colr;
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x + pts[i][0], y + pts[i][1]);
    c.lineTo(x + pts[(i + 1) % 6][0], y + pts[(i + 1) % 6][1]);
    c.fill();
  };
  [light, col, dark, dark, col, light].forEach((k, i) => face(i, k));
  c.fillStyle = 'rgba(255,255,255,.75)';
  c.beginPath();
  c.moveTo(x - w * 0.55, y - h * 0.3);
  c.lineTo(x - w * 0.1, y - h * 0.75);
  c.lineTo(x - w * 0.2, y - h * 0.2);
  c.fill();
  c.globalAlpha = 1;
  if (!dim) for (let i = 0; i < 4; i++) twinkle(c, x + Math.cos(t * 1.5 + i * 1.6) * s * 0.7, y + Math.sin(t * 1.5 + i * 1.6) * s * 0.5, s * 0.07, '#ffffff', 0.5 + 0.5 * Math.sin(t * 4 + i));
}

const REGION_NAMES = {
  givre: ['la Pierre de Givre', 'Le Mont Givré'],
  seve: ['la Pierre de Sève', 'La Forêt des Murmures'],
  aurore: ['la Pierre d’Aurore', 'Bourg-Lanterne'],
  temps: ['la Pierre du Temps', 'Le Labyrinthe des Mille Portes'],
  soleil: ['la Pierre du Soleil', 'Le Désert des Mirages'],
  marees: ['la Pierre des Marées', 'Les Abysses de Corail'],
};

/**
 * Les 2 pages de fin de niveau, quand on prend la pierre :
 * 1. la région retrouve ses couleurs autour de la pierre ;
 * 2. Alia, dans sa cage, et les pierres déjà trouvées (`state` : la partie en cours).
 */
export function stoneStory(region, power) {
  const [stone, place] = REGION_NAMES[region];
  return (state) => {
    const found = STONES.filter((k) => state.count(`stone_${k}`) > 0 || k === region);
    const left = STONES.length - found.length;
    const Stone = stone[0].toUpperCase() + stone.slice(1);
    return [
      {
        text: `Tu as trouvé ${stone} ! ${place} retrouve toutes ses couleurs.`,
        paint(r, b, t) {
          const c = r.ctx;
          BACKDROPS[region](c, b, t);
          // les couleurs reviennent en partant de la pierre
          const k = Math.min(1, Math.max(0, (t - 0.6) / 2));
          desaturate(c, b, 1 - k);
          const x = b.x + b.w / 2;
          const y = b.y + b.h * 0.45 + Math.sin(t * 2) * 3;
          if (k > 0 && k < 1) {
            c.strokeStyle = `rgba(255,255,255,${0.8 * (1 - k)})`;
            c.lineWidth = 3;
            c.beginPath();
            c.arc(x, y, k * b.w, 0, TAU);
            c.stroke();
          }
          drawStone(c, region, x, y, Math.min(46, b.h * 0.34), t);
          for (let i = 0; i < 12; i++) {
            const a = (i / 12) * TAU + t * 0.4;
            const d = 30 + ((t * 24 + i * 9) % (b.w * 0.5));
            sparkle(c, x + Math.cos(a) * d, y + Math.sin(a) * d * 0.6, 2, RAINBOW[i % 6], k * (1 - d / (b.w * 0.55)));
          }
          vignette(c, b, 0.35);
        },
      },
      {
        text:
          `${Stone} te donne un pouvoir : ${power} ` +
          (left > 0
            ? `Au loin, Alia t’entend. Encore ${left} pierre${left > 1 ? 's' : ''} à trouver !`
            : 'Tu as les 6 pierres ! Le Volcan Noir t’attend : va délivrer Alia !'),
        paint(r, b, t) {
          const c = r.ctx;
          sky(c, b, [[0, '#120a2a'], [0.6, '#2a1a4a'], [1, '#4a2a5a']]);
          for (let i = 0; i < 26; i++) {
            c.fillStyle = `rgba(255,255,255,${0.3 + 0.4 * Math.sin(t * 2 + i)})`;
            c.fillRect(b.x + ((i * 67) % b.w), b.y + ((i * 29) % b.h), 1, 1);
          }
          const x = b.x + b.w / 2;
          const y = b.y + b.h * 0.52;
          const R = Math.min(b.h * 0.38, b.w * 0.3);
          // Alia dans sa cage, au milieu ; elle reprend des couleurs avec chaque pierre
          glow(c, x, y, R * 0.9, `rgba(255,255,255,${0.1 + found.length * 0.05})`);
          const s = R * 0.55;
          drawAlia(c, x - s * 0.1, y + s * 0.62, s, t, { grey: true });
          c.save();
          c.globalAlpha = found.length / STONES.length;
          drawAlia(c, x - s * 0.1, y + s * 0.62, s, t);
          c.restore();
          cage(c, x - s * 0.75, y - s * 0.95, s * 1.5, s * 1.6);
          // les 6 pierres en cercle : celles qu'on a brillent
          STONES.forEach((k, i) => {
            const a = -Math.PI / 2 + (i / STONES.length) * TAU + t * 0.15;
            const sx = x + Math.cos(a) * R * 1.25;
            const sy = y + Math.sin(a) * R * 0.95;
            const has = found.includes(k);
            const isNew = k === region;
            drawStone(c, k, sx, sy, isNew ? 16 + Math.sin(t * 4) * 2 : 13, t + i, { dim: !has });
          });
          vignette(c, b, 0.4);
        },
      },
    ];
  };
}

export const BOSS_INTROS = {
  yeti: bossIntro('yeti', 'givre', 'Le Yéti Grondeur', 'Le Yéti Grondeur garde la Pierre de Givre ! Sa carapace de glace le protège : fais-la fondre avec le bâton de feu, puis réponds juste.'),
  ronce: bossIntro('ronce', 'seve', 'Ronce-Noire', 'Ronce-Noire a ensorcelé le Grand Chêne ! L’épée ne peut rien contre ses ronces : vise ses yeux avec l’arc.'),
  masque: bossIntro('masque', 'aurore', 'Le Chef des Masques', 'Le Chef des Masques a volé la Pierre d’Aurore ! Il se cache dans sa fumée : étourdis-le avec le boomerang.'),
  minotaure: bossIntro('minotaure', 'temps', 'Le Minotaure de bronze', 'Le Minotaure de bronze fonce sur tout ce qui bouge ! Ton épée rebondit sur lui : esquive, et fais-le foncer dans un mur.'),
  worm: bossIntro('worm', 'soleil', 'Le Ver des Dunes', 'Les tambours l’ont réveillé : voici le Ver des Dunes ! Quand il plonge sous le sable, éloigne-toi ; frappe-le quand il ressort.'),
  kraken: bossIntro('kraken', 'marees', 'Le Kraken', 'Le Kraken garde la Pierre des Marées ! Ses tentacules le protègent : coupe-les d’abord avec le trident.'),
  morgor: bossIntro('morgor', 'volcan', 'Morgor, le Seigneur des Cendres', 'Morgor ! C’est lui qui a enlevé Alia. Son bouclier noir arrête tout... sauf le Cœur d’Iris. Courage !'),
};
