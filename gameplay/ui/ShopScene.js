import { Scene } from '../../engine/index.js';

// Magasin : choisir un article (Haut/Bas), la quantité (Gauche/Droite), acheter (Action).
// Les prix sont affichés en euros : c'est aussi un exercice de calcul !
// offers : [{ item, price, once?: true }]  — once : un seul exemplaire à vendre.

const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const ROW = 17;
const VISIBLE = 6;

export class ShopScene extends Scene {
  constructor(adv, { id = 'shop', title = 'Magasin', offers = [], currency = 'coin' }, onClose) {
    super();
    this.transparent = true;
    this.adv = adv;
    this.id = id;
    this.title = title;
    this.offers = offers;
    this.currency = currency;
    this.onClose = onClose;
    this.sel = 0;
    this.qty = 1;
    this.scroll = 0;
    this.msg = 'Que veux-tu acheter ?';
  }

  soldOut(o) {
    return o.once && this.adv.state.flag(`bought:${this.id}:${o.item}`);
  }

  /** Quantité maximale achetable pour cet article (argent, maximum, place dans le sac). */
  maxQty(o) {
    const adv = this.adv;
    const st = adv.state;
    const def = adv.itemDef(o.item);
    if (this.soldOut(o)) return 0;
    if (!adv.canStore(o.item)) return 0;
    let m = o.once ? 1 : 9;
    if (!def.instant && def.max) m = Math.min(m, def.max - st.count(o.item));
    return Math.max(0, m);
  }

  update() {
    const i = this.input;
    const n = this.offers.length + 1; // + « Au revoir »
    const move = (d) => {
      this.sel = (this.sel + d + n) % n;
      this.qty = 1;
      this.game.audio.play('menu_move');
      if (this.sel < this.scroll) this.scroll = this.sel;
      if (this.sel >= this.scroll + VISIBLE) this.scroll = this.sel - VISIBLE + 1;
    };
    if (i.pressed('up')) move(-1);
    if (i.pressed('down')) move(1);
    const o = this.offers[this.sel];
    if (o && (i.pressed('left') || i.pressed('right'))) {
      const max = Math.max(1, this.maxQty(o));
      this.qty = Math.min(max, Math.max(1, this.qty + (i.pressed('right') ? 1 : -1)));
      this.game.audio.play('menu_move');
    }
    if (i.pressed('action')) {
      i.consume('action');
      if (!o) return this._leave();
      this._buy(o);
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
    const adv = this.adv;
    const st = adv.state;
    const def = adv.itemDef(o.item);
    const name = adv.itemName(o.item, this.qty > 1);
    const no = (m) => ((this.msg = m), this.game.audio.play('menu_no'));
    if (this.soldOut(o)) return no('Il n’y en a plus, désolé !');
    if (!adv.canStore(o.item)) return no('Ton sac est plein ! Libère une place.');
    if (!def.instant && def.max && st.count(o.item) + this.qty > def.max) return no(`Tu ne peux pas porter plus de ${def.max} « ${adv.itemName(o.item, true)} ».`);
    const total = o.price * this.qty;
    if (st.count(this.currency) < total) return no(`Il te manque ${total - st.count(this.currency)} €.`);
    st.take(this.currency, total);
    adv.collect(o.item, this.qty, { force: true });
    if (o.once) st.setFlag(`bought:${this.id}:${o.item}`);
    this.msg = `Merci ! ${this.qty > 1 ? `${this.qty} × ` : ''}${cap(name)} pour ${total} €.`;
    this.qty = 1;
    this.game.audio.play('coin');
  }

  draw(r) {
    const s = this.game.style;
    const th = this.game.themes.current.sprites;
    const adv = this.adv;
    r.withAlpha(0.55, () => r.rect(0, 0, r.width, r.height, '#000'));
    const x = 10;
    const y = 8;
    const w = r.width - 20;
    const h = r.height - 16;
    r.rect(x, y, w, h, s.box);
    r.strokeRect(x, y, w, h, s.border);
    r.strokeRect(x + 2, y + 2, w - 4, h - 4, s.border);
    r.text(this.title, x + 10, y + 7, { color: s.accent, size: 9, font: s.font, bold: true });
    r.text(`Sac ${adv.bagItems().length}/${adv.bagCapacity()}`, x + w - 10, y + 8, { color: s.dim, size: 7, font: s.font, align: 'right' });
    let ty = y + 24;
    const rows = [...this.offers, null].slice(this.scroll, this.scroll + VISIBLE);
    rows.forEach((o, k) => {
      const idx = this.scroll + k;
      const sel = idx === this.sel;
      if (!o) {
        if (sel) r.text('▶', x + 6, ty + 4, { color: s.accent, size: 8, font: s.font });
        r.text('Au revoir', x + 34, ty + 4, { color: sel ? s.accent : s.text, size: 8, font: s.font });
        return;
      }
      const out = this.soldOut(o);
      const color = out ? s.dim : sel ? s.accent : s.text;
      if (sel) r.text('▶', x + 6, ty + 4, { color: s.accent, size: 8, font: s.font });
      th.objects.draw(r, adv.itemIcon(o.item), x + 14, ty);
      r.text(cap(adv.itemName(o.item)), x + 34, ty + 4, { color, size: 8, font: s.font });
      if (sel && !out) r.text(`◀ ${this.qty} ▶`, x + 146, ty + 4, { color: s.accent, size: 8, font: s.font });
      r.text(out ? 'épuisé' : `${o.price} €`, x + w - 10, ty + 4, { color, size: 8, font: s.font, align: 'right' });
      ty += ROW;
    });
    const o = this.offers[this.sel];
    const by = y + h - 40;
    r.rect(x + 6, by, w - 12, 1, s.border);
    if (o) {
      const d = adv.itemDef(o.item);
      r.text(d.description ?? '', x + 10, by + 4, { color: s.dim, size: 7, font: s.font });
      if (!this.soldOut(o)) r.text(`Total : ${this.qty} × ${o.price} € = ${this.qty * o.price} €`, x + 10, by + 14, { color: s.text, size: 7, font: s.font });
    }
    r.text(this.msg, x + 10, by + 25, { color: s.text, size: 7, font: s.font });
    r.text(`Tu as ${adv.state.count(this.currency)} €`, x + w - 10, by + 25, { color: s.accent, size: 7, font: s.font, align: 'right' });
  }
}
