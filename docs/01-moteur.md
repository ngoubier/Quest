# Étape 1 — Le moteur (Quest Engine)

> Statut : **à valider**. Essai jouable : `demos/01-moteur/`.

## 1. La vision en 3 couches

```
┌──────────────────────────────────────────────────────────┐
│  3. LE JEU          cartes, histoire, personnages, art   │  ← spécifique à UN jeu
├──────────────────────────────────────────────────────────┤
│  2. LE GAMEPLAY     combat, vie, objets, inventaire,     │  ← réutilisable pour
│                     PNJ, dialogues, QUÊTES, ÉNIGMES      │    tous les jeux d'aventure
├──────────────────────────────────────────────────────────┤
│  1. LE MOTEUR       affichage, entrées, cartes, caméra,  │  ← réutilisable pour
│                     collisions, scènes, son, sauvegarde  │    n'importe quel jeu 2D
└──────────────────────────────────────────────────────────┘
```

Règle d'or : **une couche ne connaît que celles du dessous**. Le moteur ne sait pas ce
qu'est une épée, une quête ou de l'herbe ; il sait afficher des tuiles, déplacer des
entités et empiler des écrans.

## 2. Choix techniques

| Choix | Pourquoi |
|---|---|
| **JavaScript (modules ES), Canvas 2D** | Tourne partout (PC, Mac, téléphone, tablette) dans un simple navigateur. Aucune installation pour jouer. |
| **Zéro dépendance, zéro compilation** | Le code source est exactement ce qui tourne : facile à lire, à modifier, à déboguer. |
| **Résolution logique 256×192, pixels nets** | Esprit Zelda NES (une salle = 16×11 tuiles de 16 px + bandeau). Agrandi par facteur entier. Le texte est rendu en haute résolution (accents lisibles). |
| **Simulation à pas fixe (60 Hz)** | Même vitesse de jeu sur un écran 60 Hz ou 144 Hz. Indispensable pour des énigmes et combats fiables. |
| **Tests automatiques (`npm test`)** | Collisions, caméra, entrées, sauvegardes... vérifiés sans navigateur. |

Plus tard, si on veut une application « installable » (Windows/Mac/Steam), on pourra
l'empaqueter (Tauri / Electron) sans rien réécrire.

## 3. Les modules du moteur

| Module | Fichier | Rôle |
|---|---|---|
| **Game** | `core/Game.js` | Crée le canvas, la boucle de jeu, et donne accès à tous les services. |
| **EventBus** | `core/EventBus.js` | Messages entre systèmes (`room:enter`, `theme:change`...). Les quêtes s'y brancheront. |
| **Input** | `input/Input.js` | Entrées par **actions** (`up`, `action`, `start`...) : clavier (QWERTY *et* AZERTY), manette, tactile. |
| **TouchControls** | `input/TouchControls.js` | Croix + boutons A/B/Select/Start à l'écran sur mobile. |
| **Renderer** | `graphics/Renderer.js` | Rectangles, images, texte, caméra, zone d'affichage. |
| **SpriteSheet / Animator** | `graphics/` | Planches de sprites nommées, animations. |
| **Tileset / Tilemap** | `world/` | Tuiles (solide ? animée ? propriétés libres) et cartes multi-couches (dont couche « au-dessus » des personnages). |
| **Camera** | `world/Camera.js` | Mode **salles** (défilement d'écran à la Zelda) ou mode **suivi**. Tremblement d'écran. |
| **Entity / World** | `world/` | Tout ce qui vit (joueur, PNJ, monstres, coffres...). Tri d'affichage par profondeur, requêtes de zone. |
| **Collisions** | `physics/collision.js` | Déplacement pixel par pixel, glissement contre les murs, **aide aux coins**. |
| **Scènes** | `scene/` | Pile d'écrans (titre, monde, pause, dialogue) + fondus. |
| **Audio** | `audio/Audio.js` | Bruitages 8 bits synthétisés (aucun fichier). Musiques : étape ultérieure. |
| **SaveStore** | `storage/SaveStore.js` | Sauvegardes par emplacement, versionnées. |
| **Thèmes** | `theme/ThemeRegistry.js` | Ambiances interchangeables (voir §4). |
| **UI** | `ui/` | Boîte de dialogue (texte lettre par lettre, pages) et menus génériques. |
| **Debug** | `debug/Debug.js` | F1 / ² : FPS, scènes, boîtes de collision, infos du jeu. |

## 4. Le concept clé : rôles de tuiles + thèmes

Pour qu'un même moteur fasse du médiéval, de l'espace ou de la ville :

1. **Le jeu déclare des rôles** : `floor`, `wall`, `water`, `door`, `obstacle`...
   Les cartes sont écrites avec ces rôles (logique : « ici c'est de l'eau, infranchissable »).
2. **Chaque thème donne une apparence à chaque rôle** :

| Rôle | Médiéval | Station spatiale | Ville |
|---|---|---|---|
| `floor` | herbe | plaques de métal | trottoir |
| `wall` | pierre | coque | immeuble |
| `water` | rivière | vide spatial | canal |
| `obstacle` | buisson | caisse | poubelle |
| `door` | porte en bois | sas | porte vitrée |

3. Un thème fournit aussi : sprites, couleurs des menus/dialogues, sons, fond.

→ Dans l'essai, **Tab** change d'ambiance en direct, sur la même carte.

## 5. Formats de données

- **Cartes** : pour l'instant en texte (ASCII), une lettre = une tuile. Très rapide pour
  prototyper. Plus tard : import depuis l'éditeur gratuit **Tiled** (format JSON).
- **Thèmes** : objets JavaScript. Les visuels de l'essai sont dessinés par programme
  (placeholders) ; on pourra les remplacer par de vraies images (PNG) sans changer le moteur.

## 6. Ce qui N'EST PAS dans le moteur (→ étape 2 : gameplay)

Combat, points de vie, objets, inventaire, monstres et leur IA, dialogues à choix,
**quêtes**, **énigmes**. Le moteur fournit seulement les briques (événements, entités,
scènes, sauvegarde) sur lesquelles ces systèmes seront construits.

Aperçu de ce qu'on concevra ensemble à l'étape 2 :
- **Quêtes** : une quête = des étapes ; chaque étape attend une condition
  (parler à X, posséder Y, entrer dans la salle Z, vaincre N ennemis) écoutée via l'EventBus,
  et déclenche des récompenses. Principale et secondaires utilisent le même système.
- **Énigmes** : briques combinables — interrupteurs, plaques de pression, blocs à pousser,
  portes verrouillées / à clé, torches à allumer, séquences, ennemis à vaincre pour ouvrir.
- **État du monde** : des « drapeaux » sauvegardés (`porte_donjon1_ouverte = vrai`).

## 7. Essai n°1 — check-list de validation

Lancer : `npm start` puis ouvrir `http://localhost:8080/demos/01-moteur/`.

- [ ] Déplacement fluide (flèches ou ZQSD ; manette ; tactile sur mobile)
- [ ] Collisions : murs, eau, buissons ; glissement le long des murs ; contournement des coins
- [ ] Défilement d'écran entre les 4 salles de l'extérieur
- [ ] Panneaux et PNJ : Espace pour lire / parler (texte lettre par lettre)
- [ ] Porte : entrée dans la maison avec fondu au noir, et retour
- [ ] **Tab** : changement d'ambiance (Médiéval → Station spatiale → Ville)
- [ ] **Entrée** : menu pause — sauvegarder, charger, son, débogage
- [ ] **F1 / ²** : calque de débogage (boîtes de collision, FPS)
- [ ] Le rendu reste net quelle que soit la taille de la fenêtre

## 8. Questions à trancher ensemble

1. **Plateforme** : navigateur (PC + mobile) vous convient-il, ou visez-vous une application installable ?
2. **Résolution / taille d'écran** : on garde le format Zelda NES (16×11 tuiles par salle) ?
3. **Caméra** : salles fixes à la Zelda pour l'extérieur *et* les donjons, ou défilement libre à l'extérieur ?
4. **Déplacement** : 8 directions (actuel) ou 4 directions strictes comme le Zelda original ?
5. **Graphismes** : on continue avec des visuels générés pour le prototype, ou vous avez / voulez de vraies planches de sprites ?
6. **Éditeur de cartes** : cartes ASCII suffisantes pour commencer, ou on passe tôt à Tiled ?
