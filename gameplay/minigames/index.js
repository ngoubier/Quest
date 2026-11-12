import { TicTacToeScene } from './TicTacToeScene.js';
import { NimScene } from './NimScene.js';
import { MemoryScene } from './MemoryScene.js';
import { Connect4Scene } from './Connect4Scene.js';

// Mini-jeux contre les habitants. Chaque entrée crée la scène du jeu :
//   opts : { opponent: 'Bastien', age: 8, onDone(result) }  — result : 'win' | 'lose' | 'draw' | 'quit'
// Pour ajouter un jeu : une scène qui appelle onDone une seule fois, puis une ligne ici.
export const MINIGAMES = {
  morpion: (opts) => new TicTacToeScene(opts),
  glacon: (opts) => new NimScene(opts), // « Le dernier glaçon » (jeu de Nim)
  memory: (opts) => new MemoryScene(opts), // Memory des animaux
  puissance4: (opts) => new Connect4Scene(opts), // Puissance 4
};

export function createMinigame(name, opts) {
  const make = MINIGAMES[name];
  if (!make) throw new Error(`Mini-jeu inconnu : "${name}"`);
  return make(opts);
}
