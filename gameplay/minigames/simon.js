// LE CHANT DES COQUILLAGES (genre Simon) — logique pure.
// L'habitante joue une suite de coquillages ; l'enfant la répète ; à chaque manche, un coquillage de plus.

/** Ajoute un coquillage (0..n-1) au hasard à la suite. */
export const extend = (seq, rand = Math.random, n = 4) => [...seq, Math.floor(rand() * n)];

/** Vérifie la saisie : 'wrong' (erreur), 'more' (continuer), 'round' (manche réussie). */
export function check(seq, inputs) {
  for (let i = 0; i < inputs.length; i++) if (inputs[i] !== seq[i]) return 'wrong';
  return inputs.length === seq.length ? 'round' : 'more';
}

/** Longueur à atteindre pour gagner, selon l'âge. */
export const targetForAge = (age = 8) => ({ 6: 4, 7: 4, 8: 5, 9: 5, 10: 6 })[Math.max(6, Math.min(10, age))];
