import { Entity } from '../../engine/index.js';

// COMPAGNON : un petit animal qui suit le héros (sans le gêner) et trouve
// de temps en temps un indice. Sprites (planche 'objects') : pet_0, pet_1.

export class Companion extends Entity {
  constructor(hero, { hintEvery = 480 } = {}) {
    super({ x: hero.x, y: hero.y + 10, w: 10, h: 8, tags: ['companion'] });
    this.hero = hero;
    this.trail = [];
    this.hintEvery = hintEvery; // secondes de jeu entre deux indices
    this.t = 0;
    this.flip = false;
    this.moving = false;
    this.jump = 0;
  }

  get adv() {
    return this.world.adv;
  }

  _follow(dt) {
    const h = this.hero;
    const last = this.trail[this.trail.length - 1];
    if (!last || last.x !== h.x || last.y !== h.y + 2) this.trail.push({ x: h.x, y: h.y + 2 });
    // Il reste à environ 14 px derrière le héros (sans se coller à lui).
    const near = this.trail.length && Math.hypot(this.trail[0].x - h.x, this.trail[0].y - h.y - 2) < 14;
    if (this.trail.length > 4 && !near) {
      const p = this.trail.shift();
      const dx = p.x - this.x;
      const dy = p.y - this.y;
      this.moving = Math.abs(dx) + Math.abs(dy) > 0.3;
      if (Math.abs(dx) > 0.3) this.flip = dx < 0;
      this.x = p.x;
      this.y = p.y;
    } else this.moving = false;
    if (Math.hypot(h.x - this.x, h.y - this.y) > 90) {
      this.x = h.x;
      this.y = h.y + 10;
      this.trail = [];
    }
  }

  update(dt) {
    this.t += dt;
    this._follow(dt);
    if (this.jump > 0) this.jump -= dt;
    // Indice gratuit de temps en temps.
    const st = this.adv.state;
    st.petTime = (st.petTime ?? 0) + dt;
    if (st.petTime >= this.hintEvery) {
      st.petTime = 0;
      st.give('hint', 1, 99);
      this.jump = 0.6;
      this.world.game.audio.play('secret');
      this.adv.toast('Ton compagnon a trouvé un indice !');
    }
  }

  updateDuringScroll(dt) {
    this._follow(dt);
  }

  draw(r) {
    const frame = this.moving && Math.floor(this.t * 8) % 2 ? 'pet_1' : 'pet_0';
    const hop = this.jump > 0 ? -Math.round(Math.sin((this.jump / 0.6) * Math.PI) * 6) : 0;
    this.world.game.themes.current.sprites.objects.draw(r, frame, this.x - 3, this.y - 8 + hop, { flipX: this.flip });
  }
}
