import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detectDisplay, scale2x, scaleNearest, outlineImage, adjustColors, themeForProfile, detailCount, paintContext, DISPLAY_PROFILES, Tileset } from '../engine/index.js';

// Petite image {width, height, data} à partir de lignes de caractères ('#' = rouge opaque, '.' = transparent).
const img = (rows) => {
  const h = rows.length;
  const w = rows[0].length;
  const data = new Uint8ClampedArray(w * h * 4);
  rows.forEach((row, y) => [...row].forEach((ch, x) => ch === '#' && data.set([255, 0, 0, 255], (y * w + x) * 4)));
  return { width: w, height: h, data };
};
const opaque = (im, x, y) => im.data[(y * im.width + x) * 4 + 3] === 255;

test('Tablette : créatures en dessins détaillés ; téléphone : images pixel (sauf ?art=1)', () => {
  const d = (search, tablet) => detectDisplay({ hash: '', search, touch: true, tablet });
  assert.equal(d('', true).art, true, 'tablette');
  assert.equal(d('', false).art, false, 'téléphone');
  assert.equal(d('?art=1', false).art, true);
  assert.equal(d('?art=0', true).art, false);
  assert.equal(d('', true).hd, false, 'les tuiles et les humains restent agrandis');
  assert.equal(d('?hd=1', false).hd, true);
});

test('Profil : écran tactile => mobile, sinon PC ; forçable dans l’adresse', () => {
  assert.equal(detectDisplay({ hash: '', search: '', touch: true }).id, 'mobile');
  assert.equal(detectDisplay({ hash: '', search: '', touch: false }).id, 'pc');
  assert.equal(detectDisplay({ hash: '', search: '?mobile', touch: false }).id, 'mobile');
  assert.equal(detectDisplay({ hash: '', search: '?touch', touch: false }).id, 'mobile', 'ancien paramètre');
  assert.equal(detectDisplay({ hash: '', search: '?pc', touch: true }).id, 'pc');
  assert.equal(detectDisplay({ hash: '', search: '?classic', touch: true }).detail, 1);
  assert.equal(detectDisplay({ hash: '', search: '?pc&hd=0', touch: false }).detail, 1, 'HD coupée');
  assert.equal(detectDisplay({ hash: '', search: '', touch: false }).detail, 2, 'PC : 2 pixels d’image par pixel de jeu');
  assert.equal(detectDisplay({ hash: '', search: '', hash: '#mobile', touch: false }).id, 'mobile', 'ancre');
  assert.equal(detectDisplay({ hash: '', search: '', hash: '#mobile', touch: false }).forced, 'mobile');
  assert.equal(detectDisplay({ hash: '', search: '', hash: '', touch: true }).forced, null);
});

test('Scale2x : les diagonales sont arrondies, les aplats restent pleins', () => {
  const out = scale2x(img(['#.', '.#']));
  assert.equal(out.width, 4);
  // Diagonale : le pixel haut-gauche devient arrondi (son coin bas-droit est rogné).
  assert.equal(opaque(out, 0, 0), true);
  assert.equal(opaque(out, 1, 1), false);
  const full = scale2x(img(['##', '##']));
  for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) assert.equal(opaque(full, x, y), true);
  const near = scaleNearest(img(['#.']), 3);
  assert.equal(near.width, 6);
  assert.equal(opaque(near, 2, 2), true);
  assert.equal(opaque(near, 3, 0), false);
});

test('Contour : fin (voisins directs) ou épais (mobile)', () => {
  const thin = outlineImage(img(['.....', '.....', '..#..', '.....', '.....']), '#000000', 1);
  assert.equal(opaque(thin, 2, 1), true);
  assert.equal(opaque(thin, 1, 1), false, 'pas de coin en épaisseur 1');
  const thick = outlineImage(img(['.....', '.....', '..#..', '.....', '.....']), '#000000', 2);
  assert.equal(opaque(thick, 2, 0), true);
  assert.equal(opaque(thick, 1, 1), true);
  assert.equal(thick.data[(1 * 5 + 2) * 4], 0, 'le contour est noir');
});

test('Couleurs : la saturation renforce les teintes, sans toucher au transparent', () => {
  const im = { width: 2, height: 1, data: new Uint8ClampedArray([150, 100, 100, 255, 9, 9, 9, 0]) };
  adjustColors(im, { contrast: 1, saturation: 1.5 });
  assert.ok(im.data[0] > 150 && im.data[1] < 100);
  assert.deepEqual([...im.data.slice(4)], [9, 9, 9, 0]);
});

test('Thème : retouches propres à un profil fusionnées par-dessus', () => {
  const t = { id: 't', tiles: { floor: { solid: false, paint: 1 } }, ui: { text: '#fff' }, profiles: { mobile: { tiles: { floor: { paint: 2 } }, ui: { text: '#ff0' } } } };
  const m = themeForProfile(t, 'mobile');
  assert.equal(m.tiles.floor.paint, 2);
  assert.equal(m.tiles.floor.solid, false, 'le reste de la tuile est gardé');
  assert.equal(m.ui.text, '#ff0');
  assert.equal(themeForProfile(t, 'pc'), t);
});

test('Détails : deux fois moins de petits motifs en profil mobile', () => {
  const prev = paintContext.profile;
  paintContext.profile = DISPLAY_PROFILES.mobile;
  assert.equal(detailCount(10), 5);
  paintContext.profile = DISPLAY_PROFILES.pc;
  assert.equal(detailCount(10), 10);
  paintContext.profile = prev;
});

test('Tileset HD : image 2 fois plus fine, dessinée à la taille du jeu', () => {
  const calls = [];
  const r = { image: (...a) => calls.push(a) };
  const ts = new Tileset({ tileSize: 16, tiles: [{ name: 'floor' }], image: {}, detail: 2 });
  ts.draw(r, 1, 48, 32);
  const [, sx, sy, sw, sh, dx, dy, dw, dh] = calls[0];
  assert.deepEqual([sx, sy, sw, sh, dx, dy, dw, dh], [0, 32, 32, 32, 48, 32, 16, 16]);
});
