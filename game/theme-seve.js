// LA FORÊT DES MURMURES — tuiles, monstres, objets, habitants et boss du niveau 3.
// Dessins 16 x 16 (mobile) ; les tuiles de l'extérieur et les habitants ont aussi une
// version haute définition (PC, 32 x 32). Le reste est agrandi automatiquement.
import { P, speckle, humanoid } from '../demos/01-moteur/themes.js';
import { P as H, R, disc, ellipse, tint, grassHD, waterHD } from '../demos/02-gameplay/hd.js';
import { characterHD } from '../demos/02-gameplay/hd-people.js';

const GRASS = '#4c9a3c';
const GRASS_D = '#3d8530';
const GRASS_L = '#5fb04c';
const grass = (c, rng, n = 12) => (P(c, 0, 0, 16, 16, GRASS), speckle(c, rng, n, [GRASS_D, GRASS_L]));
const WATER = { base: '#2f63c9', deep: '#2a58b8', light: '#9ac0f8' };

// ------------------------------------------------------------------ dessins HD (32 x 32)
/** Grand arbre de la forêt : feuillage sombre et touffu, gros tronc. */
function forestTreeHD(c, o) {
  grassHD(c, { ...o, variant: 0 });
  H(c, 4, 27, 24, 4, 'rgba(0,0,0,.35)');
  R(c, 12, 19, 8, 10, '#4a2e16');
  H(c, 13, 19, 2, 10, '#6e4a26');
  H(c, 10, 27, 4, 2, '#4a2e16');
  H(c, 19, 27, 4, 2, '#4a2e16');
  const blobs = o.variant ? [[9, 13, 8], [22, 12, 8], [16, 7, 9], [16, 17, 7]] : [[10, 11, 8], [22, 14, 8], [15, 6, 8], [13, 18, 7]];
  for (const [x, y, r] of blobs) disc(c, x + 1, y + 1, r, '#123a18');
  for (const [x, y, r] of blobs) disc(c, x, y, r - 1, '#24622a');
  for (const [x, y, r] of blobs) disc(c, x - 2, y - 2, Math.max(2, Math.floor(r / 2.4)), '#3c8a3a');
  for (let i = 0; i < 9; i++) H(c, o.rng.int(4, 27), o.rng.int(2, 22), 1, 1, '#6cbf5a');
}

/** Champignon rouge à points blancs (sur l'herbe) : il montre le chemin dans le bois. */
function mushroomHD(c, o) {
  grassHD(c, { ...o, variant: 0 });
  for (const [x, y, s] of [[12, 14, 1], [22, 22, 0.7]]) {
    const w = Math.round(7 * s);
    ellipse(c, x, y + Math.round(9 * s), w, 2, 'rgba(0,0,0,.25)');
    R(c, x - Math.round(2 * s), y + 1, Math.round(5 * s), Math.round(8 * s), '#f4e8c8');
    ellipse(c, x, y, w, Math.round(5 * s), '#a81e1e');
    ellipse(c, x, y - 1, w - 1, Math.round(4 * s), '#e0302a');
    H(c, x - w + 2, y - 2, 2, 1, '#ff8a7a');
    disc(c, x - 3, y - 2, 1, '#ffffff');
    disc(c, x + 2, y - 3, 1, '#ffffff');
    if (s === 1) disc(c, x + 4, y, 1, '#ffffff');
  }
}

/** Rondins coulés dans la rivière : on marche dessus. */
function logBridgeHD(c, o) {
  waterHD(c, o, WATER);
  for (const y of [2, 12, 22]) {
    R(c, 1, y, 30, 9, '#5a3a1c');
    R(c, 1, y, 30, 7, '#8a5a2a');
    H(c, 3, y + 1, 26, 1, '#b07a40');
    H(c, 6, y + 4, 9, 1, '#6a4220');
    H(c, 18, y + 3, 7, 1, '#6a4220');
    disc(c, 3, y + 4, 3, '#d8b070');
    disc(c, 3, y + 4, 1, '#8a5a2a');
  }
}

/** Mur de rondins (cabane du bûcheron). */
function cabinWallHD(c) {
  H(c, 0, 0, 32, 32, '#4a2e16');
  for (let y = 0; y < 32; y += 8) {
    R(c, 0, y + 1, 32, 7, '#8a5a2a');
    H(c, 1, y + 1, 30, 2, '#b07a40');
    H(c, 0, y + 6, 32, 1, '#5a3a1c');
    disc(c, 2, y + 4, 2, '#d8b070');
    disc(c, 29, y + 4, 2, '#d8b070');
  }
}

/** Écorce du Grand Chêne : grosses rainures verticales, mousse. */
function barkHD(c, { rng, variant }) {
  H(c, 0, 0, 32, 32, '#5a3a1c');
  for (let x = variant ? 2 : 5; x < 32; x += 7) {
    H(c, x, 0, 3, 32, '#7a5230');
    H(c, x, 0, 1, 32, '#946a40');
    H(c, x + 3, 0, 1, 32, '#3a2410');
  }
  for (let i = 0; i < 6; i++) H(c, rng.int(0, 30), rng.int(0, 30), 2, 3, '#3a2410');
  if (variant) for (let i = 0; i < 5; i++) disc(c, rng.int(2, 29), rng.int(20, 30), 2, '#4a8a3a');
}

function oakDoorHD(c, o) {
  barkHD(c, { ...o, variant: 0 });
  ellipse(c, 16, 14, 11, 12, '#2a1a0c');
  H(c, 5, 14, 23, 18, '#2a1a0c');
  ellipse(c, 16, 15, 9, 10, '#120a04');
  H(c, 7, 15, 19, 17, '#120a04');
  H(c, 5, 29, 23, 3, '#3a2410');
}

// ------------------------------------------------------------------ tuiles
export const SEVE_TILES = {
  forest_tree: {
    solid: true,
    variants: 2,
    props: { shadow: true },
    paint: (c, { rng, variant }) => {
      grass(c, rng, 6);
      P(c, 1, 14, 14, 2, 'rgba(0,0,0,.3)');
      P(c, 6, 10, 4, 5, '#4a2e16');
      P(c, 6, 10, 1, 5, '#6e4a26');
      const o = variant ? 1 : 0;
      P(c, 1, 3 + o, 14, 8, '#123a18');
      P(c, 2, 1, 12, 11 - o, '#24622a');
      P(c, 1, 4, 14, 6, '#24622a');
      P(c, 3, 2, 4, 3, '#3c8a3a');
      P(c, 9 - o, 5, 3, 2, '#3c8a3a');
      P(c, 4 + o, 8, 2, 1, '#6cbf5a');
    },
    paintHD: forestTreeHD,
  },
  red_mushroom: {
    props: { seeThrough: true }, // indice du chemin : une cime d'arbre ne doit pas le cacher
    paint: (c, { rng }) => {
      grass(c, rng, 8);
      P(c, 5, 12, 6, 1, 'rgba(0,0,0,.25)');
      P(c, 7, 8, 2, 4, '#f4e8c8');
      P(c, 4, 5, 8, 3, '#e0302a');
      P(c, 5, 4, 6, 1, '#e0302a');
      P(c, 4, 7, 8, 1, '#a81e1e');
      P(c, 5, 5, 1, 1, '#ffffff');
      P(c, 9, 4, 1, 1, '#ffffff');
      P(c, 10, 6, 1, 1, '#ffffff');
    },
    paintHD: mushroomHD,
  },
  log_bridge: {
    frames: 2,
    fps: 2,
    paint: (c, { frame }) => {
      P(c, 0, 0, 16, 16, '#2f63c9');
      P(c, (2 + frame * 4) % 16, 15, 5, 1, '#79a6f2');
      for (const y of [1, 6, 11]) {
        P(c, 0, y, 16, 4, '#8a5a2a');
        P(c, 0, y, 16, 1, '#b07a40');
        P(c, 0, y + 3, 16, 1, '#5a3a1c');
        P(c, 0, y + 1, 2, 2, '#d8b070');
      }
    },
    paintHD: logBridgeHD,
  },
  cabin_wall: {
    solid: true,
    props: { shadow: true },
    paint: (c) => {
      P(c, 0, 0, 16, 16, '#4a2e16');
      for (let y = 0; y < 16; y += 4) (P(c, 0, y, 16, 3, '#8a5a2a'), P(c, 0, y, 16, 1, '#b07a40'), P(c, 0, y + 1, 1, 1, '#d8b070'), P(c, 15, y + 1, 1, 1, '#d8b070'));
    },
    paintHD: cabinWallHD,
  },
  oak_bark: {
    solid: true,
    variants: 2,
    props: { shadow: true },
    paint: (c, { variant }) => {
      P(c, 0, 0, 16, 16, '#5a3a1c');
      for (let x = variant ? 1 : 3; x < 16; x += 4) (P(c, x, 0, 2, 16, '#7a5230'), P(c, x + 2, 0, 1, 16, '#3a2410'));
      if (variant) (P(c, 2, 12, 3, 2, '#4a8a3a'), P(c, 10, 13, 4, 2, '#4a8a3a'));
    },
    paintHD: barkHD,
  },
  oak_door: {
    paint: (c) => {
      P(c, 0, 0, 16, 16, '#5a3a1c');
      for (let x = 3; x < 16; x += 4) P(c, x, 0, 2, 16, '#7a5230');
      P(c, 3, 3, 10, 13, '#120a04');
      P(c, 4, 2, 8, 1, '#120a04');
      P(c, 2, 14, 12, 2, '#3a2410');
    },
    paintHD: oakDoorHD,
  },
  // Intérieur du Grand Chêne
  oak_floor: {
    variants: 2,
    paint: (c, { variant }) => {
      P(c, 0, 0, 16, 16, '#c8965a');
      // cernes du bois
      P(c, 2, 2, 12, 12, '#b8864a');
      P(c, 4, 4, 8, 8, '#c8965a');
      P(c, 6, 6, 4, 4, '#b8864a');
      if (variant) P(c, 0, 9, 16, 1, '#a87a40');
      P(c, 0, 15, 16, 1, '#a87a40');
    },
  },
  oak_wall: {
    solid: true,
    props: { shadow: true },
    paint: (c) => {
      P(c, 0, 0, 16, 16, '#4a2e16');
      for (let x = 1; x < 16; x += 5) (P(c, x, 0, 3, 16, '#6e4a26'), P(c, x, 0, 1, 16, '#8a5e32'));
      P(c, 0, 15, 16, 1, '#2a1a0c');
    },
  },
  oak_hole: {
    solid: true,
    props: { low: true }, // les flèches passent au-dessus
    paint: (c) => {
      P(c, 0, 0, 16, 16, '#0c0804');
      P(c, 0, 0, 16, 2, '#3a2410');
      P(c, 3, 6, 2, 1, '#1e140a');
      P(c, 10, 11, 3, 1, '#1e140a');
    },
  },
  branch_bridge: {
    paint: (c) => {
      P(c, 0, 0, 16, 16, '#0c0804');
      P(c, 0, 3, 16, 10, '#6e4a26');
      P(c, 0, 3, 16, 2, '#946a40');
      P(c, 0, 11, 16, 2, '#4a2e16');
      P(c, 5, 6, 1, 4, '#4a2e16');
      P(c, 11, 7, 1, 3, '#4a2e16');
      P(c, 2, 1, 1, 3, '#c8b070'); // cordes de la nacelle
      P(c, 13, 1, 1, 3, '#c8b070');
    },
  },
  ladder_up: {
    paint: (c) => {
      P(c, 0, 0, 16, 16, '#2a1a0c');
      P(c, 3, 0, 2, 16, '#c8965a');
      P(c, 11, 0, 2, 16, '#c8965a');
      for (let y = 1; y < 16; y += 4) P(c, 3, y, 10, 2, '#e0b070');
    },
  },
  ladder_down: {
    paint: (c) => {
      P(c, 0, 0, 16, 16, '#c8965a');
      P(c, 2, 2, 12, 12, '#120a04');
      P(c, 4, 2, 2, 12, '#8a5a2a');
      P(c, 10, 2, 2, 12, '#8a5a2a');
      for (let y = 4; y < 14; y += 4) P(c, 4, y, 8, 1, '#b07a40');
    },
  },
  leaf_wall: {
    solid: true,
    props: { shadow: true },
    paint: (c) => {
      P(c, 0, 0, 16, 16, '#24622a');
      for (const [x, y] of [[1, 1], [8, 0], [4, 7], [11, 8], [0, 12], [7, 13]]) (P(c, x, y, 5, 4, '#3c8a3a'), P(c, x + 1, y, 2, 1, '#6cbf5a'));
      P(c, 0, 15, 16, 1, '#123a18');
    },
  },
};

// ------------------------------------------------------------------ objets et monstres (16 x 16)
export const SEVE_OBJECT_FRAMES = [
  'arrow_side', 'arrow_up', 'arrow_down', 'bow', 'target', 'target_hit', 'log', 'bramble', 'acorn_0', 'acorn_1', 'thorn_0', 'thorn_1',
  'egg', 'firewood', 'honey', 'boar_0', 'boar_1', 'squirrel_0', 'squirrel_1', 'wasp_0', 'wasp_1', 'shroom_0', 'shroom_1',
];

export function paintSeveObject(c, name) {
  const [kind, f] = name.split(/_(?=[01]$)/);
  const step = f === '1' ? 1 : 0;
  switch (kind) {
    case 'arrow_side':
      P(c, 3, 7, 9, 1, '#8a5a2a');
      P(c, 12, 6, 2, 3, '#c8d0e0');
      P(c, 14, 7, 1, 1, '#c8d0e0');
      P(c, 2, 6, 2, 1, '#e83a3a');
      P(c, 2, 8, 2, 1, '#e83a3a');
      return;
    case 'arrow_up':
    case 'arrow_down': {
      const up = kind === 'arrow_up';
      P(c, 7, 3, 1, 9, '#8a5a2a');
      P(c, 6, up ? 2 : 12, 3, 2, '#c8d0e0');
      P(c, 7, up ? 1 : 14, 1, 1, '#c8d0e0');
      P(c, 6, up ? 12 : 2, 1, 2, '#e83a3a');
      P(c, 8, up ? 12 : 2, 1, 2, '#e83a3a');
      return;
    }
    case 'bow':
      for (let i = 0; i < 12; i++) P(c, 4 + Math.round(Math.sin((i / 11) * Math.PI) * -3) + 2, 2 + i, 2, 1, '#8a5a2a');
      P(c, 5, 2, 1, 12, '#f4e8c8');
      P(c, 6, 7, 8, 1, '#8a5a2a');
      P(c, 13, 6, 2, 3, '#c8d0e0');
      return;
    case 'target':
    case 'target_hit':
      P(c, 7, 12, 2, 4, '#5a3a1c');
      P(c, 2, 2, 12, 12, '#f4e8c8');
      P(c, 3, 1, 10, 14, '#f4e8c8');
      P(c, 1, 3, 14, 10, '#f4e8c8');
      P(c, 3, 3, 10, 10, '#d83a3a');
      P(c, 5, 5, 6, 6, '#f4e8c8');
      P(c, 6, 6, 4, 4, '#d83a3a');
      if (name === 'target_hit') (P(c, 7, 7, 6, 1, '#8a5a2a'), P(c, 12, 6, 2, 1, '#e83a3a'), P(c, 12, 8, 2, 1, '#e83a3a'), P(c, 6, 6, 2, 2, '#ffe066'));
      return;
    case 'log':
      P(c, 0, 13, 16, 3, 'rgba(0,0,0,.3)');
      P(c, 0, 3, 16, 11, '#5a3a1c');
      P(c, 0, 3, 16, 9, '#8a5a2a');
      P(c, 0, 4, 16, 2, '#b07a40');
      P(c, 4, 8, 6, 1, '#6a4220');
      P(c, 0, 3, 4, 10, '#d8b070');
      P(c, 1, 6, 2, 4, '#a87a40');
      return;
    case 'bramble':
      P(c, 0, 0, 16, 16, 'rgba(0,0,0,0)');
      for (const [x, y, w] of [[0, 2, 16], [1, 7, 14], [0, 12, 16]]) (P(c, x, y, w, 2, '#3a2a3a'), P(c, x, y, w, 1, '#5a4a5a'));
      for (const [x, y] of [[2, 1], [7, 1], [12, 1], [4, 6], [10, 6], [2, 11], [8, 11], [13, 11], [5, 4], [11, 9]]) P(c, x, y, 1, 1, '#c8c0b0');
      for (const x of [3, 8, 13]) P(c, x, 0, 2, 16, '#2a1a2a');
      return;
    case 'acorn':
      P(c, 6, 7, 5, 5, '#b07a30');
      P(c, 7, 11, 3, 1, '#b07a30');
      P(c, 5, 5 + step, 7, 3, '#6a4220');
      P(c, 8, 4 + step, 1, 1, '#4a2e16');
      return;
    case 'thorn':
      P(c, 4, 7, 8, 2, '#3a2a3a');
      P(c, 11, 6, 2, 4, '#5a3a5a');
      P(c, 13, 7, 1, 2, '#c8c0b0');
      P(c, 5 + step * 2, 6, 1, 1, '#c8c0b0');
      P(c, 7 + step, 9, 1, 1, '#c8c0b0');
      return;
    case 'egg':
      P(c, 5, 3, 6, 11, '#f4f0e0');
      P(c, 4, 5, 8, 8, '#f4f0e0');
      P(c, 6, 2, 4, 1, '#f4f0e0');
      P(c, 5, 5, 2, 3, '#ffffff');
      P(c, 8, 9, 2, 1, '#c8b890');
      P(c, 6, 11, 1, 1, '#c8b890');
      P(c, 5, 13, 6, 1, '#d8d0b8');
      return;
    case 'firewood':
      P(c, 2, 6, 12, 5, '#8a5a2a');
      P(c, 2, 6, 12, 1, '#b07a40');
      P(c, 2, 6, 3, 5, '#d8b070');
      P(c, 3, 7, 1, 3, '#a87a40');
      P(c, 6, 9, 6, 1, '#6a4220');
      P(c, 11, 4, 2, 2, '#5aa04a'); // petite feuille
      return;
    case 'honey':
      P(c, 4, 5, 8, 9, '#f4b030');
      P(c, 5, 4, 6, 1, '#f4b030');
      P(c, 4, 3, 8, 2, '#f4e8c8');
      P(c, 5, 6, 2, 5, '#ffd870');
      P(c, 4, 13, 8, 1, '#c88010');
      P(c, 5, 8, 6, 2, '#8a5a2a');
      return;
    case 'boar':
      P(c, 2, 14, 12, 2, 'rgba(0,0,0,.25)');
      P(c, 1, 6 + step, 12, 7, '#6a4a3a');
      P(c, 2, 5 + step, 9, 2, '#4a3428');
      P(c, 10, 7 + step, 5, 5, '#7a5a48');
      P(c, 14, 9 + step, 2, 2, '#e8a0a0');
      P(c, 12, 8 + step, 1, 1, '#141414');
      P(c, 13, 11 + step, 1, 2, '#f4f0e0'); // défense
      P(c, 11, 5 + step, 2, 2, '#4a3428');
      [2, 5, 8, 11].forEach((x, i) => P(c, x, 13, 2, (i + step) % 2 ? 2 : 1, '#3a2a20'));
      return;
    case 'squirrel':
      P(c, 3, 14, 10, 2, 'rgba(0,0,0,.25)');
      P(c, 9, 3 + step, 5, 10, '#c8642a');
      P(c, 10, 2 + step, 4, 2, '#e8844a');
      P(c, 3, 7, 7, 7, '#a8541a');
      P(c, 3, 4, 6, 5, '#a8541a');
      P(c, 3, 2, 2, 3, '#a8541a');
      P(c, 4, 6, 1, 1, '#141414');
      P(c, 4, 9, 4, 4, '#f4d8a8');
      P(c, 2, 8, 2, 2, '#b07a30'); // gland
      return;
    case 'wasp':
      P(c, 4, 15, 8, 1, 'rgba(0,0,0,.2)');
      P(c, 3, 2 + step * 2, 4, 3, 'rgba(220,240,255,.85)');
      P(c, 9, 2 + step * 2, 4, 3, 'rgba(220,240,255,.85)');
      P(c, 4, 6, 8, 6, '#f4c020');
      P(c, 5, 7, 1, 4, '#141414');
      P(c, 8, 7, 1, 4, '#141414');
      P(c, 11, 7, 2, 4, '#141414');
      P(c, 2, 7, 3, 4, '#2a2a2a');
      P(c, 2, 8, 1, 1, '#ff4a4a');
      P(c, 13, 9, 2, 1, '#2a2a2a');
      return;
    case 'shroom':
      P(c, 3, 14, 10, 2, 'rgba(0,0,0,.25)');
      P(c, 5, 8 - step * 2, 6, 6, '#f4e8c8');
      P(c, 6, 10 - step * 2, 1, 2, '#141414');
      P(c, 9, 10 - step * 2, 1, 2, '#141414');
      P(c, 2, 3 - step * 2, 12, 6, '#8a3ac8');
      P(c, 3, 2 - step * 2, 10, 1, '#8a3ac8');
      P(c, 2, 8 - step * 2, 12, 1, '#5a2a8a');
      P(c, 4, 4 - step * 2, 2, 2, '#ffe066');
      P(c, 10, 3 - step * 2, 2, 2, '#ffe066');
      P(c, 7, 6 - step * 2, 2, 1, '#ffe066');
      if (step) (P(c, 5, 13, 2, 1, '#f4e8c8'), P(c, 9, 13, 2, 1, '#f4e8c8'));
  }
}

// ------------------------------------------------------------------ habitants
export const SEVE_PEOPLE = {
  woodcutter: { skin: '#d9a07a', hair: '#6a3a1a', eye: '#111', body: '#c83a3a', bodyDark: '#8a2a2a', legs: '#3a3a5a', hat: 'cap', hatColor: '#4a6a2a', hatDark: '#2a4a1a' },
  druid: { skin: '#f2c49b', hair: '#e8e8e8', eye: '#222', body: '#2e7a34', bodyDark: '#1f5a2a', legs: '#4a3a2a', hat: 'hood', hatColor: '#3c8a3a' },
};
const SEVE_LOOKS = {
  woodcutter: { beard: '#6a3a1a', toolbelt: true, brows: '#4a2410' },
  druid: { longHair: true },
};

/** Hulotte la chouette : 16 x 16. */
export function paintOwl(c, dir, step) {
  P(c, 4, 15, 8, 1, 'rgba(0,0,0,.3)');
  P(c, 3, 3 + step, 10, 12 - step, '#8a5a2a');
  P(c, 3, 2 + step, 2, 2, '#8a5a2a');
  P(c, 11, 2 + step, 2, 2, '#8a5a2a');
  if (dir !== 'up') {
    P(c, 5, 9 + step, 6, 5 - step, '#d8b070');
    P(c, 6, 10 + step, 1, 1, '#a87a40');
    P(c, 9, 11 + step, 1, 1, '#a87a40');
    const ex = dir === 'side' ? 7 : 4;
    P(c, ex, 4 + step, 4, 4, '#ffe066');
    if (dir !== 'side') P(c, 8, 4 + step, 4, 4, '#ffe066');
    P(c, ex + 1, 5 + step, 2, 2, '#141414');
    if (dir !== 'side') P(c, 9, 5 + step, 2, 2, '#141414');
    P(c, dir === 'side' ? 11 : 7, 8 + step, 2, 1, '#f08a1a');
  } else P(c, 5, 5 + step, 6, 7, '#6a4220');
  P(c, 2, 7 + step, 1, 6, '#6a4220');
  P(c, 13, 7 + step, 1, 6, '#6a4220');
  P(c, 5, 15, 2, 1, '#f08a1a');
  P(c, 9, 15, 2, 1, '#f08a1a');
}

export const SEVE_CHARS = ['woodcutter', 'druid', 'owl'];
export const paintSevePerson = (c, who, dir, step) => (who === 'owl' ? paintOwl(c, dir, step) : humanoid(c, dir, step, SEVE_PEOPLE[who]));
/** PC : les humains en haute définition ; la chouette est agrandie automatiquement. */
export const paintSevePersonHD = (c, who, dir, step) => (who === 'owl' ? false : (characterHD(c, dir, step, SEVE_PEOPLE[who], SEVE_LOOKS[who]), true));

// ------------------------------------------------------------------ Ronce-Noire (32 x 32)
export function paintRonce(c, name) {
  if (name === 'ronce_shield') {
    // ronces qui protègent les yeux
    for (const [x, y, w] of [[6, 9, 20], [4, 13, 24]]) (P(c, x, y, w, 2, '#3a1a3a'), P(c, x, y, w, 1, '#6a3a6a'));
    for (let x = 6; x < 28; x += 3) P(c, x, 8 + (x % 2) * 7, 1, 1, '#e8e0d0');
    return;
  }
  const s = name === 'ronce_1' ? 1 : 0;
  P(c, 3, 29, 26, 3, 'rgba(0,0,0,.35)');
  // racines
  for (const [x, w] of [[2, 6], [24, 6], [10, 4], [18, 4]]) P(c, x, 26, w, 4, '#3a2420');
  // tronc tordu
  P(c, 8, 8, 16, 20, '#4a2e2a');
  P(c, 9, 8, 3, 20, '#6a4440');
  P(c, 21, 10, 2, 18, '#2a1a18');
  // branches et ronces
  P(c, 1, 4 + s, 9, 3, '#3a2420');
  P(c, 22, 3 - s, 9, 3, '#3a2420');
  P(c, 0, 2 + s, 3, 3, '#3a2420');
  P(c, 29, 1 - s, 3, 3, '#3a2420');
  for (const [x, y] of [[2, 3], [6, 3], [24, 2], [28, 2], [4, 7], [26, 6]]) P(c, x, y + (x < 16 ? s : -s), 1, 1, '#e8e0d0');
  // feuillage noir et violet
  P(c, 6, 0, 20, 8, '#2a1a2a');
  P(c, 8, 1, 6, 4, '#4a2a4a');
  P(c, 18, 2, 5, 3, '#4a2a4a');
  // yeux rouges
  P(c, 10, 12, 5, 4, '#ffde3a');
  P(c, 18, 12, 5, 4, '#ffde3a');
  P(c, 12, 13, 2, 3, '#c8202a');
  P(c, 19, 13, 2, 3, '#c8202a');
  P(c, 9, 11, 6, 1, '#1a0e0c');
  P(c, 18, 11, 6, 1, '#1a0e0c');
  // bouche et cœur qui luit
  P(c, 11, 19 + s, 10, 2, '#1a0e0c');
  P(c, 13, 19 + s, 1, 1, '#e8e0d0');
  P(c, 18, 19 + s, 1, 1, '#e8e0d0');
  P(c, 14, 23, 4, 3, '#8a2a8a');
  P(c, 15, 24, 2, 1, '#e86ae8');
}
