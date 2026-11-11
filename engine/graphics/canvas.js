// Création de canvas hors écran (pour générer des images : tuiles, sprites...).
// Renvoie null hors navigateur (tests Node) : le moteur fonctionne alors sans image.
export function createCanvas(w, h) {
  if (typeof document !== 'undefined') {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  }
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(w, h);
  return null;
}
