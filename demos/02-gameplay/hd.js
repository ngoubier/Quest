// Dessins HAUTE DÉFINITION (profil PC) : 32×32 pixels d'image pour une case de 16×16.
// Mêmes silhouettes et mêmes emplacements que le pixel art d'origine (la logique ne change
// pas), mais 4 fois plus de pixels : ombrages, reflets, brins d'herbe, briques, visages.
// Tout ce qui n'a pas de version HD ici est agrandi automatiquement (Scale2x + finition).

const P = (c, x, y, w, h, col) => {
  c.fillStyle = col;
  c.fillRect(x, y, w, h);
};

/** Éclaircit (f > 0) ou assombrit (f < 0) une couleur #rrggbb. */
export function tint(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(f >= 0 ? v + (255 - v) * f : v * (1 + f)));
  return `#${ch.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

/** Rectangle aux coins arrondis (1 pixel retiré à chaque coin). */
function R(c, x, y, w, h, col) {
  P(c, x + 1, y, w - 2, h, col);
  P(c, x, y + 1, w, h - 2, col);
}

/** Disque plein, pixel par pixel. */
function disc(c, cx, cy, r, col) {
  for (let y = -r; y <= r; y++) {
    const w = Math.floor(Math.sqrt(r * r - y * y) + 0.35);
    P(c, cx - w, cy + y, w * 2 + 1, 1, col);
  }
}

// ------------------------------------------------------------------ personnages
/** Personnage 32×32 (même gabarit que humanoid() en 16×16). */
export function humanoidHD(c, dir, step, col) {
  const skin = col.skin;
  const skinDark = tint(skin, -0.18);
  const body = col.body;
  const bodyDark = col.bodyDark;
  const bodyLight = tint(body, 0.25);
  const legs = col.legs;
  const shoe = tint(legs, -0.45);
  const hair = col.hair;
  const hairDark = tint(hair, -0.3);
  const hairLight = tint(hair, 0.3);

  // ombre au sol
  P(c, 9, 30, 14, 2, 'rgba(0,0,0,.28)');
  P(c, 7, 30, 18, 1, 'rgba(0,0,0,.18)');

  // jambes et chaussures
  if (dir === 'side') {
    const a = step ? 2 : 0;
    P(c, 10 + a, 24, 4, 5, legs);
    P(c, 10 + a, 29, 5, 2, shoe);
    P(c, 18 - a, 24, 4, 5, col.legsDark || tint(legs, -0.15));
    P(c, 18 - a, 29, 5, 2, shoe);
  } else {
    const l = step ? 6 : 4;
    const r = step ? 4 : 6;
    P(c, 10, 24, 4, l - 1, legs);
    P(c, 10, 23 + l, 4, 2, shoe);
    P(c, 18, 24, 4, r - 1, legs);
    P(c, 18, 23 + r, 4, 2, shoe);
    P(c, 13, 24, 1, l - 1, tint(legs, -0.2));
    P(c, 21, 24, 1, r - 1, tint(legs, -0.2));
  }

  // corps (tunique) : lumière à gauche, ombre à droite, ceinture
  R(c, 8, 14, 16, 10, body);
  P(c, 9, 15, 2, 7, bodyLight);
  P(c, 21, 15, 2, 8, bodyDark);
  P(c, 8, 22, 16, 2, bodyDark);
  P(c, 8, 20, 16, 1, tint(bodyDark, -0.25));
  if (dir === 'down') {
    P(c, 15, 19, 2, 3, '#e8d070');
    P(c, 14, 14, 4, 2, tint(body, -0.12)); // col
  }
  if (dir === 'side') {
    // bras le long du corps
    R(c, 14, 16 + (step ? 2 : 0), 5, 6, bodyDark);
    P(c, 14, 21 + (step ? 2 : 0), 4, 2, skin);
  } else {
    const a = step ? 2 : 0;
    const b = step ? 0 : 2;
    P(c, 6, 15 + a, 2, 5, body);
    P(c, 6, 20 + a, 2, 2, skin);
    P(c, 24, 15 + b, 2, 5, bodyDark);
    P(c, 24, 20 + b, 2, 2, skinDark);
  }

  // tête
  R(c, 10, 2, 12, 12, skin);
  P(c, 20, 3, 2, 10, skinDark);
  if (dir === 'down') {
    P(c, 10, 2, 12, 4, hair);
    P(c, 10, 6, 2, 4, hair);
    P(c, 20, 6, 2, 4, hair);
    P(c, 12, 3, 6, 1, hairLight);
    P(c, 14, 5, 1, 2, hairDark);
    P(c, 17, 5, 1, 1, hairDark);
    // yeux : blanc + pupille + reflet
    P(c, 12, 8, 3, 3, '#ffffff');
    P(c, 18, 8, 3, 3, '#ffffff');
    P(c, 13, 8, 2, 3, col.eye);
    P(c, 18, 8, 2, 3, col.eye);
    P(c, 13, 8, 1, 1, '#ffffff');
    P(c, 18, 8, 1, 1, '#ffffff');
    P(c, 11, 11, 2, 1, 'rgba(255,110,110,.45)'); // joues
    P(c, 20, 11, 2, 1, 'rgba(255,110,110,.45)');
    P(c, 15, 12, 3, 1, tint(skin, -0.35)); // bouche
  } else if (dir === 'up') {
    R(c, 10, 2, 12, 10, hair);
    P(c, 12, 3, 7, 1, hairLight);
    for (const x of [12, 15, 18]) P(c, x, 6, 1, 5, hairDark);
  } else {
    P(c, 10, 2, 12, 4, hair);
    R(c, 10, 5, 6, 7, hair);
    P(c, 12, 3, 6, 1, hairLight);
    P(c, 11, 7, 1, 4, hairDark);
    P(c, 18, 8, 2, 3, '#ffffff');
    P(c, 19, 8, 1, 3, col.eye);
    P(c, 22, 9, 1, 2, skin); // nez
    P(c, 19, 12, 2, 1, tint(skin, -0.35));
    P(c, 15, 8, 2, 3, skinDark); // oreille
  }

  // couvre-chef
  const hc = col.hatColor;
  if (col.hat === 'hood') {
    const hd = tint(hc, -0.25);
    R(c, 8, 0, 16, 4, hc);
    P(c, 9, 0, 10, 1, tint(hc, 0.25));
    P(c, 8, 3, 16, 1, hd);
    if (dir === 'side') (R(c, 3, 2, 7, 4, hc), P(c, 3, 5, 6, 1, hd));
    else if (dir === 'up') (R(c, 12, 0, 8, 8, hc), P(c, 18, 1, 2, 7, hd));
    else (R(c, 22, 2, 5, 4, hc), P(c, 22, 5, 4, 1, hd));
  } else if (col.hat === 'helmet') {
    R(c, 8, 0, 16, 14, hc);
    P(c, 9, 0, 14, 2, col.hatLight);
    P(c, 21, 2, 2, 11, tint(hc, -0.2));
    if (dir === 'down') (R(c, 10, 4, 12, 6, col.visor), P(c, 11, 5, 4, 1, tint(col.visor, 0.55)), P(c, 11, 6, 2, 1, tint(col.visor, 0.35)));
    if (dir === 'side') (R(c, 16, 4, 8, 6, col.visor), P(c, 17, 5, 3, 1, tint(col.visor, 0.55)));
    if (dir === 'up') P(c, 13, 4, 6, 1, tint(hc, -0.15));
  } else if (col.hat === 'cap') {
    R(c, 10, 0, 12, 4, hc);
    P(c, 12, 1, 4, 1, tint(hc, 0.3));
    if (dir === 'down') P(c, 10, 4, 12, 2, col.hatDark);
    if (dir === 'side') P(c, 20, 4, 6, 2, col.hatDark);
  }
}

// ------------------------------------------------------------------ tuiles
/** Herbe : dégradé léger, brins d'herbe, fleurs sur certaines variantes. */
export function grassHD(c, { rng, variant = 0 }, base = '#4c9a3c') {
  P(c, 0, 0, 32, 32, base);
  for (let i = 0; i < 26; i++) P(c, rng.int(0, 31), rng.int(0, 31), 2, 1, rng.pick([tint(base, -0.12), tint(base, 0.1)]));
  const blades = 14 + variant * 5;
  for (let i = 0; i < blades; i++) {
    const x = rng.int(1, 30);
    const y = rng.int(3, 31);
    const h = rng.int(2, 4);
    const dark = i % 3 === 0;
    P(c, x, y - h, 1, h, dark ? tint(base, -0.25) : tint(base, 0.22));
    P(c, x, y - h, 1, 1, dark ? tint(base, -0.1) : tint(base, 0.4));
    if (i % 4 === 0) P(c, x + 1, y - h + 1, 1, h - 1, tint(base, -0.18));
  }
  if (variant === 2) {
    for (const col of ['#ffe066', '#ffffff', '#ff8aa8']) {
      const x = rng.int(3, 28);
      const y = rng.int(3, 28);
      P(c, x - 1, y, 3, 1, col);
      P(c, x, y - 1, 1, 3, col);
      P(c, x, y, 1, 1, '#f4a020');
    }
  }
}

/** Chemin de terre : grain, cailloux avec ombre et reflet. */
export function pathHD(c, { rng }) {
  const base = '#c9a266';
  P(c, 0, 0, 32, 32, base);
  for (let i = 0; i < 40; i++) P(c, rng.int(0, 31), rng.int(0, 31), 1, 1, rng.pick(['#b08950', '#dcb97f', '#bf9858']));
  for (let i = 0; i < 4; i++) {
    const x = rng.int(2, 26);
    const y = rng.int(2, 26);
    const w = rng.int(3, 5);
    R(c, x, y + 1, w, 3, '#8a6a3a');
    R(c, x, y, w, 3, '#a8885a');
    P(c, x + 1, y, w - 2, 1, '#e8d0a0');
  }
}

/** Eau : dégradé de profondeur, vaguelettes en arc, reflets qui scintillent. */
export function waterHD(c, { frame, variant = 0 }, { base, deep, light }) {
  P(c, 0, 0, 32, 32, base);
  P(c, 0, 16, 32, 16, deep);
  P(c, 0, 14, 32, 2, tint(base, -0.05));
  const o = frame * 6 + variant * 11;
  const wave = (x, y) => {
    x = ((x % 30) + 30) % 30;
    P(c, x, y + 1, 1, 1, light);
    P(c, x + 1, y, 4, 1, light);
    P(c, x + 5, y + 1, 1, 1, light);
    P(c, x + 1, y + 1, 4, 1, tint(base, 0.08));
  };
  wave(3 + o, 7);
  wave(17 + o, 21);
  wave(24 - o, 13);
  if (frame) (P(c, (9 + variant * 13) % 30, 15, 2, 1, '#ffffff'), P(c, (10 + variant * 13) % 30, 14, 1, 3, 'rgba(255,255,255,.6)'));
}

/** Mur de briques : briques arrondies, reflet en haut, ombre en bas, grain. */
export function bricksHD(c, base, mortar, hi, rng) {
  P(c, 0, 0, 32, 32, mortar);
  for (let row = 0; row < 4; row++) {
    const off = row % 2 ? -8 : 0;
    for (let col = 0; col < 3; col++) {
      const x = off + col * 16;
      const y = row * 8;
      const shade = rng ? rng.pick([0, 0.06, -0.06]) : 0;
      const b = tint(base, shade);
      R(c, x + 1, y + 1, 15, 7, b);
      P(c, x + 2, y + 1, 13, 1, hi);
      P(c, x + 2, y + 7, 13, 1, tint(base, -0.22));
      P(c, x + 15, y + 2, 1, 5, tint(base, -0.15));
      if (rng) P(c, x + rng.int(4, 12), y + rng.int(3, 5), 2, 1, tint(base, -0.12));
    }
  }
}

/** Feuillage en grappes (arbres, buissons) : ombre en bas à droite, lumière en haut à gauche. */
function foliage(c, blobs, dark, mid, light) {
  for (const [x, y, r] of blobs) disc(c, x + 1, y + 1, r, dark);
  for (const [x, y, r] of blobs) disc(c, x, y, r - 1, mid);
  for (const [x, y, r] of blobs) {
    disc(c, x - Math.ceil(r / 3), y - Math.ceil(r / 3), Math.max(1, Math.floor(r / 3)), light);
    P(c, x - Math.ceil(r / 2), y - 1, 2, 1, light);
  }
}

export function treeHD(c, ctx) {
  grassHD(c, { ...ctx, variant: 0 });
  P(c, 6, 27, 20, 3, 'rgba(0,0,0,.3)');
  P(c, 13, 20, 6, 8, '#5a3a1c');
  P(c, 13, 20, 2, 8, '#7a5230');
  foliage(c, [[10, 12, 7], [21, 12, 7], [16, 8, 8], [15, 17, 7]], '#1d4a1a', '#2f7a2a', '#5aaf48');
  for (const [x, y] of [[9, 9], [20, 7], [14, 15], [23, 15]]) P(c, x, y, 1, 1, '#8ad06a');
}

export function bushHD(c, ctx) {
  grassHD(c, { ...ctx, variant: 0 });
  P(c, 5, 26, 22, 3, 'rgba(0,0,0,.28)');
  foliage(c, [[10, 18, 7], [22, 18, 7], [16, 13, 7]], '#245a20', '#3f8a36', '#6bc458');
  for (const [x, y] of [[12, 10], [20, 14], [9, 16]]) P(c, x, y, 1, 1, '#9ae07a');
}

// ------------------------------------------------------------------ objets
/** Coffre 32×32 : planches, ferrures, serrure, ombre. */
export function chestHD(c, open, p) {
  P(c, 3, 28, 26, 3, 'rgba(0,0,0,.3)');
  R(c, 2, 10, 28, 19, p.chestDark);
  R(c, 3, 11, 26, 17, p.chest);
  for (const y of [15, 21]) P(c, 3, y, 26, 1, tint(p.chest, -0.2));
  P(c, 3, 11, 26, 1, tint(p.chest, 0.25));
  P(c, 2, 16, 28, 2, p.chestDark);
  for (const x of [4, 26]) (P(c, x, 11, 2, 17, p.metal), P(c, x, 11, 1, 17, tint(p.metal, 0.3)));
  if (!open) {
    R(c, 2, 5, 28, 11, p.chestDark);
    R(c, 3, 6, 26, 9, p.chest);
    P(c, 4, 7, 24, 1, tint(p.chest, 0.3));
    for (const x of [4, 26]) P(c, x, 6, 2, 9, p.metal);
    R(c, 13, 13, 6, 7, p.metal);
    P(c, 15, 15, 2, 3, '#1a1008');
    P(c, 14, 13, 4, 1, tint(p.metal, 0.4));
  } else {
    R(c, 2, 1, 28, 9, p.chestDark);
    R(c, 3, 2, 26, 6, p.chest);
    P(c, 4, 3, 24, 1, tint(p.chest, 0.3));
    P(c, 5, 11, 22, 5, '#140c06');
    P(c, 8, 12, 16, 2, 'rgba(255,220,120,.35)');
  }
}

/** Pièce d'euro 32×32 : disque doré, tranche, reflet, symbole €. */
export function coinHD(c, p) {
  disc(c, 16, 17, 11, p.coinDark);
  disc(c, 16, 16, 11, p.coin);
  disc(c, 16, 16, 8, tint(p.coin, -0.08));
  disc(c, 12, 11, 3, p.coinLight);
  const e = p.coinDark;
  P(c, 15, 10, 6, 2, e);
  P(c, 13, 12, 2, 8, e);
  P(c, 15, 20, 6, 2, e);
  P(c, 11, 14, 7, 1, e);
  P(c, 11, 17, 7, 1, e);
}
