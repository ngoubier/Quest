// L'HISTOIRE D'OUVERTURE — 5 images dessinées par le code, avec leur texte.
// Chaque `paint(r, box, t)` dessine dans la zone `box` ; `t` = secondes depuis le début de la page.
// Les images sont tracées avec des formes lisses (courbes, dégradés) : elles profitent de toute
// la finesse de l'écran, sur PC comme sur mobile.

export const RAINBOW = ['#ff5a7a', '#ffa23a', '#ffe04a', '#5ad87a', '#5aa8ff', '#a87aff'];
const TAU = Math.PI * 2;

/** Licorne en pixels (16 x 16 cases de taille `s`), tournée vers la droite. Sert à l'écran titre. */
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

// ------------------------------------------------------------------ outils de dessin
export function sky(c, b, stops) {
  const g = c.createLinearGradient(0, b.y, 0, b.y + b.h);
  stops.forEach(([o, col]) => g.addColorStop(o, col));
  c.fillStyle = g;
  c.fillRect(b.x, b.y, b.w, b.h);
}

export function glow(c, x, y, radius, color, alpha = 1) {
  const g = c.createRadialGradient(x, y, 0, x, y, radius);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  c.globalAlpha = alpha;
  c.fillStyle = g;
  c.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  c.globalAlpha = 1;
}

/** Collines : une courbe douce de gauche à droite, remplie jusqu'en bas. */
export function hills(c, b, base, amp, wave, phase, color, shade) {
  const y0 = b.y + b.h - base;
  c.beginPath();
  c.moveTo(b.x, b.y + b.h);
  for (let x = 0; x <= b.w; x += 4) c.lineTo(b.x + x, y0 - Math.sin(x / wave + phase) * amp - Math.sin(x / (wave * 0.37) + phase * 2) * amp * 0.25);
  c.lineTo(b.x + b.w, b.y + b.h);
  c.closePath();
  const g = c.createLinearGradient(0, y0 - amp, 0, b.y + b.h);
  g.addColorStop(0, color);
  g.addColorStop(1, shade ?? color);
  c.fillStyle = g;
  c.fill();
}

export function cloud(c, x, y, s, color, alpha = 1) {
  c.globalAlpha = alpha;
  c.fillStyle = color;
  c.beginPath();
  [[0, 0, 9], [10, -4, 11], [22, -1, 9], [31, 2, 7], [-9, 3, 6]].forEach(([dx, dy, rad]) => c.ellipse(x + dx * s, y + dy * s, rad * s, rad * 0.7 * s, 0, 0, TAU));
  c.fill();
  c.globalAlpha = 1;
}

export function mountain(c, x, baseY, w, h, rock, shadow, snow) {
  c.fillStyle = rock;
  c.beginPath();
  c.moveTo(x - w / 2, baseY);
  c.lineTo(x, baseY - h);
  c.lineTo(x + w / 2, baseY);
  c.fill();
  c.fillStyle = shadow;
  c.beginPath();
  c.moveTo(x, baseY - h);
  c.lineTo(x + w / 2, baseY);
  c.lineTo(x + w * 0.12, baseY);
  c.fill();
  if (!snow) return;
  c.fillStyle = snow;
  c.beginPath();
  c.moveTo(x, baseY - h);
  c.lineTo(x - w * 0.16, baseY - h * 0.68);
  c.lineTo(x - w * 0.07, baseY - h * 0.74);
  c.lineTo(x, baseY - h * 0.62);
  c.lineTo(x + w * 0.08, baseY - h * 0.75);
  c.lineTo(x + w * 0.16, baseY - h * 0.66);
  c.fill();
}

export function tree(c, x, y, s, leaf, dark) {
  c.fillStyle = '#6b4423';
  c.fillRect(x - s * 0.12, y - s * 0.5, s * 0.24, s * 0.5);
  c.fillStyle = dark;
  c.beginPath();
  c.arc(x, y - s * 0.75, s * 0.42, 0, TAU);
  c.fill();
  c.fillStyle = leaf;
  c.beginPath();
  c.arc(x - s * 0.08, y - s * 0.82, s * 0.34, 0, TAU);
  c.fill();
}

export function cottage(c, x, y, s, wall, roof, lit = true) {
  c.fillStyle = 'rgba(0,0,0,.18)';
  c.beginPath();
  c.ellipse(x + s * 0.5, y, s * 0.6, s * 0.08, 0, 0, TAU);
  c.fill();
  c.fillStyle = wall;
  c.fillRect(x, y - s * 0.55, s, s * 0.55);
  c.fillStyle = roof;
  c.beginPath();
  c.moveTo(x - s * 0.12, y - s * 0.52);
  c.lineTo(x + s * 0.5, y - s * 1.05);
  c.lineTo(x + s * 1.12, y - s * 0.52);
  c.fill();
  c.fillStyle = 'rgba(0,0,0,.2)';
  c.beginPath();
  c.moveTo(x + s * 0.5, y - s * 1.05);
  c.lineTo(x + s * 1.12, y - s * 0.52);
  c.lineTo(x + s * 0.5, y - s * 0.52);
  c.fill();
  c.fillStyle = '#5a3a1c';
  c.fillRect(x + s * 0.4, y - s * 0.34, s * 0.2, s * 0.34);
  c.fillStyle = lit ? '#ffe08a' : '#6a7078';
  c.fillRect(x + s * 0.12, y - s * 0.4, s * 0.18, s * 0.16);
  c.fillRect(x + s * 0.7, y - s * 0.4, s * 0.18, s * 0.16);
  c.fillStyle = roof;
  c.fillRect(x + s * 0.74, y - s * 1.0, s * 0.12, s * 0.3);
}

export function sparkle(c, x, y, s, color, alpha = 1) {
  c.globalAlpha = Math.max(0, alpha);
  c.fillStyle = color;
  c.beginPath();
  c.moveTo(x, y - s);
  c.quadraticCurveTo(x, y, x + s, y);
  c.quadraticCurveTo(x, y, x, y + s);
  c.quadraticCurveTo(x, y, x - s, y);
  c.quadraticCurveTo(x, y, x, y - s);
  c.fill();
  c.globalAlpha = 1;
}

/**
 * Alia, la licorne (formes lisses), tournée vers la droite. (x, y) = le sol sous ses sabots,
 * `s` = taille (hauteur au garrot ≈ 1.1 × s). `grey` : elle a perdu ses couleurs.
 */
export function drawAlia(c, x, y, s, t = 0, { grey = false } = {}) {
  const body = grey ? '#d9dbe2' : '#ffffff';
  const shade = grey ? '#b0b4be' : '#d9d4f0';
  const colors = grey ? ['#a8acb6', '#9a9ea8', '#b4b8c0', '#a0a4ae', '#aeb2ba', '#989ca6'] : RAINBOW;
  const sway = Math.sin(t * 2.2) * s * 0.03;
  // ombre au sol
  c.fillStyle = 'rgba(0,0,0,.18)';
  c.beginPath();
  c.ellipse(x, y, s * 0.75, s * 0.09, 0, 0, TAU);
  c.fill();
  // queue arc-en-ciel
  colors.forEach((col, i) => {
    c.strokeStyle = col;
    c.lineWidth = s * 0.055;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(x - s * 0.52, y - s * 0.78);
    c.bezierCurveTo(x - s * (0.85 + i * 0.02), y - s * (0.85 - i * 0.03) + sway, x - s * (0.98 - i * 0.035), y - s * (0.45 - i * 0.02) - sway, x - s * (0.82 - i * 0.05), y - s * (0.18 + i * 0.012));
    c.stroke();
  });
  // jambes arrière (plus sombres)
  c.fillStyle = shade;
  [[-0.36, 0.0], [0.3, 0.04]].forEach(([dx, lift]) => {
    c.beginPath();
    c.roundRect(x + s * dx, y - s * 0.55, s * 0.11, s * (0.55 - lift), s * 0.04);
    c.fill();
  });
  // corps
  c.fillStyle = body;
  c.beginPath();
  c.ellipse(x - s * 0.05, y - s * 0.72, s * 0.52, s * 0.27, 0, 0, TAU);
  c.fill();
  c.fillStyle = shade;
  c.beginPath();
  c.ellipse(x - s * 0.05, y - s * 0.6, s * 0.44, s * 0.13, 0, 0, Math.PI);
  c.fill();
  // jambes avant
  c.fillStyle = body;
  [[-0.46, 0], [0.2, 0]].forEach(([dx]) => {
    c.beginPath();
    c.roundRect(x + s * dx, y - s * 0.58, s * 0.12, s * 0.58, s * 0.04);
    c.fill();
  });
  c.fillStyle = grey ? '#8a8e98' : '#ffd35a';
  [-0.46, -0.36, 0.2, 0.3].forEach((dx) => c.fillRect(x + s * dx, y - s * 0.07, s * 0.12, s * 0.07));
  // encolure et tête
  c.fillStyle = body;
  c.beginPath();
  c.moveTo(x + s * 0.18, y - s * 0.62);
  c.quadraticCurveTo(x + s * 0.32, y - s * 1.0, x + s * 0.42, y - s * 1.22);
  c.lineTo(x + s * 0.62, y - s * 1.12);
  c.quadraticCurveTo(x + s * 0.56, y - s * 0.8, x + s * 0.42, y - s * 0.6);
  c.fill();
  c.beginPath();
  c.ellipse(x + s * 0.6, y - s * 1.12, s * 0.2, s * 0.13, 0.35, 0, TAU);
  c.fill();
  c.beginPath();
  c.ellipse(x + s * 0.74, y - s * 1.04, s * 0.1, s * 0.085, 0.35, 0, TAU);
  c.fill();
  // oreille
  c.beginPath();
  c.moveTo(x + s * 0.44, y - s * 1.22);
  c.lineTo(x + s * 0.47, y - s * 1.4);
  c.lineTo(x + s * 0.56, y - s * 1.24);
  c.fill();
  // corne dorée
  c.fillStyle = grey ? '#b8b4a0' : '#ffd35a';
  c.beginPath();
  c.moveTo(x + s * 0.56, y - s * 1.24);
  c.lineTo(x + s * 0.78, y - s * 1.6);
  c.lineTo(x + s * 0.66, y - s * 1.2);
  c.fill();
  c.strokeStyle = grey ? '#98947e' : '#e0a020';
  c.lineWidth = s * 0.015;
  [0.3, 0.55, 0.78].forEach((k) => {
    c.beginPath();
    c.moveTo(x + s * (0.56 + 0.22 * k * 0.55), y - s * (1.24 + 0.36 * k * 0.72));
    c.lineTo(x + s * (0.66 + 0.12 * k * 0.8), y - s * (1.2 + 0.4 * k * 0.78));
    c.stroke();
  });
  // œil et naseau
  c.fillStyle = '#3a2a6a';
  c.beginPath();
  c.ellipse(x + s * 0.62, y - s * 1.14, s * 0.028, s * 0.036, 0, 0, TAU);
  c.fill();
  c.fillStyle = '#ffffff';
  c.fillRect(x + s * 0.625, y - s * 1.165, s * 0.014, s * 0.014);
  c.fillStyle = shade;
  c.beginPath();
  c.arc(x + s * 0.79, y - s * 1.03, s * 0.014, 0, TAU);
  c.fill();
  // crinière arc-en-ciel
  colors.forEach((col, i) => {
    c.strokeStyle = col;
    c.lineWidth = s * 0.06;
    c.lineCap = 'round';
    c.beginPath();
    const k = i / 5;
    c.moveTo(x + s * (0.46 - k * 0.04), y - s * (1.26 - k * 0.1));
    c.quadraticCurveTo(x + s * (0.22 - k * 0.05), y - s * (1.12 - k * 0.12) + sway, x + s * (0.2 - k * 0.1), y - s * (0.86 - k * 0.1) - sway * 0.6);
    c.stroke();
  });
}

export function cage(c, x, y, w, h) {
  c.fillStyle = '#3c3c4a';
  c.fillRect(x - 2, y - 3, w + 4, 4);
  c.fillRect(x - 2, y + h - 1, w + 4, 4);
  c.beginPath();
  c.moveTo(x + w * 0.35, y - 3);
  c.quadraticCurveTo(x + w / 2, y - 12, x + w * 0.65, y - 3);
  c.strokeStyle = '#3c3c4a';
  c.lineWidth = 2;
  c.stroke();
  for (let i = 0; i <= 6; i++) {
    const bx = x + (w * i) / 6;
    c.fillStyle = '#8f8fa0';
    c.fillRect(bx - 0.8, y, 1.6, h);
    c.fillStyle = '#c8c8d8';
    c.fillRect(bx - 0.8, y, 0.6, h);
  }
}

/** Morgor : grande cape, couronne de flammes, yeux rouges, bâton. (x, y) = le sol. */
function morgor(c, x, y, s, t) {
  const sway = Math.sin(t * 1.5) * s * 0.04;
  glow(c, x, y - s * 0.75, s * 1.1, 'rgba(160,40,200,.35)');
  c.fillStyle = '#1c0b2a';
  c.beginPath();
  c.moveTo(x, y - s * 1.15);
  c.bezierCurveTo(x - s * 0.5, y - s * 0.95, x - s * 0.62 + sway, y - s * 0.3, x - s * 0.7 + sway, y);
  c.lineTo(x + s * 0.7 - sway, y);
  c.bezierCurveTo(x + s * 0.62 - sway, y - s * 0.3, x + s * 0.5, y - s * 0.95, x, y - s * 1.15);
  c.fill();
  c.fillStyle = '#3a1a4e';
  c.beginPath();
  c.moveTo(x, y - s * 1.1);
  c.bezierCurveTo(x - s * 0.25, y - s * 0.9, x - s * 0.3, y - s * 0.3, x - s * 0.28, y);
  c.lineTo(x + s * 0.28, y);
  c.bezierCurveTo(x + s * 0.3, y - s * 0.3, x + s * 0.25, y - s * 0.9, x, y - s * 1.1);
  c.fill();
  // capuche et visage dans l'ombre
  c.fillStyle = '#1c0b2a';
  c.beginPath();
  c.ellipse(x, y - s * 1.12, s * 0.24, s * 0.26, 0, 0, TAU);
  c.fill();
  c.fillStyle = '#07030c';
  c.beginPath();
  c.ellipse(x, y - s * 1.08, s * 0.15, s * 0.17, 0, 0, TAU);
  c.fill();
  // yeux
  const blink = 0.75 + Math.sin(t * 5) * 0.25;
  [-0.065, 0.065].forEach((dx) => {
    glow(c, x + s * dx, y - s * 1.1, s * 0.12, 'rgba(255,40,40,.9)', blink);
    c.fillStyle = '#ffd0c0';
    c.beginPath();
    c.ellipse(x + s * dx, y - s * 1.1, s * 0.035, s * 0.02, dx > 0 ? -0.3 : 0.3, 0, TAU);
    c.fill();
  });
  // couronne de flammes
  [-0.16, -0.05, 0.06, 0.17].forEach((dx, i) => {
    const hgt = s * (0.2 + (i % 2) * 0.08 + Math.sin(t * 6 + i) * 0.03);
    c.fillStyle = i % 2 ? '#ffb03a' : '#ff5a1a';
    c.beginPath();
    c.moveTo(x + s * (dx - 0.05), y - s * 1.3);
    c.quadraticCurveTo(x + s * dx, y - s * 1.3 - hgt, x + s * (dx + 0.05), y - s * 1.3);
    c.fill();
  });
  // bâton
  c.strokeStyle = '#4a3a2a';
  c.lineWidth = s * 0.04;
  c.beginPath();
  c.moveTo(x + s * 0.5, y);
  c.lineTo(x + s * 0.46, y - s * 1.25);
  c.stroke();
  glow(c, x + s * 0.46, y - s * 1.3, s * 0.3, 'rgba(255,90,30,.8)', 0.7 + Math.sin(t * 7) * 0.3);
  c.fillStyle = '#ffb03a';
  c.beginPath();
  c.arc(x + s * 0.46, y - s * 1.3, s * 0.06, 0, TAU);
  c.fill();
}

export function vignette(c, b, strength = 0.5) {
  const g = c.createRadialGradient(b.x + b.w / 2, b.y + b.h / 2, b.h * 0.35, b.x + b.w / 2, b.y + b.h / 2, b.w * 0.75);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, `rgba(0,0,0,${strength})`);
  c.fillStyle = g;
  c.fillRect(b.x, b.y, b.w, b.h);
}

// ------------------------------------------------------------------ les 5 pages
export const INTRO_STORY = [
  {
    text: 'Il était une fois le royaume d’Iris, un pays de montagnes, de forêts et de villages aux mille couleurs.',
    paint(r, b, t) {
      const c = r.ctx;
      const W = b.w;
      const base = b.y + b.h;
      sky(c, b, [[0, '#4aa8f0'], [0.6, '#a8dcff'], [1, '#e8f6ff']]);
      // soleil
      glow(c, b.x + W * 0.84, b.y + 24, 46, 'rgba(255,240,170,.9)');
      c.fillStyle = '#fff2a8';
      c.beginPath();
      c.arc(b.x + W * 0.84, b.y + 24, 11, 0, TAU);
      c.fill();
      cloud(c, b.x + ((t * 4 + W * 0.1) % (W + 80)) - 40, b.y + 20, 0.9, '#ffffff', 0.9);
      cloud(c, b.x + ((t * 2.5 + W * 0.6) % (W + 80)) - 40, b.y + 38, 0.6, '#ffffff', 0.75);
      // arc-en-ciel (apparaît doucement)
      c.globalAlpha = Math.min(0.85, t * 0.6);
      RAINBOW.forEach((col, i) => {
        c.strokeStyle = col;
        c.lineWidth = 3;
        c.beginPath();
        c.arc(b.x + W * 0.4, base - 30, W * 0.34 - i * 3, Math.PI, TAU);
        c.stroke();
      });
      c.globalAlpha = 1;
      // montagnes
      mountain(c, b.x + W * 0.16, base - 34, W * 0.3, 58, '#8a9ab8', '#6f7f9e', '#ffffff');
      mountain(c, b.x + W * 0.36, base - 34, W * 0.36, 76, '#96a6c2', '#7888a6', '#ffffff');
      mountain(c, b.x + W * 0.58, base - 34, W * 0.26, 48, '#8a9ab8', '#6f7f9e', '#ffffff');
      // château au loin
      const kx = b.x + W * 0.76;
      const ky = base - 52;
      c.fillStyle = '#d8c8e8';
      c.fillRect(kx - 9, ky - 14, 18, 16);
      c.fillRect(kx - 14, ky - 20, 6, 22);
      c.fillRect(kx + 8, ky - 20, 6, 22);
      c.fillStyle = '#a84a8a';
      [[kx - 11, ky - 20, 5], [kx + 11, ky - 20, 5], [kx, ky - 14, 6]].forEach(([px, py, w]) => {
        c.beginPath();
        c.moveTo(px - w, py);
        c.lineTo(px, py - w * 1.8);
        c.lineTo(px + w, py);
        c.fill();
      });
      hills(c, b, 40, 9, 46, 0.6, '#58b04a', '#3f8f3c');
      [0.08, 0.2, 0.3, 0.93].forEach((fx, i) => tree(c, b.x + W * fx, base - 40 - Math.sin((W * fx) / 46 + 0.6) * 9 + 3, 13 + (i % 2) * 3, '#3f9a3c', '#2a7030'));
      hills(c, b, 22, 7, 38, 2.2, '#78cc58', '#58b04a');
      cottage(c, b.x + W * 0.5, base - 22, 20, '#f4e6c8', '#c0573e');
      cottage(c, b.x + W * 0.64, base - 17, 17, '#f4e6c8', '#3f6aa8');
      cottage(c, b.x + W * 0.36, base - 15, 15, '#f4e6c8', '#d8a030');
      // fleurs qui scintillent
      for (let i = 0; i < 16; i++) {
        const fx = b.x + ((i * 97 + 17) % W);
        const fy = base - 4 - ((i * 7) % 14);
        c.fillStyle = RAINBOW[i % 6];
        c.beginPath();
        c.arc(fx, fy, 1.3 + Math.sin(t * 3 + i) * 0.3, 0, TAU);
        c.fill();
      }
    },
  },
  {
    text: 'Alia, la licorne arc-en-ciel, veillait sur lui. Tant qu’elle était là, le royaume gardait ses couleurs.',
    paint(r, b, t) {
      const c = r.ctx;
      const W = b.w;
      const base = b.y + b.h;
      sky(c, b, [[0, '#6a8af0'], [0.5, '#f0a8d8'], [1, '#ffe8b0']]);
      glow(c, b.x + W / 2, base - 70, 100, 'rgba(255,255,255,.75)');
      // rayons de lumière
      c.save();
      c.translate(b.x + W / 2, base - 62);
      for (let i = 0; i < 12; i++) {
        c.rotate(TAU / 12);
        c.fillStyle = `rgba(255,255,255,${0.08 + 0.05 * Math.sin(t * 1.5 + i)})`;
        c.beginPath();
        c.moveTo(0, 0);
        c.lineTo(-10, -W);
        c.lineTo(10, -W);
        c.fill();
      }
      c.restore();
      cloud(c, b.x + W * 0.14, b.y + 26, 0.8, '#ffffff', 0.8);
      cloud(c, b.x + W * 0.8, b.y + 18, 1, '#ffffff', 0.8);
      hills(c, b, 34, 8, 52, 1.2, '#6cc45a', '#4fa648');
      hills(c, b, 16, 5, 34, 0.2, '#8fdc68', '#6cc45a');
      const bob = Math.sin(t * 2) * 1.5;
      drawAlia(c, b.x + W / 2 - 4, base - 16 + bob * 0.3, 52, t);
      // étincelles autour d'elle
      for (let i = 0; i < 14; i++) {
        const a = t * 0.8 + (i * TAU) / 14;
        const rad = 58 + (i % 3) * 12;
        sparkle(c, b.x + W / 2 + Math.cos(a) * rad, base - 66 + Math.sin(a * 1.3) * 38, 2.2 + (i % 2), RAINBOW[i % 6], 0.55 + 0.45 * Math.sin(t * 4 + i));
      }
      for (let i = 0; i < 10; i++) {
        c.fillStyle = RAINBOW[i % 6];
        c.beginPath();
        c.arc(b.x + ((i * 67 + 11) % W), base - 3 - ((i * 5) % 10), 1.4, 0, TAU);
        c.fill();
      }
    },
  },
  {
    text: 'Mais une nuit d’orage, Morgor, le Seigneur des Cendres, a enlevé Alia !',
    paint(r, b, t) {
      const c = r.ctx;
      const W = b.w;
      const base = b.y + b.h;
      const cycle = t % 2.6;
      const flash = cycle < 0.1 || (cycle > 0.22 && cycle < 0.3);
      sky(c, b, flash ? [[0, '#8a88c0'], [1, '#c8c4e8']] : [[0, '#0c0a20'], [0.7, '#261c40'], [1, '#3a2850']]);
      // nuages d'orage
      for (let i = 0; i < 6; i++) cloud(c, b.x + ((i * 71 + t * (5 + i)) % (W + 100)) - 50, b.y + 12 + (i % 3) * 13, 1.1 + (i % 2) * 0.4, flash ? '#6a6890' : '#181430', 0.95);
      // éclair en zigzag
      if (cycle < 0.34) {
        const lx = b.x + W * 0.3;
        c.strokeStyle = '#fffbd0';
        c.lineWidth = 2.2;
        c.lineJoin = 'miter';
        c.beginPath();
        c.moveTo(lx, b.y + 18);
        [[-8, 24], [3, 26], [-10, 50], [1, 52], [-12, 82]].forEach(([dx, dy]) => c.lineTo(lx + dx, b.y + 18 + dy));
        c.stroke();
        glow(c, lx - 5, b.y + 60, 60, 'rgba(255,250,200,.5)');
      }
      hills(c, b, 26, 8, 44, 1.4, flash ? '#3a4a48' : '#141c24', '#0a0e14');
      // Alia prisonnière, sans couleurs
      const cx = b.x + W * 0.24;
      drawAlia(c, cx, base - 14, 30, t * 0.4, { grey: true });
      cage(c, cx - 30, base - 64, 62, 52);
      morgor(c, b.x + W * 0.68, base - 10, 56, t);
      // pluie
      c.strokeStyle = 'rgba(170,190,255,.45)';
      c.lineWidth = 0.8;
      c.beginPath();
      for (let i = 0; i < 70; i++) {
        const px = b.x + ((i * 37 + t * 110) % (W + 20)) - 10;
        const py = b.y + ((i * 53 + t * 260) % b.h);
        c.moveTo(px, py);
        c.lineTo(px - 2, py + 7);
      }
      c.stroke();
      vignette(c, b, 0.45);
    },
  },
  {
    text: 'Il l’a enfermée dans son château, au fond du Volcan Noir, au centre du royaume.',
    paint(r, b, t) {
      const c = r.ctx;
      const W = b.w;
      const base = b.y + b.h;
      const cx = b.x + W / 2;
      sky(c, b, [[0, '#1a0810'], [0.45, '#5a1420'], [0.8, '#b83a1a'], [1, '#ff8a2a']]);
      // fumée
      for (let i = 0; i < 7; i++) {
        const k = (t * 0.12 + i / 7) % 1;
        cloud(c, cx - 18 + Math.sin(i * 2 + t * 0.5) * 16 * k, base - 88 - k * 60, 0.6 + k * 1.3, '#1a0c14', 0.55 * (1 - k));
      }
      // montagnes lointaines
      mountain(c, b.x + W * 0.12, base - 8, W * 0.34, 46, '#2a1420', '#1c0c16');
      mountain(c, b.x + W * 0.9, base - 8, W * 0.36, 52, '#2a1420', '#1c0c16');
      // le volcan
      glow(c, cx, base - 84, 70, 'rgba(255,120,30,.75)', 0.75 + Math.sin(t * 3) * 0.15);
      c.fillStyle = '#1e141c';
      c.beginPath();
      c.moveTo(cx - W * 0.42, base);
      c.quadraticCurveTo(cx - W * 0.16, base - 40, cx - 22, base - 84);
      c.lineTo(cx + 22, base - 84);
      c.quadraticCurveTo(cx + W * 0.16, base - 40, cx + W * 0.42, base);
      c.fill();
      c.fillStyle = '#2e2028';
      c.beginPath();
      c.moveTo(cx - W * 0.42, base);
      c.quadraticCurveTo(cx - W * 0.16, base - 40, cx - 22, base - 84);
      c.lineTo(cx - 6, base - 84);
      c.quadraticCurveTo(cx - W * 0.1, base - 40, cx - W * 0.2, base);
      c.fill();
      // coulées de lave
      [[-10, 0.9, 30], [9, 0.6, 22], [0, 1.2, 44]].forEach(([dx, wv, len], i) => {
        const g = c.createLinearGradient(0, base - 84, 0, base - 84 + len);
        g.addColorStop(0, '#fff2a0');
        g.addColorStop(0.4, '#ff8a2a');
        g.addColorStop(1, 'rgba(200,40,20,0)');
        c.strokeStyle = g;
        c.lineWidth = 3 - i * 0.5;
        c.lineCap = 'round';
        c.beginPath();
        c.moveTo(cx + dx, base - 84);
        c.quadraticCurveTo(cx + dx * 2.2 + Math.sin(t + i) * 2, base - 84 + len * 0.5, cx + dx * 3 * wv, base - 84 + len);
        c.stroke();
      });
      c.fillStyle = '#ffb03a';
      c.fillRect(cx - 22, base - 86, 44, 3);
      // le château de Morgor, sur le cratère
      const ky = base - 86;
      c.fillStyle = '#0c0812';
      c.fillRect(cx - 14, ky - 22, 28, 24);
      c.fillRect(cx - 21, ky - 34, 9, 36);
      c.fillRect(cx + 12, ky - 34, 9, 36);
      c.fillRect(cx - 4, ky - 42, 8, 22);
      [[cx - 16.5, ky - 34, 6], [cx + 16.5, ky - 34, 6], [cx, ky - 42, 5.5]].forEach(([px, py, w]) => {
        c.beginPath();
        c.moveTo(px - w, py);
        c.lineTo(px, py - w * 2.2);
        c.lineTo(px + w, py);
        c.fill();
      });
      const lit = 0.7 + Math.sin(t * 4) * 0.3;
      [[cx - 1.5, ky - 36], [cx - 18, ky - 24], [cx + 15, ky - 24], [cx - 8, ky - 12], [cx + 5, ky - 12]].forEach(([px, py]) => {
        glow(c, px + 1.5, py + 2, 7, 'rgba(255,170,60,.7)', lit);
        c.fillStyle = '#ffc860';
        c.fillRect(px, py, 3, 4);
      });
      // sol brûlé et braises
      c.fillStyle = '#120a10';
      c.fillRect(b.x, base - 7, W, 7);
      for (let x = 6; x < W; x += 22) {
        c.fillStyle = '#ff6a1a';
        c.fillRect(b.x + x + ((x * 7) % 9), base - 5, 8, 1.5);
      }
      for (let i = 0; i < 22; i++) {
        const k = (t * 0.25 + i * 0.137) % 1;
        c.fillStyle = i % 2 ? '#ffb03a' : '#ff6a1a';
        c.globalAlpha = 1 - k;
        c.beginPath();
        c.arc(b.x + ((i * 47) % W) + Math.sin(t + i) * 4, base - k * b.h * 0.9, 1.1, 0, TAU);
        c.fill();
      }
      c.globalAlpha = 1;
      vignette(c, b, 0.5);
    },
  },
  {
    text: 'Depuis, le royaume pâlit de jour en jour... À Prébois, l’Ancien du village t’appelle. Va vite le voir !',
    paint(r, b, t) {
      const c = r.ctx;
      const W = b.w;
      const base = b.y + b.h;
      sky(c, b, [[0, '#8e969e'], [0.7, '#b8c0c6'], [1, '#cfd5d8']]);
      cloud(c, b.x + ((t * 3 + W * 0.2) % (W + 80)) - 40, b.y + 22, 1, '#dfe3e6', 0.8);
      cloud(c, b.x + ((t * 2 + W * 0.7) % (W + 80)) - 40, b.y + 36, 0.7, '#dfe3e6', 0.7);
      mountain(c, b.x + W * 0.2, base - 30, W * 0.34, 56, '#8a9096', '#787e84', '#d8dcde');
      mountain(c, b.x + W * 0.8, base - 30, W * 0.3, 46, '#8a9096', '#787e84', '#d8dcde');
      hills(c, b, 36, 8, 48, 0.9, '#8c9a88', '#788674');
      tree(c, b.x + W * 0.08, base - 36, 15, '#8a9884', '#74826e');
      tree(c, b.x + W * 0.92, base - 34, 14, '#8a9884', '#74826e');
      hills(c, b, 18, 5, 36, 2.4, '#a0ae9a', '#8c9a88');
      cottage(c, b.x + W * 0.14, base - 20, 22, '#d2cec4', '#8f8580', false);
      cottage(c, b.x + W * 0.72, base - 16, 20, '#d2cec4', '#7f8894', false);
      // l'Ancien : la seule tache de couleur, avec sa lanterne
      const ex = b.x + W * 0.48;
      const ey = base - 10;
      glow(c, ex + 17, ey - 30, 34, 'rgba(255,220,120,.7)', 0.8 + Math.sin(t * 3) * 0.2);
      c.fillStyle = 'rgba(0,0,0,.2)';
      c.beginPath();
      c.ellipse(ex, ey, 15, 3, 0, 0, TAU);
      c.fill();
      c.fillStyle = '#5a3a8a';
      c.beginPath();
      c.moveTo(ex, ey - 46);
      c.bezierCurveTo(ex - 13, ey - 40, ex - 13, ey - 10, ex - 14, ey);
      c.lineTo(ex + 14, ey);
      c.bezierCurveTo(ex + 13, ey - 10, ex + 13, ey - 40, ex, ey - 46);
      c.fill();
      c.fillStyle = '#44286e';
      c.beginPath();
      c.moveTo(ex + 2, ey - 44);
      c.bezierCurveTo(ex + 13, ey - 38, ex + 13, ey - 10, ex + 14, ey);
      c.lineTo(ex + 4, ey);
      c.fill();
      c.fillStyle = '#5a3a8a';
      c.beginPath();
      c.ellipse(ex, ey - 44, 9, 10, 0, 0, TAU);
      c.fill();
      c.fillStyle = '#e8b88a';
      c.beginPath();
      c.ellipse(ex, ey - 42, 6, 6.5, 0, 0, TAU);
      c.fill();
      c.fillStyle = '#f2f2f2';
      c.beginPath();
      c.moveTo(ex - 6, ey - 40);
      c.quadraticCurveTo(ex, ey - 22, ex + 6, ey - 40);
      c.quadraticCurveTo(ex, ey - 36, ex - 6, ey - 40);
      c.fill();
      c.fillStyle = '#222';
      c.fillRect(ex - 3.2, ey - 44, 1.4, 1.6);
      c.fillRect(ex + 1.8, ey - 44, 1.4, 1.6);
      // bâton et lanterne
      c.strokeStyle = '#6b4423';
      c.lineWidth = 1.8;
      c.beginPath();
      c.moveTo(ex + 16, ey);
      c.lineTo(ex + 16, ey - 40);
      c.quadraticCurveTo(ex + 16, ey - 46, ex + 20, ey - 42);
      c.stroke();
      c.fillStyle = '#ffd35a';
      c.fillRect(ex + 17.5, ey - 40, 5, 7);
      c.fillStyle = '#fff6c0';
      c.fillRect(ex + 19, ey - 38.5, 2, 4);
      // il t'appelle
      const pop = Math.abs(Math.sin(t * 3));
      c.fillStyle = '#ffd35a';
      c.strokeStyle = '#3a2a10';
      c.lineWidth = 1;
      c.beginPath();
      c.roundRect(ex - 5, ey - 72 - pop * 3, 10, 14, 3);
      c.fill();
      c.stroke();
      c.fillStyle = '#3a2a10';
      c.fillRect(ex - 1, ey - 69 - pop * 3, 2, 6);
      c.fillRect(ex - 1, ey - 62 - pop * 3, 2, 2);
      vignette(c, b, 0.3);
    },
  },
];

// ------------------------------------------------------------------ la fin : 3 pages
export const END_STORY = [
  {
    text: 'Le Cœur d’Iris a vaincu Morgor ! Le Seigneur des Cendres s’enfuit pour toujours, et la cage d’Alia s’ouvre.',
    paint(r, b, t) {
      const c = r.ctx;
      const W = b.w;
      const base = b.y + b.h;
      sky(c, b, [[0, '#2a0c20'], [0.6, '#6a2030'], [1, '#c8603a']]);
      // un grand rayon arc-en-ciel qui traverse la scène
      c.globalAlpha = Math.min(1, t * 0.8);
      RAINBOW.forEach((col, i) => {
        c.fillStyle = col;
        c.fillRect(b.x, b.y + b.h * 0.3 + i * 4, W, 4);
      });
      c.globalAlpha = 1;
      // Morgor qui s'efface en fumée
      const fade = Math.max(0, 1 - t * 0.35);
      if (fade > 0) {
        c.globalAlpha = fade;
        morgor(c, b.x + W * 0.78, base - 12 - t * 6, 48, t);
        c.globalAlpha = 1;
      }
      for (let i = 0; i < 18; i++) {
        const k = (t * 0.3 + i / 18) % 1;
        cloud(c, b.x + W * 0.78 + Math.sin(i * 2.3) * 24 * k, base - 40 - k * 70, 0.3 + k * 0.6, '#3a2a3a', 0.5 * (1 - k));
      }
      c.fillStyle = '#1a0c14';
      c.fillRect(b.x, base - 10, W, 10);
      // Alia sort de la cage ouverte
      const cx = b.x + W * 0.3;
      const out = Math.min(1, t * 0.5);
      cage(c, cx - 34, base - 66 - out * 40, 62, 52);
      drawAlia(c, cx, base - 12, 30, t, { grey: false });
      for (let i = 0; i < 10; i++) {
        const a = t * 1.2 + (i * TAU) / 10;
        sparkle(c, cx + Math.cos(a) * 40, base - 40 + Math.sin(a) * 22, 2.2, RAINBOW[i % 6], 0.5 + 0.5 * Math.sin(t * 4 + i));
      }
      vignette(c, b, 0.4);
    },
  },
  {
    text: 'Alia s’envole au-dessus du royaume. Partout où elle passe, les couleurs reviennent !',
    paint(r, b, t) {
      const c = r.ctx;
      const W = b.w;
      const base = b.y + b.h;
      // le paysage reprend ses couleurs de gauche à droite, derrière Alia
      const k = Math.min(1, t * 0.22);
      const front = b.x + W * k * 1.1;
      const scene = (grey) => {
        sky(c, b, grey ? [[0, '#8e969e'], [1, '#cfd5d8']] : [[0, '#4aa8f0'], [0.6, '#a8dcff'], [1, '#e8f6ff']]);
        mountain(c, b.x + W * 0.2, base - 30, W * 0.34, 56, grey ? '#8a9096' : '#8a9ab8', grey ? '#787e84' : '#6f7f9e', grey ? '#d8dcde' : '#ffffff');
        mountain(c, b.x + W * 0.75, base - 30, W * 0.3, 46, grey ? '#8a9096' : '#96a6c2', grey ? '#787e84' : '#7888a6', grey ? '#d8dcde' : '#ffffff');
        hills(c, b, 36, 8, 48, 0.9, grey ? '#8c9a88' : '#58b04a', grey ? '#788674' : '#3f8f3c');
        [0.12, 0.42, 0.88].forEach((fx) => tree(c, b.x + W * fx, base - 36, 14, grey ? '#8a9884' : '#3f9a3c', grey ? '#74826e' : '#2a7030'));
        hills(c, b, 18, 5, 36, 2.4, grey ? '#a0ae9a' : '#78cc58', grey ? '#8c9a88' : '#58b04a');
        cottage(c, b.x + W * 0.3, base - 18, 18, grey ? '#d2cec4' : '#f4e6c8', grey ? '#8f8580' : '#c0573e', !grey);
        cottage(c, b.x + W * 0.66, base - 16, 16, grey ? '#d2cec4' : '#f4e6c8', grey ? '#7f8894' : '#3f6aa8', !grey);
      };
      scene(true);
      c.save();
      c.beginPath();
      c.rect(b.x, b.y, Math.max(0, front - b.x), b.h);
      c.clip();
      scene(false);
      c.restore();
      // l'arc-en-ciel laissé par Alia
      RAINBOW.forEach((col, i) => {
        c.strokeStyle = col;
        c.lineWidth = 3;
        c.beginPath();
        c.moveTo(b.x - 10, b.y + 70 + i * 3);
        c.quadraticCurveTo((b.x + front) / 2, b.y + 20 + i * 3, front, b.y + 40 + i * 3);
        c.stroke();
      });
      const ax = Math.min(front, b.x + W * 0.82);
      drawAlia(c, ax, b.y + 52 + Math.sin(t * 3) * 4, 30, t);
      for (let i = 0; i < 12; i++) sparkle(c, ax - 10 - i * 9, b.y + 46 + Math.sin(t * 5 + i) * 8, 2, RAINBOW[i % 6], 0.8 - i * 0.05);
    },
  },
  {
    text: 'À Prébois, c’est la fête ! Merci, héros du royaume d’Iris. Tu peux continuer à explorer le royaume.',
    paint(r, b, t) {
      const c = r.ctx;
      const W = b.w;
      const base = b.y + b.h;
      sky(c, b, [[0, '#1a1a4a'], [0.7, '#4a3a8a'], [1, '#8a5aa8']]);
      // feux d'artifice
      for (let f = 0; f < 4; f++) {
        const k = (t * 0.6 + f * 0.27) % 1;
        const fx = b.x + W * (0.18 + f * 0.22);
        const fy = b.y + 22 + (f % 2) * 14;
        for (let i = 0; i < 12; i++) {
          const a = (i * TAU) / 12;
          c.globalAlpha = 1 - k;
          c.fillStyle = RAINBOW[(i + f) % 6];
          c.beginPath();
          c.arc(fx + Math.cos(a) * k * 22, fy + Math.sin(a) * k * 22 + k * k * 6, 1.4, 0, TAU);
          c.fill();
        }
      }
      c.globalAlpha = 1;
      hills(c, b, 24, 6, 40, 1.4, '#3f8f3c', '#2a6a30');
      cottage(c, b.x + W * 0.16, base - 22, 22, '#f4e6c8', '#c0573e');
      cottage(c, b.x + W * 0.84, base - 20, 20, '#f4e6c8', '#3f6aa8');
      // guirlandes de lanternes
      c.strokeStyle = '#3a2a1a';
      c.lineWidth = 0.8;
      c.beginPath();
      c.moveTo(b.x + W * 0.16, base - 44);
      c.quadraticCurveTo(b.x + W / 2, base - 20, b.x + W * 0.84, base - 40);
      c.stroke();
      for (let i = 1; i < 10; i++) {
        const u = i / 10;
        const lx = b.x + W * (0.16 + 0.68 * u);
        const ly = base - 44 + (1 - (2 * u - 1) ** 2) * 12 + u * 4;
        glow(c, lx, ly, 6, 'rgba(255,220,120,.6)');
        c.fillStyle = RAINBOW[i % 6];
        c.fillRect(lx - 1.5, ly, 3, 4);
      }
      // Alia au milieu de la fête, et les habitants qui sautent de joie
      drawAlia(c, b.x + W / 2, base - 8 + Math.sin(t * 2) * 1.5, 34, t);
      for (let i = 0; i < 5; i++) {
        const px = b.x + W * (0.28 + i * 0.11) + (i > 1 ? 30 : -6);
        const jump = Math.abs(Math.sin(t * 4 + i)) * 4;
        c.fillStyle = ['#3fa34d', '#c0573e', '#3f6aa8', '#e8a020', '#a84a8a'][i];
        c.fillRect(px - 3, base - 14 - jump, 6, 8);
        c.fillStyle = '#f2c49b';
        c.beginPath();
        c.arc(px, base - 17 - jump, 3, 0, TAU);
        c.fill();
      }
      vignette(c, b, 0.3);
    },
  },
];
