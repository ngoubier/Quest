import { EventBus } from '../../engine/index.js';

// L'ÉTAT DU JEU : tout ce qui doit être sauvegardé et que les quêtes / énigmes consultent.
//  - flags     : vrai/faux    ex. 'coffre_donjon1_ouvert', 'porte_nord_deverrouillee'
//  - counters  : nombres      ex. 'kills_blob' (monstres vaincus)
//  - items     : inventaire   ex. { coin: 42, key: 1, amulet: 1 }
//  - hp/maxHp  : vie du héros, en demi-cœurs (6 = 3 cœurs)
//  - quests    : progression  ex. { amulette: { status: 'active', step: 1 } }
// Chaque modification émet 'change' : les quêtes et les énigmes se réévaluent.

export class GameState {
  constructor({ maxHp = 6 } = {}) {
    this.events = new EventBus();
    this.reset(maxHp);
  }

  reset(maxHp = 6) {
    this.flags = {};
    this.counters = {};
    this.items = {};
    this.maxHp = maxHp;
    this.hp = maxHp;
    this.quests = {};
  }

  _changed(kind, key) {
    this.events.emit('change', { kind, key });
  }

  // --- drapeaux
  flag(name) {
    return !!this.flags[name];
  }

  setFlag(name, value = true) {
    if (this.flag(name) === !!value) return;
    if (value) this.flags[name] = true;
    else delete this.flags[name];
    this._changed('flag', name);
  }

  // --- compteurs
  counter(name) {
    return this.counters[name] || 0;
  }

  addCounter(name, by = 1) {
    this.counters[name] = this.counter(name) + by;
    this._changed('counter', name);
  }

  setCounter(name, value) {
    this.counters[name] = value;
    this._changed('counter', name);
  }

  // --- inventaire
  count(item) {
    return this.items[item] || 0;
  }

  give(item, n = 1, max = Infinity) {
    this.items[item] = Math.min(max, this.count(item) + n);
    this._changed('item', item);
  }

  /** Retire n exemplaires. Renvoie false (et ne retire rien) s'il n'y en a pas assez. */
  take(item, n = 1) {
    if (this.count(item) < n) return false;
    this.items[item] -= n;
    if (this.items[item] <= 0) delete this.items[item];
    this._changed('item', item);
    return true;
  }

  // --- vie
  heal(n) {
    this.hp = Math.min(this.maxHp, this.hp + n);
    this._changed('hp');
  }

  damage(n) {
    this.hp = Math.max(0, this.hp - n);
    this._changed('hp');
    return this.hp;
  }

  setMaxHp(n, fill = false) {
    this.maxHp = n;
    if (fill) this.hp = n;
    this.hp = Math.min(this.hp, n);
    this._changed('hp');
  }

  // --- quêtes ('none' | 'active' | 'done')
  questStatus(id) {
    return this.quests[id]?.status ?? 'none';
  }

  // --- sauvegarde
  toJSON() {
    return structuredClone({ flags: this.flags, counters: this.counters, items: this.items, hp: this.hp, maxHp: this.maxHp, quests: this.quests });
  }

  load(data) {
    this.reset(data.maxHp);
    Object.assign(this, structuredClone(data));
    this._changed('load');
  }
}
