import { Scene, MenuScene, TextField, wrapText } from '../../engine/index.js';
import { buildReport, formatPlayTime } from '../quiz/report.js';
import { GameState } from '../state/GameState.js';
import { parentSettings, setParentSettings } from '../profiles.js';
import { SUBJECTS } from '../quiz/QuestionBank.js';
import { PromptScene } from './PromptScene.js';
import { openExport, openImport } from './transfer.js';

// ESPACE PARENTS : protégé par un code à 4 chiffres choisi par le parent.
// Pour chaque enfant (profil) : bilan (à la fin du jeu, ou toujours selon la config),
// âge, suppression. Réglages communs : délai d'attente après un échec, code.

const CLASSES = { 6: 'CP', 7: 'CE1', 8: 'CE2', 9: 'CM1', 10: 'CM2' };
export { CLASSES };
const DELAYS = [1, 2, 5, 10, 15, 30]; // minutes

/**
 * @param {object} o
 * @param {import('../../engine/index.js').Game} o.game
 * @param {import('../../engine/index.js').SaveStore} o.saves
 * @param {import('../profiles.js').ProfileStore} o.profiles
 * @param {object[]} [o.questDefs]
 * @param {'end'|'always'} [o.reportWhen='end']
 * @param {{ profileId: string, state: GameState }} [o.live]  partie en cours (si ouvert depuis le jeu)
 * @param {() => void} [o.saveLive]  sauvegarde la partie en cours (avant un export)
 */
export function openParentSpace({ game, saves, profiles, questDefs = [], reportWhen = 'end', live = null, defaultCooldown = 600, saveLive = null }) {
  const settings = () => parentSettings(saves);

  // État d'un profil : la partie en cours, ou celle sauvegardée.
  const stateOf = (p) => {
    if (live && live.profileId === p.id) return live.state;
    const data = saves.load(profiles.slot(p.id))?.data;
    if (!data) return null;
    const st = new GameState();
    st.load(data.state);
    return st;
  };
  const writeBack = (p, st) => {
    if (live && live.profileId === p.id) return; // sera sauvegardé avec la partie
    const data = saves.load(profiles.slot(p.id))?.data;
    if (data) saves.save(profiles.slot(p.id), { ...data, state: st.toJSON() });
  };

  const profileMenu = (p) =>
    game.scenes.push(
      new MenuScene({
        title: p.name,
        width: 210,
        items: [
          {
            label: 'Bilan',
            onSelect: () => {
              const st = stateOf(p);
              if (!st) return game.scenes.push(new MessageScene('Aucune partie pour ce profil.'));
              if (reportWhen === 'end' && !st.flag('game_finished')) return game.scenes.push(new MessageScene('Le bilan sera disponible à la fin du jeu.'));
              game.scenes.push(new ReportScene(buildReport(st, { questDefs }), p.name));
            },
          },
          {
            label: () => `Âge : ${profiles.get(p.id)?.age ?? p.age} ans (${CLASSES[profiles.get(p.id)?.age ?? p.age]})`,
            onSelect: () => {
              const cur = profiles.get(p.id)?.age ?? p.age;
              const age = cur >= 10 ? 6 : cur + 1;
              profiles.update(p.id, { age });
              const st = stateOf(p);
              if (st) {
                st.profile.age = age;
                writeBack(p, st);
              }
            },
          },
          { label: 'Questions personnelles', onSelect: () => customMenu(p) },
          {
            label: 'Exporter la partie (vers un autre appareil)',
            onSelect: () => {
              if (live && live.profileId === p.id) saveLive?.();
              const save = saves.load(profiles.slot(p.id))?.data;
              if (!save) return game.scenes.push(new MessageScene('Aucune partie à exporter pour ce profil.'));
              const cur = profiles.get(p.id) ?? p;
              openExport(game, { app: 'quest', v: 1, profile: { name: cur.name, age: cur.age }, save, custom: saves.load(`custom-${p.id}`)?.data ?? [] }, { name: cur.name });
            },
          },
          {
            label: 'Supprimer ce profil',
            enabled: () => !(live && live.profileId === p.id),
            onSelect: (m) =>
              game.scenes.push(
                new MenuScene({
                  title: `Supprimer « ${p.name} » et sa partie ?`,
                  width: 230,
                  items: [
                    { label: 'Non', onSelect: (c) => c.close() },
                    { label: 'Oui, supprimer', onSelect: (c) => (c.close(), m.close(), profiles.remove(p.id), mainMenu.refresh?.()) },
                  ],
                }),
              ),
          },
          { label: 'Retour', onSelect: (m) => m.close() },
        ],
      }),
    );

  // ---------------------------------------------------------------- questions des parents
  const customKey = (p) => `custom-${p.id}`;
  const customList = (p) => saves.load(customKey(p))?.data ?? [];
  const saveCustom = (p, list) => saves.save(customKey(p), list);
  const shorten = (t, n = 28) => (t.length > n ? `${t.slice(0, n - 1)}…` : t);
  const addCustom = (p, q) => saveCustom(p, [...customList(p), { id: `c-${Date.now().toString(36)}`, ages: [6, 10], custom: true, ...q }]);

  const customMenu = (p) => {
    const menu = new MenuScene({ title: `Questions de ${p.name}`, width: 230, items: [] });
    const refresh = () => {
      menu.items = [
        ...customList(p).map((q) => ({
          label: shorten(q.type === 'dictation' ? `🔊 ${q.answer}` : `${q.prompt} → ${q.answer}`),
          onSelect: () =>
            game.scenes.push(
              new MenuScene({
                title: 'Supprimer cette question ?',
                width: 210,
                items: [
                  { label: 'Non', onSelect: (m) => m.close() },
                  { label: 'Oui, supprimer', onSelect: (m) => (saveCustom(p, customList(p).filter((x) => x.id !== q.id)), m.close(), refresh()) },
                ],
              }),
            ),
        })),
        { label: '+ Ajouter une dictée (mot prononcé)', onSelect: () => addDictation(p, refresh) },
        { label: '+ Ajouter une question écrite', onSelect: () => addWritten(p, refresh) },
        { label: 'Retour', onSelect: (m) => m.close() },
      ];
      menu.index = Math.min(menu.index, menu.items.length - 1);
    };
    refresh();
    game.scenes.push(menu);
  };

  const addDictation = (p, done) =>
    game.scenes.push(
      new PromptScene({
        title: 'Mot à dicter',
        message: 'Le jeu le prononcera ; l’enfant devra l’écrire.',
        placeholder: 'ex. : chien',
        maxLength: 40,
        fieldWidth: 200,
        onOk: (word) => {
          addCustom(p, { subject: 'dictee', type: 'dictation', prompt: 'Écoute l’énigme, puis écris le mot.', say: `Écris le mot : ${word}.`, answer: word });
          done();
        },
      }),
    );

  const addWritten = (p, done) =>
    game.scenes.push(
      new MenuScene({
        title: 'Matière',
        width: 170,
        items: Object.entries(SUBJECTS).map(([id, label]) => ({
          label,
          onSelect: (m) => {
            m.close();
            game.scenes.push(
              new PromptScene({
                title: 'La question',
                message: 'ex. : Comment s’appelle la capitale de l’Italie ?',
                maxLength: 90,
                fieldWidth: 230,
                onOk: (prompt) =>
                  game.scenes.push(
                    new PromptScene({
                      title: 'La bonne réponse',
                      message: 'Majuscules et accents oubliés seront tolérés.',
                      maxLength: 40,
                      fieldWidth: 200,
                      onOk: (answer) => {
                        addCustom(p, { subject: id, type: 'text', prompt, answer });
                        done();
                      },
                    }),
                  ),
              }),
            );
          },
        })),
      }),
    );

  const mainMenu = new MenuScene({ title: 'ESPACE PARENTS', width: 220, items: [] });
  mainMenu.refresh = () => {
    mainMenu.items = [
      ...profiles.list().map((p) => ({ label: `${p.name} (${p.age} ans)`, onSelect: () => profileMenu(p) })),
      {
        label: () => `Attente après un échec : ${Math.round((settings().cooldown ?? defaultCooldown) / 60)} min`,
        onSelect: () => {
          const cur = Math.round((settings().cooldown ?? defaultCooldown) / 60);
          const next = DELAYS[(DELAYS.indexOf(cur) + 1) % DELAYS.length] ?? 10;
          setParentSettings(saves, { cooldown: next * 60 });
        },
      },
      {
        label: 'Importer une partie',
        onSelect: () =>
          openImport(game, (obj) => {
            if (profiles.isFull) return `Il y a déjà ${profiles.max} profils : supprimez-en un d’abord.`;
            const names = profiles.list().map((x) => x.name);
            let name = obj.profile.name;
            for (let i = 2; names.includes(name); i++) name = `${obj.profile.name} ${i}`;
            const np = profiles.add({ name, age: obj.profile.age });
            const save = obj.save;
            if (save.state?.profile) save.state.profile = { ...save.state.profile, id: np.id, name: np.name };
            saves.save(profiles.slot(np.id), save);
            if (obj.custom?.length) saves.save(`custom-${np.id}`, obj.custom);
            mainMenu.refresh();
            game.scenes.push(new MessageScene(`Partie de ${np.name} importée !`));
            return null;
          }),
      },
      { label: 'Changer le code', onSelect: () => game.scenes.push(new CodeScene({ mode: 'create', onOk: (code) => setParentSettings(saves, { code }) })) },
      { label: 'Retour', onSelect: (m) => m.close() },
    ];
    mainMenu.index = Math.min(mainMenu.index, mainMenu.items.length - 1);
  };
  mainMenu.refresh();
  const open = () => game.scenes.push(mainMenu);

  const stored = settings().code;
  if (!stored) {
    game.scenes.push(
      new CodeScene({
        mode: 'create',
        onOk: (code) => {
          setParentSettings(saves, { code });
          open();
        },
      }),
    );
  } else game.scenes.push(new CodeScene({ mode: 'check', expected: stored, onOk: open }));
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
    this.field.open({ x: Math.round((this.game.width - 80) / 2), y: 112, w: 80, h: 20 }, { onSubmit: (v) => this._submit(v), inputMode: 'numeric', maxLength: 4, placeholder: '····' });
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
    const x = 12;
    const y = 36;
    const w = r.width - 24;
    const h = 120;
    r.rect(x, y, w, h, s.box);
    r.strokeRect(x, y, w, h, s.border);
    r.fitText('ESPACE PARENTS', r.width / 2, y + 10, w - 16, { color: s.accent, size: 9, font: s.font, bold: true, align: 'center' });
    const msg = this.mode === 'create' ? ['Choisissez un code à 4 chiffres.', 'Il protège le bilan et les réglages.'] : ['Entrez le code parent.'];
    r.textBlock(msg.join(' '), r.width / 2, y + 28, w - 16, { color: s.text, size: 7, font: s.font, align: 'center', lineHeight: 9, maxLines: 4 });
    if (this.error) r.fitText(this.error, r.width / 2, y + 102, w - 16, { color: '#ff7a6a', size: 7, font: s.font, align: 'center' });
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
    const lines = wrapText(this.text, r.width - 80, (t) => r.measure(t, 8, s.font));
    const h = lines.length * 12 + 20;
    const y = (r.height - h) / 2;
    r.rect(30, y, r.width - 60, h, s.box);
    r.strokeRect(30, y, r.width - 60, h, s.border);
    lines.forEach((l, i) => r.text(l, r.width / 2, y + 10 + i * 12, { color: s.text, size: 8, font: s.font, align: 'center' }));
  }
}

/** Le bilan, en plusieurs pages (Gauche/Droite). */
export class ReportScene extends Scene {
  constructor(report, name = '') {
    super();
    this.report = report;
    this.name = name;
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
    if (i.cancelled() || (i.validated() && this.page === this.pages - 1)) {
      i.consume('action');
      i.consume('start');
      this.close();
    } else if (i.validated()) this.page++;
    i.consume('action');
  }

  draw(r) {
    const s = this.game.style;
    const rep = this.report;
    const W = r.width;
    r.rect(0, 0, W, r.height, s.box);
    r.strokeRect(2, 2, W - 4, r.height - 4, s.border);
    const titles = ['Résumé', 'Par matière', 'À retravailler'];
    r.fitText(`BILAN ${this.name ? `de ${this.name} ` : ''}· ${titles[Math.min(this.page, 2)]}`, 10, 9, W - 40, { color: s.accent, size: 9, font: s.font, bold: true });
    r.text(`${this.page + 1}/${this.pages}`, W - 10, 10, { color: s.dim, size: 7, font: s.font, align: 'right' });
    r.rect(8, 24, W - 16, 1, s.border);
    const line = (t, y, opts = {}) => r.fitText(t, 12, y, W - 24, { color: s.text, size: r.width < 240 ? 7 : 8, font: s.font, ...opts });
    const pct = (x) => `${Math.round(x * 100)} %`;

    if (this.page === 0) {
      let y = 34;
      line(`Âge : ${rep.age} ans · Temps de jeu : ${formatPlayTime(rep.playTime)}`, y);
      line(`Questions : ${rep.total} · Bonnes réponses : ${rep.ok} (${pct(rep.rate)})`, (y += 16));
      line(`Quêtes terminées : ${rep.questsDone} / ${rep.questsTotal}`, (y += 16));
      line(`Indices utilisés : ${rep.hintsUsed}`, (y += 16));
      line(`Erreurs corrigées ensuite : ${rep.fixed}`, (y += 16));
      line(`Questions à réviser plus tard : ${rep.reviewsPending}`, (y += 16));
      if (rep.strongest) line(`Point fort : ${rep.strongest.name} (${pct(rep.strongest.rate)})`, (y += 22), { color: '#5adc5a' });
      if (rep.weakest) line(`À travailler : ${rep.weakest.name} (${pct(rep.weakest.rate)})`, (y += 16), { color: '#ffb05a' });
      if (!rep.total) line('Aucune question posée pour le moment.', (y += 22), { color: s.dim });
    } else if (this.page === 1) {
      let y = 36;
      if (!rep.subjects.length) line('Aucune donnée.', y, { color: s.dim });
      for (const sub of rep.subjects) {
        const lvl = sub.level > 0 ? ' ↑' : sub.level < 0 ? ' ↓' : '';
        line(`${sub.name}`, y);
        r.text(`niveau ${CLASSES[sub.effectiveAge] ?? ''}${lvl}`, 12, y + 9, { color: s.dim, size: 6, font: s.font });
        const bx = Math.round(r.width * 0.4);
        const bw = Math.round(r.width * 0.35);
        r.rect(bx, y + 1, bw, 7, s.dim);
        r.rect(bx, y + 1, Math.round(bw * sub.rate), 7, sub.rate >= 0.75 ? '#5adc5a' : sub.rate >= 0.5 ? '#ffd35a' : '#ff7a6a');
        r.text(`${sub.ok}/${sub.total}`, W - 12, y, { color: s.text, size: 7, font: s.font, align: 'right' });
        y += 22;
      }
    } else {
      const start = (this.page - 2) * this.perPage;
      const items = rep.missed.slice(start, start + this.perPage);
      let y = 32;
      if (!items.length) line('Aucune erreur à retravailler. Bravo !', y + 4, { color: '#5adc5a' });
      for (const m of items) {
        const q = (m.prompt ?? '').length > 46 ? `${m.prompt.slice(0, 45)}…` : m.prompt;
        r.fitText(m.prompt ?? '', 12, y, W - 24, { color: s.text, size: 7, font: s.font });
        r.fitText(`→ ${m.answer}${m.wrong > 1 ? `   (×${m.wrong})` : ''}`, 20, y + 9, W - 32, { color: s.accent, size: 7, font: s.font });
        y += 25;
      }
    }
    r.fitText('Gauche/Droite : pages · B : fermer', W / 2, r.height - 12, W - 16, { color: s.dim, size: 6, font: s.font, align: 'center' });
  }
}
