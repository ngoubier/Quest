// Bandeau d'informations : cœurs à gauche, bouton Sac au centre, compteurs à droite.
// Icônes 8x8 attendues (planche 'icons') : heart_full, heart_half, heart_empty, bag, et une par compteur.
// Renvoie la zone du bouton Sac (pour le toucher / clic).

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

  // Compteurs, alignés à droite (calculés d'abord pour placer le bouton Sac dans l'espace libre).
  let x = r.width - 4;
  for (const item of [...counters].reverse()) {
    const txt = String(st.count(item)).padStart(item === 'coin' ? 3 : 1, '0');
    const w = r.measure(txt, 8, s.font);
    x -= w;
    r.text(txt, x, 4, { color: s.text, size: 8, font: s.font });
    x -= 10;
    icons.draw(r, item, x, 4);
    x -= 7;
  }
  // Bouton Sac : icône + places occupées, centré entre les cœurs et les compteurs.
  const heartsEnd = 4 + hearts * 9;
  const used = adv.bagItems().length;
  const cap = adv.bagCapacity();
  const bw = 40;
  const bx = Math.round(Math.max(heartsEnd + 2, Math.min(x - bw - 2, (heartsEnd + x) / 2 - bw / 2)));
  r.rect(bx, 2, bw, 12, s.border);
  r.rect(bx + 1, 3, bw - 2, 10, s.box);
  icons.draw(r, 'bag', bx + 3, 4);
  r.text(`${used}/${cap}`, bx + 13, 4, { color: used >= cap ? '#ff7a6a' : s.text, size: 7, font: s.font });
  return { x: bx - 4, y: 0, w: bw + 8, h: height };
}
