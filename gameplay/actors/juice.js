// EFFETS DE JEU (« juice ») : ce qui rend chaque action agréable à voir.
//  - étincelles et éclair blanc quand on touche un monstre, gerbe quand il disparaît ;
//  - très court arrêt sur image sur les coups forts (boss) : on sent l'impact ;
//  - petits nuages de poussière sous les pas du héros (couleur du sol : `props.dust` de la tuile).
// Tout est coupé quand les effets sont désactivés (?fx=0, profil classique).
import { Entity } from '../../engine/index.js';

const TAU = Math.PI * 2;

/** Les effets sont-ils actifs dans ce monde ? */
export const juiceOn = (world) => !!world?.adv?.fx;

/** Gerbe de petites particules (étincelles, poussière, éclats). Disparaît toute seule. */
export class Burst extends Entity {
  /**
   * @param {number} x  centre (pixels monde)
   * @param {number} y
   * @param {object} o
   * @param {number} [o.count]
   * @param {string[]} [o.colors]
   * @param {[number, number]} [o.speed]  vitesse min, max (pixels/s)
   * @param {[number, number]} [o.life]   durée min, max (s)
   * @param {[number, number]} [o.size]   taille min, max (pixels)
   * @param {number} [o.gravity]  (pixels/s², positif = tombe)
   * @param {number} [o.drag]     freinage (0 = aucun)
   * @param {number} [o.angle]    direction moyenne (radians) ; `spread` : ouverture (TAU = tout autour)
   * @param {boolean} [o.glow]    s'additionne à l'image (étincelles lumineuses)
   * @param {boolean} [o.fade]    s'efface (sinon rétrécit)
   */
  constructor(x, y, { count = 8, colors = ['#ffffff'], speed = [30, 70], life = [0.2, 0.45], size = [1, 2], gravity = 0, drag = 3, angle = 0, spread = TAU, glow = false, fade = false, z = 40, rise = 0 } = {}) {
    super({ x: x - 1, y: y - 1, w: 2, h: 2 });
    this.z = z;
    this.glow = glow;
    this.fade = fade;
    this.gravity = gravity;
    this.drag = drag;
    const rnd = (a, b) => a + Math.random() * (b - a);
    this.parts = Array.from({ length: count }, (_, i) => {
      const a = angle + (spread >= TAU ? (i / count) * TAU + Math.random() * 0.6 : (Math.random() - 0.5) * spread);
      const v = rnd(...speed);
      const max = rnd(...life);
      return { x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - rise, life: max, max, size: rnd(...size), color: colors[i % colors.length] };
    });
  }

  update(dt) {
    let alive = 0;
    const f = Math.exp(-this.drag * dt);
    for (const p of this.parts) {
      if (p.life <= 0) continue;
      p.life -= dt;
      p.vx *= f;
      p.vy = p.vy * f + this.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.life > 0) alive++;
    }
    if (!alive) this.kill();
  }

  draw(r) {
    const c = r.ctx;
    const prev = c.globalCompositeOperation;
    if (this.glow) c.globalCompositeOperation = 'lighter';
    for (const p of this.parts) {
      if (p.life <= 0) continue;
      const k = p.life / p.max;
      const s = this.fade ? p.size : Math.max(0.5, p.size * (0.4 + 0.6 * k));
      c.globalAlpha = this.fade ? Math.min(0.9, k * 1.4) : Math.min(1, k * 1.6);
      c.fillStyle = p.color;
      c.fillRect(p.x - s / 2, p.y - s / 2, s, s);
    }
    c.globalAlpha = 1;
    c.globalCompositeOperation = prev;
  }
}

/** Étoile blanche d'impact, très brève, au point du coup. */
export class Impact extends Entity {
  constructor(x, y, { size = 7, duration = 0.12 } = {}) {
    super({ x: x - 1, y: y - 1, w: 2, h: 2 });
    this.z = 60;
    this.size = size;
    this.duration = duration;
    this.t = 0;
  }

  update(dt) {
    if ((this.t += dt) >= this.duration) this.kill();
  }

  draw(r) {
    const k = 1 - this.t / this.duration;
    const c = r.ctx;
    const s = this.size * (0.6 + 0.4 * k);
    const x = this.x + 1;
    const y = this.y + 1;
    c.save();
    c.globalAlpha = Math.min(1, k * 1.5);
    c.fillStyle = '#ffffff';
    c.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4 + 0.4;
      const rad = i % 2 ? s * 0.28 : s;
      c.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad);
    }
    c.fill();
    c.restore();
  }
}

/** Coup porté à un monstre : étincelles dans le sens du coup, éclair blanc, arrêt sur image. */
export function hitFx(target, from, { big = false } = {}) {
  const w = target.world;
  if (!juiceOn(w)) return;
  const fx = from?.cx ?? target.cx;
  const fy = from?.cy ?? target.cy - 4;
  // point d'impact : entre le coup et la cible, plus près de la cible
  const x = target.cx + (fx - target.cx) * 0.3;
  const y = target.cy + (fy - target.cy) * 0.3 - 2;
  const angle = Math.atan2(target.cy - fy, target.cx - fx);
  w.add(new Impact(x, y, { size: big ? 10 : 7 }));
  w.add(new Burst(x, y, { count: big ? 16 : 10, colors: ['#ffffff', '#fff2a0', '#ffd040'], speed: big ? [70, 150] : [55, 110], life: [0.15, 0.32], size: [1.4, 2.6], angle, spread: 2.4, glow: true, drag: 6 }));
  target.hitFlash = 0.12;
  w.adv.hitstop?.(big ? 0.09 : 0.035);
}

/** Un monstre disparaît : gerbe d'éclats colorés et de petites étoiles. */
export function defeatFx(target, colors = ['#ffffff', '#ffe066', '#ff9a40', '#9af07a']) {
  const w = target.world;
  if (!juiceOn(w)) return;
  w.add(new Burst(target.cx, target.cy - 2, { count: 12, colors, speed: [35, 80], life: [0.3, 0.6], size: [1.2, 2.4], gravity: 60, drag: 2.5, rise: 20 }));
  w.add(new Burst(target.cx, target.cy - 2, { count: 6, colors: ['#ffffff'], speed: [20, 40], life: [0.2, 0.35], size: [1, 1.5], glow: true }));
}

/** Petit nuage de poussière sous les pieds (x, y) ; couleur selon le sol. */
export function dustFx(world, x, y) {
  if (!juiceOn(world)) return;
  const tm = world.tilemap;
  const color = tm.propAt(Math.floor(x / tm.tileSize), Math.floor(y / tm.tileSize), 'dust');
  if (color === false) return; // sol sans poussière (eau peu profonde, intérieur ciré...)
  world.add(new Burst(x, y, { count: 4, colors: [color ?? 'rgba(236,226,200,1)'], speed: [8, 18], life: [0.3, 0.5], size: [2.4, 3.8], angle: -Math.PI / 2, spread: 2.6, drag: 4, fade: true, z: -20 }));
}

/** Dessine `draw()` une seconde fois en clair par-dessus : l'éclair blanc d'un coup. */
export function flashOver(r, entity, draw) {
  if (!(entity.hitFlash > 0)) return;
  const c = r.ctx;
  c.save();
  c.globalCompositeOperation = 'lighter';
  c.globalAlpha = Math.min(1, entity.hitFlash / 0.12) * 0.85;
  draw();
  draw();
  c.restore();
}
