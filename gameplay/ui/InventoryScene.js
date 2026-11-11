import { Scene, MenuScene } from '../../engine/index.js';

// Le sac : une grille de cases (10 au départ). Chaque case contient un type d'objet,
// empilé jusqu'à son maximum. Action sur une case : Utiliser / Jeter.
// L'argent, les clés et les indices ne prennent pas de place (ils sont dans le bandeau).

const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const COLS = 5;
const CELL = 26;

export class InventoryScene extends Scene {
  constructor(adv) {
    super();
    this.transparent = true;
    this.adv = adv;
    this.sel = 0;
    this.msg = '';
  }

  get items() {
    return this.adv.bagItems();
  }

  update() {
    const i = this.input;
    const n = this.adv.bagCapacity();
    if (i.pressed('left')) this.sel = (this.sel - 1 + n) % n;
    if (i.pressed('right')) this.sel = (this.sel + 1) % n;
    if (i.pressed('up')) this.sel = (this.sel - COLS + n) % n;
    if (i.pressed('down')) this.sel = (this.sel + COLS) % n;
    if (i.validated()) {
      i.consume('action');
      const entry = this.items[this.sel];
      if (entry) this._actions(entry[0]);
    } else if (i.cancelled() || i.pressed('bag')) {
      i.consume('start');
      this.close();
    }
  }

  _actions(item) {
    const adv = this.adv;
    const def = adv.itemDef(item);
    const options = [];
    if (def.tool) {
      options.push({
        label: adv.state.equipped === item ? 'Déjà équipé' : 'Équiper (bouton Objet)',
        onSelect: (m) => {
          m.close();
          adv.equip(item);
          this.msg = `${cap(adv.itemName(item))} : touche E ou bouton X pour l’utiliser.`;
        },
      });
    }
    if (def.use) {
      options.push({
        label: 'Utiliser',
        onSelect: (m) => {
          m.close();
          const msg = def.use(adv);
          if (msg === false) return;
          adv.state.take(item, 1);
          this.msg = typeof msg === 'string' ? msg : `Tu as utilisé : ${adv.itemName(item)}.`;
        },
      });
    }
    if (!def.quest) {
      options.push({
        label: 'Jeter',
        onSelect: (m) => {
          m.close();
          adv.state.take(item, adv.state.count(item));
          this.game.audio.play('menu_no');
          this.msg = `Tu as jeté : ${adv.itemName(item, true)}.`;
        },
      });
    }
    options.push({ label: 'Retour', onSelect: (m) => m.close() });
    if (options.length === 1) return (this.msg = 'Objet de quête : il ne se jette pas.');
    this.game.scenes.push(new MenuScene({ title: cap(adv.itemName(item)), width: 140, items: options, dimBackground: false }));
  }

  draw(r) {
    const s = this.game.style;
    const th = this.game.themes.current.sprites;
    const adv = this.adv;
    const n = adv.bagCapacity();
    const rows = Math.ceil(n / COLS);
    const items = this.items;
    r.withAlpha(0.55, () => r.rect(0, 0, r.width, r.height, '#000'));
    const w = Math.min(224, r.width - 8);
    const gx = Math.round((w - COLS * CELL) / 2) + 2;
    const h = rows * CELL + 84;
    const x = Math.round((r.width - w) / 2);
    const y = Math.max(4, Math.round((r.height - h) / 2));
    r.rect(x, y, w, h, s.box);
    r.strokeRect(x, y, w, h, s.border);
    r.strokeRect(x + 2, y + 2, w - 4, h - 4, s.border);
    r.text(`SAC  ${items.length}/${n}`, r.width / 2, y + 7, { color: s.accent, size: 9, font: s.font, bold: true, align: 'center' });
    for (let k = 0; k < n; k++) {
      const cx = x + gx + (k % COLS) * CELL;
      const cy = y + 22 + Math.floor(k / COLS) * CELL;
      r.rect(cx, cy, CELL - 4, CELL - 4, s.dim);
      r.rect(cx + 1, cy + 1, CELL - 6, CELL - 6, s.box);
      const entry = items[k];
      if (entry) {
        th.objects.draw(r, adv.itemIcon(entry[0]), cx + 3, cy + 2);
        if (entry[1] > 1) r.text(`${entry[1]}`, cx + CELL - 6, cy + CELL - 12, { color: s.text, size: 6, font: s.font, align: 'right', shadow: '#000' });
      }
      if (k === this.sel) r.strokeRect(cx - 1, cy - 1, CELL - 2, CELL - 2, s.accent, 2);
    }
    const ty = y + 26 + rows * CELL;
    const sel = items[this.sel];
    if (sel) {
      const def = adv.itemDef(sel[0]);
      r.fitText(cap(adv.itemName(sel[0], sel[1] > 1)) + (def.quest ? '  (quête)' : ''), x + 12, ty, w - 24, { color: s.accent, size: 8, font: s.font, bold: true });
      r.textBlock(def.description ?? '', x + 12, ty + 12, w - 24, { color: s.text, size: 7, font: s.font, lineHeight: 9, maxLines: 2 });
    } else r.text('Case vide', x + 12, ty, { color: s.dim, size: 8, font: s.font });
    r.fitText(this.msg || 'Action : utiliser / jeter · B : fermer', x + 12, ty + 33, w - 24, { color: s.dim, size: 6, font: s.font });
  }
}
