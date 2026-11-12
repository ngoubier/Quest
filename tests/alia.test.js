import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState, runActions, check, tictactoe, nim, memory, connect4 } from '../gameplay/index.js';
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

test('Carte du monde : 8 lieux, Prébois, le Mont Givré, la Forêt et Bourg-Lanterne ouverts, le reste fermé pour l’instant', () => {
  assert.equal(WORLD_NODES.length, 8);
  const st = new GameState();
  for (const n of WORLD_NODES) {
    if (n.mapId) {
      assert.ok(MAPS[n.mapId], `carte ${n.mapId}`);
      const row = MAPS[n.mapId].rows[n.at[1]];
      assert.ok(row && row[n.at[0]] !== '#', `${n.id} : arrivée sur une case libre`);
    }
    assert.equal(check(n.open, st), ['prebois', 'givre', 'seve', 'aurore'].includes(n.id), n.id);
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

// ------------------------------------------------------------------ niveau 3 : la Forêt des Murmures
const findIn = (rows, ch) => {
  const y = rows.findIndex((r) => r.includes(ch));
  return y < 0 ? null : [rows[y].indexOf(ch), y];
};
const near = (seen, [x, y]) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => seen.has([x + dx, y + dy].join()));

test('Memory : paquet de paires, l’habitant retrouve les paires qu’il a retenues', () => {
  const deck = memory.makeDeck(6, () => 0.3);
  assert.equal(deck.length, 12);
  for (let k = 0; k < 6; k++) assert.equal(deck.filter((v) => v === k).length, 2);
  const found = deck.map(() => null);
  const mem = new Map();
  // Il a vu les deux cartes d'une même paire : il la prend.
  const a = deck.indexOf(4);
  const b = deck.lastIndexOf(4);
  memory.remember(mem, a, 4, { skill: 1 });
  memory.remember(mem, b, 4, { skill: 1 });
  assert.deepEqual(memory.knownPair(mem, found), [a, b]);
  assert.equal(memory.aiFirst(found, mem), a);
  // Il retourne une carte dont il connaît la jumelle : il la retrouve.
  const c = deck.indexOf(2);
  const d = deck.lastIndexOf(2);
  memory.remember(mem, d, 2, { skill: 1 });
  assert.equal(memory.aiSecond(found, mem, c, 2), d);
  // skill 0 : il ne retient rien ; sa 2e carte n'est jamais la 1re ni une carte trouvée.
  memory.remember(mem, 0, deck[0], { skill: 0, rand: () => 0.5 });
  found[a] = found[b] = 'me';
  for (let k = 0; k < 20; k++) {
    const p = memory.aiSecond(found, new Map(), c, 2);
    assert.ok(p !== c && !found[p]);
  }
  assert.equal(memory.result(4, 2), 'win');
  assert.equal(memory.result(3, 3), 'draw');
  assert.equal(memory.result(1, 5), 'lose');
});

/** Pousse les rondins comme le ferait l'enfant : renvoie la carte après le passage. */
function withLogBridge(rows) {
  const r = rows.map((l) => [...l]);
  r[14][5] = 'k';
  r[13][5] = 'k';
  for (const ch of ['R', 'Y']) {
    const [x, y] = findIn(rows, ch);
    r[y][x] = '.';
  }
  return r.map((l) => l.join(''));
}

test('Forêt : les rondins font un passage, puis tout le niveau est accessible', () => {
  const m = MAPS.seve;
  const solid = '#T~@bawreGRY12SWOKXJZf'; // '#' : hors de la carte
  const start = findIn(m.rows, 'P');
  // Avant les rondins : le nord-ouest (le bois) est inaccessible, le Grand Chêne aussi (ronces).
  const before = reach(m, start, { solid, ice: '' });
  assert.ok(!before.has(findIn(m.rows, 'L').join()), 'pas de bois sans les rondins');
  assert.ok(!before.has('19,5'), 'porte du chêne fermée par les ronces');
  // Le rondin de gauche (R) est poussé vers le haut, depuis la case du dessous.
  const [rx, ry] = findIn(m.rows, 'R');
  assert.ok(before.has([rx, ry + 1].join()), 'on peut pousser R vers le haut');
  assert.equal(m.rows[ry - 1][rx], '.', 'la case au-dessus de R est libre');
  assert.equal(m.rows[ry - 2][rx], '~', 'puis la rivière');
  // Le second (Y) se pousse vers la gauche jusqu'à la colonne de R.
  const [yx, yy] = findIn(m.rows, 'Y');
  assert.equal(yy, ry);
  assert.ok(before.has([yx + 1, yy].join()));
  for (let x = rx + 1; x < yx; x++) assert.equal(m.rows[yy][x], '.');
  // Le bord de la rivière est fermé, sauf à la colonne des rondins.
  assert.ok([...m.rows[15].slice(1, 9)].every((ch, i) => (i + 1 === rx ? ch === '.' : ch === 'T')));
  // Après : tout est accessible (la case comblée de la rivière est dans la légende du thème).
  assert.equal(SEVE_RIVER_FILL(), 'log_bridge');
  const after = reach({ rows: withLogBridge(m.rows) }, start, { solid: solid.replace('G', ''), ice: '' });
  for (const ch of ['L', 'V', 'D', 'g', 'h', 'c', 'd']) assert.ok(after.has(findIn(m.rows, ch).join()), `accès à ${ch}`);
  for (const ch of ['S', 'W', 'O', 'K', 'X', 'J', 'Z']) assert.ok(near(after, findIn(m.rows, ch)), `on peut approcher ${ch}`);
  // Chaque bûche cachée est dans un buisson qu'on peut atteindre.
  m.rows.forEach((row, y) => [...row].forEach((ch, x) => ch === 'f' && assert.ok(near(after, [x, y]), `bûche ${x},${y}`)));
  assert.equal(m.rows.join('').split('f').length - 1, 5, '5 bûches');
});

test('Forêt : les cibles se visent par-dessus l’eau, depuis la rive', () => {
  const m = MAPS.seve;
  for (const ch of ['1', '2']) {
    const [x, y] = findIn(m.rows, ch);
    // Une ligne droite : herbe, puis eau (les flèches passent au-dessus), puis la cible.
    const lines = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => m.rows[y + dy][x + dx] === '~' && '.,='.includes(m.rows[y + 2 * dy][x + 2 * dx]));
    assert.ok(lines.length > 0, `cible ${ch} visible depuis la rive`);
  }
});

test('Bois qui tourne en rond : les champignons rouges mènent à la bonne sortie', () => {
  const steps = [
    ['seve_bois1', 'N', 'seve_bois2'],
    ['seve_bois2', 'W', 'seve_bois3'],
    ['seve_bois3', 'N', 'seve_clairiere'],
  ];
  for (const [id, good, next] of steps) {
    const m = MAPS[id];
    assert.equal(m.objects[good].to, next, `${id} : ${good} mène à ${next}`);
    for (const ex of ['N', 'W', 'E', 'S']) if (ex !== good && !(id === 'seve_bois1' && ex === 'S')) assert.equal(m.objects[ex].to, 'seve_bois1', `${id} : ${ex} ramène au début`);
    // Les champignons sont du côté de la bonne sortie.
    const shrooms = [];
    m.rows.forEach((row, y) => [...row].forEach((ch, x) => ch === 'm' && shrooms.push([x, y])));
    assert.ok(shrooms.length >= 3);
    // ... et le dernier champignon est tout près de la bonne sortie.
    const exit = findIn(m.rows, good);
    const d = Math.min(...shrooms.map(([x, y]) => Math.abs(x - exit[0]) + Math.abs(y - exit[1])));
    assert.ok(d <= 4, `${id} : un champignon près de la sortie ${good}`);
    for (const ex of ['N', 'W', 'E']) {
      if (ex === good) continue;
      const [ox, oy] = findIn(m.rows, ex);
      assert.ok(Math.min(...shrooms.map(([x, y]) => Math.abs(x - ox) + Math.abs(y - oy))) > d, `${id} : plus loin de ${ex}`);
    }
    // On arrive sur une case libre, pas sur une sortie.
    const [ax, ay] = m.objects[good].at;
    assert.equal(MAPS[next].rows[ay][ax], '.');
  }
  assert.equal(MAPS.seve_clairiere.objects.C.item, 'bow');
  assert.ok(ITEMS.bow.tool);
});

test('Grand Chêne : des racines à la cime, en passant par la cible et la nacelle', () => {
  const m = MAPS.seve_chene;
  const o = m.objects;
  const solid = '#%OAGLRx1QT2K';
  const entry = [7, 31];
  // Racines : l'échelle (U) est derrière les ronces (G), ouvertes par la cible (1).
  const roots = reach(m, entry, { solid, ice: '' });
  assert.ok(!roots.has(findIn(m.rows, 'U').join()), 'échelle fermée par les ronces');
  assert.ok(roots.has(findIn(m.rows, 'g').join()), 'œuf dans les racines');
  assert.ok(near(roots, findIn(m.rows, '1')));
  assert.equal(o.G.openWhen, o[1].flag);
  // Tronc : de l'échelle d'arrivée, la nacelle (x) ferme le passage jusqu'à la cible (2).
  const trunk = reach(m, o.U.at, { solid, ice: '' });
  assert.ok(!trunk.has(findIn(m.rows, 'K').join()) && !near(trunk, findIn(m.rows, 'K')), 'salle de droite fermée');
  const [tx, ty] = findIn(m.rows, '2');
  assert.ok([...m.rows[ty].slice(0, tx)].includes('O'), 'trou entre le héros et la cible');
  assert.ok(trunk.has([tx - 4, ty].join()), 'on peut tirer depuis l’autre bord');
  assert.equal(o.x.when, o[2].flag);
  const bridged = reach(m, o.U.at, { solid: solid.replace('x', '').replace('K', ''), ice: '' });
  assert.ok(near(bridged, findIn(m.rows, 'L')), 'porte à clé accessible');
  assert.ok(bridged.has(findIn(m.rows, 'K').join()) || near(bridged, findIn(m.rows, 'K')));
  // Cime : Ronce-Noire et la Pierre de Sève.
  const top = reach(m, o.V.at, { solid: '#%AR', ice: '' });
  assert.ok(near(top, findIn(m.rows, 'R')) && near(top, findIn(m.rows, 'A')));
  assert.equal(o.A.item, 'stone_seve');
  assert.equal(o.A.appearWhen, o.R.flag);
  assert.equal(o.R.meltWith, 'arrow');
  // Les échelles ne déposent jamais le héros sur une autre échelle.
  for (const k of ['U', 'V', 'n', 'N']) {
    const [x, y] = o[k].at;
    assert.ok(!'UVnN#%O'.includes(m.rows[y][x]), `${k} : arrivée sur une case libre`);
  }
  assert.ok(QUESTS.some((q) => q.id === 'seve') && QUESTS.some((q) => q.id === 'eggs') && QUESTS.some((q) => q.id === 'firewood'));
});

function SEVE_RIVER_FILL() {
  return MAPS.seve.legend['~'] === 'river' ? 'log_bridge' : null;
}

// ------------------------------------------------------------------ niveau 4 : Bourg-Lanterne
test('Puissance 4 : alignements, coups gagnants et parades', () => {
  const { empty, drop, winner, winningCells, bestCol, aiCol, validCols, landingRow } = connect4;
  let b = empty();
  for (const c of [0, 1, 2]) b = drop(b, c, 'X');
  assert.equal(winner(b), null);
  assert.equal(bestCol(b, 'O'), 3, 'bloque la ligne');
  assert.equal(winner(drop(b, 3, 'X')), 'X');
  assert.equal(winningCells(drop(b, 3, 'X')).length, 4);
  // colonne
  let v = empty();
  for (let k = 0; k < 3; k++) v = drop(v, 5, 'O');
  assert.equal(bestCol(v, 'O'), 5, 'gagne tout de suite');
  // diagonale
  let d = empty();
  for (const [c, w] of [[0, 'X'], [1, 'O'], [1, 'X'], [2, 'O'], [2, 'O'], [2, 'X'], [3, 'O'], [3, 'O'], [3, 'O'], [3, 'X']]) d = drop(d, c, w);
  assert.equal(winner(d), 'X');
  // colonne pleine
  let f = empty();
  for (let k = 0; k < 6; k++) f = drop(f, 0, k % 2 ? 'X' : 'O');
  assert.equal(drop(f, 0, 'X'), null);
  assert.equal(landingRow(f, 0), -1);
  assert.ok(!validCols(f).includes(0));
  for (let k = 0; k < 20; k++) assert.ok(validCols(f).includes(aiCol(f, { skill: 0 })));
});

/** Évalue un calcul écrit pour les enfants (« 9 × 7 », « 70 − 7 »). */
const calc = (s) => Function(`return (${s.replace(/×/g, '*').replace(/−/g, '-')})`)();

test('Bourg-Lanterne : les codes des coffres se trouvent dans les livres, à tout âge', () => {
  const books = [
    [MAPS.aurore_biblio.objects.n, MAPS.aurore_fernand.objects.C],
    [MAPS.aurore_mairie.objects.n, MAPS.aurore_bleue.objects.C],
  ];
  for (const [book, chest] of books) {
    assert.equal(book.byAge[0][0], 6, 'un calcul dès 6 ans');
    for (const [, [, expr]] of book.byAge) assert.equal(String(calc(expr)), chest.code, `${expr} = ${chest.code}`);
  }
  assert.equal(MAPS.aurore_fernand.objects.C.item, 'boomerang');
  assert.ok(ITEMS.boomerang.tool);
});

test('Bourg-Lanterne : la ville, ses portes et ses habitants sont accessibles', () => {
  const m = MAPS.aurore;
  const solid = '#~RUGNwtxlmfc*KFBALMSQ123456789Y';
  const start = findIn(m.rows, 'P');
  const seen = reach(m, start, { solid, ice: '' });
  // chaque porte se touche depuis la rue, et chaque maison ramène devant sa porte
  for (const ch of '123456789') {
    const [x, y] = findIn(m.rows, ch);
    assert.ok(seen.has([x, y + 1].join()), `porte ${ch} accessible par le bas`);
    const o = m.objects[ch];
    const inside = MAPS[o.to];
    assert.ok(inside, `carte ${o.to}`);
    if (o.to !== 'aurore_egouts') {
      assert.deepEqual(inside.objects.D.at, [x, y + 1], `${o.to} : retour devant la porte`);
      const [ax, ay] = o.at;
      assert.equal(inside.rows[ay][ax], '_', `${o.to} : arrivée sur le plancher`);
    }
  }
  for (const ch of 'AKFBLMSQ') assert.ok(near(seen, findIn(m.rows, ch)), `on peut approcher ${ch}`);
  // la clé rouge est sur un îlot : on ne peut pas y marcher, mais on peut lancer le boomerang en ligne droite
  const [kx, ky] = findIn(m.rows, 'Y');
  assert.ok(!near(seen, [kx, ky]), 'îlot inaccessible à pied');
  const throwsTo = (tx, ty) =>
    [[0, 1], [0, -1], [1, 0], [-1, 0]].some(([dx, dy]) => {
      for (let k = 1; k <= 5; k++) {
        const x = tx + dx * k;
        const y = ty + dy * k;
        if (seen.has([x, y].join())) return true;
        if (!'~.c'.includes(m.rows[y]?.[x])) return false; // le boomerang passe au-dessus de l'eau et des caisses
      }
      return false;
    });
  assert.ok(throwsTo(kx, ky), 'clé rouge atteignable au boomerang');
  // les deux lettres de la ville : une à pied, une derrière les caisses (boomerang)
  const letters = [];
  m.rows.forEach((row, y) => [...row].forEach((ch, x) => ch === 'z' && letters.push([x, y])));
  assert.equal(letters.length, 2);
  assert.ok(letters.some((l) => seen.has(l.join())));
  const boxed = letters.find((l) => !seen.has(l.join()));
  assert.ok(boxed && throwsTo(...boxed), 'lettre derrière les caisses : au boomerang');
  // 5 lettres en tout (3 dans des pots)
  const pots = ['aurore_auberge', 'aurore_pelagie', 'aurore_bleue'].filter((id) => MAPS[id].objects.q?.item === 'letter' && MAPS[id].objects.q.hidden);
  assert.equal(pots.length + letters.length, 5);
  // beffroi = seul toit rouge, fermé par la clé rouge
  assert.equal(m.objects[3].key, 'key_red');
  assert.equal(m.rows.join('').split('R').length - 1, 4, 'un seul toit rouge (4 tuiles)');
  assert.equal(m.objects[5].key, 'key_blue');
});

test('Égouts : leviers au boomerang, salle à vider, clé, puis le Chef des Masques', () => {
  const m = MAPS.aurore_egouts;
  const o = m.objects;
  const entry = findIn(m.rows, 'D');
  const solid = '#~gkLlyCBMAIS';
  const start = [entry[0], entry[1] - 1];
  const s1 = reach(m, start, { solid, ice: '' });
  // le levier 1 est sur un îlot, visible en ligne droite par-dessus l'eau
  const lever = (ch, seen) => {
    const [x, y] = findIn(m.rows, ch);
    assert.ok(!near(seen, [x, y]), `levier ${ch} hors de portée de l'épée`);
    return [[0, 1], [0, -1], [1, 0], [-1, 0]].some(([dx, dy]) => {
      for (let k = 1; k <= 5; k++) {
        const c = m.rows[y + dy * k]?.[x + dx * k];
        if (seen.has([x + dx * k, y + dy * k].join())) return true;
        if (c !== '~') return false;
      }
      return false;
    });
  };
  assert.ok(lever('l', s1), 'levier 1 au boomerang');
  assert.ok(near(s1, findIn(m.rows, 'g')), 'grille 1 devant le héros');
  assert.equal(o.g.openWhen, o.l.flag);
  const s2 = reach(m, start, { solid: solid.replace('g', ''), ice: '' });
  assert.ok(near(s2, findIn(m.rows, 'C')) && near(s2, findIn(m.rows, 'L')), 'coffre à clé et porte');
  assert.equal(o.C.appearWhen, m.roomClear[0].flag);
  const s3 = reach(m, start, { solid: solid.replace('g', '').replace('L', ''), ice: '' });
  assert.ok(lever('y', s3), 'levier 2 au boomerang');
  assert.ok(near(s3, findIn(m.rows, 'B')), 'clé bleue');
  const s4 = reach(m, start, { solid: solid.replace(/[gkL]/g, ''), ice: '' });
  assert.ok(near(s4, findIn(m.rows, 'M')) && near(s4, findIn(m.rows, 'A')), 'boss et pierre');
  assert.equal(o.M.meltWith, 'boomerang');
  assert.equal(o.A.item, 'stone_aurore');
  assert.equal(o.A.appearWhen, o.M.flag);
  for (const id of ['aurore', 'letters', 'cat', 'bread']) assert.ok(QUESTS.some((q) => q.id === id), id);
});
