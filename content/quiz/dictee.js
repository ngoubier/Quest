// Dictées : le jeu prononce un mot (voix du navigateur), l'enfant l'écrit.
// L'orthographe compte, accents compris. Mots choisis selon les listes usuelles par niveau.
const WORDS = {
  6: ['chat', 'lune', 'vélo', 'moto', 'ami', 'lit', 'robe', 'tomate', 'salade', 'livre', 'papa', 'domino'],
  7: ['maison', 'école', 'jardin', 'poisson', 'oiseau', 'lapin', 'cheval', 'bateau', 'fleur', 'jouet', 'soleil', 'chemin'],
  8: ['pantalon', 'chocolat', 'boulanger', 'éléphant', 'crayon', 'cahier', 'fenêtre', 'montagne', 'garçon', 'sorcière', 'feuille', 'château'],
  9: ['beaucoup', 'toujours', 'longtemps', 'maintenant', 'pendant', 'souvent', 'quelquefois', 'hier', 'demain', 'ensemble', 'parfois', 'pourtant'],
  10: ['aujourd’hui', 'plusieurs', 'autrefois', 'printemps', 'automne', 'champignon', 'gymnase', 'orchestre', 'cependant', 'désormais', 'dorénavant', 'abeille'],
};

export const QUESTIONS_DICTEE = Object.entries(WORDS).flatMap(([age, words]) =>
  words.map((w) => ({
    id: `dict-${w}`,
    subject: 'francais',
    ages: [Number(age), Math.min(10, Number(age) + 1)],
    type: 'dictation',
    prompt: 'Écoute l’énigme, puis écris le mot.',
    say: `Écris le mot : ${w}.`,
    answer: w,
    accept: w.includes('’') ? [w.replace('’', "'")] : undefined,
  })),
);
