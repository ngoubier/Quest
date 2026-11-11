import { Scene, wrapText } from '../../engine/index.js';

// Liste des quêtes : celles à faire d'abord (principale ★ en tête), avec leur DIFFICULTÉ,
// l'objectif en cours et les indices déjà révélés ; puis les quêtes terminées.
// Haut/Bas : faire défiler · Action / B : fermer.

export const DIFFICULTY = {
  1: { label: 'Facile', color: '#5adc5a' },
  2: { label: 'Moyenne', color: '#ffd35a' },
  3: { label: 'Difficile', color: '#ff7a6a' },
};

export class QuestLogScene extends Scene {
  constructor(adv) {
    super();
    this.transparent = true;
    this.adv = adv;
    this.scroll = 0;
    this.contentH = 0;
  }

  update() {
    const i = this.input;
    const viewH = this.game.height - 46;
    const max = Math.max(0, this.contentH - viewH);
    if (i.down('down')) this.scroll = Math.min(max, this.scroll + 2);
    if (i.down('up')) this.scroll = Math.max(0, this.scroll - 2);
    if (i.pressed('action') || i.pressed('secondary') || i.pressed('start') || i.pressed('quests')) {
      i.consume('action');
      i.consume('start');
      this.close();
    }
  }

  draw(r) {
    const s = this.game.style;
    const adv = this.adv;
    r.withAlpha(0.55, () => r.rect(0, 0, r.width, r.height, '#000'));
    const x = 6;
    const y = 6;
    const w = r.width - 12;
    const h = r.height - 12;
    r.rect(x, y, w, h, s.box);
    r.strokeRect(x, y, w, h, s.border);
    r.strokeRect(x + 2, y + 2, w - 4, h - 4, s.border);
    const list = adv.quests.journal();
    const active = list.filter((q) => q.status === 'active');
    const done = list.filter((q) => q.status === 'done');
    r.text(`QUÊTES À FAIRE (${active.length})`, r.width / 2, y + 7, { color: s.accent, size: 9, font: s.font, bold: true, align: 'center' });
    r.rect(x + 6, y + 21, w - 12, 1, s.border);

    // Zone qui défile
    const top = y + 26;
    const viewH = h - 34;
    const c = r.ctx;
    c.save();
    c.beginPath();
    c.rect(x + 3, top, w - 6, viewH);
    c.clip();
    let ty = top + 2 - this.scroll;
    const tx = x + 10;
    const wrapW = w - 26;
    const lines = (text, size) => wrapText(text, wrapW, (t) => r.measure(t, size, s.font));

    if (!active.length) {
      for (const l of lines('Aucune quête en cours. Parle aux habitants pour en trouver !', 7)) {
        r.text(l, tx, ty, { color: s.dim, size: 7, font: s.font });
        ty += 10;
      }
      ty += 6;
    }
    for (const q of active) {
      const def = adv.quests.def(q.id);
      const d = DIFFICULTY[def.difficulty ?? 1];
      const level = def.difficulty ?? 1;
      // Titre
      r.text(`${q.kind === 'main' ? '★ ' : ''}${adv.format(q.title)}`, tx, ty, { color: q.kind === 'main' ? s.accent : s.text, size: 8, font: s.font, bold: true });
      ty += 11;
      // Difficulté : ●●○ Moyenne
      for (let k = 0; k < 3; k++) r.rect(tx + 4 + k * 7, ty + 1, 5, 5, k < level ? d.color : s.dim);
      r.text(d.label, tx + 28, ty, { color: d.color, size: 7, font: s.font, bold: true });
      if (q.kind === 'main') r.text('principale', tx + w - 26, ty, { color: s.dim, size: 6, font: s.font, align: 'right' });
      ty += 10;
      // Objectif
      if (q.goal) {
        for (const l of lines(`→ ${adv.format(q.goal)}`, 7)) {
          r.text(l, tx + 4, ty, { color: s.text, size: 7, font: s.font });
          ty += 9;
        }
      }
      for (const hnt of q.hints ?? []) {
        for (const l of lines(`💡 ${adv.format(hnt)}`, 6)) {
          r.text(l, tx + 8, ty, { color: s.accent, size: 6, font: s.font });
          ty += 8;
        }
      }
      ty += 5;
      r.rect(tx, ty - 3, wrapW, 1, s.dim);
      ty += 2;
    }
    if (done.length) {
      r.text(`Terminées (${done.length})`, tx, ty, { color: s.dim, size: 7, font: s.font, bold: true });
      ty += 10;
      for (const q of done) {
        r.text(`✓ ${adv.format(q.title)}`, tx + 4, ty, { color: s.dim, size: 7, font: s.font });
        ty += 9;
      }
    }
    this.contentH = ty + this.scroll - top;
    c.restore();

    // Indication de défilement
    if (this.contentH > viewH) {
      const k = viewH / this.contentH;
      const bar = Math.max(10, Math.round(viewH * k));
      const pos = Math.round((this.scroll / (this.contentH - viewH)) * (viewH - bar));
      r.rect(x + w - 5, top + pos, 2, bar, s.border);
    }
  }
}
