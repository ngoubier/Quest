// AMBIANCE — lumière et atmosphère dessinées par-dessus le monde (après les tuiles et les personnages).
//
// Un jeu décrit chaque lieu par un « préréglage » (objet simple, toutes les clés sont facultatives) :
// {
//   tint: ['#ffd060', 0.3],          // teinte générale et sa force (mélange « lumière douce » ;
//                                    //   tintMode pour en choisir un autre, ex. 'overlay')
//   sky:  ['#fff4e0', '#d8d0f0'],    // lumière du haut vers le bas de l'écran (multiplication ; blanc = rien)
//   vignette: 0.35,                  // bords de l'écran assombris (0 = rien)
//   vignetteColor: '#3c2846',
//   rays: ['#ffe6a0', 0.18],         // rayons de soleil en biais (profil complet seulement)
//   clouds: 0.3,                     // ombres de nuages qui glissent sur le sol (profil complet seulement)
//   ambient: '#5a5070',              // pénombre : la lumière qui reste (blanc = plein jour) ;
//                                    //   les sources de lumière y percent des trous colorés
//   heroLight: 60,                   // le héros porte une lanterne de ce rayon (pixels de jeu)
//   glow: 0.35,                      // halo des sources de lumière en plein jour (0 = rien)
//   particles: ['firefly', 24],      // firefly, snow, ash, ember, leaf, mote, sand, sparkle
// }
//
// Sources de lumière :
//  - tuiles : table { nomDeTuile: { r, color, flicker? } } donnée au constructeur ;
//  - entités : getter `light` qui renvoie { r, color, flicker? } ou null (brasero allumé, flammèche...).
//
// Niveau de détail (profil d'affichage, clé `fx`) : 'full' (PC), 'lite' (mobile : pas de rayons ni de
// nuages, moitié moins de particules), false (rien du tout).

const TAU = Math.PI * 2;

/** Petit générateur pseudo-aléatoire stable (mêmes particules d'une image à l'autre). */
const hash = (n) => {
  let v = Math.imul(n + 0x9e37, 0x85ebca6b);
  v = Math.imul(v ^ (v >>> 13), 0x27d4eb2d);
  return ((v ^ (v >>> 15)) >>> 0) / 4294967296;
};

const mod = (a, n) => ((a % n) + n) % n;

const makeCanvas = (w, h) => {
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(w, h);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
};

/** Couleur '#rrggbb' -> 'rgba(r,g,b,a)'. */
export function rgba(hex, a) {
  const h = hex.replace('#', '');
  const f = h.length === 3 ? [...h].map((ch) => ch + ch).join('') : h;
  const [r, g, b] = [0, 2, 4].map((k) => parseInt(f.slice(k, k + 2), 16));
  return `rgba(${r},${g},${b},${a})`;
}

/** Comportement des particules : couleur, taille, mouvement (x, y en pixels de jeu, t en secondes). */
const PARTICLES = {
  firefly: { glow: true, color: '#e6ff8a', size: 1.2, move: (s, t) => [Math.sin(t * 0.6 + s * 40) * 14, Math.cos(t * 0.45 + s * 31) * 10], alpha: (s, t) => 0.35 + 0.65 * Math.max(0, Math.sin(t * 2.2 + s * 50)) },
  snow: { color: '#ffffff', shade: 'rgba(70,90,140,0.45)', size: 1.4, fall: 16, move: (s, t) => [Math.sin(t * 1.3 + s * 20) * 6 + t * 4, 0], alpha: () => 0.9 },
  ash: { color: '#6a6060', size: 1, fall: 7, move: (s, t) => [Math.sin(t * 0.9 + s * 20) * 8 + t * 3, 0], alpha: () => 0.75 },
  ember: { glow: true, color: '#ffa040', size: 1, fall: -14, move: (s, t) => [Math.sin(t * 2 + s * 30) * 5, 0], alpha: (s, t) => 0.5 + 0.5 * Math.sin(t * 6 + s * 70) },
  leaf: { color: ['#d89a3a', '#8ac04a', '#c0602a'], size: 1.5, fall: 9, spin: true, move: (s, t) => [Math.sin(t * 1.1 + s * 25) * 12 + t * 5, 0], alpha: () => 0.95 },
  mote: { glow: true, color: '#fff2c0', size: 0.8, fall: -2, move: (s, t) => [Math.sin(t * 0.4 + s * 30) * 8, Math.cos(t * 0.3 + s * 17) * 5], alpha: (s, t) => 0.25 + 0.35 * Math.sin(t * 1.5 + s * 40) },
  sand: { color: '#f0d8a0', size: 0.8, fall: 2, move: (s, t) => [t * 26 + Math.sin(t * 3 + s * 9) * 3, 0], alpha: () => 0.55 },
  sparkle: { glow: true, color: '#d8f4ff', size: 1, move: (s, t) => [Math.sin(t * 0.3 + s * 12) * 4, Math.cos(t * 0.25 + s * 15) * 4], alpha: (s, t) => Math.max(0, Math.sin(t * 2.5 + s * 90)) ** 3 },
};

export class Ambience {
  /**
   * @param {object} [o]
   * @param {Record<string, {r:number, color:string, flicker?:number}>} [o.tileLights]
   * @param {'full'|'lite'|false} [o.level]
   */
  constructor({ tileLights = {}, level = 'full' } = {}) {
    this.tileLights = tileLights;
    this.level = level;
    this.preset = null;
    this._sprites = new Map(); // halos déjà dessinés (couleur|rayon)
    this._layer = null; // calque de pénombre
  }

  set(preset) {
    this.preset = preset || null;
  }

  get enabled() {
    return !!this.level && !!this.preset;
  }

  /** Halo rond pré-dessiné (rapide à recopier, même pour des dizaines de lumières). */
  _sprite(color, r) {
    const key = `${color}|${r}`;
    let s = this._sprites.get(key);
    if (!s) {
      const size = Math.max(2, Math.ceil(r * 2));
      s = makeCanvas(size, size);
      const g = s.getContext('2d');
      const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      grad.addColorStop(0, rgba(color, 1));
      grad.addColorStop(0.35, rgba(color, 0.75));
      grad.addColorStop(0.7, rgba(color, 0.25));
      grad.addColorStop(1, rgba(color, 0));
      g.fillStyle = grad;
      g.fillRect(0, 0, size, size);
      this._sprites.set(key, s);
    }
    return s;
  }

  /** Toutes les lumières visibles, en coordonnées du monde : [{x, y, r, color}]. */
  collectLights(world, time) {
    const out = [];
    const tm = world.tilemap;
    const ts = tm.tileSize;
    const view = world.camera.view;
    const pad = 3; // une lumière juste hors de l'écran éclaire quand même le bord
    const x0 = Math.max(0, Math.floor(view.x / ts) - pad);
    const y0 = Math.max(0, Math.floor(view.y / ts) - pad);
    const x1 = Math.min(tm.width - 1, Math.floor((view.x + view.w) / ts) + pad);
    const y1 = Math.min(tm.height - 1, Math.floor((view.y + view.h) / ts) + pad);
    const flick = (l, seed) => (l.flicker ? 1 + l.flicker * (Math.sin(time * 11 + seed * 7) * 0.6 + Math.sin(time * 23 + seed * 3) * 0.4) : 1);
    if (Object.keys(this.tileLights).length) {
      for (let ty = y0; ty <= y1; ty++) {
        for (let tx = x0; tx <= x1; tx++) {
          const l = this.tileLights[tm.nameAt(tx, ty)];
          if (l) out.push({ x: tx * ts + ts / 2, y: ty * ts + ts / 2 + (l.dy ?? 0), r: l.r * flick(l, tx * 31 + ty), color: l.color });
        }
      }
    }
    for (const e of world.entities) {
      if (e.dead || !e.visible) continue;
      const l = e.light;
      if (l) out.push({ x: e.cx, y: e.cy + (l.dy ?? 0), r: l.r * flick(l, e.id ?? 0), color: l.color });
    }
    return out;
  }

  /**
   * Dessine l'ambiance sur la zone du monde.
   * @param {import('./Renderer.js').Renderer} r
   * @param {import('../world/World.js').World} world
   * @param {{hero?: {cx:number, cy:number}, outdoor?: boolean}} [o]
   */
  draw(r, world, { hero = null } = {}) {
    if (!this.enabled) return;
    const p = this.preset;
    const full = this.level === 'full';
    const c = r.ctx;
    const vp = world.viewport;
    const cam = world.camera;
    const t = world.time;
    const camX = Math.round(cam.x + (cam.shakeX || 0));
    const camY = Math.round(cam.y + (cam.shakeY || 0));
    const sx = (x) => vp.x + x - camX;
    const sy = (y) => vp.y + y - camY;
    c.save();
    c.beginPath();
    c.rect(vp.x, vp.y, vp.w, vp.h);
    c.clip();

    // 1. Ombres des nuages : de grandes taches douces qui glissent sur le sol (attachées au monde).
    if (full && p.clouds) {
      c.globalCompositeOperation = 'multiply';
      const cell = 220;
      const ox = mod(camX - t * 7, cell);
      const oy = mod(camY - t * 2.5, cell);
      for (let gx = -1; gx <= Math.ceil(vp.w / cell) + 1; gx++) {
        for (let gy = -1; gy <= Math.ceil(vp.h / cell) + 1; gy++) {
          const kx = Math.floor((camX - t * 7) / cell) + gx;
          const ky = Math.floor((camY - t * 2.5) / cell) + gy;
          const s = hash(kx * 7349 + ky * 1931);
          if (s < 0.62) continue; // un nuage de temps en temps : le soleil domine
          const cx = vp.x + gx * cell - ox + s * cell * 0.6;
          const cy = vp.y + gy * cell - oy + hash(kx * 113 + ky * 977) * cell * 0.6;
          const rad = 50 + s * 40;
          const g = c.createRadialGradient(cx, cy, 0, cx, cy, rad);
          g.addColorStop(0, `rgba(60,70,130,${p.clouds})`);
          g.addColorStop(0.6, `rgba(60,70,130,${p.clouds * 0.6})`);
          g.addColorStop(1, 'rgba(60,70,130,0)');
          c.fillStyle = g;
          c.save();
          c.translate(cx, cy);
          c.scale(1.7, 0.85);
          c.translate(-cx, -cy);
          c.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);
          c.restore();
        }
      }
      c.globalCompositeOperation = 'source-over';
    }

    // 2. Étalonnage : teinte générale, puis lumière du ciel (haut -> bas).
    if (p.tint) {
      c.globalCompositeOperation = p.tintMode ?? 'soft-light';
      c.fillStyle = rgba(p.tint[0], p.tint[1]);
      c.fillRect(vp.x, vp.y, vp.w, vp.h);
    }
    if (p.sky) {
      c.globalCompositeOperation = 'multiply';
      const g = c.createLinearGradient(0, vp.y, 0, vp.y + vp.h);
      g.addColorStop(0, p.sky[0]);
      g.addColorStop(1, p.sky[1]);
      c.fillStyle = g;
      c.fillRect(vp.x, vp.y, vp.w, vp.h);
    }

    // 3. Lumières : pénombre percée par les sources (ou simple halo en plein jour).
    const lights = this.collectLights(world, t);
    if (hero && p.heroLight) lights.push({ x: hero.cx, y: hero.cy - 2, r: p.heroLight * (1 + Math.sin(t * 9) * 0.02), color: p.heroLightColor ?? '#ffd8a0' });
    if (p.ambient) this._drawDarkness(r, vp, lights, sx, sy, p.ambient);
    const glow = p.glow ?? 0.3;
    if (glow > 0 && lights.length) {
      c.globalCompositeOperation = 'lighter';
      c.globalAlpha = glow;
      for (const l of lights) {
        const rr = l.r * 0.7;
        c.drawImage(this._sprite(l.color, 32), sx(l.x) - rr, sy(l.y) - rr, rr * 2, rr * 2);
      }
      c.globalAlpha = 1;
    }

    // 4. Rayons de soleil en biais, qui respirent doucement.
    if (full && p.rays) {
      c.globalCompositeOperation = 'screen';
      const [col, a] = p.rays;
      const step = 64;
      const shift = mod(-camX * 0.5, step);
      for (let k = -2; k < vp.w / step + 2; k++) {
        const x = vp.x + k * step + shift;
        const i = Math.floor((camX * 0.5) / step) + k;
        const alpha = a * (0.4 + 0.6 * Math.max(0, Math.sin(t * 0.5 + i * 1.7))) * (hash(i * 97) > 0.4 ? 1 : 0);
        if (alpha <= 0.01) continue;
        const w = 10 + hash(i * 31) * 18;
        const g = c.createLinearGradient(0, vp.y, 0, vp.y + vp.h);
        g.addColorStop(0, rgba(col, alpha / 3));
        g.addColorStop(1, rgba(col, 0));
        c.fillStyle = g;
        // trois épaisseurs superposées : le rayon est plus fort au centre, ses bords sont flous
        for (const f of [1, 0.65, 0.3]) {
          const m = (w * (1 - f)) / 2;
          c.beginPath();
          c.moveTo(x + m, vp.y);
          c.lineTo(x + w - m, vp.y);
          c.lineTo(x + w - m + vp.h * 0.55, vp.y + vp.h);
          c.lineTo(x + m + vp.h * 0.55, vp.y + vp.h);
          c.fill();
        }
      }
    }

    // 5. Particules (attachées au monde : elles défilent avec le décor).
    if (p.particles) this._drawParticles(c, vp, camX, camY, t, full);

    // 6. Vignette : bords de l'écran assombris, l'œil va au centre.
    if (p.vignette) {
      c.globalCompositeOperation = 'source-over';
      const cx = vp.x + vp.w / 2;
      const cy = vp.y + vp.h / 2;
      const g = c.createRadialGradient(cx, cy, Math.min(vp.w, vp.h) * 0.5, cx, cy, Math.hypot(vp.w, vp.h) * 0.56);
      const col = p.vignetteColor ?? '#2a1e36';
      g.addColorStop(0, rgba(col, 0));
      g.addColorStop(1, rgba(col, p.vignette));
      c.fillStyle = g;
      c.fillRect(vp.x, vp.y, vp.w, vp.h);
    }
    c.restore();
  }

  _drawDarkness(r, vp, lights, sx, sy, ambient) {
    // Calque à la résolution du jeu (pas de l'écran) : la lumière est floue de toute façon,
    // et c'est jusqu'à 16 fois moins de pixels à calculer.
    const k = 1;
    const W = Math.max(1, Math.ceil(vp.w * k));
    const H = Math.max(1, Math.ceil(vp.h * k));
    if (!this._layer || this._layer.width !== W || this._layer.height !== H) this._layer = makeCanvas(W, H);
    const l = this._layer.getContext('2d');
    l.globalCompositeOperation = 'source-over';
    l.fillStyle = ambient;
    l.fillRect(0, 0, W, H);
    l.globalCompositeOperation = 'lighter';
    for (const s of lights) {
      const x = (sx(s.x) - vp.x) * k;
      const y = (sy(s.y) - vp.y) * k;
      const rr = s.r * k;
      if (x + rr < 0 || y + rr < 0 || x - rr > W || y - rr > H) continue;
      l.drawImage(this._sprite(s.color, 64), x - rr, y - rr, rr * 2, rr * 2);
    }
    const c = r.ctx;
    c.globalCompositeOperation = 'multiply';
    const smooth = c.imageSmoothingEnabled;
    c.imageSmoothingEnabled = true;
    c.drawImage(this._layer, vp.x, vp.y, vp.w, vp.h);
    c.imageSmoothingEnabled = smooth;
    c.globalCompositeOperation = 'source-over';
  }

  _drawParticles(c, vp, camX, camY, t, full) {
    const [kind, count0] = this.preset.particles;
    const spec = PARTICLES[kind];
    if (!spec) return;
    const count = full ? count0 : Math.ceil(count0 / 2);
    // Les particules vivent dans une « tuile » de monde de la taille de l'écran (+ marge), répétée.
    const pad = 24;
    const W = vp.w + pad * 2;
    const H = vp.h + pad * 2;
    c.globalCompositeOperation = spec.glow ? 'lighter' : 'source-over';
    for (let i = 0; i < count; i++) {
      const s = hash(i * 7919 + 13);
      const [mx, my] = spec.move(s, t);
      const fall = (spec.fall ?? 0) * t * (0.7 + 0.6 * hash(i * 31));
      const x = vp.x - pad + mod(s * W * 7.3 + mx - camX, W);
      const y = vp.y - pad + mod(hash(i * 104729) * H + my + fall - camY, H);
      const a = Math.max(0, Math.min(1, spec.alpha(s, t)));
      if (a <= 0.02) continue;
      const col = Array.isArray(spec.color) ? spec.color[i % spec.color.length] : spec.color;
      const size = spec.size * (0.7 + hash(i * 61) * 0.6);
      if (spec.glow) {
        c.globalAlpha = a * 0.55;
        const rr = size * 4;
        c.drawImage(this._sprite(col, 16), x - rr, y - rr, rr * 2, rr * 2);
      }
      c.globalAlpha = a;
      if (spec.shade) {
        // liseré sombre : un flocon blanc reste visible sur la neige
        c.fillStyle = spec.shade;
        c.fillRect(x - size / 2 + 0.4, y - size / 2 + 0.5, size, size);
      }
      c.fillStyle = col;
      if (spec.spin) {
        const w = size * (1.2 + Math.sin(t * 4 + s * 60));
        c.fillRect(x - Math.abs(w) / 2, y - size / 2, Math.max(0.4, Math.abs(w)), size * 0.8);
      } else c.fillRect(x - size / 2, y - size / 2, size, size);
    }
    c.globalAlpha = 1;
    c.globalCompositeOperation = 'source-over';
  }
}
