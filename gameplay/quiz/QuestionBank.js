import { createRng } from '../../engine/index.js';

// BANQUE DE QUESTIONS — contenu éducatif réutilisable par n'importe quel jeu.
//
// Question fixe :
// {
//   id: 'fr-001', subject: 'francais', ages: [7, 8],          // âges concernés (inclus)
//   type: 'choice' | 'text',
//   prompt: 'Le contraire de « grand » ?', image?: '🐘',         // image = emoji (nommer une image)
//   choices?: ['petit', 'gros', 'haut'], answer: 'petit',
//   accept?: ['...'], strictAccents?: bool, explain?: 'phrase affichée après la réponse'
// }
// Générateur (questions infinies, ex. calcul) :
// { subject: 'maths', ages: [6, 10], make: (rng, age) => question }

export const SUBJECTS = {
  maths: 'Mathématiques',
  francais: 'Français',
  histoire: 'Histoire',
  geographie: 'Géographie',
  sciences: 'Sciences',
};

export class QuestionBank {
  constructor({ questions = [], generators = [] } = {}) {
    this.questions = [];
    this.generators = [];
    this.add(questions);
    generators.forEach((g) => this.addGenerator(g));
  }

  add(questions) {
    for (const q of questions) {
      if (!q.id || !q.subject || !q.ages || !q.prompt || q.answer == null) throw new Error(`Question incomplète : ${JSON.stringify(q)}`);
      if (q.type === 'choice' && !q.choices.includes(q.answer)) throw new Error(`Question ${q.id} : la réponse n'est pas parmi les choix`);
      this.questions.push({ type: 'text', ...q });
    }
    return this;
  }

  addGenerator(g) {
    this.generators.push(g);
    return this;
  }

  /** Matières disponibles pour un âge. */
  subjects(age) {
    const set = new Set();
    for (const q of this.questions) if (age >= q.ages[0] - 1 && age <= q.ages[1]) set.add(q.subject);
    for (const g of this.generators) if (age >= g.ages[0] && age <= g.ages[1]) set.add(g.subject);
    return [...set];
  }

  /**
   * Choisit `count` questions adaptées à l'âge (repli sur l'âge inférieur si besoin),
   * en évitant celles déjà vues (`seen`).
   */
  pick({ age, subject = null, count = 3, seen = [], rng = createRng(Date.now() % 1e9) }) {
    const seenSet = new Set(seen);
    const out = [];
    const subj = (s) => !subject || s === subject;
    const shuffle = (arr) => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };
    // Questions fixes : âge exact d'abord, puis un an de moins ; les jamais vues avant les autres.
    const exact = this.questions.filter((q) => subj(q.subject) && age >= q.ages[0] && age <= q.ages[1]);
    const younger = this.questions.filter((q) => subj(q.subject) && age > q.ages[1] && age - q.ages[1] <= 1);
    const fresh = (arr) => shuffle(arr.filter((q) => !seenSet.has(q.id)));
    const stale = (arr) => shuffle(arr.filter((q) => seenSet.has(q.id)));
    const pool = [...fresh(exact), ...fresh(younger), ...stale(exact), ...stale(younger)];
    const gens = this.generators.filter((g) => subj(g.subject) && age >= g.ages[0] && age <= g.ages[1]);

    // Avec des générateurs disponibles, on mélange fixes et générées.
    while (out.length < count) {
      const useGen = gens.length && (!pool.length || rng() < (subject ? 0.6 : 0.35));
      if (useGen) {
        const q = rng.pick(gens).make(rng, age);
        if (!out.some((o) => o.prompt === q.prompt)) out.push({ type: 'text', ...q });
      } else if (pool.length) {
        const q = pool.shift();
        if (!out.includes(q)) out.push(q);
      } else break;
    }
    return out;
  }
}
