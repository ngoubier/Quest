// Anglais (langue vivante, du CP au CM2) : vocabulaire de base, souvent avec une image.
const EN = (id, ages, image, answer, accept) => ({ id, subject: 'anglais', ages, type: 'text', prompt: 'Comment dit-on ceci en anglais ?', image, answer, accept, articles: true });
const C = (id, ages, prompt, choices, answer, extra = {}) => ({ id, subject: 'anglais', ages, type: 'choice', prompt, choices, answer, ...extra });

export const QUESTIONS_EN = [
  C('en-hello', [6, 7], 'Comment dit-on « bonjour » en anglais ?', ['hello', 'goodbye', 'thank you'], 'hello'),
  C('en-cat', [6, 7], 'Que veut dire « cat » ?', ['chat', 'chien', 'cheval'], 'chat', { explain: '🐱 cat = chat' }),
  C('en-red', [6, 7], 'Que veut dire « red » ?', ['rouge', 'vert', 'bleu'], 'rouge'),
  C('en-three', [6, 7], 'Que veut dire « three » ?', ['3', '2', '10'], '3'),
  EN('en-img-dog', [7, 8], '🐶', 'dog'),
  EN('en-img-cat', [7, 8], '🐱', 'cat'),
  EN('en-img-sun', [7, 9], '☀️', 'sun'),
  EN('en-img-apple', [7, 9], '🍎', 'apple', ['an apple']),
  EN('en-img-house', [8, 9], '🏠', 'house'),
  EN('en-img-book', [8, 9], '📖', 'book'),
  EN('en-img-fish', [8, 10], '🐟', 'fish'),
  EN('en-img-bird', [8, 10], '🐦', 'bird'),
  EN('en-img-car', [8, 10], '🚗', 'car'),
  EN('en-img-tree', [9, 10], '🌳', 'tree'),
  EN('en-img-horse', [9, 10], '🐴', 'horse'),
  C('en-colors', [8, 9], 'Comment dit-on « vert » en anglais ?', ['green', 'yellow', 'brown'], 'green'),
  C('en-days', [9, 10], 'Que veut dire « Monday » ?', ['lundi', 'mardi', 'dimanche'], 'lundi'),
  C('en-family', [9, 10], 'Que veut dire « sister » ?', ['sœur', 'frère', 'mère'], 'sœur'),
  C('en-number', [9, 10], 'Comment dit-on « douze » en anglais ?', ['twelve', 'twenty', 'two'], 'twelve'),
  C('en-iam', [10, 10], 'Complète : « I … ten years old. »', ['am', 'is', 'are'], 'am', { explain: 'I am, you are, he/she is.' }),
  C('en-weather', [10, 10], 'Que veut dire « It’s raining » ?', ['Il pleut', 'Il neige', 'Il fait beau'], 'Il pleut'),
];
