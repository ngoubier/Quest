// LA QUÊTE D'ALIA — niveau 6 : LE DÉSERT DES MIRAGES (Pierre du Soleil).
// Un campement près de l'oasis, un temple enfoui fermé tant que les 4 statues ne regardent pas le
// soleil, une tempête de sable où il faut suivre les poteaux (les sables mouvants avalent les
// distraits), et la grande dune où dort le Ver des Dunes : déterrer et frapper 3 tambours le réveille.
// Nouvel objet : la pelle. Mini-jeu : les 3 gobelets.
// Uniquement des DONNÉES : la logique vient de gameplay/ et engine/.

import { MiniMapScene } from '../../gameplay/ui/MiniMapScene.js';

export const SOLEIL_ITEMS = {
  shovel: {
    icon: 'shovel',
    name: 'pelle',
    description: 'Creuse le sable devant toi (touche E ou bouton X). Des trésors y sont cachés !',
    quest: true,
    tool: (adv, hero) => hero.dig(),
  },
  gourd_empty: { icon: 'gourd_empty', name: 'gourde vide', description: 'À remplir au puits de l’oasis.', max: 1, quest: true },
  gourd_full: { icon: 'gourd_full', name: 'gourde d’eau fraîche', description: 'Pour Mémé Dune.', max: 1, quest: true },
  treasure_map: {
    icon: 'treasure_map',
    name: 'carte au trésor',
    description: 'Les croix rouges montrent des trésors enterrés (Utiliser, dans le sac).',
    quest: true,
    use: (adv) => (adv.mapDef.region === 'soleil' && adv.mapDef.camera === 'follow' ? adv.game.scenes.push(new MiniMapScene(adv, { title: 'Carte au trésor', legend: 'Vert : toi · Croix rouge : trésor à déterrer' })) : adv.toast('Cette carte montre le désert : regarde-la dehors.'), false),
  },
};

const STATUES = ['sol_statue_1', 'sol_statue_2', 'sol_statue_3', 'sol_statue_4'];
const DRUMS = ['sol_drum_1', 'sol_drum_2', 'sol_drum_3'];

export const SOLEIL_QUESTS = [
  {
    id: 'soleil',
    difficulty: 3,
    kind: 'main',
    title: 'La Pierre du Soleil',
    steps: [
      {
        goal: 'Tourner les 4 statues vers le soleil pour ouvrir le temple',
        done: STATUES,
        hints: ['Chaque coup d’épée fait tourner une statue d’un quart de tour.', 'Le soleil est gravé en haut du temple : toutes les statues doivent regarder vers le haut (la flèche dorée en haut).'],
      },
      {
        goal: 'Prendre la pelle, au fond du temple enfoui',
        done: { item: 'shovel' },
        hints: ['Dans le temple, chasse les momies de la première salle : la porte de la seconde s’ouvrira.'],
      },
      {
        goal: 'Traverser la tempête de sable et déterrer les 3 tambours de la grande dune',
        done: DRUMS,
        hints: [
          'Dans la tempête, suis les poteaux à lanterne : à côté, ce sont des sables mouvants !',
          'Sur la grande dune, un petit reflet brille parfois sur le sable : creuse là (touche E), puis frappe le tambour.',
        ],
      },
      {
        goal: 'Vaincre le Ver des Dunes',
        done: 'worm_defeated',
        hints: ['Quand il est sous le sable, éloigne-toi. Quand il sort, frappe-le : une bonne réponse, puis encore des coups !'],
      },
      { goal: 'Prendre la Pierre du Soleil dans le coffre', done: { item: 'stone_soleil' } },
    ],
    rewards: [{ maxHp: 2 }, { toast: 'Le Désert des Mirages retrouve ses couleurs ! Ta vie maximale augmente.' }],
  },
  {
    id: 'caravan',
    difficulty: 2,
    kind: 'side',
    title: 'La caravane perdue',
    steps: [
      { goal: 'Retrouver Rachid, perdu dans la tempête de sable', done: 'rachid_found', hints: ['Rachid s’est arrêté dans un cul-de-sac du chemin des poteaux, au milieu de la tempête.'] },
      { goal: 'Prévenir Farah, au campement', done: 'rachid_home' },
    ],
  },
  {
    id: 'water',
    difficulty: 1,
    kind: 'side',
    title: 'L’eau de Mémé Dune',
    steps: [
      { goal: 'Remplir la gourde au puits de l’oasis', done: { item: 'gourd_full' }, hints: ['Le puits est au bord de l’oasis, à l’ouest. Parle-lui !'] },
      { goal: 'Apporter l’eau à Mémé Dune', done: 'water_given' },
    ],
  },
];

// ----------------------------------------------------------------- habitants
const AMIRA = {
  type: 'npc',
  name: 'Amira, la gardienne du temple',
  role: 'quest',
  gives: ['soleil'],
  sprite: 'amira',
  tile: 'sand',
  dialogue: [
    {
      when: { quest: 'soleil', status: 'none' },
      do: [
        {
          say: [
            'Bienvenue dans le Désert des Mirages, {player}. La chaleur te joue des tours ? Ce n’est rien à côté du Ver des Dunes !',
            'Ce monstre de Morgor a avalé la Pierre du Soleil. Il dort sous la grande dune, au nord-est, derrière la tempête de sable.',
            'Pour le réveiller, il faut déterrer et frapper 3 tambours. Et pour creuser, il te faut la pelle sacrée du temple enfoui.',
            'Le temple ne s’ouvre que si les 4 statues regardent le soleil.',
          ],
        },
        { startQuest: 'soleil' },
      ],
    },
    { when: { item: 'stone_soleil' }, do: [{ say: 'La Pierre du Soleil ! Le désert brille à nouveau. Merci, {player} !' }] },
    { when: { quest: 'soleil', step: 0 }, do: [{ say: 'Frappe les statues pour les faire tourner. Elles doivent toutes regarder vers le haut, vers le soleil gravé du temple.' }] },
    { when: { quest: 'soleil', step: 1 }, do: [{ say: 'Le temple est ouvert ! La pelle est tout au fond.' }] },
    { when: { quest: 'soleil', step: 2 }, do: [{ say: 'Dans la tempête, suis les poteaux à lanterne. À côté du chemin : des sables mouvants !' }] },
    { do: [{ say: 'Le Ver se cache sous le sable. Attends qu’il sorte pour frapper.' }] },
  ],
};

const SABRI = {
  type: 'npc',
  name: 'Sabri, le joueur',
  role: 'quiz',
  sprite: 'sabri',
  tile: 'sand',
  dialogue: [
    {
      do: [
        { say: 'Approche, approche ! Une bille, trois gobelets. Je mélange... et tu devines où elle est !' },
        {
          ask: 'Tu tentes ta chance ?',
          choices: [
            {
              label: 'Oui',
              do: [
                {
                  minigame: 'gobelets',
                  win: [
                    {
                      if: { counter: 'game_gobelets_win', gte: 6 },
                      then: [{ say: 'Encore ! Tu as des yeux de faucon.' }],
                      else: [{ say: 'Bien vu ! Voici 4 {ws:coin}.' }, { give: 'coin', count: 4, announce: true }],
                    },
                  ],
                  lose: [{ say: 'Raté ! Ne quitte pas le gobelet des yeux, même quand il saute.' }],
                  quit: [{ say: 'Reviens quand tu veux !' }],
                },
              ],
            },
            { label: 'Non', do: [{ say: 'Dommage !' }] },
          ],
        },
      ],
    },
  ],
};

const MEME = {
  type: 'npc',
  name: 'Mémé Dune',
  role: 'quest',
  gives: ['water'],
  sprite: 'meme',
  tile: 'sand',
  dialogue: [
    {
      when: { quest: 'water', status: 'none' },
      do: [
        {
          ask: 'Ouf, quelle chaleur... Mes vieilles jambes ne vont plus jusqu’au puits. Tu me rapportes de l’eau ?\nQuête : {level:water}',
          choices: [
            { label: 'Oui', do: [{ startQuest: 'water' }, { give: 'gourd_empty', announce: true }, { say: 'Le puits est au bord de l’oasis. Merci, mon petit !' }] },
            { label: 'Non', do: [{ say: 'Bon... je boirai mon thé sans eau.' }] },
          ],
        },
      ],
    },
    {
      when: { quest: 'water', step: 1 },
      do: [
        { say: 'De l’eau fraîche ! Tu es un amour. Prends ça.' },
        { take: 'gourd_full' },
        { setFlag: 'water_given' },
        { give: 'coin', count: 15, announce: true },
        { give: 'hint', count: 1, announce: true },
      ],
    },
    { when: { quest: 'water', status: 'active' }, do: [{ say: 'Le puits est au bord de l’oasis, à l’ouest.' }] },
    { do: [{ say: 'Ah, l’eau de l’oasis, il n’y a rien de meilleur.' }] },
  ],
};

const WELL = {
  type: 'npc',
  name: 'Le puits',
  sprite: 'well',
  tile: 'sand',
  dialogue: [
    { when: { item: 'gourd_empty' }, do: [{ take: 'gourd_empty' }, { give: 'gourd_full' }, { sound: 'heal' }, { say: 'Tu remplis la gourde d’eau bien fraîche.' }] },
    { do: [{ say: 'Un puits plein d’eau fraîche. Ça fait du bien de s’y rafraîchir.' }, { heal: 'full' }, { sound: 'heal' }] },
  ],
};

const FARAH = {
  type: 'npc',
  name: 'Farah, la marchande',
  role: 'shop',
  gives: ['caravan'],
  sprite: 'seller',
  tile: 'sand',
  dialogue: [
    {
      when: { quest: 'caravan', status: 'none' },
      do: [
        {
          ask: 'Mon mari Rachid est parti dans la tempête avec la caravane... et il n’est pas revenu ! Tu veux bien le chercher ?\nQuête : {level:caravan}',
          choices: [
            { label: 'Oui', do: [{ startQuest: 'caravan' }, { say: 'Merci ! La tempête est à l’est. Suis bien les poteaux !' }] },
            { label: 'Non', do: [{ say: 'Oh, Rachid...' }] },
          ],
        },
      ],
    },
    {
      when: { quest: 'caravan', step: 1 },
      do: [
        { say: 'Rachid est sain et sauf ! Merci ! Il m’a dit de te donner ceci : une vieille carte au trésor.' },
        { setFlag: 'rachid_home' },
        { give: 'treasure_map', announce: true },
        { give: 'coin', count: 10, announce: true },
        { say: 'Regarde-la depuis ton sac. Avec une pelle, les croix rouges deviennent des trésors !' },
      ],
    },
    {
      do: [
        { say: 'Des provisions pour le désert ?' },
        {
          shop: {
            id: 'soleil',
            title: 'L’étal de Farah',
            offers: [
              { item: 'apple', price: 2 },
              { item: 'cake', price: 12 },
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

const RACHID = {
  type: 'npc',
  name: 'Rachid, le caravanier',
  role: 'quest',
  involved: ['caravan'],
  sprite: 'rachid',
  tile: 'sand',
  showWhen: { flag: 'rachid_found', is: false },
  dialogue: [{ do: [{ say: ['Enfin quelqu’un ! Je ne voyais plus les poteaux, alors je me suis arrêté ici.', 'Merci ! Je rentre au campement en suivant les lanternes. Dis à Farah que tout va bien !'] }, { setFlag: 'rachid_found' }] }],
};

const snake = { type: 'enemy', kind: 'snake', sprite: 'snake', hp: 2, speed: 22, behavior: 'chase', sight: 70 };
const scorpion = { type: 'enemy', kind: 'scorpion', sprite: 'scorpion', hp: 2, speed: 48, behavior: 'chase', sight: 80 };
const vulture = { type: 'enemy', kind: 'vulture', sprite: 'vulture', hp: 1, speed: 36, behavior: 'ghost', sight: 100 };
const mummy = { type: 'enemy', kind: 'mummy', sprite: 'mummy', hp: 4, speed: 14, behavior: 'chase', sight: 90 };
const on = (o, tile) => ({ ...o, tile });
const S = 'sand';

// ----------------------------------------------------------------- cartes
export const SOLEIL_MAPS = {
  soleil: {
    name: 'Le Désert des Mirages',
    level: 'soleil',
    region: 'soleil',
    worldExit: true,
    camera: 'follow',
    legend: {
      '.': S, ',': S, D: 'dune', t: 'temple_top', T: 'temple_wall', '~': 'water', p: 'palm', c: 'cactus', k: 'desert_rock', q: 'quicksand',
      r: 'hut_roof', h: 'hut_wall', P: { tile: S, marker: 'start' },
    },
    // La tempête de sable : on n'y voit presque rien, sauf les poteaux à lanterne. Elle se calme quand le Ver est vaincu.
    storm: { area: [27, 1, 38, 20], when: { flag: 'worm_defeated', is: false } },
    rows: [
      'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
      'D..............tttttttttt.DDDDDDDDDDZDDD',
      'D............k.TTTTTTTTTT.Dqqoqqqqqq.qqD',
      'D....,......c..TTTTdTTTTT.Dqqq.......qqD',
      'D..................G......Dqqq.oqqqoqqqD',
      'D...........,.............Dqqq.qqqqqqqqD',
      'D.p......p.E....1......2.cDqqo.qqqqqqqqD',
      'D..~~~~~~..........I......Dqqq.qqoqqqoqD',
      'D..~~~~~~.p...............Dqqq.......qqD',
      'D..~~~~~~...c...3......4..Dqqqqqq.qq.qqD',
      'D..~~~~~~...............k.Dqqqqqq.qq.qqD',
      'D.p......p..b.....Y.......DqqqqqqRqq.oqD',
      'D...w........,........E..cDqqqqqoqqq.qqD',
      'D..k......c...............Dqqqq......qqD',
      'D................c........Dqqqq.qqqoqqqD',
      'D.rrrr.rrrr...X.........b.Dqqqq.qqqqqqqD',
      'D.rrrr.rrrr.F.............Dqqqq.oqqqqqqD',
      'D.hhhh.hhhh....,.........KDqoqq.qqqqqqqD',
      'D...............................qqqqqqqD',
      'D...M....S....k.......,.X.DqqqoqqqqqqqqD',
      'D.......,........jA.......DqqqqqqqqqqqqD',
      'D..B...................k..DDDDDDDDDDDDDD',
      'D...................P........c......c..D',
      'DDDDDDDDDDDDDDDDDDDDVDDDDDDDDDDDDDDDDDDD',
    ],
    objects: {
      V: { type: 'warp', tile: S, worldMap: true, back: [20, 22] },
      d: { type: 'warp', tile: 'temple_door', to: 'soleil_temple', at: [7, 9], facing: 'up' },
      Z: { type: 'warp', tile: S, to: 'soleil_dune', at: [7, 9], facing: 'up' },
      G: { type: 'gate', tile: S, openWhen: STATUES },
      1: { type: 'statue', tile: S, flag: STATUES[0], facing: 'down' },
      2: { type: 'statue', tile: S, flag: STATUES[1], facing: 'left' },
      3: { type: 'statue', tile: S, flag: STATUES[2], facing: 'right' },
      4: { type: 'statue', tile: S, flag: STATUES[3], facing: 'down' },
      I: { type: 'sign', tile: S, text: ['LE TEMPLE DU SOLEIL. Il ne s’ouvre qu’aux statues qui regardent le soleil.', 'Le soleil est gravé tout en haut du temple.'] },
      K: { type: 'sign', tile: S, text: ['DANGER : TEMPÊTE DE SABLE. Suivez les poteaux à lanterne.', 'À côté du chemin, les sables mouvants vous avalent !'] },
      o: { type: 'post', tile: 'quicksand' },
      A: AMIRA,
      S: SABRI,
      M: MEME,
      w: WELL,
      F: FARAH,
      R: RACHID,
      E: on(snake, S),
      X: on(scorpion, S),
      Y: on(vulture, S),
      // Trésors enterrés : on les voit sur la carte au trésor (et un petit reflet brille parfois).
      b: { type: 'buried', tile: S, item: 'coin', count: 10, onMap: true },
      B: { type: 'buried', tile: S, item: 'heart_container', onMap: true },
      j: { type: 'pickup', tile: S, item: 'heart' },
    },
  },

  // Le temple enfoui : 2 salles. Chasser les momies ouvre la seconde, où est la pelle.
  soleil_temple: {
    name: 'Le temple enfoui',
    level: 'soleil_temple',
    region: 'soleil',
    camera: 'rooms',
    legend: { '#': 'temple_wall', _: 'temple_floor', q: 'quicksand', s: S },
    rows: [
      '################################',
      '#______________##______________#',
      '#__M________M__##__ssss____ss__#',
      '#______________##__sCss____ss__#',
      '#______qqq_____##__ssss________#',
      '#______qqq______G_______h______#',
      '#______qqq_____##______ssss____#',
      '#______________##______sssb____#',
      '#__M___________##______ssss____#',
      '#______________##______________#',
      '#######D########################',
    ],
    objects: {
      D: { type: 'warp', tile: 'temple_door', to: 'soleil', at: [19, 4], facing: 'down' },
      G: { type: 'gate', tile: 'temple_floor', openWhen: 'sol_temple_cleared' },
      C: { type: 'chest', tile: S, item: 'shovel' },
      b: { type: 'buried', tile: S, item: 'coin', count: 5 },
      h: { type: 'pickup', tile: 'temple_floor', item: 'heart' },
      M: on(mummy, 'temple_floor'),
    },
    roomClear: [{ room: [0, 0], flag: 'sol_temple_cleared' }],
  },

  // La grande dune : 3 tambours enterrés ; quand ils ont tous sonné, le Ver des Dunes sort.
  soleil_dune: {
    name: 'La grande dune',
    level: 'soleil_dune',
    region: 'soleil',
    camera: 'rooms',
    legend: { '.': S, D: 'dune', c: 'cactus' },
    rows: [
      'DDDDDDDDDDDDDDDD',
      'D.......A......D',
      'D..1........2..D',
      'D..............D',
      'D......W.......D',
      'Dc............cD',
      'D..............D',
      'D.......3......D',
      'D..I...........D',
      'D..............D',
      'DDDDDDDXDDDDDDDD',
    ],
    objects: {
      X: { type: 'warp', tile: S, to: 'soleil', at: [36, 2], facing: 'down' },
      1: { type: 'drum', tile: S, flag: DRUMS[0], buried: true },
      2: { type: 'drum', tile: S, flag: DRUMS[1], buried: true },
      3: { type: 'drum', tile: S, flag: DRUMS[2], buried: true },
      I: { type: 'sign', tile: S, text: ['Ici dort le Ver des Dunes. Trois tambours sont enterrés dans le sable.', 'Un reflet brille parfois là où ils sont cachés...'] },
      W: {
        type: 'boss',
        name: 'le Ver des Dunes',
        sprite: 'worm',
        hp: 6,
        flag: 'worm_defeated',
        hiddenUntil: DRUMS,
        burrow: true,
        still: true,
        shots: 'rock',
        shieldText: '« Grrraaah ! Qui ose me réveiller ? Ma peau de sable ne craquera que si tu réponds juste ! »',
        defeatedText: 'Le Ver des Dunes est vaincu ! Il recrache la Pierre du Soleil.',
        tile: S,
      },
      A: { type: 'chest', item: 'stone_soleil', appearWhen: 'worm_defeated', tile: S },
    },
  },
};
