import { QuestionBank } from '../../gameplay/quiz/QuestionBank.js';
import { QUESTIONS_FR } from './bank-fr.js';
import { QUESTIONS_EN } from './bank-en.js';
import { QUESTIONS_DICTEE } from './dictee.js';
import { MATHS_GENERATOR } from './maths.js';
import { QUESTIONS_QUOTIDIEN, QUOTIDIEN_GENERATOR } from './quotidien.js';

/** Banque de questions prête à l'emploi (programme français + anglais, 6 à 10 ans). */
export function frenchSchoolBank() {
  return new QuestionBank({ questions: [...QUESTIONS_FR, ...QUESTIONS_EN, ...QUESTIONS_DICTEE, ...QUESTIONS_QUOTIDIEN], generators: [MATHS_GENERATOR, QUOTIDIEN_GENERATOR] });
}
export { QUESTIONS_FR, QUESTIONS_EN, QUESTIONS_DICTEE, QUESTIONS_QUOTIDIEN, MATHS_GENERATOR, QUOTIDIEN_GENERATOR };
