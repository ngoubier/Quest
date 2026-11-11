// Banque de questions (programme français). ages : [min, max] inclus.
// CP 6 ans · CE1 7 ans · CE2 8 ans · CM1 9 ans · CM2 10 ans.
// Les réponses écrites tolèrent majuscules, articles et (sauf mention) accents.

const T = (id, subject, ages, prompt, answer, extra = {}) => ({ id, subject, ages, type: 'text', prompt, answer, ...extra });
const C = (id, subject, ages, prompt, choices, answer, extra = {}) => ({ id, subject, ages, type: 'choice', prompt, choices, answer, ...extra });
const IMG = (id, ages, image, answer, accept) => T(id, 'francais', ages, 'Comment s’appelle ceci ?', answer, { image, accept });

export const QUESTIONS_FR = [
  // ------------------------------------------------------------ FRANÇAIS — nommer une image
  IMG('img-chat', [6, 7], '🐱', 'chat'),
  IMG('img-chien', [6, 7], '🐶', 'chien'),
  IMG('img-pomme', [6, 7], '🍎', 'pomme'),
  IMG('img-maison', [6, 7], '🏠', 'maison'),
  IMG('img-lune', [6, 7], '🌙', 'lune'),
  IMG('img-soleil', [6, 7], '☀️', 'soleil'),
  IMG('img-poisson', [6, 7], '🐟', 'poisson'),
  IMG('img-voiture', [6, 7], '🚗', 'voiture'),
  IMG('img-livre', [6, 8], '📖', 'livre'),
  IMG('img-velo', [6, 8], '🚲', 'vélo'),
  IMG('img-arbre', [6, 8], '🌳', 'arbre'),
  IMG('img-fleur', [6, 8], '🌸', 'fleur'),
  IMG('img-etoile', [6, 8], '⭐', 'étoile'),
  IMG('img-elephant', [7, 8], '🐘', 'éléphant'),
  IMG('img-grenouille', [7, 8], '🐸', 'grenouille'),
  IMG('img-fraise', [7, 8], '🍓', 'fraise'),
  IMG('img-carotte', [7, 8], '🥕', 'carotte'),
  IMG('img-cheval', [7, 8], '🐴', 'cheval'),
  IMG('img-avion', [6, 8], '✈️', 'avion'),
  IMG('img-papillon', [7, 9], '🦋', 'papillon'),
  IMG('img-escargot', [7, 9], '🐌', 'escargot'),
  IMG('img-champignon', [8, 9], '🍄', 'champignon'),
  IMG('img-tortue', [7, 9], '🐢', 'tortue'),
  IMG('img-parapluie', [8, 9], '☂️', 'parapluie'),

  // ------------------------------------------------------------ FRANÇAIS — lettres, sons, syllabes
  T('fr-apres-m', 'francais', [6, 6], 'Quelle lettre vient juste après « m » dans l’alphabet ?', 'n'),
  T('fr-avant-d', 'francais', [6, 6], 'Quelle lettre vient juste avant « d » dans l’alphabet ?', 'c'),
  C('fr-voyelle', 'francais', [6, 7], 'Laquelle de ces lettres est une voyelle ?', ['b', 'o', 't', 'r'], 'o'),
  C('fr-syll-chocolat', 'francais', [6, 7], 'Combien de syllabes dans « chocolat » ?', ['2', '3', '4'], '3', { explain: 'cho - co - lat' }),
  C('fr-syll-lapin', 'francais', [6, 7], 'Combien de syllabes dans « lapin » ?', ['1', '2', '3'], '2', { explain: 'la - pin' }),
  C('fr-son-ou', 'francais', [6, 6], 'Dans quel mot entend-on le son [ou] ?', ['loup', 'lune', 'lit'], 'loup'),

  // ------------------------------------------------------------ FRANÇAIS — vocabulaire
  T('fr-contr-grand', 'francais', [6, 7], 'Quel est le contraire de « grand » ?', 'petit'),
  T('fr-contr-chaud', 'francais', [6, 7], 'Quel est le contraire de « chaud » ?', 'froid'),
  T('fr-contr-jour', 'francais', [6, 7], 'Quel est le contraire de « jour » ?', 'nuit'),
  T('fr-contr-monter', 'francais', [7, 8], 'Quel est le contraire de « monter » ?', 'descendre'),
  T('fr-contr-rapide', 'francais', [7, 9], 'Quel est le contraire de « rapide » ?', 'lent', { accept: ['lente'] }),
  C('fr-intrus-fruits', 'francais', [7, 8], 'Quel mot n’est pas un fruit ?', ['pomme', 'poire', 'carotte', 'cerise'], 'carotte'),
  C('fr-synonyme-content', 'francais', [8, 9], 'Quel mot veut dire la même chose que « content » ?', ['joyeux', 'triste', 'fâché'], 'joyeux'),
  C('fr-ordre-alpha', 'francais', [8, 9], 'Quel mot vient en premier dans le dictionnaire ?', ['lune', 'arbre', 'zèbre', 'maison'], 'arbre'),

  // ------------------------------------------------------------ FRANÇAIS — grammaire et orthographe
  C('fr-homo-a-1', 'francais', [7, 9], 'Il … un chien.', ['a', 'à'], 'a', { explain: '« a » est le verbe avoir : on peut dire « il avait un chien ».' }),
  C('fr-homo-a-2', 'francais', [7, 9], 'Je vais … l’école.', ['a', 'à'], 'à', { explain: 'On ne peut pas dire « je vais avait l’école » : c’est « à ».' }),
  C('fr-homo-est', 'francais', [8, 9], 'Le chat … noir.', ['est', 'et'], 'est', { explain: '« est » est le verbe être : on peut dire « le chat était noir ».' }),
  C('fr-homo-son', 'francais', [8, 10], 'Il prend … vélo.', ['son', 'sont'], 'son', { explain: '« son » = le sien. « sont » = verbe être (ils sont).' }),
  C('fr-homo-sont', 'francais', [8, 10], 'Ils … partis.', ['son', 'sont'], 'sont'),
  C('fr-nom', 'francais', [7, 8], 'Lequel de ces mots est un nom ?', ['table', 'manger', 'rouge', 'vite'], 'table'),
  C('fr-verbe', 'francais', [7, 8], 'Dans « Le chat dort », quel est le verbe ?', ['le', 'chat', 'dort'], 'dort'),
  C('fr-adjectif', 'francais', [8, 9], 'Dans « une grande maison », quel mot est un adjectif ?', ['une', 'grande', 'maison'], 'grande'),
  C('fr-sujet', 'francais', [8, 10], 'Quel est le sujet dans « Les enfants jouent dehors » ?', ['Les enfants', 'jouent', 'dehors'], 'Les enfants'),
  T('fr-pluriel-cheval', 'francais', [8, 9], 'Un cheval, des …', 'chevaux'),
  T('fr-pluriel-journal', 'francais', [9, 10], 'Un journal, des …', 'journaux'),
  T('fr-pluriel-oeil', 'francais', [9, 10], 'Un œil, des …', 'yeux'),
  T('fr-pluriel-bijou', 'francais', [9, 10], 'Un bijou, des …', 'bijoux', { explain: 'Bijou, caillou, chou, genou, hibou, joujou, pou prennent un x au pluriel.' }),
  T('fr-feminin-acteur', 'francais', [9, 10], 'Un acteur, une …', 'actrice'),

  // ------------------------------------------------------------ FRANÇAIS — conjugaison (accents exigés)
  T('conj-etre-je', 'francais', [7, 8], 'Je (être) … content.', 'suis'),
  T('conj-avoir-tu', 'francais', [7, 8], 'Tu (avoir) … un chat.', 'as'),
  T('conj-chanter-nous', 'francais', [8, 9], 'Nous (chanter) … une chanson.', 'chantons'),
  T('conj-finir-ils', 'francais', [8, 10], 'Ils (finir) … leurs devoirs.', 'finissent'),
  T('conj-faire-vous', 'francais', [9, 10], 'Vous (faire) … du vélo.', 'faites'),
  T('conj-aller-futur', 'francais', [9, 10], 'Demain, j’(aller) … à la plage. (au futur)', 'irai'),
  T('conj-manger-pc', 'francais', [10, 10], 'Hier, nous (manger) … une pizza. (au passé composé)', 'avons mangé', { strictAccents: true }),
  C('conj-temps', 'francais', [9, 10], '« Je jouais dans le jardin. » À quel temps est le verbe ?', ['présent', 'imparfait', 'futur'], 'imparfait'),

  // ------------------------------------------------------------ HISTOIRE — se repérer dans le temps (petits)
  T('hist-jours', 'histoire', [6, 7], 'Combien y a-t-il de jours dans une semaine ?', '7', { accept: ['sept'] }),
  T('hist-mois', 'histoire', [6, 7], 'Combien y a-t-il de mois dans une année ?', '12', { accept: ['douze'] }),
  T('hist-lundi', 'histoire', [6, 6], 'Quel jour vient après lundi ?', 'mardi'),
  C('hist-saison', 'histoire', [6, 7], 'Quelle saison vient après l’été ?', ['le printemps', 'l’automne', 'l’hiver'], 'l’automne'),
  C('hist-siecle', 'histoire', [8, 9], 'Un siècle, c’est combien d’années ?', ['10 ans', '100 ans', '1000 ans'], '100 ans'),
  // ------------------------------------------------------------ HISTOIRE — périodes et personnages
  C('hist-grottes', 'histoire', [8, 9], 'Comment appelle-t-on les peintures préhistoriques sur les murs des grottes ?', ['des peintures rupestres', 'des vitraux', 'des fresques romaines'], 'des peintures rupestres', { explain: 'Par exemple dans la grotte de Lascaux.' }),
  C('hist-feu', 'histoire', [7, 8], 'À la Préhistoire, quelle grande découverte a permis de se chauffer et de cuire les aliments ?', ['le feu', 'l’électricité', 'le gaz'], 'le feu'),
  C('hist-chateau', 'histoire', [7, 9], 'Au Moyen Âge, où vivait le seigneur pour se protéger ?', ['dans un château fort', 'dans une pyramide', 'dans un gratte-ciel'], 'dans un château fort'),
  C('hist-gaulois', 'histoire', [8, 10], 'Vercingétorix était le chef des…', ['Gaulois', 'Romains', 'Vikings'], 'Gaulois'),
  C('hist-romains', 'histoire', [9, 10], 'Quel peuple a construit le Colisée ?', ['les Romains', 'les Égyptiens', 'les Gaulois'], 'les Romains'),
  T('hist-pyramides', 'histoire', [8, 10], 'Dans quel pays se trouvent les pyramides de Gizeh ?', 'Égypte'),
  C('hist-charlemagne', 'histoire', [9, 10], 'Qui était Charlemagne ?', ['un empereur', 'un pharaon', 'un explorateur'], 'un empereur'),
  C('hist-roi-soleil', 'histoire', [9, 10], 'Quel roi était surnommé le « Roi-Soleil » ?', ['Louis XIV', 'Henri IV', 'Clovis'], 'Louis XIV', { explain: 'Il a fait construire le château de Versailles.' }),
  T('hist-bastille', 'histoire', [9, 10], 'En quelle année a eu lieu la prise de la Bastille ?', '1789'),
  C('hist-jeanne', 'histoire', [9, 10], 'Pendant quelle guerre Jeanne d’Arc a-t-elle combattu ?', ['la guerre de Cent Ans', 'la Première Guerre mondiale', 'la guerre des Gaules'], 'la guerre de Cent Ans'),
  C('hist-imprimerie', 'histoire', [10, 10], 'Qu’a inventé Gutenberg vers 1450 ?', ['l’imprimerie', 'le téléphone', 'la boussole'], 'l’imprimerie'),
  C('hist-lune', 'histoire', [10, 10], 'Qui a marché le premier sur la Lune, en 1969 ?', ['Neil Armstrong', 'Thomas Pesquet', 'Christophe Colomb'], 'Neil Armstrong'),

  // ------------------------------------------------------------ GÉOGRAPHIE
  T('geo-capitale-fr', 'geographie', [6, 8], 'Quelle est la capitale de la France ?', 'Paris'),
  C('geo-drapeau', 'geographie', [6, 7], 'Quelle couleur est au milieu du drapeau français ?', ['bleu', 'blanc', 'rouge'], 'blanc'),
  C('geo-continent-fr', 'geographie', [7, 9], 'Sur quel continent se trouve la France ?', ['l’Europe', 'l’Afrique', 'l’Asie'], 'l’Europe'),
  C('geo-botte', 'geographie', [8, 9], 'Quel pays a la forme d’une botte ?', ['l’Italie', 'l’Espagne', 'la Belgique'], 'l’Italie'),
  C('geo-soleil-leve', 'geographie', [8, 9], 'De quel côté le Soleil se lève-t-il ?', ['à l’est', 'à l’ouest', 'au nord'], 'à l’est'),
  C('geo-loire', 'geographie', [9, 10], 'Quel est le plus long fleuve de France ?', ['la Loire', 'la Seine', 'le Rhône'], 'la Loire'),
  T('geo-mont-blanc', 'geographie', [9, 10], 'Comment s’appelle le plus haut sommet des Alpes ?', 'Mont Blanc', { accept: ['mont-blanc'] }),
  C('geo-ocean-ouest', 'geographie', [9, 10], 'Quel océan borde l’ouest de la France ?', ['l’océan Atlantique', 'l’océan Pacifique', 'l’océan Indien'], 'l’océan Atlantique'),
  C('geo-mer-sud', 'geographie', [9, 10], 'Quelle mer borde le sud de la France ?', ['la Méditerranée', 'la mer du Nord', 'la Manche'], 'la Méditerranée'),
  T('geo-capitale-it', 'geographie', [9, 10], 'Quelle est la capitale de l’Italie ?', 'Rome'),
  T('geo-capitale-es', 'geographie', [9, 10], 'Quelle est la capitale de l’Espagne ?', 'Madrid'),
  T('geo-capitale-de', 'geographie', [10, 10], 'Quelle est la capitale de l’Allemagne ?', 'Berlin'),
  T('geo-capitale-uk', 'geographie', [10, 10], 'Quelle est la capitale du Royaume-Uni ?', 'Londres'),
  C('geo-pacifique', 'geographie', [10, 10], 'Quel est le plus grand océan du monde ?', ['le Pacifique', 'l’Atlantique', 'l’océan Arctique'], 'le Pacifique'),

  // ------------------------------------------------------------ SCIENCES
  C('sci-chenille', 'sciences', [6, 7], 'La chenille devient un…', ['papillon', 'oiseau', 'escargot'], 'papillon'),
  C('sci-tetard', 'sciences', [7, 8], 'Le têtard devient une…', ['grenouille', 'tortue', 'abeille'], 'grenouille'),
  T('sci-araignee', 'sciences', [7, 9], 'Combien de pattes a une araignée ?', '8', { accept: ['huit'] }),
  T('sci-insecte', 'sciences', [8, 9], 'Combien de pattes a un insecte ?', '6', { accept: ['six'] }),
  C('sci-plante', 'sciences', [7, 8], 'De quoi une plante a-t-elle besoin pour pousser ?', ['d’eau et de lumière', 'de sucre', 'de bruit'], 'd’eau et de lumière'),
  C('sci-terre-soleil', 'sciences', [8, 10], 'La Terre tourne autour…', ['du Soleil', 'de la Lune', 'de Mars'], 'du Soleil'),
  C('sci-glace', 'sciences', [9, 10], 'À quelle température l’eau se transforme-t-elle en glace ?', ['0 °C', '10 °C', '100 °C'], '0 °C'),
  C('sci-mammifere', 'sciences', [9, 10], 'Lequel de ces animaux est un mammifère ?', ['la baleine', 'le requin', 'le saumon'], 'la baleine', { explain: 'La baleine respire de l’air et allaite ses petits.' }),
  C('sci-mercure', 'sciences', [10, 10], 'Quelle planète est la plus proche du Soleil ?', ['Mercure', 'Vénus', 'Mars'], 'Mercure'),
  C('sci-coeur', 'sciences', [9, 10], 'Quel organe fait circuler le sang dans le corps ?', ['le cœur', 'l’estomac', 'les poumons'], 'le cœur'),
];

// Les questions de conjugaison exigent l'orthographe exacte, accents compris.
for (const q of QUESTIONS_FR) if (q.id.startsWith('conj-') && q.type === 'text') q.strictAccents = true;
