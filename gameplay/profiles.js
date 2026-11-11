// PROFILS : plusieurs enfants sur le même appareil, chacun avec sa partie.
// Liste stockée sous la clé 'profiles' ; la partie d'un profil sous `p-<id>`.

export class ProfileStore {
  constructor(saves, { max = 4 } = {}) {
    this.saves = saves;
    this.max = max;
  }

  list() {
    return this.saves.load('profiles')?.data ?? [];
  }

  get(id) {
    return this.list().find((p) => p.id === id) ?? null;
  }

  get isFull() {
    return this.list().length >= this.max;
  }

  slot(id) {
    return `p-${id}`;
  }

  hasGame(id) {
    return this.saves.has(this.slot(id));
  }

  add({ name, age }) {
    const p = { id: Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36), name: name.trim().slice(0, 12), age };
    this.saves.save('profiles', [...this.list(), p]);
    return p;
  }

  update(id, patch) {
    this.saves.save('profiles', this.list().map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  remove(id) {
    this.saves.save('profiles', this.list().filter((p) => p.id !== id));
    this.saves.remove(this.slot(id));
    this.saves.remove(`custom-${id}`);
  }
}

/** Réglages des parents (code, délai après un échec...), communs à tous les profils. */
export function parentSettings(saves) {
  return saves.load('parent')?.data ?? {};
}

export function setParentSettings(saves, patch) {
  saves.save('parent', { ...parentSettings(saves), ...patch });
}
