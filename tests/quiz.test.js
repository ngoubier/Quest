import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkAnswer, normalize, parseNumber, QuestionBank, GameState, runActions, createRngForTests } from './helpers.js';
import { frenchSchoolBank, QUESTIONS_FR, MATHS_GENERATOR } from '../content/quiz/index.js';

test('Réponses : tolérance sur la forme, pas sur le fond', () => {
  const img = { type: 'text', answer: 'éléphant', image: '🐘' };
  assert.ok(checkAnswer(img, 'Éléphant'));
  assert.ok(checkAnswer(img, '  un elephant '), 'article + accent oublié');
  assert.ok(checkAnswer(img, "l'éléphant"));
  assert.ok(!checkAnswer(img, 'elefant'));
  const conj = { type: 'text', answer: 'avons mangé', strictAccents: true };
  assert.ok(checkAnswer(conj, 'Avons mangé'));
  assert.ok(!checkAnswer(conj, 'avons mange'), 'en conjugaison, l’accent compte');
  assert.ok(checkAnswer({ type: 'text', answer: '3,8' }, '3.8'));
  assert.ok(checkAnswer({ type: 'text', answer: '1000' }, '1 000'));
  assert.ok(checkAnswer({ type: 'choice', answer: 'a', choices: ['a', 'à'] }, 'a'));
  assert.ok(!checkAnswer({ type: 'choice', answer: 'a', choices: ['a', 'à'] }, 'à'));
  assert.ok(!checkAnswer({ type: 'text', answer: 'chat' }, null));
  assert.equal(normalize('  Le  Mont Blanc ! ', { articles: true }), 'mont blanc');
  // Réponses numériques : par valeur, unité tolérée.
  assert.ok(checkAnswer({ type: 'text', answer: '3,70' }, '3,7 €'));
  assert.ok(checkAnswer({ type: 'text', answer: '3,70' }, '3.70 euros'));
  assert.ok(checkAnswer({ type: 'text', answer: '16' }, '16 cm'));
  assert.ok(!checkAnswer({ type: 'text', answer: '16' }, '61'));
});

test('Banque : toutes les questions sont valides et chaque âge a de quoi jouer', () => {
  const bank = frenchSchoolBank(); // lève une erreur si une question est mal formée
  assert.ok(QUESTIONS_FR.length >= 100);
  const all = bank.questions;
  assert.ok(all.length >= 700, 'une grande banque, pour éviter les répétitions');
  const ids = new Set(all.map((q) => q.id));
  assert.equal(ids.size, all.length, 'identifiants uniques');
  for (const q of all) if (q.type === 'choice') assert.equal(new Set(q.choices).size, q.choices.length, `choix en double : ${q.id}`);
  // Chaque matière a assez de questions à chaque âge.
  for (let age = 6; age <= 10; age++) {
    for (const [subject, min] of Object.entries({ francais: 60, histoire: 10, geographie: 10, sciences: 15, anglais: 15, quotidien: 20, dictee: 20 })) {
      const n = all.filter((q) => q.subject === subject && age >= q.ages[0] && age <= q.ages[1]).length;
      assert.ok(n >= min, `${subject} à ${age} ans : ${n} questions`);
    }
  }
  // Le temps qui passe (jours, mois, saisons) est en Vie quotidienne, pas en Histoire.
  for (const q of all) if (q.subject === 'histoire') assert.ok(!/\b(jours?|mois|saisons?|semaine)\b/i.test(q.prompt) || /fête|célèbre/i.test(q.prompt), `mal rangée en histoire : ${q.prompt}`);
  for (let age = 6; age <= 10; age++) {
    for (const subject of ['maths', 'francais', 'histoire', 'geographie', 'sciences']) {
      const qs = bank.pick({ age, subject, count: 3 });
      assert.ok(qs.length >= 1, `${age} ans / ${subject}`);
      for (const q of qs) assert.equal(q.subject, subject);
    }
  }
});

test('Banque : évite les questions déjà vues', () => {
  const bank = new QuestionBank({
    questions: [1, 2, 3, 4].map((i) => ({ id: `q${i}`, subject: 'x', ages: [8, 8], prompt: `Q${i}`, answer: 'a' })),
  });
  const qs = bank.pick({ age: 8, count: 2, seen: ['q1', 'q2'], rng: createRngForTests(3) });
  assert.deepEqual(qs.map((q) => q.id).sort(), ['q3', 'q4']);
});

test('Maths générées : la réponse attendue est juste (vérifiée par calcul)', () => {
  const rng = createRngForTests(42);
  for (let age = 6; age <= 10; age++) {
    for (let i = 0; i < 300; i++) {
      const q = MATHS_GENERATOR.make(rng, age);
      if (q.type === 'choice') assert.ok(q.choices.includes(q.answer), q.prompt);
      const m = q.prompt.match(/^([\d,]+) ([+−×÷]) ([\d,]+) = \?$/);
      if (m) {
        const n = (s) => Number(s.replace(',', '.'));
        const [a, b] = [n(m[1]), n(m[3])];
        const r = { '+': a + b, '−': a - b, '×': a * b, '÷': a / b }[m[2]];
        assert.ok(Math.abs(r - n(q.answer)) < 1e-9, `${q.prompt} → ${q.answer}`);
        assert.ok(r >= 0 && Number.isFinite(r));
      }
      const half = q.prompt.match(/moitié de (\d+)/);
      if (half) assert.equal(Number(q.answer), Number(half[1]) / 2);
      if (typeof q.image === 'string') assert.equal([...q.image].length, Number(q.answer));
      if (q.image?.money && q.prompt.startsWith('Combien d’euros')) {
        const cents = q.image.money.reduce((t, v) => t + Math.round(v * 100), 0);
        assert.equal(Math.round(parseNumber(q.answer) * 100), cents, q.answer);
      }
      if (q.image?.clock) {
        const [h, m] = q.image.clock;
        assert.equal(q.answer, m ? `${h} h ${String(m).padStart(2, '0')}` : `${h} h`);
        assert.equal(new Set(q.choices).size, q.choices.length, 'choix distincts');
      }
      const pct = q.prompt.match(/(\d+) % de (\d+)/);
      if (pct) assert.equal(Number(q.answer), (Number(pct[1]) * Number(pct[2])) / 100);
      const per = q.prompt.match(/rectangle de (\d+) cm sur (\d+) cm \(en cm\)/);
      if (per) assert.equal(Number(q.answer), 2 * (Number(per[1]) + Number(per[2])));
      if (q.type === 'choice') assert.equal(new Set(q.choices).size, q.choices.length, `choix distincts : ${q.prompt}`);
    }
  }
});

test('Action quiz : récompense par bonne réponse puis succès / échec', () => {
  const s = new GameState();
  const log = [];
  const ctx = {
    state: s,
    say: (t, { onClose }) => (log.push(t), onClose()),
    collect: (item, n) => s.give(item, n),
    announce: (item, n, next) => (log.push(`+${n} ${item}`), next()),
    quiz: (spec, done) => done({ correct: 2, total: 3, results: [] }),
  };
  runActions([{ quiz: { count: 3, pass: 2 }, perCorrect: { give: 'coin', count: 2 }, success: [{ setFlag: 'ok' }], failure: [{ setFlag: 'ko' }] }], ctx);
  assert.equal(s.count('coin'), 4);
  assert.ok(s.flag('ok') && !s.flag('ko'));
  runActions([{ quiz: { count: 3 }, success: [{ setFlag: 'parfait' }], failure: [{ setFlag: 'rate' }] }], ctx);
  assert.ok(s.flag('rate'), 'pass vaut count par défaut : 2/3 ne suffit pas');
});

test('Statistiques de questions sauvegardées', () => {
  const s = new GameState();
  s.recordQuiz([
    { id: 'a', subject: 'maths', ok: true },
    { id: 'gen:maths:1+1', subject: 'maths', ok: false },
  ]);
  assert.deepEqual(s.quiz.stats.maths, { ok: 1, total: 2 });
  assert.deepEqual(s.quiz.seen, ['a'], 'les questions générées ne sont pas mémorisées');
  const copy = new GameState();
  copy.load(JSON.parse(JSON.stringify(s.toJSON())));
  assert.deepEqual(JSON.parse(JSON.stringify(copy.quiz)), JSON.parse(JSON.stringify(s.quiz)));
});
