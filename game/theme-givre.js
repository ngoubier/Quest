// LE MONT GIVRÉ — tuiles de neige et de glace, monstres, objets et personnages du niveau 2.
import { P, speckle, humanoid } from '../demos/01-moteur/themes.js';
import { characterHD } from '../demos/02-gameplay/hd-people.js';

const SNOW = '#eef4fb';
const SNOW_D = '#d3e1f0';
const SNOW_DD = '#b4c8de';

const snow = (c, rng, n = 10) => (P(c, 0, 0, 16, 16, SNOW), speckle(c, rng, n, [SNOW_D, '#ffffff']));

function iceBricks(c, base, line, hi) {
  P(c, 0, 0, 16, 16, base);
  for (let y = 0; y < 16; y += 8) {
    P(c, 0, y + 7, 16, 1, line);
    P(c, y % 16 === 0 ? 7 : 3, y, 1, 7, line);
    P(c, y % 16 === 0 ? 15 : 11, y, 1, 7, line);
    P(c, 0, y, 16, 1, hi);
  }
}

export const GIVRE_TILES = {
  snow: { variants: 3, paint: (c, { rng }) => snow(c, rng) },
  snow_alt: {
    paint: (c, { rng }) => {
      snow(c, rng, 6);
      [[3, 5], [10, 9], [6, 12]].forEach(([x, y]) => (P(c, x, y, 3, 1, SNOW_DD), P(c, x + 1, y - 1, 1, 1, SNOW_DD)));
    },
  },
  snow_path: { paint: (c, { rng }) => (P(c, 0, 0, 16, 16, '#c6d4e6'), speckle(c, rng, 12, ['#adbfd6', '#d8e4f2'])) },
  pine: {
    solid: true,
    props: { shadow: true },
    paint: (c, { rng }) => {
      snow(c, rng, 4);
      P(c, 7, 12, 2, 4, '#6b4a33');
      [[6, 1, 4], [4, 4, 8], [2, 7, 12], [1, 10, 14]].forEach(([x, y, w]) => (P(c, x, y, w, 3, '#2c6e5a'), P(c, x, y + 2, w, 1, '#1b4a3c')));
      [[6, 1, 3], [4, 4, 4], [2, 7, 5], [1, 10, 4]].forEach(([x, y, w]) => P(c, x, y, w, 1, '#ffffff'));
      P(c, 9, 5, 2, 1, '#ffffff');
      P(c, 10, 8, 3, 1, '#ffffff');
    },
  },
  peak: {
    solid: true,
    variants: 2,
    props: { shadow: true },
    paint: (c, { variant }) => {
      P(c, 0, 0, 16, 16, '#5f6e82');
      const cx = variant ? 6 : 9;
      for (let i = 0; i < 15; i++) P(c, cx - i * 0.6, 1 + i, i * 1.2 + 1, 1, i < 5 ? '#ffffff' : i % 5 === 0 ? '#8696aa' : '#9aa8ba');
      for (let i = 0; i < 8; i++) P(c, cx - 6 - i * 0.5, 8 + i, i + 1, 1, i < 2 ? '#e6eef6' : '#7c8a9e');
      P(c, 0, 15, 16, 1, '#4a586a');
    },
  },
  ice: {
    props: { slippery: true },
    variants: 2,
    paint: (c, { variant }) => {
      P(c, 0, 0, 16, 16, '#bfe9ff');
      P(c, 0, 15, 16, 1, '#a6d8f2');
      const o = variant ? 6 : 0;
      for (let i = 0; i < 5; i++) P(c, 3 + i + o, 9 - i, 1, 1, '#ffffff');
      for (let i = 0; i < 3; i++) P(c, 10 + i - o, 13 - i, 1, 1, '#e8f8ff');
      P(c, variant ? 2 : 12, 3, 2, 1, '#d6f2ff');
    },
  },
  ice_water: {
    solid: true,
    frames: 2,
    fps: 2,
    props: { low: true, edge: '#e8f4ff' },
    paint: (c, { frame }) => {
      P(c, 0, 0, 16, 16, '#3f78b8');
      const o = frame * 4;
      P(c, (2 + o) % 16, 4, 5, 1, '#9fc8f0');
      P(c, (9 + o) % 16, 11, 5, 1, '#9fc8f0');
      P(c, (12 + o) % 16, 7, 2, 2, '#e8f4ff'); // petit glaçon qui flotte
    },
  },
  igloo: {
    solid: true,
    variants: 2,
    props: { shadow: true },
    paint: (c, { variant }) => {
      iceBricks(c, '#ffffff', '#c3d5e8', '#ffffff');
      if (variant) (P(c, 5, 4, 6, 6, '#5a7aa0'), P(c, 6, 5, 4, 4, '#ffe08a'), P(c, 8, 5, 1, 4, '#5a7aa0'));
    },
  },
  igloo_roof: {
    solid: true,
    props: { shadow: true },
    paint: (c) => {
      P(c, 0, 0, 16, 16, '#dbe9f6');
      for (let y = 3; y < 16; y += 5) P(c, 0, y, 16, 1, '#b3c8de');
      for (let x = 2; x < 16; x += 6) P(c, x, 0, 1, 16, '#c3d5e8');
      P(c, 0, 0, 16, 2, '#ffffff');
    },
  },
  igloo_door: {
    paint: (c) => {
      iceBricks(c, '#ffffff', '#c3d5e8', '#ffffff');
      P(c, 3, 3, 10, 13, '#1c2a3c');
      P(c, 4, 2, 8, 1, '#1c2a3c');
      P(c, 3, 13, 10, 3, '#2c3e54');
    },
  },
  igloo_floor: { variants: 2, paint: (c, { rng }) => (P(c, 0, 0, 16, 16, '#cfe0ee'), speckle(c, rng, 8, ['#bdd2e4', '#e2eef8']), P(c, 0, 15, 16, 1, '#b9cde0')) },
  igloo_inwall: { solid: true, props: { shadow: true }, paint: (c) => iceBricks(c, '#f4f9fd', '#b9cde0', '#ffffff') },
  ice_brick: { solid: true, props: { shadow: true }, paint: (c) => iceBricks(c, '#7fbde6', '#4a8cbc', '#c8ecff') },
  ice_floor: {
    variants: 2,
    paint: (c, { rng, variant }) => {
      P(c, 0, 0, 16, 16, '#cfe6f7');
      speckle(c, rng, 6, ['#bcd9ee', '#e2f2fc']);
      P(c, 0, 15, 16, 1, '#a9cbe6');
      P(c, 15, 0, 1, 16, '#a9cbe6');
      if (variant) P(c, 4, 6, 5, 1, '#ffffff');
    },
  },
  ice_pillar: {
    solid: true,
    props: { shadow: true },
    paint: (c) => {
      P(c, 0, 0, 16, 16, '#cfe6f7');
      P(c, 3, 1, 10, 14, '#5aa8d8');
      P(c, 4, 1, 8, 13, '#9fd8f8');
      P(c, 5, 2, 2, 10, '#e6f8ff');
      P(c, 2, 13, 12, 2, '#4a8cbc');
    },
  },
  temple_door: {
    paint: (c) => {
      iceBricks(c, '#7fbde6', '#4a8cbc', '#c8ecff');
      P(c, 2, 2, 12, 14, '#0c1826');
      P(c, 4, 1, 8, 1, '#0c1826');
    },
  },
};

export const GIVRE_ROLES = Object.keys(GIVRE_TILES);

// ------------------------------------------------------------ objets et monstres (16 x 16)
export const GIVRE_OBJECT_FRAMES = [
  'fire_0', 'fire_1', 'snowball_0', 'snowball_1', 'brazier_off', 'brazier_0', 'brazier_1', 'icewall', 'ice_block',
  'fire_staff', 'wool', 'wood', 'choco', 'snowman_0', 'snowman_1', 'wolf_0', 'wolf_1', 'penguin_0', 'penguin_1',
];

export function paintGivreObject(c, name) {
  const [kind, f] = name.split(/_(?=[01]$)/);
  const step = f === '1' ? 1 : 0;
  switch (kind) {
    case 'fire':
      P(c, 5, 5, 6, 6, '#ff6a1a');
      P(c, 6, 4 + step, 4, 7, '#ffb03a');
      P(c, 7, 6, 2, 3, '#fff2a0');
      P(c, step ? 4 : 10, 4, 1, 2, '#ff8a2a');
      return;
    case 'snowball':
      P(c, 5, 5, 6, 6, '#c3d5e8');
      P(c, 5, 5, 5, 5, '#ffffff');
      P(c, 6, 4, 4, 1, '#ffffff');
      P(c, 6, 11, 4, 1, '#c3d5e8');
      return;
    case 'brazier':
    case 'brazier_off': {
      P(c, 3, 14, 10, 2, 'rgba(0,0,0,.3)');
      P(c, 6, 10, 4, 5, '#5a5a66');
      P(c, 4, 13, 8, 2, '#44444e');
      P(c, 2, 7, 12, 4, '#7a7a88');
      P(c, 2, 7, 12, 1, '#a8a8b6');
      P(c, 4, 8, 8, 2, '#2a2a30');
      if (name === 'brazier_off') return void P(c, 6, 8, 4, 1, '#55555f');
      P(c, 4, 3 + step, 8, 6 - step, '#ff6a1a');
      P(c, 5, 1 + step * 2, 2, 4, '#ff8a2a');
      P(c, 9, 2 - step, 2, 4, '#ff8a2a');
      P(c, 6, 4, 4, 5, '#ffc23a');
      P(c, 7, 6, 2, 3, '#fff2a0');
      return;
    }
    case 'icewall':
      P(c, 0, 0, 16, 16, '#4a8cbc');
      P(c, 0, 0, 15, 15, '#9fd8f8');
      P(c, 1, 1, 13, 2, '#e6f8ff');
      P(c, 1, 1, 2, 12, '#e6f8ff');
      [[5, 3], [6, 4], [6, 5], [7, 6], [8, 7], [7, 8], [8, 9], [9, 10], [9, 11], [10, 12]].forEach(([x, y]) => P(c, x, y, 1, 1, '#3a78a8'));
      [[9, 6], [10, 5], [11, 4]].forEach(([x, y]) => P(c, x, y, 1, 1, '#3a78a8'));
      return;
    case 'ice_block':
      P(c, 0, 0, 16, 16, '#3a8ac0');
      P(c, 0, 0, 15, 15, '#8fd0f4');
      P(c, 0, 0, 15, 1, '#e6f8ff');
      P(c, 0, 0, 1, 15, '#e6f8ff');
      P(c, 4, 4, 7, 7, '#b8e6ff');
      P(c, 5, 5, 2, 4, '#ffffff');
      return;
    case 'fire_staff':
      for (let i = 0; i < 9; i++) P(c, 3 + i, 13 - i, 2, 1, '#8a5a2a');
      P(c, 10, 2, 4, 4, '#ff6a1a');
      P(c, 11, 1, 2, 5, '#ffb03a');
      P(c, 11, 3, 2, 2, '#fff2a0');
      P(c, 9, 5, 2, 2, '#d8c070');
      return;
    case 'wool':
      P(c, 3, 4, 10, 10, '#c83a5a');
      P(c, 4, 3, 8, 12, '#e85a7a');
      [[4, 6], [6, 4], [5, 9], [8, 7], [7, 12]].forEach(([x, y]) => P(c, x, y, 5, 1, '#a82a48'));
      P(c, 12, 12, 3, 1, '#e85a7a');
      P(c, 14, 13, 1, 2, '#e85a7a');
      return;
    case 'wood':
      P(c, 2, 5, 12, 4, '#8a5a2a');
      P(c, 3, 9, 12, 4, '#a8743c');
      P(c, 2, 5, 2, 4, '#d8b070');
      P(c, 3, 9, 2, 4, '#e8c888');
      P(c, 6, 6, 6, 1, '#6a4220');
      P(c, 7, 11, 6, 1, '#8a5a2a');
      return;
    case 'choco':
      P(c, 4, 6, 8, 8, '#e8e8f0');
      P(c, 12, 8, 2, 4, '#e8e8f0');
      P(c, 5, 7, 6, 2, '#6a3a1a');
      P(c, 4, 13, 8, 1, '#b8b8c8');
      P(c, 6, 2 + 0, 1, 3, '#ffffff');
      P(c, 9, 1, 1, 3, '#ffffff');
      return;
    case 'snowman':
      P(c, 3, 14, 10, 2, 'rgba(0,0,0,.25)');
      P(c, 3, 8 + step, 10, 7 - step, '#ffffff');
      P(c, 4, 14, 8, 1, '#c3d5e8');
      P(c, 5, 3 + step, 6, 6, '#ffffff');
      P(c, 5, 1 + step, 6, 2, '#2a2a3a');
      P(c, 4, 3 + step, 8, 1, '#2a2a3a');
      P(c, 6, 5 + step, 1, 1, '#222');
      P(c, 9, 5 + step, 1, 1, '#222');
      P(c, 7, 6 + step, 3, 1, '#ff8a1a');
      P(c, 7, 10, 1, 1, '#222');
      P(c, 7, 12, 1, 1, '#222');
      P(c, 1, 9, 2, 1, '#6b4a33');
      P(c, 13, 9 - step, 2, 1, '#6b4a33');
      return;
    case 'wolf':
      P(c, 2, 14, 12, 2, 'rgba(0,0,0,.25)');
      P(c, 2, 7, 11, 5, '#aab4c4');
      P(c, 2, 11, 11, 1, '#7c889a');
      P(c, 10, 4, 5, 5, '#c4ccd8');
      P(c, 10, 3, 1, 2, '#c4ccd8');
      P(c, 13, 3, 1, 2, '#c4ccd8');
      P(c, 12, 6, 1, 1, '#ffde3a');
      P(c, 14, 8, 1, 1, '#222');
      P(c, 0, 6 - step, 2, 3, '#aab4c4');
      [3, 6, 9, 11].forEach((x, i) => P(c, x, 12, 1, (i + step) % 2 ? 3 : 2, '#7c889a'));
      return;
    case 'penguin':
      P(c, 4, 14, 8, 2, 'rgba(0,0,0,.25)');
      P(c, 4, 3 + step, 8, 11 - step, '#22283a');
      P(c, 6, 6 + step, 4, 8 - step, '#ffffff');
      P(c, 5, 4 + step, 2, 2, '#ffffff');
      P(c, 9, 4 + step, 2, 2, '#ffffff');
      P(c, 6, 5 + step, 1, 1, '#111');
      P(c, 9, 5 + step, 1, 1, '#111');
      P(c, 7, 6 + step, 2, 1, '#ffb03a');
      P(c, 3, 7, 1, 4, '#22283a');
      P(c, 12, 7, 1, 4, '#22283a');
      P(c, 5, 14, 2, 1, '#ffb03a');
      P(c, 9, 14, 2, 1, '#ffb03a');
  }
}

// ------------------------------------------------------------ personnages
export const GIVRE_PEOPLE = {
  granny: { skin: '#f2c49b', hair: '#f0f0f0', eye: '#222', body: '#c83a5a', bodyDark: '#8a2a40', legs: '#5a4a6a', hat: 'cap', hatColor: '#e85a7a', hatDark: '#ffffff' },
  inuit: { skin: '#e8b88a', hair: '#3a2a1a', eye: '#222', body: '#3a8ad8', bodyDark: '#2a5aa8', legs: '#4a3a2a', hat: 'hood', hatColor: '#3a8ad8' },
};

/** Pingo le pingouin (habitant) : 16 x 16, comme les personnages. */
export function paintPingo(c, dir, step) {
  P(c, 4, 15, 8, 1, 'rgba(0,0,0,.3)');
  P(c, 4, 3, 8, 11, '#22283a');
  if (dir !== 'up') {
    P(c, dir === 'side' ? 7 : 6, 6, dir === 'side' ? 4 : 4, 8, '#ffffff');
    P(c, dir === 'side' ? 9 : 6, 5, 1, 1, '#ffffff');
    if (dir !== 'side') P(c, 9, 5, 1, 1, '#ffffff');
    P(c, dir === 'side' ? 9 : 6, 5, 1, 1, '#111');
    if (dir !== 'side') P(c, 9, 5, 1, 1, '#111');
    P(c, dir === 'side' ? 11 : 7, 6, 2, 1, '#ffb03a');
  }
  P(c, 3, 7 + step, 1, 4, '#22283a');
  P(c, 12, 7 - step + 1, 1, 4, '#22283a');
  P(c, 5, 14, 2, 1 + step, '#ffb03a');
  P(c, 9, 14, 2, 2 - step, '#ffb03a');
  // écharpe rouge : on le reconnaît de loin
  P(c, 4, 4 + 5, 8, 1, '#e83a4a');
}

export const paintGivrePerson = (c, who, dir, step) => (who === 'pingo' ? paintPingo(c, dir, step) : humanoid(c, dir, step, GIVRE_PEOPLE[who]));
export const GIVRE_CHARS = ['granny', 'inuit', 'pingo'];
const GIVRE_LOOKS = {
  granny: { longHair: true, glasses: '#c8a030', scarf: '#ffffff' },
  inuit: { scarf: '#e8c040', brows: '#3a2a1a' },
};
/** PC : les humains en haute définition (Pingo : voir game/art/folk.js). */
export const paintGivrePersonHD = (c, who, dir, step) => (who === 'pingo' ? false : (characterHD(c, dir, step, GIVRE_PEOPLE[who], GIVRE_LOOKS[who]), true));

// ------------------------------------------------------------ le Yéti (32 x 32)
/** Sa carapace de glace (bouclier) : des plaques translucides, que le feu fait fondre. */
export function paintYetiShield(c) {
  for (const [x, y, w, h] of [[6, 12, 8, 9], [14, 10, 8, 10], [21, 12, 7, 9], [8, 20, 8, 8], [17, 20, 8, 8]]) {
    P(c, x, y, w, h, 'rgba(170,225,255,.55)');
    P(c, x, y, w, 1, 'rgba(255,255,255,.9)');
    P(c, x + 2, y + 2, 1, 2, 'rgba(255,255,255,.7)');
  }
}

export function paintYeti(c, step) {
  P(c, 5, 29, 22, 2, 'rgba(0,0,0,.3)');
  const y = step;
  P(c, 6, 8 + y, 20, 20 - y, '#c9d9ea');
  P(c, 7, 7 + y, 18, 20 - y, '#f2f7fc');
  // touffes de poils
  for (let x = 7; x < 25; x += 4) P(c, x, 25, 2, 3, '#c9d9ea');
  P(c, 2, 12 + y, 5, 12, '#f2f7fc');
  P(c, 25, 12 + y, 5, 12, '#f2f7fc');
  P(c, 2, 22 + y, 5, 3, '#9db4cc');
  P(c, 25, 22 + y, 5, 3, '#9db4cc');
  // visage bleu
  P(c, 10, 10 + y, 12, 9, '#6aa8d8');
  P(c, 11, 12 + y, 3, 3, '#ffffff');
  P(c, 18, 12 + y, 3, 3, '#ffffff');
  P(c, 12, 13 + y, 2, 2, '#c8202a');
  P(c, 19, 13 + y, 2, 2, '#c8202a');
  P(c, 10, 10 + y, 5, 1, '#3a6a98');
  P(c, 17, 10 + y, 5, 1, '#3a6a98');
  P(c, 12, 17 + y, 8, 1, '#1c2a3c');
  P(c, 13, 16 + y, 1, 1, '#ffffff');
  P(c, 18, 16 + y, 1, 1, '#ffffff');
  // cornes de glace
  P(c, 7, 3 + y, 2, 5, '#9fd8f8');
  P(c, 23, 3 + y, 2, 5, '#9fd8f8');
  P(c, 8, 26, 6, 3, '#9db4cc');
  P(c, 18, 26, 6, 3, '#9db4cc');
}
