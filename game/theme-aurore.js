// BOURG-LANTERNE — tuiles de la ville, des maisons et des égouts, objets, monstres,
// habitants et boss du niveau 4. Dessins 16 x 16 (mobile) ; les tuiles de la ville et les
// habitants humains ont aussi une version haute définition (PC, 32 x 32).
import { P, speckle, humanoid } from '../demos/01-moteur/themes.js';
import { P as H, R, disc, ellipse, tint } from '../demos/02-gameplay/hd.js';
import { characterHD } from '../demos/02-gameplay/hd-people.js';

const ROOFS = { red: '#c8402a', blue: '#3a6ac8', green: '#3a9a4a', brown: '#9a6a3a' };

// ------------------------------------------------------------------ dessins HD (32 x 32)
function cobbleHD(c, { rng }) {
  H(c, 0, 0, 32, 32, '#6e6a62');
  for (let row = 0; row < 4; row++) {
    const off = row % 2 ? 4 : 0;
    for (let col = -1; col < 4; col++) {
      const x = off + col * 8;
      const y = row * 8;
      const b = tint('#a8a294', rng.pick([0, 0.06, -0.06]));
      R(c, x + 1, y + 1, 7, 7, b);
      H(c, x + 2, y + 1, 5, 1, tint(b, 0.25));
      H(c, x + 2, y + 7, 5, 1, tint(b, -0.2));
    }
  }
}

function plazaHD(c, { variant }) {
  H(c, 0, 0, 32, 32, '#b8a888');
  for (const [x, y] of [[0, 0], [16, 0], [0, 16], [16, 16]]) {
    R(c, x + 1, y + 1, 15, 15, (x + y) % 32 === 0 ? '#e0d4b4' : '#d4c4a0');
    H(c, x + 2, y + 1, 13, 1, '#f0e8d0');
  }
  if (variant) disc(c, 16, 16, 3, '#c8a860');
}

function roofHD(c, { rng }, col) {
  H(c, 0, 0, 32, 32, tint(col, -0.35));
  for (let row = 0; row < 4; row++) {
    const off = row % 2 ? 4 : 0;
    for (let x = -off; x < 32; x += 8) {
      const b = tint(col, rng.pick([0, 0.05, -0.05]));
      R(c, x + 1, row * 8, 7, 7, b);
      H(c, x + 2, row * 8, 5, 1, tint(col, 0.3));
      H(c, x + 1, row * 8 + 6, 7, 1, tint(col, -0.25));
    }
  }
}

function houseWallHD(c, { variant }) {
  H(c, 0, 0, 32, 32, '#f0e4c8');
  H(c, 0, 0, 32, 3, '#6a4220');
  H(c, 0, 29, 32, 3, '#8a8478');
  H(c, 0, 3, 3, 26, '#6a4220');
  if (variant) {
    // fenêtre avec volets et pot de fleurs
    R(c, 9, 8, 14, 14, '#5a3a1c');
    H(c, 11, 10, 10, 10, '#8ac8f0');
    H(c, 11, 10, 4, 4, '#c8ecff');
    H(c, 15, 10, 2, 10, '#5a3a1c');
    H(c, 11, 14, 10, 2, '#5a3a1c');
    H(c, 5, 8, 4, 14, '#3a8a5a');
    H(c, 23, 8, 4, 14, '#3a8a5a');
    H(c, 9, 22, 14, 3, '#a85a2a');
    for (const x of [11, 15, 19]) disc(c, x, 21, 1, x === 15 ? '#ffe066' : '#ff6a8a');
  } else {
    for (const [x, y] of [[8, 10], [20, 18], [12, 22]]) H(c, x, y, 3, 1, '#d8ccb0');
    H(c, 3, 15, 29, 2, '#6a4220');
  }
}

function doorHD(c, col) {
  houseWallHD(c, { variant: 0 });
  R(c, 6, 5, 20, 27, '#4a2e16');
  R(c, 8, 7, 16, 25, col);
  for (const x of [12, 17, 21]) H(c, x, 8, 1, 24, tint(col, -0.25));
  H(c, 9, 8, 14, 1, tint(col, 0.3));
  disc(c, 20, 20, 1, '#ffd35a');
  H(c, 4, 30, 24, 2, '#8a8478');
}

function towerHD(c, { rng, variant }) {
  H(c, 0, 0, 32, 32, '#5a564e');
  for (let row = 0; row < 4; row++) {
    const off = row % 2 ? 8 : 0;
    for (let x = -off; x < 32; x += 16) {
      const b = tint('#9a958a', rng.pick([0, 0.07, -0.07]));
      R(c, x + 1, row * 8 + 1, 15, 7, b);
      H(c, x + 2, row * 8 + 1, 13, 1, tint(b, 0.25));
    }
  }
  if (variant) {
    // horloge du beffroi
    disc(c, 16, 16, 10, '#3a362e');
    disc(c, 16, 16, 9, '#f4e8c8');
    for (let k = 0; k < 12; k++) H(c, 16 + Math.round(Math.cos((k * Math.PI) / 6) * 7), 16 + Math.round(Math.sin((k * Math.PI) / 6) * 7), 1, 1, '#3a2410');
    H(c, 16, 9, 1, 8, '#2a1a0c');
    H(c, 16, 16, 5, 1, '#2a1a0c');
  }
}

function lampHD(c, { rng }) {
  cobbleHD(c, { rng });
  ellipse(c, 16, 29, 7, 2, 'rgba(0,0,0,.3)');
  H(c, 14, 10, 4, 19, '#2a2a30');
  H(c, 12, 27, 8, 3, '#2a2a30');
  R(c, 10, 2, 12, 10, '#2a2a30');
  R(c, 12, 4, 8, 7, '#ffd870');
  H(c, 13, 5, 3, 3, '#fff8d0');
  H(c, 9, 1, 14, 2, '#3a3a44');
  disc(c, 16, 7, 9, 'rgba(255,220,120,.12)');
}

// ------------------------------------------------------------------ tuiles
const cobble = (c, rng) => {
  P(c, 0, 0, 16, 16, '#6e6a62');
  for (let row = 0; row < 4; row++) {
    const off = row % 2 ? 2 : 0;
    for (let x = -off; x < 16; x += 4) P(c, x + 1, row * 4 + 1, 3, 3, rng.pick(['#a8a294', '#9a958a', '#b4ae9e']));
  }
};
const roofTile = (col) => ({
  solid: true,
  props: { shadow: true },
  paint: (c) => {
    P(c, 0, 0, 16, 16, tint(col, -0.35));
    for (let row = 0; row < 4; row++) for (let x = row % 2 ? -2 : 0; x < 16; x += 4) (P(c, x, row * 4, 3, 3, col), P(c, x, row * 4, 3, 1, tint(col, 0.3)));
  },
  paintHD: (c, o) => roofHD(c, o, col),
});
const doorTile = (col) => ({
  paint: (c) => {
    P(c, 0, 0, 16, 16, '#f0e4c8');
    P(c, 0, 0, 16, 1, '#6a4220');
    P(c, 3, 2, 10, 14, '#4a2e16');
    P(c, 4, 3, 8, 13, col);
    P(c, 10, 9, 1, 1, '#ffd35a');
  },
  paintHD: (c) => doorHD(c, col),
});
const floorIn = (c) => {
  P(c, 0, 0, 16, 16, '#b07a40');
  for (let y = 0; y < 16; y += 4) (P(c, 0, y + 3, 16, 1, '#8a5a2a'), P(c, (y * 3) % 16, y, 1, 3, '#8a5a2a'));
};

export const AURORE_TILES = {
  cobble: { variants: 3, paint: (c, { rng }) => cobble(c, rng), paintHD: cobbleHD },
  plaza: {
    variants: 2,
    paint: (c, { variant }) => {
      P(c, 0, 0, 16, 16, '#b8a888');
      P(c, 1, 1, 7, 7, '#e0d4b4');
      P(c, 9, 9, 6, 6, '#e0d4b4');
      P(c, 9, 1, 6, 7, '#d4c4a0');
      P(c, 1, 9, 7, 6, '#d4c4a0');
      if (variant) P(c, 7, 7, 2, 2, '#c8a860');
    },
    paintHD: plazaHD,
  },
  roof_red: roofTile(ROOFS.red),
  roof_blue: roofTile(ROOFS.blue),
  roof_green: roofTile(ROOFS.green),
  roof_brown: roofTile(ROOFS.brown),
  house_wall: {
    solid: true,
    variants: 2,
    props: { shadow: true },
    paint: (c, { variant }) => {
      P(c, 0, 0, 16, 16, '#f0e4c8');
      P(c, 0, 0, 16, 1, '#6a4220');
      P(c, 0, 0, 1, 16, '#6a4220');
      P(c, 0, 15, 16, 1, '#8a8478');
      if (variant) (P(c, 4, 4, 8, 7, '#5a3a1c'), P(c, 5, 5, 6, 5, '#8ac8f0'), P(c, 7, 5, 1, 5, '#5a3a1c'), P(c, 4, 11, 8, 2, '#a85a2a'), P(c, 5, 10, 1, 1, '#ff6a8a'), P(c, 9, 10, 1, 1, '#ffe066'));
      else P(c, 1, 8, 15, 1, '#6a4220');
    },
    paintHD: houseWallHD,
  },
  house_door: doorTile('#8a5a2a'),
  door_red: doorTile(ROOFS.red),
  door_blue: doorTile(ROOFS.blue),
  tower_wall: {
    solid: true,
    props: { shadow: true },
    paint: (c) => {
      P(c, 0, 0, 16, 16, '#5a564e');
      for (let row = 0; row < 4; row++) for (let x = row % 2 ? -4 : 0; x < 16; x += 8) P(c, x + 1, row * 4 + 1, 7, 3, '#9a958a');
    },
    paintHD: (c, o) => towerHD(c, { ...o, variant: 0 }),
  },
  tower_clock: {
    solid: true,
    props: { shadow: true },
    paint: (c) => {
      P(c, 0, 0, 16, 16, '#5a564e');
      P(c, 3, 3, 10, 10, '#f4e8c8');
      P(c, 8, 4, 1, 4, '#2a1a0c');
      P(c, 8, 8, 3, 1, '#2a1a0c');
    },
    paintHD: (c, o) => towerHD(c, { ...o, variant: 1 }),
  },
  lamp: {
    solid: true,
    paint: (c, { rng }) => {
      cobble(c, rng);
      P(c, 7, 5, 2, 10, '#2a2a30');
      P(c, 5, 1, 6, 5, '#2a2a30');
      P(c, 6, 2, 4, 3, '#ffd870');
    },
    paintHD: lampHD,
  },
  stall: {
    solid: true,
    props: { shadow: true },
    paint: (c) => {
      P(c, 0, 0, 16, 16, '#b8a888');
      for (let x = 0; x < 16; x += 4) P(c, x, 0, 2, 6, '#e83a3a'), P(c, x + 2, 0, 2, 6, '#f4e8c8');
      P(c, 1, 7, 14, 6, '#8a5a2a');
      P(c, 1, 7, 14, 1, '#b07a40');
      for (const [x, col] of [[3, '#ffa020'], [7, '#e83a3a'], [11, '#5ac83a']]) P(c, x, 5, 3, 3, col);
      P(c, 2, 13, 2, 3, '#5a3a1c');
      P(c, 12, 13, 2, 3, '#5a3a1c');
    },
  },
  fountain: {
    solid: true,
    frames: 2,
    fps: 3,
    paint: (c, { frame }) => {
      P(c, 0, 0, 16, 16, '#b8a888');
      P(c, 1, 4, 14, 11, '#8a8478');
      P(c, 2, 5, 12, 9, '#3a7ad8');
      P(c, 7, 2, 2, 8, '#a8a294');
      P(c, 6, 1 + frame, 4, 2, '#c8ecff');
      P(c, 3 + frame * 2, 9, 3, 1, '#c8ecff');
      P(c, 10 - frame * 2, 12, 3, 1, '#c8ecff');
    },
  },
  crate: {
    solid: true,
    props: { shadow: true, low: true }, // le boomerang passe par-dessus
    paint: (c) => {
      P(c, 0, 0, 16, 16, '#6e6a62');
      P(c, 1, 2, 14, 13, '#5a3a1c');
      P(c, 2, 3, 12, 11, '#b07a40');
      P(c, 2, 8, 12, 1, '#8a5a2a');
      for (let i = 0; i < 10; i++) P(c, 3 + i, 4 + Math.floor(i * 0.9), 1, 1, '#8a5a2a');
    },
  },
  flowerbed: {
    solid: true,
    props: { low: true },
    paint: (c, { rng }) => {
      P(c, 0, 0, 16, 16, '#7a5230');
      P(c, 1, 1, 14, 14, '#4c9a3c');
      speckle(c, rng, 10, ['#ff6a8a', '#ffe066', '#ffffff', '#b06aff'], 2);
    },
  },
  // Intérieurs des maisons
  house_floor: { variants: 2, paint: (c) => floorIn(c) },
  house_inwall: {
    solid: true,
    props: { shadow: true },
    paint: (c) => {
      P(c, 0, 0, 16, 16, '#e8d8b0');
      P(c, 0, 10, 16, 6, '#8a5a2a');
      P(c, 0, 10, 16, 1, '#b07a40');
      for (let x = 2; x < 16; x += 5) P(c, x, 2, 1, 6, '#d8c8a0');
    },
  },
  bookshelf: {
    solid: true,
    props: { shadow: true },
    paint: (c) => {
      P(c, 0, 0, 16, 16, '#5a3a1c');
      for (const y of [1, 6, 11]) {
        P(c, 1, y, 14, 4, '#2a1a0c');
        ['#c83a3a', '#3a6ac8', '#e8c040', '#3a9a4a', '#8a3ac8', '#e87a2a'].forEach((col, k) => P(c, 1 + k * 2 + (y % 2), y + (k % 2), 2, 4 - (k % 2), col));
      }
    },
  },
  table: {
    solid: true,
    props: { shadow: true },
    paint: (c) => {
      floorIn(c);
      P(c, 1, 4, 14, 8, '#8a5a2a');
      P(c, 1, 4, 14, 2, '#c8965a');
      P(c, 2, 12, 2, 4, '#5a3a1c');
      P(c, 12, 12, 2, 4, '#5a3a1c');
      P(c, 6, 3, 4, 2, '#f4f0e0');
    },
  },
  bed: {
    solid: true,
    props: { shadow: true },
    paint: (c) => {
      floorIn(c);
      P(c, 2, 0, 12, 16, '#5a3a1c');
      P(c, 3, 1, 10, 4, '#f4f0e0');
      P(c, 3, 5, 10, 10, '#c83a5a');
      P(c, 3, 5, 10, 1, '#e85a7a');
    },
  },
  pot: {
    solid: true,
    props: { cuttable: true, cutTo: 'house_floor' }, // un coup d'épée le casse
    paint: (c) => {
      floorIn(c);
      P(c, 4, 13, 8, 2, 'rgba(0,0,0,.3)');
      P(c, 4, 5, 8, 9, '#a85a2a');
      P(c, 3, 7, 10, 5, '#a85a2a');
      P(c, 5, 3, 6, 2, '#8a4a20');
      P(c, 5, 6, 2, 4, '#d88a50');
      P(c, 4, 10, 8, 1, '#8a4a20');
    },
  },
  fireplace: {
    solid: true,
    frames: 2,
    fps: 4,
    props: { shadow: true },
    paint: (c, { frame }) => {
      P(c, 0, 0, 16, 16, '#8a8478');
      P(c, 0, 0, 16, 3, '#6a645a');
      P(c, 3, 6, 10, 10, '#2a1a0c');
      P(c, 4, 10 - frame, 8, 6 + frame, '#ff6a1a');
      P(c, 6, 11, 4, 5, '#ffd870');
    },
  },
  stairs_down: {
    paint: (c) => {
      P(c, 0, 0, 16, 16, '#3a362e');
      for (let k = 0; k < 4; k++) P(c, 0, k * 4, 16, 3, tint('#9a958a', -k * 0.18));
    },
  },
  // Égouts
  sewer_floor: {
    variants: 2,
    paint: (c, { rng }) => {
      P(c, 0, 0, 16, 16, '#5a6458');
      P(c, 0, 7, 16, 1, '#4a5248');
      P(c, 7, 0, 1, 7, '#4a5248');
      P(c, 3, 8, 1, 8, '#4a5248');
      speckle(c, rng, 5, ['#6a7468', '#4a5a3a']);
    },
  },
  sewer_wall: {
    solid: true,
    props: { shadow: true },
    paint: (c) => {
      P(c, 0, 0, 16, 16, '#2e322c');
      for (let row = 0; row < 4; row++) for (let x = row % 2 ? -4 : 0; x < 16; x += 8) P(c, x + 1, row * 4 + 1, 7, 3, '#4a5048');
      P(c, 5, 12, 3, 4, '#3a6a3a'); // mousse
    },
  },
  sewer_water: {
    solid: true,
    frames: 2,
    fps: 2,
    props: { low: true },
    paint: (c, { frame }) => {
      P(c, 0, 0, 16, 16, '#3a5a3a');
      P(c, (2 + frame * 5) % 16, 4, 5, 1, '#6a8a5a');
      P(c, (10 + frame * 5) % 16, 11, 4, 1, '#6a8a5a');
    },
  },
};

// ------------------------------------------------------------------ objets et monstres (16 x 16)
export const AURORE_OBJECT_FRAMES = [
  'boomerang_0', 'boomerang_1', 'key_red', 'key_blue', 'letter', 'bread', 'book', 'knife_0', 'knife_1',
  'rat_0', 'rat_1', 'bat_0', 'bat_1', 'thief_0', 'thief_1',
];

const bigKey = (c, col, dark) => {
  P(c, 2, 4, 6, 6, col);
  P(c, 4, 6, 2, 2, 'rgba(0,0,0,.6)');
  P(c, 8, 6, 6, 2, col);
  P(c, 11, 8, 1, 2, col);
  P(c, 13, 8, 1, 3, col);
  P(c, 2, 9, 6, 1, dark);
  P(c, 3, 4, 2, 1, '#ffffff');
};

export function paintAuroreObject(c, name) {
  const [kind, f] = name.split(/_(?=[01]$)/);
  const step = f === '1' ? 1 : 0;
  switch (kind) {
    case 'boomerang':
      if (step) (P(c, 7, 2, 3, 9, '#c88a2a'), P(c, 7, 9, 7, 3, '#c88a2a'), P(c, 8, 3, 1, 7, '#f4c060'), P(c, 8, 10, 5, 1, '#f4c060'));
      else (P(c, 2, 5, 9, 3, '#c88a2a'), P(c, 8, 5, 3, 8, '#c88a2a'), P(c, 3, 6, 7, 1, '#f4c060'), P(c, 9, 6, 1, 6, '#f4c060'));
      P(c, step ? 8 : 9, step ? 10 : 6, 2, 2, '#e83a3a');
      return;
    case 'key_red':
      return bigKey(c, '#e83a3a', '#a82020');
    case 'key_blue':
      return bigKey(c, '#3a7ae8', '#1a4aa8');
    case 'letter':
      P(c, 2, 4, 12, 9, '#f4f0e0');
      P(c, 2, 12, 12, 1, '#c8c0a8');
      for (let i = 0; i < 6; i++) (P(c, 2 + i, 4 + i, 1, 1, '#c8c0a8'), P(c, 13 - i, 4 + i, 1, 1, '#c8c0a8'));
      P(c, 7, 8, 2, 2, '#e83a3a');
      return;
    case 'bread':
      P(c, 2, 6, 12, 6, '#c88a3a');
      P(c, 3, 5, 10, 1, '#d89a4a');
      P(c, 2, 11, 12, 1, '#8a5a2a');
      for (const x of [4, 7, 10]) P(c, x, 6, 2, 3, '#f4d8a0');
      return;
    case 'book':
      P(c, 6, 10, 4, 6, '#5a3a1c'); // pupitre
      P(c, 2, 6, 12, 5, '#5a3a1c');
      P(c, 2, 4, 6, 6, '#f4f0e0');
      P(c, 8, 4, 6, 6, '#e8e0c8');
      P(c, 3, 5, 4, 1, '#8a8478');
      P(c, 3, 7, 3, 1, '#8a8478');
      P(c, 9, 5, 4, 1, '#8a8478');
      P(c, 9, 7, 3, 1, '#8a8478');
      return;
    case 'knife':
      P(c, 4, 7, 6, 2, '#d8dce8');
      P(c, 4, 7, 6, 1, '#ffffff');
      P(c, 10, 6, 1, 4, '#5a3a1c');
      P(c, 11, 7, 3, 2, '#2a1a2a');
      if (step) P(c, 2, 8, 2, 1, 'rgba(255,255,255,.5)');
      return;
    case 'rat':
      P(c, 3, 14, 10, 2, 'rgba(0,0,0,.25)');
      P(c, 3, 8 + step, 9, 5, '#7a7470');
      P(c, 10, 7 + step, 4, 4, '#8a8480');
      P(c, 10, 6 + step, 2, 2, '#e8a0a0');
      P(c, 13, 9 + step, 1, 1, '#141414');
      P(c, 14, 10 + step, 1, 1, '#e8a0a0');
      P(c, 0, 11 - step, 3, 1, '#e8a0a0');
      P(c, 1, 10, 1, 1, '#e8a0a0');
      [4, 7, 10].forEach((x, i) => P(c, x, 13, 1, (i + step) % 2 ? 2 : 1, '#5a5450'));
      return;
    case 'bat':
      P(c, 5, 15, 6, 1, 'rgba(0,0,0,.2)');
      P(c, 6, 5, 4, 5, '#3a2a4a');
      P(c, 6, 4, 1, 1, '#3a2a4a');
      P(c, 9, 4, 1, 1, '#3a2a4a');
      P(c, 7, 6, 1, 1, '#ff4a4a');
      P(c, 8, 6, 1, 1, '#ff4a4a');
      if (step) (P(c, 1, 3, 5, 3, '#5a3a6a'), P(c, 10, 3, 5, 3, '#5a3a6a'), P(c, 1, 6, 1, 1, '#5a3a6a'), P(c, 14, 6, 1, 1, '#5a3a6a'));
      else (P(c, 1, 6, 5, 3, '#5a3a6a'), P(c, 10, 6, 5, 3, '#5a3a6a'), P(c, 2, 9, 1, 1, '#5a3a6a'), P(c, 13, 9, 1, 1, '#5a3a6a'));
      return;
    case 'thief':
      P(c, 4, 15, 8, 1, 'rgba(0,0,0,.3)');
      P(c, 4, 7 + step, 8, 7 - step, '#3a3a4a');
      P(c, 5, 2 + step, 6, 6, '#e8b88a');
      P(c, 4, 1 + step, 8, 3, '#2a2a3a');
      P(c, 5, 4 + step, 6, 2, '#141414'); // masque
      P(c, 6, 4 + step, 1, 1, '#ffffff');
      P(c, 9, 4 + step, 1, 1, '#ffffff');
      P(c, 11, 9, 3, 4, '#c8a050'); // sac
      P(c, 11, 8, 2, 1, '#8a6a30');
      P(c, 5, 14, 2, 2, '#2a2a3a');
      P(c, 9, 14 - step, 2, 2, '#2a2a3a');
  }
}

// ------------------------------------------------------------------ habitants
export const AURORE_PEOPLE = {
  mayor: { skin: '#f2c49b', hair: '#8a5a2a', eye: '#222', body: '#7a3a8a', bodyDark: '#5a2a6a', legs: '#3a2a4a' },
  baker: { skin: '#f2c49b', hair: '#f0f0f0', eye: '#222', body: '#f4f0e0', bodyDark: '#c8c0a8', legs: '#5a4a3a', hat: 'cap', hatColor: '#ffffff', hatDark: '#d8d8d8' },
  postman: { skin: '#d9a07a', hair: '#3a2a1a', eye: '#111', body: '#3a5ac8', bodyDark: '#2a3a8a', legs: '#2a2a3a', hat: 'cap', hatColor: '#e8c040', hatDark: '#a88a20' },
  pelagie: { skin: '#f2c49b', hair: '#d8d8e8', eye: '#222', body: '#c86a9a', bodyDark: '#8a4a6a', legs: '#4a3a4a' },
  innkeeper: { skin: '#e8b88a', hair: '#5a2a1a', eye: '#111', body: '#5a8a3a', bodyDark: '#3a6a2a', legs: '#3a2a1a' },
  fernand: { skin: '#e8b88a', hair: '#d8d8d8', eye: '#222', body: '#8a6a3a', bodyDark: '#5a4a2a', legs: '#4a3a2a', hat: 'cap', hatColor: '#3a6a3a', hatDark: '#2a4a2a' },
};
const AURORE_LOOKS = {
  mayor: { longHair: true, scarf: '#ffd35a' },
  baker: { apron: '#ffffff', mustache: '#d8d8d8' },
  postman: { toolbelt: true },
  pelagie: { longHair: true, glasses: '#8a6a3a' },
  innkeeper: { apron: '#f4e8c8', beard: '#5a2a1a' },
  fernand: { beard: '#e0e0e0', brows: '#d8d8d8' },
};

/** Minou, le chat de Mme Pélagie : 16 x 16. */
export function paintCat(c, dir, step) {
  P(c, 3, 15, 10, 1, 'rgba(0,0,0,.3)');
  P(c, 3, 9, 9, 5, '#e8902a'); // corps
  P(c, 12 - step, 5, 2, 8, '#e8902a'); // queue
  P(c, 3, 4, 7, 6, '#f0a03a'); // tête
  P(c, 3, 2, 2, 2, '#f0a03a');
  P(c, 8, 2, 2, 2, '#f0a03a');
  P(c, 4, 10, 6, 3, '#ffffff');
  if (dir !== 'up') (P(c, 4, 6, 2, 2, '#3a8a3a'), P(c, 7, 6, 2, 2, '#3a8a3a'), P(c, 6, 8, 1, 1, '#e86a8a'));
  P(c, 4, 13 + step, 2, 2, '#e8902a');
  P(c, 9, 14 - step, 2, 1, '#e8902a');
  P(c, 3, 5, 7, 1, 'rgba(0,0,0,.1)');
}

export const AURORE_CHARS = [...Object.keys(AURORE_PEOPLE), 'cat'];
export const paintAurorePerson = (c, who, dir, step) => (who === 'cat' ? paintCat(c, dir, step) : humanoid(c, dir, step, AURORE_PEOPLE[who]));
export const paintAurorePersonHD = (c, who, dir, step) => (who === 'cat' ? false : (characterHD(c, dir, step, AURORE_PEOPLE[who], AURORE_LOOKS[who]), true));

// ------------------------------------------------------------------ le Chef des Masques (32 x 32)
export function paintMasque(c, name) {
  if (name === 'masque_shield') {
    // nuage de fumée autour de lui
    for (const [x, y, s] of [[4, 20, 5], [26, 18, 5], [8, 6, 4], [24, 6, 4], [16, 26, 5]]) (P(c, x - s, y - s + 2, s * 2, s * 2 - 4, 'rgba(160,150,190,.55)'), P(c, x - s + 2, y - s, s * 2 - 4, s * 2, 'rgba(160,150,190,.55)'));
    return;
  }
  const s = name === 'masque_1' ? 1 : 0;
  P(c, 6, 29, 20, 3, 'rgba(0,0,0,.35)');
  // grande cape
  P(c, 6, 12 + s, 20, 17 - s, '#2a2238');
  P(c, 4, 18, 24, 11, '#2a2238');
  P(c, 8, 13 + s, 3, 15, '#3a3050');
  P(c, 15, 14, 2, 14, '#1a1428');
  // capuche
  P(c, 8, 2 + s, 16, 12, '#2a2238');
  P(c, 10, 1 + s, 12, 2, '#3a3050');
  // masque blanc souriant
  P(c, 10, 5 + s, 12, 9, '#f4f0e0');
  P(c, 11, 4 + s, 10, 1, '#f4f0e0');
  P(c, 12, 8 + s, 3, 2, '#141414');
  P(c, 17, 8 + s, 3, 2, '#141414');
  P(c, 13, 8 + s, 1, 1, '#ff4a4a');
  P(c, 18, 8 + s, 1, 1, '#ff4a4a');
  P(c, 13, 11 + s, 6, 1, '#141414');
  P(c, 12, 10 + s, 1, 1, '#141414');
  P(c, 19, 10 + s, 1, 1, '#141414');
  P(c, 21, 5 + s, 1, 6, '#c8a050');
  // mains et couteaux
  P(c, 2, 18 - s, 4, 4, '#e8b88a');
  P(c, 26, 18 + s, 4, 4, '#e8b88a');
  P(c, 0, 16 - s, 2, 6, '#d8dce8');
  P(c, 30, 16 + s, 2, 6, '#d8dce8');
  // la Pierre d'Aurore volée, à la ceinture
  P(c, 14, 20, 4, 4, '#ffd23f');
  P(c, 15, 20, 1, 1, '#fff4b8');
}
