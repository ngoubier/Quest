import { Scene } from '../../engine/index.js';
import { drawPanel } from '../../engine/index.js';

// Magasin avec panier : choisir un article (Haut/Bas), sa quantité (Gauche/Droite, à partir de 0),
// puis « Payer » pour tout acheter d'un coup. La bourse est affichée en grand en haut,
// et le total du panier est posé sous la colonne « Total », comme une addition.
// Les prix sont en euros : c'est aussi un exercice de calcul !
// offers : [{ item, price, once?: true }]  — once : un seul exemplaire à vendre.

const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const ROW = 17;
const TOO_EXPENSIVE = '#ff7466';

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
    this.scroll = 0;
    this.visible = 4;
    this.cart = offers.map(() => 0); // quantité choisie pour chaque article
    this.msg = null; // { text, bad } : réponse du marchand après une action
  }

  /** Index des deux boutons du bas, après les articles. */
  get payIndex() {
    return this.offers.length;
  }

  get leaveIndex() {
    return this.offers.length + 1;
  }

  soldOut(o) {
    return o.once && this.adv.state.flag(`bought:${this.id}:${o.item}`);
  }

  /** Total du panier, en euros. */
  total() {
    return this.offers.reduce((s, o, k) => s + o.price * this.cart[k], 0);
  }

  /** Nombre d'articles dans le panier. */
  count() {
    return this.cart.reduce((s, q) => s + q, 0);
  }

  /** L'article prendrait-il une nouvelle case dans le sac ? */
  _needsSlot(item) {
    const adv = this.adv;
    return adv.inBag(item) && adv.state.count(item) === 0;
  }

  /** Cases du sac encore libres, sans compter les nouveaux objets déjà dans le panier (sauf `skip`). */
  _freeSlots(skip = -1) {
    const adv = this.adv;
    const taken = this.offers.filter((o, k) => k !== skip && this.cart[k] > 0 && this._needsSlot(o.item)).length;
    return adv.bagCapacity() - adv.bagItems().length - taken;
  }

  /** Quantité maximale pour cet article (exemplaire unique, maximum porté). */
  maxQty(o) {
    if (this.soldOut(o)) return 0;
    const def = this.adv.itemDef(o.item);
    let m = o.once ? 1 : 9;
    if (!def.instant && def.max) m = Math.min(m, def.max - this.adv.state.count(o.item));
    return Math.max(0, m);
  }

  /** Change la quantité d'un article du panier ; explique pourquoi si c'est impossible. */
  _changeQty(k, d) {
    const o = this.offers[k];
    const adv = this.adv;
    const q = this.cart[k] + d;
    const no = (text) => ((this.msg = { text, bad: true }), this.game.audio.play('menu_no'));
    if (q < 0) return;
    if (this.soldOut(o)) return no('Il n’y en a plus, désolé !');
    if (q > this.maxQty(o)) {
      if (o.once) return no('Il n’y en a qu’un seul.');
      const def = adv.itemDef(o.item);
      if (def.max && q > def.max - adv.state.count(o.item)) return no(`Tu ne peux pas porter plus de ${def.max} « ${adv.itemName(o.item, true)} ».`);
      return;
    }
    if (d > 0 && this.cart[k] === 0 && this._needsSlot(o.item) && this._freeSlots(k) <= 0) return no('Ton sac est plein ! Libère une place.');
    this.cart[k] = q;
    this.msg = null;
    this.game.audio.play('menu_move');
  }

  update() {
    const i = this.input;
    const n = this.offers.length + 2; // + « Payer » et « Au revoir »
    const move = (d) => {
      this.sel = (this.sel + d + n) % n;
      this.msg = null;
      this.game.audio.play('menu_move');
    };
    if (i.pressed('up')) move(-1);
    if (i.pressed('down')) move(1);
    if (i.pressed('left') || i.pressed('right')) {
      const right = i.pressed('right');
      if (this.sel < this.offers.length) this._changeQty(this.sel, right ? 1 : -1);
      else if (this.sel === this.payIndex && right) move(1);
      else if (this.sel === this.leaveIndex && !right) move(-1);
    }
    this._keepVisible();
    if (i.validated()) {
      i.consume('action');
      if (this.sel === this.leaveIndex) return this._leave();
      if (this.sel === this.payIndex) return this._pay();
      // Sur un article : en prendre un s'il n'est pas encore choisi, sinon aller à « Payer ».
      if (this.cart[this.sel] === 0) this._changeQty(this.sel, 1);
      else move(this.payIndex - this.sel);
    } else if (i.cancelled()) {
      i.consume('start');
      this._leave();
    }
  }

  _keepVisible() {
    // Sur les boutons du bas, la liste ne bouge pas.
    const k = this.sel;
    if (k < this.offers.length) {
      if (k < this.scroll) this.scroll = k;
      if (k >= this.scroll + this.visible) this.scroll = k - this.visible + 1;
    }
    this.scroll = Math.max(0, Math.min(this.scroll, this.offers.length - this.visible));
  }

  _leave() {
    this.close();
    this.onClose?.();
  }

  _pay() {
    const adv = this.adv;
    const st = adv.state;
    const no = (text) => ((this.msg = { text, bad: true }), this.game.audio.play('menu_no'));
    const total = this.total();
    if (!total) return no('Choisis d’abord des articles avec Gauche / Droite.');
    if (st.count(this.currency) < total) return no(`Il te manque ${total - st.count(this.currency)} €.`);
    if (this._freeSlots() < 0) return no('Ton sac est plein ! Libère une place.');
    st.take(this.currency, total);
    this.offers.forEach((o, k) => {
      const q = this.cart[k];
      if (!q) return;
      adv.collect(o.item, q, { force: true });
      if (o.once) st.setFlag(`bought:${this.id}:${o.item}`);
    });
    const n = this.count();
    this.cart = this.offers.map(() => 0);
    this.msg = { text: `Merci ! ${n} article${n > 1 ? 's' : ''} pour ${total} €.` };
    this.game.audio.play('coin');
  }

  draw(r) {
    const s = this.game.style;
    const th = this.game.themes.current.sprites;
    const adv = this.adv;
    const money = adv.state.count(this.currency);
    r.withAlpha(0.55, () => r.rect(0, 0, r.width, r.height, '#000'));
    const x = 10;
    const y = 8;
    const w = r.width - 20;
    const h = r.height - 16;
    drawPanel(r, x, y, w, h, s);

    // En-tête : titre, sac, et la bourse en grand.
    const moneyTxt = `${money} €`;
    const mw = Math.max(r.measure(moneyTxt, 12, s.font, true), r.measure('TA BOURSE', 5, s.font, true));
    const pw = mw + 30;
    const px = x + w - 8 - pw;
    const py = y + 5;
    r.rect(px, py, pw, 22, 'rgba(0,0,0,0.45)');
    r.strokeRect(px, py, pw, 22, s.accent);
    th.objects.draw(r, adv.itemIcon(this.currency), px + 4, py + 3);
    r.text('TA BOURSE', px + 23, py + 2, { color: s.dim, size: 5, font: s.font, bold: true });
    r.text(moneyTxt, px + 23, py + 8, { color: s.accent, size: 12, font: s.font, bold: true });
    r.fitText(this.title, x + 10, y + 7, px - x - 16, { color: s.accent, size: 9, font: s.font, bold: true });
    r.text(`Sac ${adv.bagItems().length}/${adv.bagCapacity()}`, x + 10, y + 18, { color: s.dim, size: 6, font: s.font });

    // Colonnes (alignées à droite) : prix, combien, total.
    const colTot = x + w - 10;
    const colQty = colTot - 50;
    const colPrice = colQty - 20;
    const hy = y + 30;
    const head = { color: s.dim, size: 5, font: s.font, bold: true };
    r.text('PRIX', colPrice, hy, { ...head, align: 'right' });
    r.text('COMBIEN', colQty, hy, { ...head, align: 'center' });
    r.text('TOTAL', colTot, hy, { ...head, align: 'right' });

    const footY = y + h - 22;
    const listY = hy + 7;
    this.visible = Math.max(1, Math.floor((footY - 22 - listY) / ROW));
    this._keepVisible();
    const rows = this.offers.slice(this.scroll, this.scroll + this.visible);
    rows.forEach((o, j) => {
      const k = this.scroll + j;
      const ty = listY + j * ROW;
      const sel = k === this.sel;
      const out = this.soldOut(o);
      const q = this.cart[k];
      if (sel) {
        r.withAlpha(0.16, () => r.rect(x + 5, ty - 1, w - 10, ROW - 1, s.accent));
        r.strokeRect(x + 5, ty - 1, w - 10, ROW - 1, s.accent);
      }
      const color = out ? s.dim : sel ? s.accent : s.text;
      const o8 = { size: 8, font: s.font };
      th.objects.draw(r, adv.itemIcon(o.item), x + 9, ty);
      r.fitText(cap(adv.itemName(o.item)), x + 28, ty + 4, colPrice - 24 - (x + 28), { ...o8, color, bold: sel });
      r.text(out ? 'épuisé' : `${o.price} €`, colPrice, ty + 4, { ...o8, color, align: 'right' });
      if (out) return;
      const arrow = sel ? s.accent : s.dim;
      r.text('◀', colQty - 12, ty + 4, { ...o8, color: arrow, align: 'center' });
      r.text(String(q), colQty, ty + 4, { ...o8, color: q ? s.text : s.dim, align: 'center', bold: true });
      r.text('▶', colQty + 12, ty + 4, { ...o8, color: arrow, align: 'center' });
      r.text(q ? `${q * o.price} €` : '–', colTot, ty + 4, { ...o8, color: q ? s.accent : s.dim, align: 'right' });
    });

    // Autres articles cachés au-dessus / en dessous.
    const ay = listY + this.visible * ROW;
    const below = this.scroll + this.visible < this.offers.length;
    if (below || this.scroll > 0) r.text(below ? '▼ autres articles' : '▲ autres articles', x + 10, ay + 1, { color: s.dim, size: 5, font: s.font });

    // Total du panier, posé sous la colonne « Total ».
    const total = this.total();
    const over = total > money;
    const totColor = over ? TOO_EXPENSIVE : total ? s.accent : s.dim;
    const totTxt = `${total} €`;
    const tw = Math.max(32, r.measure(totTxt, 12, s.font, true) + 4);
    r.rect(colTot - tw, ay, tw, 1.5, over ? TOO_EXPENSIVE : s.accent);
    r.text(totTxt, colTot, ay + 4, { color: totColor, size: 12, font: s.font, bold: true, align: 'right' });
    const n = this.count();
    r.text(`Panier · ${n} article${n > 1 ? 's' : ''}`, colTot - tw - 6, ay + 8, { color: s.dim, size: 6, font: s.font, align: 'right' });

    // Bas : message ou description, puis les boutons « Payer » et « Au revoir ».
    r.rect(x + 6, footY, w - 12, 1, s.border);
    const btn = (label, bx, idx, enabled) => {
      const bw = r.measure(label, 7, s.font, true) + 10;
      const on = this.sel === idx;
      if (on) r.rect(bx - bw, footY + 5, bw, 12, s.accent);
      else r.strokeRect(bx - bw, footY + 5, bw, 12, enabled ? s.text : s.dim);
      r.text(label, bx - bw / 2, footY + 8, { color: on ? s.box : enabled ? s.text : s.dim, size: 7, font: s.font, bold: true, align: 'center' });
      return bx - bw - 4;
    };
    let bx = btn('Au revoir', x + w - 8, this.leaveIndex, true);
    bx = btn('Payer ✓', bx, this.payIndex, total > 0 && !over);
    const o = this.offers[this.sel];
    let line = this.msg?.text;
    if (!line) line = o ? adv.itemDef(o.item).description ?? '' : this.sel === this.payIndex ? (total ? 'Appuie sur Action pour payer.' : 'Ton panier est vide.') : 'Sortir du magasin.';
    const lineColor = this.msg ? (this.msg.bad ? TOO_EXPENSIVE : s.accent) : s.dim;
    r.fitText(line, x + 10, footY + 8, bx - x - 12, { color: lineColor, size: 7, font: s.font });
  }
}
