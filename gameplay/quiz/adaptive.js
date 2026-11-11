// Choix de la matière par le jeu : on fait varier les matières, en insistant
// sur celles qui sont les moins pratiquées et les moins réussies.
//
// poids = 1 (base)
//       + 2 × (1 − taux de réussite)          plus on se trompe, plus elle revient
//       + 1 si la matière n'a presque pas été pratiquée
//       × 0,3 si c'était la matière de la dernière série (variété)

export function chooseSubject({ subjects, stats = {}, last = null, rng = Math.random }) {
  if (!subjects.length) return null;
  const weights = subjects.map((s) => {
    const st = stats[s] ?? { ok: 0, total: 0 };
    const rate = st.total ? st.ok / st.total : 0.5;
    let w = 1 + 2 * (1 - rate) + (st.total < 3 ? 1 : 0);
    if (s === last) w *= 0.3;
    return w;
  });
  const sum = weights.reduce((a, b) => a + b, 0);
  let roll = rng() * sum;
  for (let i = 0; i < subjects.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return subjects[i];
  }
  return subjects[subjects.length - 1];
}
