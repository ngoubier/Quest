// LE DERNIER GLAÇON (jeu de Nim) — logique pure.
// Un tas de glaçons ; chacun en prend 1, 2 ou 3 à son tour ; celui qui prend le DERNIER a perdu.

export const MAX_TAKE = 3;

/** Meilleur nombre à prendre quand il reste `n` glaçons (laisser 1, 5, 9, 13... à l'autre). */
export function bestTake(n) {
  for (let k = 1; k <= Math.min(MAX_TAKE, n - 1); k++) if ((n - k) % 4 === 1) return k;
  return 1; // position perdante (ou dernier glaçon) : on en prend un seul
}

/** La position est-elle perdante pour celui qui doit jouer (si l'autre joue parfaitement) ? */
export const isLosing = (n) => n % 4 === 1;

/** Nombre de glaçons pris par l'habitant. `skill` : probabilité de bien jouer. */
export function aiTake(n, { skill = 0.6, rand = Math.random } = {}) {
  if (n <= 1) return 1;
  if (rand() < skill) return bestTake(n);
  return 1 + Math.floor(rand() * Math.min(MAX_TAKE, n - 1));
}
