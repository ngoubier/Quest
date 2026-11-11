// Textes à trous, résolus au moment de l'affichage :
//   {w:coin}        mot du thème au singulier  (ex. euro)
//   {ws:coin}       mot du thème au pluriel
//   {item:mushroom} nombre possédé
//   {counter:kills_blob}
//   {quizOk:histoire}  bonnes réponses dans une matière
//   {player}           prénom du joueur
//   {level:id}         difficulté d'une quête : « ★★☆ Moyenne »
export function formatText(text, { state, word, questLevel }) {
  return String(text).replace(/\{player\}/g, state.profile?.name ?? 'toi').replace(/\{(w|ws|item|counter|quizOk|level):([\w-]+)\}/g, (_, kind, key) => {
    if (kind === 'w') return word(key, false);
    if (kind === 'ws') return word(key, true);
    if (kind === 'item') return String(state.count(key));
    if (kind === 'level') return questLevel ? questLevel(key) : '';
    if (kind === 'quizOk') return String(state.quiz?.stats?.[key]?.ok ?? 0);
    return String(state.counter(key));
  });
}
