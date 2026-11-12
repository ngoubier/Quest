// LA QUÊTE D'ALIA — niveau 3 : LA FORÊT DES MURMURES (Pierre de Sève).
// Une rivière à traverser avec des rondins, un bois qui tourne en rond (suivre les champignons
// rouges), deux cibles à toucher à l'arc pour entrer dans le Grand Chêne (3 étages), et
// Ronce-Noire, l'arbre corrompu, à la cime. Nouvel objet : l'arc. Mini-jeu : Memory.
// Uniquement des DONNÉES : la logique vient de gameplay/ et engine/.

const healUse = (n, label) => (adv) => {
  if (adv.state.hp >= adv.state.maxHp) return (adv.toast('Ta vie est déjà pleine.'), false);
  adv.state.heal(n);
  adv.game.audio.play('heal');
  return label;
};

export const SEVE_ITEMS = {
  bow: {
    icon: 'bow',
    name: 'arc',
    description: 'Tire une flèche (touche E ou bouton X). Touche les cibles et les monstres de loin.',
    quest: true,
    tool: (adv, hero) => hero.shoot('arrow', { speed: 210, range: 190, cooldown: 0.4, sound: 'arrow' }),
  },
  egg: { icon: 'egg', name: 'œuf de chouette', plural: 'œufs de chouette', description: 'Un œuf de Hulotte. Attention, c’est fragile !', max: 3, quest: true },
  firewood: { icon: 'firewood', name: 'bûche', plural: 'bûches', description: 'Pour le feu de Sylvain le bûcheron.', max: 5, quest: true },
  honey: { icon: 'honey', name: 'pot de miel', plural: 'pots de miel', description: 'Rend 2 cœurs. Tout doux !', max: 5, use: healUse(4, 'Miam, du miel ! +2 cœurs.') },
};

// Drapeaux du niveau
const TARGETS = ['sv_target_1', 'sv_target_2'];
// Le passage de rondins est fait quand la case du haut de la rivière (5,13) est comblée.
const LOGS_DONE = 'fill:seve:5,13';

export const SEVE_QUESTS = [
  {
    id: 'seve',
    difficulty: 2,
    kind: 'main',
    title: 'La Pierre de Sève',
    steps: [
      {
        goal: 'Traverser la rivière à l’ouest, avec les rondins',
        done: LOGS_DONE,
        hints: [
          'Pousse un rondin dans la rivière : il coule et fait un passage. Il en faut deux, l’un derrière l’autre.',
          'Pousse d’abord le rondin de gauche vers le haut. Amène ensuite l’autre juste en dessous, puis pousse-le vers le haut lui aussi.',
        ],
      },
      {
        goal: 'Trouver l’arc, au bout du bois qui tourne en rond',
        done: { item: 'bow' },
        hints: ['Le bois est tout au nord-ouest. Dans le bois, suis les champignons rouges !', 'Un chemin se trompe ? Tu reviens au début. Regarde de quel côté sont les champignons rouges.'],
      },
      {
        goal: 'Toucher les 2 cibles devant le Grand Chêne',
        done: TARGETS,
        hints: ['Les cibles sont sur des îlots, dans les étangs de chaque côté du Grand Chêne. Tire une flèche avec le bouton Objet (touche E).'],
      },
      {
        goal: 'Vaincre Ronce-Noire, à la cime du Grand Chêne',
        done: 'ronce_defeated',
        hints: [
          'Dans les racines : touche la cible avec une flèche pour ouvrir les ronces devant l’échelle.',
          'Dans le tronc : une cible fait descendre la nacelle au-dessus du trou. Vise-la depuis l’autre bord !',
          'Contre Ronce-Noire : une flèche dans ses yeux, une bonne réponse, puis frappe vite à l’épée !',
        ],
      },
      { goal: 'Prendre la Pierre de Sève dans le coffre', done: { item: 'stone_seve' } },
    ],
    rewards: [{ maxHp: 2 }, { toast: 'La Forêt des Murmures retrouve ses couleurs ! Ta vie maximale augmente.' }],
  },
  {
    id: 'eggs',
    difficulty: 2,
    kind: 'side',
    title: 'Les œufs de Hulotte',
    steps: [
      {
        goal: 'Retrouver les 3 œufs de Hulotte ({item:egg}/3)',
        done: { item: 'egg', count: 3 },
        hints: ['Un œuf est au nord-est, au-delà du Grand Chêne. Un autre est au bout du bois qui tourne en rond.', 'Le dernier a roulé jusque dans les racines du Grand Chêne.'],
      },
      { goal: 'Les rapporter à Hulotte', done: { flag: 'eggs_given' } },
    ],
  },
  {
    id: 'firewood',
    difficulty: 1,
    kind: 'side',
    title: 'Les 5 bûches de Sylvain',
    steps: [
      {
        goal: 'Trouver 5 bûches ({item:firewood}/5)',
        done: { item: 'firewood', count: 5 },
        hints: ['Les bûches sont cachées dans des buissons : coupe-les avec l’épée !', 'Quatre buissons au sud de la rivière, et un au nord-ouest, près du bois.'],
      },
      { goal: 'Les rapporter à Sylvain', done: { flag: 'firewood_given' } },
    ],
  },
];

// ----------------------------------------------------------------- habitants
const DRUID = {
  type: 'npc',
  name: 'Mère Sylve, la gardienne',
  role: 'quest',
  gives: ['seve'],
  sprite: 'druid',
  dialogue: [
    {
      when: { quest: 'seve', status: 'none' },
      do: [
        {
          say: [
            'Bienvenue dans la Forêt des Murmures, {player}. Écoute... les arbres ont peur.',
            'Ronce-Noire, un arbre ensorcelé par Morgor, a pris la cime du Grand Chêne. La Pierre de Sève y est cachée.',
            'Pour entrer dans le Grand Chêne, il faut toucher les deux cibles près de ses étangs. Avec un arc !',
            'Le vieil arc des gardiens est au bout du bois qui tourne en rond, au nord-ouest, de l’autre côté de la rivière.',
          ],
        },
        { startQuest: 'seve' },
        { say: 'Il n’y a pas de pont à l’ouest. Mais Sylvain a laissé des rondins au bord de l’eau...' },
      ],
    },
    { when: { item: 'stone_seve' }, do: [{ say: 'La Pierre de Sève ! Entends-tu ? Les arbres chantent à nouveau. Merci, {player} !' }] },
    { when: { quest: 'seve', step: 0 }, do: [{ say: 'Pousse les rondins dans la rivière, à l’ouest : ils feront un passage.' }] },
    { when: { quest: 'seve', step: 1 }, do: [{ say: 'Dans le bois qui tourne en rond, suis les champignons rouges. Sinon, tu reviendras au début !' }] },
    { when: { quest: 'seve', step: 2 }, do: [{ say: 'Tu as l’arc ! Touche E (ou bouton X) pour tirer. Les cibles sont sur les îlots, près du Grand Chêne.' }] },
    { do: [{ say: 'Ronce-Noire cache ses yeux sous ses ronces. Vise ses yeux avec l’arc, puis frappe son cœur.' }] },
  ],
};

const WOODCUTTER = {
  type: 'npc',
  name: 'Sylvain, le bûcheron',
  role: 'quest',
  gives: ['firewood'],
  sprite: 'woodcutter',
  dialogue: [
    {
      when: { quest: 'firewood', status: 'none' },
      do: [
        {
          ask: 'Les écureuils ont caché mes bûches dans les buissons ! Tu m’en rapportes 5 ?\nQuête : {level:firewood}',
          choices: [
            { label: 'Oui', do: [{ startQuest: 'firewood' }, { say: 'Merci ! Un coup d’épée dans un buisson, et hop, on voit ce qu’il cache.' }] },
            { label: 'Non', do: [{ say: 'Tant pis. Ce soir, pas de feu de camp...' }] },
          ],
        },
      ],
    },
    {
      when: { quest: 'firewood', step: 1 },
      do: [
        { say: 'Mes 5 bûches ! Ce soir, on fera un grand feu. Voilà pour toi.' },
        { take: 'firewood', count: 5 },
        { setFlag: 'firewood_given' },
        { give: 'coin', count: 25, announce: true },
        { give: 'hint', count: 2, announce: true },
      ],
    },
    { when: { quest: 'firewood', status: 'active' }, do: [{ say: 'Tu en as {item:firewood} sur 5. Coupe les buissons !' }] },
    { when: { quest: 'seve', step: 0 }, do: [{ say: 'Mes rondins, au bord de la rivière ? Pousse-les dans l’eau, ils flotteront bien serrés.' }] },
    { do: [{ say: 'Dans ma cabane, Noisette vend du miel. C’est le meilleur du royaume !' }] },
  ],
};

const OWL = {
  type: 'npc',
  name: 'Hulotte, la chouette',
  role: 'quiz',
  gives: ['eggs'],
  sprite: 'owl',
  dialogue: [
    {
      when: { quest: 'eggs', status: 'none' },
      do: [
        {
          ask: 'Hou hou ! Les monstres ont fait tomber mes 3 œufs de mon nid. Tu veux bien les retrouver ?\nQuête : {level:eggs}',
          choices: [
            { label: 'Oui', do: [{ startQuest: 'eggs' }, { say: 'Merci ! Un au nord-est, un au bout du bois qui tourne en rond... et un tout au fond du Grand Chêne.' }] },
            { label: 'Non', do: [{ say: 'Hou... Je les chercherai moi-même.' }] },
          ],
        },
      ],
    },
    {
      when: { quest: 'eggs', step: 1 },
      do: [
        { say: 'Mes trois œufs ! Ils sont tout chauds. Merci, merci ! Prends ceci.' },
        { take: 'egg', count: 3 },
        { setFlag: 'eggs_given' },
        { give: 'coin', count: 10, announce: true },
        { give: 'heart_container', announce: true },
      ],
    },
    {
      do: [
        { say: 'Hou hou ! Je joue au Memory des animaux. Retourne deux cartes : si elles sont pareilles, tu gardes la paire et tu rejoues.' },
        {
          ask: 'Une partie ? Celui qui a le plus de paires gagne.',
          choices: [
            {
              label: 'Oui',
              do: [
                {
                  minigame: 'memory',
                  win: [
                    {
                      if: { counter: 'game_memory_win', gte: 6 },
                      then: [{ say: 'Encore gagné ! Quelle mémoire !' }],
                      else: [{ say: 'Bravo ! Voici 4 {ws:coin}.' }, { give: 'coin', count: 4, announce: true }],
                    },
                  ],
                  lose: [{ say: 'Hou hou, j’ai gagné ! Une astuce : retiens bien où sont les cartes déjà vues.' }],
                  draw: [{ say: 'Égalité ! On est aussi malins l’un que l’autre.' }],
                  quit: [{ say: 'À plus tard !' }],
                },
              ],
            },
            { label: 'Non', do: [{ say: 'Hou !' }] },
          ],
        },
      ],
    },
  ],
};

// L'ermite : des questions à volonté, 2 pièces par bonne réponse.
const HERMIT = {
  type: 'npc',
  name: 'Basile, l’ermite',
  role: 'quiz',
  sprite: 'scholar',
  dialogue: [
    {
      do: [
        { say: 'Je vis dans cette forêt depuis toujours, et j’apprends encore ! Mes questions : 2 {ws:coin} par bonne réponse.' },
        {
          ask: 'On essaie ?',
          choices: [
            {
              label: 'Oui',
              do: [
                {
                  quiz: { id: 'ermite', count: 3, retryPrice: 5 },
                  perCorrect: { give: 'coin', count: 2 },
                  success: [{ say: 'Trois sur trois ! Tu as l’œil de la chouette.' }],
                  failure: [{ say: 'Pas mal. Reviens un peu plus tard pour une nouvelle série.' }],
                },
              ],
            },
            { label: 'Plus tard', do: [{ say: 'La forêt t’attendra.' }] },
          ],
        },
      ],
    },
  ],
};

const SELLER = {
  type: 'npc',
  name: 'Noisette, la marchande',
  role: 'shop',
  sprite: 'seller',
  tile: 'shop_floor',
  dialogue: [
    {
      do: [
        { say: 'Bienvenue dans la cabane ! Du bon miel de la forêt ?' },
        {
          shop: {
            id: 'seve',
            title: 'La cabane de Noisette',
            offers: [
              { item: 'honey', price: 4 },
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

const boar = { type: 'enemy', kind: 'boar', sprite: 'boar', hp: 3, speed: 24, behavior: 'charger', sight: 96 };
const wasp = { type: 'enemy', kind: 'wasp', sprite: 'wasp', hp: 1, speed: 46, behavior: 'chase', sight: 80 };
const squirrel = { type: 'enemy', kind: 'squirrel', sprite: 'squirrel', hp: 2, speed: 16, behavior: 'shooter', shot: 'acorn', sight: 90 };
const shroom = { type: 'enemy', kind: 'shroom', sprite: 'shroom', hp: 2, speed: 30, behavior: 'hopper', sight: 80 };
const on = (o, tile) => ({ ...o, tile });

// ----------------------------------------------------------------- le bois qui tourne en rond
// 3 clairières qui se ressemblent. La bonne sortie est celle où mènent les champignons rouges (m) ;
// une mauvaise sortie ramène au début du bois.
const WOODS_LEGEND = { '.': 'floor', ',': 'floor_alt', T: 'forest_tree', m: 'red_mushroom' };
const LOST = 'Tu tournes en rond... Suis les champignons rouges !';
const back = { type: 'warp', tile: 'floor', to: 'seve_bois1', at: [7, 9], facing: 'up', message: LOST };
const woods = (name, rows, exits) => ({
  name: 'Le bois qui tourne en rond',
  level: 'seve',
  region: 'seve',
  camera: 'rooms',
  legend: WOODS_LEGEND,
  rows,
  objects: { N: back, W: back, E: back, S: back, u: on(shroom, 'floor'), ...exits },
});

// ----------------------------------------------------------------- cartes
export const SEVE_MAPS = {
  seve: {
    name: 'La Forêt des Murmures',
    level: 'seve',
    region: 'seve',
    worldExit: true,
    camera: 'follow',
    legend: {
      '.': 'floor', ',': 'floor_alt', '=': 'path', T: 'forest_tree', '~': 'river', B: 'bridge', '@': 'oak_bark', m: 'red_mushroom',
      b: 'bush', a: 'awning', e: 'roof_eave', w: 'cabin_wall', P: { tile: 'path', marker: 'start' },
    },
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'TTTTTLTTTTTTTTTT@@@@@@@@TTTTTTTTTTTTTTTT',
      'TT,.....fTTT~~~T@@@@@@@@T~~~TT..b...,.TT',
      'T..b.....TTT~1~.@@@@@@@@.~2~TT.......F.T',
      'T.E....m.TTT~~~.@@@@@@@@.~~~.....q.....T',
      'T.....b..TTT....@@@D@@@@......T...g...bT',
      'TT..m....TTT.......G..........TT.......T',
      'T...J....TTT,..u.......=......TTT..u...T',
      'T.b......TTT...........=...,...TT.....bT',
      'T.....,..TTT..TT.......=.......h....,..T',
      'Tm...E...TTT..T........=...b...........T',
      'T......b.TTT....F......=.........TT.c..T',
      'T..m.....TTT.....,.....=.........TT....T',
      'T~~~~~~~~~~~~~~~~~~~~~~B~~~~~~~~~~~~~~~T',
      'T~~~~~~~~~~~~~~~~~~~~~~B~~~~~~~~~~~~~~~T',
      'TTTTT.TTTX.....b.......=......E......b.T',
      'T....R..Y........aaaa..=..........,....T',
      'T.........b......eeee..=....bb.....u...T',
      'T..f..,..........wwdw..=....bf...K.....T',
      'T....b..........S....W.=.O.......=====.T',
      'T..E......f.,.......=====.........=..b.T',
      'T.........b....h....=......Z..c...=....T',
      'T...f.......E.......==============P....T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTVTTTTT',
    ],
    objects: {
      V: { type: 'warp', tile: 'path', worldMap: true, back: [34, 22] },
      L: { type: 'warp', tile: 'floor', to: 'seve_bois1', at: [7, 9], facing: 'up' },
      D: { type: 'warp', tile: 'oak_door', to: 'seve_chene', at: [7, 31], facing: 'up' },
      d: { type: 'warp', tile: 'door', to: 'seve_shop', at: [7, 9], facing: 'up' },
      // Ronces devant la porte du Grand Chêne : elles s'ouvrent quand les 2 cibles sont touchées.
      G: { type: 'gate', tile: 'floor', sprite: 'bramble', openWhen: TARGETS },
      1: { type: 'target', tile: 'floor', flag: TARGETS[0] },
      2: { type: 'target', tile: 'floor', flag: TARGETS[1] },
      // Rondins : poussés dans la rivière, ils coulent et font un passage.
      R: { type: 'block', tile: 'floor', sink: true, sprite: 'log' },
      Y: { type: 'block', tile: 'floor', sink: true, sprite: 'log' },
      S: DRUID,
      W: WOODCUTTER,
      O: OWL,
      K: HERMIT,
      f: { type: 'pickup', item: 'firewood', hidden: true, tile: 'bush' },
      g: { type: 'pickup', item: 'egg' },
      Z: { type: 'sign', text: ['LA FORÊT DES MURMURES. Au nord, de l’autre côté du pont : le Grand Chêne.', 'Au sud : la route du royaume. Ici : la cabane du bûcheron.'] },
      X: { type: 'sign', text: ['Pas de pont ici. Pousse les rondins dans la rivière !', 'Un rondin coincé ? Sors de la forêt et reviens : il reprend sa place.'] },
      J: { type: 'sign', text: 'LE BOIS QUI TOURNE EN ROND. Qui ne suit pas les champignons rouges revient toujours au même endroit...' },
      E: on(boar, 'floor'),
      F: on(wasp, 'floor'),
      q: on(squirrel, 'floor'),
      u: on(shroom, 'floor'),
      h: { type: 'pickup', item: 'heart' },
      c: { type: 'pickup', item: 'coin', count: 5 },
    },
  },

  seve_shop: {
    name: 'La cabane de Noisette',
    level: 'seve',
    region: 'seve',
    camera: 'rooms',
    legend: { '#': 'shop_wall', _: 'shop_floor', o: 'shelf', c: 'counter' },
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
      D: { type: 'warp', tile: 'shop_door', to: 'seve', at: [19, 19], facing: 'down' },
    },
  },

  // Le bois qui tourne en rond : nord, puis ouest, puis nord.
  seve_bois1: woods(
    'bois1',
    [
      'TTTTTTTNNTTTTTTT',
      'TT..T...m..T..TT',
      'T..T........T..T',
      'T.......Tm.....T',
      'T..T.......T...T',
      'W.....u.m......E',
      'T...T.......T..T',
      'T.T.....m...T..T',
      'T.....T....T...T',
      'TT............TT',
      'TTTTTTTSSTTTTTTT',
    ],
    {
      N: { type: 'warp', tile: 'floor', to: 'seve_bois2', at: [7, 9], facing: 'up' },
      S: { type: 'warp', tile: 'floor', to: 'seve', at: [5, 2], facing: 'down' },
    },
  ),
  seve_bois2: woods(
    'bois2',
    [
      'TTTTTTTNNTTTTTTT',
      'TT..T......T..TT',
      'T..T........T..T',
      'T.......T......T',
      'T.mT.......T...T',
      'W..m...........E',
      'T...Tm...u..T..T',
      'T.T....m....T..T',
      'T.....T....T...T',
      'TT............TT',
      'TTTTTTTSSTTTTTTT',
    ],
    { W: { type: 'warp', tile: 'floor', to: 'seve_bois3', at: [14, 5], facing: 'left' } },
  ),
  seve_bois3: woods(
    'bois3',
    [
      'TTTTTTTNNTTTTTTT',
      'TT..T...m..T..TT',
      'T..T.....m..T..T',
      'T.......T..m...T',
      'T..T.......T.m.T',
      'W..............E',
      'T...T..u....T..T',
      'T.T.........T..T',
      'T.....T....T...T',
      'TT............TT',
      'TTTTTTTSSTTTTTTT',
    ],
    { N: { type: 'warp', tile: 'floor', to: 'seve_clairiere', at: [7, 9], facing: 'up' } },
  ),
  seve_clairiere: {
    name: 'La clairière de l’arc',
    level: 'seve',
    region: 'seve',
    camera: 'rooms',
    legend: WOODS_LEGEND,
    rows: [
      'TTTTTTTTTTTTTTTT',
      'TTT....TT....TTT',
      'TT............TT',
      'T...,......,...T',
      'T......C.......T',
      'T..g...........T',
      'T.....,....h...T',
      'T..............T',
      'TT....m..m....TT',
      'TTT...........TT',
      'TTTTTTTSSTTTTTTT',
    ],
    objects: {
      C: { type: 'chest', tile: 'floor', item: 'bow' },
      g: { type: 'pickup', tile: 'floor', item: 'egg' },
      h: { type: 'pickup', tile: 'floor', item: 'heart' },
      S: { type: 'warp', tile: 'floor', to: 'seve', at: [5, 2], facing: 'down' },
    },
  },

  // Le Grand Chêne : 3 étages de 2 salles. En bas les racines, au milieu le tronc, en haut la cime.
  seve_chene: {
    name: 'Le Grand Chêne',
    level: 'seve_chene',
    region: 'seve',
    camera: 'rooms',
    legend: { '#': 'oak_wall', '%': 'leaf_wall', _: 'oak_floor', O: 'oak_hole' },
    rows: [
      '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%',
      '%______________%%______________%',
      '%__h___________%%______A_______%',
      '%______________%%______________%',
      '%______________%%______________%',
      '%______________________R_______%',
      '%______________%%______________%',
      '%______________%%__________h___%',
      '%__N___________%%______________%',
      '%______________%%______________%',
      '%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%',
      '################################',
      '#________OO____##__________#V#_#',
      '#________OO_2__##___E______#L#_#',
      '#________OO____##______________#',
      '#________OO____##__F___________#',
      '#________xx____________________#',
      '#________OO____##______________#',
      '#________OO____##_______K______#',
      '#__T_____OO____##____u_________#',
      '#__n_____OO____##______h_______#',
      '################################',
      '################################',
      '#_#U#___OOO_1__##______________#',
      '#__G____OOO____##__F_______g___#',
      '#_______OOO____##______________#',
      '#_______OOO____##______________#',
      '#____u_______________u_________#',
      '#______________##______________#',
      '#_Q____________##_______F______#',
      '#______________##__h___________#',
      '#______________##______________#',
      '#######D########################',
    ],
    objects: {
      D: { type: 'warp', tile: 'oak_door', to: 'seve', at: [19, 6], facing: 'down' },
      // Racines : la cible ouvre les ronces devant l'échelle.
      1: { type: 'target', tile: 'oak_floor', flag: 'sv_roots_target' },
      G: { type: 'gate', tile: 'oak_floor', sprite: 'bramble', openWhen: 'sv_roots_target' },
      U: { type: 'warp', tile: 'ladder_up', to: 'seve_chene', at: [4, 20], facing: 'right' },
      Q: { type: 'sign', tile: 'oak_floor', text: ['Les racines du Grand Chêne. Une cible, des ronces... Tu sais quoi faire !', 'Une échelle mène au tronc, puis à la cime.'] },
      g: { type: 'pickup', tile: 'oak_floor', item: 'egg' },
      // Tronc : la cible fait descendre la nacelle au-dessus du trou.
      2: { type: 'target', tile: 'oak_floor', flag: 'sv_lift' },
      x: { type: 'tileswitch', tile: 'oak_hole', to: 'branch_bridge', when: 'sv_lift' },
      T: { type: 'sign', tile: 'oak_floor', text: ['La nacelle du bûcheron est en haut, au-dessus du trou.', 'Touche la cible, de l’autre côté, pour la faire descendre !'] },
      n: { type: 'warp', tile: 'ladder_down', to: 'seve_chene', at: [3, 24], facing: 'down' },
      V: { type: 'warp', tile: 'ladder_up', to: 'seve_chene', at: [4, 8], facing: 'right' },
      K: { type: 'chest', item: 'key', appearWhen: { flag: 'sv_trunk_cleared' }, tile: 'oak_floor' },
      L: { type: 'locked', key: 'key', tile: 'oak_floor' },
      // Cime : Ronce-Noire.
      N: { type: 'warp', tile: 'ladder_down', to: 'seve_chene', at: [28, 13], facing: 'down' },
      R: {
        type: 'boss',
        name: 'Ronce-Noire',
        sprite: 'ronce',
        hp: 6,
        flag: 'ronce_defeated',
        meltWith: 'arrow',
        shots: 'thorn',
        still: true,
        shieldText: '« Aïe, mon œil ! Mes ronces s’écartent... mais elles ne s’ouvriront que si tu réponds juste ! »',
        resistText: 'Ses ronces arrêtent l’épée. Vise ses yeux avec l’arc !',
        defeatedText: 'Ronce-Noire est vaincue ! Le Grand Chêne refleurit.',
        tile: 'oak_floor',
      },
      A: { type: 'chest', item: 'stone_seve', appearWhen: 'ronce_defeated', tile: 'oak_floor' },
      E: on(boar, 'oak_floor'),
      F: on(wasp, 'oak_floor'),
      u: on(shroom, 'oak_floor'),
      h: { type: 'pickup', item: 'heart', tile: 'oak_floor' },
    },
    roomClear: [{ room: [1, 1], flag: 'sv_trunk_cleared' }],
  },
};
