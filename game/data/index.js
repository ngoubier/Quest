// Toutes les données du jeu, niveau par niveau.
import { MAPS as PREBOIS_MAPS, LEGEND, ITEMS as PREBOIS_ITEMS, QUESTS as PREBOIS_QUESTS } from './prebois.js';
import { GIVRE_MAPS, GIVRE_ITEMS, GIVRE_QUESTS } from './givre.js';
import { SEVE_MAPS, SEVE_ITEMS, SEVE_QUESTS } from './seve.js';
import { AURORE_MAPS, AURORE_ITEMS, AURORE_QUESTS } from './aurore.js';
import { TEMPS_MAPS, TEMPS_ITEMS, TEMPS_QUESTS } from './temps.js';
import { SOLEIL_MAPS, SOLEIL_ITEMS, SOLEIL_QUESTS } from './soleil.js';
import { MAREES_MAPS, MAREES_ITEMS, MAREES_QUESTS } from './marees.js';

export { LEGEND };
export const MAPS = { ...PREBOIS_MAPS, ...GIVRE_MAPS, ...SEVE_MAPS, ...AURORE_MAPS, ...TEMPS_MAPS, ...SOLEIL_MAPS, ...MAREES_MAPS };
export const ITEMS = { ...PREBOIS_ITEMS, ...GIVRE_ITEMS, ...SEVE_ITEMS, ...AURORE_ITEMS, ...TEMPS_ITEMS, ...SOLEIL_ITEMS, ...MAREES_ITEMS };
export const QUESTS = [...PREBOIS_QUESTS, ...GIVRE_QUESTS, ...SEVE_QUESTS, ...AURORE_QUESTS, ...TEMPS_QUESTS, ...SOLEIL_QUESTS, ...MAREES_QUESTS];
