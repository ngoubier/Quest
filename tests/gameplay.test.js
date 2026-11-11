import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState, check, runActions, QuestSystem, formatText } from '../gameplay/index.js';
import { MAPS, LEGEND, QUESTS } from '../demos/02-gameplay/world.js';
import { THEMES, TILE_ROLES } from '../demos/02-gameplay/themes.js';

/** Contexte d'actions minimal (sans écran) : les dialogues sont enregistrés et fermés aussitôt. */
function fakeCtx(state, choicePick = 0) {
  const log = [];
  const ctx = {
    state,
    quests: null,
    log,
    say: (t, { onClose }) => (log.push(['say', t]), onClose?.()),
    ask: (q, { choices }) => (log.push(['ask', q]), choices[choicePick].onSelect()),
    toast: (t) => log.push(['toast', t]),
    collect: (item, n) => state.give(item, n),
    announce: (item, n, next) => (log.push(['announce', item, n]), next()),
  };
  return ctx;
}

test('GameState : drapeaux, objets, vie, sauvegarde', () => {
  const s = new GameState({ maxHp: 6 });
  let changes = 0;
  s.events.on('change', () => changes++);
  s.setFlag('a');
  s.setFlag('a'); // pas de changement => pas d'événement
  s.give('coin', 5);
  assert.equal(s.take('coin', 10), false, 'pas assez');
  assert.equal(s.take('coin', 2), true);
  s.damage(10);
  assert.equal(s.hp, 0);
  s.heal(3);
  assert.equal(changes, 5);
  const copy = new GameState();
  copy.load(JSON.parse(JSON.stringify(s.toJSON())));
  assert.deepEqual(copy.toJSON(), s.toJSON());
});

test('Conditions : toutes les formes', () => {
  const s = new GameState();
  s.setFlag('door');
  s.give('mushroom', 2);
  s.addCounter('kills', 3);
  s.quests.q = { status: 'active', step: 1 };
  assert.ok(check(null, s));
  assert.ok(check('door', s));
  assert.ok(check({ flag: 'other', is: false }, s));
  assert.ok(check({ item: 'mushroom', count: 2 }, s));
  assert.ok(!check({ item: 'mushroom', count: 3 }, s));
  assert.ok(check({ counter: 'kills', gte: 3 }, s));
  assert.ok(check({ quest: 'q', status: 'active' }, s));
  assert.ok(check({ quest: 'q', step: 1 }, s));
  assert.ok(check({ quest: 'zzz', status: 'none' }, s));
  assert.ok(check({ any: ['nope', { not: 'nope' }] }, s));
  assert.ok(check(['door', { item: 'mushroom' }], s));
  assert.throws(() => check({ bizarre: 1 }, s));
});

test('Actions : séquence, choix, condition', () => {
  const s = new GameState();
  const ctx = fakeCtx(s, 1);
  let finished = false;
  runActions(
    [
      { say: 'Bonjour' },
      { ask: 'Oui ou non ?', choices: [{ label: 'Oui', do: [{ setFlag: 'oui' }] }, { label: 'Non', do: [{ setFlag: 'non' }] }] },
      { give: 'coin', count: 3, announce: true },
      { if: 'non', then: [{ addCounter: 'x', by: 2 }], else: [{ setFlag: 'jamais' }] },
    ],
    ctx,
    () => (finished = true),
  );
  assert.ok(finished);
  assert.ok(s.flag('non') && !s.flag('oui') && !s.flag('jamais'));
  assert.equal(s.count('coin'), 3);
  assert.equal(s.counter('x'), 2);
  assert.deepEqual(ctx.log.map((l) => l[0]), ['say', 'ask', 'announce']);
});

test('Quêtes : étapes, validation automatique, récompense', () => {
  const s = new GameState({ maxHp: 6 });
  const ctx = fakeCtx(s);
  const qs = new QuestSystem(ctx, [
    {
      id: 'champi',
      title: 'Champignons',
      steps: [
        { goal: 'En trouver 2', done: { item: 'mushroom', count: 2 } },
        { goal: 'Les rendre', done: 'rendu' },
      ],
      rewards: [{ maxHp: 2 }],
    },
  ]);
  ctx.quests = qs;
  s.give('mushroom', 2); // avant même le début : ne compte pas tant que la quête n'est pas lancée
  assert.equal(qs.status('champi'), 'none');
  qs.start('champi');
  assert.equal(s.quests.champi.step, 1, 'déjà possédés => étape 1 validée immédiatement');
  s.setFlag('rendu');
  assert.equal(qs.status('champi'), 'done');
  assert.equal(s.maxHp, 8);
  assert.equal(qs.journal()[0].status, 'done');
});

test('Textes à trous', () => {
  const s = new GameState();
  s.give('mushroom', 2);
  const words = { coin: ['rubis', 'rubis'], mushroom: ['champignon', 'champignons'] };
  const word = (k, p) => (words[k] ? words[k][p ? 1 : 0] : k);
  assert.equal(formatText('{item:mushroom}/3 {ws:mushroom}, 1 {w:coin}', { state: s, word }), '2/3 champignons, 1 rubis');
});

test('Essai 2 : cartes valides et quêtes cohérentes', () => {
  for (const [id, m] of Object.entries(MAPS)) {
    const w = m.rows[0].length;
    m.rows.forEach((r, i) => assert.equal(r.length, w, `${id} ligne ${i}`));
    for (const ch of m.rows.join('')) assert.ok(ch in LEGEND || ch in (m.legend ?? {}) || ch in (m.objects ?? {}), `${id} : "${ch}"`);
    for (const o of Object.values(m.objects ?? {})) if (o.type === 'warp') assert.ok(MAPS[o.to], `destination ${o.to}`);
  }
  for (const q of QUESTS) assert.ok(q.steps.length && q.steps.every((s) => s.goal && s.done));
  for (const t of THEMES) for (const r of TILE_ROLES) assert.ok(t.tiles[r], `${t.id}.${r}`);
});
