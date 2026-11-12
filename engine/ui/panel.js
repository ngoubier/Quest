// Cadre des fenêtres (dialogues, menus, sac...). Si le style de l'interface fournit une image de cadre
// (`style.panel = { image, corner, detail }`), elle est posée en 9 morceaux : les 4 coins gardent leur
// taille, les bords et le centre s'étirent. Sinon : fond uni et double liseré (style d'origine).
//
//   style.panel.image  : image carrée (canvas), de côté 3 × corner × detail
//   style.panel.corner : taille d'un coin en pixels de jeu (le bord du cadre est dedans)
//   style.panel.detail : pixels d'image par pixel de jeu

/**
 * @param {import('../graphics/Renderer.js').Renderer} r
 * @param {{box:string, border:string, panel?:{image:CanvasImageSource, corner:number, detail?:number}}} s  style de l'interface
 * @param {{double?:boolean}} [o]  double liseré (style d'origine seulement)
 */
export function drawPanel(r, x, y, w, h, s, { double = true } = {}) {
  const p = s.panel;
  if (!p?.image) {
    r.rect(x, y, w, h, s.box);
    r.strokeRect(x, y, w, h, s.border);
    if (double) r.strokeRect(x + 2, y + 2, w - 4, h - 4, s.border);
    return;
  }
  const c = r.ctx;
  const k = p.detail ?? 1;
  const sc = p.corner * k; // coin, dans l'image
  // petite fenêtre : les coins rétrécissent pour tenir
  const d = Math.max(1, Math.min(p.corner, Math.floor(w / 2), Math.floor(h / 2)));
  x = Math.round(x);
  y = Math.round(y);
  w = Math.round(w);
  h = Math.round(h);
  const cols = [[0, sc, x, d], [sc, sc, x + d, w - 2 * d], [2 * sc, sc, x + w - d, d]];
  const rows = [[0, sc, y, d], [sc, sc, y + d, h - 2 * d], [2 * sc, sc, y + h - d, d]];
  for (const [sy, sh, dy, dh] of rows) {
    if (dh <= 0) continue;
    for (const [sx, sw, dx, dw] of cols) if (dw > 0) c.drawImage(p.image, sx, sy, sw, sh, dx, dy, dw, dh);
  }
}
