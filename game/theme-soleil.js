// LE DÉSERT DES MIRAGES — tuiles, objets, monstres, habitants et boss du niveau 6.
// Dessins 16 x 16 (mobile) ; le sable, les dunes, les cactus, les palmiers et les habitants humains
// ont aussi une version haute définition (PC, 32 x 32).
import { P, speckle, humanoid } from '../demos/01-moteur/themes.js';
import { P as H, R, disc, ellipse, tint } from '../demos/02-gameplay/hd.js';
import { characterHD } from '../demos/02-gameplay/hd-people.js';

const SAND = '#e8c87a';
const SAND_D = '#d4b064';
const SAND_L = '#f4dc9a';
const sand = (c, rng, n = 10) => (P(c, 0, 0, 16, 16, SAND), speckle(c, rng, n, [SAND_D, SAND_L]));

// ------------------------------------------------------------------ dessins HD (32 x 32)
function sandHD(c, { rng, variant }) {
  H(c, 0, 0, 32, 32, SAND);
  for (let i = 0; i < 30; i++) H(c, rng.int(0, 31), rng.int(0, 31), 2, 1, rng.pick([SAND_D, SAND_L, '#e0be70']));
  // rides du vent
  for (let k = 0; k < (variant === 2 ? 3 : 1); k++) {
    const y = rng.int(6, 26);
    for (let x = 2; x < 30; x++) H(c, x, y + Math.round(Math.sin(x / 4 + k) * 1.5), 1, 1, SAND_D);
  }
  if (variant === 1) (disc(c, 22, 22, 2, '#b8a07a'), H(c, 21, 21, 1, 1, '#e8d8b0'));
}

function duneHD(c, { rng }) {
  H(c, 0, 0, 32, 32, '#d8b060');
  ellipse(c, 16, 22, 16, 12, '#c89a48');
  ellipse(c, 14, 18, 14, 10, '#e8c87a');
  for (let x = 2; x < 30; x++) H(c, x, 12 + Math.round(Math.sin(x / 5) * 2), 1, 1, '#f8e0a0');
  for (let i = 0; i < 10; i++) H(c, rng.int(2, 29), rng.int(16, 30), 2, 1, '#b8883a');
}

function cactusHD(c, o) {
  sandHD(c, { ...o, variant: 0 });
  ellipse(c, 16, 29, 9, 2, 'rgba(0,0,0,.25)');
  R(c, 12, 4, 8, 25, '#2e8a3a');
  R(c, 4, 10, 6, 10, '#2e8a3a');
  R(c, 22, 7, 6, 12, '#2e8a3a');
  H(c, 8, 17, 4, 4, '#2e8a3a');
  H(c, 20, 15, 3, 4, '#2e8a3a');
  H(c, 13, 5, 2, 23, '#4cb85a');
  H(c, 5, 11, 2, 8, '#4cb85a');
  H(c, 23, 8, 2, 10, '#4cb85a');
  for (const [x, y] of [[17, 8], [17, 14], [17, 20], [8, 13], [26, 11], [14, 25]]) H(c, x, y, 1, 1, '#f4f0d0');
  disc(c, 16, 3, 2, '#ff6a8a');
}

function palmHD(c, o) {
  sandHD(c, { ...o, variant: 0 });
  ellipse(c, 16, 29, 8, 2, 'rgba(0,0,0,.25)');
  for (let y = 10; y < 29; y++) H(c, 14 + Math.round(Math.sin(y / 6) * 2), y, 4, 1, y % 3 ? '#9a6a3a' : '#7a4a20');
  for (const [dx, dy] of [[-12, 4], [12, 4], [-10, -2], [10, -2], [0, -6]]) {
    for (let k = 0; k <= 10; k++) H(c, 16 + Math.round((dx * k) / 10), 10 + Math.round((dy * k) / 10 + Math.sin((k / 10) * Math.PI) * -3), 3, 3, k > 7 ? '#3a9a3a' : '#2e7a2e');
  }
  disc(c, 14, 12, 2, '#8a5a2a');
  disc(c, 18, 12, 2, '#8a5a2a');
}

// ------------------------------------------------------------------ tuiles
const sandstone = (c, base = '#c8a060') => {
  P(c, 0, 0, 16, 16, tint(base, -0.3));
  for (let row = 0; row < 4; row++) for (let x = row % 2 ? -4 : 0; x < 16; x += 8) (P(c, x + 1, row * 4 + 1, 7, 3, base), P(c, x + 1, row * 4 + 1, 7, 1, tint(base, 0.25)));
};

export const SOLEIL_TILES = {
  sand: { variants: 3, props: { diggable: 'sand_dug' }, paint: (c, { rng }) => sand(c, rng), paintHD: sandHD },
  sand_dug: {
    paint: (c, { rng }) => {
      sand(c, rng, 6);
      P(c, 3, 5, 10, 7, '#b8904a');
      P(c, 4, 6, 8, 5, '#a07a3a');
      P(c, 2, 4, 3, 2, SAND_L);
      P(c, 11, 11, 3, 2, SAND_L);
    },
  },
  dune: { solid: true, props: { shadow: true }, paint: (c, { rng }) => (P(c, 0, 0, 16, 16, '#d8b060'), P(c, 1, 6, 14, 10, '#c89a48'), P(c, 2, 4, 12, 6, '#e8c87a'), P(c, 3, 4, 10, 1, '#f8e0a0'), speckle(c, rng, 4, ['#b8883a'])), paintHD: duneHD },
  cactus: {
    solid: true,
    props: { shadow: true },
    paint: (c, { rng }) => {
      sand(c, rng, 6);
      P(c, 6, 2, 4, 13, '#2e8a3a');
      P(c, 2, 5, 3, 5, '#2e8a3a');
      P(c, 11, 4, 3, 6, '#2e8a3a');
      P(c, 4, 8, 2, 2, '#2e8a3a');
      P(c, 10, 7, 1, 2, '#2e8a3a');
      P(c, 7, 3, 1, 11, '#4cb85a');
      P(c, 7, 1, 2, 1, '#ff6a8a');
    },
    paintHD: cactusHD,
  },
  palm: {
    solid: true,
    props: { shadow: true },
    paint: (c, { rng }) => {
      sand(c, rng, 6);
      P(c, 7, 6, 2, 9, '#9a6a3a');
      P(c, 1, 3, 14, 3, '#2e7a2e');
      P(c, 4, 1, 8, 2, '#3a9a3a');
      P(c, 1, 6, 3, 2, '#2e7a2e');
      P(c, 12, 6, 3, 2, '#2e7a2e');
      P(c, 6, 5, 4, 2, '#8a5a2a');
    },
    paintHD: palmHD,
  },
  quicksand: {
    frames: 2,
    fps: 2,
    props: { quicksand: true },
    paint: (c, { frame }) => {
      P(c, 0, 0, 16, 16, '#c8a05a');
      P(c, 3, 3, 10, 10, '#b88a48');
      P(c, 5, 5, 6, 6, '#a07a3a');
      P(c, 7, 7, 2, 2, '#8a6a2a');
      const o = frame ? 1 : 0;
      P(c, 4 + o, 2, 4, 1, '#d8b870');
      P(c, 12, 4 + o, 1, 4, '#d8b870');
      P(c, 8 - o, 13, 4, 1, '#d8b870');
      P(c, 2, 8 - o, 1, 4, '#d8b870');
    },
  },
  desert_rock: {
    solid: true,
    props: { shadow: true },
    paint: (c, { rng }) => (sand(c, rng, 4), P(c, 2, 5, 12, 10, '#8a6a4a'), P(c, 3, 4, 9, 2, '#a8886a'), P(c, 4, 6, 4, 2, '#c8a88a'), P(c, 2, 14, 12, 1, '#5a4a3a')),
  },
  hut_wall: {
    solid: true,
    props: { shadow: true },
    paint: (c) => {
      P(c, 0, 0, 16, 16, '#c88a5a');
      for (let y = 2; y < 16; y += 5) P(c, 0, y, 16, 1, '#a86a3a');
      P(c, 5, 4, 6, 5, '#5a3a1c');
      P(c, 6, 5, 4, 3, '#2a1a0c');
    },
  },
  hut_roof: {
    solid: true,
    props: { shadow: true },
    paint: (c) => {
      P(c, 0, 0, 16, 16, '#e8d8b0');
      for (let x = 0; x < 16; x += 4) (P(c, x, 0, 2, 16, '#d84a3a'), P(c, x + 2, 0, 2, 16, '#f4e8c8'));
      P(c, 0, 14, 16, 2, '#a83a2a');
    },
  },
  hut_door: {
    paint: (c) => {
      P(c, 0, 0, 16, 16, '#c88a5a');
      P(c, 3, 2, 10, 14, '#2a1a0c');
      P(c, 3, 2, 10, 3, '#d84a3a');
      P(c, 3, 5, 3, 11, '#d84a3a');
    },
  },
  temple_wall: { solid: true, props: { shadow: true }, paint: (c) => sandstone(c) },
  temple_top: {
    solid: true,
    props: { shadow: true },
    paint: (c) => {
      sandstone(c, '#d8b070');
      P(c, 0, 0, 16, 3, '#8a6a3a');
      P(c, 6, 5, 4, 4, '#ff8a1f'); // soleil gravé
      P(c, 7, 4, 2, 6, '#ffb060');
      P(c, 5, 6, 6, 2, '#ffb060');
    },
  },
  temple_door: {
    paint: (c) => {
      sandstone(c);
      P(c, 3, 3, 10, 13, '#1a1008');
      P(c, 4, 2, 8, 1, '#1a1008');
      P(c, 2, 2, 1, 14, '#ff8a1f');
      P(c, 13, 2, 1, 14, '#ff8a1f');
    },
  },
  temple_floor: {
    variants: 2,
    paint: (c, { variant }) => {
      P(c, 0, 0, 16, 16, '#a88a5a');
      P(c, 1, 1, 14, 14, '#c8a870');
      P(c, 1, 1, 14, 1, '#d8b880');
      if (variant) (P(c, 5, 6, 6, 1, '#a88a5a'), P(c, 7, 7, 2, 2, '#ff8a1f'));
    },
  },
};

// ------------------------------------------------------------------ objets et monstres (16 x 16)
export const SOLEIL_OBJECT_FRAMES = [
  'shovel', 'statue_up', 'statue_right', 'statue_down', 'statue_left', 'drum', 'drum_hit', 'post', 'glint',
  'gourd_empty', 'gourd_full', 'treasure_map', 'rock_0', 'rock_1',
  'snake_0', 'snake_1', 'scorpion_0', 'scorpion_1', 'vulture_0', 'vulture_1', 'mummy_0', 'mummy_1',
];

function statue(c, dir) {
  P(c, 2, 13, 12, 3, '#8a6a3a');
  P(c, 3, 12, 10, 2, '#a8885a');
  P(c, 4, 3, 8, 9, '#c8a870');
  P(c, 5, 1, 6, 4, '#c8a870');
  P(c, 5, 1, 6, 1, '#e8c890');
  // le visage regarde dans une direction (flèche dorée)
  const col = '#ff8a1f';
  if (dir === 'up') (P(c, 7, 0, 2, 3, col), P(c, 6, 1, 4, 1, col));
  if (dir === 'down') (P(c, 6, 3, 1, 1, '#2a1a0c'), P(c, 9, 3, 1, 1, '#2a1a0c'), P(c, 7, 9, 2, 3, col), P(c, 6, 10, 4, 1, col));
  if (dir === 'left') (P(c, 5, 3, 1, 1, '#2a1a0c'), P(c, 0, 5, 4, 2, col), P(c, 1, 4, 1, 4, col));
  if (dir === 'right') (P(c, 10, 3, 1, 1, '#2a1a0c'), P(c, 12, 5, 4, 2, col), P(c, 14, 4, 1, 4, col));
}

export function paintSoleilObject(c, name) {
  const [kind, f] = name.split(/_(?=[01]$)/);
  const step = f === '1' ? 1 : 0;
  if (kind.startsWith('statue_')) return statue(c, kind.slice(7));
  switch (kind) {
    case 'shovel':
      for (let i = 0; i < 8; i++) P(c, 4 + i, 11 - i, 2, 1, '#8a5a2a');
      P(c, 3, 11, 3, 3, '#8a5a2a');
      P(c, 10, 1, 5, 6, '#a8a8b8');
      P(c, 11, 2, 3, 4, '#d8dce8');
      return;
    case 'drum':
    case 'drum_hit':
      P(c, 2, 14, 12, 2, 'rgba(0,0,0,.25)');
      P(c, 2, 5, 12, 9, '#c8402a');
      P(c, 2, 4, 12, 3, '#f4e8c8');
      P(c, 3, 5, 10, 1, '#e8d8b0');
      for (let x = 3; x < 13; x += 3) P(c, x, 8, 2, 5, '#f4c020');
      P(c, 2, 13, 12, 1, '#8a2a1a');
      if (kind === 'drum_hit') (P(c, 0, 1, 2, 1, '#ffe066'), P(c, 14, 1, 2, 1, '#ffe066'), P(c, 7, 0, 2, 2, '#ffe066'));
      return;
    case 'post':
      P(c, 5, 14, 6, 2, 'rgba(0,0,0,.3)');
      P(c, 7, 4, 2, 11, '#6a4220');
      P(c, 4, 0, 8, 5, '#3a2a1a');
      P(c, 5, 1, 6, 3, '#ffd870');
      P(c, 6, 1, 2, 2, '#fff8d0');
      P(c, 5, 6, 6, 2, '#e83a3a'); // ruban
      return;
    case 'glint':
      P(c, 7, 5, 2, 6, '#ffffff');
      P(c, 5, 7, 6, 2, '#ffffff');
      P(c, 7, 7, 2, 2, '#ffe066');
      return;
    case 'gourd_empty':
    case 'gourd_full':
      P(c, 4, 5, 8, 9, '#a8743c');
      P(c, 6, 2, 4, 4, '#a8743c');
      P(c, 6, 1, 4, 1, '#5a3a1c');
      P(c, 5, 6, 2, 5, '#c8945a');
      if (kind === 'gourd_full') (P(c, 6, 8, 5, 4, '#3a8ad8'), P(c, 7, 8, 2, 1, '#9ac8f8'));
      return;
    case 'treasure_map':
      P(c, 1, 2, 14, 12, '#f4e0b0');
      P(c, 1, 2, 2, 12, '#c8a060');
      P(c, 13, 2, 2, 12, '#c8a060');
      for (const [x, y] of [[4, 10], [6, 9], [8, 8], [9, 6]]) P(c, x, y, 1, 1, '#8a6a3a');
      P(c, 10, 4, 1, 3, '#e83a3a');
      P(c, 9, 5, 3, 1, '#e83a3a');
      return;
    case 'rock':
      P(c, 4, 4 + step, 8, 8, '#8a6a4a');
      P(c, 5, 4 + step, 4, 2, '#a8886a');
      P(c, 4, 11 + step, 8, 1, '#5a4a3a');
      return;
    case 'snake':
      P(c, 2, 14, 12, 2, 'rgba(0,0,0,.2)');
      for (let x = 2; x < 12; x++) P(c, x, 11 + Math.round(Math.sin(x / 1.5 + step * 2) * 1.5), 2, 2, '#5aa83a');
      P(c, 10, 6, 5, 5, '#5aa83a');
      P(c, 12, 7, 1, 1, '#ffe066');
      P(c, 15, 9, 1, step ? 2 : 1, '#e83a3a');
      for (let x = 3; x < 12; x += 3) P(c, x, 11 + Math.round(Math.sin(x / 1.5 + step * 2) * 1.5), 1, 1, '#2a6a1a');
      return;
    case 'scorpion':
      P(c, 2, 14, 12, 2, 'rgba(0,0,0,.2)');
      P(c, 4, 8, 7, 5, '#3a2a2a');
      P(c, 1, 7 + step, 3, 3, '#3a2a2a');
      P(c, 11, 7 - step, 3, 3, '#3a2a2a');
      P(c, 6, 3, 2, 6, '#3a2a2a');
      P(c, 7, 1, 3, 3, '#3a2a2a');
      P(c, 9, 2, 1, 1, '#e83a3a');
      [4, 6, 8, 10].forEach((x, i) => P(c, x, 13, 1, (i + step) % 2 ? 2 : 1, '#3a2a2a'));
      P(c, 5, 9, 2, 1, '#6a4a4a');
      return;
    case 'vulture':
      P(c, 5, 15, 6, 1, 'rgba(0,0,0,.2)');
      P(c, 5, 5, 6, 6, '#4a3a3a');
      P(c, 6, 2, 4, 3, '#e8a0a0');
      P(c, 7, 3, 1, 1, '#141414');
      P(c, 9, 4, 2, 1, '#f4c020');
      P(c, 6, 5, 4, 1, '#f4f0e0');
      if (step) (P(c, 0, 3, 5, 3, '#3a2a2a'), P(c, 11, 3, 5, 3, '#3a2a2a'));
      else (P(c, 0, 7, 5, 3, '#3a2a2a'), P(c, 11, 7, 5, 3, '#3a2a2a'));
      return;
    case 'mummy':
      P(c, 4, 15, 8, 1, 'rgba(0,0,0,.3)');
      P(c, 4, 1, 8, 14, '#e8e0c8');
      for (let y = 2; y < 15; y += 3) P(c, 4, y, 8, 1, '#b8b098');
      P(c, 6, 4, 1, 1, '#e83a3a');
      P(c, 9, 4, 1, 1, '#e83a3a');
      P(c, 1, 6 + step, 3, 2, '#e8e0c8');
      P(c, 12, 6 - step, 3, 2, '#e8e0c8');
      P(c, 0, 6 + step, 1, 2, '#b8b098');
      P(c, 15, 6 - step, 1, 2, '#b8b098');
  }
}

// ------------------------------------------------------------------ habitants
export const SOLEIL_PEOPLE = {
  sabri: { skin: '#c48a5a', hair: '#2a1a0a', eye: '#111', body: '#e8c040', bodyDark: '#b88a20', legs: '#5a3a2a', hat: 'cap', hatColor: '#e83a3a', hatDark: '#a82a2a' },
  meme: { skin: '#c48a5a', hair: '#f0f0f0', eye: '#222', body: '#3a8ad8', bodyDark: '#2a5aa8', legs: '#3a3a5a', hat: 'hood', hatColor: '#3a8ad8' },
  amira: { skin: '#c48a5a', hair: '#1a1a1a', eye: '#111', body: '#ff8a1f', bodyDark: '#c85a0a', legs: '#5a3a2a', hat: 'hood', hatColor: '#ffb060' },
  rachid: { skin: '#b07a4a', hair: '#1a1a1a', eye: '#111', body: '#f4f0e0', bodyDark: '#c8c0a8', legs: '#8a6a3a', hat: 'hood', hatColor: '#f4f0e0' },
};
const SOLEIL_LOOKS = { amira: { longHair: true, scarf: '#ffd35a' }, sabri: { freckles: true }, meme: { longHair: true, glasses: '#8a6a3a' }, rachid: { beard: '#1a1a1a' } };

/** Le puits de l'oasis (on lui « parle » pour remplir la gourde) : 16 x 16. */
export function paintWell(c) {
  P(c, 2, 14, 12, 2, 'rgba(0,0,0,.3)');
  P(c, 2, 8, 12, 7, '#a8885a');
  P(c, 2, 8, 12, 1, '#c8a870');
  P(c, 4, 9, 8, 3, '#3a6ac8');
  P(c, 2, 1, 2, 8, '#6a4220');
  P(c, 12, 1, 2, 8, '#6a4220');
  P(c, 1, 0, 14, 2, '#d84a3a');
  P(c, 7, 2, 1, 6, '#c8b070');
  P(c, 6, 6, 3, 2, '#8a5a2a');
}

export const SOLEIL_CHARS = ['amira', 'sabri', 'meme', 'rachid', 'well'];
export const paintSoleilPerson = (c, who, dir, step) => (who === 'well' ? paintWell(c) : humanoid(c, dir, step, SOLEIL_PEOPLE[who]));
export const paintSoleilPersonHD = (c, who, dir, step) => (who === 'well' ? false : (characterHD(c, dir, step, SOLEIL_PEOPLE[who], SOLEIL_LOOKS[who]), true));

// ------------------------------------------------------------------ le Ver des Dunes (32 x 32)
export function paintWorm(c, name) {
  if (name === 'worm_shield') {
    // carapace de sable durci
    for (const [x, y] of [[8, 10], [16, 8], [22, 12], [12, 18], [20, 20]]) P(c, x, y, 4, 3, 'rgba(200,160,90,.85)');
    return;
  }
  if (name === 'worm_under') {
    // une bosse de sable qui se déplace
    P(c, 4, 24, 24, 6, '#c89a48');
    P(c, 7, 21, 18, 5, '#d8b060');
    P(c, 11, 19, 10, 3, '#e8c87a');
    P(c, 6, 29, 20, 2, 'rgba(0,0,0,.2)');
    return;
  }
  const s = name === 'worm_1' ? 1 : 0;
  // trou dans le sable
  P(c, 2, 24, 28, 7, '#a07a3a');
  P(c, 4, 25, 24, 4, '#6a4a20');
  // corps annelé
  for (let k = 0; k < 4; k++) {
    const y = 20 - k * 5 - s;
    P(c, 8 - k, y, 16 + k * 2, 6, k % 2 ? '#d88a6a' : '#e8a07a');
    P(c, 8 - k, y + 5, 16 + k * 2, 1, '#a85a3a');
  }
  // tête et grande bouche à dents
  P(c, 5, 1 - s, 22, 8, '#e8a07a');
  P(c, 9, 3 - s, 14, 5, '#3a0a0a');
  for (let x = 10; x < 23; x += 3) (P(c, x, 3 - s, 1, 2, '#ffffff'), P(c, x + 1, 6 - s, 1, 2, '#ffffff'));
  P(c, 6, 2 - s, 2, 2, '#ffde3a');
  P(c, 24, 2 - s, 2, 2, '#ffde3a');
  // la Pierre du Soleil sur la tête
  P(c, 15, 0, 2, 1, '#ff8a1f');
}
