# Graphismes mobile et PC

> Statut : **réalisé** · à valider dans l'essai n°2 (liens de comparaison sur la page d'accueil).

Le même jeu, avec la même logique (collisions, vitesses, cartes), mais des **graphismes
adaptés à l'appareil**. Le jeu choisit tout seul ; on peut forcer un profil dans l'adresse.

| Profil | Quand | Adresse |
|---|---|---|
| **Mobile** | écran tactile (téléphone, tablette) | `?mobile` |
| **PC (haute définition)** | souris / clavier | `?pc` (`?pc&hd=0` sans HD) |
| **Classique** | pixel art d'origine, sans traitement | `?classic` |

## Mobile : plus lisible

- **Contours épais** autour des personnages, objets et monstres (1,5 pixel au lieu de 1) :
  les silhouettes se détachent même sur un petit écran.
- **Couleurs plus franches** (+22 % de saturation, +12 % de contraste).
- **Moins de petits détails** : deux fois moins de mouchetures et de touffes d'herbe. Le sol
  est plus calme, et ce qui compte (personnages, objets) se voit mieux.
- **Diagonales lissées** (agrandissement « Scale2x ») : les formes sont moins en escalier.
- **Tout est plus gros en paysage** : 10 tuiles de haut au lieu de 11, et la largeur suit
  l'écran. En portrait, la vue reste à 12 tuiles de large.
- **Bandeau plus grand en paysage** : icônes, chiffres et boutons Quêtes et Sac 25 % plus
  grands. En portrait, il garde sa taille (la place manque).
- **Boutons tactiles** qui grandissent avec l'écran (croix jusqu'à 156 px, A/B jusqu'à 80 px).

## PC : haute définition et vue large

- **Images 2 fois plus fines** que la grille du jeu (32×32 pixels pour une case de 16×16).
- **Redessinés à la main en HD** :
  - **le héros**, unique : capuche à longue pointe, cape rouge, épée dans le dos, bourse,
    bottes. On le reconnaît de face, de dos et de profil ;
  - **les habitants**, chacun avec un signe distinctif : barbe blanche (l'Ancien), tablier et
    moustache (le marchand), armure et casque à crête (le garde), lunettes (la maîtresse,
    l'érudit), boîte à outils et marteau (le charpentier), écharpe et plume (l'écrivain),
    taches de rousseur (Léon), cheveux longs… Grands yeux, joues, ombrages, pas animés ;
  - **les monstres** : gluant (gelée brillante, reflets, gouttes), chauve-souris (ailes
    membraneuses), et **le Roi Gluant** (64×64, couronne à joyaux, bouclier en bulle irisée) ;
    le chiot compagnon ;
  - **les objets** : coffre, pièce, clé, cœurs, potion, épée, fleurs et bouquet, ruban,
    champignon, amulette, pomme, gâteau, tarte, planches, clous, ampoule d'indice, grand sac,
    bloc, dalle, grille, porte verrouillée, levier, nuage de fumée ;
  - **les bâtiments** : toit de chaume en bottes de paille, façade à colombages avec fenêtre
    à carreaux et jardinière, porte en planches avec pentures et lanterne, porte de maison
    en arche, falaise, entrée de grotte ;
  - **l'intérieur du magasin** : parquet, murs en planches, étagères (bouteilles, bocaux,
    pots), comptoir et caisse ;
  - **la grotte** : sol et murs de pierre, rochers, torches animées, sortie ; **le pont**
    (cassé et réparé) ;
  - **le terrain** : herbe, chemin, eau, murs de briques, arbres et buissons.
- **Tout le reste** est agrandi automatiquement : lissage des diagonales, puis finition HD
  (lumière douce venant d'en haut à gauche, grain fin, bord des silhouettes légèrement
  assombri pour donner du volume).
- **Vue plus large** : jusqu'à 20 tuiles de large si la fenêtre est assez large (au lieu de 16).
  - À l'extérieur, on voit plus loin autour du héros.
  - Dans les salles (grotte, magasin), la salle est centrée et les **salles voisines sont
    visibles mais assombries** : on sait toujours où l'on joue.
- **Bandeau plus riche** : quand une quête est en cours, son **objectif** s'affiche à côté
  des boutons, s'il y a la place.

## Lumière, ambiance et profondeur

Chaque lieu a sa **lumière** et son **atmosphère**, dessinées par-dessus le monde. Pour comparer,
ajoutez `?fx=0` à l'adresse (sans effets), `?fx=lite` (version mobile) ou `?fx=1` (version PC).

| Lieu | Ambiance |
|---|---|
| Prébois | fin d'après-midi d'été : lumière dorée, ombres de nuages qui passent, rayons de soleil, pollen |
| Grottes, égouts, temple enfoui | pénombre ; les **torches** éclairent, le héros porte une lanterne |
| Mont Givré | lumière froide, **neige qui tombe** ; temple de glace bleuté et scintillant |
| Forêt des Murmures | sous-bois vert et doré, rayons entre les arbres, **feuilles qui tombent** ; lucioles dans le Grand Chêne |
| Bourg-Lanterne | **le soir tombe**, les lanternes des rues s'allument |
| Labyrinthe | lumière irréelle, poussière d'étoiles |
| Désert des Mirages | soleil écrasant, **sable qui vole** |
| Plage / Abysses | lumière fraîche ; sous l'eau, bleu profond et rayons venus de la surface |
| Volcan Noir | ciel de braise, **cendres**, la **lave éclaire** ; dans le château, braises et pénombre |
| Maisons et boutiques | lumière chaude et feutrée, poussière dans la lumière |

En plus :

- **Ombres douces** sous les personnages, monstres et objets (le soleil vient d'en haut à gauche).
- **Ombres au pied des murs** (en dégradé) et **ombres rondes** sous les arbres et rochers isolés.
- **Grands arbres sur 2 cases** (arbres du village et de la forêt, sapins, palmiers, arbres morts) :
  la cime déborde sur la case du dessus et passe **devant** le héros ; elle devient transparente quand
  quelqu'un passe derrière. Le passage bloqué ne change pas (seule la case du tronc bloque).
- **Transitions entre terrains** : plus de damier. L'herbe mord sur les chemins avec un bord irrégulier,
  la neige sur les sentiers, le sable et les cendres sur leurs chemins ; l'eau et la lave ont une **berge**
  qui suit la découpe, avec l'écume (ou la lueur de la lave) tout le long. Les arbres et buissons font
  déborder l'herbe (ou la neige, le sable...) sur laquelle ils sont posés.
- **Décor vivant** : des touffes d'herbe ondulent au vent, avec de temps en temps une rafale qui traverse
  la carte ; les cimes des arbres se balancent ; des reflets scintillent sur l'eau ; des bulles montent
  dans les Abysses.
- Les **sources de lumière** brillent : torches, lanternes, cheminées, forges, lave, braseros allumés,
  flammèches du bâton de feu.
- Le jeu reste **très lisible** : la pénombre ne descend jamais trop bas, et les salles sombres
  du château gardent leur règle (on n'y voit qu'autour du héros).

| Profil | Ambiance |
|---|---|
| PC | complète |
| Mobile | légère : sans rayons de soleil ni ombres de nuages, moitié moins de particules |
| Classique | aucune |

## Effets de jeu et interface

- **Coups** : quand on touche un monstre, une petite étoile blanche marque l'impact, des étincelles
  partent dans le sens du coup et le monstre devient tout blanc un instant. Sur un boss, l'image
  s'arrête une fraction de seconde : on sent que le coup est fort.
- **Monstre vaincu** : une gerbe d'éclats colorés en plus du petit nuage habituel.
- **Pas du héros** : de petits nuages de poussière, de la couleur du sol (blancs sur la neige, dorés
  sur le sable, gris sur les cendres ; rien sur la glace ni sous l'eau).
- **Butin** : les pièces et objets qui tombent d'un monstre sautent deux fois avant de se poser ;
  tout ce qui est à ramasser brille de temps en temps.
- **Police** : une police ronde et très lisible pour les enfants (Nunito), et Fredoka pour le nom du jeu.
  Les fichiers sont dans `game/fonts/` (licence libre OFL), le jeu marche donc sans Internet.
- **Fenêtres** : dialogues, menus, sac, quêtes, magasin, quiz et mini-jeux sont dans un cadre en bois
  aux coins en laiton ; le bandeau du haut et le bas de l'histoire en images aussi.
- **Écran titre** : une vraie illustration (le royaume d'Iris au lever du jour, son arc-en-ciel,
  Alia la licorne entourée d'étincelles) et le nom du jeu en lettres dorées.

Les effets de jeu se coupent avec `?fx=0` comme le reste ; la police et les cadres restent.

## Comment ça marche (technique)

- Effets de jeu : `gameplay/actors/juice.js` (`Burst` : gerbe de particules, `Impact`, `hitFx`,
  `defeatFx`, `dustFx`, `flashOver`). Arrêt sur image : `adv.hitstop(secondes)`. Un acteur avec
  `bigHit` (le boss) a des coups plus forts. Poussière : `props.dust` des tuiles (`game/themes.js`).
- Cadres : `engine/ui/panel.js` (`drawPanel`, image posée en 9 morceaux, ou fond uni et liseré si le
  style n'a pas d'image). Le cadre en bois et les polices : `game/art/ui.js` ; l'écran titre :
  `game/art/title.js`.

- `engine/graphics/Ambience.js` : la couche d'ambiance du moteur (teinte, lumière du ciel, pénombre
  percée par les lumières, rayons, ombres de nuages, particules, vignette). Le jeu décrit chaque lieu
  par un préréglage : `game/ambience.js` (`AMBIENCES` par niveau, `TILE_LIGHTS` pour les tuiles qui éclairent).
  Une entité éclaire avec un getter `light` (`{ r, color, flicker }`).
- Grands éléments sur 2 cases : une tuile déclare `tall: { ground, paint, paintHD? }` (dessin 16 × 32,
  sol en bas) ; la cime est dessinée par la carte après les personnages. Arbres du jeu : `game/art/trees.js`.
- Transitions : `engine/world/TerrainBlend.js`. Chaque terrain a une priorité (`props.blend`) ; le plus
  haut déborde sur le plus bas. Les morceaux de bord (côtés, coins extérieurs, coins intérieurs arrondis)
  sont découpés dans l'atlas une seule fois, puis gardés en cache. `props.blendAs` : un arbre déborde avec
  la texture de son sol. Les priorités du jeu sont dans `game/themes.js` (`BLEND`).
- Décor vivant : `props.grass` (touffes au vent) et `props.glint` (reflets) dans `game/themes.js` (`LIFE`) ;
  le vent est la fonction `windAt` de `engine/world/Tilemap.js` (partagée par l'herbe et les cimes).
  Activés avec `world.blend` et `world.life`.
- Ombres douces : `world.softShadows` ; une entité choisit la taille de son ombre avec `shadow`
  (et `shadowY` pour ce qui vole). Les tuiles avec `props.shadow` font de l'ombre sur le sol.

- `engine/graphics/display.js` : les profils et leur détection.
- `engine/graphics/pixelart.js` : fabrication des planches d'images. Chaque case est dessinée
  en 16×16, puis agrandie (Scale2x), détourée (épaisseur selon le profil), recolorée et
  ombrée. Si la case a une version **`paintHD`** et que le profil est HD, cette version
  dessinée à la main est utilisée à la place.
- Une ambiance peut aussi déclarer des retouches par profil :
  `profiles: { mobile: { tiles: {...}, ui: {...} }, pc: {...} }`.
- Les dessins HD de l'essai sont dans `demos/02-gameplay/hd.js`.
- La logique ne voit aucune différence : tuiles et sprites gardent leur taille de 16 pixels
  de jeu, seule l'image source est plus fine.

## À décider ensemble

1. Redessiner aussi en HD les **icônes du bandeau** et les **panneaux** (encore agrandis automatiquement) ?
2. Sur mobile, préférez-vous les **contours épais** partout, ou seulement autour du héros et des monstres ?
3. Sur PC, vue large à **20 tuiles**, ou garder **16** (plus « Zelda d'origine ») ?
