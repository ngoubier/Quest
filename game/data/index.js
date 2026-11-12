// Toutes les données du jeu, niveau par niveau.
import { MAPS as PREBOIS_MAPS, LEGEND, ITEMS as PREBOIS_ITEMS, QUESTS as PREBOIS_QUESTS } from './prebois.js';
import { GIVRE_MAPS, GIVRE_ITEMS, GIVRE_QUESTS } from './givre.js';
import { SEVE_MAPS, SEVE_ITEMS, SEVE_QUESTS } from './seve.js';

export { LEGEND };
export const MAPS = { ...PREBOIS_MAPS, ...GIVRE_MAPS, ...SEVE_MAPS };
export const ITEMS = { ...PREBOIS_ITEMS, ...GIVRE_ITEMS, ...SEVE_ITEMS };
export const QUESTS = [...PREBOIS_QUESTS, ...GIVRE_QUESTS, ...SEVE_QUESTS];
