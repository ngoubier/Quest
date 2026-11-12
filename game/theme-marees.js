// LES ABYSSES DE CORAIL — tuiles de la plage et des fonds marins, objets, monstres, habitants et
// boss du niveau 7. Dessins 16 x 16 (mobile) ; la mer, le ponton, les fonds, les récifs, les coraux et
// les habitants humains ont aussi une version haute définition (PC, 32 x 32).
import { P, speckle, humanoid } from '../demos/01-moteur/themes.js';
import { P as H, R, disc, ellipse, tint, waterHD } from '../demos/02-gameplay/hd.js';
import { characterHD } from '../demos/02-gameplay/hd-people.js';

const BED = '#3a6a8a';
const BED_D = '#2e5a78';
const BED_L = '#4a7a9a';
const CORALS = ['#ff6a8a', '#ffa040', '#c86aff', '#ff4a6a'];

// ------------------------------------------------------------------ dessins HD (32 x 32)
function seabedHD(c, { rng, variant }) {
  H(c, 0, 0, 32, 32, BED);
  for (let i = 0; i < 26; i++) H(c, rng.int(0, 31), rng.int(0, 31), 2, 1, rng.pick([BED_D, BED_L, '#46768e']));
  if (variant === 1) for (const [x, y] of [[6, 22], [9, 24], [24, 8]]) (ellipse(c, x, y, 2, 1, '#e8e0c8'), H(c, x - 1, y - 1, 2, 1, '#ffffff'));
  if (variant === 2) for (let k = 0; k < 3; k++) H(c, 10 + k * 5, 26 - k, 1, 4 + k, '#3a8a5a');
}

function reefHD(c, { rng }) {
  H(c, 0, 0, 32, 32, '#2a4058');
  for (let i = 0; i < 9; i++) {
    const x = rng.int(2, 28);
    const y = rng.int(2, 28);
    const r = rng.int(4, 7);
    disc(c, x + 1, y + 1, r, '#1a2a3a');
    disc(c, x, y, r - 1, rng.pick(['#4a6a80', '#5a7a90', '#3e5e74']));
    H(c, x - 2, y - 2, 3, 1, '#7a9ab0');
  }
}

function coralHD(c, o) {
  seabedHD(c, { ...o, variant: 0 });
  const col = CORALS[o.variant % CORALS.length];
  ellipse(c, 16, 29, 10, 2, 'rgba(0,0,0,.25)');
  const branch = (x, y, h, w) => (R(c, x, y, w, h, col), H(c, x + 1, y, 1, h - 1, tint(col, 0.35)), disc(c, x + w / 2, y, w / 2 + 1, tint(col, 0.15)));
  branch(14, 8, 21, 5);
  branch(7, 13, 12, 4);
  branch(22, 11, 14, 4);
  H(c, 9, 22, 6, 3, col);
  H(c, 19, 21, 5, 3, col);
  for (const [x, y] of [[16, 6], [9, 11], [24, 9]]) disc(c, x, y, 1, '#ffffff');
}

function seaHD(c, o) {
  waterHD(c, o, { base: '#2a7ac8', deep: '#1f68b4', light: '#a8dcff' });
}

function pierHD(c, { rng }) {
  waterHD(c, { frame: 0, variant: 0 }, { base: '#2a7ac8', deep: '#1f68b4', light: '#a8dcff' });
  for (let y = 0; y < 32; y += 8) {
    const b = tint('#a87a48', rng.pick([0, 0.06, -0.06]));
    R(c, 2, y + 1, 28, 7, b);
    H(c, 3, y + 1, 26, 1, tint(b, 0.3));
    H(c, 2, y + 7, 28, 1, tint(b, -0.3));
    H(c, 6, y + 4, 1, 1, '#5a3a1c');
    H(c, 25, y + 4, 1, 1, '#5a3a1c');
  }
}

// ------------------------------------------------------------------ tuiles
const seabed = (c, rng) => (P(c, 0, 0, 16, 16, BED), speckle(c, rng, 10, [BED_D, BED_L]));
const current = (dx, dy) => ({
  frames: 2,
  fps: 4,
  props: { current: [dx, dy] },
  paint: (c, { rng, frame }) => {
    P(c, 0, 0, 16, 16, '#3a7aa0');
    speckle(c, rng, 4, [BED_L]);
    // chevrons qui avancent dans le sens du courant
    for (let k = 0; k < 2; k++) {
      const o = ((k * 8 + frame * 4) % 16) - 4;
      for (let i = 0; i < 4; i++) {
        const along = o + i;
        const across1 = 4 + i;
        const across2 = 11 - i;
        const pt = (a, b) => (dx ? [dx > 0 ? a : 15 - a, b] : [b, dy > 0 ? a : 15 - a]);
        for (const [x, y] of [pt(along, across1), pt(along, across2)]) if (x >= 0 && x < 16 && y >= 0 && y < 16) P(c, x, y, 1, 1, '#c8ecff');
      }
    }
  },
});

export const MAREES_TILES = {
  sea: {
    solid: true,
    frames: 2,
    fps: 2,
    props: { low: true, edge: '#e8f8ff' },
    paint: (c, { frame }) => {
      P(c, 0, 0, 16, 16, '#2a7ac8');
      const o = frame * 4;
      P(c, (2 + o) % 16, 4, 5, 1, '#a8dcff');
      P(c, (9 + o) % 16, 11, 5, 1, '#a8dcff');
    },
    paintHD: seaHD,
  },
  pier: {
    paint: (c) => {
      P(c, 0, 0, 16, 16, '#2a7ac8');
      for (let y = 0; y < 16; y += 4) (P(c, 1, y, 14, 3, '#a87a48'), P(c, 1, y, 14, 1, '#c89a68'));
    },
    paintHD: pierHD,
  },
  boat: {
    solid: true,
    props: { shadow: true },
    paint: (c) => {
      P(c, 0, 0, 16, 16, '#2a7ac8');
      P(c, 1, 4, 14, 9, '#8a4a2a');
      P(c, 2, 4, 12, 2, '#c87a4a');
      P(c, 3, 9, 10, 1, '#f4e8c8');
      P(c, 7, 0, 2, 5, '#5a3a1c');
    },
  },
  sea_rock: {
    solid: true,
    props: { shadow: true },
    paint: (c, { rng }) => {
      P(c, 0, 0, 16, 16, '#e8d090');
      speckle(c, rng, 4, ['#d4b874']);
      P(c, 1, 3, 14, 12, '#6a7a8a');
      P(c, 2, 2, 10, 3, '#8a9aaa');
      P(c, 3, 4, 4, 2, '#aab8c8');
      P(c, 1, 14, 14, 1, '#4a5a6a');
    },
  },
  seabed: { variants: 3, paint: (c, { rng }) => seabed(c, rng), paintHD: seabedHD },
  // La corde du ponton qui pend jusqu'au fond : rope_top (dans le creux du récif, on la touche pour remonter),
  // puis rope, avec la bouée au bout.
  rope_top: {
    frames: 2,
    fps: 2,
    paint: (c, { rng, frame }) => {
      seabed(c, rng);
      P(c, 4, 0, 8, 16, 'rgba(200,240,255,.18)'); // la lumière de la surface
      for (let y = 0; y < 16; y++) P(c, 7, y, 2, 1, y % 3 === 0 ? '#a8803a' : '#d8b060');
      for (const [x, y] of [[4, 5], [11, 10]]) P(c, x, y - frame, 1, 1, '#d8f4ff');
    },
    paintHD: (c, { rng, frame }) => {
      seabedHD(c, { rng, variant: 0 });
      H(c, 8, 0, 16, 32, 'rgba(200,240,255,.18)');
      for (let y = 0; y < 32; y++) (H(c, 15, y, 3, 1, y % 4 < 2 ? '#d8b060' : '#a8803a'), y % 4 === 0 && H(c, 17, y, 1, 1, '#f4d890'));
      for (const [x, y] of [[8, 10], [24, 20]]) (disc(c, x, y - frame * 2, 1, 'rgba(220,245,255,.8)'), H(c, x, y - 1 - frame * 2, 1, 1, '#ffffff'));
    },
  },
  rope: {
    frames: 2,
    fps: 2,
    paint: (c, { rng, frame }) => {
      seabed(c, rng);
      const sway = frame;
      for (let y = 0; y < 10; y++) P(c, 7 + (y > 4 ? sway : 0), y, 2, 1, y % 3 === 0 ? '#a8803a' : '#d8b060');
      P(c, 4 + sway, 10, 8, 5, '#e83a3a'); // bouée
      P(c, 5 + sway, 9, 6, 1, '#e83a3a');
      P(c, 4 + sway, 12, 8, 1, '#ffffff');
      P(c, 5 + sway, 10, 2, 1, '#ff9a9a');
      P(c, 5 + sway, 15, 6, 1, 'rgba(0,0,0,.25)');
    },
    paintHD: (c, { rng, frame }) => {
      seabedHD(c, { rng, variant: 0 });
      const sway = frame * 2;
      for (let y = 0; y < 18; y++) {
        const x = 15 + (y > 8 ? Math.round(((y - 8) / 10) * sway) : 0);
        H(c, x, y, 3, 1, y % 4 < 2 ? '#d8b060' : '#a8803a');
        if (y % 4 === 0) H(c, x + 2, y, 1, 1, '#f4d890');
      }
      ellipse(c, 16 + sway, 30, 8, 1, 'rgba(0,0,0,.25)');
      ellipse(c, 16 + sway, 24, 9, 6, '#a82020');
      ellipse(c, 16 + sway, 23, 9, 6, '#e83a3a');
      H(c, 7 + sway, 23, 19, 3, '#ffffff');
      H(c, 10 + sway, 18, 5, 2, '#ff9a9a');
    },
  },
  reef: {
    solid: true,
    props: { shadow: true },
    paint: (c, { rng }) => {
      P(c, 0, 0, 16, 16, '#2a4058');
      for (let i = 0; i < 5; i++) {
        const x = rng.int(1, 12);
        const y = rng.int(1, 12);
        P(c, x, y, 4, 4, '#4a6a80');
        P(c, x, y, 2, 1, '#7a9ab0');
      }
    },
    paintHD: reefHD,
  },
  coral: {
    solid: true,
    variants: 4,
    props: { low: true }, // le trident (et les flèches) passent par-dessus
    paint: (c, { rng, variant }) => {
      seabed(c, rng);
      const col = CORALS[variant];
      P(c, 7, 3, 2, 12, col);
      P(c, 3, 6, 2, 7, col);
      P(c, 11, 5, 2, 8, col);
      P(c, 4, 12, 8, 2, col);
      P(c, 7, 2, 2, 1, '#ffffff');
    },
    paintHD: coralHD,
  },
  algae: {
    solid: true,
    frames: 2,
    fps: 2,
    props: { cuttable: true, cutTo: 'seabed', shadow: true }, // l'épée ou le trident la coupe
    paint: (c, { rng, frame }) => {
      seabed(c, rng);
      for (const x of [2, 6, 10, 13]) {
        for (let y = 1; y < 16; y++) P(c, x + Math.round(Math.sin(y / 3 + frame + x) * 1), y, 2, 1, y % 4 ? '#2e8a4a' : '#4ab86a');
      }
    },
  },
  current_up: current(0, -1),
  current_down: current(0, 1),
  current_left: current(-1, 0),
  current_right: current(1, 0),
  wreck: {
    solid: true,
    props: { shadow: true },
    paint: (c, { rng }) => {
      seabed(c, rng);
      P(c, 1, 3, 14, 11, '#5a3a1c');
      for (let y = 4; y < 14; y += 3) P(c, 1, y, 14, 1, '#7a5230');
      P(c, 5, 6, 4, 4, '#1a1008');
      P(c, 11, 2, 2, 12, '#3a2410');
    },
  },
};

// ------------------------------------------------------------------ objets et monstres (16 x 16)
export const MAREES_OBJECT_FRAMES = [
  'spyglass', 'diving_suit', 'trident', 'trident_side', 'trident_up', 'trident_down', 'shell', 'shell_hit', 'pearl', 'bubble', 'coral_gate', 'ink_0', 'ink_1',
  'crab_0', 'crab_1', 'jelly_0', 'jelly_1', 'eel_0', 'eel_1', 'lantern_0', 'lantern_1', 'tentacle_0', 'tentacle_1',
];

export function paintMareesObject(c, name) {
  const [kind, f] = name.split(/_(?=[01]$)/);
  const step = f === '1' ? 1 : 0;
  switch (kind) {
    case 'spyglass':
      for (let i = 0; i < 10; i++) P(c, 2 + i, 11 - i, 3, 3, i < 4 ? '#8a5a2a' : '#d8a040');
      P(c, 11, 1, 4, 4, '#a8d8ff');
      P(c, 2, 11, 3, 3, '#5a3a1c');
      return;
    case 'diving_suit':
      P(c, 4, 1, 8, 7, '#d8a040');
      P(c, 5, 2, 6, 5, '#7ac8ff');
      P(c, 6, 3, 2, 2, '#e8f8ff');
      P(c, 3, 8, 10, 7, '#3a6a8a');
      P(c, 5, 9, 2, 5, '#4a8aaa');
      return;
    case 'trident':
      P(c, 7, 4, 2, 11, '#c8a040');
      P(c, 3, 3, 10, 2, '#e8c860');
      for (const x of [3, 7, 11]) (P(c, x, 0, 2, 4, '#e8c860'), P(c, x, 0, 2, 1, '#fff4c0'));
      return;
    case 'trident_side':
      P(c, 1, 7, 10, 2, '#c8a040');
      P(c, 11, 3, 2, 10, '#e8c860');
      for (const y of [3, 7, 11]) P(c, 12, y, 4, 2, '#e8c860');
      return;
    case 'trident_up':
    case 'trident_down': {
      const up = kind === 'trident_up';
      P(c, 7, up ? 5 : 1, 2, 10, '#c8a040');
      P(c, 3, up ? 4 : 11, 10, 2, '#e8c860');
      for (const x of [3, 7, 11]) P(c, x, up ? 0 : 12, 2, 4, '#e8c860');
      return;
    }
    case 'shell':
    case 'shell_hit': {
      const on = kind === 'shell_hit';
      P(c, 2, 13, 12, 2, 'rgba(0,0,0,.25)');
      P(c, 3, 4, 10, 9, on ? '#ffe066' : '#f4c8d8');
      P(c, 5, 2, 6, 3, on ? '#ffe066' : '#f4c8d8');
      for (let x = 4; x < 13; x += 2) P(c, x, 4, 1, 8, on ? '#e8a020' : '#d898b0');
      P(c, 6, 12, 4, 3, on ? '#c88010' : '#b87890');
      if (on) (P(c, 1, 1, 2, 2, '#ffffff'), P(c, 13, 2, 2, 2, '#ffffff'));
      return;
    }
    case 'pearl':
      P(c, 5, 5, 6, 6, '#e8e8f4');
      P(c, 4, 6, 8, 4, '#e8e8f4');
      P(c, 6, 6, 2, 2, '#ffffff');
      P(c, 9, 9, 2, 1, '#b8b8d0');
      return;
    case 'bubble':
      P(c, 4, 3, 8, 10, 'rgba(200,240,255,.6)');
      P(c, 3, 5, 10, 6, 'rgba(200,240,255,.6)');
      P(c, 5, 4, 2, 2, '#ffffff');
      P(c, 11, 11, 3, 3, 'rgba(200,240,255,.7)');
      return;
    case 'coral_gate':
      P(c, 0, 0, 16, 16, '#2a4058');
      for (const x of [1, 6, 11]) (P(c, x, 0, 4, 16, '#ff6a8a'), P(c, x + 1, 0, 1, 16, '#ffb0c0'));
      P(c, 0, 7, 16, 2, '#c84a6a');
      return;
    case 'ink':
      P(c, 4, 4, 8, 8, '#1a1428');
      P(c, 3, 6, 10, 4, '#1a1428');
      P(c, 5 + step, 5, 2, 2, '#4a3a6a');
      return;
    case 'crab':
      P(c, 2, 14, 12, 2, 'rgba(0,0,0,.25)');
      P(c, 4, 7, 8, 6, '#e8502a');
      P(c, 5, 6, 6, 1, '#ff7a4a');
      P(c, 5, 4, 1, 3, '#e8502a');
      P(c, 10, 4, 1, 3, '#e8502a');
      P(c, 5, 3, 1, 1, '#141414');
      P(c, 10, 3, 1, 1, '#141414');
      P(c, 0, 5 - step, 3, 3, '#e8502a');
      P(c, 13, 5 + step, 3, 3, '#e8502a');
      [3, 5, 10, 12].forEach((x, i) => P(c, x, 13, 1, (i + step) % 2 ? 2 : 1, '#a83a1a'));
      return;
    case 'jelly':
      P(c, 3, 2 + step, 10, 7, 'rgba(255,140,220,.85)');
      P(c, 4, 1 + step, 8, 1, 'rgba(255,140,220,.85)');
      P(c, 5, 3 + step, 3, 2, 'rgba(255,230,250,.9)');
      for (let x = 4; x < 13; x += 2) P(c, x, 9 + step, 1, 5 - step + (x % 4 ? 1 : 0), 'rgba(255,170,230,.75)');
      return;
    case 'eel':
      for (let x = 1; x < 14; x++) P(c, x, 7 + Math.round(Math.sin(x / 2 + step * 2) * 2), 2, 3, '#3a8a5a');
      P(c, 12, 5, 4, 5, '#4aa86a');
      P(c, 14, 6, 1, 1, '#ffe066');
      P(c, 13, 9, 3, 1, '#1a3a2a');
      return;
    case 'lantern':
      P(c, 3, 6, 10, 7, '#3a3a6a');
      P(c, 3, 9, 10, 1, '#2a2a4a');
      P(c, 11, 7, 2, 2, '#ffffff');
      P(c, 12, 8, 1, 1, '#141414');
      P(c, 0, 7 + step, 3, 5, '#2a2a5a');
      P(c, 8, 1, 1, 5, '#2a2a4a');
      P(c, 7, 0, 3, 2, step ? '#fff8a0' : '#ffe066');
      P(c, 10, 11, 3, 1, '#ffffff');
      return;
    case 'tentacle':
      for (let y = 2; y < 16; y++) P(c, 5 + Math.round(Math.sin(y / 3 + step * 1.5) * 2), y, 6 - Math.floor((16 - y) / 6), 1, '#8a3a8a');
      for (let y = 5; y < 15; y += 3) P(c, 6 + Math.round(Math.sin(y / 3 + step * 1.5) * 2), y, 2, 1, '#e8a0e8');
      P(c, 6, 1 + step, 3, 2, '#8a3a8a');
  }
}

// ------------------------------------------------------------------ habitants
export const MAREES_PEOPLE = {
  barnabe: { skin: '#e8b88a', hair: '#8a8a8a', eye: '#222', body: '#2a3a6a', bodyDark: '#1a2a4a', legs: '#2a2a3a', hat: 'cap', hatColor: '#1a1a2a', hatDark: '#e8c040' },
};
const MAREES_LOOKS = { barnabe: { beard: '#d8d8d8', brows: '#c8c8c8' } };

/** Coralie la sirène (assise) : 16 x 16. */
export function paintMermaid(c, dir, step) {
  P(c, 3, 15, 10, 1, 'rgba(0,0,0,.3)');
  // queue
  P(c, 4, 10, 8, 4, '#3ac8a8');
  P(c, 10, 12 - step, 5, 3, '#3ac8a8');
  P(c, 13, 10 - step, 3, 2, '#7ae8c8');
  for (let x = 5; x < 11; x += 2) P(c, x, 11, 1, 1, '#7ae8c8');
  // buste et visage
  P(c, 5, 6, 6, 4, '#f2c49b');
  P(c, 5, 7, 6, 2, '#ff6a8a'); // coquillages
  P(c, 5, 1, 6, 5, '#f2c49b');
  if (dir !== 'up') (P(c, 6, 3, 1, 1, '#2a6a8a'), P(c, 9, 3, 1, 1, '#2a6a8a'), P(c, 7, 5, 2, 1, '#e86a6a'));
  // longs cheveux roux
  P(c, 4, 0, 8, 2, '#e8642a');
  P(c, 3, 1, 2, 9, '#e8642a');
  P(c, 11, 1, 2, 9, '#e8642a');
  if (dir === 'up') P(c, 4, 1, 8, 8, '#e8642a');
  P(c, 13, 1 + step, 1, 1, '#ffd35a'); // étoile de mer
}

/**
 * Le héros en scaphandre, sous l'eau : casque de cuivre à hublot, combinaison, bouteille dans le dos,
 * palmes jaunes. Remplace l'image du héros quand la carte est sous l'eau (planche 'chars' : diver_*).
 */
export function paintDiver(c, dir, step) {
  const SUIT = '#2a6a7a';
  const SUIT_D = '#1a4a5a';
  const BRASS = '#d8a040';
  const BRASS_L = '#f4cc70';
  const BRASS_D = '#9a6a20';
  P(c, 3, 15, 10, 1, 'rgba(0,0,0,.3)');
  const side = dir === 'side';
  // palmes
  if (side) (P(c, 7, 14, 5 + step, 2, '#ffd23a'), P(c, 4, 14 - step, 4, 2, '#e8b020'));
  else (P(c, 3, 13 + step, 4, 3 - step, '#ffd23a'), P(c, 9, 14 - step, 4, 2 + step, '#ffd23a'));
  // combinaison
  P(c, 4, 8, 8, 6, SUIT);
  P(c, 4, 13, 8, 1, SUIT_D);
  P(c, 4, 11, 8, 1, '#5a3a1c'); // ceinture lestée
  P(c, 7, 11, 2, 1, '#c8c8d0');
  // bouteille d'oxygène dans le dos
  if (dir === 'up') (P(c, 5, 7, 6, 6, '#c8ccd8'), P(c, 5, 7, 2, 6, '#e8ecf4'), P(c, 7, 6, 2, 1, '#8a8a9a'));
  if (side) (P(c, 2, 7, 3, 6, '#c8ccd8'), P(c, 2, 7, 1, 6, '#e8ecf4'));
  // bras (gants)
  if (!side) (P(c, 2, 8 + step, 2, 4, SUIT), P(c, 12, 9 - step, 2, 4, SUIT), P(c, 2, 12 + step, 2, 1, '#e8b020'), P(c, 12, 13 - step, 2, 1, '#e8b020'));
  else (P(c, 8, 9 - step, 4, 2, SUIT), P(c, 12, 9 - step, 1, 2, '#e8b020'));
  // casque de cuivre
  P(c, 4, 2, 8, 7, BRASS);
  P(c, 5, 1, 6, 1, BRASS);
  P(c, 5, 2, 2, 2, BRASS_L);
  P(c, 4, 8, 8, 1, BRASS_D); // collerette
  if (dir === 'down') {
    P(c, 5, 3, 6, 5, BRASS_D); // hublot : cadre
    P(c, 6, 4, 4, 3, '#a8e0f4');
    P(c, 6, 5, 4, 2, '#f2c49b'); // le visage derrière la vitre
    P(c, 7, 5, 1, 1, '#222');
    P(c, 9, 5, 1, 1, '#222');
    P(c, 6, 4, 1, 1, '#ffffff');
  } else if (side) {
    P(c, 9, 3, 3, 5, BRASS_D);
    P(c, 10, 4, 2, 3, '#a8e0f4');
    P(c, 10, 5, 2, 2, '#f2c49b');
    P(c, 11, 5, 1, 1, '#222');
    P(c, 4, 4, 1, 3, BRASS_D); // tuyau
  } else P(c, 7, 3, 2, 4, BRASS_D);
}

export const MAREES_CHARS = ['barnabe', 'mermaid', 'diver'];
export const paintMareesPerson = (c, who, dir, step) => (who === 'mermaid' ? paintMermaid(c, dir, step) : who === 'diver' ? paintDiver(c, dir, step) : humanoid(c, dir, step, MAREES_PEOPLE[who]));
export const paintMareesPersonHD = (c, who, dir, step) => (who === 'mermaid' || who === 'diver' ? false : (characterHD(c, dir, step, MAREES_PEOPLE[who], MAREES_LOOKS[who]), true));

// ------------------------------------------------------------------ le Kraken (32 x 32)
export function paintKraken(c, name) {
  if (name === 'kraken_shield') {
    // bulles protectrices
    for (const [x, y, r] of [[5, 10, 3], [27, 12, 3], [16, 3, 2], [9, 24, 2], [24, 24, 2]]) (P(c, x - r, y - r + 1, r * 2, r * 2 - 2, 'rgba(200,240,255,.55)'), P(c, x - r + 1, y - r, r * 2 - 2, r * 2, 'rgba(200,240,255,.55)'));
    return;
  }
  const s = name === 'kraken_1' ? 1 : 0;
  P(c, 3, 29, 26, 3, 'rgba(0,0,0,.35)');
  // tentacules
  for (const [x, dir] of [[3, -1], [9, -1], [20, 1], [26, 1]]) for (let y = 18; y < 30; y++) P(c, x + Math.round(Math.sin(y / 2.5 + s * 2) * 2) + (y - 18) * dir * 0.3, y, 3, 1, '#7a2a7a');
  // tête
  P(c, 6, 4 - s, 20, 16, '#9a3a9a');
  P(c, 8, 2 - s, 16, 3, '#9a3a9a');
  P(c, 9, 4 - s, 6, 3, '#c86ac8');
  for (const [x, y] of [[10, 12], [22, 9], [14, 16], [19, 14]]) P(c, x, y - s, 2, 2, '#e8a0e8');
  // grands yeux
  P(c, 9, 9 - s, 5, 5, '#ffe066');
  P(c, 18, 9 - s, 5, 5, '#ffe066');
  P(c, 11, 10 - s, 2, 3, '#141414');
  P(c, 20, 10 - s, 2, 3, '#141414');
  P(c, 8, 8 - s, 6, 1, '#5a1a5a');
  P(c, 18, 8 - s, 6, 1, '#5a1a5a');
  // bec et la Pierre des Marées
  P(c, 14, 16 - s, 4, 3, '#2a1a1a');
  P(c, 15, 1 - s, 2, 2, '#2f7bff');
}
