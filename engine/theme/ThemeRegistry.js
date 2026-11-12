import { createRng, hashString } from '../core/math.js';
import { buildAtlas } from '../graphics/pixelart.js';
import { DISPLAY_PROFILES } from '../graphics/display.js';
import { Tileset } from '../world/Tileset.js';
import { SpriteSheet } from '../graphics/SpriteSheet.js';

// Ambiances (thèmes). Le moteur ne sait pas ce qu'est "de l'herbe" ou "une coque de
// vaisseau" : un JEU déclare des RÔLES de tuiles ('floor', 'wall', 'water'...), et
// chaque thème fournit l'apparence de ces rôles. Même carte => autre ambiance.
//
// Forme d'un thème :
// {
//   id, name,
//   tiles:   { [rôle]: { solid?, frames?, fps?, variants?, props?, paint(ctx, {size, frame, variant, rng}),
//                        paintHD?(ctx, {size, k, frame, variant, rng}) } },
//            props.shadow : projette une ombre sur la tuile du dessous ; props.edge : liseré (écume...)
//            paintHD : version haute définition dessinée à la main (size = 16×k pixels), utilisée sur PC
//            tall : { ground(ctx, o), groundHD?, paint(ctx, o), paintHD? } — GRAND ÉLÉMENT SUR 2 CASES (arbre) :
//                   paint dessine dans un repère de 16 × 32 (sol en bas). La moitié basse va sur la case
//                   (par-dessus `ground`), la moitié haute (la cime) sur la case du dessus, devant les personnages.
//   sprites: { [planche]: { frameW, frameH, frames: string[], paint(ctx, name, i), paintHD?(ctx, name, i, k) } },
//   profiles: { mobile?: {...}, pc?: {...} }   // retouches propres à un profil d'affichage :
//            mêmes clés que le thème (tiles, sprites, ui...), fusionnées par-dessus
//   ui:      { box, border, text, accent, ... }   // style des boîtes de dialogue / menus
//   sfx:     { [nom]: spec audio },
//   words:   { [clé]: [singulier, pluriel] }       // vocabulaire propre à l'ambiance
//   background: '#...'
// }

export function buildTileset(theme, roles, tileSize = 16, profile = DISPLAY_PROFILES.classic) {
  const missing = roles.filter((r) => !theme.tiles?.[r]);
  if (missing.length) throw new Error(`Thème "${theme.id}" : rôles de tuiles manquants : ${missing.join(', ')}`);
  const tiles = roles.map((name) => {
    const t = theme.tiles[name];
    return { name, solid: !!t.solid, frames: t.frames || 1, fps: t.fps || 3, variants: t.variants || 1, props: t.props || {}, paint: t.paint, paintHD: t.paintHD, tall: t.tall };
  });
  // Une case par (tuile, variante, image) ; la tuile d'id N est sur la ligne N.
  // Les cimes des grands éléments (tall) viennent ensuite, une ligne chacune.
  const cells = [];
  tiles.forEach((t, i) => {
    for (let v = 0; v < t.variants; v++) for (let f = 0; f < t.frames; f++) cells.push({ t, row: i + 1, col: v * t.frames + f, v, f });
  });
  const crownRows = {};
  tiles.filter((t) => t.tall).forEach((t, j) => {
    const row = tiles.length + 1 + j;
    crownRows[tiles.indexOf(t) + 1] = row;
    for (let v = 0; v < t.variants; v++) for (let f = 0; f < t.frames; f++) cells.push({ t, row, col: v * t.frames + f, v, f, crown: true });
  });
  const rng = (c) => createRng(hashString(theme.id + c.t.name) + c.v * 7919);
  const k = profile.detail || 1;
  const { canvas, detail } = buildAtlas({
    count: cells.length,
    place: (i) => cells[i],
    cols: Math.max(...tiles.map((t) => t.frames * t.variants)),
    rows: tiles.length + 1 + Object.keys(crownRows).length,
    cellW: tileSize,
    cellH: tileSize,
    paint: (ctx, i) => {
      const c = cells[i];
      const o = { size: tileSize, frame: c.f, variant: c.v, rng: rng(c) };
      if (c.t.tall) return paintTall(ctx, c, c.t.tall.ground, c.t.tall.paint, o, tileSize, rng);
      c.t.paint?.(ctx, o);
    },
    paintHD: (ctx, i) => {
      const c = cells[i];
      const o = { size: tileSize * k, k, frame: c.f, variant: c.v, rng: rng(c) };
      if (c.t.tall) {
        const { groundHD, paintHD } = c.t.tall;
        if (!paintHD || (!c.crown && !groundHD)) return false;
        return paintTall(ctx, c, groundHD, paintHD, o, tileSize * k, rng);
      }
      if (!c.t.paintHD) return false;
      return c.t.paintHD(ctx, o);
    },
    kind: 'tile',
    profile,
    seed: hashString(theme.id),
  });
  return new Tileset({ tileSize, tiles: tiles.map(({ paint, paintHD, tall, ...rest }) => rest), image: canvas, detail, crowns: crownRows });
}

/**
 * Une case d'un grand élément : la cime (moitié haute du dessin 16 × 32) ou la case du bas
 * (le sol, puis la moitié basse). Le dessin a son propre tirage au hasard : les deux moitiés se raccordent.
 */
function paintTall(ctx, c, ground, draw, o, size, rng) {
  if (!c.crown) ground(ctx, o);
  ctx.save();
  if (!c.crown) ctx.translate(0, -size);
  draw(ctx, { ...o, rng: rng({ ...c, v: c.v + 101 }) });
  ctx.restore();
  return true;
}

/** Applique les retouches d'un profil (theme.profiles[id]) par-dessus le thème. */
export function themeForProfile(theme, profileId) {
  const o = theme.profiles?.[profileId];
  if (!o) return theme;
  const merge = (a = {}, b = {}) => {
    const out = { ...a };
    for (const [key, v] of Object.entries(b)) out[key] = { ...(a[key] ?? {}), ...v };
    return out;
  };
  return {
    ...theme,
    ...o,
    tiles: merge(theme.tiles, o.tiles),
    sprites: merge(theme.sprites, o.sprites),
    ui: { ...theme.ui, ...o.ui },
  };
}

export class ThemeRegistry {
  constructor(game = null) {
    this.game = game;
    this.themes = new Map();
    this.roles = []; // rôles de tuiles exigés par le jeu
    this.tileSize = 16;
    this.current = null; // { def, tileset, sprites }
    this._cache = new Map();
    this.profile = DISPLAY_PROFILES.classic; // profil d'affichage (mobile, pc...)
  }

  /** Change le profil d'affichage ; l'ambiance en cours est refabriquée. */
  setProfile(profile) {
    this.profile = profile;
    if (this.current) this.use(this.current.def.id);
    return this;
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
    const p = this.profile;
    const key = `${id}|${p.id}|${p.detail}`;
    let built = this._cache.get(key);
    if (!built) {
      const t = themeForProfile(def, p.id);
      const sprites = {};
      for (const [k, spec] of Object.entries(t.sprites || {})) sprites[k] = SpriteSheet.paint(spec, p);
      built = { def: t, tileset: buildTileset(t, this.roles, this.tileSize, p), sprites, profile: p };
      this._cache.set(key, built);
    }
    this.current = built;
    const g = this.game;
    const d = built.def;
    if (g) {
      if (d.ui) Object.assign(g.style, d.ui);
      if (d.background) g.background = d.background;
      for (const [k, spec] of Object.entries(d.sfx || {})) g.audio.define(k, spec);
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
