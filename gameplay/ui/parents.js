import { Scene, MenuScene, TextField, wrapText } from '../../engine/index.js';
import { buildReport, formatPlayTime } from '../quiz/report.js';

// ESPACE PARENTS : protégé par un code à 4 chiffres choisi par le parent.
// Contient le bilan (disponible à la fin du jeu, ou toujours selon la config)
// et les réglages réservés aux adultes (âge de l'enfant, code).

const CLASSES = { 6: 'CP', 7: 'CE1', 8: 'CE2', 9: 'CM1', 10: 'CM2' };

/**
 * @param {object} o
 * @param {import('../../engine/index.js').Game} o.game
 * @param {import('../../engine/index.js').SaveStore} o.saves  stockage (le code y est rangé)
 * @param {import('../state/GameState.js').GameState} o.state  partie concernée
 * @param {object[]} [o.questDefs]
 * @param {'end'|'always'} [o.reportWhen='end']
 * @param {(state) => void} [o.onChange]  appelé après une modification (pour sauvegarder)
 */
export function openParentSpace({ game, saves, state, questDefs = [], reportWhen = 'end', onChange }) {
  const stored = saves.load('parent')?.data?.code;
  const menu = () =>
    game.scenes.push(
      new MenuScene({
        title: 'ESPACE PARENTS',
        width: 200,
        items: [
          {
            label: 'Bilan de l’enfant',
            onSelect: () => {
              if (reportWhen === 'end' && !state.flag('game_finished')) {
                game.scenes.push(new MessageScene('Le bilan sera disponible à la fin du jeu.'));
              } else game.scenes.push(new ReportScene(buildReport(state, { questDefs })));
            },
          },
          {
            label: () => `Âge de l’enfant : ${state.profile.age} ans (${CLASSES[state.profile.age]})`,
            onSelect: () => {
              state.profile.age = state.profile.age >= 10 ? 6 : state.profile.age + 1;
              onChange?.(state);
            },
          },
          { label: 'Changer le code', onSelect: () => game.scenes.push(new CodeScene({ mode: 'create', onOk: (code) => saves.save('parent', { code }) })) },
          { label: 'Retour', onSelect: (m) => m.close() },
        ],
      }),
    );
  if (!stored) {
    game.scenes.push(
      new CodeScene({
        mode: 'create',
        onOk: (code) => {
          saves.save('parent', { code });
          menu();
        },
      }),
    );
  } else game.scenes.push(new CodeScene({ mode: 'check', expected: stored, onOk: menu }));
}

/** Saisie du code parent. */
export class CodeScene extends Scene {
  constructor({ mode, expected = null, onOk }) {
    super();
    this.transparent = true;
    this.mode = mode;
    this.expected = expected;
    this.onOk = onOk;
    this.error = '';
  }

  enter() {
    this.field = new TextField(this.game);
    this.field.open({ x: 88, y: 112, w: 80, h: 20 }, { onSubmit: (v) => this._submit(v), inputMode: 'numeric', maxLength: 4, placeholder: '····' });
  }

  exit() {
    this.field.close();
  }

  _submit(v) {
    const code = v.trim();
    if (!/^\d{4}$/.test(code)) return (this.error = 'Le code doit comporter 4 chiffres.');
    if (this.mode === 'check' && code !== this.expected) {
      this.field.el.value = '';
      this.game.audio.play('menu_no');
      return (this.error = 'Code incorrect.');
    }
    this.game.audio.play('menu_ok');
    this.close();
    this.onOk(code);
  }

  update() {
    const i = this.input;
    if (i.pressed('action') && this.field.value) this._submit(this.field.value);
    if (i.pressed('secondary') || i.pressed('start')) {
      i.consume('start');
      this.close();
    }
    i.consume('action');
  }

  draw(r) {
    const s = this.game.style;
    this.field.place();
    r.withAlpha(0.7, () => r.rect(0, 0, r.width, r.height, '#000'));
    const x = 24;
    const y = 36;
    const w = r.width - 48;
    const h = 120;
    r.rect(x, y, w, h, s.box);
    r.strokeRect(x, y, w, h, s.border);
    r.text('ESPACE PARENTS', r.width / 2, y + 10, { color: s.accent, size: 9, font: s.font, bold: true, align: 'center' });
    const msg = this.mode === 'create' ? ['Choisissez un code à 4 chiffres.', 'Il protège le bilan et les réglages.'] : ['Entrez le code parent.'];
    msg.forEach((m, i) => r.text(m, r.width / 2, y + 30 + i * 11, { color: s.text, size: 7, font: s.font, align: 'center' }));
    if (this.error) r.text(this.error, r.width / 2, y + 102, { color: '#ff7a6a', size: 7, font: s.font, align: 'center' });
  }
}

/** Petit message qui se ferme sur n'importe quel bouton. */
export class MessageScene extends Scene {
  constructor(text) {
    super();
    this.transparent = true;
    this.text = text;
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
    const lines = wrapText(this.text, 180, (t) => r.measure(t, 8, s.font));
    const h = lines.length * 12 + 20;
    const y = (r.height - h) / 2;
    r.rect(30, y, r.width - 60, h, s.box);
    r.strokeRect(30, y, r.width - 60, h, s.border);
    lines.forEach((l, i) => r.text(l, r.width / 2, y + 10 + i * 12, { color: s.text, size: 8, font: s.font, align: 'center' }));
  }
}

/** Le bilan, en plusieurs pages (Gauche/Droite). */
export class ReportScene extends Scene {
  constructor(report) {
    super();
    this.report = report;
    this.page = 0;
    const perPage = 6;
    this.missedPages = Math.max(1, Math.ceil(report.missed.length / perPage));
    this.perPage = perPage;
  }

  get pages() {
    return 2 + this.missedPages;
  }

  update() {
    const i = this.input;
    if (i.pressed('right') || i.pressed('down')) this.page = Math.min(this.pages - 1, this.page + 1);
    if (i.pressed('left') || i.pressed('up')) this.page = Math.max(0, this.page - 1);
    if (i.pressed('secondary') || i.pressed('start') || (i.pressed('action') && this.page === this.pages - 1)) {
      i.consume('action');
      i.consume('start');
      this.close();
    } else if (i.pressed('action')) this.page++;
    i.consume('action');
  }

  draw(r) {
    const s = this.game.style;
    const rep = this.report;
    const W = r.width;
    r.rect(0, 0, W, r.height, s.box);
    r.strokeRect(2, 2, W - 4, r.height - 4, s.border);
    const titles = ['Résumé', 'Par matière', 'À retravailler'];
    r.text(`BILAN · ${titles[Math.min(this.page, 2)]}`, 10, 9, { color: s.accent, size: 9, font: s.font, bold: true });
    r.text(`${this.page + 1}/${this.pages}`, W - 10, 10, { color: s.dim, size: 7, font: s.font, align: 'right' });
    r.rect(8, 24, W - 16, 1, s.border);
    const line = (t, y, opts = {}) => r.text(t, 14, y, { color: s.text, size: 8, font: s.font, ...opts });
    const pct = (x) => `${Math.round(x * 100)} %`;

    if (this.page === 0) {
      let y = 34;
      line(`Âge : ${rep.age} ans · Temps de jeu : ${formatPlayTime(rep.playTime)}`, y);
      line(`Questions : ${rep.total} · Bonnes réponses : ${rep.ok} (${pct(rep.rate)})`, (y += 16));
      line(`Quêtes terminées : ${rep.questsDone} / ${rep.questsTotal}`, (y += 16));
      line(`Indices utilisés : ${rep.hintsUsed}`, (y += 16));
      line(`Erreurs corrigées ensuite : ${rep.fixed}`, (y += 16));
      if (rep.strongest) line(`Point fort : ${rep.strongest.name} (${pct(rep.strongest.rate)})`, (y += 22), { color: '#5adc5a' });
      if (rep.weakest) line(`À travailler : ${rep.weakest.name} (${pct(rep.weakest.rate)})`, (y += 16), { color: '#ffb05a' });
      if (!rep.total) line('Aucune question posée pour le moment.', (y += 22), { color: s.dim });
    } else if (this.page === 1) {
      let y = 36;
      if (!rep.subjects.length) line('Aucune donnée.', y, { color: s.dim });
      for (const sub of rep.subjects) {
        line(sub.name, y, { size: 8 });
        const bx = 104;
        const bw = 90;
        r.rect(bx, y + 1, bw, 7, s.dim);
        r.rect(bx, y + 1, Math.round(bw * sub.rate), 7, sub.rate >= 0.75 ? '#5adc5a' : sub.rate >= 0.5 ? '#ffd35a' : '#ff7a6a');
        r.text(`${sub.ok}/${sub.total}`, W - 12, y, { color: s.text, size: 7, font: s.font, align: 'right' });
        y += 20;
      }
    } else {
      const start = (this.page - 2) * this.perPage;
      const items = rep.missed.slice(start, start + this.perPage);
      let y = 32;
      if (!items.length) line('Aucune erreur à retravailler. Bravo !', y + 4, { color: '#5adc5a' });
      for (const m of items) {
        const q = (m.prompt ?? '').length > 46 ? `${m.prompt.slice(0, 45)}…` : m.prompt;
        r.text(q, 12, y, { color: s.text, size: 7, font: s.font });
        r.text(`→ ${m.answer}${m.wrong > 1 ? `   (×${m.wrong})` : ''}`, 20, y + 9, { color: s.accent, size: 7, font: s.font });
        y += 25;
      }
    }
    r.text('Gauche/Droite : pages · B : fermer', W / 2, r.height - 12, { color: s.dim, size: 6, font: s.font, align: 'center' });
  }
}
