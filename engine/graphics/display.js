// Profils d'affichage : le même jeu, des graphismes adaptés à l'appareil.
//
//  - 'mobile' : téléphone / tablette. Dessins plus lisibles : contours épais, couleurs
//               plus contrastées, moins de petits détails, vue rapprochée.
//  - 'pc'     : ordinateur. Dessins en haute définition (2 fois plus de pixels que la
//               grille du jeu), ombrage fin, vue plus large si la fenêtre le permet.
//  - 'classic': pixel art d'origine, sans traitement (tests, essai n°1).
//
// Un profil ne change JAMAIS la logique du jeu (collisions, tailles, vitesses) :
// seulement l'apparence et la quantité de carte visible.
//
// Forcer un profil dans l'adresse : ?mobile, ?pc, ?classic (ou #mobile, #pc, #classic) ;
// ?hd=0 coupe la haute définition. (?touch, plus ancien, vaut ?mobile.)

export const DISPLAY_PROFILES = {
  classic: {
    id: 'classic',
    name: 'Classique',
    detail: 1, // pixels d'image par pixel de jeu
    hd: false, // dessins « haute définition » faits à la main (paintHD)
    smooth: false, // lissage des diagonales (agrandissement Scale2x)
    outline: 1, // épaisseur du contour des personnages, en pixels d'image
    contrast: 1,
    saturation: 1,
    shading: false, // ombrage fin et grain (finition HD)
    lowDetail: false, // moins de petits motifs (herbe, mouchetures...)
  },
  mobile: {
    id: 'mobile',
    name: 'Mobile',
    detail: 2,
    hd: false,
    smooth: true,
    outline: 3, // 1,5 pixel de jeu : silhouettes bien découpées sur un petit écran
    contrast: 1.12,
    saturation: 1.22,
    shading: false,
    lowDetail: true,
  },
  pc: {
    id: 'pc',
    name: 'PC (haute définition)',
    detail: 2,
    hd: true,
    smooth: true,
    outline: 1, // contour fin (½ pixel de jeu) : on a la place de montrer les détails
    contrast: 1,
    saturation: 1,
    shading: true,
    lowDetail: false,
  },
};

/**
 * Choisit le profil d'affichage.
 * @param {object} [o]
 * @param {string} [o.search]  paramètres d'adresse (par défaut location.search)
 * @param {string} [o.hash]    ancre d'adresse (par défaut location.hash), ex. '#mobile'
 * @param {boolean} [o.touch]  écran tactile (par défaut : détecté)
 * @returns {typeof DISPLAY_PROFILES.pc & {forced: string|null}} forced : profil imposé par l'adresse
 */
export function detectDisplay({ search, hash, touch } = {}) {
  search ??= typeof location !== 'undefined' ? location.search : '';
  hash ??= typeof location !== 'undefined' ? location.hash : '';
  touch ??= typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;
  const q = new URLSearchParams(search);
  const h = hash.replace(/^#/, '');
  let forced = null;
  if (q.has('pc') || h === 'pc') forced = 'pc';
  if (q.has('mobile') || q.has('touch') || h === 'mobile') forced = 'mobile';
  if (q.has('classic') || h === 'classic') forced = 'classic';
  const id = forced ?? (touch ? 'mobile' : 'pc');
  const p = { ...DISPLAY_PROFILES[id], forced };
  if (q.get('hd') === '0' && id === 'pc') Object.assign(p, { detail: 1, hd: false, smooth: false, shading: false, name: 'PC' });
  return p;
}

/**
 * Pendant la fabrication des images d'une ambiance, le profil en cours est lisible ici
 * par les fonctions de dessin (ex. dessiner moins de brins d'herbe sur mobile).
 */
export const paintContext = { profile: DISPLAY_PROFILES.classic };

/** Vrai si le dessin en cours doit rester simple (profil mobile). */
export const lowDetail = () => !!paintContext.profile.lowDetail;

/** Nombre de petits motifs à dessiner : réduit de moitié en profil simplifié. */
export const detailCount = (n) => (lowDetail() ? Math.ceil(n / 2) : n);
