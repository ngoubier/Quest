// LA QUÊTE D'ALIA — niveau 2 : LE MONT GIVRÉ (Pierre de Givre).
// Hameau d'igloos, lac gelé où l'on glisse, temple de glace gardé par le Yéti.
// Nouvel objet : le bâton de feu (bouton Objet). Mini-jeu : Le dernier glaçon.
// Uniquement des DONNÉES : la logique vient de gameplay/ et engine/.

const healUse = (n, label) => (adv) => {
  if (adv.state.hp >= adv.state.maxHp) return (adv.toast('Ta vie est déjà pleine.'), false);
  adv.state.heal(n);
  adv.game.audio.play('heal');
  return label;
};

export const GIVRE_ITEMS = {
  fire_staff: {
    icon: 'fire_staff',
    name: 'bâton de feu',
    description: 'Lance une flammèche (touche E ou bouton X). Fait fondre la glace, allume les braseros.',
    quest: true,
    tool: (adv, hero) => hero.shoot('fire'),
  },
  wool: { icon: 'wool', name: 'pelote de laine', plural: 'pelotes de laine', description: 'Pour le tricot de Mamie Flocon.', max: 3, quest: true },
  choco: { icon: 'choco', name: 'chocolat chaud', plural: 'chocolats chauds', description: 'Rend 2 cœurs. Ça réchauffe !', max: 5, use: healUse(4, 'Mmm, ça réchauffe ! +2 cœurs.') },
};

const BRAZIERS = ['gv_brazier_1', 'gv_brazier_2', 'gv_brazier_3', 'gv_brazier_4'];

export const GIVRE_QUESTS = [
  {
    id: 'givre',
    difficulty: 2,
    kind: 'main',
    title: 'La Pierre de Givre',
    steps: [
      {
        goal: 'Trouver le bâton de feu, dans le coffre du lac gelé',
        done: { item: 'fire_staff' },
        hints: [
          'Sur la glace, on glisse tout droit jusqu’au prochain obstacle. Le lac est à l’est du hameau.',
          'Entre sur le lac par le haut, tout à gauche : tu t’arrêtes contre un rocher. Glisse alors vers la droite, puis regarde en bas.',
        ],
      },
      {
        goal: 'Allumer les 4 braseros devant le temple de glace',
        done: BRAZIERS,
        hints: ['Le temple est tout au nord. Vise un brasero et lance une flammèche avec le bouton Objet (touche E).'],
      },
      {
        goal: 'Vaincre le Yéti, au fond du temple',
        done: 'yeti_defeated',
        hints: [
          'Un mur de glace barre le passage ? Fais-le fondre avec le bâton de feu.',
          'Le bloc de glace glisse jusqu’à un obstacle : pousse-le vers le haut, puis vers la droite, jusqu’à la dalle.',
          'Contre le Yéti : une flammèche sur sa carapace, une bonne réponse, puis frappe vite à l’épée !',
        ],
      },
      { goal: 'Prendre la Pierre de Givre dans le coffre', done: { item: 'stone_givre' } },
    ],
    rewards: [{ maxHp: 2 }, { toast: 'Le Mont Givré retrouve ses couleurs ! Ta vie maximale augmente.' }],
  },
  {
    id: 'wool',
    difficulty: 1,
    kind: 'side',
    title: 'Les pelotes de Mamie Flocon',
    steps: [
      {
        goal: 'Retrouver 3 pelotes de laine ({item:wool}/3)',
        done: { item: 'wool', count: 3 },
        hints: ['Une pelote a roulé sur le lac gelé. Une autre est tout au sud-est.', 'La dernière est dans une niche, au nord-ouest, derrière un mur de glace : il faut du feu.'],
      },
      { goal: 'Les rapporter à Mamie Flocon', done: { flag: 'wool_given' } },
    ],
  },
];

// ----------------------------------------------------------------- habitants
const CHIEF = {
  type: 'npc',
  name: 'Nanouk, le chef du hameau',
  role: 'quest',
  gives: ['givre'],
  sprite: 'inuit',
  tile: 'snow',
  dialogue: [
    {
      when: { quest: 'givre', status: 'none' },
      do: [
        {
          say: [
            'Bienvenue au Mont Givré, {player}. Tu cherches la Pierre de Givre ? Elle est dans le temple de glace, tout au nord.',
            'Mais le Yéti Grondeur, un monstre de Morgor, s’y est installé. Et la porte ne s’ouvre que si les 4 braseros sont allumés.',
            'Il te faut du feu. Autrefois, on gardait un bâton de feu dans un coffre, au milieu du lac gelé, à l’est.',
          ],
        },
        { startQuest: 'givre' },
        { say: 'Attention : sur la glace, on glisse tout droit jusqu’au prochain obstacle !' },
      ],
    },
    { when: { item: 'stone_givre' }, do: [{ say: 'La Pierre de Givre ! Regarde, la neige brille à nouveau. Merci, {player} !' }] },
    { when: { quest: 'givre', step: 0 }, do: [{ say: 'Le lac gelé est à l’est. Réfléchis avant de glisser : chaque rocher peut t’arrêter au bon endroit.' }] },
    { when: { quest: 'givre', step: 1 }, do: [{ say: 'Tu as le bâton de feu ! Touche E (ou bouton X) pour lancer une flammèche. Allume les 4 braseros, au nord.' }] },
    { do: [{ say: 'Le temple est ouvert. Le Yéti a une carapace de glace : seule une flammèche peut la faire fondre.' }] },
  ],
};

const GRANNY = {
  type: 'npc',
  name: 'Mamie Flocon',
  role: 'quest',
  gives: ['wool'],
  sprite: 'granny',
  tile: 'snow',
  dialogue: [
    {
      when: { quest: 'wool', status: 'none' },
      do: [
        {
          ask: 'Le vent a emporté mes 3 pelotes de laine ! Tu veux bien les retrouver ?\nQuête : {level:wool}',
          choices: [
            { label: 'Oui', do: [{ startQuest: 'wool' }, { say: 'Merci mon petit ! Elles sont rouges, tu les verras bien sur la neige.' }] },
            { label: 'Non', do: [{ say: 'Brr... Sans laine, pas d’écharpe.' }] },
          ],
        },
      ],
    },
    {
      when: { quest: 'wool', step: 1 },
      do: [
        { say: 'Mes pelotes ! Je vais pouvoir tricoter. Tiens, c’est pour toi.' },
        { take: 'wool', count: 3 },
        { setFlag: 'wool_given' },
        { give: 'coin', count: 20, announce: true },
        { give: 'heart_container', announce: true },
      ],
    },
    { when: { quest: 'wool', status: 'active' }, do: [{ say: 'Tu en as {item:wool} sur 3. Cherche bien : sur le lac, au sud-est, et dans une niche au nord-ouest.' }] },
    { do: [{ say: 'Je te tricote une belle écharpe pour ton voyage.' }] },
  ],
};

const PINGO = {
  type: 'npc',
  name: 'Pingo, le pingouin',
  role: 'quiz',
  sprite: 'pingo',
  tile: 'snow',
  dialogue: [
    {
      do: [
        { say: 'Coin coin ! Je joue au « dernier glaçon ». On prend 1, 2 ou 3 glaçons chacun son tour. Celui qui prend le dernier a perdu !' },
        {
          ask: 'Une partie ? Tu commences.',
          choices: [
            {
              label: 'Oui',
              do: [
                {
                  minigame: 'glacon',
                  win: [
                    {
                      if: { counter: 'game_glacon_win', gte: 6 },
                      then: [{ say: 'Encore gagné ! Tu as trouvé mon secret, on dirait...' }],
                      else: [{ say: 'Bien joué ! Voici 4 {ws:coin}.' }, { give: 'coin', count: 4, announce: true }],
                    },
                  ],
                  lose: [{ say: 'Gagné ! Un indice : essaie de me laisser 5 glaçons...' }],
                  quit: [{ say: 'À plus tard !' }],
                },
              ],
            },
            { label: 'Non', do: [{ say: 'Coin !' }] },
          ],
        },
      ],
    },
  ],
};

// Le savant : des questions à volonté, 2 pièces par bonne réponse.
const SAVANT = {
  type: 'npc',
  name: 'Igor, le savant',
  role: 'quiz',
  sprite: 'scholar',
  tile: 'snow',
  dialogue: [
    {
      do: [
        { say: 'J’étudie la neige depuis 40 ans ! Réponds à mes questions : 2 {ws:coin} par bonne réponse.' },
        {
          ask: 'On essaie ?',
          choices: [
            {
              label: 'Oui',
              do: [
                {
                  quiz: { id: 'savant', count: 3, retryPrice: 5 },
                  perCorrect: { give: 'coin', count: 2 },
                  success: [{ say: 'Trois sur trois ! Tu as l’esprit vif comme le vent du nord.' }],
                  failure: [{ say: 'Pas mal. Reviens un peu plus tard pour une nouvelle série.' }],
                },
              ],
            },
            { label: 'Plus tard', do: [{ say: 'La science attendra.' }] },
          ],
        },
      ],
    },
  ],
};

const SELLER = {
  type: 'npc',
  name: 'Anouchka, la marchande',
  role: 'shop',
  sprite: 'seller',
  tile: 'igloo_floor',
  dialogue: [
    {
      do: [
        { say: 'Entre vite, il fait froid dehors ! Un bon chocolat chaud ?' },
        {
          shop: {
            id: 'givre',
            title: 'L’igloo d’Anouchka',
            offers: [
              { item: 'choco', price: 4 },
              { item: 'apple', price: 2 },
              { item: 'hint', price: 15 },
              { item: 'potion', price: 20 },
              { item: 'heart_container', price: 80, once: true },
            ],
          },
        },
      ],
    },
  ],
};

const snowman = { type: 'enemy', kind: 'snowman', sprite: 'snowman', hp: 2, speed: 14, behavior: 'shooter', shot: 'snowball', sight: 84 };
const wolf = { type: 'enemy', kind: 'wolf', sprite: 'wolf', hp: 2, speed: 44, behavior: 'chase', sight: 80 };
const penguin = { type: 'enemy', kind: 'penguin', sprite: 'penguin', hp: 1, speed: 26, behavior: 'charger', sight: 100 };
const on = (o, tile) => ({ ...o, tile });

// ----------------------------------------------------------------- cartes
export const GIVRE_MAPS = {
  givre: {
    name: 'Le Mont Givré',
    level: 'givre',
    region: 'givre',
    worldExit: true,
    camera: 'follow',
    legend: {
      '.': 'snow', ',': 'snow_alt', '=': 'snow_path', '^': 'peak', T: 'pine', i: 'ice', '~': 'ice_water', o: 'ice_pillar',
      H: 'igloo', r: 'igloo_roof', I: 'ice_brick', P: { tile: 'snow_path', marker: 'start' },
    },
    rows: [
      '^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      '^^^^^^^^^^^^^^IIIIIIIIIIII^^^^^^^^^^^^^^',
      '^^^^^T.....^^^IIIIIIIIIIII^^........^^^^',
      '^^w.x...T..^^^IIIIIDIIIIII^^......T....^',
      '^^^^^.,...F........G..........E........^',
      '^................1.=.2.....T...,.......^',
      '^.T....E.T..,......=....T........h..T..^',
      '^................3.=.4.................^',
      '^............T.....=......iiiiiiiiiii..^',
      '^..rrrr............=......iiiiioiiiii..^',
      '^..HHHH.....K..T...=..,...oiiiiioiiiiT.^',
      '^..HdHH.M..........=......ioiiiCiioii..^',
      '^....===============......iiiiiiiiiii..^',
      '^.TZ..........,....=....L.iiiiiooiiwi..^',
      '^.........rrr......=......iiiiiiiiiii..^',
      '^..rrr....HHH......=..........=........^',
      '^..HHH....HHH......============......T.^',
      '^..HHH.............=...Q...............^',
      '^......N.......T...=........F....E.....^',
      '^.........,.E....A.=...T..........,....^',
      '^...~~~~~~.........=.S....T.........w..^',
      '^...~~~~~~.h.T.....P........,.c..T.Q...^',
      '^......................................^',
      '^^^^^^^^^^^^^^^^^^^V^^^^^^^^^^^^^^^^^^^^',
    ],
    objects: {
      V: { type: 'warp', tile: 'snow_path', worldMap: true, back: [19, 22] },
      d: { type: 'warp', tile: 'igloo_door', to: 'givre_shop', at: [7, 9], facing: 'up' },
      D: { type: 'warp', tile: 'temple_door', to: 'givre_temple', at: [7, 20], facing: 'up' },
      G: { type: 'gate', tile: 'snow_path', openWhen: BRAZIERS },
      1: { type: 'brazier', tile: 'snow', flag: BRAZIERS[0] },
      2: { type: 'brazier', tile: 'snow', flag: BRAZIERS[1] },
      3: { type: 'brazier', tile: 'snow', flag: BRAZIERS[2] },
      4: { type: 'brazier', tile: 'snow', flag: BRAZIERS[3] },
      A: CHIEF,
      M: GRANNY,
      N: PINGO,
      K: SAVANT,
      C: { type: 'chest', tile: 'ice', item: 'fire_staff' },
      w: { type: 'pickup', tile: 'snow', item: 'wool' },
      x: { type: 'icewall', tile: 'snow' },
      S: { type: 'sign', tile: 'snow', text: ['LE MONT GIVRÉ. Au nord : le temple de glace. À l’ouest : le hameau. À l’est : le lac gelé.', 'Au sud : la route du royaume.'] },
      L: { type: 'sign', tile: 'snow', text: 'LAC GELÉ. Attention, ça glisse ! On ne s’arrête que contre un obstacle.' },
      Z: { type: 'sign', tile: 'snow', text: 'Igloo d’Anouchka : chocolat chaud et provisions.' },
      E: on(snowman, 'snow'),
      F: on(wolf, 'snow'),
      Q: on(penguin, 'snow'),
      h: { type: 'pickup', tile: 'snow', item: 'heart' },
      c: { type: 'pickup', tile: 'snow', item: 'coin', count: 5 },
    },
  },

  givre_shop: {
    name: 'L’igloo d’Anouchka',
    level: 'givre',
    region: 'givre',
    camera: 'rooms',
    legend: { '#': 'igloo_inwall', _: 'igloo_floor', o: 'shelf', c: 'counter' },
    rows: [
      '################',
      '#oooooo##oooooo#',
      '#______W_______#',
      '#__cccccccccc__#',
      '#______________#',
      '#_oo________oo_#',
      '#______________#',
      '#______________#',
      '#_o__________o_#',
      '#______________#',
      '#######D########',
    ],
    objects: {
      W: SELLER,
      D: { type: 'warp', tile: 'shop_door', to: 'givre', at: [4, 12], facing: 'down' },
    },
  },

  givre_temple: {
    name: 'Le temple de glace',
    level: 'givre_temple',
    region: 'givre',
    camera: 'rooms',
    legend: { '#': 'ice_brick', _: 'ice_floor', o: 'ice_pillar' },
    rows: [
      '################################',
      '#______________##______________#',
      '#_o__________o_##__F________E__#',
      '#______________##______________#',
      '#______________##______________#',
      '#______A________L______C_______#',
      '#__________Y___##______________#',
      '#______________##___E______Q___#',
      '#_o__________o_##______________#',
      '#______________##______________#',
      '#######################_########',
      '#######################G########',
      '#______________##___o__________#',
      '#______________##_________po___#',
      '#__E___________##______________#',
      '#______________##______________#',
      '#______________x_______________#',
      '#__________h___##______________#',
      '#____Q_________##___B__________#',
      '#______________##_S__________h_#',
      '#______________##______________#',
      '#######D########################',
    ],
    objects: {
      E: on(snowman, 'ice_floor'),
      F: on(wolf, 'ice_floor'),
      Q: on(penguin, 'ice_floor'),
      x: { type: 'icewall', tile: 'ice_floor' },
      // Bloc de glace : il glisse jusqu'au prochain obstacle. La dalle ouvre la grille du nord.
      B: { type: 'block', tile: 'ice_floor', slide: true, sprite: 'ice_block' },
      p: { type: 'plate', tile: 'ice_floor', flag: 'gv_plate' },
      G: { type: 'gate', tile: 'ice_floor', openWhen: { flag: 'gv_plate' } },
      S: { type: 'sign', tile: 'ice_floor', text: ['Le bloc de glace glisse jusqu’au prochain obstacle. Amène-le sur la dalle.', 'Bloqué ? Sors du temple et reviens : le bloc reprend sa place.'] },
      L: { type: 'locked', key: 'key', tile: 'ice_floor' },
      C: { type: 'chest', item: 'key', appearWhen: { flag: 'gv_hall_cleared' }, tile: 'ice_floor' },
      // Le Yéti : carapace de glace (flammèche), question, puis coups d'épée. Il lance des boules de neige.
      Y: { type: 'boss', name: 'le Yéti Grondeur', sprite: 'yeti', hp: 6, flag: 'yeti_defeated', meltWith: 'fire', shots: 'snowball', tile: 'ice_floor' },
      A: { type: 'chest', item: 'stone_givre', appearWhen: 'yeti_defeated', tile: 'ice_floor' },
      h: { type: 'pickup', item: 'heart', tile: 'ice_floor' },
      D: { type: 'warp', tile: 'temple_door', to: 'givre', at: [19, 5], facing: 'down' },
    },
    roomClear: [{ room: [1, 0], flag: 'gv_hall_cleared' }],
  },
};
