// LA QUÊTE D'ALIA — le jeu. Ce fichier branche les données (data/) et l'ambiance (themes.js)
// sur la scène d'aventure réutilisable (gameplay/AdventureScene.js).
import { Game, Scene, MenuScene, TouchControls } from '../engine/index.js';
import { AdventureScene, openParentSpace, PromptScene, MessageScene, StoryScene } from '../gameplay/index.js';
import { THEME, ROLES } from './themes.js';
import { MAPS, LEGEND, ITEMS, QUESTS } from './data/index.js';
import { WORLD_MAP, colorLoss } from './data/worldmap.js';
import { INTRO_STORY, drawUnicorn } from './data/story.js';
import { frenchSchoolBank } from '../content/quiz/index.js';

const TS = 16;
const HUD_H = 16;

// ------------------------------------------------------------------ mise en page
const style = document.createElement('style');
style.textContent = `
  html,body{margin:0;height:100%;background:#000;overflow:hidden;overscroll-behavior:none}
  #quest{display:flex;flex-direction:column;height:100%;width:100%}
  #screen{flex:1;min-height:0;display:flex;align-items:center;justify-content:center}
  #screen canvas{outline:none}
`;
document.head.appendChild(style);
const root = document.createElement('div');
root.id = 'quest';
const screen = document.createElement('div');
screen.id = 'screen';
root.appendChild(screen);
document.body.appendChild(root);

// Sur téléphone en portrait, on affiche 12 tuiles de large au lieu de 16 :
// l'image est ~35 % plus grande, et la caméra suit le héros dans la salle.
const touch = TouchControls.isTouchDevice() || new URLSearchParams(location.search).has('touch');
const logicalWidth = () => (touch && innerHeight > innerWidth ? 12 : 16) * TS;
const game = new Game({ width: logicalWidth(), height: 11 * TS + HUD_H, parent: screen });
if (touch) {
  new TouchControls(game.input, {
    buttons: [
      { action: 'item', label: 'X' }, // objet équipé (bâton de feu...)
      { action: 'secondary', label: 'B' },
      { action: 'action', label: 'A' },
    ],
    parent: root,
    screen,
    onLayout: () => {
      game.setLogicalSize(logicalWidth(), 11 * TS + HUD_H);
      game.resize();
    },
  });
}

// ------------------------------------------------------------------ bruitages
const sfx = {
  menu_move: { type: 'square', notes: [[660, 0.04]], vol: 0.12 },
  menu_ok: { type: 'square', notes: [[660, 0.05], [990, 0.08]], vol: 0.15 },
  menu_no: { type: 'square', notes: [[200, 0.1]], vol: 0.15 },
  door: { type: 'triangle', notes: [[330, 0.08], [247, 0.08], [196, 0.14]], vol: 0.25 },
  switch: { type: 'square', notes: [[523, 0.06], [659, 0.06], [784, 0.06], [1047, 0.12]], vol: 0.15 },
  save: { type: 'triangle', notes: [[784, 0.08], [988, 0.08], [1175, 0.16]], vol: 0.25 },
  sword: { type: 'noise', notes: [[1, 0.08]], vol: 0.12 },
  hit: { type: 'square', notes: [[220, 0.05], [160, 0.06]], vol: 0.2 },
  kill: { type: 'square', notes: [[400, 0.05], [200, 0.05], [100, 0.1]], vol: 0.2 },
  hurt: { type: 'sawtooth', notes: [[300, 0.06], [150, 0.12]], vol: 0.2 },
  cut: { type: 'noise', notes: [[1, 0.06]], vol: 0.15 },
  pickup: { type: 'square', notes: [[880, 0.05], [1320, 0.08]], vol: 0.15 },
  coin: { type: 'square', notes: [[988, 0.05], [1319, 0.1]], vol: 0.12 },
  heal: { type: 'triangle', notes: [[660, 0.06], [880, 0.06], [1100, 0.1]], vol: 0.2 },
  chest: { type: 'triangle', notes: [[392, 0.1], [494, 0.1], [587, 0.1], [784, 0.25]], vol: 0.25 },
  secret: { type: 'square', notes: [[784, 0.08], [740, 0.08], [622, 0.08], [440, 0.08], [415, 0.08], [659, 0.08], [831, 0.08], [1047, 0.2]], vol: 0.12 },
  push: { type: 'noise', notes: [[1, 0.2]], vol: 0.08 },
  plate_on: { type: 'square', notes: [[200, 0.05], [300, 0.08]], vol: 0.15 },
  plate_off: { type: 'square', notes: [[300, 0.05], [200, 0.08]], vol: 0.15 },
  gate_open: { type: 'sawtooth', notes: [[110, 0.15], [165, 0.15]], vol: 0.15 },
  gate_close: { type: 'sawtooth', notes: [[165, 0.15], [110, 0.15]], vol: 0.15 },
  unlock: { type: 'triangle', notes: [[523, 0.08], [784, 0.15]], vol: 0.25 },
  lever: { type: 'square', notes: [[330, 0.04], [440, 0.06]], vol: 0.15 },
  quest: { type: 'triangle', notes: [[523, 0.1], [659, 0.1], [784, 0.2]], vol: 0.25 },
  quest_done: { type: 'triangle', notes: [[523, 0.1], [659, 0.1], [784, 0.1], [1047, 0.3]], vol: 0.25 },
  quiz_ok: { type: 'square', notes: [[784, 0.08], [1047, 0.16]], vol: 0.18 },
  quiz_ko: { type: 'triangle', notes: [[330, 0.12], [262, 0.2]], vol: 0.2 },
  boss_dash: { type: 'sawtooth', notes: [[90, 0.25]], vol: 0.2, slide: 60 },
  boss_shield: { type: 'triangle', notes: [[880, 0.05], [660, 0.08]], vol: 0.2 },
  boss_open: { type: 'square', notes: [[523, 0.06], [659, 0.06], [784, 0.12]], vol: 0.2 },
  fire: { type: 'sawtooth', notes: [[520, 0.04], [320, 0.08]], vol: 0.12 },
  throw: { type: 'triangle', notes: [[300, 0.05], [200, 0.06]], vol: 0.12 },
  gameover: { type: 'triangle', notes: [[392, 0.2], [330, 0.2], [262, 0.4]], vol: 0.25 },
};
for (const [k, v] of Object.entries(sfx)) game.audio.define(k, v);

// ------------------------------------------------------------------ ambiances
game.themes.configure({ roles: ROLES, tileSize: TS });
game.themes.register(THEME); // une seule ambiance : le royaume d'Iris
game.themes.use(THEME.id);

const makeAdventure = () =>
  new AdventureScene({
    maps: MAPS,
    legend: LEGEND,
    items: ITEMS,
    quests: QUESTS,
    questionBank: frenchSchoolBank(),
    startMap: 'overworld',
    hud: { height: HUD_H, counters: ['coin', 'key', 'hint'] },
    startItems: { hint: 1 },
    bagSize: 10, // places dans le sac (le grand sac du magasin passe à 20)
    quizCooldown: 600, // attente après un échec : 10 min (réglable dans l'Espace parents)
    endWhen: 'alia_free', // la fin du jeu : Alia délivrée (niveau 8)
    end: { message: 'Bravo, tu as délivré Alia !' },
    reportWhen: 'always', // bilan parents disponible à tout moment
    saveNamespace: 'quete-alia',
    allowThemeSwitch: false,
    worldMap: WORLD_MAP,
    colorLoss, // le royaume perd ses couleurs tant qu'Alia est prisonnière
  });

// ------------------------------------------------------------------ écran titre (profils)
const CLASSES = { 6: 'CP', 7: 'CE1', 8: 'CE2', 9: 'CM1', 10: 'CM2' };

class TitleScene extends Scene {
  enter() {
    this.adv = makeAdventure();
    this.profiles = this.adv.profiles;
    this.choice = 0;
  }

  /** Options recalculées à chaque image (un profil peut avoir été ajouté ou supprimé). */
  get options() {
    const list = this.profiles.list().map((p) => ({ label: `${p.name} (${p.age} ans)`, profile: p }));
    list.push({ label: '+ Nouveau joueur', action: 'new' });
    if (this.profiles.list().length) list.push({ label: 'Espace parents', action: 'parents' });
    return list;
  }

  start(p, load) {
    if (load) return game.scenes.fade(() => game.scenes.replace(this.adv, { load: true, slot: this.profiles.slot(p.id) }));
    this.adv.saves.remove(this.profiles.slot(p.id)); // nouvelle partie : l'ancienne est effacée
    // Nouvelle partie : l'histoire en images, puis le village.
    const begin = () => game.scenes.fade(() => game.scenes.replace(this.adv, { profile: { id: p.id, name: p.name, age: p.age } }));
    game.scenes.fade(() => game.scenes.replace(new StoryScene({ pages: INTRO_STORY, onDone: begin })));
  }

  newPlayer() {
    game.scenes.push(
      new PromptScene({
        title: 'Comment t’appelles-tu ?',
        message: 'Écris ton prénom puis Entrée.',
        placeholder: 'Prénom',
        maxLength: 16,
        onOk: (name) =>
          game.scenes.push(
            new MenuScene({
              title: `Quel âge as-tu, ${name} ?`,
              width: 170,
              items: Object.entries(CLASSES).map(([age, cls]) => ({
                label: `${age} ans (${cls})`,
                onSelect: () => this.start(this.profiles.add({ name, age: Number(age) }), false),
              })),
            }),
          ),
      }),
    );
  }

  update() {
    const i = this.input;
    const opts = this.options;
    const n = opts.length;
    this.choice = Math.min(this.choice, n - 1);
    if (i.pressed('up')) (this.choice = (this.choice - 1 + n) % n), game.audio.play('menu_move');
    if (i.pressed('down')) (this.choice = (this.choice + 1) % n), game.audio.play('menu_move');
    if (!(i.pressed('action') || i.pressed('start'))) return;
    i.consume('action');
    game.audio.play('menu_ok');
    const opt = opts[this.choice];
    if (opt.action === 'new') {
      if (this.profiles.isFull) return game.scenes.push(new MessageScene(`${this.profiles.max} joueurs au maximum. Un parent peut supprimer un profil dans l’Espace parents.`));
      return this.newPlayer();
    }
    if (opt.action === 'parents') {
      return openParentSpace({ game, saves: this.adv.saves, profiles: this.profiles, questDefs: QUESTS, reportWhen: 'always' });
    }
    const p = opt.profile;
    if (!this.profiles.hasGame(p.id)) return this.start(p, false);
    game.scenes.push(
      new MenuScene({
        title: p.name,
        width: 190,
        items: [
          { label: 'Continuer la partie', onSelect: () => this.start(p, true) },
          {
            label: 'Recommencer du début',
            onSelect: () =>
              game.scenes.push(
                new MenuScene({
                  title: 'Effacer la partie et recommencer ?',
                  width: 220,
                  items: [
                    { label: 'Non', onSelect: (m) => m.close() },
                    { label: 'Oui, recommencer', onSelect: () => this.start(p, false) },
                  ],
                }),
              ),
          },
          { label: 'Retour', onSelect: (m) => m.close() },
        ],
      }),
    );
  }

  draw(r) {
    const s = game.style;
    const t = game.themes.current;
    const roles = ['floor', 'floor', 'floor_alt', 'path', 'floor'];
    for (let y = 0; y < r.height; y += TS) for (let x = 0; x < r.width; x += TS) t.tileset.draw(r, t.tileset.id(roles[((x * 7 + y * 3) / TS) % roles.length]), x, y, game.time);
    r.withAlpha(0.72, () => r.rect(0, 0, r.width, r.height, '#000'));
    r.fitText('LA QUÊTE D’ALIA', r.width / 2, 12, r.width - 60, { color: s.accent, size: 20, font: s.font, bold: true, align: 'center', shadow: '#000' });
    drawUnicorn(r, r.width - 26, 12 + Math.round(Math.sin(game.time * 2)), 1);
    r.text('Délivre la licorne du royaume d’Iris', r.width / 2, 42, { color: s.text, size: 8, font: s.font, align: 'center' });
    const lines = touch
      ? ['Croix : bouger · A : parler, frapper', 'X : objet · Start : menu']
      : ['Flèches/ZQSD : bouger · Espace : parler, frapper', 'E : objet · Entrée : menu · L : quêtes · I : sac'];
    lines.forEach((l, i) => r.text(l, r.width / 2, 62 + i * 11, { color: s.dim, size: 7, font: s.font, align: 'center' }));
    r.text('Qui joue ?', r.width / 2, 92, { color: s.text, size: 9, font: s.font, bold: true, align: 'center' });
    // Liste qui défile si elle est longue (jusqu'à 8 joueurs + 2 options)
    const opts = this.options;
    const visible = 5;
    const first = Math.max(0, Math.min(this.choice - 2, opts.length - visible));
    if (first > 0) r.text('▲', r.width / 2, 100, { color: s.dim, size: 6, font: s.font, align: 'center' });
    if (first + visible < opts.length) r.text('▼', r.width / 2, 108 + visible * 12, { color: s.dim, size: 6, font: s.font, align: 'center' });
    opts.slice(first, first + visible).forEach((o, k) => {
      const i = first + k;
      const sel = i === this.choice;
      const blink = !sel || Math.floor(game.time * 2) % 2 === 0;
      if (blink) r.text(`${sel ? '▶ ' : '  '}${o.label}`, r.width / 2, 108 + k * 12, { color: sel ? s.accent : o.action ? s.dim : s.text, size: 8, font: s.font, align: 'center' });
    });
  }
}

game.scenes.push(new TitleScene());
game.start();
window.quest = game;
