// LE VOLCAN NOIR — tuiles, objets, monstres, habitants, Alia et Morgor (niveau 8, le final).
// Dessins 16 x 16 (mobile) ; la cendre, la lave, le château et les habitants humains ont aussi une
// version haute définition (PC, 32 x 32).
import { P, speckle, humanoid } from '../demos/01-moteur/themes.js';
import { P as H, R, disc, ellipse, tint } from '../demos/02-gameplay/hd.js';
import { characterHD } from '../demos/02-gameplay/hd-people.js';

const ASH = '#4a4044';
const ASH_D = '#3a3236';
const ASH_L = '#5a5054';
const STONE = '#2a2430';
const STONE_L = '#3e3646';
const FLOOR = '#3a3440';
const RAINBOW = ['#ff5a7a', '#ffa23a', '#ffe04a', '#5ad87a', '#5aa8ff', '#a87aff'];

// ------------------------------------------------------------------ dessins HD (32 x 32)
function ashHD(c, { rng, variant }) {
  H(c, 0, 0, 32, 32, ASH);
  for (let i = 0; i < 30; i++) H(c, rng.int(0, 31), rng.int(0, 31), rng.int(1, 3), 1, rng.pick([ASH_D, ASH_L, '#524448']));
  if (variant === 1) for (const [x, y] of [[7, 9], [22, 20], [12, 25]]) (H(c, x, y, 2, 1, '#ff6a1a'), H(c, x + 1, y - 1, 1, 1, '#ffb03a'));
  if (variant === 2) for (const [x, y] of [[5, 6], [18, 14], [26, 26]]) (ellipse(c, x, y, 3, 2, '#2e282c'), H(c, x - 1, y - 1, 2, 1, '#6a5a5e'));
}

function lavaHD(c, { frame }) {
  H(c, 0, 0, 32, 32, '#d8401a');
  const o = frame * 6;
  for (let k = 0; k < 5; k++) {
    const y = (k * 7 + o) % 32;
    for (let x = 0; x < 32; x++) H(c, x, (y + Math.round(Math.sin((x + k * 5) / 4) * 2) + 32) % 32, 1, 2, k % 2 ? '#ff8a2a' : '#b82a10');
  }
  for (const [x, y] of [[6, 8], [20, 22], [25, 6]]) (disc(c, (x + o) % 32, y, 2, '#ffd060'), H(c, (x + o) % 32, y - 1, 1, 1, '#fff4c0'));
}

function castleFloorHD(c, { rng }) {
  H(c, 0, 0, 32, 32, FLOOR);
  for (let y = 0; y < 32; y += 8) {
    const off = (y / 8) % 2 ? 8 : 0;
    for (let x = -8; x < 32; x += 16) {
      const b = tint(FLOOR, rng.pick([0, 0.05, -0.05]));
      R(c, x + off + 1, y + 1, 14, 6, b);
      H(c, x + off + 1, y + 1, 14, 1, tint(b, 0.15));
    }
  }
}

function castleBlockHD(c, { rng }) {
  H(c, 0, 0, 32, 32, '#16121a');
  for (let y = 0; y < 32; y += 8) {
    const off = (y / 8) % 2 ? 8 : 0;
    for (let x = -8; x < 32; x += 16) {
      const b = tint(STONE, rng.pick([0, 0.08, -0.06]));
      R(c, x + off + 1, y + 1, 14, 6, b);
      H(c, x + off + 1, y + 1, 14, 1, STONE_L);
    }
  }
}

// ------------------------------------------------------------------ tuiles
const ash = (c, rng) => (P(c, 0, 0, 16, 16, ASH), speckle(c, rng, 10, [ASH_D, ASH_L]));
const floor = (c, rng) => {
  P(c, 0, 0, 16, 16, FLOOR);
  P(c, 0, 7, 16, 1, '#2a2430');
  P(c, 7, 0, 1, 7, '#2a2430');
  P(c, 3, 8, 1, 8, '#2a2430');
  P(c, 12, 8, 1, 8, '#2a2430');
  speckle(c, rng, 3, ['#463e4c']);
};
const block = (c) => {
  P(c, 0, 0, 16, 16, '#16121a');
  for (let y = 0; y < 16; y += 4) for (let x = (y / 4) % 2 ? -4 : 0; x < 16; x += 8) (P(c, x + 1, y + 1, 7, 3, STONE), P(c, x + 1, y + 1, 7, 1, STONE_L));
};
const lavaPaint = (bright) => (c, { frame }) => {
  P(c, 0, 0, 16, 16, bright ? '#ff6a1a' : '#d8401a');
  const o = frame * 3;
  for (let k = 0; k < 3; k++) P(c, (k * 6 + o) % 16, k * 5 + 2, 5, 1, bright ? '#ffd060' : '#ff8a2a');
  P(c, (9 + o) % 16, 12, 3, 2, bright ? '#fff4c0' : '#ffb03a');
  if (bright) P(c, (3 + o * 2) % 16, 7, 2, 2, '#fff4c0');
};

export const VOLCAN_TILES = {
  ash: { variants: 3, paint: (c, { rng, variant }) => (ash(c, rng), variant === 1 && (P(c, 4, 5, 2, 1, '#ff6a1a'), P(c, 11, 11, 2, 1, '#ff6a1a'))), paintHD: ashHD },
  // cendres meubles : on y creuse (pelle)
  ash_soft: {
    props: { diggable: 'ash' },
    paint: (c, { rng }) => {
      ash(c, rng);
      P(c, 2, 6, 12, 6, '#5e5458');
      P(c, 4, 4, 8, 3, '#5e5458');
      P(c, 5, 4, 5, 1, '#746a6e');
      speckle(c, rng, 4, ['#6e6468']);
    },
  },
  // lave : on ne la traverse pas, mais les projectiles passent au-dessus ; la Pierre de Givre la fige
  lava: { solid: true, frames: 2, fps: 2, props: { low: true, freezable: 'cooled_lava', edge: '#ffb03a' }, paint: lavaPaint(false), paintHD: lavaHD },
  // lave bouillonnante : trop chaude, même pour la Pierre de Givre
  magma: { solid: true, frames: 2, fps: 3, props: { low: true, edge: '#fff0a0' }, paint: lavaPaint(true) },
  cooled_lava: {
    paint: (c, { rng }) => {
      P(c, 0, 0, 16, 16, '#3a4a5e');
      speckle(c, rng, 8, ['#4a5e74', '#2e3a4a']);
      P(c, 2, 4, 5, 1, '#a8d8ff');
      P(c, 6, 4, 1, 4, '#a8d8ff');
      P(c, 9, 10, 5, 1, '#a8d8ff');
      P(c, 11, 7, 1, 3, '#7ab8e8');
    },
  },
  basalt: {
    paint: (c, { rng }) => {
      P(c, 0, 0, 16, 16, '#2e2a30');
      for (const [x, y, w, h] of [[1, 1, 6, 6], [9, 1, 6, 6], [1, 9, 6, 6], [9, 9, 6, 6]]) (P(c, x, y, w, h, '#4a444e'), P(c, x, y, w, 1, '#5e5862'));
      speckle(c, rng, 2, ['#3a343c']);
    },
  },
  volcanic_rock: {
    solid: true,
    props: { shadow: true },
    paint: (c, { rng }) => {
      ash(c, rng);
      P(c, 1, 4, 14, 11, '#241e22');
      P(c, 3, 2, 9, 4, '#2e272c');
      P(c, 4, 3, 4, 2, '#4a4046');
      P(c, 2, 9, 3, 1, '#ff5a1a');
      P(c, 1, 14, 14, 1, '#141014');
    },
  },
  cracked_rock: {
    solid: true,
    props: { shadow: true, bombable: 'ash' },
    paint: (c, { rng }) => {
      ash(c, rng);
      P(c, 1, 3, 14, 12, '#3a3236');
      P(c, 2, 2, 11, 3, '#4a4046');
      for (const [x, y] of [[7, 3], [6, 5], [8, 6], [7, 8], [9, 9], [8, 11], [5, 10]]) P(c, x, y, 1, 2, '#0e0a0c');
    },
  },
  dead_tree: {
    solid: true,
    props: { shadow: true },
    paint: (c, { rng }) => {
      ash(c, rng);
      P(c, 7, 4, 2, 11, '#1e1614');
      P(c, 3, 5, 4, 1, '#1e1614');
      P(c, 3, 2, 1, 3, '#1e1614');
      P(c, 9, 7, 4, 1, '#1e1614');
      P(c, 12, 4, 1, 3, '#1e1614');
      P(c, 5, 1, 1, 4, '#1e1614');
    },
  },
  lava_bridge: {
    paint: (c, { frame = 0 }) => {
      lavaPaint(false)(c, { frame });
      P(c, 1, 0, 14, 16, '#4a444e');
      for (let y = 0; y < 16; y += 4) P(c, 1, y, 14, 1, '#2e2a30');
      P(c, 1, 0, 1, 16, '#6a6470');
      P(c, 14, 0, 1, 16, '#2a2430');
    },
  },
  castle_wall: {
    solid: true,
    variants: 3,
    props: { shadow: true },
    paint: (c, { variant }) => {
      block(c);
      if (variant === 1) (P(c, 6, 4, 4, 7, '#0a0608'), P(c, 7, 5, 2, 5, '#ff7a1a'), P(c, 7, 5, 2, 1, '#ffd060'));
      if (variant === 2) (P(c, 0, 0, 16, 2, '#0a0608'), P(c, 2, 0, 4, 3, STONE), P(c, 10, 0, 4, 3, STONE));
    },
    paintHD: castleBlockHD,
  },
  // porte du château (on y entre : c'est une sortie)
  castle_door: {
    paint: (c) => {
      block(c);
      P(c, 2, 3, 12, 13, '#0a0608');
      P(c, 4, 1, 8, 3, '#0a0608');
      P(c, 3, 5, 10, 11, '#3a1a10');
      for (const x of [5, 8, 11]) P(c, x, 5, 1, 11, '#2a1008');
      P(c, 7, 10, 2, 2, '#c8a040');
    },
  },
  castle_block: { solid: true, props: { shadow: true }, paint: (c) => block(c), paintHD: castleBlockHD },
  // faux mur : il ressemble au mur, mais la Pierre d'Aurore révèle le passage
  secret_wall: {
    solid: true,
    props: { shadow: true, secret: 'castle_floor' },
    paint: (c) => (block(c), P(c, 7, 9, 2, 1, '#2e2836')),
    paintHD: castleBlockHD,
  },
  castle_floor: { paint: (c, { rng }) => floor(c, rng), paintHD: castleFloorHD },
  // tas de cendres dans le château : la pelle les creuse
  ash_pile: {
    props: { diggable: 'castle_floor' },
    paint: (c, { rng }) => {
      floor(c, rng);
      // un petit tas de cendres arrondi, avec quelques braises
      for (let y = 0; y < 7; y++) {
        const w = [6, 9, 11, 12, 13, 14, 14][y];
        P(c, 8 - Math.ceil(w / 2), 6 + y, w, 1, y < 2 ? '#8a8086' : y < 4 ? '#6e6468' : '#5a5054');
      }
      P(c, 6, 7, 3, 1, '#a8a0a4');
      P(c, 10, 10, 1, 1, '#ff6a1a');
      P(c, 5, 11, 1, 1, '#ff8a2a');
      P(c, 1, 13, 14, 1, 'rgba(0,0,0,.3)');
    },
  },
  cracked_block: {
    solid: true,
    props: { shadow: true, bombable: 'castle_floor' },
    paint: (c) => {
      block(c);
      for (const [x, y] of [[8, 1], [7, 3], [9, 5], [8, 7], [6, 9], [8, 11], [9, 13]]) P(c, x, y, 1, 2, '#000');
    },
  },
  carpet: {
    paint: (c) => {
      P(c, 0, 0, 16, 16, '#6a1020');
      P(c, 0, 0, 2, 16, '#c8a040');
      P(c, 14, 0, 2, 16, '#c8a040');
      for (let y = 2; y < 16; y += 6) P(c, 6, y, 4, 2, '#8a2030');
    },
  },
  throne: {
    solid: true,
    props: { shadow: true },
    paint: (c, { rng }) => {
      floor(c, rng);
      P(c, 3, 1, 10, 14, '#2a0a10');
      P(c, 4, 2, 8, 6, '#6a1020');
      P(c, 3, 0, 2, 3, '#c8a040');
      P(c, 11, 0, 2, 3, '#c8a040');
      P(c, 4, 9, 8, 5, '#4a0a18');
    },
  },
  // la forge de Brasier : un foyer qui rougeoie
  forge: {
    solid: true,
    frames: 2,
    fps: 4,
    props: { shadow: true },
    paint: (c, { rng, frame }) => {
      ash(c, rng);
      P(c, 1, 4, 14, 11, '#5a4a4a');
      P(c, 2, 3, 12, 2, '#7a6a6a');
      P(c, 3, 6, 10, 6, '#1a0a08');
      P(c, 4, 8, 8, 4, frame ? '#ff8a2a' : '#ff5a1a');
      P(c, 6, 7 - frame, 4, 2, '#ffd060');
    },
  },
  anvil: {
    solid: true,
    props: { shadow: true },
    paint: (c, { rng }) => {
      ash(c, rng);
      P(c, 2, 5, 12, 3, '#5a5a66');
      P(c, 1, 5, 3, 2, '#5a5a66');
      P(c, 3, 5, 10, 1, '#8a8a96');
      P(c, 6, 8, 4, 4, '#3a3a46');
      P(c, 4, 12, 8, 3, '#3a3a46');
    },
  },
  tent: {
    solid: true,
    props: { shadow: true },
    paint: (c, { rng }) => {
      ash(c, rng);
      for (let y = 2; y < 15; y++) P(c, 8 - Math.floor((y - 1) / 2), y, Math.floor((y - 1) / 2) * 2 + 1, 1, y % 3 ? '#8a3a2a' : '#a84a3a');
      P(c, 7, 9, 3, 6, '#1a0a08');
    },
  },
};

// ------------------------------------------------------------------ objets et monstres (16 x 16)
export const VOLCAN_OBJECT_FRAMES = [
  'iris_heart', 'iris_0', 'iris_1', 'iris_armor', 'nugget', 'fireball_0', 'fireball_1', 'seal', 'seal_hit', 'cage_gate', 'lava_gate',
  'geyser', 'geyser_warn', 'geyser_jet_0', 'geyser_jet_1',
  'firebat_0', 'firebat_1', 'imp_0', 'imp_1', 'lavawolf_0', 'lavawolf_1', 'golem_0', 'golem_1',
];

export function paintVolcanObject(c, name) {
  const [kind, f] = name.split(/_(?=[01]$)/);
  const step = f === '1' ? 1 : 0;
  switch (kind) {
    case 'iris_heart':
      // le Cœur d'Iris : un cœur aux 6 couleurs des pierres
      for (let y = 0; y < 12; y++) {
        const w = y < 3 ? [8, 12, 14][y] : 14 - (y - 3) * 2 + (y > 3 ? 1 : 0);
        const x0 = 8 - Math.ceil(w / 2);
        for (let x = 0; x < w; x++) {
          if (y === 0 && x >= 3 && x <= w - 4) continue;
          P(c, 1 + x0 + x, 2 + y, 1, 1, RAINBOW[Math.min(5, Math.floor((x / Math.max(1, w)) * 6))]);
        }
      }
      P(c, 4, 4, 2, 2, '#ffffff');
      return;
    case 'iris':
      for (let k = 0; k < 6; k++) P(c, 3 + ((k + step) % 6) + (k > 2 ? 1 : 0), 3 + k, 6, 1, RAINBOW[k]);
      P(c, 6, 5, 3, 3, '#ffffff');
      return;
    case 'iris_armor':
      P(c, 3, 2, 10, 12, '#c8c8d8');
      P(c, 1, 2, 3, 4, '#a8a8b8');
      P(c, 12, 2, 3, 4, '#a8a8b8');
      P(c, 5, 1, 6, 2, '#a8a8b8');
      P(c, 4, 3, 8, 1, '#ffffff');
      RAINBOW.forEach((col, i) => P(c, 5 + (i % 3) * 2, 6 + Math.floor(i / 3) * 2, 2, 2, col));
      P(c, 3, 13, 10, 1, '#8a8a9a');
      return;
    case 'nugget':
      P(c, 4, 7, 8, 6, '#c89a20');
      P(c, 5, 5, 5, 3, '#e8c040');
      P(c, 6, 6, 2, 1, '#fff4a0');
      P(c, 10, 9, 2, 2, '#a87a10');
      P(c, 3, 13, 10, 1, 'rgba(0,0,0,.3)');
      return;
    case 'fireball':
      P(c, 4, 4, 8, 8, '#ff5a1a');
      P(c, 3, 6, 10, 4, '#ff5a1a');
      P(c, 5, 5, 6, 6, '#ffb03a');
      P(c, 6, 6, 3, 3, '#fff4c0');
      P(c, 6 + step, 1, 3, 3, '#ff8a2a');
      return;
    case 'seal':
    case 'seal_hit': {
      // sceau de Morgor : un cristal noir sur un socle ; brisé, il devient lumineux
      const on = kind === 'seal_hit';
      P(c, 3, 12, 10, 3, '#3a3446');
      P(c, 2, 14, 12, 1, '#1a141e');
      P(c, 6, 2, 4, 10, on ? '#ffe066' : '#1a0a22');
      P(c, 5, 4, 6, 6, on ? '#ffe066' : '#1a0a22');
      P(c, 6, 3, 1, 4, on ? '#ffffff' : '#6a2a8a');
      if (!on) P(c, 8, 6, 1, 1, '#ff3a3a');
      else for (const [x, y] of [[2, 2], [13, 3], [12, 9]]) P(c, x, y, 1, 1, '#ffffff');
      return;
    }
    case 'cage_gate':
      P(c, 0, 0, 16, 2, '#4a4456');
      P(c, 0, 14, 16, 2, '#4a4456');
      for (const x of [1, 5, 9, 13]) (P(c, x, 0, 2, 16, '#6a6476'), P(c, x, 0, 1, 16, '#9a94a6'));
      return;
    case 'lava_gate':
      block(c);
      for (const x of [2, 7, 12]) P(c, x, 1, 2, 14, '#ff5a1a');
      P(c, 1, 7, 14, 2, '#c83a10');
      return;
    case 'geyser':
    case 'geyser_warn': {
      const warn = kind === 'geyser_warn';
      P(c, 2, 5, 12, 8, '#2a2226');
      P(c, 4, 6, 8, 6, '#120c0e');
      P(c, 5, 8, 6, 3, warn ? '#ff8a2a' : '#5a2a1a');
      if (warn) (P(c, 6, 5, 2, 2, '#ffd060'), P(c, 10, 4, 1, 1, '#ffd060'));
      return;
    }
    case 'geyser_jet':
      P(c, 4, 0, 8, 16, '#ff8a2a');
      P(c, 6, 0, 4, 16, '#ffd060');
      P(c, 7, 0, 2, 16, '#fff4c0');
      P(c, 2 + step * 9, 4, 3, 3, '#ff5a1a');
      P(c, 11 - step * 8, 10, 3, 3, '#ff5a1a');
      return;
    case 'firebat':
      P(c, 6, 6, 4, 5, '#3a1010');
      P(c, 6, 7, 1, 1, '#ffd060');
      P(c, 9, 7, 1, 1, '#ffd060');
      if (step) (P(c, 0, 4, 6, 3, '#c83a10'), P(c, 10, 4, 6, 3, '#c83a10'), P(c, 1, 3, 3, 1, '#ff8a2a'), P(c, 12, 3, 3, 1, '#ff8a2a'));
      else (P(c, 1, 7, 5, 4, '#c83a10'), P(c, 10, 7, 5, 4, '#c83a10'), P(c, 1, 11, 2, 1, '#ff8a2a'), P(c, 13, 11, 2, 1, '#ff8a2a'));
      P(c, 7, 4, 2, 2, '#ff8a2a');
      return;
    case 'imp':
      P(c, 4, 14, 8, 2, 'rgba(0,0,0,.3)');
      P(c, 4, 5 - step, 8, 8, '#d83a2a');
      P(c, 3, 3 - step, 2, 3, '#7a1a10');
      P(c, 11, 3 - step, 2, 3, '#7a1a10');
      P(c, 5, 7 - step, 2, 2, '#ffe066');
      P(c, 9, 7 - step, 2, 2, '#ffe066');
      P(c, 6, 10 - step, 4, 1, '#3a0a08');
      P(c, 12, 9, 3, 1, '#7a1a10');
      P(c, 14, 8, 1, 1, '#7a1a10');
      P(c, 5, 13, 2, 2, '#7a1a10');
      P(c, 9, 13, 2, 2, '#7a1a10');
      return;
    case 'lavawolf':
      P(c, 2, 14, 12, 2, 'rgba(0,0,0,.3)');
      P(c, 2, 6, 10, 6, '#3a2a2a');
      P(c, 3, 7, 8, 2, '#ff6a1a');
      P(c, 10, 4, 5, 5, '#3a2a2a');
      P(c, 11, 3, 1, 2, '#3a2a2a');
      P(c, 13, 3, 1, 2, '#3a2a2a');
      P(c, 13, 5, 1, 1, '#ffd060');
      P(c, 14, 7, 2, 1, '#ff6a1a');
      P(c, 0, 5 + step, 3, 2, '#ff6a1a');
      [3, 5, 8, 10].forEach((x, i) => P(c, x, 12, 2, (i + step) % 2 ? 3 : 2, '#2a1a1a'));
      return;
    case 'golem':
      P(c, 2, 14, 12, 2, 'rgba(0,0,0,.35)');
      P(c, 3, 4, 10, 10, '#4a4046');
      P(c, 4, 2, 8, 4, '#5a5056');
      P(c, 5, 4, 2, 2, '#ff8a2a');
      P(c, 9, 4, 2, 2, '#ff8a2a');
      P(c, 6, 8, 4, 1, '#ff5a1a');
      P(c, 0, 6 + step, 3, 6, '#3a3036');
      P(c, 13, 6 + (1 - step), 3, 6, '#3a3036');
      P(c, 4, 13, 3, 2, '#2a2226');
      P(c, 9, 13, 3, 2, '#2a2226');
  }
}

// ------------------------------------------------------------------ habitants
export const VOLCAN_PEOPLE = {
  brasier: { skin: '#c88a5a', hair: '#3a1a0a', eye: '#111', body: '#5a3a2a', bodyDark: '#3a2418', legs: '#2a2020' },
  obsidien: { skin: '#e8b88a', hair: '#e8e8e8', eye: '#222', body: '#2a2a3a', bodyDark: '#1a1a26', legs: '#1a1a26', hat: 'hood', hatColor: '#3a3a52' },
  flammeche: { skin: '#f2c49b', hair: '#e8401a', eye: '#222', body: '#e8a020', bodyDark: '#b87010', legs: '#5a3a2a' },
};
const VOLCAN_LOOKS = { brasier: { beard: '#3a1a0a', apron: '#2a2a2a' }, obsidien: { beard: '#f0f0f0', brows: '#e0e0e0' }, flammeche: { longHair: true, freckles: true } };

/** Alia, la licorne arc-en-ciel (16 x 16), tournée vers la droite (ou la gauche). */
export function paintAlia(c, dir, step) {
  const flip = dir === 'side' ? 1 : 0;
  const X = (x, w = 1) => (flip ? x : 16 - x - w);
  const Q = (x, y, w, h, col) => P(c, X(x, w), y, w, h, col);
  P(c, 2, 15, 12, 1, 'rgba(0,0,0,.3)');
  Q(2, 7, 10, 5, '#ffffff');
  Q(2, 11, 10, 1, '#d6d0ec');
  Q(10, 3, 4, 5, '#ffffff');
  Q(11, 2, 3, 2, '#ffffff');
  [3, 6, 9, 11].forEach((a, i) => Q(a, 12, 1, (i + step) % 2 ? 3 : 4, '#ffffff'));
  Q(13, 0, 1, 2, '#ffd35a');
  Q(12, 4, 1, 1, '#3a2a6a');
  RAINBOW.forEach((col, i) => Q(9 - (i > 2 ? 1 : 0), 2 + i, 2, 1, col));
  [RAINBOW[0], RAINBOW[2], RAINBOW[4]].forEach((col, i) => Q(0, 7 + i * 2, 2, 2, col));
}

export const VOLCAN_CHARS = ['brasier', 'obsidien', 'flammeche', 'alia'];
export const paintVolcanPerson = (c, who, dir, step) => (who === 'alia' ? paintAlia(c, dir, step) : humanoid(c, dir, step, VOLCAN_PEOPLE[who]));
export const paintVolcanPersonHD = (c, who, dir, step) => (who === 'alia' ? false : (characterHD(c, dir, step, VOLCAN_PEOPLE[who], VOLCAN_LOOKS[who]), true));

// ------------------------------------------------------------------ Morgor (32 x 32)
export function paintMorgor(c, name) {
  if (name === 'morgor_shield') {
    // bouclier noir : seul le Cœur d'Iris le traverse
    for (let k = 0; k < 28; k++) {
      const a = (k / 28) * Math.PI * 2;
      P(c, Math.round(16 + Math.cos(a) * 14), Math.round(16 + Math.sin(a) * 14), 2, 2, k % 2 ? '#1a0a22' : '#4a1a5a');
    }
    return;
  }
  if (name === 'morgor_shield2') {
    for (let k = 0; k < 20; k++) {
      const a = (k / 20) * Math.PI * 2;
      P(c, Math.round(16 + Math.cos(a) * 14), Math.round(16 + Math.sin(a) * 14), 2, 2, k % 2 ? '#ff5a1a' : '#ffb03a');
    }
    return;
  }
  const s = name === 'morgor_1' ? 1 : 0;
  P(c, 4, 29, 24, 3, 'rgba(0,0,0,.4)');
  // grande cape
  for (let y = 10; y < 30; y++) P(c, 16 - Math.floor((y - 6) / 2) - s, y, (Math.floor((y - 6) / 2) + s) * 2, 1, y % 5 ? '#2a0a1a' : '#1a0612');
  P(c, 9, 14, 14, 15, '#3a1028');
  // tête et yeux rouges
  P(c, 11, 4, 10, 9, '#4a4a5a');
  P(c, 12, 5, 8, 7, '#2a2a36');
  P(c, 13, 8, 2, 2, '#ff2a2a');
  P(c, 17, 8, 2, 2, '#ff2a2a');
  // couronne de flammes
  for (const [x, h] of [[11, 3], [14, 5], [17, 4], [20, 3]]) (P(c, x, 4 - h - s, 2, h + 1, '#ff6a1a'), P(c, x, 4 - h - s, 1, 1, '#ffd060'));
  // bâton
  P(c, 26, 6, 2, 23, '#3a2418');
  P(c, 25, 3 - s, 4, 4, '#ff3a1a');
  P(c, 26, 4 - s, 2, 2, '#ffd060');
  P(c, 22, 16, 5, 3, '#2a2a36');
}
