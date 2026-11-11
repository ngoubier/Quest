// Vérification des réponses tapées par l'enfant : on est tolérant sur la forme
// (majuscules, espaces, articles, accents si la question le permet), jamais sur le fond.

const ARTICLES = /^(le |la |les |l'|l’|un |une |des |du |de la |de l'|de l’)/;

export function normalize(str, { accents = false, articles = false } = {}) {
  let s = String(str ?? '')
    .toLowerCase()
    .replace(/[’`]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.!?;:]+$/, '')
    .trim();
  if (articles) s = s.replace(ARTICLES, '').trim();
  if (!accents) s = s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/œ/g, 'oe').replace(/æ/g, 'ae');
  // Nombres : "3.8" et "3,8" sont équivalents ; "1 000" = "1000".
  if (/^[\d\s.,]+$/.test(s)) s = s.replace(/\s/g, '').replace('.', ',');
  return s;
}

/**
 * Question : { type: 'choice' | 'text', answer, accept?: [...], strictAccents?: bool, image? }
 * Pour un QCM, `given` est le texte du choix sélectionné.
 */
/** Nombre écrit par l'enfant, unité tolérée : "3,70 €" -> 3.7, "16 cm" -> 16. Sinon null. */
export function parseNumber(str) {
  const m = String(str ?? '')
    .trim()
    .toLowerCase()
    .match(/^(-?[\d\s]*[.,]?\d+)\s*(€|euros?|cm|mm|km|m|kg|g|min|h|%|°c)?$/);
  if (!m) return null;
  const n = Number(m[1].replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

/**
 * Question : { type: 'choice' | 'text', answer, accept?: [...], strictAccents?: bool, image? }
 * Pour un QCM, `given` est le texte du choix sélectionné.
 */
export function checkAnswer(q, given) {
  if (given == null) return false;
  if (q.type === 'choice') return String(given) === String(q.answer);
  // Dictée : l'orthographe compte, accents compris (sauf mention contraire).
  if (q.type === 'dictation') q = { ...q, strictAccents: q.strictAccents ?? true, articles: false };
  const expected = [q.answer, ...(q.accept ?? [])];
  // Réponse numérique : comparaison par valeur (3,7 = 3,70 = 3.7 €).
  const g = parseNumber(given);
  if (g !== null && expected.some((a) => parseNumber(a) === g)) return true;
  const opts = { accents: !!q.strictAccents, articles: q.articles ?? true };
  const gn = normalize(given, opts);
  if (!gn) return false;
  return expected.some((a) => normalize(a, opts) === gn);
}
