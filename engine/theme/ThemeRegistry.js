import { createCanvas } from '../graphics/canvas.js';
import { createRng, hashString } from '../core/math.js';
import { Tileset } from '../world/Tileset.js';
import { SpriteSheet } from '../graphics/SpriteSheet.js';

// Ambiances (thèmes). Le moteur ne sait pas ce qu'est "de l'herbe" ou "une coque de
// vaisseau" : un JEU déclare des RÔLES de tuiles ('floor', 'wall', 'water'...), et
// chaque thème fournit l'apparence de ces rôles. Même carte => autre ambiance.
//
// Forme d'un thème :
// {
//   id, name,
//   tiles:   { [rôle]: { solid?, frames?, fps?, variants?, props?, paint(ctx, {size, frame, variant, rng}) } },
//            props.shadow : projette une ombre sur la tuile du dessous ; props.edge : liseré (écume...)
//   sprites: { [planche]: { frameW, frameH, frames: string[], paint(ctx, name, i) } },
//   ui:      { box, border, text, accent, ... }   // style des boîtes de dialogue / menus
//   sfx:     { [nom]: spec audio },
//   words:   { [clé]: [singulier, pluriel] }       // vocabulaire propre à l'ambiance
//   background: '#...'
// }

export function buildTileset(theme, roles, tileSize = 16) {
  const missing = roles.filter((r) => !theme.tiles?.[r]);
  if (missing.length) throw new Error(`Thème "${theme.id}" : rôles de tuiles manquants : ${missing.join(', ')}`);
  const tiles = roles.map((name) => {
    const t = theme.tiles[name];
    return { name, solid: !!t.solid, frames: t.frames || 1, fps: t.fps || 3, variants: t.variants || 1, props: t.props || {}, paint: t.paint };
  });
  const maxCols = Math.max(...tiles.map((t) => t.frames * t.variants));
  const canvas = createCanvas(maxCols * tileSize, (tiles.length + 1) * tileSize);
  if (canvas) {
    const ctx = canvas.getContext('2d');
    tiles.forEach((t, i) => {
      for (let v = 0; v < t.variants; v++) {
        for (let f = 0; f < t.frames; f++) {
          ctx.save();
          ctx.translate((v * t.frames + f) * tileSize, (i + 1) * tileSize);
          ctx.beginPath();
          ctx.rect(0, 0, tileSize, tileSize);
          ctx.clip();
          t.paint?.(ctx, { size: tileSize, frame: f, variant: v, rng: createRng(hashString(theme.id + t.name) + v * 7919) });
          ctx.restore();
        }
      }
    });
  }
  return new Tileset({ tileSize, tiles: tiles.map(({ paint, ...rest }) => rest), image: canvas });
}

export class ThemeRegistry {
  constructor(game = null) {
    this.game = game;
    this.themes = new Map();
    this.roles = []; // rôles de tuiles exigés par le jeu
    this.tileSize = 16;
    this.current = null; // { def, tileset, sprites }
    this._cache = new Map();
  }

  /** Le jeu déclare les rôles de tuiles que chaque thème doit fournir. */
  configure({ roles, tileSize = 16 }) {
    this.roles = roles;
    this.tileSize = tileSize;
    this._cache.clear();
  }

  register(theme) {
    this.themes.set(theme.id, theme);
    return this;
  }

  list() {
    return [...this.themes.values()];
  }

  /** Construit (une seule fois) les images d'un thème puis l'active. */
  use(id) {
    const def = this.themes.get(id);
    if (!def) throw new Error(`Thème "${id}" inconnu`);
    let built = this._cache.get(id);
    if (!built) {
      const sprites = {};
      for (const [k, spec] of Object.entries(def.sprites || {})) sprites[k] = SpriteSheet.paint(spec);
      built = { def, tileset: buildTileset(def, this.roles, this.tileSize), sprites };
      this._cache.set(id, built);
    }
    this.current = built;
    const g = this.game;
    if (g) {
      if (def.ui) Object.assign(g.style, def.ui);
      if (def.background) g.background = def.background;
      for (const [k, spec] of Object.entries(def.sfx || {})) g.audio.define(k, spec);
      g.events.emit('theme:change', built);
    }
    return built;
  }

  /**
   * Vocabulaire du thème : un même objet s'appelle « rubis », « crédits » ou « euros ».
   * theme.words = { coin: ['rubis', 'rubis'], key: ['clé', 'clés'] }  (singulier, pluriel)
   */
  word(key, plural = false) {
    const w = this.current?.def.words?.[key];
    if (w === undefined) return key;
    if (Array.isArray(w)) return plural ? w[1] ?? w[0] : w[0];
    return w;
  }

  /** Passe au thème suivant (pratique pour comparer). */
  next() {
    const ids = [...this.themes.keys()];
    const i = ids.indexOf(this.current?.def.id);
    return this.use(ids[(i + 1) % ids.length]);
  }
}
