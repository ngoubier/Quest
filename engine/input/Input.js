// Gestion des entrées par "actions" : le jeu demande `pressed('action')`,
// jamais "la touche Espace". Clavier, manette et tactile alimentent les mêmes actions.
// Les codes clavier sont physiques (KeyW = touche Z en AZERTY) : ZQSD et WASD marchent tous deux.

export const DEFAULT_BINDINGS = {
  up: ['ArrowUp', 'KeyW'],
  down: ['ArrowDown', 'KeyS'],
  left: ['ArrowLeft', 'KeyA'],
  right: ['ArrowRight', 'KeyD'],
  action: ['Space', 'KeyJ'],
  secondary: ['KeyK', 'ShiftLeft', 'ShiftRight'],
  start: ['Enter', 'Escape'],
  // Entrée VALIDE dans les menus et dialogues (en plus d'ouvrir le menu pause en jeu)
  confirm: ['Enter', 'NumpadEnter'],
  select: ['Tab'],
  bag: ['KeyI'],
  quests: ['KeyL'],
  hint: ['KeyH'],
  debug: ['F1', 'Backquote'],
};

// Indices de boutons de la "Standard Gamepad" (Xbox / PlayStation / Switch Pro).
export const DEFAULT_PAD_BINDINGS = {
  up: [12],
  down: [13],
  left: [14],
  right: [15],
  action: [0],
  secondary: [1, 2],
  start: [9],
  select: [8],
  bag: [3],
};

export class Input {
  constructor({ bindings = DEFAULT_BINDINGS, padBindings = DEFAULT_PAD_BINDINGS, target = null } = {}) {
    this.bindings = {};
    for (const [a, codes] of Object.entries(bindings)) this.bindings[a] = [...codes];
    this.padBindings = padBindings;
    this.keys = new Set(); // codes physiques enfoncés
    this.virtual = new Set(); // actions enfoncées via le tactile (ou un script)
    this.latched = new Set(); // appuis survenus depuis la dernière mise à jour (même très brefs)
    this.cur = new Map();
    this.prev = new Map();
    this.justPressed = new Set();
    this.padDeadzone = 0.5;
    this.taps = []; // touchers/clics de ce pas, en pixels logiques
    this._taps = [];
    this._rebuildKeyMap();
    if (target) this.attach(target);
  }

  _rebuildKeyMap() {
    this._keyToActions = new Map();
    for (const [action, codes] of Object.entries(this.bindings)) {
      for (const code of codes) {
        if (!this._keyToActions.has(code)) this._keyToActions.set(code, []);
        this._keyToActions.get(code).push(action);
      }
    }
  }

  attach(target) {
    // On ignore la frappe dans un champ de texte (réponse à une question...).
    const editable = (e) => {
      const t = e.target;
      return !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
    };
    target.addEventListener('keydown', (e) => {
      if (editable(e)) return;
      const actions = this._keyToActions.get(e.code);
      if (actions) {
        e.preventDefault();
        if (!e.repeat) actions.forEach((a) => this.latched.add(a));
      }
      this.keys.add(e.code);
    });
    target.addEventListener('keyup', (e) => this.keys.delete(e.code));
    target.addEventListener('blur', () => this.keys.clear());
  }

  /** Remplace les touches associées à une action (pour un écran "configurer les touches"). */
  bind(action, codes) {
    this.bindings[action] = [...codes];
    this._rebuildKeyMap();
  }

  /** Appui/relâchement simulé (boutons tactiles, tests automatisés, démo...). */
  setVirtual(action, isDown) {
    if (isDown) {
      if (!this.virtual.has(action)) this.latched.add(action);
      this.virtual.add(action);
    } else this.virtual.delete(action);
  }

  _pollPad() {
    const active = new Set();
    const pads = typeof navigator !== 'undefined' && navigator.getGamepads ? navigator.getGamepads() : [];
    for (const pad of pads) {
      if (!pad) continue;
      for (const [action, buttons] of Object.entries(this.padBindings)) {
        if (buttons.some((b) => pad.buttons[b]?.pressed)) active.add(action);
      }
      const [ax = 0, ay = 0] = pad.axes;
      if (ax < -this.padDeadzone) active.add('left');
      if (ax > this.padDeadzone) active.add('right');
      if (ay < -this.padDeadzone) active.add('up');
      if (ay > this.padDeadzone) active.add('down');
    }
    return active;
  }

  /** Enregistre un toucher / clic (coordonnées logiques du jeu). */
  addTap(x, y) {
    this._taps.push({ x, y });
  }

  /** Vrai si un toucher / clic a eu lieu dans ce rectangle pendant ce pas. */
  tappedIn(r) {
    return this.taps.some((t) => t.x >= r.x && t.x < r.x + r.w && t.y >= r.y && t.y < r.y + r.h);
  }

  consumeTaps() {
    this.taps = [];
  }

  /** Appelé une fois par pas de simulation, avant la mise à jour des scènes. */
  update() {
    this.taps = this._taps;
    this._taps = [];
    const pad = this._pollPad();
    this.justPressed.clear();
    const actions = new Set([...Object.keys(this.bindings), ...this.virtual, ...pad]);
    for (const a of actions) {
      const was = this.cur.get(a) || false;
      const codes = this.bindings[a] || [];
      const now = codes.some((c) => this.keys.has(c)) || this.virtual.has(a) || pad.has(a);
      this.prev.set(a, was);
      this.cur.set(a, now);
      if ((now && !was) || this.latched.has(a)) this.justPressed.add(a);
    }
    this.latched.clear();
  }

  /** Valider : Action (Espace / A) ou Entrée. */
  validated() {
    return this.pressed('action') || this.pressed('confirm');
  }

  /** Annuler : B / Maj, ou Échap (mais pas Entrée, qui valide). */
  cancelled() {
    return this.pressed('secondary') || (this.pressed('start') && !this.pressed('confirm'));
  }

  /** Maintenu enfoncé. */
  down(action) {
    return !!this.cur.get(action);
  }

  /** Vient d'être enfoncé (vrai pendant un seul pas). */
  pressed(action) {
    return this.justPressed.has(action);
  }

  released(action) {
    return !this.cur.get(action) && !!this.prev.get(action);
  }

  /** "Consomme" un appui pour qu'aucun autre système ne le traite pendant ce pas. */
  consume(action) {
    this.justPressed.delete(action);
  }

  /** Direction sous forme de vecteur {x,y} dans [-1,1]. */
  axis() {
    return {
      x: (this.down('right') ? 1 : 0) - (this.down('left') ? 1 : 0),
      y: (this.down('down') ? 1 : 0) - (this.down('up') ? 1 : 0),
    };
  }
}
