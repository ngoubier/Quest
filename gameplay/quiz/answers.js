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
export function checkAnswer(q, given) {
  if (given == null) return false;
  if (q.type === 'choice') return String(given) === String(q.answer);
  const opts = { accents: !!q.strictAccents, articles: q.articles ?? true };
  const g = normalize(given, opts);
  if (!g) return false;
  return [q.answer, ...(q.accept ?? [])].some((a) => normalize(a, opts) === g);
}
