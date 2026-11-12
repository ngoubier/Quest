// LE LABYRINTHE DES MILLE PORTES — tuiles, pièges, objets, monstres, habitants et boss du niveau 5.
// Dessins 16 x 16 (mobile) ; les murs et sols du labyrinthe et les habitants humains ont aussi une
// version haute définition (PC, 32 x 32).
import { P, speckle, humanoid } from '../demos/01-moteur/themes.js';
import { P as H, R, disc, tint, grassHD } from '../demos/02-gameplay/hd.js';
import { characterHD } from '../demos/02-gameplay/hd-people.js';

// ------------------------------------------------------------------ dessins HD (32 x 32)
function mazeFloorHD(c, { rng, variant }) {
  H(c, 0, 0, 32, 32, '#8a7a68');
  for (const [x, y] of [[0, 0], [16, 0], [0, 16], [16, 16]]) {
    const b = tint('#cbbca4', rng.pick([0, 0.05, -0.05]));
    R(c, x + 1, y + 1, 15, 15, b);
    H(c, x + 2, y + 1, 13, 1, tint(b, 0.25));
    H(c, x + 1, y + 15, 15, 1, tint(b, -0.25));
  }
  if (variant) for (let k = 0; k < 4; k++) H(c, 6 + k * 5, 20 - k * 2, 2, 1, '#9a8a74');
}

function mazeWallHD(c, { rng }) {
  H(c, 0, 0, 32, 32, '#2a2434');
  for (let row = 0; row < 4; row++) {
    const off = row % 2 ? 8 : 0;
    for (let x = -off; x < 32; x += 16) {
      const b = tint('#5a5270', rng.pick([0, 0.07, -0.07]));
      R(c, x + 1, row * 8 + 1, 15, 7, b);
      H(c, x + 2, row * 8 + 1, 13, 1, tint(b, 0.3));
    }
  }
  H(c, 0, 29, 32, 3, '#1a1622');
}

function crackedHD(c, o) {
  mazeWallHD(c, o);
  const pts = [[16, 3], [14, 8], [17, 12], [13, 17], [16, 22], [12, 27]];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[i + 1];
    for (let k = 0; k <= 6; k++) H(c, Math.round(x1 + ((x2 - x1) * k) / 6), Math.round(y1 + ((y2 - y1) * k) / 6), 2, 2, '#120e18');
  }
  H(c, 17, 12, 7, 2, '#120e18');
  H(c, 8, 17, 6, 2, '#120e18');
}

function hedgeHD(c, o) {
  grassHD(c, { ...o, variant: 0 });
  R(c, 1, 2, 30, 27, '#1d4a1a');
  R(c, 2, 2, 28, 24, '#2f7a2a');
  for (let i = 0; i < 14; i++) disc(c, o.rng.int(4, 27), o.rng.int(4, 22), 2, '#4a9a3a');
  H(c, 2, 26, 28, 3, '#1d4a1a');
}

// ------------------------------------------------------------------ tuiles
const mazeWall = (c) => {
  P(c, 0, 0, 16, 16, '#2a2434');
  for (let row = 0; row < 4; row++) for (let x = row % 2 ? -4 : 0; x < 16; x += 8) (P(c, x + 1, row * 4 + 1, 7, 3, '#5a5270'), P(c, x + 1, row * 4 + 1, 7, 1, '#7a7290'));
};

export const TEMPS_TILES = {
  maze_floor: {
    variants: 2,
    paint: (c, { variant }) => {
      P(c, 0, 0, 16, 16, '#8a7a68');
      P(c, 1, 1, 7, 7, '#cbbca4');
      P(c, 9, 1, 6, 7, '#bfb098');
      P(c, 1, 9, 7, 6, '#bfb098');
      P(c, 9, 9, 6, 6, '#cbbca4');
      if (variant) P(c, 3, 11, 3, 1, '#9a8a74');
    },
    paintHD: mazeFloorHD,
  },
  maze_wall: { solid: true, props: { shadow: true }, paint: mazeWall, paintHD: mazeWallHD },
  cracked_wall: {
    solid: true,
    props: { shadow: true, bombable: 'maze_floor' }, // une bombe l'ouvre
    paint: (c) => {
      mazeWall(c);
      for (const [x, y] of [[8, 1], [7, 3], [8, 5], [6, 7], [8, 9], [7, 11], [6, 13], [9, 7], [10, 6], [5, 9]]) P(c, x, y, 1, 2, '#120e18');
    },
    paintHD: crackedHD,
  },
  pit: {
    props: { pit: true, low: true }, // on y tombe ; les projectiles passent au-dessus
    paint: (c) => {
      P(c, 0, 0, 16, 16, '#0a0810');
      P(c, 0, 0, 16, 3, '#2a2434');
      P(c, 0, 3, 16, 1, '#1a1622');
    },
  },
  hedge: {
    solid: true,
    props: { shadow: true },
    paint: (c, { rng }) => {
      P(c, 0, 0, 16, 16, '#4c9a3c');
      P(c, 1, 1, 14, 13, '#2f7a2a');
      speckle(c, rng, 8, ['#4a9a3a', '#1d4a1a']);
      P(c, 1, 13, 14, 2, '#1d4a1a');
    },
    paintHD: hedgeHD,
  },
  maze_gate: {
    paint: (c) => {
      P(c, 0, 0, 16, 16, '#cbbca4');
      P(c, 0, 0, 3, 16, '#5a5270');
      P(c, 13, 0, 3, 16, '#5a5270');
      P(c, 0, 0, 16, 3, '#5a5270');
      P(c, 6, 0, 4, 3, '#b36bff'); // sablier gravé
    },
  },
};

// ------------------------------------------------------------------ objets, pièges et monstres (16 x 16)
export const TEMPS_OBJECT_FRAMES = [
  'bomb_0', 'bomb_1', 'crystal_blue', 'crystal_red', 'block_red', 'block_red_down', 'block_blue', 'block_blue_down', 'clockgate',
  'spikes_up', 'spikes_down', 'trap_down', 'trap_up', 'trap_left', 'trap_right', 'crumble', 'crumble_crack', 'hourglass', 'maze_map',
  'skeleton_0', 'skeleton_1', 'ghost_0', 'ghost_1', 'armor_0', 'armor_1',
];

const block = (c, col, light, dark, down) => {
  if (down) {
    // bloc rentré dans le sol : seulement un cadre de couleur, on peut marcher dessus
    P(c, 1, 1, 14, 14, col);
    P(c, 3, 3, 10, 10, 'rgba(0,0,0,0)');
    c.clearRect(3, 3, 10, 10);
    P(c, 3, 3, 10, 10, 'rgba(40,30,20,.25)');
    return;
  }
  P(c, 0, 0, 16, 16, dark);
  P(c, 0, 0, 15, 14, col);
  P(c, 1, 1, 13, 2, light);
  P(c, 1, 1, 2, 11, light);
  P(c, 5, 5, 6, 5, light);
};

export function paintTempsObject(c, name) {
  const [kind, f] = name.split(/_(?=[01]$)/);
  const step = f === '1' ? 1 : 0;
  switch (kind) {
    case 'bomb':
      P(c, 3, 13, 10, 2, 'rgba(0,0,0,.3)');
      P(c, 4, 6, 9, 8, '#2a2a3a');
      P(c, 3, 7, 11, 6, '#2a2a3a');
      P(c, 5, 7, 3, 2, '#6a6a8a');
      P(c, 7, 4, 3, 2, '#5a5a6a');
      P(c, 9, 2, 1, 2, '#c8a050');
      if (step) (P(c, 9, 0, 3, 3, '#ffd35a'), P(c, 10, 1, 1, 1, '#ffffff'));
      else P(c, 10, 1, 2, 2, '#ff6a1a');
      return;
    case 'crystal_blue':
    case 'crystal_red': {
      const red = kind === 'crystal_red';
      const [col, light] = red ? ['#e83a3a', '#ffb0b0'] : ['#3a7ae8', '#b0d0ff'];
      P(c, 4, 12, 8, 3, '#5a5270');
      P(c, 3, 14, 10, 2, '#3a3442');
      P(c, 6, 2, 4, 10, col);
      P(c, 5, 4, 6, 6, col);
      P(c, 7, 1, 2, 1, col);
      P(c, 6, 3, 2, 5, light);
      P(c, 9, 6, 1, 4, tint(col, -0.3));
      return;
    }
    case 'block_red':
      return block(c, '#e83a3a', '#ff9a9a', '#8a1a1a', false);
    case 'block_red_down':
      return block(c, '#e83a3a', '', '', true);
    case 'block_blue':
      return block(c, '#3a7ae8', '#9ac0ff', '#1a3a8a', false);
    case 'block_blue_down':
      return block(c, '#3a7ae8', '', '', true);
    case 'clockgate':
      P(c, 0, 0, 16, 16, '#3a3442');
      for (const x of [1, 5, 9, 13]) P(c, x, 0, 2, 16, '#b8a060');
      P(c, 4, 4, 8, 8, '#f4e8c8');
      P(c, 3, 5, 10, 6, '#f4e8c8');
      P(c, 7, 5, 1, 4, '#2a1a0c');
      P(c, 7, 8, 3, 1, '#2a1a0c');
      return;
    case 'spikes_up':
    case 'spikes_down':
      P(c, 1, 1, 14, 14, '#3a3442');
      for (let y = 3; y < 15; y += 5) {
        for (let x = 3; x < 15; x += 5) {
          if (kind === 'spikes_up') (P(c, x, y - 2, 2, 4, '#d8dce8'), P(c, x, y - 3, 1, 1, '#ffffff'), P(c, x + 1, y + 1, 1, 1, '#8a8aa0'));
          else P(c, x, y, 2, 1, '#1a1622');
        }
      }
      return;
    case 'trap_down':
    case 'trap_up':
    case 'trap_left':
    case 'trap_right': {
      mazeWall(c);
      const d = kind.slice(5);
      P(c, 5, 5, 6, 6, '#1a1622');
      P(c, 6, 6, 4, 4, '#3a1010');
      if (d === 'down') P(c, 6, 12, 4, 4, '#1a1622');
      if (d === 'up') P(c, 6, 0, 4, 4, '#1a1622');
      if (d === 'left') P(c, 0, 6, 4, 4, '#1a1622');
      if (d === 'right') P(c, 12, 6, 4, 4, '#1a1622');
      P(c, 7, 7, 2, 2, '#ff4a4a');
      return;
    }
    case 'crumble':
    case 'crumble_crack':
      P(c, 0, 0, 16, 16, '#8a7a68');
      P(c, 1, 1, 14, 14, '#9a8a70');
      P(c, 2, 2, 12, 1, '#b8a88a');
      P(c, 4, 6, 3, 1, '#6a5a48');
      P(c, 9, 10, 4, 1, '#6a5a48');
      if (kind === 'crumble_crack') for (const [x, y] of [[3, 3], [5, 6], [7, 8], [9, 7], [11, 10], [6, 11], [12, 4]]) P(c, x, y, 2, 1, '#2a1a10');
      return;
    case 'hourglass':
      P(c, 3, 1, 10, 2, '#8a5a2a');
      P(c, 3, 13, 10, 2, '#8a5a2a');
      P(c, 4, 3, 8, 3, '#d8ecff');
      P(c, 6, 6, 4, 2, '#d8ecff');
      P(c, 7, 8, 2, 1, '#d8ecff');
      P(c, 6, 9, 4, 2, '#d8ecff');
      P(c, 4, 11, 8, 2, '#d8ecff');
      P(c, 5, 4, 6, 2, '#f4c020');
      P(c, 7, 8, 2, 3, '#f4c020');
      P(c, 5, 11, 6, 2, '#f4c020');
      P(c, 3, 3, 1, 10, '#b36bff');
      P(c, 12, 3, 1, 10, '#b36bff');
      return;
    case 'maze_map':
      P(c, 1, 2, 14, 12, '#f4e8c8');
      P(c, 1, 2, 14, 1, '#c8a060');
      for (const [x, y, w, h] of [[3, 4, 10, 1], [3, 4, 1, 7], [5, 6, 6, 1], [12, 6, 1, 6], [5, 8, 1, 4], [7, 10, 5, 1]]) P(c, x, y, w, h, '#5a5270');
      P(c, 9, 8, 2, 2, '#e83a3a');
      return;
    case 'skeleton':
      P(c, 4, 15, 8, 1, 'rgba(0,0,0,.3)');
      P(c, 5, 1 + step, 6, 6, '#f0ecdc');
      P(c, 6, 3 + step, 2, 2, '#141414');
      P(c, 9, 3 + step, 2, 2, '#141414');
      P(c, 7, 6 + step, 3, 1, '#141414');
      P(c, 7, 7, 2, 6, '#e0dccc');
      for (const y of [8, 10]) P(c, 5, y, 6, 1, '#e0dccc');
      P(c, 3, 8 - step, 2, 5, '#e0dccc');
      P(c, 11, 8 + step, 2, 5, '#e0dccc');
      P(c, 12, 4 + step, 1, 7, '#a8a8b8'); // épée rouillée
      P(c, 5, 13, 2, 3 - step, '#e0dccc');
      P(c, 9, 13, 2, 2 + step, '#e0dccc');
      return;
    case 'ghost':
      P(c, 3, 3 + step, 10, 10, 'rgba(230,236,255,.85)');
      P(c, 4, 2 + step, 8, 1, 'rgba(230,236,255,.85)');
      for (let x = 3; x < 13; x += 3) P(c, x + step, 13 + step, 2, 2, 'rgba(230,236,255,.75)');
      P(c, 5, 6 + step, 2, 3, '#2a2a4a');
      P(c, 9, 6 + step, 2, 3, '#2a2a4a');
      P(c, 7, 10 + step, 2, 1, '#2a2a4a');
      return;
    case 'armor':
      P(c, 3, 15, 10, 1, 'rgba(0,0,0,.3)');
      P(c, 4, 1, 8, 6, '#8a8aa0');
      P(c, 5, 3, 6, 1, '#141414');
      P(c, 6, 3, 1, 1, '#ff4a4a');
      P(c, 9, 3, 1, 1, '#ff4a4a');
      P(c, 7, 0, 2, 1, '#e83a3a');
      P(c, 3, 7, 10, 6, '#a8a8c0');
      P(c, 3, 7, 10, 1, '#d8d8e8');
      P(c, 1, 7 + step, 2, 6, '#8a8aa0');
      P(c, 13, 7 - step, 2, 6, '#8a8aa0');
      P(c, 0, 4 - step, 1, 9, '#c8c8d8'); // lance
      P(c, 4, 13, 3, 3 - step, '#6a6a80');
      P(c, 9, 13, 3, 2 + step, '#6a6a80');
  }
}

// ------------------------------------------------------------------ habitants
export const TEMPS_PEOPLE = {
  chronos: { skin: '#e8b88a', hair: '#e8e8e8', eye: '#222', body: '#6a3ab0', bodyDark: '#4a2a80', legs: '#3a2a5a', hat: 'hood', hatColor: '#6a3ab0' },
  lulu: { skin: '#f2c49b', hair: '#e8742a', eye: '#222', body: '#3a9a8a', bodyDark: '#2a6a5a', legs: '#4a3a2a' },
};
const TEMPS_LOOKS = { chronos: { beard: '#f0f0f0', brows: '#e0e0e0' }, lulu: { longHair: true, apron: '#f4e8c8', freckles: true } };

/** Gnomo, le petit gnome au bonnet rouge : 16 x 16. */
export function paintGnome(c, dir, step) {
  P(c, 4, 15, 8, 1, 'rgba(0,0,0,.3)');
  P(c, 5, 0 + step, 6, 2, '#e83a3a');
  P(c, 4, 2 + step, 8, 3, '#e83a3a');
  P(c, 3, 5, 10, 1, '#c82a2a');
  P(c, 5, 6, 6, 3, '#f2c49b');
  if (dir !== 'up') (P(c, 6, 7, 1, 1, '#141414'), P(c, 9, 7, 1, 1, '#141414'), P(c, 7, 8, 2, 1, '#e89a7a'));
  P(c, 4, 8, 8, 4, '#f0f0f0'); // grande barbe
  P(c, 5, 12, 6, 1, '#f0f0f0');
  P(c, 4, 10, 8, 3, dir === 'up' ? '#3a6ac8' : '#f0f0f0');
  P(c, 3, 9, 1, 3, '#3a6ac8');
  P(c, 12, 9, 1, 3, '#3a6ac8');
  P(c, 5, 13, 2, 2 + step, '#5a3a1c');
  P(c, 9, 13, 2, 3 - step, '#5a3a1c');
}

export const TEMPS_CHARS = ['chronos', 'lulu', 'gnome'];
export const paintTempsPerson = (c, who, dir, step) => (who === 'gnome' ? paintGnome(c, dir, step) : humanoid(c, dir, step, TEMPS_PEOPLE[who]));
export const paintTempsPersonHD = (c, who, dir, step) => (who === 'gnome' ? false : (characterHD(c, dir, step, TEMPS_PEOPLE[who], TEMPS_LOOKS[who]), true));

// ------------------------------------------------------------------ le Minotaure de bronze (32 x 32)
export function paintMinotaure(c, name) {
  if (name === 'minotaure_shield') {
    // reflets du bronze : invulnérable tant qu'il n'est pas sonné
    for (const [x, y] of [[9, 9], [21, 9], [12, 18], [20, 21]]) (P(c, x, y, 2, 4, 'rgba(255,240,180,.85)'), P(c, x - 1, y + 1, 4, 2, 'rgba(255,240,180,.85)'));
    return;
  }
  const s = name === 'minotaure_1' ? 1 : 0;
  const B = '#b8823a';
  const L = '#e8b868';
  const D = '#7a4a1a';
  P(c, 4, 29, 24, 3, 'rgba(0,0,0,.35)');
  // cornes
  P(c, 3, 3 + s, 5, 3, '#f4e8c8');
  P(c, 2, 1 + s, 3, 3, '#f4e8c8');
  P(c, 24, 3 + s, 5, 3, '#f4e8c8');
  P(c, 27, 1 + s, 3, 3, '#f4e8c8');
  // tête
  P(c, 8, 3 + s, 16, 11, B);
  P(c, 9, 4 + s, 5, 2, L);
  P(c, 11, 7 + s, 3, 2, '#ff3a1a');
  P(c, 18, 7 + s, 3, 2, '#ff3a1a');
  P(c, 11, 10 + s, 10, 5, D); // museau
  P(c, 13, 12 + s, 2, 1, '#141414');
  P(c, 17, 12 + s, 2, 1, '#141414');
  P(c, 14, 14 + s, 4, 2, '#e8c040'); // anneau
  // corps
  P(c, 5, 14, 22, 10, B);
  P(c, 6, 14, 20, 2, L);
  P(c, 15, 16, 2, 8, D);
  P(c, 1, 15 - s, 4, 8, B);
  P(c, 27, 15 + s, 4, 8, B);
  P(c, 0, 22 - s, 5, 3, D);
  P(c, 27, 22 + s, 5, 3, D);
  // jambes et sabots
  P(c, 7, 24, 6, 5, D);
  P(c, 19, 24, 6, 5, D);
  P(c, 7, 28 - s, 6, 2, '#3a2a1a');
  P(c, 19, 28 + s - 1, 6, 2, '#3a2a1a');
  // la Pierre du Temps sur le front
  P(c, 15, 4 + s, 2, 2, '#b36bff');
}
