import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState, checkAnswer, encodeTransfer, decodeTransfer, QuestionBank } from '../gameplay/index.js';
import { Camera } from '../engine/index.js';
import { QUESTIONS_DICTEE, frenchSchoolBank } from '../content/quiz/index.js';

const res = (subject, ok, id = `${subject}-${Math.random()}`) => ({ id, subject, ok, prompt: id, answer: 'x', question: { id, subject, type: 'text', prompt: id, answer: 'x', ages: [8, 8] } });

test('Difficulté automatique : monte si tout est juste, descend si trop d’erreurs', () => {
  const s = new GameState();
  s.profile = { age: 8 };
  s.recordQuiz(Array.from({ length: 6 }, () => res('maths', true)));
  assert.equal(s.effectiveAge('maths'), 9);
  s.recordQuiz(Array.from({ length: 6 }, () => res('francais', false)));
  assert.equal(s.effectiveAge('francais'), 7);
  assert.equal(s.effectiveAge('histoire'), 8, 'les autres matières ne bougent pas');
  // Jamais au-delà de 10 ans ni en dessous de 6.
  s.profile.age = 10;
  s.quiz.level = {};
  s.recordQuiz(Array.from({ length: 12 }, () => res('maths', true)));
  assert.equal(s.effectiveAge('maths'), 10);
});

test('Révision espacée : une erreur revient 1 jour plus tard, puis 3, puis 7', () => {
  const s = new GameState();
  const DAY = 86400000;
  const t0 = 1_000_000;
  s.recordQuiz([res('maths', false, 'q1')], { now: t0 });
  assert.equal(s.dueReviews('maths', t0 + DAY / 2).length, 0, 'pas encore');
  assert.equal(s.dueReviews('maths', t0 + DAY).length, 1, 'revient au bout d’un jour');
  s.recordQuiz([res('maths', true, 'q1')], { now: t0 + DAY });
  assert.equal(s.dueReviews('maths', t0 + 2 * DAY).length, 0);
  assert.equal(s.dueReviews('maths', t0 + 4 * DAY).length, 1, 'puis 3 jours plus tard');
  s.recordQuiz([res('maths', true, 'q1')], { now: t0 + 4 * DAY });
  s.recordQuiz([res('maths', true, 'q1')], { now: t0 + 11 * DAY });
  assert.equal(Object.keys(s.quiz.review).length, 0, 'maîtrisée après 3 révisions réussies');
});

test('Dictée : orthographe exacte, accents compris', () => {
  const q = QUESTIONS_DICTEE.find((x) => x.answer === 'éléphant');
  assert.ok(checkAnswer(q, 'Éléphant'));
  assert.ok(!checkAnswer(q, 'elephant'), 'accent oublié');
  assert.ok(!checkAnswer(q, 'un éléphant'), 'pas d’article dans une dictée');
  const apo = QUESTIONS_DICTEE.find((x) => x.answer.startsWith('aujourd'));
  assert.ok(checkAnswer(apo, "aujourd'hui"));
  // La banque peut exclure les dictées (appareil sans voix).
  const bank = frenchSchoolBank();
  for (let i = 0; i < 20; i++) assert.ok(bank.pick({ age: 8, subject: 'francais', count: 3, excludeTypes: ['dictation'] }).every((x) => x.type !== 'dictation'));
});

test('Transfert de partie : code aller-retour, code abîmé refusé', async () => {
  const data = { app: 'quest', v: 1, profile: { name: 'Léa', age: 8 }, save: { state: { items: { coin: 42 } }, mapId: 'overworld' }, custom: [] };
  const code = await encodeTransfer(data);
  assert.match(code, /^QUEST[01]:/);
  assert.deepEqual(await decodeTransfer(code), data);
  await assert.rejects(decodeTransfer('bonjour'));
  await assert.rejects(decodeTransfer(code.slice(0, 20)));
});

test('Caméra « salles » plus étroite que la salle : suit le héros sans sortir de la salle', () => {
  const target = { cx: 20, cy: 50 };
  const cam = new Camera({ width: 192, height: 176, mode: 'rooms', roomWidth: 256, roomHeight: 176 });
  cam.follow(target);
  assert.equal(cam.x, 0, 'bord gauche de la salle');
  target.cx = 240;
  cam.update(0.016);
  assert.equal(cam.x, 64, 'bord droit de la salle (256 - 192)');
  target.cx = 128;
  cam.update(0.016);
  assert.equal(cam.x, 32, 'centré');
  target.cx = 300; // salle suivante
  cam.update(0.016);
  assert.ok(cam.isTransitioning);
});
