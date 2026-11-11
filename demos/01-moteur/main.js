// ESSAI N°1 — Validation du moteur.
// Ce fichier montre comment un jeu utilise le moteur : il ne contient que du "contenu"
// (cartes, ambiances, quelques entités) ; tout le reste vient de engine/.
import { Game, Scene, World, Camera, Tilemap, MenuScene, SaveStore, TouchControls } from '../../engine/index.js';
import { THEMES, TILE_ROLES } from './themes.js';
import { MAPS, LEGEND } from './maps.js';
import { Player, Npc, Sign } from './entities.js';

const TS = 16;
const ROOM_W = 16 * TS; // une salle = 16 x 11 tuiles
const ROOM_H = 11 * TS;
const HUD_H = 16;

// ------------------------------------------------------------------ mise en page
const style = document.createElement('style');
style.textContent = `
  html,body{margin:0;height:100%;background:#000;overflow:hidden;overscroll-behavior:none}
  #quest{display:flex;flex-direction:column;height:100dvh;width:100vw}
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

const game = new Game({ width: ROOM_W, height: ROOM_H + HUD_H, parent: screen });
if (TouchControls.isTouchDevice() || new URLSearchParams(location.search).has('touch')) {
  new TouchControls(game.input, { parent: root });
  game.resize();
}

// ------------------------------------------------------------------ sons communs
game.audio.define('menu_move', { type: 'square', notes: [[660, 0.04]], vol: 0.12 });
game.audio.define('menu_ok', { type: 'square', notes: [[660, 0.05], [990, 0.08]], vol: 0.15 });
game.audio.define('menu_no', { type: 'square', notes: [[200, 0.1]], vol: 0.15 });
game.audio.define('door', { type: 'triangle', notes: [[330, 0.08], [247, 0.08], [196, 0.14]], vol: 0.25 });
game.audio.define('switch', { type: 'square', notes: [[523, 0.06], [659, 0.06], [784, 0.06], [1047, 0.12]], vol: 0.15 });
game.audio.define('save', { type: 'triangle', notes: [[784, 0.08], [988, 0.08], [1175, 0.16]], vol: 0.25 });

// ------------------------------------------------------------------ ambiances
game.themes.configure({ roles: TILE_ROLES, tileSize: TS });
THEMES.forEach((t) => game.themes.register(t));
game.themes.use('medieval');

const saves = new SaveStore('quest-essai-1');

// ------------------------------------------------------------------ scène : monde
class WorldScene extends Scene {
  enter({ mapId = 'overworld', tx, ty, x, y, facing = 'down' } = {}) {
    this.offTheme = this.game.events.on('theme:change', (t) => this.world?.tilemap.setTileset(t.tileset));
    this.offDebug = this.game.debug.addInfo(() => this._debugLines());
    this.loadMap(mapId, { tx, ty, x, y, facing });
    this.toast = null;
  }

  exit() {
    this.offTheme();
    this.offDebug();
  }

  loadMap(mapId, { tx, ty, x, y, facing = 'down' } = {}) {
    const def = MAPS[mapId];
    const { tilemap, markers } = Tilemap.fromAscii({ rows: def.rows, legend: LEGEND, tileset: game.themes.current.tileset });
    const camera = new Camera({ width: ROOM_W, height: ROOM_H, mode: 'rooms', bounds: { w: tilemap.pixelWidth, h: tilemap.pixelHeight } });
    this.world = new World({ game, tilemap, camera, viewport: { x: 0, y: HUD_H, w: ROOM_W, h: ROOM_H } });
    this.mapId = mapId;
    this.mapDef = def;

    let signI = 0;
    let npcI = 0;
    let doorI = 0;
    this.doors = [];
    let start = null;
    for (const m of markers) {
      if (m.name === 'player') start = m;
      if (m.name === 'sign') this.world.add(new Sign(m.x, m.y, def.signs[signI++] ?? '...'));
      if (m.name === 'npc') {
        const room = camera.roomRect(camera.roomOf(m.x, m.y));
        this.world.add(new Npc(m.x, m.y, def.npcs[npcI] ?? ['...'], room, 7 + npcI++));
      }
      if (m.name === 'door') this.doors.push({ rect: { x: m.x, y: m.y, w: TS, h: TS }, ...def.doors[doorI++] });
    }

    let px;
    let py;
    if (x !== undefined) [px, py] = [x, y];
    else if (tx !== undefined) [px, py] = [tx * TS + 3, ty * TS + 6];
    else [px, py] = [start.x + 3, start.y + 6];
    this.player = this.world.add(new Player(px, py, facing));
    camera.follow(this.player);
    camera.onRoomChange = (room) => game.events.emit('room:enter', { mapId, room });
  }

  /** Changement de carte avec fondu au noir. */
  warp(door) {
    game.audio.play('door');
    this.game.scenes.fade(() => this.loadMap(door.to, { tx: door.at.tx, ty: door.at.ty, facing: door.facing }));
  }

  update(dt) {
    const input = this.input;
    if (input.pressed('start')) return this.openMenu();
    if (input.pressed('select')) return this.switchTheme();

    this.world.update(dt);
    if (this.toast && (this.toast.t -= dt) <= 0) this.toast = null;

    if (!this.world.camera.isTransitioning) {
      const p = this.player;
      for (const d of this.doors) {
        if (p.cx >= d.rect.x && p.cx < d.rect.x + d.rect.w && p.cy >= d.rect.y && p.cy < d.rect.y + d.rect.h) return this.warp(d);
      }
    }
  }

  switchTheme() {
    const t = game.themes.next();
    game.audio.play('switch');
    this.showToast(`Ambiance : ${t.def.name}`);
  }

  showToast(text) {
    this.toast = { text, t: 2 };
  }

  openMenu() {
    const scene = this;
    game.scenes.push(
      new MenuScene({
        title: 'PAUSE',
        width: 176,
        items: [
          { label: 'Reprendre', onSelect: (m) => m.close() },
          { label: () => `Ambiance : ${game.themes.current.def.name}`, onSelect: () => (game.themes.next(), game.audio.play('switch')) },
          {
            label: 'Sauvegarder',
            onSelect: (m) => {
              const p = scene.player;
              saves.save(1, { mapId: scene.mapId, x: p.x, y: p.y, facing: p.facing, theme: game.themes.current.def.id });
              game.audio.play('save');
              m.close();
              scene.showToast('Partie sauvegardée');
            },
          },
          {
            label: 'Charger',
            enabled: () => saves.has(1),
            onSelect: (m) => {
              m.close();
              scene.loadSave();
            },
          },
          { label: () => `Débogage : ${game.debug.enabled ? 'oui' : 'non'}`, onSelect: () => game.debug.toggle() },
          { label: () => `Son : ${game.audio.muted ? 'coupé' : 'activé'}`, onSelect: () => game.audio.setMuted(!game.audio.muted) },
        ],
      }),
    );
  }

  loadSave() {
    const s = saves.load(1);
    if (!s) return;
    const d = s.data;
    this.game.scenes.fade(() => {
      game.themes.use(d.theme);
      this.loadMap(d.mapId, { x: d.x, y: d.y, facing: d.facing });
      this.showToast('Partie chargée');
    });
  }

  _debugLines() {
    const p = this.player;
    const cam = this.world.camera;
    return [
      `Carte : ${this.mapId}  salle ${cam.room.x},${cam.room.y}`,
      `Joueur : ${p.x.toFixed(1)}, ${p.y.toFixed(1)} (${p.facing})`,
      `Entités : ${this.world.entities.length}`,
    ];
  }

  draw(r) {
    this.world.draw(r);
    // HUD
    const s = game.style;
    r.rect(0, 0, r.width, HUD_H, s.box);
    r.rect(0, HUD_H - 1, r.width, 1, s.border);
    const cam = this.world.camera;
    r.text(`${this.mapDef.name} ${cam.room.x + 1}-${cam.room.y + 1}`, 4, 4, { color: s.text, size: 7, font: s.font });
    r.text(game.themes.current.def.name, r.width - 4, 4, { color: s.accent, size: 7, font: s.font, align: 'right' });
    if (this.toast) {
      const w = r.measure(this.toast.text, 8, s.font) + 12;
      const x = Math.round((r.width - w) / 2);
      r.rect(x, HUD_H + 6, w, 14, s.box);
      r.strokeRect(x, HUD_H + 6, w, 14, s.border);
      r.text(this.toast.text, r.width / 2, HUD_H + 9, { color: s.text, size: 8, font: s.font, align: 'center' });
    }
  }
}

// ------------------------------------------------------------------ scène : titre
class TitleScene extends Scene {
  update() {
    if (this.input.pressed('select')) {
      game.themes.next();
      game.audio.play('switch');
    }
    if (this.input.pressed('action') || this.input.pressed('start')) {
      game.audio.play('menu_ok');
      game.scenes.fade(() => game.scenes.replace(new WorldScene(), { mapId: 'overworld' }));
    }
  }

  draw(r) {
    const s = game.style;
    const t = game.themes.current;
    // Fond : mosaïque des tuiles du thème courant.
    const roles = ['floor', 'floor', 'floor_alt', 'path', 'floor'];
    for (let y = 0; y < r.height; y += TS) for (let x = 0; x < r.width; x += TS) t.tileset.draw(r, t.tileset.id(roles[((x * 7 + y * 3) / TS) % roles.length]), x, y, game.time);
    r.withAlpha(0.7, () => r.rect(0, 0, r.width, r.height, '#000'));
    r.text('QUEST ENGINE', r.width / 2, 34, { color: s.accent, size: 20, font: s.font, bold: true, align: 'center', shadow: '#000' });
    r.text('Essai n°1 — le moteur', r.width / 2, 60, { color: s.text, size: 9, font: s.font, align: 'center' });
    const lines = [
      'Flèches / ZQSD ... se déplacer',
      'Espace ........... parler / valider',
      'Tab .............. changer d\'ambiance',
      'Entrée ........... menu pause',
      'F1 ou ² .......... débogage',
    ];
    lines.forEach((l, i) => r.text(l, 40, 90 + i * 12, { color: s.text, size: 8, font: s.font }));
    if (Math.floor(game.time * 2) % 2 === 0) r.text('Appuie sur Espace (ou A)', r.width / 2, 160, { color: s.accent, size: 9, font: s.font, align: 'center' });
    r.text(`Ambiance : ${t.def.name}`, r.width / 2, 176, { color: s.dim, size: 7, font: s.font, align: 'center' });
  }
}

game.scenes.push(new TitleScene());
game.start();
window.quest = game; // accès depuis la console du navigateur pour expérimenter
