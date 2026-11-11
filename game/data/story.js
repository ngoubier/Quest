// L'HISTOIRE D'OUVERTURE — 5 images dessinées par le code, avec leur texte.
// Chaque `paint(r, box, t)` dessine dans la zone `box` ; `t` = secondes depuis le début de la page.

const RAINBOW = ['#ff5a7a', '#ffb03a', '#ffe04a', '#5ad87a', '#5aa8ff', '#a87aff'];

/** Licorne en pixels (16 x 16 cases de taille `s`), tournée vers la droite. */
export function drawUnicorn(r, x, y, s = 1, grey = false) {
  const R = (a, b, w, h, col) => r.rect(x + a * s, y + b * s, w * s, h * s, col);
  const W = grey ? '#d8d8d8' : '#ffffff';
  R(3, 7, 10, 5, W);
  R(3, 11, 10, 1, '#d6d0ec');
  R(11, 3, 4, 5, W);
  R(12, 2, 3, 2, W);
  [4, 7, 10, 12].forEach((a) => R(a, 12, 1, 4, W));
  R(14, 0, 1, 2, '#ffd35a');
  R(15, -1, 1, 1, '#ffd35a');
  R(13, 4, 1, 1, '#3a2a6a');
  RAINBOW.forEach((col, i) => R(10 - (i > 2 ? 1 : 0), 2 + i, 2, 1, grey ? '#aaa' : col));
  [RAINBOW[0], RAINBOW[2], RAINBOW[4]].forEach((col, i) => R(1, 7 + i * 2, 2, 2, grey ? '#aaa' : col));
}

function hills(r, b, cols, base) {
  cols.forEach((col, k) => {
    for (let x = 0; x < b.w; x += 2) {
      const h = base + k * 10 + Math.sin(x / (26 - k * 6) + k * 2) * (10 - k * 2);
      r.rect(b.x + x, b.y + b.h - h, 2, h, col);
    }
  });
}

function house(r, x, y, wall, roof) {
  r.rect(x, y + 8, 18, 12, wall);
  for (let i = 0; i < 6; i++) r.rect(x - 2 + i * 2, y + 6 - i, 22 - i * 4, 2, roof);
  r.rect(x + 7, y + 13, 4, 7, '#5a3a1c');
}

function volcano(r, b, cx, baseY, t) {
  for (let i = 0; i < 44; i++) r.rect(cx - 14 - i * 1.6, baseY - 44 + i, 28 + i * 3.2, 1, i % 9 === 0 ? '#3a2e34' : '#241c22');
  r.rect(cx - 14, baseY - 46, 28, 3, '#ff6a1a');
  r.rect(cx - 3, baseY - 43, 3, 16 + Math.sin(t * 2) * 3, '#ffb03a');
  r.rect(cx + 6, baseY - 43, 2, 9, '#ff8a2a');
  // château
  r.rect(cx - 12, baseY - 66, 24, 22, '#140e1c');
  r.rect(cx - 17, baseY - 74, 7, 30, '#140e1c');
  r.rect(cx + 10, baseY - 74, 7, 30, '#140e1c');
  r.rect(cx - 3, baseY - 80, 6, 16, '#140e1c');
  [-17, -13, 10, 14].forEach((o) => r.rect(cx + o, baseY - 77, 2, 3, '#140e1c'));
  r.rect(cx - 1, baseY - 74, 2, 3, '#ffb03a');
  r.rect(cx - 15, baseY - 68, 2, 3, '#ffb03a');
  r.rect(cx + 13, baseY - 68, 2, 3, '#ffb03a');
}

export const INTRO_STORY = [
  {
    text: 'Il était une fois le royaume d’Iris, un pays de montagnes, de forêts et de villages aux mille couleurs.',
    paint(r, b, t) {
      r.rect(b.x, b.y, b.w, b.h, '#7ec8ff');
      r.rect(b.x + b.w - 44, b.y + 14, 18, 18, '#ffe04a');
      // arc-en-ciel
      const c = r.ctx;
      RAINBOW.forEach((col, i) => {
        c.strokeStyle = col;
        c.lineWidth = 3;
        c.beginPath();
        c.arc(b.x + b.w * 0.4, b.y + b.h - 24, 78 - i * 3, Math.PI, Math.PI * 2);
        c.stroke();
      });
      // montagnes enneigées
      [[0.2, 46], [0.34, 60], [0.5, 40]].forEach(([fx, h]) => {
        const cx = b.x + b.w * fx;
        for (let i = 0; i < h; i++) r.rect(cx - i * 0.8, b.y + b.h - 40 - h + i, i * 1.6, 1, i < 10 ? '#ffffff' : '#8a9ab0');
      });
      hills(r, b, ['#4f9a3c', '#6fbf4a'], 30);
      house(r, b.x + b.w * 0.62, b.y + b.h - 44, '#efe0bf', '#c0573e');
      house(r, b.x + b.w * 0.76, b.y + b.h - 38, '#efe0bf', '#3f6aa8');
      [0.1, 0.3, 0.5, 0.9].forEach((fx, i) => r.rect(b.x + b.w * fx, b.y + b.h - 12 - (i % 2) * 6, 2, 2, RAINBOW[i]));
    },
  },
  {
    text: 'Alia, la licorne arc-en-ciel, veillait sur lui. Tant qu’elle était là, le royaume gardait ses couleurs.',
    paint(r, b, t) {
      r.rect(b.x, b.y, b.w, b.h, '#9ad4ff');
      hills(r, b, ['#5eab3c', '#7ccc55'], 34);
      const bob = Math.round(Math.sin(t * 2) * 2);
      drawUnicorn(r, b.x + b.w / 2 - 40, b.y + b.h - 104 + bob, 5);
      for (let i = 0; i < 10; i++) {
        const a = t * 1.2 + i * 0.63;
        r.rect(b.x + b.w / 2 + Math.cos(a) * (60 + (i % 3) * 8), b.y + b.h / 2 - 8 + Math.sin(a * 1.3) * 34, 2, 2, RAINBOW[i % 6]);
      }
    },
  },
  {
    text: 'Mais une nuit d’orage, Morgor, le Seigneur des Cendres, a enlevé Alia !',
    paint(r, b, t) {
      const flash = t % 2.2 < 0.12;
      r.rect(b.x, b.y, b.w, b.h, flash ? '#8a86b0' : '#141228');
      // éclair
      if (t % 2.2 < 0.3) [[0, 0], [-6, 16], [2, 16], [-8, 36], [0, 36], [-10, 58]].forEach(([dx, dy], i) => i % 2 === 0 && r.rect(b.x + b.w * 0.25 + dx, b.y + dy, 4, 22, '#fff8c0'));
      hills(r, b, ['#1e2a2a', '#28382e'], 26);
      // Morgor : cape, couronne, yeux rouges
      const mx = b.x + b.w * 0.62;
      const my = b.y + b.h - 96;
      for (let i = 0; i < 50; i++) r.rect(mx - 10 - i * 0.35, my + 22 + i, 20 + i * 0.7, 1, '#2a1238');
      r.rect(mx - 9, my + 4, 18, 20, '#3a1a4a');
      [-9, -2, 5].forEach((o) => r.rect(mx + o, my - 3, 4, 7, '#ff5a1a'));
      r.rect(mx - 6, my + 11, 4, 3, '#ff2a2a');
      r.rect(mx + 2, my + 11, 4, 3, '#ff2a2a');
      // Alia dans une cage
      const cx = b.x + b.w * 0.22;
      const cy = b.y + b.h - 62;
      drawUnicorn(r, cx + 3, cy + 6, 2, true);
      r.rect(cx - 2, cy, 42, 3, '#6a6a7a');
      r.rect(cx - 2, cy + 40, 42, 3, '#6a6a7a');
      for (let i = 0; i < 6; i++) r.rect(cx + i * 8, cy, 2, 42, '#9a9aa8');
      // pluie
      for (let i = 0; i < 40; i++) r.rect(b.x + ((i * 37 + t * 90) % b.w), b.y + ((i * 53 + t * 240) % b.h), 1, 5, 'rgba(160,180,255,.5)');
    },
  },
  {
    text: 'Il l’a enfermée dans son château, au fond du Volcan Noir, au centre du royaume.',
    paint(r, b, t) {
      r.rect(b.x, b.y, b.w, b.h, '#3a1420');
      r.rect(b.x, b.y, b.w, b.h * 0.45, '#5a1c22');
      for (let i = 0; i < 5; i++) r.withAlpha(0.35, () => r.rect(b.x + ((i * 61 + t * 6) % (b.w + 40)) - 40, b.y + 10 + i * 9, 46, 7, '#1a0c14'));
      volcano(r, b, b.x + b.w / 2, b.y + b.h - 8, t);
      r.rect(b.x, b.y + b.h - 10, b.w, 10, '#1c1418');
      for (let x = 0; x < b.w; x += 14) r.rect(b.x + x + ((x * 7) % 5), b.y + b.h - 7, 6, 2, '#ff6a1a');
      for (let i = 0; i < 12; i++) r.rect(b.x + ((i * 47) % b.w), b.y + b.h - ((t * 26 + i * 31) % b.h), 2, 2, i % 2 ? '#ffb03a' : '#ff6a1a');
    },
  },
  {
    text: 'Depuis, le royaume pâlit de jour en jour... À Prébois, l’Ancien du village t’appelle. Va vite le voir !',
    paint(r, b, t) {
      r.rect(b.x, b.y, b.w, b.h, '#b4bcc4');
      hills(r, b, ['#7f8f7a', '#96a68e'], 34);
      house(r, b.x + b.w * 0.14, b.y + b.h - 56, '#cfcabd', '#8f8580');
      house(r, b.x + b.w * 0.72, b.y + b.h - 50, '#cfcabd', '#7f8894');
      // l'Ancien (capuche violette : la seule couleur vive)
      const ex = b.x + b.w * 0.46;
      const ey = b.y + b.h - 54;
      r.rect(ex, ey, 14, 12, '#5a3a8a');
      r.rect(ex + 3, ey + 4, 8, 7, '#e8b88a');
      r.rect(ex + 3, ey + 9, 8, 4, '#eeeeee');
      r.rect(ex - 1, ey + 12, 16, 16, '#5a3a8a');
      r.rect(ex + 2, ey + 28, 4, 3, '#3a2a5a');
      r.rect(ex + 8, ey + 28, 4, 3, '#3a2a5a');
      r.rect(ex + 17, ey + 4, 2, 26, '#6b4423');
      if (Math.floor(t * 2) % 2 === 0) r.text('!', ex + 5, ey - 14, { color: '#ffd35a', size: 12, bold: true, shadow: '#000' });
    },
  },
];
