// Mathématiques : questions GÉNÉRÉES selon l'âge (infinies, jamais identiques).
// Repères : CP 6 ans, CE1 7 ans, CE2 8 ans, CM1 9 ans, CM2 10 ans.

const between = (rng, a, b) => a + Math.floor(rng() * (b - a + 1));
const fmt = (n) => String(n);
const tenths = (t) => `${Math.floor(t / 10)},${t % 10}`; // 38 -> "3,8"

/** Transforme une question à réponse numérique en QCM une fois sur deux. */
function finish(rng, prompt, answer, { image, accept, choiceRatio = 0.5, spread = 10, explain } = {}) {
  const q = { subject: 'maths', prompt, answer: fmt(answer), accept, image, explain };
  if (typeof answer === 'number' && rng() < choiceRatio) {
    const set = new Set([answer]);
    let guard = 0;
    while (set.size < 4 && guard++ < 50) {
      const d = between(rng, 1, spread) * (rng() < 0.5 ? -1 : 1);
      if (answer + d >= 0) set.add(answer + d);
    }
    q.type = 'choice';
    q.choices = [...set].map(fmt);
  } else q.type = 'text';
  q.id = `gen:maths:${prompt}`;
  return q;
}

const FRUITS = ['🍎', '🍌', '🍓', '🍐', '🍒', '⭐', '🐟', '🌸'];

const KINDS = {
  add10: (rng) => {
    const a = between(rng, 1, 9);
    const b = between(rng, 0, 10 - a);
    return finish(rng, `${a} + ${b} = ?`, a + b, { spread: 3 });
  },
  sub10: (rng) => {
    const a = between(rng, 2, 10);
    const b = between(rng, 0, a);
    return finish(rng, `${a} − ${b} = ?`, a - b, { spread: 3 });
  },
  count: (rng) => {
    const n = between(rng, 2, 9);
    const f = rng.pick(FRUITS);
    return finish(rng, `Combien y en a-t-il ?`, n, { image: f.repeat(n), spread: 2 });
  },
  compare20: (rng) => {
    const a = between(rng, 0, 20);
    let b = between(rng, 0, 20);
    if (b === a) b = (a + 3) % 21;
    return { id: `gen:maths:cmp${a}-${b}`, subject: 'maths', type: 'choice', prompt: 'Quel nombre est le plus grand ?', choices: [fmt(a), fmt(b)], answer: fmt(Math.max(a, b)) };
  },
  add100: (rng) => {
    const a = between(rng, 10, 80);
    const b = between(rng, 2, 99 - a);
    return finish(rng, `${a} + ${b} = ?`, a + b);
  },
  sub100: (rng) => {
    const a = between(rng, 20, 99);
    const b = between(rng, 2, a - 5);
    return finish(rng, `${a} − ${b} = ?`, a - b);
  },
  double: (rng) => {
    const n = between(rng, 2, 25);
    return finish(rng, `Quel est le double de ${n} ?`, 2 * n);
  },
  table2510: (rng) => {
    const a = rng.pick([2, 5, 10]);
    const b = between(rng, 1, 10);
    return finish(rng, `${a} × ${b} = ?`, a * b);
  },
  add1000: (rng) => {
    const a = between(rng, 100, 800);
    const b = between(rng, 10, 999 - a);
    return finish(rng, `${a} + ${b} = ?`, a + b, { spread: 100 });
  },
  table5: (rng) => {
    const a = between(rng, 2, 5);
    const b = between(rng, 2, 10);
    return finish(rng, `${a} × ${b} = ?`, a * b);
  },
  half: (rng) => {
    const n = 2 * between(rng, 1, 25);
    return finish(rng, `Quelle est la moitié de ${n} ?`, n / 2);
  },
  table9: (rng) => {
    const a = between(rng, 2, 9);
    const b = between(rng, 2, 9);
    return finish(rng, `${a} × ${b} = ?`, a * b);
  },
  div: (rng) => {
    const a = between(rng, 2, 9);
    const q = between(rng, 2, 9);
    return finish(rng, `${a * q} ÷ ${a} = ?`, q, { spread: 3 });
  },
  sub1000: (rng) => {
    const a = between(rng, 200, 999);
    const b = between(rng, 10, a - 50);
    return finish(rng, `${a} − ${b} = ?`, a - b, { spread: 100 });
  },
  quarter: (rng) => {
    const n = 4 * between(rng, 1, 10);
    return finish(rng, `Quel est le quart de ${n} ?`, n / 4, { spread: 3 });
  },
  bigMul: (rng) => {
    const a = between(rng, 11, 25);
    const b = between(rng, 2, 5);
    return finish(rng, `${a} × ${b} = ?`, a * b);
  },
  decimal: (rng) => {
    const a = between(rng, 11, 59);
    const b = between(rng, 11, 39);
    const q = { id: `gen:maths:dec${a}+${b}`, subject: 'maths', type: 'text', prompt: `${tenths(a)} + ${tenths(b)} = ?`, answer: tenths(a + b) };
    if ((a + b) % 10 === 0) q.accept = [String((a + b) / 10)];
    return q;
  },
};

// Problèmes : petites histoires à comprendre avant de calculer.
const NAMES = ['Léa', 'Tom', 'Inès', 'Hugo', 'Jade', 'Noah', 'Lina', 'Sami'];
const THINGS = [['billes', '🔵'], ['bonbons', '🍬'], ['pommes', '🍎'], ['cartes', '🃏'], ['fleurs', '🌸']];
KINDS.problemAdd = (rng) => {
  const n = rng.pick(NAMES);
  const [t] = rng.pick(THINGS);
  const a = between(rng, 3, 30);
  const b = between(rng, 2, 20);
  return finish(rng, `${n} a ${a} ${t}. On lui en donne ${b}. Combien en a-t-${n === 'Tom' || n === 'Hugo' || n === 'Noah' || n === 'Sami' ? 'il' : 'elle'} maintenant ?`, a + b);
};
KINDS.problemSub = (rng) => {
  const n = rng.pick(NAMES);
  const [t] = rng.pick(THINGS);
  const a = between(rng, 10, 40);
  const b = between(rng, 2, a - 2);
  const pr = n === 'Tom' || n === 'Hugo' || n === 'Noah' || n === 'Sami' ? 'il' : 'elle';
  return finish(rng, `${n} a ${a} ${t}. ${pr === 'il' ? 'Il' : 'Elle'} en perd ${b}. Combien lui en reste-t-il ?`, a - b);
};
KINDS.problemMul = (rng) => {
  const boxes = between(rng, 2, 9);
  const per = between(rng, 2, 9);
  const [t] = rng.pick(THINGS);
  return finish(rng, `Il y a ${boxes} sacs de ${per} ${t}. Combien de ${t} en tout ?`, boxes * per);
};
KINDS.problemShare = (rng) => {
  const kids = between(rng, 2, 6);
  const per = between(rng, 2, 8);
  const [t] = rng.pick(THINGS);
  return finish(rng, `On partage ${kids * per} ${t} entre ${kids} enfants. Combien chacun en reçoit-il ?`, per, { spread: 3 });
};

const BY_AGE = {
  6: ['add10', 'sub10', 'count', 'compare20'],
  7: ['add100', 'sub100', 'double', 'table2510', 'count', 'problemAdd'],
  8: ['add1000', 'sub100', 'table5', 'half', 'double', 'problemAdd', 'problemSub'],
  9: ['table9', 'add1000', 'sub1000', 'div', 'half', 'problemSub', 'problemMul'],
  10: ['table9', 'div', 'decimal', 'quarter', 'bigMul', 'sub1000', 'problemMul', 'problemShare'],
};

export const MATHS_GENERATOR = {
  subject: 'maths',
  ages: [6, 10],
  make(rng, age) {
    const kinds = BY_AGE[Math.max(6, Math.min(10, age))];
    return KINDS[rng.pick(kinds)](rng);
  },
};
