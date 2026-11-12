import { Scene } from '../../engine/index.js';

// PLAN DE LA CARTE (ex. plan du labyrinthe acheté au magasin) : les murs, les sols, le héros
// (point clignotant) et les coffres pas encore ouverts. N'importe quel bouton le referme.

export class MiniMapScene extends Scene {
  constructor(adv, { title = 'Plan' } = {}) {
    super();
    this.transparent = true;
    this.adv = adv;
    this.title = title;
    this.t = 0;
  }

  update(dt) {
    this.t += dt;
    const i = this.input;
    if (this.t > 0.2 && (i.validated() || i.cancelled() || i.pressed('start') || i.tappedIn({ x: 0, y: 0, w: 9999, h: 9999 }))) {
      i.consume('action');
      i.consumeTaps();
      this.close();
    }
  }

  draw(r) {
    const s = this.game.style;
    const adv = this.adv;
    const tm = adv.world.tilemap;
    r.withAlpha(0.8, () => r.rect(0, 0, r.width, r.height, '#000'));
    const cell = Math.max(2, Math.floor(Math.min((r.width - 16) / tm.width, (r.height - 40) / tm.height)));
    const w = tm.width * cell;
    const h = tm.height * cell;
    const x0 = Math.round((r.width - w) / 2);
    const y0 = Math.round((r.height - h) / 2) + 8;
    r.fitText(this.title, r.width / 2, y0 - 14, r.width - 8, { color: s.accent, size: 8, font: s.font, bold: true, align: 'center' });
    r.rect(x0 - 2, y0 - 2, w + 4, h + 4, s.border);
    for (let ty = 0; ty < tm.height; ty++) {
      for (let tx = 0; tx < tm.width; tx++) {
        const pit = tm.propAt(tx, ty, 'pit');
        const col = pit ? '#20140c' : tm.isSolidTile(tx, ty) ? (tm.propAt(tx, ty, 'bombable') ? '#7a6a5a' : '#3a3442') : '#d8ccb0';
        r.rect(x0 + tx * cell, y0 + ty * cell, cell, cell, col);
      }
    }
    for (const e of adv.world.entities) {
      if (e.dead) continue;
      const mark = e.has('chest') && e.present && !e.opened ? '#ffd35a' : e.has('locked') ? '#8a5a2a' : null;
      if (mark) r.rect(x0 + Math.floor(e.cx / tm.tileSize) * cell, y0 + Math.floor(e.cy / tm.tileSize) * cell, cell, cell, mark);
    }
    if (Math.floor(this.t * 4) % 2 === 0) {
      const h0 = adv.hero;
      r.rect(x0 + Math.floor(h0.cx / tm.tileSize) * cell - 1, y0 + Math.floor(h0.cy / tm.tileSize) * cell - 1, cell + 2, cell + 2, '#3ac46a');
    }
    r.fitText('Vert : toi · Jaune : coffre · Gris clair : mur fissuré', r.width / 2, y0 + h + 4, r.width - 8, { color: s.dim, size: 6, font: s.font, align: 'center' });
  }
}
