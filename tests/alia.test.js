import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState, runActions, check, tictactoe } from '../gameplay/index.js';
import { MAPS, ITEMS, QUESTS } from '../game/data/prebois.js';
import { WORLD_NODES, WORLD_MAP, STONES, colorLoss, stoneCount } from '../game/data/worldmap.js';

const { winner, bestMove, aiMove, skillForAge, winningLine } = tictactoe;
const B = (s) => [...s].map((c) => (c === '.' ? null : c));

test('Morpion : gagnant, égalité, partie en cours', () => {
  assert.equal(winner(B('XXX.O.O..')), 'X');
  assert.equal(winner(B('O..XO.X.O')), 'O');
  assert.equal(winner(B('XOXXOOOXX')), 'draw');
  assert.equal(winner(B('X........')), null);
  assert.deepEqual(winningLine(B('XXX.O.O..')), [0, 1, 2]);
});

test('Morpion : le jeu parfait gagne quand il peut, sinon bloque', () => {
  assert.equal(bestMove(B('OO.XX....'), 'O'), 2, 'gagne tout de suite');
  assert.equal(bestMove(B('XX.O.....'), 'O'), 2, 'bloque la ligne');
});

test('Morpion : un habitant parfait ne perd jamais', () => {
  // L'enfant joue tous les coups possibles ; l'habitant (skill 1) répond au mieux.
  const explore = (b) => {
    const w = winner(b);
    if (w) return assert.notEqual(w, 'X');
    for (let i = 0; i < 9; i++) {
      if (b[i]) continue;
      const n = [...b];
      n[i] = 'X';
      if (!winner(n)) n[aiMove(n, { skill: 1 })] = 'O';
      explore(n);
    }
  };
  explore(Array(9).fill(null));
});

test('Morpion : plus facile à 6 ans qu’à 10 ans', () => {
  assert.ok(skillForAge(6) < skillForAge(8) && skillForAge(8) < skillForAge(10));
  // skill 0 : toujours au hasard, sur une case libre
  const b = B('XOX.O.X..');
  for (let k = 0; k < 20; k++) assert.equal(b[aiMove(b, { skill: 0 })], null);
});

test('Action « minigame » : la suite dépend du résultat', () => {
  const state = new GameState();
  const run = (result) => {
    const said = [];
    const ctx = { state, say: (t, o) => (said.push(t), o.onClose()), minigame: (name, done) => (assert.equal(name, 'morpion'), done(result)), collect: (i, n) => state.give(i, n) };
    runActions([{ minigame: 'morpion', win: [{ give: 'coin', count: 3 }], lose: [{ say: 'perdu' }] }], ctx);
    return said;
  };
  run('win');
  assert.equal(state.count('coin'), 3);
  assert.deepEqual(run('lose'), ['perdu']);
  assert.deepEqual(run('quit'), [], 'abandon : rien ne se passe');
});

test('Carte du monde : 8 lieux, Prébois ouvert, le reste fermé pour l’instant', () => {
  assert.equal(WORLD_NODES.length, 8);
  const st = new GameState();
  for (const n of WORLD_NODES) {
    if (n.mapId) {
      assert.ok(MAPS[n.mapId], `carte ${n.mapId}`);
      const row = MAPS[n.mapId].rows[n.at[1]];
      assert.ok(row && row[n.at[0]] !== '#', `${n.id} : arrivée sur une case libre`);
    }
    assert.equal(check(n.open, st), n.id === 'prebois');
  }
  assert.equal(WORLD_NODES.filter((n) => n.kind === 'stone').length, 6);
  STONES.forEach((k) => assert.ok(ITEMS[`stone_${k}`], `objet stone_${k}`));
  assert.equal(check(WORLD_MAP.when, st), false, 'pas de carte avant la légende de l’Ancien');
});

test('Prébois : la sortie du village mène à la carte du monde', () => {
  const m = MAPS.overworld;
  const exits = Object.entries(m.objects).filter(([, o]) => o.worldMap);
  assert.equal(exits.length, 1);
  const [ch, o] = exits[0];
  const y = m.rows.findIndex((r) => r.includes(ch));
  assert.ok(y >= 0);
  assert.notEqual(m.rows[o.back[1]][o.back[0]], '#', 'case de retour libre');
  assert.ok(Math.abs(o.back[0] - m.rows[y].indexOf(ch)) + Math.abs(o.back[1] - y) === 1, 'case de retour voisine');
  const relic = QUESTS.find((q) => q.id === 'relic');
  assert.deepEqual(relic.steps.at(-1).done, { flag: 'world_open' });
  assert.ok(ITEMS.royal_map);
});

test('Couleurs du royaume : Prébois retrouve ses couleurs pierre après pierre', () => {
  const state = new GameState();
  const adv = { state, mapDef: { region: 'prebois' } };
  const start = colorLoss(adv);
  assert.ok(start > 0.5);
  state.give('stone_givre', 1);
  state.give('stone_seve', 1);
  state.give('stone_aurore', 1);
  assert.equal(stoneCount(state), 3);
  assert.ok(Math.abs(colorLoss(adv) - start / 2) < 1e-9);
  assert.equal(colorLoss({ state, mapDef: { region: 'givre' } }), 0, 'région de la pierre trouvée');
  assert.ok(colorLoss({ state, mapDef: { region: 'temps' } }) > 0);
  assert.equal(colorLoss({ state, mapDef: {} }), 0);
  state.setFlag('alia_free');
  assert.equal(colorLoss(adv), 0);
});
