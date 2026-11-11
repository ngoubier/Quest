// Textes à trous, résolus au moment de l'affichage :
//   {w:coin}        mot du thème au singulier  (rubis / crédit / euro)
//   {ws:coin}       mot du thème au pluriel
//   {item:mushroom} nombre possédé
//   {counter:kills_blob}
export function formatText(text, { state, word }) {
  return String(text).replace(/\{(w|ws|item|counter):([\w-]+)\}/g, (_, kind, key) => {
    if (kind === 'w') return word(key, false);
    if (kind === 'ws') return word(key, true);
    if (kind === 'item') return String(state.count(key));
    return String(state.counter(key));
  });
}
