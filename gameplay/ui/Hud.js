// Bandeau d'informations : cœurs à gauche, compteurs d'objets à droite.
// Icônes 8x8 attendues (planche 'icons') : heart_full, heart_half, heart_empty, et une par objet affiché.

export function drawHud(r, adv, { height = 16, counters = ['coin', 'key'] } = {}) {
  const game = adv.game;
  const s = game.style;
  const icons = game.themes.current.sprites.icons;
  const st = adv.state;
  r.rect(0, 0, r.width, height, s.box);
  r.rect(0, height - 1, r.width, 1, s.border);

  // Cœurs : 2 points de vie par cœur.
  const hearts = Math.ceil(st.maxHp / 2);
  for (let i = 0; i < hearts; i++) {
    const v = st.hp - i * 2;
    const frame = v >= 2 ? 'heart_full' : v === 1 ? 'heart_half' : 'heart_empty';
    icons.draw(r, frame, 4 + i * 9, 4);
  }

  // Compteurs, alignés à droite.
  let x = r.width - 4;
  for (const item of [...counters].reverse()) {
    const txt = String(st.count(item)).padStart(item === 'coin' ? 3 : 1, '0');
    const w = r.measure(txt, 8, s.font);
    x -= w;
    r.text(txt, x, 4, { color: s.text, size: 8, font: s.font });
    x -= 10;
    icons.draw(r, item, x, 4);
    x -= 8;
  }
}
