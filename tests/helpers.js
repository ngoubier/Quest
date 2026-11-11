// Réexports pratiques pour les tests.
export { checkAnswer, normalize, QuestionBank, GameState, runActions } from '../gameplay/index.js';
export { parseNumber } from '../gameplay/quiz/answers.js';
export { createRng as createRngForTests } from '../engine/index.js';
