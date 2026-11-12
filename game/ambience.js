// AMBIANCES DU ROYAUME D'IRIS — lumière et atmosphère de chaque lieu (voir engine/graphics/Ambience.js).
// Règle d'or : le jeu doit rester très lisible pour un enfant. La pénombre (ambient) ne descend jamais
// trop bas, et le héros porte une lanterne là où il fait sombre.
// Pour comparer : ?fx=0 dans l'adresse coupe tout.

/** Tuiles qui éclairent (rayon en pixels de jeu ; flicker = la flamme tremble). */
export const TILE_LIGHTS = {
  cave_torch: { r: 70, color: '#ffb060', flicker: 0.07, dy: -3 },
  lamp: { r: 76, color: '#ffd080', flicker: 0.03, dy: -6 },
  fireplace: { r: 64, color: '#ff9a40', flicker: 0.08 },
  forge: { r: 60, color: '#ff7a30', flicker: 0.08 },
  lava: { r: 30, color: '#ff6a20', flicker: 0.04 },
  magma: { r: 34, color: '#ffb040', flicker: 0.05 },
};

// Préréglages réutilisés par plusieurs lieux.
// Conseil : sur les lieux verts, une teinte dorée (jaune) réchauffe sans ternir ; l'orange rend l'herbe olive.
const INTERIOR = {
  tint: ['#ffc070', 0.3],
  sky: ['#fffaf0', '#f4e4d4'],
  ambient: '#ece0d4',
  glow: 0.3,
  vignette: 0.4,
  particles: ['mote', 14],
};

const CAVE = {
  tint: ['#8070b0', 0.25],
  ambient: '#686080',
  heroLight: 58,
  glow: 0.35,
  vignette: 0.5,
  vignetteColor: '#120c1e',
  particles: ['mote', 12],
};

export const AMBIENCES = {
  // Prébois : après-midi d'été, nuages qui passent, rayons de soleil, pollen dans la lumière.
  prebois: { tint: ['#ffd060', 0.2], sky: ['#fffef8', '#f6f4fa'], clouds: 0.2, rays: ['#ffe6a0', 0.14], vignette: 0.3, particles: ['mote', 18] },
  souterrains: CAVE,

  // Mont Givré : lumière froide et claire, neige qui tombe.
  givre: { tint: ['#a0c8ff', 0.3], sky: ['#f8fbff', '#dce6fa'], clouds: 0.18, vignette: 0.28, vignetteColor: '#1c2a48', particles: ['snow', 70] },
  givre_temple: { tint: ['#80b0ff', 0.3], ambient: '#c0d2f0', heroLight: 46, glow: 0.3, vignette: 0.42, vignetteColor: '#101c3a', particles: ['sparkle', 26] },

  // Forêt des Murmures : sous-bois vert et doré, rayons entre les arbres, feuilles qui tombent.
  seve: { tint: ['#e8f070', 0.22], sky: ['#fffef4', '#e8f2e0'], rays: ['#fff0a0', 0.2], vignette: 0.4, vignetteColor: '#0e2410', particles: ['leaf', 18] },
  seve_chene: { tint: ['#ffc060', 0.28], ambient: '#c4b090', heroLight: 52, glow: 0.3, vignette: 0.45, vignetteColor: '#1e1408', particles: ['firefly', 18] },

  // Bourg-Lanterne : le soir tombe, les lanternes s'allument.
  aurore: { tint: ['#ff9070', 0.26], sky: ['#f4e0ec', '#c8bce8'], ambient: '#a49cd0', heroLight: 44, glow: 0.45, vignette: 0.36, vignetteColor: '#1c1438', particles: ['firefly', 14] },
  aurore_egouts: { ...CAVE, tint: ['#60a080', 0.22], ambient: '#5e766e', vignetteColor: '#081812' },

  // Labyrinthe des Mille Portes : lumière irréelle, poussière d'étoiles.
  temps: { tint: ['#d0a0ff', 0.2], sky: ['#fcf8ff', '#eee8f8'], clouds: 0.16, vignette: 0.32, vignetteColor: '#1c1036', particles: ['sparkle', 22] },
  temps_arene: { tint: ['#ffb060', 0.28], sky: ['#fff6e8', '#eedcd0'], vignette: 0.42, particles: ['sand', 20] },

  // Désert des Mirages : soleil écrasant, sable qui vole.
  soleil: { tint: ['#ffb040', 0.32], sky: ['#fffcf0', '#f8e8d0'], clouds: 0.12, vignette: 0.26, vignetteColor: '#4a2408', particles: ['sand', 40] },
  soleil_dune: { tint: ['#ffb040', 0.32], sky: ['#fffcf0', '#f8e8d0'], vignette: 0.3, vignetteColor: '#4a2408', particles: ['sand', 40] },
  soleil_temple: { ...CAVE, tint: ['#ffb060', 0.22], ambient: '#82705a', vignetteColor: '#1e1206' },

  // Les Marées : plage lumineuse et fraîche ; les Abysses : bleu profond, rayons venus de la surface.
  marees: { tint: ['#80e0ff', 0.2], sky: ['#ffffff', '#eef6fa'], clouds: 0.2, rays: ['#ffffff', 0.1], vignette: 0.26, vignetteColor: '#0c2a40' },
  marees_fond: { tint: ['#40a0ff', 0.3], ambient: '#98b6e4', heroLight: 52, heroLightColor: '#c8f0ff', rays: ['#c8f0ff', 0.2], vignette: 0.45, vignetteColor: '#041836', particles: ['bubble', 22] },

  // Volcan Noir : ciel de braise, cendres qui tombent, la lave éclaire.
  volcan: { tint: ['#ff7040', 0.14], sky: ['#fff4ee', '#f0d8d0'], ambient: '#f0dcd4', glow: 0.5, vignette: 0.42, vignetteColor: '#2a0604', particles: ['ash', 50] },
  volcan_chateau: { tint: ['#ff6040', 0.24], ambient: '#7e6474', heroLight: 52, glow: 0.45, vignette: 0.5, vignetteColor: '#180408', particles: ['ember', 16] },
};

/** Intérieurs de maisons et de boutiques (même niveau que l'extérieur, mais chaleureux et feutrés). */
const INTERIORS = new Set(['shop', 'givre_shop', 'seve_shop', 'aurore_mairie', 'aurore_biblio', 'aurore_fernand', 'aurore_bleue', 'aurore_auberge', 'aurore_boulangerie', 'aurore_pelagie', 'aurore_bazar']);

/** L'ambiance d'une carte : celle de son intérieur, sinon celle de son niveau. */
export function ambienceFor(mapId, def) {
  if (INTERIORS.has(mapId)) return INTERIOR;
  return AMBIENCES[def.level] ?? null;
}
