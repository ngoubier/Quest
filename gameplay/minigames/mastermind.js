// CODE SECRET (genre Mastermind) — logique pure.
// L'habitant cache une suite de couleurs ; l'enfant propose, on lui dit combien sont
// « bien placées » (bonne couleur, bonne place) et « mal placées » (bonne couleur, mauvaise place).

/** Code au hasard : `length` couleurs parmi `colors` (une couleur peut revenir). */
export function makeCode(length = 3, colors = 4, rand = Math.random) {
  return Array.from({ length }, () => Math.floor(rand() * colors));
}

/** Compare une proposition au code : { exact, near }. */
export function score(code, guess) {
  let exact = 0;
  const restCode = [];
  const restGuess = [];
  code.forEach((c, i) => (c === guess[i] ? exact++ : (restCode.push(c), restGuess.push(guess[i]))));
  let near = 0;
  for (const g of restGuess) {
    const k = restCode.indexOf(g);
    if (k >= 0) (near++, restCode.splice(k, 1));
  }
  return { exact, near };
}

/** Réglages selon l'âge : moins de couleurs pour les plus jeunes. */
export const settingsForAge = (age = 8) => ({ length: 3, colors: age <= 7 ? 4 : 5, tries: 8 });
