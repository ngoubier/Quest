// MEMORY — logique pure (testable sans navigateur).
// Des cartes face cachée, chaque image en deux exemplaires. À son tour, on retourne 2 cartes :
// une paire → on la garde et on rejoue ; sinon on les retourne et c'est à l'autre.
// L'habitant retient les cartes qu'il voit avec une probabilité `skill` (selon l'âge de l'enfant).

/** Paquet mélangé : `pairs` paires (valeurs 0..pairs-1). */
export function makeDeck(pairs = 6, rand = Math.random) {
  const deck = [];
  for (let k = 0; k < pairs; k++) deck.push(k, k);
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

/** Mémoire de l'habitant : case → image, pour les cartes vues et retenues. */
export function remember(memory, index, value, { skill = 0.6, rand = Math.random } = {}) {
  if (rand() < skill) memory.set(index, value);
}

/** Une paire connue parmi les cartes encore en jeu : [a, b] ou null. */
export function knownPair(memory, found) {
  const byValue = new Map();
  for (const [i, v] of memory) {
    if (found[i]) continue;
    if (byValue.has(v)) return [byValue.get(v), i];
    byValue.set(v, i);
  }
  return null;
}

const hiddenCards = (found, except = -1) => found.map((f, i) => (f || i === except ? -1 : i)).filter((i) => i >= 0);

/** Première carte retournée par l'habitant. */
export function aiFirst(found, memory, { rand = Math.random } = {}) {
  const pair = knownPair(memory, found);
  if (pair) return pair[0];
  // Une carte qu'il ne connaît pas (sinon n'importe laquelle).
  const unknown = hiddenCards(found).filter((i) => !memory.has(i));
  const pool = unknown.length ? unknown : hiddenCards(found);
  return pool[Math.floor(rand() * pool.length)];
}

/** Deuxième carte : la jumelle de la première s'il s'en souvient, sinon une autre au hasard. */
export function aiSecond(found, memory, first, value, { rand = Math.random } = {}) {
  for (const [i, v] of memory) if (i !== first && !found[i] && v === value) return i;
  const unknown = hiddenCards(found, first).filter((i) => !memory.has(i));
  const pool = unknown.length ? unknown : hiddenCards(found, first);
  return pool[Math.floor(rand() * pool.length)];
}

/** Résultat pour l'enfant : 'win' | 'lose' | 'draw'. */
export const result = (mine, theirs) => (mine > theirs ? 'win' : mine < theirs ? 'lose' : 'draw');
