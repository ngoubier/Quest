// L'ambiance du jeu (Médiéval). Tout est dessiné par programme (aucune image).
// Le moteur sépare la logique (rôles de tuiles) de l'apparence (thème) : d'autres
// ambiances pourraient être ajoutées sans toucher aux cartes.

// Rôles de tuiles que la démo utilise : chaque thème doit tous les fournir.
export const TILE_ROLES = ['floor', 'floor_alt', 'path', 'wall', 'obstacle', 'water', 'door', 'floor_in'];

import { detailCount } from '../../engine/index.js';

export const P = (ctx, x, y, w, h, c) => {
  ctx.fillStyle = c;
  ctx.fillRect(x, y, w, h);
};
export const speckle = (ctx, rng, n, colors, size = 1) => {
  // Sur mobile (profil simplifié), deux fois moins de mouchetures : l'image est plus calme.
  for (let i = 0; i < detailCount(n); i++) P(ctx, rng.int(0, 15), rng.int(0, 15), size, size, rng.pick(colors));
};
export const bricks = (ctx, base, mortar, hi) => {
  P(ctx, 0, 0, 16, 16, mortar);
  for (let row = 0; row < 4; row++) {
    const off = row % 2 ? -4 : 0;
    for (let col = 0; col < 3; col++) {
      const x = off + col * 8;
      P(ctx, x + 1, row * 4 + 1, 7, 3, base);
      P(ctx, x + 1, row * 4 + 1, 7, 1, hi);
    }
  }
};

// Personnage générique 16x16 : directions down/up/side (gauche = side retourné), 2 pas.
export function humanoid(ctx, dir, step, c) {
  P(ctx, 4, 15, 8, 1, 'rgba(0,0,0,.3)');
  // jambes
  if (dir === 'side') {
    P(ctx, 5 + (step ? 1 : 0), 12, 2, 3, c.legs);
    P(ctx, 9 - (step ? 1 : 0), 12, 2, 3, c.legsDark || c.legs);
  } else {
    P(ctx, 5, 12, 2, step ? 3 : 2, c.legs);
    P(ctx, 9, 12, 2, step ? 2 : 3, c.legs);
  }
  // corps
  P(ctx, 4, 7, 8, 5, c.body);
  P(ctx, 4, 11, 8, 1, c.bodyDark);
  if (dir === 'side') P(ctx, 7, 8 + (step ? 1 : 0), 2, 3, c.bodyDark);
  else {
    P(ctx, 3, 8 + (step ? 1 : 0), 1, 3, c.skin);
    P(ctx, 12, 8 + (step ? 0 : 1), 1, 3, c.skin);
  }
  // tête
  P(ctx, 5, 1, 6, 6, c.skin);
  if (dir === 'down') {
    P(ctx, 5, 1, 6, 2, c.hair);
    P(ctx, 5, 3, 1, 2, c.hair);
    P(ctx, 10, 3, 1, 2, c.hair);
    P(ctx, 6, 4, 1, 1, c.eye);
    P(ctx, 9, 4, 1, 1, c.eye);
  } else if (dir === 'up') {
    P(ctx, 5, 1, 6, 5, c.hair);
  } else {
    P(ctx, 5, 1, 6, 2, c.hair);
    P(ctx, 5, 3, 3, 3, c.hair);
    P(ctx, 9, 4, 1, 1, c.eye);
    P(ctx, 11, 4, 1, 1, c.skin);
  }
  // couvre-chef
  if (c.hat === 'hood') {
    P(ctx, 4, 0, 8, 2, c.hatColor);
    if (dir === 'side') P(ctx, 2, 1, 3, 2, c.hatColor);
    else if (dir === 'up') P(ctx, 6, 0, 4, 4, c.hatColor);
    else P(ctx, 11, 1, 2, 2, c.hatColor);
  } else if (c.hat === 'helmet') {
    P(ctx, 4, 0, 8, 7, c.hatColor);
    P(ctx, 4, 0, 8, 1, c.hatLight);
    if (dir === 'down') P(ctx, 5, 2, 6, 3, c.visor);
    if (dir === 'side') P(ctx, 8, 2, 4, 3, c.visor);
  } else if (c.hat === 'cap') {
    P(ctx, 5, 0, 6, 2, c.hatColor);
    if (dir === 'down') P(ctx, 5, 2, 6, 1, c.hatDark);
    if (dir === 'side') P(ctx, 10, 2, 3, 1, c.hatDark);
  }
}

const CHAR_FRAMES = [];
for (const who of ['player', 'npc']) for (const d of ['down', 'up', 'side']) for (const s of [0, 1]) CHAR_FRAMES.push(`${who}_${d}_${s}`);
CHAR_FRAMES.push('sign');

function charSheet(colors, paintSign) {
  return {
    frameW: 16,
    frameH: 16,
    frames: CHAR_FRAMES,
    paint(ctx, name) {
      if (name === 'sign') return paintSign(ctx);
      const [who, dir, step] = name.split('_');
      humanoid(ctx, dir, Number(step), colors[who]);
    },
  };
}

// ---------------------------------------------------------------- MÉDIÉVAL
const medieval = {
  id: 'medieval',
  name: 'Médiéval',
  background: '#0d1a0a',
  ui: { box: '#1b1410', border: '#d9b45a', text: '#f4e8c8', accent: '#ffd35a', dim: '#7a6a4a' },
  sfx: { blip: { type: 'square', notes: [[880, 0.03]], vol: 0.08 } },
  tiles: {
    floor: { paint: (c, { rng }) => (P(c, 0, 0, 16, 16, '#4c9a3c'), speckle(c, rng, 14, ['#3d8530', '#5fb04c'])) },
    floor_alt: {
      paint: (c, { rng }) => (P(c, 0, 0, 16, 16, '#4c9a3c'), speckle(c, rng, 8, ['#3d8530']), speckle(c, rng, 4, ['#f25c5c', '#ffe066', '#ffffff'], 2)),
    },
    path: { paint: (c, { rng }) => (P(c, 0, 0, 16, 16, '#c9a266'), speckle(c, rng, 10, ['#b08950', '#dcb97f'])) },
    wall: {
      solid: true,
      paint: (c) => {
        bricks(c, '#8a8478', '#4f4a42', '#a9a294');
      },
    },
    obstacle: {
      solid: true,
      paint: (c) => {
        P(c, 0, 0, 16, 16, '#4c9a3c');
        P(c, 2, 3, 12, 11, '#2b6a26');
        P(c, 1, 5, 14, 7, '#2b6a26');
        P(c, 3, 4, 5, 3, '#3f8a36');
        P(c, 9, 7, 3, 2, '#3f8a36');
        P(c, 3, 13, 10, 2, '#1d4a1a');
      },
    },
    water: {
      solid: true,
      frames: 2,
      fps: 2,
      paint: (c, { frame }) => {
        P(c, 0, 0, 16, 16, '#2f63c9');
        const o = frame * 4;
        P(c, (2 + o) % 16, 4, 5, 1, '#79a6f2');
        P(c, (9 + o) % 16, 10, 5, 1, '#79a6f2');
      },
    },
    door: {
      paint: (c) => {
        bricks(c, '#8a8478', '#4f4a42', '#a9a294');
        P(c, 3, 2, 10, 14, '#2a1a0e');
        P(c, 4, 3, 8, 13, '#6b4423');
        P(c, 7, 3, 1, 13, '#4e3018');
        P(c, 9, 9, 1, 1, '#ffd35a');
      },
    },
    floor_in: {
      paint: (c) => {
        P(c, 0, 0, 16, 16, '#9a6a3c');
        for (let y = 0; y < 16; y += 4) P(c, 0, y, 16, 1, '#7a5030');
        P(c, 6, 0, 1, 4, '#7a5030');
        P(c, 12, 4, 1, 4, '#7a5030');
        P(c, 3, 8, 1, 4, '#7a5030');
        P(c, 10, 12, 1, 4, '#7a5030');
      },
    },
  },
  sprites: {
    chars: charSheet(
      {
        player: { skin: '#f2c49b', hair: '#7a4a1a', eye: '#222', body: '#3fa34d', bodyDark: '#2a7a36', legs: '#6b4423', hat: 'hood', hatColor: '#3fa34d' },
        npc: { skin: '#e8b88a', hair: '#ddd', eye: '#222', body: '#7a3fa3', bodyDark: '#5a2a7a', legs: '#4a3020' },
      },
      (c) => {
        P(c, 7, 9, 2, 7, '#5a3a1c');
        P(c, 2, 3, 12, 7, '#8a5a2c');
        P(c, 2, 3, 12, 1, '#b07a40');
        P(c, 4, 5, 8, 1, '#3a2410');
        P(c, 4, 7, 6, 1, '#3a2410');
      },
    ),
  },
};

export const THEMES = [medieval];
