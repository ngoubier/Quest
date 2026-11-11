// Personnages, monstres et compagnon en HAUTE DÉFINITION (profil PC).
// Case de 32×32 pixels d'image pour 16×16 pixels de jeu (boss : 64×64 pour 32×32).
// Les silhouettes restent dans la même case que le pixel art d'origine : la logique
// (collisions, tailles) ne change pas.
import { P, R, disc, ellipse, tint } from './hd.js';

// ------------------------------------------------------------------ signes distinctifs
// Chaque habitant a un détail qui le rend reconnaissable au premier coup d'œil.
export const LOOKS = {
  player: { hero: true },
  elder: { beard: '#f0f0f0', brows: '#e0e0e0' },
  merchant: { apron: '#f4e8c8', mustache: '#a8401a' },
  guard: { armor: true, brows: '#222222' },
  gardener: { apron: '#9a6a3a', brows: '#c8a030' },
  seller: { apron: '#f4e8c8', longHair: true },
  teacher: { longHair: true, glasses: '#3a2a1a' },
  leon: { freckles: true },
  carpenter: { toolbelt: true, brows: '#3a2410' },
  fisher: { beard: '#dddddd' },
  scholar: { glasses: '#c8a030', beard: '#9a9a9a' },
  writer: { scarf: '#e8c040', quill: true },
};

const shadowAt = (c, cx, y, rx) => {
  ellipse(c, cx, y, rx, 1, 'rgba(0,0,0,.25)');
  P(c, cx - rx + 3, y, (rx - 3) * 2 + 1, 1, 'rgba(0,0,0,.15)');
};

/**
 * Personnage 32×32 vu de face (down), de dos (up) ou de profil (side, tourné vers la droite).
 * @param {object} col  couleurs (skin, hair, eye, body, bodyDark, legs, hat, hatColor...)
 * @param {object} [look]  signes distinctifs (voir LOOKS)
 */
export function characterHD(c, dir, step, col, look = {}) {
  const skin = col.skin;
  const skinDark = tint(skin, -0.16);
  const skinLight = tint(skin, 0.25);
  const body = col.body;
  const bodyDark = col.bodyDark;
  const bodyLight = tint(body, 0.22);
  const hair = col.hair;
  const hairDark = tint(hair, -0.3);
  const hairLight = tint(hair, 0.35);
  const legs = col.legs;
  const boot = look.hero ? '#5a3418' : tint(legs, -0.45);
  const side = dir === 'side';
  const down = dir === 'down';
  const up = dir === 'up';
  const bob = step ? 1 : 0; // le corps monte d'un pixel à chaque pas

  shadowAt(c, 16, 30, 8);

  // --- cheveux longs (derrière le corps)
  if (look.longHair) {
    if (down) (P(c, 8, 6, 3, 11, hair), P(c, 21, 6, 3, 11, hair), P(c, 8, 15, 3, 2, hairDark), P(c, 21, 15, 3, 2, hairDark));
    if (up) (R(c, 8, 4, 16, 14, hair), P(c, 12, 8, 1, 9, hairDark), P(c, 19, 8, 1, 9, hairDark));
    if (side) (R(c, 8, 5, 6, 12, hair), P(c, 9, 14, 4, 2, hairDark));
  }
  // --- cape du héros (derrière)
  if (look.hero && (up || side)) {
    const cape = '#8a2a22'; // cape rouge sombre : le héros se distingue aussi de dos
    if (up) {
      R(c, 8, 13 - bob, 16, 13, cape);
      for (const x of [12, 16, 20]) P(c, x, 16 - bob, 1, 9, tint(cape, -0.25));
      P(c, 9, 13 - bob, 14, 1, tint(cape, 0.2));
    } else {
      R(c, 6, 14 - bob, 6, 12, cape);
      P(c, 7, 17 - bob, 1, 8, tint(cape, -0.25));
    }
  }

  // --- jambes et chaussures
  if (side) {
    const a = step ? 2 : 0;
    P(c, 12 + a, 24, 4, 4, tint(legs, -0.12));
    P(c, 17 - a, 24, 4, 4, legs);
    R(c, 12 + a, 27, 6, 3, boot);
    R(c, 17 - a, 27, 6, 3, boot);
    P(c, 13 + a, 27, 3, 1, tint(boot, 0.25));
    P(c, 18 - a, 27, 3, 1, tint(boot, 0.25));
  } else {
    const l = step ? 4 : 3;
    const r = step ? 3 : 4;
    P(c, 11, 24, 4, l, legs);
    P(c, 17, 24, 4, r, legs);
    P(c, 14, 24, 1, l, tint(legs, -0.2));
    P(c, 20, 24, 1, r, tint(legs, -0.2));
    R(c, 10, 24 + l - 1, 6, 3 + (4 - l), boot);
    R(c, 16, 24 + r - 1, 6, 3 + (4 - r), boot);
    P(c, 11, 24 + l - 1, 3, 1, tint(boot, 0.25));
    P(c, 17, 24 + r - 1, 3, 1, tint(boot, 0.25));
  }

  // --- corps
  const by = 14 - bob;
  R(c, 9, by, 14, 11 + bob, body);
  P(c, 10, by + 1, 2, 8, bodyLight);
  P(c, 20, by + 1, 2, 9 + bob, bodyDark);
  P(c, 9, by + 9 + bob, 14, 2, bodyDark); // ourlet
  if (look.armor) {
    const m = '#a8a8b8';
    R(c, 10, by + 1, 12, 7, m);
    P(c, 11, by + 2, 4, 2, '#e0e0ea');
    P(c, 15, by + 1, 2, 7, '#7a7a8a');
    R(c, 7, by, 5, 3, m); // épaulières
    R(c, 20, by, 5, 3, m);
    P(c, 8, by, 2, 1, '#e0e0ea');
    P(c, 21, by, 2, 1, '#e0e0ea');
  }
  if (look.apron && !up) {
    const a = look.apron;
    if (down) {
      R(c, 11, by + 3, 10, 8 + bob, a);
      P(c, 12, by, 1, 3, a);
      P(c, 19, by, 1, 3, a);
      P(c, 13, by + 6, 6, 2, tint(a, -0.15)); // poche
      P(c, 11, by + 10 + bob, 10, 1, tint(a, -0.2));
    } else R(c, 18, by + 3, 4, 8, a);
  }
  // ceinture
  if (!look.armor) {
    P(c, 9, by + 7, 14, 2, look.hero ? '#5a3418' : tint(bodyDark, -0.3));
    if (down) (P(c, 15, by + 7, 2, 2, '#e8c860'), P(c, 15, by + 7, 1, 1, '#fff4b0'));
  }
  if (look.hero && down) (R(c, 18, by + 8, 4, 4, '#8a5a2c'), P(c, 19, by + 9, 2, 1, '#c8904a')); // bourse
  if (look.toolbelt && !up) {
    P(c, 9, by + 7, 14, 2, '#3a2410');
    P(c, down ? 19 : 18, by + 6, 2, 6, '#8a5a2c'); // manche du marteau
    P(c, down ? 18 : 17, by + 5, 4, 2, '#9a9aa8');
  }
  if (look.scarf && !up) (R(c, 10, by - 1, 12, 3, look.scarf), down && P(c, 18, by + 1, 3, 5, look.scarf));

  // --- bras
  if (side) {
    const a = step ? 2 : -1;
    R(c, 14 + a, by + 2, 5, 7, bodyDark);
    P(c, 15 + a, by + 2, 3, 1, body);
    R(c, 14 + a, by + 8, 4, 3, skin);
  } else {
    const a = step ? 1 : 0;
    const b = step ? 0 : 1;
    R(c, 6, by + 1 + a, 4, 7, body);
    P(c, 6, by + 1 + a, 1, 6, bodyLight);
    R(c, 6, by + 7 + a, 4, 3, skin);
    R(c, 22, by + 1 + b, 4, 7, bodyDark);
    R(c, 22, by + 7 + b, 4, 3, skinDark);
  }
  if (look.quill && down) (P(c, 24, by + 3, 1, 6, '#f4f4f4'), P(c, 25, by + 2, 1, 4, '#d8d8d8'));

  // --- tête
  const hy = 1 - bob;
  R(c, 9, hy, 14, 13, skin);
  P(c, 20, hy + 2, 2, 10, skinDark);
  P(c, 10, hy + 11, 12, 2, skinDark); // menton
  if (down) {
    // yeux : blanc, pupille, reflet
    for (const x of [11, 18]) {
      R(c, x, hy + 6, 4, 4, '#ffffff');
      P(c, x + 1, hy + 6, 2, 4, col.eye);
      P(c, x + 1, hy + 6, 1, 1, '#ffffff');
    }
    if (look.brows) (P(c, 11, hy + 4, 4, 1, look.brows), P(c, 18, hy + 4, 4, 1, look.brows));
    P(c, 15, hy + 9, 2, 1, skinDark); // nez
    P(c, 14, hy + 11, 4, 1, tint(skin, -0.4)); // bouche
    P(c, 15, hy + 12, 2, 1, tint(skin, -0.25));
    P(c, 10, hy + 10, 2, 1, 'rgba(255,100,100,.45)'); // joues
    P(c, 21, hy + 10, 2, 1, 'rgba(255,100,100,.45)');
    if (look.freckles) for (const x of [11, 13, 19, 21]) P(c, x, hy + 10, 1, 1, tint(skin, -0.3));
  } else if (side) {
    R(c, 18, hy + 6, 4, 4, '#ffffff');
    P(c, 20, hy + 6, 2, 4, col.eye);
    P(c, 20, hy + 6, 1, 1, '#ffffff');
    if (look.brows) P(c, 18, hy + 4, 4, 1, look.brows);
    P(c, 23, hy + 8, 1, 3, skin); // nez
    P(c, 23, hy + 8, 1, 1, skinLight);
    P(c, 20, hy + 11, 3, 1, tint(skin, -0.4));
    R(c, 13, hy + 6, 3, 4, skinDark); // oreille
  }

  // --- cheveux
  if (down) {
    R(c, 9, hy, 14, 5, hair);
    P(c, 9, hy + 4, 2, 6, hair);
    P(c, 21, hy + 4, 2, 6, hair);
    for (const x of [11, 14, 17, 20]) P(c, x, hy + 5, 2, 1, hair); // mèches
    P(c, 12, hy + 1, 6, 1, hairLight);
    P(c, 15, hy + 3, 1, 2, hairDark);
  } else if (up) {
    R(c, 9, hy, 14, 12, hair);
    P(c, 11, hy + 1, 7, 1, hairLight);
    for (const x of [12, 15, 18]) P(c, x, hy + 4, 1, 7, hairDark);
  } else {
    R(c, 9, hy, 14, 5, hair);
    R(c, 9, hy + 3, 6, 9, hair);
    P(c, 11, hy + 1, 7, 1, hairLight);
    P(c, 10, hy + 6, 1, 5, hairDark);
    P(c, 17, hy + 4, 3, 2, hair);
  }

  // --- barbe, moustache, lunettes
  if (look.beard && !up) {
    const bd = look.beard;
    if (down) (R(c, 10, hy + 9, 12, 7, bd), P(c, 14, hy + 11, 4, 1, tint(skin, -0.4)), P(c, 12, hy + 14, 8, 2, tint(bd, -0.12)));
    else (R(c, 16, hy + 9, 7, 6, bd), P(c, 17, hy + 13, 4, 2, tint(bd, -0.12)));
  }
  if (look.mustache && !up) (down ? P(c, 12, hy + 10, 8, 2, look.mustache) : P(c, 19, hy + 10, 5, 2, look.mustache));
  if (look.glasses && !up) {
    const g = look.glasses;
    const frame = (x) => (P(c, x, hy + 5, 5, 1, g), P(c, x, hy + 10, 5, 1, g), P(c, x, hy + 5, 1, 6, g), P(c, x + 4, hy + 5, 1, 6, g));
    if (down) (frame(10), frame(17), P(c, 15, hy + 7, 2, 1, g));
    else (frame(17), P(c, 14, hy + 7, 3, 1, g));
  }

  // --- couvre-chef
  const hc = col.hatColor;
  if (col.hat === 'hood') {
    const hd = tint(hc, -0.28);
    const hl = tint(hc, 0.22);
    if (up) {
      R(c, 8, hy - 1, 16, 14, hc);
      P(c, 15, hy, 2, 12, hd);
      P(c, 10, hy, 4, 1, hl);
      if (look.hero) (P(c, 14, hy + 12, 4, 3, hc), P(c, 15, hy + 14, 2, 2, hd)); // pointe dans le dos
    } else {
      R(c, 8, hy - 1, 16, 6, hc);
      P(c, 10, hy - 1, 8, 1, hl);
      P(c, 8, hy + 4, 16, 1, hd);
      if (down) (P(c, 8, hy + 3, 2, 9, hc), P(c, 22, hy + 3, 2, 9, hc), P(c, 8, hy + 3, 1, 9, hd));
      else (R(c, 8, hy + 2, 6, 11, hc), P(c, 13, hy + 4, 1, 8, hd));
      if (look.hero) {
        // longue pointe de capuche qui retombe en arrière
        if (side) (R(c, 3, hy + 1, 7, 4, hc), R(c, 1, hy + 4, 4, 4, hc), P(c, 1, hy + 7, 2, 2, hd), P(c, 4, hy + 1, 4, 1, hl));
        else (R(c, 22, hy + 1, 5, 4, hc), R(c, 25, hy + 4, 3, 4, hd));
      }
    }
  } else if (col.hat === 'helmet') {
    const hd = tint(hc, -0.25);
    R(c, 8, hy - 1, 16, up ? 14 : 8, hc);
    P(c, 10, hy, 8, 2, col.hatLight);
    P(c, 21, hy + 1, 2, up ? 11 : 6, hd);
    P(c, 8, hy + 6, 16, 2, hd); // bandeau
    for (const x of [10, 15, 20]) P(c, x, hy + 6, 1, 1, col.hatLight); // rivets
    if (down) (P(c, 15, hy + 6, 2, 5, hd), P(c, 8, hy + 6, 2, 7, hc), P(c, 22, hy + 6, 2, 7, hc));
    if (side) (P(c, 8, hy + 6, 7, 7, hc), P(c, 22, hy + 6, 2, 4, hd));
    P(c, 14, hy - 1, 4, 2, '#c83a3a'); // crête
    P(c, 14, hy - 1, 2, 1, '#ff7a7a');
  } else if (col.hat === 'cap') {
    R(c, 9, hy - 1, 14, 5, hc);
    P(c, 11, hy, 5, 1, tint(hc, 0.3));
    if (down) R(c, 9, hy + 3, 14, 2, col.hatDark);
    if (side) R(c, 19, hy + 3, 7, 2, col.hatDark);
  }

  // --- épée du héros, dans le dos (vue de dos)
  if (look.hero && up) {
    P(c, 21, hy + 9, 2, 9, '#c8d0e0');
    P(c, 21, hy + 9, 1, 9, '#ffffff');
    P(c, 19, hy + 17, 6, 2, '#8a5a2a');
    P(c, 21, hy + 19, 2, 3, '#5a3418');
  }
}

// ------------------------------------------------------------------ monstres
/** Gluant : gelée brillante, gros yeux, gouttes. Image 1 = écrasé (il rebondit). */
export function blobHD(c, squash, p) {
  const sq = squash ? 2 : 0;
  ellipse(c, 16, 29, 11 + sq, 2, 'rgba(0,0,0,.28)');
  const body = p.blob;
  const dark = p.blobDark;
  // dôme : contour sombre, puis corps, puis reflet
  ellipse(c, 16, 21 + sq, 12 + sq, 9 - sq, dark);
  P(c, 4 - sq, 21 + sq, 25 + sq * 2, 8 - sq, dark);
  ellipse(c, 16, 20 + sq, 11 + sq, 8 - sq, body);
  P(c, 5 - sq, 20 + sq, 23 + sq * 2, 7 - sq, body);
  P(c, 5 - sq, 26, 23 + sq * 2, 1, tint(body, -0.15));
  ellipse(c, 16, 16 + sq, 7, 3, tint(body, 0.18));
  R(c, 8, 14 + sq, 5, 3, 'rgba(255,255,255,.7)'); // reflet
  P(c, 14, 14 + sq, 2, 1, 'rgba(255,255,255,.5)');
  // yeux
  for (const x of [10, 18]) {
    R(c, x, 19 + sq, 5, 5, '#ffffff');
    P(c, x + 2, 20 + sq, 2, 3, '#141414');
    P(c, x + 2, 20 + sq, 1, 1, '#ffffff');
  }
  P(c, 14, 25, 4, 1, tint(dark, -0.3)); // bouche
  // gouttes
  P(c, 7 - sq, 28, 2, 2, dark);
  P(c, 23 + sq, 28, 2, 1, dark);
}

/** Chauve-souris violette : oreilles, ailes membraneuses (haut / bas). */
export function flyerHD(c, wingsUp, p) {
  ellipse(c, 16, 29, 7, 1, 'rgba(0,0,0,.2)');
  const w = p.flyerWing;
  const wd = tint(w, -0.3);
  const wing = (dirX) => {
    const x0 = dirX < 0 ? 11 : 21;
    const pts = wingsUp ? [[0, 0], [3, -5], [7, -7], [10, -4], [10, 2]] : [[0, 0], [3, 4], [7, 7], [10, 6], [10, 0]];
    // membrane remplie par bandes
    for (let i = 0; i < 10; i++) {
      const t = i / 9;
      const top = wingsUp ? -7 * Math.sin(t * Math.PI * 0.9) : 0;
      const bot = wingsUp ? 2 : 7 * Math.sin(t * Math.PI * 0.9);
      const x = x0 + dirX * i;
      P(c, x, 14 + Math.round(Math.min(top, bot)), 1, Math.round(Math.abs(bot - top)) + 2, w);
    }
    for (const [dx, dy] of pts) P(c, x0 + dirX * dx, 14 + dy, 1, 1, wd);
    for (const dx of [3, 6]) P(c, x0 + dirX * dx, 14 + (wingsUp ? -4 : 0), 1, 5, wd); // doigts
  };
  wing(-1);
  wing(1);
  disc(c, 16, 15, 6, p.flyer);
  P(c, 11, 10, 3, 4, p.flyer); // oreilles
  P(c, 18, 10, 3, 4, p.flyer);
  P(c, 12, 11, 1, 2, '#ff9ac8');
  P(c, 19, 11, 1, 2, '#ff9ac8');
  disc(c, 14, 13, 1, tint(p.flyer, 0.3));
  R(c, 12, 14, 3, 3, p.eye);
  R(c, 17, 14, 3, 3, p.eye);
  P(c, 13, 15, 1, 1, '#141414');
  P(c, 18, 15, 1, 1, '#141414');
  P(c, 14, 19, 1, 2, '#ffffff'); // crocs
  P(c, 17, 19, 1, 2, '#ffffff');
}

/** Roi Gluant, 64×64 : grosse gelée, couronne à joyaux ; bouclier = bulle irisée. */
export function bossHD(c, name, b) {
  if (name === 'boss_shield') {
    for (let r = 29; r >= 26; r--) {
      for (let a = 0; a < 360; a += 1.2) {
        const ang = (a * Math.PI) / 180;
        const x = Math.round(32 + Math.cos(ang) * r);
        const y = Math.round(34 + Math.sin(ang) * (r - 2));
        P(c, x, y, 1, 1, r === 29 ? 'rgba(154,216,255,.95)' : `rgba(154,216,255,${0.12 * (r - 25)})`);
      }
    }
    R(c, 15, 12, 8, 3, 'rgba(255,255,255,.85)');
    R(c, 12, 16, 3, 7, 'rgba(255,255,255,.7)');
    return;
  }
  const sq = name === 'boss_1' ? 3 : 0;
  ellipse(c, 32, 59, 24 + sq, 3, 'rgba(0,0,0,.3)');
  ellipse(c, 32, 40 + sq, 26 + sq, 18 - sq, b.dark);
  P(c, 6 - sq, 40 + sq, 53 + sq * 2, 17 - sq, b.dark);
  ellipse(c, 32, 39 + sq, 24 + sq, 16 - sq, b.body);
  P(c, 8 - sq, 39 + sq, 49 + sq * 2, 15 - sq, b.body);
  ellipse(c, 32, 30 + sq, 15, 6, b.light);
  R(c, 14, 28 + sq, 10, 5, 'rgba(255,255,255,.7)');
  R(c, 26, 28 + sq, 3, 2, 'rgba(255,255,255,.5)');
  // yeux sévères
  for (const x of [20, 37]) {
    R(c, x, 37 + sq, 9, 8, '#ffffff');
    R(c, x + 3, 39 + sq, 4, 5, '#141414');
    P(c, x + 3, 39 + sq, 2, 2, '#ffffff');
  }
  P(c, 19, 35 + sq, 10, 2, tint(b.dark, -0.3)); // sourcils
  P(c, 37, 35 + sq, 10, 2, tint(b.dark, -0.3));
  R(c, 26, 48 + sq, 13, 3, tint(b.dark, -0.35)); // bouche
  P(c, 28, 48 + sq, 2, 2, '#ffffff');
  P(c, 35, 48 + sq, 2, 2, '#ffffff');
  // couronne
  const g = b.eye;
  const cy = 10 + sq;
  R(c, 18, cy + 6, 28, 9, tint(g, -0.25));
  R(c, 18, cy + 5, 28, 8, g);
  for (const [x, h] of [[18, 7], [27, 9], [36, 9], [43, 7]]) (P(c, x + 1, cy + 5 - h, 3, h, g), P(c, x + 1, cy + 5 - h, 1, h, tint(g, 0.4)), disc(c, x + 2, cy + 4 - h, 1, '#ffffff'));
  P(c, 19, cy + 6, 26, 1, tint(g, 0.45));
  for (const [x, col] of [[23, '#e8303a'], [31, '#3a8ad8'], [39, '#5ac83a']]) (R(c, x, cy + 8, 4, 4, col), P(c, x + 1, cy + 8, 1, 1, '#ffffff'));
}

/** Chiot qui suit le héros (profil, 2 images de marche). */
export function petHD(c, pet, step) {
  ellipse(c, 16, 30, 9, 1, 'rgba(0,0,0,.25)');
  const body = pet.body;
  const dark = pet.dark;
  const light = pet.light;
  // queue qui remue
  P(c, 4, step ? 12 : 15, 3, 3, body);
  P(c, 2, step ? 10 : 14, 3, 3, light);
  // corps
  R(c, 6, 17, 18, 9, body);
  P(c, 8, 19, 12, 3, light);
  P(c, 6, 24, 18, 2, dark);
  // pattes
  P(c, 8, 26, 3, step ? 3 : 2, dark);
  P(c, 19, 26, 3, step ? 2 : 3, dark);
  P(c, 12, 26, 3, step ? 2 : 3, body);
  P(c, 22, 26, 2, step ? 3 : 2, body);
  // tête
  R(c, 19, 9, 11, 11, body);
  R(c, 25, 14, 6, 5, light); // museau
  P(c, 29, 14, 2, 2, '#141414'); // truffe
  P(c, 26, 18, 3, 1, dark);
  R(c, 23, 12, 3, 3, '#141414'); // œil
  P(c, 23, 12, 1, 1, '#ffffff');
  R(c, 19, 8, 4, 8, dark); // oreille tombante
  P(c, 20, 9, 1, 5, tint(dark, 0.2));
  P(c, 21, 20, 6, 2, '#e8303a'); // collier
  P(c, 23, 21, 2, 2, '#ffd35a');
}
