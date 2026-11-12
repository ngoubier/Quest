# Étape 4 — Le projet final : La Quête d'Alia

> Statut : **plan validé, niveaux 1 à 7 réalisés** (jeu : `game/`). Visuels : [`projet-final/visuels.html`](projet-final/visuels.html)
> (carte du monde, plan dessiné de chaque niveau).

## 1. L'histoire

Alia, la licorne arc-en-ciel, est le symbole du **royaume d'Iris**. **Morgor, le Seigneur des Cendres**,
l'a enlevée et la retient dans son château, au fond du **Volcan Noir**. Sans elle, le royaume perd ses
couleurs et va mourir. Pour la délivrer, il faut réunir les **6 pierres magiques** cachées dans 6 régions.
Réunies, elles forment le **Cœur d'Iris**, seule arme capable de vaincre Morgor.

- **8 niveaux** : introduction, 6 niveaux « pierre », niveau final. Chaque niveau a la taille du niveau actuel
  (extérieur ~40×24 cases + maisons + donjon de 4 à 6 salles).
- **Ordre libre** après l'introduction : l'objet de chaque niveau se trouve dans ce niveau.
- **Le royaume se décolore** (option, désactivée par défaut : menu pause → « Royaume terni ») : chaque pierre rend ses couleurs à sa région. Sur la carte du monde, les régions sans pierre restent grises.

## 2. La carte du monde

Obtenue en battant le boss de l'introduction. Nord : Mont Givré · Nord-ouest : Forêt des Murmures ·
Nord-est : Labyrinthe · Sud-ouest : Abysses de Corail · Est : Désert des Mirages · Sud-est : Bourg-Lanterne ·
Sud : Prébois (départ) · **Centre : le Volcan Noir**, fermé tant que les 6 pierres ne sont pas réunies.

## 3. Légende des plans

`P` héros · `N` habitant · `$` marchand · `G` mini-jeu · `E` monstre · `F` monstre rapide · `Z` boss ·
`S` pierre · `C` coffre · `K` clé · `O` bloc à pousser · `o` dalle · `l` levier/cible · `g` grille ·
`k` mur fissuré · `|` `!` portes bleues/rouges · `u` interrupteur cristal · `x` piques · `+` trou ·
`i` glace · `Y` brasero · `c` courant · `v` geyser · `L` lave · `W` entrée · `h` cœur ·
`#` mur · `^` montagne/rocher · `T` arbre · `~` eau · `H r d` maison (mur, toit, porte) · `s` dune · `a` algues · `q` corail · `@` tronc du Grand Chêne · `Q` château · `A` Alia.

## 4. Les niveaux

### Niveau 1 — Prébois (introduction, le village actuel)
- **Histoire** : ouverture en 4 images (royaume, Alia, enlèvement, couleurs qui pâlissent). L'Ancien : « Un sbire de Morgor a volé la carte du royaume ! »
- La quête « La relique perdue » devient **« La carte du royaume »**. Le reste du village est conservé.
- **Arme** : épée. **Mini-jeu** : Morpion avec Bastien le garde.
- **Boss** : Roi Gluant → lâche la **Carte du royaume** → l'Ancien raconte la légende des 6 pierres → la carte du monde s'ouvre.

```
########################################
#..........,...........,....~~~~~~~~~~.#
#.HHHH.....HHHH.............~~~~~~~~~~.#
#.rrrr..N..rrrr..bbb.........~~~~~~~~..#
#.HdHH.....HHdH..bhb.......N...~~~~....#
#....N.....N..$..b.b...................#
#==P===========================......C.#
#......=..............,..........*.....#
#..N...=..N.......E....................#
#......=.......................F.......#
#..,...=...........bb.......,..........#
#......=...........bb..................#
#..N...=.......#######..N......E.......#
#....N.=.......#.....#.................#
#......=.......#..*..#..W..bbb.........#
#..E...=.......#.....#.....b*b.........#
#......=.......###g###.........^^^^^^..#
#......=....l.................^^^^^^^^.#
#......=.......=..............^^^^^^^^.#
#......=========..............^^^W^^^^.#
#.........................~~~~~~~B~~~~~#
#..,......E.................======.N...#
#.......................h....N....,....#
########################################
```

### Niveau 2 — Le Mont Givré · Pierre de Givre
- **Ambiance** : neige, sapins, igloos et maisons en briques de neige, lac gelé, temple de glace.
- **Objet** : **bâton de feu**, dans le coffre du lac gelé (bouton Objet : fait fondre la glace, allume les braseros).
- **Monstres** : bonhommes de neige (boules), loups blancs (rapides), pingouins glisseurs, stalactites.
- **Astuces** : lac gelé où l'on glisse jusqu'à l'obstacle ; blocs de glace qui glissent ; 4 braseros pour ouvrir le temple ; murs de glace fissurés.
- **Mini-jeu** : *Le dernier glaçon* (Nim) avec Pingo. **Quêtes** : pelotes de Mamie Flocon, bois pour le chocolat chaud.
- **Boss** : **Yéti Grondeur** — carapace de glace à faire fondre, question, frappes.

```
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
^^^^^^^^^^^^###############^^^^^^^^^^^^^
^^T..T.....^#_Y_________Y_#^..T.....T.^^
^T....E....^#____O___O____#^.....F....^^
^..........^#_Y____Z____Y_#^..........^^
^..T....T..^#______S______#^..T...T...^^
^....=.....^###k###g###k###^.....=....^^
^....=...........====..........iiiii..^^
^....=.....E.....=..=.........iiiiiiii.^
^....=====.......=..=......F..iiOi.iii.^
^.HH.....=..HH...=..=.........iiiiiiCi.^
^.rr..N..=..rr...=..=.........i.iiiiii.^
^.Hd.....=..dH...=..=.........iiiii.ii.^
^........=.......=..=..........iiiiii..^
^..G.....=====...=..====....T.....=....^
^.HH..$......=...=.....=......E...=....^
^.rr.........=...=.....========...=..T.^
^.Hd...N.....=...=........=.......=....^
^............=====........=========....^
^..T....~~~~~~~~...........=.......E...^
^.......~~~~~~~~....T......=...T.......^
^..T.....h..........E......=.......h...^
^^^^^^^^^^^^^^^^^^^^^^^^^^^P^^^^^^^^^^^^
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
```

### Niveau 3 — La Forêt des Murmures · Pierre de Sève
- **Ambiance** : forêt dense, rivière, cabane du bûcheron, **Grand Chêne** visitable (racines, tronc, cime).
- **Objet** : **arc**. **Monstres** : sangliers (charge), écureuils (glands), guêpes (rapides), champignons sauteurs.
- **Astuces** : cibles à l'arc (passages, ascenseur à poulie), bois qui tourne en rond (suivre les champignons rouges), rondins à pousser dans la rivière.
- **Mini-jeu** : Memory des animaux avec Hulotte la chouette. **Quêtes** : œufs de Hulotte, le renard chapardeur, 5 bûches.
- **Boss** : **Ronce-Noire**, l'arbre corrompu — viser ses yeux, question, frapper son cœur.

```
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
TT...b....TTTTTT@@@@@@@@TTTTT.....b..TTT
T...E......TTTT@@______@@TTT...F......TT
T.....*.....TT@@__S_Z___@@T.....*......T
T..b........TT@@________@@T..........b.T
T.......l....T@@@@@W@@@@@T...l.........T
TT..........TTT....=....TTT............T
TTT.====.......*...=.............====..T
T...=..=...........=.....E.......=..=..T
T...=..======================....=..=..T
T...=...............=.......=....=..=..T
T.b.=...TT..HH......=..TT...=....=.C=..T
T...=..TTT..rr..N...=..TTT..======..=..T
T...=...TT..Hd......=...TT..........=..T
T...=...............=......b......*.=..T
T~~~~B~~~~~~~~~~~~~~B~~~~~~~~~~~~~~~B~~T
T~~~~=~~~~~~~~~~~~~~=~~~~~~~~~~~~~~~=~~T
T...=...E....G......=.......N.......=..T
T...=.......TT......=......TT.......=..T
T.*.=.......TTT.....=.....TTT..F....=..T
T...==============================P=..*T
T..h...b.....T.....E......T......b.....T
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
```

### Niveau 4 — Bourg-Lanterne · Pierre d'Aurore
- **Ambiance** : grande ville, rues, canal, place du marché, beffroi, ~12 maisons dont 8 visitables, égouts (donjon).
- **Objet** : **boomerang** (rapporte les objets, étourdit, interrupteurs à distance).
- **Monstres** : rats, chauves-souris, voleurs masqués.
- **Astuces** : clés de couleur (clé rouge → toit rouge), coffres à code (code caché dans une autre maison, sous forme de calcul), objets cachés dans les maisons.
- **Mini-jeu** : Puissance 4 avec l'aubergiste. **Quêtes** : la pierre volée (enquête), le facteur (5 lettres), le chat de Mme Pélagie, 4 pains.
- **Boss** : **Chef des Masques** (invisible) — boomerang, question, frappes.

```
########################################
#HHHH.HHHH.HHHH.......HHHHHHHH.HHHH.HHH#
#rrrr.rrrr.rrrr.......rrrrrrrr.rrrr.rrr#
#HdHH.HHdH.HdHH...N...HHHHdHHH.HHdH.HdH#
#.................................K....#
#=====================================.#
#.....=...........=.......=.........=..#
#.HHH.=.HHHH.......=.***.=..HHHH....=..#
#.rrr.=.rrrr.N.....=.*o*.=..rrrr..N.=..#
#.HdH.=.HHdH.......=.***.=..HdHH....=..#
#.....=............=..G..=..........=..#
#======================================#
#...=.....=.....=....=......=.....=....#
#.HHH.HHH.=.HHH.=.$..=.HHHH.=.HHH.=.HH.#
#.rrr.rrr.=.rrr.=....=.rrrr.=.rrr.=.rr.#
#.HdH.HdH.=.HdH.=..N.=.HHdH.=.HdH.=.dH.#
#.........=.....=....=......=.....=....#
#~~~~~~~~~B~~~~~B~~~~B~~~~~~B~~~~~B~~~~#
#.....N...=.....=....=......=.....=..C.#
#.HHHHHH..=..E..=....=..HHH.=.....=....#
#.rrrrrr..=.....=....=..rrr.=..F..=.HH.#
#.HHHdHH..=========P=======.=======.dH.#
#.........................g..........K.#
########################################
```

### Niveau 5 — Le Labyrinthe des Mille Portes · Pierre du Temps
- **Magasin à l'entrée** (Lulu) : plan du labyrinthe, bombes, clés, potions.
- **Objet** : **bombes** (murs fissurés, raccourcis). **Monstres** : squelettes, fantômes (rapides, traversent les murs), armures animées.
- **Pièges** : piques en rythme, flèches murales, dalles qui s'effondrent, trous.
- **Portes changeantes** : interrupteurs cristal (bleu ↔ rouge) et portes à horloge (toutes les 20 s, carillon) ; portes à clé.
- **Mini-jeu** : Code secret (3 couleurs, 8 essais) avec Gnomo. **Boss** : **Minotaure de bronze** — le faire percuter un mur.

```
########################################
#S.Z..#.....x....#.........#.....h.....#
#.....#.####.###.#.#######.#.#######.#.#
#..O..|....#...#...#.....#...#.....#.#.#
##o####.##.###.#####.###.#####.###.#.#.#
#.....#..#...#.....#...#.......#...#...#
#.###.##.###.#####.###.#########.#######
#...#....#.F.....#...#.....!.....#.....#
###.######.#####.###.#####.#####.#.###.#
#...#....#.....#...#.....#.#...#...#...#
#.###.##.#####.###.#####.#.#.#.#####.###
#.....#........#...#x..x.#...#.......#.#
#.#####.########.###.##.#########.###.##
#.#...#..E.......#...#..#.......#...#..#
#.#.#.#####.######.###.##.#####.###.####
#...#.....#.#....!.#...#..#...#.u.#...##
#####.###.#.#.####.#.###.##.#.#####.#.##
#.....#.k.#...#..C.#.#.....#.#.....#...#
#.#####.#.#####.####.#.#####.#####.###.#
#.#.....#.....|......#.....+.....#...E.#
#.#.#########.#########.##########.#####
#...#.........G.........#....N.$.......#
####################P###################
########################################
```

### Niveau 6 — Le Désert des Mirages · Pierre du Soleil
- **Ambiance** : dunes, cactus, oasis, campement de huttes, temple enfoui.
- **Objet** : **pelle** (trésors, interrupteurs enterrés). **Monstres** : serpents, scorpions (rapides), vautours, momies.
- **Astuces** : sables mouvants, tempête de sable (suivre les poteaux), statues à tourner face au soleil, carte au trésor.
- **Mini-jeu** : les 3 gobelets avec Sabri. **Quêtes** : la caravane perdue, l'eau de Mémé Dune.
- **Boss** : **Ver des Dunes**, caché sous la grande dune — frapper 3 tambours pour le faire sortir.

```
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
^ssss......*..........ssssssssss.....*.^
^sssss..........*....sssssssssssss.....^
^.sss...E....HHHHH..sssssssZsssssss..F.^
^............rrrrr...sssssssssssssss...^
^..*.........HHdHH....sssssssssssss....^
^.......................sssssssss..*...^
^..HH..HH..===============.............^
^..rr..rr..=.............=......E......^
^..Hd..dH..=...TT~~~TT...=.............^
^...N......=...T~~~~~T...=.....*.......^
^.....G....=...T~~~~~T...=..........*..^
^..HH..$...=....TT~TT....=.............^
^..rr......=......N......=.....HHHHH...^
^..Hd......=..............=....rrrrr...^
^..........=======.........=...HHWHH...^
^.*....E.........=..........=====......^
^.........ss.....=...........*.........^
^........ssss....=......E..........C...^
^...*.....ss.....=...................*.^
^......h.........=.........s...........^
^................P........sss......h...^
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
```

### Niveau 7 — Les Abysses de Corail · Pierre des Marées
- **Accès** : le capitaine Barnabé prête sa **combinaison de plongée** contre sa longue-vue.
- **Objet** : **trident** (frappe loin, à travers les algues). **Monstres** : crabes, méduses (rapides), anguilles, poissons-lanternes.
- **Bouteille d'oxygène** : temps limité (compte à rebours). Si le niveau n'est pas fini à temps, on le recommence.
- **Astuces** : nage, courants, algues qui cachent des passages, coquillages-interrupteurs, portes de corail.
- **Mini-jeu** : le chant des coquillages (Simon) avec Coralie la sirène. **Boss** : **Kraken** — tentacules puis tête.

```
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^~
~^aaa..q....^^^^^^^^^^^^^^^...q....aa.^~
~^aa.......^^..........Z..^^..........^~
~^.....F...^^..........S..^^...E......^~
~^..q......^^.............^^.....q....^~
~^.........^^^^^^^g^^^^^^^^^......aa..^~
~^...........cccccccccc...............^~
~^.q...........E.........q.....qqq....^~
~^......aaa............HHHH...q.C.q...^~
~^......aNa.....q......rrrr...q...q...^~
~^......aaa...........HHdHH....qqq....^~
~^...E.........G......................^~
~^.qq.......cccccc.........N...F......^~
~^.qq..q...........aa........$........^~
~^.......E.........aa.........q.......^~
~^..........................aa......q.^~
~^.....q..........E.........aa....E...^~
~^...aa..........................h....^~
~^...aa...q.........P...........q.....^~
~^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
```

### Niveau 8 — Le Volcan Noir (final)
- **Accès** : les 6 pierres forment le Cœur d'Iris, la porte du volcan s'ouvre.
- **Ambiance** : sol très sombre, lave, geysers, arbres morts ; campement de la forge.
- **Objectif** : réunir **300 pièces** pour l'**Armure d'Iris** (Brasier le forgeron). Monstres plus généreux, coffres, pépites, questions du sage (3 pièces), mini-jeu *Plus ou moins*.
- **Monstres rapides** : chauves-souris de feu, diablotins, loups de lave, golems. **Pièges** : lave (gelée par la Pierre de Givre), geysers, rochers, dalles.
- **Château** : 4 à 6 salles qui demandent tous les objets.
- **Morgor, 3 phases** : bouclier noir (rayon du Cœur d'Iris) → pluie de feu (armure, bulle, ralentissement) → questions et sbires → frappes finales.
- **Fin** : Alia libérée, les couleurs reviennent sur toute la carte, fête à Prébois ; on peut continuer à jouer.

```
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
^LLLLLLLLLLL#QQQQQQQQQQQQQQ#LLLLLLLLLLL^
^LLLLLLLLLLL#Q____________Q#LLLLLLLLLLL^
^LLLL^^^LLLL#Q_____A______Q#LLLL^^^LLLL^
^LLL^^.^^LLL#Q_____Z______Q#LLL^^.^^LLL^
^LLLL^^^LLLL#Q____________Q#LLLL^^^LLLL^
^LLLLLLLLLLL#QQQQQQgQQQQQQQ#LLLLLLLLLLL^
^LLLLLLLLLLLLLLLLLLBLLLLLLLLLLLLLLLLLLL^
^LLLLLLLLLLLLLLLLLLBLLLLLLLLLLLLLLLLLLL^
^.........v.......=......v........F....^
^..F..............=..............,.....^
^.....,....LLL....=.....LLLL...........^
^.........LLLLL...====..LLLLL....*.....^
^....*.....LLL.......=...LLL......F....^
^...................=.......v..........^
^..HH.....F.........=..................^
^..rr..$............=.....F.....,......^
^..Hd..N....,.......=..........LLLLLL..^
^...................=......*...LLLLLL..^
^..v.....LLLL.......=..........LLLLLL..^
^.......LLLLLL....F.=....v.........h...^
^...................P..................^
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
```

## 5. Armes et objets

| Niveau | Objet | Usage |
|---|---|---|
| Prébois | Épée | frapper, buissons, leviers |
| Mont Givré | Bâton de feu | fondre la glace, braseros |
| Forêt | Arc | cibles, monstres perchés |
| Bourg-Lanterne | Boomerang | rapporter, étourdir, interrupteurs lointains |
| Labyrinthe | Bombes | murs fissurés |
| Désert | Pelle | creuser |
| Océan | Combinaison + Trident | nager, frapper loin |
| Volcan | Armure d'Iris | dégâts de Morgor divisés par 2 |

Nouveau bouton **Objet** (touche E, X manette, bouton tactile) pour l'objet choisi dans le sac.

## 6. Les pierres

| Pierre | Région | Pouvoir immédiat |
|---|---|---|
| Givre | Mont Givré | gèle lave et eau |
| Sève | Forêt | rend 1 cœur par minute |
| Aurore | Bourg-Lanterne | éclaire, révèle les passages secrets |
| Temps | Labyrinthe | ralentit les monstres rapides |
| Soleil | Désert | épée de feu (coups doubles) |
| Marées | Océan | bulle qui bloque un coup |

## 7. Mini-jeux (contre des habitants, difficulté selon l'âge)

Morpion (Prébois) · Le dernier glaçon (Mont Givré) · Memory (Forêt) · Puissance 4 (Bourg-Lanterne) ·
Code secret (Labyrinthe) · 3 gobelets (Désert) · Chant des coquillages (Océan) · Plus ou moins (Volcan).

## 8. Feuille de route

| Lot | Contenu | Effort |
|---|---|---|
| 1 ✓ | Histoire en images, carte du monde, décoloration, intro réécrite, Morpion, ambiance médiévale seule | L |
| 2 ✓ | Mont Givré : bouton Objet, glace, blocs glissants, braseros, bâton de feu, Nim, Yéti | L |
| 3 ✓ | Forêt : arc, cibles, Grand Chêne 3 étages, Memory, Ronce-Noire | L |
| 4 ✓ | Bourg-Lanterne : boomerang, clés de couleur, coffres à code, Puissance 4 | L |
| 5 ✓ | Labyrinthe : bombes, cristaux, portes à horloge, pièges, Code secret, Minotaure | L |
| 6 ✓ | Désert : pelle, sables mouvants, tempête, gobelets, Ver | M |
| 7 ✓ | Océan : nage, courants, bouteille d'oxygène, trident, Simon, Kraken | L |
| 8 | Volcan, armure, château, Morgor, fin | L |

## 9. Décisions

| Sujet | Décision |
|---|---|
| Sous l'eau | **Bouteille d'oxygène à temps limité** ; temps écoulé = on recommence le niveau |
| Ambiances | **Médiéval-fantastique seulement** (plus de station spatiale ni de ville) |
| Démarrage | Lot 1, puis le Mont Givré, la Forêt des Murmures, Bourg-Lanterne, le Labyrinthe, le Désert et les Abysses |
| Noms, ordre libre, pouvoir dès chaque pierre, armure à 300 pièces | retenus par défaut (pas d'objection) |

## 10. Lot 1 — ce qui est fait

Le jeu se lance depuis `game/` (`npm start` puis http://localhost:8080/game/).

- **Histoire en images** à chaque nouvelle partie (5 pages, Start pour passer) — `gameplay/ui/StoryScene.js`, `game/data/story.js`.
- **Prébois** : l'Ancien raconte l'enlèvement d'Alia ; la quête principale devient « La carte du royaume » ;
  le Roi Gluant garde la carte ; la rapporter à l'Ancien ouvre la carte du monde — `game/data/prebois.js`.
- **Carte du monde** : sortie à l'ouest du village (ou menu pause). 8 lieux ; seuls Prébois est ouvert pour
  l'instant, les autres affichent « en construction » ; le Volcan Noir demande les 6 pierres —
  `gameplay/ui/WorldMapScene.js`, `game/data/worldmap.js`.
- **Le royaume se décolore** : Prébois est grisé et retrouve ses couleurs pierre après pierre (`colorLoss`).
- **Morpion** contre Bastien le garde (une fois sa quête finie) ; force selon l'âge ; 3 pièces par victoire
  (les 5 premières) — `gameplay/minigames/`, action `{ minigame: 'morpion', win, lose, draw, quit }`.
- **Une seule ambiance** (médiéval) : la touche Tab ne change plus rien dans le jeu.

## 12. Ajustements

- **Graphismes** : le jeu utilise les profils d'affichage (mobile lisible, **PC en haute définition**, vue jusqu'à 20 tuiles),
  voir `06-affichage-mobile-pc.md`. Les nouveaux dessins (neige, Yéti...) sont agrandis automatiquement ; à redessiner en HD plus tard.
- **Énigmes** : banque passée de ~270 à ~780 questions (`content/quiz/bank-plus.js`) ; les jours, mois et saisons
  sont en « Vie quotidienne », l'Histoire ne contient que le passé (vérifié par un test).
- **Royaume terni** : option du menu pause, désactivée par défaut.

## 11. Lot 2 — le Mont Givré (fait)

Données : `game/data/givre.js` · dessins : `game/theme-givre.js`.

- **Bouton Objet** (touche E ou X, bouton X manette, bouton X tactile) : utilise l'objet équipé, affiché
  à côté des cœurs. On choisit l'objet dans le sac (« Équiper »). `items[id].tool(adv, hero)`.
- **Bâton de feu** : lance une flammèche (`gameplay/actors/Projectile.js`). Dans le coffre du lac gelé.
- **Glace glissante** (propriété de tuile `slippery`) : le héros glisse tout droit jusqu'à un obstacle.
  Le lac est une petite énigme (au moins deux glissades pour atteindre le coffre — vérifié par un test).
- **Braseros** (`brazier`) : les 4 allumés ouvrent la grille du temple. **Murs de glace** (`icewall`) : fondent au feu.
- **Bloc de glace** (`block` avec `slide: true`) : glisse jusqu'au prochain obstacle ; à amener sur la dalle.
- **Monstres** : bonhommes de neige (lancent des boules, `shooter`), loups (rapides), pingouins (foncent tout droit, `charger`).
- **Yéti Grondeur** : carapace de glace (`meltWith: 'fire'`) → question → coups d'épée ; il lance des boules de neige.
  Vaincu : coffre de la **Pierre de Givre**, +1 cœur, et le Mont Givré retrouve ses couleurs.
- **Mini-jeu** : *Le dernier glaçon* contre Pingo (`gameplay/minigames/NimScene.js`), force selon l'âge.
- **Quêtes** : « La Pierre de Givre » (Nanouk), « Les pelotes de Mamie Flocon » (récompense : 20 pièces + 1 cœur).
- **Habitants** : Nanouk, Mamie Flocon, Pingo, Igor le savant (questions, 2 pièces par bonne réponse), Anouchka (igloo-magasin, chocolat chaud).
- Le pouvoir de la Pierre de Givre (geler la lave) servira au Volcan Noir.

## 13. Lot 3 — la Forêt des Murmures (fait)

Données : `game/data/seve.js` · dessins : `game/theme-seve.js` (arbres, champignons, rondins, cabane,
écorce et porte du Grand Chêne, habitants humains : aussi en haute définition sur PC).

- **Rondins** (`block` avec `sink: true`) : poussés dans la rivière (tuile `river`, propriété `fillable`),
  ils coulent et font un passage. Il en faut deux, l'un derrière l'autre ; la rive n'est ouverte qu'à cet endroit.
  La case comblée est mémorisée (drapeau `fill:carte:x,y`, appliqué au chargement de la carte).
- **Le bois qui tourne en rond** : 3 clairières qui se ressemblent (`seve_bois1..3`). La bonne sortie est
  du côté des champignons rouges (nord, ouest, nord) ; une mauvaise ramène au début (« Tu tournes en rond... »,
  option `message` des sorties). Au bout : la clairière et le coffre de l'**arc**.
- **Arc** : flèches orientées (`hero.shoot('arrow')`, images `arrow_side/up/down`). Un nouvel objet à
  utiliser s'équipe tout seul.
- **Cibles** (`target`) : touchées par une flèche, elles lèvent leur drapeau. Les deux cibles des étangs ouvrent
  les ronces devant le Grand Chêne (`gate` avec `sprite: 'bramble'`). Les flèches passent au-dessus de l'eau
  et des trous (propriété `low`).
- **Le Grand Chêne** (`seve_chene`, 3 étages de 2 salles, reliés par des échelles) : racines (une cible ouvre
  les ronces devant l'échelle, un œuf), tronc (une cible fait descendre la **nacelle** au-dessus du trou, salle
  à vider → clé → porte), cime (Ronce-Noire et la Pierre de Sève).
- **Monstres** : sangliers (foncent), guêpes (rapides), écureuils (lancent des glands), champignons sauteurs
  (nouveau comportement `hopper` : petits bonds vers le héros).
- **Ronce-Noire** : boss immobile (`still: true`) qui lance des épines. Une flèche dans les yeux (`meltWith: 'arrow'`)
  → question → coups d'épée. Phrases propres (`shieldText`, `resistText`) et bouclier dessiné (`ronce_shield`).
  Vaincue : coffre de la **Pierre de Sève**, +1 cœur, et la forêt retrouve ses couleurs.
- **Mini-jeu** : *Memory des animaux* contre Hulotte (`gameplay/minigames/MemoryScene.js`, logique dans
  `memory.js`) : 6 paires, on rejoue après une paire ; Hulotte retient plus ou moins les cartes selon l'âge.
- **Quêtes** : « La Pierre de Sève » (Mère Sylve), « Les œufs de Hulotte » (récompense : 10 pièces + 1 cœur),
  « Les 5 bûches de Sylvain » (cachées dans des buissons ; 25 pièces + 2 indices).
- **Habitants** : Mère Sylve, Sylvain le bûcheron, Hulotte, Basile l'ermite (questions, 2 pièces par bonne
  réponse), Noisette (cabane-magasin, miel).
- Pas encore fait (prévu au plan) : le renard chapardeur, les écureuils perchés à viser.

## 14. Lot 4 — Bourg-Lanterne (fait)

Données : `game/data/aurore.js` · dessins : `game/theme-aurore.js` (pavés, place, toits de 4 couleurs, façades,
portes, beffroi et son horloge, lanternes, habitants humains : aussi en haute définition sur PC).

- **Enquête** (quête principale « La Pierre d’Aurore volée », Madame Lumen la maire) : 3 témoins (Marius au marché,
  Lucien sur le quai, Hector devant le beffroi) → le boomerang de Fernand → la clé rouge sur l’îlot → les égouts
  → le Chef des Masques → la Pierre d’Aurore.
- **Boomerang** (`gameplay/actors/Boomerang.js`, `hero.throwBoomerang()`) : il part, puis revient en passant
  au-dessus des murs. Il **rapporte les objets** (la clé rouge sur l’îlot, une lettre derrière des caisses),
  **étourdit** les monstres (`enemy.stun(t)`, petites étoiles) et **actionne les leviers** de loin
  (`Lever.onProjectile`). Il passe au-dessus de l’eau, des caisses et des massifs de fleurs (propriété `low`).
- **Clés de couleur** : une sortie peut être fermée à clé (`warp` avec `key: 'key_red'`, `lockedText`) ;
  la clé l’ouvre pour toujours (drapeau `unlocked:carte:x,y`). La clé rouge ouvre le beffroi (seul toit rouge),
  la clé bleue (trouvée dans les égouts) la maison au toit bleu.
- **Coffres à code** (`chest` avec `code: '42'`) : un cadenas à roues (`gameplay/ui/DigitLockScene.js`, tactile).
  Le code est écrit dans un livre d’une autre maison sous forme de **calcul adapté à l’âge**
  (`sign` avec `byAge` : `20 + 20 + 2` à 6 ans, `50 − 8` à 8 ans, `6 × 7` dès 9 ans ; vérifié par un test).
- **8 maisons à visiter** (mairie, bibliothèque, Fernand, maison bleue, auberge, boulangerie, Mme Pélagie, bazar)
  et des **pots à casser** (tuile `pot`, coupable) qui cachent des lettres et des pièces.
- **Monstres** : rats, chauves-souris, **voleurs masqués** (comportement `thief`, option `steals: 5` :
  ils prennent des pièces et s’enfuient ; les vaincre les rend).
- **Égouts** (`aurore_egouts`, 4 salles) : levier sur un îlot (boomerang) → grille, salle à vider → clé → porte,
  second levier → grille du boss, coffre de la clé bleue.
- **Le Chef des Masques** : boss **invisible** (`invisible: true` : on ne voit que son ombre et un reflet)
  qui lance des couteaux. Un coup de boomerang (`meltWith: 'boomerang'`) le dévoile → question → coups d’épée.
- **Mini-jeu** : *Puissance 4* contre Gaston à l’auberge (`gameplay/minigames/Connect4Scene.js`, logique dans
  `connect4.js` : recherche sur 4 ou 5 coups, plus ou moins souvent selon l’âge).
- **Quêtes secondaires** : « Les lettres du facteur » (5 lettres ; 30 pièces + 2 indices), « Le chat de
  Mme Pélagie » (PNJ qui n’apparaît que sous condition : `showWhen`), « Les 4 pains de Rose » (livrer la maire,
  Fernand, Mme Pélagie et Gaston ; 20 pièces + un gâteau).
- **Ajustement général** : un monstre blesse le héros dès qu’il le touche, même si le héros ne bouge pas
  (avant, il s’arrêtait juste contre lui).

## 15. Lot 5 — le Labyrinthe des Mille Portes (fait)

Données : `game/data/temps.js` · dessins : `game/theme-temps.js` (murs, sols et murs fissurés du labyrinthe, haies,
habitants humains : aussi en haute définition sur PC).

- **La cour d'entrée** : Chronos (quête principale), la boutique de Lulu (plan, bombes à l'unité, potions) et Gnomo.
- **Bombes** (`gameplay/actors/Bomb.js`, `hero.placeBomb()`, une à la fois) : le sac de 10 bombes est dans la
  première galerie. Elles ouvrent les **murs fissurés** (propriété de tuile `bombable`, mémorisée : drapeau
  `blast:carte:x,y`), blessent les monstres (et le héros trop proche). Le nombre restant s'affiche sur l'objet
  équipé (`showCount`). Les monstres du labyrinthe en lâchent parfois.
- **Interrupteurs cristal** (`crystal`) : épée, flèche, boomerang ou bombe les basculent ; les blocs rouges et bleus
  sont des grilles (`openWhen` sur le même drapeau, images levée / baissée avec `openSprite`). Deux cristaux :
  un avant le bloc rouge, un entre le rouge et le bleu.
- **Portes à horloge** (`gate` avec `every: 4, phase: 0|1`) : l'une s'ouvre quand l'autre se ferme ;
  elles clignotent avant de changer, un carillon sonne.
- **Pièges** : piques en rythme (`spikes`, elles tremblent avant de sortir), lance-flèches dans les murs (`arrowtrap`),
  **dalles qui s'effondrent** (`crumble`) au-dessus des **trous** (propriété de tuile `pit` : on tombe, on perd un
  demi-cœur et on revient au dernier endroit sûr).
- **Plan du labyrinthe** (`gameplay/ui/MiniMapScene.js`) : acheté chez Lulu, utilisable depuis le sac ; il montre les
  murs, le héros, les coffres et les murs fissurés.
- **Monstres** : squelettes, **fantômes** (comportement `ghost` : ils traversent les murs), armures animées (lentes, 2 de dégâts).
- **Le Minotaure de bronze** (`meltWith: 'wall'`, `dashSpeed`) : il fonce tout droit jusqu'au mur ou à un pilier ;
  sonné 3 secondes, un coup d'épée déclenche la question, puis on frappe.
- **Mini-jeu** : *Code secret* avec Gnomo (`gameplay/minigames/MastermindScene.js`, logique dans `mastermind.js`) :
  3 couleurs, 8 essais, carrés verts (bien placées) et jaunes (mal placées).
- **Quête secondaire** : « Les 3 sabliers de Lulu », chacun derrière un mur fissuré (10 pièces + 1 cœur).
- **Raccourci** : un mur fissuré relie la salle de la clé de bronze à la salle des bombes (pour revenir après les
  dalles effondrées).

## 16. Lot 6 — le Désert des Mirages (fait)

Données : `game/data/soleil.js` · dessins : `game/theme-soleil.js` (sable, dunes, cactus, palmiers, habitants humains :
aussi en haute définition sur PC).

- **Statues** (`statue`) : chaque coup d'épée les tourne d'un quart de tour ; leur drapeau est levé quand elles
  regardent le soleil (vers le haut). Les 4 ouvrent la grille du **temple enfoui**.
- **Temple** (2 salles) : chasser les momies ouvre la seconde, où sont la **pelle** et un trésor enterré.
- **Pelle** (`hero.dig()`) : creuse la case devant (propriété de tuile `diggable`) ; les objets enterrés réagissent
  avec `onDig()` : trésors (`buried`, un petit reflet brille de temps en temps), **tambours** (`drum` avec `buried`).
  Ailleurs, on trouve parfois une pièce.
- **Sables mouvants** (propriété `quicksand`) : on avance lentement et on s'enfonce ; au bout de 1,6 s, on est
  ramené au dernier endroit sûr avec un demi-cœur en moins.
- **Tempête de sable** (`storm` sur la carte : zone et condition) : on ne voit presque rien, sauf autour du héros et
  des **poteaux à lanterne** (`post`, tag `beacon`). La zone est fermée de dunes : une seule entrée, un chemin balisé
  au milieu des sables mouvants. Elle se calme quand le Ver est vaincu.
- **La grande dune** : 3 tambours enterrés ; déterrés et frappés, ils réveillent le **Ver des Dunes**
  (`hiddenUntil` : absent jusque-là). Il replonge sous le sable (`burrow` : une bosse qui suit le héros, intouchable)
  puis ressort : on le frappe → question → coups d'épée. Il crache des rochers.
- **Monstres** : serpents, scorpions (rapides), vautours (volent au-dessus de tout), momies (dans le temple).
- **Mini-jeu** : *Les 3 gobelets* avec Sabri (`gameplay/minigames/CupsScene.js`, logique dans `cups.js`) :
  plus d'échanges et plus rapides avec l'âge.
- **Quêtes secondaires** : « La caravane perdue » (Rachid, au bout d'un cul-de-sac dans la tempête ; récompense :
  la **carte au trésor**, qui montre les trésors enterrés), « L'eau de Mémé Dune » (remplir la gourde au puits).

## 17. Lot 7 — les Abysses de Corail (fait)

Données : `game/data/marees.js` · dessins : `game/theme-marees.js` (mer, ponton, fonds, récifs, coraux, habitants
humains : aussi en haute définition sur PC).

- **La plage** : le capitaine Barnabé prête sa **combinaison de plongée** contre sa **longue-vue**, tombée dans la
  crique aux rochers (gardée par des crabes). On plonge au bout du ponton : sortie avec `requires: { item }` (sans
  prendre l'objet) et `lockedText`.
- **Sous l'eau** (`underwater: { air: 180 }` sur la carte) : teinte bleue, bulles, on nage un peu moins vite.
  La **bouteille d'oxygène** se vide (jauge en bas de l'écran, alerte à 20 s) ; les **bulles d'air** (+45 s) la
  remplissent ; la **corde** ramène à la surface (et la remplit). **Plus d'air : on recommence la plongée**
  (le niveau revient comme à l'entrée de la plongée).
- **Algues** (tuile coupable) : l'épée ou le trident les coupe ; elles cachent la grotte du trident et des perles.
- **Trident** (`hero.shoot('trident', { cuts: true })`) : lancé loin, il coupe les algues qu'il traverse et passe
  au-dessus du corail (propriété `low`).
- **Courants** (propriété de tuile `current: [dx, dy]`) : plus forts que la nage. Celui du milieu remonte (retour
  rapide vers la corde), celui de l'est descend vers la salle du bas.
- **Coquillages magiques** (cibles avec `hitBy: 'any'`, `sword: true`, `sprite: 'shell'`) : le premier au milieu du
  corail, le deuxième derrière des algues, le troisième au bout d'un courant trop fort (à viser de loin). Ils
  ouvrent les **portes de corail**.
- **Le Kraken** : 4 **tentacules** (comportement `sway`) le protègent (`guardedBy: { counter: 'kills_tentacle', gte: 4 }`,
  `guardText`) ; ensuite sa tête : question → coups. Il crache de l'encre.
- **Monstres** : crabes, méduses (traversent tout), anguilles (foncent), poissons-lanternes.
- **Mini-jeu** : *Le chant des coquillages* avec Coralie (`gameplay/minigames/SimonScene.js`, logique dans `simon.js`) :
  4 coquillages = 4 flèches, une note de plus à chaque manche (4 à 6 selon l'âge).
- **Quête secondaire** : « Les perles de Coralie » (3 perles derrière des algues ; 1 cœur + 10 pièces).

