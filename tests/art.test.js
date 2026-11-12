// Dessins détaillés (PC) et histoire en images des niveaux : chaque boss, monstre et habitant non humain
// a son dessin ; chaque boss est présenté ; chaque pierre termine son niveau par 2 pages.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAPS, ITEMS } from '../game/data/index.js';
import { STONES } from '../game/data/worldmap.js';
import { BOSS_INTROS, BACKDROPS } from '../game/data/scenes.js';
import { paintBossHD, BOSS_ART } from '../game/art/bosses.js';
import { paintMonsterHD } from '../game/art/monsters.js';
import { paintFolkHD } from '../game/art/folk.js';
import { GIVRE_OBJECT_FRAMES, GIVRE_CHARS } from '../game/theme-givre.js';
import { SEVE_OBJECT_FRAMES, SEVE_CHARS } from '../game/theme-seve.js';
import { AURORE_OBJECT_FRAMES, AURORE_CHARS } from '../game/theme-aurore.js';
import { TEMPS_OBJECT_FRAMES, TEMPS_CHARS } from '../game/theme-temps.js';
import { SOLEIL_OBJECT_FRAMES, SOLEIL_CHARS } from '../game/theme-soleil.js';
import { MAREES_OBJECT_FRAMES, MAREES_CHARS } from '../game/theme-marees.js';
import { VOLCAN_OBJECT_FRAMES, VOLCAN_CHARS } from '../game/theme-volcan.js';

/** Faux contexte de dessin : accepte tout, compte les formes dessinées. */
function fakeContext() {
  const ctx = { drawn: 0 };
  const grad = { addColorStop() {} };
  return new Proxy(ctx, {
    get(o, k) {
      if (k in o) return o[k];
      if (k === 'createLinearGradient' || k === 'createRadialGradient') return () => grad;
      if (k === 'fill' || k === 'stroke' || k === 'fillRect') return () => o.drawn++;
      return () => {};
    },
    set(o, k, v) {
      o[k] = v;
      return true;
    },
  });
}

const MONSTERS = ['snowman', 'wolf', 'penguin', 'boar', 'squirrel', 'wasp', 'shroom', 'rat', 'bat', 'thief', 'skeleton', 'ghost', 'armor', 'snake', 'scorpion', 'vulture', 'mummy', 'crab', 'jelly', 'eel', 'lantern', 'tentacle', 'firebat', 'imp', 'lavawolf', 'golem'];

test('Dessins détaillés : chaque monstre des niveaux 2 à 8, ses deux images', () => {
  const frames = new Set([GIVRE_OBJECT_FRAMES, SEVE_OBJECT_FRAMES, AURORE_OBJECT_FRAMES, TEMPS_OBJECT_FRAMES, SOLEIL_OBJECT_FRAMES, MAREES_OBJECT_FRAMES, VOLCAN_OBJECT_FRAMES].flat());
  for (const m of MONSTERS) {
    for (const f of [`${m}_0`, `${m}_1`]) {
      assert.ok(frames.has(f), `image ${f} dans le thème`);
      const c = fakeContext();
      assert.equal(paintMonsterHD(c, f), true, f);
      assert.ok(c.drawn > 5, `${f} dessiné`);
    }
  }
  assert.equal(paintMonsterHD(fakeContext(), 'key_red'), false, 'les objets gardent leur image');
});

test('Dessins détaillés : les 7 boss, leurs boucliers ; les habitants non humains', () => {
  const bosses = Object.values(MAPS).flatMap((m) => Object.values(m.objects ?? {}).filter((o) => o.type === 'boss' && o.sprite));
  assert.equal(bosses.length, 7);
  for (const b of bosses) {
    assert.ok(BOSS_ART[b.sprite], b.sprite);
    for (const f of ['0', '1', 'shield']) assert.equal(paintBossHD(fakeContext(), `${b.sprite}_${f}`), true, `${b.sprite}_${f}`);
  }
  assert.equal(paintBossHD(fakeContext(), 'worm_under'), true);
  assert.equal(paintBossHD(fakeContext(), 'morgor_shield2'), true);
  assert.equal(paintBossHD(fakeContext(), 'boss_0'), false, 'le Roi Gluant garde son dessin');
  const chars = new Set([GIVRE_CHARS, SEVE_CHARS, AURORE_CHARS, TEMPS_CHARS, SOLEIL_CHARS, MAREES_CHARS, VOLCAN_CHARS].flat());
  const folk = ['pingo', 'owl', 'cat', 'gnome', 'well', 'mermaid', 'alia'];
  for (const w of folk) assert.ok(chars.has(w), w);
  assert.equal(paintFolkHD(fakeContext(), 'granny', 'down', 0), false, 'les humains : characterHD');
  for (const w of folk) for (const d of ['down', 'up', 'side']) assert.equal(paintFolkHD(fakeContext(), w, d, 0), true, `${w} ${d}`);
});

test('Histoire en images : chaque boss est présenté, chaque pierre termine son niveau', () => {
  for (const m of Object.values(MAPS)) {
    for (const o of Object.values(m.objects ?? {})) if (o.type === 'boss' && o.sprite) assert.equal(o.intro, BOSS_INTROS[o.sprite], `${o.sprite} présenté`);
  }
  for (const pages of Object.values(BOSS_INTROS)) {
    assert.equal(pages.length, 1);
    assert.ok(pages[0].text.length > 20);
    const c = fakeContext();
    const r = { ctx: c, text() {}, withAlpha: (a, f) => f() };
    pages[0].paint(r, { x: 0, y: 0, w: 256, h: 140 }, 1.2);
    assert.ok(c.drawn > 50);
  }
  assert.deepEqual(Object.keys(BACKDROPS).sort(), [...STONES, 'volcan'].sort());
  // le texte compte les pierres qui restent
  const state = (have) => ({ count: (item) => (have.includes(item.slice(6)) ? 1 : 0) });
  for (const k of STONES) assert.equal(typeof ITEMS[`stone_${k}`].story, 'function', k);
  const first = ITEMS.stone_givre.story(state([]));
  assert.equal(first.length, 2);
  assert.match(first[0].text, /Pierre de Givre/);
  assert.match(first[1].text, /pouvoir : marche contre la lave/);
  assert.match(first[1].text, /Encore 5 pierres/);
  assert.match(ITEMS.stone_marees.story(state(['givre', 'seve', 'aurore', 'temps'])).at(-1).text, /Encore 1 pierre à/);
  assert.match(ITEMS.stone_soleil.story(state(['givre', 'seve', 'aurore', 'temps', 'marees'])).at(-1).text, /les 6 pierres/);
});
