import { Scene } from '../../engine/index.js';

const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);

// Boutique : acheter des objets avec l'argent gagné (quêtes, questions, monstres).
// offers : [{ item, price, once?: true }]  — once : un seul exemplaire à vendre.
export class ShopScene extends Scene {
  constructor(adv, { id = 'shop', title = 'Boutique', offers = [], currency = 'coin' }, onClose) {
    super();
    this.transparent = true;
    this.adv = adv;
    this.id = id;
    this.title = title;
    this.offers = offers;
    this.currency = currency;
    this.onClose = onClose;
    this.sel = 0;
    this.msg = 'Que veux-tu acheter ?';
  }

  soldOut(o) {
    return o.once && this.adv.state.flag(`bought:${this.id}:${o.item}`);
  }

  update() {
    const i = this.input;
    const n = this.offers.length + 1; // + « Au revoir »
    if (i.pressed('up')) (this.sel = (this.sel - 1 + n) % n), this.game.audio.play('menu_move');
    if (i.pressed('down')) (this.sel = (this.sel + 1) % n), this.game.audio.play('menu_move');
    if (i.pressed('action')) {
      i.consume('action');
      if (this.sel === this.offers.length) return this._leave();
      this._buy(this.offers[this.sel]);
    } else if (i.pressed('secondary') || i.pressed('start')) {
      i.consume('start');
      this._leave();
    }
  }

  _leave() {
    this.close();
    this.onClose?.();
  }

  _buy(o) {
    const st = this.adv.state;
    const def = this.adv.itemDef(o.item);
    const name = this.adv.itemName(o.item);
    if (this.soldOut(o)) return (this.msg = 'Il n’y en a plus, désolé !'), this.game.audio.play('menu_no');
    if (!def.instant && def.max && st.count(o.item) >= def.max) return (this.msg = `Tu as déjà assez de « ${name} ».`), this.game.audio.play('menu_no');
    if (!st.take(this.currency, o.price)) return (this.msg = this.adv.format(`Pas assez de {ws:${this.currency}}...`)), this.game.audio.play('menu_no');
    this.adv.collect(o.item, 1);
    if (o.once) st.setFlag(`bought:${this.id}:${o.item}`);
    this.msg = `Merci ! Tu as acheté : ${name}.`;
    this.game.audio.play('coin');
  }

  draw(r) {
    const s = this.game.style;
    const th = this.game.themes.current.sprites;
    r.withAlpha(0.55, () => r.rect(0, 0, r.width, r.height, '#000'));
    const x = 16;
    const y = 14;
    const w = r.width - 32;
    const h = r.height - 28;
    r.rect(x, y, w, h, s.box);
    r.strokeRect(x, y, w, h, s.border);
    r.strokeRect(x + 2, y + 2, w - 4, h - 4, s.border);
    r.text(this.title, r.width / 2, y + 8, { color: s.accent, size: 9, font: s.font, bold: true, align: 'center' });
    let ty = y + 28;
    this.offers.forEach((o, i) => {
      const sel = i === this.sel;
      const out = this.soldOut(o);
      const color = out ? s.dim : sel ? s.accent : s.text;
      if (sel) r.text('▶', x + 8, ty + 4, { color: s.accent, size: 8, font: s.font });
      th.objects.draw(r, this.adv.itemIcon(o.item), x + 18, ty);
      r.text(cap(this.adv.itemName(o.item)), x + 38, ty + 4, { color, size: 8, font: s.font });
      r.text(out ? 'épuisé' : String(o.price), x + w - 22, ty + 4, { color, size: 8, font: s.font, align: 'right' });
      if (!out) th.icons.draw(r, this.currency, x + w - 18, ty + 4);
      ty += 20;
    });
    const sel = this.sel === this.offers.length;
    if (sel) r.text('▶', x + 8, ty + 4, { color: s.accent, size: 8, font: s.font });
    r.text('Au revoir', x + 38, ty + 4, { color: sel ? s.accent : s.text, size: 8, font: s.font });
    r.rect(x + 6, y + h - 32, w - 12, 1, s.border);
    r.text(this.msg, x + 10, y + h - 26, { color: s.text, size: 7, font: s.font });
    r.text(this.adv.format(`Tu as ${this.adv.state.count(this.currency)} {ws:${this.currency}}`), x + 10, y + h - 14, { color: s.accent, size: 7, font: s.font });
  }
}
