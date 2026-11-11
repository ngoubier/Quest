// Dictées : le jeu prononce un mot (voix du navigateur), l'enfant l'écrit.
// Si l'appareil ne sait pas parler, on montre une IMAGE de l'objet à écrire :
// seuls les mots illustrés (avec emoji) sont alors proposés.
// L'orthographe compte, accents compris.
//   'mot'            mot sans image (proposé seulement si l'appareil parle)
//   ['mot', '🐱']     mot illustré
const WORDS = {
  6: [['chat', '🐱'], ['lune', '🌙'], ['vélo', '🚲'], ['moto', '🏍️'], ['lit', '🛏️'], ['robe', '👗'], ['tomate', '🍅'], ['livre', '📖'], ['pomme', '🍎'], ['ami'], ['papa'], ['domino'], ['vache', '🐮'], ['rat', '🐀'], ['sac', '🎒'], ['nid', '🪺'], ['bébé', '👶'], ['banane', '🍌'], ['salade', '🥬'], ['mur'], ['été'], ['mari'], ['petit'], ['samedi']],
  7: [['maison', '🏠'], ['école', '🏫'], ['poisson', '🐟'], ['oiseau', '🐦'], ['lapin', '🐰'], ['cheval', '🐴'], ['bateau', '⛵'], ['fleur', '🌸'], ['soleil', '☀️'], ['jouet', '🧸'], ['jardin'], ['chemin'], ['mouton', '🐑'], ['cochon', '🐷'], ['gâteau', '🎂'], ['ballon', '⚽'], ['table'], ['forêt', '🌲'], ['étoile', '⭐'], ['souris', '🐭'], ['cadeau', '🎁'], ['lundi'], ['matin'], ['dimanche']],
  8: [['pantalon', '👖'], ['chocolat', '🍫'], ['éléphant', '🐘'], ['crayon', '✏️'], ['cahier', '📓'], ['montagne', '⛰️'], ['garçon', '👦'], ['feuille', '🍃'], ['château', '🏰'], ['fenêtre'], ['boulanger'], ['sorcière'], ['girafe', '🦒'], ['fromage', '🧀'], ['guitare', '🎸'], ['fraise', '🍓'], ['tortue', '🐢'], ['pompier', '🚒'], ['voiture', '🚗'], ['mercredi'], ['janvier'], ['famille'], ['cuisine'], ['histoire']],
  9: [['papillon', '🦋'], ['parapluie', '☂️'], ['escargot', '🐌'], ['citrouille', '🎃'], ['grenouille', '🐸'], ['ordinateur', '💻'], ['beaucoup'], ['toujours'], ['longtemps'], ['maintenant'], ['souvent'], ['quelquefois'], ['crocodile', '🐊'], ['hérisson', '🦔'], ['perroquet', '🦜'], ['bibliothèque', '📚'], ['fusée', '🚀'], ['pharmacie'], ['pourquoi'], ['parce que'], ['pendant'], ['bientôt'], ['quelqu’un'], ['février']],
  10: [['hélicoptère', '🚁'], ['téléphone', '📱'], ['dinosaure', '🦕'], ['champignon', '🍄'], ['abeille', '🐝'], ['automne', '🍂'], ['aujourd’hui'], ['plusieurs'], ['autrefois'], ['printemps'], ['cependant'], ['désormais'], ['kangourou', '🦘'], ['rhinocéros', '🦏'], ['pyramide'], ['thermomètre', '🌡️'], ['bicyclette', '🚲'], ['orchestre'], ['nécessaire'], ['quelques-uns'], ['malheureusement'], ['aussitôt'], ['davantage'], ['exactement']],
};

export const QUESTIONS_DICTEE = Object.entries(WORDS).flatMap(([age, words]) =>
  words.map(([w, emoji]) => ({
    id: `dict-${w}`,
    subject: 'dictee',
    ages: [Number(age), Math.min(10, Number(age) + 1)],
    type: 'dictation',
    prompt: 'Écris le mot que tu entends.',
    say: `Écris le mot : ${w}.`,
    answer: w,
    image: emoji, // utilisée si l'appareil ne parle pas
    accept: w.includes('’') ? [w.replace('’', "'")] : undefined,
  })),
);
