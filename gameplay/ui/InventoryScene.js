import { Scene } from '../../engine/index.js';

const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);

// Le sac : liste des objets possédés.
export class InventoryScene extends Scene {
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
    const th = this.game.themes.current.sprites;
    r.withAlpha(0.55, () => r.rect(0, 0, r.width, r.height, '#000'));
    const x = 24;
    const y = 16;
    const w = r.width - 48;
    const h = r.height - 32;
    r.rect(x, y, w, h, s.box);
    r.strokeRect(x, y, w, h, s.border);
    r.strokeRect(x + 2, y + 2, w - 4, h - 4, s.border);
    r.text('SAC', r.width / 2, y + 8, { color: s.accent, size: 9, font: s.font, bold: true, align: 'center' });
    const items = Object.entries(this.adv.state.items).filter(([, n]) => n > 0);
    if (!items.length) r.text('Ton sac est vide.', r.width / 2, y + 50, { color: s.dim, size: 8, font: s.font, align: 'center' });
    items.slice(0, 7).forEach(([item, n], i) => {
      const ty = y + 26 + i * 19;
      th.objects.draw(r, this.adv.itemIcon(item), x + 12, ty);
      r.text(cap(this.adv.itemName(item, n > 1)), x + 34, ty + 4, { color: s.text, size: 8, font: s.font });
      r.text(`× ${n}`, x + w - 12, ty + 4, { color: s.accent, size: 8, font: s.font, align: 'right' });
    });
  }
}
