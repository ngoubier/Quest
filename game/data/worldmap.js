// LA CARTE DU ROYAUME D'IRIS — lieux, dessin du fond, et couleurs perdues du royaume.
import { createCanvas } from '../../engine/index.js';
import { STONE_COLORS } from '../themes.js';

export const STONES = ['givre', 'seve', 'aurore', 'temps', 'soleil', 'marees'];
const ALL_STONES = { all: STONES.map((k) => ({ item: `stone_${k}` })) };
const SOON = 'Ce lieu arrive bientôt : il est encore en construction !';

// Positions (0..1) sur l'image de la carte.
export const WORLD_NODES = [
  { id: 'prebois', label: 'Prébois', kind: 'start', x: 0.36, y: 0.83, color: '#ffd35a', open: null, mapId: 'overworld', at: [1, 6], facing: 'right', doneText: 'Ton village. Action : y aller' },
  { id: 'givre', label: '2 · Le Mont Givré (Pierre de Givre)', kind: 'stone', x: 0.5, y: 0.2, region: 'givre', open: null, mapId: 'givre', at: [19, 21], facing: 'up' },
  { id: 'seve', label: '3 · La Forêt des Murmures (Pierre de Sève)', kind: 'stone', x: 0.2, y: 0.32, region: 'seve', open: null, mapId: 'seve', at: [34, 22], facing: 'up' },
  { id: 'aurore', label: '4 · Bourg-Lanterne (Pierre d’Aurore)', kind: 'stone', x: 0.64, y: 0.82, region: 'aurore', open: null, mapId: 'aurore', at: [20, 22], facing: 'up' },
  { id: 'temps', label: '5 · Le Labyrinthe des Mille Portes (Pierre du Temps)', kind: 'stone', x: 0.79, y: 0.27, region: 'temps', open: null, mapId: 'temps', at: [20, 32], facing: 'up' },
  { id: 'soleil', label: '6 · Le Désert des Mirages (Pierre du Soleil)', kind: 'stone', x: 0.84, y: 0.6, region: 'soleil', open: null, mapId: 'soleil', at: [20, 22], facing: 'up' },
  { id: 'marees', label: '7 · Les Abysses de Corail (Pierre des Marées)', kind: 'stone', x: 0.15, y: 0.67, region: 'marees', open: 'never', closedText: SOON },
  { id: 'volcan', label: '8 · Le Volcan Noir (château de Morgor)', kind: 'final', x: 0.5, y: 0.47, color: '#ff5a1a', open: [ALL_STONES, 'never'], closedText: 'Fermé : il faut réunir les 6 pierres pour entrer.' },
].map((n) => (n.region ? { ...n, color: STONE_COLORS[n.region][0], done: { item: `stone_${n.region}` }, doneText: 'Pierre trouvée ✓' } : n));

/** Nombre de pierres trouvées. */
export const stoneCount = (state) => STONES.filter((k) => state.count(`stone_${k}`) > 0).length;

/**
 * Couleurs perdues (0 = normal, 1 = tout gris) pour la carte où se trouve le héros.
 * Prébois reprend des couleurs à chaque pierre ; une région les retrouve avec sa pierre.
 */
export function colorLoss(adv) {
  const st = adv.state;
  if (st.flag('alia_free')) return 0;
  const region = adv.mapDef.region;
  if (!region) return 0;
  if (region === 'prebois') return 0.6 * (1 - stoneCount(st) / 6);
  return st.count(`stone_${region}`) > 0 ? 0 : 0.6;
}

// ------------------------------------------------------------------ dessin du fond
const W = 128;
const H = 88;
const CELL = 2; // image de 256 x 176
const REGIONS = {
  prebois: { x: 0.37, y: 0.82, col: [124, 195, 90] },
  givre: { x: 0.5, y: 0.13, col: [236, 243, 251] },
  seve: { x: 0.2, y: 0.3, col: [63, 143, 58] },
  temps: { x: 0.8, y: 0.24, col: [138, 132, 170] },
  marees: { x: 0.14, y: 0.7, col: [63, 176, 200] },
  soleil: { x: 0.85, y: 0.62, col: [232, 200, 122] },
  aurore: { x: 0.63, y: 0.84, col: [168, 200, 106] },
};

function hash(x, y, s) {
  let h = (x * 374761393 + y * 668265263 + s * 982451653) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function vnoise(x, y, s) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const u = (x - xi) ** 2 * (3 - 2 * (x - xi));
  const v = (y - yi) ** 2 * (3 - 2 * (y - yi));
  const a = hash(xi, yi, s);
  const b = hash(xi + 1, yi, s);
  const c = hash(xi, yi + 1, s);
  const d = hash(xi + 1, yi + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, y, s) {
  let t = 0;
  let amp = 0.5;
  let f = 1;
  for (let i = 0; i < 4; i++) (t += amp * vnoise(x * f, y * f, s + i)), (amp /= 2), (f *= 2);
  return t;
}

let CELLS = null;
function cells() {
  if (CELLS) return CELLS;
  CELLS = [];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const nx = x / W;
      const ny = y / H;
      const dx = (nx - 0.5) / 0.47;
      const dy = (ny - 0.5) / 0.45;
      const edge = Math.hypot(dx, dy) + (fbm(nx * 5, ny * 5, 3) - 0.5) * 0.5;
      let reg = 'sea';
      if (edge < 1) {
        const wx = nx + (fbm(nx * 6, ny * 6, 11) - 0.5) * 0.16;
        const wy = ny + (fbm(nx * 6, ny * 6, 23) - 0.5) * 0.16;
        if (Math.hypot(wx - 0.5, (wy - 0.48) / 1.05) < 0.13) reg = 'volcan';
        else {
          let best = 9;
          for (const [k, r] of Object.entries(REGIONS)) {
            const d = Math.hypot(wx - r.x, (wy - r.y) * 1.1);
            if (d < best) (best = d), (reg = k);
          }
        }
      }
      CELLS.push({ reg, edge, n: fbm(nx * 18, ny * 18, 5), n2: hash(x, y, 77) });
    }
  }
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const c = CELLS[y * W + x];
      if (c.reg === 'sea') continue;
      c.coast = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => {
        const o = CELLS[(y + b) * W + x + a];
        return !o || o.reg === 'sea';
      });
    }
  }
  return CELLS;
}

const greyed = (rgb, k) => {
  const l = rgb[0] * 0.3 + rgb[1] * 0.59 + rgb[2] * 0.11;
  return rgb.map((v) => Math.round(v + (l * 0.82 + 20 - v) * k));
};

const cache = new Map();
function render(restored, preboisLoss) {
  const key = `${[...restored].sort().join(',')}|${preboisLoss.toFixed(2)}`;
  if (cache.has(key)) return cache.get(key);
  const cv = createCanvas(W * CELL, H * CELL);
  if (!cv) return null;
  const c = cv.getContext('2d');
  const loss = (reg) => (reg === 'sea' || reg === 'volcan' ? 0 : reg === 'prebois' ? preboisLoss : restored.has(reg) ? 0 : 0.85);
  cells().forEach((cell, i) => {
    const x = i % W;
    const y = Math.floor(i / W);
    const { reg, n, n2 } = cell;
    let rgb;
    if (reg === 'sea') rgb = n2 < 0.03 ? [120, 180, 230] : cell.edge < 1.08 ? [58, 134, 192] : [31, 95, 154];
    else if (reg === 'volcan') {
      const vd = Math.hypot(x / W - 0.5, (y / H - 0.48) * 0.95);
      rgb = vd < 0.035 ? [255, 120, 30] : vd < 0.06 ? [60, 40, 40] : [74, 58, 54];
      if (vd > 0.06 && Math.abs(Math.sin(Math.atan2(y / H - 0.48, x / W - 0.5) * 5 + n * 3)) < 0.1) rgb = [230, 90, 30];
    } else if (cell.coast && reg !== 'marees') rgb = reg === 'givre' ? [214, 228, 240] : [232, 214, 160];
    else {
      rgb = REGIONS[reg].col.map((v) => Math.min(255, Math.round(v * (0.9 + n * 0.2))));
      if (reg === 'seve' && n2 < 0.4) rgb = [36, 100, 40];
      if (reg === 'givre' && n2 < 0.12) rgb = [150, 165, 185];
      if (reg === 'soleil' && Math.sin(y * 1.6 + Math.sin(x * 0.5) * 2) > 0.8) rgb = [212, 172, 96];
      if (reg === 'temps' && ((x % 3 === 0 && hash(x, y >> 1, 3) < 0.6) || (y % 3 === 0 && hash(x >> 1, y, 4) < 0.6))) rgb = [86, 82, 120];
      if (reg === 'marees' && n2 < 0.05) rgb = [255, 122, 138];
      if (reg === 'prebois' && n2 < 0.08) rgb = [60, 140, 55];
      if (reg === 'aurore' && n2 < 0.08) rgb = [192, 87, 62];
    }
    const k = loss(reg);
    if (k > 0) rgb = greyed(rgb, k);
    c.fillStyle = `rgb(${rgb.join(',')})`;
    c.fillRect(x * CELL, y * CELL, CELL, CELL);
  });
  // routes depuis Prébois
  const px = (v) => v * W * CELL;
  const py = (v) => v * H * CELL;
  const ring = { givre: [0.5, 0.3], seve: [0.33, 0.4], temps: [0.67, 0.37], marees: [0.3, 0.6], soleil: [0.7, 0.58], aurore: [0.56, 0.68] };
  const start = WORLD_NODES[0];
  c.setLineDash([3, 3]);
  c.lineWidth = 1;
  for (const n of WORLD_NODES) {
    if (!n.region) continue;
    const [mx, my] = ring[n.region];
    c.strokeStyle = 'rgba(255,240,200,.85)';
    c.beginPath();
    c.moveTo(px(start.x), py(start.y));
    c.quadraticCurveTo(px(mx), py(my), px(n.x), py(n.y));
    c.stroke();
  }
  c.strokeStyle = 'rgba(255,120,60,.9)';
  c.beginPath();
  c.moveTo(px(start.x), py(start.y));
  c.quadraticCurveTo(px(0.44), py(0.64), px(0.5), py(0.53));
  c.stroke();
  c.setLineDash([]);
  // le volcan et le château de Morgor
  const vx = px(0.5);
  const vy = py(0.47);
  c.fillStyle = '#2a2024';
  c.beginPath();
  c.moveTo(vx - 20, vy + 12);
  c.lineTo(vx - 6, vy - 9);
  c.lineTo(vx + 6, vy - 9);
  c.lineTo(vx + 20, vy + 12);
  c.fill();
  c.fillStyle = '#ff6a1a';
  c.fillRect(vx - 6, vy - 10, 12, 2);
  c.fillStyle = '#1a1220';
  c.fillRect(vx - 5, vy - 3, 10, 8);
  c.fillRect(vx - 7, vy - 6, 3, 11);
  c.fillRect(vx + 4, vy - 6, 3, 11);
  c.fillStyle = '#ffb03a';
  c.fillRect(vx - 1, vy - 1, 2, 2);
  // les 6 emplacements de pierres autour du château
  STONES.forEach((k, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 3;
    const gx = Math.round(vx + Math.cos(a) * 15);
    const gy = Math.round(vy + 1 + Math.sin(a) * 13);
    c.fillStyle = restored.has(k) ? STONE_COLORS[k][0] : 'rgba(0,0,0,.6)';
    c.fillRect(gx - 1, gy - 1, 3, 3);
  });
  cache.set(key, cv);
  return cv;
}

/** Dessine la carte dans la zone `box` de l'écran. */
export function paintWorld(r, box, state) {
  const restored = new Set(STONES.filter((k) => state.count(`stone_${k}`) > 0));
  const preboisLoss = state.flag('alia_free') ? 0 : 0.6 * (1 - restored.size / 6);
  const cv = render(restored, preboisLoss);
  if (cv) r.image(cv, 0, 0, cv.width, cv.height, box.x, box.y, box.w, box.h);
}

export const WORLD_MAP = {
  title: 'Royaume d’Iris',
  when: 'world_open',
  // Pour essayer les niveaux sans refaire l'introduction : menu pause → « Débogage : oui » (ou adresse terminée par #essai).
  unlocked: (adv) => adv.game.debug.enabled || globalThis.location?.hash === '#essai',
  lockedText: 'La route du royaume... Sans la carte, tu te perdrais. Va d’abord voir l’Ancien.',
  nodes: WORLD_NODES,
  paint: paintWorld,
  currentNode: (adv) => WORLD_NODES.find((n) => n.mapId === adv.mapId || n.region === adv.mapDef.region)?.id ?? 'prebois',
};
