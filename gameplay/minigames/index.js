import { TicTacToeScene } from './TicTacToeScene.js';

// Mini-jeux contre les habitants. Chaque entrée crée la scène du jeu :
//   opts : { opponent: 'Bastien', age: 8, onDone(result) }  — result : 'win' | 'lose' | 'draw' | 'quit'
// Pour ajouter un jeu : une scène qui appelle onDone une seule fois, puis une ligne ici.
export const MINIGAMES = {
  morpion: (opts) => new TicTacToeScene(opts),
};

export function createMinigame(name, opts) {
  const make = MINIGAMES[name];
  if (!make) throw new Error(`Mini-jeu inconnu : "${name}"`);
  return make(opts);
}
