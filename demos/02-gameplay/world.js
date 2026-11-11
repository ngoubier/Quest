// CONTENU de l'essai n°2 : uniquement des DONNÉES (cartes, objets, quêtes, dialogues).
// Toute la logique vient de gameplay/ et engine/.
// Les {w:...} sont remplacés par le vocabulaire de l'ambiance (rubis / crédits / euros...).

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

export const ITEMS = {
  coin: { icon: 'coin', word: 'coin', max: 999, sound: 'coin' },
  key: { icon: 'key', word: 'key', max: 9 },
  amulet: { icon: 'amulet', word: 'amulet' },
  mushroom: { icon: 'mushroom', word: 'mushroom', max: 9 },
  heart: { icon: 'heart', instant: (adv) => adv.state.heal(2), sound: 'heal' },
  potion: { icon: 'potion', word: 'potion', name: 'Potion', max: 3 },
  heart_container: { icon: 'heart_container', name: 'Cœur supplémentaire', instant: (adv) => adv.state.setMaxHp(adv.state.maxHp + 2, true), sound: 'heal' },
  flowers: { icon: 'flowers', word: 'flowers', name: 'Fleurs', max: 1 },
  ribbon: { icon: 'ribbon', name: 'Ruban', max: 1 },
  bouquet: { icon: 'bouquet', name: 'Bouquet', max: 1 },
  planks: { icon: 'planks', name: 'Planches', max: 1 },
  nails: { icon: 'nails', name: 'Clous', max: 1 },
  tarte: { icon: 'tarte', name: 'Tarte', max: 1 },
  hint: { icon: 'hint', name: 'Indice', plural: 'Indices', max: 99, sound: 'secret' },
};

// ----------------------------------------------------------------- QUÊTES
export const QUESTS = [
  {
    id: 'relic',
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
        hints: ['Dans la salle de droite, pousse le bloc sur la dalle : la grille s’ouvrira.', 'Vaincs tous les monstres de la salle du haut : un coffre apparaîtra, avec une clé.'],
      },
      { goal: 'Retourner voir {w:elder}', done: { flag: 'relic_returned' }, hints: ['{w:elder} habite en haut à gauche du village.'] },
    ],
    rewards: [{ maxHp: 2 }, { toast: 'Ta vie maximale augmente !' }],
  },
  // Quête OBLIGATOIRE qui ouvre le monde : réparer le pont (fabrication + troc + embranchement).
  {
    id: 'bridge',
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
        hints: ['Le marchand est au village. Pour gagner des {ws:coin}, réponds aux questions de la maîtresse.'],
      },
      { goal: 'Apporter planches et clous au charpentier', done: 'bridge_built', hints: ['Le charpentier attend au bord de la rivière, au sud.'] },
    ],
    rewards: [{ toast: 'Le pont est réparé !' }],
  },
  {
    id: 'harvest',
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
  name: 'Ancien',
  sprite: 'elder',
  dialogue: [
    {
      when: { quest: 'relic', status: 'none' },
      do: [
        { say: 'Un monstre a emporté mon {w:amulet} et l’a cachée au fond de {w:cave}...' },
        {
          ask: 'Peux-tu m’aider ?',
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
  name: 'Cuisinière',
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
          ask: 'Il me manque 3 {ws:mushroom} pour ma recette. Tu veux bien m’en trouver ?',
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
      do: [{ say: 'Une tarte ? Il me faut d’abord 3 {ws:mushroom} !' }, { startQuest: 'harvest' }],
    },
    { when: { quest: 'harvest', status: 'active' }, do: [{ say: 'Tu en as {item:mushroom} sur 3. Pense à couper les buissons !' }] },
    { do: [{ say: 'Ma recette est un succès. Merci encore !' }] },
  ],
};

const GUARD = {
  type: 'npc',
  name: 'Garde',
  sprite: 'guard',
  dialogue: [
    {
      when: { quest: 'hunt', status: 'none' },
      do: [
        {
          ask: 'Des {ws:blob} envahissent les champs. Tu peux en éliminer 3 ?',
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
const TEACHER = {
  type: 'npc',
  name: 'Maîtresse',
  sprite: 'teacher',
  dialogue: [
    diploma(5, 'diploma_1', 'Élève curieux', [{ give: 'hint', announce: true }]),
    diploma(15, 'diploma_2', 'Élève brillant', [{ give: 'hint', count: 2, announce: true }]),
    diploma(30, 'diploma_3', 'Petit génie', [{ give: 'heart_container', announce: true }]),
    {
      do: [
        { say: 'Bonjour ! Chaque bonne réponse à mes questions te rapporte 2 {ws:coin}.' },
        {
          ask: 'On commence ?',
          choices: [
            {
              label: 'Oui',
              do: [
                {
                  quiz: { id: 'teacher', count: 3, cooldown: 45, retryPrice: 3 },
                  perCorrect: { give: 'coin', count: 2 },
                  success: [{ say: 'Trois sur trois, bravo !' }],
                  failure: [{ say: 'Continue de t’entraîner ! Reviens un peu plus tard pour une nouvelle série.' }],
                },
              ],
            },
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
  name: 'Historien',
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
  name: 'Pêcheur',
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
  name: 'Charpentier',
  sprite: 'carpenter',
  dialogue: [
    {
      when: { quest: 'bridge', status: 'none' },
      do: [{ say: ['Le pont vers {w:cave} s’est effondré !', 'Pour le réparer, il me faut des planches et des clous.'] }, { startQuest: 'bridge' }],
    },
    {
      when: [{ item: 'planks' }, { item: 'nails' }, { not: 'bridge_built' }],
      do: [{ say: 'Parfait ! Un peu de patience... Voilà, le pont est comme neuf !' }, { take: 'planks' }, { take: 'nails' }, { setFlag: 'bridge_built' }],
    },
    { when: { quest: 'bridge', status: 'active' }, do: [{ say: 'Il me faut des planches ({item:planks}/1) et des clous ({item:nails}/1).' }] },
    { do: [{ say: 'Mon pont tiendra cent ans !' }] },
  ],
};

// Jardinière : donne des fleurs si on réussit 2 questions sur 3.
const GARDENER = {
  type: 'npc',
  name: 'Jardinière',
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

// Marchand : boutique.
const SELLER = {
  type: 'npc',
  name: 'Marchand',
  sprite: 'seller',
  dialogue: [
    {
      do: [
        { say: 'Bienvenue ! Gagne des {ws:coin} en répondant aux questions de la maîtresse, puis reviens me voir.' },
        {
          shop: {
            id: 'village',
            title: 'Boutique du village',
            offers: [
              { item: 'ribbon', price: 5 },
              { item: 'nails', price: 10 },
              { item: 'hint', price: 15 },
              { item: 'potion', price: 20 },
              { item: 'heart_container', price: 60, once: true },
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
  name: 'Léon',
  sprite: 'leon',
  dialogue: [
    {
      when: { quest: 'bouquet', status: 'none' },
      do: [
        { say: 'Psst... J’aimerais offrir un bouquet à la cuisinière, mais je suis bien trop timide.' },
        {
          ask: 'Tu veux bien m’aider ?',
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
    camera: 'follow', // défilement libre à l'extérieur
    rows: [
      '########################################',
      '#..........,...........,....~~~~~~~~~~.#',
      '#.####.....####.............~~~~~~~~~~.#',
      '#.####..N..####..bbb.........~~~~~~~~..#',
      '#.####.....####..bnb.......Y...~~~~....#',
      '#....A.....M.....b.b...................#',
      '#==P===========================......c.#',
      '#......=..............,..........m.....#',
      '#..S...=..G..V....E....................#',
      '#......=.......................F.......#',
      '#..,.H.=...........bb.......,..........#',
      '#......=...........bb..................#',
      '#..K...=.......ooooooo..J......E.......#',
      '#......=.......o.....o.................#',
      '#......=.......o..m..o.....bbb.........#',
      '#..E...=.......o.....o.....bcb.........#',
      '#......=.......ooogooo.........######..#',
      '#......=....L.U...............########.#',
      '#......=.......=..............########.#',
      '#......=========..............###D####.#',
      '#.........................~~~~~~~X~~~~~#',
      '#..,......E.................======.T...#',
      '#.......................h....R....,....#',
      '########################################',
    ],
    objects: {
      A: ELDER,
      M: COOK,
      N: LEON,
      V: SELLER,
      J: GARDENER,
      K: TEACHER,
      H: HISTORIAN,
      Y: FISHER,
      R: CARPENTER,
      X: { type: 'tileswitch', tile: 'water', to: 'path', when: 'bridge_built' },
      G: GUARD,
      S: { type: 'sign', text: ['Bienvenue au village !', 'Parle aux habitants (Action) pour obtenir des quêtes. Entrée ouvre le menu et le journal des quêtes.'] },
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
      D: { type: 'warp', tile: 'door', to: 'cave', at: [7, 20], facing: 'up' },
    },
  },

  cave: {
    name: 'Les souterrains',
    level: 'souterrains',
    camera: 'rooms', // salles fixes dans le donjon
    rows: [
      '################################',
      '#______________##______________#',
      '#_o__________o_##__F________F__#',
      '#______________##______________#',
      '#______________##______________#',
      '#______A________L______C_______#',
      '#______________##______________#',
      '#______________##___E______E___#',
      '#_o__________o_##______________#',
      '#______________##______________#',
      '#######################_########',
      '#######################G########',
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
      E: { ...blob, tile: 'floor_in' },
      F: { ...flyer, tile: 'floor_in' },
      B: { type: 'block', tile: 'floor_in' },
      p: { type: 'plate', flag: 'cave_plate', tile: 'floor_in' },
      G: { type: 'gate', openWhen: { flag: 'cave_plate' }, tile: 'floor_in' },
      L: { type: 'locked', key: 'key', tile: 'floor_in' },
      C: { type: 'chest', item: 'key', appearWhen: { flag: 'cave_hall_cleared' }, tile: 'floor_in' },
      A: { type: 'chest', item: 'amulet', tile: 'floor_in' },
      h: { type: 'pickup', item: 'heart', tile: 'floor_in' },
      D: { type: 'warp', tile: 'door', to: 'overworld', at: [33, 20], facing: 'down' },
    },
    // Vaincre tous les monstres de la salle en haut à droite fait apparaître le coffre à clé.
    roomClear: [{ room: [1, 0], flag: 'cave_hall_cleared' }],
  },
};
