// LA QUÊTE D'ALIA — niveau 5 : LE LABYRINTHE DES MILLE PORTES (Pierre du Temps).
// Devant l'entrée, une cour : Chronos le gardien, la boutique de Lulu (plan, bombes) et Gnomo
// (Code secret). Dans le labyrinthe : le sac de bombes, des murs fissurés, des blocs bleus et rouges
// (interrupteurs cristal), des dalles qui s'effondrent au-dessus des trous, des portes à horloge,
// des piques et des lance-flèches, puis la porte de bronze et le Minotaure.
// Nouvel objet : les bombes. Mini-jeu : Code secret.
// Uniquement des DONNÉES : la logique vient de gameplay/ et engine/.

import { MiniMapScene } from '../../gameplay/ui/MiniMapScene.js';

export const TEMPS_ITEMS = {
  bomb: {
    icon: 'bomb_0',
    name: 'bombe',
    plural: 'bombes',
    description: 'Pose une bombe (touche E ou bouton X). Elle ouvre les murs fissurés. Recule !',
    max: 20,
    quest: true,
    showCount: true,
    tool: (adv, hero) => hero.placeBomb(),
  },
  key_bronze: { icon: 'key', name: 'clé de bronze', description: 'Elle ouvre la porte du Minotaure.', max: 1, quest: true },
  hourglass: { icon: 'hourglass', name: 'sablier', plural: 'sabliers', description: 'Un sablier de Lulu, caché derrière un mur fissuré.', max: 3, quest: true },
  maze_map: {
    icon: 'maze_map',
    name: 'plan du labyrinthe',
    description: 'Montre tout le labyrinthe (Utiliser, dans le sac).',
    quest: true,
    use: (adv) => (adv.mapDef.level === 'temps' ? adv.game.scenes.push(new MiniMapScene(adv, { title: 'Plan du labyrinthe' })) : adv.toast('Ce plan ne sert que dans le labyrinthe.'), false),
  },
};

export const TEMPS_QUESTS = [
  {
    id: 'temps',
    difficulty: 3,
    kind: 'main',
    title: 'La Pierre du Temps',
    steps: [
      {
        goal: 'Trouver le sac de bombes, dans la première galerie (à gauche)',
        done: { item: 'bomb' },
        hints: ['Entre dans le labyrinthe et va tout à gauche de la première galerie. Attention aux squelettes !'],
      },
      {
        goal: 'Trouver la clé de bronze',
        done: { item: 'key_bronze' },
        hints: [
          'Un mur fissuré, au bout de la galerie, à droite : pose une bombe devant (touche E) et recule !',
          'Les blocs rouges et bleus montent et descendent quand on frappe un cristal. Frappe le premier, passe, puis frappe le second.',
          'Les dalles craquelées s’effondrent derrière toi : ne t’arrête pas !',
        ],
      },
      {
        goal: 'Ouvrir la porte de bronze et vaincre le Minotaure',
        done: 'minotaur_defeated',
        hints: [
          'Les portes à horloge s’ouvrent et se ferment chacune leur tour. Attends le bon moment (elles clignotent avant de changer).',
          'Le Minotaure fonce tout droit jusqu’au mur. Écarte-toi : quand il se cogne, il est sonné. Frappe-le vite !',
        ],
      },
      { goal: 'Prendre la Pierre du Temps dans le coffre', done: { item: 'stone_temps' } },
    ],
    rewards: [{ maxHp: 2 }, { toast: 'Le Labyrinthe retrouve ses couleurs ! Ta vie maximale augmente.' }],
  },
  {
    id: 'sabliers',
    difficulty: 2,
    kind: 'side',
    title: 'Les 3 sabliers de Lulu',
    steps: [
      {
        goal: 'Retrouver 3 sabliers ({item:hourglass}/3)',
        done: { item: 'hourglass', count: 3 },
        hints: ['Ils sont tous derrière des murs fissurés : il faut des bombes.', 'Un dans la première galerie, un près des trous, un près des portes à horloge. Le plan du labyrinthe les montre en gris clair.'],
      },
      { goal: 'Les rapporter à Lulu', done: { flag: 'sabliers_given' } },
    ],
  },
];

// ----------------------------------------------------------------- habitants
const CHRONOS = {
  type: 'npc',
  name: 'Chronos, le gardien du temps',
  role: 'quest',
  gives: ['temps'],
  sprite: 'chronos',
  tile: 'floor',
  dialogue: [
    {
      when: { quest: 'temps', status: 'none' },
      do: [
        {
          say: [
            'Bienvenue devant le Labyrinthe des Mille Portes, {player}. Tic, tac... Ici, le temps ne tourne plus rond.',
            'Le Minotaure de bronze, un serviteur de Morgor, garde la Pierre du Temps tout au fond.',
            'Pour l’atteindre, il te faudra des bombes. Le sac de bombes est dans la première galerie, à gauche.',
          ],
        },
        { startQuest: 'temps' },
        { say: 'Lulu vend un plan du labyrinthe. Et Gnomo adore les codes secrets.' },
      ],
    },
    { when: { item: 'stone_temps' }, do: [{ say: 'La Pierre du Temps ! Écoute : les horloges repartent. Merci, {player} !' }] },
    { when: { quest: 'temps', step: 0 }, do: [{ say: 'Le sac de bombes est dans la première galerie, tout à gauche.' }] },
    { when: { quest: 'temps', step: 1 }, do: [{ say: 'Un mur fissuré ? Une bombe ! Pose-la (touche E) et recule vite. La clé de bronze est plus loin.' }] },
    { do: [{ say: 'Le Minotaure fonce toujours tout droit. Laisse-le se cogner au mur...' }] },
  ],
};

const LULU = {
  type: 'npc',
  name: 'Lulu, la marchande',
  role: 'shop',
  gives: ['sabliers'],
  sprite: 'lulu',
  tile: 'floor',
  dialogue: [
    {
      when: { quest: 'sabliers', step: 1 },
      do: [
        { say: 'Mes 3 sabliers ! Le temps peut reprendre son cours. Tiens, pour toi !' },
        { take: 'hourglass', count: 3 },
        { setFlag: 'sabliers_given' },
        { give: 'coin', count: 10, announce: true },
        { give: 'heart_container', announce: true },
      ],
    },
    {
      when: { quest: 'sabliers', status: 'none' },
      do: [
        {
          ask: 'Le Minotaure a caché mes 3 sabliers derrière des murs fissurés ! Tu les cherches ?\nQuête : {level:sabliers}',
          choices: [
            { label: 'Oui', do: [{ startQuest: 'sabliers' }, { say: 'Merci ! Il te faudra des bombes. J’en vends, si tu en manques.' }] },
            { label: 'Non', do: [{ say: 'D’accord. Mais le temps presse...' }] },
          ],
        },
      ],
    },
    {
      do: [
        { say: 'Bienvenue à la boutique de Lulu ! Tout pour survivre au labyrinthe.' },
        {
          shop: {
            id: 'temps',
            title: 'La boutique de Lulu',
            offers: [
              { item: 'maze_map', price: 10, once: true },
              { item: 'bomb', price: 2 },
              { item: 'apple', price: 2 },
              { item: 'hint', price: 15 },
              { item: 'potion', price: 20 },
            ],
          },
        },
      ],
    },
  ],
};

const GNOMO = {
  type: 'npc',
  name: 'Gnomo, le gnome',
  role: 'quiz',
  sprite: 'gnome',
  tile: 'floor',
  dialogue: [
    {
      do: [
        { say: 'Hé hé ! J’ai caché 3 couleurs. Devine-les ! Après chaque essai, je te dis : vert = bonne couleur à la bonne place, jaune = bonne couleur mal placée.' },
        {
          ask: 'Tu as 8 essais. On joue ?',
          choices: [
            {
              label: 'Oui',
              do: [
                {
                  minigame: 'code',
                  win: [
                    {
                      if: { counter: 'game_code_win', gte: 6 },
                      then: [{ say: 'Encore trouvé ! Tu lis dans mes pensées ?' }],
                      else: [{ say: 'Bravo, détective ! Voici 5 {ws:coin}.' }, { give: 'coin', count: 5, announce: true }],
                    },
                  ],
                  lose: [{ say: 'Hé hé, raté ! Une astuce : change une seule couleur à la fois.' }],
                  quit: [{ say: 'À la prochaine !' }],
                },
              ],
            },
            { label: 'Non', do: [{ say: 'Hé hé.' }] },
          ],
        },
      ],
    },
  ],
};

const drops = [['bomb', 0.25], ['heart', 0.2], ['coin', 0.3]];
const skeleton = { type: 'enemy', kind: 'skeleton', sprite: 'skeleton', hp: 2, speed: 26, behavior: 'chase', sight: 80, drops };
const ghost = { type: 'enemy', kind: 'ghost', sprite: 'ghost', hp: 2, speed: 22, behavior: 'ghost', sight: 100, drops };
const armor = { type: 'enemy', kind: 'armor', sprite: 'armor', hp: 4, speed: 14, behavior: 'chase', sight: 90, damage: 2, drops };
const on = (o, tile) => ({ ...o, tile });
const F = 'maze_floor';

// ----------------------------------------------------------------- cartes
export const TEMPS_MAPS = {
  temps: {
    name: 'Le Labyrinthe des Mille Portes',
    level: 'temps',
    region: 'temps',
    worldExit: true,
    camera: 'follow',
    legend: { '#': 'maze_wall', '.': F, ',': 'floor', '=': 'path', y: 'hedge', k: 'cracked_wall', O: 'pit', a: 'maze_gate', P: { tile: 'path', marker: 'start' } },
    rows: [
      '########################################',
      '########################################',
      '##################v###w###v#########W###',
      '####......c..C..G...........G....L...###',
      '####.#.######################k##########',
      '####.#h######################H##########',
      '####.###################################',
      '####.###################################',
      '####.###################################',
      '####....$###############################',
      '####.###################################',
      '####.###################################',
      '####.###################################',
      '###...K.#########H######################',
      '###.....#OOOOOO##k#####u#######u########',
      '###...M..xxxxxx....b.......r.........###',
      '###.....#OOOOOO##################G##.###',
      '###k################################.###',
      '##...T##############################k###',
      '##....##############################.###',
      '##..S.######H#######################.###',
      '###.########k#####################S#.###',
      '###......S................s.z.s.z....###',
      '################$###.###h###############',
      '####################.###################',
      '####################.###################',
      '####################a###################',
      'y,,,,,,,,,,,,,,,,,,,=,,,,,,,,,,,,,,,,,,y',
      'y,,yy,,,,,,,,,,,,,,,=,I,,,,,,,,,,,,yy,,y',
      'y,,,,,,,,,,,,,,,,Z,,=,,,,,Q,,,,,,,,,,,,y',
      'y,,,,,,,,,,,,N,,,,,,=,,,,,,,,,,,,,,,,,,y',
      'y,,,,,,,,,y,,,,,,,,,=,,,,,,,,y,,,,,,,,,y',
      'yy,,,,,,,,,,,,,,,,,,P,,,,,,,,,,,,,,,,,yy',
      'yyyyyyyyyyyyyyyyyyyyVyyyyyyyyyyyyyyyyyyy',
    ],
    objects: {
      V: { type: 'warp', tile: 'path', worldMap: true, back: [20, 32] },
      W: { type: 'warp', tile: 'maze_gate', to: 'temps_arene', at: [7, 9], facing: 'up' },
      Z: CHRONOS,
      Q: LULU,
      N: GNOMO,
      I: { type: 'sign', tile: 'floor', text: ['LE LABYRINTHE DES MILLE PORTES. Ceux qui entrent sans plan s’y perdent...', 'Murs fissurés, cristaux, horloges : chaque porte a son secret.'] },
      T: { type: 'chest', tile: F, item: 'bomb', count: 10 },
      K: { type: 'chest', tile: F, item: 'key_bronze' },
      L: { type: 'locked', key: 'key_bronze', tile: F },
      // Interrupteurs cristal (même drapeau) : blocs rouges levés quand il est faux, bleus quand il est vrai.
      u: { type: 'crystal', tile: F, flag: 'tp_crystal' },
      r: { type: 'gate', tile: F, sprite: 'block_red', openSprite: 'block_red_down', openWhen: 'tp_crystal' },
      b: { type: 'gate', tile: F, sprite: 'block_blue', openSprite: 'block_blue_down', openWhen: { flag: 'tp_crystal', is: false } },
      // Portes à horloge : l'une s'ouvre quand l'autre se ferme, toutes les 4 secondes.
      c: { type: 'gate', tile: F, sprite: 'clockgate', every: 4, phase: 0 },
      C: { type: 'gate', tile: F, sprite: 'clockgate', every: 4, phase: 1 },
      s: { type: 'spikes', tile: F, period: 2, phase: 0 },
      z: { type: 'spikes', tile: F, period: 2, phase: 0.5 },
      v: { type: 'arrowtrap', tile: 'maze_wall', dir: 'down', every: 2, phase: 0 },
      w: { type: 'arrowtrap', tile: 'maze_wall', dir: 'down', every: 2, phase: 0.5 },
      x: { type: 'crumble', tile: F },
      H: { type: 'pickup', tile: F, item: 'hourglass' },
      S: on(skeleton, F),
      G: on(ghost, F),
      M: on(armor, F),
      h: { type: 'pickup', tile: F, item: 'heart' },
      $: { type: 'pickup', tile: F, item: 'coin', count: 5 },
    },
  },

  // L'arène du Minotaure : il fonce tout droit jusqu'aux murs et aux piliers.
  temps_arene: {
    name: 'L’arène du Minotaure',
    level: 'temps_arene',
    region: 'temps',
    camera: 'rooms',
    legend: { '#': 'maze_wall', _: F },
    rows: [
      '################',
      '#______A_______#',
      '#______________#',
      '#__#________#__#',
      '#______B_______#',
      '#______________#',
      '#______________#',
      '#__#________#__#',
      '#______________#',
      '#______________#',
      '#######D########',
    ],
    objects: {
      D: { type: 'warp', tile: 'maze_gate', to: 'temps', at: [36, 3], facing: 'down' },
      B: {
        type: 'boss',
        name: 'le Minotaure de bronze',
        sprite: 'minotaure',
        hp: 6,
        flag: 'minotaur_defeated',
        meltWith: 'wall',
        dashSpeed: 125,
        shieldText: '« Meuh... ma tête tourne ! Mon bronze se fend... mais il ne cédera que si tu réponds juste ! »',
        resistText: 'Ton épée rebondit sur le bronze ! Fais-le foncer dans un mur.',
        defeatedText: 'Le Minotaure de bronze est vaincu ! La Pierre du Temps brille au fond de l’arène.',
        tile: F,
      },
      A: { type: 'chest', item: 'stone_temps', appearWhen: 'minotaur_defeated', tile: F },
    },
  },
};
