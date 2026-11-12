// LA QUÊTE D'ALIA — niveau 4 : BOURG-LANTERNE (Pierre d'Aurore).
// Une grande ville avec un canal, une place du marché et un beffroi. Le Chef des Masques a volé
// la Pierre d'Aurore : on mène l'enquête, on retrouve le boomerang du vieux Fernand (coffre à
// code), on attrape la clé rouge sur l'îlot du canal, puis on descend dans les égouts sous le
// beffroi au toit rouge. Nouvel objet : le boomerang. Mini-jeu : Puissance 4.
// Uniquement des DONNÉES : la logique vient de gameplay/ et engine/.

export const AURORE_ITEMS = {
  boomerang: {
    icon: 'boomerang_0',
    name: 'boomerang',
    description: 'Il revient tout seul (touche E ou bouton X). Rapporte les objets, étourdit les monstres, actionne les leviers de loin.',
    quest: true,
    tool: (adv, hero) => hero.throwBoomerang(),
  },
  key_red: { icon: 'key_red', name: 'clé rouge', description: 'Elle ouvre la porte au toit rouge.', max: 1, quest: true },
  key_blue: { icon: 'key_blue', name: 'clé bleue', description: 'Elle ouvre la maison au toit bleu.', max: 1, quest: true },
  letter: { icon: 'letter', name: 'lettre', plural: 'lettres', description: 'Une lettre perdue par Paulin le facteur.', max: 5, quest: true },
  bread: { icon: 'bread', name: 'pain', plural: 'pains', description: 'Un pain tout chaud de Rose, à livrer.', max: 4, quest: true },
};

const WITNESSES = ['wit_baker', 'wit_fisher', 'wit_guard'];
const BREADS = ['bread_mayor', 'bread_fernand', 'bread_pelagie', 'bread_gaston'];

export const AURORE_QUESTS = [
  {
    id: 'aurore',
    difficulty: 3,
    kind: 'main',
    title: 'La Pierre d’Aurore volée',
    steps: [
      {
        goal: 'Interroger les 3 témoins : au marché, sur le quai, devant le beffroi',
        done: WITNESSES,
        hints: ['Marius le boulanger est au marché, Lucien le pêcheur sur le quai du canal, Hector le garde devant le beffroi.'],
      },
      {
        goal: 'Récupérer le boomerang du vieux Fernand (coffre à code)',
        done: { item: 'boomerang' },
        hints: [
          'Fernand habite au nord, dans la maison au toit marron à droite du beffroi.',
          'Il a noté le code de son coffre dans un livre de la bibliothèque (toit vert, au nord-ouest). Fais le calcul !',
        ],
      },
      {
        goal: 'Attraper la clé rouge sur l’îlot du canal',
        done: { item: 'key_red' },
        hints: ['Place-toi au bord du bassin, bien en face de la clé, et lance le boomerang (touche E) : il la rapporte !'],
      },
      {
        goal: 'Vaincre le Chef des Masques, dans les égouts sous le beffroi',
        done: 'masks_defeated',
        hints: [
          'La clé rouge ouvre le beffroi, le seul toit rouge de la ville.',
          'Les leviers sur les îlots s’actionnent de loin avec le boomerang.',
          'Le Chef des Masques est presque invisible : regarde son ombre ! Un coup de boomerang, une bonne réponse, puis l’épée.',
        ],
      },
      { goal: 'Reprendre la Pierre d’Aurore dans le coffre', done: { item: 'stone_aurore' } },
    ],
    rewards: [{ maxHp: 2 }, { toast: 'Bourg-Lanterne retrouve ses couleurs ! Ta vie maximale augmente.' }],
  },
  {
    id: 'letters',
    difficulty: 2,
    kind: 'side',
    title: 'Les lettres du facteur',
    steps: [
      {
        goal: 'Retrouver 5 lettres ({item:letter}/5)',
        done: { item: 'letter', count: 5 },
        hints: [
          'Le vent les a dispersées : une dans un coin au sud-ouest, une coincée derrière des caisses à l’est (le boomerang passe par-dessus).',
          'Les autres sont cachées dans des pots, dans des maisons : l’auberge, chez Mme Pélagie et dans la maison au toit bleu.',
        ],
      },
      { goal: 'Les rapporter à Paulin', done: { flag: 'letters_given' } },
    ],
  },
  {
    id: 'cat',
    difficulty: 1,
    kind: 'side',
    title: 'Le chat de Mme Pélagie',
    steps: [
      { goal: 'Retrouver Minou, le chat roux', done: 'cat_found', hints: ['Minou aime les coins tranquilles, tout au sud-est de la ville.'] },
      { goal: 'Prévenir Mme Pélagie', done: 'cat_home' },
    ],
  },
  {
    id: 'bread',
    difficulty: 1,
    kind: 'side',
    title: 'Les 4 pains de Rose',
    steps: [
      {
        goal: 'Livrer un pain à la maire, à Fernand, à Mme Pélagie et à Gaston',
        done: BREADS,
        hints: ['La maire est sur la place, près de la sortie. Fernand et Mme Pélagie sont chez eux, Gaston à l’auberge.'],
      },
    ],
    rewards: [{ give: 'coin', count: 20 }, { give: 'cake' }, { toast: 'Rose te donne 20 pièces et un gâteau !' }],
  },
];

// Livraison d'un pain (quête de Rose) : première règle du dialogue des destinataires.
const breadRule = (flag, thanks) => ({
  when: [{ quest: 'bread', status: 'active' }, { flag, is: false }, { item: 'bread' }],
  do: [{ take: 'bread' }, { setFlag: flag }, { sound: 'pickup' }, { say: thanks }],
});

// ----------------------------------------------------------------- habitants
const MAYOR = {
  type: 'npc',
  name: 'Madame Lumen, la maire',
  role: 'quest',
  gives: ['aurore'],
  involved: ['bread'],
  sprite: 'mayor',
  dialogue: [
    breadRule('bread_mayor', 'Un pain de Rose ! Merci, j’ai une faim de loup.'),
    {
      when: { quest: 'aurore', status: 'none' },
      do: [
        {
          say: [
            'Bienvenue à Bourg-Lanterne, {player}... Hélas, tu arrives au mauvais moment.',
            'Cette nuit, un voleur masqué a pris la Pierre d’Aurore ! Sans elle, nos lanternes s’éteignent une à une.',
            'Trois habitants l’ont vu : Marius au marché, Lucien sur le quai du canal, Hector devant le beffroi. Interroge-les !',
          ],
        },
        { startQuest: 'aurore' },
      ],
    },
    { when: { item: 'stone_aurore' }, do: [{ say: 'La Pierre d’Aurore ! Regarde : toutes les lanternes se rallument. Bourg-Lanterne te dit merci !' }] },
    { when: { quest: 'aurore', step: 0 }, do: [{ say: 'Marius est au marché, Lucien sur le quai, Hector devant le beffroi. Écoute bien ce qu’ils ont vu.' }] },
    { when: { quest: 'aurore', step: 1 }, do: [{ say: 'Une clé sur un îlot ? Il faudrait un boomerang... Le vieux Fernand en avait un, il habite au nord.' }] },
    { when: { quest: 'aurore', step: 2 }, do: [{ say: 'Avec le boomerang (touche E), tu peux attraper des objets de loin. La clé rouge est sur l’îlot du bassin.' }] },
    { do: [{ say: 'Les égouts sont sous le beffroi. Sois prudent, {player} !' }] },
  ],
};

const witness = (flag, clue) => ({ when: [{ quest: 'aurore', step: 0 }, { flag, is: false }], do: [{ say: clue }, { setFlag: flag }] });

const BAKER = {
  type: 'npc',
  name: 'Marius, le boulanger',
  role: 'quest',
  involved: ['aurore'],
  sprite: 'baker',
  dialogue: [
    witness('wit_baker', ['Le voleur ? Je l’ai vu ! Il portait un masque blanc, et une pierre qui brillait comme le soleil.', 'Il courait vers le canal. Demande à Lucien, le pêcheur : il est toujours sur le quai.']),
    { do: [{ say: 'Ma femme Rose tient la boulangerie, à côté de l’auberge. Ses pains sont les meilleurs !' }] },
  ],
};

const FISHER = {
  type: 'npc',
  name: 'Lucien, le pêcheur',
  role: 'quest',
  involved: ['aurore'],
  sprite: 'fisher',
  dialogue: [
    witness('wit_fisher', ['Un homme masqué ? Oui ! Il a jeté quelque chose de rouge dans le bassin... C’est tombé sur l’îlot, là-bas.', 'On dirait une clé rouge. Mais personne ne peut aller sur l’îlot : l’eau est trop profonde.']),
    { do: [{ say: 'Ça mord bien aujourd’hui. Enfin... ça mordrait, s’il y avait des poissons.' }] },
  ],
};

const GUARD = {
  type: 'npc',
  name: 'Hector, le garde',
  role: 'quest',
  involved: ['aurore'],
  sprite: 'guard',
  dialogue: [
    witness('wit_guard', ['Cette nuit, j’ai entendu du bruit dans le beffroi. Sous le beffroi, il y a les égouts...', 'Le voleur avait la clé : une clé rouge, comme le toit du beffroi. C’est le seul toit rouge de la ville !']),
    { when: { item: 'key_red' }, do: [{ say: 'La clé rouge ! Elle ouvre le beffroi, juste derrière moi.' }] },
    { do: [{ say: 'Je garde le beffroi. Enfin, j’essaie.' }] },
  ],
};

const FERNAND = {
  type: 'npc',
  name: 'Fernand, l’ancien aventurier',
  role: 'quest',
  involved: ['aurore', 'bread'],
  sprite: 'fernand',
  tile: 'house_floor',
  dialogue: [
    breadRule('bread_fernand', 'Un pain ! À mon âge, c’est mon trésor préféré.'),
    { when: { item: 'boomerang' }, do: [{ say: 'Prends soin de mon boomerang ! Il revient toujours... sauf quand on le lance contre un mur.' }] },
    {
      do: [
        {
          say: [
            'Un boomerang ? Oui, j’en avais un, du temps de mes aventures ! Il est dans mon coffre, là.',
            'Mais j’ai oublié le code... Je l’avais écrit sous forme de calcul, dans un livre de la bibliothèque.',
          ],
        },
      ],
    },
  ],
};

const PELAGIE = {
  type: 'npc',
  name: 'Mme Pélagie',
  role: 'quest',
  gives: ['cat'],
  involved: ['bread'],
  sprite: 'pelagie',
  dialogue: [
    breadRule('bread_pelagie', 'Oh, un pain de Rose ! Comme c’est gentil.'),
    {
      when: { quest: 'cat', status: 'none' },
      do: [
        {
          ask: 'Mon chat Minou a disparu ! Un gros chat roux. Tu veux bien le chercher ?\nQuête : {level:cat}',
          choices: [
            { label: 'Oui', do: [{ startQuest: 'cat' }, { say: 'Merci ! Il adore les coins tranquilles...' }] },
            { label: 'Non', do: [{ say: 'Oh... Minou, où es-tu ?' }] },
          ],
        },
      ],
    },
    {
      when: { quest: 'cat', step: 1 },
      do: [
        { say: 'Minou est rentré ! Tu l’as retrouvé ! Tiens, pour te remercier.' },
        { setFlag: 'cat_home' },
        { give: 'coin', count: 15, announce: true },
        { give: 'hint', count: 1, announce: true },
      ],
    },
    { when: { quest: 'cat', status: 'active' }, do: [{ say: 'Toujours pas de Minou...' }] },
    { do: [{ say: 'Minou ronronne près du feu. Tout va bien.' }] },
  ],
};

const CAT_OUT = {
  type: 'npc',
  name: 'Minou, le chat',
  sprite: 'cat',
  showWhen: { flag: 'cat_found', is: false },
  dialogue: [{ do: [{ say: 'Miaou ! (Minou s’étire, puis file à la maison de Mme Pélagie.)' }, { setFlag: 'cat_found' }] }],
};

const CAT_HOME = { type: 'npc', name: 'Minou, le chat', sprite: 'cat', showWhen: 'cat_found', dialogue: [{ do: [{ say: 'Rrrr... rrrr...' }] }] };

const POSTMAN = {
  type: 'npc',
  name: 'Paulin, le facteur',
  role: 'quest',
  gives: ['letters'],
  sprite: 'postman',
  dialogue: [
    {
      when: { quest: 'letters', status: 'none' },
      do: [
        {
          ask: 'Le vent a renversé ma sacoche ! 5 lettres se sont envolées. Tu m’aides ?\nQuête : {level:letters}',
          choices: [
            { label: 'Oui', do: [{ startQuest: 'letters' }, { say: 'Merci ! Certaines sont tombées dans des pots, chez les gens. Casse-les, ils ne m’en voudront pas.' }] },
            { label: 'Non', do: [{ say: 'Bon... je vais faire ma tournée à vide.' }] },
          ],
        },
      ],
    },
    {
      when: { quest: 'letters', step: 1 },
      do: [
        { say: 'Les 5 lettres ! Tout le monde aura son courrier. Merci !' },
        { take: 'letter', count: 5 },
        { setFlag: 'letters_given' },
        { give: 'coin', count: 30, announce: true },
        { give: 'hint', count: 2, announce: true },
      ],
    },
    { when: { quest: 'letters', status: 'active' }, do: [{ say: 'Tu en as {item:letter} sur 5. Courage !' }] },
    { do: [{ say: 'Une lettre, un sourire ! C’est ma devise.' }] },
  ],
};

const ROSE = {
  type: 'npc',
  name: 'Rose, la boulangère',
  role: 'quest',
  gives: ['bread'],
  sprite: 'seller',
  tile: 'house_floor',
  dialogue: [
    {
      when: { quest: 'bread', status: 'none' },
      do: [
        {
          ask: 'Mon mari est au marché et j’ai 4 pains à livrer ! Tu veux bien les porter ?\nQuête : {level:bread}',
          choices: [
            { label: 'Oui', do: [{ startQuest: 'bread' }, { give: 'bread', count: 4, announce: true }, { say: 'Un pour la maire, un pour Fernand, un pour Mme Pélagie et un pour Gaston, à l’auberge.' }] },
            { label: 'Non', do: [{ say: 'Tant pis, ils mangeront des biscottes.' }] },
          ],
        },
      ],
    },
    { when: { quest: 'bread', status: 'active' }, do: [{ say: 'La maire, Fernand, Mme Pélagie et Gaston. Il te reste {item:bread} pain(s).' }] },
    { do: [{ say: 'Merci pour les livraisons ! Reviens quand tu veux sentir le pain chaud.' }] },
  ],
};

const GASTON = {
  type: 'npc',
  name: 'Gaston, l’aubergiste',
  role: 'quiz',
  involved: ['bread'],
  sprite: 'innkeeper',
  tile: 'house_floor',
  dialogue: [
    breadRule('bread_gaston', 'Le pain de Rose ! Mes clients vont se régaler.'),
    {
      do: [
        { say: 'Bienvenue à l’auberge de la Lanterne ! Ici, on joue au Puissance 4 : il faut aligner 4 jetons, en ligne, en colonne ou en diagonale.' },
        {
          ask: 'Une partie ? Tu as les rouges, tu commences.',
          choices: [
            {
              label: 'Oui',
              do: [
                {
                  minigame: 'puissance4',
                  win: [
                    {
                      if: { counter: 'game_puissance4_win', gte: 6 },
                      then: [{ say: 'Encore battu ! Tu es trop fort pour moi.' }],
                      else: [{ say: 'Bien joué ! Voici 5 {ws:coin}.' }, { give: 'coin', count: 5, announce: true }],
                    },
                  ],
                  lose: [{ say: 'Gagné ! Une astuce : surveille mes diagonales...' }],
                  draw: [{ say: 'Égalité ! Le plateau est plein.' }],
                  quit: [{ say: 'Une autre fois !' }],
                },
              ],
            },
            { label: 'Non', do: [{ say: 'À ta santé !' }] },
          ],
        },
      ],
    },
  ],
};

const LIBRARIAN = {
  type: 'npc',
  name: 'Mlle Plume, la bibliothécaire',
  role: 'quiz',
  sprite: 'teacher',
  tile: 'house_floor',
  dialogue: [
    {
      do: [
        { say: 'Chut ! On est dans une bibliothèque. Mais je veux bien te poser des questions : 2 {ws:coin} par bonne réponse.' },
        {
          ask: 'On essaie ?',
          choices: [
            {
              label: 'Oui',
              do: [
                {
                  quiz: { id: 'plume', count: 3, retryPrice: 5 },
                  perCorrect: { give: 'coin', count: 2 },
                  success: [{ say: 'Trois sur trois ! Tu as lu beaucoup de livres, toi.' }],
                  failure: [{ say: 'Pas mal. Reviens un peu plus tard pour une nouvelle série.' }],
                },
              ],
            },
            { label: 'Plus tard', do: [{ say: 'Chut...' }] },
          ],
        },
      ],
    },
  ],
};

const SELLER = {
  type: 'npc',
  name: 'Firmin, le marchand',
  role: 'shop',
  sprite: 'merchant',
  tile: 'shop_floor',
  dialogue: [
    {
      do: [
        { say: 'Bienvenue au bazar de Bourg-Lanterne ! On trouve de tout, ici.' },
        {
          shop: {
            id: 'aurore',
            title: 'Le bazar de Firmin',
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

const rat = { type: 'enemy', kind: 'rat', sprite: 'rat', hp: 1, speed: 34, behavior: 'chase', sight: 70 };
const bat = { type: 'enemy', kind: 'bat', sprite: 'bat', hp: 1, speed: 44, behavior: 'chase', sight: 90 };
const thief = { type: 'enemy', kind: 'thief', sprite: 'thief', hp: 3, speed: 36, behavior: 'thief', sight: 90, steals: 5 };
const on = (o, tile) => ({ ...o, tile });

// Livres où les codes sont écrits sous forme de calcul (plus ou moins difficile selon l'âge).
const codeBook = (title, intro, byAge) => ({ type: 'sign', tile: 'house_floor', sprite: 'book', title, byAge: byAge.map(([age, calc]) => [age, [intro, calc]]) });

// ----------------------------------------------------------------- intérieurs des maisons (16 x 11)
const INSIDE = { '#': 'house_inwall', _: 'house_floor', k: 'bookshelf', t: 'table', e: 'bed', p: 'pot', f: 'fireplace', o: 'shelf', c: 'counter' };
const interior = (name, rows, objects, back) => ({
  name,
  level: 'aurore',
  region: 'aurore',
  camera: 'rooms',
  legend: INSIDE,
  rows,
  objects: { D: { type: 'warp', tile: 'house_door', to: 'aurore', at: back, facing: 'down' }, ...objects },
});
const letterPot = { type: 'pickup', item: 'letter', hidden: true, tile: 'pot' };
const coinPot = { type: 'pickup', item: 'coin', count: 5, hidden: true, tile: 'pot' };

// ----------------------------------------------------------------- cartes
export const AURORE_MAPS = {
  aurore: {
    name: 'Bourg-Lanterne',
    level: 'aurore',
    region: 'aurore',
    worldExit: true,
    camera: 'follow',
    legend: {
      '.': 'floor', ':': 'cobble', '+': 'plaza', '~': 'canal', '=': 'bridge', R: 'roof_red', U: 'roof_blue', G: 'roof_green', N: 'roof_brown',
      w: 'house_wall', t: 'tower_wall', x: 'tower_clock', l: 'lamp', m: 'stall', f: 'fountain', c: 'crate', '*': 'flowerbed', P: { tile: 'cobble', marker: 'start' },
    },
    rows: [
      '########################################',
      '#.NNNN..GGGG......RRRR...NNNN...UUUU...#',
      '#.NNNN..GGGG......txtt...NNNN...UUUU...#',
      '#.w1ww..w2ww......tttt...w4ww...w5ww...#',
      '#......l........l.t3tt.l......l......l.#',
      '#:::::::::::::::::::::K::::::::::::::::#',
      '#o..**....**.o........**......E..**...o#',
      '#o.$......E...o..........~~~~~~~....o..#',
      '#::::::::::::::::::::::::~~~~~~~:::::::#',
      '#~~~~~=~~~~~~~~~~~~~=~~~~~~~Y.~~~~~=~~~#',
      '#~~~~~=~~~~~~~~~~~~~=~~~~~~~..~~~~~=~~~#',
      '#........................~~~~~~~......h#',
      '#:::::::::::::F:::::::::Q~~~~~~~:::::::#',
      '#.NNNNN..GGGG.......:......l.GGGG.NNNN.#',
      '#.NNNNN..GGGG+++++++++++++++.GGGG.NNNN.#',
      '#.ww6ww..w7ww+m+m+B+++++m+m+.w8ww.wwww.#',
      '#............+++++++ff++++++........ccc#',
      '#......l.....+++++++++++J+++.....l..czc#',
      '#.NNNN...UUUU++++++++++L++++.NNNN.GGGG.#',
      '#.NNNN...UUUU+++e+++++++++++.NNNN.GGGG.#',
      '#.w9ww...wwww.cc....:......c.wwww.wwww.#',
      '#....E..b..........A:....E..........j.M#',
      '#z...............S..P..................#',
      '####################V###################',
    ],
    objects: {
      V: { type: 'warp', tile: 'cobble', worldMap: true, back: [20, 22] },
      1: { type: 'warp', tile: 'house_door', to: 'aurore_mairie', at: [7, 9], facing: 'up' },
      2: { type: 'warp', tile: 'house_door', to: 'aurore_biblio', at: [7, 9], facing: 'up' },
      // Le beffroi, seul toit rouge de la ville : la clé rouge l'ouvre. Dessous : les égouts.
      3: { type: 'warp', tile: 'door_red', to: 'aurore_egouts', at: [7, 20], facing: 'up', key: 'key_red', lockedText: 'Le beffroi est fermé à clé. Une clé rouge, sans doute...' },
      4: { type: 'warp', tile: 'house_door', to: 'aurore_fernand', at: [7, 9], facing: 'up' },
      5: { type: 'warp', tile: 'door_blue', to: 'aurore_bleue', at: [7, 9], facing: 'up', key: 'key_blue', lockedText: 'La maison au toit bleu est fermée à clé. Il faut une clé bleue.' },
      6: { type: 'warp', tile: 'house_door', to: 'aurore_auberge', at: [7, 9], facing: 'up' },
      7: { type: 'warp', tile: 'house_door', to: 'aurore_boulangerie', at: [7, 9], facing: 'up' },
      8: { type: 'warp', tile: 'house_door', to: 'aurore_pelagie', at: [7, 9], facing: 'up' },
      9: { type: 'warp', tile: 'house_door', to: 'aurore_bazar', at: [7, 9], facing: 'up' },
      A: MAYOR,
      B: { ...BAKER, tile: 'plaza' },
      F: { ...FISHER, tile: 'cobble' },
      K: { ...GUARD, tile: 'cobble' },
      L: { ...POSTMAN, tile: 'plaza' },
      M: CAT_OUT,
      // La clé rouge, sur l'îlot du bassin : seul le boomerang peut la rapporter.
      Y: { type: 'pickup', item: 'key_red' },
      z: { type: 'pickup', item: 'letter' },
      S: { type: 'sign', tile: 'floor', text: ['BOURG-LANTERNE. Au nord : la mairie, la bibliothèque et le beffroi. Au centre : le marché.', 'Les maisons dont la porte est sur la rue se visitent. Frappe les pots : il y a parfois des trésors dedans !'] },
      Q: { type: 'sign', tile: 'cobble', text: 'LE BASSIN. Baignade interdite : l’eau est très profonde.' },
      E: on(rat, 'floor'),
      e: on(rat, 'plaza'),
      J: on(thief, 'plaza'),
      j: on(thief, 'floor'),
      h: { type: 'pickup', item: 'heart' },
      $: { type: 'pickup', item: 'coin', count: 5 },
    },
  },

  aurore_mairie: interior(
    'La mairie',
    [
      '################',
      '#kkkk__ff__kkkk#',
      '#______________#',
      '#__ttt____ttt__#',
      '#______________#',
      '#p____________n#',
      '#______________#',
      '#pq__________pp#',
      '#______________#',
      '#______________#',
      '#######D########',
    ],
    {
      n: codeBook('Le registre de la mairie', 'Le code du coffre de la maison au toit bleu est le résultat de ce calcul :', [
        [6, '30 + 30 + 3'],
        [8, '70 − 7'],
        [9, '9 × 7'],
      ]),
      q: coinPot,
    },
    [3, 4],
  ),

  aurore_biblio: interior(
    'La bibliothèque',
    [
      '################',
      '#kkkkkk##kkkkkk#',
      '#______________#',
      '#_kkk_W____kkk_#',
      '#______________#',
      '#_kkk______kkk_#',
      '#______________#',
      '#_tt________n__#',
      '#______________#',
      '#p____________p#',
      '#######D########',
    ],
    {
      W: LIBRARIAN,
      n: codeBook('Le carnet de Fernand', 'Fernand a écrit : « Le code de mon coffre, c’est le résultat de ce calcul : »', [
        [6, '20 + 20 + 2'],
        [8, '50 − 8'],
        [9, '6 × 7'],
      ]),
    },
    [9, 4],
  ),

  aurore_fernand: interior(
    'La maison de Fernand',
    [
      '################',
      '#ee____ff____kk#',
      '#______________#',
      '#______W_______#',
      '#______________#',
      '#__tt_____C____#',
      '#______________#',
      '#p____________p#',
      '#______________#',
      '#______________#',
      '#######D########',
    ],
    { W: FERNAND, C: { type: 'chest', tile: 'house_floor', item: 'boomerang', code: '42', codeTitle: 'Le coffre de Fernand' } },
    [26, 4],
  ),

  aurore_bleue: interior(
    'La maison au toit bleu',
    [
      '################',
      '#ee__________ee#',
      '#______________#',
      '#______C_______#',
      '#______________#',
      '#__tt______tt__#',
      '#______________#',
      '#pq__________qp#',
      '#______________#',
      '#______________#',
      '#######D########',
    ],
    { C: { type: 'chest', tile: 'house_floor', item: 'heart_container', code: '63', codeTitle: 'Le coffre bleu' }, q: letterPot },
    [33, 4],
  ),

  aurore_auberge: interior(
    'L’auberge de la Lanterne',
    [
      '################',
      '#oooo__ff__oooo#',
      '#______________#',
      '#__cccWccc_____#',
      '#______________#',
      '#_tt__tt__tt___#',
      '#______________#',
      '#_tt__tt__tt__q#',
      '#______________#',
      '#p____________p#',
      '#######D########',
    ],
    { W: GASTON, q: letterPot },
    [4, 16],
  ),

  aurore_boulangerie: interior(
    'La boulangerie',
    [
      '################',
      '#oooooo##oooooo#',
      '#______W_______#',
      '#__cccccccccc__#',
      '#______________#',
      '#p____________p#',
      '#______________#',
      '#__tt______tt__#',
      '#______________#',
      '#______________#',
      '#######D########',
    ],
    { W: ROSE },
    [10, 16],
  ),

  aurore_pelagie: interior(
    'La maison de Mme Pélagie',
    [
      '################',
      '#ee____ff____kk#',
      '#______M_______#',
      '#______________#',
      '#__tt____W_____#',
      '#______________#',
      '#______________#',
      '#pq__________pp#',
      '#______________#',
      '#______________#',
      '#######D########',
    ],
    { W: { ...PELAGIE, tile: 'house_floor' }, M: { ...CAT_HOME, tile: 'house_floor' }, q: letterPot },
    [30, 16],
  ),

  aurore_bazar: {
    name: 'Le bazar de Firmin',
    level: 'aurore',
    region: 'aurore',
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
      D: { type: 'warp', tile: 'shop_door', to: 'aurore', at: [3, 21], facing: 'down' },
    },
  },

  // Les égouts, sous le beffroi : 4 salles. Leviers sur des îlots (boomerang), salle à vider, porte à clé,
  // et le Chef des Masques.
  aurore_egouts: {
    name: 'Les égouts',
    level: 'aurore_egouts',
    region: 'aurore',
    camera: 'rooms',
    legend: { '#': 'sewer_wall', _: 'sewer_floor', '~': 'sewer_water' },
    rows: [
      '################################',
      '#______________##______________#',
      '#__R___________##____~~~~~~____#',
      '#___________J__##____~~~~~~__h_#',
      '#______________##____~~y~~~____#',
      '#______________L_____~~~~~~____#',
      '#__I___________##____~~~~~~__B_#',
      '#_______C______##______________#',
      '#______H_______##__c________R__#',
      '#______________##______________#',
      '#######_################_#######',
      '#######g################k#######',
      '#______________##______________#',
      '#__~~~~~~~~~___##___h__________#',
      '#__~~~l~~~~~___##______________#',
      '#__~~~~~~~~~___##______M_______#',
      '#______________##______________#',
      '#__R___________##______A_______#',
      '#__________c___##______________#',
      '#__S___________##______________#',
      '#______________##______________#',
      '#######D########################',
    ],
    objects: {
      D: { type: 'warp', tile: 'stairs_down', to: 'aurore', at: [19, 5], facing: 'down' },
      l: { type: 'lever', tile: 'sewer_floor', flag: 'eg_lever_1' },
      g: { type: 'gate', tile: 'sewer_floor', openWhen: 'eg_lever_1' },
      y: { type: 'lever', tile: 'sewer_floor', flag: 'eg_lever_2' },
      k: { type: 'gate', tile: 'sewer_floor', openWhen: 'eg_lever_2' },
      S: { type: 'sign', tile: 'sewer_floor', text: ['Un levier, au milieu de l’eau... Trop loin pour l’épée.', 'Mais un boomerang, lui, va loin !'] },
      I: { type: 'sign', tile: 'sewer_floor', text: 'Porte à clé à droite. Chasse tous les monstres de cette salle : une clé apparaîtra.' },
      C: { type: 'chest', item: 'key', appearWhen: 'eg_hall_cleared', tile: 'sewer_floor' },
      L: { type: 'locked', key: 'key', tile: 'sewer_floor' },
      B: { type: 'chest', item: 'key_blue', tile: 'sewer_floor' },
      M: {
        type: 'boss',
        name: 'le Chef des Masques',
        sprite: 'masque',
        hp: 6,
        flag: 'masks_defeated',
        meltWith: 'boomerang',
        shots: 'knife',
        invisible: true,
        shieldText: '« Quoi ?! Tu m’as vu ? Ma fumée se dissipe... mais elle ne tombera que si tu réponds juste ! »',
        resistText: 'Il esquive l’épée dans sa fumée ! Étourdis-le d’abord avec le boomerang.',
        defeatedText: 'Le Chef des Masques est vaincu ! Il lâche la Pierre d’Aurore.',
        tile: 'sewer_floor',
      },
      A: { type: 'chest', item: 'stone_aurore', appearWhen: 'masks_defeated', tile: 'sewer_floor' },
      R: on(rat, 'sewer_floor'),
      H: on(bat, 'sewer_floor'),
      J: on(thief, 'sewer_floor'),
      h: { type: 'pickup', item: 'heart', tile: 'sewer_floor' },
      c: { type: 'pickup', item: 'coin', count: 5, tile: 'sewer_floor' },
    },
    roomClear: [{ room: [0, 0], flag: 'eg_hall_cleared' }],
  },
};
