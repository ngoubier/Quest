// PUISSANCE 4 — logique pure (testable sans navigateur).
// Plateau : 6 lignes × 7 colonnes, tableau de 42 cases (ligne 0 en haut) : 'X' (enfant), 'O' (habitant) ou null.

export const COLS = 7;
export const ROWS = 6;
export const empty = () => Array(COLS * ROWS).fill(null);
const at = (b, r, c) => (r >= 0 && r < ROWS && c >= 0 && c < COLS ? b[r * COLS + c] : undefined);

/** Colonnes où l'on peut encore jouer. */
export const validCols = (b) => [...Array(COLS).keys()].filter((c) => !b[c]);

/** Ligne où tombe un jeton dans la colonne `c` (-1 si pleine). */
export function landingRow(b, c) {
  for (let r = ROWS - 1; r >= 0; r--) if (!b[r * COLS + c]) return r;
  return -1;
}

/** Joue dans la colonne : renvoie un nouveau plateau (ou null si la colonne est pleine). */
export function drop(b, c, who) {
  const r = landingRow(b, c);
  if (r < 0) return null;
  const n = [...b];
  n[r * COLS + c] = who;
  return n;
}

const DIRS = [[0, 1], [1, 0], [1, 1], [1, -1]];

/** Cases de la ligne de 4 gagnante (ou null). */
export function winningCells(b) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const v = at(b, r, c);
      if (!v) continue;
      for (const [dr, dc] of DIRS) {
        const cells = [0, 1, 2, 3].map((k) => [r + dr * k, c + dc * k]);
        if (cells.every(([y, x]) => at(b, y, x) === v)) return cells.map(([y, x]) => y * COLS + x);
      }
    }
  }
  return null;
}

/** 'X', 'O', 'draw' (plateau plein) ou null. */
export function winner(b) {
  const w = winningCells(b);
  if (w) return b[w[0]];
  return b.every(Boolean) ? 'draw' : null;
}

/** Note d'une position pour `me` : lignes de 2 et 3 ouvertes, centre. */
function score(b, me) {
  const other = me === 'X' ? 'O' : 'X';
  let s = 0;
  for (let r = 0; r < ROWS; r++) if (b[r * COLS + 3] === me) s += 3;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      for (const [dr, dc] of DIRS) {
        const win = [0, 1, 2, 3].map((k) => at(b, r + dr * k, c + dc * k));
        if (win.includes(undefined)) continue;
        const mine = win.filter((v) => v === me).length;
        const theirs = win.filter((v) => v === other).length;
        if (theirs === 0) s += [0, 1, 4, 20][mine] ?? 0;
        if (mine === 0) s -= [0, 1, 5, 40][theirs] ?? 0;
      }
    }
  }
  return s;
}

function negamax(b, who, depth, alpha, beta) {
  const w = winner(b);
  const other = who === 'X' ? 'O' : 'X';
  if (w === 'draw') return 0;
  if (w) return w === who ? 10000 + depth : -10000 - depth;
  if (depth === 0) return score(b, who);
  let best = -Infinity;
  for (const c of [3, 2, 4, 1, 5, 0, 6]) {
    const n = drop(b, c, who);
    if (!n) continue;
    best = Math.max(best, -negamax(n, other, depth - 1, -beta, -alpha));
    alpha = Math.max(alpha, best);
    if (alpha >= beta) break;
  }
  return best;
}

/** Meilleure colonne pour `me` (recherche sur `depth` coups). */
export function bestCol(b, me = 'O', depth = 4) {
  const other = me === 'X' ? 'O' : 'X';
  let best = -1;
  let bestScore = -Infinity;
  for (const c of [3, 2, 4, 1, 5, 0, 6]) {
    const n = drop(b, c, me);
    if (!n) continue;
    const s = -negamax(n, other, depth - 1, -Infinity, Infinity);
    if (s > bestScore) (bestScore = s), (best = c);
  }
  return best;
}

/**
 * Coup de l'habitant. `skill` (selon l'âge) : probabilité de bien réfléchir ;
 * sinon il joue au hasard (mais prend quand même une victoire évidente une fois sur deux).
 */
export function aiCol(b, { skill = 0.6, rand = Math.random, me = 'O' } = {}) {
  const cols = validCols(b);
  if (!cols.length) return -1;
  if (rand() < skill) return bestCol(b, me, skill > 0.8 ? 5 : 4);
  const win = cols.find((c) => winner(drop(b, c, me)) === me);
  if (win !== undefined && rand() < 0.5) return win;
  return cols[Math.floor(rand() * cols.length)];
}
