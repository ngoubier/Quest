# Quest

Un jeu d'aventure 2D dans l'esprit du *Zelda* original, construit en trois couches :

1. **Quest Engine** (`engine/`) — moteur 2D réutilisable (affichage, entrées, cartes, caméra, collisions, scènes, son, sauvegarde, thèmes, profils d'affichage mobile / PC).
2. **Quest Gameplay** (`gameplay/`) — systèmes d'aventure réutilisables : combat, objets, quêtes, énigmes scolaires, boutique, sauvegarde.
   - **Contenu éducatif** (`content/quiz/`) — questions du CP au CM2, réutilisables par tous les jeux.
3. **Le jeu** (`game/`) — *La Quête d'Alia* : délivrer la licorne du royaume d'Iris en réunissant 6 pierres magiques (niveaux 1 et 2 jouables).

## Lancer les essais

Aucune installation nécessaire hormis [Node.js](https://nodejs.org) :

```bash
npm start      # puis ouvrir http://localhost:8080/ (le jeu et les essais)
npm test       # tests automatiques du moteur
```

## Documentation

- [Étape 1 — Le moteur](docs/01-moteur.md) : architecture, choix techniques, check-list de validation.
- [Étape 2 — Le gameplay](docs/02-gameplay.md) : combat, objets, langage de conditions/actions, quêtes, énigmes.
- [Étape 3 — Quêtes, énigmes scolaires et économie](docs/03-quetes-et-enigmes.md) : questions par âge, boutique, indices, Espace parents.
- [Programme scolaire](docs/04-programme-scolaire.md) : notions par âge et par matière.
- [Améliorations proposées](docs/05-ameliorations-proposees.md) : à valider avant de concevoir le jeu.
- [Étape 4 — Le projet final : La Quête d’Alia](docs/07-projet-final.md) : histoire, 8 niveaux, carte du monde ([visuels](docs/projet-final/visuels.html)).
- [Graphismes mobile et PC](docs/06-affichage-mobile-pc.md) : dessins lisibles sur téléphone, haute définition et vue large sur ordinateur.

## Commandes

| Action | Clavier | Manette |
|---|---|---|
| Se déplacer | Flèches / ZQSD (WASD) | Croix / stick |
| Parler, valider, frapper | Espace / J | A |
| Utiliser l'objet équipé (bâton de feu...) | E ou X | X |
| Ouvrir le sac | I (ou bouton Sac du bandeau) | Y |
| Liste des quêtes | L (ou bouton Quêtes du bandeau) | — |
| Annuler | K / Maj | B |
| Menu pause | Entrée / Échap | Start |
| Débogage | F1 / ² | — |

Sur téléphone, une manette tactile s'affiche automatiquement.

Les graphismes s'adaptent à l'appareil (mobile ou PC). Pour comparer, ajoutez `?mobile`, `?pc` ou `?classic` à l'adresse d'un essai.
