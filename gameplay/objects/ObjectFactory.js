import { Pickup, Chest, Npc, Sign, PushBlock, PressurePlate, Gate, LockedDoor, Lever } from './objects.js';
import { Enemy } from '../actors/Enemy.js';

// Fabrique d'objets : associe un TYPE (nom de marqueur sur la carte) à un constructeur.
// C'est le pont entre les données des cartes (ASCII aujourd'hui, éditeur Tiled demain)
// et les entités du jeu. Un jeu peut enregistrer ses propres types.

export class ObjectFactory {
  constructor() {
    this.types = new Map();
  }

  register(type, create) {
    this.types.set(type, create);
    return this;
  }

  has(type) {
    return this.types.has(type);
  }

  /** @param spec { type, x, y, tx, ty, uid, props } */
  create(spec, adv) {
    const make = this.types.get(spec.type);
    if (!make) throw new Error(`Type d'objet inconnu : "${spec.type}"`);
    return make(spec, adv);
  }
}

/** Fabrique avec tous les objets standard du gameplay. */
export function standardFactory() {
  const f = new ObjectFactory();
  f.register('pickup', (s) => new Pickup(s));
  f.register('chest', (s) => new Chest(s));
  f.register('npc', (s) => new Npc(s));
  f.register('sign', (s) => new Sign(s));
  f.register('block', (s) => new PushBlock(s));
  f.register('plate', (s) => new PressurePlate(s));
  f.register('gate', (s) => new Gate(s));
  f.register('locked', (s) => new LockedDoor(s));
  f.register('lever', (s) => new Lever(s));
  f.register('enemy', (s) => new Enemy({ x: s.x, y: s.y, uid: s.uid, seed: s.tx * 31 + s.ty, ...s.props }));
  return f;
}
