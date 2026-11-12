// LA QUÊTE D'ALIA — niveau 8 : LE VOLCAN NOIR (le final).
// Au campement de la forge, Brasier sertit les 6 pierres dans le Cœur d'Iris, puis forge l'Armure d'Iris
// pour 300 pièces : monstres généreux, coffres, pépites, questions du sage et mini-jeu « Plus ou moins ».
// Le château de Morgor : 6 salles qui demandent tous les objets et les pouvoirs des pierres, 2 sceaux à
// briser, puis Morgor en 3 phases (bouclier noir, pluie de feu, sbires) et Alia à délivrer.
// Uniquement des DONNÉES : la logique vient de gameplay/ et engine/.

export const VOLCAN_ITEMS = {
  iris_heart: {
    icon: 'iris_heart',
    name: 'Cœur d’Iris',
    description: 'Les 6 pierres réunies. Lance un rayon arc-en-ciel (touche E ou bouton X) : lui seul perce le bouclier noir de Morgor.',
    quest: true,
    tool: (adv, hero) => hero.shoot('iris', { speed: 200, range: 170, cooldown: 0.5, sound: 'chime', damage: 2 }),
  },
  iris_armor: { icon: 'iris_armor', name: 'Armure d’Iris', description: 'Elle protège de la chaleur du château. Les coups de Morgor font 2 fois moins mal.', bag: false, quest: true },
  nugget: { icon: 'nugget', name: 'pépite', instant: (adv) => adv.state.give('coin', 10, 999), sound: 'coin' },
};

export const ARMOR_PRICE = 300;
const SEALS = ['vc_seal_1', 'vc_seal_2'];
const BRAZIERS = ['vc_brazier_1', 'vc_brazier_2'];

export const VOLCAN_QUESTS = [
  {
    id: 'volcan',
    difficulty: 3,
    kind: 'main',
    title: 'Délivrer Alia',
    steps: [
      {
        goal: `Réunir ${ARMOR_PRICE} pièces pour l’Armure d’Iris ({item:coin}/${ARMOR_PRICE})`,
        done: { any: [{ item: 'coin', count: ARMOR_PRICE }, { item: 'iris_armor' }] },
        hints: [
          'Les monstres du volcan laissent beaucoup de pièces. Les pépites dorées en valent 10 !',
          'Le sage Obsidien donne 3 pièces par bonne réponse, et Flammèche en donne si tu gagnes à « Plus ou moins ».',
          'Deux coffres sont sur des îlots de lave : marche contre la lave, la Pierre de Givre la fige. Un autre est caché derrière un rocher fissuré (bombe), et des pépites dorment sous les cendres claires (pelle).',
        ],
      },
      { goal: 'Acheter l’Armure d’Iris à Brasier', done: { item: 'iris_armor' }, hints: ['Brasier t’attend devant sa forge, au campement.'] },
      {
        goal: 'Briser les 2 sceaux de Morgor, dans le château',
        done: SEALS,
        hints: [
          'Dans l’entrée : le bâton de feu allume les braseros (aile ouest), une flèche touche la cible (aile est).',
          'Aile ouest : fige la lave, une bombe ouvre le mur fissuré ; le boomerang rapporte la clé de l’îlot.',
          'Aile est : creuse les tas de cendres pour trouver la clé. En haut, la Pierre d’Aurore révèle un passage, et le trident vole au-dessus de la lave.',
        ],
      },
      {
        goal: 'Vaincre Morgor',
        done: 'morgor_defeated',
        hints: [
          'Son bouclier noir ne craint que le Cœur d’Iris (touche E). Ensuite : une bonne réponse, et frappe !',
          'Quand il fait pleuvoir le feu, regarde les ombres au sol et bouge !',
          'À la fin, il appelle des diablotins : bats-les d’abord.',
        ],
      },
      { goal: 'Délivrer Alia', done: 'alia_free', hints: ['Alia est dans la cage, derrière le trône.'] },
    ],
  },
];

// ----------------------------------------------------------------- habitants
const POWERS = [
  'Pierre de Givre : marche contre la lave, elle se fige.',
  'Pierre de Sève : elle te rend 1 cœur chaque minute.',
  'Pierre d’Aurore : elle éclaire le noir et révèle les passages secrets.',
  'Pierre du Temps : les monstres rapides ralentissent.',
  'Pierre du Soleil : ton épée brûle, ses coups comptent double.',
  'Pierre des Marées : une bulle bloque un coup, puis se recharge.',
];

const BRASIER = {
  type: 'npc',
  name: 'Brasier, le forgeron',
  role: 'quest',
  gives: ['volcan'],
  sprite: 'brasier',
  tile: 'ash',
  dialogue: [
    {
      when: { quest: 'volcan', status: 'none' },
      do: [
        {
          say: [
            'Halte-là ! Je suis Brasier, le forgeron du volcan. Tu viens délivrer Alia ?',
            'Montre-moi tes pierres... Les six ! Alors la légende est vraie.',
            'Je vais les sertir dans un seul joyau : le Cœur d’Iris.',
          ],
        },
        { give: 'iris_heart', announce: true },
        {
          say: [
            'Le Cœur d’Iris lance un rayon arc-en-ciel (touche E). Lui seul perce le bouclier noir de Morgor.',
            `Mais la chaleur du château te brûlerait. Il te faut l’Armure d’Iris : je te la forge pour ${ARMOR_PRICE} pièces.`,
            'Les monstres du volcan sont riches, des pépites brillent dans la cendre, et le sage Obsidien paie 3 pièces par bonne réponse !',
            'Et n’oublie pas : chacune de tes pierres te donne un pouvoir. Demande-moi si tu veux que je te les rappelle.',
          ],
        },
        { startQuest: 'volcan' },
      ],
    },
    { when: { item: 'iris_armor' }, do: [{ say: 'L’Armure d’Iris te va comme un gant. Va, et ramène-nous Alia !' }] },
    {
      do: [
        {
          ask: `Il te faut ${ARMOR_PRICE} pièces pour l’Armure d’Iris. Tu en as {item:coin}.`,
          choices: [
            {
              label: 'Voir la forge',
              do: [
                {
                  shop: {
                    id: 'volcan_forge',
                    title: 'La forge de Brasier',
                    offers: [
                      { item: 'iris_armor', price: ARMOR_PRICE, once: true },
                      { item: 'bomb', price: 3 },
                      { item: 'potion', price: 20 },
                    ],
                  },
                },
              ],
            },
            { label: 'Les pouvoirs des pierres', do: [{ say: POWERS }] },
            { label: 'Au revoir', do: [{ say: 'Que le feu te soit doux !' }] },
          ],
        },
      ],
    },
  ],
};

const OBSIDIEN = {
  type: 'npc',
  name: 'Obsidien, le sage',
  role: 'quiz',
  sprite: 'obsidien',
  tile: 'ash',
  dialogue: [
    {
      do: [
        { say: 'Je suis Obsidien, le sage du volcan. Pour chaque bonne réponse, je donne 3 pièces.' },
        {
          ask: 'Trois questions ?',
          choices: [
            {
              label: 'Oui',
              do: [
                {
                  quiz: { id: 'sage', count: 3, pass: 2, cooldown: 60, retryPrice: 3 },
                  perCorrect: { give: 'coin', count: 3 },
                  success: [{ say: 'Tu es sage, toi aussi ! Reviens quand tu veux.' }],
                  failure: [{ say: 'Réfléchis bien, et reviens dans un moment.' }],
                },
              ],
            },
            { label: 'Non', do: [{ say: 'La sagesse attend. Comme la lave refroidie.' }] },
          ],
        },
      ],
    },
  ],
};

const FLAMMECHE = {
  type: 'npc',
  name: 'Flammèche, l’apprentie',
  role: 'quiz',
  sprite: 'flammeche',
  tile: 'ash',
  dialogue: [
    {
      do: [
        { say: 'Je pense à un nombre... À chaque essai, je te dis s’il est plus grand ou plus petit. Astuce : coupe toujours en deux !' },
        {
          ask: 'On joue à « Plus ou moins » ?',
          choices: [
            {
              label: 'Oui',
              do: [
                {
                  minigame: 'plusoumoins',
                  win: [{ say: 'Bien trouvé ! Voici 8 {ws:coin}.' }, { give: 'coin', count: 8, announce: true }],
                  lose: [{ say: 'Raté ! La prochaine fois, propose le nombre du milieu.' }],
                  quit: [{ say: 'À plus tard !' }],
                },
              ],
            },
            { label: 'Non', do: [{ say: 'Je garde mon nombre secret, alors !' }] },
          ],
        },
      ],
    },
  ],
};

const CENDRINE = {
  type: 'npc',
  name: 'Cendrine, la marchande',
  role: 'shop',
  sprite: 'seller',
  tile: 'ash',
  dialogue: [
    {
      do: [
        { say: 'Des provisions pour affronter le volcan ? Approche !' },
        {
          shop: {
            id: 'volcan',
            title: 'L’étal de Cendrine',
            offers: [
              { item: 'apple', price: 2 },
              { item: 'cake', price: 12 },
              { item: 'hint', price: 15 },
              { item: 'heart_container', price: 80, once: true },
            ],
          },
        },
      ],
    },
  ],
};

const ALIA = {
  type: 'npc',
  name: 'Alia',
  sprite: 'alia',
  tile: 'castle_floor',
  dialogue: [
    { when: 'alia_free', do: [{ say: 'Rentrons à Prébois, {player} : tout le royaume t’attend pour la fête !' }] },
    {
      when: 'morgor_defeated',
      do: [
        {
          say: [
            '« Merci, {player} ! Tu as réuni les 6 pierres et vaincu Morgor. »',
            '« Grâce à toi, le royaume d’Iris va retrouver toutes ses couleurs ! »',
          ],
        },
        { setFlag: 'alia_free' },
      ],
    },
    { do: [{ say: 'Alia est enfermée dans une cage magique. Bats Morgor pour l’ouvrir !' }] },
  ],
};

// Monstres rapides (fast) : la Pierre du Temps les ralentit. Butin généreux : [objet, chance, nombre].
const firebat = { type: 'enemy', kind: 'firebat', sprite: 'firebat', hp: 1, speed: 46, behavior: 'ghost', sight: 90, fast: true, drops: [['coin', 0.6, 2], ['heart', 0.15]] };
const imp = { type: 'enemy', kind: 'imp', sprite: 'imp', hp: 2, speed: 34, behavior: 'hopper', sight: 90, fast: true, drops: [['coin', 0.6, 3], ['heart', 0.2]] };
const wolf = { type: 'enemy', kind: 'lavawolf', sprite: 'lavawolf', hp: 3, speed: 30, behavior: 'charger', sight: 110, fast: true, drops: [['coin', 0.7, 4], ['heart', 0.2]] };
const golem = { type: 'enemy', kind: 'golem', sprite: 'golem', hp: 5, speed: 14, behavior: 'chase', sight: 80, drops: [['coin', 0.9, 6], ['heart', 0.1]] };
const minion = { kind: 'morgor_imp', sprite: 'imp', hp: 2, speed: 34, behavior: 'hopper', sight: 140, fast: true, drops: [['heart', 0.5]] };
const on = (o, tile) => ({ ...o, tile });
const A = 'ash';
const F = 'castle_floor';

// ----------------------------------------------------------------- cartes
export const VOLCAN_MAPS = {
  volcan: {
    name: 'Le Volcan Noir',
    level: 'volcan',
    region: 'volcan',
    worldExit: true,
    camera: 'follow',
    legend: {
      '.': A,
      '^': 'volcanic_rock',
      L: 'lava',
      Q: 'castle_wall',
      B: 'lava_bridge',
      '=': 'basalt',
      T: 'dead_tree',
      k: 'cracked_rock',
      s: 'ash_soft',
      t: 'tent',
      F: 'forge',
      a: 'anvil',
      P: { tile: 'basalt', marker: 'start' },
    },
    rows: [
      '^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
      '^LLLLLLLLLLLQQQQQQQQQQQQQQQQLLLLLLLLLLL^',
      '^LLLLLLLLLLLQQQQQQQQQQQQQQQQLLLLLLLLLLL^',
      '^LLLL^^^LLLLQQQQQQQQQQQQQQQQLLLL^^^LLLL^',
      '^LLL^^n^^LLLQQQQQQQQQQQQQQQQLLL^^n^^LLL^',
      '^LLLL^.^LLLLQQQQQQQQQQQQQQQQLLLL^.^LLLL^',
      '^LLLLLLLLLLLQQQQQQQQWQQQQQQQLLLLLLLLLLL^',
      '^LLLLLLLLLLLLLLLLLLLBLLLLLLLLLLLLLLLLLL^',
      '^LLLLLLLLLLLLLLLLLLLBLLLLLLLLLLLLLLLLLL^',
      '^........v.T.......K=.....v.........^^^^',
      '^..T..b..........n..=...i..T..n.o...k.E^',
      '^....^....LLLLL.....=...............^^^^',
      '^.n....n.LLLCLLL....=....^..Y.....i....^',
      '^....w...LLLLLLLv...=.n............v...^',
      '^.........LLLLL.....=...suss...T.......^',
      '^..t.t........b..^..=...sssu.b.......n.^',
      '^.t....FF.a......^^.=.............T....^',
      '^........N.....T....=.........LLLLLLL..^',
      '^...$...............=..v......LLLDLLL..^',
      '^............G......=.....w...LLLLLLL..^',
      '^..v............o...=.........sssus..h.^',
      '^.....T..i..^..n....=..T.c....susss....^',
      '^...................P...............n..^',
      '^^^^^^^^^^^^^^^^^^^^V^^^^^^^^^^^^^^^^^^^',
    ],
    objects: {
      V: { type: 'warp', tile: 'basalt', worldMap: true, back: [20, 22] },
      // La porte du château : sans l'Armure d'Iris, la chaleur repousse le héros.
      W: { type: 'warp', tile: 'castle_door', to: 'volcan_chateau', at: [24, 20], facing: 'up', requires: { item: 'iris_armor' }, lockedText: 'Aïe, quelle chaleur ! Sans l’Armure d’Iris, impossible d’entrer.' },
      K: { type: 'sign', tile: A, text: ['LE CHÂTEAU DE MORGOR.', 'Sa chaleur brûle tout. Seule l’Armure d’Iris protège celui qui y entre.'] },
      N: BRASIER,
      Y: OBSIDIEN,
      G: FLAMMECHE,
      $: CENDRINE,
      C: { type: 'chest', tile: A, item: 'coin', count: 40 },
      D: { type: 'chest', tile: A, item: 'coin', count: 40 },
      E: { type: 'chest', tile: A, item: 'coin', count: 30 },
      c: { type: 'chest', tile: A, item: 'coin', count: 20 },
      u: { type: 'buried', tile: 'ash_soft', item: 'nugget' },
      n: { type: 'pickup', tile: A, item: 'nugget' },
      h: { type: 'pickup', tile: A, item: 'heart' },
      v: { type: 'geyser', tile: A },
      b: on(firebat, A),
      i: on(imp, A),
      w: on(wolf, A),
      o: on(golem, A),
    },
  },

  // Le château : 6 salles (3 x 2). Entrée en bas au milieu, salle du trône en haut au milieu.
  volcan_chateau: {
    name: 'Le château de Morgor',
    level: 'volcan_chateau',
    region: 'volcan',
    camera: 'rooms',
    darkRooms: [[2, 1]], // l'aile est : la Pierre d'Aurore l'éclaire
    legend: { '#': 'castle_block', _: F, '=': 'carpet', M: 'magma', L: 'lava', k: 'cracked_block', x: 'ash_pile', z: 'secret_wall' },
    rows: [
      '################################################',
      '#_________#____##MM____#A#___MM##_____MMMMMMMMM#',
      '#_MMMMM___#____##M_____#c#____M##_____MMMMMMMMM#',
      '#_MMMMM___#__S_##_______=______##_____MMMMMMTMM#',
      '#_MMKMM___#____##_______=______##_____MMMMMMMMM#',
      '#_MMMMM___D____##______Z=______##_____MMMMMMMMM#',
      '#_MMMMM___#____##_______=______#####z###########',
      '#_________#____##_______=______##______________#',
      '#_______w_#____##_______=______##__i___________#',
      '#_________#____##h______=_____h##_____________h#',
      '#######_################_###############_#######',
      '#######k################Q###############D#######',
      '#__________b___##_______=___MtM##______________#',
      '#______________##____Y__=___MMM##__x______x__x_#',
      '#LLLLLLLLLLLLLL##_______=__y___##_____x________#',
      '#LLLLLLLLLLLLLL##_____i_=______##__________i___#',
      '#_______________g_______=______e_______________#',
      '#______________##_______=__i___##______x____u__#',
      '#__b___________##_MMMM__=__MMMM##_____b________#',
      '#___________h__##_MMMM__=__MMMM##___x____x____x#',
      '#______________##_I_____=______##______________#',
      '########################X#######################',
    ],
    objects: {
      X: { type: 'warp', tile: F, to: 'volcan', at: [20, 9], facing: 'down' },
      I: {
        type: 'sign',
        tile: F,
        text: [
          'Deux sceaux de Morgor ferment la salle du trône : un dans l’aile ouest, un dans l’aile est.',
          'Les braseros ouvrent l’aile ouest. La cible ouvre l’aile est.',
        ],
      },
      // l'entrée : braseros (bâton de feu) → aile ouest ; cible (arc) → aile est ; 2 sceaux → salle du trône
      Y: { type: 'brazier', tile: F, flag: BRAZIERS[0] },
      y: { type: 'brazier', tile: F, flag: BRAZIERS[1] },
      t: { type: 'target', tile: F, flag: 'vc_target', hitBy: 'arrow', hint: 'Une cible, au-dessus de la lave. Une flèche l’atteindra !' },
      g: { type: 'gate', tile: F, sprite: 'lava_gate', openWhen: BRAZIERS },
      e: { type: 'gate', tile: F, sprite: 'lava_gate', openWhen: 'vc_target' },
      Q: { type: 'gate', tile: F, sprite: 'lava_gate', openWhen: SEALS },
      // aile ouest : lave à figer, mur fissuré, clé sur l'îlot (boomerang), sceau derrière la porte
      K: { type: 'pickup', tile: F, item: 'key' },
      D: { type: 'locked', key: 'key', tile: F },
      S: { type: 'target', tile: F, flag: SEALS[0], hitBy: 'any', sword: true, sprite: 'seal', hint: 'Un sceau de Morgor ! Frappe-le.' },
      // aile est : dans le noir, une clé sous les cendres ; en haut, un faux mur et le second sceau
      u: { type: 'buried', tile: 'ash_pile', item: 'key' },
      T: { type: 'target', tile: F, flag: SEALS[1], hitBy: 'trident', sprite: 'seal', hint: 'Un sceau de Morgor, au milieu de la lave. Seul le trident va assez loin et frappe assez fort !' },
      // la salle du trône
      Z: {
        type: 'boss',
        name: 'Morgor',
        sprite: 'morgor',
        hp: 12,
        damage: 2,
        flag: 'morgor_defeated',
        tile: F,
        defeatedText: 'Morgor est vaincu ! La cage d’Alia s’ouvre.',
        phases: [
          {
            above: 8,
            meltWith: 'iris',
            shots: 'fireball',
            shieldSprite: 'morgor_shield',
            resistText: 'Son bouclier noir arrête tout ! Seul le Cœur d’Iris peut le percer (touche E).',
            shieldText: '« Le Cœur d’Iris ?! Mon bouclier se fissure... Il ne tombera que si tu réponds juste ! »',
          },
          {
            above: 4,
            rain: true,
            shieldSprite: 'morgor_shield2',
            text: '« Assez ! Que pleuve le feu ! »',
            shieldText: '« Réponds juste... ou brûle ! »',
          },
          {
            above: 0,
            shots: 'fireball',
            minions: { count: 3, enemy: minion },
            shieldSprite: 'morgor_shield2',
            text: '« Mes diablotins, à moi ! »',
            guardText: 'Ses diablotins le protègent ! Bats-les d’abord.',
            shieldText: '« Non... pas encore ! Une dernière question ! »',
          },
        ],
      },
      c: { type: 'gate', tile: F, sprite: 'cage_gate', openWhen: 'morgor_defeated' },
      A: ALIA,
      h: { type: 'pickup', tile: F, item: 'heart' },
      b: on(firebat, F),
      i: on(imp, F),
      w: on(wolf, F),
    },
  },
};
