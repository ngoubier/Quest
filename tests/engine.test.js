import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Tileset, Tilemap, moveAndSlide, Camera, EventBus, Input, wrapText, SaveStore, Animator, createRng } from '../engine/index.js';
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
