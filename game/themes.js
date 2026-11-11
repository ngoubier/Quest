// Ambiance de La Quête d'Alia : uniquement le médiéval-fantastique (pas de station spatiale
// ni de ville). On part du thème médiéval de l'essai n°2 et on y ajoute les images du jeu
// (carte du royaume, pierres magiques).
import { THEMES as ALL, TILE_ROLES } from '../demos/02-gameplay/themes.js';
import { P } from '../demos/01-moteur/themes.js';

export { TILE_ROLES };

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

export const THEME = {
  ...base,
  name: 'Royaume d’Iris',
  sprites: {
    ...base.sprites,
    objects: {
      ...objects,
      frames: [...objects.frames, ...NEW_FRAMES],
      paint: (c, name, i) => (NEW_FRAMES.includes(name) ? paintNew(c, name) : objects.paint(c, name, i)),
    },
  },
};
