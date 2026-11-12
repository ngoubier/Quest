// INTERFACE DU ROYAUME D'IRIS — cadre en bois des fenêtres et polices.
// Le cadre est dessiné une fois (24 × 24 pixels de jeu, coins de 8) puis posé en 9 morceaux
// par engine/ui/panel.js : il s'adapte à toutes les tailles de fenêtres.
import { createCanvas } from '../../engine/index.js';

/** Police du texte (ronde et très lisible) et police des titres. Fichiers : game/fonts/ (licence OFL). */
export const FONT = "'Iris Nunito', 'Nunito', 'Trebuchet MS', system-ui, sans-serif";
export const TITLE_FONT = "'Iris Fredoka', 'Fredoka', 'Trebuchet MS', system-ui, sans-serif";

/** Déclare les polices du jeu (à appeler une fois, dans le navigateur) et commence à les charger. */
export function loadFonts(base = './fonts/') {
  if (typeof document === 'undefined') return Promise.resolve();
  const style = document.createElement('style');
  style.textContent = `
    @font-face{font-family:'Iris Nunito';src:url('${base}nunito-600.woff2') format('woff2');font-weight:400;font-display:swap}
    @font-face{font-family:'Iris Nunito';src:url('${base}nunito-800.woff2') format('woff2');font-weight:700;font-display:swap}
    @font-face{font-family:'Iris Fredoka';src:url('${base}fredoka-600.woff2') format('woff2');font-weight:400 700;font-display:swap}
  `;
  document.head.appendChild(style);
  return Promise.all(['8px', 'bold 8px'].map((w) => document.fonts.load(`${w} 'Iris Nunito'`)).concat(document.fonts.load("20px 'Iris Fredoka'"))).catch(() => {});
}

const C = 8; // taille d'un coin (pixels de jeu)
const S = C * 3;

/**
 * Cadre en bois : liseré sombre, planche (claire en haut à gauche, foncée en bas à droite),
 * coins en laiton cloués, intérieur brun foncé avec une ombre le long du bois.
 * @param {number} k  pixels d'image par pixel de jeu (2 = haute définition)
 */
export function makeWoodPanel(k = 1) {
  const canvas = createCanvas(S * k, S * k);
  const c = canvas?.getContext('2d');
  if (!c) return null;
  c.scale(k, k);
  const px = 1 / k;
  const R = (x, y, w, h, col) => ((c.fillStyle = col), c.fillRect(x, y, w, h));
  // intérieur
  R(0, 0, S, S, '#251912');
  // ombre intérieure, le long du bois (plus marquée en haut et à gauche : la lumière vient d'en haut)
  for (const [i, a] of [[5, 0.45], [6, 0.22], [7, 0.1]]) {
    R(i, i, S - 2 * i, 1, `rgba(0,0,0,${a})`);
    R(i, i + 1, 1, S - 2 * i - 1, `rgba(0,0,0,${a})`);
    R(i + 1, S - i - 1, S - 2 * i - 1, 1, `rgba(0,0,0,${a * 0.4})`);
    R(S - i - 1, i + 1, 1, S - 2 * i - 2, `rgba(0,0,0,${a * 0.4})`);
  }
  // planche : 4 rangées, du bord extérieur vers l'intérieur
  const ring = (i, top, left, bottom, right) => {
    R(i, i, S - 2 * i, 1, top);
    R(i, S - i - 1, S - 2 * i, 1, bottom);
    R(i, i + 1, 1, S - 2 * i - 2, left);
    R(S - i - 1, i + 1, 1, S - 2 * i - 2, right);
  };
  ring(0, '#1a0e06', '#1a0e06', '#1a0e06', '#1a0e06');
  ring(1, '#c48a50', '#b47c46', '#7a4c24', '#7a4c24');
  ring(2, '#9a6634', '#966232', '#82542a', '#86562a');
  ring(3, '#8a5a2c', '#865628', '#6e4420', '#724622');
  ring(4, '#5a3818', '#5a3818', '#4a2c12', '#4a2c12');
  ring(5, '#140a04', '#140a04', '#140a04', '#140a04');
  // veinures du bois (fines en haute définition)
  if (k > 1) {
    for (const [x, y, w] of [[3, 2.5, 4], [12, 3.5, 5], [17, 2.5, 3], [4, S - 3.5, 5], [13, S - 2.5, 4]]) R(x, y, w, px, 'rgba(60,30,10,.55)');
    for (const [x, y, h] of [[2.5, 4, 5], [3.5, 13, 4], [S - 3.5, 5, 4], [S - 2.5, 14, 5]]) R(x, y, px, h, 'rgba(60,30,10,.55)');
  }
  // coins arrondis : le pixel tout au coin est transparent
  for (const [x, y] of [[0, 0], [S - 1, 0], [0, S - 1], [S - 1, S - 1]]) c.clearRect(x, y, 1, 1);
  // coins en laiton, avec un clou
  for (const [x, y] of [[1, 1], [S - 6, 1], [1, S - 6], [S - 6, S - 6]]) {
    R(x, y, 5, 5, '#6a4a14');
    R(x, y, 4, 4, '#d8a840');
    R(x, y, 4, 1, '#ffe08a');
    R(x, y, 1, 4, '#f0c860');
    R(x + 1.5, y + 1.5, 1, 1, '#4a3008');
    if (k > 1) R(x + 1.5, y + 1.5, px, px, '#fff4c0');
  }
  return { image: canvas, corner: C, detail: k };
}
