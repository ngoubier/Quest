// Calque de débogage (touche F1 ou ²) : FPS, pile de scènes, infos fournies par le jeu.
// Le monde affiche aussi les boîtes de collision quand il est actif.

export class Debug {
  constructor(game) {
    this.game = game;
    this.enabled = false;
    this.providers = []; // fonctions renvoyant des lignes de texte
    this.fps = 0;
    this._frames = 0;
    this._acc = 0;
  }

  toggle() {
    this.enabled = !this.enabled;
  }

  /** Ajoute une source d'infos : debug.addInfo(() => `Joueur : ${p.x},${p.y}`) */
  addInfo(fn) {
    this.providers.push(fn);
    return () => (this.providers = this.providers.filter((f) => f !== fn));
  }

  measureFrame(dt) {
    this._frames++;
    this._acc += dt;
    if (this._acc >= 0.5) {
      this.fps = Math.round(this._frames / this._acc);
      this._frames = 0;
      this._acc = 0;
    }
  }

  draw(r) {
    if (!this.enabled) return;
    const lines = [
      `FPS ${this.fps}`,
      `Scènes : ${this.game.scenes.stack.map((s) => s.constructor.name).join(' > ')}`,
      ...this.providers.flatMap((f) => [].concat(f() ?? [])),
    ];
    const w = Math.max(...lines.map((l) => r.measure(l, 6))) + 8;
    r.withAlpha(0.75, () => r.rect(r.width - w - 2, 18, w, lines.length * 8 + 4, '#000'));
    lines.forEach((l, i) => r.text(l, r.width - w + 2, 20 + i * 8, { size: 6, color: '#7f7' }));
  }
}
