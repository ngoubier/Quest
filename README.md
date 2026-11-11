# Quest

Un jeu d'aventure 2D dans l'esprit du *Zelda* original, construit en trois couches :

1. **Quest Engine** (`engine/`) — moteur 2D réutilisable (affichage, entrées, cartes, caméra, collisions, scènes, son, sauvegarde, thèmes).
2. **Gameplay** — systèmes d'aventure réutilisables : combat, objets, quêtes, énigmes *(étape 2, à venir)*.
3. **Le jeu** — contenu et histoire *(étape 3, à venir)*.

## Lancer les essais

Aucune installation nécessaire hormis [Node.js](https://nodejs.org) :

```bash
npm start      # puis ouvrir http://localhost:8080/demos/01-moteur/
npm test       # tests automatiques du moteur
```

## Documentation

- [Étape 1 — Le moteur](docs/01-moteur.md) : architecture, choix techniques, check-list de validation.

## Commandes de l'essai n°1

| Action | Clavier | Manette |
|---|---|---|
| Se déplacer | Flèches / ZQSD (WASD) | Croix / stick |
| Parler, valider | Espace / J | A |
| Annuler | K / Maj | B |
| Menu pause | Entrée / Échap | Start |
| Changer d'ambiance | Tab | Select |
| Débogage | F1 / ² | — |

Sur téléphone, une manette tactile s'affiche automatiquement.
