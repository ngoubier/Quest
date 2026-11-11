// ESSAI N°2 — Validation du gameplay : combat, objets, quêtes, énigmes, deux modes de caméra.
// Ce fichier ne fait que brancher les données (world.js) et les ambiances (themes.js)
// sur la scène d'aventure réutilisable (gameplay/AdventureScene.js).
import { Game, Scene, MenuScene, TouchControls } from '../../engine/index.js';
import { AdventureScene, GameState, openParentSpace } from '../../gameplay/index.js';
import { THEMES, TILE_ROLES } from './themes.js';
import { MAPS, LEGEND, ITEMS, QUESTS } from './world.js';
import { frenchSchoolBank } from '../../content/quiz/index.js';

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

const game = new Game({ width: 16 * TS, height: 11 * TS + HUD_H, parent: screen });
if (TouchControls.isTouchDevice() || new URLSearchParams(location.search).has('touch')) {
  new TouchControls(game.input, { parent: root });
  game.resize();
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
  gameover: { type: 'triangle', notes: [[392, 0.2], [330, 0.2], [262, 0.4]], vol: 0.25 },
};
for (const [k, v] of Object.entries(sfx)) game.audio.define(k, v);

// ------------------------------------------------------------------ ambiances
game.themes.configure({ roles: TILE_ROLES, tileSize: TS });
THEMES.forEach((t) => game.themes.register(t));
game.themes.use('medieval');

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
    endWhen: { quest: 'relic', status: 'done' },
    end: { message: 'Bravo, tu as rapporté la relique !' },
    reportWhen: 'end', // bilan parents disponible à la fin du jeu
    saveNamespace: 'quest-essai-2',
    allowThemeSwitch: true,
  });

// ------------------------------------------------------------------ écran titre
class TitleScene extends Scene {
  enter() {
    this.adv = makeAdventure();
    this.hasSave = this.adv.saves.has(1);
    this.options = this.hasSave ? ['Nouvelle partie', 'Continuer', 'Espace parents'] : ['Nouvelle partie'];
    this.choice = this.hasSave ? 1 : 0;
  }

  update() {
    const i = this.input;
    if (i.pressed('select')) (game.themes.next(), game.audio.play('switch'));
    const n = this.options.length;
    if (i.pressed('up')) (this.choice = (this.choice - 1 + n) % n), game.audio.play('menu_move');
    if (i.pressed('down')) (this.choice = (this.choice + 1) % n), game.audio.play('menu_move');
    if (i.pressed('action') || i.pressed('start')) {
      i.consume('action');
      game.audio.play('menu_ok');
      const opt = this.options[this.choice];
      if (opt === 'Continuer') return game.scenes.fade(() => game.scenes.replace(this.adv, { load: true }));
      if (opt === 'Espace parents') {
        const state = new GameState();
        state.load(this.adv.saves.load(1).data.state);
        return openParentSpace({
          game,
          saves: this.adv.saves,
          state,
          questDefs: QUESTS,
          reportWhen: 'end',
          onChange: (st) => {
            const save = this.adv.saves.load(1).data;
            save.state = st.toJSON();
            this.adv.saves.save(1, save);
          },
        });
      }
      // Nouvelle partie : on demande l'âge pour adapter les questions.
      const start = (age) => game.scenes.fade(() => game.scenes.replace(this.adv, { profile: { age } }));
      const CLASSES = { 6: 'CP', 7: 'CE1', 8: 'CE2', 9: 'CM1', 10: 'CM2' };
      game.scenes.push(
        new MenuScene({
          title: 'Quel âge as-tu ?',
          width: 150,
          items: Object.entries(CLASSES).map(([age, cls]) => ({ label: `${age} ans (${cls})`, onSelect: () => start(Number(age)) })),
        }),
      );
    }
  }

  draw(r) {
    const s = game.style;
    const t = game.themes.current;
    const roles = ['floor', 'floor', 'floor_alt', 'path', 'floor'];
    for (let y = 0; y < r.height; y += TS) for (let x = 0; x < r.width; x += TS) t.tileset.draw(r, t.tileset.id(roles[((x * 7 + y * 3) / TS) % roles.length]), x, y, game.time);
    r.withAlpha(0.72, () => r.rect(0, 0, r.width, r.height, '#000'));
    r.text('QUEST', r.width / 2, 22, { color: s.accent, size: 22, font: s.font, bold: true, align: 'center', shadow: '#000' });
    r.text('Essai n°2 — le gameplay', r.width / 2, 50, { color: s.text, size: 9, font: s.font, align: 'center' });
    const lines = [
      'Flèches / ZQSD ... se déplacer',
      'Espace ........... parler / frapper',
      'Entrée ........... menu, journal, sauvegarde',
      'Tab .............. changer d’ambiance',
      'F1 ou ² .......... débogage',
    ];
    lines.forEach((l, i) => r.text(l, 28, 74 + i * 12, { color: s.text, size: 8, font: s.font }));
    this.options.forEach((o, i) => {
      const sel = i === this.choice;
      const blink = !sel || Math.floor(game.time * 2) % 2 === 0;
      if (blink) r.text(`${sel ? '▶ ' : '  '}${o}`, r.width / 2, 138 + i * 11, { color: sel ? s.accent : s.dim, size: 9, font: s.font, align: 'center' });
    });
    r.text(`Ambiance : ${t.def.name}`, r.width / 2, 178, { color: s.dim, size: 7, font: s.font, align: 'center' });
  }
}

game.scenes.push(new TitleScene());
game.start();
window.quest = game;
