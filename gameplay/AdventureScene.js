import { Scene, World, Camera, Tilemap, MenuScene, DialogScene, SaveStore, Speech, wrapText } from '../engine/index.js';
import { GameState } from './state/GameState.js';
import { QuestSystem } from './quests/QuestSystem.js';
import { formatText } from './script/text.js';
import { Hero } from './actors/Hero.js';
import { Companion } from './actors/Companion.js';
import { Pickup } from './objects/objects.js';
import { standardFactory } from './objects/ObjectFactory.js';
import { drawHud } from './ui/Hud.js';
import { QuestLogScene, DIFFICULTY } from './ui/QuestLogScene.js';
import { GameOverScene } from './ui/GameOverScene.js';
import { ShopScene } from './ui/ShopScene.js';
import { InventoryScene } from './ui/InventoryScene.js';
import { QuizScene } from './quiz/QuizScene.js';
import { chooseSubject } from './quiz/adaptive.js';
import { check } from './script/conditions.js';
import { EndScene } from './ui/EndScene.js';
import { openParentSpace } from './ui/parents.js';
import { ProfileStore, parentSettings } from './profiles.js';
import { WorldMapScene } from './ui/WorldMapScene.js';
import { createMinigame } from './minigames/index.js';

// LA SCÈNE D'AVENTURE — le "squelette" réutilisable d'un jeu type Zelda.
// Un jeu lui fournit uniquement des DONNÉES :
//
// new AdventureScene({
//   maps:   { [id]: { name, rows: [...], camera: 'follow' | 'rooms', level: 'donjon1',
//                     objects: { 'A': { type: 'npc', tile: 'floor', ...props } },
//                     roomClear: [{ room: [x, y], flag: 'salle_videe' }] } },
//   legend: { '.': 'floor', '#': 'wall', 'P': { tile: 'path', marker: 'start' } },  // commun aux cartes
//   items:  { coin: { icon: 'coin', word: 'coin', max: 999, bag: false },   // bag:false = hors du sac (compteur)
//             apple: { icon: 'apple', name: 'Pomme', use: (adv) => ... },     // utilisable depuis le sac
//             planks: { ..., quest: true },                                    // objet de quête : ne se jette pas
//             heart: { icon: 'heart', instant: (adv) => adv.state.heal(2) },
//             fire_staff: { ..., tool: (adv, hero) => hero.shoot('fire') } },  // bouton Objet
//   bagSize: 10,                               // places dans le sac au départ
//   quests: [ ... ],
//   startMap: 'overworld',
//   hud:    { height: 16, counters: ['coin', 'key'] },
//   questionBank: frenchSchoolBank(),          // énigmes scolaires (voir content/quiz)
//   endWhen: { quest: 'main', status: 'done' }, // fin du jeu (débloque le bilan parents)
//   reportWhen: 'end' | 'always',
//   saveNamespace: 'mon-jeu',
//   allowThemeSwitch: true,
//   colorLoss: (adv) => 0.5,                   // 0..1 : le monde perd ses couleurs (0 = normal)
//   worldMap: { when: 'flag', lockedText, nodes: [...], paint(r, box, state) },  // voir ui/WorldMapScene.js
// })
//
// Une carte avec un objet { type: 'warp', worldMap: true, back: [tx, ty] } ouvre la carte du monde
// (back : où replacer le héros s'il la referme sans voyager).
//
// Types d'objets reconnus par défaut : warp, pickup, chest, npc, sign, block, plate,
// gate, locked, lever, enemy (voir objects/ObjectFactory.js).

export class AdventureScene extends Scene {
  constructor(config) {
    super();
    this.cfg = { tileSize: 16, hud: { height: 16, counters: ['coin', 'key'] }, factory: standardFactory(), ...config };
    this.saves = new SaveStore(this.cfg.saveNamespace ?? 'quest');
    this.profiles = new ProfileStore(this.saves);
    this.slot = 1;
    this.toasts = [];
  }

  // ------------------------------------------------------------------ cycle de vie
  /**
   * @param {{ load?: boolean, profile?: {id?, name?, age}, slot?: string }} data
   *   slot : emplacement de sauvegarde (un par profil d'enfant)
   */
  enter({ load = false, profile = null, slot = null } = {}) {
    if (slot) this.slot = slot;
    else if (profile?.id) this.slot = this.profiles.slot(profile.id);
    const g = this.game;
    this.state = new GameState({ maxHp: this.cfg.startHp ?? 6 });
    if (profile) this.state.profile = { ...profile };
    this.quests = new QuestSystem(this.actionContext(), this.cfg.quests ?? []);
    this.offTheme = g.events.on('theme:change', (t) => this.world?.tilemap.setTileset(t.tileset));
    this.offDebug = g.debug.addInfo(() => this._debugLines());
    // Changement de taille d'écran (téléphone tourné) : la caméra s'adapte.
    this.offResize = g.events.on('logical-resize', () => {
      if (!this.world) return;
      const vp = this.viewport;
      this.world.viewport = vp;
      this.world.camera.width = vp.w;
      this.world.camera.height = vp.h;
      this.world.camera.snap();
    });
    if (load && this.hasSave()) this._applySave(this.saves.load(this.slot).data);
    else {
      this.state.bagSize = this.cfg.bagSize ?? 10;
      for (const [item, n] of Object.entries(this.cfg.startItems ?? {})) this.state.give(item, n);
      this.loadMap(this.cfg.startMap);
    }
  }

  exit() {
    this.offTheme();
    this.offDebug();
    this.offResize();
    this.quests.dispose();
  }

  /** Zones tactiles des boutons du bandeau (Quêtes, Sac). */
  get hudButtons() {
    const none = { x: 0, y: 0, w: 0, h: 0 };
    return this._hudButtons ?? { quests: none, bag: none };
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
    // Une salle = 16 x 11 tuiles, même si l'écran est plus étroit (téléphone en portrait).
    const ts0 = this.cfg.tileSize;
    const camera = new Camera({
      width: vp.w,
      height: vp.h,
      mode: def.camera ?? 'rooms',
      roomWidth: (this.cfg.roomTiles?.[0] ?? 16) * ts0,
      roomHeight: (this.cfg.roomTiles?.[1] ?? 11) * ts0,
      bounds: { w: tilemap.pixelWidth, h: tilemap.pixelHeight },
    });
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
    if (this.state.flag('pet_joined')) this.spawnCompanion();
    camera.follow(this.hero);
    camera.onRoomChange = (room) => this.game.events.emit('room:enter', { mapId, room });
    this.entry = { mapId, x: px, y: py, facing };
    // Niveau = groupe de cartes (par défaut : la carte seule). On mémorise son point de départ.
    const level = def.level ?? mapId;
    if (level !== this.level) {
      this.level = level;
      this.levelEntry = { ...this.entry };
      // Photo de l'état à l'entrée du niveau : « recommencer » y revient.
      this.levelSnapshot = this.state.toJSON();
    }
    this.warping = false;
    this.toasts = [];
    this.toast(def.name);
    this.game.events.emit('map:enter', { mapId });
  }

  warp(w) {
    if (w.worldMap) return this.openWorldMap({ from: w });
    this.warping = true;
    this.game.audio.play('door');
    this.game.scenes.fade(() => this.loadMap(w.to, { tx: w.at[0], ty: w.at[1], facing: w.facing ?? 'down' }));
  }

  // ------------------------------------------------------------------ boucle
  update(dt) {
    const input = this.input;
    if (input.pressed('start')) return this.openMenu();
    if (input.pressed('bag') || input.tappedIn(this.hudButtons.bag)) {
      input.consumeTaps();
      return this.openBag();
    }
    if (input.pressed('quests') || input.tappedIn(this.hudButtons.quests)) {
      input.consumeTaps();
      return this.openQuests();
    }
    if (this.cfg.allowThemeSwitch && input.pressed('select')) {
      const t = this.game.themes.next();
      this.game.audio.play('switch');
      this.toast(`Ambiance : ${t.def.name}`);
      return;
    }

    this.state.playTime += dt;
    this.world.update(dt);
    this._checkRoomClear();
    if (this.cfg.endWhen && !this.state.flag('game_finished') && check(this.cfg.endWhen, this.state)) {
      this.state.setFlag('game_finished');
      this.game.audio.play('quest_done');
      return this.game.scenes.push(new EndScene(this, this.cfg.end));
    }
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
      // Les objets donnés par les PNJ / quêtes sont toujours acceptés (jamais perdus).
      collect: (item, n) => this.collect(item, n, { force: true }),
      quizCooldown: this.parentSettings().cooldown ?? this.cfg.quizCooldown ?? 600,
      quiz: (spec, done) => this.quiz(spec, done, speaker),
      shop: (spec, done) => this.game.scenes.push(new ShopScene(this, spec, done)),
      minigame: (name, done) => this.minigame(name, done, speaker),
      announce: (item, n, next) => this.announce(item, n, next),
    };
  }

  /** Texte à trous résolu ; une phrase qui commence par un mot du thème prend une majuscule. */
  format(text) {
    const t = formatText(text, { state: this.state, word: (k, p) => this.game.themes.word(k, p), questLevel: (id) => this.questLevel(id) });
    return /^\{(w|ws):/.test(String(text)) ? t.charAt(0).toUpperCase() + t.slice(1) : t;
  }

  /** Difficulté d'une quête, en toutes lettres : « ★★☆ Moyenne ». */
  questLevel(id) {
    const d = this.quests.defs.get(id)?.difficulty ?? 1;
    return `${'★'.repeat(d)}${'☆'.repeat(3 - d)} ${DIFFICULTY[d].label}`;
  }

  /** Nom affiché d'un personnage (vocabulaire du thème, majuscule). */
  speakerName(speaker) {
    if (!speaker) return speaker;
    const t = this.format(speaker);
    return t.charAt(0).toUpperCase() + t.slice(1);
  }

  say(text, { speaker, onClose } = {}) {
    const pages = [].concat(text).map((t) => this.format(t));
    this.game.scenes.push(new DialogScene(pages, { speaker: this.speakerName(speaker), onClose }));
  }

  ask(question, { speaker, choices }) {
    this.game.scenes.push(new DialogScene(this.format(question), { speaker: this.speakerName(speaker), choices: choices.map((c) => ({ ...c, label: this.format(c.label) })) }));
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

  /** Nom affiché : vocabulaire du thème si disponible, sinon `name` de l'objet. */
  itemName(item, plural = false) {
    const def = this.itemDef(item);
    const words = this.game.themes.current?.def.words ?? {};
    if (def.word && words[def.word] !== undefined) return this.game.themes.word(def.word, plural);
    return (plural ? def.plural : null) ?? def.name ?? item;
  }

  /** Questions ajoutées par les parents pour ce joueur (Espace parents). */
  customQuestions() {
    const id = this.state.profile?.id;
    return id ? (this.saves.load(`custom-${id}`)?.data ?? []) : [];
  }

  /**
   * Pose des questions scolaires. Une série mélange :
   *  1. les révisions dues (questions ratées il y a quelques jours) ;
   *  2. au plus une question des parents ;
   *  3. des questions de la banque, au niveau ajusté automatiquement (difficulté adaptative).
   */
  quiz(spec, done, speaker) {
    const bank = this.cfg.questionBank;
    const st = this.state;
    // Le jeu choisit la matière (sauf PNJ spécialisé) : variété + insistance sur les points faibles.
    // Les dictées marchent sur tous les appareils (voix, ou « dictée flash » si l'appareil ne parle pas).
    const subjects = bank ? bank.subjects(st.profile?.age ?? 8) : [];
    const subject = spec.subject ?? (bank ? chooseSubject({ subjects, stats: st.quiz.stats, last: this._lastSubject }) : null);
    this._lastSubject = subject;
    // Une dictée = un seul mot.
    const count = subject === 'dictee' ? 1 : spec.count ?? 3;
    // Sans voix, une dictée n'est possible qu'avec une image de l'objet à écrire.
    const canSpeak = Speech.available;
    const okType = (q) => canSpeak || q.type !== 'dictation' || !!q.image || !!q.custom;
    const questions = [];
    const ids = new Set();
    const add = (q) => {
      if (questions.length < count && okType(q) && !ids.has(q.id)) (questions.push(q), ids.add(q.id));
    };
    st.dueReviews(subject).slice(0, count === 1 ? 1 : count - 1).forEach(add);
    const seenOrder = new Map(st.quiz.seen.map((id, i) => [id, i]));
    const custom = this.customQuestions()
      .filter((q) => !subject || q.subject === subject)
      .sort((a, b) => (seenOrder.get(a.id) ?? -1) - (seenOrder.get(b.id) ?? -1));
    if (custom.length && Math.random() < 0.7) add(custom[0]);
    if (bank) {
      bank
        .pick({ age: st.effectiveAge(subject), subject, count: count - questions.length + 1, seen: st.quiz.seen, excludeTypes: [], accept: okType })
        .forEach(add);
    }
    if (!questions.length) return this.say('Je n’ai pas de question pour toi aujourd’hui.', { speaker, onClose: () => done({ correct: 0, total: 0, results: [] }) });
    this.game.scenes.push(
      new QuizScene({
        questions,
        speaker,
        // Indices du jeu : 1 ou 2 par question, chacun coûte 1 indice du compteur.
        hints: {
          left: () => st.count('hint'),
          spend: () => {
            if (!st.take('hint', 1)) return false;
            st.addCounter('hints_used');
            return true;
          },
        },
        onDone: (res) => {
          st.recordQuiz(res.results, { reviewDays: this.cfg.reviewDays ?? [1, 3, 7] });
          done(res);
        },
      }),
    );
  }

  // ------------------------------------------------------------------ sac
  /** L'objet occupe-t-il une place dans le sac ? (pas l'argent, les clés, les indices...) */
  inBag(item) {
    const d = this.itemDef(item);
    return d.bag !== false && !d.instant;
  }

  bagItems() {
    return Object.entries(this.state.items).filter(([id, n]) => n > 0 && this.inBag(id));
  }

  bagCapacity() {
    return this.state.bagSize ?? this.cfg.bagSize ?? 10;
  }

  /** Reste-t-il de la place ? Un objet déjà présent s'empile dans sa case. */
  canStore(item) {
    if (!this.inBag(item) || this.state.count(item) > 0) return true;
    return this.bagItems().length < this.bagCapacity();
  }

  /**
   * Donne un objet (ou applique son effet immédiat : cœur qui soigne...).
   * Renvoie false si le sac est plein (sauf `force`, pour les objets de quête donnés par un PNJ).
   */
  collect(item, n = 1, { feedback = false, force = false } = {}) {
    const def = this.itemDef(item);
    if (!force && !this.canStore(item)) {
      this.toast('Ton sac est plein !');
      this.game.audio.play('menu_no');
      return false;
    }
    if (def.instant) def.instant(this, n);
    else this.state.give(item, n, def.max ?? Infinity);
    // Premier objet à utiliser : il s'équipe tout seul.
    if (def.tool && !this.state.equipped) this.state.equipped = item;
    if (feedback) this.game.audio.play(def.sound ?? 'pickup');
    return true;
  }

  /** Équipe un objet (bouton Objet). */
  equip(item) {
    this.state.equipped = item;
    this.game.audio.play('menu_ok');
    this.toast(`Objet équipé : ${this.itemName(item)}`);
  }

  /** Objet équipé, s'il est toujours dans le sac. */
  get equipped() {
    const id = this.state.equipped;
    return id && this.state.count(id) > 0 && this.itemDef(id).tool ? id : null;
  }

  /** Bouton Objet : utilise l'objet équipé (items[id].tool(adv, hero)). */
  useTool() {
    const id = this.equipped;
    if (!id) return false;
    return this.itemDef(id).tool(this, this.hero) !== false;
  }

  /** Fait apparaître le compagnon à côté du héros. */
  spawnCompanion() {
    if (this.world.entities.some((e) => e.has('companion') && !e.dead)) return;
    this.world.add(new Companion(this.hero, { hintEvery: this.cfg.companionHintEvery ?? 480 }));
  }

  /** Lance un mini-jeu contre un habitant. done(result) : 'win' | 'lose' | 'draw' | 'quit'. */
  minigame(name, done, speaker) {
    const st = this.state;
    const scene = createMinigame(name, {
      opponent: this.speakerName(speaker) ?? 'Habitant',
      age: st.profile?.age ?? 8,
      onDone: (result) => {
        st.addCounter(`game_${name}_${result}`);
        done(result);
      },
    });
    this.game.scenes.push(scene);
  }

  /** La carte du monde est-elle disponible ? */
  get hasWorldMap() {
    const wm = this.cfg.worldMap;
    return !!wm && check(wm.when, this.state);
  }

  /**
   * Ouvre la carte du monde. Depuis une sortie (`from`) : on peut voyager ; si on la referme,
   * le héros revient sur la case `back`. Depuis le menu : voyage seulement depuis une carte
   * marquée `worldExit: true` (un extérieur), sinon simple consultation.
   */
  openWorldMap({ from = null } = {}) {
    const wm = this.cfg.worldMap;
    const back = () => {
      if (from?.back) {
        const ts = this.cfg.tileSize;
        this.hero.x = from.back[0] * ts + 3;
        this.hero.y = from.back[1] * ts + 6;
      }
      this.warping = false;
    };
    this.warping = true;
    if (!this.hasWorldMap) return this.say(wm?.lockedText ?? 'Cette route ne mène nulle part pour l’instant.', { onClose: back });
    this.game.audio.play('menu_ok');
    this.game.scenes.push(
      new WorldMapScene({
        ...wm,
        state: this.state,
        current: wm.currentNode?.(this),
        travel: !!from || !!this.mapDef.worldExit,
        format: (t) => this.format(t),
        onTravel: (node) => {
          this.game.audio.play('door');
          this.game.scenes.fade(() => this.loadMap(node.mapId, { tx: node.at[0], ty: node.at[1], facing: node.facing ?? 'down' }));
        },
        onClose: back,
      }),
    );
  }

  openQuests() {
    this.game.audio.play('menu_ok');
    this.game.scenes.push(new QuestLogScene(this));
  }

  openBag() {
    this.game.audio.play('menu_ok');
    this.game.scenes.push(new InventoryScene(this));
  }

  /** Réglages choisis par les parents (code, délai après un échec...). */
  parentSettings() {
    return parentSettings(this.saves);
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

  /**
   * Recommencer le niveau : tout revient comme à l'entrée du niveau (monstres, coffres,
   * objets, quêtes, argent), vie pleine. On conserve seulement ce qui concerne
   * l'apprentissage (statistiques de questions), le temps de jeu et le profil.
   */
  restartLevel() {
    this.game.scenes.fade(() => {
      const st = this.state;
      const keep = { quiz: st.quiz, playTime: st.playTime, profile: st.profile, hintsUsed: st.counter('hints_used') };
      if (this.levelSnapshot) st.load(this.levelSnapshot);
      Object.assign(st, { quiz: keep.quiz, playTime: keep.playTime, profile: keep.profile });
      st.counters.hints_used = keep.hintsUsed;
      st.hp = st.maxHp;
      const e = this.levelEntry;
      const level = this.level;
      this.level = null; // reprend une nouvelle photo identique
      this.loadMap(e.mapId, e);
      this.level = level;
    });
  }

  // ------------------------------------------------------------------ indices
  openHints() {
    const g = this.game;
    const active = this.quests.journal().filter((q) => q.status === 'active');
    const st = this.state;
    if (!active.length) return this.say('Aucune quête en cours.');
    g.scenes.push(
      new MenuScene({
        title: `INDICES (il t’en reste ${st.count('hint')})`,
        width: 230,
        items: [
          ...active.map((q) => ({
            label: `${q.kind === 'main' ? '★ ' : ''}${q.title}`,
            onSelect: (m) => {
              m.close();
              const seen = this.quests.revealedHints(q.id);
              if (!this.quests.hasMoreHints(q.id)) {
                return this.say(seen.length ? [...seen.map((h) => `💡 ${this.format(h)}`)] : 'Pas d’indice pour cette étape. Relis ton journal !', { speaker: 'Indice' });
              }
              if (st.count('hint') <= 0) {
                return this.say('Tu n’as plus d’indice. Gagne-en avec des quêtes faciles, ou achète-en chez le marchand.', { speaker: 'Indice' });
              }
              st.take('hint', 1);
              g.audio.play('secret');
              const h = this.quests.revealHint(q.id);
              this.say([...seen.map((x) => `💡 ${this.format(x)}`), `💡 ${this.format(h)}`], { speaker: 'Indice' });
            },
          })),
          { label: 'Retour', onSelect: (m) => m.close() },
        ],
      }),
    );
  }

  openParentSpace() {
    openParentSpace({
      game: this.game,
      saves: this.saves,
      profiles: this.profiles,
      questDefs: this.cfg.quests ?? [],
      reportWhen: this.cfg.reportWhen ?? 'end',
      defaultCooldown: this.cfg.quizCooldown ?? 600,
      live: this.state.profile?.id ? { profileId: this.state.profile.id, state: this.state } : null,
      saveLive: () => this.saveGame(),
    });
  }

  hasSave() {
    return this.saves.has(this.slot);
  }

  saveGame() {
    const h = this.hero;
    if (this.state.profile?.id) this.profiles.update(this.state.profile.id, { age: this.state.profile.age });
    return this.saves.save(this.slot, { state: this.state.toJSON(), mapId: this.mapId, x: h.x, y: h.y, facing: h.facing, theme: this.game.themes.current.def.id });
  }

  loadGame() {
    const s = this.saves.load(this.slot);
    if (!s) return;
    this.game.scenes.fade(() => this._applySave(s.data));
  }

  _applySave(d) {
    if (d.theme && this.game.themes.themes.has(d.theme)) this.game.themes.use(d.theme);
    this.state.load(d.state);
    this.level = null;
    this.loadMap(d.mapId, { x: d.x, y: d.y, facing: d.facing });
    this.toasts = [{ text: 'Partie chargée', t: 2 }];
  }

  openMenu() {
    const g = this.game;
    const items = [
      { label: 'Reprendre', onSelect: (m) => m.close() },
      { label: 'Quêtes', onSelect: (m) => (m.close(), this.openQuests()) },
      { label: () => `Utiliser un indice (${this.state.count('hint')})`, onSelect: (m) => (m.close(), this.openHints()) },
      { label: () => `Sac (${this.bagItems().length}/${this.bagCapacity()})`, onSelect: (m) => (m.close(), this.openBag()) },
      ...(this.hasWorldMap ? [{ label: 'Carte du royaume', onSelect: (m) => (m.close(), this.openWorldMap()) }] : []),
      {
        label: 'Sauvegarder',
        onSelect: (m) => {
          m.close();
          if (this.saveGame()) (g.audio.play('save'), this.toast('Partie sauvegardée'));
        },
      },
      { label: 'Charger', enabled: () => this.hasSave(), onSelect: (m) => (m.close(), this.loadGame()) },
    ];
    items.push({ label: 'Espace parents', onSelect: (m) => (m.close(), this.openParentSpace()) });
    if (this.cfg.allowThemeSwitch) items.push({ label: () => `Ambiance : ${g.themes.current.def.name}`, onSelect: () => (g.themes.next(), g.audio.play('switch')) });
    items.push(
      { label: () => `Débogage : ${g.debug.enabled ? 'oui' : 'non'}`, onSelect: () => g.debug.toggle() },
      { label: () => `Son : ${g.audio.muted ? 'coupé' : 'activé'}`, onSelect: () => g.audio.setMuted(!g.audio.muted) },
    );
    g.scenes.push(new MenuScene({ title: 'PAUSE', width: 180, items }));
  }

  /** Le monde perd ses couleurs (0 = normal, 1 = tout gris) : mélange « saturation » vers le gris. */
  _drawColorLoss(r) {
    const k = Math.max(0, Math.min(1, this.cfg.colorLoss?.(this) ?? 0));
    if (k <= 0) return;
    const c = r.ctx;
    const vp = this.viewport;
    c.save();
    c.globalCompositeOperation = 'saturation';
    c.globalAlpha = k;
    c.fillStyle = '#808080';
    c.fillRect(vp.x, vp.y, vp.w, vp.h);
    c.restore();
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
    this._drawColorLoss(r);
    this._hudButtons = drawHud(r, this, this.cfg.hud);
    const t = this.toasts[0];
    if (t) {
      const s = this.game.style;
      const y = this.cfg.hud.height + 6;
      const maxW = r.width - 16;
      const w = Math.min(maxW, r.measure(t.text, 8, s.font) + 14);
      const x = Math.round((r.width - w) / 2);
      const lines = wrapText(t.text, w - 10, (str) => r.measure(str, 8, s.font)).slice(0, 2);
      const h = lines.length * 11 + 4;
      r.rect(x, y, w, h, s.box);
      r.strokeRect(x, y, w, h, s.border);
      lines.forEach((l, i) => r.fitText(l, r.width / 2, y + 3 + i * 11, w - 8, { color: s.text, size: 8, font: s.font, align: 'center' }));
    }
  }
}
