import { Entity, Animator, DialogScene, DIRS, createRng } from '../../engine/index.js';

// Entités de la DÉMO (elles ne font pas partie du moteur : le futur module
// "gameplay" en proposera des versions complètes et réutilisables).

const sheet = (e) => e.world.game.themes.current.sprites.chars;

function walkAnims(prefix) {
  const a = {};
  for (const d of ['down', 'up', 'side']) {
    a[`walk_${d}`] = { frames: [`${prefix}_${d}_0`, `${prefix}_${d}_1`], fps: 7 };
    a[`idle_${d}`] = { frames: [`${prefix}_${d}_0`], fps: 1 };
  }
  return a;
}

const animDir = (facing) => (facing === 'left' || facing === 'right' ? 'side' : facing);

export class Player extends Entity {
  constructor(x, y, facing = 'down') {
    // Boîte de collision plus petite que le sprite (les pieds) : on passe mieux entre les obstacles.
    super({ x, y, w: 10, h: 8, tags: ['player'], solid: true, name: 'Joueur' });
    this.speed = 72; // pixels / seconde
    this.facing = facing;
    this.anim = new Animator(walkAnims('player'));
    this.anim.play(`idle_${animDir(facing)}`);
  }

  update(dt) {
    const input = this.world.game.input;
    const { x, y } = input.axis();
    if (x || y) {
      // Direction du regard : on garde l'actuelle si elle fait partie du mouvement.
      const keep = (this.facing === 'left' && x < 0) || (this.facing === 'right' && x > 0) || (this.facing === 'up' && y < 0) || (this.facing === 'down' && y > 0);
      if (!keep) this.facing = x < 0 ? 'left' : x > 0 ? 'right' : y < 0 ? 'up' : 'down';
      const len = Math.hypot(x, y);
      this.move((x / len) * this.speed * dt, (y / len) * this.speed * dt, { cornerAssist: 6 });
      this.anim.play(`walk_${animDir(this.facing)}`);
    } else this.anim.play(`idle_${animDir(this.facing)}`);
    this.anim.update(dt);

    if (input.pressed('action')) this.interact();
  }

  /** Cherche une entité "parlable" juste devant soi. */
  interact() {
    const d = DIRS[this.facing];
    const probe = { x: this.cx - 4 + d.x * 10, y: this.cy - 4 + d.y * 10, w: 8, h: 8 };
    const target = this.world.query(probe, (e) => e !== this && typeof e.talk === 'function')[0];
    if (target) {
      this.world.game.input.consume('action');
      target.talk(this);
    }
  }

  // Pendant le défilement d'écran, on avance doucement dans la nouvelle salle.
  updateDuringScroll(dt, camera) {
    const tr = camera.transition;
    const push = 14 / camera.scrollDuration;
    this.x += tr.dir.x * push * dt;
    this.y += tr.dir.y * push * dt;
    this.anim.update(dt);
  }

  draw(r) {
    sheet(this).draw(r, this.anim.frame, this.x - 3, this.y - 8, { flipX: this.facing === 'left' });
  }
}

export class Npc extends Entity {
  constructor(x, y, lines, homeRect, seed = 1) {
    super({ x: x + 3, y: y + 8, w: 10, h: 8, tags: ['npc'], solid: true, name: 'PNJ' });
    this.lines = lines;
    this.home = homeRect;
    this.rng = createRng(seed);
    this.facing = 'down';
    this.timer = 0;
    this.moving = false;
    this.anim = new Animator(walkAnims('npc'));
    this.anim.play('idle_down');
    this.talking = false;
  }

  update(dt) {
    this.timer -= dt;
    if (this.timer <= 0) {
      this.moving = this.rng() < 0.6;
      this.facing = this.rng.pick(['up', 'down', 'left', 'right']);
      this.timer = 0.6 + this.rng() * 1.4;
    }
    if (this.moving && !this.talking) {
      const d = DIRS[this.facing];
      const px = this.x;
      const py = this.y;
      const res = this.move(d.x * 28 * dt, d.y * 28 * dt);
      const h = this.home;
      // Reste dans sa salle.
      if (this.x < h.x + 16 || this.y < h.y + 16 || this.x + this.w > h.x + h.w - 16 || this.y + this.h > h.y + h.h - 16) {
        this.x = px;
        this.y = py;
        this.timer = 0;
      }
      if (res.hitX || res.hitY) this.timer = Math.min(this.timer, 0.2);
      this.anim.play(`walk_${animDir(this.facing)}`);
    } else this.anim.play(`idle_${animDir(this.facing)}`);
    this.anim.update(dt);
  }

  talk(player) {
    // Se tourne vers le joueur.
    const dx = player.cx - this.cx;
    const dy = player.cy - this.cy;
    this.facing = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : dy < 0 ? 'up' : 'down';
    this.anim.play(`idle_${animDir(this.facing)}`);
    this.talking = true;
    this.world.game.scenes.push(new DialogScene(this.lines, { speaker: 'Habitant', onClose: () => (this.talking = false) }));
  }

  draw(r) {
    sheet(this).draw(r, this.anim.frame, this.x - 3, this.y - 8, { flipX: this.facing === 'left' });
  }
}

export class Sign extends Entity {
  constructor(x, y, text) {
    super({ x: x + 1, y: y + 6, w: 14, h: 10, tags: ['sign'], solid: true, name: 'Panneau' });
    this.text = text;
  }

  talk() {
    this.world.game.scenes.push(new DialogScene(this.text, { speaker: 'Panneau' }));
  }

  draw(r) {
    sheet(this).draw(r, 'sign', this.x - 1, this.y - 6);
  }
}
