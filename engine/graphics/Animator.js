// Joue des animations définies comme des listes d'images.
// new Animator({ walk_down: { frames: ['down_0','down_1'], fps: 6 } })

export class Animator {
  constructor(animations = {}) {
    this.animations = animations;
    this.current = null;
    this.time = 0;
    this.done = false;
  }

  play(name, restart = false) {
    if (!this.animations[name]) throw new Error(`Animator : animation "${name}" inconnue`);
    if (this.current === name && !restart) return;
    this.current = name;
    this.time = 0;
    this.done = false;
  }

  update(dt) {
    if (this.current) this.time += dt;
  }

  /** Image courante (nom ou index), ou null. */
  get frame() {
    const a = this.animations[this.current];
    if (!a) return null;
    const n = a.frames.length;
    let i = Math.floor(this.time * (a.fps ?? 8));
    if (a.loop === false) {
      if (i >= n - 1) this.done = true;
      i = Math.min(i, n - 1);
    } else i %= n;
    return a.frames[i];
  }
}
