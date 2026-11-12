// OUTILS DE DESSIN LISSE — pour les grandes images (histoire en images) et les dessins détaillés du jeu (PC).
// Une créature se dessine dans un repère de 32 × 32 unités (comme son image pixel), le sol en y = 30 :
// `unit(c, x, y, s, fn)` place ce repère avec le sol en (x, y) et une taille de `s` pixels pour 32 unités.
// La même fonction de dessin sert donc pour un sprite de 32 px (PC) comme pour un portrait de 120 px.

export const TAU = Math.PI * 2;

/** Place le repère 32 × 32 (sol en y = 30) : (x, y) = le sol sous la créature, s = taille de 32 unités. */
export function unit(c, x, y, s, fn) {
  c.save();
  c.translate(x - s / 2, y - (s * 30) / 32);
  c.scale(s / 32, s / 32);
  c.lineCap = 'round';
  c.lineJoin = 'round';
  fn(c);
  c.restore();
}

/** Remplissage : couleur, ou dégradé vertical [haut, bas] entre y0 et y1. */
export function fillOf(c, col, y0 = 0, y1 = 32) {
  if (!Array.isArray(col)) return col;
  const g = c.createLinearGradient(0, y0, 0, y1);
  col.forEach((k, i) => g.addColorStop(i / (col.length - 1), k));
  return g;
}

/** Dégradé rond : clair au point (x, y), foncé au bord. */
export function radial(c, x, y, r, stops) {
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  stops.forEach((k, i) => g.addColorStop(i / (stops.length - 1), k));
  return g;
}

export function ell(c, x, y, rx, ry, col, rot = 0) {
  c.fillStyle = col;
  c.beginPath();
  c.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rot, 0, TAU);
  c.fill();
}

/** Forme pleine : liste de points [x, y] (lignes droites) ou fonction qui trace le chemin. */
export function shape(c, col, path) {
  c.fillStyle = col;
  c.beginPath();
  if (typeof path === 'function') path(c);
  else path.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.closePath();
  c.fill();
}

/** Trait : liste de points (passe par des courbes douces) ou fonction. */
export function line(c, col, w, path) {
  c.strokeStyle = col;
  c.lineWidth = w;
  c.beginPath();
  if (typeof path === 'function') path(c);
  else if (path.length === 2) (c.moveTo(...path[0]), c.lineTo(...path[1]));
  else {
    c.moveTo(...path[0]);
    for (let i = 1; i < path.length - 1; i++) {
      const [x, y] = path[i];
      const [nx, ny] = path[i + 1];
      c.quadraticCurveTo(x, y, i === path.length - 2 ? nx : (x + nx) / 2, i === path.length - 2 ? ny : (y + ny) / 2);
    }
  }
  c.stroke();
}

/** Ombre au sol (y = 30). */
export function groundShadow(c, x, rx, alpha = 0.3) {
  ell(c, x, 30, rx, rx * 0.16, `rgba(0,0,0,${alpha})`);
}

/** Halo lumineux. */
export function halo(c, x, y, r, col, alpha = 1) {
  c.globalAlpha = alpha;
  c.fillStyle = radial(c, x, y, r, [col, 'rgba(0,0,0,0)']);
  c.fillRect(x - r, y - r, r * 2, r * 2);
  c.globalAlpha = 1;
}

/** Étincelle à 4 branches. */
export function twinkle(c, x, y, s, col, alpha = 1) {
  c.globalAlpha = Math.max(0, Math.min(1, alpha));
  shape(c, col, (k) => {
    k.moveTo(x, y - s);
    k.quadraticCurveTo(x, y, x + s, y);
    k.quadraticCurveTo(x, y, x, y + s);
    k.quadraticCurveTo(x, y, x - s, y);
    k.quadraticCurveTo(x, y, x, y - s);
  });
  c.globalAlpha = 1;
}

/** Œil : blanc, iris, pupille, reflet. `angry` : paupière en biais (-1 œil gauche, 1 œil droit). */
export function eye(c, x, y, r, { iris = '#141414', white = '#ffffff', pupil = '#141414', angry = 0, lid = '#000000', slit = false } = {}) {
  ell(c, x, y, r, r * 0.9, white);
  ell(c, x, y + r * 0.05, r * 0.62, r * 0.62, iris);
  if (slit) ell(c, x, y + r * 0.05, r * 0.16, r * 0.55, pupil);
  else ell(c, x, y + r * 0.08, r * 0.34, r * 0.34, pupil);
  ell(c, x - r * 0.25, y - r * 0.25, r * 0.2, r * 0.2, 'rgba(255,255,255,.9)');
  if (angry) shape(c, lid, [[x - r * 1.2, y - r * (angry < 0 ? 1.3 : 0.2)], [x + r * 1.2, y - r * (angry < 0 ? 0.2 : 1.3)], [x + r * 1.2, y - r * 1.5], [x - r * 1.2, y - r * 1.5]]);
}

/** Enlève les couleurs d'une zone (0 = rien, 1 = tout gris). */
export function desaturate(c, b, amount) {
  if (amount <= 0) return;
  c.save();
  c.globalCompositeOperation = 'saturation';
  c.globalAlpha = Math.min(1, amount);
  c.fillStyle = '#808080';
  c.fillRect(b.x, b.y, b.w, b.h);
  c.restore();
}
