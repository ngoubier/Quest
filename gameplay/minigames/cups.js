// LES 3 GOBELETS — logique pure.
// Une bille sous un gobelet ; les gobelets échangent leurs places ; l'enfant doit retrouver la bille.

/** Suite d'échanges : paires de places [a, b] différentes. */
export function makeSwaps(count, rand = Math.random, cups = 3) {
  const swaps = [];
  for (let k = 0; k < count; k++) {
    const a = Math.floor(rand() * cups);
    const b = (a + 1 + Math.floor(rand() * (cups - 1))) % cups;
    swaps.push([a, b]);
  }
  return swaps;
}

/** Place finale de la bille, partie de la place `start`. */
export function ballSlot(start, swaps) {
  let s = start;
  for (const [a, b] of swaps) s = s === a ? b : s === b ? a : s;
  return s;
}

/** Selon l'âge : nombre d'échanges et durée d'un échange (secondes). */
export const settingsForAge = (age = 8) => {
  const a = Math.max(6, Math.min(10, age));
  return { swaps: 3 + (a - 6), duration: 0.75 - (a - 6) * 0.08 };
};
