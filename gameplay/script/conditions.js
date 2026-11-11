// LANGAGE DE CONDITIONS — décrit "quand" quelque chose est vrai, sous forme de données
// (donc écrivable à la main, sauvegardable, et plus tard éditable dans un outil).
//
//   'mon_flag'                              drapeau levé
//   { flag: 'x' }  { flag: 'x', is: false } drapeau levé / baissé
//   { item: 'key' } { item: 'mushroom', count: 3 }  posséder (au moins) n objets
//   { counter: 'kills_blob', gte: 3 }       compteur >= valeur
//   { quest: 'amulette', status: 'active' } statut de quête : none | active | done
//   { quest: 'amulette', step: 1 }          quête active ET à l'étape 1 (0 = première)
//   { hp: 2 }                               au moins 2 demi-cœurs
//   { all: [...] }  { any: [...] }  { not: cond }   combinaisons
//   [c1, c2]                                équivaut à { all: [c1, c2] }
//   null / undefined                        toujours vrai

export function check(cond, state) {
  if (cond == null) return true;
  if (Array.isArray(cond)) return cond.every((c) => check(c, state));
  if (typeof cond === 'string') return state.flag(cond);
  if ('all' in cond) return cond.all.every((c) => check(c, state));
  if ('any' in cond) return cond.any.some((c) => check(c, state));
  if ('not' in cond) return !check(cond.not, state);
  if ('flag' in cond) return state.flag(cond.flag) === (cond.is ?? true);
  if ('item' in cond) return state.count(cond.item) >= (cond.count ?? 1);
  if ('counter' in cond) return state.counter(cond.counter) >= (cond.gte ?? 1);
  if ('quest' in cond) {
    const st = state.questStatus(cond.quest);
    if ('step' in cond) return st === 'active' && state.quests[cond.quest].step === cond.step;
    return st === (cond.status ?? 'done');
  }
  if ('hp' in cond) return state.hp >= cond.hp;
  throw new Error(`Condition inconnue : ${JSON.stringify(cond)}`);
}
