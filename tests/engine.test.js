import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Tileset, Tilemap, moveAndSlide, Camera, EventBus, Input, wrapText, SaveStore, Animator, createRng, buildTileset, windAt, drawPanel } from '../engine/index.js';
import { _depth, _inPiece } from '../engine/world/TerrainBlend.js';
import { MAPS, LEGEND } from '../demos/01-moteur/maps.js';
import { TILE_ROLES, THEMES } from '../demos/01-moteur/themes.js';

const tileset = new Tileset({ tileSize: 16, tiles: [{ name: 'floor' }, { name: 'wall', solid: true }] });
const map = () =>
  Tilemap.fromAscii({
    rows: ['#####', '#...#', '#.#.#', '#...#', '#####'],
    legend: { '#': 'wall', '.': 'floor', P: { tile: 'floor', marker: 'player' } },
    tileset,
  }).tilemap;

test('Tilemap : solidité des tuiles et des bords', () => {
  const m = map();
  assert.equal(m.isSolidTile(0, 0), true);
  assert.equal(m.isSolidTile(1, 1), false);
  assert.equal(m.isSolidTile(2, 2), true);
  assert.equal(m.isSolidTile(-1, 3), true, 'hors carte = mur');
  assert.equal(m.rectHitsSolid(16, 16, 16, 16), false, 'une case libre exacte ne touche rien');
  assert.equal(m.rectHitsSolid(17, 17, 16, 16), true, 'déborde sur le pilier central');
});

test('Tilemap.fromAscii : marqueurs', () => {
  const { markers } = Tilemap.fromAscii({ rows: ['.P.'], legend: { '.': 'floor', P: { tile: 'floor', marker: 'player' } }, tileset });
  assert.deepEqual(markers, [{ name: 'player', char: 'P', tx: 1, ty: 0, x: 16, y: 0, props: {} }]);
});

test('Collision : on glisse contre un mur et on s’y colle exactement', () => {
  const m = map();
  const body = { x: 20, y: 20, w: 8, h: 8 };
  const blocked = (x, y, w, h) => m.rectHitsSolid(x, y, w, h);
  const res = moveAndSlide(body, -10.5, 0, blocked);
  assert.equal(res.hitX, true);
  assert.equal(body.x, 16);
  moveAndSlide(body, 0, 100, blocked);
  assert.equal(body.y, 64 - 8, 'collé au mur du bas');
});

test('Collision : pas de traversée même à grande vitesse', () => {
  const m = map();
  const body = { x: 17, y: 33, w: 8, h: 8 };
  moveAndSlide(body, 500, 0, (x, y, w, h) => m.rectHitsSolid(x, y, w, h));
  assert.equal(body.x, 24, 'arrêté net par le pilier central');
});

test('Collision : aide aux coins (corner assist)', () => {
  const m = map();
  // Collé à gauche du pilier central (32..48), il le dépasse de 3 px vers le bas : sans aide, il bloque.
  const body = { x: 24, y: 45, w: 8, h: 8 };
  const blocked = (x, y, w, h) => m.rectHitsSolid(x, y, w, h);
  const before = body.y;
  const res = moveAndSlide(body, 1, 0, blocked, { cornerAssist: 4 });
  assert.equal(res.nudged, true);
  assert.ok(body.y > before, 'poussé vers le bas pour contourner');
});

test('Camera : changement de salle animé', () => {
  const target = { cx: 100, cy: 50 };
  const cam = new Camera({ width: 256, height: 176, mode: 'rooms' });
  cam.follow(target);
  assert.deepEqual(cam.room, { x: 0, y: 0 });
  target.cx = 260;
  let changed = null;
  cam.onRoomChange = (r) => (changed = r);
  cam.update(0.01);
  assert.equal(cam.isTransitioning, true);
  for (let i = 0; i < 100; i++) cam.update(0.02);
  assert.equal(cam.isTransitioning, false);
  assert.equal(cam.x, 256);
  assert.deepEqual(changed, { x: 1, y: 0 });
});

test('EventBus : on / once / off', () => {
  const bus = new EventBus();
  const got = [];
  const off = bus.on('a', (v) => got.push(v));
  bus.once('a', (v) => got.push(`once:${v}`));
  bus.emit('a', 1);
  bus.emit('a', 2);
  off();
  bus.emit('a', 3);
  assert.deepEqual(got, [1, 'once:1', 2]);
});

test('Input : un appui très bref est quand même détecté', () => {
  const input = new Input();
  input.setVirtual('action', true);
  input.setVirtual('action', false); // relâché avant la mise à jour
  input.update();
  assert.equal(input.pressed('action'), true);
  input.update();
  assert.equal(input.pressed('action'), false);
});

test('wrapText : découpe et retours à la ligne', () => {
  const lines = wrapText('un deux trois quatre\ncinq', 13, (s) => s.length);
  assert.deepEqual(lines, ['un deux trois', 'quatre', 'cinq']);
});

test('SaveStore : aller-retour', () => {
  const mem = new Map();
  const store = new SaveStore('t', { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v), removeItem: (k) => mem.delete(k) });
  assert.equal(store.has(1), false);
  store.save(1, { hp: 3 });
  assert.deepEqual(store.load(1).data, { hp: 3 });
  store.remove(1);
  assert.equal(store.load(1), null);
});

test('Animator : boucle et animation à sens unique', () => {
  const a = new Animator({ walk: { frames: ['a', 'b'], fps: 10 }, once: { frames: [1, 2, 3], fps: 10, loop: false } });
  a.play('walk');
  a.update(0.15);
  assert.equal(a.frame, 'b');
  a.update(0.1);
  assert.equal(a.frame, 'a');
  a.play('once');
  a.update(1);
  assert.equal(a.frame, 3);
  assert.equal(a.done, true);
});

test('Rng déterministe', () => {
  const a = createRng(42);
  const b = createRng(42);
  assert.equal(a(), b());
});

test('Démo : cartes rectangulaires et découpées en salles 16x11', () => {
  for (const [id, m] of Object.entries(MAPS)) {
    const w = m.rows[0].length;
    m.rows.forEach((r, i) => assert.equal(r.length, w, `${id} ligne ${i}`));
    assert.equal(w % 16, 0, `${id} largeur`);
    assert.equal(m.rows.length % 11, 0, `${id} hauteur`);
    for (const ch of m.rows.join('')) assert.ok(ch in LEGEND, `${id} : "${ch}"`);
  }
});

test('Démo : chaque thème fournit tous les rôles de tuiles', () => {
  for (const t of THEMES) for (const r of TILE_ROLES) assert.ok(t.tiles[r], `${t.id}.${r}`);
});

test('Camera : écran plus large que la salle (PC) => salle centrée', () => {
  const cam = new Camera({ width: 320, height: 176, mode: 'rooms', roomWidth: 256, roomHeight: 176 });
  cam.follow({ cx: 300, cy: 80 });
  assert.equal(cam.x, 256 - 32, 'la salle n°1 est au milieu, 32 px de chaque côté');
  const free = new Camera({ width: 320, height: 176, bounds: { w: 256, h: 400 } });
  free.follow({ cx: 10, cy: 10 });
  assert.equal(free.x, -32, 'carte étroite centrée');
  assert.equal(free.y, 0);
});

test('Grands arbres : la cime est dessinée sur la case du dessus, transparente si quelqu’un est derrière', () => {
  const theme = {
    id: 't',
    tiles: {
      floor: { paint: () => {} },
      tree: { solid: true, paint: () => {}, tall: { ground: () => {}, paint: () => {} } },
    },
  };
  const ts = buildTileset(theme, ['floor', 'tree']);
  const tree = ts.id('tree');
  assert.ok(ts.hasCrown(tree));
  assert.ok(!ts.hasCrown(ts.id('floor')));
  assert.ok(ts.isSolid(tree), 'seule la case du tronc bloque');
  const { tilemap } = Tilemap.fromAscii({ rows: ['...', '.T.', '...'], legend: { '.': 'floor', T: 'tree' }, tileset: ts });
  const calls = [];
  ts.image = {}; // pas d'image dans les tests : on note seulement ce qui est dessiné
  let alpha = 1;
  const r = { image: (img, sx, sy, sw, sh, x, y) => calls.push({ x, y, alpha }), withAlpha: (a, fn) => ((alpha = a), fn(), (alpha = 1)), rect() {} };
  const view = { x: 0, y: 0, w: 48, h: 48 };
  tilemap.draw(r, view, 0, { above: true });
  assert.deepEqual(calls, [{ x: 16, y: 0, alpha: 1 }], 'cime en (1, 0), au-dessus du tronc en (1, 1)');
  calls.length = 0;
  tilemap.draw(r, view, 0, { above: true, reveal: [{ x: 18, y: 4, w: 10, h: 8 }] });
  assert.equal(calls[0].alpha, 0.45, 'héros derrière : cime transparente');
  theme.tiles.floor.props = { seeThrough: true };
  const { tilemap: m2 } = Tilemap.fromAscii({ rows: ['.', 'T'], legend: { '.': 'floor', T: 'tree' }, tileset: Object.assign(buildTileset(theme, ['floor', 'tree']), { image: {} }) });
  calls.length = 0;
  m2.draw(r, view, 0, { above: true });
  assert.equal(calls[0].alpha, 0.45, 'case importante sous la cime : transparente');
});

test('Transitions : le terrain le plus haut déborde sur ses voisins plus bas (côtés, coins)', () => {
  const theme = {
    id: 't',
    tiles: {
      grass: { paint: () => {}, props: { blend: 3 } },
      path: { paint: () => {}, props: { blend: 1 } },
      water: { solid: true, paint: () => {}, props: { blend: 0, edge: '#ffffff' } },
      tree: { solid: true, paint: () => {}, props: { blend: 3, blendAs: 'grass' } },
      wall: { solid: true, paint: () => {} },
    },
  };
  const ts = buildTileset(theme, ['grass', 'path', 'water', 'tree', 'wall']);
  const id = (n) => ts.id(n);
  const pieces = (rows, tx, ty) => {
    const { tilemap } = Tilemap.fromAscii({ rows, legend: { G: 'grass', P: 'path', W: 'water', T: 'tree', '#': 'wall' }, tileset: ts });
    const log = [];
    tilemap._blender = { tileset: ts, piece: (tex, piece, v, edge) => (log.push([tex, piece, edge]), null) };
    const covered = tilemap._blend({ image() {} }, ts.def(tilemap.get(0, tx, ty)), tx, ty);
    return { log, covered };
  };
  // chemin entouré d'herbe : 4 côtés et 4 coins intérieurs arrondis
  const a = pieces(['GGG', 'GPG', 'GGG'], 1, 1);
  assert.deepEqual(a.log.map((p) => p[1]).sort(), ['e', 'n', 'nei', 'nwi', 's', 'sei', 'swi', 'w'].sort());
  assert.equal(a.covered, 15);
  assert.ok(a.log.every(([tex]) => tex === id('grass')));
  // coin extérieur : seule la diagonale est plus haute
  assert.deepEqual(pieces(['GPP', 'PPP'], 1, 1).log.map((p) => p[1]), ['nw']);
  // l'herbe ne reçoit rien du chemin ; un mur ne participe pas
  assert.equal(pieces(['PGP'], 1, 0).log.length, 0);
  assert.equal(pieces(['#P#'], 1, 0).log.length, 0);
  // l'arbre déborde avec la texture de l'herbe ; sur l'eau, le liseré est l'écume
  const w = pieces(['TW'], 1, 0);
  assert.deepEqual(w.log, [[id('grass'), 'w', '#ffffff']]);
  // l'arbre lui-même ne reçoit pas de transition
  assert.equal(pieces(['WT'], 1, 0).log.length, 0);
  // plusieurs terrains : le plus haut est dessiné en dernier
  assert.deepEqual(pieces(['G', 'W', 'P'], 0, 1).log.map((p) => p[0]), [id('path'), id('grass')]);
});

test('Transitions : les bords se raccordent d’une case à l’autre ; le vent reste doux', () => {
  for (const seed of [0, 1.3, 2.7, 5]) {
    assert.ok(Math.abs(_depth(0, seed) - 3) < 1e-9 && Math.abs(_depth(1, seed) - 3) < 1e-9, 'bord de 3 pixels aux extrémités');
    for (let t = 0; t <= 1; t += 0.05) assert.ok(_depth(t, seed) >= 1.2 && _depth(t, seed) <= 6);
  }
  // un coin extérieur a le même rayon que les bandes à leurs extrémités
  assert.ok(_inPiece('nw', 2.9, 0.1, 16, 0) && !_inPiece('nw', 3.1, 0.1, 16, 0));
  // coin intérieur arrondi : le coin est couvert, le centre de la case ne l'est pas
  assert.ok(_inPiece('nwi', 0.5, 0.5, 16, 0) && _inPiece('nwi', 4, 1, 16, 0) && !_inPiece('nwi', 5.5, 5.5, 16, 0) && !_inPiece('nwi', 8, 8, 16, 0));
  for (let t = 0; t < 60; t += 0.37) for (const x of [0, 100, 700]) assert.ok(Math.abs(windAt(x, 50, t)) <= 1.7);
});

test('Cadre des fenêtres : 9 morceaux (coins fixes), ou fond uni et liseré sans image', () => {
  const calls = [];
  const r = { ctx: { drawImage: (...a) => calls.push(a.slice(5)) }, rect: (...a) => calls.push(['rect', ...a]), strokeRect: (...a) => calls.push(['stroke', ...a]) };
  drawPanel(r, 10, 20, 100, 40, { box: '#000', border: '#fff', panel: { image: {}, corner: 8, detail: 2 } });
  assert.equal(calls.length, 9);
  assert.deepEqual(calls[0], [10, 20, 8, 8], 'coin en haut à gauche, taille fixe');
  assert.deepEqual(calls[4], [18, 28, 84, 24], 'centre étiré');
  assert.deepEqual(calls[8], [102, 52, 8, 8], 'coin en bas à droite');
  calls.length = 0;
  drawPanel(r, 0, 0, 10, 6, { box: '#000', border: '#fff', panel: { image: {}, corner: 8 } });
  assert.deepEqual(calls[0], [0, 0, 3, 3], 'petite fenêtre : les coins rétrécissent');
  calls.length = 0;
  drawPanel(r, 1, 2, 30, 20, { box: '#000', border: '#fff' });
  assert.deepEqual(calls.map((c) => c[0]), ['rect', 'stroke', 'stroke']);
});
