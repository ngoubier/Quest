// Ambiance de La Quête d'Alia : le médiéval-fantastique, avec les graphismes adaptés à l'appareil
// (mobile lisible, PC en haute définition). On part du thème médiéval de l'essai n°2 et on y ajoute les images du jeu
// (carte du royaume, pierres magiques).
import { THEMES as ALL, TILE_ROLES } from '../demos/02-gameplay/themes.js';
import { P } from '../demos/01-moteur/themes.js';
import { GIVRE_TILES, GIVRE_OBJECT_FRAMES, paintGivreObject, GIVRE_CHARS, paintGivrePerson, paintYeti } from './theme-givre.js';
import { SEVE_TILES, SEVE_OBJECT_FRAMES, paintSeveObject, SEVE_CHARS, paintSevePerson, paintSevePersonHD, paintRonce } from './theme-seve.js';
import { TEMPS_TILES, TEMPS_OBJECT_FRAMES, paintTempsObject, TEMPS_CHARS, paintTempsPerson, paintTempsPersonHD, paintMinotaure } from './theme-temps.js';
import { AURORE_TILES, AURORE_OBJECT_FRAMES, paintAuroreObject, AURORE_CHARS, paintAurorePerson, paintAurorePersonHD, paintMasque } from './theme-aurore.js';

// Dessins propres à chaque niveau : tuiles, objets et monstres, habitants, boss.
// paintHD : version haute définition (PC) ; sans elle, l'image est agrandie automatiquement.
const LEVELS = [
  { tiles: GIVRE_TILES, objects: GIVRE_OBJECT_FRAMES, paintObject: paintGivreObject, chars: GIVRE_CHARS, paintChar: paintGivrePerson, boss: ['yeti_0', 'yeti_1'], paintBoss: (c, name) => paintYeti(c, name === 'yeti_1' ? 1 : 0) },
  { tiles: SEVE_TILES, objects: SEVE_OBJECT_FRAMES, paintObject: paintSeveObject, chars: SEVE_CHARS, paintChar: paintSevePerson, paintCharHD: paintSevePersonHD, boss: ['ronce_0', 'ronce_1', 'ronce_shield'], paintBoss: paintRonce },
  { tiles: AURORE_TILES, objects: AURORE_OBJECT_FRAMES, paintObject: paintAuroreObject, chars: AURORE_CHARS, paintChar: paintAurorePerson, paintCharHD: paintAurorePersonHD, boss: ['masque_0', 'masque_1', 'masque_shield'], paintBoss: paintMasque },
  { tiles: TEMPS_TILES, objects: TEMPS_OBJECT_FRAMES, paintObject: paintTempsObject, chars: TEMPS_CHARS, paintChar: paintTempsPerson, paintCharHD: paintTempsPersonHD, boss: ['minotaure_0', 'minotaure_1', 'minotaure_shield'], paintBoss: paintMinotaure },
];

/** Couleurs des 6 pierres : [couleur, reflet, ombre]. */
export const STONE_COLORS = {
  givre: ['#5fe1ff', '#d8f8ff', '#2a8ab0'],
  seve: ['#4cf07a', '#c8ffd8', '#1f9a48'],
  aurore: ['#ffd23f', '#fff4b8', '#b08a10'],
  temps: ['#b36bff', '#e8d0ff', '#6a2ab0'],
  soleil: ['#ff8a1f', '#ffd0a0', '#b04a0a'],
  marees: ['#2f7bff', '#b8d4ff', '#1a3ea8'],
};

const NEW_FRAMES = ['royal_map', ...Object.keys(STONE_COLORS).map((k) => `stone_${k}`)];

function paintNew(c, name) {
  if (name === 'royal_map') {
    // parchemin déroulé avec un bout de carte
    P(c, 1, 3, 14, 11, '#7a5a30');
    P(c, 2, 4, 12, 9, '#f4e8c8');
    P(c, 1, 2, 2, 13, '#c8a060');
    P(c, 13, 2, 2, 13, '#c8a060');
    P(c, 4, 6, 4, 3, '#6fbf4a');
    P(c, 8, 5, 3, 4, '#3b82d6');
    P(c, 6, 9, 5, 2, '#e8c87a');
    P(c, 7, 7, 2, 2, '#3a2a2a');
    P(c, 7, 6, 2, 1, '#ff6a1a');
    return;
  }
  const [col, light, dark] = STONE_COLORS[name.slice(6)];
  const rows = ['....##....', '...####...', '..######..', '.########.', '##########', '.########.', '..######..', '...####...', '....##....'];
  rows.forEach((row, j) => [...row].forEach((ch, i) => ch === '#' && P(c, 3 + i, 3 + j, 1, 1, i + j < 7 ? light : i + j > 11 ? dark : col)));
  P(c, 6, 5, 2, 1, '#ffffff');
}

const base = ALL.find((t) => t.id === 'medieval');
const objects = base.sprites.objects;
const chars = base.sprites.chars;
const boss = base.sprites.boss;

const GAME_FRAMES = new Set(NEW_FRAMES);
const objectLevel = new Map(LEVELS.flatMap((l) => l.objects.map((f) => [f, l])));
const charLevel = new Map(LEVELS.flatMap((l) => l.chars.map((w) => [w, l])));
const bossLevel = new Map(LEVELS.flatMap((l) => l.boss.map((f) => [f, l])));
const NEW_CHARS = [...charLevel.keys()].flatMap((who) => ['down', 'up', 'side'].flatMap((d) => [0, 1].map((st) => `${who}_${d}_${st}`)));

// Rivière de la forêt : l'eau du thème, mais on peut y faire couler un rondin (fillable)
// et les flèches passent au-dessus (low).
const river = { ...base.tiles.water, props: { ...(base.tiles.water.props ?? {}), low: true, fillable: 'log_bridge' } };
// Canal de Bourg-Lanterne : l'eau du thème, le boomerang et les flèches passent au-dessus.
const canal = { ...base.tiles.water, props: { ...(base.tiles.water.props ?? {}), low: true } };
const LEVEL_TILES = Object.assign({ river, canal }, ...LEVELS.map((l) => l.tiles));

export const ROLES = [...TILE_ROLES, ...Object.keys(LEVEL_TILES)];

export const THEME = {
  ...base,
  name: 'Royaume d’Iris',
  tiles: { ...base.tiles, ...LEVEL_TILES },
  sprites: {
    ...base.sprites,
    objects: {
      ...objects,
      frames: [...objects.frames, ...NEW_FRAMES, ...objectLevel.keys()],
      paint: (c, name, i) => (GAME_FRAMES.has(name) ? paintNew(c, name) : objectLevel.has(name) ? objectLevel.get(name).paintObject(c, name) : objects.paint(c, name, i)),
      // PC : dessins haute définition du thème de base ; les nouvelles images sont agrandies automatiquement.
      paintHD: (c, name, i, k) => (GAME_FRAMES.has(name) || objectLevel.has(name) || !objects.paintHD ? false : objects.paintHD(c, name, i, k)),
    },
    chars: {
      ...chars,
      frames: [...chars.frames, ...NEW_CHARS],
      paint: (c, name, i) => {
        const [who, dir, step] = name.split('_');
        return charLevel.has(who) ? charLevel.get(who).paintChar(c, who, dir, Number(step)) : chars.paint(c, name, i);
      },
      paintHD: (c, name, i, k) => {
        const [who, dir, step] = name.split('_');
        if (charLevel.has(who)) return charLevel.get(who).paintCharHD?.(c, who, dir, Number(step)) ?? false;
        return chars.paintHD ? chars.paintHD(c, name, i, k) : false;
      },
    },
    boss: {
      ...boss,
      frames: [...boss.frames, ...bossLevel.keys()],
      paint: (c, name) => (bossLevel.has(name) ? bossLevel.get(name).paintBoss(c, name) : boss.paint(c, name)),
      paintHD: (c, name, i, k) => (bossLevel.has(name) || !boss.paintHD ? false : boss.paintHD(c, name, i, k)),
    },
  },
};
