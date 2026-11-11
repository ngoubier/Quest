// Pile de scènes + transitions (fondu au noir).

export class SceneManager {
  constructor(game) {
    this.game = game;
    this.stack = [];
    this.transition = null;
  }

  get top() {
    return this.stack[this.stack.length - 1] || null;
  }

  push(scene, data) {
    scene.game = this.game;
    scene.manager = this;
    this.stack.push(scene);
    scene.enter(data);
    return scene;
  }

  pop(result) {
    const s = this.stack.pop();
    s?.exit();
    this.top?.resume(result);
    return s;
  }

  /** Vide la pile et la remplace par `scene`. */
  replace(scene, data) {
    while (this.stack.length) this.stack.pop().exit();
    return this.push(scene, data);
  }

  /**
   * Fondu : l'écran s'assombrit, `midpoint()` est exécuté (changer de carte, de scène...),
   * puis l'écran se rallume. Les scènes sont figées pendant la transition.
   */
  fade(midpoint, { duration = 0.35, color = '#000' } = {}) {
    if (this.transition) return;
    this.transition = { t: 0, duration, color, phase: 'out', midpoint };
  }

  get isTransitioning() {
    return !!this.transition;
  }

  update(dt) {
    const tr = this.transition;
    if (tr) {
      tr.t += dt;
      if (tr.t >= tr.duration) {
        if (tr.phase === 'out') {
          tr.midpoint?.();
          tr.phase = 'in';
          tr.t = 0;
        } else this.transition = null;
      }
      return;
    }
    this.top?.update(dt);
  }

  draw(r) {
    let start = this.stack.length - 1;
    while (start > 0 && this.stack[start].transparent) start--;
    for (let i = Math.max(0, start); i < this.stack.length; i++) this.stack[i].draw(r);

    const tr = this.transition;
    if (tr) {
      const k = Math.min(1, tr.t / tr.duration);
      const alpha = tr.phase === 'out' ? k : 1 - k;
      r.withAlpha(alpha, () => r.rect(0, 0, r.width, r.height, tr.color));
    }
  }
}
