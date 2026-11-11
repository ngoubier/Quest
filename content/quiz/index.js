import { QuestionBank } from '../../gameplay/quiz/QuestionBank.js';
import { QUESTIONS_FR } from './bank-fr.js';
import { QUESTIONS_EN } from './bank-en.js';
import { QUESTIONS_DICTEE } from './dictee.js';
import { MATHS_GENERATOR } from './maths.js';

/** Banque de questions prête à l'emploi (programme français + anglais, 6 à 10 ans). */
export function frenchSchoolBank() {
  return new QuestionBank({ questions: [...QUESTIONS_FR, ...QUESTIONS_EN, ...QUESTIONS_DICTEE], generators: [MATHS_GENERATOR] });
}
export { QUESTIONS_FR, QUESTIONS_EN, QUESTIONS_DICTEE, MATHS_GENERATOR };
