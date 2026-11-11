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
  - les **personnages** (héros et habitants) : visages avec yeux,
    reflets et joues, ceinture, ombrage de la tunique, chaussures, cheveux en mèches ;
  - herbe (brins, fleurs), chemin (cailloux), eau (vaguelettes, reflets),
    murs de briques, arbres et buissons (feuillage en grappes) ;
  - **objets** : coffre (planches, ferrures, serrure), pièce d'euro.
- **Tout le reste** est agrandi automatiquement : lissage des diagonales, puis finition HD
  (lumière douce venant d'en haut à gauche, grain fin, bord des silhouettes légèrement
  assombri pour donner du volume).
- **Vue plus large** : jusqu'à 20 tuiles de large si la fenêtre est assez large (au lieu de 16).
  - À l'extérieur, on voit plus loin autour du héros.
  - Dans les salles (grotte, magasin), la salle est centrée et les **salles voisines sont
    visibles mais assombries** : on sait toujours où l'on joue.
- **Bandeau plus riche** : quand une quête est en cours, son **objectif** s'affiche à côté
  des boutons, s'il y a la place.

## Comment ça marche (technique)

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

1. Redessiner en HD **le reste** (monstres, boss, magasin, grotte, pont, icônes) ?
2. Sur mobile, préférez-vous les **contours épais** partout, ou seulement autour du héros et des monstres ?
3. Sur PC, vue large à **20 tuiles**, ou garder **16** (plus « Zelda d'origine ») ?
