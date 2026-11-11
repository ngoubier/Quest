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
    title: 'La recette de la marchande',
    steps: [
      { goal: 'Trouver 3 {ws:mushroom} ({item:mushroom}/3)', done: { item: 'mushroom', count: 3 } },
      { goal: 'Les apporter à la marchande', done: { flag: 'harvest_given' } },
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

const MERCHANT = {
  type: 'npc',
  name: 'Marchande',
  sprite: 'merchant',
  dialogue: [
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
            { label: 'Oui', do: [{ setCounter: 'kills_blob', value: 0 }, { startQuest: 'hunt' }, { say: 'Bien ! Utilise ton arme : bouton Action quand rien n’est devant toi.' }] },
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

const blob = { type: 'enemy', kind: 'blob', sprite: 'blob', hp: 2, speed: 22, behavior: 'wander' };
const flyer = { type: 'enemy', kind: 'flyer', sprite: 'flyer', hp: 1, speed: 38, behavior: 'chase', sight: 70 };

// ----------------------------------------------------------------- CARTES
export const MAPS = {
  overworld: {
    name: 'Le village',
    camera: 'follow', // défilement libre à l'extérieur
    rows: [
      '########################################',
      '#..........,...........,....~~~~~~~~~~.#',
      '#.####.....####.............~~~~~~~~~~.#',
      '#.####.....####..bbb.........~~~~~~~~..#',
      '#.####.....####..bnb...........~~~~....#',
      '#....A.....M.....b.b...................#',
      '#==P===========================......c.#',
      '#......=..............,..........m.....#',
      '#..S...=..G.......E....................#',
      '#......=.......................F.......#',
      '#..,...=...........bb.......,..........#',
      '#......=...........bb..................#',
      '#......=.......ooooooo.........E.......#',
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
      M: MERCHANT,
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
