import { Scene, World, Camera, Tilemap, MenuScene, DialogScene, SaveStore } from '../engine/index.js';
import { GameState } from './state/GameState.js';
import { QuestSystem } from './quests/QuestSystem.js';
import { formatText } from './script/text.js';
import { Hero } from './actors/Hero.js';
import { Pickup } from './objects/objects.js';
import { standardFactory } from './objects/ObjectFactory.js';
import { drawHud } from './ui/Hud.js';
import { QuestLogScene } from './ui/QuestLogScene.js';
import { GameOverScene } from './ui/GameOverScene.js';

// LA SCÈNE D'AVENTURE — le "squelette" réutilisable d'un jeu type Zelda.
// Un jeu lui fournit uniquement des DONNÉES :
//
// new AdventureScene({
//   maps:   { [id]: { name, rows: [...], camera: 'follow' | 'rooms',
//                     objects: { 'A': { type: 'npc', tile: 'floor', ...props } },
//                     roomClear: [{ room: [x, y], flag: 'salle_videe' }] } },
//   legend: { '.': 'floor', '#': 'wall', 'P': { tile: 'path', marker: 'start' } },  // commun aux cartes
//   items:  { coin: { icon: 'coin', word: 'coin', max: 999 }, heart: { icon: 'heart', instant: (adv) => adv.state.heal(2) } },
//   quests: [ ... ],
//   startMap: 'overworld',
//   hud:    { height: 16, counters: ['coin', 'key'] },
//   saveNamespace: 'mon-jeu',
//   allowThemeSwitch: true,
// })
//
// Types d'objets reconnus par défaut : warp, pickup, chest, npc, sign, block, plate,
// gate, locked, lever, enemy (voir objects/ObjectFactory.js).

export class AdventureScene extends Scene {
  constructor(config) {
    super();
    this.cfg = { tileSize: 16, hud: { height: 16, counters: ['coin', 'key'] }, factory: standardFactory(), ...config };
    this.saves = new SaveStore(this.cfg.saveNamespace ?? 'quest');
    this.toasts = [];
  }

  // ------------------------------------------------------------------ cycle de vie
  enter({ load = false } = {}) {
    const g = this.game;
    this.state = new GameState({ maxHp: this.cfg.startHp ?? 6 });
    this.quests = new QuestSystem(this.actionContext(), this.cfg.quests ?? []);
    this.offTheme = g.events.on('theme:change', (t) => this.world?.tilemap.setTileset(t.tileset));
    this.offDebug = g.debug.addInfo(() => this._debugLines());
    if (load && this.hasSave()) this._applySave(this.saves.load(1).data);
    else this.loadMap(this.cfg.startMap);
  }

  exit() {
    this.offTheme();
    this.offDebug();
    this.quests.dispose();
  }

  get viewport() {
    const h = this.cfg.hud.height;
    return { x: 0, y: h, w: this.game.width, h: this.game.height - h };
  }

  // ------------------------------------------------------------------ cartes
  loadMap(mapId, { tx, ty, x, y, facing = 'down' } = {}) {
    const def = this.cfg.maps[mapId];
    if (!def) throw new Error(`Carte "${mapId}" inconnue`);
    const legend = { ...this.cfg.legend, ...def.legend };
    for (const [ch, o] of Object.entries(def.objects ?? {})) legend[ch] = { tile: o.tile ?? 'floor', marker: o.type, props: o };

    const { tilemap, markers } = Tilemap.fromAscii({ rows: def.rows, legend, tileset: this.game.themes.current.tileset });
    const vp = this.viewport;
    const camera = new Camera({ width: vp.w, height: vp.h, mode: def.camera ?? 'rooms', bounds: { w: tilemap.pixelWidth, h: tilemap.pixelHeight } });
    const world = new World({ game: this.game, tilemap, camera, viewport: vp });
    world.adv = this;
    this.world = world;
    this.mapId = mapId;
    this.mapDef = def;
    this.warps = [];

    const ts = this.cfg.tileSize;
    let start = null;
    for (const m of markers) {
      if (m.name === 'start') start = m;
      else if (m.name === 'warp') this.warps.push({ rect: { x: m.x, y: m.y, w: ts, h: ts }, ...m.props });
      else world.add(this.cfg.factory.create({ type: m.name, x: m.x, y: m.y, tx: m.tx, ty: m.ty, uid: `${mapId}:${m.tx},${m.ty}`, props: m.props }, this));
    }

    let px;
    let py;
    if (x !== undefined) [px, py] = [x, y];
    else if (tx !== undefined) [px, py] = [tx * ts + 3, ty * ts + 6];
    else if (start) [px, py] = [start.x + 3, start.y + 6];
    else throw new Error(`Carte "${mapId}" : aucun point de départ`);
    this.hero = world.add(new (this.cfg.heroClass ?? Hero)(px, py, facing));
    camera.follow(this.hero);
    camera.onRoomChange = (room) => this.game.events.emit('room:enter', { mapId, room });
    this.entry = { mapId, x: px, y: py, facing };
    this.warping = false;
    this.toasts = [];
    this.toast(def.name);
    this.game.events.emit('map:enter', { mapId });
  }

  warp(w) {
    this.warping = true;
    this.game.audio.play('door');
    this.game.scenes.fade(() => this.loadMap(w.to, { tx: w.at[0], ty: w.at[1], facing: w.facing ?? 'down' }));
  }

  // ------------------------------------------------------------------ boucle
  update(dt) {
    const input = this.input;
    if (input.pressed('start')) return this.openMenu();
    if (this.cfg.allowThemeSwitch && input.pressed('select')) {
      const t = this.game.themes.next();
      this.game.audio.play('switch');
      this.toast(`Ambiance : ${t.def.name}`);
      return;
    }

    this.world.update(dt);
    this._checkRoomClear();
    if (!this.warping && !this.world.camera.isTransitioning) {
      const h = this.hero;
      for (const w of this.warps) {
        const r = w.rect;
        if (h.cx >= r.x && h.cx < r.x + r.w && h.cy >= r.y && h.cy < r.y + r.h) return this.warp(w);
      }
    }
    if (this.toasts.length && (this.toasts[0].t -= dt) <= 0) this.toasts.shift();
  }

  /** Salles "à vider" : quand tous leurs monstres sont vaincus, un drapeau est levé. */
  _checkRoomClear() {
    const cam = this.world.camera;
    if (cam.isTransitioning) return;
    for (const rc of this.mapDef.roomClear ?? []) {
      if (this.state.flag(rc.flag) || cam.room.x !== rc.room[0] || cam.room.y !== rc.room[1]) continue;
      const rr = cam.roomRect({ x: rc.room[0], y: rc.room[1] });
      const alive = this.world.query(rr, (e) => e.has('enemy')).length;
      if (alive === 0) this.state.setFlag(rc.flag);
    }
  }

  // ------------------------------------------------------------------ services pour les objets / scripts
  /** Contexte passé au langage d'actions (script/actions.js). */
  actionContext({ speaker } = {}) {
    const adv = this;
    return {
      get state() {
        return adv.state;
      },
      get quests() {
        return adv.quests;
      },
      game: this.game,
      speaker,
      say: (text, opts) => this.say(text, opts),
      ask: (q, opts) => this.ask(q, opts),
      toast: (t) => this.toast(t),
      collect: (item, n) => this.collect(item, n),
      announce: (item, n, next) => this.announce(item, n, next),
    };
  }

  format(text) {
    return formatText(text, { state: this.state, word: (k, p) => this.game.themes.word(k, p) });
  }

  say(text, { speaker, onClose } = {}) {
    const pages = [].concat(text).map((t) => this.format(t));
    this.game.scenes.push(new DialogScene(pages, { speaker, onClose }));
  }

  ask(question, { speaker, choices }) {
    this.game.scenes.push(new DialogScene(this.format(question), { speaker, choices: choices.map((c) => ({ ...c, label: this.format(c.label) })) }));
  }

  /** Message bref en haut de l'écran. File courte : les plus anciens sont abandonnés. */
  toast(text) {
    if (!text) return;
    const msg = this.format(text);
    if (this.toasts.some((t) => t.text === msg)) return;
    this.toasts.push({ text: msg, t: 2 });
    while (this.toasts.length > 3) this.toasts.shift();
  }

  itemDef(item) {
    return this.cfg.items?.[item] ?? {};
  }

  itemIcon(item) {
    return this.itemDef(item).icon ?? item;
  }

  itemName(item, plural = false) {
    return this.game.themes.word(this.itemDef(item).word ?? item, plural);
  }

  /** Donne un objet (ou applique son effet immédiat : cœur qui soigne...). */
  collect(item, n = 1, { feedback = false } = {}) {
    const def = this.itemDef(item);
    if (def.instant) def.instant(this, n);
    else this.state.give(item, n, def.max ?? Infinity);
    if (feedback) this.game.audio.play(def.sound ?? 'pickup');
  }

  announce(item, n, next) {
    const text = n > 1 ? `Tu obtiens ${n} ${this.itemName(item, true)} !` : `Tu obtiens : ${this.itemName(item)} !`;
    this.say(text, { onClose: next });
  }

  spawnPickup(item, x, y, lifetime = 10) {
    this.world.add(new Pickup({ x, y, uid: null, props: { item, persist: false, lifetime } }));
  }

  /** Appelé quand l'épée coupe une tuile (buisson...) : petite chance de butin. */
  onTileCut(tx, ty) {
    const ts = this.cfg.tileSize;
    const roll = Math.random();
    if (roll < 0.1) this.spawnPickup('heart', tx * ts, ty * ts);
    else if (roll < 0.3) this.spawnPickup('coin', tx * ts, ty * ts);
  }

  // ------------------------------------------------------------------ défaite, sauvegarde
  gameOver() {
    if (this.game.scenes.top instanceof GameOverScene) return;
    this.game.audio.play('gameover');
    this.game.scenes.push(new GameOverScene(this));
  }

  continueAfterDeath() {
    this.game.scenes.fade(() => {
      this.state.heal(this.state.maxHp);
      this.loadMap(this.entry.mapId, this.entry);
    });
  }

  hasSave() {
    return this.saves.has(1);
  }

  saveGame() {
    const h = this.hero;
    return this.saves.save(1, { state: this.state.toJSON(), mapId: this.mapId, x: h.x, y: h.y, facing: h.facing, theme: this.game.themes.current.def.id });
  }

  loadGame() {
    const s = this.saves.load(1);
    if (!s) return;
    this.game.scenes.fade(() => this._applySave(s.data));
  }

  _applySave(d) {
    if (d.theme && this.game.themes.themes.has(d.theme)) this.game.themes.use(d.theme);
    this.state.load(d.state);
    this.loadMap(d.mapId, { x: d.x, y: d.y, facing: d.facing });
    this.toasts = [{ text: 'Partie chargée', t: 2 }];
  }

  openMenu() {
    const g = this.game;
    const items = [
      { label: 'Reprendre', onSelect: (m) => m.close() },
      { label: 'Journal des quêtes', onSelect: (m) => (m.close(), g.scenes.push(new QuestLogScene(this))) },
      {
        label: 'Sauvegarder',
        onSelect: (m) => {
          m.close();
          if (this.saveGame()) (g.audio.play('save'), this.toast('Partie sauvegardée'));
        },
      },
      { label: 'Charger', enabled: () => this.hasSave(), onSelect: (m) => (m.close(), this.loadGame()) },
    ];
    if (this.cfg.allowThemeSwitch) items.push({ label: () => `Ambiance : ${g.themes.current.def.name}`, onSelect: () => (g.themes.next(), g.audio.play('switch')) });
    items.push(
      { label: () => `Débogage : ${g.debug.enabled ? 'oui' : 'non'}`, onSelect: () => g.debug.toggle() },
      { label: () => `Son : ${g.audio.muted ? 'coupé' : 'activé'}`, onSelect: () => g.audio.setMuted(!g.audio.muted) },
    );
    g.scenes.push(new MenuScene({ title: 'PAUSE', width: 180, items }));
  }

  _debugLines() {
    const h = this.hero;
    const cam = this.world.camera;
    const flags = Object.keys(this.state.flags);
    return [
      `Carte : ${this.mapId} (${cam.mode})  salle ${cam.room.x},${cam.room.y}`,
      `Héros : ${h.x.toFixed(0)}, ${h.y.toFixed(0)}  PV ${this.state.hp}/${this.state.maxHp}`,
      `Entités : ${this.world.entities.length}`,
      `Drapeaux : ${flags.length ? flags.slice(-4).join(', ') : '-'}`,
    ];
  }

  // ------------------------------------------------------------------ dessin
  draw(r) {
    this.world.draw(r);
    drawHud(r, this, this.cfg.hud);
    const t = this.toasts[0];
    if (t) {
      const s = this.game.style;
      const y = this.cfg.hud.height + 6;
      const w = Math.min(r.width - 16, r.measure(t.text, 8, s.font) + 14);
      const x = Math.round((r.width - w) / 2);
      r.rect(x, y, w, 14, s.box);
      r.strokeRect(x, y, w, 14, s.border);
      r.text(t.text, r.width / 2, y + 3, { color: s.text, size: 8, font: s.font, align: 'center' });
    }
  }
}
