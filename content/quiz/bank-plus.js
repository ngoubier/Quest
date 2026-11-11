// BANQUE COMPLÉMENTAIRE — beaucoup plus de questions, pour éviter les répétitions.
// Écrites sous forme de tableaux courts, transformés en questions ci-dessous.
// Chaque question est rangée dans SA matière :
//   histoire   = le passé (Préhistoire, Antiquité, Moyen Âge, rois, inventions, République)
//   quotidien  = le temps qui passe (jours, mois, saisons, heure), l'argent, la sécurité, la maison
//   geographie = lieux, pays, paysages · sciences = vivant, matière, corps, espace

const T = (id, subject, ages, prompt, answer, extra = {}) => ({ id, subject, ages, type: 'text', prompt, answer, ...extra });
const C = (id, subject, ages, prompt, choices, answer, extra = {}) => ({ id, subject, ages, type: 'choice', prompt, choices, answer, ...extra });
const slug = (s) => String(s).toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const out = [];

// ============================================================ FRANÇAIS
// Images à nommer
[
  [[6, 7], '🐮', 'vache'], [[6, 7], '🐷', 'cochon'], [[6, 7], '🐭', 'souris'], [[6, 7], '🍌', 'banane'], [[6, 7], '🚪', 'porte'],
  [[6, 7], '🥚', 'œuf', ['oeuf']], [[6, 7], '🐔', 'poule'], [[6, 8], '🍞', 'pain'], [[6, 8], '⚽', 'ballon'], [[6, 8], '🧀', 'fromage'],
  [[6, 8], '🐻', 'ours'], [[7, 8], '🦁', 'lion'], [[7, 8], '🐑', 'mouton'], [[7, 8], '🍇', 'raisin'], [[7, 8], '🚂', 'train'],
  [[7, 9], '🦊', 'renard'], [[7, 9], '🐿️', 'écureuil'], [[7, 9], '🍒', 'cerise', ['cerises']], [[7, 9], '🔑', 'clé', ['clef']], [[8, 9], '🦉', 'hibou', ['chouette']],
  [[8, 9], '🦒', 'girafe'], [[8, 9], '🐊', 'crocodile'], [[8, 10], '🎸', 'guitare'], [[8, 10], '🌈', 'arc-en-ciel', ['arc en ciel']], [[8, 10], '🦓', 'zèbre'],
  [[9, 10], '🔭', 'télescope'], [[9, 10], '🦔', 'hérisson'], [[9, 10], '🎻', 'violon'], [[9, 10], '🦜', 'perroquet'], [[9, 10], '⚓', 'ancre'],
].forEach(([ages, image, answer, accept]) => out.push(T(`img-${slug(answer)}`, 'francais', ages, 'Comment s’appelle ceci ?', answer, { image, accept })));

// Contraires
[
  [[6, 7], 'petit', 'grand', ['grande']], [[6, 7], 'froid', 'chaud'], [[6, 7], 'nuit', 'jour'], [[6, 7], 'haut', 'bas'], [[6, 7], 'oui', 'non'],
  [[6, 7], 'ouvert', 'fermé'], [[6, 8], 'triste', 'content', ['joyeux', 'heureux', 'gai']], [[6, 8], 'propre', 'sale'], [[7, 8], 'lourd', 'léger'], [[7, 8], 'plein', 'vide'],
  [[7, 8], 'dedans', 'dehors'], [[7, 8], 'avant', 'après'], [[7, 9], 'gentil', 'méchant'], [[7, 9], 'facile', 'difficile', ['dur']], [[8, 9], 'long', 'court'],
  [[8, 9], 'commencer', 'finir', ['terminer', 'arrêter']], [[8, 9], 'jeune', 'vieux', ['âgé']], [[8, 10], 'acheter', 'vendre'], [[8, 10], 'entrer', 'sortir'], [[9, 10], 'premier', 'dernier'],
  [[9, 10], 'accepter', 'refuser'], [[9, 10], 'ancien', 'nouveau', ['moderne', 'récent', 'neuf']], [[9, 10], 'gagner', 'perdre'], [[10, 10], 'augmenter', 'diminuer', ['baisser', 'réduire']], [[10, 10], 'courageux', 'peureux', ['lâche']],
].forEach(([ages, word, answer, accept]) => out.push(T(`fr-contraire-${slug(word)}`, 'francais', ages, `Quel est le contraire de « ${word} » ?`, answer, { accept })));

// Pluriels
[
  [[7, 8], 'un chat', 'chats'], [[7, 8], 'une fleur', 'fleurs'], [[7, 8], 'un oiseau', 'oiseaux'], [[7, 9], 'un bateau', 'bateaux'], [[8, 9], 'un animal', 'animaux'],
  [[8, 9], 'un gâteau', 'gâteaux'], [[8, 9], 'un jeu', 'jeux'], [[8, 10], 'un cheveu', 'cheveux'], [[8, 10], 'une souris', 'souris'], [[9, 10], 'un hôpital', 'hôpitaux'],
  [[9, 10], 'un travail', 'travaux'], [[9, 10], 'un caillou', 'cailloux'], [[9, 10], 'un nez', 'nez'], [[9, 10], 'un genou', 'genoux'], [[10, 10], 'un pneu', 'pneus'],
  [[10, 10], 'un bal', 'bals'], [[10, 10], 'un vitrail', 'vitraux'], [[10, 10], 'un festival', 'festivals'],
].forEach(([ages, sing, answer]) => out.push(T(`fr-pluriel-${slug(answer)}`, 'francais', ages, `${sing.charAt(0).toUpperCase() + sing.slice(1)}, des …`, answer)));

// Féminins
[
  [[7, 8], 'Un ami', 'amie'], [[7, 8], 'Un marchand', 'marchande'], [[7, 8], 'Un chat', 'chatte'], [[8, 9], 'Un prince', 'princesse'], [[8, 9], 'Un roi', 'reine'],
  [[8, 9], 'Un coiffeur', 'coiffeuse'], [[8, 9], 'Un fermier', 'fermière'], [[9, 10], 'Un directeur', 'directrice'], [[9, 10], 'Un cheval', 'jument'], [[9, 10], 'Un coq', 'poule'],
  [[9, 10], 'Un tigre', 'tigresse'], [[10, 10], 'Un empereur', 'impératrice'], [[10, 10], 'Un neveu', 'nièce'], [[10, 10], 'Un héros', 'héroïne'],
].forEach(([ages, masc, answer]) => out.push(T(`fr-feminin-${slug(answer)}`, 'francais', ages, `${masc}, une …`, answer)));

// Conjugaison (orthographe exacte)
[
  [[7, 8], 'Tu (être) … gentil.', 'es'], [[7, 8], 'Il (avoir) … faim.', 'a'], [[7, 8], 'Nous (être) … amis.', 'sommes'], [[7, 8], 'Je (chanter) … bien.', 'chante'],
  [[7, 9], 'Elles (avoir) … des vélos.', 'ont'], [[7, 9], 'Vous (être) … en retard.', 'êtes'], [[8, 9], 'Tu (jouer) … au ballon.', 'joues'], [[8, 9], 'Ils (être) … contents.', 'sont'],
  [[8, 9], 'Nous (avoir) … un chien.', 'avons'], [[8, 9], 'Vous (regarder) … un film.', 'regardez'], [[8, 10], 'Je (aller) … à l’école.', 'vais'], [[8, 10], 'Elle (finir) … son dessin.', 'finit'],
  [[9, 10], 'Nous (manger) … des pommes.', 'mangeons', { explain: 'On garde le « e » pour le son [j] : nous mangeons.' }], [[9, 10], 'Ils (aller) … au parc.', 'vont'], [[9, 10], 'Tu (faire) … tes devoirs.', 'fais'],
  [[9, 10], 'Je (pouvoir) … t’aider.', 'peux'], [[9, 10], 'Demain, tu (être) … en vacances. (au futur)', 'seras'], [[9, 10], 'Demain, nous (avoir) … un contrôle. (au futur)', 'aurons'],
  [[9, 10], 'Quand j’étais petit, je (jouer) … dehors. (à l’imparfait)', 'jouais'], [[10, 10], 'Hier, elle (finir) … son livre. (au passé composé)', 'a fini'], [[10, 10], 'Autrefois, ils (habiter) … ici. (à l’imparfait)', 'habitaient'],
  [[10, 10], 'Demain, vous (venir) … avec nous. (au futur)', 'viendrez'], [[10, 10], 'Nous (prendre) … le bus.', 'prenons'], [[10, 10], 'Ils (vouloir) … jouer.', 'veulent'],
].forEach(([ages, prompt, answer, extra], i) => out.push(T(`conj2-${i}-${slug(answer)}`, 'francais', ages, prompt, answer, { strictAccents: true, ...extra })));

// Choix : sons, syllabes, nature des mots, homophones, vocabulaire
[
  ['fr-syll-papa', [6, 6], 'Combien de syllabes dans « papa » ?', ['1', '2', '3'], '2'],
  ['fr-syll-ordinateur', [6, 7], 'Combien de syllabes dans « ordinateur » ?', ['3', '4', '5'], '4', { explain: 'or - di - na - teur' }],
  ['fr-syll-chat', [6, 6], 'Combien de syllabes dans « chat » ?', ['1', '2', '3'], '1'],
  ['fr-syll-elephant', [6, 7], 'Combien de syllabes dans « éléphant » ?', ['2', '3', '4'], '3', { explain: 'é - lé - phant' }],
  ['fr-son-on', [6, 6], 'Dans quel mot entend-on le son [on] ?', ['mouton', 'matin', 'maman'], 'mouton'],
  ['fr-son-ch', [6, 6], 'Dans quel mot entend-on le son [ch] ?', ['vache', 'valise', 'savon'], 'vache'],
  ['fr-son-oi', [6, 7], 'Dans quel mot entend-on le son [oi] ?', ['poisson', 'poussin', 'pantin'], 'poisson'],
  ['fr-son-an', [6, 7], 'Dans quel mot entend-on le son [an] ?', ['enfant', 'lapin', 'bonbon'], 'enfant'],
  ['fr-rime-chat', [6, 7], 'Quel mot rime avec « chat » ?', ['rat', 'chien', 'lune'], 'rat'],
  ['fr-rime-bateau', [6, 7], 'Quel mot rime avec « bateau » ?', ['gâteau', 'bâton', 'ballon'], 'gâteau'],
  ['fr-consonne', [6, 7], 'Laquelle de ces lettres est une consonne ?', ['m', 'a', 'i', 'u'], 'm'],
  ['fr-nb-voyelles', [7, 8], 'Combien y a-t-il de voyelles dans l’alphabet ?', ['6', '5', '20'], '6', { explain: 'a, e, i, o, u, y' }],
  ['fr-majuscule', [6, 7], 'Par quoi commence toujours une phrase ?', ['une majuscule', 'un point', 'une virgule'], 'une majuscule'],
  ['fr-point-interro', [7, 8], 'Quel signe termine une question ?', ['?', '!', '.'], '?'],
  ['fr-intrus-animaux', [6, 7], 'Quel mot n’est pas un animal ?', ['table', 'chien', 'vache', 'lapin'], 'table'],
  ['fr-intrus-couleurs', [6, 7], 'Quel mot n’est pas une couleur ?', ['chaise', 'rouge', 'bleu', 'vert'], 'chaise'],
  ['fr-intrus-vetements', [7, 8], 'Quel mot n’est pas un vêtement ?', ['fourchette', 'pantalon', 'manteau', 'chaussette'], 'fourchette'],
  ['fr-intrus-metiers', [8, 9], 'Quel mot n’est pas un métier ?', ['montagne', 'boulanger', 'pompier', 'médecin'], 'montagne'],
  ['fr-nom-2', [7, 8], 'Lequel de ces mots est un nom ?', ['maison', 'chanter', 'joli', 'lentement'], 'maison'],
  ['fr-verbe-2', [7, 8], 'Lequel de ces mots est un verbe ?', ['courir', 'chien', 'bleu', 'table'], 'courir'],
  ['fr-verbe-3', [8, 9], 'Dans « Léa mange une pomme », quel est le verbe ?', ['mange', 'Léa', 'pomme'], 'mange'],
  ['fr-adjectif-2', [8, 9], 'Lequel de ces mots est un adjectif ?', ['gentil', 'gentiment', 'gentillesse'], 'gentil'],
  ['fr-determinant', [8, 9], 'Dans « le petit chat », quel mot est un déterminant ?', ['le', 'petit', 'chat'], 'le'],
  ['fr-sujet-2', [8, 10], 'Quel est le sujet dans « Mon frère lit un livre » ?', ['Mon frère', 'lit', 'un livre'], 'Mon frère'],
  ['fr-pronom', [9, 10], 'Dans « Elle chante », « elle » est…', ['un pronom', 'un verbe', 'un adjectif'], 'un pronom'],
  ['fr-adverbe', [10, 10], 'Lequel de ces mots est un adverbe ?', ['rapidement', 'rapide', 'rapidité'], 'rapidement'],
  ['fr-cod', [10, 10], 'Dans « Paul mange une pomme », « une pomme » est…', ['le complément d’objet', 'le sujet', 'le verbe'], 'le complément d’objet'],
  ['fr-infinitif', [9, 10], 'Quel est l’infinitif du verbe dans « nous allons » ?', ['aller', 'avoir', 'allonger'], 'aller'],
  ['fr-groupe-1', [9, 10], 'Lequel de ces verbes est du 1er groupe ?', ['chanter', 'finir', 'prendre'], 'chanter', { explain: 'Les verbes du 1er groupe se terminent par -er (sauf aller).' }],
  ['fr-temps-futur', [9, 10], '« Je partirai demain. » À quel temps est le verbe ?', ['futur', 'présent', 'imparfait'], 'futur'],
  ['fr-temps-present', [8, 9], '« Je mange une pomme. » À quel temps est le verbe ?', ['présent', 'passé', 'futur'], 'présent'],
  ['fr-homo-et', [8, 9], 'Un chat … un chien.', ['et', 'est'], 'et', { explain: '« et » = et aussi. On ne peut pas dire « un chat était un chien ».' }],
  ['fr-homo-on', [8, 10], '… va au cinéma.', ['On', 'Ont'], 'On', { explain: '« on » peut être remplacé par « il ».' }],
  ['fr-homo-ont', [8, 10], 'Ils … un beau jardin.', ['ont', 'on'], 'ont', { explain: '« ont » est le verbe avoir : ils avaient.' }],
  ['fr-homo-a-3', [8, 9], 'Elle … mal à la tête.', ['a', 'à'], 'a'],
  ['fr-homo-a-4', [8, 9], 'Il habite … Paris.', ['à', 'a'], 'à'],
  ['fr-homo-mes', [9, 10], 'J’ai perdu … clés.', ['mes', 'mais'], 'mes'],
  ['fr-homo-mais', [9, 10], 'J’ai faim, … je n’ai pas soif.', ['mais', 'mes'], 'mais'],
  ['fr-homo-ce', [10, 10], '… chien est gentil.', ['Ce', 'Se'], 'Ce'],
  ['fr-homo-se', [10, 10], 'Il … lave les mains.', ['se', 'ce'], 'se'],
  ['fr-homo-la', [10, 10], 'Pose ton sac …-bas.', ['là', 'la'], 'là'],
  ['fr-homo-leur', [10, 10], 'Je … donne un livre.', ['leur', 'leurs'], 'leur'],
  ['fr-syn-beau', [8, 9], 'Quel mot veut dire la même chose que « beau » ?', ['joli', 'laid', 'grand'], 'joli'],
  ['fr-syn-peur', [8, 9], 'Quel mot veut dire la même chose que « avoir peur » ?', ['craindre', 'rire', 'dormir'], 'craindre'],
  ['fr-syn-debuter', [9, 10], 'Quel mot veut dire la même chose que « débuter » ?', ['commencer', 'finir', 'attendre'], 'commencer'],
  ['fr-syn-enorme', [9, 10], 'Quel mot veut dire la même chose que « énorme » ?', ['gigantesque', 'minuscule', 'étroit'], 'gigantesque'],
  ['fr-syn-bizarre', [10, 10], 'Quel mot veut dire la même chose que « étrange » ?', ['bizarre', 'normal', 'joyeux'], 'bizarre'],
  ['fr-famille-lait', [8, 9], 'Quel mot est de la même famille que « lait » ?', ['laitier', 'laid', 'laine'], 'laitier'],
  ['fr-famille-fleur', [8, 9], 'Quel mot est de la même famille que « fleur » ?', ['fleuriste', 'fleuve', 'flèche'], 'fleuriste'],
  ['fr-famille-jardin', [9, 10], 'Quel mot est de la même famille que « jardin » ?', ['jardinier', 'jambon', 'jaune'], 'jardinier'],
  ['fr-prefixe-re', [10, 10], 'Que veut dire « refaire » ?', ['faire encore une fois', 'ne pas faire', 'faire vite'], 'faire encore une fois'],
  ['fr-prefixe-in', [10, 10], 'Que veut dire « impossible » ?', ['pas possible', 'très possible', 'encore possible'], 'pas possible'],
  ['fr-dico-2', [8, 9], 'Quel mot vient en premier dans le dictionnaire ?', ['banane', 'cerise', 'poire', 'tomate'], 'banane'],
  ['fr-dico-3', [9, 10], 'Quel mot vient en premier dans le dictionnaire ?', ['chat', 'cheval', 'chien', 'chou'], 'chat'],
  ['fr-accord-3', [9, 10], 'Une … voiture.', ['belle', 'beau', 'beaux'], 'belle'],
  ['fr-accord-4', [9, 10], 'Les filles sont …', ['contentes', 'content', 'contents'], 'contentes'],
  ['fr-accord-verbe', [9, 10], 'Les oiseaux … dans le ciel.', ['volent', 'vole', 'voles'], 'volent'],
  ['fr-lettre-g', [8, 9], 'Dans quel mot la lettre « g » se prononce [j] ?', ['girafe', 'gâteau', 'gomme'], 'girafe'],
  ['fr-lettre-c', [8, 9], 'Dans quel mot la lettre « c » se prononce [s] ?', ['citron', 'café', 'cube'], 'citron'],
  ['fr-lettre-s', [9, 10], 'Dans quel mot la lettre « s » se prononce [z] ?', ['rose', 'soleil', 'poste'], 'rose'],
].forEach(([id, ages, prompt, choices, answer, extra]) => out.push(C(id, 'francais', ages, prompt, choices, answer, extra)));

[
  ['fr-apres-b', [6, 6], 'Quelle lettre vient juste après « b » dans l’alphabet ?', 'c'],
  ['fr-apres-s', [6, 7], 'Quelle lettre vient juste après « s » dans l’alphabet ?', 't'],
  ['fr-avant-j', [6, 7], 'Quelle lettre vient juste avant « j » dans l’alphabet ?', 'i'],
  ['fr-derniere', [6, 7], 'Quelle est la dernière lettre de l’alphabet ?', 'z'],
  ['fr-nb-lettres', [7, 8], 'Combien y a-t-il de lettres dans l’alphabet ?', '26', { accept: ['vingt-six'] }],
  ['fr-petit-chat', [7, 8], 'Comment appelle-t-on le petit du chat ?', 'chaton'],
  ['fr-petit-chien', [7, 8], 'Comment appelle-t-on le petit du chien ?', 'chiot'],
  ['fr-petit-vache', [8, 9], 'Comment appelle-t-on le petit de la vache ?', 'veau'],
  ['fr-petit-poule', [7, 8], 'Comment appelle-t-on le petit de la poule ?', 'poussin'],
  ['fr-petit-cheval', [8, 10], 'Comment appelle-t-on le petit du cheval ?', 'poulain'],
  ['fr-petit-mouton', [8, 10], 'Comment appelle-t-on le petit du mouton ?', 'agneau'],
  ['fr-cri-chien', [7, 8], 'Le chat miaule. Le chien …', 'aboie'],
  ['fr-maison-abeille', [8, 9], 'Comment s’appelle la maison des abeilles ?', 'ruche'],
  ['fr-maison-oiseau', [7, 8], 'Où l’oiseau pond-il ses œufs ?', 'nid', { accept: ['dans un nid', 'dans le nid'] }],
].forEach(([id, ages, prompt, answer, extra]) => out.push(T(id, 'francais', ages, prompt, answer, extra)));

// ============================================================ HISTOIRE (le passé uniquement)
[
  ['hist-dino', [6, 7], 'Quels très grands animaux vivaient bien avant les hommes ?', ['les dinosaures', 'les vaches', 'les chevaux'], 'les dinosaures'],
  ['hist-chevalier', [6, 7], 'Au temps des châteaux forts, qui portait une armure et une épée ?', ['le chevalier', 'le pompier', 'le facteur'], 'le chevalier'],
  ['hist-roi-chateau', [6, 7], 'Autrefois, qui dirigeait le royaume ?', ['le roi', 'le boulanger', 'le berger'], 'le roi'],
  ['hist-couronne', [6, 7], 'Que portait le roi sur la tête ?', ['une couronne', 'un casque de vélo', 'une casquette'], 'une couronne'],
  ['hist-autrefois-ecole', [6, 7], 'Autrefois, à l’école, avec quoi écrivait-on ?', ['une plume et de l’encre', 'une tablette', 'un ordinateur'], 'une plume et de l’encre'],
  ['hist-autrefois-lumiere', [6, 7], 'Avant l’électricité, avec quoi s’éclairait-on le soir ?', ['des bougies', 'des ampoules', 'des écrans'], 'des bougies'],
  ['hist-autrefois-voyage', [6, 8], 'Avant les voitures, comment voyageait-on ?', ['à cheval', 'en avion', 'en métro'], 'à cheval'],
  ['hist-grotte-habitat', [6, 8], 'Où s’abritaient souvent les hommes préhistoriques ?', ['dans des grottes', 'dans des immeubles', 'dans des châteaux'], 'dans des grottes'],
  ['hist-mammouth', [6, 8], 'Quel gros animal poilu chassaient les hommes préhistoriques ?', ['le mammouth', 'le lion de cirque', 'la baleine'], 'le mammouth'],
  ['hist-passe', [6, 7], 'Lequel de ces objets existait déjà au temps de tes arrière-grands-parents ?', ['le vélo', 'le smartphone', 'la console de jeux'], 'le vélo'],
  ['hist-silex', [7, 8], 'Avec quelle pierre les hommes préhistoriques fabriquaient-ils leurs outils ?', ['le silex', 'le diamant', 'le marbre'], 'le silex'],
  ['hist-chasse', [7, 8], 'Comment les premiers hommes trouvaient-ils leur nourriture ?', ['par la chasse et la cueillette', 'au supermarché', 'au restaurant'], 'par la chasse et la cueillette'],
  ['hist-pharaon', [7, 9], 'Comment appelait-on le roi de l’Égypte ancienne ?', ['le pharaon', 'l’empereur', 'le président'], 'le pharaon'],
  ['hist-hieroglyphes', [8, 9], 'Comment s’appelle l’écriture en dessins des Égyptiens ?', ['les hiéroglyphes', 'l’alphabet', 'le braille'], 'les hiéroglyphes'],
  ['hist-momie', [7, 9], 'Dans l’Égypte ancienne, que plaçait-on dans les pyramides ?', ['le tombeau du pharaon', 'des magasins', 'des écoles'], 'le tombeau du pharaon'],
  ['hist-lascaux', [8, 9], 'Qu’ont peint les hommes préhistoriques dans la grotte de Lascaux ?', ['des animaux', 'des voitures', 'des châteaux'], 'des animaux'],
  ['hist-agriculture', [8, 9], 'À la fin de la Préhistoire, les hommes ont commencé à…', ['cultiver la terre et élever des animaux', 'construire des usines', 'voyager en train'], 'cultiver la terre et élever des animaux'],
  ['hist-ecriture', [8, 10], 'Quelle invention marque la fin de la Préhistoire ?', ['l’écriture', 'la roue de vélo', 'l’imprimerie'], 'l’écriture'],
  ['hist-gaule', [8, 9], 'Comment s’appelait la France au temps des Gaulois ?', ['la Gaule', 'la Germanie', 'l’Hexagone'], 'la Gaule'],
  ['hist-cesar', [8, 10], 'Quel chef romain a conquis la Gaule ?', ['Jules César', 'Napoléon', 'Charlemagne'], 'Jules César'],
  ['hist-alesia', [9, 10], 'Dans quelle bataille Vercingétorix a-t-il été vaincu par les Romains ?', ['Alésia', 'Waterloo', 'Marignan'], 'Alésia'],
  ['hist-gallo-romain', [9, 10], 'Qu’ont construit les Romains en Gaule ?', ['des routes, des arènes et des aqueducs', 'des gratte-ciel', 'des gares'], 'des routes, des arènes et des aqueducs'],
  ['hist-clovis', [9, 10], 'Qui était Clovis ?', ['le premier roi des Francs', 'un empereur romain', 'un chef gaulois'], 'le premier roi des Francs'],
  ['hist-moyen-age', [8, 9], 'Les chevaliers et les châteaux forts, c’est quelle période ?', ['le Moyen Âge', 'la Préhistoire', 'l’Antiquité'], 'le Moyen Âge'],
  ['hist-paysans', [8, 9], 'Au Moyen Âge, qui cultivait les terres du seigneur ?', ['les paysans', 'les chevaliers', 'les moines'], 'les paysans'],
  ['hist-cathedrale', [9, 10], 'Quel grand monument religieux a-t-on construit au Moyen Âge ?', ['les cathédrales', 'les pyramides', 'la tour Eiffel'], 'les cathédrales'],
  ['hist-800', [10, 10], 'En quelle année Charlemagne est-il couronné empereur ?', ['800', '1515', '1789'], '800'],
  ['hist-colomb', [9, 10], 'Qui a traversé l’océan Atlantique et atteint l’Amérique en 1492 ?', ['Christophe Colomb', 'Marco Polo', 'Jules Verne'], 'Christophe Colomb'],
  ['hist-francois-1', [9, 10], 'Quel roi a gagné la bataille de Marignan en 1515 ?', ['François Ier', 'Louis XIV', 'Louis XVI'], 'François Ier'],
  ['hist-renaissance', [10, 10], 'Quel artiste a peint La Joconde ?', ['Léonard de Vinci', 'Pablo Picasso', 'Claude Monet'], 'Léonard de Vinci'],
  ['hist-versailles', [9, 10], 'Quel château Louis XIV a-t-il fait construire ?', ['Versailles', 'Chambord', 'le Louvre'], 'Versailles'],
  ['hist-revolution-roi', [9, 10], 'Quel roi régnait en France quand la Révolution a éclaté ?', ['Louis XVI', 'Louis XIV', 'Henri IV'], 'Louis XVI'],
  ['hist-ddhc', [10, 10], 'Quel texte de 1789 dit que les hommes naissent libres et égaux ?', ['la Déclaration des droits de l’homme et du citoyen', 'le Code de la route', 'la Marseillaise'], 'la Déclaration des droits de l’homme et du citoyen'],
  ['hist-napoleon', [9, 10], 'Qui est devenu empereur des Français en 1804 ?', ['Napoléon Bonaparte', 'Louis XIV', 'Charlemagne'], 'Napoléon Bonaparte'],
  ['hist-ferry', [10, 10], 'Qui a rendu l’école gratuite et obligatoire en France ?', ['Jules Ferry', 'Victor Hugo', 'Louis Pasteur'], 'Jules Ferry'],
  ['hist-pasteur', [10, 10], 'Quel savant a inventé le vaccin contre la rage ?', ['Louis Pasteur', 'Gustave Eiffel', 'Jules Ferry'], 'Louis Pasteur'],
  ['hist-tour-eiffel', [8, 10], 'Quel monument de Paris a été construit pour l’Exposition de 1889 ?', ['la tour Eiffel', 'Notre-Dame', 'l’Arc de triomphe'], 'la tour Eiffel'],
  ['hist-1918', [10, 10], 'Que célèbre-t-on le 11 novembre ?', ['la fin de la Première Guerre mondiale', 'la prise de la Bastille', 'la fête du Travail'], 'la fin de la Première Guerre mondiale'],
  ['hist-8-mai', [10, 10], 'Que célèbre-t-on le 8 mai ?', ['la fin de la Seconde Guerre mondiale en Europe', 'la fête nationale', 'le début de l’été'], 'la fin de la Seconde Guerre mondiale en Europe'],
  ['hist-vote-femmes', [10, 10], 'En quelle année les Françaises ont-elles obtenu le droit de vote ?', ['1944', '1789', '2000'], '1944'],
  ['hist-president', [9, 10], 'En France, qui est le chef de l’État ?', ['le président de la République', 'le roi', 'le maire'], 'le président de la République'],
  ['hist-ordre-1', [9, 10], 'Quelle période vient en premier ?', ['la Préhistoire', 'le Moyen Âge', 'l’Antiquité'], 'la Préhistoire'],
  ['hist-ordre-2', [9, 10], 'Quelle période vient juste après l’Antiquité ?', ['le Moyen Âge', 'la Préhistoire', 'l’époque contemporaine'], 'le Moyen Âge'],
  ['hist-vikings', [8, 10], 'Quel peuple de navigateurs venu du Nord voyageait sur des drakkars ?', ['les Vikings', 'les Égyptiens', 'les Gaulois'], 'les Vikings'],
  ['hist-drapeau', [8, 9], 'Quelles sont les trois couleurs du drapeau français ?', ['bleu, blanc, rouge', 'vert, blanc, rouge', 'noir, jaune, rouge'], 'bleu, blanc, rouge'],
].forEach(([id, ages, prompt, choices, answer, extra]) => out.push(C(id, 'histoire', ages, prompt, choices, answer, extra)));
out.push(T('hist-millenaire', 'histoire', [9, 10], 'Un millénaire, c’est combien d’années ?', '1000', { accept: ['mille'] }));
out.push(T('hist-1492', 'histoire', [10, 10], 'En quelle année Christophe Colomb arrive-t-il en Amérique ?', '1492'));

// ============================================================ GÉOGRAPHIE
[
  ['geo-pays', [6, 7], 'Dans quel pays se trouve Paris ?', ['la France', 'l’Italie', 'l’Espagne'], 'la France'],
  ['geo-planete', [6, 7], 'Comment s’appelle notre planète ?', ['la Terre', 'la Lune', 'Mars'], 'la Terre'],
  ['geo-mer-eau', [6, 7], 'L’eau de la mer est…', ['salée', 'sucrée', 'gazeuse'], 'salée'],
  ['geo-montagne-haut', [6, 7], 'Où trouve-t-on de la neige presque toute l’année ?', ['en haut des montagnes', 'à la plage', 'dans le désert'], 'en haut des montagnes'],
  ['geo-desert', [6, 8], 'Dans quel paysage y a-t-il surtout du sable et très peu d’eau ?', ['le désert', 'la forêt', 'la banquise'], 'le désert'],
  ['geo-ville-campagne', [6, 7], 'Où y a-t-il le plus d’immeubles ?', ['en ville', 'à la campagne', 'en forêt'], 'en ville'],
  ['geo-ferme', [6, 7], 'Où élève-t-on des vaches et des poules ?', ['à la ferme', 'à la gare', 'au musée'], 'à la ferme'],
  ['geo-ile-def', [6, 8], 'Comment appelle-t-on une terre entourée d’eau ?', ['une île', 'une montagne', 'un pont'], 'une île'],
  ['geo-plan', [7, 8], 'Quel dessin vu d’en haut aide à trouver son chemin ?', ['un plan', 'un poème', 'un calendrier'], 'un plan'],
  ['geo-boussole', [7, 9], 'Quel objet indique toujours le nord ?', ['la boussole', 'la montre', 'le thermomètre'], 'la boussole'],
  ['geo-fleuve', [7, 9], 'Comment appelle-t-on un grand cours d’eau qui se jette dans la mer ?', ['un fleuve', 'un lac', 'une flaque'], 'un fleuve'],
  ['geo-seine', [8, 9], 'Quel fleuve traverse Paris ?', ['la Seine', 'la Loire', 'la Garonne'], 'la Seine'],
  ['geo-hexagone', [8, 9], 'À quelle forme ressemble la France ?', ['un hexagone', 'un cercle', 'un triangle'], 'un hexagone'],
  ['geo-voisin', [8, 9], 'Lequel de ces pays est un voisin de la France ?', ['l’Espagne', 'le Japon', 'le Brésil'], 'l’Espagne'],
  ['geo-nb-continents', [8, 10], 'Lequel de ces noms est un continent ?', ['l’Afrique', 'la France', 'Paris'], 'l’Afrique'],
  ['geo-points-cardinaux', [8, 9], 'Sur une carte, où se trouve le nord ?', ['en haut', 'en bas', 'à gauche'], 'en haut'],
  ['geo-coucher', [8, 9], 'De quel côté le Soleil se couche-t-il ?', ['à l’ouest', 'à l’est', 'au sud'], 'à l’ouest'],
  ['geo-pole', [8, 10], 'Où vivent les manchots ?', ['près du pôle Sud', 'dans le désert', 'dans la jungle'], 'près du pôle Sud'],
  ['geo-equateur', [9, 10], 'Comment s’appelle la ligne imaginaire qui partage la Terre en deux moitiés, nord et sud ?', ['l’équateur', 'le méridien', 'l’horizon'], 'l’équateur'],
  ['geo-pyrenees', [9, 10], 'Quelles montagnes séparent la France de l’Espagne ?', ['les Pyrénées', 'les Alpes', 'les Vosges'], 'les Pyrénées'],
  ['geo-alpes', [9, 10], 'Dans quel massif se trouve le mont Blanc ?', ['les Alpes', 'les Pyrénées', 'le Jura'], 'les Alpes'],
  ['geo-manche', [9, 10], 'Quelle mer sépare la France de l’Angleterre ?', ['la Manche', 'la Méditerranée', 'la mer Noire'], 'la Manche'],
  ['geo-rhone', [9, 10], 'Quel fleuve passe à Lyon et se jette dans la Méditerranée ?', ['le Rhône', 'la Seine', 'la Loire'], 'le Rhône'],
  ['geo-garonne', [10, 10], 'Quel fleuve passe à Toulouse et à Bordeaux ?', ['la Garonne', 'la Seine', 'le Rhin'], 'la Garonne'],
  ['geo-everest', [9, 10], 'Quelle est la plus haute montagne du monde ?', ['l’Everest', 'le mont Blanc', 'le Kilimandjaro'], 'l’Everest'],
  ['geo-sahara', [9, 10], 'Sur quel continent se trouve le désert du Sahara ?', ['l’Afrique', 'l’Asie', 'l’Europe'], 'l’Afrique'],
  ['geo-amazonie', [9, 10], 'Sur quel continent se trouve la forêt amazonienne ?', ['l’Amérique du Sud', 'l’Afrique', 'l’Océanie'], 'l’Amérique du Sud'],
  ['geo-chine', [9, 10], 'Sur quel continent se trouve la Chine ?', ['l’Asie', 'l’Afrique', 'l’Amérique'], 'l’Asie'],
  ['geo-kangourou', [9, 10], 'Dans quel pays vivent les kangourous ?', ['l’Australie', 'le Canada', 'l’Égypte'], 'l’Australie'],
  ['geo-nil', [10, 10], 'Quel grand fleuve traverse l’Égypte ?', ['le Nil', 'l’Amazone', 'le Danube'], 'le Nil'],
  ['geo-lyon', [10, 10], 'Laquelle de ces villes est la plus grande ?', ['Paris', 'Lyon', 'Nice'], 'Paris'],
  ['geo-outre-mer', [10, 10], 'Laquelle de ces îles est un département français d’outre-mer ?', ['la Réunion', 'la Sicile', 'l’Islande'], 'la Réunion'],
  ['geo-ue', [10, 10], 'Quelle monnaie utilise-t-on en France, en Allemagne et en Italie ?', ['l’euro', 'le dollar', 'la livre'], 'l’euro'],
  ['geo-climat', [10, 10], 'Quel climat fait-il près de l’équateur ?', ['chaud toute l’année', 'froid toute l’année', 'toujours de la neige'], 'chaud toute l’année'],
  ['geo-littoral', [9, 10], 'Comment appelle-t-on le bord de la mer ?', ['le littoral', 'le sommet', 'la plaine'], 'le littoral'],
  ['geo-capitale-def', [8, 9], 'Qu’est-ce qu’une capitale ?', ['la ville où se trouve le gouvernement d’un pays', 'la plus petite ville', 'une ville au bord de la mer'], 'la ville où se trouve le gouvernement d’un pays'],
].forEach(([id, ages, prompt, choices, answer, extra]) => out.push(C(id, 'geographie', ages, prompt, choices, answer, extra)));

// Capitales
[
  [[9, 10], 'de la Belgique', 'Bruxelles'], [[9, 10], 'du Portugal', 'Lisbonne'], [[10, 10], 'de la Suisse', 'Berne'], [[10, 10], 'de la Grèce', 'Athènes'],
  [[10, 10], 'des États-Unis', 'Washington'], [[10, 10], 'du Japon', 'Tokyo'], [[10, 10], 'de la Chine', 'Pékin', ['Beijing']], [[10, 10], 'de la Russie', 'Moscou'],
].forEach(([ages, of, answer, accept]) => out.push(T(`geo-capitale-${slug(answer)}`, 'geographie', ages, `Quelle est la capitale ${of} ?`, answer, { accept })));
out.push(T('geo-nb-continents-2', 'geographie', [10, 10], 'Combien y a-t-il d’océans sur la Terre ?', '5', { accept: ['cinq'] }));

// ============================================================ SCIENCES
[
  ['sci-poussin', [6, 7], 'Quel animal sort d’un œuf ?', ['le poussin', 'le chaton', 'le veau'], 'le poussin'],
  ['sci-vache-lait', [6, 7], 'Quel animal nous donne du lait ?', ['la vache', 'la poule', 'le poisson'], 'la vache'],
  ['sci-abeille', [6, 7], 'Quel insecte fabrique le miel ?', ['l’abeille', 'la mouche', 'la fourmi'], 'l’abeille'],
  ['sci-poisson-eau', [6, 7], 'Où vit le poisson ?', ['dans l’eau', 'dans un nid', 'sous la terre'], 'dans l’eau'],
  ['sci-oiseau-ailes', [6, 7], 'Avec quoi l’oiseau vole-t-il ?', ['ses ailes', 'ses pattes', 'son bec'], 'ses ailes'],
  ['sci-sens-yeux', [6, 7], 'Avec quoi voit-on ?', ['les yeux', 'les oreilles', 'le nez'], 'les yeux'],
  ['sci-sens-oreilles', [6, 7], 'Avec quoi entend-on ?', ['les oreilles', 'la bouche', 'les mains'], 'les oreilles'],
  ['sci-sens-nez', [6, 7], 'Avec quoi sent-on les odeurs ?', ['le nez', 'les yeux', 'les pieds'], 'le nez'],
  ['sci-glacon', [6, 7], 'Que devient un glaçon au soleil ?', ['de l’eau', 'du sable', 'de la pierre'], 'de l’eau'],
  ['sci-nuit', [6, 7], 'Que voit-on dans le ciel la nuit ?', ['la Lune et les étoiles', 'le Soleil', 'un arc-en-ciel'], 'la Lune et les étoiles'],
  ['sci-graine', [6, 8], 'Que faut-il planter pour faire pousser une fleur ?', ['une graine', 'un caillou', 'une feuille de papier'], 'une graine'],
  ['sci-vivant', [6, 8], 'Lequel est un être vivant ?', ['un arbre', 'un caillou', 'une chaise'], 'un arbre'],
  ['sci-dents-lait', [6, 8], 'Comment appelle-t-on les premières dents des enfants ?', ['les dents de lait', 'les dents de fer', 'les dents de sagesse'], 'les dents de lait'],
  ['sci-automne-feuilles', [6, 8], 'Que font les feuilles de beaucoup d’arbres en automne ?', ['elles tombent', 'elles poussent', 'elles deviennent bleues'], 'elles tombent'],
  ['sci-racines', [7, 8], 'Quelle partie de la plante est sous la terre ?', ['les racines', 'les fleurs', 'les feuilles'], 'les racines'],
  ['sci-herbivore', [7, 9], 'Que mange un animal herbivore ?', ['des plantes', 'de la viande', 'des cailloux'], 'des plantes'],
  ['sci-carnivore', [8, 9], 'Lequel de ces animaux est carnivore ?', ['le lion', 'la vache', 'le lapin'], 'le lion'],
  ['sci-squelette', [7, 9], 'Qu’est-ce qui tient notre corps debout ?', ['le squelette', 'la peau', 'les cheveux'], 'le squelette'],
  ['sci-poumons', [8, 9], 'Avec quels organes respire-t-on ?', ['les poumons', 'les reins', 'l’estomac'], 'les poumons'],
  ['sci-etats', [8, 9], 'Quels sont les trois états de l’eau ?', ['solide, liquide, gazeux', 'chaud, tiède, froid', 'douce, salée, sucrée'], 'solide, liquide, gazeux'],
  ['sci-vapeur', [8, 9], 'Que devient l’eau quand on la fait bouillir ?', ['de la vapeur', 'de la glace', 'du sel'], 'de la vapeur'],
  ['sci-jour-nuit', [8, 10], 'Pourquoi fait-il jour puis nuit ?', ['la Terre tourne sur elle-même', 'le Soleil s’éteint', 'la Lune cache le Soleil chaque soir'], 'la Terre tourne sur elle-même'],
  ['sci-lune', [8, 10], 'La Lune tourne autour…', ['de la Terre', 'du Soleil', 'de Mars'], 'de la Terre'],
  ['sci-soleil-etoile', [8, 10], 'Le Soleil est…', ['une étoile', 'une planète', 'un satellite'], 'une étoile'],
  ['sci-ovipare', [8, 10], 'Comment appelle-t-on un animal qui pond des œufs ?', ['ovipare', 'vivipare', 'herbivore'], 'ovipare'],
  ['sci-aimant', [8, 9], 'Qu’attire un aimant ?', ['le fer', 'le bois', 'le verre'], 'le fer'],
  ['sci-ombre', [7, 9], 'De quoi a-t-on besoin pour faire une ombre ?', ['de la lumière', 'du vent', 'de la pluie'], 'de la lumière'],
  ['sci-ebullition', [9, 10], 'À quelle température l’eau bout-elle ?', ['100 °C', '50 °C', '0 °C'], '100 °C'],
  ['sci-saisons-cause', [10, 10], 'Combien de temps la Terre met-elle pour faire le tour du Soleil ?', ['un an', 'un jour', 'un mois'], 'un an'],
  ['sci-planetes-nb', [9, 10], 'Combien de planètes compte le système solaire ?', ['8', '5', '12'], '8'],
  ['sci-jupiter', [10, 10], 'Quelle est la plus grosse planète du système solaire ?', ['Jupiter', 'la Terre', 'Mars'], 'Jupiter'],
  ['sci-mars', [9, 10], 'Quelle planète est surnommée la « planète rouge » ?', ['Mars', 'Vénus', 'Saturne'], 'Mars'],
  ['sci-digestion', [9, 10], 'Dans quel organe les aliments arrivent-ils après avoir été avalés ?', ['l’estomac', 'le cœur', 'les poumons'], 'l’estomac'],
  ['sci-cerveau', [9, 10], 'Quel organe commande tout le corps ?', ['le cerveau', 'le foie', 'le cœur'], 'le cerveau'],
  ['sci-muscles', [9, 10], 'Qu’est-ce qui permet à nos os de bouger ?', ['les muscles', 'les ongles', 'les dents'], 'les muscles'],
  ['sci-oxygene', [10, 10], 'Quel gaz de l’air est indispensable pour respirer ?', ['l’oxygène', 'le gaz carbonique', 'l’hélium'], 'l’oxygène'],
  ['sci-photosynthese', [10, 10], 'Que produisent les plantes vertes grâce à la lumière ?', ['de l’oxygène', 'du pétrole', 'du sel'], 'de l’oxygène'],
  ['sci-chaine', [9, 10], 'Dans la chaîne « herbe → lapin → renard », qui mange le lapin ?', ['le renard', 'l’herbe', 'personne'], 'le renard'],
  ['sci-vertebre', [9, 10], 'Lequel de ces animaux n’a pas de squelette ?', ['l’escargot', 'le chat', 'la grenouille'], 'l’escargot'],
  ['sci-reptile', [9, 10], 'Lequel de ces animaux est un reptile ?', ['le lézard', 'la grenouille', 'le dauphin'], 'le lézard'],
  ['sci-eolienne', [9, 10], 'Quelle énergie fait tourner une éolienne ?', ['le vent', 'le soleil', 'l’eau'], 'le vent'],
  ['sci-tri', [8, 10], 'Pourquoi trie-t-on les déchets ?', ['pour les recycler', 'pour les cacher', 'pour les brûler dans le jardin'], 'pour les recycler'],
  ['sci-melange', [9, 10], 'Que se passe-t-il quand on met du sel dans l’eau et qu’on remue ?', ['il se dissout', 'il flotte', 'il devient du sucre'], 'il se dissout'],
  ['sci-flotte', [7, 9], 'Lequel de ces objets flotte sur l’eau ?', ['un bouchon de liège', 'un caillou', 'une clé'], 'un bouchon de liège'],
  ['sci-thermometre', [8, 9], 'En quelle unité mesure-t-on la température ?', ['en degrés', 'en litres', 'en kilos'], 'en degrés'],
].forEach(([id, ages, prompt, choices, answer, extra]) => out.push(C(id, 'sciences', ages, prompt, choices, answer, extra)));
[
  ['sci-pattes-chat', [6, 7], 'Combien de pattes a un chat ?', '4', ['quatre']],
  ['sci-pattes-oiseau', [6, 7], 'Combien de pattes a un oiseau ?', '2', ['deux']],
  ['sci-sens-nb', [7, 9], 'Combien de sens avons-nous ?', '5', ['cinq']],
  ['sci-doigts', [6, 6], 'Combien de doigts as-tu sur une main ?', '5', ['cinq']],
].forEach(([id, ages, prompt, answer, accept]) => out.push(T(id, 'sciences', ages, prompt, answer, { accept })));

// ============================================================ ANGLAIS
const EN_WORDS = [
  // [âges, anglais, français, emoji?]
  [[6, 7], 'dog', 'chien', '🐶'], [[6, 7], 'blue', 'bleu'], [[6, 7], 'yellow', 'jaune'], [[6, 7], 'one', '1'], [[6, 7], 'two', '2'],
  [[6, 8], 'green', 'vert'], [[6, 8], 'black', 'noir'], [[6, 8], 'white', 'blanc'], [[6, 8], 'five', '5'], [[6, 8], 'ten', '10'],
  [[7, 8], 'bird', 'oiseau', '🐦'], [[7, 8], 'fish', 'poisson', '🐟'], [[7, 8], 'milk', 'lait', '🥛'], [[7, 8], 'four', '4'], [[7, 8], 'six', '6'],
  [[7, 9], 'pink', 'rose'], [[7, 9], 'orange', 'orange'], [[7, 9], 'mother', 'mère'], [[7, 9], 'father', 'père'], [[7, 9], 'seven', '7'],
  [[8, 9], 'rabbit', 'lapin', '🐰'], [[8, 9], 'cow', 'vache', '🐮'], [[8, 9], 'pig', 'cochon', '🐷'], [[8, 9], 'bread', 'pain', '🍞'], [[8, 9], 'water', 'eau'],
  [[8, 10], 'brother', 'frère'], [[8, 10], 'school', 'école', '🏫'], [[8, 10], 'eight', '8'], [[8, 10], 'nine', '9'], [[8, 10], 'eleven', '11'],
  [[9, 10], 'cheese', 'fromage', '🧀'], [[9, 10], 'chicken', 'poulet', '🐔'], [[9, 10], 'Tuesday', 'mardi'], [[9, 10], 'Sunday', 'dimanche'], [[9, 10], 'Friday', 'vendredi'],
  [[9, 10], 'twenty', '20'], [[9, 10], 'summer', 'été'], [[9, 10], 'winter', 'hiver'], [[9, 10], 'friend', 'ami'], [[9, 10], 'teacher', 'professeur'],
  [[10, 10], 'Wednesday', 'mercredi'], [[10, 10], 'Thursday', 'jeudi'], [[10, 10], 'Saturday', 'samedi'], [[10, 10], 'spring', 'printemps'], [[10, 10], 'autumn', 'automne'],
  [[10, 10], 'hundred', '100'], [[10, 10], 'breakfast', 'petit déjeuner'], [[10, 10], 'bedroom', 'chambre'], [[10, 10], 'kitchen', 'cuisine'], [[10, 10], 'grandmother', 'grand-mère'],
];
EN_WORDS.forEach(([ages, en, fr, emoji], i) => {
  // Trois mauvaises réponses prises parmi les mots voisins de même genre (nombre ou mot).
  const isNum = /^\d+$/.test(fr);
  const others = EN_WORDS.filter((w) => w[2] !== fr && /^\d+$/.test(w[2]) === isNum && Math.abs(w[0][0] - ages[0]) <= 2);
  const wrong = [others[(i * 7) % others.length], others[(i * 7 + 3) % others.length]].filter((w, k, a) => a.indexOf(w) === k);
  out.push(C(`en-fr-${slug(en)}`, 'anglais', ages, `Que veut dire « ${en} » ?`, [fr, ...wrong.map((w) => w[2])], fr));
  if (ages[0] >= 8) out.push(C(`en-en-${slug(en)}`, 'anglais', ages, `Comment dit-on « ${fr} » en anglais ?`, [en, ...wrong.map((w) => w[1])], en));
  if (emoji && ages[0] >= 7) out.push({ id: `en-img2-${slug(en)}`, subject: 'anglais', ages, type: 'text', prompt: 'Comment dit-on ceci en anglais ?', image: emoji, answer: en, articles: true });
});
[
  ['en-thanks', [6, 8], 'Comment dit-on « merci » en anglais ?', ['thank you', 'please', 'sorry'], 'thank you'],
  ['en-bye', [6, 8], 'Comment dit-on « au revoir » en anglais ?', ['goodbye', 'hello', 'good morning'], 'goodbye'],
  ['en-please', [7, 9], 'Comment dit-on « s’il te plaît » en anglais ?', ['please', 'thanks', 'yes'], 'please'],
  ['en-yes', [6, 7], 'Que veut dire « yes » ?', ['oui', 'non', 'peut-être'], 'oui'],
  ['en-no', [6, 7], 'Que veut dire « no » ?', ['non', 'oui', 'merci'], 'non'],
  ['en-morning', [8, 9], 'Que veut dire « Good morning » ?', ['Bonjour (le matin)', 'Bonne nuit', 'Au revoir'], 'Bonjour (le matin)'],
  ['en-night', [8, 9], 'Que veut dire « Good night » ?', ['Bonne nuit', 'Bonjour', 'Bon appétit'], 'Bonne nuit'],
  ['en-name', [8, 10], 'Que veut dire « What’s your name? »', ['Comment t’appelles-tu ?', 'Quel âge as-tu ?', 'Où habites-tu ?'], 'Comment t’appelles-tu ?'],
  ['en-old', [9, 10], 'Que veut dire « How old are you? »', ['Quel âge as-tu ?', 'Comment vas-tu ?', 'Où es-tu ?'], 'Quel âge as-tu ?'],
  ['en-how', [9, 10], 'Que veut dire « How are you? »', ['Comment vas-tu ?', 'Qui es-tu ?', 'Quel âge as-tu ?'], 'Comment vas-tu ?'],
  ['en-like', [9, 10], 'Que veut dire « I like apples » ?', ['J’aime les pommes', 'J’ai des pommes', 'Je mange une pomme'], 'J’aime les pommes'],
  ['en-heis', [10, 10], 'Complète : « She … my sister. »', ['is', 'am', 'are'], 'is'],
  ['en-theyare', [10, 10], 'Complète : « They … happy. »', ['are', 'is', 'am'], 'are'],
  ['en-plural', [10, 10], 'Quel est le pluriel de « cat » en anglais ?', ['cats', 'cates', 'cat'], 'cats'],
  ['en-ihave', [10, 10], 'Que veut dire « I have a dog » ?', ['J’ai un chien', 'Je suis un chien', 'J’aime les chiens'], 'J’ai un chien'],
  ['en-sunny', [10, 10], 'Que veut dire « It’s sunny » ?', ['Il y a du soleil', 'Il pleut', 'Il fait nuit'], 'Il y a du soleil'],
  ['en-big', [8, 9], 'Que veut dire « big » ?', ['grand', 'petit', 'vieux'], 'grand'],
  ['en-small', [8, 9], 'Que veut dire « small » ?', ['petit', 'grand', 'rapide'], 'petit'],
  ['en-happy', [8, 10], 'Que veut dire « happy » ?', ['content', 'triste', 'fatigué'], 'content'],
].forEach(([id, ages, prompt, choices, answer]) => out.push(C(id, 'anglais', ages, prompt, choices, answer)));

// ============================================================ VIE QUOTIDIENNE
[
  ['vq-saison-apres-ete', [6, 7], 'Quelle saison vient après l’été ?', ['l’automne', 'le printemps', 'l’hiver'], 'l’automne'],
  ['vq-saison-apres-hiver', [6, 7], 'Quelle saison vient après l’hiver ?', ['le printemps', 'l’été', 'l’automne'], 'le printemps'],
  ['vq-saison-chaude', [6, 7], 'Quelle saison est la plus chaude ?', ['l’été', 'l’hiver', 'l’automne'], 'l’été'],
  ['vq-noel', [6, 7], 'En quelle saison fête-t-on Noël ?', ['en hiver', 'en été', 'au printemps'], 'en hiver'],
  ['vq-matin', [6, 6], 'À quel moment de la journée prend-on le petit déjeuner ?', ['le matin', 'le soir', 'la nuit'], 'le matin'],
  ['vq-soir', [6, 6], 'Quand va-t-on se coucher ?', ['le soir', 'le matin', 'à midi'], 'le soir'],
  ['vq-pluie', [6, 7], 'Que prend-on quand il pleut ?', ['un parapluie', 'des lunettes de soleil', 'un maillot de bain'], 'un parapluie'],
  ['vq-froid', [6, 7], 'Que met-on quand il fait très froid ?', ['un manteau', 'un short', 'des sandales'], 'un manteau'],
  ['vq-ceinture', [6, 7], 'En voiture, que doit-on toujours attacher ?', ['sa ceinture', 'ses lacets', 'son cartable'], 'sa ceinture'],
  ['vq-feu-rouge', [6, 7], 'Que fait une voiture quand le feu est rouge ?', ['elle s’arrête', 'elle accélère', 'elle klaxonne'], 'elle s’arrête'],
  ['vq-merci', [6, 7], 'Que dit-on quand on reçoit un cadeau ?', ['merci', 'au revoir', 'pardon'], 'merci'],
  ['vq-poubelle', [6, 7], 'Où jette-t-on un papier de bonbon ?', ['à la poubelle', 'par terre', 'dans la rivière'], 'à la poubelle'],
  ['vq-fruits', [6, 7], 'Lequel de ces aliments est un fruit ?', ['la pomme', 'la carotte', 'le pain'], 'la pomme'],
  ['vq-dodo', [6, 8], 'De quoi notre corps a-t-il besoin chaque nuit ?', ['de sommeil', 'de bonbons', 'de télévision'], 'de sommeil'],
  ['vq-eau-boire', [6, 8], 'Quelle est la meilleure boisson pour la santé ?', ['l’eau', 'le soda', 'le sirop'], 'l’eau'],
  ['vq-inconnu', [7, 9], 'Un inconnu te propose de monter dans sa voiture. Que fais-tu ?', ['je refuse et je préviens un adulte', 'je monte', 'je lui donne mon adresse'], 'je refuse et je préviens un adulte'],
  ['vq-prise', [7, 9], 'Que ne faut-il jamais mettre dans une prise électrique ?', ['ses doigts ou un objet', 'la fiche d’une lampe'], 'ses doigts ou un objet'],
  ['vq-trottoir', [7, 8], 'Où marche-t-on dans la rue ?', ['sur le trottoir', 'sur la route', 'sur la piste cyclable'], 'sur le trottoir'],
  ['vq-fevrier', [8, 9], 'Quel est le mois le plus court de l’année ?', ['février', 'janvier', 'décembre'], 'février'],
  ['vq-premier-mois', [7, 8], 'Quel est le premier mois de l’année ?', ['janvier', 'septembre', 'décembre'], 'janvier'],
  ['vq-dernier-mois', [7, 8], 'Quel est le dernier mois de l’année ?', ['décembre', 'janvier', 'juin'], 'décembre'],
  ['vq-rentree', [7, 8], 'Quel mois a lieu la rentrée des classes ?', ['septembre', 'juillet', 'mars'], 'septembre'],
  ['vq-trimestre', [9, 10], 'Combien de mois y a-t-il dans un trimestre ?', ['3', '4', '6'], '3'],
  ['vq-bissextile', [10, 10], 'Combien de jours compte une année bissextile ?', ['366', '365', '360'], '366'],
  ['vq-quart-heure', [8, 9], 'Combien de minutes y a-t-il dans un quart d’heure ?', ['15', '25', '45'], '15'],
  ['vq-demi-heure', [8, 9], 'Combien de minutes y a-t-il dans une demi-heure ?', ['30', '50', '15'], '30'],
  ['vq-midi', [7, 8], 'Quelle heure est-il à midi ?', ['12 heures', '6 heures', '20 heures'], '12 heures'],
  ['vq-minuit', [8, 9], 'Comment appelle-t-on 0 heure, au milieu de la nuit ?', ['minuit', 'midi', 'l’aube'], 'minuit'],
  ['vq-police', [8, 10], 'En France, quel numéro appelle la police ?', ['17', '18', '15'], '17', { explain: '15 : SAMU · 17 : police · 18 : pompiers · 112 : urgences en Europe.' }],
  ['vq-incendie', [8, 10], 'S’il y a de la fumée dans la maison, que fais-tu ?', ['je sors et je préviens un adulte', 'je me cache sous le lit', 'j’ouvre toutes les fenêtres et je reste'], 'je sors et je préviens un adulte'],
  ['vq-medicament', [8, 9], 'Qui peut te donner un médicament ?', ['un adulte de confiance', 'un camarade', 'toi tout seul'], 'un adulte de confiance'],
  ['vq-ecran', [8, 10], 'Avant de dormir, qu’est-ce qui aide à bien s’endormir ?', ['lire un livre', 'jouer sur un écran', 'manger des bonbons'], 'lire un livre'],
  ['vq-petit-dej', [7, 9], 'Quel repas prend-on le matin ?', ['le petit déjeuner', 'le dîner', 'le goûter'], 'le petit déjeuner'],
  ['vq-diner', [7, 9], 'Quel repas prend-on le soir ?', ['le dîner', 'le déjeuner', 'le petit déjeuner'], 'le dîner'],
  ['vq-fruits-legumes', [8, 10], 'Combien de fruits et légumes conseille-t-on de manger par jour ?', ['5', '1', '20'], '5'],
  ['vq-litre', [8, 10], 'En quelle unité mesure-t-on le lait dans une bouteille ?', ['en litres', 'en mètres', 'en kilos'], 'en litres'],
  ['vq-kilo', [8, 10], 'En quelle unité pèse-t-on des pommes ?', ['en kilos', 'en litres', 'en mètres'], 'en kilos'],
  ['vq-metre', [8, 10], 'En quelle unité mesure-t-on la longueur d’une pièce ?', ['en mètres', 'en kilos', 'en litres'], 'en mètres'],
  ['vq-facteur', [6, 8], 'Qui apporte le courrier ?', ['le facteur', 'le boulanger', 'le pompier'], 'le facteur'],
  ['vq-boulanger', [6, 7], 'Chez qui achète-t-on le pain ?', ['le boulanger', 'le coiffeur', 'le médecin'], 'le boulanger'],
  ['vq-medecin', [6, 7], 'Qui va-t-on voir quand on est malade ?', ['le médecin', 'le facteur', 'le jardinier'], 'le médecin'],
  ['vq-dentiste', [7, 8], 'Qui soigne les dents ?', ['le dentiste', 'le boucher', 'le pilote'], 'le dentiste'],
  ['vq-bibliotheque', [7, 9], 'Où emprunte-t-on des livres ?', ['à la bibliothèque', 'à la piscine', 'à la boulangerie'], 'à la bibliothèque'],
  ['vq-recyclage-papier', [8, 10], 'Dans quelle poubelle jette-t-on un vieux journal ?', ['la poubelle de tri (papier)', 'le conteneur à verre', 'le compost'], 'la poubelle de tri (papier)'],
  ['vq-economie-eau', [8, 10], 'Pour économiser l’eau, il vaut mieux…', ['fermer le robinet en se brossant les dents', 'laisser couler l’eau', 'prendre trois bains par jour'], 'fermer le robinet en se brossant les dents'],
  ['vq-lumiere', [7, 9], 'Que fait-on en sortant d’une pièce pour économiser l’énergie ?', ['on éteint la lumière', 'on allume la télévision', 'on ouvre le frigo'], 'on éteint la lumière'],
  ['vq-internet', [9, 10], 'Sur Internet, que ne faut-il jamais donner à un inconnu ?', ['son adresse et son mot de passe', 'un bonjour', 'le nom d’un film'], 'son adresse et son mot de passe'],
  ['vq-rendre-monnaie', [9, 10], 'Tu achètes un livre à 8 € avec un billet de 10 €. Que fait le vendeur ?', ['il te rend 2 €', 'il te rend 8 €', 'il ne te rend rien'], 'il te rend 2 €'],
  ['vq-prix', [9, 10], 'Qu’est-ce qui est écrit sur une étiquette dans un magasin ?', ['le prix', 'la météo', 'l’heure'], 'le prix'],
].forEach(([id, ages, prompt, choices, answer, extra]) => out.push(C(id, 'quotidien', ages, prompt, choices, answer, extra)));
[
  ['vq-jours-semaine', [6, 7], 'Combien y a-t-il de jours dans une semaine ?', '7', ['sept']],
  ['vq-mois-annee', [6, 8], 'Combien y a-t-il de mois dans une année ?', '12', ['douze']],
  ['vq-saisons-nb', [6, 8], 'Combien y a-t-il de saisons dans une année ?', '4', ['quatre']],
  ['vq-apres-lundi', [6, 6], 'Quel jour vient après lundi ?', 'mardi'],
  ['vq-apres-mercredi', [6, 7], 'Quel jour vient après mercredi ?', 'jeudi'],
  ['vq-apres-dimanche', [6, 7], 'Quel jour vient après dimanche ?', 'lundi'],
  ['vq-avant-samedi', [7, 8], 'Quel jour vient juste avant samedi ?', 'vendredi'],
  ['vq-apres-juin', [7, 8], 'Quel mois vient après juin ?', 'juillet'],
  ['vq-apres-decembre', [7, 9], 'Quel mois vient après décembre ?', 'janvier'],
  ['vq-avant-octobre', [8, 9], 'Quel mois vient juste avant octobre ?', 'septembre'],
  ['vq-secondes', [8, 10], 'Combien de secondes y a-t-il dans une minute ?', '60', ['soixante']],
].forEach(([id, ages, prompt, answer, accept]) => out.push(T(id, 'quotidien', ages, prompt, answer, { accept })));

export const QUESTIONS_PLUS = out;
