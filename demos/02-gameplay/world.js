// CONTENU de l'essai n°2 : uniquement des DONNÉES (cartes, objets, quêtes, dialogues).
// Toute la logique vient de gameplay/ et engine/.
// Les {w:...} sont remplacés par le vocabulaire de l'ambiance (euros, clés...).

export const LEGEND = {
  '.': 'floor',
  ',': 'floor_alt',
  '=': 'path',
  '#': 'wall',
  o: 'obstacle',
  '~': 'water',
  _: 'floor_in',
  b: 'bush',
  P: { tile: 'path', marker: 'start' },
};

// bag: false   = ne prend pas de place dans le sac (affiché dans le bandeau)
// quest: true  = objet de quête (ne peut pas être jeté)
// use(adv)     = utilisable depuis le sac ; renvoie false pour annuler, ou un message
const healUse = (n, label) => (adv) => {
  if (adv.state.hp >= adv.state.maxHp) return (adv.toast('Ta vie est déjà pleine.'), false);
  adv.state.heal(n);
  adv.game.audio.play('heal');
  return label;
};

export const ITEMS = {
  coin: { icon: 'coin', word: 'coin', max: 999, sound: 'coin', bag: false },
  key: { icon: 'key', word: 'key', max: 9, bag: false },
  hint: { icon: 'hint', name: 'indice', plural: 'indices', max: 99, sound: 'secret', bag: false },
  heart: { icon: 'heart', instant: (adv) => adv.state.heal(2), sound: 'heal' },
  heart_container: { icon: 'heart_container', name: 'cœur supplémentaire', description: 'Un cœur de vie en plus, pour toujours.', instant: (adv) => adv.state.setMaxHp(adv.state.maxHp + 2, true), sound: 'heal' },
  big_bag: { icon: 'big_bag', name: 'grand sac', description: 'Ton sac passe à 20 places !', instant: (adv) => (adv.state.bagSize = Math.max(adv.state.bagSize, 20)) },
  apple: { icon: 'apple', name: 'pomme', plural: 'pommes', description: 'Rend 1 cœur.', max: 9, use: healUse(2, 'Miam ! +1 cœur.') },
  cake: { icon: 'cake', name: 'gâteau', plural: 'gâteaux', description: 'Rend toute ta vie.', max: 3, use: healUse(99, 'Délicieux ! Vie pleine.') },
  potion: { icon: 'potion', word: 'potion', name: 'potion', description: 'Te sauve automatiquement si tu perds toute ta vie.', max: 3 },
  amulet: { icon: 'amulet', word: 'amulet', description: 'Le trésor de l’Ancien.', quest: true },
  mushroom: { icon: 'mushroom', word: 'mushroom', description: 'Pour la recette de la cuisinière.', max: 9, quest: true },
  flowers: { icon: 'flowers', word: 'flowers', name: 'fleurs', description: 'Pour le bouquet de Léon.', max: 1, quest: true },
  ribbon: { icon: 'ribbon', name: 'ruban', description: 'Pour le bouquet de Léon.', max: 1 },
  bouquet: { icon: 'bouquet', name: 'bouquet', description: 'À offrir à la cuisinière.', max: 1, quest: true },
  planks: { icon: 'planks', name: 'planches', description: 'Pour réparer le pont.', max: 1, quest: true },
  nails: { icon: 'nails', name: 'clous', description: 'Pour réparer le pont.', max: 1 },
  tarte: { icon: 'tarte', name: 'tarte', description: 'Pour le pêcheur.', max: 1, quest: true },
};

// ----------------------------------------------------------------- QUÊTES
export const QUESTS = [
  {
    id: 'relic',
    difficulty: 3, // 1 facile · 2 moyenne · 3 difficile
    kind: 'main',
    title: 'La relique perdue',
    steps: [
      {
        goal: 'Trouver un moyen d’atteindre {w:cave}',
        done: 'bridge_built',
        hints: ['{w:cave} est au sud-est, de l’autre côté de la rivière.', 'Le charpentier, au bord de la rivière, sait réparer le pont.'],
      },
      {
        goal: 'Explorer {w:cave}',
        done: { item: 'amulet' },
        hints: [
          'Dans la salle de droite, pousse le bloc sur la dalle : la grille s’ouvrira.',
          'Vaincs tous les monstres de la salle du haut : un coffre apparaîtra, avec une clé.',
          'Contre {w:boss} : frappe-le, réponds juste à sa question, puis frappe vite pendant que son bouclier est baissé !',
        ],
      },
      { goal: 'Retourner voir {w:elder}', done: { flag: 'relic_returned' }, hints: ['{w:elder} habite en haut à gauche du village.'] },
    ],
    rewards: [{ maxHp: 2 }, { toast: 'Ta vie maximale augmente !' }],
  },
  // Quête OBLIGATOIRE qui ouvre le monde : réparer le pont (fabrication + troc + embranchement).
  {
    id: 'bridge',
    difficulty: 2, // 1 facile · 2 moyenne · 3 difficile
    kind: 'main',
    title: 'Le pont cassé',
    steps: [
      {
        // Embranchement : l'objectif dépend du choix fait chez le pêcheur.
        goal: [
          { when: 'fisher_tarte', text: 'Échanger une tarte de la cuisinière contre les planches du pêcheur' },
          { when: 'fisher_quiz', text: 'Réussir les questions du pêcheur pour avoir ses planches' },
          { text: 'Trouver des planches' },
        ],
        done: { item: 'planks' },
        hints: ['Le pêcheur, au bord du lac, a de vieilles planches.', 'Il les échange contre une tarte de la cuisinière... ou contre de bonnes réponses !'],
      },
      {
        goal: 'Acheter des clous chez le marchand',
        done: { item: 'nails' },
        hints: ['Le magasin est dans la maison en haut du village, près de la cuisinière.', 'Pour gagner des {ws:coin}, réponds aux questions de la maîtresse.'],
      },
      { goal: 'Apporter planches et clous au charpentier', done: 'bridge_built', hints: ['Le charpentier attend au bord de la rivière, au sud.'] },
    ],
    rewards: [{ toast: 'Le pont est réparé !' }],
  },
  {
    id: 'harvest',
    difficulty: 1, // 1 facile · 2 moyenne · 3 difficile
    kind: 'side',
    title: 'La recette de la cuisinière',
    steps: [
      {
        goal: 'Trouver 3 {ws:mushroom} ({item:mushroom}/3)',
        done: { item: 'mushroom', count: 3 },
        hints: ['Un {w:mushroom} pousse près du lac.', 'Un autre est caché sous un buisson, au nord. Un dernier est dans le jardin fermé : frappe le levier !'],
      },
      { goal: 'Les apporter à la cuisinière', done: { flag: 'harvest_given' } },
    ],
  },
  {
    id: 'hunt',
    difficulty: 1, // 1 facile · 2 moyenne · 3 difficile
    kind: 'side',
    title: 'Nettoyer les champs',
    steps: [
      { goal: 'Vaincre 3 {ws:blob} ({counter:kills_blob}/3)', done: { counter: 'kills_blob', gte: 3 }, hints: ['Il y en a dans les champs, autour du village.'] },
      { goal: 'Retourner voir le garde', done: { flag: 'hunt_reported' } },
    ],
  },
  // Quête « aller chercher » à étapes : questions scolaires + boutique + livraisons.
  {
    id: 'bouquet',
    difficulty: 2, // 1 facile · 2 moyenne · 3 difficile
    kind: 'side',
    title: 'Un bouquet pour la cuisinière',
    steps: [
      { goal: 'Obtenir des {w:flowers} auprès de la jardinière', done: { item: 'flowers' } },
      { goal: 'Acheter un ruban chez le marchand', done: { item: 'ribbon' } },
      { goal: 'Rapporter les {w:flowers} et le ruban à Léon', done: { flag: 'bouquet_made' } },
      { goal: 'Offrir le bouquet à la cuisinière', done: { flag: 'bouquet_delivered' } },
      { goal: 'Annoncer la réponse à Léon', done: { flag: 'bouquet_thanked' } },
    ],
    rewards: [{ give: 'coin', count: 25 }, { give: 'hint' }, { toast: 'Récompense : 25 {ws:coin} + 1 indice' }],
  },
];

// ----------------------------------------------------------------- PNJ
const ELDER = {
  type: 'npc',
  name: '{w:elderName}',
  role: 'quest',
  gives: ['relic'],
  sprite: 'elder',
  dialogue: [
    {
      when: { quest: 'relic', status: 'none' },
      do: [
        { say: 'Ah, {player}, te voilà ! Un monstre a emporté mon {w:amulet} et l’a cachée au fond de {w:cave}...' },
        {
          ask: 'Peux-tu m’aider ?\nQuête « La relique perdue » : {level:relic}',
          choices: [
            { label: 'Oui', do: [{ startQuest: 'relic' }, { say: "Merci ! L'entrée est au sud-est, de l'autre côté de la rivière. Sois prudent." }] },
            { label: 'Pas maintenant', do: [{ say: 'Je comprends... Reviens me voir si tu changes d’avis.' }] },
          ],
        },
      ],
    },
    {
      when: [{ quest: 'relic', status: 'active' }, { item: 'amulet' }],
      do: [{ say: ['Tu as réussi ! Mon {w:amulet} !', 'Je n’ai rien de plus précieux à t’offrir que ma bénédiction...'] }, { take: 'amulet' }, { setFlag: 'relic_returned' }],
    },
    { when: [{ quest: 'relic', status: 'active' }, { not: 'bridge_built' }], do: [{ say: 'Le pont est cassé ? Va voir le charpentier, au bord de la rivière.' }] },
    { when: { quest: 'relic', status: 'active' }, do: [{ say: "Dans les souterrains, observe bien chaque salle : il y a souvent un mécanisme." }] },
    { do: [{ say: 'Grâce à toi, le village est en paix.' }] },
  ],
};

const COOK = {
  type: 'npc',
  name: 'Margot, la cuisinière',
  role: 'quest',
  gives: ['harvest'],
  involved: ['bouquet', 'bridge'],
  sprite: 'merchant',
  dialogue: [
    {
      when: [{ quest: 'bouquet', step: 3 }, { item: 'bouquet' }],
      do: [
        { say: ['Un bouquet ? De la part de Léon ?', 'Comme c’est gentil ! Dis-lui que j’accepte avec plaisir son invitation à pique-niquer.'] },
        { take: 'bouquet' },
        { setFlag: 'bouquet_delivered' },
      ],
    },
    {
      when: { quest: 'harvest', status: 'none' },
      do: [
        {
          ask: 'Il me manque 3 {ws:mushroom} pour ma recette. Tu veux bien m’en trouver ?\nQuête : {level:harvest}',
          choices: [
            { label: 'Oui', do: [{ startQuest: 'harvest' }, { say: 'Génial ! Cherche partout... certains se cachent même sous les buissons !' }] },
            { label: 'Non', do: [{ say: 'Tant pis.' }] },
          ],
        },
      ],
    },
    {
      when: { quest: 'harvest', step: 1 },
      do: [
        { say: 'Parfait, les voilà ! Voici ta récompense.' },
        { take: 'mushroom', count: 3 },
        { setFlag: 'harvest_given' },
        { give: 'coin', count: 15, announce: true },
        { if: 'fisher_tarte', then: [{ say: 'Et voici une tarte aux champignons pour le pêcheur !' }, { give: 'tarte', announce: true }] },
      ],
    },
    {
      // Troc : si on a promis une tarte au pêcheur après avoir fini la recette.
      when: [{ quest: 'harvest', status: 'done' }, 'fisher_tarte', { not: { item: 'tarte' } }, { not: { item: 'planks' } }, { not: 'bridge_built' }],
      do: [{ say: 'Une tarte pour le pêcheur ? Avec plaisir !' }, { give: 'tarte', announce: true }],
    },
    {
      when: [{ quest: 'harvest', status: 'none' }, 'fisher_tarte'],
      do: [{ say: ['Une tarte ? Il me faut d’abord 3 {ws:mushroom} !', 'Nouvelle quête : {level:harvest}'] }, { startQuest: 'harvest' }],
    },
    { when: { quest: 'harvest', status: 'active' }, do: [{ say: 'Tu en as {item:mushroom} sur 3. Pense à couper les buissons !' }] },
    { do: [{ say: 'Ma recette est un succès. Merci encore !' }] },
  ],
};

const GUARD = {
  type: 'npc',
  name: 'Bastien, le garde',
  role: 'quest',
  gives: ['hunt'],
  sprite: 'guard',
  dialogue: [
    {
      when: { quest: 'hunt', status: 'none' },
      do: [
        {
          ask: 'Des {ws:blob} envahissent les champs. Tu peux en éliminer 3 ?\nQuête : {level:hunt}',
          choices: [
            { label: 'Oui', do: [{ startQuest: 'hunt' }, { say: 'Bien ! Utilise ton arme : bouton Action quand rien n’est devant toi.' }] },
            { label: 'Non', do: [{ say: 'Dommage.' }] },
          ],
        },
      ],
    },
    { when: { quest: 'hunt', step: 1 }, do: [{ say: 'Beau travail ! Voici un indice, garde-le pour quand tu seras bloqué.' }, { setFlag: 'hunt_reported' }, { give: 'hint', announce: true }, { give: 'coin', count: 10 }] },
    { when: { quest: 'hunt', status: 'active' }, do: [{ say: 'Encore un effort : {counter:kills_blob} sur 3.' }] },
    { do: [{ say: 'Les champs sont calmes grâce à toi.' }] },
  ],
};

// Maîtresse : questions à volonté, 2 pièces par bonne réponse (source d'argent).
// Le JEU choisit la matière (variée, en insistant sur les points faibles).
// Paliers (diplômes) selon le nombre total de bonnes réponses.
const diploma = (n, flag, title, reward) => ({
  when: [{ quizOk: '*', gte: n }, { not: flag }],
  do: [{ say: `Tu as déjà ${n} bonnes réponses : voici ton diplôme « ${title} » !` }, { setFlag: flag }, ...reward],
});
// La maîtresse laisse l'enfant CHOISIR le thème (les autres PNJ choisissent pour lui).
const teacherTheme = (label, subject) => ({
  label,
  do: [
    {
      quiz: { id: 'teacher', subject, count: 3, retryPrice: 5 },
      perCorrect: { give: 'coin', count: 2 },
      success: [{ say: 'Trois sur trois, bravo !' }],
      failure: [{ say: 'Continue de t’entraîner ! Reviens un peu plus tard pour une nouvelle série.' }],
    },
  ],
});
const TEACHER = {
  type: 'npc',
  name: 'Mme Lili, la maîtresse',
  role: 'quiz',
  sprite: 'teacher',
  dialogue: [
    diploma(5, 'diploma_1', 'Élève curieux', [{ give: 'hint', announce: true }]),
    diploma(15, 'diploma_2', 'Élève brillant', [{ give: 'hint', count: 2, announce: true }]),
    diploma(30, 'diploma_3', 'Petit génie', [{ give: 'heart_container', announce: true }]),
    {
      do: [
        { say: 'Bonjour {player} ! Chaque bonne réponse à mes questions te rapporte 2 {ws:coin}.' },
        {
          ask: 'Quel thème choisis-tu ?',
          choices: [
            teacherTheme('Histoire', 'histoire'),
            teacherTheme('Géographie', 'geographie'),
            teacherTheme('Mathématiques', 'maths'),
            teacherTheme('Vie quotidienne', 'quotidien'),
            teacherTheme('Français', 'francais'),
            { label: 'Plus tard', do: [{ say: 'À bientôt !' }] },
          ],
        },
      ],
    },
  ],
};

// Historien : professeur SPÉCIALISÉ (histoire), avec des paliers de maîtrise.
const tier = (n, flag, title, reward) => ({
  when: [{ quizOk: 'histoire', gte: n }, { not: flag }],
  do: [{ say: `Te voilà « ${title} » ! Voici ta récompense.` }, { setFlag: flag }, ...reward],
});
const HISTORIAN = {
  type: 'npc',
  name: 'Edmond, l’historien',
  role: 'quiz',
  sprite: 'scholar',
  dialogue: [
    tier(3, 'hist_tier_1', 'Apprenti historien', [{ give: 'hint', announce: true }]),
    tier(8, 'hist_tier_2', 'Historien confirmé', [{ give: 'coin', count: 20, announce: true }]),
    tier(15, 'hist_tier_3', 'Grand historien', [{ give: 'potion', announce: true }]),
    {
      do: [
        { say: 'L’histoire, c’est ma passion ! Paliers : 3, 8 et 15 bonnes réponses. Tu en as {quizOk:histoire}.' },
        {
          ask: 'Une série de questions d’histoire ?',
          choices: [
            {
              label: 'Oui',
              do: [
                {
                  quiz: { id: 'historian', subject: 'histoire', count: 3, pass: 2 },
                  perCorrect: { give: 'coin', count: 1 },
                  success: [{ say: 'Excellent ! Reviens me voir pour monter de palier.' }],
                  failure: [{ say: 'L’histoire demande de la patience. Reviens plus tard !' }],
                },
              ],
            },
            { label: 'Non', do: [{ say: 'Le passé t’attendra.' }] },
          ],
        },
      ],
    },
  ],
};

// Pêcheur : TROC et EMBRANCHEMENT — ses planches contre une tarte, ou contre de bonnes réponses.
const FISHER = {
  type: 'npc',
  name: 'Marius, le pêcheur',
  role: 'quiz',
  involved: ['bridge'],
  sprite: 'fisher',
  dialogue: [
    {
      when: [{ item: 'tarte' }, { not: { item: 'planks' } }, { not: 'bridge_built' }],
      do: [{ say: 'Une tarte aux champignons ! Marché conclu, voici mes planches.' }, { take: 'tarte' }, { give: 'planks', announce: true }],
    },
    {
      when: [{ quest: 'bridge', step: 0 }, 'fisher_quiz'],
      do: [
        {
          quiz: { id: 'fisher', count: 3, pass: 2 },
          success: [{ say: 'Tu en sais des choses ! Les planches sont à toi.' }, { give: 'planks', announce: true }],
          failure: [{ say: 'Pas assez... Tu peux revenir plus tard, ou m’apporter une tarte.' }, { clearFlag: 'fisher_quiz' }],
        },
      ],
    },
    {
      when: [{ quest: 'bridge', step: 0 }, { not: 'fisher_tarte' }],
      do: [
        { say: 'Mes vieilles planches ? Je veux bien te les céder... mais pas pour rien !' },
        {
          ask: 'Que me proposes-tu ?',
          choices: [
            { label: 'Une tarte', do: [{ setFlag: 'fisher_tarte' }, { say: 'Une tarte de la cuisinière ? Miam ! Rapporte-m’en une.' }] },
            { label: 'Tes questions', do: [{ setFlag: 'fisher_quiz' }, { say: 'Réponds juste à 2 questions sur 3. Parle-moi quand tu es prêt !' }] },
          ],
        },
      ],
    },
    { when: [{ quest: 'bridge', step: 0 }, 'fisher_tarte'], do: [{ say: 'J’attends ma tarte ! La cuisinière en fait de délicieuses... avec des {ws:mushroom}.' }] },
    { do: [{ say: 'Ça mord bien aujourd’hui.' }] },
  ],
};

// Charpentier : FABRICATION — planches + clous = pont réparé (ouvre l'accès à la grotte).
const CARPENTER = {
  type: 'npc',
  name: 'Paulo, le charpentier',
  role: 'quest',
  gives: ['bridge'],
  sprite: 'carpenter',
  dialogue: [
    {
      when: { quest: 'bridge', status: 'none' },
      do: [{ say: ['Le pont vers {w:cave} s’est effondré ! Regarde, au sud : il est tout cassé.', 'Pour le réparer, il me faut des planches et des clous.', 'Nouvelle quête « Le pont cassé » : {level:bridge}'] }, { startQuest: 'bridge' }],
    },
    {
      when: [{ item: 'planks' }, { item: 'nails' }, { not: 'bridge_built' }],
      do: [{ say: 'Parfait ! Un peu de patience... Voilà, le pont est comme neuf !' }, { take: 'planks' }, { take: 'nails' }, { setFlag: 'bridge_built' }],
    },
    { when: { quest: 'bridge', status: 'active' }, do: [{ say: 'Il me faut des planches ({item:planks}/1) et des clous ({item:nails}/1).' }] },
    { do: [{ say: 'Mon pont tiendra cent ans !' }] },
  ],
};

// Écrivain public : uniquement des DICTÉES (le jeu prononce un mot, l'enfant l'écrit).
const WRITER = {
  type: 'npc',
  name: 'Hugo, l’écrivain',
  role: 'quiz',
  sprite: 'writer',
  dialogue: [
    {
      do: [
        { say: 'Bonjour {player} ! Je suis l’écrivain du village. Je te dicte un mot : touche « Écouter l’énigme », puis écris-le. 2 {ws:coin} s’il est juste !' },
        {
          ask: 'Une dictée ?',
          choices: [
            {
              label: 'Oui',
              do: [
                {
                  quiz: { id: 'writer', subject: 'dictee', count: 1 },
                  perCorrect: { give: 'coin', count: 2 },
                  success: [{ say: 'Parfait, aucune faute !' }],
                  failure: [{ say: 'L’orthographe, ça s’apprend petit à petit. Reviens plus tard !' }],
                },
              ],
            },
            { label: 'Plus tard', do: [{ say: 'Ma plume t’attend.' }] },
          ],
        },
      ],
    },
  ],
};

// Jardinière : donne des fleurs si on réussit 2 questions sur 3.
const GARDENER = {
  type: 'npc',
  name: 'Rose, la jardinière',
  role: 'quiz',
  involved: ['bouquet'],
  sprite: 'gardener',
  dialogue: [
    {
      when: [{ quest: 'bouquet', status: 'active' }, { not: { item: 'flowers' } }, { not: 'bouquet_made' }],
      do: [
        { say: 'Des {w:flowers} pour Léon ? Mes {w:flowers} se méritent !' },
        {
          ask: 'Réponds juste à 2 questions sur 3 et elles sont à toi. Prêt ?',
          choices: [
            {
              label: 'Oui',
              do: [
                {
                  quiz: { id: 'gardener', count: 3, pass: 2 },
                  success: [{ say: 'Bravo ! Voici mes plus belles {w:flowers}.' }, { give: 'flowers', announce: true }],
                  failure: [{ say: 'Presque ! Reviens essayer quand tu veux.' }],
                },
              ],
            },
            { label: 'Pas encore', do: [{ say: 'Prends ton temps.' }] },
          ],
        },
      ],
    },
    { do: [{ say: 'Mon jardin est le plus beau du village. Ne coupe pas mes fleurs, hein !' }] },
  ],
};

// Marchand : le magasin (dans la maison en haut, au centre du village).
const SELLER = {
  type: 'npc',
  name: 'Victor, le marchand',
  role: 'shop',
  sprite: 'seller',
  dialogue: [
    {
      do: [
        { say: 'Bienvenue au magasin, {player} ! Choisis un article, puis la quantité avec Gauche / Droite.' },
        {
          shop: {
            id: 'village',
            title: 'Magasin du village',
            offers: [
              { item: 'apple', price: 2 },
              { item: 'cake', price: 6 },
              { item: 'ribbon', price: 5 },
              { item: 'nails', price: 10 },
              { item: 'hint', price: 15 },
              { item: 'potion', price: 20 },
              { item: 'heart_container', price: 60, once: true },
              { item: 'big_bag', price: 100, once: true },
            ],
          },
        },
      ],
    },
  ],
};

// Léon : la quête du bouquet, en 5 étapes.
const LEON = {
  type: 'npc',
  name: 'Léon, le timide',
  role: 'quest',
  gives: ['bouquet'],
  sprite: 'leon',
  dialogue: [
    {
      when: { quest: 'bouquet', status: 'none' },
      do: [
        { say: 'Psst... J’aimerais offrir un bouquet à la cuisinière, mais je suis bien trop timide.' },
        {
          ask: 'Tu veux bien m’aider ?\nQuête « Un bouquet pour la cuisinière » : {level:bouquet}',
          choices: [
            { label: 'Oui', do: [{ startQuest: 'bouquet' }, { say: 'Merci ! Il me faut des {w:flowers} de la jardinière et un ruban du marchand.' }] },
            { label: 'Non', do: [{ say: 'Oh... tant pis.' }] },
          ],
        },
      ],
    },
    {
      when: { quest: 'bouquet', step: 2 },
      do: [{ say: 'Tu as tout ! Je noue le ruban... Voilà ! Peux-tu l’offrir à la cuisinière de ma part ?' }, { take: 'flowers' }, { take: 'ribbon' }, { give: 'bouquet', announce: true }, { setFlag: 'bouquet_made' }],
    },
    { when: { quest: 'bouquet', step: 3 }, do: [{ say: 'Alors ? Tu lui as donné ? J’ai le trac !' }] },
    {
      when: { quest: 'bouquet', step: 4 },
      do: [{ say: ['Elle accepte ?! Un pique-nique avec elle !', 'Merci, merci ! Tiens, c’est pour toi.'] }, { setFlag: 'bouquet_thanked' }],
    },
    { when: { quest: 'bouquet', status: 'active' }, do: [{ say: 'Il me faut des {w:flowers} de la jardinière et un ruban du marchand.' }] },
    { do: [{ say: 'Demain, pique-nique ! Je suis tellement content.' }] },
  ],
};

const blob = { type: 'enemy', kind: 'blob', sprite: 'blob', hp: 2, speed: 22, behavior: 'wander' };
const flyer = { type: 'enemy', kind: 'flyer', sprite: 'flyer', hp: 1, speed: 38, behavior: 'chase', sight: 70 };

// ----------------------------------------------------------------- CARTES
export const MAPS = {
  overworld: {
    name: 'Le village',
    level: 'village',
    // Façade du magasin (toit, bas de toit, vitrines) et roche de la grotte : apparence selon l'ambiance.
    legend: { a: 'awning', e: 'roof_eave', w: 'shopfront', k: 'cliff' },
    camera: 'follow', // défilement libre à l'extérieur
    rows: [
      '########################################',
      '#..........,...........,....~~~~~~~~~~.#',
      '#.####.....aaaa.............~~~~~~~~~~.#',
      '#.####..N..eeee..bbb.........~~~~~~~~..#',
      '#.####.....wwQw..bnb.......Y...~~~~....#',
      '#....A.....M..Z..b.b...................#',
      '#==P===========================......c.#',
      '#......=..............,..........m.....#',
      '#..S...=..G.......E....................#',
      '#......=.......................F.......#',
      '#..,.H.=...........bb.......,..........#',
      '#......=...........bb..................#',
      '#..K...=.......ooooooo..J......E.......#',
      '#....O.=.......o.....o.................#',
      '#......=.......o..m..o..W..bbb.........#',
      '#..E...=.......o.....o.....bcb.........#',
      '#......=.......ooogooo.........kkkkkk..#',
      '#......=....L.U...............kkkkkkkk.#',
      '#......=.......=..............kkkkkkkk.#',
      '#......=========..............kkkDkkkk.#',
      '#.........................~~~~~~~X~~~~~#',
      '#..,......E.................======.T...#',
      '#.......................h....R....,....#',
      '########################################',
    ],
    objects: {
      A: ELDER,
      M: COOK,
      N: LEON,
      J: GARDENER,
      K: TEACHER,
      O: WRITER,
      H: HISTORIAN,
      Y: FISHER,
      R: CARPENTER,
      X: { type: 'tileswitch', tile: 'bridge_broken', to: 'bridge', when: 'bridge_built' },
      Q: { type: 'warp', tile: 'shop_entrance', to: 'shop', at: [7, 9], facing: 'up' },
      W: { type: 'pet', name: '{w:pet}', text: ['Il a l’air perdu... et il te suit déjà partout !', 'Ton nouveau compagnon trouvera parfois des indices pour toi.'] },
      Z: { type: 'sign', text: 'MAGASIN — tout pour l’aventure !' },
      G: GUARD,
      S: { type: 'sign', text: ['Bienvenue au village !', 'Au-dessus des habitants : « ! » doré = une quête à prendre, « ? » = quête en cours, livre bleu = énigmes, « € » = magasin.', 'Le bouton Quêtes, en haut, liste tes quêtes et leur difficulté.'] },
      U: { type: 'sign', text: 'Jardin fermé. Le levier ouvre la grille : frappe-le avec ton arme !' },
      T: { type: 'sign', text: 'Danger : {w:cave}, au-delà du pont. Les monstres y rôdent.' },
      m: { type: 'pickup', item: 'mushroom' },
      n: { type: 'pickup', item: 'mushroom', hidden: true, tile: 'bush' },
      c: { type: 'pickup', item: 'coin', count: 5 },
      h: { type: 'pickup', item: 'heart' },
      E: blob,
      F: flyer,
      L: { type: 'lever', flag: 'garden_open' },
      g: { type: 'gate', openWhen: { flag: 'garden_open' } },
      D: { type: 'warp', tile: 'cave_mouth', to: 'cave', at: [7, 20], facing: 'up' },
    },
  },

  shop: {
    name: 'Le magasin',
    level: 'village', // fait partie du niveau « village »
    camera: 'rooms',
    // Étagères garnies (o), comptoir (c) : on parle au marchand par-dessus le comptoir.
    legend: { '#': 'shop_wall', _: 'shop_floor', o: 'shelf', c: 'counter' },
    rows: [
      '################',
      '#oooooo##oooooo#',
      '#______V_______#',
      '#__cccccccccc__#',
      '#______________#',
      '#_oo________oo_#',
      '#_oo________oo_#',
      '#______________#',
      '#_o__________o_#',
      '#______________#',
      '#######D########',
    ],
    objects: {
      V: { ...SELLER, tile: 'shop_floor' },
      D: { type: 'warp', tile: 'shop_door', to: 'overworld', at: [13, 5], facing: 'down' },
    },
  },

  cave: {
    name: 'Les souterrains',
    level: 'souterrains',
    // Grotte en pierres : murs, sol rocheux, rochers (o), torches (t).
    legend: { '#': 'cave_wall', _: 'cave_floor', o: 'cave_rock', t: 'cave_torch' },
    camera: 'rooms', // salles fixes dans le donjon
    rows: [
      '####t#####t##########t#####t####',
      '#______________##______________#',
      '#_o__________o_##__F________F__#',
      '#______________##______________#',
      '#______________##______________#',
      '#______A________L______C_______#',
      '#__________Z___##______________#',
      '#______________##___E______E___#',
      '#_o__________o_##______________#',
      '#______________##______________#',
      '#######################_########',
      '####t#####t#########t##G###t####',
      '#______________##______________#',
      '#______________##______________#',
      '#______________##______p_______#',
      '#__E___________##______________#',
      '#____________________B_________#',
      '#______________##______________#',
      '#____E_________##___o_____o____#',
      '#______________##_____________h#',
      '#______________##______________#',
      '#######D########################',
    ],
    objects: {
      E: { ...blob, tile: 'cave_floor' },
      F: { ...flyer, tile: 'cave_floor' },
      B: { type: 'block', tile: 'cave_floor' },
      p: { type: 'plate', flag: 'cave_plate', tile: 'cave_floor' },
      G: { type: 'gate', openWhen: { flag: 'cave_plate' }, tile: 'cave_floor' },
      L: { type: 'locked', key: 'key', tile: 'cave_floor' },
      C: { type: 'chest', item: 'key', appearWhen: { flag: 'cave_hall_cleared' }, tile: 'cave_floor' },
      A: { type: 'chest', item: 'amulet', appearWhen: 'boss_defeated', tile: 'cave_floor' },
      // Boss : combat + questions. Vaincu, il fait apparaître le coffre de la relique.
      Z: { type: 'boss', name: '{w:boss}', hp: 6, flag: 'boss_defeated', tile: 'cave_floor' },
      h: { type: 'pickup', item: 'heart', tile: 'cave_floor' },
      D: { type: 'warp', tile: 'cave_exit', to: 'overworld', at: [33, 20], facing: 'down' },
    },
    // Vaincre tous les monstres de la salle en haut à droite fait apparaître le coffre à clé.
    roomClear: [{ room: [1, 0], flag: 'cave_hall_cleared' }],
  },
};
