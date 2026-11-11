// Chargement et stockage des ressources (images, JSON, sons...).
// Les jeux peuvent aussi y ranger des ressources générées par programme.

export class Assets {
  constructor() {
    this.items = new Map();
  }

  set(key, value) {
    this.items.set(key, value);
    return value;
  }

  get(key) {
    if (!this.items.has(key)) throw new Error(`Assets : ressource "${key}" non chargée`);
    return this.items.get(key);
  }

  has(key) {
    return this.items.has(key);
  }

  loadImage(key, url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(this.set(key, img));
      img.onerror = () => reject(new Error(`Impossible de charger l'image ${url}`));
      img.src = url;
    });
  }

  async loadJSON(key, url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Impossible de charger ${url} (${res.status})`);
    return this.set(key, await res.json());
  }

  /** Charge une liste [{type:'image'|'json', key, url}] en parallèle. */
  loadAll(list) {
    return Promise.all(
      list.map((it) => (it.type === 'json' ? this.loadJSON(it.key, it.url) : this.loadImage(it.key, it.url))),
    );
  }
}
