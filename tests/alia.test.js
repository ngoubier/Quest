import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState, runActions, check, tictactoe, nim } from '../gameplay/index.js';
import { MAPS, ITEMS, QUESTS } from '../game/data/index.js';
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

test('Carte du monde : 8 lieux, Prébois et le Mont Givré ouverts, le reste fermé pour l’instant', () => {
  assert.equal(WORLD_NODES.length, 8);
  const st = new GameState();
  for (const n of WORLD_NODES) {
    if (n.mapId) {
      assert.ok(MAPS[n.mapId], `carte ${n.mapId}`);
      const row = MAPS[n.mapId].rows[n.at[1]];
      assert.ok(row && row[n.at[0]] !== '#', `${n.id} : arrivée sur une case libre`);
    }
    assert.equal(check(n.open, st), ['prebois', 'givre'].includes(n.id), n.id);
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

// ------------------------------------------------------------------ niveau 2 : le Mont Givré
test('Le dernier glaçon : la bonne stratégie laisse 1, 5, 9 ou 13 glaçons', () => {
  assert.equal(nim.bestTake(15), 2); // reste 13
  assert.equal(nim.bestTake(7), 2); // reste 5
  assert.equal(nim.bestTake(2), 1); // reste 1 : l'autre prend le dernier
  assert.ok(nim.isLosing(5) && nim.isLosing(1) && !nim.isLosing(4));
  // Un habitant parfait gagne toujours s'il part d'une position gagnante.
  for (let start = 2; start <= 15; start++) {
    if (nim.isLosing(start)) continue;
    const play = (n, aiTurn) => (n === 0 ? aiTurn : aiTurn ? play(n - nim.aiTake(n, { skill: 1 }), false) : [1, 2, 3].filter((k) => k <= n).every((k) => play(n - k, true)));
    assert.ok(play(start, true), `départ ${start}`);
  }
  for (let k = 0; k < 30; k++) assert.ok([1, 2, 3].includes(nim.aiTake(9, { skill: 0 })));
});

/** Simulation du héros sur une carte : un pas sur la neige, une glissade sur la glace. */
function reach(map, from, { solid, ice, blockers = '' }) {
  const rows = map.rows;
  const at = (x, y) => rows[y]?.[x] ?? '#';
  const blocked = (x, y) => solid.includes(at(x, y)) || blockers.includes(at(x, y));
  const seen = new Map([[from.join(), 0]]);
  const queue = [from];
  while (queue.length) {
    const [x, y] = queue.shift();
    const d = seen.get([x, y].join());
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      let nx = x;
      let ny = y;
      if (blocked(x + dx, y + dy)) continue;
      nx += dx;
      ny += dy;
      while (ice.includes(at(nx, ny)) && !blocked(nx + dx, ny + dy)) (nx += dx), (ny += dy);
      const key = [nx, ny].join();
      if (!seen.has(key)) (seen.set(key, d + (ice.includes(at(nx, ny)) || ice.includes(at(x, y)) ? 1 : 0)), queue.push([nx, ny]));
    }
  }
  return seen;
}

test('Mont Givré : le coffre du lac gelé s’atteint en glissant (et pas du premier coup)', () => {
  const m = MAPS.givre;
  const find = (ch) => {
    const y = m.rows.findIndex((r) => r.includes(ch));
    return [m.rows[y].indexOf(ch), y];
  };
  const start = find('P');
  const [cx, cy] = find('C');
  const seen = reach(m, start, { solid: '#^TIHr~o', ice: 'i', blockers: 'C1234GAMNKSLZx' });
  const next = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => seen.get([cx + dx, cy + dy].join())).filter((v) => v !== undefined);
  assert.ok(next.length > 0, 'une case voisine du coffre est atteignable');
  assert.ok(Math.min(...next) >= 2, 'il faut au moins deux glissades');
  // Tous les lieux importants sont accessibles à pied.
  for (const ch of ['d', 'V', 'h', 'c']) assert.ok(seen.has(find(ch).join()), `accès à ${ch}`);
  for (const ch of ['A', 'M', 'N', 'K', '1', '2', '3', '4']) {
    const [x, y] = find(ch);
    assert.ok([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => seen.has([x + dx, y + dy].join())), `on peut approcher ${ch}`);
  }
  // La pelote du lac se ramasse en glissant dessus.
  assert.ok(seen.has('35,13'));
});

test('Temple de glace : le bloc glisse jusqu’à la dalle (haut, puis droite)', () => {
  const rows = MAPS.givre_temple.rows;
  const free = (x, y) => !'#o'.includes(rows[y][x]);
  const slide = ([x, y], [dx, dy]) => {
    while (free(x + dx, y + dy)) (x += dx), (y += dy);
    return [x, y];
  };
  const find = (ch) => {
    const y = rows.findIndex((r) => r.includes(ch));
    return [rows[y].indexOf(ch), y];
  };
  const up = slide(find('B'), [0, -1]);
  assert.deepEqual(slide(up, [1, 0]), find('p'));
  assert.equal(GIVRE_OK(), true);
});

function GIVRE_OK() {
  // Objets et quêtes du niveau présents, la pierre est dans le coffre du boss.
  const t = MAPS.givre_temple.objects;
  return !!ITEMS.fire_staff?.tool && t.A.item === 'stone_givre' && t.A.appearWhen === t.Y.flag && t.Y.meltWith === 'fire' && QUESTS.some((q) => q.id === 'givre') && QUESTS.some((q) => q.id === 'wool');
}
