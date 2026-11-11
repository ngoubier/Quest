import { Scene } from '../../engine/index.js';

// Journal des quêtes : principale (★) et secondaires, avec l'objectif en cours.
export class QuestLogScene extends Scene {
  constructor(adv) {
    super();
    this.transparent = true;
    this.adv = adv;
  }

  update() {
    const i = this.input;
    if (i.pressed('action') || i.pressed('secondary') || i.pressed('start')) {
      i.consume('action');
      i.consume('start');
      this.close();
    }
  }

  draw(r) {
    const s = this.game.style;
    r.withAlpha(0.55, () => r.rect(0, 0, r.width, r.height, '#000'));
    const x = 12;
    const y = 12;
    const w = r.width - 24;
    const h = r.height - 24;
    r.rect(x, y, w, h, s.box);
    r.strokeRect(x, y, w, h, s.border);
    r.strokeRect(x + 2, y + 2, w - 4, h - 4, s.border);
    r.text('JOURNAL DES QUÊTES', r.width / 2, y + 8, { color: s.accent, size: 8, font: s.font, bold: true, align: 'center' });
    const list = this.adv.quests.journal();
    let ty = y + 26;
    if (!list.length) r.text("Aucune quête pour l'instant. Parle aux habitants !", x + 10, ty, { color: s.dim, size: 7, font: s.font });
    for (const q of list) {
      if (ty > y + h - 20) break;
      const done = q.status === 'done';
      const mark = q.kind === 'main' ? '★' : '•';
      r.text(`${mark} ${q.title}${done ? '  ✓' : ''}`, x + 10, ty, { color: done ? s.dim : q.kind === 'main' ? s.accent : s.text, size: 8, font: s.font, bold: q.kind === 'main' });
      ty += 11;
      if (q.goal) {
        r.text(`→ ${this.adv.format(q.goal)}`, x + 20, ty, { color: s.text, size: 7, font: s.font });
        ty += 11;
        for (const h of q.hints ?? []) {
          r.text(`💡 ${this.adv.format(h)}`, x + 26, ty, { color: s.accent, size: 6, font: s.font });
          ty += 9;
        }
        ty += 2;
      } else ty += 3;
    }
  }
}
