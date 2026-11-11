// MORPION — logique pure (testable sans navigateur).
// Plateau : tableau de 9 cases, valeurs 'X' (enfant), 'O' (habitant) ou null.

export const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

/** 'X', 'O', 'draw' (plateau plein) ou null (partie en cours). */
export function winner(b) {
  for (const [a, c, d] of LINES) if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
  return b.every(Boolean) ? 'draw' : null;
}

/** Ligne gagnante (pour la surligner), ou null. */
export function winningLine(b) {
  return LINES.find(([a, c, d]) => b[a] && b[a] === b[c] && b[a] === b[d]) ?? null;
}

const free = (b) => b.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);

function minimax(b, me, turn, depth) {
  const w = winner(b);
  if (w === me) return 10 - depth;
  if (w === 'draw') return 0;
  if (w) return depth - 10;
  const other = turn === 'X' ? 'O' : 'X';
  const scores = free(b).map((i) => {
    b[i] = turn;
    const s = minimax(b, me, other, depth + 1);
    b[i] = null;
    return s;
  });
  return turn === me ? Math.max(...scores) : Math.min(...scores);
}

/** Meilleur coup pour `me` (jeu parfait). Parmi les coups égaux, le premier. */
export function bestMove(board, me = 'O') {
  const b = [...board];
  const other = me === 'X' ? 'O' : 'X';
  let best = -1;
  let bestScore = -Infinity;
  for (const i of free(b)) {
    b[i] = me;
    const s = minimax(b, me, other, 1);
    b[i] = null;
    if (s > bestScore) (bestScore = s), (best = i);
  }
  return best;
}

/**
 * Force de l'habitant selon l'âge : probabilité de jouer le meilleur coup
 * (sinon il joue au hasard). À 6 ans il se trompe souvent, à 10 ans presque jamais.
 */
export function skillForAge(age = 8) {
  return { 6: 0.3, 7: 0.45, 8: 0.6, 9: 0.75, 10: 0.88 }[Math.max(6, Math.min(10, age))];
}

/** Coup de l'habitant. `rand` : générateur (0..1) remplaçable pour les tests. */
export function aiMove(board, { skill = 0.6, rand = Math.random, me = 'O' } = {}) {
  const options = free(board);
  if (!options.length) return -1;
  if (rand() < skill) return bestMove(board, me);
  return options[Math.floor(rand() * options.length)];
}
