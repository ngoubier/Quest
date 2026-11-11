// Bandeau d'informations : cœurs à gauche, boutons Quêtes et Sac au centre, compteurs à droite.
// Icônes 8x8 attendues (planche 'icons') : heart_full, heart_half, heart_empty, quest, bag, et une par compteur.
// Renvoie les zones des boutons (pour le toucher / clic) : { quests, bag }.

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
  // Objet équipé (bouton Objet), juste après les cœurs.
  let heartsEnd = 4 + hearts * 9;
  const tool = adv.equipped;
  if (tool) {
    r.rect(heartsEnd + 1, 1, 14, 14, s.border);
    r.rect(heartsEnd + 2, 2, 12, 12, s.box);
    const c = r.ctx;
    c.save();
    c.beginPath();
    c.rect(heartsEnd + 2, 2, 12, 12);
    c.clip();
    game.themes.current.sprites.objects.draw(r, adv.itemIcon(tool), heartsEnd, 0);
    c.restore();
    heartsEnd += 17;
  }
  // Boutons Quêtes et Sac, centrés entre les cœurs et les compteurs.
  const gap = x - heartsEnd;
  const active = adv.quests.journal().filter((q) => q.status === 'active').length;
  const wide = gap >= 110;
  const qLabel = wide ? `Quêtes ${active}` : `${active}`;
  const qw = Math.ceil(r.measure(qLabel, 7, s.font)) + 16;
  const used = adv.bagItems().length;
  const cap = adv.bagCapacity();
  const bw = 40;
  const total = qw + 4 + bw;
  const start = Math.round(Math.max(heartsEnd + 2, (heartsEnd + x) / 2 - total / 2));
  const button = (bx, w, icon, label, color) => {
    r.rect(bx, 2, w, 12, s.border);
    r.rect(bx + 1, 3, w - 2, 10, s.box);
    icons.draw(r, icon, bx + 3, 4);
    r.text(label, bx + 13, 4, { color, size: 7, font: s.font });
  };
  button(start, qw, 'quest', qLabel, s.accent);
  const bx = start + qw + 4;
  button(bx, bw, 'bag', `${used}/${cap}`, used >= cap ? '#ff7a6a' : s.text);
  return {
    quests: { x: start - 2, y: 0, w: qw + 3, h: height },
    bag: { x: bx - 1, y: 0, w: bw + 4, h: height },
  };
}
