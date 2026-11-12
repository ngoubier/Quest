// LA QUÊTE D'ALIA — niveau 7 : LES ABYSSES DE CORAIL (Pierre des Marées).
// Sur la plage, le capitaine Barnabé prête sa combinaison de plongée contre sa longue-vue perdue.
// Sous l'eau, la bouteille d'oxygène se vide : des bulles la remplissent, et la corde du ponton permet
// de remonter. Si l'air manque, on recommence la plongée. Algues à couper, courants, coquillages-
// interrupteurs, portes de corail, et le Kraken : d'abord ses 4 tentacules, puis sa tête.
// Nouvel objet : le trident. Mini-jeu : le chant des coquillages (Simon).
// Uniquement des DONNÉES : la logique vient de gameplay/ et engine/.

export const MAREES_ITEMS = {
  trident: {
    icon: 'trident',
    name: 'trident',
    description: 'Lance le trident loin devant toi (touche E ou bouton X). Il coupe les algues et passe au-dessus du corail.',
    quest: true,
    tool: (adv, hero) => hero.shoot('trident', { speed: 240, range: 135, cooldown: 0.45, sound: 'sword', cuts: true, damage: 2 }),
  },
  spyglass: { icon: 'spyglass', name: 'longue-vue', description: 'La longue-vue du capitaine Barnabé.', max: 1, quest: true },
  diving_suit: { icon: 'diving_suit', name: 'combinaison de plongée', description: 'Pour plonger au bout du ponton.', bag: false, quest: true },
  pearl: { icon: 'pearl', name: 'perle', plural: 'perles', description: 'Une perle de Coralie la sirène.', max: 3, quest: true },
  bubble: { icon: 'bubble', name: 'bulles d’air', instant: (adv) => adv.addAir(45), sound: 'bubble' },
};

const SHELLS = ['mr_shell_1', 'mr_shell_2', 'mr_shell_3'];

export const MAREES_QUESTS = [
  {
    id: 'marees',
    difficulty: 3,
    kind: 'main',
    title: 'La Pierre des Marées',
    steps: [
      { goal: 'Retrouver la longue-vue du capitaine Barnabé', done: { item: 'spyglass' }, hints: ['Elle est tombée dans la crique aux rochers, à l’est de la plage. Attention aux crabes !'] },
      { goal: 'L’échanger contre la combinaison de plongée', done: { item: 'diving_suit' }, hints: ['Barnabé t’attend au pied du ponton.'] },
      {
        goal: 'Plonger au bout du ponton et trouver le trident',
        done: { item: 'trident' },
        hints: ['Sous l’eau, va à gauche : des algues cachent l’entrée d’une grotte. Coupe-les à l’épée !', 'Surveille ton air : les bulles le remplissent, la corde te ramène à la surface.'],
      },
      {
        goal: 'Toucher les 3 coquillages magiques pour ouvrir la porte du Kraken',
        done: SHELLS,
        hints: [
          'Le premier est au milieu d’un massif de corail : lance le trident par-dessus (touche E).',
          'Le courant du milieu remonte : pour descendre, prends le courant de l’est.',
          'En bas : un coquillage derrière des algues, à l’ouest, et un autre au bout d’un courant trop fort, à l’est : vise de loin !',
        ],
      },
      {
        goal: 'Vaincre le Kraken',
        done: 'kraken_defeated',
        hints: ['Coupe d’abord ses 4 tentacules. Ensuite, frappe sa tête : une bonne réponse, puis encore des coups !'],
      },
      { goal: 'Prendre la Pierre des Marées dans le coffre', done: { item: 'stone_marees' } },
    ],
    rewards: [{ maxHp: 2 }, { toast: 'Les Abysses de Corail retrouvent leurs couleurs ! Ta vie maximale augmente.' }],
  },
  {
    id: 'pearls',
    difficulty: 2,
    kind: 'side',
    title: 'Les perles de Coralie',
    steps: [
      {
        goal: 'Retrouver 3 perles sous la mer ({item:pearl}/3)',
        done: { item: 'pearl', count: 3 },
        hints: ['Les perles se cachent derrière des algues : une dans la grotte du trident, une en haut à droite, une en bas à gauche.'],
      },
      { goal: 'Les rapporter à Coralie', done: { flag: 'pearls_given' } },
    ],
  },
];

// ----------------------------------------------------------------- habitants
const BARNABE = {
  type: 'npc',
  name: 'Barnabé, le capitaine',
  role: 'quest',
  gives: ['marees'],
  sprite: 'barnabe',
  tile: 'sand',
  dialogue: [
    {
      when: { quest: 'marees', status: 'none' },
      do: [
        {
          say: [
            'Ohé, moussaillon ! Tu cherches la Pierre des Marées ? Le Kraken de Morgor l’a emportée tout au fond des Abysses.',
            'Pour plonger, il te faut ma combinaison de plongée. Je te la prête... si tu retrouves ma longue-vue !',
            'Je l’ai fait tomber dans la crique aux rochers, à l’est. Les crabes la gardent jalousement.',
          ],
        },
        { startQuest: 'marees' },
      ],
    },
    {
      when: { item: 'spyglass' },
      do: [
        { say: 'Ma longue-vue ! Mille sabords, merci ! Marché conclu : voici ma combinaison de plongée.' },
        { take: 'spyglass' },
        { give: 'diving_suit', announce: true },
        { say: ['On plonge au bout du ponton. Sous l’eau, ta bouteille d’oxygène se vide : attrape des bulles !', 'Et si l’air manque, remonte par la corde. Sinon, tu devras recommencer la plongée.'] },
      ],
    },
    { when: { item: 'stone_marees' }, do: [{ say: 'La Pierre des Marées ! La mer est redevenue bleue. Bravo, moussaillon !' }] },
    { when: { quest: 'marees', step: 0 }, do: [{ say: 'Ma longue-vue est dans la crique aux rochers, à l’est.' }] },
    { do: [{ say: 'Surveille ton air en bas ! La corde du ponton te ramène à la surface.' }] },
  ],
};

const CORALIE = {
  type: 'npc',
  name: 'Coralie, la sirène',
  role: 'quiz',
  gives: ['pearls'],
  sprite: 'mermaid',
  tile: 'sea',
  dialogue: [
    {
      when: { quest: 'pearls', status: 'none' },
      do: [
        {
          ask: 'Bonjour ! Le Kraken a dispersé mes 3 perles au fond de la mer. Tu veux bien les chercher ?\nQuête : {level:pearls}',
          choices: [
            { label: 'Oui', do: [{ startQuest: 'pearls' }, { say: 'Merci ! Elles aiment se cacher derrière les algues.' }] },
            { label: 'Non', do: [{ say: 'Tant pis... je chanterai toute seule.' }] },
          ],
        },
      ],
    },
    {
      when: { quest: 'pearls', step: 1 },
      do: [{ say: 'Mes perles ! Elles brillent comme la lune sur l’eau. Tiens, un cadeau de la mer.' }, { take: 'pearl', count: 3 }, { setFlag: 'pearls_given' }, { give: 'heart_container', announce: true }, { give: 'coin', count: 10, announce: true }],
    },
    {
      do: [
        { say: 'Écoute le chant des coquillages ! Je chante une suite, tu la répètes avec les flèches. À chaque fois, un coquillage de plus.' },
        {
          ask: 'On chante ensemble ?',
          choices: [
            {
              label: 'Oui',
              do: [
                {
                  minigame: 'coquillages',
                  win: [
                    {
                      if: { counter: 'game_coquillages_win', gte: 6 },
                      then: [{ say: 'Quelle oreille ! Tu chantes mieux que moi.' }],
                      else: [{ say: 'Magnifique ! Voici 4 {ws:coin}.' }, { give: 'coin', count: 4, announce: true }],
                    },
                  ],
                  lose: [{ say: 'Presque ! Répète la suite dans ta tête pendant que je chante.' }],
                  quit: [{ say: 'À bientôt !' }],
                },
              ],
            },
            { label: 'Non', do: [{ say: 'La la la...' }] },
          ],
        },
      ],
    },
  ],
};

const SELLER = {
  type: 'npc',
  name: 'Maëlle, la poissonnière',
  role: 'shop',
  sprite: 'seller',
  tile: 'sand',
  dialogue: [
    {
      do: [
        { say: 'Poisson frais, provisions et potions ! Approchez !' },
        {
          shop: {
            id: 'marees',
            title: 'L’étal de Maëlle',
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

const crab = { type: 'enemy', kind: 'crab', sprite: 'crab', hp: 2, speed: 26, behavior: 'wander' };
const jelly = { type: 'enemy', kind: 'jelly', sprite: 'jelly', hp: 1, speed: 40, behavior: 'ghost', sight: 90 };
const eel = { type: 'enemy', kind: 'eel', sprite: 'eel', hp: 2, speed: 22, behavior: 'charger', sight: 100 };
const lantern = { type: 'enemy', kind: 'lantern', sprite: 'lantern', hp: 2, speed: 18, behavior: 'chase', sight: 90 };
const tentacle = { type: 'enemy', kind: 'tentacle', sprite: 'tentacle', hp: 2, speed: 0, behavior: 'sway', drops: [] };
const on = (o, tile) => ({ ...o, tile });
const B = 'seabed';
const AIR = { air: 180 }; // secondes d'oxygène au début de la plongée

// ----------------------------------------------------------------- cartes
export const MAREES_MAPS = {
  marees: {
    name: 'La plage des Marées',
    level: 'marees',
    region: 'marees',
    worldExit: true,
    camera: 'follow',
    legend: { '.': 'sand', S: 'sea', '=': 'pier', b: 'boat', k: 'sea_rock', p: 'palm', P: { tile: 'sand', marker: 'start' } },
    rows: [
      'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS',
      'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS',
      'SSSSSSSSSSSSSSSSSSSSZSSSSSSSSSSSSSSSSSSS',
      'SSSSSSSSSSSSSSSSSSSS=SSSSSSSSSSSSSSSSSSS',
      'SSSSSSSSSSSSSSSSSSSS=bbbSSSSSSSSSSSSSSSS',
      'SSSSSSSSSSSSSSSSSSSS=bbbSSSSSSSSSSSSSSSS',
      'SSSSSSSSSSSSSSSSSSSS=SSSSSSSSSSSSSSSSSSS',
      'SSSSSSSSSSSSSSSSSSSS=SSSSSSSSSSSSSSSSSSS',
      'SSSSSSSSSMSSSSSSSSSS=SSSSSSSSSSSSSSSSSSS',
      'k......................................k',
      'k....................B..........kkkkkk.k',
      'k.............p.................k..c.k.k',
      'k...p....................p......k..C.k.k',
      'k.........c.....................k.c..k.k',
      'k.............................c..kk..k.k',
      'k......................................k',
      'k............F.........................k',
      'k...........................p..........k',
      'k.......p..............................k',
      'k..h...................................k',
      'k.................I........c......p....k',
      'k....p.................................k',
      'k...................P..................k',
      'kkkkkkkkkkkkkkkkkkkkVkkkkkkkkkkkkkkkkkkk',
    ],
    objects: {
      V: { type: 'warp', tile: 'sand', worldMap: true, back: [20, 22] },
      // Le bout du ponton : on plonge, avec la combinaison de plongée.
      Z: { type: 'warp', tile: 'pier', to: 'marees_fond', at: [20, 2], facing: 'down', requires: { item: 'diving_suit' }, lockedText: 'L’eau est bien trop profonde... Il faudrait une combinaison de plongée.' },
      B: BARNABE,
      M: CORALIE,
      F: SELLER,
      C: { type: 'chest', tile: 'sand', item: 'spyglass' },
      I: { type: 'sign', tile: 'sand', text: ['LA PLAGE DES MARÉES. Au bout du ponton : la plongée vers les Abysses de Corail.', 'Sous l’eau, surveille ton air !'] },
      c: on(crab, 'sand'),
      h: { type: 'pickup', tile: 'sand', item: 'heart' },
    },
  },

  marees_fond: {
    name: 'Les Abysses de Corail',
    level: 'marees_fond',
    region: 'marees',
    camera: 'follow',
    underwater: AIR,
    legend: { '.': B, R: 'reef', '*': 'coral', a: 'algae', '^': 'current_up', v: 'current_down', '<': 'current_left', Q: 'rope' },
    rows: [
      'RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR',
      'RRRRRRRRRRRRRRRRRRRRURRRRRRRRRRRRRRRRRRR',
      'RR..................Q..I..............RR',
      'RR............C.....................apRR',
      'RR........o.........................a.RR',
      'RR.......................J....o.......RR',
      'RR....................................RR',
      'RRRaRRRRRRRRRRRRRRR^^RRRR*****RRRggRRRRR',
      'RR.......RRRRRRRRRR^^RRRR*****RRRvvRRRRR',
      'RR.....o.RRRRRRRRRR^^RRRR**1**RRRvvRRRRR',
      'RR.p..C..RRRRRRRRRR^^RRRR*****RRRvvRRRRR',
      'RR...T...RRRRRRRRRR^^RRRRRRRRRRRRvvRRRRR',
      'RR.......RRRRRRRRRR^^RRRRRRRRRRRRvvRRRRR',
      'RRRRRRRRRRRRRRRRRRR^^RRRRRRRRRRRRvoRRRRR',
      'RRRRRRRRRRRRRRRRRRR^^RRRRRRRRRRRRvvRRRRR',
      'RRRRRRRRRRRRRRRRRRR^^RRRRRRRRRRRRvvRRRRR',
      'RRRRRRRRRRRRRRRRRRR^^RRRRRRRRRRRRvvRRRRR',
      'RRRRRRR...............................RR',
      'RRRRRRR...................L...RRRRRRRRRR',
      'RR2...a.E.....................<<<<<<<3RR',
      'RR.p..a.....o.................RRRRRRRRRR',
      'RR.............C....h....J..o.........RR',
      'RRRRRRRRRRRRRRRRRRRRKRRRRRRRRRRRRRRRRRRR',
      'RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR',
    ],
    objects: {
      U: { type: 'warp', tile: 'rope_top', to: 'marees', at: [20, 3], facing: 'down' }, // la corde : retour à la surface
      I: { type: 'sign', tile: B, text: ['La corde rouge, juste à côté : nage vers le haut le long de la corde pour remonter à la surface (et remplir ta bouteille).', 'Le courant du milieu remonte ; celui de l’est descend.'] },
      T: { type: 'chest', tile: B, item: 'trident' },
      1: { type: 'target', tile: 'coral', flag: SHELLS[0], hitBy: 'any', sword: true, sprite: 'shell', hint: 'Un coquillage magique ! Touche-le.' },
      2: { type: 'target', tile: B, flag: SHELLS[1], hitBy: 'any', sword: true, sprite: 'shell', hint: 'Un coquillage magique ! Touche-le.' },
      3: { type: 'target', tile: 'current_left', flag: SHELLS[2], hitBy: 'any', sword: true, sprite: 'shell', hint: 'Un coquillage magique ! Touche-le.' },
      g: { type: 'gate', tile: B, sprite: 'coral_gate', openWhen: SHELLS[0] },
      h: { type: 'gate', tile: B, sprite: 'coral_gate', openWhen: [SHELLS[1], SHELLS[2]] },
      K: { type: 'warp', tile: B, to: 'marees_kraken', at: [7, 9], facing: 'up' },
      p: { type: 'pickup', tile: B, item: 'pearl' },
      o: { type: 'pickup', tile: B, item: 'bubble' },
      C: on(crab, B),
      J: on(jelly, B),
      E: on(eel, B),
      L: on(lantern, B),
    },
  },

  // L'antre du Kraken : 4 tentacules le protègent ; coupées, on peut frapper sa tête.
  marees_kraken: {
    name: 'L’antre du Kraken',
    level: 'marees_fond',
    region: 'marees',
    camera: 'rooms',
    underwater: AIR,
    legend: { '.': B, R: 'reef' },
    rows: [
      'RRRRRRRRRRRRRRRR',
      'R..............R',
      'R......K.......R',
      'R..............R',
      'R..............R',
      'R..T........T..R',
      'R......A.......R',
      'R..............R',
      'R...T......T...R',
      'R.o..........o.R',
      'RRRRRRRXRRRRRRRR',
    ],
    objects: {
      X: { type: 'warp', tile: B, to: 'marees_fond', at: [20, 20], facing: 'up' },
      T: on(tentacle, B),
      o: { type: 'pickup', tile: B, item: 'bubble' },
      K: {
        type: 'boss',
        name: 'le Kraken',
        sprite: 'kraken',
        hp: 6,
        flag: 'kraken_defeated',
        still: true,
        shots: 'ink',
        guardedBy: { counter: 'kills_tentacle', gte: 4 },
        guardText: 'Ses tentacules le protègent ! Coupe-les d’abord.',
        shieldText: '« Glou glou ! Mes tentacules ! Ma bulle ne crèvera que si tu réponds juste ! »',
        defeatedText: 'Le Kraken est vaincu ! Il lâche la Pierre des Marées.',
        tile: B,
      },
      A: { type: 'chest', item: 'stone_marees', appearWhen: 'kraken_defeated', tile: B },
    },
  },
};
