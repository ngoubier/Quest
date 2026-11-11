// Sauvegardes par emplacements (slots), stockées dans le navigateur.
// Si le stockage est indisponible (navigation privée...), on garde en mémoire.

export class SaveStore {
  constructor(namespace, storage) {
    this.ns = namespace;
    this.storage = storage ?? SaveStore._detect();
  }

  static _detect() {
    try {
      const s = globalThis.localStorage;
      const k = '__quest_test__';
      s.setItem(k, '1');
      s.removeItem(k);
      return s;
    } catch {
      const mem = new Map();
      return {
        getItem: (k) => (mem.has(k) ? mem.get(k) : null),
        setItem: (k, v) => mem.set(k, String(v)),
        removeItem: (k) => mem.delete(k),
      };
    }
  }

  _key(slot) {
    return `${this.ns}:save:${slot}`;
  }

  save(slot, data, version = 1) {
    const payload = { version, savedAt: new Date().toISOString(), data };
    try {
      this.storage.setItem(this._key(slot), JSON.stringify(payload));
      return true;
    } catch {
      return false;
    }
  }

  /** Renvoie { version, savedAt, data } ou null. */
  load(slot) {
    try {
      const raw = this.storage.getItem(this._key(slot));
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  has(slot) {
    return this.load(slot) !== null;
  }

  remove(slot) {
    try {
      this.storage.removeItem(this._key(slot));
    } catch {
      /* ignoré */
    }
  }
}
