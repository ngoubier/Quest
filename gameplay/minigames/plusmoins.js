// PLUS OU MOINS — logique pure.
// L'habitant pense à un nombre ; l'enfant propose, l'habitant répond « plus grand » ou « plus petit ».
// Avec la bonne méthode (couper l'intervalle en deux), on trouve toujours dans le nombre d'essais permis.

/** Selon l'âge : le plus grand nombre possible et le nombre d'essais. */
export const settingsForAge = (age = 8) => {
  const a = Math.max(6, Math.min(10, age));
  return [
    { max: 20, tries: 6 },
    { max: 30, tries: 6 },
    { max: 50, tries: 7 },
    { max: 100, tries: 8 },
    { max: 100, tries: 8 },
  ][a - 6];
};

/** Réponse de l'habitant : 'plus' (le nombre secret est plus grand), 'moins', ou 'gagne'. */
export function judge(secret, guess) {
  return guess === secret ? 'gagne' : guess < secret ? 'plus' : 'moins';
}

/** Nombre d'essais nécessaires au pire avec la bonne méthode (recherche par moitiés). */
export const bestTries = (max) => Math.ceil(Math.log2(max + 1));

/** Intervalle encore possible d'après les réponses déjà reçues : [min, max]. */
export function range(history, max) {
  let lo = 1;
  let hi = max;
  for (const { guess, answer } of history) {
    if (answer === 'plus') lo = Math.max(lo, guess + 1);
    else if (answer === 'moins') hi = Math.min(hi, guess - 1);
  }
  return [lo, hi];
}
