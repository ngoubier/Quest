import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState, runActions, QuestSystem, chooseSubject, buildReport, check, formatDuration } from '../gameplay/index.js';
import { createRng } from '../engine/index.js';
import { MAPS, LEGEND, QUESTS } from '../demos/02-gameplay/world.js';

function ctxFor(state, quizResult, pick = 0) {
  const log = [];
  return {
    state,
    log,
    speaker: 'Prof',
    say: (t, { onClose } = {}) => (log.push(['say', t]), onClose?.()),
    ask: (q, { choices }) => (log.push(['ask', q]), choices[pick].onSelect()),
    toast: (t) => log.push(['toast', t]),
    collect: (item, n) => state.give(item, n),
    announce: (item, n, next) => next(),
    quiz: (spec, done) => (log.push(['quiz', spec.subject ?? '?']), done(quizResult)),
  };
}

test('Échec aux questions : il faut attendre, ou payer pour réessayer', () => {
  const s = new GameState();
  s.give('coin', 10);
  const fail = { correct: 1, total: 3, results: [] };
  const action = [{ quiz: { id: 'prof', count: 3, cooldown: 60, retryPrice: 5 }, success: [{ setFlag: 'ok' }], failure: [{ setFlag: 'ko' }] }];
  runActions(action, ctxFor(s, fail));
  assert.ok(s.flag('ko'));
  assert.equal(s.cooldownLeft('quiz:prof'), 60);

  // Pendant l'attente : choix « Attendre » (2e choix) => pas de quiz.
  const c1 = ctxFor(s, fail, 1);
  runActions(action, c1);
  assert.ok(!c1.log.some((l) => l[0] === 'quiz'));
  // Choix « Payer » => 5 pièces, quiz relancé.
  const c2 = ctxFor(s, { correct: 3, total: 3, results: [] }, 0);
  runActions(action, c2);
  assert.equal(s.count('coin'), 5);
  assert.ok(s.flag('ok'));

  // Le temps de jeu passe : plus d'attente.
  s.setCooldown('quiz:prof', 60);
  s.playTime += 61;
  assert.equal(s.cooldownLeft('quiz:prof'), 0);
  assert.equal(formatDuration(75), '2 min');
});

test('Le jeu choisit la matière : variété et insistance sur les points faibles', () => {
  const rng = createRng(7);
  const stats = { maths: { ok: 20, total: 20 }, francais: { ok: 2, total: 20 } };
  const count = { maths: 0, francais: 0 };
  for (let i = 0; i < 1000; i++) count[chooseSubject({ subjects: ['maths', 'francais'], stats, rng })]++;
  assert.ok(count.francais > count.maths * 2, JSON.stringify(count));
  // Jamais deux fois la même matière ? Non, mais beaucoup moins souvent.
  let same = 0;
  for (let i = 0; i < 1000; i++) if (chooseSubject({ subjects: ['maths', 'francais'], stats: {}, last: 'maths', rng }) === 'maths') same++;
  assert.ok(same < 350, `répétitions : ${same}`);
});

test('Indices : révélés un par un, remis à zéro à l’étape suivante', () => {
  const s = new GameState();
  const qs = new QuestSystem(ctxFor(s), [
    { id: 'q', title: 'Q', steps: [{ goal: 'A', done: 'a', hints: ['h1', 'h2'] }, { goal: 'B', done: 'b', hints: ['h3'] }] },
  ]);
  qs.start('q');
  assert.equal(qs.revealHint('q'), 'h1');
  assert.equal(qs.revealHint('q'), 'h2');
  assert.equal(qs.revealHint('q'), null, 'plus d’indice');
  assert.deepEqual(qs.journal()[0].hints, ['h1', 'h2']);
  s.setFlag('a');
  assert.deepEqual(qs.revealedHints('q'), []);
  assert.equal(qs.revealHint('q'), 'h3');
  assert.equal(s.counter('hints_used'), 3);
});

test('Embranchement : l’objectif affiché suit le choix du joueur', () => {
  const s = new GameState();
  const qs = new QuestSystem(ctxFor(s), [
    { id: 'q', title: 'Q', steps: [{ goal: [{ when: 'voie_a', text: 'Voie A' }, { text: 'Choisir' }], done: { any: ['fin_a', 'fin_b'] } }] },
  ]);
  qs.start('q');
  assert.equal(qs.journal()[0].goal, 'Choisir');
  s.setFlag('voie_a');
  assert.equal(qs.journal()[0].goal, 'Voie A');
  s.setFlag('fin_a');
  assert.equal(qs.status('q'), 'done');
});

test('Paliers de maîtrise et bilan parents', () => {
  const s = new GameState();
  s.recordQuiz([
    { id: 'h1', subject: 'histoire', ok: true, prompt: 'P1', answer: 'A1' },
    { id: 'h2', subject: 'histoire', ok: true, prompt: 'P2', answer: 'A2' },
    { id: 'm1', subject: 'maths', ok: false, prompt: '2 + 2', answer: '4' },
    { id: 'm2', subject: 'maths', ok: false, prompt: '3 × 3', answer: '9' },
    { id: 'm3', subject: 'maths', ok: true, prompt: '1 + 1', answer: '2' },
    { id: 'h3', subject: 'histoire', ok: false, prompt: 'P3', answer: 'A3' },
  ]);
  s.recordQuiz([{ id: 'm1', subject: 'maths', ok: true, prompt: '2 + 2', answer: '4' }]); // erreur corrigée
  assert.ok(check({ quizOk: 'histoire', gte: 2 }, s));
  assert.ok(!check({ quizOk: 'histoire', gte: 3 }, s));
  assert.ok(check({ quizOk: '*', gte: 4 }, s));
  s.playTime = 1500;
  const rep = buildReport(s, { questDefs: QUESTS });
  assert.equal(rep.total, 7);
  assert.equal(rep.ok, 4);
  assert.equal(rep.fixed, 1);
  assert.deepEqual(rep.missed.map((m) => m.prompt).sort(), ['3 × 3', 'P3']);
  assert.equal(rep.strongest.id, 'histoire');
  assert.equal(rep.weakest.id, 'maths');
  assert.equal(rep.questsTotal, QUESTS.length);
});

test('Essai : le pont est obligatoire pour atteindre la grotte', () => {
  const m = MAPS.overworld;
  const ts = m.rows.map((r) => [...r]);
  const door = (() => {
    for (let y = 0; y < ts.length; y++) for (let x = 0; x < ts[y].length; x++) if (ts[y][x] === 'D') return [x, y];
  })();
  const start = (() => {
    for (let y = 0; y < ts.length; y++) for (let x = 0; x < ts[y].length; x++) if (ts[y][x] === 'P') return [x, y];
  })();
  const solidTile = new Set(['wall', 'water', 'obstacle']);
  const walkable = (ch, bridge) => {
    if (ch === 'X') return bridge;
    if (ch === 'D') return true;
    const l = LEGEND[ch];
    if (l) return !solidTile.has(typeof l === 'string' ? l : l.tile);
    const o = m.objects[ch];
    return !['npc', 'sign', 'gate', 'lever', 'locked', 'chest'].includes(o.type) && (o.tile ?? 'floor') !== 'bush';
  };
  const reach = (bridge) => {
    const seen = new Set([start.join()]);
    const todo = [start];
    while (todo.length) {
      const [x, y] = todo.pop();
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx;
        const ny = y + dy;
        const k = `${nx},${ny}`;
        if (seen.has(k) || !ts[ny]?.[nx] || !walkable(ts[ny][nx], bridge)) continue;
        seen.add(k);
        todo.push([nx, ny]);
      }
    }
    return seen.has(door.join());
  };
  assert.equal(reach(false), false, 'sans pont, la grotte est inaccessible');
  assert.equal(reach(true), true, 'avec le pont, elle est accessible');
});
