// Bandeau d'informations : cœurs à gauche, boutons Quêtes et Sac au centre, compteurs à droite.
// Icônes 8x8 attendues (planche 'icons') : heart_full, heart_half, heart_empty, quest, bag, et une par compteur.
// Renvoie les zones des boutons (pour le toucher / clic) : { quests, bag }.
//
// La taille suit la hauteur du bandeau : 16 = normal ; 20 sur mobile (icônes, texte et
// boutons 25 % plus grands, plus faciles à lire et à toucher).
// objective: true => s'il reste de la place (écran large sur PC), l'objectif de la quête
// principale en cours s'affiche au centre.

export function drawHud(r, adv, { height = 16, counters = ['coin', 'key'], objective = false } = {}) {
  const game = adv.game;
  const s = game.style;
  const icons = game.themes.current.sprites.icons;
  const st = adv.state;
  const k = height / 16; // facteur de taille
  const pad = Math.round(4 * k);
  const iy = Math.round((height - 8 * k) / 2);
  const icon = (name, x, y) => icons.draw(r, name, x, y, { scale: k });
  r.rect(0, 0, r.width, height, s.box);
  r.rect(0, height - 1, r.width, 1, s.border);

  // Cœurs : 2 points de vie par cœur.
  const hearts = Math.ceil(st.maxHp / 2);
  const hStep = Math.round(9 * k);
  for (let i = 0; i < hearts; i++) {
    const v = st.hp - i * 2;
    const frame = v >= 2 ? 'heart_full' : v === 1 ? 'heart_half' : 'heart_empty';
    icon(frame, pad + i * hStep, iy);
  }

  // Compteurs, alignés à droite (calculés d'abord pour placer le bouton Sac dans l'espace libre).
  const fs = 8 * k;
  let x = r.width - pad;
  for (const item of [...counters].reverse()) {
    const txt = String(st.count(item)).padStart(item === 'coin' ? 3 : 1, '0');
    const w = r.measure(txt, fs, s.font);
    x -= w;
    r.text(txt, x, iy, { color: s.text, size: fs, font: s.font });
    x -= Math.round(10 * k);
    icon(item, x, iy);
    x -= Math.round(7 * k);
  }
  // Objet équipé (bouton Objet), juste après les cœurs.
  let heartsEnd = pad + hearts * hStep;
  const tool = adv.equipped;
  if (tool) {
    const side = height - 2;
    r.rect(heartsEnd + 1, 1, side, side, s.border);
    r.rect(heartsEnd + 2, 2, side - 2, side - 2, s.box);
    const c = r.ctx;
    c.save();
    c.beginPath();
    c.rect(heartsEnd + 2, 2, side - 2, side - 2);
    c.clip();
    game.themes.current.sprites.objects.draw(r, adv.itemIcon(tool), heartsEnd + (side - 16) / 2 + 1, (height - 16) / 2);
    c.restore();
    // Objet qui s'use (bombes) : nombre restant dans le coin.
    if (adv.itemDef(tool).showCount) {
      const n = String(st.count(tool));
      const tw = Math.ceil(r.measure(n, 6, s.font)) + 2;
      r.rect(heartsEnd + side - tw, height - 8, tw, 7, '#000');
      r.text(n, heartsEnd + side - tw + 1, height - 8, { color: '#fff', size: 6, font: s.font });
    }
    heartsEnd += side + 3;
  }
  // Boutons Quêtes et Sac, centrés entre les cœurs et les compteurs.
  const gap = x - heartsEnd;
  const active = adv.quests.journal().filter((q) => q.status === 'active').length;
  const wide = gap >= 110 * k;
  const qLabel = wide ? `Quêtes ${active}` : `${active}`;
  const bs = 7 * k; // texte des boutons
  const qw = Math.ceil(r.measure(qLabel, bs, s.font)) + Math.round(16 * k);
  const used = adv.bagItems().length;
  const cap = adv.bagCapacity();
  const bw = Math.round(40 * k);
  const bh = height - Math.round(4 * k);
  const by = Math.round(2 * k);
  const total = qw + 4 + bw;
  // Objectif en cours (écran large) : les boutons se rangent à gauche, l'objectif prend le reste.
  const goal = objective ? currentGoal(adv) : null;
  const showGoal = goal && gap - total >= 90;
  const start = showGoal ? heartsEnd + 4 : Math.round(Math.max(heartsEnd + 2, (heartsEnd + x) / 2 - total / 2));
  const button = (bx, w, ic, label, color) => {
    r.rect(bx, by, w, bh, s.border);
    r.rect(bx + 1, by + 1, w - 2, bh - 2, s.box);
    icon(ic, bx + Math.round(3 * k), iy);
    r.text(label, bx + Math.round(13 * k), iy + (k > 1 ? 1 : 0), { color, size: bs, font: s.font });
  };
  button(start, qw, 'quest', qLabel, s.accent);
  const bx = start + qw + 4;
  button(bx, bw, 'bag', `${used}/${cap}`, used >= cap ? '#ff7a6a' : s.text);
  if (showGoal) {
    const gx = bx + bw + 8;
    const gw = x - 6 - gx;
    r.fitText(`▸ ${goal}`, gx, iy + 1, gw, { color: s.dim, size: 7, minSize: 6, font: s.font });
  }
  return {
    quests: { x: start - 2, y: 0, w: qw + 3, h: height },
    bag: { x: bx - 1, y: 0, w: bw + 4, h: height },
  };
}

/** Objectif de la quête active la plus importante (principale d'abord). */
function currentGoal(adv) {
  const q = adv.quests.journal().find((j) => j.status === 'active' && j.goal);
  return q ? q.goal : null;
}
