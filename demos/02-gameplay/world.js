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
};

// ----------------------------------------------------------------- QUÊTES
export const QUESTS = [
  {
    id: 'relic',
    kind: 'main',
    title: 'La relique perdue',
    steps: [
      { goal: 'Explorer {w:cave} au sud-est', done: { item: 'amulet' } },
      { goal: 'Retourner voir {w:elder}', done: { flag: 'relic_returned' } },
    ],
    rewards: [{ maxHp: 2 }, { toast: 'Ta vie maximale augmente !' }],
  },
  {
    id: 'harvest',
    kind: 'side',
    title: 'La recette de la cuisinière',
    steps: [
      { goal: 'Trouver 3 {ws:mushroom} ({item:mushroom}/3)', done: { item: 'mushroom', count: 3 } },
      { goal: 'Les apporter à la cuisinière', done: { flag: 'harvest_given' } },
    ],
  },
  {
    id: 'hunt',
    kind: 'side',
    title: 'Nettoyer les champs',
    steps: [
      { goal: 'Vaincre 3 {ws:blob} ({counter:kills_blob}/3)', done: { counter: 'kills_blob', gte: 3 } },
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
    rewards: [{ give: 'coin', count: 25 }, { give: 'potion' }, { toast: 'Récompense : 25 {ws:coin} + {w:potion}' }],
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
            { label: 'Oui', do: [{ startQuest: 'relic' }, { say: "Merci ! L'entrée est au sud-est, derrière les rochers. Sois prudent." }] },
            { label: 'Pas maintenant', do: [{ say: 'Je comprends... Reviens me voir si tu changes d’avis.' }] },
          ],
        },
      ],
    },
    {
      when: [{ quest: 'relic', status: 'active' }, { item: 'amulet' }],
      do: [{ say: ['Tu as réussi ! Mon {w:amulet} !', 'Je n’ai rien de plus précieux à t’offrir que ma bénédiction...'] }, { take: 'amulet' }, { setFlag: 'relic_returned' }],
    },
    { when: { quest: 'relic', status: 'active' }, do: [{ say: "L'entrée est au sud-est. Dans les souterrains, observe bien chaque salle : il y a souvent un mécanisme." }] },
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
      do: [{ say: 'Parfait, les voilà ! Voici ta récompense.' }, { take: 'mushroom', count: 3 }, { setFlag: 'harvest_given' }, { give: 'coin', count: 30, announce: true }],
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
    { when: { quest: 'hunt', step: 1 }, do: [{ say: 'Beau travail !' }, { setFlag: 'hunt_reported' }, { give: 'coin', count: 20, announce: true }] },
    { when: { quest: 'hunt', status: 'active' }, do: [{ say: 'Encore un effort : {counter:kills_blob} sur 3.' }] },
    { do: [{ say: 'Les champs sont calmes grâce à toi.' }] },
  ],
};

// Maîtresse : questions à volonté, 2 pièces par bonne réponse (source d'argent).
const quizChoice = (label, subject) => ({
  label,
  do: [
    {
      quiz: { subject, count: 3 },
      perCorrect: { give: 'coin', count: 2 },
      success: [{ say: 'Trois sur trois, bravo !' }],
      failure: [{ say: 'Continue de t’entraîner, tu vas progresser !' }],
    },
  ],
});
const TEACHER = {
  type: 'npc',
  name: 'Maîtresse',
  sprite: 'teacher',
  dialogue: [
    {
      do: [
        { say: 'Bonjour ! Chaque bonne réponse à mes questions te rapporte 2 {ws:coin}.' },
        {
          ask: 'Quelle matière choisis-tu ?',
          choices: [
            quizChoice('Mathématiques', 'maths'),
            quizChoice('Français', 'francais'),
            quizChoice('Histoire', 'histoire'),
            quizChoice('Géographie', 'geographie'),
            quizChoice('Sciences', 'sciences'),
            { label: 'Plus tard', do: [{ say: 'À bientôt !' }] },
          ],
        },
      ],
    },
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
                  quiz: { count: 3, pass: 2 },
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
      '#.####.....####..bnb...........~~~~....#',
      '#....A.....M.....b.b...................#',
      '#==P===========================......c.#',
      '#......=..............,..........m.....#',
      '#..S...=..G..V....E....................#',
      '#......=.......................F.......#',
      '#..,...=...........bb.......,..........#',
      '#......=...........bb..................#',
      '#..K...=.......ooooooo..J......E.......#',
      '#......=.......o.....o.................#',
      '#......=.......o..m..o.....bbb.........#',
      '#..E...=.......o.....o.....bcb.........#',
      '#......=.......ooogooo.........######..#',
      '#......=....L.U...............########.#',
      '#......=.......=..............########.#',
      '#......=========..............###D####.#',
      '#...........................h..T.=.....#',
      '#..,......E.................======.....#',
      '#.................................,....#',
      '########################################',
    ],
    objects: {
      A: ELDER,
      M: COOK,
      N: LEON,
      V: SELLER,
      J: GARDENER,
      K: TEACHER,
      G: GUARD,
      S: { type: 'sign', text: ['Bienvenue au village !', 'Parle aux habitants (Action) pour obtenir des quêtes. Entrée ouvre le menu et le journal des quêtes.'] },
      U: { type: 'sign', text: 'Jardin fermé. Le levier ouvre la grille : frappe-le avec ton arme !' },
      T: { type: 'sign', text: 'Danger : {w:cave}. Les monstres y rôdent.' },
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
