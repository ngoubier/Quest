import { QuestionBank } from '../../gameplay/quiz/QuestionBank.js';
import { QUESTIONS_FR } from './bank-fr.js';
import { MATHS_GENERATOR } from './maths.js';

/** Banque de questions prête à l'emploi (programme français, 6 à 10 ans). */
export function frenchSchoolBank() {
  return new QuestionBank({ questions: QUESTIONS_FR, generators: [MATHS_GENERATOR] });
}
export { QUESTIONS_FR, MATHS_GENERATOR };
