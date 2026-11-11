// Bâtiments et décors construits en HAUTE DÉFINITION (profil PC) : 32×32 par case.
// Magasin (chaume, colombages, porte, vitrine), intérieur (parquet, étagères, comptoir),
// grotte (pierres, rochers, torches), pont, porte de maison.
import { P, R, disc, ellipse, tint, bricksHD, waterHD } from './hd.js';

// ------------------------------------------------------------------ chaume
function thatch(c, rng, y0, y1) {
  P(c, 0, y0, 32, y1 - y0, '#c9a04a');
  // rangées de bottes de paille qui se chevauchent
  for (let y = y0; y < y1; y += 6) {
    const off = ((y - y0) / 6) % 2 ? 4 : 0;
    for (let x = -off; x < 32; x += 8) {
      R(c, x, y, 8, 6, '#b88e3c');
      R(c, x + 1, y, 6, 5, '#d4ac58');
      P(c, x + 1, y + 5, 6, 1, '#8a6a2a');
    }
  }
  for (let i = 0; i < 70; i++) {
    const x = rng.int(0, 31);
    const y = rng.int(y0, y1 - 3);
    P(c, x, y, 1, rng.int(2, 4), rng.pick(['#ecc878', '#a8823a', '#e0bc6a', '#9a7432']));
  }
}

export function roofHD(c, { rng }) {
  thatch(c, rng, 0, 32);
  P(c, 0, 0, 32, 4, '#7a5a22'); // faîtage
  P(c, 0, 0, 32, 1, '#a8823a');
  for (let x = 2; x < 32; x += 6) P(c, x, 1, 2, 2, '#5a4218');
}

export function eaveHD(c, { rng }) {
  P(c, 0, 0, 32, 32, '#ece2c8');
  thatch(c, rng, 0, 18);
  for (let x = 0; x < 32; x += 2) P(c, x, 18, 1, rng.int(1, 4), rng.pick(['#a8823a', '#c9a04a'])); // franges
  P(c, 0, 21, 32, 4, 'rgba(0,0,0,.22)');
  P(c, 0, 26, 32, 6, '#5a3a1c'); // poutre
  P(c, 0, 26, 32, 1, '#8a5a30');
  for (let x = 4; x < 32; x += 10) disc(c, x, 29, 1, '#3a2410');
}

/** Mur à colombages : enduit, poutres, croisillons. */
function timber(c, rng) {
  P(c, 0, 0, 32, 32, '#ece2c8');
  for (let i = 0; i < 30; i++) P(c, rng.int(0, 31), rng.int(0, 31), 2, 1, rng.pick(['#e0d4b8', '#f6eedc']));
  const beam = (x, y, w, h) => (P(c, x, y, w, h, '#5a3a1c'), P(c, x, y, Math.max(1, w > h ? w : 1), Math.max(1, w > h ? 1 : h), '#7a5230'));
  beam(0, 0, 4, 32);
  beam(28, 0, 4, 32);
  beam(0, 28, 32, 4);
}

export function shopfrontHD(c, { rng, variant }) {
  timber(c, rng);
  // fenêtre à petits carreaux
  R(c, 6, 3, 20, 17, '#5a3a1c');
  P(c, 8, 5, 16, 13, '#9ac8e4');
  P(c, 8, 12, 16, 6, '#88b8d8');
  // marchandises derrière la vitre
  for (let x = 9; x < 23; x += 4) {
    const h = rng.int(3, 6);
    const col = rng.pick(['#e8303a', '#ffd35a', '#3a8ad8', '#5ac83a', '#d8a060']);
    R(c, x, 18 - h, 3, h, col);
    P(c, x, 18 - h, 1, 1, '#ffffff');
  }
  P(c, 15, 5, 2, 13, '#5a3a1c');
  P(c, 8, 11, 16, 1, '#5a3a1c');
  P(c, 9, 6, 4, 1, 'rgba(255,255,255,.75)');
  P(c, 9, 7, 2, 2, 'rgba(255,255,255,.5)');
  // jardinière fleurie
  R(c, 5, 21, 22, 5, '#7a5228');
  P(c, 5, 21, 22, 1, '#a87a48');
  for (let x = 7; x < 26; x += 4) {
    P(c, x + 1, 18, 1, 3, '#3a8a2a');
    R(c, x, 16 + (x % 3), 3, 3, variant ? (x % 8 ? '#ffd35a' : '#e8303a') : x % 8 ? '#e8303a' : '#ff8ab0');
  }
}

export function shopEntranceHD(c, { rng }) {
  timber(c, rng);
  R(c, 5, 2, 22, 30, '#3a2410'); // encadrement
  R(c, 7, 4, 18, 28, '#8a5a2c'); // porte en planches
  for (const x of [11, 15, 19]) P(c, x, 4, 1, 28, '#6b4423');
  P(c, 8, 4, 2, 28, '#a8743c');
  for (const y of [8, 24]) (P(c, 7, y, 12, 2, '#3a3a40'), P(c, 7, y, 12, 1, '#7a7a88')); // pentures
  disc(c, 21, 18, 2, '#ffd35a'); // anneau
  disc(c, 21, 18, 1, '#8a5a2c');
  // lanterne allumée
  P(c, 27, 0, 1, 3, '#3a3a40');
  R(c, 25, 3, 5, 6, '#3a3a40');
  P(c, 26, 4, 3, 4, '#ffd060');
  P(c, 27, 5, 1, 2, '#ffffff');
  disc(c, 27, 6, 5, 'rgba(255,200,80,.18)');
}

export function cliffHD(c, { rng, variant }) {
  P(c, 0, 0, 32, 32, '#5f584f');
  const n = 7 + variant * 2;
  for (let i = 0; i < n; i++) {
    const x = rng.int(-4, 26);
    const y = rng.int(-4, 26);
    const w = rng.int(9, 15);
    const h = rng.int(8, 12);
    R(c, x, y + 1, w, h, '#3e3832');
    R(c, x, y, w, h - 1, '#6e665c');
    P(c, x + 2, y, w - 4, 2, '#948a7e');
    P(c, x + 1, y + 2, 2, h - 4, '#857c70');
    P(c, x + w - 3, y + 2, 2, h - 3, '#544d45');
  }
  for (let i = 0; i < 6; i++) P(c, rng.int(0, 31), rng.int(0, 31), 2, 1, '#3e3832'); // fissures
  if (variant === 2) {
    const x = rng.int(2, 22);
    R(c, x, 0, 9, 4, '#4c9a3c');
    for (let i = 0; i < 4; i++) P(c, x + 1 + i * 2, 3, 1, 2, '#6bbf4e');
  }
}

export function caveMouthHD(c) {
  P(c, 0, 0, 32, 32, '#6e665c');
  for (const [x, y, w, h] of [[0, 0, 12, 8], [12, 0, 10, 5], [22, 0, 10, 8], [0, 8, 5, 12], [27, 8, 5, 12]]) (R(c, x, y, w, h, '#857c70'), P(c, x + 1, y, w - 2, 1, '#9a9084'));
  // arche sombre, de plus en plus noire vers le fond
  ellipse(c, 16, 14, 12, 10, '#3a342e');
  P(c, 4, 14, 25, 18, '#3a342e');
  ellipse(c, 16, 15, 10, 8, '#1a1612');
  P(c, 6, 15, 21, 17, '#1a1612');
  ellipse(c, 16, 17, 7, 6, '#0a0806');
  P(c, 9, 17, 15, 15, '#0a0806');
  P(c, 6, 29, 21, 3, '#2a2420');
  // pierres de l'arche
  for (const [x, y] of [[4, 11], [7, 6], [13, 4], [20, 5], [25, 9], [27, 15]]) (R(c, x, y, 5, 4, '#544d45'), P(c, x + 1, y, 3, 1, '#7a7268'));
}

/** Porte de maison (essai n°1 et maisons du village) : arche de pierre, porte cloutée. */
export function houseDoorHD(c, { rng }) {
  bricksHD(c, '#8a8478', '#4f4a42', '#a9a294', rng);
  ellipse(c, 16, 8, 11, 6, '#2a1a0e');
  P(c, 5, 8, 22, 24, '#2a1a0e');
  ellipse(c, 16, 9, 9, 5, '#6b4423');
  P(c, 7, 9, 18, 23, '#6b4423');
  for (const x of [11, 16, 21]) P(c, x, 5, 1, 27, '#4e3018');
  P(c, 8, 9, 2, 23, '#8a5a30');
  for (const y of [12, 22]) for (const x of [9, 14, 19, 23]) P(c, x, y, 1, 1, '#c8b070');
  disc(c, 20, 18, 1, '#ffd35a');
}

// ------------------------------------------------------------------ intérieur du magasin
function planksFloor(c, k, variant) {
  P(c, 0, 0, 32, 32, k.floorA);
  for (let y = 0; y < 32; y += 8) {
    P(c, 0, y, 32, 1, k.floorB);
    P(c, 0, y + 1, 32, 1, tint(k.floorA, 0.12));
    const j = ((y / 8) * 11 + variant * 7) % 32;
    P(c, j, y, 1, 8, k.floorB); // joint de lame
    for (let x = 2; x < 32; x += 9) P(c, (x + y + variant * 5) % 32, y + 4, 4, 1, tint(k.floorA, -0.1)); // veines
  }
  disc(c, (5 + variant * 9) % 28 + 2, 19, 1, tint(k.floorB, -0.2)); // nœud du bois
}

function planksWall(c, k) {
  P(c, 0, 0, 32, 32, k.wall);
  for (let x = 0; x < 32; x += 8) (P(c, x, 0, 1, 32, k.wallDark), P(c, x + 1, 0, 1, 32, tint(k.wall, 0.15)));
  P(c, 0, 10, 32, 4, k.wallDark); // lisse
  P(c, 0, 10, 32, 1, tint(k.wallDark, 0.3));
  P(c, 0, 29, 32, 3, 'rgba(0,0,0,.3)');
}

export function shopTilesHD(k) {
  return {
    shop_floor: (c, { variant }) => planksFloor(c, k, variant),
    shop_wall: (c) => planksWall(c, k),
    shelf: (c, { rng }) => {
      planksWall(c, k);
      R(c, 1, 1, 30, 31, k.shelfDark);
      for (const y of [10, 20, 30]) (P(c, 1, y, 30, 2, k.shelf), P(c, 1, y, 30, 1, tint(k.shelf, 0.3)));
      // produits : bouteilles, bocaux, pots
      for (const top of [2, 12, 22]) {
        let x = 3;
        while (x < 28) {
          const kind = rng.int(0, 2);
          const col = rng.pick(k.goods);
          if (kind === 0) {
            R(c, x, top + 3, 4, 5, col); // bouteille
            P(c, x + 1, top + 1, 2, 2, col);
            P(c, x + 1, top, 2, 1, '#8a5a2a');
            P(c, x, top + 4, 1, 2, 'rgba(255,255,255,.7)');
            x += 5;
          } else if (kind === 1) {
            R(c, x, top + 2, 6, 6, '#dceeff'); // bocal
            R(c, x + 1, top + 4, 4, 4, col);
            P(c, x, top + 1, 6, 1, '#8a5a2a');
            x += 7;
          } else {
            R(c, x, top + 4, 5, 4, col); // pot
            P(c, x + 1, top + 4, 3, 1, tint(col, 0.4));
            x += 6;
          }
        }
      }
    },
    counter: (c, { variant }) => {
      planksFloor(c, k, 0);
      R(c, 0, 6, 32, 26, k.counterDark);
      P(c, 0, 7, 32, 25, k.counter);
      for (let x = 2; x < 32; x += 10) (P(c, x, 15, 1, 15, k.counterDark), P(c, x + 1, 15, 1, 15, tint(k.counter, 0.15)));
      P(c, 0, 6, 32, 6, k.counterTop);
      P(c, 0, 6, 32, 1, tint(k.counterTop, 0.35));
      P(c, 0, 12, 32, 2, k.counterDark);
      if (variant === 1) {
        R(c, 8, 0, 16, 8, '#3a3a40'); // caisse
        P(c, 10, 1, 12, 3, '#7ad87a');
        P(c, 11, 2, 5, 1, '#c8ffc8');
        for (let x = 10; x < 22; x += 3) P(c, x, 5, 2, 2, '#9a9aa8');
      }
    },
    shop_door: (c) => {
      planksWall(c, k);
      R(c, 6, 2, 20, 30, '#2a1a0e');
      R(c, 8, 4, 16, 28, k.door);
      R(c, 10, 6, 12, 10, '#cfe8ff');
      P(c, 15, 6, 2, 10, k.door);
      P(c, 11, 7, 3, 2, '#ffffff');
      disc(c, 21, 21, 1, '#ffd35a');
    },
  };
}

// ------------------------------------------------------------------ grotte
function stoneFloorHD(c, rng, k, variant) {
  P(c, 0, 0, 32, 32, k.floor);
  for (let i = 0; i < 9 + variant * 2; i++) {
    const x = rng.int(-3, 29);
    const y = rng.int(-3, 29);
    const w = rng.int(5, 9);
    const h = rng.int(4, 7);
    R(c, x, y, w, h, rng.pick([k.floorDark, k.floorLight, k.floor]));
    P(c, x + 1, y, w - 2, 1, k.floorLight);
    P(c, x + 1, y + h - 1, w - 2, 1, k.floorDark);
  }
  for (let i = 0; i < 14; i++) P(c, rng.int(0, 31), rng.int(0, 31), 1, 1, rng.pick([k.floorDark, k.floorLight]));
}

function stoneWallHD(c, rng, k) {
  P(c, 0, 0, 32, 32, k.mortar);
  for (let row = 0; row < 4; row++) {
    let x = row % 2 ? -6 : 0;
    while (x < 32) {
      const w = rng.int(9, 14);
      const col = rng.pick([k.stone, k.stoneAlt]);
      R(c, x + 1, row * 8 + 1, w - 1, 7, col);
      P(c, x + 2, row * 8 + 1, w - 3, 1, k.light);
      P(c, x + 2, row * 8 + 7, w - 3, 1, k.dark);
      if (rng() < 0.4) P(c, x + rng.int(3, w - 3), row * 8 + rng.int(3, 5), 2, 1, k.dark);
      x += w;
    }
  }
}

export function caveTilesHD(k) {
  return {
    cave_floor: (c, { rng, variant }) => stoneFloorHD(c, rng, k, variant % 3),
    cave_wall: (c, { rng }) => stoneWallHD(c, rng, k),
    cave_rock: (c, { rng, variant }) => {
      stoneFloorHD(c, rng, k, 0);
      ellipse(c, 16, 28, 12, 2, 'rgba(0,0,0,.35)');
      ellipse(c, 16, 18 + variant, 12, 10 - variant, k.dark);
      ellipse(c, 15, 17 + variant, 11, 9 - variant, k.stone);
      ellipse(c, 12, 13 + variant, 6, 4, k.light);
      P(c, 9, 11 + variant, 4, 1, tint(k.light, 0.25));
      P(c, 18, 19, 7, 1, k.dark);
      P(c, 20, 20, 1, 4, k.dark);
    },
    cave_torch: (c, { rng, frame }) => {
      stoneWallHD(c, rng, k);
      disc(c, 16, 9, 10, 'rgba(255,190,80,.16)');
      R(c, 14, 15, 4, 13, '#5a3a1c');
      P(c, 14, 15, 1, 13, '#7a5230');
      R(c, 11, 15, 10, 3, '#3a3a40');
      const f = frame ? 1 : 0;
      ellipse(c, 16, 10 + f, 5, 6 - f, '#e8601a');
      ellipse(c, 16, 9 + f * 2, 3, 5 - f, '#ffb030');
      ellipse(c, 16 - f, 11, 1, 2, '#fff6c0');
      P(c, 13 + f * 5, 2 + f, 1, 2, '#ffb030'); // étincelle
    },
    cave_exit: (c, { rng }) => {
      stoneWallHD(c, rng, k);
      ellipse(c, 16, 10, 11, 8, k.dark);
      P(c, 5, 10, 23, 22, k.dark);
      ellipse(c, 16, 11, 9, 7, '#0a0806');
      P(c, 7, 11, 19, 21, '#0a0806');
      P(c, 7, 27, 19, 5, k.floor);
      P(c, 9, 26, 15, 1, 'rgba(255,255,255,.12)');
    },
  };
}

// ------------------------------------------------------------------ pont
export function bridgeTilesHD(k) {
  const water = (c, frame) => waterHD(c, { frame, variant: 0 }, { base: k.water, deep: k.waterDark, light: tint(k.wave, 0.3) });
  const posts = (c) => {
    for (const x of [2, 26]) (R(c, x, 0, 4, 32, k.post), P(c, x, 0, 1, 32, tint(k.post, 0.3)));
  };
  const plank = (c, y, x = 6, w = 20) => {
    R(c, x, y, w, 5, k.deck);
    P(c, x + 1, y, w - 2, 1, k.deckLight);
    P(c, x, y + 4, w, 1, k.deckDark);
    P(c, x + 2, y + 2, 1, 1, k.post);
    P(c, x + w - 3, y + 2, 1, 1, k.post);
  };
  return {
    bridge_broken: (c, { frame }) => {
      water(c, frame);
      posts(c);
      plank(c, 0);
      plank(c, 27);
      // planche pendante et planche qui flotte
      for (let i = 0; i < 6; i++) P(c, 9 + i, 5 + i, 3, 2, k.deck);
      P(c, 18, 5, 4, 6, k.deckDark);
      R(c, 11, 18 + frame, 10, 4, k.deck);
      P(c, 12, 18 + frame, 8, 1, k.deckLight);
      P(c, 9, 22 + frame, 14, 1, 'rgba(255,255,255,.35)'); // remous
    },
    bridge: (c) => {
      water(c, 0);
      for (let y = 0; y < 32; y += 5) plank(c, y, 4, 24);
      for (const x of [1, 27]) (P(c, x, 0, 4, 32, k.rail), P(c, x, 0, 1, 32, tint(k.rail, 0.3)));
      for (const y of [3, 15, 27]) for (const x of [0, 27]) R(c, x, y, 5, 4, k.post);
    },
  };
}
